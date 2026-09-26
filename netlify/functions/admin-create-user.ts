// Netlify Function: an admin creates a user, who is emailed a temporary password.
//
// Runs on the server with the Supabase service-role key (env var SUPABASE_SERVICE_ROLE_KEY),
// which must NEVER be exposed to the browser. It:
//   1. verifies the caller's access token and that they are an admin,
//   2. invites the user (Supabase sends the "Invite user" email through YOUR configured SMTP;
//      the template has a "Verify my email" link ({{ .ConfirmationURL }}) plus the temporary
//      password {{ .Data.temp_password }}),
//   3. sets the temporary password (but does NOT confirm the email: the user is verified only
//      when they click the link) and immediately wipes the temporary password from the user's
//      metadata so it is not stored in readable form,
//   4. flags the profile so the app forces a password change on first login.
import { createClient } from '@supabase/supabase-js'
import { randomInt } from 'node:crypto'

const ALPHABET_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const ALPHABET_LOWER = 'abcdefghijkmnopqrstuvwxyz'
const ALPHABET_DIGIT = '23456789'
const TEMP_PASSWORD_DAYS = 7

export function generateTempPassword(length = 14): string {
  const all = ALPHABET_UPPER + ALPHABET_LOWER + ALPHABET_DIGIT
  const pick = (set: string) => set[randomInt(set.length)]
  const chars = [pick(ALPHABET_UPPER), pick(ALPHABET_LOWER), pick(ALPHABET_DIGIT)]
  while (chars.length < length) chars.push(pick(all))
  // Fisher-Yates shuffle with a cryptographic RNG
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export interface Deps {
  createClient: typeof createClient
  env: Record<string, string | undefined>
  now?: () => Date
  genPassword?: () => string
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const url = deps.env.SUPABASE_URL ?? deps.env.VITE_SUPABASE_URL
  const serviceKey = deps.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return json(500, { error: 'Server is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify.' })
  }

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return json(401, { error: 'Not signed in' })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'Invalid request' })
  }
  const email = String(body.email ?? '').trim().toLowerCase()
  const firstName = String(body.first_name ?? '').trim().slice(0, 100)
  const lastName = String(body.last_name ?? '').trim().slice(0, 100)
  const studentType = String(body.student_type ?? '')
  if (!EMAIL_RE.test(email)) return json(400, { error: 'Enter a valid email address' })
  if (!firstName || !lastName) return json(400, { error: 'First and last name are required' })
  if (!['prospective', 'current'].includes(studentType)) return json(400, { error: 'Invalid student type' })

  const admin = deps.createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  // 1. Who is calling, and are they an admin?
  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) return json(401, { error: 'Your session has expired. Please log in again.' })
  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', caller.user.id).single()
  if (callerProfile?.role !== 'admin') return json(403, { error: 'Only administrators can add users' })

  // 2. Invite: Supabase emails the "Invite user" template, which contains the temporary password.
  const tempPassword = (deps.genPassword ?? generateTempPassword)()
  const origin = deps.env.URL ?? new URL(req.url).origin
  const userData = { first_name: firstName, last_name: lastName, student_type: studentType }
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { ...userData, temp_password: tempPassword },
    redirectTo: `${origin}/set-password`,
  })
  if (inviteErr || !invited?.user) {
    const msg = inviteErr?.message ?? 'Could not create the user'
    if (/already.*(registered|exists)/i.test(msg)) {
      return json(409, { error: 'A user with that email already exists' })
    }
    return json(502, { error: `Could not send the invitation: ${msg}` })
  }
  const userId = invited.user.id

  // 3. Set the temporary password and wipe it from metadata. The email is left UNCONFIRMED: the
  //    person verifies it by clicking the link in the invitation (which also signs them in).
  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
    user_metadata: { ...userData, temp_password: null },
  })
  if (updateErr) {
    return json(502, { error: `The user was created but their password could not be set: ${updateErr.message}` })
  }

  // 4. Force a password change on first login.
  const now = (deps.now ?? (() => new Date()))()
  const expires = new Date(now.getTime() + TEMP_PASSWORD_DAYS * 86400000).toISOString()
  const { error: profileErr } = await admin
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      student_type: studentType,
      must_change_password: true,
      temp_password_expires_at: expires,
    })
    .eq('id', userId)
  if (profileErr) {
    return json(502, { error: `The user was created but could not be flagged: ${profileErr.message}` })
  }

  return json(200, { ok: true, email, expires_at: expires })
}

export default async (req: Request) => handle(req, { createClient, env: process.env as Record<string, string | undefined> })
