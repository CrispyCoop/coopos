import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDateTime } from '@/lib/utils'
import type { SOPAcknowledgement } from './types'

type Row = Record<string, unknown>

export function AcknowledgementLog() {
  const { data, isLoading } = useQuery({
    queryKey: ['sop_acknowledgements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sop_acknowledgements')
        .select('*, staff:staff_members(name), sop:sops(title, version)')
        .order('acknowledged_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as SOPAcknowledgement[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />

  if (!data?.length) {
    return <EmptyState icon="📝" title="No acknowledgements yet" message="Staff acknowledgements will appear here." />
  }

  const rows = data as unknown as Row[]

  return (
    <Table<Row>
      columns={[
        { key: 'staff', header: 'Staff Member', render: (r) => (r.staff as { name: string } | null)?.name ?? '—' },
        { key: 'sop', header: 'SOP', render: (r) => {
          const s = r.sop as { title: string; version: number } | null
          return s ? `${s.title} (v${s.version})` : '—'
        }},
        { key: 'acknowledged_at', header: 'Acknowledged', render: (r) => formatDateTime(r.acknowledged_at as string) },
      ]}
      data={rows}
    />
  )
}
