import { SimpleBarChart } from '@/components/ui/Chart'
import { useWeeklyRevenue } from '@/lib/queries'
import { formatGBP } from '@/lib/utils'

export function WeeklySparkline() {
  const { data, isLoading } = useWeeklyRevenue()

  if (isLoading) return <div className="animate-pulse h-32 bg-surface rounded-lg" />

  const chartData = (data ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' }),
    value: d.total_revenue,
  }))

  const total = (data ?? []).reduce((s, d) => s + Number(d.total_revenue), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs text-muted uppercase tracking-wide">This Week</span>
        <span className="font-mono text-sm font-medium text-dark">{formatGBP(total)}</span>
      </div>
      <SimpleBarChart data={chartData} dataKey="value" xKey="date" height={80} colour="#D62828" />
    </div>
  )
}
