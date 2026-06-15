import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { overheadItemSchema } from '@/lib/validators'
import { QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { OverheadItem } from '@/types/finance'
import { z } from 'zod'

type OverheadFormData = z.infer<typeof overheadItemSchema>

const CATEGORY_OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'licences', label: 'Licences' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
]

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  existing?: OverheadItem | null
}

export function OverheadForm({ isOpen, onClose, existing }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OverheadFormData>({
    resolver: zodResolver(overheadItemSchema) as never,
    defaultValues: { frequency: 'monthly' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        category: existing.category,
        amount: existing.amount,
        frequency: existing.frequency,
        next_due_date: existing.next_due_date ?? '',
        notes: existing.notes ?? '',
      })
    } else {
      reset({ frequency: 'monthly' })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: async (data: OverheadFormData) => {
      const payload = {
        name: data.name,
        category: data.category,
        amount: data.amount,
        frequency: data.frequency,
        next_due_date: data.next_due_date || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (existing) {
        const { error } = await supabase.from('overhead_items').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('overhead_items').insert({ ...payload, active: true })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.overheadItems })
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Overhead' : 'Add Overhead'} size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Input label="Overhead Name" placeholder="e.g. Electricity" error={errors.name?.message} {...register('name')} />
        <Select label="Category" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register('category')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount (£)" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
          <Select label="Frequency" options={FREQ_OPTIONS} error={errors.frequency?.message} {...register('frequency')} />
        </div>
        <Input label="Next Due Date" type="date" {...register('next_due_date')} />
        <Input label="Notes" placeholder="Additional notes..." {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{existing ? 'Save Changes' : 'Add Overhead'}</Button>
        </div>
      </form>
    </Modal>
  )
}
