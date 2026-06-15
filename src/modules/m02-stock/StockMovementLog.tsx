import { useStockMovements } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'

type Row = Record<string, unknown>

const MOVEMENT_COLOURS: Record<string, 'green' | 'red' | 'amber' | 'blue' | 'grey'> = {
  delivery: 'green',
  adjustment_up: 'blue',
  adjustment_down: 'amber',
  waste: 'red',
  sale_depletion: 'grey',
  stocktake: 'grey',
  transfer: 'grey',
  adjustment: 'blue',
}

export function StockMovementLog() {
  const { data, isLoading } = useStockMovements()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return <EmptyState icon="📋" title="No movements yet" message="Stock movements appear here as deliveries and adjustments are logged." />

  const rows = (data ?? []) as unknown as Row[]

  return (
    <Table<Row>
      columns={[
        { key: 'moved_at', header: 'Date', render: (r) => formatDateTime(r.moved_at as string) },
        {
          key: 'movement_type',
          header: 'Type',
          render: (r) => (
            <Badge variant={MOVEMENT_COLOURS[r.movement_type as string] ?? 'grey'}>
              {String(r.movement_type).replace(/_/g, ' ')}
            </Badge>
          ),
        },
        { key: 'quantity', header: 'Qty', render: (r) => `${Number(r.quantity) > 0 ? '+' : ''}${r.quantity} ${r.unit}` },
        { key: 'reference', header: 'Reference', render: (r) => (r.reference as string) || '—' },
      ]}
      data={rows}
    />
  )
}
