import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { todayISO } from '@/lib/utils'

type Row = Record<string, unknown>

const TABS = [
  { key: 'competitors', label: 'Competitors' },
  { key: 'events', label: 'Local Events' },
  { key: 'rankings', label: 'Rankings' },
]

const DEMAND_OPTIONS = [
  { value: 'high', label: 'High Impact' },
  { value: 'medium', label: 'Medium Impact' },
  { value: 'low', label: 'Low Impact' },
]

const LOG_TYPE_OPTIONS = [
  { value: 'price_change', label: 'Price Change' },
  { value: 'new_product', label: 'New Product' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'closure', label: 'Closure' },
  { value: 'opening', label: 'New Opening' },
  { value: 'other', label: 'Other' },
]

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('competitors')
  const [compFormOpen, setCompFormOpen] = useState(false)
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [rankingFormOpen, setRankingFormOpen] = useState(false)
  const qc = useQueryClient()

  // ── Competitors ──────────────────────────────────────────────
  const [compName, setCompName] = useState('')
  const [logType, setLogType] = useState('other')
  const [compDesc, setCompDesc] = useState('')
  const [compDate, setCompDate] = useState(todayISO())

  const { data: competitors } = useQuery({
    queryKey: ['competitor-logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitor_logs').select('*').order('date', { ascending: false }).limit(50)
      if (error) throw error
      return data
    },
  })

  const addComp = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('competitor_logs').insert({ name: compName, log_type: logType, description: compDesc, date: compDate })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['competitor-logs'] }); setCompFormOpen(false); setCompName(''); setCompDesc('') },
  })

  // ── Events ──────────────────────────────────────────────────
  const [evName, setEvName] = useState('')
  const [evDate, setEvDate] = useState(todayISO())
  const [evImpact, setEvImpact] = useState('medium')

  const { data: events } = useQuery({
    queryKey: ['local-events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('local_events').select('*').order('event_date', { ascending: true }).limit(50)
      if (error) throw error
      return data
    },
  })

  const addEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('local_events').insert({ name: evName, event_date: evDate, demand_impact: evImpact })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['local-events'] }); setEventFormOpen(false); setEvName('') },
  })

  // ── Rankings ────────────────────────────────────────────────
  const [rankPlatform, setRankPlatform] = useState('google')
  const [rankTerm, setRankTerm] = useState('')
  const [rankPos, setRankPos] = useState('')

  const { data: rankings } = useQuery({
    queryKey: ['ranking-history'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ranking_history').select('*').order('recorded_at', { ascending: false }).limit(50)
      if (error) throw error
      return data
    },
  })

  const addRanking = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('ranking_history').insert({ platform: rankPlatform, search_term: rankTerm, position: Number(rankPos), recorded_at: new Date().toISOString() })
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ranking-history'] }); setRankingFormOpen(false); setRankTerm(''); setRankPos('') },
  })

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Market Intelligence"
        subtitle="Track competitors, local events, and search rankings"
        colour="red"
        action={
          activeTab === 'competitors' ? <Button onClick={() => setCompFormOpen(true)}>+ Log Observation</Button> :
          activeTab === 'events' ? <Button onClick={() => setEventFormOpen(true)}>+ Add Event</Button> :
          <Button onClick={() => setRankingFormOpen(true)}>+ Log Ranking</Button>
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'competitors' && (
        <Card title="Competitor Observations">
          {!competitors?.length ? (
            <EmptyState icon="🔍" title="No observations yet" message="Log what you see competitors doing." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'date', header: 'Date', render: (r) => r.date as string },
                { key: 'name', header: 'Competitor', render: (r) => <span className="font-medium">{r.name as string}</span> },
                { key: 'log_type', header: 'Type', render: (r) => <Badge variant="grey">{(r.log_type as string).replace('_', ' ')}</Badge> },
                { key: 'description', header: 'Observation', render: (r) => r.description as string },
              ]}
              data={(competitors ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'events' && (
        <Card title="Local Events Calendar">
          {!events?.length ? (
            <EmptyState icon="📅" title="No events logged" message="Track Hertford events that affect demand." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'event_date', header: 'Date', render: (r) => r.event_date as string },
                { key: 'name', header: 'Event', render: (r) => <span className="font-medium">{r.name as string}</span> },
                { key: 'demand_impact', header: 'Demand Impact', render: (r) => (
                  <Badge variant={r.demand_impact === 'high' ? 'green' : r.demand_impact === 'medium' ? 'amber' : 'grey'}>
                    {r.demand_impact as string}
                  </Badge>
                )},
              ]}
              data={(events ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'rankings' && (
        <Card title="Search & Platform Rankings">
          {!rankings?.length ? (
            <EmptyState icon="📊" title="No rankings logged" message="Track your weekly search positions." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'recorded_at', header: 'Date', render: (r) => (r.recorded_at as string).slice(0, 10) },
                { key: 'platform', header: 'Platform', render: (r) => <Badge variant="blue">{r.platform as string}</Badge> },
                { key: 'search_term', header: 'Search Term', render: (r) => r.search_term as string },
                { key: 'position', header: 'Position', render: (r) => (
                  <span className={`font-mono font-semibold ${(r.position as number) <= 3 ? 'text-green-600' : (r.position as number) <= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                    #{r.position as number}
                  </span>
                )},
              ]}
              data={(rankings ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {/* Competitor Form */}
      <Modal isOpen={compFormOpen} onClose={() => setCompFormOpen(false)} title="Log Competitor Observation" size="sm">
        <div className="space-y-4">
          <Input label="Competitor Name" value={compName} onChange={(e) => setCompName(e.target.value)} />
          <Select label="Observation Type" options={LOG_TYPE_OPTIONS} value={logType} onChange={(e) => setLogType(e.target.value)} />
          <Input label="Date" type="date" value={compDate} onChange={(e) => setCompDate(e.target.value)} />
          <Input label="Description" value={compDesc} onChange={(e) => setCompDesc(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setCompFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addComp.mutate()} loading={addComp.isPending} disabled={!compName}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Event Form */}
      <Modal isOpen={eventFormOpen} onClose={() => setEventFormOpen(false)} title="Add Local Event" size="sm">
        <div className="space-y-4">
          <Input label="Event Name" value={evName} onChange={(e) => setEvName(e.target.value)} />
          <Input label="Event Date" type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} />
          <Select label="Demand Impact" options={DEMAND_OPTIONS} value={evImpact} onChange={(e) => setEvImpact(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setEventFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addEvent.mutate()} loading={addEvent.isPending} disabled={!evName}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Ranking Form */}
      <Modal isOpen={rankingFormOpen} onClose={() => setRankingFormOpen(false)} title="Log Ranking" size="sm">
        <div className="space-y-4">
          <Select
            label="Platform"
            options={[{ value: 'google', label: 'Google' }, { value: 'deliveroo', label: 'Deliveroo' }, { value: 'ubereats', label: 'Uber Eats' }]}
            value={rankPlatform}
            onChange={(e) => setRankPlatform(e.target.value)}
          />
          <Input label="Search Term" placeholder="e.g. fried chicken Hertford" value={rankTerm} onChange={(e) => setRankTerm(e.target.value)} />
          <Input label="Position" type="number" min="1" value={rankPos} onChange={(e) => setRankPos(e.target.value)} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setRankingFormOpen(false)}>Cancel</Button>
            <Button onClick={() => addRanking.mutate()} loading={addRanking.isPending} disabled={!rankTerm || !rankPos}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
