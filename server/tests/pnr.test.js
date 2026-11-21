const { test } = require('node:test')
const assert = require('node:assert/strict')
const { normalizePnr, isValidPnr } = require('../layover/pnr')
const { resolveByPnr } = require('../layover/connectionService')
const { LayoverError } = require('../layover/errors')

// --- FR2.1 PNR format
test('normalizePnr: trims, removes spaces and upper-cases', () => {
  assert.equal(normalizePnr('  k7p2 qx '), 'K7P2QX')
  assert.equal(normalizePnr('K7P2QX'), 'K7P2QX')
})
test('normalizePnr: missing values become an empty string', () => {
  for (const v of [undefined, null, '']) assert.equal(normalizePnr(v), '')
})
test('isValidPnr: exactly 6 letters or digits', () => {
  for (const ok of ['K7P2QX', 'ABCDEF', '123456']) assert.equal(isValidPnr(ok), true, ok)
})
test('isValidPnr: rejects wrong length and symbols', () => {
  for (const bad of ['', 'ABC', 'K7P2QXX', 'K7P2Q!', 'K7P2-X']) assert.equal(isValidPnr(bad), false, bad)
})

// --- lookup behaviour (fake pool, no database needed)
const fakePool = (rows) => ({ query: async () => ({ rows }) })

test('resolveByPnr: bad format throws INVALID_PNR before touching the database', async () => {
  let called = false
  const pool = { query: async () => { called = true; return { rows: [] } } }
  await assert.rejects(resolveByPnr(pool, 'ABC'),
    (e) => e instanceof LayoverError && e.code === 'INVALID_PNR' && e.status === 400)
  assert.equal(called, false)
})
test('resolveByPnr: unknown PNR throws PNR_NOT_FOUND (404)', async () => {
  await assert.rejects(resolveByPnr(fakePool([]), 'AAAAAA'),
    (e) => e instanceof LayoverError && e.code === 'PNR_NOT_FOUND' && e.status === 404)
})
test('resolveByPnr: a known PNR returns the connection, cabin and layover result', async () => {
  const flights = {
    1: { id: 1, flight_no: 'EK203', direction: 'inbound', other_airport: 'London Heathrow (LHR)', scheduled_time: '2026-12-01 06:10' },
    4: { id: 4, flight_no: 'EK150', direction: 'outbound', other_airport: 'Colombo (CMB)', scheduled_time: '2026-12-01 11:30' },
  }
  const pool = {
    query: async (sql, params) => sql.includes('pnr_bookings')
      ? { rows: [{ pnr: 'K7P2QX', inbound_flight_id: 1, outbound_flight_id: 4, cabin_class: 'Economy' }] }
      : { rows: [flights[params[0]]] },
  }
  const r = await resolveByPnr(pool, ' k7p2qx ')
  assert.equal(r.pnr, 'K7P2QX')
  assert.equal(r.cabinClass, 'Economy')
  assert.equal(r.inbound.flight_no, 'EK203')
  assert.equal(r.outbound.flight_no, 'EK150')
  assert.equal(r.state, 'full')
})
