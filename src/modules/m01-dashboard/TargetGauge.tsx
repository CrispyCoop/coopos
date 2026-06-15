import { formatGBP, formatPct } from '@/lib/utils'

interface Props {
  actual: number
  target: number
}

export function TargetGauge({ actual, target }: Props) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0
  const over = actual > target
  const colour = pct >= 100 ? 'bg-green' : pct >= 75 ? 'bg-yellow' : pct >= 50 ? 'bg-amber-500' : 'bg-red'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-muted uppercase tracking-wide">Daily Target</span>
        <span className={`font-mono text-xs font-medium ${over ? 'text-green-600' : 'text-muted'}`}>
          {formatPct(pct)} {over && '✓'}
        </span>
      </div>
      <div className="h-3 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className={`h-full ${colour} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-dark">{formatGBP(actual)}</span>
        <span className="font-mono text-xs text-muted">Target: {formatGBP(target)}</span>
      </div>
    </div>
  )
}
