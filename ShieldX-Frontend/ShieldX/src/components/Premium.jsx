import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAppContext } from '../hooks/useAppContext'
import ErrorState from './common/ErrorState'
import EmptyState from './common/EmptyState'

function Premium() {
  const { selectedUserId, refreshUsers } = useAppContext()
  const [basePrice, setBasePrice] = useState(35)
  const [premium, setPremium] = useState(null)
  const [policy, setPolicy] = useState(null)
  const [policies, setPolicies] = useState([])
  const [loadingAction, setLoadingAction] = useState('')
  const [error, setError] = useState('')

  const disabled = !selectedUserId

  useEffect(() => {
    if (!selectedUserId) {
      setPolicies([])
      return
    }

    api.listPoliciesByUser(selectedUserId)
      .then((items) => setPolicies(items))
      .catch(() => setPolicies([]))
  }, [selectedUserId, policy])

  const handleCalculate = async () => {
    const normalizedPrice = Number(basePrice)
    if (normalizedPrice < 20 || normalizedPrice > 50) {
      setError('Weekly premium base must stay in the target range Rs. 20 to Rs. 50.')
      return
    }

    setLoadingAction('calculate')
    setError('')
    try {
      const response = await api.calculatePremium({
        userId: selectedUserId,
        basePrice: normalizedPrice,
      })
      setPremium(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAction('')
    }
  }

  const handlePurchase = async () => {
    const normalizedPrice = Number(basePrice)
    if (normalizedPrice < 20 || normalizedPrice > 50) {
      setError('Weekly premium base must stay in the target range Rs. 20 to Rs. 50.')
      return
    }

    setLoadingAction('purchase')
    setError('')
    try {
      const response = await api.purchasePolicy({
        userId: selectedUserId,
        basePrice: normalizedPrice,
      })
      setPolicy(response)
      refreshUsers().catch(() => undefined)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingAction('')
    }
  }

  return (
    <section id="premium" className="panel">
      <h2>Weekly Premium</h2>
      <div className="split compact">
        <label>
          Base Price (Rs)
          <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} min="20" max="50" step="1" />
        </label>
        <button disabled={disabled || loadingAction === 'purchase'} onClick={handleCalculate}>
          {loadingAction === 'calculate' ? 'Calculating...' : 'Calculate Premium'}
        </button>
        <button disabled={disabled || loadingAction === 'calculate'} onClick={handlePurchase}>
          {loadingAction === 'purchase' ? 'Purchasing...' : 'Purchase Policy'}
        </button>
      </div>
      {premium ? <p className="success">Estimated Premium: Rs. {premium.premium.toFixed(2)}</p> : null}
      {policy ? <p className="success">Policy #{policy.policyId} active till {policy.weekEnd}</p> : null}
      <p className="muted">Pricing guardrail enforced: Rs. 20-Rs. 50 weekly range for affordability and sustainability.</p>
      <h3>Policy History</h3>
      <ul className="list tight-list">
        {policies.map((item) => (
          <li key={item.policyId}>#{item.policyId} | Rs. {item.premium.toFixed(2)} | {item.status} | {item.weekStart} to {item.weekEnd}</li>
        ))}
      </ul>
      {!policies.length ? <EmptyState label="No policies found for selected worker." /> : null}
      {disabled ? <p>Select a user first.</p> : null}
      <ErrorState message={error} />
    </section>
  )
}

export default Premium
