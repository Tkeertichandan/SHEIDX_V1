import { useCallback, useMemo, useState } from 'react'
import { api } from '../services/api'
import { clearAuthSession, getAccessToken, getAuthProfile, saveAuthSession } from '../services/tokenStorage'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const profile = getAuthProfile()
  const [username, setUsername] = useState(profile.username)
  const [role, setRole] = useState(profile.role)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authFieldErrors, setAuthFieldErrors] = useState({})

  const isAuthenticated = Boolean(getAccessToken() && username)

  const applySession = useCallback((response) => {
    saveAuthSession(response)
    setUsername(response.username)
    setRole(response.role)
  }, [])

  const login = useCallback(async (payload) => {
    setAuthLoading(true)
    setAuthError('')
    setAuthFieldErrors({})
    try {
      const response = await api.login(payload)
      applySession(response)
      return response
    } catch (error) {
      setAuthError(error.message)
      setAuthFieldErrors(error.fieldErrors || {})
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [applySession])

  const register = useCallback(async (payload) => {
    setAuthLoading(true)
    setAuthError('')
    setAuthFieldErrors({})
    try {
      const response = await api.register(payload)
      applySession(response)
      return response
    } catch (error) {
      setAuthError(error.message)
      setAuthFieldErrors(error.fieldErrors || {})
      throw error
    } finally {
      setAuthLoading(false)
    }
  }, [applySession])

  const logout = useCallback(() => {
    clearAuthSession()
    setUsername('')
    setRole('')
    setAuthError('')
    setAuthFieldErrors({})
  }, [])

  const value = useMemo(() => ({
    username,
    role,
    isAuthenticated,
    authLoading,
    authError,
    authFieldErrors,
    setAuthError,
    login,
    register,
    logout,
  }), [username, role, isAuthenticated, authLoading, authError, authFieldErrors, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
