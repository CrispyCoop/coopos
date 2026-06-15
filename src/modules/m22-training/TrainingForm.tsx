import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useStaffMembers } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/lib/utils'

const trainingFormSchema = z.object({
  staff_id: z.string().uuid('Select a staff member'),
  course: z.string().min(1, 'Course name is required'),
  provider: z.string().optional(),
  completed_date: z.string().min(1, 'Date is required'),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
})

type TrainingFormData = z.infer<typeof trainingFormSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function TrainingForm({ isOpen, onClose }: Props) {
  const qc = useQueryClient()
  const { data: staff } = useStaffMembers()

  const staffOptions = [
    { value: '', label: 'Select staff member...' },
    ...(staff ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingFormSchema) as never,
    defaultValues: { completed_date: todayISO() },
  })

  const mutation = useMutation({
    mutationFn: async (data: TrainingFormData) => {
      const { error } = await supabase.from('training_records').insert({
        staff_id: data.staff_id,
        course: data.course,
        provider: data.provider || null,
        completed_date: data.completed_date,
        expiry_date: data.expiry_date || null,
        notes: data.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['training-records'] })
      reset()
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Training" size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Select label="Staff Member" options={staffOptions} error={errors.staff_id?.message} {...register('staff_id')} />
        <Input label="Course / Qualification" placeholder="e.g. Food Hygiene Level 2" error={errors.course?.message} {...register('course')} />
        <Input label="Provider" placeholder="e.g. Highfield, RSPH, In-house" {...register('provider')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Completed Date" type="date" error={errors.completed_date?.message} {...register('completed_date')} />
          <Input label="Expiry Date" type="date" {...register('expiry_date')} />
        </div>
        <Input label="Notes" {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Log Training</Button>
        </div>
      </form>
    </Modal>
  )
}
