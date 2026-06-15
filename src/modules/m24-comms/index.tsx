import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { Alert } from '@/components/ui/Alert'

type Row = Record<string, unknown>

const TABS = [
  { key: 'sms', label: 'Send SMS' },
  { key: 'email', label: 'Send Email' },
  { key: 'templates', label: 'Templates' },
  { key: 'sms-log', label: 'SMS Log' },
  { key: 'email-log', label: 'Email Log' },
]

const SMS_STATUS_BADGE: Record<string, 'green' | 'blue' | 'red' | 'amber'> = {
  sent: 'blue', delivered: 'green', failed: 'red', undelivered: 'amber',
}

const EMAIL_STATUS_BADGE: Record<string, 'green' | 'blue' | 'red' | 'amber' | 'grey'> = {
  sent: 'blue', delivered: 'green', opened: 'green', clicked: 'green',
  bounced: 'red', unsubscribed: 'amber',
}

const TEMPLATES = [
  { name: 'Promo Blast', type: 'sms', content: 'Hi! 🍗 Crispy Coop Hertford — exclusive deal just for you: [OFFER]. Order now at [LINK]' },
  { name: 'VIP Reward', type: 'sms', content: 'Hey [NAME], you\'re a Crispy Coop VIP! Enjoy [REWARD] on your next order. Code: [CODE]. Valid until [DATE] 🎉' },
  { name: 'Event Boost', type: 'sms', content: 'BIG night in Hertford tonight! 🎉 Treat yourself to Crispy Coop — 20% off via app tonight only. [LINK]' },
  { name: 'Win-Back', type: 'sms', content: 'We miss you, [NAME]! 😢 Come back to Crispy Coop with [DISCOUNT] off your next order. Code: [CODE]' },
  { name: 'Weekly Special', type: 'email', content: 'Subject: This week\'s special at Crispy Coop 🍗\n\nHi [NAME],\n\nThis week we\'re featuring [ITEM] at an amazing price.\n\nDon\'t miss out!' },
  { name: 'Monthly Newsletter', type: 'email', content: 'Subject: Crispy Coop News – [MONTH]\n\nHi [NAME],\n\nHere\'s what\'s new at Crispy Coop this month: [NEWS]' },
  { name: 'Loyalty Points', type: 'email', content: 'Subject: You\'ve earned loyalty points! 🌟\n\nHi [NAME],\n\nYou have [POINTS] points — that\'s [VALUE] in rewards!' },
]

export default function CommsPage() {
  const [activeTab, setActiveTab] = useState('sms')
  const qc = useQueryClient()

  // SMS compose state
  const [smsPhone, setSmsPhone] = useState('')
  const [smsMessage, setSmsMessage] = useState('')
  const [smsError, setSmsError] = useState('')

  // Email compose state
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailError, setEmailError] = useState('')

  // Template search
  const [tplSearch, setTplSearch] = useState('')

  const { data: smsLog } = useQuery({
    queryKey: ['sms-log'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sms_log').select('*').order('sent_at', { ascending: false }).limit(100)
      if (error) throw error
      return data
    },
  })

  const { data: emailLog } = useQuery({
    queryKey: ['email-log'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_log').select('*').order('sent_at', { ascending: false }).limit(100)
      if (error) throw error
      return data
    },
  })

  const sendSMS = useMutation({
    mutationFn: async () => {
      setSmsError('')
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to: smsPhone, message: smsMessage },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sms-log'] })
      setSmsPhone('')
      setSmsMessage('')
    },
    onError: (err: Error) => setSmsError(err.message),
  })

  const sendEmail = useMutation({
    mutationFn: async () => {
      setEmailError('')
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to: emailTo, subject: emailSubject, body: emailBody },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-log'] })
      setEmailTo('')
      setEmailSubject('')
      setEmailBody('')
    },
    onError: (err: Error) => setEmailError(err.message),
  })

  const filteredTemplates = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(tplSearch.toLowerCase()) ||
    t.type.includes(tplSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Communications Engine"
        subtitle="Send SMS and email to customers via Twilio and SendGrid"
        colour="blue"
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'sms' && (
        <Card title="Compose SMS">
          <div className="max-w-lg space-y-4">
            <Alert
              type="info"
              message="Messages are sent via Twilio through a secure Edge Function. API keys are never stored in the browser."
            />
            {smsError && <Alert type="error" message={smsError} />}
            <Input
              label="Recipient Phone"
              placeholder="+447700900123"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
            />
            <div>
              <label className="block font-body text-sm font-medium text-dark mb-1.5">Message</label>
              <textarea
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={4}
                placeholder="Your message..."
                maxLength={160}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
              />
              <p className="font-body text-xs text-muted mt-1">{smsMessage.length}/160 characters</p>
            </div>
            <Button
              onClick={() => sendSMS.mutate()}
              loading={sendSMS.isPending}
              disabled={!smsPhone || !smsMessage}
            >
              Send SMS
            </Button>
            {sendSMS.isSuccess && (
              <p className="font-body text-sm text-green-600">SMS sent successfully.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'email' && (
        <Card title="Compose Email">
          <div className="max-w-lg space-y-4">
            <Alert
              type="info"
              message="Emails are sent via SendGrid through a secure Edge Function. API keys are never stored in the browser."
            />
            {emailError && <Alert type="error" message={emailError} />}
            <Input
              label="To"
              placeholder="customer@example.com"
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
            />
            <Input
              label="Subject"
              placeholder="Email subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            <div>
              <label className="block font-body text-sm font-medium text-dark mb-1.5">Message Body</label>
              <textarea
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-body text-sm text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={8}
                placeholder="Email body..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <Button
              onClick={() => sendEmail.mutate()}
              loading={sendEmail.isPending}
              disabled={!emailTo || !emailSubject || !emailBody}
            >
              Send Email
            </Button>
            {sendEmail.isSuccess && (
              <p className="font-body text-sm text-green-600">Email sent successfully.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <Input
            label=""
            placeholder="Search templates..."
            value={tplSearch}
            onChange={(e) => setTplSearch(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <Card key={tpl.name} title="">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm font-semibold text-dark">{tpl.name}</span>
                    <Badge variant={tpl.type === 'sms' ? 'blue' : 'purple'}>{tpl.type.toUpperCase()}</Badge>
                  </div>
                  <p className="font-body text-xs text-muted whitespace-pre-wrap">{tpl.content}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (tpl.type === 'sms') {
                        setSmsMessage(tpl.content)
                        setActiveTab('sms')
                      } else {
                        const lines = tpl.content.split('\n')
                        const subjectLine = lines[0].replace('Subject: ', '')
                        const body = lines.slice(2).join('\n')
                        setEmailSubject(subjectLine)
                        setEmailBody(body)
                        setActiveTab('email')
                      }
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sms-log' && (
        <Card title="SMS Log">
          {!(smsLog ?? []).length ? (
            <EmptyState icon="📱" title="No SMS sent yet" message="Sent messages will appear here." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'sent_at', header: 'Sent At', render: (r) => (r.sent_at as string).slice(0, 16).replace('T', ' ') },
                { key: 'recipient_phone', header: 'Phone', render: (r) => r.recipient_phone as string },
                { key: 'message', header: 'Message', render: (r) => (
                  <span className="line-clamp-2 text-sm">{r.message as string}</span>
                )},
                { key: 'template_name', header: 'Template', render: (r) => (r.template_name as string) || '—' },
                { key: 'status', header: 'Status', render: (r) => (
                  <Badge variant={SMS_STATUS_BADGE[r.status as string] ?? 'grey'}>{r.status as string}</Badge>
                )},
              ]}
              data={(smsLog ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}

      {activeTab === 'email-log' && (
        <Card title="Email Log">
          {!(emailLog ?? []).length ? (
            <EmptyState icon="📧" title="No emails sent yet" message="Sent emails will appear here." />
          ) : (
            <Table<Row>
              columns={[
                { key: 'sent_at', header: 'Sent At', render: (r) => (r.sent_at as string).slice(0, 16).replace('T', ' ') },
                { key: 'recipient_email', header: 'Email', render: (r) => r.recipient_email as string },
                { key: 'subject', header: 'Subject', render: (r) => r.subject as string },
                { key: 'template_name', header: 'Template', render: (r) => (r.template_name as string) || '—' },
                { key: 'status', header: 'Status', render: (r) => (
                  <Badge variant={EMAIL_STATUS_BADGE[r.status as string] ?? 'grey'}>{r.status as string}</Badge>
                )},
              ]}
              data={(emailLog ?? []) as unknown as Row[]}
            />
          )}
        </Card>
      )}
    </div>
  )
}
