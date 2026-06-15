import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { BusinessSettings } from './BusinessSettings'
import { TargetSettings } from './TargetSettings'
import { UserManagement } from './UserManagement'
import { NotificationSettings } from './NotificationSettings'
import { APIKeyManager } from './APIKeyManager'
import { DataExport } from './DataExport'
import { BrandingSettings } from './BrandingSettings'
import { IntegrationsSettings } from './IntegrationsSettings'

const TABS = [
  { key: 'business', label: 'Business' },
  { key: 'targets', label: 'Targets' },
  { key: 'users', label: 'Users' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'api', label: 'API Keys' },
  { key: 'data', label: 'Data Export' },
  { key: 'branding', label: 'Branding' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business')

  return (
    <div>
      <ModuleHeader title="Settings" subtitle="System configuration and administration" colour="blue" />
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'business' && <BusinessSettings />}
      {activeTab === 'targets' && <TargetSettings />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'integrations' && <IntegrationsSettings />}
      {activeTab === 'api' && <APIKeyManager />}
      {activeTab === 'data' && <DataExport />}
      {activeTab === 'branding' && <BrandingSettings />}
    </div>
  )
}
