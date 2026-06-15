import { useTransactions } from '@/lib/queries'
import { DonutChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { TransactionCategory } from '@/types/finance'

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food_cost: 'Food Cost',
  labour: 'Labour',
  rent: 'Rent',
  utilities: 'Utilities',
  marketing: 'Marketing',
  equipment: 'Equipment',
  other: 'Other',
}

const COLOURS = ['#D62828', '#FFC300', '#1A4B8C', '#1A6B3C', '#4A2080', '#F97316', '#64748B']

export function TransactionsByCategory() {
  const { data } = useTransactions()
  const thisMonth = todayISO().slice(0, 7)

  const expenses = (data ?? []).filter((r) => r.type === 'expense' && r.date.startsWith(thisMonth))

  const byCat: Record<string, number> = {}
  expenses.forEach((r) => {
    byCat[r.category] = (byCat[r.category] || 0) + r.amount
  })

  const chartData = Object.entries(byCat)
    .map(([cat, value], idx) => ({
      name: CATEGORY_LABELS[cat as TransactionCategory] ?? cat,
      value,
      colour: COLOURS[idx % COLOURS.length],
    }))
    .sort((a, b) => b.value - a.value)

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted font-body text-sm">
        No expenses logged this month
      </div>
    )
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
