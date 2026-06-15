import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { TillCount } from '@/types/finance'

type Row = Record<string, unknown>

export function TillLog() {
  const { data, isLoading } = useQuery({
    queryKey: ['till-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('till_counts')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as TillCount[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="💵" title="No till counts yet" message="Complete your first till count using the button above." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'date', header: 'Date', render: (r) => r.date as string },
        { key: 'opening_float', header: 'Float', render: (r) => formatGBP(r.opening_float as number) },
        { key: 'total_cash', header: 'Cash Counted', render: (r) => formatGBP(r.total_cash as number) },
        { key: 'epos_cash_total', header: 'EPOS Total', render: (r) =>
          r.epos_cash_total != null ? formatGBP(r.epos_cash_total as number) : '—'
        },
        { key: 'variance', header: 'Variance', render: (r) => {
          if (r.variance == null) return <span className="text-muted">—</span>
          const v = r.variance as number
          return (
            <Badge variant={Math.abs(v) < 1 ? 'green' : Math.abs(v) < 5 ? 'amber' : 'red'}>
              {v >= 0 ? '+' : ''}{formatGBP(v)}
            </Badge>
          )
        }},
        { key: 'notes', header: 'Notes', render: (r) => (r.notes as string) || '—' },
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
