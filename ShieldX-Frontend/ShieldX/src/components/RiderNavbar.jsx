import { useAppContext } from '../hooks/useAppContext'
import { useAuthContext } from '../hooks/useAuthContext'

const navItems = [
  { label: 'Profile', href: '#workers' },
  { label: 'Premium', href: '#premium' },
  { label: 'Claims', href: '#claims' },
  { label: 'AI Help', href: '#ai' },
]

function RiderNavbar() {
  const { selectedUserId } = useAppContext()
  const { username, logout } = useAuthContext()

  return (
    <nav className="top-nav rider-nav" aria-label="Rider main sections">
      <div className="brand-wrap">
        <span className="brand-dot" aria-hidden="true" />
        <strong>ShieldX Rider Portal</strong>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <div className="nav-stats">
        <span>{username} (RIDER)</span>
        <span>{selectedUserId ? `Coverage user #${selectedUserId}` : 'Select your user profile'}</span>
        <button type="button" className="ghost-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default RiderNavbar
