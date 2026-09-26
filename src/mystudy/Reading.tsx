import { useState, type FormEvent } from 'react'
import { READING_LABEL, type MyCourse, type ReadingItem, type ReadingStatus } from '../lib/types'
import { Empty, PageShell } from '../components/ui'
import { useOwnRows } from './useOwnRows'

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'
const ORDER: ReadingStatus[] = ['reading', 'to-read', 'done']

export default function Reading() {
  const items = useOwnRows<ReadingItem>('reading_items', 'created_at', false)
  const courses = useOwnRows<MyCourse>('my_courses', 'title')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [courseId, setCourseId] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const ok = await items.add({ title: title.trim(), author: author.trim(), my_course_id: courseId || null })
    if (ok) {
      setTitle('')
      setAuthor('')
    }
  }

  const courseName = new Map(courses.rows.map((c) => [c.id, c.title]))
  const done = items.rows.filter((i) => i.status === 'done').length

  return (
    <PageShell title="Reading lists" intro={items.rows.length ? `${done} of ${items.rows.length} finished.` : 'Track books and articles you plan to read, are reading, or have finished.'} wide>
      <form onSubmit={add} className="mb-8 grid gap-3 rounded-lg bg-white p-5 ring-1 ring-black/5 md:grid-cols-[2fr_1.5fr_1.5fr_auto] md:items-end">
        <label className="block text-sm font-medium">Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
        </label>
        <label className="block text-sm font-medium">Author
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm font-medium">Course
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
            <option value="">None</option>
            {courses.rows.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <button className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">Add</button>
      </form>

      {items.error && <p role="alert" className="mb-3 text-red-700">{items.error}</p>}
      {items.loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : items.rows.length === 0 ? (
        <Empty>Your reading list is empty.</Empty>
      ) : (
        <div className="space-y-8">
          {ORDER.map((s) => {
            const list = items.rows.filter((i) => i.status === s)
            if (!list.length) return null
            return (
              <section key={s}>
                <h2 className="mb-2 text-lg font-bold">{READING_LABEL[s]} <span className="text-sm font-normal text-slate-500">({list.length})</span></h2>
                <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
                  {list.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className={`font-semibold ${i.status === 'done' ? 'text-slate-500 line-through' : ''}`}>{i.title}</p>
                        <p className="text-sm text-slate-600">
                          {[i.author, i.my_course_id ? courseName.get(i.my_course_id) : ''].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Status of ${i.title}`}
                          value={i.status}
                          onChange={(e) => void items.update(i.id, { status: e.target.value })}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                        >
                          {ORDER.map((o) => <option key={o} value={o}>{READING_LABEL[o]}</option>)}
                        </select>
                        <button onClick={() => window.confirm(`Remove "${i.title}"?`) && void items.remove(i.id)} className="rounded border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50">Remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
