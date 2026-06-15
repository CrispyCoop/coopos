import { useStaffMembers } from '@/lib/queries'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatGBP } from '@/lib/utils'

type Row = Record<string, unknown>

export function WagesManager() {
  const { data, isLoading } = useStaffMembers()

  const totalWeeklyWages = (data ?? []).reduce((s, m) => {
    return s + m.hourly_rate * (m.contracted_hours ?? 0)
  }, 0)
  const totalMonthlyWages = totalWeeklyWages * 4.33
  const totalAnnualWages = totalWeeklyWages * 52

  if (isLoading) return <div className="animate-pulse h-32 bg-surface rounded-xl" />
  if (!data?.length) return (
    <EmptyState icon="👷" title="No staff members" message="Add staff in the Rota module first." />
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 p-4 bg-surface rounded-xl">
        <div className="text-center">
          <p className="font-body text-xs text-muted">Weekly</p>
          <p className="font-mono font-semibold text-dark">{formatGBP(totalWeeklyWages)}</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="font-body text-xs text-muted">Monthly</p>
          <p className="font-mono font-semibold text-dark">{formatGBP(totalMonthlyWages)}</p>
        </div>
        <div className="text-center">
          <p className="font-body text-xs text-muted">Annual</p>
          <p className="font-mono font-semibold text-dark">{formatGBP(totalAnnualWages)}</p>
        </div>
      </div>

      <Table<Row>
        columns={[
          { key: 'name', header: 'Staff Member', render: (r) => (
            <span className="font-body font-medium text-dark">{r.name as string}</span>
          )},
          { key: 'role', header: 'Role', render: (r) => r.role as string },
          { key: 'hourly_rate', header: 'Hourly Rate', render: (r) => formatGBP(r.hourly_rate as number) },
          { key: 'contracted_hours', header: 'Contracted Hrs', render: (r) =>
            r.contracted_hours != null ? `${r.contracted_hours}h/wk` : '—'
          },
          { key: 'weekly_cost', header: 'Weekly Cost', render: (r) => {
            const weekly = (r.hourly_rate as number) * (r.contracted_hours as number ?? 0)
            return <span className="font-mono">{formatGBP(weekly)}</span>
          }},
          { key: 'annual_cost', header: 'Annual Cost', render: (r) => {
            const weekly = (r.hourly_rate as number) * (r.contracted_hours as number ?? 0)
            return <span className="font-mono text-muted">{formatGBP(weekly * 52)}</span>
          }},
        ]}
        data={(data ?? []) as unknown as Row[]}
      />
    </div>
  )
}
