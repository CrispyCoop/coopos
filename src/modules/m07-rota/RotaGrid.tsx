import { useState } from 'react'
import { useRotaWeeks, useRotaShifts, useStaffMembers } from '@/lib/queries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import { QUERY_KEYS } from '@/lib/queries'
import { ShiftForm } from './ShiftForm'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayDates(weekStart: string) {
  const start = new Date(weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
}

export function RotaGrid() {
  const qc = useQueryClient()
  const { data: weeks } = useRotaWeeks()
  const { data: staff } = useStaffMembers()
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0)
  const [shiftFormOpen, setShiftFormOpen] = useState(false)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()

  const selectedWeek = weeks?.[selectedWeekIdx]
  const { data: shifts } = useRotaShifts(selectedWeek?.id ?? '')
  const dates = selectedWeek ? getDayDates(selectedWeek.week_start_date) : []

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rota_shifts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => selectedWeek && qc.invalidateQueries({ queryKey: QUERY_KEYS.rotaShifts(selectedWeek.id) }),
  })

  const createWeek = useMutation({
    mutationFn: async () => {
      const monday = new Date()
      monday.setDate(monday.getDate() - monday.getDay() + 1)
      const { error } = await supabase.from('rota_weeks').insert({
        week_start_date: monday.toISOString().split('T')[0],
        published: false,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.rotaWeeks }),
  })

  const getShiftsForDay = (date: string) => (shifts ?? []).filter((s) => s.shift_date === date)

  const totalLabour = (shifts ?? []).reduce((sum, s) => {
    const hrs = calcHours(s.start_time, s.end_time)
    const rate = s.staff_members?.hourly_rate ?? 0
    return sum + hrs * rate
  }, 0)

  if (!weeks?.length) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon="📅"
          title="No rota weeks yet"
          message="Create the first rota week to start scheduling."
        />
        <Button onClick={() => createWeek.mutate()} loading={createWeek.isPending}>+ Create This Week's Rota</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedWeekIdx}
          onChange={(e) => setSelectedWeekIdx(Number(e.target.value))}
          className="px-3 py-2 text-sm font-body border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {(weeks ?? []).map((w, i) => (
            <option key={w.id} value={i}>Week of {w.week_start_date}</option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={() => createWeek.mutate()} loading={createWeek.isPending}>
          + New Week
        </Button>
        {selectedWeek && (
          <span className="ml-auto font-body text-sm text-muted">
            Est. labour cost: <span className="font-mono font-medium text-dark">{formatGBP(totalLabour)}</span>
          </span>
        )}
      </div>

      {selectedWeek && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs font-body border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 bg-surface font-medium text-muted w-28">Staff</th>
                {dates.map((date, i) => (
                  <th
                    key={date}
                    className="text-center p-2 bg-surface font-medium text-muted cursor-pointer hover:bg-border transition-colors"
                    onClick={() => { setDefaultDate(date); setShiftFormOpen(true) }}
                  >
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-muted/60">{date.slice(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(staff ?? []).map((member) => (
                <tr key={member.id} className="border-t border-border">
                  <td className="p-2 font-medium text-dark">{member.name}</td>
                  {dates.map((date) => {
                    const dayShifts = getShiftsForDay(date).filter((s) => s.staff_id === member.id)
                    return (
                      <td key={date} className="p-1 border-l border-border align-top min-w-[90px]">
                        {dayShifts.map((s) => (
                          <div
                            key={s.id}
                            className="bg-primary/10 text-primary rounded p-1 mb-1 group relative cursor-pointer"
                          >
                            <div className="font-medium">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</div>
                            {s.location && <div className="text-muted">{s.location}</div>}
                            <button
                              onClick={() => deleteShift.mutate(s.id)}
                              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                            >×</button>
                          </div>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button size="sm" onClick={() => { setDefaultDate(undefined); setShiftFormOpen(true) }}>+ Add Shift</Button>

      {selectedWeek && (
        <ShiftForm
          isOpen={shiftFormOpen}
          onClose={() => setShiftFormOpen(false)}
          weekId={selectedWeek.id}
          defaultDate={defaultDate}
        />
      )}
    </div>
  )
}
