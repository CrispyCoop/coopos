export interface EquipmentItem {
  id: string
  name: string
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  purchase_cost: number | null
  warranty_expiry: string | null
  service_interval_days: number | null
  last_serviced_at: string | null
  location: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface EquipmentService {
  id: string
  equipment_id: string
  service_date: string
  engineer_name: string | null
  work_done: string | null
  cost: number | null
  next_due_date: string | null
  notes: string | null
  created_at: string
  // joined
  equipment_items?: Pick<EquipmentItem, 'id' | 'name'>
}

export interface EquipmentRepair {
  id: string
  equipment_id: string
  fault_description: string
  reported_at: string
  engineer_name: string | null
  parts_replaced: string | null
  cost: number | null
  resolved_at: string | null
  notes: string | null
  created_at: string
  // joined
  equipment_items?: Pick<EquipmentItem, 'id' | 'name' | 'purchase_cost'>
}

export interface MaintenanceContractor {
  id: string
  name: string
  speciality: string | null
  phone: string | null
  email: string | null
  avg_response_hours: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
