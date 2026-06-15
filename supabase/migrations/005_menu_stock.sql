-- ============================================================
-- Customer Segment Update Function
-- Called after customer_orders insert to recalculate segment
-- ============================================================

CREATE OR REPLACE FUNCTION update_customer_segment()
RETURNS TRIGGER AS $$
DECLARE
  v_total_orders INTEGER;
  v_lifetime_value NUMERIC;
  v_avg_order NUMERIC;
  v_last_order TIMESTAMPTZ;
  v_segment TEXT;
BEGIN
  SELECT
    COUNT(*),
    SUM(total),
    AVG(total),
    MAX(created_at)
  INTO v_total_orders, v_lifetime_value, v_avg_order, v_last_order
  FROM customer_orders
  WHERE customer_id = NEW.customer_id;

  -- Determine segment
  IF v_avg_order > 12.00 THEN
    v_segment := 'high_value';
  ELSIF v_total_orders <= 2 AND v_last_order >= NOW() - INTERVAL '30 days' THEN
    v_segment := 'new';
  ELSIF v_total_orders >= 3 AND v_last_order >= NOW() - INTERVAL '30 days' THEN
    v_segment := 'regular';
  ELSIF v_last_order < NOW() - INTERVAL '30 days' AND v_total_orders >= 3 THEN
    v_segment := 'lapsed';
  ELSIF v_last_order < NOW() - INTERVAL '21 days' THEN
    v_segment := 'at_risk';
  ELSE
    v_segment := 'new';
  END IF;

  UPDATE customers SET
    total_orders = v_total_orders,
    lifetime_value = v_lifetime_value,
    avg_order_value = v_avg_order,
    last_order_at = v_last_order,
    segment = v_segment,
    updated_at = NOW()
  WHERE id = NEW.customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_segment
AFTER INSERT ON customer_orders
FOR EACH ROW EXECUTE FUNCTION update_customer_segment();
