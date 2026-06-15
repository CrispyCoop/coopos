import { useTransactions } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

const VAT_RATE = 0.2

export function VATTracker() {
  const { data } = useTransactions()
  const records = data ?? []
  const today = todayISO()

  // Quarter: Jan-Mar (Q1), Apr-Jun (Q2), Jul-Sep (Q3), Oct-Dec (Q4)
  const month = new Date().getMonth() // 0-indexed
  const quarterStart = Math.floor(month / 3) * 3
  const year = new Date().getFullYear()
  const qStartDate = `${year}-${String(quarterStart + 1).padStart(2, '0')}-01`
  const qEndDate = `${year}-${String(quarterStart + 3).padStart(2, '0')}-${String(
    new Date(year, quarterStart + 3, 0).getDate()
  ).padStart(2, '0')}`

  const qRecords = records.filter((r) => r.date >= qStartDate && r.date <= qEndDate)
  const qIncome = qRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const qExpenses = qRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0)

  const vatOnSales = qIncome * VAT_RATE
  const vatOnPurchases = qExpenses * VAT_RATE
  const vatDue = vatOnSales - vatOnPurchases

  const thisMonth = today.slice(0, 7)
  const mRecords = records.filter((r) => r.date.startsWith(thisMonth))
  const mIncome = mRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const mVatOnSales = mIncome * VAT_RATE

  const quarterLabel = `Q${Math.floor(month / 3) + 1} ${year}`

  return (
    <Card title={`VAT Tracker — ${quarterLabel}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm font-body">
          <div className="space-y-2">
            <p className="text-xs text-muted uppercase tracking-wide">Output VAT (on sales)</p>
            <p className="font-mono font-semibold text-dark text-lg">{formatGBP(vatOnSales)}</p>
            <p className="text-xs text-muted">Based on {formatGBP(qIncome)} logged income</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted uppercase tracking-wide">Input VAT (reclaimable)</p>
            <p className="font-mono font-semibold text-dark text-lg">{formatGBP(vatOnPurchases)}</p>
            <p className="text-xs text-muted">Based on {formatGBP(qExpenses)} logged expenses</p>
          </div>
        </div>
        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="font-body text-sm text-dark font-medium">Net VAT Due</span>
          <span className={`font-mono text-lg font-semibold ${vatDue >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatGBP(Math.abs(vatDue))} {vatDue < 0 ? '(refund)' : 'owed'}
          </span>
        </div>
        <p className="text-xs text-muted border-t border-border pt-2">
          This month estimated output VAT: {formatGBP(mVatOnSales)} · Rates shown at 20% standard rate only.
          Consult your accountant for actual VAT filings.
        </p>
      </div>
    </Card>
  )
}
