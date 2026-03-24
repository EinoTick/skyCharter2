import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/ui/PageHeader'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  const profileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; phone?: string }) => api.patch('/users/me', data),
    onSuccess: () => setProfileMsg({ type: 'success', text: 'Profile updated successfully!' }),
    onError: (e: unknown) => {
      const msg =
        e instanceof Error && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setProfileMsg({ type: 'error', text: msg ?? 'Update failed' })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile details."
        actions={
          <Link to="/settings/password" className="btn btn-outline btn-primary btn-sm">
            Change Password
          </Link>
        }
      />

      {/* Profile */}
      <div className="surface max-w-xl">
        <div className="surface-body">
          <h2 className="card-title text-base">Profile</h2>
          {profileMsg && (
            <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{profileMsg.text}</span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              profileMutation.mutate(profile)
            }}
            className="space-y-3"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                className="input input-bordered"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone</span>
              </label>
              <input
                type="tel"
                className="input input-bordered"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Role</span>
              </label>
              <input
                className="input input-bordered"
                value={user?.role ?? ''}
                disabled
                readOnly
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? <span className="loading loading-spinner" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
