-- ============================================================
-- Equipment: update last_serviced_at on service record insert
-- ============================================================

CREATE OR REPLACE FUNCTION update_last_serviced_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE equipment_items
  SET last_serviced_at = NEW.service_date,
      updated_at = NOW()
  WHERE id = NEW.equipment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_last_serviced
AFTER INSERT ON equipment_services
FOR EACH ROW EXECUTE FUNCTION update_last_serviced_at();
