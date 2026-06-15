import { cn } from '@/lib/utils'

type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'grey'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'grey', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full font-mono text-xs font-medium',
        {
          'bg-green-light text-green': variant === 'green',
          'bg-red-light text-red': variant === 'red',
          'bg-yellow-light text-yellow-dark': variant === 'amber',
          'bg-blue-light text-blue': variant === 'blue',
          'bg-purple-light text-purple': variant === 'purple',
          'bg-surface text-muted': variant === 'grey',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
