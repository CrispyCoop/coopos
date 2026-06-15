export type Role = 'owner' | 'manager' | 'staff'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: Role
  pin_hash?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface BusinessSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export interface DailyBriefing {
  id: string
  date: string
  content: string | null
  weather_summary: string | null
  prep_recommendation: string | null
  low_stock_items_json: string[]
  absent_staff_json: string[]
  generated_at: string
  created_at: string
}

export interface NightSummary {
  id: string
  date: string
  revenue: number | null
  target: number | null
  net_profit: number | null
  food_cost_pct: number | null
  waste_cost: number | null
  best_selling_item: string | null
  outstanding_actions_json: string[]
  weather_tomorrow: string | null
  generated_at: string
  created_at: string
}

export interface MarginAlert {
  id: string
  menu_item_id: string | null
  current_margin_pct: number | null
  threshold_pct: number | null
  recommended_price: number | null
  ai_recommendation: string | null
  resolved: boolean
  resolved_at: string | null
  created_at: string
}

export interface DailyWeather {
  id: string
  date: string
  temperature_c: number | null
  condition: string | null
  precipitation_probability: number | null
  demand_prediction_note: string | null
  raw_response_json: Record<string, unknown> | null
  created_at: string
}

export interface HealthScoreResult {
  score: number
  color: 'green' | 'amber' | 'red'
  food_safety_connected: false
  components: {
    revenue: number
    margin: number
    waste: number
    platforms: number
    stock: number
    staff: number
  }
}

export * from './stock'
export * from './sales'
export * from './finance'
export * from './staff'
export * from './menu'
export * from './delivery'
export * from './customers'
export * from './campaigns'
export * from './equipment'
