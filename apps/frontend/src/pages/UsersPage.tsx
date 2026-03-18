import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { UserRole } from '@skycharter/shared-types'

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
      <h1 className="text-2xl font-bold">Users</h1>

      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-lg">{counts.total}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5">
          <div className="stat-title text-xs">Admins</div>
          <div className="stat-value text-lg text-error">{counts[UserRole.ADMIN]}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5">
          <div className="stat-title text-xs">Airlines</div>
          <div className="stat-value text-lg text-info">{counts[UserRole.AIRLINE]}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-5">
          <div className="stat-title text-xs">Booking Users</div>
          <div className="stat-value text-lg text-success">{counts[UserRole.BOOKING]}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-base-content/50">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td className="text-sm">{u.email}</td>
                  <td>
                    <span className={`badge badge-sm ${roleBadge[u.role] ?? 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/60">
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
    </div>
  )
}
