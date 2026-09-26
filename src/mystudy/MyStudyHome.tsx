import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Deadline, MyCourse, Note, ReadingItem } from '../lib/types'
import { STATUS_LABEL } from '../lib/types'
import { Card, PageShell } from '../components/ui'
import { dueLabel, useOwnRows } from './useOwnRows'
import { useSaved } from './SavedContext'

function Panel({ title, to, children }: { title: string; to: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link to={to} className="text-sm font-medium text-union-blue-light hover:underline">Open</Link>
      </div>
      {children}
    </section>
  )
}

const Muted = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-slate-600">{children}</p>

export default function MyStudyHome() {
  const { profile } = useAuth()
  const courses = useOwnRows<MyCourse>('my_courses', 'created_at', false)
  const deadlines = useOwnRows<Deadline>('deadlines', 'due_at')
  const notes = useOwnRows<Note>('notes', 'updated_at', false)
  const reading = useOwnRows<ReadingItem>('reading_items', 'created_at', false)
  const saved = useSaved()

  const next = deadlines.rows.filter((d) => !d.done).slice(0, 4)
  const active = courses.rows.filter((c) => c.status === 'in-progress')
  const nowReading = reading.rows.filter((r) => r.status === 'reading')
  const overdue = next.filter((d) => new Date(d.due_at).getTime() < Date.now()).length

  return (
    <PageShell title={`Welcome${profile?.first_name ? `, ${profile.first_name}` : ''}`} intro="Your study space: courses, deadlines, notes and reading, all in one place." wide>
      {overdue > 0 && (
        <p role="status" className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          You have {overdue} overdue {overdue === 1 ? 'deadline' : 'deadlines'}. <Link to="/my-study/deadlines" className="font-medium underline">Review</Link>
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Next deadlines" to="/my-study/deadlines">
          {next.length ? (
            <ul className="space-y-2">
              {next.map((d) => (
                <li key={d.id} className="flex justify-between gap-2 text-sm">
                  <span className="font-medium">{d.title}</span>
                  <span className={new Date(d.due_at).getTime() < Date.now() ? 'text-red-700' : 'text-slate-600'}>{dueLabel(d.due_at)}</span>
                </li>
              ))}
            </ul>
          ) : <Muted>Nothing due. Add a deadline to get started.</Muted>}
        </Panel>

        <Panel title="My courses" to="/my-study/courses">
          {active.length ? (
            <ul className="space-y-1 text-sm">
              {active.slice(0, 4).map((c) => <li key={c.id} className="font-medium">{c.title} <span className="font-normal text-slate-500">· {STATUS_LABEL[c.status]}</span></li>)}
            </ul>
          ) : <Muted>{courses.rows.length ? 'No courses in progress.' : 'You have not added any courses yet.'}</Muted>}
        </Panel>

        <Panel title="Reading now" to="/my-study/reading">
          {nowReading.length ? (
            <ul className="space-y-1 text-sm">
              {nowReading.slice(0, 4).map((r) => <li key={r.id}><span className="font-medium">{r.title}</span>{r.author && <span className="text-slate-500"> · {r.author}</span>}</li>)}
            </ul>
          ) : <Muted>Nothing marked as reading.</Muted>}
        </Panel>

        <Panel title="Recent notes" to="/my-study/notes">
          {notes.rows.length ? (
            <ul className="space-y-1 text-sm">
              {notes.rows.slice(0, 3).map((n) => <li key={n.id} className="font-medium">{n.title}</li>)}
            </ul>
          ) : <Muted>No notes yet.</Muted>}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card to="/my-study/saved"><p className="font-semibold">Saved</p><p className="text-sm text-slate-600">{saved.items.length} {saved.items.length === 1 ? 'item' : 'items'} saved</p></Card>
        <Card to="/study/course-picker"><p className="font-semibold">Find a course</p><p className="text-sm text-slate-600">Try the course picker</p></Card>
      </div>
    </PageShell>
  )
}
