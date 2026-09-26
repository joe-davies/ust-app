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
import { json, requireAdmin, type Deps } from '../lib/admin'

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

// If setup fails after the account was created, remove it so the admin can simply retry
// (otherwise a half-configured user could skip the forced password change).
async function rollback(
  admin: { auth: { admin: { deleteUser: (id: string) => PromiseLike<{ error: { message: string } | null }> } } },
  userId: string,
): Promise<string> {
  const { error } = await admin.auth.admin.deleteUser(userId)
  return error
    ? `The account was created but could not be removed automatically: delete it in Supabase (Authentication > Users) before retrying. (${error.message})`
    : 'Nothing was created, so you can try again. (The email that was already sent will no longer work.)'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function handle(req: Request, deps: Deps): Promise<Response> {
  // 1. Who is calling, and are they an admin? (checked before anything else is read)
  const auth = await requireAdmin(req, deps, 'Only administrators can add users')
  if (auth instanceof Response) return auth
  const { admin } = auth

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
    const undone = await rollback(admin, userId)
    return json(502, {
      error: `Could not set up the account (${updateErr.message}). ${undone}`,
    })
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
    const undone = await rollback(admin, userId)
    return json(502, {
      error: `Could not finish setting up the account (${profileErr.message}). Has migration 0006_password_flow.sql been run? ${undone}`,
    })
  }

  return json(200, { ok: true, email, expires_at: expires })
}

export default async (req: Request) => handle(req, { createClient, env: process.env as Record<string, string | undefined> })
