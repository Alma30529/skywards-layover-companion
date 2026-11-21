import { getToken } from './auth'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers })
    const data = await res.json().catch(() => ({}))
    if (!res.ok && data.message) data.error = data.message // e.g. "Please log in again."
    return { ok: res.ok, status: res.status, data }
  } catch {
    return { ok: false, status: 0, data: { error: 'network' } }
  }
}

const post = (path, body) =>
  request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

export const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."

export const getFlights = () => request('/layover/flights')
// FR2.1: one booking reference (PNR) gives the inbound flight, outbound flight and cabin class
export const lookupPnr = (pnr) => post('/layover/pnr', { pnr })
export const calculateConnection = (selection) => post('/layover/calculate', selection)
export const getMatchingActivities = (selection) => post('/layover/activities', selection)
