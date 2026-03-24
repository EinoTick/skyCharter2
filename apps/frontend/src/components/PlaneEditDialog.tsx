import React, { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

type EditablePlane = {
  id: string
  name: string
  model: string
  capacity: number
  pricePerHour: number
  description?: string
  isAvailable: boolean
}

export function PlaneEditDialog({
  plane,
  open,
  onClose,
  onSaved,
}: {
  plane: EditablePlane | null
  open: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    model: '',
    capacity: '',
    pricePerHour: '',
    description: '',
    isAvailable: true,
  })

  useEffect(() => {
    if (!plane) return
    setForm({
      name: plane.name ?? '',
      model: plane.model ?? '',
      capacity: String(plane.capacity ?? ''),
      pricePerHour: String(plane.pricePerHour ?? ''),
      description: plane.description ?? '',
      isAvailable: !!plane.isAvailable,
    })
  }, [plane])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!plane) return
      return api.patch(`/planes/${plane.id}`, {
        name: form.name,
        model: form.model,
        capacity: Number(form.capacity),
        pricePerHour: Number(form.pricePerHour),
        description: form.description || undefined,
        isAvailable: form.isAvailable,
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
        <h3 className="font-bold text-lg">Edit Plane</h3>
        <p className="text-sm text-base-content/60 mt-1">Update details and availability.</p>

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
          <input
            className="input input-bordered w-full"
            placeholder="Plane Name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />

          <input
            className="input input-bordered w-full"
            placeholder="Model"
            value={form.model}
            onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              className="input input-bordered w-full"
              placeholder="Capacity"
              value={form.capacity}
              onChange={(e) => setForm((s) => ({ ...s, capacity: e.target.value }))}
              required
              min={1}
            />
            <input
              type="number"
              step="0.01"
              className="input input-bordered w-full"
              placeholder="Price / hour"
              value={form.pricePerHour}
              onChange={(e) => setForm((s) => ({ ...s, pricePerHour: e.target.value }))}
              required
              min={0}
            />
          </div>

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />

          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={form.isAvailable}
              onChange={(e) => setForm((s) => ({ ...s, isAvailable: e.target.checked }))}
            />
            <span className="label-text">Available for booking</span>
          </label>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending || !plane}>
              {updateMutation.isPending ? <span className="loading loading-spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}

