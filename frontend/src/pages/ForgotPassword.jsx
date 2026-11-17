import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true) // fake data: no server call yet
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
        <button
          type="submit"
          className="mt-4 h-11 w-full rounded-lg border border-gray-800 bg-gray-200 font-medium"
        >
          Send code
        </button>
      </form>

      {sent && (
        <div className="mt-6 space-y-3">
          <p className="rounded-lg border border-gray-800 p-3">
            If that email is registered, a code has been generated.
          </p>
          <div className="rounded-lg border border-gray-400 bg-gray-100 p-3 text-sm">
            <p className="text-gray-600">
              DEMO ONLY: code shown here or logged to the console, not emailed.
            </p>
            <p className="mt-1 text-lg font-bold">123456</p>
            <p className="text-gray-600">Single-use. Expires in 30 minutes.</p>
          </div>
          <button
            onClick={() => navigate('/enter-code')}
            className="h-11 w-full rounded-lg border border-gray-800 font-medium"
          >
            Enter code
          </button>
        </div>
      )}
    </main>
  )
}