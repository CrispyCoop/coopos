import { useState } from 'react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FinanceStats } from './FinanceStats'
import { TransactionForm } from './TransactionForm'
import { TransactionLog } from './TransactionLog'
import { DailyPL } from './DailyPL'
import { VATTracker } from './VATTracker'
import { PLVarianceAlert } from './PLVarianceAlert'
import { TransactionsByCategory } from './TransactionsByCategory'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'pl', label: 'P&L' },
  { key: 'vat', label: 'VAT' },
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Finance & P&L"
        subtitle="Track income, expenses, daily profit & loss, and VAT"
        colour="green"
        action={<Button onClick={() => setFormOpen(true)}>+ Log Transaction</Button>}
      />

      <PLVarianceAlert />
      <FinanceStats />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyPL />
          </div>
          <Card title="Expenses by Category">
            <TransactionsByCategory />
          </Card>
        </div>
      )}

      {activeTab === 'transactions' && (
        <Card title="All Transactions">
          <TransactionLog />
        </Card>
      )}

      {activeTab === 'pl' && <DailyPL />}

      {activeTab === 'vat' && <VATTracker />}

      <TransactionForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
