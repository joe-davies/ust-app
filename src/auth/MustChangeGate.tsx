import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Users created by an admin get a temporary password and must choose their own before
// using the app. While the flag is set, every page except /set-password redirects there.
// Note: this is enforced in the app. The temporary password only ever works for that one
// account, and the expiry below is a courtesy guard rather than a hard security boundary.
export function MustChangeGate({ children }: { children: ReactNode }) {
  const { session, profile, loading, signOut } = useAuth()
  const { pathname } = useLocation()

  const forced = Boolean(session && profile?.must_change_password)
  const expired = forced && profile?.temp_password_expires_at ? new Date(profile.temp_password_expires_at) < new Date() : false

  useEffect(() => {
    if (expired) void signOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired])

  if (loading) return <>{children}</>
  if (expired) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold">Temporary password expired</h1>
        <p className="mt-3 text-slate-700">
          Your temporary password is no longer valid. Please ask an administrator to send you a new invitation, or use
          “Forgot password?” on the login page.
        </p>
      </div>
    )
  }
  if (forced && pathname !== '/set-password') return <Navigate to="/set-password" replace />
  return <>{children}</>
}
