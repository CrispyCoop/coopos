import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { wasteEntrySchema } from '@/lib/validators'
import { useLogWaste, useIngredients } from '@/lib/queries'
import { WASTE_REASONS } from '@/lib/constants'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof wasteEntrySchema>

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
]

const UNIT_OPTIONS = ['kg', 'g', 'L', 'ml', 'units', 'portions'].map((u) => ({ value: u, label: u }))

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function WasteEntryForm({ isOpen, onClose }: Props) {
  const { data: ingredients } = useIngredients()
  const { mutateAsync: logWaste } = useLogWaste()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(wasteEntrySchema) as never,
    defaultValues: { shift: 'morning', reason: 'over_prep', estimated_cost: 0 },
  })

  const ingredientOptions = (ingredients ?? []).map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` }))
  const reasonOptions = WASTE_REASONS.map((r) => ({ value: r.value, label: r.label }))

  async function onSubmit(data: FormData) {
    try {
      await logWaste(data)
      toast.success('Waste logged')
      reset()
      onClose()
    } catch {
      toast.error('Failed to log waste')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Waste" size="md">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <Select label="Ingredient" options={ingredientOptions} {...register('ingredient_id')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Quantity" type="number" step="0.01" {...register('quantity')} />
          <Select label="Unit" options={UNIT_OPTIONS} {...register('unit')} />
        </div>
        <Select label="Reason" options={reasonOptions} {...register('reason')} />
        <Select label="Shift" options={SHIFT_OPTIONS} {...register('shift')} />
        <Input label="Estimated Cost (£)" type="number" step="0.01" {...register('estimated_cost')} helper="Leave 0 to auto-calculate from ingredient cost" />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>Log Waste</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
