-- ============================================================
-- Schema Fixes for Phase 4 Compatibility
-- ============================================================

-- financial_transactions.category: add app_order and refund
-- (needed by Stripe webhook Edge Function)
ALTER TABLE financial_transactions
  DROP CONSTRAINT IF EXISTS financial_transactions_category_check;

ALTER TABLE financial_transactions
  ADD CONSTRAINT financial_transactions_category_check
  CHECK (category IN (
    'food_cost', 'labour', 'rent', 'utilities', 'marketing',
    'equipment', 'other', 'app_order', 'refund'
  ));

-- supplier_price_history.ingredient_id: add FK if not present
-- (was left without FK in initial schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'supplier_price_history'
    AND constraint_name = 'supplier_price_history_ingredient_id_fkey'
  ) THEN
    ALTER TABLE supplier_price_history
      ADD CONSTRAINT supplier_price_history_ingredient_id_fkey
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- stock_levels table (referenced by M25 stock valuation report)
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE UNIQUE,
  quantity_on_hand NUMERIC(10,3) NOT NULL DEFAULT 0,
  last_counted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all_stock_levels" ON stock_levels FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager', 'staff'));

-- purchase_orders.total_amount column (used in M19 & M25)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);

-- Compute total_amount from items on insert/update via trigger
CREATE OR REPLACE FUNCTION sync_po_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_cost), 0)
    FROM purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id
  )
  WHERE id = NEW.purchase_order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_po_total ON purchase_order_items;
CREATE TRIGGER trg_sync_po_total
  AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION sync_po_total();

-- voice_orders and stripe_payments RLS may conflict if run twice
-- (safe due to IF NOT EXISTS on table creation in 010_phase4.sql)

-- Ensure stock_levels rows exist for all ingredients
INSERT INTO stock_levels (ingredient_id, quantity_on_hand)
SELECT id, COALESCE(current_stock, 0)
FROM ingredients
ON CONFLICT (ingredient_id) DO NOTHING;
