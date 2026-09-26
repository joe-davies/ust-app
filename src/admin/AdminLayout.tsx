import { NavLink, Outlet } from 'react-router-dom'
import { RESOURCES } from './resources'

export default function AdminLayout() {
  const tab = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${isActive ? 'bg-union-blue text-union-offwhite' : 'bg-white ring-1 ring-black/10 hover:bg-union-blue/5'}`
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p className="mt-1 text-slate-600">Edit the content shown across the app.</p>
      <nav aria-label="Admin sections" className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <NavLink to="/admin" end className={tab}>Users</NavLink>
        {RESOURCES.map((r) => (
          <NavLink key={r.key} to={`/admin/${r.key}`} className={tab}>{r.label}</NavLink>
        ))}
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}
