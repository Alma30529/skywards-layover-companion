// Skywards numbers are stored as 'EK 0000 0001'. Accept 'ek00000001',
// 'EK 0000 0001', 'EK-0000-0001' etc. and return the stored format, or null if invalid.
function normalizeSkywards(value) {
  const compact = String(value || '').replace(/[\s-]/g, '').toUpperCase()
  const m = /^EK(\d{4})(\d{4})$/.exec(compact)
  return m ? `EK ${m[1]} ${m[2]}` : null
}

module.exports = { normalizeSkywards }
