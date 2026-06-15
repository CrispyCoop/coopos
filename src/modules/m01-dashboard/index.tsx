import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Card } from '@/components/ui/Card'
import { WeatherWidget } from '@/components/shared/WeatherWidget'
import { AlertPanel } from '@/components/shared/AlertPanel'
import { LiveRevenueTicker } from './LiveRevenueTicker'
import { ProfitIndicator } from './ProfitIndicator'
import { HealthScoreCard } from './HealthScoreCard'
import { TargetGauge } from './TargetGauge'
import { WeeklySparkline } from './WeeklySparkline'
import { QuickActions } from './QuickActions'
import { DailyBriefingCard } from './DailyBriefingCard'
import { NightSummaryCard } from './NightSummaryCard'
import { AIInsightCard } from './AIInsightCard'
import { useDailyRevenue, useBusinessSettings } from '@/lib/queries'
import { todayISO } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

export default function DashboardPage() {
  const activeDate = useAppStore((s) => s.activeDate)
  const date = activeDate ? activeDate.toISOString().split('T')[0] : todayISO()

  const { data: revenueRows } = useDailyRevenue(date)
  const { data: settings } = useBusinessSettings()

  const gross = (revenueRows ?? []).reduce((s, r) => s + Number(r.total_revenue), 0)
  const target = Number(settings?.daily_revenue_target ?? 419)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Dashboard"
        subtitle="Command centre — live performance at a glance"
        colour="red"
      />

      {/* Revenue hero */}
      <Card>
        <div className="space-y-4">
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-wide mb-2">Today's Revenue</p>
            <LiveRevenueTicker date={date} />
          </div>
          <ProfitIndicator revenue={gross} costOfGoods={gross * 0.38} />
          <TargetGauge actual={gross} target={target} />
        </div>
      </Card>

      {/* 3-col row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Weekly Revenue">
            <WeeklySparkline />
          </Card>
          <HealthScoreCard />
        </div>
        <div className="space-y-6">
          <Card title="Quick Actions">
            <QuickActions />
          </Card>
          <WeatherWidget />
          <AlertPanel />
        </div>
      </div>

      {/* AI & summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DailyBriefingCard date={date} />
        <NightSummaryCard date={date} />
        <AIInsightCard />
      </div>
    </div>
  )
}
