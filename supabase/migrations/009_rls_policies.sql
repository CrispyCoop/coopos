-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocktake_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_revenue_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE till_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE overhead_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rota_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rota_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_ratings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyer_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE margin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_weather ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- OWNER: full access to all tables
-- MANAGER: all operational tables
-- STAFF: own rows only in acknowledgements, training, assessments
-- ============================================================

-- PROFILES
CREATE POLICY "owner_all_profiles" ON profiles FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "self_read_profile" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "manager_read_profiles" ON profiles FOR SELECT TO authenticated USING (get_my_role() = 'manager');

-- INGREDIENTS
CREATE POLICY "owner_manager_all_ingredients" ON ingredients FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_ingredients" ON ingredients FOR SELECT TO authenticated USING (get_my_role() = 'staff');

-- STOCK MOVEMENTS
CREATE POLICY "owner_manager_all_stock_movements" ON stock_movements FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_insert_stock_movements" ON stock_movements FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'staff');
CREATE POLICY "staff_read_stock_movements" ON stock_movements FOR SELECT TO authenticated USING (get_my_role() = 'staff');

-- DELIVERIES
CREATE POLICY "owner_manager_all_deliveries" ON deliveries FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- DELIVERY ITEMS
CREATE POLICY "owner_manager_all_delivery_items" ON delivery_items FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- STOCKTAKES
CREATE POLICY "owner_manager_all_stocktakes" ON stocktakes FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- STOCKTAKE ITEMS
CREATE POLICY "owner_manager_all_stocktake_items" ON stocktake_items FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- SUPPLIERS
CREATE POLICY "owner_manager_all_suppliers" ON suppliers FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- SUPPLIER PRICE HISTORY
CREATE POLICY "owner_manager_all_supplier_price_history" ON supplier_price_history FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- MENU
CREATE POLICY "owner_manager_all_menu_categories" ON menu_categories FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_menu_categories" ON menu_categories FOR SELECT TO authenticated USING (get_my_role() = 'staff');

CREATE POLICY "owner_manager_all_menu_items" ON menu_items FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_menu_items" ON menu_items FOR SELECT TO authenticated USING (get_my_role() = 'staff');

CREATE POLICY "owner_manager_all_menu_item_ingredients" ON menu_item_ingredients FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_menu_item_ingredients" ON menu_item_ingredients FOR SELECT TO authenticated USING (get_my_role() = 'staff');

CREATE POLICY "owner_manager_all_menu_item_allergens" ON menu_item_allergens FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_menu_item_assembly" ON menu_item_assembly FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_menu_item_assembly" ON menu_item_assembly FOR SELECT TO authenticated USING (get_my_role() = 'staff');

-- SALES
CREATE POLICY "owner_manager_all_sales_sessions" ON sales_sessions FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_sales_records" ON sales_records FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_insert_sales_records" ON sales_records FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'staff');
CREATE POLICY "owner_manager_all_daily_revenue_summary" ON daily_revenue_summary FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- FINANCIAL (owner only)
CREATE POLICY "owner_all_financial_transactions" ON financial_transactions FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "owner_all_till_counts" ON till_counts FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "owner_all_platform_payouts" ON platform_payouts FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "owner_manager_all_overhead_items" ON overhead_items FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- WAGES & ROTA
CREATE POLICY "owner_manager_all_staff_members" ON staff_members FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_rota_weeks" ON rota_weeks FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_rota_shifts" ON rota_shifts FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_read_rota_shifts" ON rota_shifts FOR SELECT TO authenticated USING (get_my_role() = 'staff');
CREATE POLICY "owner_manager_all_staff_absences" ON staff_absences FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_all_wage_payments" ON wage_payments FOR ALL TO authenticated USING (get_my_role() = 'owner');

-- WASTAGE
CREATE POLICY "owner_manager_all_waste_logs" ON waste_logs FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_insert_waste_logs" ON waste_logs FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'staff');
CREATE POLICY "staff_read_waste_logs" ON waste_logs FOR SELECT TO authenticated USING (get_my_role() = 'staff');

-- PLATFORMS
CREATE POLICY "owner_manager_all_platform_settings" ON platform_settings FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_platform_ratings_history" ON platform_ratings_history FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_delivery_disputes" ON delivery_disputes FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- CUSTOMERS
CREATE POLICY "owner_manager_all_customers" ON customers FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_customer_orders" ON customer_orders FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_customer_complaints" ON customer_complaints FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_nps_scores" ON nps_scores FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- MARKETING
CREATE POLICY "owner_manager_all_campaigns" ON campaigns FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_promo_codes" ON promo_codes FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_promo_redemptions" ON promo_redemptions FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_content_calendar" ON content_calendar FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_flyer_distributions" ON flyer_distributions FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_competitor_logs" ON competitor_logs FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_ranking_tracker" ON ranking_tracker FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- EQUIPMENT
CREATE POLICY "owner_manager_all_equipment_items" ON equipment_items FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_equipment_services" ON equipment_services FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_equipment_repairs" ON equipment_repairs FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_maintenance_contractors" ON maintenance_contractors FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- TRAINING (staff can read/write own records)
CREATE POLICY "owner_manager_all_training_records" ON training_records FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_own_training_records" ON training_records FOR ALL TO authenticated USING (
  get_my_role() = 'staff' AND staff_id IN (SELECT id FROM staff_members WHERE user_id = auth.uid())
);

CREATE POLICY "owner_manager_all_sop_acknowledgements" ON sop_acknowledgements FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_own_sop_acknowledgements" ON sop_acknowledgements FOR ALL TO authenticated USING (
  get_my_role() = 'staff' AND staff_id IN (SELECT id FROM staff_members WHERE user_id = auth.uid())
);

CREATE POLICY "owner_manager_all_knowledge_assessments" ON knowledge_assessments FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "staff_own_knowledge_assessments" ON knowledge_assessments FOR ALL TO authenticated USING (
  get_my_role() = 'staff' AND staff_id IN (SELECT id FROM staff_members WHERE user_id = auth.uid())
);

-- COMMS LOGS
CREATE POLICY "owner_manager_all_sms_log" ON sms_log FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "owner_manager_all_email_log" ON email_log FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- SOPs (all can read, owner can write)
CREATE POLICY "all_read_sops" ON sops FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "owner_write_sops" ON sops FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "all_read_sop_versions" ON sop_versions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "owner_write_sop_versions" ON sop_versions FOR ALL TO authenticated USING (get_my_role() = 'owner');

-- REPORTS
CREATE POLICY "owner_manager_all_generated_reports" ON generated_reports FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));

-- LOCATIONS
CREATE POLICY "owner_all_locations" ON locations FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "manager_read_locations" ON locations FOR SELECT TO authenticated USING (get_my_role() = 'manager');

-- BUSINESS SETTINGS
CREATE POLICY "owner_write_business_settings" ON business_settings FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "all_read_business_settings" ON business_settings FOR SELECT TO authenticated USING (TRUE);

-- SYSTEM INTELLIGENCE (all read, edge functions write via service role)
CREATE POLICY "all_read_daily_briefings" ON daily_briefings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "owner_write_daily_briefings" ON daily_briefings FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "all_read_night_summaries" ON night_summaries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "owner_write_night_summaries" ON night_summaries FOR ALL TO authenticated USING (get_my_role() = 'owner');
CREATE POLICY "owner_manager_all_margin_alerts" ON margin_alerts FOR ALL TO authenticated USING (get_my_role() IN ('owner', 'manager'));
CREATE POLICY "all_read_daily_weather" ON daily_weather FOR SELECT TO authenticated USING (TRUE);

-- SFBB INTEGRATION
CREATE POLICY "owner_all_sfbb_settings" ON sfbb_integration_settings FOR ALL TO authenticated USING (get_my_role() = 'owner');
