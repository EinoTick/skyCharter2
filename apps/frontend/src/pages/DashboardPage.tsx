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
import { EmptyState } from '../components/ui/EmptyState'

interface Booking {
  id: string
  status: string
  createdAt: string
  startDate: string
  plane?: { name: string; model: string }
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: bookingsResponse } = useQuery<{ items: Booking[] }>({
    queryKey: ['bookings', 'dashboard'],
    queryFn: () =>
      api
        .get('/bookings', {
          params: {
            page: 1,
            size: 5000,
            from: new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString(),
          },
        })
        .then((r) => r.data),
  })
  const bookings = bookingsResponse?.items ?? []

  const bookingsSorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    accepted: bookings.filter((b) => b.status === 'ACCEPTED').length,
    rejected: bookings.filter((b) => b.status === 'REJECTED').length,
  }

  // 12-month trend — range derived from the actual data so it works regardless
  // of whether bookings are historic seed data or recent live data
  const monthBuckets = getMonthRangeFromData(bookings)
  const monthCounts: Record<string, number> = Object.fromEntries(monthBuckets.map((m) => [m.key, 0]))
  for (const b of bookings) {
    const k = monthKey(new Date(b.createdAt))
    if (k in monthCounts) monthCounts[k] += 1
  }
  const chartData12m = monthBuckets.map((m) => ({ month: m.label, count: monthCounts[m.key] ?? 0 }))

  // Last 30 days trend — anchored to the latest booking date in the data
  const dayBuckets = getLast30DaysFromData(bookings)
  const dayCounts: Record<string, number> = Object.fromEntries(dayBuckets.map((d) => [d.key, 0]))
  for (const b of bookings) {
    const k = dayKey(new Date(b.createdAt))
    if (k in dayCounts) dayCounts[k] += 1
  }
  const chartData30d = dayBuckets.map((d) => ({ day: d.label, count: dayCounts[d.key] ?? 0 }))

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
        <>
          <div className="surface">
            <div className="surface-body">
              <h2 className="card-title text-base">Booking Trends (Last 12 Months)</h2>
              {bookings.length === 0 ? (
                <p className="text-base-content/50 text-sm">No booking data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData12m} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
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

          <div className="surface">
            <div className="surface-body">
              <h2 className="card-title text-base">Booking Trends (Last 30 Days)</h2>
              {bookings.length === 0 ? (
                <p className="text-base-content/50 text-sm">No booking data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData30d} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} interval={4} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Bookings" fill="hsl(var(--p))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
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

      {/* Recent bookings */}
      <div className="surface">
        <div className="surface-body">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title text-base">Recent Bookings</h2>
            <span className="text-xs text-base-content/50">Last 10</span>
          </div>

          {bookingsSorted.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Once bookings are created, the most recent ones will appear here."
            />
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="hidden sm:table-cell">Created</th>
                    <th>Plane</th>
                    <th>Status</th>
                    <th className="hidden sm:table-cell">Start</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsSorted.slice(0, 10).map((b) => (
                    <tr key={b.id}>
                      <td className="hidden sm:table-cell text-sm whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <div className="font-medium">{b.plane?.name ?? '—'}</div>
                        <div className="text-xs text-base-content/50">{b.plane?.model ?? ''}</div>
                      </td>
                      <td>
                        <span className="badge badge-sm badge-outline">{b.status}</span>
                      </td>
                      <td className="hidden sm:table-cell text-sm whitespace-nowrap">
                        {new Date(b.startDate).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
    2,
    '0'
  )}`
}

/** Build monthly buckets spanning the actual data range (up to 24 months). */
function getMonthRangeFromData(bookings: { createdAt: string }[]) {
  if (bookings.length === 0) {
    // Fall back to last 12 months from today when there is no data
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      return { key: monthKey(d), label: d.toLocaleString(undefined, { month: 'short', year: '2-digit' }) }
    })
  }

  const timestamps = bookings.map((b) => new Date(b.createdAt).getTime())
  const minDate = new Date(Math.min(...timestamps))
  const maxDate = new Date(Math.max(...timestamps))

  const res: { key: string; label: string }[] = []
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const end    = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

  while (cursor <= end && res.length <= 24) {
    res.push({
      key: monthKey(new Date(cursor)),
      label: cursor.toLocaleString(undefined, { month: 'short', year: '2-digit' }),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return res
}

/** 30-day window ending at the latest createdAt in the data (falls back to today). */
function getLast30DaysFromData(bookings: { createdAt: string }[]) {
  const anchor = bookings.length
    ? new Date(Math.max(...bookings.map((b) => new Date(b.createdAt).getTime())))
    : new Date()

  const res: { key: string; label: string }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(anchor)
    d.setDate(anchor.getDate() - i)
    res.push({
      key: dayKey(d),
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    })
  }
  return res
}
