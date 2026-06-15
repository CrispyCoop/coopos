import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSalesRecords, QUERY_KEYS } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP, formatDateTime } from '@/lib/utils'
import { CHANNEL_LABELS } from '@/lib/constants'
import { todayISO } from '@/lib/utils'
import type { Channel } from '@/types/sales'

const CHANNEL_BADGE: Record<string, 'green' | 'blue' | 'amber' | 'purple' | 'red' | 'grey'> = {
  instore_cash: 'green', instore_card: 'blue', deliveroo: 'amber', ubereats: 'amber',
  justeat: 'amber', foodhub: 'grey', gogetter: 'purple', app: 'blue',
}

type Row = Record<string, unknown>

export function LiveSalesBoard() {
  const today = todayISO()
  const { data, isLoading } = useSalesRecords(today)
  const qc = useQueryClient()

  useEffect(() => {
    const ch = supabase
      .channel('sales-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales_records' }, () => {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.salesRecords(today) })
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [today, qc])

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return <EmptyState icon="💷" title="No sales yet today" message="Log the first sale using the button above." />

  return (
    <Table<Row>
      columns={[
        { key: 'created_at', header: 'Time', render: (r) => formatDateTime(r.created_at as string) },
        { key: 'channel', header: 'Channel', render: (r) => (
          <Badge variant={CHANNEL_BADGE[r.channel as string] ?? 'grey'}>
            {CHANNEL_LABELS[r.channel as Channel] ?? String(r.channel)}
          </Badge>
        )},
        { key: 'order_ref', header: 'Ref', render: (r) => (r.order_ref as string) || '—' },
        { key: 'subtotal', header: 'Subtotal', render: (r) => formatGBP(r.subtotal as number) },
        { key: 'discount', header: 'Discount', render: (r) => formatGBP(r.discount as number) },
        { key: 'total', header: 'Total', render: (r) => <span className="font-mono font-medium text-dark">{formatGBP(r.total as number)}</span> },
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
