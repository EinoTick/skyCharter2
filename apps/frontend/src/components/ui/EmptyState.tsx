import React from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="surface">
      <div className="surface-body text-center py-12">
        <div className="mx-auto max-w-md">
          <p className="font-semibold">{title}</p>
          {description ? <p className="mt-1 text-sm text-base-content/60">{description}</p> : null}
          {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}

