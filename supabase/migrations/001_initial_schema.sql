-- ============================================================
-- CoopOS Initial Schema
-- ============================================================

-- USERS & AUTH
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff')),
  pin_hash TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLIERS
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  account_number TEXT,
  payment_terms_days INTEGER DEFAULT 30,
  delivery_days TEXT[],
  minimum_order_value NUMERIC(10,2),
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE supplier_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  ingredient_id UUID,
  old_price NUMERIC(10,4),
  new_price NUMERIC(10,4),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- STOCK & INVENTORY
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  cost_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  par_level NUMERIC(10,2) NOT NULL DEFAULT 0,
  reorder_qty NUMERIC(10,2),
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('delivery', 'waste', 'adjustment', 'sale_depletion')),
  quantity NUMERIC(10,2) NOT NULL,
  reason TEXT,
  staff_id UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_note_ref TEXT,
  total_cost NUMERIC(10,2),
  received_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity_ordered NUMERIC(10,2),
  quantity_received NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(10,4) NOT NULL,
  rejected BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT
);

CREATE TABLE stocktakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conducted_by UUID REFERENCES profiles(id),
  conducted_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stocktake_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stocktake_id UUID NOT NULL REFERENCES stocktakes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  expected_qty NUMERIC(10,2),
  actual_qty NUMERIC(10,2) NOT NULL,
  variance NUMERIC(10,2),
  variance_cost NUMERIC(10,2)
);

-- MENU
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES menu_categories(id),
  instore_price NUMERIC(10,2) NOT NULL,
  delivery_price_uplift_pct NUMERIC(5,2) DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unavailable', 'removed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity NUMERIC(10,4) NOT NULL,
  unit TEXT NOT NULL
);

CREATE TABLE menu_item_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  allergen_name TEXT NOT NULL,
  present BOOLEAN DEFAULT FALSE,
  may_contain BOOLEAN DEFAULT FALSE
);

CREATE TABLE menu_item_assembly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  instruction TEXT NOT NULL
);

-- SALES & REVENUE
CREATE TABLE sales_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE TABLE sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sales_sessions(id),
  channel TEXT NOT NULL CHECK (channel IN ('instore_cash', 'instore_card', 'app', 'deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter')),
  order_ref TEXT,
  items_json JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  staff_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_revenue_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  channel TEXT NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, channel)
);

-- FINANCIAL CONTROL
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('food_cost', 'labour', 'rent', 'utilities', 'marketing', 'equipment', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  reference TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE till_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES sales_sessions(id),
  opening_float NUMERIC(10,2) DEFAULT 0,
  denominations_json JSONB NOT NULL DEFAULT '{}',
  total_cash NUMERIC(10,2),
  epos_cash_total NUMERIC(10,2),
  variance NUMERIC(10,2),
  banked NUMERIC(10,2),
  notes TEXT,
  counted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue NUMERIC(10,2),
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(10,2),
  net_payout NUMERIC(10,2),
  expected_payout NUMERIC(10,2),
  variance NUMERIC(10,2),
  received_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE overhead_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'annual')),
  next_due_date DATE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WAGES & ROTA
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL,
  contracted_hours NUMERIC(5,2),
  phone TEXT,
  emergency_contact TEXT,
  bank_details_encrypted TEXT,
  food_hygiene_cert_expiry DATE,
  started_at DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rota_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rota_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota_week_id UUID NOT NULL REFERENCES rota_weeks(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role TEXT,
  location TEXT CHECK (location IN ('kitchen', 'counter', 'closing')),
  notes TEXT
);

CREATE TABLE staff_absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  absence_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('planned', 'sick', 'emergency')),
  reason TEXT,
  cover_staff_id UUID REFERENCES staff_members(id),
  cover_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  logged_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wage_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  week_start DATE NOT NULL,
  hours_worked NUMERIC(5,2),
  hourly_rate NUMERIC(10,2),
  total_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WASTAGE
CREATE TABLE waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID REFERENCES ingredients(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('date_expired', 'over_prep', 'contaminated', 'dropped', 'quality_failure', 'other')),
  cost NUMERIC(10,2),
  logged_by UUID REFERENCES profiles(id),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY PLATFORMS
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter')),
  commission_rate NUMERIC(5,2) NOT NULL,
  current_rating NUMERIC(3,2) DEFAULT 0,
  prep_time_mins INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE platform_ratings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE delivery_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  order_ref TEXT NOT NULL,
  order_date DATE NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('missing_item', 'quality', 'wrong_item', 'other')),
  claim_value NUMERIC(10,2),
  camera_reviewed BOOLEAN DEFAULT FALSE,
  evidence_summary TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'submitted', 'won', 'lost', 'accepted')),
  outcome TEXT,
  financial_impact NUMERIC(10,2),
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  lifetime_value NUMERIC(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  segment TEXT DEFAULT 'new' CHECK (segment IN ('new', 'regular', 'lapsed', 'high_value', 'at_risk', 'vip')),
  sms_opt_in BOOLEAN DEFAULT FALSE,
  email_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  order_ref TEXT,
  items_json JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  order_ref TEXT,
  complaint_type TEXT NOT NULL,
  description TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nps_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- MARKETING & CAMPAIGNS
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  channels_json JSONB DEFAULT '[]',
  budget NUMERIC(10,2),
  target_outcome TEXT,
  actual_outcome TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  campaign_id UUID REFERENCES campaigns(id),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_item', 'free_delivery')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2),
  valid_from DATE,
  valid_to DATE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  platforms_json JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  customer_id UUID REFERENCES customers(id),
  order_ref TEXT,
  discount_applied NUMERIC(10,2),
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'facebook', 'google_my_business', 'sms', 'email', 'flyer')),
  content_type TEXT CHECK (content_type IN ('video', 'image', 'story', 'post', 'reel')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'produced', 'published', 'cancelled')),
  published_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE flyer_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  area TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  design_ref TEXT,
  promo_code_id UUID REFERENCES promo_codes(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('price_change', 'new_item', 'promotion', 'opening', 'closure', 'quality_note')),
  description TEXT,
  observed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ranking_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('google', 'deliveroo', 'ubereats')),
  search_term TEXT NOT NULL,
  position INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- EQUIPMENT & MAINTENANCE
CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_cost NUMERIC(10,2),
  warranty_expiry DATE,
  service_interval_days INTEGER,
  last_serviced_at DATE,
  location TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  engineer_name TEXT,
  work_done TEXT,
  cost NUMERIC(10,2),
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipment_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  fault_description TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  engineer_name TEXT,
  parts_replaced TEXT,
  cost NUMERIC(10,2),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  speciality TEXT,
  phone TEXT,
  email TEXT,
  avg_response_hours NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRAINING & DEVELOPMENT
CREATE TABLE training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  provider TEXT,
  completed_at DATE,
  certificate_number TEXT,
  expiry_date DATE,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sop_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  sop_reference TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  score_correct INTEGER NOT NULL,
  score_total INTEGER NOT NULL,
  pass BOOLEAN,
  notes TEXT,
  assessed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNICATIONS LOG
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'undelivered')),
  twilio_sid TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  sendgrid_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOPs
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  "group" TEXT NOT NULL CHECK ("group" IN ('food_safety', 'kitchen', 'hr', 'customer', 'delivery', 'technology', 'marketing', 'people', 'emergency', 'production')),
  purpose TEXT,
  scope TEXT,
  steps_json JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sop_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES sops(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- REPORTS
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  modules_included TEXT[],
  file_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES profiles(id)
);

-- FRANCHISE (Phase 4)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  manager_id UUID REFERENCES profiles(id),
  opened_at DATE,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM INTELLIGENCE
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  content TEXT,
  weather_summary TEXT,
  prep_recommendation TEXT,
  low_stock_items_json JSONB DEFAULT '[]',
  absent_staff_json JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE night_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  revenue NUMERIC(10,2),
  target NUMERIC(10,2),
  net_profit NUMERIC(10,2),
  food_cost_pct NUMERIC(5,2),
  waste_cost NUMERIC(10,2),
  best_selling_item TEXT,
  outstanding_actions_json JSONB DEFAULT '[]',
  weather_tomorrow TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE margin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id),
  current_margin_pct NUMERIC(5,2),
  threshold_pct NUMERIC(5,2),
  recommended_price NUMERIC(10,2),
  ai_recommendation TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  temperature_c NUMERIC(4,1),
  condition TEXT,
  precipitation_probability INTEGER,
  demand_prediction_note TEXT,
  raw_response_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX idx_sales_records_session ON sales_records(session_id);
CREATE INDEX idx_sales_records_created ON sales_records(created_at DESC);
CREATE INDEX idx_sales_records_channel ON sales_records(channel);
CREATE INDEX idx_daily_revenue_summary_date ON daily_revenue_summary(date DESC);
CREATE INDEX idx_waste_logs_logged_at ON waste_logs(logged_at DESC);
CREATE INDEX idx_waste_logs_ingredient ON waste_logs(ingredient_id);
CREATE INDEX idx_rota_shifts_staff ON rota_shifts(staff_id);
CREATE INDEX idx_rota_shifts_date ON rota_shifts(shift_date);
CREATE INDEX idx_customer_orders_customer ON customer_orders(customer_id);
CREATE INDEX idx_customer_orders_created ON customer_orders(created_at DESC);
CREATE INDEX idx_delivery_disputes_status ON delivery_disputes(status);
CREATE INDEX idx_ingredients_supplier ON ingredients(supplier_id);
CREATE INDEX idx_supplier_price_history_supplier ON supplier_price_history(supplier_id);
CREATE INDEX idx_business_settings_key ON business_settings(key);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_overhead_items_updated_at BEFORE UPDATE ON overhead_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rota_weeks_updated_at BEFORE UPDATE ON rota_weeks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_equipment_items_updated_at BEFORE UPDATE ON equipment_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_maintenance_contractors_updated_at BEFORE UPDATE ON maintenance_contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_sops_updated_at BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
