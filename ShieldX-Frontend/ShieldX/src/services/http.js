import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from './tokenStorage'

const DEFAULT_TIMEOUT_MS = 12000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api'

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController()
  const timerId = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, cleanup: () => clearTimeout(timerId) }
}

export async function httpRequest(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const { signal, cleanup } = createTimeoutSignal(timeoutMs)
  const accessToken = getAccessToken()
  const shouldUseAuth = options.useAuth !== false

  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && shouldUseAuth ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
    })

    if (response.status === 401 && shouldUseAuth && !url.includes('/api/auth/')) {
      const nextAccessToken = await tryRefreshToken()
      if (nextAccessToken) {
        const retryResponse = await fetch(url, {
          ...options,
          signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${nextAccessToken}`,
            ...(options.headers || {}),
          },
        })

        if (retryResponse.ok) {
          if (retryResponse.status === 204) {
            return null
          }
          return retryResponse.json()
        }
      }
    }

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      let fieldErrors = {}

      try {
        const payload = await response.json()
        if (payload?.message) {
          message = payload.message
        }
        if (payload?.fieldErrors && typeof payload.fieldErrors === 'object') {
          fieldErrors = payload.fieldErrors
        }
      } catch {
        // Keep default message when backend response has no JSON body.
      }

      throw new ApiError(message, response.status, fieldErrors)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408)
    }
    if (error instanceof TypeError) {
      throw new ApiError('Unable to reach backend service. Verify server is running and CORS is configured.', 0)
    }
    throw error
  } finally {
    cleanup()
  }
}

async function tryRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearAuthSession()
      return null
    }

    const payload = await response.json()
    saveAuthSession(payload)
    return payload.accessToken || null
  } catch {
    clearAuthSession()
    return null
  }
}
