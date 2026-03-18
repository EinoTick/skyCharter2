import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Plane, Search, Plus, X } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

interface PlaneData {
  id: string
  name: string
  model: string
  capacity: number
  pricePerHour: number
  description?: string
  isAvailable: boolean
  airline: { id: string; name: string; email: string }
}

export default function PlanesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [bookingPlaneId, setBookingPlaneId] = useState<string | null>(null)

  const { data: planes = [], isLoading } = useQuery<PlaneData[]>({
    queryKey: ['planes', search],
    queryFn: () =>
      api.get('/planes', { params: search ? { search } : {} }).then((r) => r.data),
  })

  const createPlaneMutation = useMutation({
    mutationFn: (data: unknown) => api.post('/planes', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['planes'] })
      setShowCreateModal(false)
    },
  })

  const bookMutation = useMutation({
    mutationFn: (data: unknown) => api.post('/bookings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setBookingPlaneId(null)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planes"
        subtitle="Browse available aircraft, pricing, and capacity."
        actions={
          (user?.role === 'AIRLINE' || user?.role === 'ADMIN') ? (
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Add Plane
            </button>
          ) : null
        }
      />

      <div className="surface">
        <div className="surface-body">
          <label className="input input-bordered flex items-center gap-2 max-w-sm">
            <Search size={16} className="opacity-50" />
            <input
              type="text"
              placeholder="Search by name or model…"
              className="grow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : planes.length === 0 ? (
        <EmptyState
          title="No planes found"
          description={search ? "Try a different search term." : "Once planes are added, they’ll show up here."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {planes.map((plane) => (
            <div
              key={plane.id}
              className="card bg-base-100 shadow hover:shadow-md transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="card-title text-base">{plane.name}</h2>
                    <p className="text-sm text-base-content/60">{plane.model}</p>
                  </div>
                  <Plane size={20} className="text-primary mt-1 shrink-0" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-outline">{plane.capacity} seats</span>
                  <span className="badge badge-outline">${plane.pricePerHour.toLocaleString()}/hr</span>
                  {!plane.isAvailable && (
                    <span className="badge badge-error badge-outline">Unavailable</span>
                  )}
                </div>
                {plane.description && (
                  <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                    {plane.description}
                  </p>
                )}
                <p className="text-xs text-base-content/40 mt-1">
                  Operated by {plane.airline?.name}
                </p>
                {user?.role === 'BOOKING' && plane.isAvailable && (
                  <div className="card-actions justify-end mt-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setBookingPlaneId(plane.id)}
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePlaneModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createPlaneMutation.mutate}
          loading={createPlaneMutation.isPending}
          error={
            createPlaneMutation.error instanceof Error
              ? createPlaneMutation.error.message
              : undefined
          }
        />
      )}
      {bookingPlaneId && (
        <BookPlaneModal
          planeId={bookingPlaneId}
          onClose={() => setBookingPlaneId(null)}
          onSubmit={bookMutation.mutate}
          loading={bookMutation.isPending}
        />
      )}
    </div>
  )
}

// ---- Create Plane Modal ----
function CreatePlaneModal({
  onClose,
  onSubmit,
  loading,
  error,
}: {
  onClose: () => void
  onSubmit: (d: unknown) => void
  loading: boolean
  error?: string
}) {
  const [form, setForm] = useState({
    name: '',
    model: '',
    capacity: '',
    pricePerHour: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
      pricePerHour: Number(form.pricePerHour),
    })
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <h3 className="font-bold text-lg mb-4">Add New Plane</h3>
        {error && (
          <div className="alert alert-error mb-3">
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="input input-bordered w-full"
            placeholder="Plane Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="input input-bordered w-full"
            placeholder="Model (e.g. Boeing 737)"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            required
          />
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Capacity (seats)"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
            min={1}
          />
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            placeholder="Price per Hour ($)"
            value={form.pricePerHour}
            onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            required
            min={0}
          />
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Create Plane'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

// ---- Book Plane Modal ----
function BookPlaneModal({
  planeId,
  onClose,
  onSubmit,
  loading,
}: {
  planeId: string
  onClose: () => void
  onSubmit: (d: unknown) => void
  loading: boolean
}) {
  const [form, setForm] = useState({ startDate: '', endDate: '', notes: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      planeId,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      notes: form.notes || undefined,
    })
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <h3 className="font-bold text-lg mb-4">Book This Plane</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              className="input input-bordered"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
