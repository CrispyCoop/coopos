import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ingredientFormSchema } from '@/lib/validators'
import { useCreateIngredient, useUpdateIngredient, useSuppliers } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Ingredient } from '@/types/stock'
import type { z } from 'zod'
import toast from 'react-hot-toast'

type FormData = z.infer<typeof ingredientFormSchema>

const CATEGORIES = ['Protein', 'Produce', 'Dairy', 'Dry Goods', 'Sauces', 'Packaging', 'Beverages', 'Oils & Fats', 'Spices & Seasonings'].map((c) => ({ value: c, label: c }))
const UNITS = ['kg', 'g', 'L', 'ml', 'units', 'cases', 'packs'].map((u) => ({ value: u, label: u }))

interface Props {
  isOpen: boolean
  onClose: () => void
  ingredient?: Ingredient | null
}

export function IngredientForm({ isOpen, onClose, ingredient }: Props) {
  const { data: suppliers } = useSuppliers()
  const { mutateAsync: create } = useCreateIngredient()
  const { mutateAsync: update } = useUpdateIngredient()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(ingredientFormSchema) as never,
  })

  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        current_stock: ingredient.current_stock,
        par_level: ingredient.par_level,
        minimum_stock: ingredient.minimum_stock,
        cost_per_unit: ingredient.cost_per_unit,
        supplier_id: ingredient.supplier_id ?? '',
      })
    } else {
      reset({ name: '', category: '', unit: 'kg', current_stock: 0, par_level: 0, minimum_stock: 0, cost_per_unit: 0, supplier_id: '' })
    }
  }, [ingredient, reset])

  const supplierOptions = [
    { value: '', label: 'No supplier' },
    ...(suppliers ?? []).map((s) => ({ value: s.id, label: s.name })),
  ]

  async function onSubmit(data: FormData) {
    try {
      if (ingredient) {
        await update({ id: ingredient.id, ...data })
        toast.success('Ingredient updated')
      } else {
        await (create as (d: FormData) => Promise<unknown>)(data)
        toast.success('Ingredient added')
      }
      onClose()
    } catch {
      toast.error('Failed to save ingredient')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ingredient ? 'Edit Ingredient' : 'New Ingredient'} size="md">
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <Input label="Name" {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" options={CATEGORIES} {...register('category')} />
          <Select label="Unit" options={UNITS} {...register('unit')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Current Stock" type="number" step="0.01" {...register('current_stock')} />
          <Input label="Par Level" type="number" step="0.01" {...register('par_level')} />
          <Input label="Minimum" type="number" step="0.01" {...register('minimum_stock')} />
        </div>
        <Input label="Cost per Unit (£)" type="number" step="0.01" {...register('cost_per_unit')} />
        <Select label="Supplier" options={supplierOptions} {...register('supplier_id')} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>{ingredient ? 'Save Changes' : 'Add Ingredient'}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
