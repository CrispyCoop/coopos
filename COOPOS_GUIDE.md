# CoopOS — Complete Guide
### Crispy Coop, Hertford | Restaurant Operating System

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Deployment Guide](#2-deployment-guide)
3. [Module Reference](#3-module-reference)
   - [M01 Dashboard](#m01-dashboard)
   - [M02 Stock Control](#m02-stock-control)
   - [M03 Sales & Sessions](#m03-sales--sessions)
   - [M04 Finance & P&L](#m04-finance--pl)
   - [M05 Cost Calculator](#m05-cost-calculator)
   - [M06 Wastage Log](#m06-wastage-log)
   - [M07 Rota & Staff](#m07-rota--staff)
   - [M08 Food Safety](#m08-food-safety)
   - [M09 Menu Manager](#m09-menu-manager)
   - [M10 SOP Library](#m10-sop-library)
   - [M11 Cash & Till](#m11-cash--till)
   - [M12 Delivery Hub](#m12-delivery-hub)
   - [M13 Overheads](#m13-overheads)
   - [M14 Reporting & Analytics](#m14-reporting--analytics)
   - [M15 System Hub](#m15-system-hub)
   - [M16 Settings](#m16-settings)
   - [M17 Customer Intelligence](#m17-customer-intelligence)
   - [M18 Market Intelligence](#m18-market-intelligence)
   - [M19 Suppliers](#m19-suppliers)
   - [M20 Equipment & Maintenance](#m20-equipment--maintenance)
   - [M21 Marketing Campaigns](#m21-marketing-campaigns)
   - [M22 Training](#m22-training)
   - [M23 Franchise Portal](#m23-franchise-portal)
   - [M24 Communications Engine](#m24-communications-engine)
   - [M25 Advanced Reports](#m25-advanced-reports)
4. [Edge Functions Reference](#4-edge-functions-reference)
5. [Testing Guide](#5-testing-guide)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. System Overview

CoopOS is a full-stack restaurant operating system built for Crispy Coop, Hertford UK. It covers every operational area of the business in a single web application.

**Tech Stack**
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (PIN-based login) |
| State | Zustand + TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDFs | @react-pdf/renderer (lazy-loaded) |
| Edge Functions | Supabase Edge Functions (Deno) |
| SMS | Twilio (via Edge Function) |
| Email | SendGrid (via Edge Function) |
| AI | Anthropic Claude Haiku (via Edge Function) |
| Weather | OpenWeatherMap API |

**25 Modules across 4 Phases**

| Phase | Modules | Focus |
|---|---|---|
| 1 | M01–M03, M06, M08, M10, M11, M16 | Core operations |
| 2 | M04, M05, M07, M09, M12, M13, M14 | Finance & team |
| 3 | M15, M17–M22, M24, M25 | Intelligence & comms |
| 4 | M23 + AI features + webhooks | Scale & automation |

**8 Edge Functions (Deno — Supabase serverless)**
- `daily-briefing` — AI morning briefing (cron, 06:00)
- `demand-forecast` — 7-day revenue forecast
- `smart-rota` — AI shift suggestions
- `send-sms` — Twilio SMS sender
- `send-email` — SendGrid email sender
- `generate-report` — AI executive briefing
- `bland-webhook` — Voice AI order receiver
- `stripe-webhook` — Payment event processor

---

## 2. Deployment Guide

### 2.1 Prerequisites

- Node.js 18+ installed
- Supabase CLI installed: `npm install -g supabase`
- A Supabase account (free tier works for development)
- Optional but recommended: Vercel or Netlify account for hosting

### 2.2 Clone and Install

```bash
cd CoopOS
npm install
```

### 2.3 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Name it `coopos-production` (or similar)
3. Choose region closest to UK: **EU West (Ireland)**
4. Set a strong database password and save it
5. Wait for the project to provision (~2 minutes)

### 2.4 Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in: Supabase dashboard → Settings → API

### 2.5 Run Database Migrations

In Supabase dashboard → SQL Editor, run each migration file **in order**:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_food_safety.sql
supabase/migrations/003_sales_finance.sql
supabase/migrations/004_staff_rota.sql
supabase/migrations/005_menu_stock.sql
supabase/migrations/006_customers.sql
supabase/migrations/007_marketing.sql
supabase/migrations/008_equipment.sql
supabase/migrations/009_rls_policies.sql
supabase/migrations/010_phase4.sql
supabase/migrations/011_schema_fixes.sql
```

Paste each file's contents into the SQL editor and click Run. Do them one at a time in order.

### 2.6 Run Seed Data

After all migrations succeed, run the seed file:

```
supabase/seed.sql
```

This populates:
- 19 business settings (name, targets, VAT number, commission rates)
- 4 suppliers (Brakes, Bidfood, Alliance, Bunzl)
- 35 ingredients with par levels and stock quantities
- 27 menu items across all categories
- 10 SOPs with full step-by-step content
- 19 overhead items
- 13 equipment records
- 5 staff members
- 7 local events
- 3 launch promo codes

### 2.7 Deploy Edge Functions

Install the Supabase CLI and link your project:

```bash
supabase login
supabase link --project-ref your-project-ref
```

Deploy all 8 functions:

```bash
supabase functions deploy daily-briefing
supabase functions deploy demand-forecast
supabase functions deploy smart-rota
supabase functions deploy send-sms
supabase functions deploy send-email
supabase functions deploy generate-report
supabase functions deploy bland-webhook
supabase functions deploy stripe-webhook
```

### 2.8 Set Edge Function Secrets

In Supabase dashboard → Settings → Edge Functions → Secrets, add:

| Secret Name | Value | Required For |
|---|---|---|
| `ANTHROPIC_API_KEY` | Your Claude API key | daily-briefing, demand-forecast, smart-rota, generate-report |
| `TWILIO_ACCOUNT_SID` | Your Twilio account SID | send-sms |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token | send-sms |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | send-sms |
| `SENDGRID_API_KEY` | Your SendGrid API key | send-email |
| `SENDGRID_FROM_EMAIL` | Verified sender email | send-email |
| `SENDGRID_FROM_NAME` | Sender display name | send-email |
| `OPENWEATHERMAP_API_KEY` | Your OWM API key | demand-forecast |
| `BLAND_WEBHOOK_SECRET` | Secret from Bland AI dashboard | bland-webhook |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe | stripe-webhook |

The AI features (demand forecast, smart rota, daily briefing) only require `ANTHROPIC_API_KEY`. SMS and email can be skipped until those channels are needed. Bland AI and Stripe are optional until Phase 4 is activated.

### 2.9 Configure Daily Briefing Cron Job

In Supabase dashboard → Database → Cron Jobs → New Cron Job:

- **Name:** `daily-briefing`
- **Schedule:** `0 6 * * *` (runs at 06:00 every day)
- **Command:**
```sql
SELECT net.http_post(
  url := 'https://your-project-ref.supabase.co/functions/v1/daily-briefing',
  headers := '{"Authorization": "Bearer your-service-role-key", "Content-Type": "application/json"}'::jsonb,
  body := '{}'::jsonb
);
```

Replace `your-project-ref` and `your-service-role-key` (found in Settings → API → service_role key).

### 2.10 Configure External Webhooks

**Bland AI (Voice Orders)**
1. In Bland AI dashboard → Pathways → Your pathway → Settings
2. Set Webhook URL to: `https://your-project-ref.supabase.co/functions/v1/bland-webhook`
3. Set webhook secret and add the same value as `BLAND_WEBHOOK_SECRET`

**Stripe (Payments)**
1. In Stripe dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
3. Events to listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the signing secret and add as `STRIPE_WEBHOOK_SECRET`

### 2.11 Create First User Account

1. In Supabase dashboard → Authentication → Users → Invite user
2. Enter the owner's email and send invite
3. User follows email link to set password
4. In SQL Editor, insert a profile row:

```sql
INSERT INTO profiles (id, email, name, role)
VALUES (
  'cd9fa537-8394-48e2-bc2c-866a2bf8de72',  -- copy from Auth → Users tab
  'ahamedafzal45@gmail.com',
  'Ahamed Afzal',
  'owner'
);
```

### 2.12 Deploy Frontend

**Option A — Vercel (recommended)**

1. Push code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import repository
3. Framework: Vite
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Click Deploy

**Option B — Netlify**

1. Build the project: `npm run build`
2. Drag the `dist/` folder into [netlify.com/drop](https://app.netlify.com/drop)
3. Or connect GitHub repo and add env vars in Site Settings → Environment

**Option C — Local / LAN**

For use only within the restaurant on a local network:

```bash
npm run build
npm run preview
```

Access from any device on the same WiFi at `http://your-computer-ip:4173`

---

## 3. Module Reference

---

### M01 Dashboard

**Purpose:** Real-time overview of the business — revenue, health score, briefing, and quick actions.

**How to Use**

The dashboard loads automatically on login. It shows data for today by default. Use the date selector in the top bar to review any past day.

- **Live Revenue Ticker** — Shows today's total revenue updating in near real-time from `daily_revenue_summary`
- **Target Gauge** — Circular progress against the daily revenue target (set in M16 Settings)
- **Profit Indicator** — Estimated net profit after food cost (38%) and labour (28%)
- **Health Score Card** — Composite score from: revenue vs target, food safety compliance, stock levels, open complaints
- **Weekly Sparkline** — Bar chart of the last 7 days revenue
- **Daily Briefing Card** — AI-generated morning summary (generated at 06:00 by cron). Shows yesterday's performance, today's outlook, and any flags
- **Night Summary** — End-of-day summary card (populated by M01 or manual entry)
- **AI Insight Card** — On-demand AI insight based on current day's data
- **Quick Actions** — Shortcut buttons to common tasks (Open Session, Count Till, Log Waste)
- **Weather Widget** — Live Hertford weather with demand impact note
- **Alert Panel** — Active alerts: low stock items, overdue equipment services, failed temperature checks

**How to Test**

1. Log in → dashboard loads with today's date
2. Verify revenue ticker shows £0.00 (no sessions yet) — no error
3. Navigate to M03 Sales, open a session, record a sale of £10
4. Return to dashboard — revenue ticker should update to £10.00
5. Set daily target in M16 Settings → Target Gauge should reflect it
6. Check Daily Briefing Card: before 06:00 it shows "No briefing yet"; after the cron runs it shows AI text
7. Manually trigger the briefing: POST to `daily-briefing` function URL (see Edge Functions section)

---

### M02 Stock Control

**Purpose:** Manage ingredient inventory — levels, deliveries, adjustments, and movement history.

**How to Use**

**Ingredients tab**
- View all ingredients with current stock, par level, and supplier
- Items below par level are highlighted in red
- Click an ingredient to edit name, category, unit cost, par level, or supplier
- Click **+ Add Ingredient** to create a new one

**Deliveries tab**
- Click **+ Log Delivery** to record a supplier delivery
- Select supplier, enter delivery note reference, add line items (ingredient + quantity received + actual cost)
- Stock levels update automatically when a delivery is saved

**Stock Adjustments tab**
- Use for corrections, spot counts, or write-offs
- Select ingredient, enter actual quantity on hand, select reason (adjustment / waste / correction)
- A stock movement record is created for audit trail

**Movement Log tab**
- Full history of all stock changes: deliveries, adjustments, waste, sale depletion
- Filterable by ingredient or movement type

**How to Test**

1. Seed data already added 35 ingredients — navigate to Stock Control, verify they appear
2. Add a new ingredient: click **+ Add Ingredient**, fill in "Test Sauce", category "sauce", unit "litre", cost £2.00, par level 5
3. Log a delivery: select Brakes supplier, add 10kg Chicken Thighs received at £2.85/kg — verify stock level increases
4. Make a stock adjustment: set Chicken Thighs to 8kg — verify movement log shows an "adjustment" entry
5. Check that items below par level appear with a red indicator
6. Delete test ingredient when done

---

### M03 Sales & Sessions

**Purpose:** Record sales by channel throughout the day. Each trading day runs inside a "session."

**How to Use**

**Starting a session**
1. Click **Open Session** (or use Quick Actions on dashboard)
2. The session begins and the date is locked to today

**Recording sales**
- Click **+ Add Sale**
- Enter item name, quantity, price, and select the channel (walk-in / deliveroo / ubereats / justeat / phone / app)
- Each sale appears on the Live Sales Board in real-time

**During service**
- Live Sales Board shows a running total per channel
- Sales by Channel donut chart shows the channel split
- Sales Stats cards show total revenue, order count, and average order value

**Closing a session**
1. Click **Close Session** at end of trading
2. Confirm the closing revenue figure
3. The session total is written to `daily_revenue_summary`

**Reviewing history**
- Sales History tab shows all past sessions with date and total
- Click any session to see its individual sales records

**How to Test**

1. Click **Open Session** — verify session start time appears
2. Add 3 sales: "2 Piece Meal" × 1 @ £7.99 (walk-in), "Wings" × 1 @ £5.99 (deliveroo), "Burger" × 1 @ £5.99 (ubereats)
3. Verify Live Sales Board shows £19.97 total across 3 channels
4. Check Sales by Channel donut shows 3 slices
5. Close session — verify it appears in Sales History
6. Return to Dashboard — revenue ticker should show £19.97

---

### M04 Finance & P&L

**Purpose:** Track all financial transactions — income, expenses, VAT liability, and daily P&L.

**How to Use**

**Overview tab**
- Shows month-to-date income, expenses, net P&L, and VAT estimate
- DonutChart breaks down expenses by category
- Daily P&L: pick any date to see revenue vs costs vs estimated net profit

**Transactions tab**
- Click **+ Add Transaction** to log income or expense
- Types: Income / Expense
- Categories: food_cost, labour, rent, utilities, marketing, equipment, other
- Add description, amount, date, and optional receipt reference
- Search and filter the transaction log by type

**P&L tab**
- Monthly income vs expenses comparison
- Variance alert fires if monthly income is more than 5% below target

**VAT tab**
- Quarterly VAT tracker
- Output VAT (20% of income) vs input VAT (20% of expenses)
- Net VAT due — use this to prepare your VAT return

**How to Test**

1. Add an income transaction: £500, category "other", description "Test income", today's date
2. Add an expense transaction: £150, category "food_cost", description "Test food purchase"
3. Verify Overview tab shows: Income £500, Expenses £150, Net P&L £350
4. Check VAT tab: Output VAT should be £100, Input VAT £30, Net due £70
5. Open Daily P&L: select today — verify it shows revenue from M03 session + the transactions
6. Delete test transactions when done

---

### M05 Cost Calculator

**Purpose:** Calculate food cost and profit margin for any combination of ingredients. Optimise menu pricing.

**How to Use**

**Calculator tab**
- Type an ingredient name in the search box — dropdown shows matches
- Select ingredient, enter quantity used (with +/- buttons for precision)
- Add more ingredients to build up a recipe
- Enter the selling price — live margin % appears instantly
- Green = healthy margin (>65%), Amber = borderline (50–65%), Red = poor (<50%)
- Save the recipe to attach it to a menu item

**Menu Cost Table tab**
- Shows every menu item with its linked food cost, selling price, and margin
- Sortable by margin (ascending to find worst performers), food cost, or price
- Items with margin below target appear highlighted

**Price Optimiser tab**
- Enter a food cost and target margin percentage
- Calculates the minimum selling price needed to hit that margin
- Use this when setting new menu prices or reviewing after ingredient cost changes

**Margin Guardian tab**
- Lists any menu items where the current margin has dropped below the threshold
- Fires an alert when ingredient cost changes push an item below the target

**How to Test**

1. Go to Calculator → search "Chicken Thigh" → add 0.25 kg
2. Search "Fries" → add 0.15 kg
3. Search "Meal Box (large)" → add 1 each
4. Enter selling price £7.99 — verify food cost and margin calculate correctly
5. Price Optimiser: enter food cost £2.50, target margin 70% → should suggest £8.33
6. Menu Cost Table: verify seeded menu items appear with costs (requires ingredients linked to menu items)

---

### M06 Wastage Log

**Purpose:** Record food waste by ingredient and reason. Track waste trends and cost impact.

**How to Use**

**Log Waste tab**
- Click **+ Log Waste**
- Select ingredient, enter quantity wasted, select reason (spoilage / prep waste / overcooked / dropped / other)
- Enter date and optional notes
- The cost impact is calculated automatically from the ingredient's `cost_per_unit`

**Waste by Reason tab**
- Donut chart showing waste split by reason
- Helps identify whether waste is a prep, storage, or cooking problem

**Waste Trend tab**
- Line chart of daily waste cost over the last 30 days
- Use to spot patterns (e.g. Monday waste spikes from weekend over-ordering)

**Waste Log tab**
- Full table of all waste entries with date, ingredient, quantity, reason, and cost

**Waste Stats**
- Total waste cost this week and this month
- Waste as % of revenue (target: under 2%)

**How to Test**

1. Log waste: select "Chicken Thighs (bone-in)", quantity 0.5 kg, reason "spoilage", today
2. Verify waste log shows the entry with cost = 0.5 × £2.85 = £1.43
3. Log another entry with a different reason
4. Check Waste by Reason donut shows 2 slices
5. Check Waste Stats shows a non-zero weekly total

---

### M07 Rota & Staff

**Purpose:** Build weekly rotas, manage staff records, log absences, record wage payments, and use AI to forecast demand and suggest shifts.

**How to Use**

**Weekly Rota tab**
- The rota grid shows staff members as rows and the 7 days of the current week as columns
- Click **+ New Week** to create a rota for a specific week
- Click any cell or column header to open the Shift Form
- Fill in staff member, start time, end time, and role (kitchen / counter / closing)
- Hover over a shift to see a delete button
- Labour Cost Trend chart shows labour cost per week over recent history

**AI Forecast tab** *(requires Anthropic API key)*
- Select a week start date (defaults to next Monday)
- Click **Generate Forecast** — Claude Haiku analyses 8 weeks of history, weather, and local events
- A 7-day bar chart + day-by-day table shows predicted revenue, order count, and confidence level
- Once a forecast is generated, the **Smart Rota** panel appears below
- Click **Suggest Rota** — Claude generates a full week of shifts matched to the forecast demand
- Review the suggested shifts, then click **Apply to Rota Grid** to write them to the database

**Staff tab**
- Lists all active staff with role and hourly rate
- Click **+ Add Staff** to create a new staff member
- Click any staff member to edit their details
- Toggle "Active" to remove from rota without deleting

**Absences tab**
- Click **+ Log Absence** to record a planned or sick absence
- Fields: staff member, date, type (planned / sick / emergency), reason, and cover staff
- Absence log shows upcoming absences sorted by date

**Wages tab**
- Click **+ Log Payment** to record a wage payment
- Select staff member — hourly rate auto-fills
- Enter hours worked and payment date
- The amount calculates automatically (hours × rate)
- Wage payment history shown in table below

**How to Test**

1. Verify seeded staff appear: Ahamed, Fatima, Omar, Aisha, Yusuf
2. Create a new rota week for next week
3. Add a shift: Fatima, Monday, 11:30–18:00, kitchen
4. Add another: Omar, Monday, 14:00–21:30, counter
5. Verify both shifts appear in the rota grid
6. Log an absence: Aisha, any day this week, sick
7. Log a wage payment: select Fatima, 30 hours — verify amount = 30 × £11.44 = £343.20
8. AI Forecast (requires API key): select next Monday → Generate Forecast → verify 7 days appear
9. Smart Rota: click Suggest Rota → review shifts → Apply — verify they appear in the rota grid

---

### M08 Food Safety

**Purpose:** Log temperature checks, pest control visits, and food safety audits. Maintain EHO compliance records.

**How to Use**

**Temperature Logs tab**
- Click **+ Log Temperature** to record a check
- Fields: check type (fridge_1 / fridge_2 / freezer / cooked_chicken / holding / delivery), temperature, and optional notes
- The system auto-determines pass/fail: fridges must be 1–4°C, freezers -18°C or below, cooked food 75°C+
- Failed checks appear with a red badge and trigger an alert on the dashboard

**Pest Control tab**
- Click **+ Log Visit** to record a pest control contractor visit
- Fields: contractor name, visit date, outcome (clear / treated / follow-up required), and notes
- Upcoming visits can be scheduled with a next visit date

**Audits tab**
- Log internal food safety audits with a score out of 100
- Track trend of audit scores over time
- Record any corrective actions required

**How to Test**

1. Log a passing temperature check: "fridge_1", 3°C → badge shows PASS
2. Log a failing temperature check: "fridge_2", 9°C → badge shows FAIL, red colour
3. Return to dashboard → Alert Panel should show the failed temperature check
4. Log a pest control visit: Pest-Stop, today, outcome "clear"
5. Verify all entries appear in their respective logs

---

### M09 Menu Manager

**Purpose:** Manage all menu items — prices, categories, food costs, and allergen information.

**How to Use**

**Menu Items tab**
- Full list of all menu items with category, price, and active status
- Search by name or filter by category
- Click any item to open its detail view

**Item Detail view**
- Shows the item's selling price and linked recipe ingredients
- Food cost is calculated from the ingredient costs × quantities in the recipe
- Margin percentage shown — colour coded green/amber/red
- Click **Manage Allergens** to go to the allergen panel for this item

**Allergen Panel**
- 14 allergen columns (gluten, dairy, eggs, nuts, peanuts, etc.)
- Toggle "Contains" or "May Contain" for each allergen
- Changes save immediately — no submit button needed
- This matrix feeds into M25 Allergen Report PDF

**Add/Edit Item**
- Click **+ Add Item** to create a new menu item
- Enter name, category, price, description
- After creating, link ingredients via the Cost Calculator (M05)

**Categories tab**
- View and manage menu categories
- Reorder or rename categories

**How to Test**

1. Verify 27 seeded menu items appear
2. Click "2 Piece Meal" → verify detail view loads
3. Click **Manage Allergens** → set gluten = Contains (chicken is coated in flour)
4. Set dairy = May Contain
5. Return to item list → open another item → allergen changes should be isolated to each item
6. Add a new menu item: "Test Wrap", category "burgers", price £4.99
7. Verify it appears in the list with active status
8. Delete test item

---

### M10 SOP Library

**Purpose:** Manage Standard Operating Procedures. Staff read and acknowledge SOPs. Track compliance.

**How to Use**

**SOP List**
- All SOPs listed with reference code, title, group, and status
- Filter by group (food_safety, kitchen, hr, customer, delivery, emergency, etc.)
- Click any SOP to open the full viewer

**SOP Viewer**
- Full SOP displayed with step-by-step instructions
- Staff click **Acknowledge** to sign off — name and timestamp recorded
- Version history shows previous versions of the SOP

**SOP Form** *(manager/owner only)*
- Click **+ New SOP** to create a new procedure
- Enter reference (e.g. FS-005), title, group, purpose, and steps
- Each step has an order number and action text
- Publish immediately or save as draft

**Stats**
- Total SOPs, active count, acknowledgement rate this month
- Shows which SOPs have low acknowledgement rates

**SOP Seeder**
- One-time tool to import the standard SOP library from the seed template
- Only needed if seed.sql was not run

**How to Test**

1. Verify 10 seeded SOPs appear (FS-001 through EMER-001)
2. Click "FS-001 Temperature Check Procedure" → verify all 6 steps display
3. Click **Acknowledge** → confirm your name appears in the acknowledgement log
4. Create a new SOP: reference "TEST-001", title "Test Procedure", group "kitchen", add 2 steps
5. Verify it appears in the list with status "active"
6. Delete the test SOP

---

### M11 Cash & Till

**Purpose:** Count the till at end of service, reconcile against EPOS, and log platform payouts.

**How to Use**

**Till Counts tab**
- Click **+ Count Till** to start a till count
- Enter the denomination breakdown — 12 denominations from 1p to £50
- The total calculates automatically as you type
- Enter the EPOS cash total from your POS system
- Variance is calculated and colour-coded: green (<£1), amber (<£5), red (£5+)
- Add notes and submit

**Till Log**
- History of all till counts with date, total cash, EPOS total, and variance
- Useful for spotting persistent discrepancies

**Platform Payouts tab**
- Click **+ Log Payout** to record a delivery platform payment
- Select platform (Deliveroo / Uber Eats / Just Eat / Foodhub / GoGetter)
- Enter the period dates, gross revenue from the platform, commission rate, and net payout received
- Variance is shown between expected and actual payout
- Also accessible from M12 Delivery Hub (Payout Reconciliation tab reuses this view)

**Cash Stats**
- Today's till count variance
- Last count summary
- Average absolute variance across all counts

**How to Test**

1. Click **+ Count Till**
2. Enter: £50 notes = 2, £20 notes = 3, £10 notes = 1, £5 notes = 2, coins to make up ~£140 total
3. Enter EPOS cash total as £138.50
4. Verify variance shows £1.50 (amber)
5. Log a platform payout: Deliveroo, last week, gross £450, commission 30%, net payout £315
6. Verify expected payout = £450 × (1 - 0.30) = £315, variance = £0

---

### M12 Delivery Hub

**Purpose:** Manage all delivery platform operations — active listings, disputes, ratings, and payout reconciliation.

**How to Use**

**Overview tab**
- Shows all active delivery platforms with status and current rating
- Click **+ Add Platform** to register a new platform profile

**Disputes tab**
- Click **+ Log Dispute** to record a disputed order
- Fields: platform, order reference, dispute amount, reason (missing_item / wrong_order / late / quality / other)
- Track dispute status: open / submitted / won / lost
- Won disputes show the refunded amount

**Ratings tab**
- Log your platform rating for each week
- Track rating trend over time per platform

**Payout Reconciliation tab**
- Shows platform payouts from M11 (shared view)
- Compare expected vs received payments across all platforms

**How to Test**

1. Add a platform: Deliveroo, status active, current rating 4.7
2. Log a dispute: Deliveroo, order ref #DEL123, £8.99 disputed, reason "missing_item", status "open"
3. Update dispute status to "won" — verify won amount appears
4. Log a rating: Deliveroo, 4.8, this week
5. Check Payout Reconciliation tab — previous till log payouts should appear here too

---

### M13 Overheads

**Purpose:** Track all fixed and variable overheads. See the true monthly cost base. Analyse labour.

**How to Use**

**Overview tab**
- Summary stats: total monthly overhead, biggest category, and overhead as % of revenue
- Donut chart breaks overheads by category
- Three stat cards: total monthly, top category, and monthly overhead per day

**Overhead Items tab**
- Full list of all overhead items with frequency and monthly-equivalent cost
- All amounts are normalised to monthly: daily × 30.44, weekly × 4.33, annual ÷ 12
- Click **+ Add Overhead** to add a new fixed cost
- Click any item to edit or deactivate it

**Wages tab**
- Consolidated view of all wage payments logged in M07
- Shows total labour cost per month

**How to Test**

1. Verify 19 seeded overhead items appear (rent, utilities, insurance, etc.)
2. Total monthly overhead should be approximately £5,400/month based on seeded data
3. Add a new overhead: "CoopOS Subscription", category "admin", £99/month
4. Verify it appears in the list and the monthly total updates
5. Delete the test overhead item

---

### M14 Reporting & Analytics

**Purpose:** KPI dashboard, custom report builder, and auto-generated scheduled reports.

**How to Use**

**KPI Dashboard tab**
- Revenue trend bar chart — configurable: 7, 14, or 30 days
- Key KPI cards: revenue, orders, AOV, and estimated profit
- Comparison vs same period last week

**Auto Reports tab**
- Generates a summary report for the current month automatically
- Shows revenue by day, transaction count, and total income/expenses
- Download as CSV

**Report Builder tab**
- Select a date range and choose which metrics to include
- Available metrics: total_revenue, total_orders, avg_order_value, total_expenses, net_profit
- Results shown in a dynamic table
- Download as CSV

**How to Test**

1. Open KPI Dashboard — verify revenue trend chart loads (may show zeros if no session data yet)
2. Record some sales in M03 first, then return — chart should show data
3. Auto Reports: click Generate — verify this month's data appears in the table
4. Download CSV — verify it opens correctly in Excel/Sheets
5. Report Builder: set date range to last 30 days, select all metrics, click Generate

---

### M15 System Hub

**Purpose:** View status of all connected systems, AI features, and business configuration.

**How to Use**

**Connected Systems section**
- Shows 12 integrated systems (Supabase, Twilio, SendGrid, Claude, OpenWeatherMap, delivery platforms, EPOS, Stripe)
- Status indicators: Online (green) / Configured (blue) / Manual (grey) / Phase 4 (purple)
- Grey = integrated manually (data entered in the app, not auto-synced via API)

**AI Feature Status section**
- Lists 6 AI features with live / Phase 3 / Phase 4 status
- Active features: Daily Briefing Generator, Margin Guardian Alerts
- Shows metric for each feature (how it triggers, how often it runs)

**Business Configuration section**
- Grid view of all `business_settings` key-value pairs
- Managed in detail through M16 Settings

**How to Test**

1. Navigate to System Hub — all 12 systems should appear with correct status badges
2. Verify AI Features section shows Daily Briefing as "Live" and Voice AI as "Phase 4"
3. Business Configuration should show all 19 seeded settings as a grid

---

### M16 Settings

**Purpose:** Configure all business-level settings — targets, branding, integrations, notifications, and user management.

**How to Use**

**Business Settings tab**
- Edit business name, address, phone, email, and VAT number
- All changes save to the `business_settings` key-value table

**Targets tab**
- Daily revenue target (default: £419)
- Weekly revenue target
- Food cost target % (default: 38%)
- Labour cost target % (default: 28%)
- These targets drive the dashboard gauge and variance alerts

**User Management tab**
- List all users (from `profiles` table)
- Change a user's role: owner / manager / staff
- Roles control which modules and actions are accessible via Row Level Security

**Integrations tab**
- View integration status
- Note: API keys are NEVER stored in the app. They are set in Supabase Edge Function secrets only.

**Notifications tab**
- Configure which alerts are active
- SMS / email notification preferences

**Branding tab**
- Business logo, colour preferences
- Receipt footer text

**Data Export tab**
- Export any table as CSV
- Available exports: sales records, transactions, staff, customers, complaints

**How to Test**

1. Change daily revenue target to £500 → return to dashboard → gauge should reflect £500
2. Change food cost target to 35% → verify Profit Indicator on dashboard updates
3. Change it back to £419 / 38% after testing
4. Add a test user (if you have a second email): invite → assign role "staff"
5. Log in as staff user — verify they cannot access Finance or Settings modules

---

### M17 Customer Intelligence

**Purpose:** Customer database, segmentation, VIP tracking, churn risk management, and complaint logging.

**How to Use**

**All Customers tab**
- Complete customer list ordered by lifetime value (highest first)
- Search by name, phone, or email
- Columns: name, phone, segment, order count, lifetime value, avg order value, last order date, loyalty points
- Customer data is populated automatically from the ordering app (not CoopOS itself)

**Segments tab**
- Count cards for each segment: new, regular, lapsed, high_value, at_risk, vip
- Segments are assigned by the ordering app based on order frequency and recency

**VIPs tab**
- Filtered view showing only vip and high_value segment customers
- Use for targeted campaigns (send to M24 Communications)

**Churn Risk tab**
- Customers in "lapsed" or "at_risk" segments
- Use for win-back SMS/email campaigns (send to M24)

**Complaints tab**
- Click **+ Log Complaint** to record a customer complaint manually
- Categories: food_quality, order_accuracy, wait_time, delivery, customer_service, other
- Optional order reference field for linking to a specific order
- Complaint type summary cards show the breakdown at a glance
- Resolution field can be updated when a complaint is resolved

**How to Test**

1. Log a complaint: type "food_quality", order ref "#1234", description "Chicken was undercooked"
2. Verify it appears in the complaints table with "Pending" resolution badge
3. Log a second complaint: type "wait_time"
4. Verify the summary cards show: food_quality = 1, wait_time = 1
5. Customers tab will be empty until the ordering app populates it — expected behaviour

---

### M18 Market Intelligence

**Purpose:** Track competitor activity, log local events that affect demand, and monitor search/platform rankings.

**How to Use**

**Competitors tab**
- Click **+ Log Observation** to record something you've noticed about a competitor
- Fields: competitor name, observation type (price_change / new_product / promotion / closure / new_opening / other), date, description
- Use this to track what Roosters, KFC, and other local chicken shops are doing

**Local Events tab**
- Click **+ Add Event** to log an upcoming event in Hertford
- Fields: event name, date, demand impact (high / medium / low)
- High-impact events (festivals, market days) should be logged in advance
- The demand forecast Edge Function reads this table to adjust its predictions

**Rankings tab**
- Click **+ Log Ranking** to record your search position
- Platforms: Google, Deliveroo, Uber Eats
- Enter the search term (e.g. "fried chicken Hertford") and your position
- Track weekly to see if SEO and platform optimisation is working
- Position 1–3 shows green, 4–10 shows amber, 11+ shows red

**How to Test**

1. Log a competitor observation: "Roosters", type "promotion", description "50% off Tuesdays offer spotted"
2. Add a local event: "Hertford Market Day", next Tuesday, impact "medium"
3. Log a ranking: Google, "fried chicken hertford", position 4 → verify amber colour
4. Log another: Deliveroo, "crispy chicken", position 1 → verify green colour
5. Verify events added here feed into the AI Forecast (next time you generate one)

---

### M19 Suppliers

**Purpose:** Manage supplier profiles, log purchase orders, and track ingredient price changes.

**How to Use**

**Suppliers tab**
- Full list of all suppliers with contact details and delivery schedule
- Click any supplier to open their profile view
- Supplier Profile shows: contact info, all linked ingredients, and recent deliveries

**Click a supplier to see:**
- Contact details and account information
- Which ingredients they supply (from `ingredients.supplier_id`)
- Delivery history for this supplier
- Edit button to update contact details

**Price History tab**
- Automatic log of price changes when delivery costs differ from recorded `cost_per_unit`
- Shows old price, new price, and % change
- Red badge = price increase, green badge = price decrease

**Purchase Orders tab**
- Click **+ New Purchase Order** to create a PO
- Select supplier, add line items (ingredient + quantity + unit cost)
- Running total updates as items are added
- Status workflow: draft → sent → received / partial / cancelled
- When status is set to "received", stock levels should be updated manually via M02

**How to Test**

1. Verify 4 seeded suppliers appear: Brakes, Bidfood, Alliance, Bunzl
2. Click "Brakes" → verify supplier profile shows their linked ingredients
3. Create a purchase order: select Brakes, add 20kg Chicken Thighs @ £2.85, 10kg Chicken Wings @ £3.10
4. Verify PO total = (20 × 2.85) + (10 × 3.10) = £57.00 + £31.00 = £88.00
5. Change PO status to "sent"
6. Price History: manually update Chicken Thighs cost_per_unit to £3.00 in M02 → a price history record should be created

---

### M20 Equipment & Maintenance

**Purpose:** Register all equipment, schedule and log services, record repairs, and track warranties.

**How to Use**

**Equipment tab**
- Full register of all kitchen and POS equipment
- Next service date is colour-coded: red = overdue, amber = due within 14 days, green = ok
- Warranty expiry similarly colour-coded
- Click **+ Add Equipment** to register a new item
- Service alerts appear above the tabs for any overdue items

**Service History tab**
- Log a service visit: click **+ Log Service**
- Select equipment, enter date, provider/engineer name, cost, and notes
- Keeps a complete audit trail of all maintenance visits

**Repairs tab**
- Click **+ Log Repair** to record a breakdown or repair
- Fields: equipment, date, issue description, cost, notes
- Separate from scheduled services — repairs are unplanned

**How to Test**

1. Verify 13 seeded equipment items appear
2. Click **+ Add Equipment**: "Test Microwave", category "cooking", purchase cost £150, next service "2024-01-01" (past date)
3. Verify a red "service overdue" alert appears above the tabs
4. Log a service: select Test Microwave, today's date, provider "ABC Engineers", cost £75
5. Update Test Microwave's next service date to 6 months from now — alert should disappear
6. Log a repair: Test Microwave, description "Door seal replaced", cost £35
7. Delete Test Microwave

---

### M21 Marketing Campaigns

**Purpose:** Plan and track marketing campaigns, manage promo codes, and log flyer distributions.

**How to Use**

**Campaigns tab**
- Click **+ New Campaign** to plan a marketing campaign
- Fields: name, objective (awareness / sales / retention / launch / other), start date, end date, budget
- Status lifecycle: planned → active → completed / paused / cancelled
- Status is updated manually — no automatic transitions

**Promo Codes tab**
- Click **+ Add Promo Code** to create a discount code
- Discount types: Percentage %, Fixed amount £, Free item
- Set minimum order value, expiry date, and maximum number of uses
- Code is automatically uppercased
- Expiry date shown in red if expired, green if still valid
- Redemption count tracks how many times the code has been used (updated by the ordering app)

**Flyers tab**
- Click **+ Log Flyers** to record a physical flyer distribution
- Fields: distribution area, quantity, date, and optional promo code used
- Useful for tracking offline marketing ROI

**How to Test**

1. Verify 3 seeded promo codes appear: CRISPY10, NEWCOOP, FIRSTORDER
2. Create a campaign: "Summer Push 2026", objective "sales", start today, budget £200
3. Add a promo code: "SUMMER20", percentage discount 20%, min order £15, expiry 3 months from now
4. Set an expired promo code: "OLDCODE", percentage 5%, expiry set to yesterday → verify it shows red expiry badge
5. Log a flyer distribution: area "Hertford Town Centre", quantity 500, date today, code "CRISPY10"

---

### M22 Training

**Purpose:** Track staff training, SOP acknowledgements, knowledge assessments, and training records.

**How to Use**

**SOP Signoffs tab**
- Matrix view: SOPs as rows, staff members as columns
- Green tick = signed off, empty = not yet signed
- Progress bar per SOP shows compliance percentage
- Colour-coded: red <50%, amber 50–79%, green 80%+
- First column (SOP name) is sticky for scrolling
- Shows first 15 SOPs

**Training Records tab**
- Log external training completions: food hygiene certificates, first aid, allergen awareness
- Fields: staff member, training type, provider, date completed, expiry date
- Expiry dates highlighted in red when approaching

**Assessments tab**
- Log knowledge assessment results
- Fields: staff member, date, correct answers, total questions
- Pass/fail shown with score percentage

**How to Test**

1. Navigate to SOP Signoffs — verify SOPs appear as rows and seeded staff as columns
2. All cells should be empty initially (no signoffs yet)
3. Go to M10 SOP Library → open any SOP → click Acknowledge
4. Return to M22 Training → SOP Signoffs → verify a green tick appears for your user
5. Log a training record: Fatima, "Level 2 Food Hygiene", provider "Highfield", expiry 5 years from now
6. Log an assessment: Omar, 8 correct out of 10 → verify 80% score, PASS badge

---

### M23 Franchise Portal

**Purpose:** Manage multiple Crispy Coop sites, compare performance benchmarks, and distribute SOPs across the network.

**How to Use**

**Overview tab**
- Card view of all registered franchise sites with name, city, and status
- Stats bar shows: total sites, active sites, network revenue (MTD), avg labour %

**Sites tab**
- Click **+ Add Site** to register a new location
- Fields: site name, city, phone, opening date, status (setup / active / paused / closed)
- Site status lifecycle: setup → active → paused / closed

**Benchmarking tab**
- Network performance table: period, site, revenue, labour %, food cost %, net margin %
- Benchmark data is submitted by each site monthly (via the `franchise_benchmarks` table)
- In a fully connected multi-site deployment, each site's CoopOS instance would sync data here automatically

**SOP Distribution tab**
- Shows the complete active SOP library from the master Hertford instance
- In a multi-site deployment, SOPs from here would be pushed to all connected sites
- Master badge shown on each SOP

**How to Test**

1. Click **+ Add Site**: "Crispy Coop Ware", city "Ware", status "setup"
2. Verify it appears in the Overview cards and Sites table
3. Stats should show: Total Sites = 1, Active Sites = 0 (status is "setup")
4. Update status to "active" → Active Sites stat should increment
5. SOP Distribution tab: verify all 10 seeded SOPs appear with "Master" badge

---

### M24 Communications Engine

**Purpose:** Send SMS and email to customers via Twilio and SendGrid. Template library for common messages.

**How to Use**

**Send SMS tab** *(requires Twilio secrets configured)*
- Enter recipient phone number in E.164 format: `+447700900123`
- Type message (max 160 characters — character counter shown)
- Click **Send SMS** — message goes via the `send-sms` Edge Function
- API key is never in the browser — only in the Edge Function environment
- Sent message is logged in the SMS Log tab

**Send Email tab** *(requires SendGrid secrets configured)*
- Enter recipient email, subject, and body
- Click **Send Email** — goes via the `send-email` Edge Function
- Logged in the Email Log tab with delivery status

**Templates tab**
- 7 pre-built message templates: Promo Blast, VIP Reward, Event Boost, Win-Back (SMS) + Weekly Special, Monthly Newsletter, Loyalty Points (email)
- Search templates by name or type
- Click **Use Template** to load the template into the compose form with placeholders to fill in
- Placeholders use [BRACKET] format: replace [NAME], [OFFER], [CODE] etc. before sending

**SMS Log tab**
- History of all sent SMS messages with status: sent / delivered / failed / undelivered
- Twilio SID stored for reference and debugging

**Email Log tab**
- History of all sent emails with status: sent / delivered / opened / clicked / bounced / unsubscribed

**How to Test (without API keys)**
1. Open Send SMS tab — verify the form loads with character counter
2. Try to send without filling fields — verify Send button is disabled
3. Templates tab: click "Use Template" on "Promo Blast" → verify SMS compose tab loads with template text
4. Click "Use Template" on "Weekly Special" (email type) → verify Email compose loads with subject pre-filled

**How to Test (with API keys configured)**
1. Send a test SMS to your own mobile: +447700XXXXXX
2. Verify it arrives within 30 seconds
3. Check SMS Log — entry should appear with status "sent" or "delivered"
4. Send a test email to your own address
5. Check Email Log — entry should appear with status "sent"

---

### M25 Advanced Reports

**Purpose:** Generate professional PDF reports for any area of the business. 14 report types including AI-generated executive briefings.

**How to Use**

**Report Types**
Use the category filter tabs (All / Finance / Operations / Compliance / AI) to narrow the list.

| Report | Category | What it shows |
|---|---|---|
| Daily Trading Summary | Finance | Revenue, orders, AOV, channel breakdown |
| Weekly P&L | Finance | Income vs expenses, net profit |
| Monthly Finance | Finance | Full monthly financial picture |
| Labour Cost | Operations | Wages, hours worked, labour % |
| Menu Performance | Operations | Best/worst sellers by revenue |
| Food Safety Compliance | Compliance | Temp checks, pest control summary |
| Allergen Report | Compliance | Full allergen matrix for active menu |
| Supplier Summary | Operations | PO history, total spend |
| Stock Valuation | Operations | Current stock levels and value |
| Customer Analysis | Operations | Segments, LTV, top 20 customers |
| Campaign ROI | Operations | Campaign spend, promo redemptions |
| Equipment Maintenance Log | Compliance | Services, repairs, upcoming dates |
| VAT Summary | Finance | Output/input VAT, net due |
| AI Executive Briefing | AI | Claude-generated business summary |

**Generating a Report**
1. Click **Generate PDF** on any report card
2. A modal opens — set the date range (pre-filled based on report type)
3. Click **Download PDF** — the PDF generates in your browser (no server needed except for the AI briefing)
4. The file downloads automatically as `report-type-date.pdf`

**AI Executive Briefing** *(requires Anthropic API key)*
1. Click **Generate PDF** on "AI Executive Briefing"
2. Set date range
3. Click **Generate Briefing** — Claude Haiku is called via the `generate-report` Edge Function
4. The briefing appears as text in the modal
5. Click **Download Text** to save it as a .txt file

**PDF Structure**
Each PDF includes:
- Crispy Coop header with orange branding
- Report title and period
- Summary stats cards
- Data tables
- Page numbers

**How to Test**

1. Click **Generate PDF** on "Stock Valuation" — no date range needed
2. PDF should download containing the 35 seeded ingredients with quantities and values
3. Generate "VAT Summary" for this month — verify it shows £0 output VAT (no transactions yet)
4. Add some transactions in M04 Finance first, then regenerate — should show values
5. Generate "Allergen Report" — should show any allergens set in M09
6. AI Briefing: click Generate → if API key is set, briefing appears; if not, error message shows

---

## 4. Edge Functions Reference

All Edge Functions live in `supabase/functions/`. They run on Deno (not Node.js). API keys are environment secrets — never in the React app.

### `daily-briefing`
- **Trigger:** Cron job at 06:00 daily (or manual HTTP POST)
- **What it does:** Queries yesterday's revenue, today's events/absences/temp fails → generates 200-word briefing via Claude Haiku → upserts into `daily_briefings` table
- **Dashboard reads from:** `daily_briefings` table (date = today)
- **Test manually:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/daily-briefing \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### `demand-forecast`
- **Trigger:** Called from M07 Rota → AI Forecast tab
- **What it does:** Queries 8 weeks of `daily_revenue_summary` + local events + OpenWeatherMap forecast → Claude Haiku generates 7-day prediction as JSON
- **Returns:** `{ forecast: [{date, predicted_revenue, predicted_orders, confidence, notes}], weekly_total, key_insight }`

### `smart-rota`
- **Trigger:** Called from M07 Rota → AI Forecast tab → after forecast is generated
- **What it does:** Queries active staff, absences, last week's rota → Claude Haiku generates shift suggestions matched to forecast demand
- **Returns:** `{ shifts: [{staff_name, shift_date, start_time, end_time, role}], total_hours, estimated_labour_cost, notes }`
- **Apply to Rota:** The UI writes the returned shifts to `rota_weeks` and `rota_shifts` tables automatically

### `send-sms`
- **Trigger:** Called from M24 Communications → Send SMS
- **What it does:** Sends SMS via Twilio → logs to `sms_log`
- **Required secrets:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Body:** `{ to: "+447700...", message: "...", templateName?: "..." }`

### `send-email`
- **Trigger:** Called from M24 Communications → Send Email
- **What it does:** Sends email via SendGrid → logs to `email_log`
- **Required secrets:** `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`
- **Body:** `{ to: "...", subject: "...", body: "...", templateName?: "..." }`

### `generate-report`
- **Trigger:** Called from M25 Reports → AI Executive Briefing
- **What it does:** Queries revenue, transactions, temp logs, absences → Claude Haiku writes a business intelligence briefing
- **Returns:** `{ briefing: "..." }`

### `bland-webhook`
- **Trigger:** POST from Bland AI after each completed phone call
- **What it does:** Logs call transcript to `voice_call_logs` → if order completed, creates `voice_orders` record
- **Headers:** `bland-signature: YOUR_SECRET` (optional verification)

### `stripe-webhook`
- **Trigger:** POST from Stripe on payment events
- **What it does:** `payment_intent.succeeded` → inserts financial transaction (income) + `stripe_payments` record. `charge.refunded` → inserts financial transaction (expense/refund)
- **Signature verification:** Enabled when `STRIPE_WEBHOOK_SECRET` is set

---

## 5. Testing Guide

This section gives a structured test sequence to verify the full system after deployment.

### 5.1 Smoke Test (15 minutes)

Run this immediately after deployment to verify the basics work.

| # | Test | Expected Result |
|---|---|---|
| 1 | Load the app URL in browser | Login page appears, no console errors |
| 2 | Log in with owner credentials | Dashboard loads with today's date |
| 3 | Navigate to all 25 modules | Each loads without a white screen or error |
| 4 | Open M16 Settings → Business Settings | Shows seeded values (Crispy Coop, etc.) |
| 5 | Open M02 Stock → Ingredients tab | 35 ingredients appear |
| 6 | Open M09 Menu → Menu Items tab | 27 menu items appear |
| 7 | Open M10 SOP Library | 10 SOPs appear |
| 8 | Open M07 Rota → Staff tab | 5 staff members appear |
| 9 | Open M13 Overheads | 19 overhead items appear, monthly total ~£5,400 |
| 10 | Open M20 Equipment | 13 equipment items appear |

### 5.2 Core Operations Test (30 minutes)

Tests the daily workflow a manager would follow.

**Morning**
1. Open M01 Dashboard — verify health score loads
2. Open M08 Food Safety → log opening fridge temperatures (3°C, 2°C)
3. Verify both show PASS badge
4. Log freezer temperature: -20°C → PASS
5. Open M03 Sales → click **Open Session**
6. Verify session start time appears

**During Service**
7. Add 5 sales across different channels:
   - "2 Piece Meal" × 2 @ £7.99 each (walk-in)
   - "3 Strips" × 1 @ £4.99 (deliveroo)
   - "Tower Burger" × 1 @ £7.99 (ubereats)
   - "6 Wings" × 1 @ £5.99 (phone)
8. Verify Live Sales Board total = £34.95
9. Verify Dashboard revenue ticker shows £34.95

**End of Day**
10. Close session in M03
11. Count till in M11: enter realistic denominations totalling ~£25 cash
12. Enter EPOS cash total of £25 → verify variance is shown
13. Log closing temperature checks in M08

### 5.3 Finance Test (20 minutes)

1. Open M04 Finance → add income transaction: £500 "Catering order", today
2. Add expense transaction: £200 "Food order from Brakes"
3. Verify Stats show: Income £500, Expenses £200, Net P&L £300
4. Check VAT tab: Output VAT £100, Input VAT £40, Net due £60
5. Open Daily P&L tab: select today → verify it shows session revenue + transactions
6. Open M13 Overheads → verify monthly total is shown
7. Open M05 Cost Calculator → build a recipe and verify margin calculation
8. Check M14 Reporting → KPI Dashboard should show today's data

### 5.4 Staff & Rota Test (15 minutes)

1. Open M07 Rota → create a rota week for this week
2. Add 3 shifts on different days
3. Log an absence: Aisha, tomorrow, sick
4. Log a wage payment: Omar, 25 hours, this week
5. Verify labour cost bar shows the week
6. Check M22 Training → verify all 5 staff appear in SOP signoffs matrix

### 5.5 Stock & Waste Test (10 minutes)

1. Open M02 Stock → find an ingredient below par level
2. Log a delivery to bring it above par
3. Open M06 Wastage → log waste for 2 ingredients
4. Verify waste cost is calculated correctly
5. Check M05 Cost Calculator → verify ingredient costs are correct

### 5.6 AI Features Test (requires Anthropic API key)

1. **Daily Briefing:** POST to the function URL → return to dashboard → briefing should appear
2. **Demand Forecast:** Open M07 Rota → AI Forecast tab → set to next Monday → Generate
   - Verify 7 days appear with revenue predictions and confidence levels
   - Verify bar chart renders
3. **Smart Rota:** After forecast, click Suggest Rota
   - Verify shifts are generated for all 7 days
   - Verify notes explain the reasoning
   - Click **Apply to Rota Grid** → verify shifts appear in Weekly Rota tab
4. **AI Briefing Report:** Open M25 Reports → AI Executive Briefing → Generate
   - Verify briefing text appears and can be downloaded

### 5.7 Communications Test (requires Twilio/SendGrid)

1. Open M24 Communications → Send SMS tab
2. Send test SMS to your own mobile
3. Verify it arrives within 60 seconds
4. Check SMS Log → verify status shows "sent" or "delivered"
5. Send test email → verify receipt
6. Check Email Log → verify entry appears

### 5.8 PDF Report Test

1. Open M25 Reports
2. Generate "Stock Valuation" report → PDF should download immediately
3. Open PDF → verify it has Crispy Coop header, orange branding, and data table
4. Generate "VAT Summary" for current quarter
5. Generate "Allergen Report" → verify menu items and allergens appear
6. Generate "Equipment Maintenance Log" → verify 13 equipment items appear

### 5.9 Franchise Test

1. Open M23 Franchise → add a new site: "Crispy Coop Ware", city "Ware"
2. Set status to "active"
3. Verify stats update: Total Sites = 1, Active Sites = 1
4. SOP Distribution tab → verify all 10 SOPs appear

---

## 6. Troubleshooting

### Dashboard shows no revenue

**Cause:** No sessions have been opened and closed in M03.
**Fix:** Open M03 → Open Session → Add a sale → Close Session. Revenue will appear.

### Daily Briefing shows "No briefing yet"

**Cause:** Either the cron job hasn't run yet, or the Edge Function failed.
**Fix:** Manually trigger it via curl or the Supabase Edge Functions dashboard → Logs to see the error.
**Also check:** `ANTHROPIC_API_KEY` is set in Edge Function secrets.

### Demand Forecast returns an error

**Cause:** Usually `ANTHROPIC_API_KEY` not set, or malformed response from Claude.
**Fix:** Check Edge Function → Logs in Supabase dashboard. Verify the secret is set correctly.

### SMS not sending

**Cause:** Twilio secrets not configured, or phone number format wrong.
**Fix:** Phone number must be in E.164 format: `+447700900123`. Verify all 3 Twilio secrets are set.

### PDF download fails

**Cause:** `@react-pdf/renderer` lazy-load failed, or report data query returned an error.
**Fix:** Check browser console. Ensure the app is connected to Supabase (check `.env` file).

### "RLS policy violation" errors

**Cause:** The logged-in user's `profiles.role` is not set, or is set to a role without permission.
**Fix:** Check Supabase → Table Editor → profiles → verify the user has role = 'owner' or 'manager'.

### Seeded data not appearing

**Cause:** `seed.sql` may have run with errors, or was run before all migrations completed.
**Fix:** Check the SQL editor output for errors. Re-run `seed.sql` — all inserts use `ON CONFLICT DO NOTHING` so re-running is safe.

### Stock levels not updating after delivery

**Cause:** Migration 011 may not have been run (creates `stock_levels` table).
**Fix:** Run `011_schema_fixes.sql` if not already done.

### Purchase order total not calculating

**Cause:** The trigger `trg_sync_po_total` requires migration 011.
**Fix:** Run `011_schema_fixes.sql`.

---

*CoopOS v1.0 — Built for Crispy Coop, Hertford UK*
*Stack: React 18 + Supabase + Claude AI + Tailwind CSS*
