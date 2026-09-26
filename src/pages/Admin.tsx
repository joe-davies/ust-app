import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../auth/AuthContext'

// Phase 1 admin: view users and promote/demote admins.
// Phase 2 adds content editors (articles, courses, events, ...).
export default function Admin() {
  const [users, setUsers] = useState<Profile[]>([])
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setUsers(data as Profile[])
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="mt-1 text-slate-600">Users. Content editing arrives in Phase 2.</p>
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-union-blue/5">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Type</th><th className="p-3">Role</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="p-3">{u.first_name} {u.last_name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.student_type}</td>
                <td className="p-3">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        To add another admin, run in the Supabase SQL editor:{' '}
        <code className="rounded bg-white px-1">update public.profiles set role = 'admin' where email = 'person@example.com';</code>
      </p>
    </div>
  )
}
