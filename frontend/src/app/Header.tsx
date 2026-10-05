import { Link, NavLink } from 'react-router'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/generate', label: 'Generate' },
]

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4">
        <Link to="/" className="font-semibold">
          Learning Path Generator
        </Link>
        <nav aria-label="Main" className="flex flex-wrap gap-4 text-sm">
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
  )
}
