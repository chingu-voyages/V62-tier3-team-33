import { Outlet } from 'react-router'
import { Header } from './Header'

// Single shell for public and authenticated routes; guards wrap children, not the layout.
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl p-4 text-sm text-muted-foreground">Chingu V62 Team 33</div>
      </footer>
    </div>
  )
}
