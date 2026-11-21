// Keeps the Skywards number field in the shape "EK 0000 0001" while the user types.
// Only digits are accepted; the "EK " prefix and the spaces are added automatically.
// Pasting "ek00000001", "EK-0000-0001" or "EK 0000 0001" all end up as "EK 0000 0001".
export const SKYWARDS_PATTERN = 'EK \\d{4} \\d{4}'
export const SKYWARDS_HINT = 'Enter your Skywards number as EK 0000 0001'

export function formatSkywards(value) {
  const digits = String(value ?? '')
    .toUpperCase()
    .replace(/^\s*EK/, '') // a typed or pasted "EK" is dropped, then added back below
    .replace(/\D/g, '') // everything that is not a digit is ignored
    .slice(0, 8)

  if (!digits) return ''
  if (digits.length <= 4) return `EK ${digits}`
  return `EK ${digits.slice(0, 4)} ${digits.slice(4)}`
}
