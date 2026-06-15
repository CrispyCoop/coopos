import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RotaGrid } from './RotaGrid'
import { StaffList } from './StaffList'
import { StaffForm } from './StaffForm'
import { AbsenceForm } from './AbsenceForm'
import { AbsenceLog } from './AbsenceLog'
import { LabourCostBar } from './LabourCostBar'
import { WagePayments } from './WagePayments'
import { ForecastPanel } from './ForecastPanel'
import { SmartRotaPanel } from './SmartRotaPanel'
import type { StaffMember } from '@/types/staff'

const TABS = [
  { key: 'rota', label: 'Weekly Rota' },
  { key: 'forecast', label: 'AI Forecast' },
  { key: 'staff', label: 'Staff' },
  { key: 'absences', label: 'Absences' },
  { key: 'wages', label: 'Wages' },
]

export default function RotaPage() {
  const [activeTab, setActiveTab] = useState('rota')
  const [staffFormOpen, setStaffFormOpen] = useState(false)
  const [absenceFormOpen, setAbsenceFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [forecastResult, setForecastResult] = useState<object | null>(null)
  const [forecastWeekStart, setForecastWeekStart] = useState('')

  const getAction = () => {
    if (activeTab === 'staff') return (
      <Button onClick={() => { setEditingStaff(null); setStaffFormOpen(true) }}>+ Add Staff</Button>
    )
    if (activeTab === 'absences') return (
      <Button onClick={() => setAbsenceFormOpen(true)}>+ Log Absence</Button>
    )
    return null
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Rota & Staff"
        subtitle="Schedule shifts, manage team members, and track labour costs"
        colour="purple"
        action={getAction()}
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'rota' && (
        <div className="space-y-6">
          <Card title="Weekly Rota">
            <RotaGrid />
          </Card>
          <Card title="Labour Cost Trend">
            <LabourCostBar />
          </Card>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <ForecastPanel
            onForecastGenerated={(result, weekStart) => {
              setForecastResult(result)
              setForecastWeekStart(weekStart)
            }}
          />
          {forecastResult && forecastWeekStart && (
            <SmartRotaPanel weekStart={forecastWeekStart} forecast={forecastResult} />
          )}
        </div>
      )}

      {activeTab === 'staff' && (
        <Card title="Team Members">
          <StaffList onSelect={(s) => { setEditingStaff(s); setStaffFormOpen(true) }} />
        </Card>
      )}

      {activeTab === 'absences' && (
        <Card title="Upcoming Absences">
          <AbsenceLog />
        </Card>
      )}

      {activeTab === 'wages' && (
        <Card title="Wage Payments">
          <WagePayments />
        </Card>
      )}

      <StaffForm
        isOpen={staffFormOpen}
        onClose={() => setStaffFormOpen(false)}
        existing={editingStaff}
      />
      <AbsenceForm isOpen={absenceFormOpen} onClose={() => setAbsenceFormOpen(false)} />
    </div>
  )
}
