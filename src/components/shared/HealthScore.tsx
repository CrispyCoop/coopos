import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { HEALTH_SCORE_WEIGHTS } from '@/lib/constants'
import { formatPct } from '@/lib/utils'
import type { HealthScoreResult } from '@/types'

function calcHealthScore(components: Partial<HealthScoreResult['components']>): HealthScoreResult {
  const w = HEALTH_SCORE_WEIGHTS
  const r = components.revenue ?? 0
  const m = components.margin ?? 0
  const ws = components.waste ?? 0
  const p = components.platforms ?? 0
  const s = components.stock ?? 0
  const st = components.staff ?? 0

  const score = (r * w.revenue) + (m * w.margin) + (ws * w.waste) +
    (p * w.platforms) + (s * w.stock) + (st * w.staff)

  return {
    score,
    color: score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red',
    food_safety_connected: false,
    components: { revenue: r, margin: m, waste: ws, platforms: p, stock: s, staff: st },
  }
}

export function HealthScore() {
  const [expanded, setExpanded] = useState(false)

  const { data } = useQuery<HealthScoreResult>({
    queryKey: ['health-score'],
    queryFn: async () => {
      // Call the health-score Edge Function (Phase 4)
      // For now, calculate client-side from available data
      const today = new Date().toISOString().split('T')[0]

      const [revenueRes, ingredientsRes, platformsRes] = await Promise.all([
        supabase.from('daily_revenue_summary').select('total_revenue').eq('date', today),
        supabase.from('ingredients').select('current_stock, par_level'),
        supabase.from('platform_settings').select('current_rating, is_active'),
      ])

      const settings = await supabase.from('business_settings').select('key, value')
      const settingsMap = (settings.data ?? []).reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key]: r.value ?? '' }), {})
      const target = Number(settingsMap.daily_revenue_target) || 419

      const totalRevenue = (revenueRes.data ?? []).reduce((s, r) => s + (r.total_revenue ?? 0), 0)
      const revenue = Math.min(totalRevenue / target, 1) * 100

      const ingredients = ingredientsRes.data ?? []
      const stock = ingredients.length > 0
        ? (ingredients.filter((i) => i.current_stock >= i.par_level).length / ingredients.length) * 100
        : 50

      const platforms = platformsRes.data ?? []
      const activePlatforms = platforms.filter((p) => p.is_active && p.current_rating > 0)
      const platformsScore = activePlatforms.length > 0
        ? (activePlatforms.reduce((s, p) => s + p.current_rating, 0) / activePlatforms.length / 5) * 100
        : 50

      return calcHealthScore({ revenue, margin: 50, waste: 50, platforms: platformsScore, stock, staff: 50 })
    },
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  })

  if (!data) return null

  const colourClass = {
    green: 'text-green',
    amber: 'text-yellow-dark',
    red: 'text-red',
  }[data.color]

  const bgClass = {
    green: 'bg-green',
    amber: 'bg-yellow',
    red: 'bg-red',
  }[data.color]

  const componentLabels: Record<keyof HealthScoreResult['components'], string> = {
    revenue: 'Revenue',
    margin: 'Margins',
    waste: 'Waste',
    platforms: 'Platforms',
    stock: 'Stock',
    staff: 'Staff',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`font-mono text-xs font-medium px-3 py-1.5 rounded-full text-white ${bgClass} transition-opacity hover:opacity-90`}
        aria-expanded={expanded}
        aria-label={`Health Score: ${Math.round(data.score)} — click to expand`}
      >
        {Math.round(data.score)} / 100
      </button>

      {expanded && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-border shadow-xl z-30 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg text-dark">CoopOS Health</p>
            <p className={`font-display text-2xl ${colourClass}`}>{Math.round(data.score)}</p>
          </div>

          <div className="space-y-2">
            {(Object.entries(data.components) as [keyof HealthScoreResult['components'], number][]).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-24 font-body text-xs text-muted">{componentLabels[key]}</div>
                <div className="flex-1 bg-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${val >= 75 ? 'bg-green' : val >= 50 ? 'bg-yellow' : 'bg-red'}`}
                    style={{ width: `${Math.min(val, 100)}%` }}
                  />
                </div>
                <div className="w-10 font-mono text-xs text-muted text-right">{formatPct(val, 0)}</div>
              </div>
            ))}

            <div className="flex items-center gap-2 opacity-40">
              <div className="w-24 font-body text-xs text-muted">Food Safety</div>
              <div className="flex-1 bg-surface rounded-full h-2" />
              <div className="w-10 font-mono text-xs text-muted text-right">—</div>
            </div>
          </div>

          <p className="font-body text-xs text-muted mt-3 border-t border-border pt-3">
            Food safety not connected. <a href="/settings" className="text-red underline">Link SFBB app</a>
          </p>
        </div>
      )}
    </div>
  )
}
