import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { shiftFormSchema, type ShiftFormData } from '@/lib/validators'
import { useStaffMembers, QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const LOCATION_OPTIONS = [
  { value: '', label: 'No location' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'counter', label: 'Counter' },
  { value: 'closing', label: 'Closing' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  weekId: string
  defaultDate?: string
}

export function ShiftForm({ isOpen, onClose, weekId, defaultDate }: Props) {
  const qc = useQueryClient()
  const { data: staff } = useStaffMembers()

  const staffOptions = [
    { value: '', label: 'Select staff member...' },
    ...(staff ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema) as never,
    defaultValues: { shift_date: defaultDate ?? '' },
  })

  const mutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      const { error } = await supabase.from('rota_shifts').insert({
        rota_week_id: weekId,
        staff_id: data.staff_id,
        shift_date: data.shift_date,
        start_time: data.start_time,
        end_time: data.end_time,
        role: data.role || null,
        location: data.location || null,
        notes: data.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rotaShifts(weekId) })
      reset()
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Shift" size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Select label="Staff Member" options={staffOptions} error={errors.staff_id?.message} {...register('staff_id')} />
        <Input label="Date" type="date" error={errors.shift_date?.message} {...register('shift_date')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Time" type="time" error={errors.start_time?.message} {...register('start_time')} />
          <Input label="End Time" type="time" error={errors.end_time?.message} {...register('end_time')} />
        </div>
        <Input label="Role override" placeholder="e.g. Supervisor" {...register('role')} />
        <Select label="Location" options={LOCATION_OPTIONS} {...register('location')} />
        <Input label="Notes" {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Add Shift</Button>
        </div>
      </form>
    </Modal>
  )
}
