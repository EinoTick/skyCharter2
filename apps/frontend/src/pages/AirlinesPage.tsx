import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '@skycharter/shared-types'
import { api } from '../lib/api'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

type Airline = {
  id: string
  name: string
  email: string
  createdAt: string
  _count: { planes: number }
}

export default function AirlinesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null)

  const { data: airlines = [], isLoading } = useQuery<Airline[]>({
    queryKey: ['airlines'],
    queryFn: () => api.get('/airlines').then((r) => r.data),
  })

  const isAdmin = user?.role === UserRole.ADMIN

  return (
    <div className="space-y-6">
      <PageHeader
        title="Airlines"
        subtitle={isAdmin ? 'Manage airline accounts.' : 'Your airline profile details.'}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : airlines.length === 0 ? (
        <EmptyState title="No airlines found" description="Airline accounts will appear here." />
      ) : isAdmin ? (
        <div className="surface overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Planes</th>
                <th className="hidden sm:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {airlines.map((a) => (
                <tr key={a.id} className="cursor-pointer" onClick={() => setSelectedAirline(a)}>
                  <td className="font-medium">{a.name}</td>
                  <td className="text-sm">{a.email}</td>
                  <td>{a._count.planes}</td>
                  <td className="hidden sm:table-cell text-sm text-base-content/60">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="surface max-w-xl">
          <div className="surface-body space-y-2">
            <h2 className="card-title text-base">{airlines[0].name}</h2>
            <p className="text-sm text-base-content/70">{airlines[0].email}</p>
            <p className="text-sm text-base-content/70">Planes: {airlines[0]._count.planes}</p>
            <p className="text-xs text-base-content/50">
              Created{' '}
              {new Date(airlines[0].createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      <EditAirlineDialog
        airline={selectedAirline}
        open={!!selectedAirline}
        onClose={() => setSelectedAirline(null)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['airlines'] })}
      />
    </div>
  )
}

function EditAirlineDialog({
  airline,
  open,
  onClose,
  onSaved,
}: {
  airline: Airline | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!airline) return
      await api.patch(`/airlines/${airline.id}`, { name })
    },
    onSuccess: () => {
      onSaved()
      onClose()
    },
  })

  useEffect(() => {
    if (airline) setName(airline.name)
  }, [airline])

  if (!open || !airline) return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit Airline</h3>
        <p className="text-sm text-base-content/60 mt-1">{airline.email}</p>
        <form
          className="space-y-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <input
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            required
          />
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? <span className="loading loading-spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

