import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

type Blocked = 'unverified' | 'expired' | null

// Accounts are created by admins only. Invited users must (1) verify their email via the link in
// the invitation and (2) replace their temporary password with their own before using the app.
// While the "must change password" flag is set, every page except /set-password redirects there.
// Note: these rules are enforced in the app (Supabase itself also refuses password login for
// unconfirmed emails when "Confirm email" is on). The temporary password only ever works for that
// one account, and the expiry is a courtesy guard rather than a hard security boundary.
export function MustChangeGate({ children }: { children: ReactNode }) {
  const { session, profile, loading, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [blocked, setBlocked] = useState<Blocked>(null)

  const unverified = Boolean(session && !session.user.email_confirmed_at)
  const forced = Boolean(session && profile?.must_change_password)
  const expired = forced && profile?.temp_password_expires_at ? new Date(profile.temp_password_expires_at) < new Date() : false

  // Remember why we signed them out, so the message stays on screen after the session is gone.
  useEffect(() => {
    if (unverified || expired) {
      setBlocked(unverified ? 'unverified' : 'expired')
      void signOut()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unverified, expired])

  if (blocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold">{blocked === 'unverified' ? 'Please verify your email' : 'Temporary password expired'}</h1>
        <p className="mt-3 text-slate-700">
          {blocked === 'unverified'
            ? 'Open the invitation email we sent you and click “Verify my email”, then log in. You have been signed out until your email address is verified.'
            : 'Your temporary password is no longer valid. Please ask an administrator to send you a new invitation, or use “Forgot password?” on the login page.'}
        </p>
        <button
          onClick={() => {
            setBlocked(null)
            navigate('/login')
          }}
          className="mt-6 rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark"
        >
          Go to log in
        </button>
      </div>
    )
  }

  if (loading) return <>{children}</>
  if (forced && pathname !== '/set-password') return <Navigate to="/set-password" replace />
  return <>{children}</>
}
