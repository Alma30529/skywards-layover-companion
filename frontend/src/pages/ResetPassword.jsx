import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resetPassword, NETWORK_MESSAGE } from '../api/passwordReset'

const MIN_LENGTH = 8

export default function ResetPassword() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const resetToken = state?.resetToken ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    const r = await resetPassword(resetToken, password)
    setLoading(false)

    if (r.ok) {
      navigate('/login')
    } else if (r.status === 0) {
      setError(NETWORK_MESSAGE)
    } else if (r.data.error === 'expired_or_used') {
      setInvalid(true)
    } else {
      setError(r.data.message || 'Something went wrong. Try again.')
    }
  }

  if (invalid) {
    return (
      <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <div role="alert" className="mt-6 rounded-lg border border-gray-800 p-4 text-center">
          <p className="text-2xl">⚠</p>
          <p className="mt-2">This code has expired or was already used.</p>
        </div>
        <Link
          to="/forgot-password"
          className="mt-4 flex h-11 w-full items-center justify-center rounded-lg border border-gray-800 font-medium"
        >
          Request a new code
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold">Reset password</h1>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="password" className="block text-sm font-medium">New password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full rounded-lg border border-gray-400 px-3"
        />
        <p className="mt-1 text-sm text-gray-600">At least {MIN_LENGTH} characters</p>

        <label htmlFor="confirm" className="mt-4 block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? 'Saving…' : 'Reset password'}
        </button>
        <p className="mt-2 text-center text-sm text-gray-600">
          On success you are taken to the Login page.
        </p>
      </form>
    </main>
  )
}