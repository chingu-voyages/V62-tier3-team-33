import { Link, NavLink, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b p-4">
        <Link to="/" className="font-semibold">
          Learning Path Generator
        </Link>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'font-semibold' : 'text-muted-foreground')}>
            Home
          </NavLink>
          <NavLink to="/generate" className={({ isActive }) => (isActive ? 'font-semibold' : 'text-muted-foreground')}>
            Generate
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer className="border-t p-4 text-sm text-muted-foreground">Chingu V62 Team 33</footer>
    </div>
  )
}
