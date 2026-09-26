import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { session, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="mx-auto max-w-5xl px-4 py-16 text-slate-600">Loading…</p>
  }
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (adminOnly && !isAdmin) return <Navigate to="/account" replace />
  return <>{children}</>
}
