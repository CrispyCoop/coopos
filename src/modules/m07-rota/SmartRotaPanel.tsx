import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatGBP } from '@/lib/utils'

interface SuggestedShift {
  staff_name: string
  shift_date: string
  start_time: string
  end_time: string
  role: 'kitchen' | 'counter' | 'closing'
}

interface RotaSuggestion {
  shifts: SuggestedShift[]
  total_hours: number
  estimated_labour_cost: number
  notes: string
}

interface Props {
  weekStart: string
  forecast: object
}

const ROLE_BADGE: Record<string, 'green' | 'blue' | 'grey'> = {
  kitchen: 'green', counter: 'blue', closing: 'grey',
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SmartRotaPanel({ weekStart, forecast }: Props) {
  const [suggestion, setSuggestion] = useState<RotaSuggestion | null>(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const qc = useQueryClient()

  const generate = useMutation({
    mutationFn: async () => {
      setError('')
      setApplied(false)
      const { data, error } = await supabase.functions.invoke('smart-rota', {
        body: { weekStart, forecast },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data as RotaSuggestion
    },
    onSuccess: (data) => setSuggestion(data),
    onError: (err: Error) => setError(err.message),
  })

  async function applyRota() {
    if (!suggestion) return
    setApplying(true)
    try {
      // Create rota week
      const { data: week, error: weekErr } = await supabase
        .from('rota_weeks')
        .insert({ week_start_date: weekStart, published: false })
        .select()
        .single()
      if (weekErr) throw weekErr

      // Get staff by name to resolve IDs
      const { data: staff } = await supabase
        .from('staff_members')
        .select('id, name')
        .eq('active', true)

      const nameToId: Record<string, string> = {}
      ;(staff ?? []).forEach((s: { id: string; name: string }) => { nameToId[s.name] = s.id })

      // Insert shifts
      const shifts = suggestion.shifts
        .filter((s) => nameToId[s.staff_name])
        .map((s) => ({
          rota_week_id: week.id,
          staff_id: nameToId[s.staff_name],
          shift_date: s.shift_date,
          start_time: s.start_time,
          end_time: s.end_time,
          role: s.role,
        }))

      const { error: shiftErr } = await supabase.from('rota_shifts').insert(shifts)
      if (shiftErr) throw shiftErr

      qc.invalidateQueries({ queryKey: ['rota-weeks'] })
      qc.invalidateQueries({ queryKey: ['rota-shifts'] })
      setApplied(true)
    } catch (err) {
      setError(String(err))
    } finally {
      setApplying(false)
    }
  }

  // Group shifts by date
  const byDate: Record<string, SuggestedShift[]> = {}
  ;(suggestion?.shifts ?? []).forEach((s) => {
    if (!byDate[s.shift_date]) byDate[s.shift_date] = []
    byDate[s.shift_date].push(s)
  })

  return (
    <Card title="AI Smart Rota">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button onClick={() => generate.mutate()} loading={generate.isPending}>
            Suggest Rota for {weekStart}
          </Button>
          {suggestion && !applied && (
            <Button variant="outline" onClick={applyRota} loading={applying}>
              Apply to Rota Grid
            </Button>
          )}
        </div>

        {error && <Alert type="error" message={error} />}
        {applied && <Alert type="success" message="Rota applied successfully. Review in the Weekly Rota tab." />}

        {suggestion && (
          <div className="space-y-4">
            {suggestion.notes && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="font-body text-sm text-purple-800">
                  <span className="font-semibold">AI Notes: </span>{suggestion.notes}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <div className="p-3 bg-surface rounded-xl border border-border flex-1 text-center">
                <p className="font-body text-xs text-muted">Total Hours</p>
                <p className="font-mono font-semibold text-dark text-xl mt-1">{suggestion.total_hours}h</p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border flex-1 text-center">
                <p className="font-body text-xs text-muted">Est. Labour Cost</p>
                <p className="font-mono font-semibold text-dark text-xl mt-1">{formatGBP(suggestion.estimated_labour_cost)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, shifts]) => (
                <div key={date}>
                  <p className="font-body text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                    {DOW[new Date(date).getDay()]} {date}
                  </p>
                  <div className="space-y-1">
                    {shifts.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-surface rounded-lg border border-border">
                        <span className="font-body text-sm font-medium text-dark w-28 shrink-0">{s.staff_name}</span>
                        <span className="font-mono text-xs text-secondary">{s.start_time}–{s.end_time}</span>
                        <Badge variant={ROLE_BADGE[s.role] ?? 'grey'}>{s.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
