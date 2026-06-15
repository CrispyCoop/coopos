import { useWasteLogs } from '@/lib/queries'
import { DonutChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'

const COLOURS = ['#D62828', '#FFC300', '#1A6B3C', '#1A4B8C', '#4A2080', '#F97316', '#64748B']

export function WasteByReason() {
  const { data } = useWasteLogs()

  const byReason: Record<string, number> = {}
  ;(data ?? []).forEach((w) => {
    const r = (w.reason as string) ?? 'Other'
    byReason[r] = (byReason[r] || 0) + Number(w.estimated_cost ?? 0)
  })

  const chartData = Object.entries(byReason)
    .map(([name, value], idx) => ({ name, value, colour: COLOURS[idx % COLOURS.length] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted font-body text-sm">
        No waste data yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DonutChart data={chartData} height={200} />
      <div className="space-y-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: d.colour }} />
              <span className="font-body text-xs text-dark">{d.name}</span>
            </div>
            <span className="font-mono text-xs text-muted">{formatGBP(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
