import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useQuery } from '../lib/data'
import { KIND_DEADLINE_LABEL, type Deadline, type DeadlineKind, type EventItem, type MyCourse } from '../lib/types'
import { Empty, PageShell, Tag } from '../components/ui'
import { dueLabel, toLocalInput, useOwnRows } from './useOwnRows'
import { useSaved } from './SavedContext'

const inputCls = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2'

interface CalItem {
  key: string
  date: Date
  title: string
  kind: 'deadline' | 'event'
  done?: boolean
  to?: string
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function MonthGrid({ items }: { items: CalItem[] }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>()
    items.forEach((i) => m.set(dayKey(i.date), [...(m.get(dayKey(i.date)) ?? []), i]))
    return m
  }, [items])

  const first = new Date(cursor)
  const offset = (first.getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ]
  while (cells.length % 7) cells.push(null)
  const todayKey = dayKey(new Date())

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50" aria-label="Previous month">←</button>
        <h2 className="text-lg font-bold">{cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50" aria-label="Next month">→</button>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-black/10 ring-1 ring-black/10">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="bg-union-blue/5 p-1 text-center text-xs font-semibold">{d}</div>
        ))}
        {cells.map((d, i) => {
          const list = d ? (byDay.get(dayKey(d)) ?? []) : []
          return (
            <div key={i} className={`min-h-20 bg-white p-1 ${d && dayKey(d) === todayKey ? 'ring-2 ring-inset ring-union-blue-light' : ''}`}>
              {d && <p className="text-xs text-slate-500">{d.getDate()}</p>}
              {list.slice(0, 3).map((it) => (
                <p key={it.key} title={it.title} className={`mt-0.5 truncate rounded px-1 text-[11px] ${it.kind === 'event' ? 'bg-amber-100 text-amber-900' : it.done ? 'bg-slate-100 text-slate-500 line-through' : 'bg-union-blue/10 text-union-blue'}`}>
                  {it.title}
                </p>
              ))}
              {list.length > 3 && <p className="text-[11px] text-slate-500">+{list.length - 3} more</p>}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">Blue: your deadlines. Amber: events you have saved.</p>
    </div>
  )
}

export default function Deadlines() {
  const deadlines = useOwnRows<Deadline>('deadlines', 'due_at')
  const courses = useOwnRows<MyCourse>('my_courses', 'title')
  const saved = useSaved()
  const savedEventIds = saved.items.filter((i) => i.item_type === 'event').map((i) => i.item_id)
  const events = useQuery<EventItem[]>(
    () => (savedEventIds.length ? supabase.from('events').select('*').in('id', savedEventIds) : Promise.resolve({ data: [], error: null })),
    savedEventIds.join(','),
  )

  const [view, setView] = useState<'list' | 'month'>('list')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000)
    d.setHours(17, 0, 0, 0)
    return toLocalInput(d)
  })
  const [kind, setKind] = useState<DeadlineKind>('assignment')
  const [courseId, setCourseId] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !due) return
    const ok = await deadlines.add({ title: title.trim(), due_at: new Date(due).toISOString(), kind, my_course_id: courseId || null })
    if (ok) setTitle('')
  }

  const courseName = new Map(courses.rows.map((c) => [c.id, c.title]))
  const now = Date.now()
  const open = deadlines.rows.filter((d) => !d.done)
  const overdue = open.filter((d) => new Date(d.due_at).getTime() < now)
  const upcoming = open.filter((d) => new Date(d.due_at).getTime() >= now)
  const done = deadlines.rows.filter((d) => d.done).reverse()

  const calItems: CalItem[] = [
    ...deadlines.rows.map((d) => ({ key: d.id, date: new Date(d.due_at), title: d.title, kind: 'deadline' as const, done: d.done })),
    ...(events.data ?? []).map((e) => ({ key: e.id, date: new Date(e.starts_at), title: e.title, kind: 'event' as const })),
  ]

  const Row = ({ d, late = false }: { d: Deadline; late?: boolean }) => (
    <li className="flex flex-wrap items-center gap-3 p-4">
      <input type="checkbox" checked={d.done} onChange={(e) => void deadlines.update(d.id, { done: e.target.checked })} aria-label={`Mark ${d.title} as done`} className="h-5 w-5" />
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${d.done ? 'text-slate-500 line-through' : ''}`}>{d.title}</p>
        <p className={`text-sm ${late ? 'font-medium text-red-700' : 'text-slate-600'}`}>
          {late && 'Overdue · '}{dueLabel(d.due_at)}
          {d.my_course_id && courseName.get(d.my_course_id) ? ` · ${courseName.get(d.my_course_id)}` : ''}
        </p>
      </div>
      <Tag>{KIND_DEADLINE_LABEL[d.kind]}</Tag>
      <button onClick={() => window.confirm(`Delete "${d.title}"?`) && void deadlines.remove(d.id)} className="rounded border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50">Delete</button>
    </li>
  )

  const Section = ({ heading, list, late }: { heading: string; list: Deadline[]; late?: boolean }) =>
    list.length ? (
      <section>
        <h2 className="mb-2 text-lg font-bold">{heading} <span className="text-sm font-normal text-slate-500">({list.length})</span></h2>
        <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
          {list.map((d) => <Row key={d.id} d={d} late={late} />)}
        </ul>
      </section>
    ) : null

  return (
    <PageShell title="Deadlines and calendar" intro="Assignments, exams and key dates in one place." wide>
      <form onSubmit={add} className="mb-8 grid gap-3 rounded-lg bg-white p-5 ring-1 ring-black/5 md:grid-cols-[2fr_1.5fr_1fr_1.5fr_auto] md:items-end">
        <label className="block text-sm font-medium">What is due?
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required placeholder="e.g. Essay on Romans 5" />
        </label>
        <label className="block text-sm font-medium">Due
          <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} required />
        </label>
        <label className="block text-sm font-medium">Type
          <select value={kind} onChange={(e) => setKind(e.target.value as DeadlineKind)} className={inputCls}>
            {Object.entries(KIND_DEADLINE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Course
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls}>
            <option value="">None</option>
            {courses.rows.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <button className="rounded bg-union-blue px-4 py-2 font-semibold text-union-offwhite hover:bg-union-blue-dark">Add</button>
      </form>

      <div role="tablist" className="mb-6 flex gap-2">
        {(['list', 'month'] as const).map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-full px-4 py-1 text-sm font-medium ${view === v ? 'bg-union-blue text-union-offwhite' : 'bg-white ring-1 ring-black/10 hover:bg-union-blue/5'}`}>
            {v === 'list' ? 'List' : 'Month'}
          </button>
        ))}
      </div>

      {deadlines.error && <p role="alert" className="mb-3 text-red-700">{deadlines.error}</p>}
      {deadlines.loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : view === 'month' ? (
        <MonthGrid items={calItems} />
      ) : deadlines.rows.length === 0 ? (
        <Empty>No deadlines yet. Add your first one above. You can also <Link to="/events" className="font-medium text-union-blue-light hover:underline">save events</Link> to see them on the calendar.</Empty>
      ) : (
        <div className="space-y-8">
          <Section heading="Overdue" list={overdue} late />
          <Section heading="Upcoming" list={upcoming} />
          <Section heading="Done" list={done} />
        </div>
      )}
    </PageShell>
  )
}
