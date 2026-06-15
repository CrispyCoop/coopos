export type Channel =
  | 'instore_cash'
  | 'instore_card'
  | 'app'
  | 'deliveroo'
  | 'ubereats'
  | 'justeat'
  | 'foodhub'
  | 'gogetter'

export interface SalesSession {
  id: string
  date: string
  opened_at: string
  closed_at: string | null
  notes: string | null
}

export interface SaleItem {
  menu_item_id: string
  name: string
  quantity: number
  unit_price: number
}

export interface SalesRecord {
  id: string
  session_id: string | null
  channel: Channel
  order_ref: string | null
  items_json: SaleItem[]
  subtotal: number
  discount: number
  total: number
  staff_id: string | null
  created_at: string
}

export interface DailyRevenueSummary {
  id: string
  date: string
  channel: Channel
  total_orders: number
  total_revenue: number
  avg_order_value: number
  created_at: string
}
