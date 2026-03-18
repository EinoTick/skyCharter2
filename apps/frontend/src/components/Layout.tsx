import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-5 sm:p-6">
          <div className="page">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
