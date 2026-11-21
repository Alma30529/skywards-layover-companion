const express = require('express')
const pool = require('../db')
const { requireAuth, requireRole } = require('../middleware/auth')
const { LayoverError } = require('../layover/errors')
const { normalizeCategories, filterActivities } = require('../layover/categoryFilter')
const service = require('../layover/connectionService')

const router = express.Router()

// NFR11: every route checks the role. Layover planning is passenger-only.
router.use(requireAuth, requireRole('passenger'))

const handle = (fn) => async (req, res) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    if (err instanceof LayoverError) {
      return res.status(err.status).json({ error: err.message, code: err.code })
    }
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
}

// GET /layover/flights -> { inbound: [...], outbound: [...] }
router.get('/flights', handle(() => service.listFlights(pool)))

// POST /layover/pnr  { pnr }
// -> the connection for that booking reference: inbound, outbound, cabin and the layover result.
// POST (not GET) so the booking reference stays out of URLs and server logs.
router.post('/pnr', handle((req) => service.resolveByPnr(pool, (req.body || {}).pnr)))

// POST /layover/calculate  { inboundFlightId, outboundFlightId, cabinClass }
// -> layover, usable time, state (full | airside_only | caution), message, backAtGate
router.post('/calculate', handle((req) => service.resolveConnection(pool, req.body || {})))

// POST /layover/activities  { inboundFlightId, outboundFlightId, cabinClass, categories: [...] }
// -> the connection result plus the activities that match the categories and the layover state
router.post('/activities', handle(async (req) => {
  const body = req.body || {}
  const connection = await service.resolveConnection(pool, body)
  const categories = normalizeCategories(body.categories)
  const all = await service.listActivities(pool)
  const activities = filterActivities(all, categories, connection.state)
  return { connection, categories, activities, noMatch: connection.bookable && activities.length === 0 }
}))

module.exports = router
