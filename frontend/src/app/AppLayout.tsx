import { Outlet } from 'react-router'
import { Container } from '@/shared/components/Container'
import { Footer } from './Footer'
import { Header } from './Header'

// Single shell for public and authenticated routes; guards wrap children, not the layout.
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
