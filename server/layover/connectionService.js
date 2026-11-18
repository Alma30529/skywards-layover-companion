const C = require('./constants')
const { LayoverError } = require('./errors')
const { calculateConnection } = require('./layoverCalculator')

// to_char keeps the Dubai local time as plain text, so node-postgres never shifts it by time zone
const FLIGHT_COLS = `id, flight_no, direction, other_airport,
  to_char(scheduled_time, 'YYYY-MM-DD HH24:MI') AS scheduled_time`

async function listFlights(pool) {
  const { rows } = await pool.query(`SELECT ${FLIGHT_COLS} FROM flights ORDER BY scheduled_time`)
  return {
    inbound: rows.filter((f) => f.direction === 'inbound'),
    outbound: rows.filter((f) => f.direction === 'outbound'),
  }
}

async function getFlight(pool, id, direction) {
  const n = Number(id)
  if (!Number.isInteger(n) || n <= 0) {
    throw new LayoverError('INVALID_FLIGHT', `Select an ${direction} flight.`)
  }
  const { rows } = await pool.query(`SELECT ${FLIGHT_COLS} FROM flights WHERE id = $1`, [n])
  if (!rows.length || rows[0].direction !== direction) {
    throw new LayoverError('INVALID_FLIGHT', `Select a valid ${direction} flight.`, 404)
  }
  return rows[0]
}

// FR2.1 + FR2.2 + FR2.3 + FR2.4 for one selection.
async function resolveConnection(pool, { inboundFlightId, outboundFlightId, cabinClass }) {
  if (!C.CABIN_CLASSES.includes(cabinClass)) {
    throw new LayoverError('INVALID_CABIN', 'Choose Economy, Business or First.')
  }
  const inbound = await getFlight(pool, inboundFlightId, 'inbound')
  const outbound = await getFlight(pool, outboundFlightId, 'outbound')
  const result = calculateConnection({
    arrivalTime: inbound.scheduled_time,
    departureTime: outbound.scheduled_time,
  })
  return { inbound, outbound, cabinClass, ...result }
}

async function listActivities(pool) {
  const { rows } = await pool.query(
    `SELECT id, name, description, category, price_aed, duration_min, travel_min_one_way,
            zone, is_premium, latitude::float AS latitude, longitude::float AS longitude
     FROM activities ORDER BY id`)
  return rows
}

module.exports = { listFlights, getFlight, resolveConnection, listActivities }
