import React from 'react'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="toolbar">
      <div className="min-w-0">
        <h1 className="page-title truncate">{title}</h1>
        {subtitle ? <p className="page-subtitle mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}

