import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDateTime, useQuery } from '../lib/data'
import { KIND_LABEL, LEVEL_LABEL, type ContentItem, type Course, type EventItem } from '../lib/types'
import { Async, Empty, PageShell } from '../components/ui'
import { useSaved } from './SavedContext'

interface SavedData {
  content: ContentItem[]
  courses: Course[]
  events: EventItem[]
}

export default function Saved() {
  const saved = useSaved()
  const ids = (t: string) => saved.items.filter((i) => i.item_type === t).map((i) => i.item_id)
  const key = saved.items.map((i) => i.id).join(',')

  const state = useQuery<SavedData>(async () => {
    const get = async (table: string, list: string[]) =>
      list.length ? (await supabase.from(table).select('*').in('id', list)).data ?? [] : []
    const [content, courses, events] = await Promise.all([get('content_items', ids('content')), get('courses', ids('course')), get('events', ids('event'))])
    return { data: { content: content as ContentItem[], courses: courses as Course[], events: events as EventItem[] }, error: null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, key)

  const Unsave = ({ type, id }: { type: 'content' | 'course' | 'event'; id: string }) => (
    <button onClick={() => void saved.toggle(type, id)} className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50">Remove</button>
  )

  return (
    <PageShell title="Saved" intro="Teaching, courses and events you have saved." wide>
      {saved.items.length === 0 ? (
        <Empty>
          Nothing saved yet. Use the Save button on any <Link to="/teaching" className="font-medium text-union-blue-light hover:underline">teaching item</Link>, course or <Link to="/events" className="font-medium text-union-blue-light hover:underline">event</Link>.
        </Empty>
      ) : (
        <Async state={state}>
          {(d) => (
            <div className="space-y-8">
              {d.content.length > 0 && (
                <section>
                  <h2 className="mb-2 text-lg font-bold">Teaching</h2>
                  <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
                    {d.content.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <Link to={`/teaching/item/${c.slug}`} className="font-semibold hover:underline">{c.title}</Link>
                          <p className="text-sm text-slate-600">{KIND_LABEL[c.kind]} · {c.author}</p>
                        </div>
                        <Unsave type="content" id={c.id} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {d.courses.length > 0 && (
                <section>
                  <h2 className="mb-2 text-lg font-bold">Courses</h2>
                  <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
                    {d.courses.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <Link to={`/courses/${c.slug}`} className="font-semibold hover:underline">{c.title}</Link>
                          <p className="text-sm text-slate-600">{LEVEL_LABEL[c.level]} · {c.duration}</p>
                        </div>
                        <Unsave type="course" id={c.id} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {d.events.length > 0 && (
                <section>
                  <h2 className="mb-2 text-lg font-bold">Events</h2>
                  <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
                    {d.events.map((e) => (
                      <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="font-semibold">{e.title}</p>
                          <p className="text-sm text-slate-600">{formatDateTime(e.starts_at)} · {e.location}</p>
                        </div>
                        <Unsave type="event" id={e.id} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </Async>
      )}
    </PageShell>
  )
}
