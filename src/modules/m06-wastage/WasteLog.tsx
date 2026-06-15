import { useWasteLogs } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP, formatDateTime } from '@/lib/utils'

type Row = Record<string, unknown>

export function WasteLog() {
  const { data, isLoading } = useWasteLogs()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return <EmptyState icon="🗑️" title="No waste logged" message="Log waste using the button above." />

  return (
    <Table<Row>
      columns={[
        { key: 'logged_at', header: 'Date', render: (r) => formatDateTime(r.logged_at as string) },
        { key: 'ingredient_id', header: 'Ingredient', render: (r) => {
          const ing = r.ingredients as { name: string } | null
          return ing?.name ?? (r.ingredient_id as string) ?? '—'
        }},
        { key: 'quantity', header: 'Qty', render: (r) => `${r.quantity} ${r.unit}` },
        { key: 'reason', header: 'Reason', render: (r) => <Badge variant="amber">{r.reason as string}</Badge> },
        { key: 'shift', header: 'Shift', render: (r) => <Badge variant="grey">{(r.shift as string) || '—'}</Badge> },
        { key: 'estimated_cost', header: 'Cost', render: (r) => formatGBP(r.estimated_cost as number) },
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
