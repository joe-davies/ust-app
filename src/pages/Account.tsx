import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, type Profile, type StudentType } from '../auth/AuthContext'

// The form is only mounted once the profile has loaded, so its fields start with the real values.
// (Initialising useState from a profile that has not arrived yet left the boxes blank, and pressing
// Save would then have overwritten the real name with empty text.)
function AccountForm({ profile }: { profile: Profile }) {
  const { refreshProfile } = useAuth()
  const [first, setFirst] = useState(profile.first_name)
  const [last, setLast] = useState(profile.last_name)
  const [type, setType] = useState<StudentType>(profile.student_type)
  const [msg, setMsg] = useState('')

  async function save(e: FormEvent) {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({ first_name: first.trim(), last_name: last.trim(), student_type: type })
      .eq('id', profile.id)
    setMsg(error ? error.message : 'Saved.')
    if (!error) await refreshProfile()
  }

  const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'
  return (
    <form onSubmit={save} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">First name
          <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputCls} autoComplete="given-name" />
        </label>
        <label className="block text-sm font-medium">Last name
          <input value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} autoComplete="family-name" />
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
  )
}

export default function Account() {
  const { profile, session, loading } = useAuth()

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold">My account</h1>
      <p className="mt-1 text-slate-600">
        {profile?.email ?? session?.user.email}
        {profile?.role === 'admin' && ' · Administrator'}
      </p>
      {profile ? (
        // key = user id, so switching accounts always remounts with that person's details
        <AccountForm key={profile.id} profile={profile} />
      ) : (
        <p className="mt-6 text-slate-600">{loading || session ? 'Loading your details…' : 'Please log in.'}</p>
      )}
      <p className="mt-6 text-sm text-slate-700">
        Want to change your password? <Link to="/set-password" className="font-medium text-union-blue-light hover:underline">Set a new password</Link>
      </p>
    </div>
  )
}
