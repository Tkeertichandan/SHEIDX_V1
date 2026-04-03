import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { useAppContext } from '../hooks/useAppContext'
import { useAuthContext } from '../hooks/useAuthContext'

function StepItem({ done, label, hint, actionLabel, actionHref }) {
  return (
    <li className={`onboard-step ${done ? 'done' : ''}`}>
      <div>
        <p className="onboard-step-title">{label}</p>
        <p className="muted">{hint}</p>
      </div>
      {actionHref ? (
        <a className="onboard-link" href={actionHref}>{actionLabel}</a>
      ) : null}
    </li>
  )
}

function OnboardingGuide() {
  const { username } = useAuthContext()
  const { users, selectedUserId } = useAppContext()
  const [policyCount, setPolicyCount] = useState(0)
  const [claimCount, setClaimCount] = useState(0)

  useEffect(() => {
    if (!selectedUserId) {
      setPolicyCount(0)
      setClaimCount(0)
      return
    }

    Promise.all([
      api.listPoliciesByUser(selectedUserId),
      api.listClaimsByUser(selectedUserId),
    ])
      .then(([policies, claims]) => {
        setPolicyCount(Array.isArray(policies) ? policies.length : 0)
        setClaimCount(Array.isArray(claims) ? claims.length : 0)
      })
      .catch(() => {
        setPolicyCount(0)
        setClaimCount(0)
      })
  }, [selectedUserId])

  const steps = useMemo(() => [
    {
      done: Boolean(username),
      label: 'Login to portal',
      hint: 'Use demo admin for quick evaluation.',
      actionLabel: 'Open Auth',
      actionHref: '#',
    },
    {
      done: users.length > 0,
      label: 'Register worker',
      hint: 'Create at least one rider profile with zone risk details.',
      actionLabel: 'Go to Workers',
      actionHref: '#workers',
    },
    {
      done: Boolean(selectedUserId),
      label: 'Select active worker',
      hint: 'Choose the worker to run premium and claims flow.',
      actionLabel: 'Select Worker',
      actionHref: '#workers',
    },
    {
      done: policyCount > 0,
      label: 'Purchase weekly policy',
      hint: 'Calculate and purchase to activate coverage.',
      actionLabel: 'Open Premium',
      actionHref: '#premium',
    },
    {
      done: claimCount > 0,
      label: 'Generate trigger and claim',
      hint: 'Create/auto-detect disruption trigger and verify payout.',
      actionLabel: 'Open Claims',
      actionHref: '#claims',
    },
  ], [username, users.length, selectedUserId, policyCount, claimCount])

  const completed = steps.filter((step) => step.done).length
  const progress = Math.round((completed / steps.length) * 100)

  return (
    <section className="panel onboarding-panel">
      <div className="onboard-head">
        <div>
          <h2>2-Minute Guided Demo</h2>
          <p className="muted">Follow these steps to show the complete business flow fast.</p>
        </div>
        <strong>{progress}% complete</strong>
      </div>
      <div className="onboard-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <ul className="onboard-list">
        {steps.map((step) => (
          <StepItem
            key={step.label}
            done={step.done}
            label={step.label}
            hint={step.hint}
            actionLabel={step.actionLabel}
            actionHref={step.actionHref}
          />
        ))}
      </ul>
    </section>
  )
}

export default OnboardingGuide
