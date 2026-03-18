import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BookOpen, Plane, Clock, XCircle } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'

interface Booking {
  id: string
  status: string
  createdAt: string
  startDate: string
  plane?: { name: string; model: string }
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then((r) => r.data),
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    accepted: bookings.filter((b) => b.status === 'ACCEPTED').length,
    rejected: bookings.filter((b) => b.status === 'REJECTED').length,
  }

  // Monthly trend grouped by creation month
  const monthlyMap: Record<string, number> = {}
  bookings.forEach((b) => {
    const label = new Date(b.createdAt).toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    })
    monthlyMap[label] = (monthlyMap[label] || 0) + 1
  })
  const chartData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }))

  const upcomingTrips = bookings.filter(
    (b) => b.status === 'ACCEPTED' && new Date(b.startDate) > new Date()
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name ?? '—'}!`}
        subtitle="Here’s a quick snapshot of recent activity."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={22} />} label="Total Bookings" value={stats.total} colorClass="text-primary bg-primary/10" />
        <StatCard icon={<Clock size={22} />} label="Pending" value={stats.pending} colorClass="text-warning bg-warning/10" />
        <StatCard icon={<Plane size={22} />} label="Accepted" value={stats.accepted} colorClass="text-success bg-success/10" />
        <StatCard icon={<XCircle size={22} />} label="Rejected" value={stats.rejected} colorClass="text-error bg-error/10" />
      </div>

      {/* Booking trends – Admin & Airline */}
      {(user?.role === 'ADMIN' || user?.role === 'AIRLINE') && (
        <div className="surface">
          <div className="surface-body">
            <h2 className="card-title text-base">Booking Trends</h2>
            {chartData.length === 0 ? (
              <p className="text-base-content/50 text-sm">No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Bookings" fill="hsl(var(--p))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Upcoming trips – Booking users */}
      {user?.role === 'BOOKING' && (
        <div className="surface">
          <div className="surface-body">
            <h2 className="card-title text-base">Upcoming Trips</h2>
            {upcomingTrips.length === 0 ? (
              <p className="text-base-content/50 text-sm">
                No upcoming trips.{' '}
                <a href="/planes" className="link link-primary">
                  Browse available planes.
                </a>
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTrips.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                    <Plane size={18} className="text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{b.plane?.name}</p>
                      <p className="text-xs text-base-content/60">
                        {new Date(b.startDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4 flex-row items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
        <div>
          <p className="text-xs text-base-content/60 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
