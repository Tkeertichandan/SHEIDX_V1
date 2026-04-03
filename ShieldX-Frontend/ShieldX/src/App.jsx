import { useEffect } from 'react'
import './App.css'
import AdminNavbar from './components/AdminNavbar'
import RiderNavbar from './components/RiderNavbar'
import AnalyticsPanel from './components/AnalyticsPanel'
import OnboardingGuide from './components/OnboardingGuide'
import ParametricPlaybook from './components/ParametricPlaybook'
import Dashboard from './components/Dashboard'
import Premium from './components/Premium'
import Claims from './components/Claims'
import Chatbot from './components/Chatbot'
import { useAppContext } from './hooks/useAppContext'
import { useAuthContext } from './hooks/useAuthContext'
import ErrorState from './components/common/ErrorState'
import LoadingState from './components/common/LoadingState'
import AuthPage from './pages/AuthPage'

function App() {
  const { isAuthenticated, role } = useAuthContext()
  const { refreshUsers, usersLoading, appError } = useAppContext()

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    refreshUsers().catch(() => undefined)
  }, [isAuthenticated, refreshUsers])

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }
    const intervalId = setInterval(() => {
      refreshUsers().catch(() => undefined)
    }, 10000)

    return () => clearInterval(intervalId)
  }, [isAuthenticated, refreshUsers])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  const isAdmin = role === 'ADMIN'

  return (
    <div className="app-shell">
      {isAdmin ? <AdminNavbar /> : <RiderNavbar />}
      <header className="hero">
        <h1>{isAdmin ? 'ShieldX Admin Control Center' : 'ShieldX Rider Workspace'}</h1>
        <p>
          {isAdmin
            ? 'Real-time micro-insurance operations with trigger intelligence, policy automation, and guided recovery support.'
            : 'Track your weekly policy, payouts, and AI recommendations in one rider-friendly portal.'}
        </p>
      </header>

      <ParametricPlaybook />

      {usersLoading ? <LoadingState label="Refreshing worker portfolio..." /> : null}
      <ErrorState message={appError} />

      {isAdmin ? <OnboardingGuide /> : null}

      {isAdmin ? <AnalyticsPanel /> : null}

      <Dashboard />

      <Premium />

      <Claims />

      <Chatbot />
    </div>
  )
}

export default App
