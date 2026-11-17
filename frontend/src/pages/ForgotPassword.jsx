import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestCode, NETWORK_MESSAGE } from '../api/passwordReset'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [demoCode, setDemoCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const r = await requestCode(email.trim())
    setLoading(false)
    if (r.ok) {
      setSent(true)
      setDemoCode(r.data.demoCode ?? null)
    } else if (r.status === 0) {
      setError(NETWORK_MESSAGE)
    } else {
      setError(r.data.error || 'Something went wrong. Try again.')
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <Link to="/login" aria-label="Back to log in" className="text-2xl">‹</Link>
      <h1 className="mt-2 text-2xl font-bold">Forgot password</h1>
      <p className="mt-2 text-gray-600">
        Enter your registered email and we will generate a code.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
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
          {loading ? 'Sending…' : 'Send code'}
        </button>
      </form>

      {sent && (
        <div className="mt-6 space-y-3">
          <p className="rounded-lg border border-gray-800 p-3">
            If that email is registered, a code has been generated.
          </p>
          {demoCode && (
            <div className="rounded-lg border border-gray-400 bg-gray-100 p-3 text-sm">
              <p className="text-gray-600">
                DEMO ONLY: code shown here or logged to the console, not emailed.
              </p>
              <p className="mt-1 text-lg font-bold">{demoCode}</p>
              <p className="text-gray-600">Single-use. Expires in 30 minutes.</p>
            </div>
          )}
          <button
            onClick={() => navigate('/enter-code', { state: { email: email.trim(), demoCode } })}
            className="h-11 w-full rounded-lg border border-gray-800 font-medium"
          >
            Enter code
          </button>
        </div>
      )}
    </main>
  )
}