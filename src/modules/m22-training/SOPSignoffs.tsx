import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useStaffMembers, useSOPs } from '@/lib/queries'
import { EmptyState } from '@/components/ui/EmptyState'

export function SOPSignoffs() {
  const { data: staff } = useStaffMembers()
  const { data: sops } = useSOPs()

  const { data: acks } = useQuery({
    queryKey: ['sop-signoffs-matrix'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sop_acknowledgements')
        .select('staff_id, sop_id')
      if (error) throw error
      return data as { staff_id: string; sop_id: string }[]
    },
  })

  const ackSet = new Set((acks ?? []).map((a) => `${a.staff_id}:${a.sop_id}`))

  // Show a subset — top 15 most recent SOPs to keep the grid manageable
  const displaySOPs = (sops ?? []).slice(0, 15)
  const displayStaff = staff ?? []

  if (!displayStaff.length || !displaySOPs.length) {
    return <EmptyState icon="✅" title="No data yet" message="Add staff members and SOPs to see the sign-off matrix." />
  }

  const totalCells = displayStaff.length * displaySOPs.length
  const signedCells = displayStaff.reduce((count, s) =>
    count + displaySOPs.filter((sop) => ackSet.has(`${s.id}:${sop.id}`)).length, 0
  )
  const pct = totalCells > 0 ? Math.round((signedCells / totalCells) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct >= 80 ? '#1A6B3C' : pct >= 50 ? '#FFC300' : '#D62828' }}
          />
        </div>
        <span className="font-mono text-sm font-medium text-dark">{pct}%</span>
        <span className="font-body text-xs text-muted">{signedCells}/{totalCells} sign-offs</span>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs font-body border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 bg-surface font-medium text-muted min-w-[120px] sticky left-0 z-10">SOP</th>
              {displayStaff.map((s) => (
                <th key={s.id} className="text-center p-1 bg-surface font-medium text-muted min-w-[70px]">
                  <div className="truncate max-w-[70px]" title={s.name}>{s.name.split(' ')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displaySOPs.map((sop) => (
              <tr key={sop.id} className="border-t border-border">
                <td className="p-2 text-dark sticky left-0 bg-white border-r border-border">
                  <div className="max-w-[200px]">
                    <p className="font-medium truncate">{sop.reference}</p>
                    <p className="text-muted truncate">{sop.title}</p>
                  </div>
                </td>
                {displayStaff.map((s) => {
                  const signed = ackSet.has(`${s.id}:${sop.id}`)
                  return (
                    <td key={s.id} className="text-center p-1 border-l border-border">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          signed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {signed ? '✓' : '✗'}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(sops ?? []).length > 15 && (
        <p className="font-body text-xs text-muted">Showing first 15 of {sops?.length} SOPs</p>
      )}
    </div>
  )
}
