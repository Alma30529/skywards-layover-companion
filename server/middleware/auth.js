const { verifyToken } = require('../lib/token')

// Use on any route that needs a logged-in user:  router.get('/x', requireAuth, handler)
// Sets req.user = { id, role } from the signed token.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const payload = verifyToken(token, process.env.JWT_SECRET)
  if (!payload) {
    return res.status(401).json({ error: 'unauthorized', message: 'Please log in again.' })
  }
  req.user = { id: payload.sub, role: payload.role }
  next()
}

// Use after requireAuth:  router.get('/x', requireAuth, requireRole('admin'), handler)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden', message: 'You do not have access to this.' })
    }
    next()
  }
}

module.exports = { requireAuth, requireRole }
