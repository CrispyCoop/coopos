import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBusinessSettings, useUpdateBusinessSetting } from '@/lib/queries'
import { businessSettingsSchema } from '@/lib/validators'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { z } from 'zod'

type FormData = z.infer<typeof businessSettingsSchema>

export function BusinessSettings() {
  const { data: settings, isLoading } = useBusinessSettings()
  const { mutateAsync: updateSetting } = useUpdateBusinessSetting()

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(businessSettingsSchema),
  })

  useEffect(() => {
    if (settings) {
      reset({
        business_name: settings.business_name ?? 'Crispy Coop',
        business_location: settings.business_location ?? 'Hertford, UK',
        phone: settings.owner_phone ?? '',
        email: settings.owner_email ?? '',
        opening_time: settings.opening_time ?? '12:00',
        closing_time: settings.closing_time ?? '22:00',
      })
    }
  }, [settings, reset])

  async function onSubmit(data: FormData) {
    try {
      await Promise.all([
        updateSetting({ key: 'business_name', value: data.business_name }),
        updateSetting({ key: 'business_location', value: data.business_location }),
        updateSetting({ key: 'owner_phone', value: data.phone ?? '' }),
        updateSetting({ key: 'owner_email', value: data.email ?? '' }),
        updateSetting({ key: 'opening_time', value: data.opening_time }),
        updateSetting({ key: 'closing_time', value: data.closing_time }),
      ])
      toast.success('Business settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded-xl" />

  return (
    <Card title="Business Information">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <Input label="Business Name" {...register('business_name')} error={errors.business_name?.message} />
        <Input label="Location" {...register('business_location')} error={errors.business_location?.message} />
        <Input label="Owner Phone" type="tel" {...register('phone')} error={errors.phone?.message} />
        <Input label="Owner Email" type="email" {...register('email')} error={errors.email?.message} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Opening Time" type="time" {...register('opening_time')} error={errors.opening_time?.message} />
          <Input label="Closing Time" type="time" {...register('closing_time')} error={errors.closing_time?.message} />
        </div>
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save Changes</Button>
      </form>
    </Card>
  )
}
