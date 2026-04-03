import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import { api } from '../services/api'
import ErrorState from './common/ErrorState'

function AnalyticsPanel() {
  const { users, selectedUserId } = useAppContext()
  const [diagnostics, setDiagnostics] = useState(null)
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false)
  const [diagnosticsError, setDiagnosticsError] = useState('')

  const stats = useMemo(() => {
    const totalWallet = users.reduce((sum, user) => sum + (user.walletBalance || 0), 0)
    const avgZoneRisk = users.length
      ? users.reduce((sum, user) => sum + (user.zoneRisk || 0), 0) / users.length
      : 0
    const avgWorkerRisk = users.length
      ? users.reduce((sum, user) => sum + (user.workerRiskScore || 0), 0) / users.length
      : 0

    return {
      workerCount: users.length,
      totalWallet,
      avgZoneRisk,
      avgWorkerRisk,
    }
  }, [users])

  const loadDiagnostics = async () => {
    setLoadingDiagnostics(true)
    setDiagnosticsError('')
    try {
      const response = await api.aiDiagnostics()
      setDiagnostics(response)
    } catch (err) {
      setDiagnosticsError(err.message)
    } finally {
      setLoadingDiagnostics(false)
    }
  }

  useEffect(() => {
    loadDiagnostics().catch(() => undefined)
    const intervalId = setInterval(() => {
      loadDiagnostics().catch(() => undefined)
    }, 15000)
    return () => clearInterval(intervalId)
  }, [])

  const successRate = diagnostics?.remoteRequests
    ? Math.round((diagnostics.remoteSuccesses / diagnostics.remoteRequests) * 100)
    : 0

  const health = useMemo(() => {
    if (!diagnostics || diagnostics.remoteRequests === 0) {
      return {
        label: 'No Remote Traffic Yet',
        className: 'health-neutral',
        hint: 'No model requests have reached remote provider yet.',
      }
    }

    if (successRate >= 80 && diagnostics.remoteFailures === 0) {
      return {
        label: 'Healthy',
        className: 'health-good',
        hint: 'Remote model responses are stable.',
      }
    }

    if (successRate >= 40) {
      return {
        label: 'Degraded',
        className: 'health-warn',
        hint: 'Fallback is active for a portion of traffic.',
      }
    }

    return {
      label: 'Critical',
      className: 'health-bad',
      hint: 'Most AI responses are using fallback logic.',
    }
  }, [diagnostics, successRate])

  return (
    <section id="analytics" className="panel analytics-panel">
      <h2>Portfolio Analytics</h2>
      <div className="kpi-grid">
        <article className="kpi-card">
          <p className="kpi-label">Active Workers</p>
          <p className="kpi-value">{stats.workerCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Total Wallet Value</p>
          <p className="kpi-value">Rs. {stats.totalWallet.toFixed(2)}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Average Zone Risk</p>
          <p className="kpi-value">{stats.avgZoneRisk.toFixed(2)}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">Average Worker Risk</p>
          <p className="kpi-value">{stats.avgWorkerRisk.toFixed(2)}</p>
        </article>
      </div>
      <p className="muted">{selectedUserId ? `Focused on User #${selectedUserId}` : 'Select a worker to focus detailed operations.'}</p>

      <div className="ai-ops-card">
        <div className="ai-ops-head">
          <h3>AI Model Operations</h3>
          <div className="ai-ops-actions">
            <span className={`health-pill ${health.className}`}>{health.label}</span>
            <button type="button" className="ghost-btn" onClick={loadDiagnostics} disabled={loadingDiagnostics}>
              {loadingDiagnostics ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <p className="muted ai-health-hint">{health.hint}</p>
        {diagnostics ? (
          <div className="ai-ops-grid">
            <p><strong>Mode:</strong> {diagnostics.mode}</p>
            <p><strong>Provider:</strong> {diagnostics.provider}</p>
            <p><strong>OpenAI Model:</strong> {diagnostics.openAiModel}</p>
            <p><strong>HF Model:</strong> {diagnostics.huggingFaceModel}</p>
            <p><strong>Remote Requests:</strong> {diagnostics.remoteRequests}</p>
            <p><strong>Remote Successes:</strong> {diagnostics.remoteSuccesses}</p>
            <p><strong>Remote Failures:</strong> {diagnostics.remoteFailures}</p>
            <p><strong>Fallback Count:</strong> {diagnostics.fallbackCount}</p>
            <p><strong>Success Rate:</strong> {successRate}%</p>
            <p><strong>Last Updated:</strong> {diagnostics.lastUpdatedAt}</p>
            <p className="ai-ops-wide"><strong>Last Fallback Reason:</strong> {diagnostics.lastFallbackReason}</p>
          </div>
        ) : (
          <p className="muted">No diagnostics yet.</p>
        )}
        <ErrorState message={diagnosticsError} />
      </div>
    </section>
  )
}

export default AnalyticsPanel
