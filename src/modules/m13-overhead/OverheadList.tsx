import { useOverheadItems } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { OverheadFrequency } from '@/types/finance'

type Row = Record<string, unknown>

const FREQ_LABELS: Record<OverheadFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  annual: 'Annual',
}

function annualCost(amount: number, frequency: OverheadFrequency): number {
  const multipliers: Record<OverheadFrequency, number> = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    annual: 1,
  }
  return amount * multipliers[frequency]
}

interface Props {
  onSelect: (id: string) => void
}

export function OverheadList({ onSelect }: Props) {
  const { data, isLoading } = useOverheadItems()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="🧾" title="No overhead items" message="Add your fixed and variable overheads." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'name', header: 'Overhead', render: (r) => (
          <span className="font-body font-medium text-dark">{r.name as string}</span>
        )},
        { key: 'category', header: 'Category', render: (r) => (
          <Badge variant="grey">{r.category as string}</Badge>
        )},
        { key: 'amount', header: 'Amount', render: (r) => formatGBP(r.amount as number) },
        { key: 'frequency', header: 'Frequency', render: (r) => FREQ_LABELS[r.frequency as OverheadFrequency] },
        { key: 'annual', header: 'Annual Cost', render: (r) => (
          <span className="font-mono text-muted">
            {formatGBP(annualCost(r.amount as number, r.frequency as OverheadFrequency))}
          </span>
        )},
        { key: 'next_due_date', header: 'Next Due', render: (r) => {
          const due = r.next_due_date as string | null
          if (!due) return <span className="text-muted">—</span>
          const overdue = due < new Date().toISOString().split('T')[0]
          return <Badge variant={overdue ? 'red' : 'green'}>{due}</Badge>
        }},
      ]}
      data={(data ?? []) as unknown as Row[]}
      onRowClick={(r) => onSelect(r.id as string)}
    />
  )
}
