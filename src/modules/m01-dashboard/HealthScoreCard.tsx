import { HealthScore } from '@/components/shared/HealthScore'
import { Card } from '@/components/ui/Card'

export function HealthScoreCard() {
  return (
    <Card title="Business Health Score">
      <HealthScore />
    </Card>
  )
}
