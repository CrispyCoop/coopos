import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBusinessSettings, useUpdateBusinessSetting } from '@/lib/queries'
import { targetSettingsSchema } from '@/lib/validators'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import toast from 'react-hot-toast'
import type { z } from 'zod'

type FormData = z.infer<typeof targetSettingsSchema>

export function TargetSettings() {
  const { data: settings, isLoading } = useBusinessSettings()
  const { mutateAsync: updateSetting } = useUpdateBusinessSetting()

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(targetSettingsSchema) as never,
  })

  useEffect(() => {
    if (settings) {
      reset({
        daily_revenue_target: Number(settings.daily_revenue_target) || 419,
        food_cost_target_pct: Number(settings.food_cost_target_pct) || 38,
        waste_target_pct: Number(settings.waste_target_pct) || 2,
        margin_alert_threshold: Number(settings.margin_alert_threshold) || 35,
      })
    }
  }, [settings, reset])

  async function onSubmit(data: FormData) {
    try {
      await Promise.all([
        updateSetting({ key: 'daily_revenue_target', value: String(data.daily_revenue_target) }),
        updateSetting({ key: 'food_cost_target_pct', value: String(data.food_cost_target_pct) }),
        updateSetting({ key: 'waste_target_pct', value: String(data.waste_target_pct) }),
        updateSetting({ key: 'margin_alert_threshold', value: String(data.margin_alert_threshold) }),
      ])
      toast.success('Targets saved — changes flow to all modules immediately')
    } catch {
      toast.error('Failed to save targets')
    }
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded-xl" />

  return (
    <div className="space-y-4">
      <Alert
        type="info"
        message="Changes to targets take effect immediately across all modules — Dashboard, Finance, Cost Calculator, and Health Score will all update."
      />
      <Card title="Business Targets">
        <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4 max-w-lg">
          <Input
            label="Daily Revenue Target (£)"
            type="number"
            step="1"
            {...register('daily_revenue_target')}
            error={errors.daily_revenue_target?.message}
            helper="The daily sales target shown on the dashboard gauge"
          />
          <Input
            label="Food Cost Target (%)"
            type="number"
            step="0.1"
            {...register('food_cost_target_pct')}
            error={errors.food_cost_target_pct?.message}
            helper="Typical fast food target is 28–35%. Crispy Coop baseline: 38%"
          />
          <Input
            label="Waste Target (%)"
            type="number"
            step="0.1"
            {...register('waste_target_pct')}
            error={errors.waste_target_pct?.message}
            helper="Waste cost as % of food cost. Target: 2%"
          />
          <Input
            label="Margin Alert Threshold (%)"
            type="number"
            step="1"
            {...register('margin_alert_threshold')}
            error={errors.margin_alert_threshold?.message}
            helper="Items below this margin trigger alerts. Default: 35%"
          />
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save Targets</Button>
        </form>
      </Card>
    </div>
  )
}
