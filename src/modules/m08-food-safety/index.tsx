import { useBusinessSettings } from '@/lib/queries'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'

const CHECKLIST_PREVIEW = [
  'Daily temperature logs — fridge & freezer',
  'Opening hygiene checklist',
  'Closing hygiene checklist',
  'Allergen matrix compliance',
  'Delivery intake checks',
  'Pest control log',
  'Cleaning schedule',
  'Staff illness & exclusion log',
]

export default function FoodSafetyPage() {
  const { data: settings } = useBusinessSettings()
  const sfbbUrl = settings?.sfbb_app_url as string | undefined

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Food Safety"
        subtitle="SFBB-compliant food safety management"
        colour="green"
        action={
          sfbbUrl ? (
            <Button onClick={() => window.open(sfbbUrl, '_blank', 'noopener')}>
              Open SFBB App ↗
            </Button>
          ) : undefined
        }
      />

      <Alert
        type="info"
        message="Food safety diary management is handled by your external SFBB (Safer Food, Better Business) app. Use the button above to open it. Integration with CoopOS Health Score is planned for Phase 4."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="What's Tracked in Your SFBB App" accent="green">
          <ul className="space-y-2">
            {CHECKLIST_PREVIEW.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="font-body text-sm text-dark">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Phase 4 Integration Roadmap">
          <div className="space-y-3">
            {[
              { label: 'Temperature compliance → Health Score', status: 'planned' },
              { label: 'Opening/closing checklist status → Dashboard alert', status: 'planned' },
              { label: 'Allergen matrix → Menu Manager', status: 'planned' },
              { label: 'Incident log → Reporting module', status: 'planned' },
              { label: 'Staff illness records → ROTA module', status: 'planned' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-body text-sm text-dark">{item.label}</span>
                <Badge variant="grey">Planned</Badge>
              </div>
            ))}
          </div>
          {!sfbbUrl && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="font-body text-xs text-muted">
                Set your SFBB App URL in{' '}
                <a href="/settings" className="text-blue underline">Settings → Integrations</a>
                {' '}to enable the launch button.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
