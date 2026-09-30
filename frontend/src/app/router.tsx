import { createBrowserRouter } from 'react-router'
import { AppLayout } from './AppLayout'
import { HomePage } from './pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
])
