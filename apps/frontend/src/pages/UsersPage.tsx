import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { UserRole } from '@skycharter/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { UserEditDialog } from '../components/UserEditDialog'
import { Plus, X } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  createdAt: string
}

type PaginatedUsers = {
  items: User[]
  total: number
  page: number
  size: number
  countsByRole: Record<string, number>
}

const roleBadge: Record<string, string> = {
  ADMIN: 'badge-error',
  AIRLINE: 'badge-info',
  BOOKING: 'badge-success',
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const qc = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const isAdmin = currentUser?.role === UserRole.ADMIN
  const [page, setPage] = useState(1)
  const size = 50

  const { data, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ['users', page, size],
    queryFn: () => api.get('/users', { params: { page, size } }).then((r) => r.data),
  })

  const users = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / size))
  const countsByRole = data?.countsByRole ?? {}

  const counts = {
    total,
    [UserRole.ADMIN]: countsByRole[UserRole.ADMIN] ?? 0,
    [UserRole.AIRLINE]: countsByRole[UserRole.AIRLINE] ?? 0,
    [UserRole.BOOKING]: countsByRole[UserRole.BOOKING] ?? 0,
  }

  const createUserMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; role: string }) =>
      api.post('/users', payload),
    onSuccess: () => {
      setShowCreateUser(false)
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage access and review account roles."
        actions={
          isAdmin ? (
            <button className="btn btn-primary btn-sm gap-2" onClick={() => setShowCreateUser(true)}>
              <Plus size={16} /> Create User
            </button>
          ) : null
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5 w-full">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-lg">{counts.total}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5 w-full">
          <div className="stat-title text-xs">Admins</div>
          <div className="stat-value text-lg text-error">{counts[UserRole.ADMIN]}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5 w-full">
          <div className="stat-title text-xs">Airlines</div>
          <div className="stat-value text-lg text-info">{counts[UserRole.AIRLINE]}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5 w-full">
          <div className="stat-title text-xs">Booking Users</div>
          <div className="stat-value text-lg text-success">{counts[UserRole.BOOKING]}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : total === 0 ? (
        <EmptyState title="No users found" description="When users register, they’ll appear here." />
      ) : (
        <div className="space-y-3">
          <div className="surface overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th className="hidden md:table-cell">Phone</th>
                  <th>Role</th>
                  <th className="hidden sm:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={isAdmin ? 'cursor-pointer' : undefined}
                    onClick={() => {
                      if (!isAdmin) return
                      setSelectedUser(u)
                    }}
                  >
                    <td className="font-medium">{u.name}</td>
                    <td className="text-sm">{u.email}</td>
                    <td className="hidden md:table-cell text-sm">{u.phone || '—'}</td>
                    <td>
                      <span className={`badge badge-sm ${roleBadge[u.role] ?? 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-sm text-base-content/60">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
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

      <UserEditDialog
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email,
                phone: selectedUser.phone,
                role: selectedUser.role,
              }
            : null
        }
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['users'] })
          qc.invalidateQueries({ queryKey: ['bookings'] })
        }}
      />

      {showCreateUser && (
        <CreateUserDialog
          onClose={() => setShowCreateUser(false)}
          onSubmit={createUserMutation.mutate}
          loading={createUserMutation.isPending}
          error={
            createUserMutation.error instanceof Error
              ? createUserMutation.error.message
              : undefined
          }
        />
      )}
    </div>
  )
}

function CreateUserDialog({
  onClose,
  onSubmit,
  loading,
  error,
}: {
  onClose: () => void
  onSubmit: (d: { name: string; email: string; phone?: string; password: string; role: string }) => void
  loading: boolean
  error?: string
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.BOOKING as string,
  })

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>
          <X size={16} />
        </button>
        <h3 className="font-bold text-lg">Create User</h3>
        {error ? (
          <div className="alert alert-error mt-3">
            <span>{error}</span>
          </div>
        ) : null}
        <form
          className="space-y-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ ...form, phone: form.phone || undefined })
          }}
        >
          <input
            className="input input-bordered w-full"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
            minLength={2}
          />
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            type="tel"
            className="input input-bordered w-full"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            required
            minLength={8}
          />
          <select
            className="select select-bordered w-full"
            value={form.role}
            onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          >
            <option value={UserRole.BOOKING}>BOOKING</option>
            <option value={UserRole.AIRLINE}>AIRLINE</option>
            <option value={UserRole.ADMIN}>ADMIN</option>
          </select>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Create User'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
