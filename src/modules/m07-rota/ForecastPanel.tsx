import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatGBP } from '@/lib/utils'
import { SimpleBarChart } from '@/components/ui/Chart'

function nextMonday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

interface ForecastDay {
  date: string
  predicted_revenue: number
  predicted_orders: number
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

interface ForecastResult {
  forecast: ForecastDay[]
  weekly_total: number
  key_insight: string
}

const CONFIDENCE_BADGE: Record<string, 'green' | 'amber' | 'red'> = {
  high: 'green', medium: 'amber', low: 'red',
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  onForecastGenerated?: (result: object, weekStart: string) => void
}

export function ForecastPanel({ onForecastGenerated }: Props) {
  const [weekStart, setWeekStart] = useState(nextMonday())
  const [result, setResult] = useState<ForecastResult | null>(null)
  const [error, setError] = useState('')

  const generate = useMutation({
    mutationFn: async () => {
      setError('')
      const { data, error } = await supabase.functions.invoke('demand-forecast', {
        body: { weekStart },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data as ForecastResult
    },
    onSuccess: (data) => {
      setResult(data)
      onForecastGenerated?.(data, weekStart)
    },
    onError: (err: Error) => setError(err.message),
  })

  const chartData = (result?.forecast ?? []).map((d) => ({
    day: DOW[new Date(d.date).getDay()],
    Revenue: d.predicted_revenue,
  }))

  return (
    <div className="space-y-4">
      <Card title="AI Demand Forecast">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="w-48">
              <Input
                label="Week starting (Monday)"
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              />
            </div>
            <Button onClick={() => generate.mutate()} loading={generate.isPending}>
              Generate Forecast
            </Button>
          </div>

          {error && <Alert type="error" message={error} />}

          {result && (
            <div className="space-y-4">
              {result.key_insight && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="font-body text-sm text-blue-800">
                    <span className="font-semibold">AI Insight: </span>{result.key_insight}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <div className="p-3 bg-surface rounded-xl border border-border flex-1 text-center">
                  <p className="font-body text-xs text-muted">Predicted Weekly Revenue</p>
                  <p className="font-mono font-semibold text-dark text-xl mt-1">{formatGBP(result.weekly_total)}</p>
                </div>
              </div>

              <SimpleBarChart
                data={chartData}
                dataKey="Revenue"
                xKey="day"
                colour="#f97316"
                height={200}
                formatValue={(v) => `£${Number(v).toFixed(0)}`}
              />

              <div className="space-y-2">
                {result.forecast.map((d) => (
                  <div key={d.date} className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-border">
                    <div className="w-24 shrink-0">
                      <p className="font-body text-sm font-semibold text-dark">{DOW[new Date(d.date).getDay()]}</p>
                      <p className="font-body text-xs text-muted">{d.date}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-dark">{formatGBP(d.predicted_revenue)}</span>
                        <span className="font-body text-xs text-muted">{d.predicted_orders} orders</span>
                        <Badge variant={CONFIDENCE_BADGE[d.confidence]}>{d.confidence}</Badge>
                      </div>
                      {d.notes && <p className="font-body text-xs text-muted mt-1">{d.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
