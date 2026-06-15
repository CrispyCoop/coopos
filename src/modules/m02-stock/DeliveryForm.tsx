import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deliveryFormSchema } from '@/lib/validators'
import { useCreateDelivery, useSuppliers, useIngredients } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof deliveryFormSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function DeliveryForm({ isOpen, onClose }: Props) {
  const { data: suppliers } = useSuppliers()
  const { data: ingredients } = useIngredients()
  const { mutateAsync: createDelivery } = useCreateDelivery()

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(deliveryFormSchema) as never,
    defaultValues: {
      delivered_at: new Date().toISOString().slice(0, 16),
      items: [{ ingredient_id: '', quantity: 0, unit: 'kg', cost_per_unit: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: control as never, name: 'items' })

  const supplierOptions = (suppliers ?? []).map((s) => ({ value: s.id, label: s.name }))
  const ingredientOptions = (ingredients ?? []).map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` }))
  const unitOptions = ['kg', 'g', 'L', 'ml', 'units', 'cases', 'packs'].map((u) => ({ value: u, label: u }))

  async function onSubmit(data: FormData) {
    try {
      await createDelivery(data)
      toast.success('Delivery recorded — stock updated automatically')
      reset()
      onClose()
    } catch {
      toast.error('Failed to record delivery')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Delivery" size="xl">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Supplier" options={supplierOptions} {...register('supplier_id')} />
          <Input label="Invoice Reference" {...register('invoice_ref')} />
        </div>
        <Input label="Delivery Date & Time" type="datetime-local" {...register('delivered_at')} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-dark">Items Received</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => (append as (v: unknown) => void)({ ingredient_id: '', quantity: 0, unit: 'kg', cost_per_unit: 0 })}
            >
              + Add Item
            </Button>
          </div>
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
              <div className="col-span-1">
                <Select
                  label={idx === 0 ? 'Ingredient' : ''}
                  options={ingredientOptions}
                  {...register(`items.${idx}.ingredient_id` as never)}
                />
              </div>
              <Input
                label={idx === 0 ? 'Qty' : ''}
                type="number"
                step="0.01"
                {...register(`items.${idx}.quantity` as never)}
              />
              <Select
                label={idx === 0 ? 'Unit' : ''}
                options={unitOptions}
                {...register(`items.${idx}.unit` as never)}
              />
              <div className="flex items-end gap-2">
                <Input
                  label={idx === 0 ? 'Cost/Unit (£)' : ''}
                  type="number"
                  step="0.01"
                  {...register(`items.${idx}.cost_per_unit` as never)}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="mb-1 font-body text-xs text-red hover:opacity-70"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>Record Delivery</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
