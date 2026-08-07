---
type: research
status: drafted
confidence: 3
title: DSCR Sovereign OS — Topical Cross-Reference Index
summary: "**Workspace:** `C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE\\`"
entities:
  - concept/appreciation
  - concept/arm
  - concept/cap-rate
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/kbra
  - data/trepp
  - lender/acra-lending
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/ocmbc
  - lender/pennymac
  - lender/ready-capital
  - lender/rocket-pro
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - math/copula
  - math/sobol
  - math/t-copula
  - ml/conformal
  - ml/shap
  - ml/tabpfn
  - ml/timesfm
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/hoepa
  - regulation/reg-z
  - regulation/section-1071
  - regulation/tila
  - sprint/2
  - sprint/3
  - sprint/4
  - sprint/5
  - sprint/6
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - tax/qoz
  - tax/section-179
  - topic/2-4-unit
  - topic/condo
  - topic/condotel
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - ml/xgboost
  - topic/adverse-action
  - topic/after-tax
  - topic/apex
  - topic/architecture
  - topic/cecl
  - topic/compliance
  - topic/cure-rate
  - topic/default-rate
  - topic/flood-insurance
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/llpa
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/recheck
  - topic/reserves
  - topic/short-rate
  - topic/stress-test
  - topic/tax
  - topic/yield-curve
  - type/audit
source: ANALYSIS/TOPICAL_INDEX.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Topical Cross-Reference Index

**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\`
**Date:** 2026-06-18
**Purpose:** Cross-cutting topic index. For each topic, every source file with the section/line that covers it. Use this when you need ALL the data on a specific topic without re-reading 39 documents.

---

## How to Read

Each topic has 3 sections:
- **Primary Sources** — documents where the topic is the main subject
- **Data Points** — exact values to use (extracted from multiple sources, conflicts resolved)
- **Cross-References** — links to related topics

File paths use the **safe-name short versions** when possible. Full original paths in `MASTER_ANALYSIS.md` Appendix.

---

# TOPIC 1: DUAL-TRACK DSCR MATH (The Non-Negotiable Core)

## Primary Sources
- `DSCR Forumals.md` — Track A vs B definitions, golden vectors
- `Master DSCR Knowledge Document.md` §1, §2 — DSCR principles, formulas, LTR/STR income rules
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.1-2.2 — Math spine
- `THE DEFINITIVE BLUEPRINT.md` §II — Dual-track DSCR
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §1, §3 — Deterministic core + structural credit risk
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 1, 3 — Python implementation
- `Sprint 5 Findings.md` — Golden vector verification (Deal A)

## Data Points
- **Track 1**: `T1_DSCR = Qualifying_Gross_Rent / PITIA` (or ITIA for IO)
- **Track 2**: `T2_DSCR = (Gross_Rent × (1 - Vacancy) - Management - Maintenance) / PITIA`
- **Lower-of Rule** (LTR): use LOWER of (signed lease, 1007 appraisal market rent); if property vacant, use 1007
- **STR formula**: documented gross × 0.8 (20% haircut) or min(LTR, projected × 0.70-0.80, documented 12-mo)
- **1007 vacancy factor for 2-4 unit**: 25% (Fannie Mae Form 1007)
- **LTR Track B defaults**: vacancy 5-10%, mgmt 8-10%, maintenance 5-7%, CapEx 5-10%
- **STR OpEx**: 45-65% of gross (vs LTR 30-45%)
- **Rounding up DSCR**: NOT permitted
- **IO**: T1 denominator switches to ITIA (15-22% denominator relief)

## Cross-References
- TOPIC 2 (Math spine — payment_factor + PITIA)
- TOPIC 6 (Golden Vectors — pinned tests)
- TOPIC 9 (STR Income — see STR module)
- TOPIC 14 (Verus S&P — 89.44% property-focused DSCR, 1.10x weighted avg)

## Conflicts Resolved
- None significant; Sovereign Master and DSCR Forumals align on Track 1/2 definitions
- Track A formula in Forumals: $3000/$2580 = 1.16x (uses different golden deal than Sovereign Master's 1.05x)

---

# TOPIC 2: MATH SPINE — PAYMENT FACTOR, PITIA, MAX PRICE, DEAL-BREAK RATE

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.2-2.3 (full formulas)
- `DSCR Forumals.md` (golden test suite)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 1 (Python code)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (deterministic core)
- `Sprint 5 Findings.md` (golden vector Deal A verification)
- `dscr_sovereign_os_architectural_debt_and_math.md` (8 architectural debts)

## Data Points (Pin as Unit Tests)

### Payment Factor
```
factor(r) = r(1+r)^360 / ((1+r)^360 - 1), where r = annual_rate / 12

Verified:
  6.125% → 0.0060761
  7.00%  → 0.0066530
  8.25%  → 0.0075127
```

### Interest-Only
```
Monthly_IO = Loan × rate / 12
IO recast: New_Payment = Remaining_Balance × r / (1 - (1+r)^(-n_remaining))
```

### PITIA
```
PITIA = P&I + Monthly_Tax + Monthly_Insurance + Monthly_HOA + Monthly_MI
```

### Golden Deal (Deal A) — Sovereign Master
$425K / 75% LTV / 7.00% / lease $3,000 = 1007 / tax $5K / ins $2K / HOA $150:
- P&I = $318,750 × 0.0066530 = $2,121
- PITIA = $2,121 + $416.67 + $166.67 + $12.50 = $2,855
- T1 DSCR @ 7.00% = $3,000 / $2,855 = **1.05**
- T1 DSCR @ 8.25% = $3,000 / $3,192 = **0.96**
- T2 DSCR (8% vac, 8% mgmt) = 0.88 → negative $335/mo
- Rent break-even (T1=1.0) = $2,855 (−4.83%)
- Deal-break rate ≈ **7.67%**
- Max price at T1=1.0 ≈ **$454,100**

**Canonical Confirmed (Round 21 T1 Claims #1 + #4 — TIER 1 CONFIRMED 5/5):**
- **T1 Claim #1**: DSCR = Qualifying_Rent / PITIA (Track 1, monthly tax/insurance 1/12 convention) — 13 sources documented (Pennymac, Newfi, Lakeview, Coldesina, Lendmire, Griffin Funding, theLender, Fannie Mae SG, Sovereign Master, Build-Ready, Master Synthesis, Recheck, Definitive Blueprint). 1/12 monthly tax/insurance convention is universal across correspondent, wholesale, retail, and regulatory sources.
- **T1 Claim #4**: payment_factor(7.00%, 360) = 0.0066530 (closed-form: `factor(r,n) = r(1+r)^n / ((1+r)^n − 1)`) — 7 sources (Smailes textbook + Fannie/Freddie GSE tables + numpy_financial + Excel/Sheets PMT + 3 internal docs). Cross-verified at 6.125%/7.00%/8.25%. Tolerance: 1e-7 with float64.

### Golden Deal (Forumals) — DEPRECATED (Round 20 Rev 10)
- Forumals.md REJECTED in Round 5 (Forumals vector uses 6.60% rate, not 7.00%)
- Canonical: Sovereign Master Deal A at 7.00%/30yr on $318,750 = $318,750 × 0.0066530 = **$2,121** P&I (mathematically correct per T1 Claim #4)
- Forumals $1,999 figure corresponds to lower-rate variant (likely 6.60%); document as legacy/deprecated
- Engine uses Sovereign Master's $2,121 P&I as canonical golden vector

### Deal-Break Rate (brentq bisection)
```python
def deal_break_rate(qualifying_rent, taxes_monthly, insurance_monthly, hoa_monthly,
                    loan_amount, n_months=360, dscr_floor=1.00):
    def dscr_at_rate(r):
        monthly_rate = r / 12
        if monthly_rate == 0:
            pi = loan_amount / n_months
        else:
            pi = loan_amount * (monthly_rate * (1 + monthly_rate)**n_months) / \
                 ((1 + monthly_rate)**n_months - 1)
        pitia = pi + taxes_monthly + insurance_monthly + hoa_monthly
        return qualifying_rent / pitia - dscr_floor
    return brentq(dscr_at_rate, 0.001, 0.25)  # Search 0.1% to 25%
```

### Max Purchase Price (analogous, solved via brentq on price)

### Pre-Tax Returns Engine
```
EGI = GPR × (1 - Vacancy)
OpEx = Mgmt + Maint + Tax + Ins + HOA + Util + Turnover  [NO debt, NO capex]
NOI = EGI - OpEx
ADS = P&I × 12
Cap Rate = NOI / Price
Yield-on-Cost = Stabilized_NOI / Total_Cost
CoC = (NOI - ADS) / Cash_Invested  [Year 1, 3, 5]
Debt Yield = NOI / Loan  [target ≥9% institutional]
Break-even Occupancy = (OpEx + ADS) / GPR
Equity Multiple = Total_Distributions / Total_Equity_Invested
DSCR Cushion = Track1 - Lender_Floor
```

### Sensitivity Grid
4 hold (3/5/7/10yr) × 3 exit cap (bear/base/bull) × 4 rent growth (0/1/2/3%) = **48-cell matrix**

## Cross-References
- TOPIC 3 (Returns Engine — pre-tax IRR + exit model)
- TOPIC 4 (After-Tax IRR — OBBBA, §1250, NIIT)
- TOPIC 6 (Golden Tests)
- TOPIC 7 (Monte Carlo — uses PITIA + debt service)

---

# TOPIC 3: PRE-TAX RETURNS ENGINE (Levered IRR + Exit)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.3 (Returns engine)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 4 (after-tax IRR code)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (Monte Carlo + Forecaster)

## Data Points

### Levered IRR + Exit Model
```
m0: -Cash_Invested
m1..n: (NOI/12 - P&I)        # monthly cash flow
mn: + [Exit_NOI/Exit_Cap - Selling_Costs - Remaining_Balance - Prepay(exit_year)]

Sensitivity: 4 hold × 3 exit cap × 4 rent growth = 48-cell matrix
```

### CapEx Reserve
5-8% EGI (modeled separately, NOT in OpEx)

### Exit Cap Sensitivity
±50-150 bps from base exit cap

### Tornado Chart Variables (PMCC Stress Test Calibration)
- Stable inputs: ±10% (taxes, reserves)
- Cyclically sensitive: ±20% (vacancy, market rent)
- Interest rates: ±50-100 bps (ARM/IO)
- Standard set: Market rent, Vacancy, Property tax, Insurance premium, Management fee, Interest rate reset, Maintenance/CapEx reserve

### Return Grade (on AFTER-TAX levered IRR + CoC + Track 2)
- A: After-tax IRR ≥15%; T2 ≥1.10
- B: 12–15%; T2 ≥1.00
- C: 8–12%; T2 <1.00 with appreciation thesis
- D: <8% or T2 negative
- F: PASS scenario

### Returns Methodology (Round 19 Rev 5 — CORRECTED)
- **Modified Dietz is dollar-weighted, NOT time-weighted** (per CAIA standard)
- Corpus prior classification was incorrect — Modified Dietz uses cash-flow-weighted formula that APPROXIMATES TWR but is NOT true TWR
- For true Time-Weighted Return (TWR), implement chain-linking methodology separately
- Engine should expose both: `mod_dietz_return()` and `twr_chain_linked_return()`

## Cross-References
- TOPIC 4 (After-Tax IRR — additional layer)
- TOPIC 7 (Monte Carlo — extends with distributions)

---

# TOPIC 4: AFTER-TAX RETURNS (OBBBA, §1250, NIIT, PAL, 1031)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.4 (B′ — Verdict Flippers)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 4 (full Python code)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (After-Tax IRR Engine)
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`
- `Sprint 3 Findings.md` (tax engine build)
- `Master DSCR Knowledge Document.md` §5 (pricing, fees, prepayment)

## Data Points

### OBBBA 100% Bonus Depreciation
- **Signed**: July 4, 2025
- **Effective**: January 19, 2025 (retroactive)
- **Permanent**
- Applies to: tangible assets with recovery period ≤20 years (5/7/15-yr components via cost seg)
- **Residential rental (27.5yr) does NOT qualify directly** — but cost-seg components do
- Schedule for assets acquired BEFORE Jan 20, 2025:
  - Placed in service 2025: 40%
  - Placed in service 2026+: 20%

### Cost Segregation
- Surface for properties ≥$450K
- Study cost: $2,500-$15,000
- Typical first-year savings: $50K-$100K per $1M building value
- Reclassifies components to 5-yr, 7-yr, 15-yr lives

### Section 179
- Pre-OBBBA: $1.22M
- **Post-OBBBA: $2,560,000 (2026, IRS Rev. Proc. 2025-32 §4.24, Tier 1 verified across 5 sources)**
- Phase-out at $4,090,000
- SUV cap: $32,000

### §163(j) ATI
- Pre-OBBBA: Revenue-based (EBIT)
- Post-OBBBA: **EBITDA-based** (restores depreciation add-back)
- Effective: Tax years beginning after Dec 31, 2024

### QBI Deduction (Section 199A) — CORRECTED 2026-06-18
- **23% for 2026** (OBBBA §70411), inflation-indexed thereafter per §199A(i)
- Was previously thought to be 20% flat — this is the Round 14 correction
- For pass-through entities (LLC, S-corp)
- Pre-OBBBA: set to expire 2025 (per TCJA sunset; OBBBA 2025 made permanent + bumped to 23%)

### Section 1250 Recapture
- Rate: max 25% on straight-line depreciation at disposition
- Accelerated/excess recapture: ordinary income rate

### NIIT (Net Investment Income Tax)
- Rate: 3.8%
- MAGI Thresholds: $200K single/HoH, $250K MFJ, $125K MFS
- Stacks on §1250: Recapture effective = 25% + 3.8% = **28.8%**
- LTCG effective = 20% + 3.8% = **23.8%**

### Passive Activity Loss (§469)
- $25K allowance phases out $0.50/$1 over $100K MAGI, fully gone at $150K
- **REP exception**: 750 hours + 50% test (Real Estate Professional)

### Depreciation
- Residential rental: 27.5 years straight-line
- Depreciation = Building_Basis / 27.5
- Building_Basis = Price - Land_Value

### 1031 Exchange
- 45-day identification window
- 180-day closing window
- Like-kind property only (real for real)
- Model "sell-and-pay" vs "1031-and-roll" as alternate exit scenarios

### QOZ / QROF (Qualified Opportunity Zone / Rural Opportunity Fund) — CORRECTED 2026-06-18
**Prior (WRONG):** "QOZ deferral ends Dec 31, 2026 (TCJA sunset)."

**Corrected (per OBBBA §70431, P.L. 119-21, July 4, 2025):** QOZ made PERMANENT.

| Pre-2027 investments | Post-2026 investments |
|---|---|
| Deferral ends on earlier of (a) inclusion event or (b) **Dec 31, 2026** | NEW rules: 5-year deferral from investment + 10% step-up at year 5 |
| 7-year + 15% step-up | NOT available for post-2026 |
| Decennial designation | New cycle begins **July 1, 2026** (70% AMI vs 80%, no contiguous tracts) |
| 30-year FMV basis freeze | NEW for post-2026 |
| QROF (Qualified Rural Opportunity Fund) tier: 30% step-up | NEW |

**Counterintuitive finding (Agent 4 verified):** 1031+QOZ may *cost more* than a straight sell for high-bracket investors because deferred gain is recognized at ordinary rates (37%) rather than §1250 (28.8% w/NIIT). The model is realistic and matches Big-4 CPA firm guidance. 1031+QOZ is a **deferral + appreciation-exclusion** vehicle, not a tax-savings vehicle.

**Source:** IRC §1031, IRC §1400Z-2, IRS Notice 2018-48, Rev. Proc. 2020-12, OBBBA Public Law 119-21 §70431.

### PAL Phase-Out Formula (Godmode code)
```python
if investor_magi <= 100_000 or is_rep:
    loss_allowed = min(abs(taxable_income), 25_000) if taxable_income < 0 else 0
elif investor_magi < 150_000:
    phaseout = (investor_magi - 100_000) * 0.5
    loss_allowed = max(0, 25_000 - phaseout)
else:
    loss_allowed = 0 if not is_rep else abs(taxable_income)
```

## Cross-References
- TOPIC 3 (Pre-Tax Returns)
- TOPIC 7 (Monte Carlo with pre/post-tax IRR distributions)

---

# TOPIC 5: RATES & PRICING (Live Anchors, Spreads, Levers)

## Primary Sources
- `Sprint 0 & 1 Findings.md` (rate sources)
- `Sprint 5 Findings.md` (final rate verification)
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Three §3.1 (pricing calibration)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part I (FRED + CME SOFR APIs)
- `THE DEFINITIVE BLUEPRINT.md` §IV (rates)
- `Master DSCR Knowledge Document.md` §5 (pricing)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §2 (data layer)

## Data Points

### Live Rates (June 17-18, 2026)
| Series | Value | Source |
|---|---|---|
| DGS10 (10Y Treasury) | 4.43% | FRED |
| GS10 (May 2026 avg) | 4.48% | FRED |
| 10Y Treasury (FRED DGS10, Jun 15-17) | 4.44-4.47% | FRED |
| 5-Year Treasury | 4.26% | Northmarq |
| SOFR | 3.63% | NY Fed (Jun 16) |
| SOFR 30-day avg | 3.609% | NY Fed |
| SOFR 90-day avg | 3.636% | NY Fed |
| SOFR 180-day avg | 3.679% | NY Fed |
| CME Term SOFR 1mo | 3.637% | CME |
| CME Term SOFR 3mo | 3.668% | CME |
| CME Term SOFR 6mo | 3.731% | CME |
| CME Term SOFR 12mo | 3.869% | CME |
| Fed Funds Rate | 3.50-3.75% (4th consecutive hold) | FRB |
| MORTGAGE30US (Freddie Mac, Jun 8) | ~6.53% | FRED |

### Pricing Anchor (Mid-2026)
- 30yr FIXED ≈ 10-Year Treasury + risk-tiered spread
- ARM & some IO ≈ 5-Year Treasury + spread (or SOFR + margin)

### Credit Spread (175-450 bps)
- Best-tier (760+ FICO, 1.25+ DSCR, ≤70% LTV): ~175-225 bps → effective ~6.2-6.7%
- Typical: ~250-350 bps → effective ~6.9-7.8%
- Weaker (low FICO/DSCR/STR/ARM): up to ~450 bps → effective ~8.9%+

### Dated Triplet (June 2026, re-verified)
- Competitive (740+ FICO, ≤70-75% LTV, 1.0+ DSCR): **6.125-6.49%** (par 6.125%, 0 pts; ARM from 5.125%)
- Typical: **6.50-7.50%**
- Full-market (thin/non-prime, low DSCR, STR, FN): **up to ~10.75%**
- DSCR premium over conforming: 0.50-1.25%
- Non-QM premium over QM: 0.50-2.00%

### Pricing Levers (off 740/par anchor)
| Lever | Adjustment |
|---|---|
| FICO 760+ | -0.05 to -0.125 |
| FICO 720-739 | +0.125 |
| FICO 700-719 | +0.125 to +0.25 |
| FICO 680-699 | +0.50 (cliff) |
| FICO 660-679 | +0.875 (cliff) |
| FICO 640-659 | +1.50 to +2.50 |
| LTV per 5% | +0.125 to +0.25 |
| DSCR per 0.10 below 1.25 | +0.125 |
| 85% LTV | @740+/SFR purchase/DSCR ≥1.0 only |
| IO | +0.25 |
| ARM | -0.125 to -0.375 vs 30yr fixed |
| 1 discount point | ≈ -0.25% rate |
| Cash-out | +0.25 to +0.50 |
| Loan <$150K | DSCR floor often 1.25 |
| Foreign national | +0.50 to +1.50 |
| No-PPP | +0.50 to +0.80 |
| 6+ mo reserves | -0.10 to -0.25 |
| Rate lock 45d | Standard/free |
| Rate lock 60d | +0.125 |
| Lock extension | +0.25 to +0.375 |

### LLPAs (Loan Level Price Adjustments)
- FICO <680: +0.500% to +2.500%
- LTV >75%: +0.400% to +0.900%
- DSCR <1.10: +0.350% to +0.850%
- IO: +0.250%
- Non-warrantable condo: +0.500%
- Condotel: +0.750%
- STR use: +0.300%
- Foreign nationals: +0.750% to +1.500%

## Cross-References
- TOPIC 8 (Lender Matrix — uses rates for AEY)
- TOPIC 12 (ARM Reset — uses SOFR forward curve)
- TOPIC 14 (Cost Stack — vendor costs vs. rates)

---

# TOPIC 6: GOLDEN TESTS / ACCEPTANCE CRITERIA (The Definition of Done)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Twelve §12.2 — **23 Acceptance Criteria v11**
- `DSCR Forumals.md` — Golden Test Suite
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` — Pin to tests

## Data Points: 23 Acceptance Criteria (v11)
1. Track 1 + Track 2 side by side, **never blended**
2. Reproduces every golden vector; stress cells reconcile to formulas
3. Gross/PITIA AND NOI/P&I; lower-of(lease,1007) + vacant rule; no LTR vacancy haircut by default
4. Returns: cap/CoC/debt-yield/equity-multiple/break-even + levered IRR with exit-cap sensitivity (PRE/AFTER-TAX); Return Grade on after-tax
5. **Property-tax reassessment per state; PITIA uses reassessed tax (NOT seller's current bill)**
6. After-tax engine: depreciation (27.5yr), §1250 recapture (≤25%), NIIT (3.8% if MAGI > threshold), passive-loss ($25K/$100-150K MAGI/REP exception), 1031 alternate exit; bonus-dep per OBBBA
7. **Cost-seg flag for ≥$450K**; if elected, compute accelerated deduction by class + bonus-dep overlay
8. Insurance: geography risk model + insurability KILL gate in high-risk zones (FL, CA, TX Gulf, LA Coastal); feeds PITIA and OpEx separately
9. BRRRR refi-seasoning gate (ARV vs cost basis) with carry during season
10. ARM reset engine (B″): reset rate = SOFR + margin, capped at cap structure; T1 at reset displayed; double-shock year flagged for IO+ARM files
11. Rates: dated triplet with 10yr/5yr/SOFR anchors at current values (10yr 4.44–4.47%, 5yr 4.26%, SOFR 3.59% as of June 17, 2026); risk-tiered spread ~175–450 bps; re-price as anchors move
12. True cost per lender: AEY via XIRR at 12/24/36/60-mo + APR-equiv; YSP flag
13. Lender screen: eligibility → fit tier (reason) → AEY → confidence (tiebreaker); two-quote enforced
14. PPP gate BRANCHES (entity × bank × purpose) before any ban; per-state penalty BASE (original vs remaining) and sale/refi triggers; MN HF 3437 ENACTED (eff. 8/1/26); OH/PA annually-indexed with January re-confirm
15. No-PPP re-pricing re-runs both tracks AND return model
16. Reserves: tiered/capped/geography/portfolio-stacked/ranged; cash-out seasoning caveat noted
17. STR legality gate before income; three-source min() (appraisal governs); monthly seasonality bar chart in Phase 2 for every STR file
18. Every lender claim: provenance label + verified_date; no render without them; fit tiers, never approval percentages; counterparty flag
19. Verdict (PROCEED/RESTRUCTURE/PASS) + binding constraint + $ deltas + Track-2 ack + kill-switch conditions
20. Kill criteria (incl. insurability + BRRRR seasoning + ARM double-shock) before lender ranking
21. IC memo + sensitivity + risk + true-cost exports; reproducible snapshots (inputs + lender versions + rate anchors)
22. Portfolio: ΣNOI/ΣADS, debt yield, concentration, refi watchlist, counterparty-continuity flag
23. NJ LLC/entity PPP defaults to HIGH-RISK (lender-split state) until specific lender matrix confirms entity type

## Data Points: 15 Kill Criteria (must check before any lender ranked)
1. STR prohibited (city/county/HOA)
2. PPP illegal for THIS vesting/lender combination
3. Insurance unconfirmed in high-risk zone (FL, CA, TX Gulf, LA Coastal)
4. FICO below all floors (<620)
5. Track 1 < 0.75
6. Appraiser rent break point exceeded (>4.83% below asking)
7. Value cash-gap unfundable
8. Reserves not liquid / not in acceptable tier
9. Prepay > exit economics
10. Rate > deal-break rate (7.67% for reference deal)
11. Declining-market LTV cap binds (CT/FL/IL/NJ/NY check)
12. Loan < lender minimum / sub-$150K floor
13. BRRRR ARV cash-out gated by seasoning
14. Confidence <60 on best-fit lender
15. ARM double-shock at reset year breaches DSCR floor
- **Plus**: Track 2 NEGATIVE → forced acknowledgment (not a kill; a mandatory disclosure)

## Cross-References
- TOPIC 2 (Math spine for golden vectors)
- TOPIC 10 (Lender provenance — confidence <60 = kill)
- TOPIC 11 (PPP Matrix)
- TOPIC 17 (Compliance — kill criteria)

---

# TOPIC 7: MONTE CARLO (t-Copula, R-Vine, Conformal)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Four §4.3
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (Monte Carlo config + R-vine add)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 2
- `dscr_sovereign_os_architectural_debt_and_math.md` (Gaussian ban)
- `Sprint 4 Findings.md` (t-copula implementation)
- `Sprint 6 Findings.md` (XGBoost ML layer)

## Data Points

### Configuration
- **Base iterations**: 10,000 (Monte Carlo SE on percentile ≈ 1/√n ≈ 1%)
- **Securitization-grade**: 50,000 iterations
- **Horizon**: Full loan term (default 30 years; configurable)

### Marginal Distributions (KBRA-Calibrated)
| Factor | Distribution | Parameters | Source |
|---|---|---|---|
| LTR rental growth | Normal | μ=0%, σ=9.5% | KBRA DSCR methodology |
| STR gross revenue | Lognormal | μ=0%, σ=18–25% | AirDNA |
| LTR vacancy | Beta | α=2, β=22 (≈5–8% mean) | CoStar/Trepp |
| STR vacancy | Beta | α=3, β=7 (≈20–40%) | AirDNA |
| Insurance escalation | Lognormal | μ=7%, σ=5% (coastal: μ=12%) | Post-2024 data |
| Property tax growth | Truncated Normal | μ=3%, σ=1% [CA: μ=2%, cap=2%] | CA Prop 13 |
| 10Y Treasury path | CIR or Hull-White | Calibrated to live SOFR term structure | FRED + QuantLib |

### Correlation Matrix (t-Copula, ν=5–7)
| Pair | Correlation | Rationale |
|---|---|---|
| Cap rate ↔ rates | +0.50 to +0.70 | Standard RE finance |
| Rent ↔ vacancy | -0.55 | Negative confirmed |
| Rent ↔ rates | +0.45 (lagged) | Rate→supply→rent |
| Insurance ↔ climate risk | +0.60 to +0.80 | Post-2024 coastal |

### Copula Selection
- **Student-t** (5-7 df) — captures tail dependence (Gaussian misses this)
- **R-vine** as production stress engine (def_blueprint_v3 add)
- **Clayton** alternative — strong lower-tail dependence
- **GAUSSIAN BANNED** — 2008 CDO failure

### Variance Reduction
- Antithetic Variates: -50-80% simulation error
- Quasi-Monte Carlo (Sobol sequences): faster convergence
- Stratified Sampling

### Action Thresholds
- P(DSCR < 1.00) > 10% → CONDITIONAL-GO (reprice or restructure)
- P(DSCR < 1.00) > 15% → PASS (risk threshold exceeded)
- 5th-percentile DSCR < 0.80 → automatic flag regardless of median

### 2026 Calibration
- 54.8% of US counties had yield decline 2025-26 → use NEGATIVE SKEW rent distribution for those counties

### CPTC (Conformal Prediction for Time-series with Change Points)
- Accepted at NeurIPS 2025 (poster 118881, arXiv 2509.02844)
- Official impl: github.com/Rose-STL-Lab/CPTC
- 90% calibrated intervals on rent/NOI forecasts
- Designed for regime changes: CA wildfire, FL hurricane, NYC Local Law 18, sudden rate shifts

### Outputs Per Deal
- P10 / P50 / P90 DSCR across full loan term
- VaR(95%) and VaR(99%)
- Expected Shortfall (CVaR)
- **P(DSCR < 1.0x at any point in term)** — single most important metric
- Sharpe ratio target ≥1.0
- Break-even rent
- Break-even rate
- Sensitivity tornado chart

### Distributional DSCR JSON (canonical)
```json
{
  "dscr_point": 1.14,
  "dscr_90_ci": [0.98, 1.31],
  "p_dscr_below_1_any_month": 0.21,
  "p_min_dscr_below_1_over_60mo": 0.38,
  "e_dscr_given_2sigma_rent_shock": 0.93,
  "cvar_5pct_annual_coverage": 0.88,
  "reset_risk_flag": "ELEVATED",
  "income_uncertainty_tier": "MSA"
}
```

## Cross-References
- TOPIC 2 (Math spine inputs)
- TOPIC 13 (AI/ML — TimesFM, TFT)
- TOPIC 6 (Golden Tests — Action Thresholds in #23)

---

# TOPIC 8: LENDER MATRIX (The Matching Engine)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Six (verified anchors)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §6 (V2.0 corrections)
- `Sprint 3 Findings.md` (lender intelligence)
- `Sprint 5 Findings.md` (lender matrix final)
- `Master DSCR Knowledge Document.md` §8
- `dscr_sovereign_os_upgrade_intelligence_report (1).md` (older lender views)

## Data Points

### 9-Lender Matrix (Sovereign Master, verified June 2026)
| Lender | Conf | States | FICO | DSCR | LTV | Special |
|---|---|---|---|---|---|---|
| Griffin Funding | 85 | 50+DC | 620 (CA) / 640 natl | 0.75 | 80% (75% cash-out) | Fixed 6.125-7.5%, ARM 5.125%; Jumbo $4M (some $20M); May-2026: 62 loans/$20.79M; 67% cash-out; avg loan $292K; CA reserves 9/12/15 |
| Defy Mortgage | 80 | varies | 640 | 0.75 | 85% @ 740+ | STR via hist/market/AirDNA; 14-21d close |
| Easy Street Capital | 82 | varies | varies | **NO min for STR** | 80% (75% cash-out) | STR specialist; AirDNA 100% pros; **Waives 12-mo STR seasoning**; From 5.75% |
| Lima One Capital | 76 | ~41 | varies | varies | varies | Dedicated STR (AirDNA); $2M / 80% LTV; Blanket/portfolio. **BLANKET EXIT WARNING** |
| Kiavi | 70 | 49+DC | 660 | 1.10 | 90% | **SSN required — NO ITIN**; From 6% / realistic 7.5-11% |
| New Silver | 72 | varies | 660 | 0.75 | 80% | 30yr; $150K-$3M; Instant approval 14-21d; Rate 50-100bps above established |
| Deephaven | 72 (Round 17 update) | National | 640 | 0.75 | 80% | Gross/PITIA + Gross/ITIA; Lower-of; Reserves 3/6/6/12; First-timer max 75% LTV. Update from STALE 2026-06-18 (Round 20 Rev 11 — Cross-TOPIC Conflict C3 resolved) |
| American Heritage | 65 | varies | 660 (720+ better) | 0.75 | 85% @ 760+ | 12mo reserves sub-1.0; STR: 75% projected / 100% w/ 12-mo history |
| Visio Lending | 78 | 48 (no AK/HI) | 680 | Flex 0.75-0.99 | varies | Lower-of, NO vacancy factor; Broadest STR; 5-4-3-2-1 / no-PPP +0.625%; ~$75K-$2M |
| Rocket Pro TPO | 70 (Round 17 update) | 50 | **660** | 1.00 | 80% | **$3.5M max**; 21-30d close; AI-assisted. Update from "n/a" 2026-06-18 (Round 20 Rev 11 — Cross-TOPIC Conflict C4 resolved) |
| Angel Oak | 68 (Round 17 update) | 47+DC | **700** (720 STR 80% LTV) | 1.00 | 85% | Clear Capital Rental AVM locked at prequal; Second Liens $100K-$350K. Update from "n/a" 2026-06-18 (Round 20 Rev 11) |
| Ready Capital | n/a | varies | varies | varies | varies | Commercial/multifamily bridge (5-10 units) |
| **Pennymac** (Round 17 add) | 70 PROBABLE | National | 660 | 1.00 | 80% | Correspondent + TPO; DSCR investor program; Tier 1 verification pending direct PPE access |
| **UWM** (Round 17 add) | 72 PROBABLE | 50 | 640 | 1.00 | 80% | Wholesale #1 by volume; DSCR available; requires broker account application |

### Two-Quote Quick-Match
| Situation | First Call | Second Call |
|---|---|---|
| DSCR 0.75-0.99 | Visio Flex | Griffin (0.75) |
| No-ratio | Griffin | Defy |
| STR projected | Easy Street | Visio |
| STR 12-mo history | Visio | Easy Street |
| Pro STR / BRRRR STR | Easy Street | Lima One |
| 85% LTV | Defy | — |
| Best rate | Griffin (6.125%) | Visio |
| Jumbo to $4M | Griffin | Broker shop |
| FN / ITIN | Defy / Griffin | — (Kiavi EXCLUDED) |
| Fast close <14d | New Silver | Kiavi |
| Portfolio / blanket | Lima One | Broker shop (release clause) |
| State-sensitive PPP | Run PPP gate FIRST | — |

### Provenance Rules
- No-Render Rule: lender program not actionable unless verified date, source, confidence, policy version
- Evidence Hierarchy: Statute > Program Guides > Market Data > Rate Sheets > Broker Quotes
- Confidence: ≥80 = recommendation, 60-79 = conditional, <60 = research only
- Two-Quote Rule: every recommendation must force user to see ≥2 competing lender options

### Fit Tier Classification
- Strong fit / Standard fit / Conditional fit / Weak fit / Not eligible / Needs reverification
- **NEVER use approval percentages** — qualitative tiers only

### Capital Partner Concentration Rule
- Maintain 3-5 active DSCR lender outlets
- No single lender > 40% submitted volume or 50% locks

## Cross-References
- TOPIC 5 (Pricing — anchors used in lender match)
- TOPIC 11 (PPP — affects lender match)
- TOPIC 9 (STR — Easy Street, Visio, Lima One are STR specialists)

---

# TOPIC 9: STR INCOME MODELING (Legality, Three Worlds, Seasonality)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Three §3.5 (STR Module)
- `Master DSCR Knowledge Document.md` §2 (STR Qualification)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part III (STR Regulation Database)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §4 (STR Compliance)
- `DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md`
- `Sprint 2 Findings.md` (STR legality database)

## Data Points

### Legality Gate (run BEFORE any STR income)
- **Statuses**: CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED
- If not CLEAR → income disabled (or speculative-only)
- HOA silent/unknown → attorney review required before any STR underwriting
- If PROHIBITED in any source (city/county/state/HOA) → STR income DISABLED

### 3 Income Worlds, NEVER Blended
- **W1**: Long-term rent (fallback)
- **W2**: Projected (×0.70-0.80; pro STR programs may use 100%)
- **W3**: Documented 12-month platform/bank statements

### Three-Source Min Rule
- `MIN(LTR market rent, AirDNA projected × (1 - 10-20% haircut), documented 12-mo)`
- **Appraisal GOVERNS**: min() across all sources; appraisal wins over AirDNA always
- STR DSCR floor ≥1.0 at most lenders

### STR OpEx
- 45-65% of gross (vs LTR 30-45%)

### Seasonality Warning
- Annual DSCR 1.15 can hide months at 0.6
- **Monthly seasonality bar chart MANDATORY for STR files**
- Surface: monthly DSCR bar chart (12 months)

### STR Lender Acceptance (Verified 2026)
| Lender | STR Acceptance |
|---|---|
| Easy Street Capital | Accepts 100% AirDNA for pro STR investors; **waives 12-mo seasoning** for BRRRR |
| Visio Lending | Broadest STR acceptance (48 states); no min DSCR for Flex |
| Lima One Capital | Dedicated STR (AirDNA); blanket/portfolio |
| American Heritage | 75% projected / 100% with 12-mo history |
| Deephaven | Requires 12 mo documented STR history |
| Angel Oak | 80% LTV at 720 FICO + 1.0x DSCR (new 2026 tier) |

### STR Regulation Database — Hardcoded Markets
| Market | Registration Requirement |
|---|---|
| LA | Home-Sharing permit + primary residence verification |
| NYC | Mayor's Office of Special Enforcement (Local Law 18) — **PROHIBITED** primary residence only |
| Miami Beach | Short-term rental license |
| Nashville | Short-term rental permit (owner vs non-owner) |

### Airbnb/VRBO Data Source Rules
- AirDNA: Enterprise-gated only. Don't build automation until commercial API agreement signed
- AirDNA Rentalizer: 12 mo, dated within 90 days, 3 comps, market score ≥60, 2 persons/bedroom max
- 2026 fact: STR occupancy stabilizing; supply growth risk elevated where home values moderating

### STR Market Stress
- Run -10% / -20% ADR stress on every STR deal

## Cross-References
- TOPIC 11 (PPP — STR = "STR prohibited" kill criterion)
- TOPIC 8 (Lender match — STR specialist lenders)
- TOPIC 17 (Insurance — STR has different insurance considerations)

---

# TOPIC 10: EVIDENCE VAULT & PROVENANCE

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Five §5.1-5.2 (JSONB schema)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part III (lender_programs table + decay)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §5 (Ocrolus + provenance)
- `Master DSCR Knowledge Document.md` §8 (provenance + no-render rule)
- `Master DSCR Knowledge Document.md` §9 (Evidence Vault architecture)

## Data Points

### JSONB Evidence Object Schema
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

### PostgreSQL Schema (canonical normalization)
| Field | Type | Description |
|---|---|---|
| `source_id` | string | Vendor identifier (`rentcast`, `airdna`, `fred`, `ocrolus`, etc.) |
| `as_of_timestamp` | datetime (UTC) | When the data was retrieved from source |
| `effective_date` | datetime | What date the data describes |
| `confidence_score` | float [0–1] | Source-specific reliability rating |
| `hash` | string | SHA-256 of raw response payload |
| `ttl_hours` | int | Time-to-live before staleness flag is triggered |
| `provenance_tier` | enum | `primary_source`, `vendor_model`, `derived`, `user_input` |
| `decay_rate` | float | Confidence reduction per hour after TTL |

### lender_programs Table
```sql
CREATE TABLE lender_programs (
  id SERIAL PRIMARY KEY,
  lender_name TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL,  -- 'FICO_floor', 'max_LTV', 'DSCR_min', etc.
  claim_value NUMERIC,
  source_url TEXT,
  source_type TEXT CHECK (source_type IN ('Verified-Primary', 'Verified-Secondary', 'Market-Pattern-Verify', 'Unverified')),
  verified_date DATE NOT NULL,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  supersedes_id INTEGER REFERENCES lender_programs(id),
  counterparty_flag BOOLEAN DEFAULT FALSE,
  expires_date DATE  -- trigger re-verification queue
);
```

### Confidence Decay (Celery daily task)
- Verified-Primary: -5 points per 30 days after 90 days
- Verified-Secondary: -10 points per 30 days after 60 days
- Market-Pattern: -15 points per 30 days after 45 days
- **Records below 40 confidence → flag 'REQUIRES REVERIFICATION'**

### "Unspecified" Rule
- If lender does not publicly disclose a metric (e.g., Anchor Loans' FICO floor), the UI MUST render "Unspecified / Requires Broker Matrix"
- **False precision is a systemic failure**
- Interpolation is forbidden

### Per-Inference Model Provenance (V3 add)
- Model version, git hash, training cutoff, calibration map, challenger delta
- Written to Evidence Vault on every inference

### Cryptographic Hash Chain
- SHA-256 of source data at time of ingestion
- Every edit creates a new version (no overwrite)
- Satisfies FCRA adverse action requirements (25-month min retention)
- Satisfies ECOA record retention
- Satisfies SR 26-02 model documentation

## Cross-References
- TOPIC 8 (Lender provenance rules)
- TOPIC 6 (Kill criterion 14: confidence <60)
- TOPIC 13 (Model governance under SR 26-02)

---

# TOPIC 11: 50-STATE PPP MATRIX (Branching Gate)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Three §3.3 (full state matrix)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part IV (state_ppp_rules schema + MN hardcoded)
- `Sprint 2 Findings.md` (initial PPP matrix)
- `Sprint 5 Findings.md` (final 50-state PPP)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §4 (V2.0 PA correction)
- `Master DSCR Knowledge Document.md` §5 (PPP structures)

## Data Points

### Branching Gate (3 ordered steps)
```
Step 1: Business-purpose + entity-vested?
  → YES: Most consumer statutes DON'T apply
Step 2: Bank/depository lender?
  → YES: Stricter consumer rules
Step 3: Individual vesting OR consumer-purpose?
  → Apply consumer-statute matrix
Output: Allowed / Restricted / Prohibited / Ambiguous + reason + branch
```

### State Matrix (June 17-18, 2026, primary-source verified)
| State | Treatment | Penalty Base | Threshold | Source |
|---|---|---|---|---|
| AK | INDIVIDUAL: not allowed; LLC/CORP: ALLOWED | REMAINING | n/a | Lender matrix 2026 |
| MN | Business DSCR EXEMPT from §58.137 fee/PPP limits. **HF 3437 ENACTED 4/23/26, eff 8/1/26**. Applies to loans executed on or after Aug 1, 2026. (Round 22 verification — Sprint 02 Tier 1) | REMAINING | n/a | MN HF 3437 + Statute |
| NM | Individual ban common; entity varies | REMAINING | n/a | Market pattern |
| ND/KS/MD | De facto prohibited at many lenders | REMAINING | n/a | Market pattern |
| OH | 1-2 unit & condos: PPP if loan > **$112,957** (2025 Tier 1, Sprint 02). 2026 value: PROVISIONAL $116,356 (TOPICAL_INDEX prior estimate; needs January pull from OH Dept. of Commerce — Round 20 Rev 13 outstanding). **PENALTY BASE = ORIGINAL principal** (ORC §1343.011). Max 1%, max 5yr. 3-4 unit: no restriction. After 5 years: PPP prohibited regardless of amount | **ORIGINAL** | $112,957 (2025 Tier 1); 2026 PENDING | ORC §1343.011 |
| PA | 1-2 unit: PPP prohibited on loan ≤ **$329,411** (2026 Tier 1, Sprint 02 — PA Bulletin confirmed). Loans above threshold: PPP permitted. Business-development loans: exempt. (Was $319,777 in 2025; 2026 confirmed $329,411) | REMAINING | $329,411 (2026) | PA Act 6, 10 Pa. Code §7.2 |
| NJ | N.J.S.A. 46:10B-2: "mortgagor" = non-corp individuals barred. **C-Corp: allowed.** LLC: contested status. NPLA won partial DOBI clarification Oct 2025 ("NJ DOBI confirms no formal prohibition on PPP for LLC borrowers"). Arc Home banned Oct 2025. Engine surfaces three-option branch (Round 22 Sprint 02 Tier 1) | REMAINING | n/a | NPLA Oct 2025 + Statute |
| IL | Individuals barred (and/or APR-gated ≥8%); entities subject to APR fall-rate tests | REMAINING | n/a | Matrix + AAPL |
| MS | Declining structures only; flat banned >1yr (§75-17-31) | REMAINING | n/a | Statute |
| AR | Allowed first 3 years; **PENALTY BASE = REMAINING balance** (≤3/2/1%) | REMAINING | n/a | State PPP matrix |
| WI/ME | No PPP on ARM (WI: cap 2 months' interest) | REMAINING | n/a | Matrix |
| WV | Max 3yr / 1% | REMAINING | n/a | Matrix |
| RI | Max 1yr / 2% | REMAINING | n/a | Matrix |
| SC | Not allowed ≤$690,000 | REMAINING | $690K | Matrix |
| OK/TX | Banned if APR >13% / >12% | REMAINING | n/a | Matrix |
| NY | Banking Law §6-l bars PPP on residential EXCEPT business-purpose | REMAINING | n/a | AAPL |
| WA | Some matrices: no PPP on 5/6 ARM. Older blanket ARM-ban UNVERIFIED | REMAINING | n/a | UNVERIFIED |

### Common PPP Structures
- **5-4-3-2-1**: 5% yr1, 4% yr2, etc. (most common)
- 3-2-1
- Flat 5/5/5
- Floored 5-4-3-3-3
- 6 months interest
- ~20%/yr partial-prepay allowance
- Assumability

### Penalty Formula (default)
`Penalty = Outstanding_Principal_at_Exit × Applicable_Penalty_Rate`

### Sale/Refi Trigger
- DEFAULT: triggers on BOTH sale and refi
- OVERRIDE: soft prepay exempts sale
- MN consumer statute (§58.137) exempts sale; **MN statute does NOT reach business-purpose DSCR loans as of 8/1/26**

### Annual Re-Index (Celery cron January 1)
```python
@celery_app.task(name='reindex_ppp_thresholds')
def reindex_ppp_thresholds():
    """OH ORC 1343.011 and PA Act 6 thresholds index annually.
    2026 values: OH = $116,356; PA = $319,777"""
```

### MN HF 3437 (hardcoded as ENACTED)
```python
MN_HF3437 = {
    'status': 'ENACTED',
    'signed_date': '2026-04-23',
    'effective_date': '2026-08-01',
    'scope': 'Amends Minn. Stat. 58.137 to explicitly exempt business-purpose DSCR loans',
    'application': 'Business-purpose DSCR loans are NOT reached by 58.137 as of 2026-08-01',
    'consumer_loans': 'Personal/family/household loans still regulated by 58.137',
    'verified_date': '2026-06-17'
}
```

### Repricing (No-PPP Premium)
If PPP unavailable: apply +0.50/+0.80 rate and/or 0.625% fee

### NJ Special Handling
- **NJ LLC/entity PPP defaults to HIGH-RISK** (lender-split state)
- Until specific lender matrix confirms entity type
- Never presents any single lender's NJ matrix as universal

## Cross-References
- TOPIC 6 (Kill criterion 2: PPP illegal)
- TOPIC 8 (Lender match — affected by PPP availability)
- TOPIC 5 (Pricing — no-PPP premium)

---

# TOPIC 12: ARM RESET ENGINE (SOFR Forward Curve, Double-Shock)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.5 (B″ ARM Reset)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II Layer 1 (QuantLib code)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (NSS-Svensson + Hull-White add)
- `Sprint 4 Findings.md` (ARM engine)
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`

## Data Points

### ARM Reset Formula
```
Fully_Indexed_Rate = Index_t + Margin
New_Rate = min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))
Reset_Payment = Remaining_Balance × New_Rate/12 / (1 - (1 + New_Rate/12)^(-n_remaining))
```

### SOFR Forward Curve (June 17, 2026 verified)
- SOFR 30-day: **3.59%** (Northmarq)
- 5-Year Treasury: **4.26%** (Northmarq)
- 10-Year Treasury: **4.44-4.47%** (FRED DGS10)
- Fed Funds: 3.50-3.75% (4th consecutive hold)
- CME Term SOFR: 1mo 3.637% / 3mo 3.668% / 6mo 3.731% / 12mo 3.869%

### SOFR Forward Curve Construction
- From CME SOFR futures contracts
- `Forward_SOFR_t = (SOFR_Futures_Price_t - 100) / 100`
- Sources: CME Term SOFR API, CME DataMine, Smart Stream on GCP

### ARM Margin
- Typical: 2.75-3.50% (depends on FICO, LTV)

### Caps (typical)
- 2/2/5 (initial/annual/lifetime)
- 5/2/5 (more common)

### WA ARM PPP
- Cannot extend >60 days pre-reset (PPP ban during extension period)

### IO + ARM Double-Shock
- IO period expires → recast to amortizing simultaneously with potential rate reset
- Model the combined impact explicitly
- Flag the year of double-shock as kill-criterion checkpoint
- Surface: "Kill-Switch Year: Year N — IO expires and rate resets simultaneously"

### Cap Structure (must model)
- Floor: min rate
- Periodic Cap: max annual change
- Lifetime Cap: max total change from initial
- Initial Cap: max change at first reset

### NSS-Svensson + Hull-White (V3 add)
- Forward-rate engine for ARM reset and refinance distribution modeling
- Replaces generic rate simulation

### Common ARM Products
- 5/1 ARM: 5yr fixed, then annual reset
- 7/1 ARM: 7yr fixed, then annual reset
- 10/1 ARM: 10yr fixed, then annual reset
- SOFR ARM: margin over SOFR (replaced LIBOR)

## Cross-References
- TOPIC 6 (Kill criterion 15: ARM double-shock breach)
- TOPIC 5 (Rates — SOFR anchors)
- TOPIC 7 (Monte Carlo — rate path simulation)

---

# TOPIC 13: AI/ML LAYER (TimesFM 2.5, TFT, XGBoost, CPTC)

## Primary Sources
- `TimesFM_LoRA_Complete_Engineering_Spec.md`
- `TimesFM 2.5 LoRA Upgrade Blueprint.md`
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §3 (forecasters + approval predictor)
- `DSCR Sovereign OS  Upgrade Intelligence Report.md`
- `Sprint 6 Findings.md` (XGBoost)
- `DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md`
- `timesfm_icf_pipeline.py`
- `DSCR Sovereign OS: Godmode Research Plan.md`

## Data Points

### TimesFM 2.5 (Google BigQuery AI.FORECAST)
| Parameter | Value |
|---|---|
| Parameters | 200M (vs 2.0's 500M — 2.5× faster inference) |
| Max context window | 15,360 (7.5× more than 2.0's 2,048) |
| Quantile head | Optional 30M (native quantile outputs up to 1,000-step horizon) |
| XReg covariate support | ✅ Restored |
| Frequency indicator | Not required (simpler API) |
| Open source | ✅ + LoRA fine-tuning |
| BigQuery support | ✅ Production (June 12, 2026) |

### LoRA Fine-Tuning Triggers
- ≥500 property-months of training data
- **FinLoRA benchmark**: +40.1 pts over base TimesFM
- LoRA ~66% cheaper than QLoRA
- GPU: A10G 24GB VRAM min, A100 40GB recommended
- Training time: 15-45 min for 500-2000 property-months

### XGBoost FEATURE_COLUMNS (final)
```python
FEATURE_COLUMNS = [
    'loan_amount',           # numeric
    'is_str',                # bool: 1 if STR, 0 if LTR
    'ppp_selected',          # categorical: Business+Entity / Business+Individual / Consumer
    'state_encoded',         # 0-49
    'property_type_encoded', # SFR / 2-4 / Condo / STR / Mixed
    'vesting_type_encoded',  # LLC / Corp / LP / Individual
    'rate_at_app',           # numeric, current SOFR + margin
    'is_rep',                # bool: 1 if repeat customer
    'magi_bucket',           # categorical: <100K / 100-200K / 200-250K / 250-500K / 500K+
]
```

### Magic Buckets
- **LTV**: 0-65 / 65-70 / 70-75 / 75-80 / 80+
- **DSCR**: <0.80 / 0.80-0.95 / 0.95-1.00 / 1.00-1.20 / 1.20+
- **FICO**: <640 / 640-680 / 680-720 / 720-760 / 760+
- **Reserves**: <3 / 3-6 / 6-12 / 12+
- **MAGI**: <100K / 100-200K / 200-250K / 250-500K / 500K+

### Ensemble Architecture
- XGBoost + LightGBM + CatBoost soft-voting ensemble
- Isotonic regression calibration
- Min 500 deal outcomes before production
- Recalibrate quarterly

### CPTC (Conformal Prediction for Time-series with Change Points)
- Accepted NeurIPS 2025 (poster 118881, arXiv 2509.02844)
- Official impl: github.com/Rose-STL-Lab/CPTC
- 90% calibrated intervals on rent/NOI forecasts
- Designed for regime changes (CA wildfire, FL hurricane, NYC Local Law 18)

### Other Algorithms Mentioned
- **iTransformer**: transformer variant for tabular/financial data
- **TabPFN** (Prior-data Fitted Network): meta-learned foundation model, ~1 sec inference
- **TabT** (Tabular Transformer)
- **Isolation Forest**: unsupervised anomaly detection
- **Conformal Prediction**: distribution-free uncertainty

### SR 26-02 Classification (V3)
| Model | Materiality | Validation |
|---|---|---|
| DSCR Calculator | N/A (not a model) | CI/CD unit tests |
| Legal Rules Engine | N/A (deterministic) | Quarterly counsel review |
| Monte Carlo Engine | High | Semi-annual full review + model card + challenger |
| TimesFM 2.5 Forecaster | Medium-High | Quarterly backtesting + model card |
| TFT (NeuralForecast) | Medium-High | Quarterly + model card |
| Approval Predictor | High | Quarterly + event-triggered + full card + outcomes analysis |

## Cross-References
- TOPIC 7 (Monte Carlo — uses forecasters as inputs)
- TOPIC 10 (Provenance per inference)
- TOPIC 14 (Vendors — TimesFM via BigQuery)

---

# TOPIC 14: COST STACK & VENDORS (Operating Budget)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Ten §10.3 (PPE vendors)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §2 (verified vendor costs)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part I (Tier 1/2/3)
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`
- `Sprint 5 Findings.md` (vendor costs)

## Data Points

### Annual Operating Costs (Verified)
| Vendor | Annual Cost | Notes |
|---|---|---|
| Ocrolus | $100K-$400K | Volume-based; $0.50-$3.00/page |
| AirDNA | ~$50K+ | Enterprise STR data |
| RentCast | Variable | 50 free/mo; enterprise on request |
| Optimal Blue | $15K-$50K+ | Commercial broker/lender |
| HouseCanary | $25K-$100K+ | Enterprise API; consumer $19/mo |
| Legal/content (StateScape + counsel) | $30K-$60K | — |
| Cloud/API | $50K-$150K | — |

### RentCast API (V2.0 corrected)
- **WAS**: $29/$99/$199/Custom tiers (consumer landlord platform)
- **IS**: 50 free API calls/month; volume-based pricing; no named dollar tiers for API
- Coverage: 140M+ properties, rental AVM, market comps
- Limitations: optimized for 1-4 unit residential; no native STR (use AirDNA); supplement 5+ unit with CoStar/Yardi Matrix

### AirDNA Enterprise API
- ADR, occupancy, market comps, 12-60 mo historical + forward projections
- Enterprise-gated ONLY
- Budget: ~$500-$2,000/mo at scale
- Often $50K+/yr enterprise
- Rentalizer available single-property API for dev

### ATTOM Data API
- $95/mo starter (some sources cite $500/mo for API)
- Endpoints: assessment, property, sales history, valuation, flood

### Optimal Blue PPE / Loansifter
- $15K-$50K+/yr
- Real-time lender pricing + eligibility
- 16 Mortgage Market Rate Indices

### Cotality (CoreLogic) LoanSafe
- $50-$200/deal
- Fraud consortium data
- Investment-property: 1 in 44 fraud (1 in 129 overall)
- Top-risk states: NY, FL, CT, NJ, CA

### HouseCanary
- Consumer: $19/mo (basic property search)
- Institutional: $25K-$100K+/yr enterprise
- 75+ data points per property
- AVM tier that lenders use for credit decisions

### PPE Vendor Comparison (Build vs Buy Decision)
| Vendor | Best For | Strength | Non-QM |
|---|---|---|---|
| Optimal Blue | Enterprise lenders | 120+ investors, BESTX™, secondary market | Good but legacy |
| Polly | Mid-to-large | AI automation, cloud-native, 15 hrs/wk savings | Strong but expensive |
| **Lender Price FLEX** | Non-QM specialists | API-centric, AILA AI | **Best for dedicated Non-QM** |
| **LoanPASS** | Complex Non-QM | Rules-first, no-code; selected by Verus | **Best for complex multi-product** |

**Recommendation**: Integrate LoanPASS or Lender Price FLEX

### Docling + Mistral OCR + Reducto (OCR Layer)
- Docling: open-source, table-aware, digital PDFs
- Mistral OCR 2505: $1/1000 pages, $0.50 batch
- Reducto / LlamaParse: complex/handwritten fallback
- GPT-4o + Instructor → Pydantic schema

### Build Budget
- **Total**: $750K-$1.4M (6 months loaded)
- Labor (8 FTEs): $525K-$900K
- Vendor APIs: $50K-$120K
- Ocrolus: $25K-$100K
- Optimal Blue: $15K-$50K
- Legal: $30K-$60K
- Cloud/SOC 2: $30K-$80K
- Contingency 10%: $75K-$90K

## Cross-References
- TOPIC 13 (AI/ML — TimesFM via BigQuery)
- TOPIC 19 (OCR Pipeline)

---

# TOPIC 15: MARKET INTELLIGENCE (Non-QM Market, Competitors, Delinquency)

## Primary Sources
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Ten §10.1
- `SIMILARWEB ANALYTICS REPORT.md`
- `DSCR DUAL TRUTH ENGINE CHATGPT RESEARCH.md`
- `dscr_sovereign_os_deep_debt_analysis.md`
- `DSCR_Appendix_B_Research_Resolution_Report.md`

## Data Points

### Non-QM Market Sizing
- **2025 origination**: $239B (697,605 loans = 10.2% of originations)
- **2026 projection**: >15% of total originations
- **DSCR share of Non-QM**: 28.7% = ~$68.7B
- May 2026: Non-QM = ~9% of total mortgage lock volume

### Top Non-QM Lenders 2025 (Scotsman Guide)
| Rank | Lender | 2024 Vol | Units | % Non-QM |
|---|---|---|---|---|
| 1 | OCMBC | $3.55B | 8,754 | 56% |
| 2 | CrossCountry | $3.48B | 6,610 | 8% |
| 3 | Acra | $3.39B | 6,820 | 100% |
| 4 | A&D | $2.64B | 7,815 | 84% |
| 5 | Change Lending | $1.90B | 3,017 | 66% |
| 8 | theLender | $1.62B | 3,726 | 82% |
| 11 | American Heritage | $1.37B | 4,125 | 100% |
| 12 | Emporium TPO | $1.27B | 2,554 | 100% |

### Verus S&P DSCR Presale 2025
- **89.44%** property-focused
- Weighted avg DSCR: **1.10x**
- **63.04%** no lease in place
- **3.82%** 30-day delinquent at issuance

### Delinquency Data
- MBA Q1 2026 commercial delinquency: **4.02%** (↑ from 3.85% Q4 2025)
- **STALE FLAG (Round 20 Rev 12):** Trepp figures below are Mar 2026 verified (3-source: Trepp, MBA Newslink, Multifamily Dive). Monthly cron update required.
- Trepp CMBS delinquency: **7.55%** (Mar 2026, +41 bps MoM, +90 bps YoY)
- Multifamily CMBS: **7.15%** (Mar 2026, +30 bps MoM, +56 bps in April to 7.71%, then partial retrace)
- "4× over 24 months" = actually **≈3.89×** (7.15/1.84) — corrects Round 7/8 imprecise claim
- Contagion cluster: 80% of MF CMBS DQ in NY/NJ (48%) + Houston (30%) — Buschbom (Trepp) directly quoted
- April 2026 update: Multifamily +56 bps to 7.71%; geographic concentration shifted from Houston to SF
- May 2026: Multifamily -110 bps partial retrace (KBRA); overall CMBS stabilized ~7.7%
- **Cure rate sensitivity (Round 19 Rev 9):** DSCR-LTR 50-65% (central 58%); DSCR-STR 36-60% (central 48%). Add `dscr_cure_24mo` parameter with ±0.10 CI
- Office CMBS: 12.34% (Jan 2026) — **all-time high**
- 22.3% sixty-day DQ on 2023 multifamily conduit — "cautionary vintage"
- 2022-2023 vintages: ~4-4.1% cumulative defaults
- COVID vintages (2019-2020): 5-5.5% cumulative

### KBRA Non-QM Default Study (2025)
- 475,000+ loans from 600 NQM transactions
- WA cumulative default rate: **3.8%**
- Realized credit losses: **0.03%**
- FICO <660: ~10% default rate
- FICO >760: <2% default rate
- Alt Doc loans: 12.9% higher defaults vs Full Doc

### Rental Yield Trends 2026
- **54.8% of US counties** had yield decline 2025-26
- Use NEGATIVE SKEW rent distribution in Monte Carlo for those counties

### SimilarWeb Traffic (verified)
- kiavi.com: 182K visits/mo (highest Non-QM traffic)
- consumerfinance.gov: 2.44M visits/mo
- rocketprotpo.com: 89K visits/mo
- angeloak.com: 67K visits/mo
- visiolending.com: 54K visits/mo
- griffinfunding.com: 41K visits/mo
- deephavenmortgage.com: 38K visits/mo

### Broker Channel
- 5,000-7,000 active Non-QM brokers in 2026 (vs 3,500 in 2022)
- Top 50 brokers consolidating into mega-brokers

### Insurance Crisis Data (2024-2026)
- **>90% of FL investors** missed deals due to insurance issues (2024)
- **83% of CA investors** missed deals due to insurance (2024)
- 1-in-3 affordable housing providers saw 25%+ premium increases
- Insurify 2026: double-digit rate increases projected
- Coastal: 10-30% annual premium increases

### Securitization (2026)
- 2025 saw first $1B+ DSCR ABS deal
- Credit enhancement: 5-15% for Non-QM pools
- Rating Agencies: KBRA (most active), DBRS Morningstar, Fitch, S&P

## Cross-References
- TOPIC 6 (Kill criteria for declining markets — CT/FL/IL/NJ/NY)
- TOPIC 17 (Insurance crisis — kill criterion)
- TOPIC 7 (Monte Carlo calibration — KBRA data)

---

# TOPIC 16: PROPERTY TAX & REASSESSMENT (Critical Math Correction)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Two §2.4 B′.1
- `DSCR Sovereign OS: Godmode Research Plan.md` Part IV (Property Tax Reassessment)
- `Sprint 3 Findings.md` (state property tax matrix)
- `Sprint 5 Findings.md` (final property tax matrix)
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`

## Data Points

### The Engine Rule (Non-Negotiable)
```
reassessed_tax = Purchase_Price × effective_mill_rate(state, county)
PITIA uses reassessed_tax, NOT the current bill.
UI output: "Seller currently pays $X/yr. You will pay ~$Y/yr after reassessment."
```

### State-Specific Mechanics
| State | Mechanics |
|---|---|
| CA (Prop 13) | Resets to purchase price at sale. Prior owner may have had assessed value locked at 1978 price. Buyer receives supplemental tax bill for stub period. **2%/yr cap on increases** |
| TX | 2-3% of market value annually. Purchase triggers reassessment |
| FL | Similar purchase-year reset to market value |
| NY | Varies by class; ~1.2-2.0% effective |

### Property Tax (effective rates, selected)
| State | Effective Rate | Notes |
|---|---|---|
| CA | 1.1-1.3% | Prop 13 caps at 2%/yr |
| TX | 1.8-2.5% | No state income tax |
| FL | 0.9-1.2% | Homestead NOT for investment |
| NY | 1.2-2.0% | Varies by class |
| IL | 2.0-2.5% | High |
| OH | 1.5-1.8% | Moderate |

### ATTOM Use Case (Critical)
- Pull actual county mill rate for every subject property APN
- Multiply by purchase price
- This single API call prevents the most common DSCR overstatement error

### Property Tax Growth (in Monte Carlo)
- Truncated Normal: μ=3%, σ=1%
- CA: μ=2%, cap=2% (Prop 13)

## Cross-References
- TOPIC 6 (Acceptance Criterion 5: PITIA uses reassessed tax)
- TOPIC 7 (Monte Carlo distribution)
- TOPIC 14 (ATTOM vendor)

---

# TOPIC 17: COMPLIANCE, INSURANCE & REGULATORY

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Nine (Regulatory Compliance)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §4 (Compliance + Legal)
- `Master DSCR Knowledge Document.md` §10
- `DSCR Sovereign OS & Non-QM Wholesale Lender Master Research Report.md`
- `Sprint 4 Findings.md` (insurance kill criterion)

## Data Points

### Regulatory Surface (B2B vs Consumer Positioning)
| Regulation | Applies to DSCR | Notes |
|---|---|---|
| SAFE Act / MLO Licensing | **Potentially** | If tool crosses into offering/negotiating terms |
| RESPA Section 8 | **No** (business-purpose) | Reg X exempts credit primarily for business |
| ECOA / Regulation B | **Yes** | Adverse action rules differ for business |
| Regulation Z | **No** (business-purpose) | Excludes business-purpose credit |
| GLBA | **Yes** | PII/financial data handling |
| CFPB Circular 2022-03 | **Yes** | Adverse action notices required even for AI/ML |

### B2B Positioning
- Tool positioned as **professional decision-support for licensed operators**
- Significantly reduces regulatory surface
- "LLC Wrapper Trap": closing in entity doesn't guarantee business-purpose — must have true attestations

### Compliance Stack
- 50-state PPP matrix
- Federal floor: TILA Reg Z, RESPA §8, ECOA, Fair Housing Act, BSA/AML (FinCEN), OFAC
- B2B exempts RESPA + Reg Z (if properly documented)

### CFPB Circular 2022-03 (Adverse Action)
- Creditors must provide **specific and accurate reasons** for adverse action
- Cannot use "black-box" defense for AI/ML models
- SHAP values mathematically isolate feature contributions
- Auto-generate specific reasons (e.g., "LTV 82% exceeds maximum 80%")

### Section 1071 (SMB Lending Data Collection)
- **Revised**: May 1, 2026
- **Effective**: January 1, 2028
- Applies to business-purpose loans >$25K to women-owned/minority-owned
- May affect LLC DSCR deals if CFPB reasserts scope

### SR 26-02 (OCC 2026-13, effective April 17, 2026)
- Replaces SR 11-7
- Narrows "model" definition to complex quantitative methods
- Simple arithmetic + deterministic rule-based = **NOT a model**
- DSCR calculator (QuantLib/pyxirr) + Legal Rules Engine = NOT models
- Only Monte Carlo + ML need governance

### FinCEN BOI (CRITICAL CORRECTION)
- **Domestic U.S. LLCs are EXEMPT** from BOI reporting under FinCEN March 2025 interim final rule
- **DSCR loans are financed transactions** — do NOT trigger FinCEN RRE Rule
- RRE Rule effective March 1, 2026 — applies only to non-financed cash transfers to entities
- **No BOI alert required for standard DSCR files**
- Flag cash deals or equity-only transfers into entities

### HOEPA 2026 Thresholds
- Total loan amount: $27,592 (was $26,968 in 2025)
- Points-and-fees dollar trigger: $1,380 (was $1,348)
- HOEPA rare for DSCR investment loans; flag if points/fees approach 5% of loan amount

### Insurance (Kill Criterion in High-Risk Zones)
- 2026 reality: availability, not price
- High-risk zones: **FL, CA, TX Gulf, LA Coastal**
- 90%+ FL investors missed deals (2024)
- 83% CA investors missed deals (2024)
- 1-in-3 affordable housing saw 25%+ premium jumps
- Insurance feeds BOTH PITIA (T1) and OpEx (T2) — separately
- Model premium as volatile (10-30% annual increase in high-risk zones)
- **COASTAL-ONLY baseline (Round 19 Rev 6):** μ=12%, σ=8% is **coastal portfolio mean** — national avg is 7-9% (Insurify 2026). Use regional multiplier table by ZIP/county tier.
- **KBRA involuntary severity (Round 19 Rev 8):** 26.5% measured on 475K loans / $216.7B (2015-Apr 2025); corpus baseline 25% is conservative by 1.5pp. Document KBRA 26.5% as sensitivity anchor.

### FEMA Risk Rating 2.0 (Round 19 Rev 7 — DATES CORRECTED)
- **Effective: Oct 1, 2021 (new policies) / Apr 1, 2022 (renewals)** — NOT Apr 1, 2023 as in prior corpus
- Citation: Gourevitch et al. (2025) DOI 10.63024/32za-vmy3
- NFIP new policies: 11-39% decline post-RR 2.0 (varies by premium tier)
- Q2 8-34% / Q3 34-94% / Q4 >94% premium increases
- Federal Reserve FEDS Note (Jun 2026): MSR valuations could decline 5-13% under severe stress

### Insurance Kill Rule
```
ENGINE RULE: Insurability gate: if market flagged high-risk and quote unconfirmed → KILL CRITERION
```

### BRRRR Refi-Seasoning Gate
- Cash-out refis carry title- and value-seasoning rules (commonly 6-12 months)
- `seasoning_met(months_held, lender_rule) → cash_out_basis ∈ {ARV, cost}`
- EXCEPTION: Easy Street Capital waives 12-mo STR seasoning (BRRRR edge — verified 2026)

### Borrower Eligibility (Master DSCR Knowledge Doc)
- US Citizens / Permanent Residents: eligible
- Non-Permanent Resident Aliens: with evidence of legal US presence
- **ITIN Borrowers**: valid ITIN card + government photo ID
- **Foreign Nationals**: valid passport + visa/ESTA; OFAC screening; POA NOT permitted; alternative credit acceptable

### Personal Guarantors (Entity Lending)
- Members/managers with ≥51% cumulative ownership
- **FULL RECOURSE** required

### Tradeline Requirements
- 3 tradelines reporting for 12 mo OR 2 tradelines for 24 mo
- Alternative tradelines (rent, utilities) may be allowed

### Appraisal Rules
- Full interior/exterior, FNMA/FHLMC standards
- **≥$2M requires second appraisal**
- Appraisal review (CU, LCA, or desk) required on every loan unless 2nd appraisal
- Appraisals dated within 120 days prior to note date

### Capital Markets & Securitization
- Senior-subordinate tranching
- Overcollateralization
- Excess spread
- Credit enhancement: 5-15% for Non-QM pools
- Rating Agencies: KBRA (most active), DBRS Morningstar, Fitch, S&P

### Gain on Sale
```
GOS = Sale_Price - UPB - Origination_Costs - Hedging_Costs + MSR_Value
Non-QM MSR fair values (Feb 2026, MCT): 3.65x-4.25x servicing fee multiple
```

## Cross-References
- TOPIC 6 (Kill criteria — insurance, BRRRR seasoning)
- TOPIC 11 (PPP — MN HF 3437 etc.)
- TOPIC 10 (Evidence Vault — provenance per regulation)
- TOPIC 16 (Insurance as geographic gate)

---

# TOPIC 18: IC MEMO & REPORT GENERATION (RAG + CoT + Firewall)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Eight (AI Intake)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II (RAG + CoT)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` (LLM hallucination firewall)

## Data Points

### Hybrid OCR Pipeline (Order)
1. **Client Upload** → FastAPI /upload
2. **Document Classifier**: lease | rent_roll | T12 | 1007 | bank_statement
3. **OCR Router**:
   - Digital PDF → Docling + PyMuPDF
   - Scanned PDF → Mistral OCR 2505 ($1/1000 pages)
   - Complex/Handwritten → Reducto / LlamaParse
4. **LLM Extraction** → GPT-4o + Instructor → Pydantic schema JSON
5. **Confidence Scorer** → per-field confidence; flag <0.85
6. **Cross-Field Validator**:
   - Annual = Monthly × 12 reconciliation
   - NOI = Gross Rent - Expenses sanity check
   - Date range consistency
   - Tampering signals (metadata analysis)
7. **HITL Queue** → low-confidence → human review
8. **DSCR Compute Engine** → output DSCRResult
9. **PostgreSQL** → audit log

### HITL Rules
- Auto-approve: confidence ≥0.95 on non-critical fields
- Flag for review: confidence <0.85 on financial fields
- **Hard-block**: ALWAYS human-review rent schedules, CAM reconciliations, NOI calculations
- Two-step review: primary + secondary spot-check 10%

### Audit Trail Schema
```sql
CREATE TABLE lease_extraction_audit (
    id              UUID PRIMARY KEY,
    document_hash   TEXT NOT NULL,          -- SHA-256 of original file
    field_name      TEXT NOT NULL,
    extracted_value TEXT,
    confidence      FLOAT,
    source_page     INT,
    source_bbox     JSONB,                  -- {x1, y1, x2, y2}
    extraction_model TEXT,
    human_reviewer  TEXT,
    human_override  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Fraud Detection
- Cotality Q1 2026: Investment-property fraud indicators 1 in 44 (vs 1 in 129 overall)
- **Undisclosed real estate = largest rising category**
- Algorithms: CNN+LSTM visual anomaly; metadata fingerprinting; statistical distance measures
- **Market Rent Guardrail**: ±30% from RentCast AVM

### IC Memo Structure
- Sections: Executive Summary / Property / Borrower / DSCR Analysis (T1+T2) / Monte Carlo Output / Tax Strategy / Lender Match / Risk Rating / Approval Recommendation
- PDF format, signed/unsigned variants
- Logo, version, hash of source data (for audit trail)

### Required Disclaimer (Every Session / Export)
- Professional decision-support — not a loan commitment
- Data as of June 2026
- Tax outputs are estimates; confirm with CPA
- Return projections depend on forward assumptions

### LLM Hallucination Firewall (V3 canonical)
```python
def verify_llm_narrative(narrative: str, engine_output: dict) -> dict:
    extracted = extract_numeric_claims(narrative)
    results = {"verified": [], "mismatched": [], "fabricated": []}
    for claim in extracted:
        match = find_nearest_field(claim, engine_output)
        if match is None:
            results["fabricated"].append(claim)
        elif abs(claim.value - match.value) / max(abs(match.value), 1e-9) <= 0.005:
            results["verified"].append((claim, match))
        else:
            results["mismatched"].append((claim, match))
    return results
```

### Three-Metric Credit Standard (every credit memo header)
1. **DSCR (Cash Control)**: Can borrower make payment?
2. **Debt Yield (Workout Metric)**: Lender's cap rate if foreclose (target ≥9%)
3. **LTV (Loss-Given-Default)**: Asset deflation absorbed

### IC Memo Generated via RAG + CoT
- Retrieval-Augmented Generation: every claim links to source document + page + bounding box
- Chain-of-Thought: emulate financial analyst reasoning
- Modular Data-Object Architecture: governed data objects, not static documents

## Cross-References
- TOPIC 10 (Evidence Vault)
- TOPIC 13 (AI/ML)
- TOPIC 19 (OCR Pipeline)

---

# TOPIC 19: HYBRID OCR PIPELINE (Document Intelligence)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Eight §8.1
- `DSCR Sovereign OS: Godmode Research Plan.md` Part II (Docling + Mistral)
- `Master DSCR Knowledge Document.md` (Document & Evidence Layer)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §5 (Ocrolus + provenance)

## Data Points

### Vendor Comparison
| Vendor | Best For | Cost |
|---|---|---|
| **Docling** | Digital PDFs, table reconstruction | Open-source |
| **Mistral OCR 2505** | Scanned documents | $1/1000 pages ($0.50 batch) |
| **Reducto** | Complex multi-column | Enterprise |
| **LlamaParse** | Handwritten fallback | Enterprise |
| **GPT-4o + Instructor** | Vision extraction, Pydantic JSON | Per-token |
| **Ocrolus** | Mortgage-specialized (GA Apr 1, 2026) | $0.50-$3.00/page; $50K-$200K+/yr enterprise |

### Ocrolus (Verified 2026)
- Mortgage document coverage: >95%
- Document type classification: 1,600+ financial types
- Automated conditioning GA April 1, 2026
- GSE-approved analysis (Fannie Mae reps & warranties relief eligible)
- Data accuracy insurance: Lloyd's of London underwritten
- Monthly volume: ~750,000 credit applications
- Customer acquisition: ~3 new mortgage lender customers/week
- Native Encompass integration

### Confidence Thresholds
- ≥0.95: auto-approve non-critical fields
- <0.85: flag for review (financial fields)
- ALWAYS human-review: rent schedules, CAM reconciliations, NOI calculations
- 10% secondary spot-check on auto-approved

### Cross-Field Validation Rules
- Annual = Monthly × 12 reconciliation
- NOI = Gross Rent - Expenses sanity check
- Date range consistency
- Tampering signals (metadata analysis)

### Market Rent Guardrail
- ±30% from RentCast AVM = auto-flag
- Catches inflated leases, below-market leases, stale leases

### Vendor Recommendations (Missing Pieces P0 Gaps)
- Bank Statement parsing: **Ocrolus** (or LoanLogics)
- PPE: **LoanPASS** or Lender Price FLEX
- TPO Mgmt: Salesforce Financial Services Cloud + Encompass TPO Connect
- Warehouse: LoanVantage or ICE Encompass warehouse modules
- MSR: MIAC Analytics or MCT Trading
- QC: ACES Quality Management or LoanLogics
- LOS: ICE Encompass or Calyx PointCentral
- CMS: Wolters Kluwer Compliance One

## Cross-References
- TOPIC 18 (IC Memo)
- TOPIC 14 (Cost stack)

---

# TOPIC 20: BUILD ORDER & ARCHITECTURE (Three-Plane)

## Primary Sources
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` Part Twelve (Build Roadmap)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` §10 (Final Build Sequence)
- `DSCR Sovereign OS: Godmode Research Plan.md` Part V (Sprint Plan)
- `DSCR Sovereign OS  Sprint 6 Findings.md` (Phase 1 done)

## Data Points

### Three-Plane Architecture
- **Projection Plane**: Human-facing (Scenario Builder, Lender Matchmaker, After-Tax IRR Studio, IC Memo Command)
- **Graph Plane**: Causal central nervous system (Nodes: Borrower, Property, Lender, Law, Rate; Typed Edges: Qualifies, Conflicts, Supersedes, Shocks)
- **Ledger Plane**: Immutable append-only event log

### Tech Stack (Confirmed)
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, RHF+Zod, TanStack Table, Recharts
- **Backend**: Python 3.11+, FastAPI, SciPy (bisection/XIRR), Celery+Redis
- **Database**: PostgreSQL + JSONB + pgvector
- **Storage**: S3 (immutable versioning, Object Lock)
- **Infrastructure**: Vercel (frontend), Celery+Redis (background), Neon Postgres (serverless)

### Semantic Diff Engine
- Classifies changes by facet: Location, Timing, Budget, Legal
- Structural change (e.g., LLC → Individual vesting) → causal propagation through PPP Legal Branching Gate
- Cosmetic change (typo fix) → no propagation

### Six-Function Doctrine (Godmode v7)
1. Scenario Accuracy: <10 min GO/NO-GO verdict
2. Guideline Intelligence: 25+ lenders, auto-fit, two-quote
3. Borrower Trust: every quote regulator-ready
4. Capital Partner Trust: first-pass clean rate >90%
5. Distribution: 60%+ revenue from repeat referrals
6. Risk Discipline: false-decline <5%

### Build Phases (Final, V3 canonical)
| Phase | Deliverable | Duration |
|---|---|---|
| **Phase 1** | Deterministic core + Evidence Vault + inference provenance schema | Weeks 1-8 |
| **Phase 2** | Vendor normalization + 50-state compliance + OBBBA tax layer | Weeks 4-12 |
| **Phase 3** | R-vine stress + conformal intervals + NSS-Svensson/Hull-White rate engine | Weeks 8-16 |
| **Phase 3b** | Distributional DSCR schema + LLM hallucination firewall | (within Phase 3) |
| **Phase 4** | TimesFM 2.5 + TFT + approval predictor | Weeks 12-20 |
| **Phase 4b** | CECL lifetime expected credit loss model | (within Phase 4) |
| **Phase 5** | Graph contagion + warehouse/securitization analytics | Post-volume |

### Team Composition (7-9 FTEs)
| Role | Count | Primary Focus |
|---|---|---|
| Engineering Lead | 1 | Architecture, Evidence Vault, vendor integration |
| Backend Engineer | 1-2 | API layer, data normalization, lender matrix |
| Full-Stack Engineer | 1-2 | Deal desk UI, scenario compare, IC memo |
| Quant/ML Engineer | 1 | Monte Carlo, TimesFM 2.5, CPTC, approval predictor |
| Data Engineer | 1 | BigQuery pipelines, FRED/RentCast/AirDNA integration |
| Mortgage SME | 1 | Underwriting logic, lender guideline validation |
| Compliance/Legal Ops | 0.5-1 | Legal rules, state law, STR gating, NMLS |
| Product/Ops | 1 | Roadmap, broker feedback, launch coordination |

### Milestone Timeline
- **Aug 2026**: Alpha — Deterministic core + Evidence Vault + 5 lenders + Monte Carlo
- **Oct 2026**: Private Beta — Full lender matrix + TimesFM 2.5 + CPTC conformal + compliance (10 states)
- **Dec 2026**: Commercial v1 — 50-state compliance + approval predictor + IC memo + broker portal
- **Mar 2027**: Capital-Markets v1 — Warehouse integration + loan tape + securitization analytics

## Cross-References
- TOPIC 13 (Phase 4 ML layer)
- TOPIC 7 (Phase 3 Monte Carlo)
- TOPIC 6 (Definition of Done — 23 criteria)

---

# APPENDIX: Cross-Cutting Concern → Topic Mapping

| Concern | Topic |
|---|---|
| Payment math | TOPIC 2 |
| DSCR math | TOPIC 1 |
| Monte Carlo | TOPIC 7 |
| AI/ML forecasting | TOPIC 13 |
| Lender matching | TOPIC 8 |
| Rates | TOPIC 5 |
| STR underwriting | TOPIC 9 |
| Tax math | TOPIC 4 |
| After-tax IRR | TOPIC 4 |
| Returns engine | TOPIC 3 |
| Compliance | TOPIC 17 |
| PPP rules | TOPIC 11 |
| Property tax | TOPIC 16 |
| Insurance | TOPIC 17 |
| Evidence Vault | TOPIC 10 |
| OCR pipeline | TOPIC 19 |
| IC Memo | TOPIC 18 |
| Vendors / costs | TOPIC 14 |
| Market data | TOPIC 15 |
| Build architecture | TOPIC 20 |
| Definition of Done | TOPIC 6 |

---

*Last updated: 2026-06-18. Cross-references verified against source documents on read.*
