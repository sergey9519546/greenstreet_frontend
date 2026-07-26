# IMPLEMENTATION PLAN — Missing Sections & Features
## DSCR Deal Desk v14 → v15

**Status:** 16 missing drilldown views + 11 missing UI features + 2 missing engine features  
**Estimated effort:** 4 waves, ~3 hours total  

---

## WAVE 1: Missing Drilldown Views (16 sections)

Each of these engine outputs exists but has no dedicated drilldown drawer view. Clicking "Deep dive" on them currently opens a generic or wrong section.

### 1.1 Bridge Loan Detail
**Engine:** `calculateBridgeLoan()` in alternative-financing.ts  
**Drilldown key:** `bridge_loan`  
**Shows:** Purchase/ARV/rehab inputs, loan terms, interest reserve, total cost of capital, exit proceeds, net profit, ROI/annualized ROI, max loan by ARV (70% rule), cash to close breakdown

### 1.2 Seller Financing Detail
**Engine:** `calculateSellerFinancing()` in alternative-financing.ts  
**Drilldown key:** `seller_financing`  
**Shows:** Seller note terms (amount/rate/term/balloon), monthly payment, balloon at exit, total interest to seller, monthly savings vs market, 5-year savings, wrap spread (if wraparound), effective rate (AEY)

### 1.3 Portfolio Analysis Detail
**Engine:** `calculatePortfolio()` in alternative-financing.ts  
**Drilldown key:** `portfolio`  
**Shows:** Property-by-property table (address, value, debt, NOI, DSCR, cash flow), portfolio totals, portfolio LTV/DSCR/cash-on-cash, weakest/strongest property, cross-collateralization risk

### 1.4 Entity Optimization Detail
**Engine:** `calculateEntityOptimization()` in alternative-financing.ts  
**Drilldown key:** `entity_optimization`  
**Shows:** Recommended entity type + rationale, QBI deduction, liability protection level, filing/maintenance costs by state, comparison table (LLC vs S-Corp vs C-Corp vs Land Trust vs Series LLC)

### 1.5 Cost Segregation Detail
**Engine:** `calculateCostSeg()` in alternative-financing.ts  
**Drilldown key:** `cost_seg`  
**Shows:** 5/7/15/27.5yr allocation table with dollar amounts, bonus depreciation %, Year-1 deduction vs straight-line, incremental tax savings, study cost + payback months, 5-year cumulative savings

### 1.6 Opportunity Zone Detail
**Engine:** `calculateOpportunityZone()` in alternative-financing.ts  
**Drilldown key:** `opportunity_zone`  
**Shows:** Deferral date (Dec 31 2026), basis step-up %, 10-year exclusion status, deferred tax amount, projected QOF appreciation, tax savings from deferral + exclusion, total savings

### 1.7 State-Specific Detail
**Engine:** `calculateStateSpecific()` in alternative-financing.ts  
**Drilldown key:** `state_specific`  
**Shows:** Prop 13 reassessment (CA), SALT cap impact ($10k limit + lost deduction + PTET workaround), rent control max increase by state, all applicable overlays combined

### 1.8 Insurance Detail
**Engine:** `calculateInsuranceDetail()` in alternative-financing.ts  
**Drilldown key:** `insurance_detail`  
**Shows:** Base premium, wind/hail deductible amount (% of dwelling), flood premium (NFIP), loss of rents coverage, total premium, stress Year-3 premium, monthly impact

### 1.9 Monte Carlo Detail
**Engine:** `monte_carlo` field in EngineReport  
**Drilldown key:** `monte_carlo`  
**Shows:** P10/P50/P90 DSCR, mean/std dev, 4 probability bars (P(DSCR<1.0), P(DSCR<0.75), P(neg CF), P(underwater)), iteration count, robustness verdict, histogram description

### 1.10 Worst Plausible Detail
**Engine:** `worst_plausible` field in EngineReport  
**Drilldown key:** `worst_plausible`  
**Shows:** Combined DSCR + cash flow, list of top-3 worst scenarios used, per-scenario DSCR, survival verdict, comparison to base case

### 1.11 Track 3 Detail
**Engine:** `track3` field in EngineReport  
**Drilldown key:** `track3`  
**Shows:** Year-3 stabilized NOI, Year-3 DSCR, Year-3 debt yield, breakeven occupancy %, DSCR trajectory chart (Year 1 → 3 → 5), notes

### 1.12 Unlevered IRR Detail
**Engine:** `unlevered` field in EngineReport  
**Drilldown key:** `unlevered`  
**Shows:** Unlevered IRR vs levered IRR comparison, equity multiple (unlevered), cash flow array, "does deal make sense without leverage" verdict, notes

### 1.13 QBI Deduction Detail
**Engine:** `qbi_deduction` field in EngineReport  
**Drilldown key:** `qbi`  
**Shows:** Eligibility status, deduction amount, MAGI vs phase-out threshold, filing status, pass-through entity type, §199A rules explanation

### 1.14 Cash-Out Refi Detail
**Engine:** `cash_out_refi` field in EngineReport  
**Drilldown key:** `cash_out_refi`  
**Shows:** Max cash at 75% LTV, max cash at 70% LTV, current loan payoff, cash-out LTV cap check, recommendation

### 1.15 Two-Quote Optimizer Detail
**Engine:** `two_quote_optimizer` field in EngineReport  
**Drilldown key:** `two_quote_optimizer`  
**Shows:** Borrower priority (rate/flex/balanced), rationale, recommended flex lender, recommended rate-competitive lender, AEY delta dollars, comparison table

### 1.16 Points Recoup Detail
**Engine:** `points_recoup` field in EngineReport  
**Drilldown key:** `points_recoup`  
**Shows:** Points cost, par rate (no-points rate), actual rate, monthly savings vs par, break-even months, traffic-light status, 5-year net savings

---

## WAVE 2: Missing UI Features

### 2.1 Multi-Deal Comparison View
**What:** Select 2-3 saved deals, see side-by-side comparison table  
**Components:** `DealComparisonModal.tsx`  
**Shows:** Side-by-side metrics (verdict, DSCR, LTV, rate, cash flow, IRR, equity multiple, lender match, stress pass/fail)  
**Trigger:** "Compare" button in saved deals list  

### 2.2 Inline Form Validation
**What:** Real-time error messages on form fields  
**Components:** Validation logic in DealFormV2  
**Shows:** Red border + error text below field when value is out of range (e.g. FICO < 300, rate > 25%, LTV > 100%)  
**Debounce:** 500ms after user stops typing  

### 2.3 CSV/Excel Export
**What:** Export current deal report as CSV  
**Components:** `ExportButton.tsx` in header  
**Format:** Flattened key-value pairs (field, value) for all EngineReport fields  
**Download:** Browser blob download, filename = `dscr-deal-{hash}.csv`  

### 2.4 Email Deal Report
**What:** Generate mailto: link with deal summary  
**Components:** `EmailButton.tsx` in header  
**Format:** Subject = "DSCR Deal Analysis: {verdict} — {purchase_price}"  
**Body:** Plain-text summary (verdict, DSCR, LTV, rate, cash flow, lender match, narrative)  

### 2.5 Loading Skeletons
**What:** Skeleton screen instead of spinner while engine computes  
**Components:** `SkeletonCard.tsx`  
**Shows:** Gray pulsing card shapes matching the VerdictHero + StoryFlow layout  
**Trigger:** `loading && !report` state  

### 2.6 Empty State
**What:** What shows when no deal loaded (fresh visit, all inputs cleared)  
**Components:** `EmptyState.tsx`  
**Shows:** Welcome message, "Load a preset" CTA, "Start from scratch" CTA  
**Trigger:** `!report && !loading && !error`  

### 2.7 Onboarding / First-Run Tutorial
**What:** 3-step tooltip overlay for first-time visitors  
**Components:** `Onboarding.tsx`  
**Steps:** (1) "Pick a preset to start", (2) "Edit any field — engine recomputes live", (3) "Click any metric for deep analysis"  
**Persistence:** localStorage flag `onboarding-complete`  

### 2.8 Form Field Tooltips
**What:** Hover help text on form fields  
**Components:** `Tooltip` wrapper in DealFormV2  
**Shows:** Brief explanation on hover (e.g. "DSCR = Qualifying Rent ÷ PITIA. Lenders require ≥ 1.0x")  
**Trigger:** Hover on info icon next to field label  

### 2.9 Deal Comparison Table
**What:** Compact table comparing key metrics across saved deals  
**Components:** Part of `DealComparisonModal.tsx`  
**Rows:** Verdict, Track 1 DSCR, Track 2 DSCR, LTV, Rate, Cash Flow, Eq Multiple, Top Lender, Stress Kill Count  
**Highlight:** Best value in each row highlighted green  

### 2.10 Foreign National Support
**What:** Engine flag for foreign national borrowers  
**Engine:** Add `is_foreign_national` to EngineInput, propagate to LLPA (already has `isForeignNational` param)  
**UI:** Toggle in Advanced form section  
**Effect:** Triggers foreign national LLPA adjustment (+150-300bps), requires ITIN instead of SSN, different doc requirements  

### 2.11 PAL Rules (§469)
**What:** Passive Activity Loss analysis  
**Engine:** Add `pal_analysis` block to EngineReport  
**Computes:** PAL allowance ($25k for MAGI < $100k, phased out at $150k), suspended losses carryforward, grouping election impact, REP status effect  
**UI:** Show in after-tax drilldown  

---

## WAVE 3: Integration Stubs

### 3.1 Live Rate Data Stub
**What:** Fetch Treasury/SOFR rates from FRED API  
**Components:** `rate-data.ts` service  
**Implementation:** Server-side fetch in API route, cache 1 hour, fallback to hardcoded values  
**Endpoint:** `GET /api/rates` returns current `{ treasury_10yr, treasury_5yr, sofr_30d, fed_funds }`  

### 3.2 Rent Comp Stub
**What:** Stub for RentCast/Rentometer integration  
**Components:** `rent-comps.ts` service  
**Implementation:** Stub function that returns estimated rent based on property type + state + purchase price  
**UI:** "Estimate rent" button next to rent input field  

### 3.3 AVM Stub
**What:** Stub for Zillow/Redfin AVM  
**Components:** `avm.ts` service  
**Implementation:** Stub function that returns estimated value based on cap rate + NOI  
**UI:** "Estimate value" button next to appraised value field  

---

## WAVE 4: Polish

### 4.1 Drag-and-Drop Deal Reordering
**What:** Drag saved deals to reorder  
**Library:** Native HTML5 drag events (no dependency)  

### 4.2 Dark Mode Persistence
**What:** Verify theme toggle persists across sessions  
**Fix:** Check ThemeToggle component uses localStorage  

### 4.3 Print Improvements
**What:** Better print layout with page breaks between StoryFlow sections  
**CSS:** `@media print` rules for `.break-before` on each StorySection  

### 4.4 Accessibility Audit
**What:** Verify ARIA labels, keyboard nav, screen reader compatibility  
**Tools:** axe-core scan, manual tab-through test  

### 4.5 Performance Audit
**What:** Lighthouse score, bundle size, render time  
**Target:** < 3s LCP, < 200ms engine evaluation, < 500KB JS bundle  

---

## IMPLEMENTATION ORDER

| Priority | Wave | Items | Effort |
|----------|------|-------|--------|
| P0 | 1 | 16 missing drilldown views | 90 min |
| P1 | 2.1-2.3 | Comparison, validation, CSV export | 45 min |
| P1 | 2.5-2.6 | Loading skeletons, empty state | 20 min |
| P2 | 2.7-2.8 | Onboarding, tooltips | 30 min |
| P2 | 2.10-2.11 | Foreign national, PAL rules | 30 min |
| P2 | 2.4, 2.9 | Email report, comparison table | 20 min |
| P3 | 3 | Integration stubs (rates, rent comps, AVM) | 30 min |
| P3 | 4 | Polish (drag-drop, print, a11y, perf) | 30 min |

**Total: ~5 hours of implementation**

---

## SUCCESS CRITERIA

1. Every engine output field has a corresponding drilldown view
2. Every "Deep dive" link in StoryFlow opens the correct drilldown
3. Every "Advanced tools" link opens the correct drilldown
4. Multi-deal comparison works with 2-3 saved deals
5. Form validation prevents invalid inputs
6. CSV export produces a valid spreadsheet file
7. Loading state shows skeletons, not just a spinner
8. First-time users see onboarding tutorial
10. All regression tests still pass
