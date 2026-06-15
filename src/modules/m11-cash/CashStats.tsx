import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Stat } from '@/components/ui/Stat'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { TillCount } from '@/types/finance'

export function CashStats() {
  const today = todayISO()

  const { data: tillCounts } = useQuery({
    queryKey: ['till-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('till_counts')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as TillCount[]
    },
  })

  const todayCount = tillCounts?.find((t) => t.date === today)
  const lastCount = tillCounts?.[0]
  const avgVariance = tillCounts?.length
    ? tillCounts.filter((t) => t.variance != null).reduce((s, t) => s + Math.abs(t.variance ?? 0), 0) /
      tillCounts.filter((t) => t.variance != null).length
    : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat
        label="Today Cash Counted"
        value={todayCount?.total_cash != null ? formatGBP(todayCount.total_cash) : '—'}
        accent="green"
      />
      <Stat
        label="Today Variance"
        value={todayCount?.variance != null ? formatGBP(todayCount.variance) : '—'}
        accent={todayCount?.variance != null && Math.abs(todayCount.variance) > 5 ? 'red' : 'green'}
      />
      <Stat
        label="Last Count Date"
        value={lastCount?.date ?? '—'}
        accent="blue"
      />
      <Stat
        label="Avg Variance (abs)"
        value={formatGBP(avgVariance)}
        accent={avgVariance > 5 ? 'red' : 'green'}
      />
    </div>
  )
}
