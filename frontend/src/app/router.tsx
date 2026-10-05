import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from './AppLayout'
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
      { path: 'paths', element: <Navigate to="/generate" replace /> },
      { path: 'paths/:id', element: <PathPage /> },
    ],
  },
])
