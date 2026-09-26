import { useState, type FormEvent } from 'react'
import { formatDate } from '../lib/data'
import type { MyCourse, Note } from '../lib/types'
import { Empty, PageShell } from '../components/ui'
import { useOwnRows } from './useOwnRows'

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'

export default function Notes() {
  const notes = useOwnRows<Note>('notes', 'updated_at', false)
  const courses = useOwnRows<MyCourse>('my_courses', 'title')
  const [editing, setEditing] = useState<Note | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [courseId, setCourseId] = useState('')
  const [q, setQ] = useState('')

  function open(n: Note | 'new') {
    setEditing(n)
    setTitle(n === 'new' ? '' : n.title)
    setBody(n === 'new' ? '' : n.body)
    setCourseId(n === 'new' ? '' : (n.my_course_id ?? ''))
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    const values = { title: title.trim() || 'Untitled note', body, my_course_id: courseId || null }
    const ok = editing === 'new' ? await notes.add(values) : await notes.update((editing as Note).id, values)
    if (ok) setEditing(null)
  }

  if (editing) {
    return (
      <PageShell title={editing === 'new' ? 'New note' : 'Edit note'}>
        <form onSubmit={save} className="space-y-4 rounded-lg bg-white p-6 ring-1 ring-black/5">
          <label className="block text-sm font-medium">Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} autoFocus />
          </label>
          <label className="block text-sm font-medium">Course (optional)
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
              <option value="">None</option>
              {courses.rows.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Note
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className={inputCls} />
          </label>
          {notes.error && <p role="alert" className="text-sm text-red-700">{notes.error}</p>}
          <div className="flex gap-3">
            <button className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50">Cancel</button>
            {editing !== 'new' && (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Delete this note? This cannot be undone.') && (await notes.remove((editing as Note).id))) setEditing(null)
                }}
                className="ml-auto rounded border border-red-300 px-4 py-2 text-red-800 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </PageShell>
    )
  }

  const courseName = new Map(courses.rows.map((c) => [c.id, c.title]))
  const shown = notes.rows.filter((n) => (n.title + ' ' + n.body).toLowerCase().includes(q.toLowerCase().trim()))

  return (
    <PageShell title="Notes" intro="Private notes, visible only to you." wide>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={() => open('new')} className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">New note</button>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" aria-label="Search notes" className="ml-auto w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm sm:w-64" />
      </div>
      {notes.error && <p role="alert" className="mb-3 text-red-700">{notes.error}</p>}
      {notes.loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : shown.length === 0 ? (
        <Empty>{notes.rows.length ? 'No notes match your search.' : 'No notes yet. Click New note to start.'}</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((n) => (
            <button key={n.id} onClick={() => open(n)} className="rounded-lg bg-white p-4 text-left shadow-sm ring-1 ring-black/5 hover:shadow-md">
              <h2 className="font-semibold">{n.title}</h2>
              {n.my_course_id && courseName.get(n.my_course_id) && <p className="text-xs text-union-blue-light">{courseName.get(n.my_course_id)}</p>}
              <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-slate-700">{n.body}</p>
              <p className="mt-3 text-xs text-slate-500">Updated {formatDate(n.updated_at)}</p>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  )
}
