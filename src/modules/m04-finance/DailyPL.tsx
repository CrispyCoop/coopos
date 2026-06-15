import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Stat } from '@/components/ui/Stat'
import { Input } from '@/components/ui/Input'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { Transaction } from '@/types/finance'
import type { DailyRevenueSummary } from '@/types/sales'

export function DailyPL() {
  const [date, setDate] = useState(todayISO())

  const { data: revenue } = useQuery({
    queryKey: ['daily-revenue-summary', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('*')
        .eq('date', date)
        .maybeSingle()
      if (error) throw error
      return data as DailyRevenueSummary | null
    },
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions-date', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('date', date)
      if (error) throw error
      return data as Transaction[]
    },
  })

  const totalRevenue = revenue?.total_revenue ?? 0
  const dailyExpenses = (transactions ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const dailyIncome = (transactions ?? [])
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const grossProfit = totalRevenue - totalRevenue * 0.38 // estimated food cost at 38%
  const netProfit = grossProfit + dailyIncome - dailyExpenses
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  return (
    <Card title="Daily P&L">
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-xs"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Total Revenue" value={formatGBP(totalRevenue)} accent="green" />
          <Stat label="Est. Food Cost (38%)" value={formatGBP(totalRevenue * 0.38)} accent="red" />
          <Stat label="Gross Profit" value={formatGBP(grossProfit)} accent="green" />
          <Stat label="Other Expenses" value={formatGBP(dailyExpenses)} accent="red" />
          <Stat label="Other Income" value={formatGBP(dailyIncome)} accent="green" />
          <Stat label="Net Profit" value={formatGBP(netProfit)} accent={netProfit >= 0 ? 'green' : 'red'} />
        </div>
        <div className="flex items-center gap-2 text-sm font-body text-muted">
          <span>Gross Margin:</span>
          <span className={`font-mono font-medium ${grossMarginPct >= 60 ? 'text-green-600' : 'text-red-500'}`}>
            {grossMarginPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  )
}
