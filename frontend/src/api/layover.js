const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options) {
  try {
    const res = await fetch(`${BASE}${path}`, options)
    const data = await res.json().catch(() => ({}))
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
export const calculateConnection = (selection) => post('/layover/calculate', selection)
export const getMatchingActivities = (selection) => post('/layover/activities', selection)
