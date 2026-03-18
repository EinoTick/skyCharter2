import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { UserRole } from '@skycharter/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { UserEditDialog } from '../components/UserEditDialog'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
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
  const isAdmin = currentUser?.role === UserRole.ADMIN

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  })

  const counts = {
    total: users.length,
    [UserRole.ADMIN]: users.filter((u) => u.role === UserRole.ADMIN).length,
    [UserRole.AIRLINE]: users.filter((u) => u.role === UserRole.AIRLINE).length,
    [UserRole.BOOKING]: users.filter((u) => u.role === UserRole.BOOKING).length,
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Manage access and review account roles." />

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
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="When users register, they’ll appear here." />
      ) : (
        <div className="surface overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
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
      )}

      <UserEditDialog
        user={
          selectedUser
            ? { id: selectedUser.id, name: selectedUser.name, email: selectedUser.email, role: selectedUser.role }
            : null
        }
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ['users'] })
          qc.invalidateQueries({ queryKey: ['bookings'] })
        }}
      />
    </div>
  )
}
