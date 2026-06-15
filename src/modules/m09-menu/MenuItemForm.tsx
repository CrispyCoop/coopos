import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { menuItemFormSchema, type MenuItemFormData } from '@/lib/validators'
import { useMenuCategories, QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { MenuItem } from '@/types/menu'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'removed', label: 'Removed' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  existing?: MenuItem | null
}

export function MenuItemForm({ isOpen, onClose, existing }: Props) {
  const qc = useQueryClient()
  const { data: categories } = useMenuCategories()

  const catOptions = [
    { value: '', label: 'No category' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema) as never,
    defaultValues: { status: 'active', delivery_price_uplift_pct: 30 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description ?? '',
        category_id: existing.category_id ?? '',
        instore_price: existing.instore_price,
        delivery_price_uplift_pct: existing.delivery_price_uplift_pct,
        status: existing.status,
      })
    } else {
      reset({ status: 'active', delivery_price_uplift_pct: 30 })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        category_id: data.category_id || null,
        instore_price: data.instore_price,
        delivery_price_uplift_pct: data.delivery_price_uplift_pct,
        status: data.status,
        updated_at: new Date().toISOString(),
      }
      if (existing) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('menu_items').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.menuItems })
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Menu Item' : 'Add Menu Item'} size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Input label="Item Name" error={errors.name?.message} {...register('name')} />
        <Input label="Description" placeholder="Brief description..." {...register('description')} />
        <Select label="Category" options={catOptions} error={errors.category_id?.message} {...register('category_id')} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="In-Store Price (£)"
            type="number"
            step="0.01"
            min="0"
            error={errors.instore_price?.message}
            {...register('instore_price')}
          />
          <Input
            label="Delivery Uplift (%)"
            type="number"
            step="1"
            min="0"
            error={errors.delivery_price_uplift_pct?.message}
            {...register('delivery_price_uplift_pct')}
          />
        </div>
        <Select label="Status" options={STATUS_OPTIONS} error={errors.status?.message} {...register('status')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{existing ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </form>
    </Modal>
  )
}
