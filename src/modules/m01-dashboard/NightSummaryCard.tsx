import { useNightSummary } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime, formatGBP, formatPct } from '@/lib/utils'

interface Props { date: string }

export function NightSummaryCard({ date }: Props) {
  const { data, isLoading } = useNightSummary(date)

  if (isLoading) return <div className="animate-pulse h-24 bg-surface rounded-xl" />
  if (!data) {
    return (
      <Card title="Night Summary">
        <p className="font-body text-sm text-muted">No night summary yet — runs at 10:30 PM via Edge Function.</p>
      </Card>
    )
  }

  return (
    <Card
      title="Night Summary"
      action={<Badge variant="blue">AI Generated</Badge>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-lg p-3">
          <p className="font-body text-xs text-muted mb-0.5">Revenue</p>
          <p className="font-mono text-sm font-medium text-dark">{formatGBP(data.revenue ?? 0)}</p>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <p className="font-body text-xs text-muted mb-0.5">Net Profit</p>
          <p className="font-mono text-sm font-medium text-dark">{formatGBP(data.net_profit ?? 0)}</p>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <p className="font-body text-xs text-muted mb-0.5">Food Cost</p>
          <p className="font-mono text-sm font-medium text-dark">{formatPct(data.food_cost_pct ?? 0)}</p>
        </div>
        <div className="bg-surface rounded-lg p-3">
          <p className="font-body text-xs text-muted mb-0.5">Waste</p>
          <p className="font-mono text-sm font-medium text-dark">{formatGBP(data.waste_cost ?? 0)}</p>
        </div>
      </div>
      {data.best_selling_item && (
        <p className="font-body text-xs text-muted mt-3">Top item: <span className="text-dark font-medium">{data.best_selling_item}</span></p>
      )}
      {data.generated_at && (
        <p className="font-mono text-xs text-muted mt-2">{formatDateTime(data.generated_at)}</p>
      )}
    </Card>
  )
}
