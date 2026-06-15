import { useSuppliers } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Supplier } from '@/types/stock'

type Row = Record<string, unknown>

interface Props {
  onSelect: (s: Supplier) => void
}

export function SupplierList({ onSelect }: Props) {
  const { data, isLoading } = useSuppliers()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="🏭" title="No suppliers yet" message="Add your first supplier." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'name', header: 'Supplier', render: (r) => (
          <span className="font-body font-medium text-dark">{r.name as string}</span>
        )},
        { key: 'contact_name', header: 'Contact', render: (r) => (r.contact_name as string) || '—' },
        { key: 'phone', header: 'Phone', render: (r) => (r.phone as string) || '—' },
        { key: 'email', header: 'Email', render: (r) => (r.email as string) || '—' },
        { key: 'payment_terms_days', header: 'Payment Terms', render: (r) => (
          <Badge variant="blue">{r.payment_terms_days as number} days</Badge>
        )},
        { key: 'minimum_order_value', header: 'Min Order', render: (r) =>
          r.minimum_order_value != null ? `£${(r.minimum_order_value as number).toFixed(2)}` : '—'
        },
      ]}
      data={(data ?? []) as unknown as Row[]}
      onRowClick={(r) => onSelect(r as unknown as Supplier)}
    />
  )
}
