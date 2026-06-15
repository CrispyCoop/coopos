import type { Channel } from '@/types/sales'
import type { Platform } from '@/types/finance'

export const CHANNELS: Channel[] = [
  'instore_cash',
  'instore_card',
  'app',
  'deliveroo',
  'ubereats',
  'justeat',
  'foodhub',
  'gogetter',
]

export const CHANNEL_LABELS: Record<Channel, string> = {
  instore_cash: 'In-Store Cash',
  instore_card: 'In-Store Card',
  app: 'App',
  deliveroo: 'Deliveroo',
  ubereats: 'UberEats',
  justeat: 'JustEat',
  foodhub: 'FoodHub',
  gogetter: 'Gogetter',
}

export const PLATFORMS: Platform[] = ['deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']

export const PLATFORM_LABELS: Record<Platform, string> = {
  deliveroo: 'Deliveroo',
  ubereats: 'UberEats',
  justeat: 'JustEat',
  foodhub: 'FoodHub',
  gogetter: 'Gogetter',
}

export const WASTE_REASONS = [
  { value: 'date_expired', label: 'Date Expired' },
  { value: 'over_prep', label: 'Over Prep' },
  { value: 'contaminated', label: 'Contaminated' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'quality_failure', label: 'Quality Failure' },
  { value: 'other', label: 'Other' },
] as const

export const ROLES = ['owner', 'manager', 'staff'] as const

export const ROLE_LABELS = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
}

export const MODULE_COLOURS = {
  operations: 'green',
  financial: 'red',
  'food-safety': 'yellow',
  marketing: 'purple',
  system: 'blue',
} as const

export const DAILY_REVENUE_TARGET = Number(import.meta.env.VITE_DAILY_REVENUE_TARGET) || 419
export const FOOD_COST_TARGET_PCT = Number(import.meta.env.VITE_FOOD_COST_TARGET_PCT) || 38
export const WASTE_TARGET_PCT = Number(import.meta.env.VITE_WASTE_TARGET_PCT) || 2
export const MARGIN_ALERT_THRESHOLD = Number(import.meta.env.VITE_MARGIN_ALERT_THRESHOLD) || 35

export const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME || 'Crispy Coop'
export const BUSINESS_LOCATION = import.meta.env.VITE_BUSINESS_LOCATION || 'Hertford, UK'

export const SESSION_TIMEOUT_OWNER_MANAGER = 8 * 60 * 60 * 1000 // 8 hours
export const SESSION_TIMEOUT_STAFF = 4 * 60 * 60 * 1000 // 4 hours

export const HEALTH_SCORE_WEIGHTS = {
  revenue: 0.25,
  margin: 0.1875,
  waste: 0.1875,
  platforms: 0.1875,
  stock: 0.125,
  staff: 0.0625,
} as const
