-- ============================================================
-- Equipment Repair Threshold Check
-- Fires alert note when cumulative repair cost > 60% of purchase cost
-- ============================================================

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
  FROM equipment_items
  WHERE id = NEW.equipment_id;

  IF v_purchase_cost IS NOT NULL AND v_purchase_cost > 0 THEN
    IF (v_total_repairs + COALESCE(NEW.cost, 0)) / v_purchase_cost > 0.6 THEN
      -- Log a note in the repair record itself
      NEW.notes := COALESCE(NEW.notes, '') ||
        ' [ALERT: Cumulative repair cost exceeds 60% of purchase cost — consider replacement]';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_repair_threshold
BEFORE INSERT ON equipment_repairs
FOR EACH ROW EXECUTE FUNCTION check_repair_threshold();
