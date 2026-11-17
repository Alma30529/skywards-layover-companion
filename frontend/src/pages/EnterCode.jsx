import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { requestCode, verifyCode, NETWORK_MESSAGE } from '../api/passwordReset'

const RESEND_SECONDS = 30
const EMPTY = ['', '', '', '', '', '']

export default function EnterCode() {
  const { state } = useLocation()
  if (!state?.email) return <Navigate to="/forgot-password" replace />
  return <EnterCodeForm email={state.email} initialDemoCode={state.demoCode ?? null} />
}

function EnterCodeForm({ email, initialDemoCode }) {
  const navigate = useNavigate()
  const [digits, setDigits] = useState(EMPTY)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const [loading, setLoading] = useState(false)
  const [demoCode, setDemoCode] = useState(initialDemoCode)
  const inputs = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  function handleChange(i, value) {
    const d = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) inputs.current[i + 1].focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1].focus()
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = [...EMPTY]
    text.split('').forEach((ch, i) => (next[i] = ch))
    setDigits(next)
    inputs.current[Math.min(text.length, 5)].focus()
  }

  function clearBoxes() {
    setDigits(EMPTY)
    inputs.current[0]?.focus()
  }

  async function handleVerify(e) {
    e.preventDefault()
    setNotice('')
    const code = digits.join('')
    if (code.length < 6) {
      setError('Enter all 6 digits.')
      return
    }
    setError('')
    setLoading(true)
    const r = await verifyCode(email, code)
    setLoading(false)

    if (r.ok) {
      navigate('/reset-password', { state: { resetToken: r.data.resetToken } })
      return
    }
    if (r.status === 0) {
      setError(NETWORK_MESSAGE)
      return
    }

    const kind = r.data.error
    if (kind === 'incorrect') {
      const left = r.data.attemptsLeft
      if (left <= 0) {
        setLocked(true)
        setError('Too many attempts. Request a new code.')
      } else {
        setError(`Incorrect code. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`)
      }
      clearBoxes()
    } else if (kind === 'locked') {
      setLocked(true)
      setError(r.data.message || 'Too many attempts. Request a new code.')
    } else if (kind === 'expired') {
      setError('This code has expired. Request a new code.')
      setCooldown(0) // allow an immediate resend
      clearBoxes()
    } else {
      setError(r.data.message || 'Something went wrong. Try again.')
    }
  }

  async function handleResend() {
    setError('')
    setNotice('')
    setLoading(true)
    const r = await requestCode(email)
    setLoading(false)
    if (!r.ok) {
      setError(r.status === 0 ? NETWORK_MESSAGE : r.data.error || 'Something went wrong. Try again.')
      return
    }
    setDemoCode(r.data.demoCode ?? null)
    setLocked(false)
    setDigits(EMPTY)
    setNotice('A new code has been generated. The old code no longer works.')
    setCooldown(RESEND_SECONDS)
    inputs.current[0]?.focus()
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white p-6">
      <Link to="/forgot-password" aria-label="Back" className="text-2xl">‹</Link>
      <h1 className="mt-2 text-2xl font-bold">Enter code</h1>
      <p className="mt-2 text-gray-600">We generated a 6-digit code for your email.</p>

      <form onSubmit={handleVerify} className="mt-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              autoFocus={i === 0}
              value={d}
              disabled={locked}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-12 w-11 rounded-lg border border-gray-400 text-center text-xl disabled:bg-gray-100"
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">⚠ {error}</p>
        )}
        {notice && <p className="mt-3 text-sm text-gray-700">{notice}</p>}

        <button
          type="submit"
          disabled={locked || loading}
          className="mt-4 h-11 w-full rounded-lg border border-gray-800 bg-gray-200 font-medium disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || loading}
        className="mt-4 h-11 w-full rounded-lg border border-gray-800 font-medium disabled:opacity-50"
      >
        Resend code
      </button>
      <p className="mt-1 text-center text-sm text-gray-600">
        {cooldown > 0 ? `Available in ${cooldown} seconds` : 'You can request a new code.'}
      </p>

      {demoCode && (
        <div className="mt-6 rounded-lg border border-gray-400 bg-gray-100 p-3 text-sm text-gray-600">
          DEMO ONLY: the code is <strong>{demoCode}</strong>. Single-use, expires in 30 minutes.
        </div>
      )}
    </main>
  )
}