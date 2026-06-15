-- ============================================================
-- Sale → Stock Depletion Trigger
-- When a sales_record is inserted, deplete stock for each
-- ingredient used in the ordered menu items.
-- items_json format: [{ "menu_item_id": "uuid", "quantity": 1 }]
-- ============================================================

CREATE OR REPLACE FUNCTION deplete_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  ingredient RECORD;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items_json)
  LOOP
    FOR ingredient IN
      SELECT mii.ingredient_id, mii.quantity * (item->>'quantity')::NUMERIC AS qty_used
      FROM menu_item_ingredients mii
      WHERE mii.menu_item_id = (item->>'menu_item_id')::UUID
    LOOP
      INSERT INTO stock_movements (ingredient_id, movement_type, quantity, reason, notes)
      VALUES (
        ingredient.ingredient_id,
        'sale_depletion',
        ingredient.qty_used,
        'Auto-deducted from sale',
        'sale_record_id:' || NEW.id::TEXT
      );
    END LOOP;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deplete_stock_on_sale
AFTER INSERT ON sales_records
FOR EACH ROW EXECUTE FUNCTION deplete_stock_on_sale();
