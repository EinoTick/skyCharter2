import React from 'react'

export function Surface({
  title,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={['surface', className].filter(Boolean).join(' ')}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          {title ? <h2 className="font-semibold leading-6">{title}</h2> : <div />}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className="surface-body">{children}</div>
    </section>
  )
}

