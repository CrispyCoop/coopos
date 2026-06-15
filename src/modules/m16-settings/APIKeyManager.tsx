import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'

const API_INTEGRATIONS = [
  { name: 'Twilio', purpose: 'SMS sending', envKey: 'TWILIO_ACCOUNT_SID', location: 'Edge Function only' },
  { name: 'SendGrid', purpose: 'Email sending', envKey: 'SENDGRID_API_KEY', location: 'Edge Function only' },
  { name: 'Anthropic Claude', purpose: 'AI briefings & dispute text', envKey: 'ANTHROPIC_API_KEY', location: 'Edge Function only' },
  { name: 'OpenWeatherMap', purpose: 'Daily weather + demand forecast', envKey: 'VITE_WEATHER_API_KEY', location: 'Client (public)' },
  { name: 'Google Maps', purpose: 'GPS notifications', envKey: 'VITE_GOOGLE_MAPS_API_KEY', location: 'Client (public)' },
]

export function APIKeyManager() {
  return (
    <div className="space-y-4">
      <Alert
        type="warning"
        message="API keys for Twilio, SendGrid, and Anthropic are stored as Supabase Edge Function secrets — never in client-side code. Update them via the Supabase dashboard → Edge Functions → Secrets."
      />
      <Card title="API Integrations">
        <div className="space-y-4">
          {API_INTEGRATIONS.map((api) => (
            <div key={api.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-body text-sm font-medium text-dark">{api.name}</p>
                <p className="font-body text-xs text-muted">{api.purpose}</p>
                <p className="font-mono text-xs text-muted mt-0.5">{api.envKey}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={api.location.includes('Edge') ? 'green' : 'blue'}>
                  {api.location}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="font-body text-xs text-muted">
            To update secrets: Supabase Dashboard → Edge Functions → Manage secrets → Add/update key.
          </p>
        </div>
      </Card>
    </div>
  )
}
