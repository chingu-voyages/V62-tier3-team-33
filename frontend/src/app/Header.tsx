import { Link, NavLink } from 'react-router'
import { Container } from '@/shared/components/Container'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/generate', label: 'Generate' },
]

export function Header() {
  return (
    <header className="border-b">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
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
      </Container>
    </header>
  )
}
