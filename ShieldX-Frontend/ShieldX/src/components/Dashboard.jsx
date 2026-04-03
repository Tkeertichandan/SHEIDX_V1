import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAppContext } from '../hooks/useAppContext'
import EmptyState from './common/EmptyState'
import ErrorState from './common/ErrorState'
import { getCurrentCoordinates, openNavigationTarget, reverseGeocode, searchLocations } from '../services/locationService'

function Dashboard() {
  const { users, selectedUserId, selectedUser, setSelectedUserId, refreshUsers } = useAppContext()
  const [form, setForm] = useState({
    name: '',
    platform: 'Zomato',
    activeDaysLast30: 7,
    city: '',
    zone: '',
    zoneRisk: 1.2,
    workerRiskScore: 1.1,
  })
  const [query, setQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!users.length) {
      refreshUsers()
    }
  }, [users.length, refreshUsers])

  const filteredUsers = users.filter((user) => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return true
    }
    return `${user.name} ${user.city} ${user.zone}`.toLowerCase().includes(q)
  })

  useEffect(() => {
    const text = locationQuery.trim()
    if (text.length < 3) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      setLocationLoading(true)
      setLocationError('')
      searchLocations(text)
        .then((items) => setLocationSuggestions(items))
        .catch((err) => setLocationError(err.message))
        .finally(() => setLocationLoading(false))
    }, 350)

    return () => clearTimeout(timer)
  }, [locationQuery])

  const applyLocation = (location) => {
    setForm((prev) => ({
      ...prev,
      city: location.city,
      zone: location.zone,
    }))
    setLocationQuery(location.label)
    setLocationSuggestions([])
    setLocationError('')
  }

  const useCurrentLocation = async () => {
    setLocationLoading(true)
    setLocationError('')
    try {
      const coords = await getCurrentCoordinates()
      const location = await reverseGeocode(coords.lat, coords.lon)
      applyLocation(location)
    } catch (err) {
      setLocationError(err.message)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const normalizedPlatform = String(form.platform).trim().toLowerCase()
    const activeDaysLast30 = Number(form.activeDaysLast30)
    const eligiblePlatforms = ['zomato', 'swiggy', 'zepto']

    if (!eligiblePlatforms.includes(normalizedPlatform)) {
      setError('Worker must be from Zomato, Swiggy, or Zepto pool for this product.')
      return
    }

    if (activeDaysLast30 < 7) {
      setError('Worker must have at least 7 active delivery days before coverage can start.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.registerUser({
        name: form.name,
        city: form.city,
        zone: form.zone,
        zoneRisk: Number(form.zoneRisk),
        workerRiskScore: Number(form.workerRiskScore),
      })
      setForm({ name: '', platform: 'Zomato', activeDaysLast30: 7, city: '', zone: '', zoneRisk: 1.2, workerRiskScore: 1.1 })
      await refreshUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="workers" className="panel">
      <h2>Worker Profile</h2>
      <div className="split">
        <form onSubmit={handleRegister}>
          <h3>Register Rider</h3>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
          <label>
            Platform
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
              <option value="Zomato">Zomato</option>
              <option value="Swiggy">Swiggy</option>
              <option value="Zepto">Zepto</option>
            </select>
          </label>
          <label>
            Active Delivery Days (Last 30)
            <input
              type="number"
              min="0"
              max="30"
              step="1"
              value={form.activeDaysLast30}
              onChange={(e) => setForm({ ...form, activeDaysLast30: e.target.value })}
              required
            />
          </label>
          {Number(form.activeDaysLast30) < 5 ? (
            <p className="muted">Lower-tier recommendation: worker has fewer than 5 active days in last 30.</p>
          ) : null}
          <label>
            Location
            <div className="location-row">
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Type area, city, or address"
              />
              <button type="button" className="ghost-btn" onClick={useCurrentLocation}>
                {locationLoading ? 'Locating...' : 'Use Current Location'}
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => openNavigationTarget(locationQuery || `${form.city} ${form.zone}`)}
              >
                Navigate
              </button>
            </div>
          </label>
          {locationSuggestions.length ? (
            <div className="location-suggestions">
              {locationSuggestions.map((item) => (
                <button key={`${item.lat}-${item.lon}`} type="button" className="location-option" onClick={() => applyLocation(item)}>
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          {locationError ? <p className="error">{locationError}</p> : null}
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" required />
          <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Zone" required />
          <label>
            Zone Risk
            <input type="number" min="0.5" max="3" step="0.01" value={form.zoneRisk} onChange={(e) => setForm({ ...form, zoneRisk: e.target.value })} required />
          </label>
          <label>
            Worker Risk Score
            <input type="number" min="0.5" max="3" step="0.01" value={form.workerRiskScore} onChange={(e) => setForm({ ...form, workerRiskScore: e.target.value })} required />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
          {error ? <p className="error">{error}</p> : null}
          <p className="muted">Eligibility gate: minimum 7 active delivery days and approved platform pool.</p>
        </form>

        <div className="stack">
          <h3>Select Active User</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or zone"
          />
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(Number(e.target.value))}>
            <option value="">Select user</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.city})</option>
            ))}
          </select>
          {!filteredUsers.length ? <EmptyState label="No workers match your search." /> : null}
          {selectedUser ? (
            <div className="summary-card">
              <p><strong>Zone:</strong> {selectedUser.zone}</p>
              <p><strong>Wallet:</strong> Rs. {selectedUser.walletBalance.toFixed(2)}</p>
              <p><strong>Zone Risk:</strong> {selectedUser.zoneRisk}</p>
              <p><strong>Worker Score:</strong> {selectedUser.workerRiskScore}</p>
            </div>
          ) : <p>Select a user to continue insurance flow.</p>}
        </div>
      </div>
      <ErrorState message={error} />
    </section>
  )
}

export default Dashboard
