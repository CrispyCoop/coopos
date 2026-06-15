import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useBusinessSettings, useUpdateBusinessSetting } from '@/lib/queries'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import toast from 'react-hot-toast'

export function IntegrationsSettings() {
  const { data: settings, isLoading } = useBusinessSettings()
  const { mutateAsync: updateSetting } = useUpdateBusinessSetting()

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<{ sfbb_app_url: string }>()

  useEffect(() => {
    if (settings) reset({ sfbb_app_url: settings.sfbb_app_url ?? '' })
  }, [settings, reset])

  async function onSubmit(data: { sfbb_app_url: string }) {
    try {
      await updateSetting({ key: 'sfbb_app_url', value: data.sfbb_app_url })
      toast.success('SFBB App URL saved')
    } catch {
      toast.error('Failed to save')
    }
  }

  if (isLoading) return <div className="animate-pulse h-32 bg-surface rounded-xl" />

  return (
    <div className="space-y-4">
      <Card title="SFBB App Integration">
        <Alert
          type="info"
          message="CoopOS M08 Food Safety links out to your external SFBB app. Paste your SFBB app URL below to enable the button on the Food Safety page."
          className="mb-4"
        />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
          <Input
            label="SFBB App URL"
            type="url"
            placeholder="https://your-sfbb-app.co.uk"
            {...register('sfbb_app_url')}
            helper="This URL is used as the link on the Food Safety module page"
          />
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save URL</Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="font-body text-sm text-muted font-medium mb-2">Coming Soon — Full API Integration</p>
          <ul className="font-body text-xs text-muted space-y-1">
            <li>• Temperature log compliance status → CoopOS Health Score</li>
            <li>• Opening and closing checklist completion → Dashboard alerts</li>
            <li>• Allergen matrix → Menu Manager</li>
            <li>• Incident log → Reporting</li>
            <li>• Staff illness records → ROTA module</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
