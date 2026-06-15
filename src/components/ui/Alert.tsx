import { useState } from 'react'
import { cn } from '@/lib/utils'

type AlertType = 'error' | 'warning' | 'success' | 'info'

interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  dismissible?: boolean
  className?: string
}

export function Alert({ type = 'info', title, message, dismissible = false, className }: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border',
        {
          'bg-red-light border-red text-red': type === 'error',
          'bg-yellow-light border-yellow text-yellow-dark': type === 'warning',
          'bg-green-light border-green text-green': type === 'success',
          'bg-blue-light border-blue text-blue': type === 'info',
        },
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {title && <p className="font-body font-semibold text-sm mb-0.5">{title}</p>}
        <p className="font-body text-sm">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
