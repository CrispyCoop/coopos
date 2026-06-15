import { useMenuItems, useMarginAlerts } from '@/lib/queries'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'

export function MarginGuardianPanel() {
  const { data: items } = useMenuItems()
  const { data: alerts } = useMarginAlerts()

  const lowMargin = (items ?? [])
    .filter((i) => i.status === 'active')
    .map((item) => {
      const foodCost = (item.menu_item_ingredients ?? []).reduce((s, ing) => {
        return s + (ing.ingredients?.cost_per_unit ?? 0) * ing.quantity
      }, 0)
      const margin = item.instore_price > 0 ? ((item.instore_price - foodCost) / item.instore_price) * 100 : 0
      return { item, foodCost, margin }
    })
    .filter((r) => r.margin < 60 && r.foodCost > 0)
    .sort((a, b) => a.margin - b.margin)

  return (
    <div className="space-y-4">
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-sm font-medium text-dark">Active Margin Alerts</p>
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-body text-sm font-medium text-dark">
                  {alert.menu_items?.name ?? 'Item'} — margin alert
                </p>
                <p className="font-body text-xs text-muted">
                  Threshold: {alert.threshold_pct}% · Current: {alert.current_margin_pct?.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {lowMargin.length === 0 ? (
        <EmptyState icon="✅" title="All margins healthy" message="No items below 60% margin target." />
      ) : (
        <div className="space-y-2">
          <p className="font-body text-sm font-medium text-dark">Items Below 60% Margin</p>
          {lowMargin.map(({ item, foodCost, margin }) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border">
              <div>
                <p className="font-body text-sm font-medium text-dark">{item.name}</p>
                <p className="font-body text-xs text-muted">
                  Price: {formatGBP(item.instore_price)} · Food cost: {formatGBP(foodCost)}
                </p>
              </div>
              <Badge variant={margin < 50 ? 'red' : 'amber'}>{margin.toFixed(1)}%</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
