export type CustomerSegment = 'new' | 'regular' | 'lapsed' | 'high_value' | 'at_risk' | 'vip'

export interface Customer {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  loyalty_points: number
  lifetime_value: number
  total_orders: number
  avg_order_value: number
  last_order_at: string | null
  segment: CustomerSegment
  sms_opt_in: boolean
  email_opt_in: boolean
  created_at: string
  updated_at: string
}

export interface CustomerOrder {
  id: string
  customer_id: string
  channel: string
  order_ref: string | null
  items_json: { name: string; quantity: number; price: number }[]
  total: number
  discount: number
  created_at: string
}

export interface CustomerComplaint {
  id: string
  customer_id: string | null
  order_ref: string | null
  complaint_type: string
  description: string | null
  resolution: string | null
  resolved_at: string | null
  created_at: string
}

export interface NPSScore {
  id: string
  customer_id: string | null
  score: number
  comment: string | null
  recorded_at: string
}
