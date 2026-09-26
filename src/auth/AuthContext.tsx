import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'

export type StudentType = 'prospective' | 'current'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  student_type: StudentType
  role: 'user' | 'admin'
  must_change_password?: boolean
  temp_password_expires_at?: string | null
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  async function loadProfile(userId: string | undefined) {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile((data as Profile | null) ?? null)
  }

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      void loadProfile(data.session?.user.id).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      // Defer Supabase calls out of the auth callback to avoid deadlocks.
      setTimeout(() => void loadProfile(next?.user.id), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut: async () => {
      await supabase.auth.signOut()
    },
    refreshProfile: () => loadProfile(session?.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
