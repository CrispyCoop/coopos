export interface SOP {
  id: string
  category: string
  title: string
  content: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SOPAcknowledgement {
  id: string
  sop_id: string
  staff_member_id: string
  acknowledged_at: string
  staff?: { name: string }
  sop?: { title: string; version: number }
}

export const SOP_CATEGORIES = [
  'Opening Procedures',
  'Closing Procedures',
  'Food Preparation',
  'Hygiene & Sanitation',
  'Customer Service',
  'Cash Handling',
  'Equipment Operation',
  'Health & Safety',
  'Delivery Operations',
  'Staff Management',
] as const

export type SOPCategory = typeof SOP_CATEGORIES[number]
