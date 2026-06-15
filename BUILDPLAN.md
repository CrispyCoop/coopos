# CoopOS — Full Build Plan

> Restaurant Operating System for Crispy Coop, Hertford UK  
> Built by Afzal Ahamed · MSc Software Engineering

---

## PHASE 1 — FOUNDATION

### Step 1 — Project Scaffold

```bash
cd c:\Users\fatim\Desktop\CoopOS
npm create vite@latest . -- --template react-ts
npm install
```

Install all dependencies:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @hookform/resolvers @react-pdf/renderer \
  @supabase/supabase-js @tanstack/react-query @tanstack/react-query-devtools \
  bcryptjs clsx date-fns react react-dom react-hook-form react-hot-toast \
  react-loading-skeleton react-router-dom recharts tailwind-merge zod zustand

npm install -D @types/bcryptjs @types/node @types/react @types/react-dom \
  @vitejs/plugin-react autoprefixer postcss tailwindcss typescript vite
```

Configure:
- `tailwind.config.ts` — extend theme with all 12 brand colours, add `fontFamily` for Bebas Neue / DM Sans / DM Mono
- `tsconfig.json` — `strict: true`, `baseUrl: ./src`, `paths: { "@/*": ["./*"] }`
- `vite.config.ts` — add `resolve.alias: { "@": path.resolve(__dirname, "src") }`
- `index.html` — set title to "CoopOS — Crispy Coop"

---

### Step 2 — Fonts

Download and place in `public/fonts/`:
- `BebasNeue-Regular.woff2`
- `DMSans-Regular.woff2`, `DMSans-Medium.woff2`, `DMSans-Bold.woff2`
- `DMMono-Regular.woff2`

Add `@font-face` declarations in `src/index.css` (only file that needs non-Tailwind CSS).  
Register as Tailwind font families: `font-display` / `font-body` / `font-mono`.

---

### Step 3 — Environment Variables

Create `.env.local` with all placeholders:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=crispycoop.ops@gmail.com
SENDGRID_FROM_NAME=CoopOS - Crispy Coop
ANTHROPIC_API_KEY=
VITE_WEATHER_API_KEY=
VITE_WEATHER_CITY=Hertford,UK
VITE_GOOGLE_MAPS_API_KEY=
VITE_BUSINESS_NAME=Crispy Coop
VITE_BUSINESS_LOCATION=Hertford, UK
VITE_DAILY_REVENUE_TARGET=419
VITE_FOOD_COST_TARGET_PCT=38
VITE_WASTE_TARGET_PCT=2
VITE_MARGIN_ALERT_THRESHOLD=35
```

---

### Step 4 — Supabase Client

`src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Initialize Supabase CLI and link to your project:

```bash
supabase init
supabase link --project-ref <your-ref>
```

---

### Step 5 — Database Migrations

Create `supabase/migrations/` with these files in order:

**`001_initial_schema.sql`** — all core tables:
- `profiles`, `ingredients`, `stock_movements`, `deliveries`, `delivery_items`, `stocktakes`, `stocktake_items`
- `suppliers`, `supplier_price_history`
- `menu_categories`, `menu_items`, `menu_item_ingredients`, `menu_item_allergens`, `menu_item_assembly`
- `sales_sessions`, `sales_records`, `daily_revenue_summary`
- `financial_transactions`, `till_counts`, `platform_payouts`, `overhead_items`
- `staff_members`, `rota_weeks`, `rota_shifts`, `staff_absences`, `wage_payments`
- `waste_logs`
- `platform_settings`, `platform_ratings_history`, `delivery_disputes`
- `customers`, `customer_orders`, `customer_complaints`, `nps_scores`
- `campaigns`, `promo_codes`, `promo_redemptions`, `content_calendar`, `flyer_distributions`, `competitor_logs`, `ranking_tracker`
- `equipment_items`, `equipment_services`, `equipment_repairs`, `maintenance_contractors`
- `training_records`, `sop_acknowledgements`, `knowledge_assessments`
- `sms_log`, `email_log`
- `sops`, `sop_versions`
- `generated_reports`
- `locations`
- `business_settings`, `daily_briefings`, `night_summaries`, `margin_alerts`, `daily_weather`

Every table: `id UUID PK`, `created_at`, `updated_at`, RLS enabled, indexes on FKs.

**`002_food_safety.sql`** — placeholder only:

```sql
CREATE TABLE sfbb_integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_url TEXT,
  api_key_hash TEXT,
  sync_enabled BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sfbb_integration_settings ENABLE ROW LEVEL SECURITY;
```

**`003_sales_finance.sql`** — DB trigger: `stock_movements` insert → update `ingredients.current_stock`

**`004_staff_rota.sql`** — DB trigger: `rota_shifts` insert/delete → recalculate projected weekly labour cost

**`005_menu_stock.sql`** — DB trigger: `sales_records` insert → insert `stock_movements` row for each ingredient in `menu_item_ingredients`

**`006_customers.sql`** — DB function: `update_customer_segment()` — runs segment logic against all 6 rules

**`007_marketing.sql`** — no triggers, tables already defined in 001

**`008_equipment.sql`** — DB function: `check_repair_threshold()` — fires alert if cumulative repair cost > 60% of purchase cost

**`009_rls_policies.sql`** — all RLS policies:
- Owner: full access all rows
- Manager: all operational tables, blocked from `profiles.bank_details_encrypted`, `business_settings` writes, `locations`
- Staff: own rows only in `sop_acknowledgements`, `training_records`, `knowledge_assessments`

```bash
supabase db push
```

---

### Step 6 — TypeScript Types

Create all files in `src/types/`:

| File | Key types |
|---|---|
| `index.ts` | `Role`, `UserProfile`, re-exports all |
| `stock.ts` | `Ingredient`, `StockMovement`, `Delivery`, `DeliveryItem`, `Stocktake` |
| `sales.ts` | `SalesRecord`, `SalesSession`, `Channel`, `DailyRevenueSummary` |
| `finance.ts` | `Transaction`, `TillCount`, `PlatformPayout`, `OverheadItem` |
| `food-safety.ts` | Placeholder types for future SFBB integration |
| `staff.ts` | `StaffMember`, `RotaShift`, `RotaWeek`, `StaffAbsence`, `WagePayment` |
| `menu.ts` | `MenuItem`, `MenuCategory`, `MenuItemIngredient`, `Allergen` |
| `delivery.ts` | `PlatformSetting`, `DeliveryDispute`, `PlatformRating` |
| `customers.ts` | `Customer`, `CustomerOrder`, `Segment`, `NPS` |
| `campaigns.ts` | `Campaign`, `PromoCode`, `ContentCalendarEntry` |
| `equipment.ts` | `EquipmentItem`, `EquipmentService`, `Repair`, `Contractor` |

---

### Step 7 — Core Library Files

**`src/lib/store.ts`** — Zustand store:

```typescript
interface AppStore {
  sidebarOpen: boolean
  activeDate: Date
  toggleSidebar: () => void
  setActiveDate: (date: Date) => void
}
```

**`src/lib/constants.ts`**:

```typescript
export const CHANNELS = ['instore_cash', 'instore_card', 'app', 'deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']
export const PLATFORMS = ['deliveroo', 'ubereats', 'justeat', 'foodhub', 'gogetter']
export const WASTE_REASONS = ['date_expired', 'over_prep', 'contaminated', 'dropped', 'quality_failure', 'other']
export const ROLES = ['owner', 'manager', 'staff']
```

**`src/lib/utils.ts`**:

```typescript
export const formatGBP = (amount: number) => `£${amount.toFixed(2)}`
export const formatPct = (value: number) => `${value.toFixed(1)}%`
export const cn = (...classes) => twMerge(clsx(classes))
```

**`src/lib/validators.ts`** — skeleton Zod schemas for every form. Populate as each module is built.

**`src/lib/queries.ts`** — skeleton React Query hooks with query keys defined. Populate as each module is built.

---

### Step 8 — App Entry & Routing

**`src/main.tsx`**:

```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

**`src/App.tsx`** — React Router v6 setup:
- All 25 module routes, all lazy-loaded with `React.lazy()`
- `ProtectedRoute` wrapper on all authenticated routes
- `RoleGuard` wrappers per module per auth spec
- Public routes: `/login`, `/pin`

---

### Step 9 — Auth System

**`src/pages/LoginPage.tsx`**:
- Email + password form with React Hook Form + Zod
- `supabase.auth.signInWithPassword()`
- Redirects to `/` on success

**`src/pages/PinLoginPage.tsx`**:
- 4-digit PIN numpad UI
- On submit: fetch profile where `pin_hash` matches bcrypt compare
- Session managed in Zustand (Phase 4 upgrades to Edge Function bcrypt verification)

**`src/components/layout/ProtectedRoute.tsx`**:
- Check `supabase.auth.getSession()`
- Redirect to `/login` if no session

**`src/components/layout/RoleGuard.tsx`**:
- Props: `allowedRoles: Role[]`
- Fetch profile from `profiles` table
- Redirect to `/unauthorised` if role not in allowed list

---

### Step 10 — Design System Components

Build all 15 in `src/components/ui/`. Tailwind only — no custom CSS:

| Component | Key props / behaviour |
|---|---|
| `Button.tsx` | `variant: 'primary' \| 'secondary' \| 'danger' \| 'ghost'`, `size`, `loading` |
| `Input.tsx` | Controlled, error state, label, helper text |
| `Select.tsx` | Options array, controlled, error state |
| `Modal.tsx` | `isOpen`, `onClose`, `title`, portal via `createPortal` |
| `Table.tsx` | `columns[]`, `data[]`, sticky header, striped rows, hover |
| `Card.tsx` | `title`, `action`, coloured left border variant |
| `Badge.tsx` | `variant: 'green' \| 'red' \| 'amber' \| 'blue' \| 'purple' \| 'grey'` |
| `Alert.tsx` | `type: 'error' \| 'warning' \| 'success' \| 'info'`, dismissible |
| `Stat.tsx` | `label`, `value`, `trend`, `unit` — Bebas Neue for value |
| `Chart.tsx` | Thin Recharts wrapper with brand colours |
| `Toggle.tsx` | Accessible boolean toggle |
| `Tabs.tsx` | Controlled tabs with active indicator |
| `Drawer.tsx` | Slide-in panel from right, portal |
| `Checklist.tsx` | `items[]`, checkbox per item, timestamps |
| `EmptyState.tsx` | `icon`, `title`, `message`, `action` button |

---

### Step 11 — Shared Components

**`src/components/layout/AppShell.tsx`** — wraps all authenticated pages:
```
Sidebar | TopBar
         <Outlet />
```

**`src/components/layout/Sidebar.tsx`**:
- Dark background (`#111111`)
- CoopOS logo top
- All 25 module nav links, grouped by category with colour-coded icons
- Active link state
- Collapse toggle (Zustand `sidebarOpen`)

**`src/components/layout/TopBar.tsx`**:
- HealthScore chip
- Alert count badge
- User avatar + role label
- Date/time display

**`src/components/layout/ModuleHeader.tsx`**:
- `title`, `subtitle`, `colour` props
- Module name in Bebas Neue

**`src/components/shared/HealthScore.tsx`**:
- Circular gauge, colour coded
- Clickable — expands to show all 6 components
- Food safety shows grey "Not connected" chip

**`src/components/shared/AlertPanel.tsx`**:
- Aggregated alerts from all modules, sorted by priority
- Each alert links to the relevant module

**`src/components/shared/WeatherWidget.tsx`**:
- Reads from `daily_weather` table
- Shows temperature, condition, demand prediction note

**`src/components/shared/ConnectionTag.tsx`**:
- Small coloured tag: "→ M02", "→ M04" etc.

**`src/components/shared/ReportExport.tsx`**:
- PDF / CSV export button
- Calls appropriate Edge Function or client-side generation

---

### Step 12 — M16 Settings

**Route:** `/settings`

Build all 9 tabs:

1. **BusinessSettings.tsx** — business name, address, phone, email, trading hours
2. **TargetSettings.tsx** — daily revenue target (£419), food cost % (38%), waste % (2%), margin threshold (35%). On save → update `business_settings` table.
3. **UserManagement.tsx** — table of all profiles. Add/edit/deactivate.
4. **UserForm.tsx** — name, email, role, PIN (hashed before save)
5. **NotificationSettings.tsx** — per-alert type: on/off, threshold, channel (in-app/email/SMS)
6. **APIKeyManager.tsx** — masked keys, Test button per integration, Update form
7. **DataExport.tsx** — per-module CSV export buttons
8. **BrandingSettings.tsx** — logo upload to Supabase Storage
9. **Integrations tab** — single field: "SFBB App URL". Saved to `business_settings` key `sfbb_app_url`. Used by M08.

Seed `business_settings` immediately after building this module:

```sql
INSERT INTO business_settings (key, value) VALUES
  ('business_name', 'Crispy Coop'),
  ('business_location', 'Hertford, UK'),
  ('daily_revenue_target', '419'),
  ('food_cost_target_pct', '38'),
  ('waste_target_pct', '2'),
  ('margin_alert_threshold', '35'),
  ('opening_time', '12:00'),
  ('closing_time', '22:00'),
  ('sfbb_app_url', '');
```

---

### Step 13 — M01 Dashboard

**Route:** `/`

Build all 12 components:

1. **DashboardPage.tsx** — grid layout, refreshes every 60 seconds
2. **LiveRevenueTicker.tsx** — `useQuery` on `daily_revenue_summary` for today. Real-time subscription. Total + per-channel breakdown.
3. **ProfitIndicator.tsx** — today revenue − (revenue × food_cost_pct) − (daily overhead ÷ 30). Shows £ and coloured indicator.
4. **HealthScoreCard.tsx** — calls `health-score` Edge Function every 15 min. 0–100 circular gauge. Food safety = grey "Not connected".
5. **WeatherWidget.tsx** — reads `daily_weather` for today. Condition icon, temperature, demand prediction.
6. **AlertPanel.tsx** — aggregated alerts from all modules, sorted by priority.
7. **TargetGauge.tsx** — horizontal progress bar: today revenue / daily target. Colour changes at 50%, 80%, 100%.
8. **WeeklySparkline.tsx** — Recharts `LineChart`, last 7 days revenue from `daily_revenue_summary`.
9. **QuickActions.tsx** — 4 icon buttons: Start Shift (→ M07), Log Temperature (→ M08 placeholder), Log Waste (→ M06), View SOPs (→ M10).
10. **DailyBriefingCard.tsx** — reads `daily_briefings` for today. Visible after 10:45 AM.
11. **NightSummaryCard.tsx** — reads `night_summaries` for today. Visible after 10:30 PM.
12. **AIInsightCard.tsx** — Phase 2 placeholder. Shows "AI prep suggestions coming in Phase 2".

React Query hooks to add to `src/lib/queries.ts`:

```typescript
export const useDailyRevenue = () => useQuery({ queryKey: ['daily-revenue', today()], ... })
export const useHealthScore = () => useQuery({ queryKey: ['health-score'], staleTime: 15 * 60 * 1000, ... })
export const useDailyBriefing = () => useQuery({ queryKey: ['daily-briefing', today()], ... })
```

---

### Step 14 — M08 Food Safety Placeholder

**Route:** `/food-safety`

Single file only — `src/modules/m08-food-safety/FoodSafetyPage.tsx`:
- Module header: "Food Health & Safety", yellow colour coding
- Info card: "SFBB diary managed in the dedicated SFBB app"
- Large primary button: "Open SFBB App" — href from `business_settings.sfbb_app_url`
- "Coming Soon — CoopOS Integration" section listing 5 future data flows:
  - Temperature log compliance status → CoopOS Health Score
  - Opening and closing checklist completion → CoopOS Dashboard alerts
  - Allergen matrix → CoopOS Menu Manager
  - Incident log → CoopOS Reporting
  - Staff illness records → CoopOS ROTA module
- Note: "To integrate your SFBB app with CoopOS, configure the API endpoint in Settings → Integrations → SFBB App."

> **This is intentionally one file. Build it fast and move on.**

---

### Step 15 — M10 SOP Library

**Route:** `/sops`

Build 8 components:

1. **SOPPage.tsx** — tabs: Library, Checklists, Compliance Tracker
2. **SOPLibrary.tsx** — all 60 SOPs. Left sidebar: group filter (10 groups). Top: search. Each row: reference, title, group badge, version, status.
3. **SOPDetail.tsx** — Purpose, Scope, numbered Steps (from `steps_json`), Notes. Print button. Acknowledge button for staff (inserts to `sop_acknowledgements`).
4. **SOPEditor.tsx** — owner-only. Edit any SOP. On save: auto-increment version, archive old to `sop_versions`.
5. **ChecklistRunner.tsx** — interactive checklist for: Opening Check, Closing Check, Deep Clean, Weekly Owner Review. Each step = checkbox with timestamp.
6. **ChecklistHistory.tsx** — all completed checklists: timestamp, staff, notes.
7. **ComplianceTracker.tsx** — % of scheduled checklists completed on time (past 30 days). SOP sign-off grid.
8. **NewSOPForm.tsx** — create new SOP using standard template.

Seed all 60 SOPs (CC-SOP-001 to CC-SOP-060) via a seed SQL file. Steps stored as:
```json
[{ "step_number": 1, "title": "...", "content": "..." }]
```

---

### Step 16 — M02 Stock & Inventory

**Route:** `/stock`

Build 9 components:

1. **StockPage.tsx** — tabs: Overview, Ingredients, Deliveries, Stocktake, Alerts
2. **IngredientList.tsx** — sortable/filterable table. Colour: red if below par, amber if within 20% of par.
3. **IngredientForm.tsx** — add/edit modal. Supplier dropdown from `suppliers`.
4. **DeliveryLog.tsx** — all deliveries newest first. Add delivery button.
5. **DeliveryForm.tsx** — supplier, date, ref. Dynamic rows: ingredient + qty received + unit cost + rejected toggle.
6. **StocktakeForm.tsx** — lists every ingredient. User enters actual count. System calculates variance and shrinkage cost. Saves to `stocktakes` + `stocktake_items`.
7. **StockAlerts.tsx** — items below par (red), items within 48h use-by (amber).
8. **StockMovements.tsx** — full audit log. Filter by ingredient, type, date range.
9. **StockValueCard.tsx** — `SUM(current_stock * cost_per_unit)` across all ingredients.

DB trigger (migration 003): `INSERT INTO stock_movements` → `UPDATE ingredients SET current_stock`

Seed:
- All ingredients (proteins, bread, dairy, sides, sauces, coating, oil, drinks, packaging) with costs and par levels
- JJ Food Service and Booker as suppliers
- All 5 platform settings

Connections to wire:
- Alert to M01 `AlertPanel` when any ingredient falls below par
- On delivery price change: invalidate M05 query cache

---

### Step 17 — M06 Wastage

**Route:** `/waste`

Build 8 components:

1. **WastagePage.tsx** — tabs: Log Waste, Today, Weekly Report, Analysis
2. **WasteEntryForm.tsx** — search ingredient or menu item. Quantity, unit, reason. Cost auto-calculated from M02 price. Submit → inserts `waste_logs` + triggers `stock_movements`.
3. **DailyWasteBoard.tsx** — today's running waste total. Breakdown by reason (donut chart). Compare to 2% target.
4. **WeeklyWasteReport.tsx** — waste by item, by reason, total cost, as % of food cost vs target.
5. **MostWastedItems.tsx** — ranked table: frequency count and total cost.
6. **WasteTrend.tsx** — Recharts `LineChart`, daily waste cost over date range.
7. **OverPrepAlert.tsx** — query for `reason = 'over_prep'` 3+ consecutive days → display alert with prep reduction suggestion.
8. **ExpiryWarnings.tsx** — ingredients within 48h of use-by from M02.

Connections to wire:
- On waste log submit: `stock_movements` insert
- Invalidate M04 queries (daily P&L updates)
- Invalidate M01 dashboard alert count

---

## PHASE 2 — OPERATIONS

### Step 18 — M03 Sales & Revenue

**Route:** `/sales` | 11 components

Key wiring:
- `SalesEntryForm.tsx` on submit → insert `sales_records` → trigger (migration 005) depletes `ingredients` via `stock_movements`
- Real-time subscription on `sales_records` → updates `LiveSalesBoard.tsx`
- `daily_revenue_summary` upsert called via DB function after each sale
- Invalidates M04 queries (P&L needs fresh revenue)

---

### Step 19 — M04 Financial Control

**Route:** `/finance` | 10 components

Key wiring:
- `DailyPL.tsx` — composite query: M03 revenue + (revenue × `food_cost_target_pct`) + M13 overhead + M07 wages + M06 waste cost
- `PLVarianceAlert.tsx` — client-side check at 6 PM: if projected profit < target by 10%, fire toast + insert alert
- `VATTracker.tsx` — 20% VAT on all sales (simplified)

---

### Step 20 — M11 Cash, Card & Payment Reconciliation

**Route:** `/cash` | 6 components

Key wiring:
- `TillCountForm.tsx` — denomination inputs auto-sum. Compare to EPOS cash total. Flag if `variance > £5`.
- `PlatformPayouts.tsx` — expected = M03 platform revenue × (1 − commission rate). Enter actual. Flag variance.

---

### Step 21 — M07 ROTA

**Route:** `/rota` | 11 components (includes drag-and-drop rota grid via `@dnd-kit/sortable`)

Key wiring:
- `LabourCostBar.tsx` — `SUM(shift hours × hourly_rate)` recalculated on every shift change
- `AbsenceForm.tsx` on submit → inserts `staff_absences` → invalidates M04 labour cost queries
- Cover request SMS → Phase 3 (M24 dependency)

---

### Step 22 — M09 Menu Manager

**Route:** `/menu` | 7 components

Key wiring:
- Ingredient dropdown in `MenuItemForm.tsx` sourced from M02 `ingredients`
- On ingredient price change → M05 query cache invalidated
- On recipe change → toast: "Remember to update allergen matrix in your SFBB app."
- On item status → unavailable: prompt to pause on platforms (link to M12)

---

### Step 23 — M05 Cost Calculator & Margin Guardian

**Route:** `/costs` | 9 components

Key wiring:
- `MenuCostTable.tsx` — for each item: `SUM(cost_per_unit × quantity)` + packaging. Calculate in-store and delivery margin. Traffic light: green ≥ 35%, amber 25–35%, red < 25%.
- `MarginGuardianPanel.tsx` — auto-fires when any item drops below threshold.
- On any M02 price change → re-query automatically via shared query key.

---

### Step 24 — M13 Overhead & Expense Management

**Route:** `/overhead` | 8 components

Key wiring:
- `WagesManager.tsx` — reads `rota_shifts` for current week, calculates total wage bill
- `OverheadSummary.tsx` — feeds M04 daily P&L

Seed `overhead_items`:
- Rent: £1,200/month
- Labour: £80/day
- Electricity/Gas: £10/day
- Oil: £6.50/day
- Coating: £2.05/day
- Marinade: £1.50/day

---

### Step 25 — M12 Delivery Partner Hub

**Route:** `/delivery` | 8 components

Key wiring:
- `PlatformOverview.tsx` — reads `platform_settings` for all 5 platforms
- `DisputeForm.tsx` on submit → insert `delivery_disputes` → Phase 4 calls `dispute-resolution` Edge Function
- `PayoutReconciliation.tsx` — links to M11 platform payouts data

---

### Step 26 — M14 Reporting & Analytics

**Route:** `/reporting` | 5 components

- `KPIDashboard.tsx` — 10 KPIs each with trend chart, pulled from respective module tables
- `AutoReports.tsx` — UI shell and schedule config built now. **Live sending activates in Phase 4.**
- `CustomReportBuilder.tsx` — date range + module selector → calls `generate-report` Edge Function (Phase 4)

---

### Step 27 — M25 Report Generation & Printing

**Route:** `/reports` | 4 components

PDF reports using `@react-pdf/renderer`:
- Build 11 active report templates
- Items 2, 6, 13 are **PENDING SFBB integration** — show placeholder in generator
- Every PDF: Crispy Coop branding, header (business name, report type, date range, generation timestamp), page numbers in footer
- Store generated PDFs in Supabase Storage bucket `reports/`
- Link in `generated_reports` table on generation

Active report types:
1. Daily P&L Report
2. ~~Daily Food Safety Log~~ — **PENDING SFBB integration**
3. Daily Cash Reconciliation
4. Daily Waste Log
5. Weekly Business Summary
6. ~~Weekly Food Safety Compliance Report~~ — **PENDING SFBB integration**
7. Weekly Wage Summary
8. Weekly Stock Movement Report
9. Weekly Platform Performance Report
10. Monthly Income Statement
11. Monthly Cash Flow Summary
12. Monthly KPI Report (embedded charts as images)
13. ~~Monthly Food Safety Summary~~ — **PENDING SFBB integration**
14. Monthly Marketing Performance Report

---

## PHASE 3 — INTELLIGENCE

### Step 28 — M24 Communications Engine

**Route:** `/comms` | 8 components

Also build 2 Edge Functions:

**`supabase/functions/send-sms/index.ts`** (Deno):
```typescript
// POST body: { to, message, template_name? }
// Calls Twilio REST API
// Logs to sms_log table
// Returns: { success, sid?, error? }
```

**`supabase/functions/send-email/index.ts`** (Deno):
```typescript
// POST body: { to, subject, html, template_name? }
// Calls SendGrid /v3/mail/send
// Logs to email_log table
// Returns: { success, message_id?, error? }
```

> Every other module that sends SMS/email calls these functions — never Twilio/SendGrid directly from the client.

---

### Step 29 — M17 Customer Intelligence

**Route:** `/customers` | 8 components

Key wiring:
- Auto-segment assignment: `update_customer_segment()` DB function triggers on `customer_orders` insert
- Lapsed segment change → inserts alert → M21 picks up for re-engagement campaigns

Segment rules:
```
new:        first order within 30 days, total_orders <= 2
regular:    total_orders >= 3 AND last_order within 30 days
lapsed:     last_order > 30 days ago AND previously was regular
high_value: avg_order_value > £12.00
at_risk:    was regular, now > 21 days since last order
vip:        top 20 by lifetime_value
```

---

### Step 30 — M21 Marketing Campaign Manager

**Route:** `/campaigns` | 10 components

Key wiring:
- `PromoCodeList.tsx` — shows `current_redemptions` vs `max_redemptions`
- When customer enters `lapsed` segment → M21 can trigger re-engagement campaign → M24 SMS send

---

### Step 31 — M19 Supplier Management

**Route:** `/suppliers` | 9 components

Key wiring:
- `InvoiceMatching.tsx` — match delivery (M02) to PO. Flag discrepancies.
- `PurchaseOrderForm.tsx` on submit → M24 email to supplier

---

### Step 32 — M20 Equipment & Maintenance

**Route:** `/equipment` | 10 components

Key wiring:
- `RepairForm.tsx` on submit → DB function `check_repair_threshold()` → if cumulative repairs > 60% of purchase cost → fire replacement alert to M01

---

### Step 33 — M22 Training & Development

**Route:** `/training` | 8 components

Key wiring:
- `SOPSignoffs.tsx` — reads `sop_acknowledgements` joined to all staff × all SOPs
- `TrainingAlerts.tsx` — food hygiene cert expiring < 60 days → feeds M01 alert panel
- Staff compliance % feeds `health-score` Edge Function `staff` component

---

### Step 34 — M18 Market Intelligence

**Route:** `/market` | 4 components

- `LocalEventCalendar.tsx` — Hertford events with demand impact tag. Feeds AI demand forecast (Phase 4).
- `GoogleRankingTracker.tsx` — weekly log for 3 search terms: "fried chicken Hertford", "chicken shop Hertford", "takeaway near me Hertford". Trend chart.

---

### Step 35 — M15 System Hub

**Route:** `/hub` | 5 components

- `AIModuleHub.tsx` — all Phase 4 AI features as cards with on/off toggle
- `TVDisplayManager.tsx` — control what shows on waiting area TV screen

---

## PHASE 4 — AI & SCALE

### Step 36 — Edge Functions

Build all 10 functions in `supabase/functions/`. All Deno TypeScript.

**`ai-query`**:
```typescript
import Anthropic from "npm:@anthropic-ai/sdk"
// POST: { prompt, system?, max_tokens? }
// Model: claude-sonnet-4-6
// NOTE: @anthropic-ai/sdk is a Deno/Edge Function dependency only.
//       It is NOT in the React frontend package.json.
// Returns: { content, usage }
```

**`dispute-resolution`**:
```typescript
// POST: { dispute_id, order_timestamp, claimed_items[] }
// 1. Retrieve dispute from DB
// 2. Calculate CCTV timestamp window (order timestamp ± 5 minutes)
// 3. Call ai-query: "Generate a delivery platform dispute submission..."
// 4. Update dispute record with generated text
// 5. Return dispute text for owner review
```

**`margin-guardian`**:
```typescript
// Triggered by: ingredient price change OR CRON (daily)
// 1. Calculate margin for every menu item at current ingredient costs
// 2. Find items below threshold (from business_settings)
// 3. Call ai-query for price recommendation per flagged item
// 4. Insert to margin_alerts table
// 5. Call send-sms if any items flagged
```

**`daily-briefing`** (CRON: 10:45 AM daily):
```typescript
// Gathers:
//   - Yesterday's final revenue and profit (M03, M04)
//   - Today's prep recommendation (sales history + day of week + M18 events)
//   - Stock items below par level (M02)
//   - Staff absences logged for today (M07)
//   - Best performing item yesterday (M03)
//   - Today's weather + demand prediction
// Composes briefing text
// Calls send-sms to owner if not opened CoopOS by 10:45 AM
// Inserts to daily_briefings table
```

**`night-summary`** (CRON: 10:30 PM daily):
```typescript
// Gathers:
//   - Today's final revenue vs target
//   - Today's net profit
//   - Food cost %
//   - Waste cost
//   - Best selling item
//   - All platform ratings today
//   - Outstanding actions: uncompleted checklists, unresponded reviews, open disputes
//   - Tomorrow's weather and demand prediction
// Composes summary
// Calls send-email with daily report attachment
// Calls send-sms with summary to owner
// Inserts to night_summaries table
```

**`weather-check`** (CRON: 6:00 AM daily):
```typescript
// Calls OpenWeatherMap API for Hertford,UK
// Parses: temperature, condition, precipitation probability
// Generates demand prediction note:
//   Rain > 60%: "Rain forecast — expect 20-30% delivery uplift"
//   Temp > 22°C: "Warm day — suggest castle grounds social post"
//   Friday/Saturday: "Weekend — prepare for 40-60% volume increase"
// Stores in daily_weather table
```

**`health-score`** (called by M01 every 15 minutes):
```typescript
// Calculates 6 components from DB:
//   food_safety: null — excluded until SFBB integration built
//   revenue:     min(today_revenue / daily_target, 1.0) * 100
//   margin:      % of menu items above margin_alert_threshold
//   waste:       max(0, 1 - (today_waste_cost / (today_revenue * food_cost_pct))) * 100
//   platforms:   avg(all platform ratings) / 5.0 * 100
//   stock:       % of ingredients above par_level
//   staff:       % of staff with up-to-date Level 2 certs
//
// Redistributed weightings:
//   revenue:   0.2500
//   margin:    0.1875
//   waste:     0.1875
//   platforms: 0.1875
//   stock:     0.1250
//   staff:     0.0625
//
// score = (revenue * 0.25) + (margin * 0.1875) + (waste * 0.1875)
//       + (platforms * 0.1875) + (stock * 0.125) + (staff * 0.0625)
// color: score >= 75 → 'green', score >= 50 → 'amber', score < 50 → 'red'
// Returns: { score, components, food_safety_connected: false, color }
```

**`generate-report`** (called by M25 and M14):
```typescript
// POST: { type, period_start, period_end, modules_included[] }
// 1. Fetch all data for requested modules and period
// 2. Generate branded PDF
// 3. Upload to Supabase Storage reports/
// 4. Insert to generated_reports table
// 5. Return: { file_url, report_id }
```

Deploy all functions:
```bash
supabase functions deploy --no-verify-jwt <function-name>
```

---

### Step 37 — Wire AI Across Modules

| Module | AI feature |
|---|---|
| M01 | Health Score from `health-score` function (already wired in Phase 1) |
| M12 | Dispute form auto-populates from `dispute-resolution` function |
| M05 | Margin alerts populated by `margin-guardian` function |
| M14 | Auto-reports activate — M24 sends scheduled reports |
| M01 | Daily briefing and night summary cards show live data |
| M01 | `AIInsightCard.tsx` activates with real prep suggestions |

---

### Step 38 — M23 Franchise & Expansion

**Route:** `/franchise` | 6 components | Owner-only access (RoleGuard)

- Health Score calculated per location (each `locations` row runs `health-score` logic filtered by location)
- `MultiLocationDashboard.tsx` — side-by-side KPIs for all locations

---

### Step 39 — Real-time Subscriptions

Activate all Supabase real-time subscriptions:

```typescript
// M01
supabase.channel('dashboard')
  .on('postgres_changes', { table: 'daily_revenue_summary' }, handler)
  .on('postgres_changes', { table: 'waste_logs' }, handler)
  .subscribe()

// M12
supabase.channel('delivery')
  .on('postgres_changes', { table: 'platform_settings' }, handler)
  .subscribe()

// M08 — placeholder for future SFBB sync
supabase.channel('sfbb-integration') // wired when SFBB API built
```

Enable real-time on all 3 tables in Supabase Dashboard → Database → Replication.

---

### Step 40 — CRON Jobs

Set up in Supabase Dashboard → Edge Functions → Schedule (or via `pg_cron`):

| Function | Schedule (UTC) |
|---|---|
| `weather-check` | 06:00 AM daily |
| `daily-briefing` | 10:45 AM daily |
| `night-summary` | 10:30 PM daily |
| `generate-report` (daily) | 10:30 PM daily |
| `generate-report` (weekly) | 11:00 PM Sunday |
| `generate-report` (monthly) | 08:00 AM 1st of month |
| `margin-guardian` | 09:00 AM daily |

---

### Step 41 — README

Generate `README.md` at project root covering:
- Project overview (CoopOS, Crispy Coop, Hertford UK)
- Setup instructions (clone, npm install, env setup)
- All environment variables with descriptions
- Supabase setup steps (create project, run migrations, enable real-time)
- Edge Function deployment steps
- First-run seed data instructions (SOPs, menu items, ingredients, suppliers, overhead, platform settings, business settings)
- Build phase summary

---

## Phase Summary

| Phase | Steps | What gets built |
|---|---|---|
| **Phase 1 — Foundation** | 1–17 | Scaffold + DB + Auth + Design System + M16 + M01 + M08 + M10 + M02 + M06 |
| **Phase 2 — Operations** | 18–27 | M03 + M04 + M11 + M07 + M09 + M05 + M13 + M12 + M14 + M25 |
| **Phase 3 — Intelligence** | 28–35 | M24 + M17 + M21 + M19 + M20 + M22 + M18 + M15 |
| **Phase 4 — AI & Scale** | 36–41 | All Edge Functions + AI wiring + M23 + Real-time + CRON |

---

*CoopOS — Restaurant Operating System for Crispy Coop*  
*Hertford, UK · Built by Afzal Ahamed · MSc Software Engineering*
