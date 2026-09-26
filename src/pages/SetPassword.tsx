import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

export const MIN_PASSWORD = 8

export default function SetPassword() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const forced = Boolean(profile?.must_change_password)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < MIN_PASSWORD) return setError(`Your password must be at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    const { error: upErr } = await supabase.auth.updateUser({ password })
    if (upErr) {
      setBusy(false)
      return setError(upErr.message)
    }
    const { error: rpcErr } = await supabase.rpc('complete_password_change')
    setBusy(false)
    if (rpcErr) return setError(`Your password was changed, but we could not finish setup: ${rpcErr.message}`)
    await refreshProfile()
    navigate(forced ? '/my-study' : '/account', { replace: true })
  }

  const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">{forced ? 'Choose your password' : 'Set a new password'}</h1>
      {forced && <p className="mb-6 text-slate-700">Welcome{profile?.first_name ? `, ${profile.first_name}` : ''}. Please replace your temporary password with one of your own to continue.</p>}
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
        <label className="block text-sm font-medium">New password
          <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} autoComplete="new-password" required minLength={MIN_PASSWORD} />
        </label>
        <label className="block text-sm font-medium">Confirm new password
          <input type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} autoComplete="new-password" required />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
        </label>
        <p className="text-xs text-slate-500">At least {MIN_PASSWORD} characters.</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded bg-union-blue px-4 py-2.5 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-60">
          {busy ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </div>
  )
}
