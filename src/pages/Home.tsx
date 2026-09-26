import { Link } from 'react-router-dom'
import { BRAND } from '../brand'

// Phase 1: static placeholder content. Phase 2 replaces these arrays with
// database queries, editable from /admin.
const FEATURED = [
  { title: 'Why Does Theology Matter?', meta: 'Article · 3 min', to: '/teaching' },
  { title: 'Reading the Bible Well', meta: 'Teaching series · 8 parts', to: '/teaching' },
  { title: 'Preaching Christ from the Old Testament', meta: 'Video · 12 min', to: '/teaching' },
  { title: 'Church History in Five Minutes', meta: 'Podcast · 5 min', to: '/teaching' },
]

const EVENTS = [
  { date: '14 Oct 2026', title: 'Online Open Event', place: 'Online' },
  { date: '21 Nov 2026', title: 'Ministry Centre Open Day', place: 'Wales' },
  { date: '12 Mar 2027', title: 'Research Conference', place: 'London' },
]

const TESTIMONIALS = [
  { quote: 'Studying alongside my church ministry was the perfect fit.', who: 'Sample student, MTh' },
  { quote: 'It has grown my love for Jesus and equipped me to serve him better.', who: 'Sample student, GDip' },
]

export default function Home() {
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

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">For you</h2>
          <Link to="/teaching" className="text-sm font-medium text-union-blue-light hover:underline">See more</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((item) => (
            <Link key={item.title} to={item.to} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-black/5 hover:shadow-md">
              <div className="mb-3 h-28 rounded bg-union-blue/10" aria-hidden />
              <h3 className="font-semibold leading-snug">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {[
            ['Daily devotional', 'Learning to Love', '1 Corinthians 13:1–3'],
            ['Daily video', 'Four Steps Backward', 'Sample lecturer'],
            ['Daily podcast', 'The Union Podcast', 'Latest episode'],
          ].map(([label, title, sub]) => (
            <div key={label} className="rounded-lg bg-union-offwhite p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-union-blue-light">{label}</p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-slate-600">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Upcoming events</h2>
          <Link to="/events" className="text-sm font-medium text-union-blue-light hover:underline">See all events</Link>
        </div>
        <ul className="divide-y divide-black/10 rounded-lg bg-white ring-1 ring-black/5">
          {EVENTS.map((e) => (
            <li key={e.title} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <p className="text-sm text-slate-600">{e.date}</p>
                <p className="font-semibold">{e.title}</p>
              </div>
              <span className="text-sm text-slate-600">{e.place}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-union-blue/5">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.who} className="rounded-lg bg-white p-6 shadow-sm">
              <p className="font-serif text-lg">“{t.quote}”</p>
              <footer className="mt-3 text-sm text-slate-600">{t.who}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="bg-union-blue text-union-offwhite">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10">
          <div>
            <h2 className="text-2xl font-bold">Ready to apply?</h2>
            <p className="opacity-90">Applications for Autumn 2026 start dates are open (placeholder).</p>
          </div>
          <a href={BRAND.applyUrl} className="rounded bg-union-offwhite px-5 py-3 font-semibold text-union-blue hover:bg-white">
            Apply now
          </a>
        </div>
      </section>
    </>
  )
}
