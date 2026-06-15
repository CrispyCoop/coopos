import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { supplierFormSchema, type SupplierFormData } from '@/lib/validators'
import { QUERY_KEYS } from '@/lib/queries'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Supplier } from '@/types/stock'

interface Props {
  isOpen: boolean
  onClose: () => void
  existing?: Supplier | null
}

export function SupplierForm({ isOpen, onClose, existing }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema) as never,
    defaultValues: { payment_terms_days: 30 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        contact_name: existing.contact_name ?? '',
        phone: existing.phone ?? '',
        email: existing.email ?? '',
        account_number: existing.account_number ?? '',
        payment_terms_days: existing.payment_terms_days,
        minimum_order_value: existing.minimum_order_value ?? undefined,
        website: existing.website ?? '',
        notes: existing.notes ?? '',
      })
    } else {
      reset({ payment_terms_days: 30 })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const payload = {
        name: data.name,
        contact_name: data.contact_name || null,
        phone: data.phone || null,
        email: data.email || null,
        account_number: data.account_number || null,
        payment_terms_days: data.payment_terms_days,
        minimum_order_value: data.minimum_order_value ?? null,
        website: data.website || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
      }
      if (existing) {
        const { error } = await supabase.from('suppliers').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('suppliers').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.suppliers })
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Supplier' : 'Add Supplier'} size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Input label="Supplier Name" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Contact Name" {...register('contact_name')} />
          <Input label="Phone" type="tel" {...register('phone')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Account Number" {...register('account_number')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Payment Terms (days)" type="number" error={errors.payment_terms_days?.message} {...register('payment_terms_days')} />
          <Input label="Min Order Value (£)" type="number" step="0.01" {...register('minimum_order_value')} />
        </div>
        <Input label="Website" type="url" error={errors.website?.message} {...register('website')} />
        <Input label="Notes" {...register('notes')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{existing ? 'Save Changes' : 'Add Supplier'}</Button>
        </div>
      </form>
    </Modal>
  )
}
