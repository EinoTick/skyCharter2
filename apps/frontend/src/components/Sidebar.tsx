import { NavLink, useNavigate } from 'react-router-dom'
import { Plane, BookOpen, LayoutDashboard, Settings, LogOut, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'AIRLINE', 'BOOKING'],
  },
  {
    to: '/planes',
    label: 'Planes',
    icon: Plane,
    roles: ['ADMIN', 'AIRLINE', 'BOOKING'],
  },
  {
    to: '/bookings',
    label: 'Bookings',
    icon: BookOpen,
    roles: ['ADMIN', 'AIRLINE', 'BOOKING'],
  },
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: ['ADMIN', 'AIRLINE', 'BOOKING'],
  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-base-100 shadow-lg flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Plane className="text-primary" size={28} />
          <span className="text-xl font-bold text-primary">SkyCharter</span>
        </div>
        {user && (
          <div className="mt-3">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <span className="badge badge-primary badge-sm mt-1">{user.role}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-200'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-base-300">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium hover:bg-error hover:text-error-content transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
