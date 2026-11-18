import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { homeFor } from './roles'

// For /login and /register: a logged-in user is sent straight to their home
export default function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-6">Loading…</p>
  if (user) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
