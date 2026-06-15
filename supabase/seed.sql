-- ============================================================
-- CoopOS Seed Data — Crispy Coop, Hertford
-- Run AFTER all migrations (001–011)
-- ============================================================

-- ============================================================
-- BUSINESS SETTINGS
-- ============================================================
INSERT INTO business_settings (key, value) VALUES
  ('business_name',           'Crispy Coop'),
  ('business_address',        '12 Market Street, Hertford, SG14 1BD'),
  ('business_phone',          '01992 123456'),
  ('business_email',          'hello@crispycoop.co.uk'),
  ('vat_number',              'GB123456789'),
  ('daily_revenue_target',    '419'),
  ('weekly_revenue_target',   '2933'),
  ('food_cost_target_pct',    '38'),
  ('labour_cost_target_pct',  '28'),
  ('opening_time',            '11:30'),
  ('closing_time_weekday',    '21:30'),
  ('closing_time_weekend',    '22:00'),
  ('timezone',                'Europe/London'),
  ('currency',                'GBP'),
  ('deliveroo_commission',    '30'),
  ('ubereats_commission',     '30'),
  ('justeat_commission',      '14'),
  ('food_hygiene_rating',     '5'),
  ('next_inspection_due',     '2026-09-01')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- SUPPLIERS
-- ============================================================
INSERT INTO suppliers (id, name, contact_name, phone, email, payment_terms_days, delivery_days, minimum_order_value, notes) VALUES
  (gen_random_uuid(), 'Brakes',            'Account Manager', '0345 606 9090', 'orders@brakes.co.uk',    30, ARRAY['tuesday','thursday'], 75.00,  'Main food supplier — chilled & frozen'),
  (gen_random_uuid(), 'Bidfood',           'Sales Rep',       '0800 622 6290', 'orders@bidfood.co.uk',   30, ARRAY['monday','wednesday'], 100.00, 'Dry goods & packaging'),
  (gen_random_uuid(), 'Alliance',          'Rep',             '01992 555001',  'hertford@alliance.co.uk', 14, ARRAY['monday','friday'],    50.00,  'Local produce & fresh veg'),
  (gen_random_uuid(), 'Bunzl Catering',    'Account',         '0800 542 7800', 'orders@bunzl.co.uk',     30, ARRAY['wednesday'],          40.00,  'Disposables, packaging, cleaning');

-- ============================================================
-- INGREDIENTS (core fried chicken operation)
-- ============================================================
DO $$
DECLARE
  sup_brakes  UUID;
  sup_bid     UUID;
  sup_local   UUID;
  sup_bunzl   UUID;
  ing_id      UUID;
BEGIN
  SELECT id INTO sup_brakes FROM suppliers WHERE name = 'Brakes' LIMIT 1;
  SELECT id INTO sup_bid    FROM suppliers WHERE name = 'Bidfood' LIMIT 1;
  SELECT id INTO sup_local  FROM suppliers WHERE name = 'Alliance' LIMIT 1;
  SELECT id INTO sup_bunzl  FROM suppliers WHERE name = 'Bunzl Catering' LIMIT 1;

  -- CHICKEN
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Chicken Thighs (bone-in)',     'protein',    'kg',    2.85, sup_brakes, 20, 40, 25),
    (gen_random_uuid(), 'Chicken Wings',                'protein',    'kg',    3.10, sup_brakes, 10, 20, 12),
    (gen_random_uuid(), 'Chicken Breast (boneless)',    'protein',    'kg',    4.20, sup_brakes, 10, 20, 10),
    (gen_random_uuid(), 'Chicken Strips (pre-cut)',     'protein',    'kg',    4.50, sup_brakes,  8, 16, 10),
    (gen_random_uuid(), 'Chicken Burgers (4oz)',        'protein',    'each',  0.55, sup_brakes, 48, 96, 60)
  ON CONFLICT DO NOTHING;

  -- BREADING & BATTER
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Seasoned Flour (Crispy Coop blend)', 'dry_goods', 'kg',   1.20, sup_bid, 15, 25, 18),
    (gen_random_uuid(), 'Buttermilk Marinade',                'chilled',   'litre', 1.80, sup_brakes, 5, 10, 6),
    (gen_random_uuid(), 'Breadcrumbs (Panko)',               'dry_goods', 'kg',   2.10, sup_bid,  5, 10, 6)
  ON CONFLICT DO NOTHING;

  -- COOKING
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Cooking Oil (25L)',   'cooking_oil', 'litre', 1.15, sup_bid, 50, 75, 60),
    (gen_random_uuid(), 'Salt',               'seasoning',   'kg',    0.45, sup_bid,  2,  5,  3),
    (gen_random_uuid(), 'Pepper (black)',     'seasoning',   'kg',    4.20, sup_bid,  1,  2,  1),
    (gen_random_uuid(), 'Paprika (smoked)',   'seasoning',   'kg',    5.50, sup_bid,  1,  2,  1),
    (gen_random_uuid(), 'Garlic Powder',      'seasoning',   'kg',    6.00, sup_bid,  1,  2,  1),
    (gen_random_uuid(), 'Cayenne Pepper',     'seasoning',   'kg',    7.00, sup_bid,  0.5,1,  0.5)
  ON CONFLICT DO NOTHING;

  -- SIDES
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Fries (frozen, 10kg)', 'frozen',   'kg',   0.85, sup_brakes, 30, 60, 40),
    (gen_random_uuid(), 'Corn on the Cob',      'frozen',   'each', 0.35, sup_brakes, 24, 48, 30),
    (gen_random_uuid(), 'Coleslaw Mix (ready)', 'chilled',  'kg',   1.40, sup_local,  5, 10, 6),
    (gen_random_uuid(), 'Baked Beans (catering tins)', 'dry_goods', 'tin', 1.80, sup_bid, 6, 12, 8)
  ON CONFLICT DO NOTHING;

  -- SAUCES
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Buffalo Sauce (5L)',       'sauce', 'litre', 3.20, sup_bid, 5, 10, 6),
    (gen_random_uuid(), 'BBQ Sauce (5L)',           'sauce', 'litre', 2.80, sup_bid, 5, 10, 6),
    (gen_random_uuid(), 'Sweet Chilli Sauce (5L)', 'sauce', 'litre', 3.00, sup_bid, 3,  6, 4),
    (gen_random_uuid(), 'Garlic Mayo (5kg)',        'sauce', 'kg',    4.50, sup_bid, 5, 10, 6),
    (gen_random_uuid(), 'Peri Peri Sauce (5L)',    'sauce', 'litre', 3.50, sup_bid, 3,  6, 4),
    (gen_random_uuid(), 'Ketchup (5kg)',            'sauce', 'kg',    2.20, sup_bid, 5, 10, 6)
  ON CONFLICT DO NOTHING;

  -- DRINKS
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Pepsi (330ml cans, 24pk)',    'drinks', 'can',    0.35, sup_bid, 48, 96, 72),
    (gen_random_uuid(), '7UP (330ml cans, 24pk)',      'drinks', 'can',    0.35, sup_bid, 24, 48, 36),
    (gen_random_uuid(), 'Water (500ml bottles, 24pk)', 'drinks', 'bottle', 0.22, sup_bid, 24, 48, 30),
    (gen_random_uuid(), 'Fruit Shoot (275ml)',          'drinks', 'bottle', 0.45, sup_bid, 12, 24, 15)
  ON CONFLICT DO NOTHING;

  -- PACKAGING
  INSERT INTO ingredients (id, name, category, unit, cost_per_unit, supplier_id, par_level, reorder_qty, current_stock) VALUES
    (gen_random_uuid(), 'Meal Box (large)',           'packaging', 'each', 0.18, sup_bunzl, 200, 500, 350),
    (gen_random_uuid(), 'Meal Box (small)',           'packaging', 'each', 0.12, sup_bunzl, 100, 300, 200),
    (gen_random_uuid(), 'Fry Bags',                  'packaging', 'each', 0.04, sup_bunzl, 200, 500, 400),
    (gen_random_uuid(), 'Sauce Pots (2oz)',          'packaging', 'each', 0.04, sup_bunzl, 300, 600, 500),
    (gen_random_uuid(), 'Napkins (500pk)',           'packaging', 'pack', 2.50, sup_bunzl,   2,   4,   3),
    (gen_random_uuid(), 'Carrier Bags (printed)',    'packaging', 'each', 0.08, sup_bunzl, 200, 400, 300),
    (gen_random_uuid(), 'Delivery Bags (insulated)', 'packaging', 'each', 1.20, sup_bunzl,  10,  20,  15)
  ON CONFLICT DO NOTHING;

  -- Sync stock_levels (only if table exists — created in migration 011)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_levels' AND table_schema = 'public') THEN
    INSERT INTO stock_levels (ingredient_id, quantity_on_hand)
    SELECT id, COALESCE(current_stock, 0) FROM ingredients
    ON CONFLICT (ingredient_id) DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand;
  END IF;

END $$;

-- ============================================================
-- MENU ITEMS
-- ============================================================
INSERT INTO menu_items (id, name, category, price, active, description) VALUES
  -- Individual pieces
  (gen_random_uuid(), '1 Piece Chicken',         'chicken',  2.99, true,  '1 piece of our crispy fried chicken'),
  (gen_random_uuid(), '2 Piece Chicken',         'chicken',  5.49, true,  '2 pieces of crispy fried chicken'),
  (gen_random_uuid(), '3 Piece Chicken',         'chicken',  7.49, true,  '3 pieces of crispy fried chicken'),
  (gen_random_uuid(), '4 Piece Chicken',         'chicken',  9.49, true,  '4 pieces of crispy fried chicken'),
  (gen_random_uuid(), '6 Piece Chicken',         'chicken', 13.49, true,  '6 pieces — great for sharing'),
  -- Strips
  (gen_random_uuid(), '3 Strips',                'strips',   4.99, true,  '3 crispy chicken strips'),
  (gen_random_uuid(), '5 Strips',                'strips',   7.49, true,  '5 crispy chicken strips'),
  (gen_random_uuid(), '10 Strips',               'strips',  13.99, true,  '10 strips — sharing platter'),
  -- Burgers
  (gen_random_uuid(), 'Classic Chicken Burger',  'burgers',  5.99, true,  'Crispy chicken fillet in a brioche bun'),
  (gen_random_uuid(), 'Spicy Chicken Burger',    'burgers',  6.49, true,  'Spicy crispy fillet, jalapeños, hot sauce'),
  (gen_random_uuid(), 'Tower Burger',            'burgers',  7.99, true,  'Double fillet, cheese, bacon, slaw'),
  -- Wings
  (gen_random_uuid(), '6 Wings',                 'wings',    5.99, true,  '6 crispy wings, choice of sauce'),
  (gen_random_uuid(), '10 Wings',                'wings',    9.49, true,  '10 crispy wings, choice of sauce'),
  (gen_random_uuid(), '20 Wings',                'wings',   17.99, true,  '20 wings — party bucket'),
  -- Meals (combos)
  (gen_random_uuid(), '2 Piece Meal',            'meals',    7.99, true,  '2 piece chicken + fries + drink'),
  (gen_random_uuid(), '3 Piece Meal',            'meals',    9.99, true,  '3 piece chicken + fries + drink'),
  (gen_random_uuid(), '3 Strips Meal',           'meals',    6.99, true,  '3 strips + fries + drink'),
  (gen_random_uuid(), 'Burger Meal',             'meals',    7.99, true,  'Classic burger + fries + drink'),
  -- Sides
  (gen_random_uuid(), 'Regular Fries',           'sides',    2.49, true,  'Crispy seasoned fries'),
  (gen_random_uuid(), 'Large Fries',             'sides',    2.99, true,  'Large crispy seasoned fries'),
  (gen_random_uuid(), 'Corn on the Cob',         'sides',    1.49, true,  'Buttered corn on the cob'),
  (gen_random_uuid(), 'Coleslaw',                'sides',    1.29, true,  'Creamy coleslaw'),
  (gen_random_uuid(), 'Baked Beans',             'sides',    1.49, true,  'Rich baked beans'),
  -- Drinks
  (gen_random_uuid(), 'Pepsi (330ml)',            'drinks',   1.49, true,  'Chilled Pepsi'),
  (gen_random_uuid(), '7UP (330ml)',              'drinks',   1.49, true,  'Chilled 7UP'),
  (gen_random_uuid(), 'Water (500ml)',            'drinks',   1.29, true,  'Still water'),
  (gen_random_uuid(), 'Fruit Shoot',              'drinks',   1.29, true,  'Kids fruit shoot')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SOPS (Standard Operating Procedures)
-- ============================================================
INSERT INTO sops (reference, title, "group", purpose, steps_json, status, version) VALUES
  ('FS-001', 'Temperature Check Procedure', 'food_safety',
   'Ensure all food is stored and served at safe temperatures',
   '[
     {"step": 1, "action": "Check fridge temperatures at opening (target: 1–4°C)"},
     {"step": 2, "action": "Check freezer temperatures at opening (target: -18°C or below)"},
     {"step": 3, "action": "Record all readings in the temperature log in CoopOS"},
     {"step": 4, "action": "If any reading is out of range, inform manager immediately"},
     {"step": 5, "action": "Check cooked chicken core temperature before serving (target: 75°C+)"},
     {"step": 6, "action": "Log final readings at closing"}
   ]'::jsonb, 'active', 1),

  ('FS-002', 'Opening Cleaning Checklist', 'food_safety',
   'Ensure kitchen is clean and ready for service before opening',
   '[
     {"step": 1, "action": "Wash hands thoroughly"},
     {"step": 2, "action": "Sanitise all food prep surfaces"},
     {"step": 3, "action": "Check and rotate stock (FIFO)"},
     {"step": 4, "action": "Set up fryers and preheat oil to 175°C"},
     {"step": 5, "action": "Check allergen boards are up to date"},
     {"step": 6, "action": "Complete temperature checks and log in CoopOS"}
   ]'::jsonb, 'active', 1),

  ('FS-003', 'Closing & Deep Clean Procedure', 'food_safety',
   'Ensure kitchen is left clean, safe, and compliant at end of service',
   '[
     {"step": 1, "action": "Turn off all fryers and allow oil to cool"},
     {"step": 2, "action": "Filter or change fryer oil (check oil quality daily)"},
     {"step": 3, "action": "Deep clean all cooking surfaces, fryer baskets, and grill"},
     {"step": 4, "action": "Mop floors with food-safe sanitiser"},
     {"step": 5, "action": "Empty bins and replace liners"},
     {"step": 6, "action": "Check all fridges are stocked, covered, and at temperature"},
     {"step": 7, "action": "Lock all windows, doors, and set alarm"},
     {"step": 8, "action": "Complete closing checklist in CoopOS"}
   ]'::jsonb, 'active', 1),

  ('FS-004', 'Allergen Management', 'food_safety',
   'Prevent allergen cross-contamination and ensure accurate customer information',
   '[
     {"step": 1, "action": "Review the allergen matrix in CoopOS before each shift"},
     {"step": 2, "action": "If a customer asks about allergens, refer to the CoopOS allergen screen"},
     {"step": 3, "action": "Never guess — if unsure, check with manager"},
     {"step": 4, "action": "Use dedicated utensils for allergen-free orders (blue handles)"},
     {"step": 5, "action": "Inform kitchen of allergen orders verbally and on the ticket"},
     {"step": 6, "action": "Change gloves and wash hands before preparing allergen-free orders"}
   ]'::jsonb, 'active', 1),

  ('KIT-001', 'Frying Procedure — Chicken', 'kitchen',
   'Consistent, safe frying of all chicken products',
   '[
     {"step": 1, "action": "Ensure oil temperature is 175°C before adding chicken"},
     {"step": 2, "action": "Remove chicken from marinade, coat in seasoned flour"},
     {"step": 3, "action": "Shake off excess flour before lowering into fryer"},
     {"step": 4, "action": "Fry thighs/drums: 14 mins. Breast: 12 mins. Wings: 10 mins."},
     {"step": 5, "action": "Check core temperature reaches 75°C+ before serving"},
     {"step": 6, "action": "Drain on rack for 60 seconds before serving"},
     {"step": 7, "action": "Never re-fry cooked chicken that has been sitting over 30 minutes"}
   ]'::jsonb, 'active', 1),

  ('KIT-002', 'Oil Management', 'kitchen',
   'Maintain fryer oil quality and safety',
   '[
     {"step": 1, "action": "Check oil colour and smell at start of each shift — dark or smelly = change"},
     {"step": 2, "action": "Filter oil at end of each service using the filter machine"},
     {"step": 3, "action": "Change oil fully every 3 days or sooner if quality degrades"},
     {"step": 4, "action": "Record oil changes in the equipment log in CoopOS"},
     {"step": 5, "action": "Cool used oil before disposal — never pour hot oil down drains"},
     {"step": 6, "action": "Store fresh oil in cool, dry area away from direct sunlight"}
   ]'::jsonb, 'active', 1),

  ('HR-001', 'New Starter Onboarding', 'hr',
   'Ensure all new team members are properly inducted before working unsupervised',
   '[
     {"step": 1, "action": "Complete Right to Work check and take copies of documents"},
     {"step": 2, "action": "Add staff member to CoopOS and assign PIN"},
     {"step": 3, "action": "Complete food hygiene awareness (minimum Level 2 required within 4 weeks)"},
     {"step": 4, "action": "Shadow experienced team member for minimum 2 shifts"},
     {"step": 5, "action": "Complete allergen awareness training and sign off in CoopOS"},
     {"step": 6, "action": "Complete fire safety and emergency procedure walkthrough"},
     {"step": 7, "action": "Sign SOP acknowledgement log in CoopOS Training module"}
   ]'::jsonb, 'active', 1),

  ('CUS-001', 'Handling Customer Complaints', 'customer',
   'Resolve complaints quickly, professionally, and consistently',
   '[
     {"step": 1, "action": "Listen without interrupting — let the customer explain fully"},
     {"step": 2, "action": "Apologise sincerely regardless of fault"},
     {"step": 3, "action": "For food quality issues: offer replacement or refund immediately"},
     {"step": 4, "action": "For delivery issues: contact platform support and log in CoopOS"},
     {"step": 5, "action": "Log all complaints in CoopOS Customer > Complaints tab"},
     {"step": 6, "action": "Escalate to manager for complaints involving illness or injury"},
     {"step": 7, "action": "Follow up on unresolved complaints within 24 hours"}
   ]'::jsonb, 'active', 1),

  ('DEL-001', 'Delivery Order Management', 'delivery',
   'Ensure delivery orders are accurate, fast, and properly packaged',
   '[
     {"step": 1, "action": "Check all 3 platforms (Deliveroo, Uber Eats, Just Eat) at start of shift"},
     {"step": 2, "action": "Accept orders within 2 minutes or customer auto-cancels"},
     {"step": 3, "action": "Print/display ticket and call to kitchen immediately"},
     {"step": 4, "action": "Target: food ready within 8 minutes of order acceptance"},
     {"step": 5, "action": "Double-check items against receipt before sealing bag"},
     {"step": 6, "action": "Ensure sauce pots are included as ordered"},
     {"step": 7, "action": "Seal delivery bag with sticker — do not leave open"}
   ]'::jsonb, 'active', 1),

  ('EMER-001', 'Fire Emergency Procedure', 'emergency',
   'Ensure all staff know exactly what to do in the event of a fire',
   '[
     {"step": 1, "action": "Shout FIRE to alert all staff and customers"},
     {"step": 2, "action": "Call 999 immediately — do not assume someone else has called"},
     {"step": 3, "action": "Evacuate all customers and staff via nearest exit"},
     {"step": 4, "action": "Do NOT re-enter the building for any reason"},
     {"step": 5, "action": "Meet at assembly point: Car park across the road"},
     {"step": 6, "action": "Account for all staff using the staff list in CoopOS"},
     {"step": 7, "action": "Do not attempt to fight a large fire — only use extinguisher on small fires if trained"}
   ]'::jsonb, 'active', 1)

ON CONFLICT (reference) DO NOTHING;

-- ============================================================
-- OVERHEAD ITEMS
-- ============================================================
INSERT INTO overhead_items (name, category, amount, frequency, active) VALUES
  ('Rent',                        'premises',   3500.00, 'monthly', true),
  ('Business Rates',              'premises',    850.00, 'monthly', true),
  ('Electricity',                 'utilities',   420.00, 'monthly', true),
  ('Gas',                         'utilities',   180.00, 'monthly', true),
  ('Water',                       'utilities',    65.00, 'monthly', true),
  ('Broadband & Phone',           'utilities',    55.00, 'monthly', true),
  ('Public Liability Insurance',  'insurance',   120.00, 'monthly', true),
  ('Employer Liability Insurance','insurance',    85.00, 'monthly', true),
  ('Card Machine (SumUp)',        'pos_fees',     25.00, 'monthly', true),
  ('Deliveroo Tablet',            'delivery',     15.00, 'monthly', true),
  ('Accounting Software',         'admin',        30.00, 'monthly', true),
  ('EPOS System Licence',         'pos_fees',     49.00, 'monthly', true),
  ('Pest Control Contract',       'compliance',   45.00, 'monthly', true),
  ('Grease Trap Service',         'maintenance',  85.00, 'monthly', true),
  ('Skip Hire',                   'waste',        95.00, 'monthly', true),
  ('Music Licence (PPL/PRS)',     'licences',     20.00, 'monthly', true),
  ('Food Hygiene Cert Renewal',   'compliance',  120.00, 'annual',  true),
  ('Fire Safety Inspection',      'compliance',  250.00, 'annual',  true),
  ('EHO Registration',            'compliance',    0.00, 'annual',  true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EQUIPMENT REGISTER
-- ============================================================
INSERT INTO equipment (name, category, next_service_date, warranty_expiry, notes) VALUES
  ('Frymaster Fryer (Unit 1)',  'cooking',       '2026-09-01', '2027-03-01', 'Main fryer — 40L capacity'),
  ('Frymaster Fryer (Unit 2)',  'cooking',       '2026-09-01', '2027-03-01', 'Second fryer'),
  ('Contact Grill',             'cooking',       '2026-12-01', '2026-06-01', 'For burgers'),
  ('Bain Marie (2-well)',       'cooking',       '2026-12-01', null,          'Keeps sides warm'),
  ('Upright Fridge (1)',        'refrigeration', '2026-08-01', '2027-01-01', 'Protein storage — 1–4°C'),
  ('Upright Fridge (2)',        'refrigeration', '2026-08-01', '2027-01-01', 'Drinks & sauces'),
  ('Walk-in Freezer',           'refrigeration', '2026-10-01', '2027-06-01', 'Frozen stock — -18°C'),
  ('Ventilation Hood',          'ventilation',   '2026-07-01', null,          'Grease filter — clean monthly'),
  ('EPOS Terminal',             'pos',           null,          '2027-12-01', 'Main till'),
  ('Receipt Printer',           'pos',           null,          '2027-12-01', 'Star Micronics'),
  ('Deliveroo Tablet',          'pos',           null,          null,          'Provided by Deliveroo'),
  ('Uber Eats Tablet',          'pos',           null,          null,          'Provided by Uber Eats'),
  ('Grease Trap',               'ventilation',   '2026-08-01', null,          'Serviced by contractor — 6-weekly')
ON CONFLICT DO NOTHING;

-- ============================================================
-- STAFF MEMBERS (no user_id — linked to auth separately)
-- ============================================================
INSERT INTO staff_members (name, role, hourly_rate, contracted_hours, phone, started_at, active) VALUES
  ('Ahamed Afzal',  'manager', 12.50, 40, '07700 900001', '2024-01-01', true),
  ('Fatima Rahman', 'staff',   11.44, 30, '07700 900002', '2024-03-01', true),
  ('Omar Sheikh',   'staff',   11.44, 25, '07700 900003', '2024-06-01', true),
  ('Aisha Patel',   'staff',   11.44, 20, '07700 900004', '2025-01-01', true),
  ('Yusuf Ali',     'staff',   11.44, 16, '07700 900005', '2025-04-01', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- LOCAL EVENTS (upcoming known events in Hertford)
-- ============================================================
INSERT INTO local_events (name, event_date, demand_impact) VALUES
  ('Hertford Market Day',        '2026-06-16', 'medium'),
  ('Hertford Festival',          '2026-07-04', 'high'),
  ('Hertford Market Day',        '2026-06-23', 'medium'),
  ('Ware Priory Summer Fair',    '2026-06-28', 'medium'),
  ('Hertford Market Day',        '2026-06-30', 'medium'),
  ('England Match Day',          '2026-07-01', 'high'),
  ('School Summer Holidays Begin','2026-07-21', 'high')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PROMO CODES (launch codes)
-- ============================================================
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_value, expiry_date, max_redemptions, redemption_count, active) VALUES
  ('CRISPY10',   'percentage', 10, 10.00, '2026-12-31', 500, 0, true),
  ('NEWCOOP',    'fixed',       3,  8.00, '2026-08-31', 200, 0, true),
  ('FIRSTORDER', 'percentage', 15, 12.00, '2026-09-30', 100, 0, true)
ON CONFLICT DO NOTHING;
