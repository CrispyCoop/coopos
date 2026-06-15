import { useState } from 'react'
import { useTransactions } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'
import type { TransactionCategory } from '@/types/finance'

type Row = Record<string, unknown>

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food_cost: 'Food Cost',
  labour: 'Labour',
  rent: 'Rent',
  utilities: 'Utilities',
  marketing: 'Marketing',
  equipment: 'Equipment',
  other: 'Other',
}

export function TransactionLog() {
  const { data, isLoading } = useTransactions()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filtered = (data ?? []).filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (search && !r.description?.toLowerCase().includes(search.toLowerCase()) &&
      !r.reference?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          label=""
          placeholder="Search description / ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 items-end">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-body capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted hover:bg-border'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-48 bg-surface rounded-xl" />
      ) : !filtered.length ? (
        <EmptyState icon="📒" title="No transactions" message="Log your first transaction using the button above." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'date', header: 'Date', render: (r) => r.date as string },
            { key: 'type', header: 'Type', render: (r) => (
              <Badge variant={r.type === 'income' ? 'green' : 'red'}>{r.type as string}</Badge>
            )},
            { key: 'category', header: 'Category', render: (r) => (
              <Badge variant="grey">{CATEGORY_LABELS[r.category as TransactionCategory] ?? String(r.category)}</Badge>
            )},
            { key: 'description', header: 'Description', render: (r) => (r.description as string) || '—' },
            { key: 'reference', header: 'Ref', render: (r) => (r.reference as string) || '—' },
            { key: 'amount', header: 'Amount', render: (r) => (
              <span className={`font-mono font-medium ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.type === 'income' ? '+' : '-'}{formatGBP(r.amount as number)}
              </span>
            )},
          ]}
          data={filtered as unknown as Row[]}
        />
      )}
    </div>
  )
}
