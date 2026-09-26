import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { BRAND } from '../brand'

const inputCls =
  'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 focus:border-union-blue focus:outline-none focus:ring-2 focus:ring-union-blue/30'
const btnCls =
  'w-full rounded bg-union-blue px-4 py-2.5 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-60'
const linkCls = 'font-medium text-union-blue-light hover:underline'

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

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Shell title={title}>
      <div className="space-y-3">{children}</div>
    </Shell>
  )
}

function PasswordField({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} autoComplete={autoComplete} required />
      </label>
      <button type="button" onClick={() => setShow((s) => !s)} className="mt-1 text-xs text-slate-600 hover:underline">
        {show ? 'Hide password' : 'Show password'}
      </button>
    </div>
  )
}

export function Login() {
  const { session } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/my-study'
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  if (session) return <Navigate to={from} replace />

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (!error) return
    if (/invalid login/i.test(error.message)) setError('Incorrect email or password. If you have forgotten it, use “Forgot password?” below.')
    else if (/not confirmed/i.test(error.message)) setError('Please confirm your email address first. Check your inbox for the confirmation link.')
    else setError(error.message)
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/set-password` })
    setBusy(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (mode === 'forgot') {
    if (sent) {
      return (
        <Notice title="Check your email">
          <p>If an account exists for <strong>{email}</strong>, we have sent a link to choose a new password.</p>
          <button className={linkCls} onClick={() => { setMode('login'); setSent(false) }}>Back to log in</button>
        </Notice>
      )
    }
    return (
      <Shell title="Forgot password?">
        <form onSubmit={onForgot} className="space-y-4">
          <p className="text-sm text-slate-700">Enter your email and we will send you a link to choose a new password.</p>
          <label className="block text-sm font-medium">Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={busy || !supabaseConfigured} className={btnCls}>{busy ? 'Sending…' : 'Email me a link'}</button>
          <button type="button" className={`${linkCls} text-sm`} onClick={() => { setMode('login'); setError('') }}>Back to log in</button>
        </form>
      </Shell>
    )
  }

  return (
    <Shell title="Log in">
      <form onSubmit={onLogin} className="space-y-4">
        <label className="block text-sm font-medium">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </label>
        <PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy || !supabaseConfigured} className={btnCls}>{busy ? 'Logging in…' : 'Log in'}</button>
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <button type="button" className={linkCls} onClick={() => { setMode('forgot'); setError('') }}>Forgot password? Email me a link</button>
          <span>No account? Accounts are created by our team. <a href={BRAND.enquireUrl} className={linkCls}>Enquire</a></span>
        </div>
      </form>
    </Shell>
  )
}
