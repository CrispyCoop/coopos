import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon = '📋', title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <span className="text-4xl mb-4" role="img" aria-hidden="true">{icon}</span>
      <h3 className="font-display text-xl text-dark mb-2">{title}</h3>
      {message && <p className="font-body text-sm text-muted max-w-sm mb-6">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-red text-white font-body font-medium px-5 py-2.5 rounded-lg hover:bg-red-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
