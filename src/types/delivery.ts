import type { Platform } from './finance'

export type DisputeStatus = 'open' | 'submitted' | 'won' | 'lost' | 'accepted'
export type ClaimType = 'missing_item' | 'quality' | 'wrong_item' | 'other'

export interface PlatformSetting {
  id: string
  platform: Platform
  commission_rate: number
  current_rating: number
  prep_time_mins: number
  is_active: boolean
  last_updated: string
}

export interface PlatformRatingHistory {
  id: string
  platform: Platform
  rating: number
  recorded_at: string
  notes: string | null
}

export interface DeliveryDispute {
  id: string
  platform: Platform
  order_ref: string
  order_date: string
  claim_type: ClaimType
  claim_value: number | null
  camera_reviewed: boolean
  evidence_summary: string | null
  status: DisputeStatus
  outcome: string | null
  financial_impact: number | null
  submitted_at: string | null
  resolved_at: string | null
  notes: string | null
  created_at: string
}
