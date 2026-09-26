import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import type { SavedItem, SavedType } from '../lib/types'

interface SavedState {
  items: SavedItem[]
  isSaved: (type: SavedType, id: string) => boolean
  toggle: (type: SavedType, id: string) => Promise<void>
  reload: () => Promise<void>
}

const SavedContext = createContext<SavedState | undefined>(undefined)

export function SavedProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const uid = session?.user.id
  const [items, setItems] = useState<SavedItem[]>([])

  const reload = useCallback(async () => {
    if (!uid) {
      setItems([])
      return
    }
    const { data } = await supabase.from('saved_items').select('*').order('created_at', { ascending: false })
    setItems((data ?? []) as SavedItem[])
  }, [uid])

  useEffect(() => {
    void reload()
  }, [reload])

  const find = (type: SavedType, id: string) => items.find((i) => i.item_type === type && i.item_id === id)

  const value: SavedState = {
    items,
    reload,
    isSaved: (type, id) => Boolean(find(type, id)),
    toggle: async (type, id) => {
      const existing = find(type, id)
      if (existing) await supabase.from('saved_items').delete().eq('id', existing.id)
      else await supabase.from('saved_items').insert({ item_type: type, item_id: id })
      await reload()
    },
  }
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSaved(): SavedState {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used inside <SavedProvider>')
  return ctx
}

export function SaveButton({ type, id }: { type: SavedType; id: string }) {
  const { session } = useAuth()
  const { isSaved, toggle } = useSaved()
  if (!session) {
    return (
      <Link to="/login" className="text-sm font-medium text-union-blue-light hover:underline">
        Log in to save
      </Link>
    )
  }
  const saved = isSaved(type, id)
  return (
    <button
      onClick={() => void toggle(type, id)}
      aria-pressed={saved}
      className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ${saved ? 'bg-union-blue text-union-offwhite ring-union-blue' : 'bg-white ring-black/15 hover:bg-union-blue/5'}`}
    >
      {saved ? '★ Saved' : '☆ Save'}
    </button>
  )
}
