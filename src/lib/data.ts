import { useEffect, useState } from 'react'
import { supabaseConfigured } from './supabase'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string
}

// Runs an async query and tracks loading/error. `key` re-runs it when it changes.
export function useQuery<T>(run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>, key: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: supabaseConfigured, error: '' })

  useEffect(() => {
    if (!supabaseConfigured) return
    let cancelled = false
    void Promise.resolve(run()).then(({ data, error }) => {
      if (cancelled) return
      setState({ data, loading: false, error: error?.message ?? '' })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
