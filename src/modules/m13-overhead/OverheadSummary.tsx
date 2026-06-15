import { useOverheadItems } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { DonutChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'
import type { OverheadFrequency } from '@/types/finance'

const COLOURS = ['#1A4B8C', '#D62828', '#1A6B3C', '#FFC300', '#4A2080', '#F97316', '#64748B']

function toMonthly(amount: number, frequency: OverheadFrequency): number {
  switch (frequency) {
    case 'daily': return amount * 30.44
    case 'weekly': return amount * 4.33
    case 'monthly': return amount
    case 'annual': return amount / 12
  }
}

export function OverheadSummary() {
  const { data } = useOverheadItems()
  const items = data ?? []

  const byCat: Record<string, number> = {}
  items.forEach((item) => {
    const monthly = toMonthly(item.amount, item.frequency)
    byCat[item.category] = (byCat[item.category] || 0) + monthly
  })

  const totalMonthly = Object.values(byCat).reduce((s, v) => s + v, 0)
  const dueThisMonth = items.filter((i) => {
    if (!i.next_due_date) return false
    const today = new Date().toISOString().split('T')[0]
    const thisMonthEnd = today.slice(0, 7) + '-31'
    return i.next_due_date >= today && i.next_due_date <= thisMonthEnd
  })

  const chartData = Object.entries(byCat)
    .map(([name, value], idx) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      colour: COLOURS[idx % COLOURS.length],
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Stat label="Monthly Total" value={formatGBP(totalMonthly)} accent="red" />
        <Stat label="Annual Total" value={formatGBP(totalMonthly * 12)} accent="red" />
        <Stat label="Due This Month" value={String(dueThisMonth.length)} accent={dueThisMonth.length > 0 ? 'yellow' : 'green'} />
      </div>

      {chartData.length > 0 && (
        <div className="space-y-3">
          <DonutChart data={chartData} height={180} />
          <div className="space-y-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.colour }} />
                  <span className="font-body text-xs text-dark">{d.name}</span>
                </div>
                <span className="font-mono text-xs text-muted">{formatGBP(d.value)}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
