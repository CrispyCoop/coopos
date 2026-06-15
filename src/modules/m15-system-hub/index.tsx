import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useBusinessSettings } from '@/lib/queries'

const SYSTEMS = [
  { name: 'Supabase Database', type: 'Database', status: 'online', icon: '🗄️', description: 'PostgreSQL + RLS + Realtime' },
  { name: 'Supabase Auth', type: 'Authentication', status: 'online', icon: '🔐', description: 'PIN-based staff login' },
  { name: 'Supabase Storage', type: 'Storage', status: 'online', icon: '🪣', description: 'Assets & generated reports' },
  { name: 'Twilio SMS', type: 'Messaging', status: 'configured', icon: '📱', description: 'Alerts & staff comms — Phase 3' },
  { name: 'SendGrid Email', type: 'Email', status: 'configured', icon: '📧', description: 'Automated reports & notifications' },
  { name: 'Anthropic Claude', type: 'AI', status: 'configured', icon: '🤖', description: 'Daily briefings, demand forecasting' },
  { name: 'OpenWeatherMap', type: 'Weather', status: 'configured', icon: '🌤️', description: 'Weather widget & demand impact' },
  { name: 'Deliveroo', type: 'Delivery Platform', status: 'manual', icon: '🦘', description: 'Manual payout reconciliation' },
  { name: 'Uber Eats', type: 'Delivery Platform', status: 'manual', icon: '🚗', description: 'Manual payout reconciliation' },
  { name: 'Just Eat', type: 'Delivery Platform', status: 'manual', icon: '🍕', description: 'Manual payout reconciliation' },
  { name: 'EPOS System', type: 'POS', status: 'manual', icon: '🖥️', description: 'Manual till reconciliation' },
  { name: 'Stripe', type: 'Payments', status: 'phase4', icon: '💳', description: 'App order payments — Phase 4' },
]

const STATUS_BADGE: Record<string, 'green' | 'blue' | 'grey' | 'amber' | 'purple'> = {
  online: 'green',
  configured: 'blue',
  manual: 'grey',
  phase4: 'purple',
}

const AI_FEATURES = [
  { name: 'Daily Briefing Generator', status: 'active', metric: 'Runs nightly via Edge Function' },
  { name: 'Demand Forecast', status: 'phase3', metric: 'Coming Phase 3' },
  { name: 'Smart Rota Suggestions', status: 'phase3', metric: 'Coming Phase 3' },
  { name: 'Margin Guardian Alerts', status: 'active', metric: 'Fires when margin < threshold' },
  { name: 'Complaint Analysis', status: 'phase3', metric: 'Coming Phase 3' },
  { name: 'Voice AI (Bland AI)', status: 'phase4', metric: 'Coming Phase 4' },
]

export default function SystemHubPage() {
  const { data: settings } = useBusinessSettings()

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="System Hub"
        subtitle="Connected systems, integrations, and AI feature status"
        colour="blue"
      />

      <Card title="Connected Systems">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYSTEMS.map((sys) => (
            <div key={sys.name} className="p-3 bg-surface rounded-xl border border-border flex items-start gap-3">
              <span className="text-2xl">{sys.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-body text-sm font-medium text-dark">{sys.name}</span>
                  <Badge variant={STATUS_BADGE[sys.status] ?? 'grey'}>
                    {sys.status === 'phase4' ? 'Phase 4' : sys.status}
                  </Badge>
                </div>
                <p className="font-body text-xs text-muted mt-0.5">{sys.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="AI Feature Status">
        <div className="space-y-2">
          {AI_FEATURES.map((feat) => (
            <div key={feat.name} className="flex items-center justify-between p-3 bg-surface rounded-xl">
              <div>
                <p className="font-body text-sm font-medium text-dark">{feat.name}</p>
                <p className="font-body text-xs text-muted">{feat.metric}</p>
              </div>
              <Badge variant={feat.status === 'active' ? 'green' : feat.status === 'phase3' ? 'amber' : 'purple'}>
                {feat.status === 'active' ? 'Live' : feat.status === 'phase3' ? 'Phase 3' : 'Phase 4'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Business Configuration">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-body text-sm">
          {settings && Object.entries(settings).map(([key, value]) => (
            <div key={key} className="p-2 bg-surface rounded-lg">
              <p className="text-xs text-muted capitalize">{key.replace(/_/g, ' ')}</p>
              <p className="font-medium text-dark truncate">{String(value) || '—'}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
