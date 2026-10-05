import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Container } from '@/shared/components/Container'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/utils'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/generate', label: 'Generate' },
]

const MENU_ID = 'main-navigation'

export function Header() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="border-b">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 py-2 sm:py-4">
        <Link to="/" className="py-2 font-semibold">
          Learning Path Generator
        </Link>
        <Button
          ref={toggleRef}
          variant="ghost"
          size="icon"
          className="size-11 sm:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={MENU_ID}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
        <nav
          id={MENU_ID}
          aria-label="Main"
          className={cn('basis-full text-sm sm:flex sm:basis-auto sm:gap-4', open ? 'block' : 'hidden')}
        >
          <ul className="flex flex-col sm:flex-row sm:gap-4">
            {navItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn('block py-3 sm:py-0', isActive ? 'font-semibold' : 'text-muted-foreground')
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
