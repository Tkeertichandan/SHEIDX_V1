import { createContext, useCallback, useMemo, useState } from 'react'
import { api } from '../services/api'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [appError, setAppError] = useState('')

  const refreshUsers = useCallback(async () => {
    setUsersLoading(true)
    setAppError('')
    try {
      const response = await api.listUsers()
      setUsers(response)
      if (!selectedUserId && response.length) {
        setSelectedUserId(response[0].id)
      }
    } catch (error) {
      setAppError(error.message)
      throw error
    } finally {
      setUsersLoading(false)
    }
  }, [selectedUserId])

  const notifyClaimsProcessed = useCallback(() => {
    setRefreshToken((prev) => prev + 1)
    refreshUsers().catch(() => undefined)
  }, [refreshUsers])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === Number(selectedUserId)) || null,
    [users, selectedUserId],
  )

  const value = useMemo(() => ({
    users,
    usersLoading,
    appError,
    setAppError,
    selectedUserId,
    selectedUser,
    setSelectedUserId,
    refreshToken,
    refreshUsers,
    notifyClaimsProcessed,
  }), [users, usersLoading, appError, selectedUserId, selectedUser, refreshToken, refreshUsers, notifyClaimsProcessed])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
