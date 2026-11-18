// Minimal signed session token (HS256 JWT format) using only Node's crypto,
// so no extra npm package is needed. Secret lives in .env as JWT_SECRET.
const crypto = require('crypto')

const TTL_SECONDS = 8 * 60 * 60 // 8 hours

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const sign = (data, secret) =>
  crypto.createHmac('sha256', secret).update(data).digest('base64url')

function signToken(payload, secret, ttl = TTL_SECONDS) {
  if (!secret) throw new Error('JWT_SECRET is not set')
  const now = Math.floor(Date.now() / 1000)
  const head = b64({ alg: 'HS256', typ: 'JWT' })
  const body = b64({ ...payload, iat: now, exp: now + ttl })
  return `${head}.${body}.${sign(`${head}.${body}`, secret)}`
}

// Returns the payload, or null if the token is malformed, tampered with or expired.
function verifyToken(token, secret) {
  if (!secret || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [head, body, sig] = parts

  const expected = Buffer.from(sign(`${head}.${body}`, secret))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

module.exports = { signToken, verifyToken, TTL_SECONDS }
