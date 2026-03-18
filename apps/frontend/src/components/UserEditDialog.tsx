import React, { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { UserRole, UserRoleSchema } from '@skycharter/shared-types'

type EditableUser = {
  id: string
  name: string
  email: string
  role: string
}

export function UserEditDialog({
  user,
  open,
  onClose,
  onSaved,
}: {
  user: EditableUser | null
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [form, setForm] = useState({ name: '', email: '', role: UserRole.BOOKING as string })

  useEffect(() => {
    if (!user) return
    setForm({ name: user.name ?? '', email: user.email ?? '', role: user.role ?? UserRole.BOOKING })
  }, [user])

  const roles = useMemo(
    () =>
      Object.values(UserRoleSchema.options).map((r) => ({
        value: r,
        label: r,
      })),
    []
  )

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      return api.patch(`/users/${user.id}`, {
        name: form.name,
        email: form.email,
        role: form.role,
      })
    },
    onSuccess: () => {
      onSaved?.()
      onClose()
    },
  })

  const errorText =
    updateMutation.error instanceof Error && 'response' in updateMutation.error
      ? (updateMutation.error as { response?: { data?: { error?: string } } }).response?.data?.error
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : undefined

  if (!open) return null

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Edit User</h3>
        <p className="text-sm text-base-content/60 mt-1">Update name, email, and role.</p>

        {errorText ? (
          <div className="alert alert-error mt-4">
            <span>{errorText}</span>
          </div>
        ) : null}

        <form
          className="space-y-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault()
            updateMutation.mutate()
          }}
        >
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              minLength={2}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending || !user}>
              {updateMutation.isPending ? <span className="loading loading-spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

