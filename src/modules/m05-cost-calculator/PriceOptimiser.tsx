import { useState } from 'react'
import { useMenuItems } from '@/lib/queries'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { formatGBP } from '@/lib/utils'
function calcSuggestedPrice(foodCost: number, targetMargin: number): number {
  if (targetMargin >= 100) return foodCost * 10
  return foodCost / (1 - targetMargin / 100)
}

export function PriceOptimiser() {
  const { data: items } = useMenuItems()
  const [targetMargin, setTargetMargin] = useState('65')

  const target = Number(targetMargin) || 65

  const costed = (items ?? [])
    .filter((i) => i.status === 'active')
    .map((item) => {
      const foodCost = (item.menu_item_ingredients ?? []).reduce((s, ing) => {
        return s + (ing.ingredients?.cost_per_unit ?? 0) * ing.quantity
      }, 0)
      const currentMargin = item.instore_price > 0
        ? ((item.instore_price - foodCost) / item.instore_price) * 100
        : 0
      const suggested = foodCost > 0 ? calcSuggestedPrice(foodCost, target) : null
      const priceDiff = suggested != null ? suggested - item.instore_price : 0
      return { item, foodCost, currentMargin, suggested, priceDiff }
    })
    .filter((r) => r.foodCost > 0)
    .sort((a, b) => a.currentMargin - b.currentMargin)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          label="Target Margin (%)"
          type="number"
          min="1"
          max="99"
          value={targetMargin}
          onChange={(e) => setTargetMargin(e.target.value)}
          className="max-w-xs"
        />
        <p className="font-body text-xs text-muted pt-5">
          Showing suggested prices to achieve {target}% margin on all costed items
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-muted">Item</th>
              <th className="text-right py-2 pr-4 font-medium text-muted">Food Cost</th>
              <th className="text-right py-2 pr-4 font-medium text-muted">Current Price</th>
              <th className="text-right py-2 pr-4 font-medium text-muted">Current Margin</th>
              <th className="text-right py-2 pr-4 font-medium text-muted">Suggested Price</th>
              <th className="text-right py-2 font-medium text-muted">Difference</th>
            </tr>
          </thead>
          <tbody>
            {costed.map(({ item, foodCost, currentMargin, suggested, priceDiff }) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="py-2 pr-4 font-medium text-dark">{item.name}</td>
                <td className="py-2 pr-4 text-right font-mono text-muted">{formatGBP(foodCost)}</td>
                <td className="py-2 pr-4 text-right font-mono">{formatGBP(item.instore_price)}</td>
                <td className="py-2 pr-4 text-right">
                  <Badge variant={currentMargin >= target ? 'green' : currentMargin >= target - 10 ? 'amber' : 'red'}>
                    {currentMargin.toFixed(1)}%
                  </Badge>
                </td>
                <td className="py-2 pr-4 text-right font-mono font-medium text-dark">
                  {suggested != null ? formatGBP(suggested) : '—'}
                </td>
                <td className={`py-2 text-right font-mono text-sm ${priceDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {priceDiff > 0 ? '+' : ''}{formatGBP(priceDiff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
