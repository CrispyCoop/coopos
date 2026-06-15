-- ============================================================
-- Marketing: no additional triggers.
-- All tables defined in 001_initial_schema.sql
-- ============================================================

-- Promo redemption counter
CREATE OR REPLACE FUNCTION increment_promo_redemptions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE promo_codes
  SET current_redemptions = current_redemptions + 1
  WHERE id = NEW.promo_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_promo_redemptions
AFTER INSERT ON promo_redemptions
FOR EACH ROW EXECUTE FUNCTION increment_promo_redemptions();
