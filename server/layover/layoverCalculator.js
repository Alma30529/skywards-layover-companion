const C = require('./constants')
const { LayoverError } = require('./errors')

const MS_PER_MIN = 60000

// Flight times are stored as Dubai local time and sent as text like "2026-12-01 13:45".
// They are read exactly as written (as UTC) so the server's time zone can never change them.
function parseFlightTime(value, field = 'time') {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new LayoverError('INVALID_TIME', `${field} is not a valid date/time`)
    return value
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(value ?? ''))
  if (!m) throw new LayoverError('INVALID_TIME', `${field} is missing or not a valid date/time`)
  const [, y, mo, d, h, mi] = m.map(Number)
  const date = new Date(Date.UTC(y, mo - 1, d, h, mi))
  if (Number.isNaN(date.getTime())) throw new LayoverError('INVALID_TIME', `${field} is not a valid date/time`)
  return date
}

// FR2.2: whole minutes between inbound arrival and outbound departure.
function calculateLayoverMinutes(arrivalTime, departureTime) {
  const arr = parseFlightTime(arrivalTime, 'arrivalTime')
  const dep = parseFlightTime(departureTime, 'departureTime')
  const mins = Math.floor((dep - arr) / MS_PER_MIN)
  if (mins <= 0) {
    throw new LayoverError('DEPARTURE_BEFORE_ARRIVAL', 'The outbound flight must depart after the inbound flight arrives.')
  }
  return mins
}

// FR2.3: layover - 45 - 90, never negative.
function calculateUsableMinutes(layoverMinutes) {
  return Math.max(0, layoverMinutes - C.ARRIVAL_BUFFER_MIN - C.DEPARTURE_BUFFER_MIN)
}

// FR2.4: usable minutes -> state.
function getLayoverState(usableMinutes) {
  if (usableMinutes >= C.FULL_ACCESS_MIN) return C.LAYOVER_STATES.FULL
  if (usableMinutes >= C.AIRSIDE_ONLY_MIN) return C.LAYOVER_STATES.AIRSIDE_ONLY
  return C.LAYOVER_STATES.CAUTION
}

// 320 -> "5h 20m", 120 -> "2h", 45 -> "45m", 0 -> "0m"
function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatClock(date) {
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const MESSAGES = {
  [C.LAYOVER_STATES.FULL]: (u) => `You have ${formatDuration(u)} free.`,
  [C.LAYOVER_STATES.AIRSIDE_ONLY]: (u) =>
    `You have ${formatDuration(u)} free. That is too short to leave the airport, so only airside and lounge options are shown.`,
  [C.LAYOVER_STATES.CAUTION]: () =>
    'Your layover is too short for any activity. Stay near your gate so you do not miss your connection.',
}

// Full result for one connection. Pure function: no database, no clock.
function calculateConnection({ arrivalTime, departureTime }) {
  const layoverMinutes = calculateLayoverMinutes(arrivalTime, departureTime)
  const usableMinutes = calculateUsableMinutes(layoverMinutes)
  const state = getLayoverState(usableMinutes)
  const departure = parseFlightTime(departureTime, 'departureTime')
  const backAtGate = new Date(departure.getTime() - C.DEPARTURE_BUFFER_MIN * MS_PER_MIN)

  return {
    layoverMinutes,
    usableMinutes,
    layoverText: formatDuration(layoverMinutes),
    usableText: formatDuration(usableMinutes),
    state,
    bookable: state !== C.LAYOVER_STATES.CAUTION,
    airsideOnly: state === C.LAYOVER_STATES.AIRSIDE_ONLY,
    message: MESSAGES[state](usableMinutes),
    backAtGate: formatClock(backAtGate),
  }
}

module.exports = {
  parseFlightTime,
  calculateLayoverMinutes,
  calculateUsableMinutes,
  getLayoverState,
  formatDuration,
  calculateConnection,
}
