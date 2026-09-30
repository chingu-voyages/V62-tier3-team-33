import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b p-4 font-semibold">Learning Path Generator</header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer className="border-t p-4 text-sm text-muted-foreground">Chingu V62 Team 33</footer>
    </div>
  )
}
