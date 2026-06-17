import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP, formatDateTime } from '@/lib/utils'
import { CHANNEL_LABELS } from '@/lib/constants'
import type { SalesRecord, Channel } from '@/types/sales'

type Row = Record<string, unknown>

interface Props {
  onDelete?: (id: string, label: string) => void
}

export function SalesHistory({ onDelete }: Props) {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['sales-history', from, to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_records')
        .select('*')
        .gte('created_at', `${from}T00:00:00`)
        .lte('created_at', `${to}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data as SalesRecord[]
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : !data?.length ? (
        <EmptyState icon="📋" title="No sales in range" message="Adjust the date range." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'created_at', header: 'Date / Time', render: (r) => formatDateTime(r.created_at as string) },
            { key: 'channel', header: 'Channel', render: (r) => (
              <Badge variant="grey">{CHANNEL_LABELS[r.channel as Channel] ?? String(r.channel)}</Badge>
            )},
            { key: 'order_ref', header: 'Ref', render: (r) => (r.order_ref as string) || '—' },
            { key: 'total', header: 'Total', render: (r) => formatGBP(r.total as number) },
            { key: '_del', header: '', render: (r) => onDelete ? (
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(r.id as string, formatDateTime(r.created_at as string)) }}>Delete</Button>
            ) : null },
          ]}
          data={(data ?? []) as unknown as Row[]}
        />
      )}
    </div>
  )
}
