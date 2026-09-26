import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth, type StudentType } from '../auth/AuthContext'

export default function Account() {
  const { profile, session, refreshProfile } = useAuth()
  const [first, setFirst] = useState(profile?.first_name ?? '')
  const [last, setLast] = useState(profile?.last_name ?? '')
  const [type, setType] = useState<StudentType>(profile?.student_type ?? 'prospective')
  const [msg, setMsg] = useState('')

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!session) return
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: first.trim(), last_name: last.trim(), student_type: type })
      .eq('id', session.user.id)
    setMsg(error ? error.message : 'Saved.')
    if (!error) await refreshProfile()
  }

  const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold">My account</h1>
      <p className="mt-1 text-slate-600">{profile?.email ?? session?.user.email}{profile?.role === 'admin' && ' · Administrator'}</p>
      <form onSubmit={save} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">First name
            <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm font-medium">Last name
            <input value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block text-sm font-medium">Student type
          <select value={type} onChange={(e) => setType(e.target.value as StudentType)} className={inputCls}>
            <option value="prospective">Prospective student</option>
            <option value="current">Current student</option>
          </select>
        </label>
        <button className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">Save</button>
        {msg && <p role="status" className="text-sm text-slate-700">{msg}</p>}
      </form>
    </div>
  )
}
