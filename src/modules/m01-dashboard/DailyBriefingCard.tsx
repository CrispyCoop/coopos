import { useDailyBriefing } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'

interface Props { date: string }

export function DailyBriefingCard({ date }: Props) {
  const { data, isLoading } = useDailyBriefing(date)

  if (isLoading) return <div className="animate-pulse h-24 bg-surface rounded-xl" />
  if (!data) {
    return (
      <Card title="Daily Briefing">
        <p className="font-body text-sm text-muted">No briefing generated yet — runs at 10:45 AM via Edge Function.</p>
      </Card>
    )
  }

  return (
    <Card
      title="Daily Briefing"
      action={<Badge variant="green">AI Generated</Badge>}
    >
      <p className="font-body text-sm text-dark leading-relaxed whitespace-pre-wrap">{data.content}</p>
      {data.generated_at && (
        <p className="font-mono text-xs text-muted mt-3">{formatDateTime(data.generated_at)}</p>
      )}
    </Card>
  )
}
