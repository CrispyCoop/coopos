import { cn } from '@/lib/utils'

interface StatProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  accent?: 'red' | 'green' | 'yellow' | 'blue'
  className?: string
}

export function Stat({ label, value, unit, trend, trendLabel, accent, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <p className="font-body text-xs text-muted uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-display text-3xl leading-none',
            accent === 'red' && 'text-red',
            accent === 'green' && 'text-green',
            accent === 'yellow' && 'text-yellow-dark',
            accent === 'blue' && 'text-blue',
            !accent && 'text-dark'
          )}
        >
          {value}
        </span>
        {unit && <span className="font-mono text-sm text-muted">{unit}</span>}
      </div>
      {trendLabel && (
        <p
          className={cn(
            'font-body text-xs',
            trend === 'up' && 'text-green',
            trend === 'down' && 'text-red',
            trend === 'neutral' && 'text-muted'
          )}
        >
          {trend === 'up' && '↑ '}{trend === 'down' && '↓ '}{trendLabel}
        </p>
      )}
    </div>
  )
}
