// A PNR (booking reference) is 6 letters or digits, e.g. K7P2QX.
// We ignore spaces and letter case so "k7p2 qx" works.
const PNR_PATTERN = /^[A-Z0-9]{6}$/

function normalizePnr(value) {
  return String(value ?? '').replace(/\s+/g, '').toUpperCase()
}

function isValidPnr(pnr) {
  return PNR_PATTERN.test(pnr)
}

module.exports = { normalizePnr, isValidPnr }
