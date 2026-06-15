-- ============================================================
-- Phase 4: Franchise, Voice AI, Stripe
-- ============================================================

-- FRANCHISE
CREATE TABLE IF NOT EXISTS franchise_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'paused', 'closed')),
  opened_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS franchise_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES franchise_sites(id) ON DELETE CASCADE,
  period TEXT NOT NULL,  -- YYYY-MM
  revenue NUMERIC(12,2),
  labour_pct NUMERIC(5,2),
  food_cost_pct NUMERIC(5,2),
  net_margin_pct NUMERIC(5,2),
  total_orders INTEGER,
  avg_order_value NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOICE AI (Bland AI)
CREATE TABLE IF NOT EXISTS voice_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id TEXT UNIQUE,
  caller_phone TEXT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'no-answer', 'failed', 'busy')),
  transcript TEXT,
  order_type TEXT DEFAULT 'phone',
  customer_name TEXT,
  raw_variables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_log_id UUID REFERENCES voice_call_logs(id),
  customer_name TEXT,
  customer_phone TEXT,
  order_items JSONB,
  total_amount NUMERIC(10,2),
  order_type TEXT DEFAULT 'phone',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRIPE PAYMENTS
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  customer_id UUID REFERENCES customers(id),
  order_ref TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for new tables
ALTER TABLE franchise_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manager_franchise_sites" ON franchise_sites FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager'));

CREATE POLICY "owner_manager_franchise_benchmarks" ON franchise_benchmarks FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager'));

CREATE POLICY "staff_view_voice_call_logs" ON voice_call_logs FOR SELECT TO authenticated
  USING (get_my_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "owner_manager_voice_orders" ON voice_orders FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "owner_manager_stripe_payments" ON stripe_payments FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager'));
