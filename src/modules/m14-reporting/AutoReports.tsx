import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { DailyRevenueSummary } from '@/types/sales'
import type { Transaction } from '@/types/finance'

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function AutoReports() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const today = todayISO()
  const thisMonth = today.slice(0, 7)

  const { data: revenue } = useQuery({
    queryKey: ['report-revenue', thisMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('*')
        .gte('date', `${thisMonth}-01`)
        .lte('date', `${thisMonth}-31`)
        .order('date')
      if (error) throw error
      return data as DailyRevenueSummary[]
    },
  })

  const { data: transactions } = useQuery({
    queryKey: ['report-transactions', thisMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('date', `${thisMonth}-01`)
        .lte('date', `${thisMonth}-31`)
        .order('date')
      if (error) throw error
      return data as Transaction[]
    },
  })

  const handleRevenueReport = async () => {
    setDownloading('revenue')
    downloadCSV(
      `revenue-report-${thisMonth}.csv`,
      ['Date', 'Total Revenue', 'Total Orders'],
      (revenue ?? []).map((r) => [r.date, String(r.total_revenue), String(r.total_orders)])
    )
    setDownloading(null)
  }

  const handleTransactionReport = async () => {
    setDownloading('transactions')
    downloadCSV(
      `transactions-report-${thisMonth}.csv`,
      ['Date', 'Type', 'Category', 'Amount', 'Description', 'Reference'],
      (transactions ?? []).map((r) => [
        r.date, r.type, r.category, String(r.amount), r.description ?? '', r.reference ?? ''
      ])
    )
    setDownloading(null)
  }

  const monthRevenue = (revenue ?? []).reduce((s, r) => s + r.total_revenue, 0)
  const monthIncome = (transactions ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = (transactions ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">Month Revenue</p>
            <p className="font-mono font-semibold text-dark">{formatGBP(monthRevenue)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">Month Expenses</p>
            <p className="font-mono font-semibold text-red-600">{formatGBP(monthExpenses)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center py-2">
            <p className="font-body text-xs text-muted">Net P&L</p>
            <p className={`font-mono font-semibold ${monthRevenue + monthIncome - monthExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatGBP(monthRevenue + monthIncome - monthExpenses)}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <p className="font-body text-sm font-medium text-dark">Download Reports — {thisMonth}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-surface rounded-xl flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-dark">Revenue Summary</p>
              <p className="font-body text-xs text-muted">{(revenue ?? []).length} days · CSV</p>
            </div>
            <Button size="sm" onClick={handleRevenueReport} loading={downloading === 'revenue'}>
              Download
            </Button>
          </div>
          <div className="p-4 bg-surface rounded-xl flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-dark">Transactions Report</p>
              <p className="font-body text-xs text-muted">{(transactions ?? []).length} records · CSV</p>
            </div>
            <Button size="sm" onClick={handleTransactionReport} loading={downloading === 'transactions'}>
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="font-body text-xs text-blue-700">
          📊 Advanced PDF reports (P&L statements, tax summaries, staff payroll) are coming in Phase 3.
        </p>
      </div>
    </div>
  )
}
