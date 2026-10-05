import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { GeneratorPage } from './pages/GeneratorPage'
import { HomePage } from './pages/HomePage'
import { PathPage } from './pages/PathPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'generate', element: <GeneratorPage /> },
      {
        // Pathless group for authenticated routes: add a guard `element` here once auth exists.
        children: [{ path: 'dashboard', element: <DashboardPage /> }],
      },
      { path: 'paths', element: <Navigate to="/generate" replace /> },
      { path: 'paths/:id', element: <PathPage /> },
    ],
  },
])
