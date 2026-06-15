-- ============================================================
-- Schema alignment — bridge gap between generated migrations
-- and what React modules + seed.sql expect
-- ============================================================

-- --------------------------------------------------------
-- 1. Rename equipment_items → equipment
--    PostgreSQL automatically updates FK references on rename
-- --------------------------------------------------------
ALTER TABLE equipment_items RENAME TO equipment;

-- Add columns the React module and seed expect
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_service_date DATE;

-- Rename the RLS policy to match the new table name
ALTER POLICY "owner_manager_all_equipment_items" ON equipment
  RENAME TO "owner_manager_all_equipment";

-- --------------------------------------------------------
-- 2. Update trigger functions that referenced equipment_items
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_last_serviced_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE equipment
  SET last_serviced_at = NEW.service_date,
      updated_at = NOW()
  WHERE id = NEW.equipment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_repair_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_total_repairs NUMERIC;
  v_purchase_cost NUMERIC;
BEGIN
  SELECT SUM(cost) INTO v_total_repairs
  FROM equipment_repairs
  WHERE equipment_id = NEW.equipment_id AND cost IS NOT NULL;

  SELECT purchase_cost INTO v_purchase_cost
  FROM equipment
  WHERE id = NEW.equipment_id;

  IF v_purchase_cost IS NOT NULL AND v_purchase_cost > 0 THEN
    IF (v_total_repairs + COALESCE(NEW.cost, 0)) / v_purchase_cost > 0.6 THEN
      NEW.notes := COALESCE(NEW.notes, '') ||
        ' [ALERT: Cumulative repair cost exceeds 60% of purchase cost — consider replacement]';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- 3. Add missing columns to equipment_services / equipment_repairs
--    so the React insert payloads match the table schema
-- --------------------------------------------------------
ALTER TABLE equipment_services ADD COLUMN IF NOT EXISTS provider TEXT;

ALTER TABLE equipment_repairs ADD COLUMN IF NOT EXISTS repair_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE equipment_repairs ADD COLUMN IF NOT EXISTS issue TEXT;

-- --------------------------------------------------------
-- 4. local_events table (used by M18 Market Intel + Edge Functions)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS local_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  event_date  DATE NOT NULL,
  demand_impact TEXT NOT NULL DEFAULT 'medium'
    CHECK (demand_impact IN ('low', 'medium', 'high')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE local_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_all_local_events" ON local_events
  FOR ALL TO authenticated
  USING (get_my_role() IN ('owner', 'manager', 'staff'));
