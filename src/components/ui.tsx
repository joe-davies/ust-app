import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigured } from '../lib/supabase'
import type { AsyncState } from '../lib/data'

export function PageShell({ title, intro, children, wide = false }: { title: string; intro?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-4 py-12 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      {intro && <p className="mt-2 text-lg text-slate-700">{intro}</p>}
      <div className="mt-8">{children}</div>
    </div>
  )
}

// Renders loading / error / not-configured states, then children when data is ready.
export function Async<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (!supabaseConfigured) {
    return <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">Supabase is not configured (see README).</p>
  }
  if (state.loading) return <p className="text-slate-600">Loading…</p>
  if (state.error) return <p role="alert" className="text-red-700">Could not load content: {state.error}</p>
  if (!state.data) return null
  return <>{children(state.data)}</>
}

export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-lg leading-relaxed">
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

export function Empty({ children = 'Nothing here yet.' }: { children?: ReactNode }) {
  return <p className="rounded-lg bg-white p-6 text-slate-600 ring-1 ring-black/5">{children}</p>
}

export function Card({ to, children }: { to?: string; children: ReactNode }) {
  const cls = 'block rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5'
  return to ? (
    <Link to={to} className={`${cls} hover:shadow-md`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-union-blue/10 px-2 py-0.5 text-xs font-medium text-union-blue">{children}</span>
}
