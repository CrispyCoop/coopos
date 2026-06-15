import { useWasteLogs } from '@/lib/queries'
import { SimpleBarChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'

export function WasteTrend() {
  const { data } = useWasteLogs()

  const byDate: Record<string, number> = {}
  ;(data ?? []).forEach((w) => {
    const date = w.logged_at?.toString().slice(0, 10) ?? ''
    if (date) byDate[date] = (byDate[date] || 0) + Number(w.estimated_cost ?? 0)
  })

  const chartData = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, value]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      value,
    }))

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted font-body text-sm">
        No trend data yet
      </div>
    )
  }

  const total = chartData.reduce((s, d) => s + d.value, 0)
  const avg = total / chartData.length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-muted">
        <span>Last 14 days: {formatGBP(total)}</span>
        <span>Avg/day: {formatGBP(avg)}</span>
      </div>
      <SimpleBarChart data={chartData} dataKey="value" xKey="date" height={120} colour="#D62828" />
    </div>
  )
}
