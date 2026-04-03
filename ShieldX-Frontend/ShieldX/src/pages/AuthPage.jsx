import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import ErrorState from '../components/common/ErrorState'

function AuthPage() {
  const { login, register, logout, setAuthError, authLoading, authError, authFieldErrors } = useAuthContext()
  const [portal, setPortal] = useState('admin')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const openAuth = (nextPortal, nextMode) => {
    setPortal(nextPortal)
    setMode(nextMode)
    const target = document.getElementById('auth-entry')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const useDemoAdmin = async () => {
    setForm({ username: 'admin', email: '', password: 'Admin@12345' })
    const response = await login({ username: 'admin', password: 'Admin@12345' })
    if (response.role !== 'ADMIN') {
      logout()
      setAuthError('This account is not allowed in Admin Portal.')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (mode === 'login') {
      const response = await login({ username: form.username, password: form.password })
      if (portal === 'admin' && response.role !== 'ADMIN') {
        logout()
        setAuthError('Use Rider Portal for rider accounts.')
      }
      if (portal === 'rider' && response.role === 'ADMIN') {
        logout()
        setAuthError('Use Admin Portal for admin accounts.')
      }
      return
    }

    const response = await register({
      username: form.username,
      email: form.email,
      password: form.password,
    })
    if (response.role !== 'OPERATOR') {
      logout()
      setAuthError('Registration is only available for rider accounts.')
    }
  }

  return (
    <main className="home-shell">
      <header className="home-topbar">
        <div className="brand-wrap">
          <span className="brand-dot" aria-hidden="true" />
          <strong>ShieldX</strong>
        </div>
        <nav className="home-nav" aria-label="Authentication navigation">
          <button type="button" className="home-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
          <button type="button" className="home-nav-link" onClick={() => openAuth('admin', 'login')}>Admin Login</button>
          <button type="button" className="home-nav-link" onClick={() => openAuth('rider', 'login')}>Rider Login</button>
          <button type="button" className="home-nav-link" onClick={() => openAuth('rider', 'register')}>Rider Registration</button>
        </nav>
      </header>

      <section className="home-hero-block">
        <h1>Parametric Insurance Command Center</h1>
        <p>
          Run admin operations and rider journeys from one platform with fast onboarding, automated triggers, and instant payout workflows.
        </p>
        <div className="home-hero-actions">
          <button type="button" onClick={() => openAuth('admin', 'login')}>Enter Admin Portal</button>
          <button type="button" className="ghost-btn" onClick={() => openAuth('rider', 'register')}>Create Rider Account</button>
        </div>
      </section>

      <section id="auth-entry" className="auth-card">
        <h2>{portal === 'admin' ? 'Admin Login' : mode === 'register' ? 'Rider Registration' : 'Rider Login'}</h2>
        <p>Select your portal and continue with role-specific access.</p>

        <div className="portal-toggle">
          <button type="button" className={portal === 'admin' ? 'active' : ''} onClick={() => { setPortal('admin'); setMode('login') }}>
            Admin Portal
          </button>
          <button type="button" className={portal === 'rider' ? 'active' : ''} onClick={() => setPortal('rider')}>
            Rider Portal
          </button>
        </div>

        {portal === 'rider' ? (
          <div className="auth-toggle">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Rider Login</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Rider Register</button>
          </div>
        ) : null}

        <form onSubmit={submit} className="stack">
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          {mode === 'register' && portal === 'rider' ? (
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          ) : null}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
          />
          {mode === 'register' && portal === 'rider' ? (
            <p className="muted">Password must include letters, numbers, and symbols (8-64 chars).</p>
          ) : null}
          <button type="submit" disabled={authLoading}>
            {authLoading ? 'Please wait...' : mode === 'login' ? `${portal === 'admin' ? 'Admin' : 'Rider'} Login` : 'Create Rider Account'}
          </button>
          {mode === 'login' && portal === 'admin' ? (
            <button type="button" className="ghost-btn" onClick={useDemoAdmin} disabled={authLoading}>
              Enter Demo Portal (Admin)
            </button>
          ) : null}
        </form>

        <ErrorState message={authError} />
        {Object.keys(authFieldErrors).length ? (
          <ul className="list tight-list error">
            {Object.entries(authFieldErrors).map(([field, message]) => (
              <li key={field}>{field}: {message}</li>
            ))}
          </ul>
        ) : null}
        <p className="muted">Tip: Admin portal manages triggers and platform operations. Rider portal is for policy and claims visibility.</p>
      </section>
    </main>
  )
}

export default AuthPage
