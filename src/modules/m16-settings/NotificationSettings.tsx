import { Card } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { useState } from 'react'

const NOTIFICATION_ITEMS = [
  { id: 'stock_low', label: 'Stock below par level', default: true },
  { id: 'margin_alert', label: 'Menu item below margin threshold', default: true },
  { id: 'pl_variance', label: 'P&L tracking 10%+ below target at 6 PM', default: true },
  { id: 'waste_over', label: 'Waste % exceeds target', default: true },
  { id: 'dispute_deadline', label: 'Dispute response window < 24 hours', default: true },
  { id: 'daily_briefing', label: 'Daily briefing SMS (10:45 AM)', default: true },
  { id: 'night_summary', label: 'Night summary SMS (10:30 PM)', default: true },
  { id: 'shift_reminder', label: 'Staff shift reminder (6 PM evening before)', default: false },
  { id: 'food_hygiene_expiry', label: 'Food hygiene cert expiring < 60 days', default: true },
  { id: 'equipment_service', label: 'Equipment service overdue', default: false },
]

export function NotificationSettings() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_ITEMS.map((i) => [i.id, i.default]))
  )

  return (
    <Card title="Notification Preferences">
      <p className="font-body text-sm text-muted mb-4">
        Configure which alerts fire and how they are delivered. SMS and email sending activates in Phase 4.
      </p>
      <div className="space-y-4 max-w-lg">
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <span className="font-body text-sm text-dark">{item.label}</span>
            <Toggle
              checked={prefs[item.id]}
              onChange={(v) => setPrefs((p) => ({ ...p, [item.id]: v }))}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
