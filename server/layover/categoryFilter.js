const C = require('./constants')
const { LayoverError } = require('./errors')

// FR3.1: at least one valid category is required; more than one is allowed.
function normalizeCategories(input) {
  const list = Array.isArray(input) ? input : []
  const cleaned = [...new Set(list.map((c) => String(c).trim().toLowerCase()))]
  if (cleaned.length === 0) {
    throw new LayoverError('NO_CATEGORY', 'Choose at least one interest category.')
  }
  const bad = cleaned.filter((c) => !C.CATEGORIES.includes(c))
  if (bad.length) {
    throw new LayoverError('INVALID_CATEGORY', `Unknown category: ${bad.join(', ')}.`)
  }
  return cleaned
}

// Keep activities in the chosen categories. When the layover is airside-only
// (FR2.4) also keep only airside activities; in the caution state nothing is offered.
function filterActivities(activities, categories, state) {
  if (state === C.LAYOVER_STATES.CAUTION) return []
  let result = activities.filter((a) => categories.includes(a.category))
  if (state === C.LAYOVER_STATES.AIRSIDE_ONLY) result = result.filter((a) => a.zone === 'airside')
  return result
}

module.exports = { normalizeCategories, filterActivities }
