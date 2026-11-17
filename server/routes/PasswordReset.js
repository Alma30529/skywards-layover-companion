const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const pool = require('../db') // shared pg Pool; see section 5

const router = express.Router()

const OTP_TTL_MIN = 30
const MAX_ATTEMPTS = 5
const MIN_PASSWORD = 8
const SECRET = process.env.OTP_SECRET // in .env, never committed
const GENERIC = 'If that email is registered, a code has been generated.'

const hmac = (v) => crypto.createHmac('sha256', SECRET).update(v).digest('hex')
const generateOtp = () => crypto.randomInt(0, 1000000).toString().padStart(6, '0')
const cleanEmail = (v) => String(v || '').trim().toLowerCase()

function safeEqual(a, b) {
  const x = Buffer.from(a, 'hex')
  const y = Buffer.from(b, 'hex')
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

// POST /auth/forgot-password  { email }
router.post('/forgot-password', async (req, res) => {
  const email = cleanEmail(req.body.email)
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const otp = generateOtp() // generated every time so the response looks identical
  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE lower(email) = $1', [email])

    if (rows.length) {
      const userId = rows[0].id
      // a new code kills any older unused one
      await pool.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
        [userId])
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + make_interval(mins => $3::int))`,
        [userId, hmac(otp), OTP_TTL_MIN])
      console.log(`[DEMO ONLY] OTP for ${email}: ${otp}`)
    }

    const body = { message: GENERIC }
    // demo mode shows a code whether or not the account exists
    if (process.env.DEMO_MODE === 'true') body.demoCode = otp
    res.json(body)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
})

// POST /auth/verify-otp  { email, code }
router.post('/verify-otp', async (req, res) => {
  const email = cleanEmail(req.body.email)
  const code = String(req.body.code || '').trim()
  if (!email || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'invalid', message: 'Enter the 6-digit code.' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.token_hash, (t.expires_at <= NOW()) AS expired
         FROM password_reset_tokens t
         JOIN users u ON u.id = t.user_id
        WHERE lower(u.email) = $1 AND t.used_at IS NULL AND t.verified_at IS NULL
        ORDER BY t.id DESC LIMIT 1`, [email])

    // no active code: same answer as a wrong code, so nothing is revealed
    if (!rows.length) {
      return res.status(400).json({ error: 'incorrect', attemptsLeft: MAX_ATTEMPTS - 1 })
    }
    const row = rows[0]
    if (row.expired) {
      return res.status(400).json({ error: 'expired', message: 'This code has expired.' })
    }

    const upd = await pool.query(
      'UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts',
      [row.id])
    const attempts = upd.rows[0].attempts
    if (attempts > MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'locked', message: 'Too many attempts. Request a new code.' })
    }

    if (!safeEqual(hmac(code), row.token_hash)) {
      return res.status(400).json({ error: 'incorrect', attemptsLeft: MAX_ATTEMPTS - attempts })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    await pool.query(
      'UPDATE password_reset_tokens SET verified_at = NOW(), reset_token_hash = $1 WHERE id = $2',
      [hmac(resetToken), row.id])
    res.json({ resetToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  }
})

// POST /auth/reset-password  { resetToken, newPassword }
router.post('/reset-password', async (req, res) => {
  const resetToken = String(req.body.resetToken || '')
  const newPassword = String(req.body.newPassword || '')
  if (newPassword.length < MIN_PASSWORD) {
    return res.status(400).json({ error: 'weak', message: `Password must be at least ${MIN_PASSWORD} characters.` })
  }

  const client = await pool.connect()
  try {
    const { rows } = await client.query(
      `SELECT id, user_id FROM password_reset_tokens
        WHERE reset_token_hash = $1 AND verified_at IS NOT NULL
          AND used_at IS NULL AND expires_at > NOW()`, [hmac(resetToken)])
    if (!rows.length) {
      return res.status(400).json({ error: 'expired_or_used', message: 'This code has expired or was already used.' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await client.query('BEGIN')
    await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, rows[0].user_id])
    await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [rows[0].id])
    await client.query('COMMIT')
    res.json({ message: 'Password updated.' })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error(err)
    res.status(500).json({ error: 'Something went wrong. Try again.' })
  } finally {
    client.release()
  }
})

module.exports = router