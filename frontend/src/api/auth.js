const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'skywards_token'

export const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."

// Token storage. localStorage can throw (private windows, blocked storage), so never let it crash the app.
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

// Other teammates can reuse this for their own authenticated calls:
//   import { request } from './auth'
//   request('GET', '/bookings')
export async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'network' } }
  }
}

export const registerUser = (fields) => request('POST', '/auth/register', fields)
export const loginUser = (email, password) => request('POST', '/auth/login', { email, password })
export const fetchMe = () => request('GET', '/auth/me')
