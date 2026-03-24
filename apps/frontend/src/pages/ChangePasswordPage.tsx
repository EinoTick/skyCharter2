import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { PageHeader } from '../components/ui/PageHeader'

export default function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  })
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.patch('/users/me/password', data),
    onSuccess: () => {
      setMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    },
    onError: (e: unknown) => {
      const errText =
        e instanceof Error && 'response' in e
          ? (e as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      setMsg({ type: 'error', text: errText ?? 'Failed to change password' })
    },
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    passwordMutation.mutate({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Password"
        subtitle="Update your account password."
        actions={
          <Link to="/settings" className="btn btn-ghost btn-sm">
            Back to Settings
          </Link>
        }
      />

      <div className="surface max-w-xl">
        <div className="surface-body">
          {msg && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} mb-3`}>
              <span>{msg.text}</span>
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

