import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { BRAND } from '../brand'
import { supabase } from '../lib/supabase'
import { useQuery } from '../lib/data'
import { LEVEL_LABEL, type Course, type CourseLevel } from '../lib/types'
import { Async, Card, Empty, PageShell, Prose, Tag } from '../components/ui'
import { SaveButton } from '../mystudy/SavedContext'

const PATH_LEVELS: Record<string, { title: string; intro: string; levels: CourseLevel[] }> = {
  '/study/foundation': { title: 'Foundation courses', intro: 'Start theological study at your own pace.', levels: ['foundation'] },
  '/study/ba': { title: 'BA', intro: 'Undergraduate degree programmes.', levels: ['ba'] },
  '/study/ma': { title: 'MA', intro: 'Master of Arts programmes.', levels: ['ma'] },
  '/study/gdip': { title: 'Graduate Diploma', intro: 'Postgraduate diploma programmes.', levels: ['gdip'] },
  '/study/mth': { title: 'MTh', intro: 'Master of Theology programmes.', levels: ['mth'] },
  '/study/phd': { title: 'PhD', intro: 'Doctoral research.', levels: ['phd'] },
  '/study/shorter-courses': { title: 'Shorter courses and biblical languages', intro: 'Short courses and language study.', levels: ['short', 'language'] },
}

function CourseCard({ c }: { c: Course }) {
  return (
    <Card to={`/courses/${c.slug}`}>
      <Tag>{LEVEL_LABEL[c.level]}</Tag>
      <h3 className="mt-2 font-semibold leading-snug">{c.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{c.summary}</p>
      <p className="mt-2 text-xs text-slate-500">
        {[c.duration, c.mode, c.next_start && `Starts ${c.next_start}`].filter(Boolean).join(' · ')}
      </p>
    </Card>
  )
}

const fetchCourses = () => supabase.from('courses').select('*').order('sort_order').order('title')

export function CoursesByLevel() {
  const { pathname } = useLocation()
  const cfg = PATH_LEVELS[pathname]
  const state = useQuery<Course[]>(fetchCourses, 'courses')
  if (!cfg) return null
  return (
    <PageShell title={cfg.title} intro={cfg.intro} wide>
      <Async state={state}>
        {(rows) => {
          const shown = rows.filter((c) => cfg.levels.includes(c.level))
          return shown.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((c) => (
                <CourseCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <Empty>No courses at this level yet.</Empty>
          )
        }}
      </Async>
      <p className="mt-8 text-sm">
        Not sure which is right for you? Try the{' '}
        <Link to="/study/course-picker" className="font-medium text-union-blue-light hover:underline">
          course picker
        </Link>
        .
      </p>
    </PageShell>
  )
}

export function CourseDetail() {
  const { slug = '' } = useParams()
  const state = useQuery<Course | null>(() => supabase.from('courses').select('*').eq('slug', slug).maybeSingle(), slug)
  return (
    <Async state={state}>
      {(c) =>
        c ? (
          <PageShell title={c.title} intro={c.summary}>
            <div className="mb-6 flex flex-wrap gap-2">
              <Tag>{LEVEL_LABEL[c.level]}</Tag>
              {c.duration && <Tag>{c.duration}</Tag>}
              {c.mode && <Tag>{c.mode}</Tag>}
              {c.next_start && <Tag>Starts {c.next_start}</Tag>}
            </div>
            <Prose text={c.description} />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={c.apply_url || BRAND.applyUrl} className="rounded bg-union-blue px-5 py-3 font-semibold text-union-offwhite hover:bg-union-blue-dark">
                Apply now
              </a>
              <a href={BRAND.enquireUrl} className="rounded border border-union-blue px-5 py-3 font-semibold text-union-blue hover:bg-union-blue/5">
                Enquire
              </a>
              <SaveButton type="course" id={c.id} />
            </div>
          </PageShell>
        ) : (
          <PageShell title="Not found">
            <Empty>That course does not exist or is not published.</Empty>
          </PageShell>
        )
      }
    </Async>
  )
}

// ---- Course picker: a short quiz that scores programme levels ----
type Weights = Partial<Record<CourseLevel, number>>
interface Question {
  q: string
  options: { label: string; w: Weights }[]
}

const QUESTIONS: Question[] = [
  {
    q: 'Where are you starting from?',
    options: [
      { label: 'New to formal theological study', w: { foundation: 3, short: 2, ba: 1, language: 1 } },
      { label: 'I have some study or ministry experience', w: { gdip: 3, ma: 2, ba: 1 } },
      { label: 'I already have a degree in theology', w: { ma: 2, mth: 3, phd: 1 } },
    ],
  },
  {
    q: 'How much time can you give each week?',
    options: [
      { label: 'A few hours', w: { short: 3, foundation: 2, language: 1 } },
      { label: 'Part time alongside work or ministry', w: { ba: 1, gdip: 2, ma: 2, mth: 2, foundation: 1 } },
      { label: 'Full time', w: { ba: 3, gdip: 2, ma: 1, phd: 2 } },
    ],
  },
  {
    q: 'What is your main goal?',
    options: [
      { label: 'Know God better and grow as a Christian', w: { foundation: 2, short: 3, language: 1 } },
      { label: 'Prepare for church ministry or leadership', w: { ba: 2, gdip: 3, ma: 2 } },
      { label: 'Academic research or teaching', w: { mth: 3, phd: 3, ma: 1 } },
      { label: 'Read the Bible in its original languages', w: { language: 4 } },
    ],
  },
]

export function CoursePicker() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null))
  const [done, setDone] = useState(false)
  const state = useQuery<Course[]>(fetchCourses, 'courses')
  const complete = answers.every((a) => a !== null)

  const scores = new Map<CourseLevel, number>()
  answers.forEach((a, qi) => {
    if (a === null) return
    Object.entries(QUESTIONS[qi].options[a].w).forEach(([lvl, w]) =>
      scores.set(lvl as CourseLevel, (scores.get(lvl as CourseLevel) ?? 0) + (w ?? 0)),
    )
  })
  const ranked = [...scores].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([l]) => l)

  return (
    <PageShell title="Course picker" intro="Answer three quick questions and we will suggest programmes to explore.">
      {!done ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
          className="space-y-6"
        >
          {QUESTIONS.map((question, qi) => (
            <fieldset key={question.q} className="rounded-lg bg-white p-5 ring-1 ring-black/5">
              <legend className="px-1 font-semibold">{question.q}</legend>
              <div className="mt-2 space-y-2">
                {question.options.map((o, oi) => (
                  <label key={o.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button disabled={!complete} className="rounded bg-union-blue px-5 py-3 font-semibold text-union-offwhite hover:bg-union-blue-dark disabled:opacity-50">
            Show my suggestions
          </button>
        </form>
      ) : (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Suggested for you</h2>
          <Async state={state}>
            {(rows) => {
              const picks = rows.filter((c) => ranked.includes(c.level))
              return picks.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {picks.map((c) => (
                    <CourseCard key={c.id} c={c} />
                  ))}
                </div>
              ) : (
                <Empty>No matching courses are published yet.</Empty>
              )
            }}
          </Async>
          <button
            className="mt-6 text-sm font-medium text-union-blue-light hover:underline"
            onClick={() => {
              setDone(false)
              setAnswers(QUESTIONS.map(() => null))
            }}
          >
            Start again
          </button>
        </div>
      )}
    </PageShell>
  )
}
