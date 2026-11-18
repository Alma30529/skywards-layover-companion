import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { homeFor } from '../auth/roles'
import { NETWORK_MESSAGE } from '../api/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const justRegistered = state?.registered === true
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const r = await login(email.trim(), password)
    setLoading(false)
    if (r.ok) {
      // role routing: passenger and admin land on different screens
      navigate(homeFor(r.data.user.role), { replace: true })
    } else if (r.status === 0) {
      setError(NETWORK_MESSAGE)
    } else {
      setError(r.data.message || 'Something went wrong. Try again.')
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-2 text-gray-600">Welcome back to Skywards Layover Companion.</p>

      {justRegistered && (
        <p role="status" className="mt-4 rounded-lg border border-gray-800 p-3 text-sm font-medium">
          ✓ Account created. Log in to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          className="mt-1 h-11 w-full rounded-lg border border-gray-400 px-3"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full rounded-lg border border-gray-400 px-3"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">⚠ {error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-11 w-full rounded-lg border border-gray-800 bg-gray-200 font-medium disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-2 flex justify-center text-sm">
        <Link to="/forgot-password" className="inline-flex min-h-11 items-center px-2 underline">Forgot password?</Link>
      </p>
      <p className="flex flex-wrap items-center justify-center text-sm">
        New here?{' '}
        <Link to="/register" className="inline-flex min-h-11 items-center px-1 font-medium underline">Create an account</Link>
      </p>
    </main>
  )
}
