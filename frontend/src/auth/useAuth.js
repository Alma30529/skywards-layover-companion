import { useContext } from 'react'
import { AuthContext } from './AuthContext'

// const { user, loading, login, register, logout } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
