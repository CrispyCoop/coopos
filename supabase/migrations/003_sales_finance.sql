-- ============================================================
-- Stock Movement Trigger
-- When stock_movements row inserted → update ingredients.current_stock
-- ============================================================

CREATE OR REPLACE FUNCTION apply_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type IN ('delivery') THEN
    UPDATE ingredients
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.ingredient_id;
  ELSIF NEW.movement_type IN ('waste', 'sale_depletion') THEN
    UPDATE ingredients
    SET current_stock = GREATEST(current_stock - NEW.quantity, 0)
    WHERE id = NEW.ingredient_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    -- quantity can be positive or negative for adjustments
    UPDATE ingredients
    SET current_stock = GREATEST(current_stock + NEW.quantity, 0)
    WHERE id = NEW.ingredient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_stock_movement
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION apply_stock_movement();

-- ============================================================
-- Daily Revenue Summary Upsert Function
-- Called after each sales_record insert to roll up channel totals
-- ============================================================

CREATE OR REPLACE FUNCTION upsert_daily_revenue_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
BEGIN
  v_date := DATE(NEW.created_at);
  INSERT INTO daily_revenue_summary (date, channel, total_orders, total_revenue, avg_order_value)
  VALUES (v_date, NEW.channel, 1, NEW.total, NEW.total)
  ON CONFLICT (date, channel) DO UPDATE SET
    total_orders = daily_revenue_summary.total_orders + 1,
    total_revenue = daily_revenue_summary.total_revenue + NEW.total,
    avg_order_value = (daily_revenue_summary.total_revenue + NEW.total) / (daily_revenue_summary.total_orders + 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upsert_daily_revenue
AFTER INSERT ON sales_records
FOR EACH ROW EXECUTE FUNCTION upsert_daily_revenue_summary();
