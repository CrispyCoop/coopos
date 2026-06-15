import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { usePlatformSettings } from '@/lib/queries'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import type { Platform } from '@/types/finance'
import type { PlatformRatingHistory } from '@/types/delivery'

const PLATFORM_LABELS: Record<Platform, string> = {
  deliveroo: 'Deliveroo', ubereats: 'Uber Eats', justeat: 'Just Eat', foodhub: 'Foodhub', gogetter: 'GoGetter',
}

export function RatingHistory() {
  const { data: settings } = usePlatformSettings()

  const { data, isLoading } = useQuery({
    queryKey: ['platform-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_rating_history')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data as PlatformRatingHistory[]
    },
  })

  if (isLoading) return <div className="animate-pulse h-32 bg-surface rounded-xl" />

  return (
    <div className="space-y-4">
      {settings && settings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {settings.filter((p) => p.is_active && p.current_rating > 0).map((p) => (
            <div key={p.id} className="bg-surface rounded-xl p-3 text-center">
              <p className="font-body text-xs text-muted">{PLATFORM_LABELS[p.platform]}</p>
              <p className="font-mono font-semibold text-dark text-xl">⭐ {p.current_rating.toFixed(1)}</p>
            </div>
          ))}
        </div>
      )}

      {!data?.length ? (
        <EmptyState icon="⭐" title="No rating history" message="Ratings are recorded automatically when updated." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
              <div className="flex items-center gap-3">
                <Badge variant="blue">{PLATFORM_LABELS[r.platform] ?? r.platform}</Badge>
                <span className="font-mono font-medium text-dark">⭐ {r.rating.toFixed(1)}</span>
              </div>
              <div className="text-right">
                <p className="font-body text-xs text-muted">{formatDateTime(r.recorded_at)}</p>
                {r.notes && <p className="font-body text-xs text-muted">{r.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
