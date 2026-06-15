import { useTransactions } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

export function FinanceStats() {
  const { data } = useTransactions()
  const records = data ?? []
  const today = todayISO()
  const thisMonth = today.slice(0, 7) // YYYY-MM

  const monthlyRecords = records.filter((r) => r.date.startsWith(thisMonth))
  const income = monthlyRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expenses = monthlyRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const net = income - expenses
  const vatDue = income * 0.2 // simplified 20% VAT estimate on income

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Month Income" value={formatGBP(income)} accent="green" />
      <Stat label="Month Expenses" value={formatGBP(expenses)} accent="red" />
      <Stat label="Net P&L" value={formatGBP(net)} accent={net >= 0 ? 'green' : 'red'} />
      <Stat label="VAT Estimate" value={formatGBP(vatDue)} accent="blue" />
    </div>
  )
}
