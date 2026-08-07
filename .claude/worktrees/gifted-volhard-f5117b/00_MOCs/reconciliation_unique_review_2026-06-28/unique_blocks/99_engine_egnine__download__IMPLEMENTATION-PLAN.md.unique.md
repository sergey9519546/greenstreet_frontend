# Unique Content Review

- Source path: 99_engine_egnine/download/IMPLEMENTATION-PLAN.md
- Archived path: 99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/99_engine_egnine/download/IMPLEMENTATION-PLAN.md
- Replacement path: docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 1369
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\99_engine_egnine\download\IMPLEMENTATION-PLAN.md

## Unique Headings
- # IMPLEMENTATION PLAN — Missing Sections & Features
- ## DSCR Deal Desk v14 → v15
- ## WAVE 1: Missing Drilldown Views (16 sections)
- ### 1.1 Bridge Loan Detail
- ### 1.2 Seller Financing Detail
- ### 1.3 Portfolio Analysis Detail
- ### 1.4 Entity Optimization Detail
- ### 1.5 Cost Segregation Detail
- ### 1.6 Opportunity Zone Detail
- ### 1.7 State-Specific Detail
- ### 1.8 Insurance Detail
- ### 1.9 Monte Carlo Detail
- ### 1.10 Worst Plausible Detail
- ### 1.11 Track 3 Detail
- ### 1.12 Unlevered IRR Detail
- ### 1.13 QBI Deduction Detail
- ### 1.14 Cash-Out Refi Detail
- ### 1.15 Two-Quote Optimizer Detail
- ### 1.16 Points Recoup Detail
- ## WAVE 2: Missing UI Features
- ### 2.1 Multi-Deal Comparison View
- ### 2.2 Inline Form Validation
- ### 2.3 CSV/Excel Export
- ### 2.4 Email Deal Report
- ### 2.5 Loading Skeletons
- ### 2.6 Empty State
- ### 2.7 Onboarding / First-Run Tutorial
- ### 2.8 Form Field Tooltips
- ### 2.9 Deal Comparison Table
- ### 2.10 Foreign National Support
- ### 2.11 PAL Rules (§469)
- ## WAVE 3: Integration Stubs
- ### 3.1 Live Rate Data Stub
- ### 3.2 Rent Comp Stub
- ### 3.3 AVM Stub
- ## WAVE 4: Polish
- ### 4.1 Drag-and-Drop Deal Reordering
- ### 4.2 Dark Mode Persistence
- ### 4.3 Print Improvements
- ### 4.4 Accessibility Audit

## First Unique Blocks

### Block 1
```text
# IMPLEMENTATION PLAN — Missing Sections & Features ## DSCR Deal Desk v14 → v15
```

### Block 2
```text
**Status:** 16 missing drilldown views + 11 missing UI features + 2 missing engine features **Estimated effort:** 4 waves, ~3 hours total
```

### Block 3
```text
## WAVE 1: Missing Drilldown Views (16 sections)
```

### Block 4
```text
Each of these engine outputs exists but has no dedicated drilldown drawer view. Clicking "Deep dive" on them currently opens a generic or wrong section.
```

### Block 5
```text
### 1.1 Bridge Loan Detail **Engine:** `calculateBridgeLoan()` in alternative-financing.ts **Drilldown key:** `bridge_loan` **Shows:** Purchase/ARV/rehab inputs, loan terms, interest reserve, total cost of capital, exit proceeds, net profit, ROI/annualized ROI, max loan by ARV (70% rule), cash to close breakdown
```

### Block 6
```text
### 1.2 Seller Financing Detail **Engine:** `calculateSellerFinancing()` in alternative-financing.ts **Drilldown key:** `seller_financing` **Shows:** Seller note terms (amount/rate/term/balloon), monthly payment, balloon at exit, total interest to seller, monthly savings vs market, 5-year savings, wrap spread (if wraparound), effective rate (AEY)
```

### Block 7
```text
### 1.3 Portfolio Analysis Detail **Engine:** `calculatePortfolio()` in alternative-financing.ts **Drilldown key:** `portfolio` **Shows:** Property-by-property table (address, value, debt, NOI, DSCR, cash flow), portfolio totals, portfolio LTV/DSCR/cash-on-cash, weakest/strongest property, cross-collateralization risk
```

### Block 8
```text
### 1.4 Entity Optimization Detail **Engine:** `calculateEntityOptimization()` in alternative-financing.ts **Drilldown key:** `entity_optimization` **Shows:** Recommended entity type + rationale, QBI deduction, liability protection level, filing/maintenance costs by state, comparison table (LLC vs S-Corp vs C-Corp vs Land Trust vs Series LLC)
```

### Block 9
```text
### 1.5 Cost Segregation Detail **Engine:** `calculateCostSeg()` in alternative-financing.ts **Drilldown key:** `cost_seg` **Shows:** 5/7/15/27.5yr allocation table with dollar amounts, bonus depreciation %, Year-1 deduction vs straight-line, incremental tax savings, study cost + payback months, 5-year cumulative savings
```

### Block 10
```text
### 1.6 Opportunity Zone Detail **Engine:** `calculateOpportunityZone()` in alternative-financing.ts **Drilldown key:** `opportunity_zone` **Shows:** Deferral date (Dec 31 2026), basis step-up %, 10-year exclusion status, deferred tax amount, projected QOF appreciation, tax savings from deferral + exclusion, total savings
```

### Block 11
```text
### 1.7 State-Specific Detail **Engine:** `calculateStateSpecific()` in alternative-financing.ts **Drilldown key:** `state_specific` **Shows:** Prop 13 reassessment (CA), SALT cap impact ($10k limit + lost deduction + PTET workaround), rent control max increase by state, all applicable overlays combined
```

### Block 12
```text
### 1.8 Insurance Detail **Engine:** `calculateInsuranceDetail()` in alternative-financing.ts **Drilldown key:** `insurance_detail` **Shows:** Base premium, wind/hail deductible amount (% of dwelling), flood premium (NFIP), loss of rents coverage, total premium, stress Year-3 premium, monthly impact
```

### Block 13
```text
### 1.9 Monte Carlo Detail **Engine:** `monte_carlo` field in EngineReport **Drilldown key:** `monte_carlo` **Shows:** P10/P50/P90 DSCR, mean/std dev, 4 probability bars (P(DSCR<1.0), P(DSCR<0.75), P(neg CF), P(underwater)), iteration count, robustness verdict, histogram description
```

### Block 14
```text
### 1.10 Worst Plausible Detail **Engine:** `worst_plausible` field in EngineReport **Drilldown key:** `worst_plausible` **Shows:** Combined DSCR + cash flow, list of top-3 worst scenarios used, per-scenario DSCR, survival verdict, comparison to base case
```

### Block 15
```text
### 1.11 Track 3 Detail **Engine:** `track3` field in EngineReport **Drilldown key:** `track3` **Shows:** Year-3 stabilized NOI, Year-3 DSCR, Year-3 debt yield, breakeven occupancy %, DSCR trajectory chart (Year 1 → 3 → 5), notes
```

### Block 16
```text
### 1.12 Unlevered IRR Detail **Engine:** `unlevered` field in EngineReport **Drilldown key:** `unlevered` **Shows:** Unlevered IRR vs levered IRR comparison, equity multiple (unlevered), cash flow array, "does deal make sense without leverage" verdict, notes
```

### Block 17
```text
### 1.13 QBI Deduction Detail **Engine:** `qbi_deduction` field in EngineReport **Drilldown key:** `qbi` **Shows:** Eligibility status, deduction amount, MAGI vs phase-out threshold, filing status, pass-through entity type, §199A rules explanation
```

### Block 18
```text
### 1.14 Cash-Out Refi Detail **Engine:** `cash_out_refi` field in EngineReport **Drilldown key:** `cash_out_refi` **Shows:** Max cash at 75% LTV, max cash at 70% LTV, current loan payoff, cash-out LTV cap check, recommendation
```

### Block 19
```text
### 1.15 Two-Quote Optimizer Detail **Engine:** `two_quote_optimizer` field in EngineReport **Drilldown key:** `two_quote_optimizer` **Shows:** Borrower priority (rate/flex/balanced), rationale, recommended flex lender, recommended rate-competitive lender, AEY delta dollars, comparison table
```

### Block 20
```text
### 1.16 Points Recoup Detail **Engine:** `points_recoup` field in EngineReport **Drilldown key:** `points_recoup` **Shows:** Points cost, par rate (no-points rate), actual rate, monthly savings vs par, break-even months, traffic-light status, 5-year net savings
```

### Block 21
```text
## WAVE 2: Missing UI Features
```

### Block 22
```text
### 2.1 Multi-Deal Comparison View **What:** Select 2-3 saved deals, see side-by-side comparison table **Components:** `DealComparisonModal.tsx` **Shows:** Side-by-side metrics (verdict, DSCR, LTV, rate, cash flow, IRR, equity multiple, lender match, stress pass/fail) **Trigger:** "Compare" button in saved deals list
```

### Block 23
```text
### 2.2 Inline Form Validation **What:** Real-time error messages on form fields **Components:** Validation logic in DealFormV2 **Shows:** Red border + error text below field when value is out of range (e.g. FICO < 300, rate > 25%, LTV > 100%) **Debounce:** 500ms after user stops typing
```

### Block 24
```text
### 2.3 CSV/Excel Export **What:** Export current deal report as CSV **Components:** `ExportButton.tsx` in header **Format:** Flattened key-value pairs (field, value) for all EngineReport fields **Download:** Browser blob download, filename = `dscr-deal-{hash}.csv`
```

### Block 25
```text
### 2.4 Email Deal Report **What:** Generate mailto: link with deal summary **Components:** `EmailButton.tsx` in header **Format:** Subject = "DSCR Deal Analysis: {verdict} — {purchase_price}" **Body:** Plain-text summary (verdict, DSCR, LTV, rate, cash flow, lender match, narrative)
```

### Block 26
```text
### 2.5 Loading Skeletons **What:** Skeleton screen instead of spinner while engine computes **Components:** `SkeletonCard.tsx` **Shows:** Gray pulsing card shapes matching the VerdictHero + StoryFlow layout **Trigger:** `loading && !report` state
```

### Block 27
```text
### 2.6 Empty State **What:** What shows when no deal loaded (fresh visit, all inputs cleared) **Components:** `EmptyState.tsx` **Shows:** Welcome message, "Load a preset" CTA, "Start from scratch" CTA **Trigger:** `!report && !loading && !error`
```

### Block 28
```text
### 2.7 Onboarding / First-Run Tutorial **What:** 3-step tooltip overlay for first-time visitors **Components:** `Onboarding.tsx` **Steps:** (1) "Pick a preset to start", (2) "Edit any field — engine recomputes live", (3) "Click any metric for deep analysis" **Persistence:** localStorage flag `onboarding-complete`
```

### Block 29
```text
### 2.8 Form Field Tooltips **What:** Hover help text on form fields **Components:** `Tooltip` wrapper in DealFormV2 **Shows:** Brief explanation on hover (e.g. "DSCR = Qualifying Rent ÷ PITIA. Lenders require ≥ 1.0x") **Trigger:** Hover on info icon next to field label
```

### Block 30
```text
### 2.9 Deal Comparison Table **What:** Compact table comparing key metrics across saved deals **Components:** Part of `DealComparisonModal.tsx` **Rows:** Verdict, Track 1 DSCR, Track 2 DSCR, LTV, Rate, Cash Flow, Eq Multiple, Top Lender, Stress Kill Count **Highlight:** Best value in each row highlighted green
```
