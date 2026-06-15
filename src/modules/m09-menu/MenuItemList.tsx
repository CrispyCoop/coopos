import { useState } from 'react'
import { useMenuItems, useMenuCategories } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { MenuItem, MenuItemStatus } from '@/types/menu'

type Row = Record<string, unknown>

const STATUS_BADGE: Record<MenuItemStatus, 'green' | 'amber' | 'red'> = {
  active: 'green',
  unavailable: 'amber',
  removed: 'red',
}

interface Props {
  onSelect: (item: MenuItem) => void
}

export function MenuItemList({ onSelect }: Props) {
  const { data: items, isLoading } = useMenuItems()
  const { data: categories } = useMenuCategories()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const catOptions = [
    { value: 'all', label: 'All Categories' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const filtered = (items ?? []).filter((item) => {
    if (catFilter !== 'all' && item.category_id !== catFilter) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          label=""
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm font-body border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {catOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : !filtered.length ? (
        <EmptyState icon="🍗" title="No menu items found" message="Add your first menu item." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'name', header: 'Name', render: (r) => (
              <span className="font-body font-medium text-dark">{r.name as string}</span>
            )},
            { key: 'category', header: 'Category', render: (r) => {
              const cat = r.menu_categories as { name: string } | null
              return cat?.name ? <Badge variant="grey">{cat.name}</Badge> : <span className="text-muted">—</span>
            }},
            { key: 'instore_price', header: 'In-Store', render: (r) => formatGBP(r.instore_price as number) },
            { key: 'delivery_price', header: 'Delivery (+uplift)', render: (r) => {
              const base = r.instore_price as number
              const uplift = r.delivery_price_uplift_pct as number
              return formatGBP(base * (1 + uplift / 100))
            }},
            { key: 'status', header: 'Status', render: (r) => (
              <Badge variant={STATUS_BADGE[r.status as MenuItemStatus] ?? 'grey'}>
                {r.status as string}
              </Badge>
            )},
          ]}
          data={filtered as unknown as Row[]}
          onRowClick={(r) => onSelect(r as unknown as MenuItem)}
        />
      )}
    </div>
  )
}
