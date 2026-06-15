export type MenuItemStatus = 'active' | 'unavailable' | 'removed'

export interface MenuCategory {
  id: string
  name: string
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  category_id: string | null
  instore_price: number
  delivery_price_uplift_pct: number
  status: MenuItemStatus
  image_url: string | null
  created_at: string
  updated_at: string
  // joined
  menu_categories?: Pick<MenuCategory, 'id' | 'name'>
  menu_item_ingredients?: MenuItemIngredient[]
  menu_item_allergens?: MenuItemAllergen[]
}

export interface MenuItemIngredient {
  id: string
  menu_item_id: string
  ingredient_id: string
  quantity: number
  unit: string
  // joined
  ingredients?: { id: string; name: string; cost_per_unit: number; unit: string }
}

export interface MenuItemAllergen {
  id: string
  menu_item_id: string
  allergen_name: string
  present: boolean
  may_contain: boolean
}

export interface MenuItemAssembly {
  id: string
  menu_item_id: string
  step_order: number
  instruction: string
}

export interface MenuItemCost {
  menu_item_id: string
  name: string
  instore_price: number
  delivery_price: number
  food_cost: number
  total_cost: number
  instore_margin_pct: number
  delivery_margin_pct: number
}
