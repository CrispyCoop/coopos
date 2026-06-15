import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  action?: React.ReactNode
  accent?: 'red' | 'yellow' | 'green' | 'blue' | 'purple'
  className?: string
  children: React.ReactNode
}

export function Card({ title, action, accent, className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-border overflow-hidden',
        accent && 'border-l-4',
        accent === 'red' && 'border-l-red',
        accent === 'yellow' && 'border-l-yellow',
        accent === 'green' && 'border-l-green',
        accent === 'blue' && 'border-l-blue',
        accent === 'purple' && 'border-l-purple',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          {title && <h3 className="font-display text-lg text-dark">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
