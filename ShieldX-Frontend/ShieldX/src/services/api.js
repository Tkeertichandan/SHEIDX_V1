import { httpRequest } from './http'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api'

function request(path, options = {}) {
  return httpRequest(`${API_BASE_URL}${path}`, options)
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload), useAuth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload), useAuth: false }),
  refresh: (payload) => request('/auth/refresh', { method: 'POST', body: JSON.stringify(payload), useAuth: false }),
  listUsers: () => request('/users'),
  registerUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
  calculatePremium: (payload) => request('/premium/calculate', { method: 'POST', body: JSON.stringify(payload) }),
  purchasePolicy: (payload) => request('/premium/purchase', { method: 'POST', body: JSON.stringify(payload) }),
  listPoliciesByUser: (userId) => request(`/premium/policies/user/${userId}`),
  listTriggers: (activeOnly = false) => request(`/triggers?activeOnly=${activeOnly}`),
  createTrigger: (payload) => request('/triggers', { method: 'POST', body: JSON.stringify(payload) }),
  resolveTrigger: (id) => request(`/triggers/${id}/resolve`, { method: 'PATCH' }),
  processClaims: () => request('/claims/process', { method: 'POST' }),
  listClaimsByUser: (userId) => request(`/claims/user/${userId}`),
  chat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  weeklyReport: (payload) => request('/ai/weekly-report', { method: 'POST', body: JSON.stringify(payload) }),
  aiDiagnostics: () => request('/ai/diagnostics'),
}
