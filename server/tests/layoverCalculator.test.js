const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  parseFlightTime, calculateLayoverMinutes, calculateUsableMinutes,
  getLayoverState, formatDuration, calculateConnection,
} = require('../layover/layoverCalculator')
const { LayoverError } = require('../layover/errors')

// --- FR2.2 layover duration
test('layover: 06:10 -> 11:30 is 5h 20m (320 min)', () => {
  assert.equal(calculateLayoverMinutes('2026-12-01 06:10', '2026-12-01 11:30'), 320)
})
test('layover: crossing midnight', () => {
  assert.equal(calculateLayoverMinutes('2026-12-01 22:00', '2026-12-02 01:30'), 210)
})
test('layover: departure before arrival throws', () => {
  assert.throws(() => calculateLayoverMinutes('2026-12-01 12:00', '2026-12-01 10:00'),
    (e) => e instanceof LayoverError && e.code === 'DEPARTURE_BEFORE_ARRIVAL')
})
test('layover: same time throws', () => {
  assert.throws(() => calculateLayoverMinutes('2026-12-01 12:00', '2026-12-01 12:00'), LayoverError)
})
test('layover: missing or invalid time throws INVALID_TIME', () => {
  for (const bad of [null, undefined, '', 'tomorrow', '2026-13-45']) {
    assert.throws(() => calculateLayoverMinutes(bad, '2026-12-01 12:00'),
      (e) => e instanceof LayoverError && e.code === 'INVALID_TIME', String(bad))
  }
})
test('parseFlightTime is not shifted by the server time zone', () => {
  const d = parseFlightTime('2026-12-01 13:45')
  assert.equal(d.getUTCHours(), 13)
  assert.equal(d.getUTCMinutes(), 45)
})

// --- FR2.3 usable time
test('usable: 320 - 45 - 90 = 185', () => assert.equal(calculateUsableMinutes(320), 185))
test('usable: exactly 135 min layover gives 0', () => assert.equal(calculateUsableMinutes(135), 0))
test('usable: never negative', () => {
  assert.equal(calculateUsableMinutes(60), 0)
  assert.equal(calculateUsableMinutes(1), 0)
})

// --- FR2.4 thresholds (boundaries)
test('state boundaries', () => {
  assert.equal(getLayoverState(0), 'caution')
  assert.equal(getLayoverState(59), 'caution')
  assert.equal(getLayoverState(60), 'airside_only')
  assert.equal(getLayoverState(119), 'airside_only')
  assert.equal(getLayoverState(120), 'full')
  assert.equal(getLayoverState(600), 'full')
})

// --- formatting
test('formatDuration', () => {
  assert.equal(formatDuration(320), '5h 20m')
  assert.equal(formatDuration(120), '2h')
  assert.equal(formatDuration(45), '45m')
  assert.equal(formatDuration(0), '0m')
  assert.equal(formatDuration(-10), '0m')
})

// --- whole pipeline with the seeded flights
test('EK203 -> EK150: 5h 20m layover, 3h 5m usable, full access', () => {
  const r = calculateConnection({ arrivalTime: '2026-12-01 06:10', departureTime: '2026-12-01 11:30' })
  assert.equal(r.layoverMinutes, 320)
  assert.equal(r.usableMinutes, 185)
  assert.equal(r.usableText, '3h 5m')
  assert.equal(r.state, 'full')
  assert.equal(r.bookable, true)
  assert.equal(r.backAtGate, '10:00')
  assert.match(r.message, /You have 3h 5m free/)
})
test('EK501 -> EK070: 135 min layover is caution', () => {
  // 08:00 -> 10:15 = 135 min layover => 0 usable (caution)
  const r = calculateConnection({ arrivalTime: '2026-12-01 08:00', departureTime: '2026-12-01 10:15' })
  assert.equal(r.usableMinutes, 0)
  assert.equal(r.state, 'caution')
  assert.equal(r.bookable, false)
})
test('airside-only: 195 min layover => 60 usable', () => {
  const r = calculateConnection({ arrivalTime: '2026-12-01 09:00', departureTime: '2026-12-01 12:15' })
  assert.equal(r.usableMinutes, 60)
  assert.equal(r.state, 'airside_only')
  assert.equal(r.airsideOnly, true)
  assert.equal(r.bookable, true)
})
test('caution message never shows a negative duration', () => {
  const r = calculateConnection({ arrivalTime: '2026-12-01 11:00', departureTime: '2026-12-01 11:30' })
  assert.equal(r.usableMinutes, 0)
  assert.equal(r.usableText, '0m')
  assert.doesNotMatch(r.message, /-/)
})
