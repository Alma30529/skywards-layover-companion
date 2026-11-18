import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { homeFor } from './roles'

// Wrap routes that need a login, optionally limited to certain roles:
//   <Route element={<ProtectedRoute roles={['passenger']} />}>
//     <Route path="/itinerary" element={<ItineraryScreen />} />
//   </Route>
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-6">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  // logged in but wrong role: send them to their own home instead of a dead end
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />

  return <Outlet />
}
