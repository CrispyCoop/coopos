import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { todayISO } from '@/lib/utils'

type Row = Record<string, unknown>

interface TrainingRecord {
  id: string
  staff_id: string
  course: string
  provider: string | null
  completed_date: string
  expiry_date: string | null
  notes: string | null
  staff_members?: { name: string } | null
}

export function TrainingRecords() {
  const today = todayISO()

  const { data, isLoading } = useQuery({
    queryKey: ['training-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_records')
        .select('*, staff_members(name)')
        .order('completed_date', { ascending: false })
      if (error) throw error
      return data as TrainingRecord[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="📚" title="No training records" message="Log training completions using the button above." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'staff', header: 'Staff Member', render: (r) => {
          const row = r as unknown as TrainingRecord
          return row.staff_members?.name ?? '—'
        }},
        { key: 'course', header: 'Course', render: (r) => (
          <span className="font-body font-medium text-dark">{r.course as string}</span>
        )},
        { key: 'provider', header: 'Provider', render: (r) => (r.provider as string) || '—' },
        { key: 'completed_date', header: 'Completed', render: (r) => r.completed_date as string },
        { key: 'expiry_date', header: 'Expires', render: (r) => {
          const exp = r.expiry_date as string | null
          if (!exp) return <span className="text-muted">No expiry</span>
          const expired = exp < today
          const expiringSoon = !expired && exp <= new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
          return <Badge variant={expired ? 'red' : expiringSoon ? 'amber' : 'green'}>{exp}</Badge>
        }},
        { key: 'notes', header: 'Notes', render: (r) => (r.notes as string) || '—' },
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
