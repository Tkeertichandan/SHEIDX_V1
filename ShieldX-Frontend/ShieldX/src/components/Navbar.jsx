import { useAppContext } from '../hooks/useAppContext'
import { useAuthContext } from '../hooks/useAuthContext'

const navItems = [
  { label: 'Workers', href: '#workers' },
  { label: 'Premium', href: '#premium' },
  { label: 'Claims', href: '#claims' },
  { label: 'AI', href: '#ai' },
]

function Navbar() {
  const { users, selectedUserId, usersLoading } = useAppContext()
  const { username, role, logout } = useAuthContext()

  return (
    <nav className="top-nav" aria-label="Main sections">
      <div className="brand-wrap">
        <span className="brand-dot" aria-hidden="true" />
        <strong>ShieldX Command Hub</strong>
      </div>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>

      <div className="nav-stats">
        <span>{usersLoading ? 'Syncing...' : 'Live sync'}</span>
        <span>{username} ({role})</span>
        <span>{users.length} workers</span>
        <span>{selectedUserId ? `User #${selectedUserId}` : 'No user selected'}</span>
        <button type="button" className="ghost-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
