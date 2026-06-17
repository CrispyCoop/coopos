import { useState } from 'react'
import { useIngredients } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { Ingredient } from '@/types/stock'

interface Props {
  onSelect: (i: Ingredient) => void
  onDelete?: (id: string, label: string) => void
}

type Row = Record<string, unknown>

export function IngredientList({ onSelect, onDelete }: Props) {
  const { data, isLoading } = useIngredients()
  const [search, setSearch] = useState('')

  const filtered = (data ?? []).filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  )

  function stockBadge(r: Row) {
    const stock = Number(r.current_stock)
    const min = Number(r.minimum_stock)
    const par = Number(r.par_level)
    if (stock <= min) return <Badge variant="red">Low</Badge>
    if (stock <= par) return <Badge variant="amber">Below Par</Badge>
    return <Badge variant="green">OK</Badge>
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded-xl" />

  return (
    <div className="space-y-4">
      <Input placeholder="Search ingredients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No ingredients" message="Add ingredients or use the seed button." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'name', header: 'Ingredient' },
            { key: 'category', header: 'Category', render: (r) => <Badge variant="grey">{r.category as string}</Badge> },
            { key: 'current_stock', header: 'Stock', render: (r) => `${r.current_stock} ${r.unit}` },
            { key: 'par_level', header: 'Par', render: (r) => `${r.par_level} ${r.unit}` },
            { key: 'minimum_stock', header: 'Min', render: (r) => `${r.minimum_stock} ${r.unit}` },
            { key: 'cost_per_unit', header: 'Cost/Unit', render: (r) => formatGBP(r.cost_per_unit as number) },
            { key: 'status', header: 'Status', render: stockBadge },
            { key: '_del', header: '', render: (r) => onDelete ? (
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(r.id as string, r.name as string) }}>Delete</Button>
            ) : null },
          ]}
          data={filtered as unknown as Row[]}
          onRowClick={(r) => onSelect(r as unknown as Ingredient)}
        />
      )}
    </div>
  )
}
