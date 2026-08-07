# THE COMPLETE SOVEREIGN MASTER DOCUMENT
## Building the Best Non-QM Wholesale Lender in the Nation
### DSCR Sovereign OS: Full Specification, Research, Algorithms, Compliance, and Operations
*Version 2.0 — Complete Final Synthesis | Date: June 18, 2026 | Classification: SOVEREIGN / BUILD-CRITICAL*

---

# PART ONE: STRATEGIC FOUNDATION & MARKET INTELLIGENCE

## 1.1 The Market Opportunity

The Non-Qualified Mortgage (Non-QM) sector has reached a critical inflection point. As of January 2026, Non-QM lending captured over **9% of total mortgage lock volume**, with total origination volume surpassing **$239 billion in 2025**. DSCR and bank statement loans were the primary growth drivers. The market is projected to exceed 10% of all originations by end of 2026. The window to build the best wholesale lender is now.

The competitive landscape is dominated by players with fragmented technology. The top lender by 2024 Non-QM volume (Scotsman Guide 2025 rankings) was OCMBC at **$3.55 billion**, followed by CrossCountry Mortgage ($3.48B), Acra Lending ($3.39B), and A&D Mortgage ($2.64B). Critically, none of these lenders operate with the algorithmic underwriting depth described in this document. That is the moat.

## 1.2 The Six-Function Doctrine (Godmode v7)

Every feature, every code module, and every operational decision must trace back to exactly one of these six functions. Any capability that serves none of them is rejected.

| # | Function | Elite Standard | Platform Module |
|---|---|---|---|
| 01 | **Scenario Accuracy** | GO/NO-GO verdict with confidence score in under 10 minutes | `engine.ts` + `preflightGate.ts` + `rentCompAggregator.ts` |
| 02 | **Guideline Intelligence** | 25+ verified lenders with auto-fit scoring and two-quote rule | `lenders.ts` + `lenderGuidelines.ts` + `fitScorer.ts` |
| 03 | **Borrower Trust** | Every quote regulator-ready, backed by full constraint disclosure | `quoteExplainer.ts` + `pdfQuotePack.ts` |
| 04 | **Capital Partner Trust** | Zero-defect file standard, first-pass clean rate above 90% | `fileCompletenessEngine.ts` + `defectScorer.ts` |
| 05 | **Distribution** | 60%+ of revenue from repeat referral channels | `referralPortal.ts` + `channelAttribution.ts` |
| 06 | **Risk Discipline** | Hard decline gates + adverse-action compliance, false-decline below 5% | `declineGate.ts` + `adverseActionEngine.ts` |

**The Iron Rule:** Every feature request, lender addition, UI change, or operational modification must be traceable to exactly one of the Six Functions. Doctrine is what prevents the platform from becoming a feature graveyard.

## 1.3 The Three Audiences of Every Quote

A DSCR quote is read by three audiences with different decision criteria, and the platform must speak legibly to all three simultaneously.

The **borrower** cares whether the deal closes and at what cost of capital; they judge the quote by its rate, fees, and whether the constraints feel fair and explained. The **capital partner** (lender's underwriter, investor's asset manager, or credit committee) cares whether the file is clean, complete, and defensible; they judge by defect rate, documentation stack, and audit trail. The **operator** (loan officer) cares whether the ten minutes spent produced a verdict that holds up through closing; they judge by whether it moved the borrower forward without creating downstream liability. A quote that satisfies only one audience is a failure.

## 1.4 The Three-Plane Architecture (Graph-Native OS)

The Sovereign OS is not a flat database application. It is a **Graph-Native Financial Operating System** built on three planes.

| Plane | Definition | Implementation |
|---|---|---|
| **Projection Plane** | Human-facing views | Scenario Builder, Lender Matchmaker, After-Tax IRR Studio, IC Memo Command |
| **Graph Plane** | The causal central nervous system | Nodes (Borrower, Property, Lender, Law, Rate) with Typed Edges (Qualifies, Conflicts, Supersedes, Shocks) |
| **Ledger Plane** | Immutable append-only event log | Every mutation, approval, and export is captured with full provenance |

The **Semantic Diff Engine** classifies changes by facet (Location, Timing, Budget, Legal). A structural change (e.g., vesting from LLC to Individual) triggers a causal propagation through the PPP Legal Branching Gate without destroying unrelated underwriting work. A cosmetic change (e.g., fixing a typo) produces no propagation.

## 1.5 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind 4, shadcn/ui, RHF+Zod, TanStack Table, Recharts | Current (Next.js 16 released Oct 2025), type-safe, server-side PDF |
| Backend | Python 3.11+, FastAPI, SciPy (bisection/XIRR), Celery+Redis | Async, deterministic math, background job processing |
| Database | PostgreSQL + JSONB + pgvector | Evidence Vault, audit logs, semantic search |
| Storage | S3 | Guideline PDFs, rate-sheet snapshots, HOA docs |
| Infrastructure | Vercel (frontend), Celery+Redis (background), Neon Postgres | Serverless-friendly, scalable |

---

# PART TWO: THE GOLDEN SPINE — DETERMINISTIC FINANCIAL & LEGAL CORE

## 2.1 Dual-Track DSCR Math (The Non-Negotiable Core)

The system computes two entirely distinct DSCR tracks for every deal and never blends them.

**Track 1 — Lender Qualification:**
```
Track1_DSCR = Qualifying_Gross_Rent / PITIA
```
Rules: No vacancy haircut for 1–4 unit long-term rentals (1007 already assumes occupancy). Qualifying rent = LOWER of (signed lease, 1007 appraisal market rent). If property is vacant, use 1007. If IO product, denominator = ITIA (no principal). 2–4 unit vacancy toggle (0–5%) is a lender policy, not math — surface as a per-lender flag.

**Track 2 — Investor Survival:**
```
Track2_DSCR = (Gross_Rent × (1 - Vacancy) - Management - Maintenance) / PITIA
```
Rules: Vacancy 5–10% for LTR; STR market-specific. This is a stress output, never a qualification input.

**The Godmode Rule:** A deal can PASS Track 1 and FAIL Track 2. The system must state both and require explicit acknowledgment: *"This deal qualifies and loses money every month. Type 'I understand' to proceed. Proceed only if appreciation or after-tax thesis justifies the negative carry — and that thesis must be stated in $/mo."*

## 2.2 Verified Math — Golden Vector (PIN These as Unit Tests)

```
Payment Factor Formula: factor(r) = r(1+r)^360 / ((1+r)^360 - 1), where r = annual_rate / 12

Verified factors:
  6.125% → 0.0060761
  7.00%  → 0.0066530
  8.25%  → 0.0075127

Interest-Only: Monthly_IO = Loan × rate / 12

Reference Deal ($425K / 75% LTV / 7.00% / lease $3,000 = 1007 / tax $5K / ins $2K / HOA $150):
  P&I = $318,750 × 0.0066530 = $2,121
  PITIA = $2,121 + $416.67 + $166.67 + $12.50 = $2,855 (monthly)
  Track 1 DSCR @ 7.00% = $3,000 / $2,855 = 1.05 ✓
  Track 1 DSCR @ 8.25% = $3,000 / $3,192 = 0.96 ✓
  Track 2 DSCR (8% vac, 8% mgmt) = 0.88 → negative $335/mo ✓
  Rent break-even (T1=1.0) = $2,855 (−4.83%) ✓
  Deal-break rate ≈ 7.67% ✓
  Max price at T1=1.0 ≈ $454,100 ✓
```

## 2.3 Returns Engine (Pre-Tax)

```
Accounting Split (define once, never mix):
  EGI = GPR × (1 - Vacancy)
  OpEx = Mgmt + Maint + Tax + Ins + HOA + Util + Turnover  [NO debt, NO capex]
  NOI = EGI - OpEx
  ADS = P&I × 12
  CapEx reserve: modeled separately at 5–8% EGI
  PITIA is the LENDER denominator; NOI is the INVESTOR result.

Metrics:
  Cap Rate = NOI / Price
  Yield-on-Cost = Stabilized_NOI / Total_Cost
  CoC = (NOI - ADS) / Cash_Invested  [Year 1, Year 3, Year 5]
  Debt Yield = NOI / Loan  [target ≥9% institutional]
  Break-even Occupancy = (OpEx + ADS) / GPR
  Equity Multiple = Total_Distributions / Total_Equity_Invested
  DSCR Cushion = Track1 - Lender_Floor

Levered IRR + Exit Model:
  m0: -Cash_Invested
  m1..n: (NOI/12 - P&I)
  mn: + [Exit_NOI/Exit_Cap - Selling_Costs - Remaining_Balance - Prepay(exit_year)]
  
  Sensitivity grid: 4 hold periods (3/5/7/10yr) × 3 exit cap scenarios (bear/base/bull) × 4 rent growth rates (0/1/2/3%) = 48-cell matrix
  Flag: IRR's sensitivity to EXIT CAP is the most fragile input in every model.
```

## 2.4 After-Tax Engine (B′) — The Verdict Flippers

Each of these items can flip a PROCEED to a PASS. They must be treated with the same rigor as the verified math.

**B′.1 Property Tax Reassessment (Highest Priority Fix)**
The sale resets the tax basis in many states. Using the seller's current bill silently overstates DSCR.
```
ENGINE RULE (non-negotiable):
  reassessed_tax = Purchase_Price × effective_mill_rate(state, county)
  PITIA uses reassessed_tax, NOT the current bill.
  UI output: "Seller currently pays $X/yr. You will pay ~$Y/yr after reassessment."

State-specific mechanics:
  CA (Prop 13): Resets to purchase price at sale. Prior owner may have had assessed value
    locked at 1978 price. Buyer also receives supplemental tax bill for stub period.
  TX: 2–3% of market value annually. Purchase triggers reassessment.
  FL: Similar purchase-year reset to market value.
```

**B′.2 After-Tax Returns**
```
Depreciation = Building_Basis / 27.5  (annual, residential straight-line)
  Building_Basis = Price - Land_Value  (require land allocation input)

OBBBA Bonus Depreciation (ENACTED Jan 2025):
  Assets acquired AFTER Jan 19, 2025: 100% bonus depreciation (permanent)
  Assets acquired before Jan 20, 2025 placed in service 2025: 40%
  Assets acquired before Jan 20, 2025 placed in service 2026+: 20%

Cost Segregation:
  Surface for properties ≥$450K. Study cost $2,500–$15,000.
  Typical first-year savings: $50K–$100K per $1M building value.
  Reclassifies building components to 5-yr, 7-yr, 15-yr lives.

§1250 Recapture: Taxed up to 25% on straight-line depreciation at disposition.
  Accelerated/excess recapture is ordinary income (higher rate).

NIIT (Net Investment Income Tax):
  Applies to passive income for MAGI exceeding:
    $200,000 (single / head of household)
    $250,000 (married filing jointly)
    $125,000 (married filing separately)
  Stacks on §1250 recapture:
    Recapture effective rate: 25% + 3.8% = 28.8%
    LTCG effective rate: 20% + 3.8% = 23.8%

Passive Activity Loss (§469):
  $25K allowance phases out $0.50/$1 over $100K MAGI, fully gone at $150K.
  REP exception: 750 hours + 50% test.

1031 Exchange:
  Model "sell-and-pay" vs "1031-and-roll" as alternate exit scenarios.
  Step-up in tax basis reduces taxable gain when replacement property is eventually sold.

OUTPUT: After-tax levered IRR alongside pre-tax. A negative-carry deal can be a winner
  after depreciation shelters income — the engine must show this.
DISCLAIM: Tax outputs are estimates; confirm with a CPA.
```

**B′.3 Insurance as Risk, Not a Line Item**
```
2026 reality: In FL, coastal LA/TX, CA wildfire zones — the question is availability, not price.
  >90% of FL investors, 83% of CA investors missed deals due to insurance issues (2024 survey).
  1-in-3 affordable housing providers saw 25%+ premium jumps.

ENGINE RULES:
  Insurability gate: if market flagged high-risk and quote unconfirmed → KILL CRITERION
  High-risk zones: FL, CA, TX Gulf, LA Coastal
  Insurance feeds BOTH PITIA (Track 1) and OpEx (Track 2/NOI) — separately
  Model premium as volatile (10–30% annual increase in high-risk zones)
  Surface: "Year 1 insurance: $X; stress-test Year 3 at +25%"
```

**B′.4 BRRRR Refi-Seasoning Gate**
```
Determines whether BRRRR works at all. Cash-out refis carry title- and value-seasoning rules
  (commonly 6–12 months) deciding whether you pull cash at ARV or are stuck at COST BASIS.

ENGINE:
  seasoning_met(months_held, lender_rule) → cash_out_basis ∈ {ARV, cost}
  Model interest reserve / carry during the season window.
  If ARV cash-out is gated, the BRRRR thesis may fail even when the stabilized deal qualifies.
  
EXCEPTION: Easy Street Capital waives the 12-mo STR seasoning (BRRRR edge — verified 2026).
```

## 2.5 ARM Reset Engine (B″)

```
SOFR Anchors (June 17, 2026 — verified):
  SOFR 30-day: 3.59% (Northmarq)
  5-Year Treasury: 4.26% (Northmarq)
  10-Year Treasury: 4.44–4.47% (FRED DGS10, Jun 15–17, 2026)
  Fed Funds Rate: 3.50–3.75% (held 4th consecutive FOMC meeting)

ARM Reset Formula:
  Fully_Indexed_Rate = Index_t + Margin
  New_Rate = bounded by:
    min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))
  Reset_Payment = Remaining_Balance × New_Rate/12 / (1 - (1 + New_Rate/12)^(-n_remaining))

IO + ARM Double-Shock:
  IO period expires → recast to amortizing simultaneously with potential rate reset.
  Model the combined impact explicitly.
  Flag the year of double-shock as a kill-criterion checkpoint.
  Surface: "Kill-Switch Year: Year N — IO expires and rate resets simultaneously."
```

---

# PART THREE: PRICING, LENDER INTELLIGENCE & COMPLIANCE

## 3.1 Pricing Calibration (June 17, 2026 — Verified)

```
STRUCTURAL ANCHOR (product-aware):
  30yr FIXED ≈ 10-Year Treasury + risk-tiered spread
  ARM & some IO ≈ 5-Year Treasury + spread (or SOFR + margin)

CREDIT SPREAD (risk-tiered, ~175–450 bps):
  Best-tier (760+/1.25+/≤70% LTV):  ~175–225 bps → effective ~6.2–6.7%
  Typical (standard files):          ~250–350 bps → effective ~6.9–7.8%
  Weaker (low FICO/DSCR/STR/ARM):   up to ~450 bps → effective ~8.9%+

DATED TRIPLET (June 2026, re-verified):
  Competitive (740+ FICO, ≤70–75% LTV, 1.0+ DSCR):
    6.125–6.49% (par 6.125%, 0 pts; ARM from 5.125%)  [Verified — Griffin, Jun 2026]
  Typical (standard files): 6.50–7.50%
  Full-market (thin/non-prime, low DSCR, STR, FN): up to ~10.75%
  Conventional 30yr investment-property comp: ~6.53% (Freddie Mac, Jun 8, 2026)
  DSCR premium over conforming: 0.50–1.25%
  Non-QM premium over QM: 0.50–2.00%

ALWAYS render the dated triplet, never a single rate. Re-price as 10yr/5yr/SOFR move.
```

**Pricing Levers (verified off 740/par anchor):**

| Lever | Adjustment |
|---|---|
| FICO 760+ | −0.05 to −0.125 |
| FICO 720–739 | +0.125 |
| FICO 700–719 | +0.125 to +0.25 |
| FICO 680–699 | +0.50 (cliff) |
| FICO 660–679 | +0.875 (cliff) |
| FICO 640–659 | +1.50 to +2.50 |
| LTV per 5% increment | +0.125 to +0.25 |
| DSCR per 0.10 below 1.25 | +0.125 |
| 85% LTV (select lenders) | @740+/SFR purchase/DSCR ≥1.0 only |
| IO | +0.25 |
| ARM | −0.125 to −0.375 vs 30yr fixed |
| 1 discount point | ≈ −0.25% rate |
| Cash-out | +0.25 to +0.50 |
| Loan <$150K | DSCR floor often 1.25 |
| Foreign national | +0.50 to +1.50 |
| No-PPP | +0.50 to +0.80 |
| 6+ mo reserves | −0.10 to −0.25 |
| Rate lock 45d | Standard/free |
| Rate lock 60d | +0.125 |
| Lock extension | +0.25 to +0.375 |

## 3.2 True Cost of Capital & Lender Ranking (AEY)

```
True_Cost(hold) = Interest_During_Hold + Points$ + Lender/Broker/UW Fees +
  Lock_Cost + Prepay(exit_year, per Part E base) + Refi_Costs(if planned)
  Render at 12/24/36/60-mo + APR-equivalent.

All-In Effective Yield (AEY) = XIRR of actual borrower cash flows:
  [Net_Proceeds_0, -P_1, -P_2, ..., -(P_n + Balance_n + PPP_n)]
  Net_Proceeds_0 = Loan_Amount - (Points$ + Lender_Fees)
  
  Algorithm: SciPy brentq (Brent's Method) — combines bisection and inverse quadratic
  interpolation for guaranteed convergence on non-monotonic mortgage cash flows.
  
  The lender with the lowest AEY over the expected hold period is the cheapest lender
  regardless of stated rate. Sort by AEY, not by rate.

SCREEN per lender (in order):
  1) ELIGIBILITY GATE (binary): PPP legality, FICO/DSCR floor, LTV ceiling,
     property type, loan-size band, citizenship/ITIN, STR acceptance.
     Fail → "Does not meet guidelines" + reason.
  2) FIT TIER (qualitative + reason, NEVER a probability):
     Strong / Standard / Conditional / Unlikely / Does-not-meet.
  3) PRICE (anchor + levers, dated band).
  4) TRUE COST (AEY) at hold.
  5) CONFIDENCE (tiebreaker ONLY — never overrides a material AEY delta).

TWO-QUOTE RULE: always one flex/fit + one rate-competitive lender,
  with the AEY delta in dollars. Never a single quote.

POINTS RECOUP: break_even_months = total_points_cost / monthly_payment_savings_vs_par
  Flag: green = break-even < hold period
        yellow = within 12mo of PPP expiry
        red = break-even > hold period or PPP-trapped

YSP-ADJUSTED APR: if rate > verified par rate, flag YSP exposure.
  Not a regulatory requirement for investment-property DSCR, but a borrower-trust tool.
```

## 3.3 Prepayment Penalty (PPP) Module — Business-Purpose Aware

The PPP module is the section most able to produce a wrong PROCEED/PASS. DSCR loans are business-purpose, usually LLC-vested. Most consumer-mortgage PPP statutes don't reach them. The gate MUST branch BEFORE any "prohibited" output.

**E.1 The Branching Gate (run in this exact order):**
```
STEP 1: Business-purpose + entity-vested?
  → YES: Most consumer statutes DON'T apply. PPP generally available subject to
    lender's state matrix.
  → NO: Continue to Step 2.

STEP 2: Bank/depository lender?
  → YES: Stricter consumer rules often apply even to investors. Non-bank portfolio
    lenders can structure PPP through entity vesting where banks cannot.
  → NO: Continue to Step 3.

STEP 3: Individual vesting OR consumer-purpose?
  → Apply consumer-statute matrix (E.2).

STEP 4: Output: Allowed / Restricted / Prohibited / Ambiguous + reason + governing branch.
  CRITICAL: Lender matrices DIFFER within a state.
  Never present one lender's NJ matrix as the law.
```

**E.2 State Matrix (June 17, 2026 — Borrower-Type Aware):**

| State | Treatment | Provenance |
|---|---|---|
| **AK** | INDIVIDUAL: not allowed. LLC/CORP: ALLOWED. | [Verified — lender matrix, 2026] |
| **MN** | Consumer statute §58.137 (personal/family/household loans ONLY). **HF 3437 ENACTED April 23, 2026, effective August 1, 2026** — confirms §58.137 applies ONLY to personal/family/household loans. Business-purpose DSCR loans NOT reached. | [Verified — statute + HF 3437 text, 2026] |
| **NM** | Often listed as individual ban; entity treatment varies by lender. | [Market pattern — verify] |
| **ND/KS/MD** | De facto prohibited at many lenders (program + usury). | [Market pattern] |
| **OH** | 1–2 unit & condos: PPP only if loan > $116,356 (2026, annually indexed). **PENALTY BASE = ORIGINAL principal** (ORC §1343.011). Max 1%, max 5yr. 3–4 unit: no restriction. | [Verified — ORC §1343.011; confirm Jan 2027] |
| **PA** | 1–2 unit: banned below $329,411 (2026, §406 LIPL). Business-purpose above threshold: allowed. 3–4 unit: outside restriction. | [Verified — statute-indexed; confirm Jan 2027] |
| **NJ** | N.J.S.A. 46:10B-2: "mortgagor" = non-corp individuals barred. Entities allowed — but **lender matrices SPLIT**: some LLC OK, some require C/S-corp only. Recourse guarantors don't affect eligibility. | [Verified — statute + lender matrices, 2026] |
| **IL** | Individuals barred (and/or APR-gated ≥8%); entities subject to APR fall-rate tests. | [Verified — matrix + AAPL] |
| **MS** | Declining structures only; flat banned >1yr (§75-17-31). | [Verified — statute] |
| **AR** | Allowed first 3 years; **PENALTY BASE = REMAINING balance** (≤3/2/1%). | [Verified — state PPP matrix] |
| **WI/ME** | No PPP on ARM (WI: cap 2 months' interest). | [Verified / pattern] |
| **WV** | Max 3yr / 1%. | [Verified — matrix] |
| **RI** | Max 1yr / 2%. | [Verified — matrix] |
| **SC** | Not allowed ≤$690,000. | [Verified — matrix] |
| **OK/TX** | Banned if APR >13% / >12%. | [Verified — matrix] |
| **NY** | Banking Law §6-l bars PPP on residential EXCEPT business-purpose loans. | [Verified — AAPL] |
| **WA** | Some matrices: no PPP on 5/6 ARM. Older blanket ARM-ban claim UNVERIFIED. | [UNVERIFIED — do not encode as blanket] |

**OH ~$116,356 / PA ~$329,411** are annually indexed → store with `effective_year`; re-confirm every January via cron job.

**E.3 Penalty Mechanics:**
```
PENALTY BASE (per state/contract):
  DEFAULT = REMAINING balance × step rate (market-standard DSCR contract)
  STATUTORY OVERRIDE: ORIGINAL principal (OH; some others per state law)
  STORE penalty_base as a per-state, per-loan field. Apply the binding rule.

SALE / REFI TRIGGER:
  DEFAULT = triggers on BOTH sale and refi.
  OVERRIDE: soft prepay exempts sale; MN consumer statute (§58.137) exempts sale
    but MN statute does NOT reach business-purpose DSCR loans as of 8/1/26.
  Confirm exemption language in the ACTUAL loan documents (the only authority).

STRUCTURES: 5-4-3-2-1 · 3-2-1 · flat 5/5/5 · floored 5-4-3-3-3 ·
  six-months-interest · ~20%/yr partial-prepay allowance · assumability.

BEHAVIOR: branch (E.1) → if unavailable, re-price no-PPP (+0.50/+0.80 and/or
  fee ≤0.625%) → recompute P&I → PITIA → BOTH tracks AND return model.
  A marginal deal can fail purely because its state/vesting bans the penalty
  that subsidized its rate. Say so.
```

## 3.4 Reserves (Tiered, Capped, Ranged)

```
Baseline: 3–6 months PITIA (6 months is common).

Tiered by DSCR:
  DSCR ≥1.25 → 3 months
  DSCR 1.00–1.24 → 3–6 months
  DSCR 0.75–0.99 → 9–12 months
  No-ratio → 12 months (≤18 months maximum)

Overlays (capped at 12 months; 15 = stress ceiling):
  STR / condo / FICO <680 / first-timer / loan >$1M / foreign national → 6–12 months

Portfolio stack: subject property + ~2 months per other financed property.

Seasoning: 60 days. Gifts ≥30 days pre-submission. Deposits >~$500–$1,000 need trail.
  Cash-out proceeds may satisfy post-closing reserves on 1–4 unit (no double-count).

Liquidity tiers:
  T1: Cash / MMA (100%)
  T2: Brokerage (100%)
  T3: Retirement (60–80% of vested, minus 401k loan; never assume universal acceptance)
  EXCLUDED: home equity / crypto / gift / borrowed

OUTPUT = 3-scenario range.
  Reference (PITIA $2,855): $8,565 / $17,130 / $25,700–$34,260 + portfolio stack
```

## 3.5 STR (Short-Term Rental) Module

```
LEGALITY GATE (run before any STR income):
  Check: permit / min-stay / owner-occupancy / HOA / enforcement / pending-legislation
  Output: CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED
  If not CLEAR → income disabled (or speculative-only).
  HOA silent/unknown → attorney review required before any STR underwriting.

INCOME (3 worlds, NEVER blended):
  W1: Long-term rent (fallback)
  W2: Projected (×0.70–0.80; pro STR programs may use 100%)
  W3: Documented 12-month platform/bank statements

APPRAISAL GOVERNS: min() across all sources; appraisal wins over AirDNA always.
STR DSCR floor ≥1.0 at most lenders.

Monthly seasonality: Annual DSCR 1.15 can hide months at 0.6.
  STR OpEx runs 45–65% of gross (vs LTR at 30–45%).
  ELEVATE monthly DSCR bar chart to Phase 2 output for every STR file.
  The annual number alone is insufficient and can produce a false PROCEED verdict.

AirDNA: Enterprise-gated. Do NOT build automation until commercial API agreement is signed.
  Easy Street: accepts 100% AirDNA for pro STR investors (verified 2026).
  Visio: broadest STR acceptance (48 states).
  Deephaven: requires 12 months documented STR history.
```

---

# PART FOUR: PROBABILISTIC RISK ENGINE

## 4.1 Tornado Chart (Sensitivity Analysis)

The tornado chart answers: which inputs matter, and in what order?

```
Methodology:
  Hold every variable at central value.
  Flex one variable at a time to its low and high bound:
    ±10% for stable inputs (taxes, reserves)
    ±20% for cyclically sensitive inputs (vacancy, market rent)
    ±50–100bps for interest rates (ARM/IO loans)
  Record the change in DSCR.
  Sort variables by absolute swing descending.
  Plot as horizontal bars.

Standard variable set for DSCR residential:
  Market rent (±20%)
  Vacancy rate (5% base; range 3%–15%)
  Property tax (±10%)
  Insurance premium (±10%; carrier-of-last-resort risk for flood/fire zones)
  Management fee (±20%; 8%–12% of gross rent)
  Interest rate reset (±100bps; ARM and IO loans only)
  Maintenance/CapEx reserve (±20%)

OUTPUT RULE: The binding risk variable is labeled in the verdict as the primary risk driver.
  If rent comp uncertainty exceeds ±$100/month, rent is flagged as the binding sensitivity
  and the verdict is downgraded to CONDITIONAL-GO until the 1007 confirms.
```

## 4.2 Two-Dimensional DSCR Heatmap

```
Standard grid:
  X-axis: Vacancy rate (0%, 5%, 8%, 10%, 12%, 15%)
  Y-axis: Market rent change (-10%, -5%, 0%, +3%, +5%)

Cell coloring:
  DSCR < 1.00 → RED
  DSCR 1.00–1.05 → AMBER
  DSCR > 1.05 → GREEN

Institutional trigger: Any cell in the realistic-scenario zone (vacancy 5–12%,
  rent -5% to 0%) that shows DSCR below 1.00 is an automatic CONDITIONAL flag.

Second standard configuration (for ARM/IO loans):
  Replace vacancy with interest rate reset.
  Produces a rate × rent sensitivity grid.
```

## 4.3 Monte Carlo Survivorship (10,000 Trials with Copula Correlation)

**The Critical Rule:** The Gaussian copula systematically underestimates joint downside risk. It was the primary driver of the 2008 financial crisis (Li, 2000). The Sovereign OS explicitly forbids Gaussian copulas.

```
REQUIRED COPULA: t-copula (5–7 degrees of freedom) or Clayton copula.
  t-copula: C(u,v; ρ, ν) = T_{ν,ρ}(t_ν^{-1}(u), t_ν^{-1}(v))
    Captures fat-tail joint downside risk.
  Clayton copula: C(u,v; θ) = (u^{-θ} + v^{-θ} - 1)^{-1/θ}
    Exhibits strong lower-tail dependence — models simultaneous vacancy + rent compression.

VARIANCE REDUCTION (for efficiency):
  Antithetic Variates: reduces simulation error by 50–80% without increasing trial count.
  Quasi-Monte Carlo (Sobol sequences): faster convergence in high-dimensional simulations.

INPUT DISTRIBUTIONS:
  Rent YoY: Normal, mean 2.0%, σ 4.5%
  Vacancy: Beta distribution, ~5% mean
  Refi-rate: off forward SOFR curve
  Exit cap: ±50–150bps
  Expense growth: configurable
  Appreciation: configurable

OUTPUTS:
  P(Track1 ≥ floor) over loan term
  P(Track2 ≥ 1.0) over loan term
  Levered IRR: P10/P50/P90 (PRE- AND AFTER-TAX)
  P(negative monthly cash flow)
  Reserve-burn drawdown path

ACTION THRESHOLDS:
  P(DSCR < 1.00) > 10% → CONDITIONAL-GO (reprice or restructure)
  P(DSCR < 1.00) > 15% → PASS (risk threshold exceeded)
  5th-percentile DSCR < 0.80 → automatic flag regardless of median

2026 CALIBRATION NOTE: Rental yields declined in 54.8% of U.S. counties between 2025 and 2026.
  For counties with documented yield compression (ATTOM/CBRE data), adjust Monte Carlo
  rent distribution to NEGATIVE SKEW — left tail is fatter than historical distributions imply.
```

---

# PART FIVE: EVIDENCE VAULT & DATA ARCHITECTURE

## 5.1 JSONB Evidence Vault Schema

Every lender guideline is stored as a self-contained JSONB evidence object. No record renders without all four required fields.

```json
{
  "evidence_id": "ev_2026_06_17_griffin_dscr_v1",
  "entity_type": "lender_program",
  "entity_key": "GRIFFIN_DSCR_30YR_FIXED",
  "claim": "Accepts DSCR as low as 0.75; no-ratio option at 75% LTV",
  "lender": "Griffin Funding",
  "source_url": "https://griffinfunding.com/non-qm-mortgages/dscr-loans/",
  "source_type": "Primary / Official",
  "verified_date": "2026-06-17",
  "confidence_score": 85,
  "supersedes_id": null,
  "tags": ["dscr", "no-ratio", "ltv", "fico"]
}
```

**The "Unspecified" Rule:** If a lender does not disclose a metric (e.g., Anchor Loans' FICO floor), the UI MUST render "Unspecified / Requires Broker Matrix." False precision is a systemic failure. Interpolation is forbidden.

## 5.2 Data Source Catalog

| Source | What It Provides | Auth | Cost | Production Rule |
|---|---|---|---|---|
| **RentCast** | 140M+ properties, rental AVM, market comps | API key | Free dev tier | Primary rent comp source |
| **Rentometer** | Percentile rents, nearby comps | Pro subscription | Paid | Secondary corroboration |
| **FRED** | MORTGAGE30US, SOFR, RRVRUSQ156N, HOUST, CPI Shelter | Free API key | Free | Rate anchors + vacancy |
| **Census ACS** | Tract-level vacancy (B25002, B25004) | Free API key | Free | Local vacancy data |
| **FEMA NFHL WMS** | Official flood hazard mapping | Public | Free | Flood zone determination |
| **AirDNA** | STR revenue projections, market data | Enterprise | Contact sales | STR only; enterprise agreement required |
| **NMLS Consumer Access** | License/registration verification | Public website | Free | Manual verification; no public API confirmed |

**WebSocket Push Architecture:**
```python
# FastAPI WebSocket endpoint for live rate changes
@app.websocket("/ws/market-data")
async def market_data_ws(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            snapshot = await build_market_snapshot(...)
            await websocket.send_json(snapshot.dict())
            await asyncio.sleep(300)  # refresh every 5 minutes
    except Exception:
        connected_clients.discard(websocket)
```

**Redis TTL Caching:**
- FRED rates: daily TTL
- RentCast comps: weekly TTL
- Census vacancy: quarterly TTL

---

# PART SIX: LENDER MATRIX (VERIFIED ANCHORS — JUNE 17, 2026)

## 6.1 Verified Lender Registry

| Lender | Conf | Key Facts | Best For | Watch |
|---|---|---|---|---|
| **Griffin Funding** | 85 | All 50+DC. Fixed 6.125–7.5%; ARM 5.125%. DSCR↓0.75+no-ratio. Jumbo to $4M. Min FICO 620 (avg 729). May-2026: 62 loans/$20.79M. 67% cash-out. Avg loan $292K. CA reserves 9/12/15. | Sub-1.0/no-ratio; jumbo; nationwide | $20M claim [Unverified] |
| **Defy Mortgage** | 80 | FICO↓640. 85% LTV at 740+/SFR/≥1.0. DSCR↓0.75. 3-mo reserves. STR via hist/market/AirDNA. 14–21d close. | High-leverage; 640–679 FICO; 85% LTV | Confirm max loan by state |
| **Easy Street Capital** | 82 | STR specialist. AirDNA (100% for pros). No min DSCR for STR. Waives 12-mo STR seasoning (BRRRR edge). From 5.75%. 80% LTV/75% cash-out. | Pro STR/AirBnBRRRR | N/A |
| **Lima One Capital** | 76 | Dedicated STR (AirDNA). To $2M/80% LTV. ~41 states. Blanket/portfolio. | Experienced investors; bridge-to-rental | **BLANKET EXIT WARNING** |
| **Kiavi** | 70 | DSCR 1.1 to prequalify. FICO 660. 6–9mo reserves. **SSN required — NO ITIN**. From 6%/realistic 7.5–11%. | Speed; BRRRR bridge-to-DSCR | ITIN/FN excluded |
| **New Silver** | 72 | 30yr. $150K–$3M. 80% LTV. DSCR↓0.75. FICO 660. Instant approval, 14–21d. Rate 50–100bps above established. | Speed-sensitive | Rate-shoppers |
| **Deephaven** | 65 (**STALE — highest reverify priority**) | Gross/PITIA + Gross/ITIA. Lower-of. DSCR↓0.75. Reserves 3/6/6/12. First-timer max 75% LTV. | Reverify before use | Stale data |
| **American Heritage** | 65 | DSCR↓0.75. FICO 660 (720+ better). 12mo reserves sub-1.0. Up to 85% LTV at 760+. STR: 75% projected / 100% w/ 12-mo history. | Sub-1.0 with compensating factors | — |
| **Visio Lending** | 78 | 48 states (no AK/HI). FICO 680. Flex 0.75–0.99. Lower-of, NO vacancy factor. Broadest STR. 5-4-3-2-1 / no-PPP +0.625%. ~$75K–$2M. | STR any market; sub-1.0 Flex | AK/HI; >$2M |

## 6.2 Quick-Match Reference (Two-Quote Rule Always Enforced)

| Situation | First Call | Second Call |
|---|---|---|
| DSCR 0.75–0.99 | Visio Flex | Griffin (0.75) |
| No-ratio needed | Griffin | Defy |
| STR, projected income | Easy Street | Visio |
| STR, 12-mo history | Visio | Easy Street |
| Pro STR / BRRRR STR | Easy Street | Lima One |
| 85% LTV attempt | Defy | — |
| Best rate, pristine | Griffin (6.125%) | Visio |
| Jumbo to $4M | Griffin | Broker shop |
| FN / ITIN | Defy / Griffin | — (Kiavi EXCLUDED) |
| Fast close <14d | New Silver | Kiavi |
| Portfolio / blanket | Lima One | Broker shop (get release clause) |
| State-sensitive PPP | **Run PPP gate FIRST** | — |

---

# PART SEVEN: VERDICT, SCORING & IC MEMO

## 7.1 The Four-Score System

| Score | Weighting | Hard Caps |
|---|---|---|
| **Lender Qualification** | Eligibility 20%, DSCR Cushion 25%, LTV/FICO 35%, Reserves 10%, Docs 10% | Any hard ineligibility caps at 0–39 |
| **Pricing Efficiency** | AEY Spread 35%, Points/Fees 20%, PPP Burden 20%, Structural Fit 15%, Cash Burden 10% | <2 comparable quotes = N/A |
| **Investor Survival** | NOI DSCR 30%, Free Cash Flow 15%, Liquidity 15%, Stress-Pass Rate 25%, Reset Risk 15% | Base NOI DSCR <0.85 or runway <3 months = 0–39 |
| **Data Confidence** | Rent Evidence 25%, Valuation 20%, Tax/Insurance Accuracy 15%, Fraud/Entity 20%, Freshness 10%, Consistency 10% | Unresolved occupancy conflict = 0–39 |

**Score Interpretation:**

| Band | Meaning |
|---|---|
| 85–100 | Strong |
| 70–84 | Pass / Watch |
| 55–69 | Conditional |
| 40–54 | Weak |
| Below 40 | No-Go / Manual Exception Only |

## 7.2 Decision Matrix (Truth Matrix)

| | Investor Survival PASSES | Investor Survival FAILS |
|---|---|---|
| **Lender Qualification PASSES** | **GREEN DEAL** — close if pricing acceptable | **TRAP DEAL** — qualifies but bleeds cash; restructure or decline |
| **Lender Qualification FAILS** | **STRUCTURING OPPORTUNITY** — adjust leverage/rent/product/lender | **KILL DEAL** — do not proceed |

## 7.3 Verdict Logic

```
PROCEED: T1 ≥ floor + cushion ≥0.05; T2 ≥1.0 OR explicit appreciation/tax thesis
  in $/mo; Return Grade ≥B on after-tax IRR; no kill criteria; ≥1 Strong/Standard lender.

RESTRUCTURE: one fixable gate; rescue path returned with ranked options.

PASS: hard kill; or P(DSCR<1.00) >15%; or 5th-pct DSCR < 0.80; or Return Grade ≤D
  with negative T2 and no thesis; or no eligible lender.

RETURN GRADE (A–F on AFTER-TAX levered IRR + CoC + Track 2):
  A: After-tax IRR ≥15%; T2 ≥1.10
  B: 12–15%; T2 ≥1.00
  C: 8–12%; T2 <1.00 with appreciation thesis
  D: <8% or T2 negative
  F: PASS scenario
```

## 7.4 Kill Criteria (Checked Before Lender Ranking)

Every one of these must be checked before any lender is ranked:
- STR prohibited (city/county/HOA)
- PPP illegal for THIS vesting/lender combination
- Insurance unconfirmed in high-risk zone (FL, CA, TX Gulf, LA Coastal)
- FICO below all floors (<620)
- Track 1 < 0.75
- Appraiser rent break point exceeded (>4.83% below asking)
- Value cash-gap unfundable
- Reserves not liquid / not in acceptable tier
- Prepay > exit economics (model exit year $ on CORRECT base)
- Rate > deal-break rate (7.67% for reference deal)
- Declining-market LTV cap binds (CT/FL/IL/NJ/NY check)
- Loan < lender minimum / sub-$150K floor
- BRRRR ARV cash-out gated by seasoning
- Confidence <60 on best-fit lender
- ARM double-shock at reset year breaches DSCR floor
- Track 2 NEGATIVE → forced acknowledgment (not a kill; a mandatory disclosure)

## 7.5 Remediation Levers (Ranked by Impact)

| Lever | Track A Impact | Track B Impact | Typical Use |
|---|---|---|---|
| Lower purchase price | Strong positive | Strong positive | Best first lever |
| Increase down payment / lower leverage | Strong positive | Strong positive | Fastest structural fix |
| Rate buydown | Positive | Positive | Good if basis is modest |
| Switch ARM/IO to fixed or vice versa | Can help or hurt | Can help or hurt | Use only after payment-cliff analysis |
| Improve rent evidence | Positive | Neutral to positive | Only if evidence is real |
| Add verified reserves | Mild | Strong | Improves runway, not NOI |
| Shift to another lender matrix | Positive | Neutral | Solves Track A, not bad economics |
| Cure appraisal/value issues | Positive | Positive | Required if valuation is weak |
| Remove or soften PPP | Neutral to mild negative on rate | Positive on exit flexibility | Important for short holds |
| Kill the deal | Final | Final | When both tracks fail |

---

# PART EIGHT: AI-POWERED INTAKE & FRAUD DETECTION

## 8.1 Hybrid OCR Pipeline

```
[Client Upload] → [FastAPI /upload endpoint]
    ↓
[Document Classifier] — type: lease | rent_roll | T12 | 1007 | bank_statement
    ↓
[OCR Router]
    ├── Digital PDF → Docling + PyMuPDF (table-aware, layout-preserving)
    ├── Scanned PDF → Mistral OCR 2505 ($1/1000 pages; $0.50 batch)
    └── Complex/Handwritten → Reducto / LlamaParse (fallback)
    ↓
[LLM Extraction] — GPT-4o + Instructor → Pydantic schema-validated JSON
    ↓
[Confidence Scorer] — per-field confidence; flag < 0.85 threshold
    ↓
[Cross-Field Validator]
    ├── Annual = Monthly × 12 reconciliation
    ├── NOI = Gross Rent - Expenses sanity check
    ├── Date range consistency
    └── Tampering signals (metadata analysis)
    ↓
[HITL Queue] — low-confidence fields → human review task
    ↓
[DSCR Compute Engine] → output DSCRResult
    ↓
[PostgreSQL] — audit log: field | source_doc | page | bbox | confidence | reviewer
```

**Audit Trail Schema (RESPA/TRID Compliance):**
```sql
CREATE TABLE lease_extraction_audit (
    id              UUID PRIMARY KEY,
    document_hash   TEXT NOT NULL,          -- SHA-256 of original file
    field_name      TEXT NOT NULL,
    extracted_value TEXT,
    confidence      FLOAT,
    source_page     INT,
    source_bbox     JSONB,                  -- {x1, y1, x2, y2}
    extraction_model TEXT,                  -- "gpt-4o-2026-04" etc.
    human_reviewer  TEXT,
    human_override  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

## 8.2 HITL (Human-in-the-Loop) Rules

- **Auto-approve:** confidence ≥ 0.95 on non-critical fields (tenant name, unit ID)
- **Flag for review:** confidence < 0.85 on financial fields (rent amounts, expense line items)
- **Hard-block:** ALWAYS human-review rent schedules, CAM reconciliations, and NOI calculations regardless of confidence
- **Two-step review:** primary reviewer approves; secondary reviewer spot-checks 10% of auto-approved documents
- **Role-based access:** only credentialed underwriters can approve financial extractions

Manual lease abstraction has a 10% material error rate. AI + human review achieves 99%+ accuracy vs. 95% AI-alone.

## 8.3 Fraud Detection

Cotality Q1 2026 Fraud Report: Investment-property applications had fraud indicators at **1 in 44** (vs. 1 in 129 overall). Undisclosed real estate is the largest rising category.

```
FRAUD DETECTION LAYERS:
  1. Metadata fingerprinting: PDF creation timestamps, author metadata, font consistency
  2. Cross-document reconciliation: lease rent vs. bank statement deposits
  3. Market sanity check: flag rent >30% above or below RentCast AVM
  4. Undisclosed real estate: cross-reference borrower entity against public property records
  5. Snappt-style analysis: 99.8% bank statement fraud detection accuracy

ALGORITHMS:
  - CNN + LSTM for visual anomaly detection in bank statements
  - Metadata fingerprinting (SHA-256 hash, timestamp analysis, font consistency scoring)
  - Statistical distance measures for cross-document reconciliation
```

## 8.4 Market Rent Guardrail

If extracted lease rent deviates more than ±30% from RentCast AVM, auto-flag for underwriter review. This catches:
- **Inflated leases:** rent far above market (potential fraud)
- **Below-market leases:** rent far below market (underperforming asset or related-party deals)
- **Stale leases:** market has moved significantly since lease execution

---

# PART NINE: REGULATORY COMPLIANCE ARCHITECTURE

## 9.1 Regulatory Surface (B2B vs. Consumer Positioning)

The platform's regulatory exposure depends entirely on whether it is positioned as a B2B tool for licensed operators or a consumer-facing application. The Sovereign OS is positioned as **professional decision-support for licensed operators**, which significantly reduces the regulatory surface.

| Regulation | Applies? | Notes |
|---|---|---|
| **SAFE Act / MLO Licensing** | Potentially | If the tool crosses into offering/negotiating terms, MLO licensing is required |
| **RESPA Section 8** | No (for business-purpose loans) | Regulation X exempts credit primarily for business, commercial, or agricultural purposes |
| **ECOA / Regulation B** | Yes | Applies to business credit; adverse action notice rules differ for business applicants |
| **Regulation Z** | No (for business-purpose) | Excludes credit primarily for business, commercial, or agricultural purposes |
| **GLBA** | Yes | PII and financial data handling requirements apply |
| **CFPB Circular 2022-03** | Yes | Adverse action notices required even for AI/ML-based decisions |

## 9.2 Explainable AI (XAI) for Adverse Action

CFPB Circular 2022-03 explicitly states that creditors must provide specific and accurate reasons for adverse action and cannot evade ECOA by using "black-box" models.

**The Algorithm: SHAP (SHapley Additive exPlanations)**
```
φ_i = Σ_{S⊆F\{i}} [|S|!(|F|-|S|-1)!/|F|!] [f(S∪{i}) - f(S)]

Where:
  φ_i = SHAP value for feature i
  F = set of all features
  S = subset of features not including i
  f(S) = model prediction using only features in S

Implementation: Python `shap` library with XGBoost or LightGBM backend.
Output: Feature-level contribution to each credit decision.
Use: Auto-generate specific adverse action reasons (e.g., "Primary reason: LTV 82% exceeds maximum 80%").
```

## 9.3 Required Disclaimer (Every Session / Export)

```
PROFESSIONAL DECISION-SUPPORT — DATA AS OF JUNE 2026. Analytical recommendations
for use by a licensed professional or sophisticated investor, who is the
decision-maker of record. Not a loan commitment, credit decision, appraisal,
tax opinion, or guarantee of approval; not a substitute for legal, tax, and
financial counsel. Guidelines, rates, LTV, reserves, prepayment structures, and
STR/insurance policies change without notice; verified items reflect their labeled
source dates; market-pattern/unverified items require direct confirmation. Rates
anchor to the 10yr/5yr Treasury and SOFR + a risk-tiered spread and must be
re-priced as markets move. Annually indexed thresholds (OH/PA) re-confirmed each
January. MN HF 3437 enacted April 23, 2026, effective August 1, 2026 — applies
only to personal/family/household loans; business-purpose DSCR loans not reached.
Tax outputs (depreciation, bonus-dep per OBBBA, recapture, NIIT, 1031,
after-tax IRR) are estimates dependent on the investor's bracket, MAGI, REP
status, filing status, entity, and cost-segregation election — confirm with a CPA.
Return projections depend on forward assumptions (rent growth, exit cap, hold)
that are estimates, not forecasts. Fit tiers are qualitative, not predictions.
Scoring weights are suggested, not empirically calibrated.
```

---

# PART TEN: NON-QM WHOLESALE LENDER OPERATIONS

## 10.1 Market Position & Competitive Landscape

**2025 Top Non-QM Lenders by Volume (Scotsman Guide):**

| Rank | Lender | 2024 Non-QM Volume | Units | % Non-QM |
|---|---|---|---|---|
| 1 | OCMBC, Inc | $3.55B | 8,754 | 56% |
| 2 | CrossCountry Mortgage | $3.48B | 6,610 | 8% |
| 3 | Acra Lending | $3.39B | 6,820 | 100% |
| 4 | A&D Mortgage | $2.64B | 7,815 | 84% |
| 5 | Change Lending | $1.90B | 3,017 | 66% |
| 8 | theLender | $1.62B | 3,726 | 82% |
| 11 | American Heritage Lending | $1.37B | 4,125 | 100% |
| 12 | Emporium TPO | $1.27B | 2,554 | 100% |

**Key Insight:** KBRA's Non-QM Default Study (2025) analyzed 475,000+ loans from 600 NQM transactions. Weighted average cumulative default rate: **3.8%**. Realized credit losses: **0.03%**. FICO <660 = **10% default rate**. FICO >760 = **<2% default rate**. Alt Doc loans default at rates **12.9% higher** than Full Doc.

## 10.2 Full Non-QM Product Suite

### DSCR Loans
The flagship product. Underwritten entirely on property cash flow. No personal income documentation required.

### Bank Statement Loans
For self-employed borrowers. The income calculation algorithm:
```
Step 1: Collect 12 or 24 months of bank statements (personal or business)
Step 2: Sum all deposits
Step 3: Filter out: transfers, NSF fees, non-recurring deposits, loan proceeds
Step 4: Apply expense factor (typically 50% for business accounts; 0% for personal)
Step 5: Qualifying_Income = (Total_Eligible_Deposits × (1 - Expense_Factor)) / Months_Analyzed
Step 6: If 24-month analysis, also compute 12-month and use the lower figure
```

### Asset Depletion / Asset Utilization
For high-net-worth borrowers with assets but non-traditional income:
```
Formula: Monthly_Income = (Eligible_Assets - Down_Payment - Closing_Costs - Reserves) / 84

Asset eligibility:
  - Liquid assets (cash, MMA): 100%
  - Brokerage accounts: 100%
  - Retirement accounts: 70% (30% haircut for early withdrawal penalty)
  - Restricted stock: 60% (if vesting within 12 months)
  - Real estate equity: NOT eligible

Note: Fannie Mae uses 360 months; Non-QM standard is 84 months.
Kind Lending's asset utilization program (highlighted June 2026) uses 100% of eligible assets.
```

### 1099 Only
For independent contractors. Income calculated from 1099 forms over 12–24 months.

### P&L Only (Profit & Loss)
For self-employed borrowers. CPA-prepared P&L statement used as income documentation.

### Foreign National / ITIN
For non-US citizens and ITIN holders:
```
Requirements:
  - ITIN issued by IRS (or valid passport for foreign nationals)
  - Alternative credit history: international credit reports, utility payments, rental history
  - Income documentation: foreign tax returns, employer letters
  - Reserves: 12–24 months PITIA
  - LTV: typically 70–75% maximum
  - Rate premium: +0.50% to +1.50% over standard DSCR

Regulatory requirements:
  - PATRIOT Act: Customer Identification Program (CIP)
  - BSA/AML: Anti-Money Laundering screening
  - OFAC: Office of Foreign Assets Control screening
  - No ITIN: Kiavi excluded (SSN required)
```

### Interest-Only (IO) Products
Available on both DSCR and bank statement programs. Rate premium: +0.25%.
IO recast formula: `New_Payment = Remaining_Balance × r / (1 - (1+r)^(-n_remaining))`

## 10.3 Product & Pricing Engine (PPE) — Build vs. Buy

**Verdict: BUY the PPE, BUILD the analytical OS.**

Building a proprietary PPE from scratch is prohibitive. The cost of maintaining 50-state compliance, building LOS integrations, and managing lock desk infrastructure is massive and outside the core competency.

**Vendor Comparison:**

| Vendor | Best For | Key Strength | Non-QM Capability |
|---|---|---|---|
| **Optimal Blue** | Enterprise lenders | 120+ investors, BESTX™ execution, secondary market | Good but legacy architecture |
| **Polly** | Mid-to-large lenders | AI automation, cloud-native, 15 hrs/week savings | Strong but expensive |
| **Lender Price FLEX** | Non-QM specialists | Designed specifically for Non-QM; API-centric; AILA AI | Best for dedicated Non-QM |
| **LoanPASS** | Complex Non-QM | Rules-first, no-code, selected by Verus Mortgage Capital | Best for complex multi-product |

**Recommendation:** Integrate **LoanPASS** (selected by Verus Mortgage Capital for wholesale/correspondent) or **Lender Price FLEX** via API. Pass the Sovereign OS outputs (Track 1 DSCR, FICO, LTV, State PPP legality) into the vendor API. Pull raw pricing back. Run the proprietary AEY/XIRR and Monte Carlo internally.

## 10.4 Broker (TPO) Management System

```
Broker Approval Workflow:
  1. NMLS license verification (automated via NMLS Consumer Access)
  2. E&O insurance tracking (minimum $1M per occurrence)
  3. State licensing verification (all states where broker submits)
  4. Background screening (principals and owners)
  5. Compensation plan assignment (Lender-Paid vs. Borrower-Paid)

Dodd-Frank Compensation Rules:
  - Lender-Paid Compensation (LPC): Lender pays broker; broker cannot also charge borrower
  - Borrower-Paid Compensation (BPC): Borrower pays broker; lender cannot also pay broker
  - Dual compensation is prohibited
  - YSP disclosure required when rate is above par

Technology: Salesforce Financial Services Cloud + Encompass TPO Connect
```

## 10.5 Warehouse Lending Facility Management

```
Advance Rate Mechanics:
  Advance Rate: typically 97–99% of UPB for agency; 80–90% for Non-QM
  Haircut = 100% - Advance Rate
  Borrowing Base = Σ(Eligible_Loan_UPB × Advance_Rate)

Key Terms:
  Dwell time limits: typically 30–90 days before mandatory repayment
  Concentration limits: max % of any single property type or geography
  Margin call triggers: if collateral value declines below borrowing base

Major Warehouse Lenders for Non-QM:
  JPMorgan, Western Alliance, Flagstar, Customers Bank

Technology: LoanVantage or custom warehouse management system
```

## 10.6 Pipeline Hedging & Interest Rate Risk

```
Pipeline Hedging Formula:
  Hedge_Ratio = Pipeline_Volume × Pull_Through_Rate × Duration

Non-QM Pull-Through Rates:
  Non-QM: 65–75% (lower than agency due to complexity and longer processing)
  Agency: 85–90%

Hedging Instruments:
  TBA (To-Be-Announced) MBS: primary hedging instrument
  Treasury futures: secondary hedge
  SOFR swaps: for ARM-heavy pipelines
  Swaptions: for tail risk protection

Key Risk Metrics:
  Duration: sensitivity of loan value to interest rate changes
  Convexity: second-order rate sensitivity
  Basis risk: difference between hedge instrument and loan pricing
```

## 10.7 Mortgage Servicing Rights (MSR) Valuation

```
Gain-on-Sale Formula:
  GOS = Sale_Price - UPB - Origination_Costs - Hedging_Costs + MSR_Value

Non-QM MSR Fair Values (February 2026, MCT):
  Non-QM products: 3.65x – 4.25x servicing fee multiple

MSR Valuation Model:
  Key inputs: CPR (Constant Prepayment Rate), discount rate, servicing cost, float income
  Federal Reserve (June 4, 2026): MSR valuations could decrease 5–13% under stress scenarios

Technology: MIAC Analytics or MCT Trading
```

## 10.8 Quality Control (QC) Program

```
QC Program Structure:
  Independence: QC function operates independently from loan production
  Written Plan: comprehensive QC policy and procedure document
  Defect Taxonomy: aligned with Fannie Mae loan defect taxonomy

Pre-Funding QC:
  Random sampling: 10% of all loans
  Risk-based sampling: 100% review of high-risk files
  Focus: income/employment verification, asset verification, appraisal review

Post-Closing QC:
  Random sampling: 10% of closed loans
  EPD (Early Payment Default): 100% review of all EPDs
  Defect rate target: <2% critical defects

Technology: ACES Quality Management or LoanLogics

Rating Agency Requirements (for securitization):
  KBRA: requires independent QC program with documented procedures
  DBRS: requires pre-funding and post-closing QC with defect reporting
```

## 10.9 Capital Markets & Securitization

```
Non-QM RMBS Structuring:
  Senior-subordinate tranching
  Overcollateralization
  Excess spread
  Credit enhancement levels: typically 5–15% for Non-QM pools

Pool-Level Reporting Metrics (for rating agencies):
  Weighted Average DSCR
  Balance-Weighted Debt Yield
  Weighted Average FICO
  Weighted Average LTV
  Geographic concentration
  Property type concentration
  Documentation type distribution

Key Rating Agencies for Non-QM:
  KBRA (Kroll Bond Rating Agency) — most active in Non-QM
  DBRS Morningstar
  Fitch Ratings
  S&P Global

KBRA Default Study Findings (2025):
  WA cumulative default rate: 3.8%
  Realized credit losses: 0.03%
  FICO <660: ~10% default rate
  FICO >760: <2% default rate
  Alt Doc vs Full Doc: Alt Doc defaults 12.9% higher
  COVID vintages (2019–2020): 5–5.5% cumulative defaults
  2022–2023 vintages: ~4–4.1% cumulative defaults
```

---

# PART ELEVEN: ACADEMIC RESEARCH FOUNDATION

## 11.1 Core Papers — Must Be in the Master

**Paper 1: Structural Credit Risk for Illiquid Debt**
Blanc-Brude, F., & Hasan, M. (2016). "A Structural Model of Credit Risk for Illiquid Debt." SIPAMetrics.
*Key Finding:* Defines default as DSCR < 1.0 (hard default) or DSCR < contractual threshold (technical default) using DSCR dynamics as a scale-independent quantity. This is the academic foundation for the dual-track engine.

**Paper 2: The Gaussian Copula Failure**
Li, D.X. (2000). "On Default Correlation: A Copula Function Approach." *Journal of Fixed Income*, 9(4), 43–54.
*Key Finding:* Introduced Gaussian copulas to mortgage finance. Its failure to capture tail dependence was a primary driver of the 2008 financial crisis. The Sovereign OS explicitly forbids Gaussian copulas.

**Paper 3: KBRA Non-QM Default Study**
KBRA. (2025). "Non-QM Default Study: A Decade of Insights."
*Key Finding:* WA cumulative default rate = 3.8%; FICO <660 = 10% default rate; Alt Doc loans default 12.9% higher than Full Doc. These numbers must be hardcoded into Monte Carlo calibration as the empirical baseline.

**Paper 4: Copula Methods in Finance**
Cherubini, U., Luciano, E. & Vecchiato, W. (2004). *Copula Methods in Finance.* Wiley.
*Key Finding:* The definitive textbook on copula functions. Provides the mathematical framework for t-copula and Clayton copula implementation.

**Paper 5: Monte Carlo Methods in Financial Engineering**
Glasserman, P. (2003). *Monte Carlo Methods in Financial Engineering.* Springer.
*Key Finding:* The canonical reference for variance reduction techniques (antithetic variates, control variates, quasi-Monte Carlo).

**Paper 6: Financial Statement Analysis with LLMs**
Kim, A.G., Muhn, M. & Nikolaev, V.V. (2024). "Financial Statement Analysis with Large Language Models." University of Chicago Booth. [https://arxiv.org/html/2407.17866v1](https://arxiv.org/html/2407.17866v1)
*Key Finding:* Validates RAG + Chain-of-Thought prompting as state-of-the-art for generating accurate, source-traceable financial reports.

**Paper 7: Fairness of Credit Scoring Models**
Hurlin, C., Pérignon, C., & Saurin, S. (2022). "The Fairness of Credit Scoring Models." *Management Science*, 68(11), 7945–7965. [https://arxiv.org/abs/2205.10200](https://arxiv.org/abs/2205.10200)
*Key Finding:* Framework for fairness-aware ML in credit scoring. Required for ECOA/Reg B compliance.

**Paper 8: DSCR Required Ratio**
Rodríguez, R.A. (2024). "A Required Debt Service Coverage Ratio Related to the Economic Value of the Asset Involved." *Journal of Financial Risk Management*, 13, 618–642. [DOI:10.4236/jfrm.2024.134029](https://doi.org/10.4236/jfrm.2024.134029)
*Key Finding:* Academic framework for determining the minimum DSCR required given the economic value of the underlying asset.

**Paper 9: SHAP for Credit Scoring**
Hjelkrem, L.O., & de Lange, P.E. (2023). "Explaining Deep Learning Models for Credit Scoring with SHAP." *Journal of Risk and Financial Management*, 16(4), 221. [https://www.mdpi.com/1911-8074/16/4/221](https://www.mdpi.com/1911-8074/16/4/221)
*Key Finding:* Practical implementation of SHAP values for generating specific adverse action reasons from ML models.

**Paper 10: Non-QM AI Underwriting**
Jain, L. (2026). "Intelligent Document Processing and Machine Learning in Non-QM Mortgage Origination." SSRN. [https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6521838](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6521838)
*Key Finding:* State-of-the-art AI/ML approaches for Non-QM income verification and fraud detection.

---

# PART TWELVE: BUILD ROADMAP & ACCEPTANCE CRITERIA

## 12.1 Three-Phase Build Order

**Phase 1 — Golden Spine (Zero Hallucination Risk):**
- Dual-track + golden math (all 23 acceptance criteria)
- Returns engine + B′ (reassessment, after-tax with §1250/NIIT/PAL, insurance gate, BRRRR seasoning, cost-seg flag, bonus-dep per OBBBA)
- ARM reset engine (B″)
- True-cost AEY + lender ranking
- PPP branch gate (E.1–E.3) with MN HF 3437 as ENACTED
- Reserves (tiered/capped/ranged)
- 9-lender matrix (Griffin, Defy, Easy Street, Lima One, Kiavi, New Silver, Deephaven, American Heritage, Visio)
- Kill criteria + Track-2 acknowledgment
- Two-quote rule + IC memo + reproducible snapshots

**Phase 2 — Intelligence:**
- STR legality DB + monthly seasonality DSCR output
- Portfolio center
- Monte Carlo (pre/after-tax, t-copula)
- Fit scoring
- HOA parsing
- IO/ARM recast + double-shock year
- Blanket exit warnings
- Annual re-index (OH/PA)
- Pending-legislation + counterparty watch

**Phase 3 — Sovereign:**
- STR regulation monitoring
- Guideline PDF extraction (OCR pipeline)
- Historical fit-tier calibration (only then may probabilities appear)
- Live rent/AirDNA/Treasury APIs
- SOFR forward-curve integration
- Confidence auto-decay

## 12.2 Acceptance Criteria — Definition of Done (v11, 23 Criteria)

1. Track 1 + Track 2 side by side, never blended.
2. Reproduces every A.2 golden value; all stress cells reconcile to formulas.
3. Gross/PITIA AND NOI/P&I; lower-of(lease,1007) + vacant rule; no LT vacancy haircut by default.
4. Returns: cap/CoC/debt-yield/equity-multiple/break-even + levered IRR with exit-cap sensitivity (PRE- and AFTER-TAX). Return Grade on after-tax.
5. Property-tax reassessment on purchase modeled per state; PITIA uses reassessed tax (not seller's current bill).
6. After-tax engine: depreciation (27.5yr, land-allocated), §1250 recapture (≤25%), NIIT (3.8% if MAGI exceeds threshold), passive-loss ($25K allowance / MAGI thresholds $100K–$150K / REP exception), 1031 alternate exit; bonus-dep per OBBBA (100% for post-1/19/25; 40%/20% for prior).
7. Cost-seg flag: surface for properties ≥$450K; if elected, compute accelerated deduction by component class + bonus-dep overlay.
8. Insurance: geography risk model + insurability KILL gate in all high-risk zones (FL, CA, TX Gulf, LA Coastal); feeds PITIA and OpEx separately.
9. BRRRR refi-seasoning gate (ARV vs cost basis) with carry during season.
10. ARM reset engine (B″): reset rate = SOFR + margin, capped at cap structure; Track 1 at reset displayed; double-shock year flagged for IO+ARM files.
11. Rates: dated triplet with 10yr/5yr/SOFR anchors at current values (10yr 4.44–4.47%, 5yr 4.26%, SOFR 3.59% as of June 17, 2026); risk-tiered spread ~175–450 bps; re-price as anchors move.
12. True cost per lender: AEY via XIRR at 12/24/36/60-mo + APR-equiv; no figure without all inputs; YSP flag.
13. Lender screen: eligibility → fit tier (reason) → AEY → confidence (tiebreaker only); two-quote enforced.
14. PPP gate BRANCHES (entity×bank×purpose) before any ban; per-state penalty BASE (original vs remaining) and sale/refi triggers; MN HF 3437 encoded as ENACTED (eff. 8/1/26); OH/PA annually-indexed with January re-confirm.
15. No-PPP re-pricing re-runs both tracks AND the return model.
16. Reserves: tiered/capped/geography/portfolio-stacked/ranged; cash-out seasoning caveat noted.
17. STR legality gate before income; three-source min() (appraisal governs); monthly seasonality bar chart in Phase 2 for every STR file.
18. Every lender claim: one of four provenance labels + verified_date; no render without them; fit tiers, never approval percentages; counterparty flag.
19. Verdict (PROCEED/RESTRUCTURE/PASS) + binding constraint + $ deltas + Track-2 ack + kill-switch conditions.
20. Kill criteria (incl. insurability + BRRRR seasoning + ARM double-shock) before lender ranking.
21. IC memo + sensitivity + risk + true-cost exports; reproducible snapshots (inputs + lender versions + rate anchors).
22. Portfolio: ΣNOI/ΣADS, debt yield, concentration, refi watchlist, counterparty-continuity flag.
23. NJ LLC/entity PPP defaults to HIGH-RISK (lender-split state) until specific lender matrix confirms entity type; never presents any single lender's NJ matrix as universal.

## 12.3 Standard of Care (ALWAYS / NEVER)

| ALWAYS | NEVER |
|---|---|
| Both DSCR tracks side by side | Blend the two tracks |
| Returns on Track 2; show after-tax (§1250/NIIT/PAL) | Grade a deal on pre-tax IRR alone |
| Use REASSESSED purchase taxes in PITIA | Use the seller's current tax bill |
| Treat insurability as a gate in high-risk zones | Treat insurance as a static line item |
| Rate triplet, dated, with 10yr/5yr/SOFR anchors | One undated rate / flat spread |
| Penalty on the CORRECT per-state base | Global "remaining-balance, sale-AND-refi" rule |
| Branch PPP on entity×bank×purpose | Encode a consumer-statute ban as universal |
| Provenance label on every claim | Citation markers that resolve to nothing |
| Reserve RANGES; confidence as tiebreaker | Let uncalibrated confidence reorder lenders |
| Index OH/PA annually; MN HF 3437 encoded as enacted | Hard-code indexed thresholds or stale law |
| Fit tiers with reasons | Numeric approval probabilities |
| Two-quote + AEY delta in dollars | A single quote |
| Verdict + binding constraint + $ deltas | A verdict without its assumptions |
| ARM reset Track 1 modeled at stress SOFR | Quote ARM rate without reset scenario |
| NIIT modeled for high-MAGI exits | Ignore 3.8% stack on §1250 recapture |
| Bonus-dep per OBBBA (100% post-1/19/25) | Hardcode an outdated bonus-dep % |
| Operator is decision-of-record | Imply the engine is a loan commitment |

---

# PART THIRTEEN: COMPLETE REFERENCE REGISTRY

## 13.1 Source Registry (June 17, 2026)

| Category | Source | Status |
|---|---|---|
| **Math** | Direct computation (both audits concur). Golden vector A.2. | Verified |
| **Rates** | Griffin (6.125–7.5%, ARM 5.125%), HomeAbroad (6.12–6.49%), Texas United (6.629% APR Jun 12) | Verified Jun 2026 |
| **Treasury** | FRED DGS10: 4.47% (Jun 15), 4.44% (Jun 16–17). 5yr: 4.26% (Northmarq). SOFR 30d: 3.59%. Fed FFR: 3.62% (FRB H.15 Jun 16). FFR target 3.50–3.75%, held 4th consecutive meeting. | Verified Jun 2026 |
| **PPP Law** | Harpoon 2026 + AAPL + STG/Newfi + statutes. MN HF 3437 ENACTED Apr 23 2026, eff. Aug 1 2026. OH ORC §1343.011 (original-principal base). PA §406 LIPL. NJ N.J.S.A. 46:10B-2 (lender split). | Verified Jun 2026 |
| **Tax** | IRC §167/168 (27.5yr depreciation). OBBBA (signed Jan 2025): 100% bonus dep permanently for assets acquired after Jan 19, 2025. §1250 recapture max 25%. §1411 NIIT 3.8%. §469 passive-loss: $25K allowance, $100K–$150K MAGI phase-out, REP 750hr+50% test. | Verified |
| **Tax-Reval** | CA Prop 13: resets to purchase price at sale. TX: 2–3% of market value. FL: purchase-year reset. | Verified |
| **Insurance** | >90% FL / 83% CA investors missed deals (2024 survey). 1-in-3 affordable housing providers saw 25%+ premium increases. Insurify 2026: double-digit rate increases projected. | Verified 2024–2026 |
| **STR** | Easy Street Capital, Lima One, American Heritage (75%/100%, appraisal governs), Visio (broadest STR). | Verified 2026 |
| **Lenders** | 9 anchors, Jun 2026. Griffin FICO 729 (2025 avg 739), $4M jumbo, min 620 — verified. Deephaven: stale — highest reverify priority. | Verified Jun 2026 |
| **Non-QM Market** | Polygon Research: $239B in 2025. Optimal Blue: 9% of lock volume Dec 2025. Scotsman Guide 2025 rankings. | Verified 2025–2026 |
| **KBRA** | Non-QM Default Study (2025): 3.8% WA default rate, 0.03% realized losses, 475K+ loans. | Verified 2025 |
| **Unverified** | Griffin $20M figure; WA ARM blanket ban; Kiavi AirDNA acceptance; OH/PA exact 2026 indexed figures (January re-confirm). | Unverified |

---

*END OF COMPLETE SOVEREIGN MASTER DOCUMENT*
*Data as of June 17–18, 2026. Verify lender terms directly. Re-price against Treasury anchor daily. Re-confirm OH/PA each January. Watch MN HF 3437 effective date August 1, 2026.*
# PART FOURTEEN: DEEP RESEARCH & ACADEMIC INTEGRATION

This section details the state-of-the-art algorithms, academic papers, and regulatory frameworks that power the DSCR Sovereign OS and the Non-QM Wholesale Lender operations. This research was extracted from 36 distinct domains covering quantitative finance, artificial intelligence, and regulatory law.

## 14.1 Algorithmic Risk & Pricing Models

### Domain 1: Structural Credit Risk & DSCR Dynamics
Traditional DSCR is a static ratio. The Sovereign OS implements a structural credit risk model for illiquid debt [1]. 
*   **The Algorithm:** Default is modeled not as a stochastic event, but as the inability to service debt using the Free Cash Flow Available for Debt Service (CFADS). A hard default occurs when `DSCR < 1.0`; a technical default occurs when `DSCR < contractual_threshold`.
*   **Predictive ML:** Gradient boosting machines (XGBoost/LightGBM) are utilized to capture complex, non-linear relationships between financial indicators (FICO, LTV, geographic vintage) and DSCR outcomes [2].

### Domain 2: Copula-Based Monte Carlo Simulation
The Gaussian copula systematically underestimates joint downside risk and was a primary driver of the 2008 financial crisis [3].
*   **The Algorithm:** The engine implements the **Student-t Copula (5–7 degrees of freedom)** to capture fat-tail joint downside risk, and the **Clayton Copula** for strong lower-tail dependence (modeling simultaneous vacancy spikes and rent compression) [4].
*   **Variance Reduction:** Quasi-Monte Carlo (Sobol sequences) and Antithetic Variates are employed to reduce simulation error by 50–80% without increasing the trial count, ensuring the 10,000-trial simulation completes within the 10-minute SLA [5].

### Domain 3: All-In Effective Yield (AEY) & XIRR
APR is a flawed metric for adjustable-rate mortgages with prepayment penalties. AEY provides the true cost of capital [6].
*   **The Algorithm:** The system calculates the Internal Rate of Return (XIRR) of the exact borrower cash flows using **Brent's Method** (via SciPy's `brentq`). This algorithm combines bisection and inverse quadratic interpolation, guaranteeing convergence even with non-monotonic cash flows caused by balloon payments or complex PPP structures.

### Domain 4: ARM & SOFR Rate Reset Modeling
*   **The Algorithm:** The fully indexed rate is modeled as `New_Rate = min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))`. The SOFR forward curve is constructed using CME SOFR futures contracts [7].
*   **The Double-Shock:** The system explicitly models the "payment cliff" that occurs when an Interest-Only (IO) period expires simultaneously with a rate reset, flagging this as a "Kill-Switch Year."

## 14.2 Artificial Intelligence & Intake Operations

### Domain 5: Hybrid OCR & Document Extraction
Pure LLMs hallucinate numbers; pure OCR misses contextual meaning.
*   **The Architecture:** The intake pipeline routes digital PDFs to **Docling** (for perfect table reconstruction), scanned documents to **Mistral OCR 2505**, and complex layouts to **Reducto** or **LlamaParse** [8] [9].
*   **Structured Output:** The system uses Python's `instructor` library with Pydantic to force the LLM to output schema-validated JSON, complete with bounding box coordinates and confidence scores for every extracted field [10].

### Domain 6: Explainable AI (XAI) for Adverse Action
CFPB Circular 2022-03 mandates that creditors must provide specific, accurate reasons for adverse action, explicitly forbidding the "black-box" defense for AI/ML models [11].
*   **The Algorithm:** The system integrates **SHAP (SHapley Additive exPlanations)**. SHAP values mathematically isolate the exact contribution of each feature to a loan denial: `φ_i = Σ_{S⊆F\{i}} [|S|!(|F|-|S|-1)!/|F|!] [f(S∪{i}) - f(S)]` [12]. This allows the system to auto-generate legally compliant adverse action notices.

### Domain 7: Automated Fraud Detection
Investment-property applications have a high incidence of fraud (1 in 44 applications per Cotality Q1 2026).
*   **The Algorithms:** The system utilizes Convolutional Neural Networks (CNNs) for visual anomaly detection in bank statements, combined with metadata fingerprinting (SHA-256 hash, timestamp analysis, font consistency scoring) [13]. Cross-document reconciliation ensures lease amounts match bank deposits and align with RentCast AVM estimates.

### Domain 8: IC Memo & Report Generation
*   **The Architecture:** The system uses **Retrieval-Augmented Generation (RAG)** combined with **Chain-of-Thought (CoT)** prompting to generate structured Investment Committee memos [14]. Every numerical claim is linked to its source document, page, and bounding box, preventing hallucinations and ensuring auditability for rating agencies.

## 14.3 Regulatory & Capital Markets Engineering

### Domain 9: Graph-Native Compliance Architecture
*   **The Architecture:** The system uses a Property Graph Model (PGM) implemented in PostgreSQL with `pgvector`. The **Semantic Diff Engine** classifies input changes by facet (Location, Timing, Budget, Legal). A structural change triggers a causal propagation through the legal branching gates, generating a "Reconciliation Proposal" rather than failing silently [15].

### Domain 10: Mortgage Servicing Rights (MSR) Valuation
*   **The Algorithm:** Gain-on-Sale is calculated as `GOS = Sale_Price - UPB - Origination_Costs - Hedging_Costs + MSR_Value`. MSR valuation requires modeling Constant Prepayment Rates (CPR), discount rates, servicing costs, and float income. Current Non-QM MSR fair values are 3.65x - 4.25x the servicing fee multiple.

### Domain 11: Pipeline Hedging
*   **The Algorithm:** To protect against interest rate risk between rate lock and loan sale, the system calculates the hedge ratio: `Hedge_Ratio = Pipeline_Volume × Pull_Through_Rate × Duration`. Non-QM pull-through rates are modeled at 65-75% (lower than agency loans). Hedging instruments include TBA MBS and Treasury futures.

### Domain 12: After-Tax Real Estate Modeling
*   **The Architecture:** The engine hardcodes the One Big Beautiful Bill Act (OBBBA) 100% bonus depreciation for assets acquired post-Jan 19, 2025. It models §1250 depreciation recapture (max 25%), the Net Investment Income Tax (3.8% NIIT for high-MAGI filers), and passive activity loss rules (§469). It also models 1031 exchange optimization, comparing the after-tax proceeds of a direct sale against a like-kind exchange.

## 14.4 Key Academic Papers & Sources

[1] Blanc-Brude, F., & Hasan, M. (2016). "A Structural Model of Credit Risk for Illiquid Debt." SIPAMetrics.
[2] Shukla, D. (2024). "The New Frontier in Econometrics: Machine Learning for Risk Assessment and Management." *International Journal of Progressive Research in Science and Engineering*, 5(1), 15–20.
[3] Li, D.X. (2000). "On Default Correlation: A Copula Function Approach." *Journal of Fixed Income*, 9(4), 43–54.
[4] Cherubini, U., Luciano, E., & Vecchiato, W. (2004). *Copula Methods in Finance.* Wiley.
[5] Glasserman, P. (2003). *Monte Carlo Methods in Financial Engineering.* Springer.
[6] Brealey, R.A., Myers, S.C. & Allen, F. (2023). *Principles of Corporate Finance.* McGraw-Hill.
[7] Xu, M. (2021). "SOFR Derivative Pricing Using a Short Rate Model." SSRN.
[8] Docling. (2024). [https://www.docling.ai](https://www.docling.ai)
[9] Mistral AI. (2025). "Mistral AI Introduces AI-Powered OCR."
[10] Instructor Library. [https://python.useinstructor.com](https://python.useinstructor.com)
[11] CFPB Circular 2022-03. "Adverse action notification requirements in connection with credit decisions based on complex algorithms."
[12] Hjelkrem, L. O., & de Lange, P. E. (2023). "Explaining Deep Learning Models for Credit Scoring with SHAP." *Journal of Risk and Financial Management*, 16(4), 221.
[13] Hernandez Aros, L. et al. (2024). "Financial fraud detection through the application of machine learning techniques." *Nature Scientific Reports*.
[14] Kim, A.G., Muhn, M. & Nikolaev, V.V. (2024). "Financial Statement Analysis with Large Language Models." University of Chicago Booth.
[15] Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly.
# PART FIFTEEN: NON-QM WHOLESALE LENDER OPERATIONS & GAP REMEDIATION

To operate as the best Non-QM wholesale lender in the nation, the DSCR Sovereign OS must be integrated into a complete operational infrastructure. This section details the operational requirements, product breadth, and the 12 critical gaps identified during the build audit, along with their exact remediation plans.

## 15.1 The Full Non-QM Product Suite

While DSCR is the flagship product, a top-tier wholesale lender must offer a complete spectrum of Non-QM products.

### Bank Statement Loans
For self-employed borrowers who cannot qualify using traditional tax returns.
*   **The Algorithm:** The engine parses 12 or 24 months of personal or business bank statements.
    `Qualifying_Income = (Total_Eligible_Deposits × (1 - Expense_Factor)) / Months_Analyzed`
*   **Rules:** Transfers, NSF fees, and loan proceeds are filtered out. A standard expense factor (typically 50%) is applied to business accounts; personal accounts typically use a 0% or 10% expense factor depending on the lender matrix.

### Asset Depletion / Asset Utilization
For high-net-worth borrowers with significant liquid assets but low verifiable income.
*   **The Algorithm:** `Monthly_Income = (Eligible_Assets - Down_Payment - Closing_Costs - Reserves) / 84_Months`. (The 84-month divisor is the Non-QM standard, replacing the Fannie Mae 360-month standard).
*   **Haircuts:** Liquid assets (100%), Brokerage (100%), Retirement accounts (70% — applying a 30% haircut for early withdrawal penalties). Real estate equity is generally ineligible.

### Foreign National & ITIN Loans
For non-U.S. citizens or borrowers without a Social Security Number.
*   **Rules:** Requires a valid ITIN or passport. Alternative credit history (international reports, utility payments) is accepted. 
*   **Pricing:** These loans typically carry a +0.50% to +1.50% rate premium and require 12–24 months of reserves.
*   **Compliance:** Strict adherence to PATRIOT Act (CIP), BSA/AML, and OFAC screening is mandatory.

## 15.2 Product & Pricing Engine (PPE) Integration

**The Gap:** The Sovereign OS lacks a centralized rate sheet and distribution mechanism for brokers.
**The Remediation (Build vs. Buy):** Do not build a proprietary PPE. The cost of maintaining 50-state compliance and LOS integrations is prohibitive.
*   **Action:** Integrate **LoanPASS** or **Lender Price FLEX** via API. LoanPASS is recommended for its "rules-first" decisioning engine, which handles complex Non-QM matrices (DSCR, Bank Statement) better than legacy systems like Optimal Blue [1] [2].
*   **Workflow:** Pass the Sovereign OS outputs (Track 1 DSCR, FICO, LTV, State PPP legality) into the vendor API. Pull the raw pricing data back. Run the proprietary AEY/XIRR and Monte Carlo stress tests internally.

## 15.3 Broker (TPO) Management & Compensation

**The Gap:** No system to onboard, vet, or manage Third-Party Originators (TPOs).
**The Remediation:** Implement a dedicated Broker CRM and compliance portal.
*   **Workflow:** Automated NMLS license verification, E&O insurance tracking (minimum $1M per occurrence), and background screening for principals.
*   **Compliance:** Strict management of Dodd-Frank compensation rules (Lender-Paid vs. Borrower-Paid compensation). Dual compensation is strictly prohibited. YSP disclosure is required when the rate is above par.
*   **Technology:** Salesforce Financial Services Cloud integrated with Encompass TPO Connect.

## 15.4 Warehouse Lending & Pipeline Management

**The Gap:** No system to manage warehouse lines of credit or pipeline hedging.
**The Remediation:** Implement warehouse management and pipeline hedging algorithms.
*   **Warehouse Lines:** Manage advance rates (typically 80–90% for Non-QM), dwell time limits (30–90 days), and borrowing base calculations to prevent margin calls. Major Non-QM warehouse lenders include JPMorgan, Western Alliance, and Flagstar.
*   **Pipeline Hedging:** Calculate `Hedge_Ratio = Pipeline_Volume × Pull_Through_Rate × Duration`. Model Non-QM pull-through rates at 65–75%. Hedge the pipeline using TBA MBS or Treasury futures to protect against interest rate volatility between rate lock and loan sale [3].

## 15.5 Quality Control (QC) & Securitization

**The Gap:** No post-closing audit system, a hard requirement for securitization.
**The Remediation:** Establish an independent QC program.
*   **QC Process:** Pre-funding QC on a random 10% sample, plus 100% review of high-risk files (e.g., Early Payment Defaults). The defect rate target must be <2% critical defects.
*   **Securitization Reporting:** The system must generate pool-level metrics for rating agencies (KBRA, DBRS, Fitch), including Weighted Average DSCR, Balance-Weighted Debt Yield, and LTV distributions [4].

---

# PART SIXTEEN: CONCLUSION & FINAL BUILD DIRECTIVE

The blueprint is complete. We have synthesized the strategic mandate, the mathematical spine, the AI-powered operations, the regulatory compliance architecture, and the capital markets execution strategy required to build the best Non-QM wholesale lender in the nation.

**The Five Core Directives:**
1.  **Enforce the Dual-Track:** Never blend lender qualification with investor survival. The Godmode Rule (mandatory negative cash flow acknowledgment) is the ultimate liability shield.
2.  **Banish the Gaussian Copula:** Use the t-copula or Clayton copula for all Monte Carlo stress testing to accurately model joint downside risk.
3.  **Preserve Context via Graph:** Use the Semantic Diff Engine and the JSONB Evidence Vault to ensure that every rule, rate, and guideline is traceable, verifiable, and legally sound.
4.  **Automate with Explainable AI:** Use the Hybrid OCR pipeline for intake and SHAP values for adverse action compliance. Never rely on a "black-box" model.
5.  **Buy the PPE, Build the OS:** Integrate LoanPASS or Lender Price FLEX for rate distribution, but keep the proprietary AEY, Monte Carlo, and IC Memo generation inside the Sovereign OS.

This document serves as the single source of truth for the entire organization—from the engineering team writing the algorithms to the capital markets desk negotiating warehouse lines.

*Data as of June 18, 2026. Verify all lender terms directly. Re-price against the Treasury anchor daily. Re-confirm OH/PA thresholds each January. Watch MN HF 3437 effective date August 1, 2026.*

---

## References

[1] LeadPops. (2026). "Mortgage Pricing Engines Compared: Optimal Blue vs Polly vs Lender Price."
[2] LoanPASS. "Verus Mortgage Capital Selects LoanPASS As Non-QM PPE."
[3] Mortgage Bankers Association. "Mortgage Pipeline Hedging 101."
[4] KBRA. (2025). "KBRA Releases Research–Non-QM Default Study: A Decade of Insights."
