import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import { todayISO } from './utils'
import type { Ingredient, StockMovement, Delivery } from '@/types/stock'
import type { SalesRecord, DailyRevenueSummary } from '@/types/sales'
import type { Transaction, OverheadItem } from '@/types/finance'
import type { MenuItem, MenuCategory } from '@/types/menu'
import type { StaffMember, RotaWeek, RotaShift, StaffAbsence } from '@/types/staff'
import type { PlatformSetting, DeliveryDispute } from '@/types/delivery'
import type { BusinessSetting, DailyBriefing, NightSummary, DailyWeather, MarginAlert } from '@/types'

// ============================================================
// QUERY KEYS
// ============================================================
export const QUERY_KEYS = {
  // Settings
  businessSettings: ['business-settings'] as const,
  // Dashboard
  dailyRevenue: (date: string) => ['daily-revenue', date] as const,
  healthScore: ['health-score'] as const,
  dailyBriefing: (date: string) => ['daily-briefing', date] as const,
  nightSummary: (date: string) => ['night-summary', date] as const,
  dailyWeather: (date: string) => ['daily-weather', date] as const,
  marginAlerts: ['margin-alerts'] as const,
  // Stock
  ingredients: ['ingredients'] as const,
  ingredient: (id: string) => ['ingredient', id] as const,
  stockMovements: (ingredientId?: string) => ['stock-movements', ingredientId] as const,
  deliveries: ['deliveries'] as const,
  stocktakes: ['stocktakes'] as const,
  // Menu
  menuItems: ['menu-items'] as const,
  menuItem: (id: string) => ['menu-item', id] as const,
  menuCategories: ['menu-categories'] as const,
  // Sales
  salesRecords: (date: string) => ['sales-records', date] as const,
  dailyRevenueSummary: (date: string) => ['daily-revenue-summary', date] as const,
  // Finance
  transactions: ['transactions'] as const,
  overheadItems: ['overhead-items'] as const,
  platformPayouts: ['platform-payouts'] as const,
  // Staff
  staffMembers: ['staff-members'] as const,
  rotaWeeks: ['rota-weeks'] as const,
  rotaShifts: (weekId: string) => ['rota-shifts', weekId] as const,
  absences: ['absences'] as const,
  // Platforms
  platformSettings: ['platform-settings'] as const,
  deliveryDisputes: ['delivery-disputes'] as const,
  // SOPs
  sops: ['sops'] as const,
  sop: (id: string) => ['sop', id] as const,
  // Waste
  wasteLogs: (date?: string) => ['waste-logs', date] as const,
  // Suppliers
  suppliers: ['suppliers'] as const,
} as const

// ============================================================
// BUSINESS SETTINGS
// ============================================================
export function useBusinessSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.businessSettings,
    queryFn: async () => {
      const { data, error } = await supabase.from('business_settings').select('*')
      if (error) throw error
      return (data as BusinessSetting[]).reduce<Record<string, string>>(
        (acc, row) => ({ ...acc, [row.key]: row.value ?? '' }),
        {}
      )
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateBusinessSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('business_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.businessSettings }),
  })
}

// ============================================================
// DASHBOARD
// ============================================================
export function useDailyRevenue(date = todayISO()) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyRevenue(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('*')
        .eq('date', date)
      if (error) throw error
      return data as DailyRevenueSummary[]
    },
  })
}

export function useDailyBriefing(date = todayISO()) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyBriefing(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_briefings')
        .select('*')
        .eq('date', date)
        .maybeSingle()
      if (error) throw error
      return data as DailyBriefing | null
    },
  })
}

export function useNightSummary(date = todayISO()) {
  return useQuery({
    queryKey: QUERY_KEYS.nightSummary(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('night_summaries')
        .select('*')
        .eq('date', date)
        .maybeSingle()
      if (error) throw error
      return data as NightSummary | null
    },
  })
}

export function useDailyWeather(date = todayISO()) {
  return useQuery({
    queryKey: QUERY_KEYS.dailyWeather(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_weather')
        .select('*')
        .eq('date', date)
        .maybeSingle()
      if (error) throw error
      return data as DailyWeather | null
    },
  })
}

export function useWeeklyRevenue() {
  return useQuery({
    queryKey: ['weekly-revenue'],
    queryFn: async () => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      const { data, error } = await supabase
        .from('daily_revenue_summary')
        .select('date, total_revenue')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })
      if (error) throw error
      return data as { date: string; total_revenue: number }[]
    },
  })
}

export function useMarginAlerts() {
  return useQuery({
    queryKey: QUERY_KEYS.marginAlerts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('margin_alerts')
        .select('*, menu_items(name)')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (MarginAlert & { menu_items: { name: string } | null })[]
    },
  })
}

// ============================================================
// INGREDIENTS / STOCK
// ============================================================
export function useIngredients() {
  return useQuery({
    queryKey: QUERY_KEYS.ingredients,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*, suppliers(id, name)')
        .order('name')
      if (error) throw error
      return data as Ingredient[]
    },
  })
}

export function useIngredient(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ingredient(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*, suppliers(id, name)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Ingredient
    },
    enabled: !!id,
  })
}

export function useCreateIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at' | 'suppliers'>) => {
      const { data, error } = await supabase.from('ingredients').insert(ingredient).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients }),
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ingredient> & { id: string }) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients }),
  })
}

export function useStockMovements(ingredientId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.stockMovements(ingredientId),
    queryFn: async () => {
      let query = supabase
        .from('stock_movements')
        .select('*, ingredients(id, name, unit)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (ingredientId) query = query.eq('ingredient_id', ingredientId)
      const { data, error } = await query
      if (error) throw error
      return data as StockMovement[]
    },
  })
}

export function useLogStockMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (movement: {
      ingredient_id: string
      movement_type: string
      quantity: number
      unit?: string
      reference?: string
      reason?: string
      notes?: string
    }) => {
      const { data, error } = await supabase.from('stock_movements').insert(movement).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stockMovements() })
    },
  })
}

export function useDeliveries() {
  return useQuery({
    queryKey: QUERY_KEYS.deliveries,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, suppliers(id, name)')
        .order('delivered_at', { ascending: false })
      if (error) throw error
      return data as Delivery[]
    },
  })
}

export function useCreateDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      supplier_id: string
      delivered_at: string
      invoice_ref?: string
      notes?: string
      items: { ingredient_id: string; quantity: number; unit: string; cost_per_unit: number }[]
    }) => {
      const { items, ...deliveryMeta } = payload

      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          supplier_id: deliveryMeta.supplier_id,
          delivered_at: deliveryMeta.delivered_at,
          delivery_note_ref: deliveryMeta.invoice_ref ?? null,
          notes: deliveryMeta.notes ?? null,
          total_cost: items.reduce((s, i) => s + i.quantity * i.cost_per_unit, 0),
        })
        .select()
        .single()
      if (deliveryError) throw deliveryError

      const deliveryItems = items.map((item) => ({
        delivery_id: deliveryData.id,
        ingredient_id: item.ingredient_id,
        quantity_received: item.quantity,
        unit_cost: item.cost_per_unit,
      }))
      const { error: itemsError } = await supabase.from('delivery_items').insert(deliveryItems)
      if (itemsError) throw itemsError

      // Create stock movements for each received item
      const stockMovements = items.map((item) => ({
        ingredient_id: item.ingredient_id,
        movement_type: 'delivery',
        quantity: item.quantity,
        unit: item.unit,
        reference: deliveryMeta.invoice_ref ?? null,
        notes: `delivery_id:${deliveryData.id}`,
        moved_at: deliveryMeta.delivered_at,
      }))
      if (stockMovements.length > 0) {
        const { error: movError } = await supabase.from('stock_movements').insert(stockMovements)
        if (movError) throw movError
      }

      return deliveryData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deliveries })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients })
    },
  })
}

// ============================================================
// WASTE LOGS
// ============================================================
export function useWasteLogs(date?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.wasteLogs(date),
    queryFn: async () => {
      let query = supabase
        .from('waste_logs')
        .select('*, ingredients(id, name, unit, cost_per_unit), menu_items(id, name)')
        .order('logged_at', { ascending: false })
      if (date) query = query.eq('logged_at::date', date)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useLogWaste() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: {
      ingredient_id?: string
      menu_item_id?: string
      quantity: number
      unit: string
      reason: string
      shift?: string
      estimated_cost?: number
      cost?: number
      notes?: string
      logged_by?: string
    }) => {
      const { data, error } = await supabase.from('waste_logs').insert(entry).select().single()
      if (error) throw error

      // Deplete stock if ingredient provided
      if (entry.ingredient_id) {
        await supabase.from('stock_movements').insert({
          ingredient_id: entry.ingredient_id,
          movement_type: 'waste',
          quantity: entry.quantity,
          reason: entry.reason,
          notes: `waste_log_id:${data.id}`,
        })
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wasteLogs() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients })
    },
  })
}

// ============================================================
// MENU
// ============================================================
export function useMenuItems() {
  return useQuery({
    queryKey: QUERY_KEYS.menuItems,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, menu_categories(id, name), menu_item_ingredients(*, ingredients(id, name, cost_per_unit, unit)), menu_item_allergens(*)')
        .order('name')
      if (error) throw error
      return data as MenuItem[]
    },
  })
}

export function useMenuCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.menuCategories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order')
      if (error) throw error
      return data as MenuCategory[]
    },
  })
}

// ============================================================
// SALES
// ============================================================
export function useSalesRecords(date = todayISO()) {
  return useQuery({
    queryKey: QUERY_KEYS.salesRecords(date),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_records')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as SalesRecord[]
    },
  })
}

export function useLogSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sale: Omit<SalesRecord, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('sales_records').insert(sale).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.salesRecords(todayISO()) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyRevenue(todayISO()) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredients })
    },
  })
}

// ============================================================
// FINANCE
// ============================================================
export function useTransactions() {
  return useQuery({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data as Transaction[]
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('financial_transactions').insert(transaction).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions }),
  })
}

export function useOverheadItems() {
  return useQuery({
    queryKey: QUERY_KEYS.overheadItems,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overhead_items')
        .select('*')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data as OverheadItem[]
    },
  })
}

// ============================================================
// STAFF
// ============================================================
export function useStaffMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.staffMembers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data as StaffMember[]
    },
  })
}

export function useRotaWeeks() {
  return useQuery({
    queryKey: QUERY_KEYS.rotaWeeks,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rota_weeks')
        .select('*')
        .order('week_start_date', { ascending: false })
        .limit(10)
      if (error) throw error
      return data as RotaWeek[]
    },
  })
}

export function useRotaShifts(weekId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.rotaShifts(weekId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rota_shifts')
        .select('*, staff_members(id, name, hourly_rate)')
        .eq('rota_week_id', weekId)
        .order('shift_date')
      if (error) throw error
      return data as RotaShift[]
    },
    enabled: !!weekId,
  })
}

export function useAbsences() {
  return useQuery({
    queryKey: QUERY_KEYS.absences,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_absences')
        .select('*, staff_members(id, name)')
        .gte('absence_date', todayISO())
        .order('absence_date')
      if (error) throw error
      return data as StaffAbsence[]
    },
  })
}

// ============================================================
// PLATFORMS
// ============================================================
export function usePlatformSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.platformSettings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('platform')
      if (error) throw error
      return data as PlatformSetting[]
    },
  })
}

export function useDeliveryDisputes() {
  return useQuery({
    queryKey: QUERY_KEYS.deliveryDisputes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_disputes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as DeliveryDispute[]
    },
  })
}

// ============================================================
// SOPs
// ============================================================
export function useSOPs() {
  return useQuery({
    queryKey: QUERY_KEYS.sops,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sops')
        .select('*')
        .neq('status', 'archived')
        .order('reference')
      if (error) throw error
      return data
    },
  })
}

export function useSOP(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sop(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sops')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// ============================================================
// SUPPLIERS
// ============================================================
export function useSuppliers() {
  return useQuery({
    queryKey: QUERY_KEYS.suppliers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    },
  })
}
