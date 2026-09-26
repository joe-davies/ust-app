import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// CRUD helper for one of the student's private tables. Row-level security in the
// database guarantees a student only ever gets their own rows back.
export function useOwnRows<T extends { id: string }>(table: string, orderBy: string, ascending = true) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
    if (error) setError(error.message)
    else {
      setError('')
      setRows((data ?? []) as T[])
    }
    setLoading(false)
  }, [table, orderBy, ascending])

  useEffect(() => {
    void reload()
  }, [reload])

  async function run(q: PromiseLike<{ error: { message: string } | null }>): Promise<boolean> {
    const { error } = await q
    if (error) {
      setError(error.message)
      return false
    }
    await reload()
    return true
  }

  return {
    rows,
    loading,
    error,
    reload,
    add: (values: Record<string, unknown>) => run(supabase.from(table).insert(values)),
    update: (id: string, values: Record<string, unknown>) => run(supabase.from(table).update(values).eq('id', id)),
    remove: (id: string) => run(supabase.from(table).delete().eq('id', id)),
  }
}

export function dueLabel(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
