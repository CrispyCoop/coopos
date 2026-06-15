import { useWasteLogs } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { formatGBP, todayISO } from '@/lib/utils'

export function WasteStats() {
  const { data } = useWasteLogs()
  const today = todayISO()

  const todayWaste = (data ?? []).filter((w) => w.logged_at?.toString().startsWith(today))
  const todayCost = todayWaste.reduce((s, w) => s + Number(w.estimated_cost ?? 0), 0)
  const weekCost = (data ?? []).reduce((s, w) => s + Number(w.estimated_cost ?? 0), 0)
  const topReason = (() => {
    const counts: Record<string, number> = {}
    ;(data ?? []).forEach((w) => { if (w.reason) counts[w.reason as string] = (counts[w.reason as string] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  })()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Today's Waste Cost" value={formatGBP(todayCost)} accent="red" />
      <Stat label="Week Waste Cost" value={formatGBP(weekCost)} accent="yellow" />
      <Stat label="Today's Entries" value={String(todayWaste.length)} accent="blue" />
      <Stat label="Top Reason" value={topReason} />
    </div>
  )
}
