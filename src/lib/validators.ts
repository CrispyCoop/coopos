import { z } from 'zod'

// AUTH
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const pinSchema = z.object({
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d{4}$/, 'PIN must be numeric'),
})

// SETTINGS
export const businessSettingsSchema = z.object({
  business_name: z.string().min(1, 'Required'),
  business_location: z.string().min(1, 'Required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  opening_time: z.string(),
  closing_time: z.string(),
})

export const targetSettingsSchema = z.object({
  daily_revenue_target: z.coerce.number().positive('Must be positive'),
  food_cost_target_pct: z.coerce.number().min(0).max(100),
  waste_target_pct: z.coerce.number().min(0).max(100),
  margin_alert_threshold: z.coerce.number().min(0).max(100),
})

// USERS
export const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['owner', 'manager', 'staff']),
  pin: z.string().length(4).regex(/^\d{4}$/).optional().or(z.literal('')),
  phone: z.string().optional(),
})

// STOCK
export const ingredientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  cost_per_unit: z.coerce.number().min(0),
  current_stock: z.coerce.number().min(0),
  par_level: z.coerce.number().min(0),
  minimum_stock: z.coerce.number().min(0),
  supplier_id: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export const deliveryFormSchema = z.object({
  supplier_id: z.string().uuid('Select a supplier'),
  delivered_at: z.string().min(1, 'Date is required'),
  invoice_ref: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    ingredient_id: z.string(),
    quantity: z.coerce.number().positive('Must be positive'),
    unit: z.string().min(1),
    cost_per_unit: z.coerce.number().min(0),
  })).min(1, 'Add at least one item'),
})

export const stockAdjustmentSchema = z.object({
  ingredient_id: z.string().uuid('Select an ingredient'),
  movement_type: z.string().min(1, 'Select a movement type'),
  quantity: z.coerce.number(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

// WASTE
export const wasteEntrySchema = z.object({
  ingredient_id: z.string().uuid().optional(),
  menu_item_id: z.string().uuid().optional(),
  quantity: z.coerce.number().positive('Must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  reason: z.enum(['date_expired', 'over_prep', 'contaminated', 'dropped', 'quality_failure', 'other']),
  shift: z.enum(['morning', 'afternoon', 'evening']).optional(),
  estimated_cost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.ingredient_id || data.menu_item_id,
  { message: 'Select an ingredient or menu item' }
)

// SALES
export const saleEntrySchema = z.object({
  channel: z.enum(['instore_cash', 'instore_card', 'app', 'deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']),
  order_ref: z.string().optional(),
  total: z.coerce.number().positive('Total must be positive'),
  discount: z.coerce.number().min(0).default(0),
  items_json: z.array(z.object({
    menu_item_id: z.string().uuid(),
    name: z.string(),
    quantity: z.coerce.number().positive(),
    unit_price: z.coerce.number().min(0),
  })).min(1, 'Add at least one item'),
})

// SUPPLIERS
export const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  account_number: z.string().optional(),
  payment_terms_days: z.coerce.number().min(0).default(30),
  minimum_order_value: z.coerce.number().min(0).optional(),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

// MENU
export const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().uuid('Select a category'),
  instore_price: z.coerce.number().positive('Price must be positive'),
  delivery_price_uplift_pct: z.coerce.number().min(0).max(200).default(30),
  status: z.enum(['active', 'unavailable', 'removed']).default('active'),
})

// ROTA
export const shiftFormSchema = z.object({
  staff_id: z.string().uuid('Select a staff member'),
  shift_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  role: z.string().optional(),
  location: z.enum(['kitchen', 'counter', 'closing']).optional(),
  notes: z.string().optional(),
})

export const absenceFormSchema = z.object({
  staff_id: z.string().uuid('Select a staff member'),
  absence_date: z.string().min(1, 'Date is required'),
  type: z.enum(['planned', 'sick', 'emergency']),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

// FINANCE
export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.enum(['food_cost', 'labour', 'rent', 'utilities', 'marketing', 'equipment', 'other']),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().optional(),
  reference: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
})

// OVERHEAD
export const overheadItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'annual']),
  next_due_date: z.string().optional(),
  notes: z.string().optional(),
})

// DISPUTES
export const disputeFormSchema = z.object({
  platform: z.enum(['deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']),
  order_ref: z.string().min(1, 'Order reference is required'),
  order_date: z.string().min(1, 'Date is required'),
  claim_type: z.enum(['missing_item', 'quality', 'wrong_item', 'other']),
  claim_value: z.coerce.number().min(0).optional(),
  camera_reviewed: z.boolean().default(false),
  evidence_summary: z.string().optional(),
  notes: z.string().optional(),
})

// STAFF
export const staffMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  hourly_rate: z.coerce.number().positive('Hourly rate must be positive'),
  contracted_hours: z.coerce.number().min(0).optional(),
  phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  food_hygiene_cert_expiry: z.string().optional(),
  started_at: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type PinFormData = z.infer<typeof pinSchema>
export type IngredientFormData = z.infer<typeof ingredientFormSchema>
export type DeliveryFormData = z.infer<typeof deliveryFormSchema>
export type WasteEntryData = z.infer<typeof wasteEntrySchema>
export type SaleEntryData = z.infer<typeof saleEntrySchema>
export type SupplierFormData = z.infer<typeof supplierFormSchema>
export type MenuItemFormData = z.infer<typeof menuItemFormSchema>
export type ShiftFormData = z.infer<typeof shiftFormSchema>
export type AbsenceFormData = z.infer<typeof absenceFormSchema>
export type TransactionFormData = z.infer<typeof transactionFormSchema>
export type DisputeFormData = z.infer<typeof disputeFormSchema>
export type StaffMemberData = z.infer<typeof staffMemberSchema>
