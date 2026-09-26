// Shared by the admin Netlify Functions. Kept OUTSIDE netlify/functions so it is not deployed as a function itself.
// Every admin function starts with requireAdmin(): it verifies the caller's access token with Supabase and
// checks their profile role, using the service-role key (env var only, never sent to the browser).
import type { SupabaseClient, createClient } from '@supabase/supabase-js'

export interface Deps {
  createClient: typeof createClient
  env: Record<string, string | undefined>
  now?: () => Date
  genPassword?: () => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminClient = SupabaseClient<any, any, any>

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

export async function requireAdmin(
  req: Request,
  deps: Deps,
  deniedMessage: string,
): Promise<Response | { admin: AdminClient; callerId: string }> {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })

  const url = deps.env.SUPABASE_URL ?? deps.env.VITE_SUPABASE_URL
  const serviceKey = deps.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return json(500, { error: 'Server is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify.' })
  }

  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return json(401, { error: 'Not signed in' })

  const admin = deps.createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: caller, error: callerErr } = await admin.auth.getUser(token)
  if (callerErr || !caller?.user) return json(401, { error: 'Your session has expired. Please log in again.' })

  const { data: profile } = await admin.from('profiles').select('role').eq('id', caller.user.id).single()
  if (profile?.role !== 'admin') return json(403, { error: deniedMessage })

  return { admin, callerId: caller.user.id }
}
