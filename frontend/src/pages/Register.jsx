import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { NETWORK_MESSAGE } from '../api/auth'

const MIN_LENGTH = 8

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    skywardsNumber: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    const r = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      skywardsNumber: form.skywardsNumber.trim(),
      password: form.password,
    })
    setLoading(false)
    if (r.ok) {
      navigate('/login', { replace: true, state: { registered: true, email: form.email.trim() } })
    } else if (r.status === 0) {
      setError(NETWORK_MESSAGE)
    } else {
      setError(r.data.message || 'Something went wrong. Try again.')
    }
  }

  const input = 'mt-1 h-11 w-full rounded-lg border border-gray-400 px-3'
  const label = 'mt-4 block text-sm font-medium'

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="mt-2 text-gray-600">Link your Emirates Skywards number to get started.</p>

      <form onSubmit={handleSubmit} className="mt-2">
        <label htmlFor="name" className={label}>Full name</label>
        <input id="name" required autoComplete="name" value={form.name} onChange={set('name')} className={input} />

        <label htmlFor="email" className={label}>Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          placeholder="name@email.com"
          className={input}
        />

        <label htmlFor="skywards" className={label}>Skywards number</label>
        <input
          id="skywards"
          required
          value={form.skywardsNumber}
          onChange={set('skywardsNumber')}
          placeholder="EK 0000 0001"
          className={input}
        />

        <label htmlFor="password" className={label}>Password</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          className={input}
        />
        <p className="mt-1 text-xs text-gray-600">At least {MIN_LENGTH} characters.</p>

        <label htmlFor="confirm" className={label}>Confirm password</label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          className={input}
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">⚠ {error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-11 w-full rounded-lg border border-gray-800 bg-gray-200 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Already registered?{' '}
        <Link to="/login" className="inline-flex min-h-11 items-center px-1 font-medium underline">Log in</Link>
      </p>
    </main>
  )
}
