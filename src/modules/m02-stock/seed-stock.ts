export const SEED_INGREDIENTS = [
  // Proteins
  { name: 'Whole Chicken', category: 'Protein', unit: 'kg', current_stock: 40, par_level: 30, minimum_stock: 10, cost_per_unit: 2.80 },
  { name: 'Chicken Breast (bone-in)', category: 'Protein', unit: 'kg', current_stock: 20, par_level: 15, minimum_stock: 5, cost_per_unit: 3.20 },
  { name: 'Chicken Thigh (bone-in)', category: 'Protein', unit: 'kg', current_stock: 20, par_level: 15, minimum_stock: 5, cost_per_unit: 2.60 },
  { name: 'Chicken Wings', category: 'Protein', unit: 'kg', current_stock: 15, par_level: 10, minimum_stock: 3, cost_per_unit: 2.40 },
  { name: 'Chicken Tenders', category: 'Protein', unit: 'kg', current_stock: 10, par_level: 8, minimum_stock: 2, cost_per_unit: 4.50 },
  // Dry Goods
  { name: 'Plain Flour', category: 'Dry Goods', unit: 'kg', current_stock: 25, par_level: 20, minimum_stock: 8, cost_per_unit: 0.70 },
  { name: 'Seasoned Breading Mix', category: 'Dry Goods', unit: 'kg', current_stock: 15, par_level: 10, minimum_stock: 4, cost_per_unit: 1.80 },
  { name: 'Cornstarch', category: 'Dry Goods', unit: 'kg', current_stock: 8, par_level: 5, minimum_stock: 2, cost_per_unit: 1.20 },
  { name: 'Salt', category: 'Spices & Seasonings', unit: 'kg', current_stock: 10, par_level: 5, minimum_stock: 2, cost_per_unit: 0.40 },
  { name: 'Black Pepper', category: 'Spices & Seasonings', unit: 'kg', current_stock: 3, par_level: 2, minimum_stock: 0.5, cost_per_unit: 4.00 },
  { name: 'Paprika', category: 'Spices & Seasonings', unit: 'kg', current_stock: 2, par_level: 1.5, minimum_stock: 0.5, cost_per_unit: 5.50 },
  { name: 'Garlic Powder', category: 'Spices & Seasonings', unit: 'kg', current_stock: 2, par_level: 1.5, minimum_stock: 0.5, cost_per_unit: 6.00 },
  { name: 'Cayenne Pepper', category: 'Spices & Seasonings', unit: 'kg', current_stock: 1, par_level: 0.8, minimum_stock: 0.2, cost_per_unit: 7.00 },
  // Dairy
  { name: 'Buttermilk', category: 'Dairy', unit: 'L', current_stock: 20, par_level: 15, minimum_stock: 5, cost_per_unit: 1.10 },
  { name: 'Mayonnaise', category: 'Sauces', unit: 'kg', current_stock: 8, par_level: 5, minimum_stock: 2, cost_per_unit: 2.20 },
  // Oils
  { name: 'Frying Oil (Sunflower)', category: 'Oils & Fats', unit: 'L', current_stock: 60, par_level: 40, minimum_stock: 15, cost_per_unit: 1.30 },
  // Produce
  { name: 'White Cabbage', category: 'Produce', unit: 'kg', current_stock: 8, par_level: 6, minimum_stock: 2, cost_per_unit: 0.60 },
  { name: 'Carrot', category: 'Produce', unit: 'kg', current_stock: 5, par_level: 4, minimum_stock: 1, cost_per_unit: 0.50 },
  { name: 'Red Onion', category: 'Produce', unit: 'kg', current_stock: 4, par_level: 3, minimum_stock: 1, cost_per_unit: 0.70 },
  // Packaging
  { name: 'Chicken Boxes (2pc)', category: 'Packaging', unit: 'units', current_stock: 500, par_level: 300, minimum_stock: 100, cost_per_unit: 0.15 },
  { name: 'Chicken Boxes (4pc)', category: 'Packaging', unit: 'units', current_stock: 400, par_level: 250, minimum_stock: 80, cost_per_unit: 0.20 },
  { name: 'Fries Boxes (Regular)', category: 'Packaging', unit: 'units', current_stock: 600, par_level: 400, minimum_stock: 150, cost_per_unit: 0.08 },
  { name: 'Fries Boxes (Large)', category: 'Packaging', unit: 'units', current_stock: 400, par_level: 250, minimum_stock: 100, cost_per_unit: 0.10 },
  { name: 'Paper Bags (Small)', category: 'Packaging', unit: 'units', current_stock: 1000, par_level: 600, minimum_stock: 200, cost_per_unit: 0.05 },
  { name: 'Paper Bags (Large)', category: 'Packaging', unit: 'units', current_stock: 800, par_level: 500, minimum_stock: 150, cost_per_unit: 0.07 },
  { name: 'Sauce Pots', category: 'Packaging', unit: 'units', current_stock: 1200, par_level: 800, minimum_stock: 300, cost_per_unit: 0.04 },
  { name: 'Napkins', category: 'Packaging', unit: 'units', current_stock: 2000, par_level: 1200, minimum_stock: 400, cost_per_unit: 0.01 },
  // Beverages
  { name: 'Coca-Cola (330ml can)', category: 'Beverages', unit: 'units', current_stock: 120, par_level: 72, minimum_stock: 24, cost_per_unit: 0.45 },
  { name: 'Fanta Orange (330ml can)', category: 'Beverages', unit: 'units', current_stock: 72, par_level: 48, minimum_stock: 12, cost_per_unit: 0.45 },
  { name: 'Sprite (330ml can)', category: 'Beverages', unit: 'units', current_stock: 72, par_level: 48, minimum_stock: 12, cost_per_unit: 0.45 },
  // Frozen sides
  { name: 'Frozen Fries', category: 'Produce', unit: 'kg', current_stock: 30, par_level: 20, minimum_stock: 8, cost_per_unit: 1.10 },
  { name: 'Burger Buns (Sesame)', category: 'Dry Goods', unit: 'units', current_stock: 100, par_level: 60, minimum_stock: 20, cost_per_unit: 0.22 },
]

export const SEED_SUPPLIERS = [
  { name: 'Brakes Brothers', contact_name: 'Account Manager', phone: '0345 600 0085', email: 'orders@brakesfoodservice.com', address: 'Brakes Distribution Centre, Watford, WD24', payment_terms: 30, notes: 'Primary meat and dry goods supplier. Next-day delivery available.' },
  { name: 'Sysco/Fresh Direct', contact_name: 'Account Manager', phone: '0800 783 3835', email: 'freshorders@sysco.co.uk', address: 'Fresh Direct, Wembley, HA9', payment_terms: 14, notes: 'Fresh produce and dairy. 3× per week delivery schedule.' },
  { name: 'Bestway Cash & Carry', contact_name: 'Branch Manager', phone: '01992 584141', email: '', address: 'Bestway, Ware Road, Hertford, SG13', payment_terms: 0, notes: 'Cash & carry for top-up stock. Open 7 days. Good for spices and packaging.' },
  { name: 'Reynolds Catering Supplies', contact_name: 'Sales Team', phone: '0208 842 1420', email: 'sales@reynoldscatering.co.uk', address: 'Reynolds, Greenford, UB6', payment_terms: 21, notes: 'Packaging, disposables, and cleaning supplies.' },
  { name: 'Local Oil Supplier (Oleic)', contact_name: 'Driver', phone: '01707 000001', email: '', address: 'Hertfordshire', payment_terms: 7, notes: 'Weekly frying oil delivery. Also provides used oil collection for biodiesel.' },
]
