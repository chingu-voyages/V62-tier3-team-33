import { Link, NavLink, Outlet } from 'react-router'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/generate', label: 'Generate' },
]

// Single shell for public and authenticated routes; guards wrap children, not the layout.
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
          <Link to="/" className="font-semibold">
            Learning Path Generator
          </Link>
          <nav className="flex gap-4 text-sm">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'font-semibold' : 'text-muted-foreground')}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl p-4 text-sm text-muted-foreground">Chingu V62 Team 33</div>
      </footer>
    </div>
  )
}
