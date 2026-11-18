// NFR3: keep the passenger's choices on the device so a dropped connection or a
// refresh does not make them start again. Storage can be blocked, so every call is guarded.
const KEY = 'skywards.layover.v1'

export function loadLayover() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export function saveLayover(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable: the screen still works, it just will not be remembered */
  }
}

export function clearLayover() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
