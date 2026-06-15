export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type DiscountType = 'percentage' | 'fixed' | 'free_item' | 'free_delivery'
export type ContentPlatform = 'tiktok' | 'instagram' | 'facebook' | 'google_my_business' | 'sms' | 'email' | 'flyer'
export type ContentType = 'video' | 'image' | 'story' | 'post' | 'reel'
export type ContentStatus = 'planned' | 'produced' | 'published' | 'cancelled'

export interface Campaign {
  id: string
  name: string
  objective: string | null
  status: CampaignStatus
  start_date: string | null
  end_date: string | null
  channels_json: string[]
  budget: number | null
  target_outcome: string | null
  actual_outcome: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PromoCode {
  id: string
  code: string
  campaign_id: string | null
  discount_type: DiscountType
  discount_value: number
  min_order_value: number | null
  valid_from: string | null
  valid_to: string | null
  max_redemptions: number | null
  current_redemptions: number
  platforms_json: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface PromoRedemption {
  id: string
  promo_code_id: string
  customer_id: string | null
  order_ref: string | null
  discount_applied: number | null
  redeemed_at: string
}

export interface ContentCalendarEntry {
  id: string
  date: string
  platform: ContentPlatform
  content_type: ContentType | null
  title: string
  description: string | null
  status: ContentStatus
  published_at: string | null
  notes: string | null
  created_at: string
}

export interface FlyerDistribution {
  id: string
  date: string
  area: string
  quantity: number
  design_ref: string | null
  promo_code_id: string | null
  notes: string | null
  created_at: string
}

export interface CompetitorLog {
  id: string
  competitor_name: string
  log_type: 'price_change' | 'new_item' | 'promotion' | 'opening' | 'closure' | 'quality_note'
  description: string | null
  observed_at: string
  notes: string | null
  created_at: string
}

export interface RankingEntry {
  id: string
  platform: 'google' | 'deliveroo' | 'ubereats'
  search_term: string
  position: number | null
  recorded_at: string
}
