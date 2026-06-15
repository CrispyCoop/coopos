import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { KPIDashboard } from './KPIDashboard'
import { AutoReports } from './AutoReports'
import { ReportBuilder } from './ReportBuilder'

const TABS = [
  { key: 'kpi', label: 'KPI Dashboard' },
  { key: 'reports', label: 'Monthly Reports' },
  { key: 'builder', label: 'Report Builder' },
]

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState('kpi')

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reporting & Analytics"
        subtitle="KPIs, automated reports, and custom data exports"
        colour="purple"
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'kpi' && <KPIDashboard />}

      {activeTab === 'reports' && (
        <Card title="Monthly Reports">
          <AutoReports />
        </Card>
      )}

      {activeTab === 'builder' && (
        <Card title="Custom Report Builder">
          <ReportBuilder />
        </Card>
      )}
    </div>
  )
}
