import { usePlatformSettings } from '@/lib/queries'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Platform } from '@/types/finance'

const PLATFORM_LABELS: Record<Platform, string> = {
  deliveroo: 'Deliveroo',
  ubereats: 'Uber Eats',
  justeat: 'Just Eat',
  foodhub: 'Foodhub',
  gogetter: 'GoGetter',
}

const PLATFORM_EMOJI: Record<Platform, string> = {
  deliveroo: '🦘',
  ubereats: '🚗',
  justeat: '🍕',
  foodhub: '🏠',
  gogetter: '🛵',
}

export function PlatformOverview() {
  const { data, isLoading } = usePlatformSettings()

  if (isLoading) return <div className="animate-pulse h-48 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="📱" title="No platforms configured" message="Add your delivery platform settings." />
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {(data ?? []).map((p) => (
        <div key={p.id} className="bg-white border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{PLATFORM_EMOJI[p.platform]}</span>
              <span className="font-heading font-semibold text-dark">
                {PLATFORM_LABELS[p.platform]}
              </span>
            </div>
            <Badge variant={p.is_active ? 'green' : 'grey'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-body text-xs text-muted">Rating</p>
              <p className="font-mono font-semibold text-dark">
                {p.current_rating > 0 ? p.current_rating.toFixed(1) : '—'}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-muted">Commission</p>
              <p className="font-mono font-semibold text-dark">{p.commission_rate}%</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted">Prep Time</p>
              <p className="font-mono font-semibold text-dark">{p.prep_time_mins}m</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
