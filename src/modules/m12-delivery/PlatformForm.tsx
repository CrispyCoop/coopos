import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const platformFormSchema = z.object({
  platform: z.enum(['deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']),
  commission_rate: z.coerce.number().min(0).max(100),
  current_rating: z.coerce.number().min(0).max(5),
  prep_time_mins: z.coerce.number().min(1).max(120),
  is_active: z.boolean().default(true),
})

type PlatformFormData = z.infer<typeof platformFormSchema>

const PLATFORM_OPTIONS = [
  { value: 'deliveroo', label: 'Deliveroo' },
  { value: 'ubereats', label: 'Uber Eats' },
  { value: 'justeat', label: 'Just Eat' },
  { value: 'foodhub', label: 'Foodhub' },
  { value: 'gogetter', label: 'GoGetter' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function PlatformForm({ isOpen, onClose }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlatformFormData>({
    resolver: zodResolver(platformFormSchema) as never,
    defaultValues: { platform: 'deliveroo', commission_rate: 30, current_rating: 0, prep_time_mins: 20, is_active: true },
  })

  const mutation = useMutation({
    mutationFn: async (data: PlatformFormData) => {
      const { error } = await supabase.from('platform_settings').upsert(
        { ...data, last_updated: new Date().toISOString() },
        { onConflict: 'platform' }
      )
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.platformSettings })
      reset()
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add / Update Platform" size="sm">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Select label="Platform" options={PLATFORM_OPTIONS} error={errors.platform?.message} {...register('platform')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Commission Rate (%)" type="number" step="0.1" error={errors.commission_rate?.message} {...register('commission_rate')} />
          <Input label="Prep Time (mins)" type="number" error={errors.prep_time_mins?.message} {...register('prep_time_mins')} />
        </div>
        <Input label="Current Rating (0-5)" type="number" step="0.1" error={errors.current_rating?.message} {...register('current_rating')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Save Platform</Button>
        </div>
      </form>
    </Modal>
  )
}
