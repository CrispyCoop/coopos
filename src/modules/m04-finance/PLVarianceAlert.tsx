import { useTransactions } from '@/lib/queries'
import { useBusinessSettings } from '@/lib/queries'
import { todayISO } from '@/lib/utils'
import { formatGBP } from '@/lib/utils'

export function PLVarianceAlert() {
  const { data: transactions } = useTransactions()
  const { data: settings } = useBusinessSettings()

  const today = todayISO()
  const thisMonth = today.slice(0, 7)

  const mRecords = (transactions ?? []).filter((r) => r.date.startsWith(thisMonth))
  const income = mRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  const expenses = mRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const net = income - expenses

  const revenueTarget = Number(settings?.['daily_revenue_target'] ?? 0) * 30
  const variance = income - revenueTarget
  const variancePct = revenueTarget > 0 ? (variance / revenueTarget) * 100 : 0

  if (revenueTarget === 0) return null

  const isBelow = variance < 0
  const isSignificant = Math.abs(variancePct) >= 5

  if (!isSignificant) return null

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
      isBelow ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <span className="text-xl">{isBelow ? '⚠️' : '✅'}</span>
      <div>
        <p className={`font-body text-sm font-semibold ${isBelow ? 'text-red-700' : 'text-green-700'}`}>
          {isBelow ? 'Income below monthly target' : 'Income tracking above target'}
        </p>
        <p className="font-body text-xs text-muted mt-0.5">
          This month: {formatGBP(income)} vs target {formatGBP(revenueTarget)} —{' '}
          <span className={isBelow ? 'text-red-600' : 'text-green-600'}>
            {isBelow ? '↓' : '↑'} {Math.abs(variancePct).toFixed(1)}%
          </span>
          {' '}· Net P&L: {formatGBP(net)}
        </p>
      </div>
    </div>
  )
}
