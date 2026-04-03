import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAppContext } from '../hooks/useAppContext'
import { useAuthContext } from '../hooks/useAuthContext'
import EmptyState from './common/EmptyState'
import ErrorState from './common/ErrorState'
import LoadingState from './common/LoadingState'
import { getCurrentCoordinates, openNavigationTarget, reverseGeocode, searchLocations } from '../services/locationService'

function Claims() {
  const { selectedUserId, refreshToken, notifyClaimsProcessed } = useAppContext()
  const { role } = useAuthContext()
  const [triggers, setTriggers] = useState([])
  const [claims, setClaims] = useState([])
  const [triggerForm, setTriggerForm] = useState({ type: 'WEATHER', zone: '', description: '', severity: 0.8 })
  const [triggerMetric, setTriggerMetric] = useState('AQI')
  const [metricValue, setMetricValue] = useState(301)
  const [historicalYears, setHistoricalYears] = useState(10)
  const [activeHoursWindow, setActiveHoursWindow] = useState('18:00-22:00')
  const [fraudCheckReady, setFraudCheckReady] = useState(false)
  const [rollbackReady, setRollbackReady] = useState(false)
  const [settlementTargetMinutes, setSettlementTargetMinutes] = useState(30)
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [claimQuery, setClaimQuery] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdmin = role === 'ADMIN'

  const loadData = async () => {
    setLoading(true)
    if (!selectedUserId) {
      setClaims([])
      setTriggers([])
      setLoading(false)
      return
    }
    try {
      const [triggerRes, claimRes] = await Promise.all([
        api.listTriggers(activeOnly),
        api.listClaimsByUser(selectedUserId),
      ])
      setTriggers(triggerRes)
      setClaims(claimRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, refreshToken, activeOnly])

  useEffect(() => {
    if (!selectedUserId) {
      return undefined
    }

    const intervalId = setInterval(() => {
      loadData().catch(() => undefined)
    }, 5000)

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, refreshToken, activeOnly])

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
    setTriggerForm((prev) => ({
      ...prev,
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

  const filteredClaims = claims
    .filter((claim) => {
      const q = claimQuery.trim().toLowerCase()
      if (!q) {
        return true
      }
      return `${claim.id} ${claim.reason} ${claim.status}`.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      const left = new Date(a.createdAt).getTime()
      const right = new Date(b.createdAt).getTime()
      return sortOrder === 'asc' ? left - right : right - left
    })

  const exportClaims = () => {
    if (!filteredClaims.length) {
      return
    }

    const header = 'id,userId,policyId,triggerEventId,payout,status,reason,createdAt'
    const rows = filteredClaims.map((claim) => [
      claim.id,
      claim.userId,
      claim.policyId,
      claim.triggerEventId,
      claim.payout,
      claim.status,
      `"${String(claim.reason).replaceAll('"', '""')}"`,
      claim.createdAt,
    ].join(','))

    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `shieldx-claims-${selectedUserId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const createTrigger = async (event) => {
    event.preventDefault()
    setError('')

    const value = Number(metricValue)
    const years = Number(historicalYears)
    const thresholdMet = (
      (triggerMetric === 'AQI' && value > 300)
      || (triggerMetric === 'RAIN' && value > 50)
      || (triggerMetric === 'TEMP' && value > 42)
    )

    if (!thresholdMet) {
      setError('Trigger rejected: threshold not met (AQI > 300, rain > 50 mm, or temp > 42C).')
      return
    }

    if (years < 10) {
      setError('Trigger rejected: at least 10 years of historical data is required for design confidence.')
      return
    }

    if (!activeHoursWindow.trim()) {
      setError('Trigger rejected: define worker active-hours window to align event and worker activity.')
      return
    }

    try {
      const metadataSuffix = ` | metric=${triggerMetric}:${value} | years=${years} | hours=${activeHoursWindow}`
      const maxDescriptionLength = 300
      const maxBaseLength = Math.max(0, maxDescriptionLength - metadataSuffix.length)
      const baseDescription = triggerForm.description.trim().slice(0, maxBaseLength)
      const descriptionWithChecks = `${baseDescription}${metadataSuffix}`
      await api.createTrigger({ ...triggerForm, description: descriptionWithChecks, severity: Number(triggerForm.severity) })
      setTriggerForm({ type: 'WEATHER', zone: '', description: '', severity: 0.8 })
      setMetricValue(301)
      setHistoricalYears(10)
      setActiveHoursWindow('18:00-22:00')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const processClaims = async () => {
    setError('')

    if (!fraudCheckReady) {
      setError('Processing blocked: confirm fraud check completion before payout.')
      return
    }

    if (!rollbackReady) {
      setError('Processing blocked: rollback strategy must be ready before transfers.')
      return
    }

    if (Number(settlementTargetMinutes) > 60) {
      setError('Processing blocked: settlement target should be in minutes, not hours (<= 60).')
      return
    }

    const hasActiveTrigger = triggers.some((trigger) => trigger.active)
    if (!hasActiveTrigger) {
      setError('Processing blocked: no active trigger available for claim payout run.')
      return
    }

    try {
      await api.processClaims()
      await loadData()
      notifyClaimsProcessed()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section id="claims" className="panel">
      <h2>Parametric Triggers & Claims</h2>
      <div className="split">
        <form onSubmit={createTrigger}>
          <h3>Simulate Trigger</h3>
          <select value={triggerForm.type} onChange={(e) => setTriggerForm({ ...triggerForm, type: e.target.value })}>
            <option value="WEATHER">Weather</option>
            <option value="PLATFORM">Platform</option>
            <option value="REGULATORY">Regulatory</option>
          </select>
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
                onClick={() => openNavigationTarget(locationQuery || triggerForm.zone)}
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
          <input value={triggerForm.zone} onChange={(e) => setTriggerForm({ ...triggerForm, zone: e.target.value })} placeholder="Zone (must match user zone)" required />
          <input value={triggerForm.description} onChange={(e) => setTriggerForm({ ...triggerForm, description: e.target.value })} placeholder="Description" required />
          <label>
            Trigger Metric
            <select value={triggerMetric} onChange={(e) => setTriggerMetric(e.target.value)}>
              <option value="AQI">AQI</option>
              <option value="RAIN">Rain (mm)</option>
              <option value="TEMP">Temperature (C)</option>
            </select>
          </label>
          <label>
            Observed Metric Value
            <input
              type="number"
              step="1"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              required
            />
          </label>
          <label>
            Historical Data Years Used
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={historicalYears}
              onChange={(e) => setHistoricalYears(e.target.value)}
              required
            />
          </label>
          <label>
            Worker Active Hours Window
            <input
              value={activeHoursWindow}
              onChange={(e) => setActiveHoursWindow(e.target.value)}
              placeholder="e.g. 18:00-22:00"
              required
            />
          </label>
          <label>
            Severity
            <input type="number" min="0" max="1.5" step="0.1" value={triggerForm.severity} onChange={(e) => setTriggerForm({ ...triggerForm, severity: e.target.value })} required />
          </label>
          <p className="muted">Threshold gate: AQI &gt; 300, Rain &gt; 50 mm, Temp &gt; 42C with 10+ years historical data.</p>
          <button type="submit" disabled={!isAdmin}>Create Trigger</button>
          {!isAdmin ? <p className="muted">Only Admin can create triggers.</p> : null}
        </form>

        <div className="stack">
          <h3>Trigger Monitor</h3>
          <label className="inline-label">
            <input type="checkbox" checked={fraudCheckReady} onChange={(e) => setFraudCheckReady(e.target.checked)} />
            Fraud check completed before payout
          </label>
          <label className="inline-label">
            <input type="checkbox" checked={rollbackReady} onChange={(e) => setRollbackReady(e.target.checked)} />
            Rollback logic ready for failed transfer
          </label>
          <label>
            Settlement Target (minutes)
            <input
              type="number"
              min="1"
              max="180"
              step="1"
              value={settlementTargetMinutes}
              onChange={(e) => setSettlementTargetMinutes(e.target.value)}
            />
          </label>
          <button onClick={processClaims} disabled={!isAdmin}>Run Auto Claim Processor</button>
          {!isAdmin ? <p className="muted">Only Admin can run manual claim processing.</p> : null}
          <label className="inline-label">
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
            Show active triggers only
          </label>
          <p>Auto-refresh every 5 seconds</p>
          {loading ? <LoadingState label="Refreshing triggers and claims..." /> : null}
          <ul className="list tight-list">
            {triggers.map((trigger) => (
              <li key={trigger.id}>{trigger.type} | {trigger.zone} | severity {trigger.severity} | {trigger.active ? 'active' : 'resolved'}</li>
            ))}
          </ul>
          {!triggers.length ? <EmptyState label="No triggers found for current filter." /> : null}
        </div>
      </div>

      <h3>Claim History</h3>
      <div className="claim-toolbar">
        <input
          value={claimQuery}
          onChange={(e) => setClaimQuery(e.target.value)}
          placeholder="Search claims by id, reason, status"
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
        <button type="button" onClick={exportClaims} disabled={!filteredClaims.length}>Export CSV</button>
      </div>
      <ul className="list tight-list">
        {filteredClaims.map((claim) => (
          <li key={claim.id}>Claim #{claim.id} | payout Rs. {claim.payout.toFixed(2)} | {claim.reason}</li>
        ))}
      </ul>
      {!filteredClaims.length ? <EmptyState label="No claims yet for the selected worker." /> : null}
      <ErrorState message={error} />
    </section>
  )
}

export default Claims
