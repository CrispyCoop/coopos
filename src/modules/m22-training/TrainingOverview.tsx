import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useStaffMembers } from '@/lib/queries'
import { Stat } from '@/components/ui/Stat'
import { Badge } from '@/components/ui/Badge'
import { todayISO } from '@/lib/utils'

interface TrainingRecord {
  id: string
  staff_id: string
  course: string
  provider: string | null
  completed_date: string
  expiry_date: string | null
  certificate_url: string | null
  notes: string | null
}

export function TrainingOverview() {
  const { data: staff } = useStaffMembers()
  const today = todayISO()
  const in60Days = new Date()
  in60Days.setDate(in60Days.getDate() + 60)
  const in60ISO = in60Days.toISOString().split('T')[0]

  const { data: records } = useQuery({
    queryKey: ['training-records'],
    queryFn: async () => {
      const { data, error } = await supabase.from('training_records').select('*').order('completed_date', { ascending: false })
      if (error) throw error
      return data as TrainingRecord[]
    },
  })

  const staffWithExpiredHygiene = (staff ?? []).filter((s) => {
    if (!s.food_hygiene_cert_expiry) return false
    return s.food_hygiene_cert_expiry < today
  })

  const expiringHygiene = (staff ?? []).filter((s) => {
    if (!s.food_hygiene_cert_expiry) return false
    return s.food_hygiene_cert_expiry >= today && s.food_hygiene_cert_expiry <= in60ISO
  })

  const expiringCourses = (records ?? []).filter((r) => {
    if (!r.expiry_date) return false
    return r.expiry_date >= today && r.expiry_date <= in60ISO
  })

  const staffWithRecords = new Set((records ?? []).map((r) => r.staff_id))
  const staffWithoutTraining = (staff ?? []).filter((s) => !staffWithRecords.has(s.id))

  const compliancePct = (staff ?? []).length > 0
    ? Math.round((staffWithRecords.size / (staff ?? []).length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Compliance" value={`${compliancePct}%`} accent={compliancePct >= 80 ? 'green' : 'red'} />
        <Stat label="Total Records" value={String((records ?? []).length)} accent="blue" />
        <Stat label="Expired Hygiene Certs" value={String(staffWithExpiredHygiene.length)} accent={staffWithExpiredHygiene.length > 0 ? 'red' : 'green'} />
        <Stat label="Expiring Soon (60d)" value={String(expiringHygiene.length + expiringCourses.length)} accent={expiringHygiene.length + expiringCourses.length > 0 ? 'yellow' : 'green'} />
      </div>

      {staffWithExpiredHygiene.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-sm font-semibold text-red-700">Expired Food Hygiene Certificates</p>
          {staffWithExpiredHygiene.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="font-body text-sm text-dark">{s.name}</span>
              <Badge variant="red">Expired {s.food_hygiene_cert_expiry}</Badge>
            </div>
          ))}
        </div>
      )}

      {expiringHygiene.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-sm font-semibold text-amber-700">Certificates Expiring Within 60 Days</p>
          {expiringHygiene.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="font-body text-sm text-dark">{s.name}</span>
              <Badge variant="amber">Expires {s.food_hygiene_cert_expiry}</Badge>
            </div>
          ))}
        </div>
      )}

      {staffWithoutTraining.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-sm font-semibold text-muted">Staff With No Training Records</p>
          <div className="flex flex-wrap gap-2">
            {staffWithoutTraining.map((s) => <Badge key={s.id} variant="grey">{s.name}</Badge>)}
          </div>
        </div>
      )}
    </div>
  )
}
