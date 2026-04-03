const ACCESS_TOKEN_KEY = 'shieldx_access_token'
const REFRESH_TOKEN_KEY = 'shieldx_refresh_token'
const USERNAME_KEY = 'shieldx_username'
const ROLE_KEY = 'shieldx_role'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

export function saveAuthSession({ accessToken, refreshToken, username, role }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken || '')
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '')
  localStorage.setItem(USERNAME_KEY, username || '')
  localStorage.setItem(ROLE_KEY, role || '')
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function getAuthProfile() {
  return {
    username: localStorage.getItem(USERNAME_KEY) || '',
    role: localStorage.getItem(ROLE_KEY) || '',
  }
}
