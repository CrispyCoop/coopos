import { useMarginAlerts, useIngredients } from '@/lib/queries'
import { Link } from 'react-router-dom'

interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  link?: string
  linkLabel?: string
}

export function AlertPanel() {
  const { data: marginAlerts } = useMarginAlerts()
  const { data: ingredients } = useIngredients()

  const alerts: AlertItem[] = []

  // Margin alerts
  marginAlerts?.forEach((a) => {
    alerts.push({
      id: `margin-${a.id}`,
      type: 'warning',
      message: `${a.menu_items?.name ?? 'Item'} margin is ${a.current_margin_pct?.toFixed(1)}% (below ${a.threshold_pct}% threshold)`,
      link: '/costs',
      linkLabel: 'View margins',
    })
  })

  // Low stock alerts
  ingredients?.filter((i) => i.current_stock < i.par_level).forEach((i) => {
    alerts.push({
      id: `stock-${i.id}`,
      type: i.current_stock === 0 ? 'error' : 'warning',
      message: `${i.name} is ${i.current_stock === 0 ? 'out of stock' : `low (${i.current_stock} ${i.unit} remaining)`}`,
      link: '/stock',
      linkLabel: 'View stock',
    })
  })

  if (alerts.length === 0) {
    return (
      <div className="bg-green-light border border-green rounded-xl p-4 text-center">
        <p className="font-body text-sm text-green font-medium">All clear — no outstanding alerts</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 8).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg border text-sm ${
            alert.type === 'error'
              ? 'bg-red-light border-red text-red'
              : alert.type === 'warning'
              ? 'bg-yellow-light border-yellow text-yellow-dark'
              : 'bg-blue-light border-blue text-blue'
          }`}
        >
          <p className="font-body flex-1">{alert.message}</p>
          {alert.link && (
            <Link to={alert.link} className="font-body text-xs underline whitespace-nowrap">
              {alert.linkLabel}
            </Link>
          )}
        </div>
      ))}
      {alerts.length > 8 && (
        <p className="font-body text-xs text-muted text-center">
          +{alerts.length - 8} more alerts
        </p>
      )}
    </div>
  )
}
