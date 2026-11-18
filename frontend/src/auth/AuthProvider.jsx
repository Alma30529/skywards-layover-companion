import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  clearToken,
  fetchMe,
  getToken,
  loginUser,
  registerUser,
  setToken,
} from '../api/auth'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only "loading" if there is a saved token to check with the server
  const [loading, setLoading] = useState(() => !!getToken())

  // On page load, restore the session from the saved token
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    fetchMe().then((r) => {
      if (cancelled) return
      if (r.ok) setUser(r.data.user)
      else if (r.status === 401) clearToken() // expired or invalid token
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // login and register return the raw API result so the page can show errors
  async function login(email, password) {
    const r = await loginUser(email, password)
    if (r.ok) {
      setToken(r.data.token)
      setUser(r.data.user)
    }
    return r
  }

  // Registration only creates the account; the passenger then logs in (FR1.1, FR1.2)
  const register = (fields) => registerUser(fields)

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
