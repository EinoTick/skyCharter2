import { Outlet } from 'react-router-dom'
import { Menu, Plane } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="drawer lg:drawer-open h-screen bg-base-200">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="navbar bg-base-100 border-b border-base-300/70 lg:hidden">
          <div className="flex-none">
            <label htmlFor="app-drawer" className="btn btn-ghost btn-square" aria-label="Open menu">
              <Menu size={20} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 px-1 min-w-0">
              <Plane size={18} className="text-primary shrink-0" />
              <span className="font-semibold truncate">SkyCharter</span>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6">
            <div className="page">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <div className="drawer-side z-40 h-full">
        <label htmlFor="app-drawer" aria-label="Close menu" className="drawer-overlay"></label>
        <Sidebar
          onNavigate={() => {
            const el = document.getElementById('app-drawer') as HTMLInputElement | null
            if (el) el.checked = false
          }}
        />
      </div>
    </div>
  )
}
