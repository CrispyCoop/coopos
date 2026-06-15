import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useStaffMembers } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import { todayISO } from '@/lib/utils'
import type { WagePayment } from '@/types/staff'

type Row = Record<string, unknown>

export function WagePayments() {
  const qc = useQueryClient()
  const { data: staff } = useStaffMembers()
  const [formOpen, setFormOpen] = useState(false)
  const [staffId, setStaffId] = useState('')
  const [weekStart, setWeekStart] = useState(todayISO())
  const [hoursWorked, setHoursWorked] = useState('')
  const [totalPaid, setTotalPaid] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['wage-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wage_payments')
        .select('*, staff_members(name)')
        .order('payment_date', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as (WagePayment & { staff_members: { name: string } | null })[]
    },
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const selectedStaff = staff?.find((s) => s.id === staffId)
      const { error } = await supabase.from('wage_payments').insert({
        staff_id: staffId,
        week_start: weekStart,
        hours_worked: hoursWorked ? Number(hoursWorked) : null,
        hourly_rate: selectedStaff?.hourly_rate ?? null,
        total_paid: Number(totalPaid),
        payment_date: paymentDate,
        payment_method: 'bank_transfer',
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wage-payments'] })
      setFormOpen(false)
      setStaffId('')
      setHoursWorked('')
      setTotalPaid('')
    },
  })

  const staffOptions = [
    { value: '', label: 'Select staff member...' },
    ...(staff ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>+ Log Payment</Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : !data?.length ? (
        <EmptyState icon="💳" title="No wage payments logged" message="Record wage payments to track payroll." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'staff', header: 'Staff', render: (r) => {
              const member = r.staff_members as { name: string } | null
              return member?.name ?? '—'
            }},
            { key: 'week_start', header: 'Week Of', render: (r) => r.week_start as string },
            { key: 'hours_worked', header: 'Hours', render: (r) =>
              r.hours_worked != null ? `${r.hours_worked}h` : '—'
            },
            { key: 'total_paid', header: 'Total Paid', render: (r) => (
              <span className="font-mono font-medium">{formatGBP(r.total_paid as number)}</span>
            )},
            { key: 'payment_date', header: 'Paid Date', render: (r) => (r.payment_date as string) || '—' },
          ]}
          data={(data ?? []) as unknown as Row[]}
        />
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Log Wage Payment" size="sm">
        <div className="space-y-4">
          <Select label="Staff Member" options={staffOptions} value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          <Input label="Week Start" type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          <Input label="Hours Worked" type="number" step="0.5" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} />
          <Input label="Total Paid (£)" type="number" step="0.01" value={totalPaid} onChange={(e) => setTotalPaid(e.target.value)} />
          <Input label="Payment Date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => { setIsSubmitting(true); await mutation.mutateAsync(); setIsSubmitting(false) }}
              loading={isSubmitting}
            >
              Save Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
