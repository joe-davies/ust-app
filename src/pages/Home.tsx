import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import { supabase } from '../lib/supabase'
import { formatDate, useQuery } from '../lib/data'
import { KIND_LABEL, type ContentItem, type EventItem, type Testimonial } from '../lib/types'
import { Async, Card } from '../components/ui'

interface HomeData {
  featured: ContentItem[]
  daily: Partial<Record<'devotional' | 'video' | 'podcast', ContentItem>>
  events: EventItem[]
  testimonials: Testimonial[]
}

async function loadHome() {
  const [items, events, testimonials] = await Promise.all([
    supabase.from('content_items').select('*').neq('kind', 'news').order('published_at', { ascending: false }).limit(60),
    supabase.from('events').select('*').gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
    supabase.from('testimonials').select('*').limit(2),
  ])
  const error = items.error ?? events.error ?? testimonials.error
  const all = (items.data ?? []) as ContentItem[]
  const data: HomeData = {
    featured: all.filter((i) => i.featured).slice(0, 4),
    daily: {
      devotional: all.find((i) => i.kind === 'devotional'),
      video: all.find((i) => i.kind === 'video'),
      podcast: all.find((i) => i.kind === 'podcast'),
    },
    events: (events.data ?? []) as EventItem[],
    testimonials: (testimonials.data ?? []) as Testimonial[],
  }
  return { data, error }
}

const DAILY_LABEL = { devotional: 'Daily devotional', video: 'Daily video', podcast: 'Daily podcast' } as const

export default function Home() {
  const state = useQuery<HomeData>(loadHome, 'home')

  return (
    <>
      <section className="bg-union-blue text-union-offwhite">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="mb-2 text-sm uppercase tracking-wide opacity-80">{BRAND.name}</p>
          <h1 className="max-w-2xl text-4xl font-bold md:text-5xl">With you for a lifetime of ministry</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">{BRAND.tagline}. Explore courses, teaching and tools to organise your studies.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/study/course-picker" className="rounded bg-union-offwhite px-5 py-3 font-semibold text-union-blue hover:bg-white">
              Explore courses
            </Link>
            <a href={BRAND.applyUrl} className="rounded border border-union-offwhite px-5 py-3 font-semibold hover:bg-white/10">
              Apply now
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <Async state={state}>
          {(d) => (
            <div className="space-y-16">
              {d.featured.length > 0 && (
                <section>
                  <div className="mb-6 flex items-end justify-between">
                    <h2 className="text-2xl font-bold">For you</h2>
                    <Link to="/teaching" className="text-sm font-medium text-union-blue-light hover:underline">See more</Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {d.featured.map((i) => (
                      <Card key={i.id} to={`/teaching/item/${i.slug}`}>
                        <div className="mb-3 h-28 overflow-hidden rounded bg-union-blue/10">
                          {i.image_url && <img src={i.image_url} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-union-blue-light">{KIND_LABEL[i.kind]}</p>
                        <h3 className="mt-1 font-semibold leading-snug">{i.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{i.author} · {i.read_minutes} min</p>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-6 text-2xl font-bold">Daily resources</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {(['devotional', 'video', 'podcast'] as const).map((k) => {
                    const item = d.daily[k]
                    return item ? (
                      <Card key={k} to={`/teaching/item/${item.slug}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-union-blue-light">{DAILY_LABEL[k]}</p>
                        <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                        <p className="text-sm text-slate-600">{item.scripture || item.author}</p>
                      </Card>
                    ) : null
                  })}
                </div>
              </section>

              {d.events.length > 0 && (
                <section>
                  <div className="mb-6 flex items-end justify-between">
                    <h2 className="text-2xl font-bold">Upcoming events</h2>
                    <Link to="/events" className="text-sm font-medium text-union-blue-light hover:underline">See all events</Link>
                  </div>
                  <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
                    {d.events.map((e) => (
                      <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <div>
                          <p className="text-sm text-slate-600">{formatDate(e.starts_at)}</p>
                          <p className="font-semibold">{e.title}</p>
                        </div>
                        <span className="text-sm text-slate-600">{e.location}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {d.testimonials.length > 0 && (
                <section className="grid gap-6 md:grid-cols-2">
                  {d.testimonials.map((t) => (
                    <blockquote key={t.id} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-black/5">
                      <p className="font-serif text-lg">“{t.quote}”</p>
                      <footer className="mt-3 text-sm text-slate-600">{t.name}{t.programme && `, ${t.programme}`}</footer>
                    </blockquote>
                  ))}
                </section>
              )}
            </div>
          )}
        </Async>
      </div>

      <section className="bg-union-blue text-union-offwhite">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10">
          <div>
            <h2 className="text-2xl font-bold">Ready to apply?</h2>
            <p className="opacity-90">Applications for Autumn 2026 start dates are open.</p>
          </div>
          <a href={BRAND.applyUrl} className="rounded bg-union-offwhite px-5 py-3 font-semibold text-union-blue hover:bg-white">
            Apply now
          </a>
        </div>
      </section>
    </>
  )
}
