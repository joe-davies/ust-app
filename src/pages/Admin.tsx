import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, type Profile, type StudentType } from '../auth/AuthContext'

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'

// Users list + edit form (rendered inside AdminLayout). Edits go through the
// admin_update_profile database function (migration 0004), which only admins can run.
export default function Admin() {
  const { session, refreshProfile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState<Profile | null>(null)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [type, setType] = useState<StudentType>('prospective')
  const [role, setRole] = useState<Profile['role']>('user')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setUsers(data as Profile[])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(u: Profile) {
    setError('')
    setNotice('')
    setEditing(u)
    setFirst(u.first_name)
    setLast(u.last_name)
    setType(u.student_type)
    setRole(u.role)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    const isSelf = editing.id === session?.user.id
    if (isSelf && editing.role === 'admin' && role === 'user') {
      if (!window.confirm('You are removing your own admin access. You will lose access to this page. Continue?')) return
    }
    setSaving(true)
    setError('')
    const { error } = await supabase.rpc('admin_update_profile', {
      target: editing.id,
      new_first: first,
      new_last: last,
      new_type: type,
      new_role: role,
    })
    setSaving(false)
    if (error) {
      setError(
        error.message.includes('admin_update_profile') && error.message.toLowerCase().includes('could not find')
          ? 'The database function is missing. Run supabase/migrations/0004_admin_users.sql in the Supabase SQL editor.'
          : error.message,
      )
      return
    }
    setNotice(`Saved ${first} ${last}`.trim() + '.')
    setEditing(null)
    await load()
    if (isSelf) await refreshProfile()
  }

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-bold">Edit user</h2>
        <p className="text-sm text-slate-600">
          {editing.email} <span className="text-slate-400">(email is changed in Supabase, under Authentication)</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">First name
            <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm font-medium">Last name
            <input value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium">Student type
            <select value={type} onChange={(e) => setType(e.target.value as StudentType)} className={inputCls}>
              <option value="prospective">Prospective student</option>
              <option value="current">Current student</option>
            </select>
          </label>
          <label className="block text-sm font-medium">Role
            <select value={role} onChange={(e) => setRole(e.target.value as Profile['role'])} className={inputCls}>
              <option value="user">User</option>
              <option value="admin">Admin (can edit all content and users)</option>
            </select>
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-3">
          <button disabled={saving} className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Users</h2>
      <p className="mt-1 text-slate-600">Everyone who has signed up. Click Edit to change a name, student type or role.</p>
      {notice && <p role="status" className="mt-3 text-sm text-green-800">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-union-blue/5">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Type</th>
              <th className="p-3">Role</th>
              <th className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5">
                <td className="p-3">{u.first_name} {u.last_name}{u.id === session?.user.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.student_type}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 text-right">
                  <button onClick={() => startEdit(u)} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        To delete a user or change their email, use Supabase, under Authentication, then Users.
      </p>
    </div>
  )
}
