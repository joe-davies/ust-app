// Netlify Function: an admin permanently deletes a user.
//
// Deleting the auth user cascades (database foreign keys) to their profile and ALL their private study data
// (courses, deadlines, notes, reading lists, saved items). It cannot be undone.
// Safeguards: caller must be an admin; an admin can never delete their own account; the target must exist.
import { createClient } from '@supabase/supabase-js'
import { json, requireAdmin, type Deps } from '../lib/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const auth = await requireAdmin(req, deps, 'Only administrators can delete users')
  if (auth instanceof Response) return auth
  const { admin, callerId } = auth

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'Invalid request' })
  }
  const userId = String(body.user_id ?? '').trim()
  if (!UUID_RE.test(userId)) return json(400, { error: 'Invalid user' })
  if (userId === callerId) return json(400, { error: 'You cannot delete your own account.' })

  const { data: target } = await admin.from('profiles').select('email, first_name, last_name').eq('id', userId).maybeSingle()
  if (!target) return json(404, { error: 'That user no longer exists.' })

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return json(502, { error: `Could not delete the user: ${error.message}` })

  return json(200, { ok: true, email: target.email })
}

export default async (req: Request) => handle(req, { createClient, env: process.env as Record<string, string | undefined> })
