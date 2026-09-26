import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDate, useQuery } from '../lib/data'
import { KIND_LABEL, type ContentItem, type ContentKind, type Series } from '../lib/types'
import { Async, Card, Empty, PageShell, Prose, Tag } from '../components/ui'

const fetchItems = () =>
  supabase.from('content_items').select('*').order('published_at', { ascending: false }).limit(300)

const KINDS: { value: ContentKind | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'devotional', label: 'Devotionals' },
  { value: 'video', label: 'Videos' },
  { value: 'podcast', label: 'Podcasts' },
  { value: 'qa', label: 'Q&As' },
]

function ItemCard({ item }: { item: ContentItem }) {
  return (
    <Card to={`/teaching/item/${item.slug}`}>
      <div className="mb-3 h-24 overflow-hidden rounded bg-union-blue/10">
        {item.image_url && <img src={item.image_url} alt="" className="h-full w-full object-cover" />}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-union-blue-light">{KIND_LABEL[item.kind]}</p>
      <h3 className="mt-1 font-semibold leading-snug">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {item.author} · {item.read_minutes} min
      </p>
    </Card>
  )
}

// Shared list: fixedKind pins the type (devotionals, news); otherwise a tab bar is shown.
export function Library({ fixedKind, title, intro }: { fixedKind?: ContentKind; title: string; intro?: string }) {
  const [params, setParams] = useSearchParams()
  const state = useQuery<ContentItem[]>(fetchItems, 'all-items')
  const kind = fixedKind ?? (params.get('kind') as ContentKind | null) ?? ''
  const q = (params.get('q') ?? '').toLowerCase().trim()
  const topic = params.get('topic') ?? ''
  const scripture = (params.get('scripture') ?? '').toLowerCase()

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)))
    setParams(p, { replace: true })
  }

  return (
    <PageShell title={title} intro={intro} wide>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {!fixedKind && (
          <div role="tablist" className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                role="tab"
                aria-selected={kind === k.value}
                onClick={() => update({ kind: k.value })}
                className={`rounded-full px-3 py-1 text-sm font-medium ${kind === k.value ? 'bg-union-blue text-union-offwhite' : 'bg-white ring-1 ring-black/10 hover:bg-union-blue/5'}`}
              >
                {k.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="search"
          value={params.get('q') ?? ''}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Search teaching…"
          aria-label="Search teaching"
          className="ml-auto w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm sm:w-64"
        />
      </div>
      {(topic || scripture) && (
        <p className="mb-4 text-sm">
          Filtering by <Tag>{topic || params.get('scripture')}</Tag>{' '}
          <button className="text-union-blue-light hover:underline" onClick={() => update({ topic: '', scripture: '' })}>
            clear
          </button>
        </p>
      )}
      <Async state={state}>
        {(items) => {
          const shown = items.filter((i) => {
            if (fixedKind ? i.kind !== fixedKind : kind ? i.kind !== kind : i.kind === 'news') return false
            if (topic && !i.topics.includes(topic)) return false
            if (scripture && !i.scripture.toLowerCase().startsWith(scripture)) return false
            if (!q) return true
            return [i.title, i.summary, i.author, i.scripture, i.topics.join(' ')].join(' ').toLowerCase().includes(q)
          })
          if (!shown.length) return <Empty>No matching items.</Empty>
          return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((i) => (
                <ItemCard key={i.id} item={i} />
              ))}
            </div>
          )
        }}
      </Async>
    </PageShell>
  )
}

export const TeachingLibrary = () => (
  <Library title="Teaching library" intro="Articles, devotionals, videos, podcasts and Q&As." />
)
export const Devotionals = () => <Library fixedKind="devotional" title="Devotionals" intro="A short daily devotional to start your day." />
export const NewsList = () => <Library fixedKind="news" title="News" intro="Latest news from Union." />

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export function TeachingItem() {
  const { slug = '' } = useParams()
  const state = useQuery<ContentItem | null>(
    () => supabase.from('content_items').select('*').eq('slug', slug).maybeSingle(),
    slug,
  )
  return (
    <Async state={state}>
      {(item) =>
        item ? (
          <PageShell title={item.title}>
            <p className="-mt-6 mb-6 text-sm text-slate-600">
              {KIND_LABEL[item.kind]} · {item.author} · {formatDate(item.published_at)} · {item.read_minutes} min
              {item.scripture && (
                <>
                  {' · '}
                  <Link className="text-union-blue-light hover:underline" to={`/teaching?scripture=${encodeURIComponent(item.scripture.split(' ')[0])}`}>
                    {item.scripture}
                  </Link>
                </>
              )}
            </p>
            {item.media_url && (item.kind === 'video' || item.kind === 'podcast') && (
              <div className="mb-6">
                {embedUrl(item.media_url) ? (
                  <iframe
                    title={item.title}
                    src={embedUrl(item.media_url)!}
                    className="aspect-video w-full rounded-lg"
                    allowFullScreen
                  />
                ) : item.kind === 'podcast' && /\.(mp3|m4a|wav|ogg)(\?|$)/i.test(item.media_url) ? (
                  <audio controls src={item.media_url} className="w-full" />
                ) : (
                  <a href={item.media_url} className="font-medium text-union-blue-light hover:underline">
                    Open media
                  </a>
                )}
              </div>
            )}
            {item.summary && <p className="mb-4 font-serif text-xl text-slate-700">{item.summary}</p>}
            <Prose text={item.body} />
            {item.topics.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {item.topics.map((t) => (
                  <Link key={t} to={`/teaching?topic=${encodeURIComponent(t)}`}>
                    <Tag>{t}</Tag>
                  </Link>
                ))}
              </div>
            )}
          </PageShell>
        ) : (
          <PageShell title="Not found">
            <Empty>That item does not exist or is not published.</Empty>
          </PageShell>
        )
      }
    </Async>
  )
}

export function TopicsIndex() {
  const state = useQuery<ContentItem[]>(fetchItems, 'all-items')
  return (
    <PageShell title="Topics and Scripture index" intro="Browse teaching by topic or by Bible book." wide>
      <Async state={state}>
        {(items) => {
          const topics = new Map<string, number>()
          const books = new Map<string, number>()
          items.forEach((i) => {
            i.topics.forEach((t) => topics.set(t, (topics.get(t) ?? 0) + 1))
            if (i.scripture) {
              const m = i.scripture.match(/^(\d\s)?[A-Za-z]+/)
              if (m) books.set(m[0], (books.get(m[0]) ?? 0) + 1)
            }
          })
          return (
            <div className="grid gap-10 md:grid-cols-2">
              <section>
                <h2 className="mb-3 text-xl font-bold">Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {[...topics].sort().map(([t, n]) => (
                    <Link key={t} to={`/teaching?topic=${encodeURIComponent(t)}`} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-black/10 hover:bg-union-blue/5">
                      {t} <span className="text-slate-500">({n})</span>
                    </Link>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="mb-3 text-xl font-bold">Scripture</h2>
                <div className="flex flex-wrap gap-2">
                  {[...books].sort().map(([b, n]) => (
                    <Link key={b} to={`/teaching?scripture=${encodeURIComponent(b)}`} className="rounded-full bg-white px-3 py-1 text-sm ring-1 ring-black/10 hover:bg-union-blue/5">
                      {b} <span className="text-slate-500">({n})</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )
        }}
      </Async>
    </PageShell>
  )
}

export function Collections() {
  const state = useQuery<Series[]>(() => supabase.from('series').select('*').order('title'), 'series')
  return (
    <PageShell title="Collections and series" intro="Curated series of teaching." wide>
      <Async state={state}>
        {(rows) =>
          rows.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((s) => (
                <Card key={s.id} to={`/teaching/series/${s.slug}`}>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                  {s.author && <p className="mt-2 text-xs text-slate-500">{s.author}</p>}
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

export function SeriesDetail() {
  const { slug = '' } = useParams()
  const state = useQuery<{ series: Series | null; items: ContentItem[] }>(async () => {
    const { data: series, error } = await supabase.from('series').select('*').eq('slug', slug).maybeSingle()
    if (error || !series) return { data: { series: null, items: [] }, error }
    const { data: items, error: e2 } = await supabase
      .from('content_items')
      .select('*')
      .eq('series_id', (series as Series).id)
      .order('published_at')
    return { data: { series: series as Series, items: (items ?? []) as ContentItem[] }, error: e2 }
  }, slug)
  return (
    <Async state={state}>
      {({ series, items }) =>
        series ? (
          <PageShell title={series.title} intro={series.description} wide>
            {items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((i) => (
                  <ItemCard key={i.id} item={i} />
                ))}
              </div>
            ) : (
              <Empty>No items in this series yet.</Empty>
            )}
          </PageShell>
        ) : (
          <PageShell title="Not found">
            <Empty>That series does not exist.</Empty>
          </PageShell>
        )
      }
    </Async>
  )
}
