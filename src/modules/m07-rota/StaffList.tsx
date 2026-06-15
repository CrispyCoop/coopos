import { useStaffMembers } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { StaffMember } from '@/types/staff'

type Row = Record<string, unknown>

interface Props {
  onSelect: (s: StaffMember) => void
}

export function StaffList({ onSelect }: Props) {
  const { data, isLoading } = useStaffMembers()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="👥" title="No staff members" message="Add your first team member." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'name', header: 'Name', render: (r) => (
          <span className="font-body font-medium text-dark">{r.name as string}</span>
        )},
        { key: 'role', header: 'Role', render: (r) => (
          <Badge variant="purple">{r.role as string}</Badge>
        )},
        { key: 'hourly_rate', header: 'Hourly Rate', render: (r) => formatGBP(r.hourly_rate as number) },
        { key: 'contracted_hours', header: 'Contracted Hrs', render: (r) =>
          r.contracted_hours != null ? `${r.contracted_hours}h/wk` : '—'
        },
        { key: 'phone', header: 'Phone', render: (r) => (r.phone as string) || '—' },
        { key: 'food_hygiene_cert_expiry', header: 'Food Hygiene Expiry', render: (r) => {
          const exp = r.food_hygiene_cert_expiry as string | null
          if (!exp) return <span className="text-muted">—</span>
          const isExpired = exp < new Date().toISOString().split('T')[0]
          return <Badge variant={isExpired ? 'red' : 'green'}>{exp}</Badge>
        }},
      ]}
      data={(data ?? []) as unknown as Row[]}
      onRowClick={(r) => onSelect(r as unknown as StaffMember)}
    />
  )
}
