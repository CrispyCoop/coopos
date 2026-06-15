import { formatGBP, formatPct, getMarginColour } from '@/lib/utils'

interface Props {
  revenue: number
  costOfGoods: number
}

export function ProfitIndicator({ revenue, costOfGoods }: Props) {
  const grossProfit = revenue - costOfGoods
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
  const colour = getMarginColour(margin)

  return (
    <div className="flex items-end gap-4">
      <div>
        <p className="font-body text-xs text-muted uppercase tracking-wide mb-0.5">Gross Profit</p>
        <span className={`font-display text-3xl ${colour}`}>{formatGBP(grossProfit)}</span>
      </div>
      <div className="mb-1">
        <span className={`font-mono text-sm font-medium ${colour}`}>{formatPct(margin)} margin</span>
      </div>
    </div>
  )
}
