import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stockAdjustmentSchema } from '@/lib/validators'
import { useLogStockMovement, useIngredients } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof stockAdjustmentSchema>

const MOVEMENT_OPTIONS = [
  { value: 'adjustment_up', label: 'Adjustment Up' },
  { value: 'adjustment_down', label: 'Adjustment Down' },
  { value: 'delivery', label: 'Delivery Received' },
  { value: 'waste', label: 'Waste' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'stocktake', label: 'Stocktake Correction' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  preselectedIngredientId?: string
}

export function StockAdjustmentForm({ isOpen, onClose, preselectedIngredientId }: Props) {
  const { data: ingredients } = useIngredients()
  const { mutateAsync: logMovement } = useLogStockMovement()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(stockAdjustmentSchema) as never,
    defaultValues: { ingredient_id: preselectedIngredientId ?? '', movement_type: 'adjustment_up', quantity: 0, reference: '' },
  })

  const ingredientOptions = (ingredients ?? []).map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` }))

  async function onSubmit(data: FormData) {
    try {
      await logMovement(data)
      toast.success('Stock movement logged')
      reset()
      onClose()
    } catch {
      toast.error('Failed to log movement')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Stock Movement" size="md">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <Select label="Ingredient" options={ingredientOptions} {...register('ingredient_id')} />
        <Select label="Movement Type" options={MOVEMENT_OPTIONS} {...register('movement_type')} />
        <Input label="Quantity" type="number" step="0.01" {...register('quantity')} />
        <Input label="Reference / Notes" {...register('reference')} placeholder="Invoice ref, reason, etc." />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>Log Movement</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
