import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

// PLACEHOLDER for the passenger landing screen. Whoever owns the next
// passenger card replaces the body of this page; the routing already works.
export default function PassengerHome() {
  const { user, logout } = useAuth()
  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold">Hello, {user.name}</h1>
      <p className="mt-2 text-gray-600">
        {user.tier ? `${user.tier} member · ${user.skywardsNumber}` : user.skywardsNumber}
      </p>
      <Link
        to="/layover"
        className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-red-700 font-medium text-white"
      >
        Plan your layover
      </Link>
      <button onClick={logout} className="mt-3 h-11 w-full rounded-lg border border-gray-800 font-medium">
        Log out
      </button>
    </main>
  )
}
