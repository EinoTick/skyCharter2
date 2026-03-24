import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Check, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useEffect, useState } from 'react'
import { BookingStatus, UserRole } from '@skycharter/shared-types'

interface Booking {
  id: string
  status: string
  createdAt: string
  startDate: string
  endDate: string
  notes?: string
  user: { id: string; name: string; email: string; role?: string }
  plane: {
    id: string
    name: string
    model: string
    airline: { id: string; name: string }
  }
}

type PaginatedBookings = {
  items: Booking[]
  total: number
  page: number
  size: number
}

const statusBadge: Record<string, string> = {
  PENDING: 'badge-warning',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-error',
}

export default function BookingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const isAdmin = user?.role === UserRole.ADMIN
  const [page, setPage] = useState(1)
  const size = 50

  const { data, isLoading } = useQuery<PaginatedBookings>({
    queryKey: ['bookings', page, size],
    queryFn: () => api.get('/bookings', { params: { page, size } }).then((r) => r.data),
  })
  const bookings = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / size))

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
      ) : total === 0 ? (
        <EmptyState title="No bookings yet" description="Once bookings are created, they’ll show up here." />
      ) : (
        <div className="space-y-3">
          <div className="surface overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th className="hidden sm:table-cell">Plane</th>
                  {user?.role !== 'BOOKING' && <th>Booked By</th>}
                  {user?.role === 'ADMIN' && <th>Airline</th>}
                  <th className="hidden xl:table-cell">Start</th>
                  <th className="hidden xl:table-cell">End</th>
                  <th>Status</th>
                  {(user?.role === 'AIRLINE' || user?.role === 'ADMIN') && (
                    <th className="hidden sm:table-cell">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(b)
                    }}
                  >
                    <td className="hidden sm:table-cell">
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
                    <td className="hidden xl:table-cell text-sm whitespace-nowrap">
                      {new Date(b.startDate).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="hidden xl:table-cell text-sm whitespace-nowrap">
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
                      <td className="hidden sm:table-cell">
                        {b.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button
                              className="btn btn-xs btn-success"
                              title="Accept"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateStatus.mutate({ id: b.id, status: 'ACCEPTED' })
                              }}
                              disabled={updateStatus.isPending}
                            >
                              <Check size={12} />
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              title="Reject"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateStatus.mutate({ id: b.id, status: 'REJECTED' })
                              }}
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

          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/60">
              Page <span className="font-medium text-base-content">{page}</span> of{' '}
              <span className="font-medium text-base-content">{totalPages}</span> ·{' '}
              <span className="font-medium text-base-content">{total}</span> total
            </div>
            <div className="join">
              <button
                className="btn btn-sm btn-outline btn-primary join-item"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="btn btn-sm btn-outline btn-primary join-item"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <BookingEditDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        canEditStatus={user?.role === UserRole.ADMIN || user?.role === UserRole.AIRLINE}
        onClose={() => setSelectedBooking(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['bookings'] })
        }}
      />
    </div>
  )
}

function BookingEditDialog({
  booking,
  open,
  canEditStatus,
  onClose,
  onSaved,
}: {
  booking: Booking | null
  open: boolean
  canEditStatus: boolean
  onClose: () => void
  onSaved: () => void
}) {
  type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus]
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<BookingStatusValue>(BookingStatus.PENDING)

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return
      await api.patch(`/bookings/${booking.id}`, {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        notes: notes || undefined,
        ...(canEditStatus ? { status } : {}),
      })
    },
    onSuccess: () => {
      onSaved()
      onClose()
    },
  })

  // sync form when a different booking is opened
  useEffect(() => {
    if (!booking || !open) return
    setStartDate(toDateTimeLocal(booking.startDate))
    setEndDate(toDateTimeLocal(booking.endDate))
    setNotes(booking.notes ?? '')
    setStatus((booking.status as BookingStatusValue) ?? BookingStatus.PENDING)
  }, [booking, open])

  if (!open || !booking) return null

  const error =
    updateMutation.error instanceof Error ? updateMutation.error.message : undefined

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit Booking</h3>
        <p className="text-sm text-base-content/60 mt-1">
          {booking.plane?.name} · {booking.user?.name}
        </p>

        {error ? (
          <div className="alert alert-error mt-3">
            <span>{error}</span>
          </div>
        ) : null}

        <form
          className="space-y-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="input input-bordered w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatusValue)}
            disabled={!canEditStatus}
          >
            <option value={BookingStatus.PENDING}>PENDING</option>
            <option value={BookingStatus.ACCEPTED}>ACCEPTED</option>
            <option value={BookingStatus.REJECTED}>REJECTED</option>
          </select>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <span className="loading loading-spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

function toDateTimeLocal(value: string) {
  const d = new Date(value)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
