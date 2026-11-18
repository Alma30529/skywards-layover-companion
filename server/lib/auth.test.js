const { test } = require('node:test')
const assert = require('node:assert')
const { signToken, verifyToken } = require('./token')
const { normalizeSkywards } = require('./skywards')

const SECRET = 'test-secret'

test('a signed token verifies and carries its payload', () => {
  const t = signToken({ sub: 7, role: 'admin' }, SECRET)
  const p = verifyToken(t, SECRET)
  assert.strictEqual(p.sub, 7)
  assert.strictEqual(p.role, 'admin')
})

test('a token signed with another secret is rejected', () => {
  const t = signToken({ sub: 1, role: 'passenger' }, SECRET)
  assert.strictEqual(verifyToken(t, 'other-secret'), null)
})

test('a tampered payload is rejected', () => {
  const [h, , s] = signToken({ sub: 1, role: 'passenger' }, SECRET).split('.')
  const forged = Buffer.from(JSON.stringify({ sub: 1, role: 'admin', exp: 9999999999 })).toString('base64url')
  assert.strictEqual(verifyToken(`${h}.${forged}.${s}`, SECRET), null)
})

test('an expired token is rejected', () => {
  const t = signToken({ sub: 1, role: 'passenger' }, SECRET, -10)
  assert.strictEqual(verifyToken(t, SECRET), null)
})

test('garbage input is rejected', () => {
  assert.strictEqual(verifyToken('not-a-token', SECRET), null)
  assert.strictEqual(verifyToken(undefined, SECRET), null)
  assert.strictEqual(verifyToken('a.b.c', SECRET), null)
})

test('skywards numbers normalise to the stored format', () => {
  assert.strictEqual(normalizeSkywards('EK 0000 0001'), 'EK 0000 0001')
  assert.strictEqual(normalizeSkywards('ek00000001'), 'EK 0000 0001')
  assert.strictEqual(normalizeSkywards('EK-0000-0010'), 'EK 0000 0010')
  assert.strictEqual(normalizeSkywards('EK 123'), null)
  assert.strictEqual(normalizeSkywards(''), null)
  assert.strictEqual(normalizeSkywards(undefined), null)
})
