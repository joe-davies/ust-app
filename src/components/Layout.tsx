import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BRAND } from '../brand'
import { NAV } from '../nav'
import { useAuth } from '../auth/AuthContext'

function AccountLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { session, isAdmin, signOut } = useAuth()
  const linkCls = 'whitespace-nowrap rounded px-3 py-2 text-sm font-medium hover:bg-white/10'
  if (!session) {
    return (
      <>
        <Link to="/login" onClick={onNavigate} className={linkCls}>Log in</Link>
        <Link
          to="/signup"
          onClick={onNavigate}
          className="rounded bg-union-offwhite px-3 py-2 text-sm font-semibold text-union-blue hover:bg-white"
        >
          Sign up
        </Link>
      </>
    )
  }
  return (
    <>
      {isAdmin && <Link to="/admin" onClick={onNavigate} className={linkCls}>Admin</Link>}
      <Link to="/account" onClick={onNavigate} className={linkCls}>My account</Link>
      <button onClick={() => { onNavigate?.(); void signOut() }} className={linkCls}>Log out</button>
    </>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">
        Skip to content
      </a>
      <header className="bg-union-blue text-union-offwhite">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" onClick={close} aria-label={`${BRAND.name} home`}>
            <img src={BRAND.logoUrl} alt={BRAND.name} className="h-10 w-auto" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
            {NAV.map((group) => (
              <div key={group.label} className="group relative">
                <button className="whitespace-nowrap rounded px-3 py-2 text-sm font-medium hover:bg-white/10 focus-visible:bg-white/10">
                  {group.label}
                </button>
                <div className="invisible absolute left-0 top-full z-40 w-64 rounded-b bg-white p-2 text-union-ink opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="block rounded px-3 py-2 text-sm hover:bg-union-offwhite"
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-1 xl:flex">
            <AccountLinks />
          </div>

          <button
            className="rounded p-2 xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="block text-2xl leading-none">{open ? '✕' : '☰'}</span>
          </button>
        </div>

        {open && (
          <nav aria-label="Mobile" className="border-t border-white/10 px-4 pb-4 xl:hidden">
            {NAV.map((group) => (
              <details key={group.label} className="border-b border-white/10 py-2">
                <summary className="cursor-pointer py-1 font-medium">{group.label}</summary>
                <div className="flex flex-col pl-3">
                  {group.items.map((item) => (
                    <Link key={item.path} to={item.path} onClick={close} className="py-1.5 text-sm">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <div className="mt-3 flex flex-wrap gap-2">
              <AccountLinks onNavigate={close} />
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-union-blue-dark text-union-offwhite">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <img src={BRAND.logoUrl} alt={BRAND.name} className="mb-3 h-10 w-auto" />
            <p className="text-sm opacity-80">{BRAND.tagline}.</p>
          </div>
          <div className="text-sm">
            <h2 className="mb-2 font-sans text-base font-semibold">Quick links</h2>
            <ul className="space-y-1 opacity-90">
              <li><a href={BRAND.applyUrl} className="hover:underline">Apply</a></li>
              <li><a href={BRAND.enquireUrl} className="hover:underline">Enquire</a></li>
              <li><Link to="/give" className="hover:underline">Give</Link></li>
              <li><a href="https://www.ust.ac.uk" className="hover:underline">ust.ac.uk</a></li>
            </ul>
          </div>
          <p className="text-xs opacity-70">
            Prototype for Union School of Theology. Content shown is placeholder and will be
            editable by administrators.
          </p>
        </div>
      </footer>
    </div>
  )
}
