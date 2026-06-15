import { useDailyWeather } from '@/lib/queries'
import { todayISO } from '@/lib/utils'

export function WeatherWidget() {
  const { data: weather, isLoading } = useDailyWeather(todayISO())

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-border p-4 animate-pulse">
        <div className="h-4 bg-surface rounded w-24 mb-2" />
        <div className="h-8 bg-surface rounded w-16" />
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-xl border border-border p-4">
        <p className="font-body text-xs text-muted">Hertford, UK</p>
        <p className="font-mono text-sm text-muted mt-1">Weather data not yet loaded</p>
        <p className="font-body text-xs text-muted mt-1">Runs at 6:00 AM daily via Edge Function</p>
      </div>
    )
  }

  const conditionIcon: Record<string, string> = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
  }

  const icon = conditionIcon[weather.condition ?? ''] ?? '🌡️'

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <p className="font-body text-xs text-muted">Hertford, UK</p>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-3xl" role="img" aria-label={weather.condition ?? ''}>{icon}</span>
        <div>
          <p className="font-display text-3xl text-dark leading-none">{weather.temperature_c}°C</p>
          <p className="font-body text-xs text-muted capitalize">{weather.condition}</p>
        </div>
      </div>
      {weather.demand_prediction_note && (
        <p className="font-body text-xs text-yellow-dark bg-yellow-light rounded-lg px-3 py-2 mt-3">
          {weather.demand_prediction_note}
        </p>
      )}
    </div>
  )
}
