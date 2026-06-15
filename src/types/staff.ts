export type AbsenceType = 'planned' | 'sick' | 'emergency'
export type ShiftLocation = 'kitchen' | 'counter' | 'closing'

export interface StaffMember {
  id: string
  user_id: string | null
  name: string
  role: string
  hourly_rate: number
  contracted_hours: number | null
  phone: string | null
  emergency_contact: string | null
  bank_details_encrypted: string | null
  food_hygiene_cert_expiry: string | null
  started_at: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface RotaWeek {
  id: string
  week_start_date: string
  published: boolean
  published_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RotaShift {
  id: string
  rota_week_id: string
  staff_id: string
  shift_date: string
  start_time: string
  end_time: string
  role: string | null
  location: ShiftLocation | null
  notes: string | null
  // joined
  staff_members?: Pick<StaffMember, 'id' | 'name' | 'hourly_rate'>
}

export interface StaffAbsence {
  id: string
  staff_id: string
  absence_date: string
  type: AbsenceType
  reason: string | null
  cover_staff_id: string | null
  cover_confirmed: boolean
  notes: string | null
  logged_by: string | null
  created_at: string
  // joined
  staff_members?: Pick<StaffMember, 'id' | 'name'>
}

export interface WagePayment {
  id: string
  staff_id: string
  week_start: string
  hours_worked: number | null
  hourly_rate: number | null
  total_paid: number
  payment_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
}
