import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { absenceFormSchema, type AbsenceFormData } from '@/lib/validators'
import { useStaffMembers, QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/lib/utils'

const TYPE_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'sick', label: 'Sick' },
  { value: 'emergency', label: 'Emergency' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AbsenceForm({ isOpen, onClose }: Props) {
  const qc = useQueryClient()
  const { data: staff } = useStaffMembers()

  const staffOptions = [
    { value: '', label: 'Select staff member...' },
    ...(staff ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceFormSchema) as never,
    defaultValues: { absence_date: todayISO(), type: 'sick' },
  })

  const mutation = useMutation({
    mutationFn: async (data: AbsenceFormData) => {
      const { error } = await supabase.from('staff_absences').insert({
        staff_id: data.staff_id,
        absence_date: data.absence_date,
        type: data.type,
        reason: data.reason || null,
        notes: data.notes || null,
        cover_confirmed: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.absences })
      reset()
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Absence" size="sm">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Select label="Staff Member" options={staffOptions} error={errors.staff_id?.message} {...register('staff_id')} />
        <Input label="Date" type="date" error={errors.absence_date?.message} {...register('absence_date')} />
        <Select label="Absence Type" options={TYPE_OPTIONS} error={errors.type?.message} {...register('type')} />
        <Input label="Reason" placeholder="Brief reason..." {...register('reason')} />
        <Input label="Notes" placeholder="Additional notes..." {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Log Absence</Button>
        </div>
      </form>
    </Modal>
  )
}
