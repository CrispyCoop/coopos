export type TransactionType = 'income' | 'expense'
export type TransactionCategory =
  | 'food_cost'
  | 'labour'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'equipment'
  | 'other'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string | null
  reference: string | null
  date: string
  receipt_url: string | null
  created_at: string
}

export interface TillCount {
  id: string
  date: string
  session_id: string | null
  opening_float: number
  denominations_json: Record<string, number>
  total_cash: number | null
  epos_cash_total: number | null
  variance: number | null
  banked: number | null
  notes: string | null
  counted_by: string | null
  created_at: string
}

export type Platform = 'deliveroo' | 'ubereats' | 'justeat' | 'foodhub' | 'gogetter'

export interface PlatformPayout {
  id: string
  platform: Platform
  period_start: string
  period_end: string
  gross_revenue: number | null
  commission_rate: number | null
  commission_amount: number | null
  net_payout: number | null
  expected_payout: number | null
  variance: number | null
  received_at: string | null
  notes: string | null
  created_at: string
}

export type OverheadFrequency = 'daily' | 'weekly' | 'monthly' | 'annual'

export interface OverheadItem {
  id: string
  name: string
  category: string
  amount: number
  frequency: OverheadFrequency
  next_due_date: string | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
