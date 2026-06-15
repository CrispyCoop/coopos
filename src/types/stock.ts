export interface Ingredient {
  id: string
  name: string
  category: string
  unit: string
  cost_per_unit: number
  supplier_id: string | null
  par_level: number
  minimum_stock: number
  reorder_qty: number | null
  current_stock: number
  supplier_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  suppliers?: Supplier
}

export type MovementType = 'delivery' | 'waste' | 'adjustment' | 'sale_depletion' | 'adjustment_up' | 'adjustment_down' | 'stocktake' | 'transfer'

export interface StockMovement {
  id: string
  ingredient_id: string
  movement_type: MovementType
  quantity: number
  unit: string
  reference: string | null
  reason: string | null
  moved_at: string
  staff_id: string | null
  notes: string | null
  created_at: string
  // joined
  ingredients?: Pick<Ingredient, 'id' | 'name' | 'unit'>
}

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  account_number: string | null
  payment_terms_days: number
  delivery_days: string[]
  minimum_order_value: number | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SupplierPriceHistory {
  id: string
  supplier_id: string
  ingredient_id: string | null
  old_price: number | null
  new_price: number | null
  changed_at: string
  notes: string | null
}

export interface Delivery {
  id: string
  supplier_id: string
  delivered_at: string
  delivery_note_ref: string | null
  total_cost: number | null
  received_by: string | null
  notes: string | null
  created_at: string
  // joined
  suppliers?: Pick<Supplier, 'id' | 'name'>
}

export interface DeliveryItem {
  id: string
  delivery_id: string
  ingredient_id: string
  quantity_ordered: number | null
  quantity_received: number
  unit_cost: number
  rejected: boolean
  rejection_reason: string | null
  // joined
  ingredients?: Pick<Ingredient, 'id' | 'name' | 'unit'>
}

export interface Stocktake {
  id: string
  conducted_by: string | null
  conducted_at: string
  notes: string | null
  created_at: string
}

export interface StocktakeItem {
  id: string
  stocktake_id: string
  ingredient_id: string
  expected_qty: number | null
  actual_qty: number
  variance: number | null
  variance_cost: number | null
  // joined
  ingredients?: Pick<Ingredient, 'id' | 'name' | 'unit' | 'cost_per_unit'>
}
