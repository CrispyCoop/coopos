import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { userFormSchema } from '@/lib/validators'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { UserProfile } from '@/types'
import type { z } from 'zod'
import toast from 'react-hot-toast'
import bcrypt from 'bcryptjs'

type FormData = z.infer<typeof userFormSchema>

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
]

export function UserManagement() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name')
      if (error) throw error
      return data as UserProfile[]
    },
  })

  const { mutateAsync: createUser, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: crypto.randomUUID(),
        email_confirm: true,
      })
      if (authError) throw authError

      const pin_hash = data.pin ? bcrypt.hashSync(data.pin, 10) : null

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        pin_hash,
      })
      if (profileError) throw profileError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setModalOpen(false)
      toast.success('User created')
    },
    onError: () => toast.error('Failed to create user'),
  })

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { role: 'staff' },
  })

  const selectedRole = watch('role')

  function handleOpen() { reset(); setModalOpen(true) }

  const roleBadge = (role: string) => {
    if (role === 'owner') return <Badge variant="red">Owner</Badge>
    if (role === 'manager') return <Badge variant="amber">Manager</Badge>
    return <Badge variant="grey">Staff</Badge>
  }

  return (
    <>
      <Card
        title="Users"
        action={<Button size="sm" onClick={handleOpen}>+ Add User</Button>}
      >
        {isLoading ? (
          <div className="animate-pulse h-32 bg-surface rounded" />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'role', header: 'Role', render: (r) => roleBadge(r.role as string) },
              { key: 'phone', header: 'Phone', render: (r) => (r.phone as string) || '—' },
            ]}
            data={(users ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No users yet"
          />
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User" size="md">
        <form onSubmit={handleSubmit((d) => createUser(d))} className="space-y-4">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Select label="Role" options={ROLE_OPTIONS} {...register('role')} error={errors.role?.message} />
          {selectedRole === 'staff' && (
            <Input
              label="PIN (4 digits)"
              type="password"
              maxLength={4}
              {...register('pin')}
              error={errors.pin?.message}
              helper="Staff use this PIN to log in"
            />
          )}
          <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isPending}>Create User</Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
