import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatGBP } from '@/lib/utils'
import type { MenuItem, MenuItemStatus } from '@/types/menu'

const STATUS_BADGE: Record<MenuItemStatus, 'green' | 'amber' | 'red'> = {
  active: 'green',
  unavailable: 'amber',
  removed: 'red',
}

interface Props {
  item: MenuItem
  onEdit: () => void
  onClose: () => void
}

export function MenuItemDetail({ item, onEdit, onClose }: Props) {
  const deliveryPrice = item.instore_price * (1 + item.delivery_price_uplift_pct / 100)

  const foodCost = (item.menu_item_ingredients ?? []).reduce((sum, ing) => {
    return sum + (ing.ingredients?.cost_per_unit ?? 0) * ing.quantity
  }, 0)

  const instoreMargin = item.instore_price > 0
    ? ((item.instore_price - foodCost) / item.instore_price) * 100
    : 0

  const presentAllergens = (item.menu_item_allergens ?? []).filter((a) => a.present)
  const mayContainAllergens = (item.menu_item_allergens ?? []).filter((a) => a.may_contain && !a.present)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl text-dark">{item.name}</h2>
          {item.description && <p className="font-body text-sm text-muted mt-1">{item.description}</p>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="outline" onClick={onClose}>← Back</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card title="">
          <div className="text-center">
            <p className="font-body text-xs text-muted">In-Store</p>
            <p className="font-mono font-semibold text-dark text-lg">{formatGBP(item.instore_price)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center">
            <p className="font-body text-xs text-muted">Delivery</p>
            <p className="font-mono font-semibold text-dark text-lg">{formatGBP(deliveryPrice)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center">
            <p className="font-body text-xs text-muted">Food Cost</p>
            <p className="font-mono font-semibold text-dark text-lg">{formatGBP(foodCost)}</p>
          </div>
        </Card>
        <Card title="">
          <div className="text-center">
            <p className="font-body text-xs text-muted">Margin</p>
            <p className={`font-mono font-semibold text-lg ${instoreMargin >= 60 ? 'text-green-600' : 'text-red-500'}`}>
              {instoreMargin.toFixed(1)}%
            </p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={STATUS_BADGE[item.status]}>{item.status}</Badge>
        {item.menu_categories && <Badge variant="grey">{item.menu_categories.name}</Badge>}
      </div>

      {(item.menu_item_ingredients?.length ?? 0) > 0 && (
        <Card title="Ingredients">
          <div className="space-y-1">
            {(item.menu_item_ingredients ?? []).map((ing) => (
              <div key={ing.id} className="flex items-center justify-between font-body text-sm">
                <span className="text-dark">{ing.ingredients?.name ?? 'Unknown'}</span>
                <span className="text-muted">{ing.quantity} {ing.unit}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(presentAllergens.length > 0 || mayContainAllergens.length > 0) && (
        <Card title="Allergens">
          <div className="space-y-2">
            {presentAllergens.length > 0 && (
              <div>
                <p className="font-body text-xs text-muted mb-1">Contains:</p>
                <div className="flex flex-wrap gap-1">
                  {presentAllergens.map((a) => (
                    <Badge key={a.id} variant="red">{a.allergen_name}</Badge>
                  ))}
                </div>
              </div>
            )}
            {mayContainAllergens.length > 0 && (
              <div>
                <p className="font-body text-xs text-muted mb-1">May contain:</p>
                <div className="flex flex-wrap gap-1">
                  {mayContainAllergens.map((a) => (
                    <Badge key={a.id} variant="amber">{a.allergen_name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
