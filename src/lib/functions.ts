import { supabase } from './supabase'

// Calls one of our Netlify Functions (server-side admin actions) with the signed-in user's access token.
// The function itself re-checks that the caller is an admin, so this is convenience, not security.
export async function callFunction<T extends Record<string, unknown>>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token ?? ''}` },
    body: JSON.stringify(body),
  })
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
  if (!isJson) {
    throw new Error('The admin service is not available here. It only runs on the deployed Netlify site (or with `netlify dev`).')
  }
  const json = (await res.json()) as T & { ok?: boolean; error?: string }
  if (!res.ok || !json.ok) throw new Error(json.error ?? 'Something went wrong')
  return json
}
