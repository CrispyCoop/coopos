import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { SimpleBarChart } from '@/components/ui/Chart'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { DailyRevenueSummary } from '@/types/sales'

export function KPIDashboard() {
  const [days, setDays] = useState(30)

  const { data, isLoading } = useQuery({
    queryKey: ['kpi-revenue', days],
    queryFn: async () => {
      const from = new Date()
      from.setDate(from.getDate() - days + 1)
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('*')
        .gte('date', from.toISOString().split('T')[0])
        .lte('date', todayISO())
        .order('date', { ascending: true })
      if (error) throw error
      return data as DailyRevenueSummary[]
    },
  })

  const records = data ?? []
  const totalRevenue = records.reduce((s, r) => s + r.total_revenue, 0)
  const avgDaily = records.length > 0 ? totalRevenue / records.length : 0
  const peakDay = records.reduce((best, r) => r.total_revenue > (best?.total_revenue ?? 0) ? r : best, records[0])

  const revenueChart = records.map((r) => ({
    name: r.date.slice(5), // MM-DD
    value: r.total_revenue,
    colour: '#1A6B3C',
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          label="Days to show"
          type="number"
          min="7"
          max="365"
          value={String(days)}
          onChange={(e) => setDays(Number(e.target.value))}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">{days}-Day Revenue</p>
            <p className="font-mono font-semibold text-dark text-xl">{formatGBP(totalRevenue)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">Avg Daily</p>
            <p className="font-mono font-semibold text-dark text-xl">{formatGBP(avgDaily)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">Peak Day</p>
            <p className="font-mono font-semibold text-dark text-xl">
              {peakDay ? formatGBP(peakDay.total_revenue) : '—'}
            </p>
            {peakDay && <p className="font-body text-xs text-muted">{peakDay.date}</p>}
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : revenueChart.length > 0 ? (
        <Card title="Revenue Trend">
          <SimpleBarChart data={revenueChart} dataKey="value" xKey="name" colour="#1A6B3C" height={220} />
        </Card>
      ) : null}
    </div>
  )
}
