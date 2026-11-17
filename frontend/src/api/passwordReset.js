const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function post(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'network' } }
  }
}

export const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."

export const requestCode = (email) => post('/auth/forgot-password', { email })
export const verifyCode = (email, code) => post('/auth/verify-otp', { email, code })
export const resetPassword = (resetToken, newPassword) =>
  post('/auth/reset-password', { resetToken, newPassword })