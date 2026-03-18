import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  })
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )
  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const profileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string }) => api.patch('/users/me', data),
    onSuccess: () => setProfileMsg({ type: 'success', text: 'Profile updated successfully!' }),
    onError: (e: unknown) => {
      const msg =
        e instanceof Error && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setProfileMsg({ type: 'error', text: msg ?? 'Update failed' })
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/me/password', data),
    onSuccess: () => {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    },
    onError: (e: unknown) => {
      const msg =
        e instanceof Error && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setPasswordMsg({ type: 'error', text: msg ?? 'Failed to change password' })
    },
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    passwordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
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

      {/* Change Password */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-base">Change Password</h2>
          {passwordMsg && (
            <div className={`alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{passwordMsg.text}</span>
            </div>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Current Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? <span className="loading loading-spinner" /> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
