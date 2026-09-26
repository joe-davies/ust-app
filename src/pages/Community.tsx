import { supabase } from '../lib/supabase'
import { formatDateTime, useQuery } from '../lib/data'
import type { Community, EventItem, PageRow, Person, Testimonial } from '../lib/types'
import { BRAND } from '../brand'
import { Async, Card, Empty, PageShell, Prose, Tag } from '../components/ui'
import { SaveButton } from './../mystudy/SavedContext'

const KIND_LABEL: Record<EventItem['kind'], string> = {
  'open-day': 'Open day',
  conference: 'Conference',
  lecture: 'Lecture',
  other: 'Event',
}

export function EventsList() {
  const state = useQuery<EventItem[]>(
    () => supabase.from('events').select('*').gte('starts_at', new Date(Date.now() - 86400000).toISOString()).order('starts_at'),
    'events-upcoming',
  )
  return (
    <PageShell title="Events" intro="Open days, conferences and lectures." wide>
      <Async state={state}>
        {(rows) =>
          rows.length ? (
            <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
              {rows.map((e) => (
                <li key={e.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{KIND_LABEL[e.kind]}</Tag>
                    {e.featured && <Tag>Featured</Tag>}
                  </div>
                  <h2 className="mt-2 text-xl font-bold">{e.title}</h2>
                  <p className="text-sm text-slate-600">
                    {formatDateTime(e.starts_at)} · {e.location}
                  </p>
                  {e.description && <p className="mt-2">{e.description}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <SaveButton type="event" id={e.id} />
                    {e.url && (
                      <a href={e.url} className="font-medium text-union-blue-light hover:underline">
                        Details and booking
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No upcoming events. Check back soon.</Empty>
          )
        }
      </Async>
    </PageShell>
  )
}

export function PeopleList() {
  const state = useQuery<Person[]>(() => supabase.from('people').select('*').order('sort_order').order('name'), 'people')
  return (
    <PageShell title="Faculty and staff" intro="Meet the team." wide>
      <Async state={state}>
        {(rows) =>
          rows.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((p) => (
                <Card key={p.id}>
                  <div className="mb-3 h-32 overflow-hidden rounded bg-union-blue/10">
                    {p.photo_url && <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm text-union-blue-light">{p.role}</p>
                  <p className="mt-2 text-sm text-slate-700">{p.bio}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Empty />
          )
        }
      </Async>
    </PageShell>
  )
}

export function CommunitiesList() {
  const state = useQuery<Community[]>(() => supabase.from('communities').select('*').order('sort_order').order('name'), 'communities')
  return (
    <PageShell title="Learning Communities" intro="Study alongside others in a church near you." wide>
      <Async state={state}>
        {(rows) =>
          rows.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((c) => (
                <Card key={c.id}>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-sm text-union-blue-light">{c.location}</p>
                  <p className="mt-2 text-sm text-slate-700">{c.description}</p>
                  {c.contact_email && (
                    <a href={`mailto:${c.contact_email}`} className="mt-2 inline-block text-sm font-medium text-union-blue-light hover:underline">
                      {c.contact_email}
                    </a>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Empty />
          )
        }
      </Async>
    </PageShell>
  )
}

export function Stories() {
  const state = useQuery<Testimonial[]>(() => supabase.from('testimonials').select('*'), 'testimonials')
  return (
    <PageShell title="Student stories" intro="Hear from students and alumni." wide>
      <Async state={state}>
        {(rows) =>
          rows.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {rows.map((t) => (
                <blockquote key={t.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <p className="font-serif text-lg">“{t.quote}”</p>
                  <footer className="mt-3 text-sm text-slate-600">
                    {t.name}
                    {t.programme && `, ${t.programme}`}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <Empty />
          )
        }
      </Async>
    </PageShell>
  )
}

// Editable text page, looked up by slug (fees, beliefs, give, ...).
export function TextPage({ slug, cta }: { slug: string; cta?: 'apply' | 'give' }) {
  const state = useQuery<PageRow | null>(() => supabase.from('pages').select('*').eq('slug', slug).maybeSingle(), slug)
  return (
    <Async state={state}>
      {(page) =>
        page ? (
          <PageShell title={page.title}>
            <Prose text={page.body} />
            {cta === 'apply' && (
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BRAND.applyUrl} className="rounded bg-union-blue px-5 py-3 font-semibold text-union-offwhite hover:bg-union-blue-dark">
                  Apply now
                </a>
                <a href={BRAND.enquireUrl} className="rounded border border-union-blue px-5 py-3 font-semibold text-union-blue hover:bg-union-blue/5">
                  Enquire
                </a>
              </div>
            )}
          </PageShell>
        ) : (
          <PageShell title="Not found">
            <Empty>That page does not exist or is not published.</Empty>
          </PageShell>
        )
      }
    </Async>
  )
}
