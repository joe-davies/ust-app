import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '../lib/data'
import { LEVEL_LABEL, STATUS_LABEL, type Course, type CourseStatus, type MyCourse } from '../lib/types'
import { Empty, PageShell, Tag } from '../components/ui'
import { useOwnRows } from './useOwnRows'

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'
const btn = 'rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-60'

export default function MyCourses() {
  const mine = useOwnRows<MyCourse>('my_courses', 'created_at', false)
  const catalog = useQuery<Course[]>(() => supabase.from('courses').select('*').order('title'), 'catalog')
  const [choice, setChoice] = useState('')
  const [custom, setCustom] = useState('')
  const [status, setStatus] = useState<CourseStatus>('in-progress')

  const courses = catalog.data ?? []
  const bySlug = new Map(courses.map((c) => [c.id, c]))
  const usedIds = new Set(mine.rows.map((r) => r.course_id).filter(Boolean))

  async function add(e: FormEvent) {
    e.preventDefault()
    const picked = courses.find((c) => c.id === choice)
    const title = picked ? picked.title : custom.trim()
    if (!title) return
    const ok = await mine.add({ title, course_id: picked?.id ?? null, status })
    if (ok) {
      setChoice('')
      setCustom('')
    }
  }

  return (
    <PageShell title="My courses" intro="Keep track of the courses you are studying, plan to take, or have finished." wide>
      <form onSubmit={add} className="mb-8 grid gap-3 rounded-lg bg-white p-5 ring-1 ring-black/5 md:grid-cols-[2fr_2fr_1fr_auto] md:items-end">
        <label className="block text-sm font-medium">Course
          <select value={choice} onChange={(e) => setChoice(e.target.value)} className={inputCls}>
            <option value="">Something else (type a name)…</option>
            {courses.filter((c) => !usedIds.has(c.id)).map((c) => (
              <option key={c.id} value={c.id}>{c.title} ({LEVEL_LABEL[c.level]})</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">Or your own name
          <input value={custom} onChange={(e) => setCustom(e.target.value)} disabled={Boolean(choice)} placeholder="e.g. Church History 101" className={inputCls} />
        </label>
        <label className="block text-sm font-medium">Status
          <select value={status} onChange={(e) => setStatus(e.target.value as CourseStatus)} className={inputCls}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <button className={btn} disabled={!choice && !custom.trim()}>Add</button>
      </form>

      {mine.error && <p role="alert" className="mb-3 text-red-700">{mine.error}</p>}
      {mine.loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : mine.rows.length === 0 ? (
        <Empty>No courses yet. Add one above, or browse <Link to="/study/course-picker" className="font-medium text-union-blue-light hover:underline">the course picker</Link>.</Empty>
      ) : (
        <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
          {mine.rows.map((r) => {
            const cat = r.course_id ? bySlug.get(r.course_id) : undefined
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">
                    {cat ? <Link to={`/courses/${cat.slug}`} className="hover:underline">{r.title}</Link> : r.title}
                  </p>
                  {cat && <Tag>{LEVEL_LABEL[cat.level]}</Tag>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status of ${r.title}`}
                    value={r.status}
                    onChange={(e) => void mine.update(r.id, { status: e.target.value })}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button
                    onClick={() => window.confirm(`Remove "${r.title}" from your courses? Notes and deadlines linked to it are kept.`) && void mine.remove(r.id)}
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}
