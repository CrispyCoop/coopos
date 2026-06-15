import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { SupplierPriceHistory } from '@/types/stock'

type Row = Record<string, unknown>

type PriceHistoryRow = SupplierPriceHistory & {
  ingredients: { name: string; unit: string } | null
  suppliers: { name: string } | null
}

export function PriceHistory() {

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-price-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_price_history')
        .select('*, ingredients(name, unit), suppliers(name)')
        .order('changed_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as PriceHistoryRow[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="📈" title="No price changes logged" message="Price changes are recorded automatically when delivery costs differ from ingredient cost records." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'changed_at', header: 'Date', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return row.changed_at.slice(0, 10)
        }},
        { key: 'supplier', header: 'Supplier', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return row.suppliers?.name ?? '—'
        }},
        { key: 'ingredient', header: 'Ingredient', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return row.ingredients?.name
            ? <Badge variant="grey">{row.ingredients.name}</Badge>
            : <span className="text-muted">—</span>
        }},
        { key: 'old_price', header: 'Old Price', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return row.old_price != null
            ? `${formatGBP(row.old_price)}/${row.ingredients?.unit ?? 'unit'}`
            : '—'
        }},
        { key: 'new_price', header: 'New Price', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return row.new_price != null
            ? `${formatGBP(row.new_price)}/${row.ingredients?.unit ?? 'unit'}`
            : '—'
        }},
        { key: 'change', header: 'Change', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          if (row.old_price == null || row.new_price == null) return <span className="text-muted">—</span>
          const diff = row.new_price - row.old_price
          const pct = row.old_price > 0 ? (diff / row.old_price) * 100 : 0
          return (
            <Badge variant={diff > 0 ? 'red' : diff < 0 ? 'green' : 'grey'}>
              {diff > 0 ? '+' : ''}{pct.toFixed(1)}%
            </Badge>
          )
        }},
        { key: 'notes', header: 'Notes', render: (r) => {
          const row = r as unknown as PriceHistoryRow
          return (row.notes as string) || '—'
        }},
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
