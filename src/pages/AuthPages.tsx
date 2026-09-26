import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useAuth, type StudentType } from '../auth/AuthContext'

const inputCls =
  'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-union-blue focus:outline-none focus:ring-2 focus:ring-union-blue/30'
const btnCls =
  'w-full rounded bg-union-blue px-4 py-2.5 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-60'

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        {!supabaseConfigured && (
          <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
            Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see README).
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

function CheckEmail({ email }: { email: string }) {
  return (
    <Shell title="Check your email">
      <p>
        We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to continue.
        You can close this tab.
      </p>
    </Shell>
  )
}

export function SignUp() {
  const { session } = useAuth()
  const [firstName, setFirst] = useState('')
  const [lastName, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [studentType, setType] = useState<StudentType>('prospective')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  if (session) return <Navigate to="/account" replace />
  if (sent) return <CheckEmail email={email} />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { first_name: firstName.trim(), last_name: lastName.trim(), student_type: studentType },
      },
    })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <Shell title="Create your account">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">First name
            <input required value={firstName} onChange={(e) => setFirst(e.target.value)} className={inputCls} autoComplete="given-name" />
          </label>
          <label className="block text-sm font-medium">Last name
            <input required value={lastName} onChange={(e) => setLast(e.target.value)} className={inputCls} autoComplete="family-name" />
          </label>
        </div>
        <label className="block text-sm font-medium">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </label>
        <fieldset>
          <legend className="text-sm font-medium">I am a…</legend>
          <div className="mt-1 flex gap-4">
            {(['prospective', 'current'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <input type="radio" name="student_type" checked={studentType === t} onChange={() => setType(t)} />
                {t === 'prospective' ? 'Prospective student' : 'Current student'}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy || !supabaseConfigured} className={btnCls}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
        <p className="text-sm text-slate-600">
          Already registered? <Link to="/login" className="font-medium text-union-blue-light hover:underline">Log in</Link>
        </p>
      </form>
    </Shell>
  )
}

export function Login() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  if (session) return <Navigate to="/account" replace />
  if (sent) return <CheckEmail email={email} />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/account` },
    })
    setBusy(false)
    if (error) setError(error.message.includes('not allowed') ? 'No account found for that email. Please sign up first.' : error.message)
    else setSent(true)
  }

  return (
    <Shell title="Log in">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy || !supabaseConfigured} className={btnCls}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
        <p className="text-sm text-slate-600">
          New here? <Link to="/signup" className="font-medium text-union-blue-light hover:underline">Create an account</Link>
        </p>
      </form>
    </Shell>
  )
}
