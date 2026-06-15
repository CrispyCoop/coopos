import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { staffMemberSchema, type StaffMemberData } from '@/lib/validators'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { QUERY_KEYS } from '@/lib/queries'
import type { StaffMember } from '@/types/staff'

interface Props {
  isOpen: boolean
  onClose: () => void
  existing?: StaffMember | null
}

export function StaffForm({ isOpen, onClose, existing }: Props) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StaffMemberData>({
    resolver: zodResolver(staffMemberSchema) as never,
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        role: existing.role,
        hourly_rate: existing.hourly_rate,
        contracted_hours: existing.contracted_hours ?? undefined,
        phone: existing.phone ?? '',
        emergency_contact: existing.emergency_contact ?? '',
        food_hygiene_cert_expiry: existing.food_hygiene_cert_expiry ?? '',
        started_at: existing.started_at ?? '',
      })
    } else {
      reset({ name: '', role: '', hourly_rate: 0 })
    }
  }, [existing, reset])

  const mutation = useMutation({
    mutationFn: async (data: StaffMemberData) => {
      const payload = {
        name: data.name,
        role: data.role,
        hourly_rate: data.hourly_rate,
        contracted_hours: data.contracted_hours ?? null,
        phone: data.phone || null,
        emergency_contact: data.emergency_contact || null,
        food_hygiene_cert_expiry: data.food_hygiene_cert_expiry || null,
        started_at: data.started_at || null,
        updated_at: new Date().toISOString(),
      }
      if (existing) {
        const { error } = await supabase.from('staff_members').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('staff_members').insert({ ...payload, active: true })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.staffMembers })
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Staff Member' : 'Add Staff Member'} size="md">
      <form onSubmit={handleSubmit(mutation.mutateAsync as never)} className="space-y-4">
        <Input label="Full Name" error={errors.name?.message} {...register('name')} />
        <Input label="Role / Job Title" placeholder="Kitchen Staff, Manager..." error={errors.role?.message} {...register('role')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Hourly Rate (£)" type="number" step="0.01" error={errors.hourly_rate?.message} {...register('hourly_rate')} />
          <Input label="Contracted Hrs/Week" type="number" step="0.5" error={errors.contracted_hours?.message} {...register('contracted_hours')} />
        </div>
        <Input label="Phone" type="tel" {...register('phone')} />
        <Input label="Emergency Contact" placeholder="Name & number" {...register('emergency_contact')} />
        <Input label="Food Hygiene Cert Expiry" type="date" {...register('food_hygiene_cert_expiry')} />
        <Input label="Started Date" type="date" {...register('started_at')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>{existing ? 'Save Changes' : 'Add Staff Member'}</Button>
        </div>
      </form>
    </Modal>
  )
}
