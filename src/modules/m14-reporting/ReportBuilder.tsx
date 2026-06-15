import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SimpleBarChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'
import type { DailyRevenueSummary } from '@/types/sales'

const METRIC_OPTIONS = [
  { value: 'total_revenue', label: 'Total Revenue' },
  { value: 'total_orders', label: 'Total Orders' },
]

const GROUP_OPTIONS = [
  { value: 'day', label: 'By Day' },
  { value: 'week', label: 'By Week' },
]

export function ReportBuilder() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [metric, setMetric] = useState('total_revenue')
  const [groupBy, setGroupBy] = useState('day')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['report-builder', from, to, metric],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('date, total_revenue, total_orders')
        .gte('date', from)
        .lte('date', to)
        .order('date', { ascending: true })
      if (error) throw error
      return data as Pick<DailyRevenueSummary, 'date' | 'total_revenue' | 'total_orders'>[]
    },
    enabled: false,
  })

  const chartData = (() => {
    if (!data) return []
    if (groupBy === 'day') {
      return data.map((r) => ({
        name: r.date.slice(5),
        value: metric === 'total_revenue' ? r.total_revenue : r.total_orders,
      }))
    }
    // Group by week
    const weeks: Record<string, number> = {}
    data.forEach((r) => {
      const d = new Date(r.date)
      d.setDate(d.getDate() - d.getDay() + 1)
      const wk = d.toISOString().split('T')[0]
      const val = metric === 'total_revenue' ? r.total_revenue : r.total_orders
      weeks[wk] = (weeks[wk] || 0) + val
    })
    return Object.entries(weeks).map(([wk, v]) => ({ name: wk.slice(5), value: v }))
  })()

  const total = chartData.reduce((s, d) => s + (d.value as number), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Select
          label="Metric"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        />
        <Select
          label="Group By"
          options={GROUP_OPTIONS}
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        />
      </div>
      <Button onClick={() => refetch()} loading={isLoading}>Run Report</Button>

      {data && (
        <>
          <div className="flex items-center gap-3 py-2 border-b border-border">
            <span className="font-body text-sm text-muted">Total:</span>
            <span className="font-mono font-semibold text-dark">
              {metric === 'total_revenue' ? formatGBP(total) : String(total)}
            </span>
            <span className="font-body text-sm text-muted">over {data.length} days</span>
          </div>
          {chartData.length > 0 && (
            <SimpleBarChart
              data={chartData}
              dataKey="value"
              xKey="name"
              colour="#1A4B8C"
              height={200}
              formatValue={metric === 'total_revenue' ? (v) => `£${v.toFixed(0)}` : undefined}
            />
          )}
        </>
      )}
    </div>
  )
}
