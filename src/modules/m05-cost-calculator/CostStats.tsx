import { useMenuItems } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { formatGBP } from '@/lib/utils'

export function CostStats() {
  const { data: items } = useMenuItems()
  const active = (items ?? []).filter((i) => i.status === 'active')

  const withCost = active.filter((i) => (i.menu_item_ingredients?.length ?? 0) > 0)

  const costs = withCost.map((item) => {
    const foodCost = (item.menu_item_ingredients ?? []).reduce((s, ing) => {
      return s + (ing.ingredients?.cost_per_unit ?? 0) * ing.quantity
    }, 0)
    const margin = item.instore_price > 0 ? ((item.instore_price - foodCost) / item.instore_price) * 100 : 0
    return { foodCost, margin, price: item.instore_price }
  })

  const avgMargin = costs.length > 0 ? costs.reduce((s, c) => s + c.margin, 0) / costs.length : 0
  const belowTarget = costs.filter((c) => c.margin < 60).length
  const avgFoodCost = costs.length > 0 ? costs.reduce((s, c) => s + c.foodCost, 0) / costs.length : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Items Costed" value={String(withCost.length)} accent="blue" />
      <Stat label="Avg Margin" value={`${avgMargin.toFixed(1)}%`} accent={avgMargin >= 60 ? 'green' : 'red'} />
      <Stat label="Below 60% Margin" value={String(belowTarget)} accent={belowTarget > 0 ? 'red' : 'green'} />
      <Stat label="Avg Food Cost" value={formatGBP(avgFoodCost)} accent="blue" />
    </div>
  )
}
