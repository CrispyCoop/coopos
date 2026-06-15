import { useState } from 'react'
import { useSOPs } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { SOP_CATEGORIES } from './types'
import type { SOP } from './types'

interface Props {
  onSelect: (sop: SOP) => void
}

const CAT_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...SOP_CATEGORIES.map((c) => ({ value: c, label: c })),
]

type Row = Record<string, unknown>

export function SOPList({ onSelect }: Props) {
  const { data: sops, isLoading } = useSOPs()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const filtered = (sops ?? []).filter((s) => {
    const matchCat = !category || s.category === category
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (isLoading) return <div className="animate-pulse h-64 bg-surface rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input placeholder="Search SOPs…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-52">
          <Select
            options={CAT_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No SOPs found" message="Adjust your filters or add a new SOP." />
      ) : (
        <Table<Row>
          columns={[
            { key: 'category', header: 'Category', render: (r) => <Badge variant="grey">{r.category as string}</Badge> },
            { key: 'title', header: 'Title' },
            { key: 'version', header: 'Version', render: (r) => `v${r.version}` },
            {
              key: 'is_active',
              header: 'Status',
              render: (r) => <Badge variant={r.is_active ? 'green' : 'grey'}>{r.is_active ? 'Active' : 'Draft'}</Badge>,
            },
          ]}
          data={filtered as unknown as Row[]}
          onRowClick={(r) => onSelect(r as unknown as SOP)}
        />
      )}
    </div>
  )
}
