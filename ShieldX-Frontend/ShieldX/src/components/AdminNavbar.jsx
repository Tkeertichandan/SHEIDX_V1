import { useAppContext } from '../hooks/useAppContext'
import { useAuthContext } from '../hooks/useAuthContext'

const navItems = [
  { label: 'Analytics', href: '#analytics' },
  { label: 'Workers', href: '#workers' },
  { label: 'Premium', href: '#premium' },
  { label: 'Claims', href: '#claims' },
  { label: 'AI', href: '#ai' },
]

function AdminNavbar() {
  const { users, selectedUserId, usersLoading } = useAppContext()
  const { username, logout } = useAuthContext()

  return (
    <nav className="top-nav" aria-label="Admin main sections">
      <div className="brand-wrap">
        <span className="brand-dot" aria-hidden="true" />
        <strong>ShieldX Admin Portal</strong>
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
        <span>{username} (ADMIN)</span>
        <span>{users.length} workers</span>
        <span>{selectedUserId ? `User #${selectedUserId}` : 'No user selected'}</span>
        <button type="button" className="ghost-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default AdminNavbar
