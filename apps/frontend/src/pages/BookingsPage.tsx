import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Check, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

interface Booking {
  id: string
  status: string
  startDate: string
  endDate: string
  notes?: string
  user: { id: string; name: string; email: string }
  plane: {
    id: string
    name: string
    model: string
    airline: { id: string; name: string }
  }
}

const statusBadge: Record<string, string> = {
  PENDING: 'badge-warning',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-error',
}

export default function BookingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then((r) => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Review bookings, statuses, and upcoming trips."
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Once bookings are created, they’ll show up here." />
      ) : (
        <div className="surface overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Plane</th>
                {user?.role !== 'BOOKING' && <th>Booked By</th>}
                {user?.role === 'ADMIN' && <th>Airline</th>}
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                {(user?.role === 'AIRLINE' || user?.role === 'ADMIN') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="font-medium">{b.plane?.name}</div>
                    <div className="text-xs text-base-content/50">{b.plane?.model}</div>
                  </td>
                  {user?.role !== 'BOOKING' && (
                    <td>
                      <div className="text-sm">{b.user?.name}</div>
                      <div className="text-xs text-base-content/50">{b.user?.email}</div>
                    </td>
                  )}
                  {user?.role === 'ADMIN' && (
                    <td className="text-sm">{b.plane?.airline?.name}</td>
                  )}
                  <td className="text-sm whitespace-nowrap">
                    {new Date(b.startDate).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="text-sm whitespace-nowrap">
                    {new Date(b.endDate).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge[b.status] ?? 'badge-neutral'}`}>
                      {b.status}
                    </span>
                  </td>
                  {(user?.role === 'AIRLINE' || user?.role === 'ADMIN') && (
                    <td>
                      {b.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-xs btn-success"
                            title="Accept"
                            onClick={() => updateStatus.mutate({ id: b.id, status: 'ACCEPTED' })}
                            disabled={updateStatus.isPending}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            title="Reject"
                            onClick={() => updateStatus.mutate({ id: b.id, status: 'REJECTED' })}
                            disabled={updateStatus.isPending}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
