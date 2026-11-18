import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { homeFor } from './roles'

// Used for "/" and for /login and /register when already logged in
export default function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <p className="p-6">Loading…</p>
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />
}
