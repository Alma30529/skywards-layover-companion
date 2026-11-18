const { test } = require('node:test')
const assert = require('node:assert/strict')
const { normalizeCategories, filterActivities } = require('../layover/categoryFilter')
const { LayoverError } = require('../layover/errors')

const acts = [
  { id: 1, category: 'culture', zone: 'landside' },
  { id: 2, category: 'culture', zone: 'airside' },
  { id: 3, category: 'food', zone: 'landside' },
  { id: 4, category: 'food', zone: 'airside' },
  { id: 5, category: 'shopping', zone: 'airside' },
  { id: 6, category: 'relaxation', zone: 'landside' },
]
const ids = (l) => l.map((a) => a.id)

test('normalize: at least one category required', () => {
  for (const bad of [[], undefined, null, 'food']) {
    assert.throws(() => normalizeCategories(bad), (e) => e instanceof LayoverError && e.code === 'NO_CATEGORY')
  }
})
test('normalize: unknown category rejected', () => {
  assert.throws(() => normalizeCategories(['food', 'nightlife']), (e) => e.code === 'INVALID_CATEGORY')
})
test('normalize: trims, lowercases, de-duplicates', () => {
  assert.deepEqual(normalizeCategories([' Food ', 'food', 'CULTURE']), ['food', 'culture'])
})
test('full: one category', () => {
  assert.deepEqual(ids(filterActivities(acts, ['food'], 'full')), [3, 4])
})
test('full: several categories at once', () => {
  assert.deepEqual(ids(filterActivities(acts, ['food', 'relaxation'], 'full')), [3, 4, 6])
})
test('airside_only: drops landside activities', () => {
  assert.deepEqual(ids(filterActivities(acts, ['culture', 'food', 'shopping', 'relaxation'], 'airside_only')), [2, 4, 5])
})
test('caution: nothing is offered', () => {
  assert.deepEqual(filterActivities(acts, ['food'], 'caution'), [])
})
test('no match returns an empty list', () => {
  assert.deepEqual(filterActivities(acts, ['relaxation'], 'airside_only'), [])
})
