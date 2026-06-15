import { useAbsences } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { AbsenceType } from '@/types/staff'

type Row = Record<string, unknown>

const ABSENCE_BADGE: Record<AbsenceType, 'blue' | 'red' | 'amber'> = {
  planned: 'blue',
  sick: 'red',
  emergency: 'amber',
}

export function AbsenceLog() {
  const { data, isLoading } = useAbsences()

  if (isLoading) return <div className="animate-pulse h-32 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="✅" title="No upcoming absences" message="All clear on the schedule." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'absence_date', header: 'Date', render: (r) => r.absence_date as string },
        { key: 'name', header: 'Staff', render: (r) => {
          const member = r.staff_members as { name: string } | null
          return member?.name ?? '—'
        }},
        { key: 'type', header: 'Type', render: (r) => (
          <Badge variant={ABSENCE_BADGE[r.type as AbsenceType] ?? 'grey'}>
            {r.type as string}
          </Badge>
        )},
        { key: 'reason', header: 'Reason', render: (r) => (r.reason as string) || '—' },
        { key: 'cover_confirmed', header: 'Cover', render: (r) => (
          <Badge variant={r.cover_confirmed ? 'green' : 'amber'}>
            {r.cover_confirmed ? 'Confirmed' : 'Needed'}
          </Badge>
        )},
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
