import { useSalesRecords } from '@/lib/queries'
import { DonutChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'
import { CHANNEL_LABELS } from '@/lib/constants'
import { todayISO } from '@/lib/utils'
import type { Channel } from '@/types/sales'

const COLOURS = ['#D62828', '#FFC300', '#1A6B3C', '#1A4B8C', '#4A2080', '#F97316', '#64748B', '#0EA5E9']

export function SalesByChannel() {
  const { data } = useSalesRecords(todayISO())

  const byChannel: Record<string, number> = {}
  ;(data ?? []).forEach((r) => {
    byChannel[r.channel] = (byChannel[r.channel] || 0) + Number(r.total)
  })

  const chartData = Object.entries(byChannel)
    .map(([channel, value], idx) => ({
      name: CHANNEL_LABELS[channel as Channel] ?? channel,
      value,
      colour: COLOURS[idx % COLOURS.length],
    }))
    .sort((a, b) => b.value - a.value)

  if (!chartData.length) {
    return <div className="flex items-center justify-center h-32 text-muted font-body text-sm">No sales today</div>
  }

  return (
    <div className="space-y-4">
      <DonutChart data={chartData} height={180} />
      <div className="space-y-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.colour }} />
              <span className="font-body text-xs text-dark">{d.name}</span>
            </div>
            <span className="font-mono text-xs text-muted">{formatGBP(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
