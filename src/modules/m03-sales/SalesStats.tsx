import { useSalesRecords } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'

export function SalesStats() {
  const { data } = useSalesRecords(todayISO())
  const records = data ?? []

  const revenue = records.reduce((s, r) => s + Number(r.total), 0)
  const orders = records.length
  const avg = orders > 0 ? revenue / orders : 0
  const discount = records.reduce((s, r) => s + Number(r.discount ?? 0), 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Today Revenue" value={formatGBP(revenue)} accent="green" />
      <Stat label="Orders" value={String(orders)} accent="blue" />
      <Stat label="Avg Order" value={formatGBP(avg)} accent="blue" />
      <Stat label="Discounts Given" value={formatGBP(discount)} accent="red" />
    </div>
  )
}
