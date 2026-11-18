const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../db')
const { signToken } = require('../lib/token')
const { normalizeSkywards } = require('../lib/skywards')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

if (!process.env.JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is missing from server/.env. Login and register will fail until it is set.')
}

const MIN_PASSWORD = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const cleanEmail = (v) => String(v || '').trim().toLowerCase()

// Compared against when the email is unknown, so "no such user" takes as long as "wrong password"
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10)

const USER_SELECT = `
  SELECT u.id, u.name, u.email, u.role, u.skywards_number, u.password_hash,
         s.tier, s.points_balance
    FROM users u
    LEFT JOIN skywards_records s ON s.skywards_number = u.skywards_number`

// Never send the hash to the browser.
const publicUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  skywardsNumber: r.skywards_number,
  tier: r.tier ?? null,
  pointsBalance: r.points_balance ?? null,
})

const tokenFor = (r) => signToken({ sub: r.id, role: r.role }, process.env.JWT_SECRET)

// POST /auth/register  { name, email, password, skywardsNumber }
// Always creates a passenger. A role sent by the client is ignored.
router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = cleanEmail(req.body.email)
  const password = String(req.body.password || '')
  const skywardsNumber = normalizeSkywards(req.body.skywardsNumber)

  if (!name) return res.status(400).json({ error: 'name_required', message: 'Name is required.' })
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'email_invalid', message: 'Enter a valid email address.' })
  }
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ error: 'weak', message: `Password must be at least ${MIN_PASSWORD} characters.` })
  }
  if (!skywardsNumber) {
    return res.status(400).json({ error: 'skywards_invalid', message: 'Enter a valid Skywards number, e.g. EK 0000 0001.' })
  }

  try {
    const record = await pool.query(
      'SELECT skywards_number FROM skywards_records WHERE skywards_number = $1', [skywardsNumber])
    if (!record.rows.length) {
      return res.status(400).json({ error: 'skywards_unknown', message: 'We could not find that Skywards number.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const ins = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, skywards_number)
       VALUES ($1, $2, $3, 'passenger', $4) RETURNING id`,
      [name, email, passwordHash, skywardsNumber])

    // FR1.1: the output is a created account plus a confirmation. The passenger then logs in (FR1.2).
    const { rows } = await pool.query(`${USER_SELECT} WHERE u.id = $1`, [ins.rows[0].id])
    res.status(201).json({ message: 'Account created. Please log in.', user: publicUser(rows[0]) })
  } catch (err) {
    // 23505 = unique violation; the constraint name tells us which field clashed
    if (err.code === '23505') {
      if (String(err.constraint).includes('skywards')) {
        return res.status(409).json({ error: 'skywards_taken', message: 'That Skywards number is already registered.' })
      }
      return res.status(409).json({ error: 'email_taken', message: 'An account with that email already exists.' })
    }
    console.error(err)
    res.status(500).json({ error: 'server', message: 'Something went wrong. Try again.' })
  }
})

// POST /auth/login  { email, password }
router.post('/login', async (req, res) => {
  const email = cleanEmail(req.body.email)
  const password = String(req.body.password || '')
  if (!email || !password) {
    return res.status(400).json({ error: 'missing', message: 'Enter your email and password.' })
  }

  try {
    const { rows } = await pool.query(`${USER_SELECT} WHERE lower(u.email) = $1`, [email])
    const user = rows[0]
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH)

    // one message for both cases so the response does not reveal which emails exist
    if (!user || !ok) {
      return res.status(401).json({ error: 'invalid_credentials', message: 'Incorrect email or password.' })
    }
    res.json({ token: tokenFor(user), user: publicUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server', message: 'Something went wrong. Try again.' })
  }
})

// GET /auth/me   Authorization: Bearer <token>
// The frontend calls this on page load. The role is read from the database,
// not trusted from the token, so a changed role takes effect straight away.
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`${USER_SELECT} WHERE u.id = $1`, [req.user.id])
    if (!rows.length) {
      return res.status(401).json({ error: 'unauthorized', message: 'Please log in again.' })
    }
    res.json({ user: publicUser(rows[0]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server', message: 'Something went wrong. Try again.' })
  }
})

module.exports = router
