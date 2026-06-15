import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { PlatformPayout, Platform } from '@/types/finance'

type Row = Record<string, unknown>

const PLATFORM_LABELS: Record<Platform, string> = {
  deliveroo: 'Deliveroo',
  ubereats: 'Uber Eats',
  justeat: 'Just Eat',
  foodhub: 'Foodhub',
  gogetter: 'GoGetter',
}

export function PlatformPayouts() {
  const { data, isLoading } = useQuery({
    queryKey: ['platform-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_payouts')
        .select('*')
        .order('period_end', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as PlatformPayout[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="📦" title="No platform payouts logged" message="Platform payout reconciliation will appear here." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'platform', header: 'Platform', render: (r) => (
          <Badge variant="blue">{PLATFORM_LABELS[r.platform as Platform] ?? String(r.platform)}</Badge>
        )},
        { key: 'period_start', header: 'Period', render: (r) => `${r.period_start} → ${r.period_end}` },
        { key: 'gross_revenue', header: 'Gross', render: (r) =>
          r.gross_revenue != null ? formatGBP(r.gross_revenue as number) : '—'
        },
        { key: 'commission_amount', header: 'Commission', render: (r) =>
          r.commission_amount != null ? formatGBP(r.commission_amount as number) : '—'
        },
        { key: 'net_payout', header: 'Net Payout', render: (r) =>
          r.net_payout != null ? (
            <span className="font-mono font-medium">{formatGBP(r.net_payout as number)}</span>
          ) : '—'
        },
        { key: 'variance', header: 'Variance', render: (r) => {
          if (r.variance == null) return <span className="text-muted">—</span>
          const v = r.variance as number
          return (
            <Badge variant={Math.abs(v) < 1 ? 'green' : 'red'}>
              {v >= 0 ? '+' : ''}{formatGBP(v)}
            </Badge>
          )
        }},
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
