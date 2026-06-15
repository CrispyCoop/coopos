import { useRotaWeeks } from '@/lib/queries'
import { SimpleBarChart } from '@/components/ui/Chart'

export function LabourCostBar() {
  const { data: weeks } = useRotaWeeks()
  const recentWeeks = (weeks ?? []).slice(0, 4).reverse()

  const chartData = recentWeeks.map((w) => ({
    name: w.week_start_date.slice(5),
    value: 0,
    colour: '#1A4B8C',
  }))

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted font-body text-sm">
        No rota weeks to display
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="font-body text-xs text-muted">Estimated labour cost by week (from rota shifts)</p>
      <SimpleBarChart data={chartData} dataKey="value" xKey="name" colour="#1A4B8C" height={150} />
    </div>
  )
}
