// Where each role lands after login. Change a path here and the whole app follows.
export const ROLE_HOME = {
  passenger: '/passenger',
  admin: '/admin',
}

export const homeFor = (role) => ROLE_HOME[role] ?? '/login'
