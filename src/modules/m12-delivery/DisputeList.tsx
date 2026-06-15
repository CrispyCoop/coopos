import { useDeliveryDisputes } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { Platform } from '@/types/finance'
import type { DisputeStatus, ClaimType } from '@/types/delivery'

type Row = Record<string, unknown>

const PLATFORM_LABELS: Record<Platform, string> = {
  deliveroo: 'Deliveroo', ubereats: 'Uber Eats', justeat: 'Just Eat', foodhub: 'Foodhub', gogetter: 'GoGetter',
}

const STATUS_BADGE: Record<DisputeStatus, 'blue' | 'amber' | 'green' | 'red' | 'grey'> = {
  open: 'blue', submitted: 'amber', won: 'green', lost: 'red', accepted: 'grey',
}

const CLAIM_LABELS: Record<ClaimType, string> = {
  missing_item: 'Missing Item', quality: 'Quality', wrong_item: 'Wrong Item', other: 'Other',
}

export function DisputeList() {
  const { data, isLoading } = useDeliveryDisputes()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="🤝" title="No disputes logged" message="Log your first delivery dispute." />
  )

  return (
    <Table<Row>
      columns={[
        { key: 'order_date', header: 'Date', render: (r) => r.order_date as string },
        { key: 'platform', header: 'Platform', render: (r) => (
          <Badge variant="blue">{PLATFORM_LABELS[r.platform as Platform] ?? String(r.platform)}</Badge>
        )},
        { key: 'order_ref', header: 'Order Ref', render: (r) => r.order_ref as string },
        { key: 'claim_type', header: 'Claim Type', render: (r) => (
          <Badge variant="grey">{CLAIM_LABELS[r.claim_type as ClaimType] ?? String(r.claim_type)}</Badge>
        )},
        { key: 'claim_value', header: 'Value', render: (r) =>
          r.claim_value != null ? formatGBP(r.claim_value as number) : '—'
        },
        { key: 'status', header: 'Status', render: (r) => (
          <Badge variant={STATUS_BADGE[r.status as DisputeStatus] ?? 'grey'}>{r.status as string}</Badge>
        )},
        { key: 'camera_reviewed', header: 'Camera', render: (r) => (
          <Badge variant={r.camera_reviewed ? 'green' : 'amber'}>{r.camera_reviewed ? 'Reviewed' : 'Pending'}</Badge>
        )},
      ]}
      data={(data ?? []) as unknown as Row[]}
    />
  )
}
