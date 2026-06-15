import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useSOPs } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'

export function SOPStats() {
  const { data: sops } = useSOPs()
  const { data: ackCount } = useQuery({
    queryKey: ['sop_ack_count'],
    queryFn: async () => {
      const { count } = await supabase.from('sop_acknowledgements').select('*', { count: 'exact', head: true })
      return count ?? 0
    },
  })

  const active = (sops ?? []).filter((s) => s.is_active).length
  const total = (sops ?? []).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Total SOPs" value={String(total)} accent="blue" />
      <Stat label="Active SOPs" value={String(active)} accent="green" />
      <Stat label="Draft SOPs" value={String(total - active)} accent="yellow" />
      <Stat label="Acknowledgements" value={String(ackCount ?? 0)} accent="blue" />
    </div>
  )
}
