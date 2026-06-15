import { useState } from 'react'
import { useMenuItems } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { MenuItem } from '@/types/menu'

type Row = Record<string, unknown>

interface CostRow extends Record<string, unknown> {
  id: string
  name: string
  category: string
  price: number
  deliveryPrice: number
  foodCost: number
  margin: number
  deliveryMargin: number
}

interface Props {
  onSelect: (item: MenuItem) => void
}

export function MenuCostTable({ onSelect }: Props) {
  const { data: items, isLoading } = useMenuItems()
  const [sortBy, setSortBy] = useState<'margin' | 'foodCost' | 'price'>('margin')

  const costed = (items ?? [])
    .filter((i) => i.status !== 'removed')
    .map((item): CostRow => {
      const foodCost = (item.menu_item_ingredients ?? []).reduce((s, ing) => {
        return s + (ing.ingredients?.cost_per_unit ?? 0) * ing.quantity
      }, 0)
      const deliveryPrice = item.instore_price * (1 + item.delivery_price_uplift_pct / 100)
      const margin = item.instore_price > 0 ? ((item.instore_price - foodCost) / item.instore_price) * 100 : 0
      const deliveryMargin = deliveryPrice > 0 ? ((deliveryPrice - foodCost) / deliveryPrice) * 100 : 0
      return {
        id: item.id,
        name: item.name,
        category: item.menu_categories?.name ?? '—',
        price: item.instore_price,
        deliveryPrice,
        foodCost,
        margin,
        deliveryMargin,
        _raw: item,
      }
    })
    .sort((a, b) => {
      if (sortBy === 'margin') return a.margin - b.margin
      if (sortBy === 'foodCost') return b.foodCost - a.foodCost
      return b.price - a.price
    })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!costed.length) return (
    <EmptyState icon="💰" title="No menu items" message="Add menu items in the Menu Manager first." />
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['margin', 'foodCost', 'price'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-body transition-colors ${
              sortBy === s ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-border'
            }`}
          >
            {s === 'margin' ? 'By Margin ↑' : s === 'foodCost' ? 'By Cost ↓' : 'By Price ↓'}
          </button>
        ))}
      </div>
      <Table<Row>
        columns={[
          { key: 'name', header: 'Item', render: (r) => (
            <span className="font-body font-medium text-dark">{r.name as string}</span>
          )},
          { key: 'category', header: 'Category', render: (r) => (
            <Badge variant="grey">{r.category as string}</Badge>
          )},
          { key: 'price', header: 'In-Store', render: (r) => formatGBP(r.price as number) },
          { key: 'deliveryPrice', header: 'Delivery', render: (r) => formatGBP(r.deliveryPrice as number) },
          { key: 'foodCost', header: 'Food Cost', render: (r) => formatGBP(r.foodCost as number) },
          { key: 'margin', header: 'Margin', render: (r) => {
            const m = r.margin as number
            return <Badge variant={m >= 65 ? 'green' : m >= 55 ? 'amber' : 'red'}>{m.toFixed(1)}%</Badge>
          }},
        ]}
        data={costed}
        onRowClick={(r) => {
          const raw = (r as unknown as { _raw: MenuItem })._raw
          if (raw) onSelect(raw)
        }}
      />
    </div>
  )
}
