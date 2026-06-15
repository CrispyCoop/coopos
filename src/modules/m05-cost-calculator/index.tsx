import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { CostStats } from './CostStats'
import { MenuCostTable } from './MenuCostTable'
import { CostCalculator } from './CostCalculator'
import { MarginGuardianPanel } from './MarginGuardianPanel'
import { PriceOptimiser } from './PriceOptimiser'
const TABS = [
  { key: 'overview', label: 'Cost Overview' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'guardian', label: 'Margin Guardian' },
  { key: 'optimiser', label: 'Price Optimiser' },
]

export default function CostCalculatorPage() {
  const [activeTab, setActiveTab] = useState('overview')
  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Cost Calculator"
        subtitle="Calculate food costs, analyse margins, and optimise your pricing"
        colour="blue"
      />

      <CostStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <Card title="Menu Cost Analysis">
          <MenuCostTable onSelect={() => {}} />
        </Card>
      )}

      {activeTab === 'calculator' && (
        <Card title="Ingredient Cost Calculator">
          <CostCalculator />
        </Card>
      )}

      {activeTab === 'guardian' && (
        <Card title="Margin Guardian">
          <MarginGuardianPanel />
        </Card>
      )}

      {activeTab === 'optimiser' && (
        <Card title="Price Optimiser">
          <PriceOptimiser />
        </Card>
      )}
    </div>
  )
}
