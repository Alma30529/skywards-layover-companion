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
      <button onClick={logout} className="mt-6 h-11 w-full rounded-lg border border-gray-800 font-medium">
        Log out
      </button>
    </main>
  )
}
