import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { disputeFormSchema, type DisputeFormData } from '@/lib/validators'
import { QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { todayISO } from '@/lib/utils'

const PLATFORM_OPTIONS = [
  { value: 'deliveroo', label: 'Deliveroo' },
  { value: 'ubereats', label: 'Uber Eats' },
  { value: 'justeat', label: 'Just Eat' },
  { value: 'foodhub', label: 'Foodhub' },
  { value: 'gogetter', label: 'GoGetter' },
]

const CLAIM_OPTIONS = [
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'other', label: 'Other' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function DisputeForm({ isOpen, onClose }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeFormSchema) as never,
    defaultValues: { order_date: todayISO(), claim_type: 'missing_item', camera_reviewed: false },
  })

  const mutation = useMutation({
    mutationFn: async (data: DisputeFormData) => {
      const { error } = await supabase.from('delivery_disputes').insert({
        platform: data.platform,
        order_ref: data.order_ref,
        order_date: data.order_date,
        claim_type: data.claim_type,
        claim_value: data.claim_value ?? null,
        camera_reviewed: data.camera_reviewed,
        evidence_summary: data.evidence_summary || null,
        notes: data.notes || null,
        status: 'open',
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.deliveryDisputes })
      reset()
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Dispute" size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Select label="Platform" options={PLATFORM_OPTIONS} error={errors.platform?.message} {...register('platform')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Order Reference" error={errors.order_ref?.message} {...register('order_ref')} />
          <Input label="Order Date" type="date" error={errors.order_date?.message} {...register('order_date')} />
        </div>
        <Select label="Claim Type" options={CLAIM_OPTIONS} error={errors.claim_type?.message} {...register('claim_type')} />
        <Input label="Claim Value (£)" type="number" step="0.01" {...register('claim_value')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="camera_reviewed" {...register('camera_reviewed')} className="w-4 h-4 rounded border-border" />
          <label htmlFor="camera_reviewed" className="font-body text-sm text-dark">Camera footage reviewed</label>
        </div>
        <Input label="Evidence Summary" placeholder="Brief description of evidence..." {...register('evidence_summary')} />
        <Input label="Notes" {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Log Dispute</Button>
        </div>
      </form>
    </Modal>
  )
}
