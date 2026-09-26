import { useLocation, Link } from 'react-router-dom'
import { ALL_LEAVES } from '../nav'

export default function Placeholder() {
  const { pathname } = useLocation()
  const leaf = ALL_LEAVES.find((l) => l.path === pathname)
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{leaf?.label ?? 'Page not found'}</h1>
      <p className="mt-3 text-lg text-slate-700">
        {leaf ? leaf.blurb : 'That page does not exist.'}
      </p>
      {leaf && (
        <p className="mt-6 rounded bg-white p-4 text-sm text-slate-600 ring-1 ring-black/5">
          This section is planned for Phase {leaf.phase} of the build.
        </p>
      )}
      <Link to="/" className="mt-8 inline-block font-medium text-union-blue-light hover:underline">← Back to home</Link>
    </div>
  )
}
