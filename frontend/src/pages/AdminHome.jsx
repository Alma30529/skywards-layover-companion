import { useAuth } from '../auth/useAuth'

// PLACEHOLDER for the admin landing screen. The admin card owner replaces this body.
export default function AdminHome() {
  const { user, logout } = useAuth()
  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-gray-600">Signed in as {user.email}</p>
      <button onClick={logout} className="mt-6 h-11 w-full rounded-lg border border-gray-800 font-medium">
        Log out
      </button>
    </main>
  )
}
