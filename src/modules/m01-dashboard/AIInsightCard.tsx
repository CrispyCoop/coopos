import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function AIInsightCard() {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchInsight() {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai-insight', {
        body: { type: 'dashboard_tip' },
      })
      if (error) throw error
      setInsight(data?.insight ?? 'No insight available.')
    } catch {
      setInsight('AI insight unavailable — check Edge Function setup in Phase 4.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title="AI Insight"
      action={<Badge variant="purple">Claude</Badge>}
    >
      {insight ? (
        <div className="space-y-3">
          <p className="font-body text-sm text-dark leading-relaxed">{insight}</p>
          <Button size="sm" variant="ghost" onClick={fetchInsight} loading={loading}>Refresh</Button>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="font-body text-sm text-muted">
            Get a real-time AI insight based on today's performance data.
          </p>
          <Button size="sm" onClick={fetchInsight} loading={loading}>
            Generate Insight
          </Button>
        </div>
      )}
    </Card>
  )
}
