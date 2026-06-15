import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatGBP } from '@/lib/utils'

interface Props {
  date: string
}

export function LiveRevenueTicker({ date }: Props) {
  const [total, setTotal] = useState(0)
  const [lastAmount, setLastAmount] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('sales_records')
      .select('total, created_at')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)
      .then(({ data }) => {
        if (data) setTotal(data.reduce((s, r) => s + Number(r.total), 0))
      })

    const channel = supabase
      .channel('sales-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales_records' },
        (payload) => {
          const rec = payload.new as { total: number }
          setTotal((t) => t + Number(rec.total))
          setLastAmount(formatGBP(rec.total))
          setTimeout(() => setLastAmount(null), 3000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [date])

  return (
    <div className="flex items-end gap-3">
      <span className="font-display text-5xl text-dark leading-none">{formatGBP(total)}</span>
      {lastAmount && (
        <span className="font-mono text-sm text-green-600 animate-pulse mb-1">+{lastAmount}</span>
      )}
    </div>
  )
}
