---
type: research
status: drafted
confidence: 3
title: "DSCR Sovereign OS: Upgrade Intelligence Report"
summary: "> **Canonical Truth:** A DSCR loan can qualify with a lender and simultaneously be a catastrophic investment. Every feature in this system must serve *both* the lender qualification track and the investor survival track. Conflating them produces the most expensive mistake in real estate finance."
entities:
  - concept/appreciation
  - concept/arm
  - concept/cap-rate
  - concept/cltv
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/fred
  - data/freddie-mac
  - data/kbra
  - lender/american-heritage
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/visio-lending
  - math/copula
  - math/t-copula
  - ml/shap
  - ml/xgboost
  - regulation/cfpb
  - regulation/section-1071
  - state/ca
  - state/fl
  - state/tx
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - topic/condo
  - topic/condotel
  - topic/sfr
  - topic/str
tags:
  - ml/xgboost
  - topic/40yr-amort
  - topic/after-tax
  - topic/architecture
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/llpa
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/tax
  - type/audit
source: DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS: Upgrade Intelligence Report
## Complete Feature Engineering Blueprint for DSCR Loan Default Prediction
### Version: Sovereign Edition — June 2026 | Incorporating All 29 Source Documents

---

> **Canonical Truth:** A DSCR loan can qualify with a lender and simultaneously be a catastrophic investment. Every feature in this system must serve *both* the lender qualification track and the investor survival track. Conflating them produces the most expensive mistake in real estate finance.

---

## PART I: ARCHITECTURAL FOUNDATION — THE DUAL-TRACK IMPERATIVE

### 1.1 Why Default Prediction Requires Two Separate Feature Spaces

Standard mortgage default models use a single feature space. DSCR default prediction requires two structurally distinct spaces that must never be merged:

| Dimension | Track 1: Lender Qualification Features | Track 2: Investor Survival Features |
|---|---|---|
| **Income Basis** | Gross Rent (lower of lease vs. Form 1007) | Gross Rent × (1 − vacancy) − OpEx |
| **Denominator** | PITIA (full amortizing payment) | PITIA (same) |
| **Vacancy** | Excluded (lender convention) | Included (market-specific, 5–20%) |
| **Management** | Excluded | Included (8–12% of gross) |
| **Maintenance** | Excluded | Included (5–8% of EGI) |
| **Prediction Target** | Lender rejection / approval | Negative cash flow / default |
| **Kill Threshold** | T1 < 0.75 (hard floor) | T2 < 0.88 triggers mandatory acknowledgment |

**Golden Test Vector (v11.2 — June 17, 2026):**
- Purchase price: $425,000 | LTV: 75% | Loan: $318,750
- Gross rent: $3,000/mo | Form 1007: $3,000/mo
- Tax: $5,000/yr | Insurance: $2,000/yr | HOA: $150/mo
- At 7.00%: PI = $2,121 | PITIA = $2,855
- **Track 1 DSCR = 1.05** (PASSES — lender sees this)
- **Track 2 DSCR = 0.88** (FAILS — investor bleeds $335/mo)
- Deal-break rate: **7.67%** | Rate cushion: 67 bps

This is the definitive proof case. Any model that outputs only one number is lying by omission.

---

## PART II: COMPLETE FEATURE ENGINEERING TAXONOMY

### 2.1 Category A — Core DSCR Ratio Features

These are the primary predictive signals and must be computed with verified math (v11.2 golden values).

```
DSCR_T1 = QualifyingRent / PITIA
  QualifyingRent = MIN(signed_lease, form_1007_market_rent)
  PITIA = PI + monthly_tax + monthly_insurance + monthly_hoa

DSCR_T2 = (GrossRent × (1 − vacancy) − mgmt_fee − maintenance) / PITIA

PI_factor(r, n) = r/12 × (1 + r/12)^n / ((1 + r/12)^n − 1)
  At 7.00%: factor = 0.0066530  → PI = $2,121
  At 8.25%: factor = 0.0075127  → PI = $2,254
  At 6.125%: factor = 0.0060761 → PI = $1,935
```

**Engineered Features from DSCR:**
- `dscr_t1_raw` — base lender ratio
- `dscr_t2_raw` — investor survival ratio
- `dscr_delta` — T1 − T2 (tracks the qualification/survival gap; high delta = latent distress)
- `dscr_t1_to_floor_cushion` — (T1 − lender_floor) in absolute and bps terms
- `dscr_breakeven_rate` — rate at which T1 = floor (solved via `scipy.optimize.brentq`)
- `dscr_cushion_bps` — (breakeven_rate − note_rate) × 10,000
- `dscr_t1_at_reset` — for ARM files: recomputed at SOFR + margin, capped to cap structure
- `dscr_stress_vacancy` — T2 at vacancy + 5 percentage points
- `dscr_stress_rate` — T1 recomputed at note_rate + 200 bps
- `dscr_io_vs_amortizing_delta` — spread between IO DSCR and amortizing DSCR (IO inflates T1)

### 2.2 Category B — Loan-to-Value and Leverage Features

```
LTV = loan_amount / MIN(purchase_price, appraised_value)
CLTV = (first_lien + subordinate) / appraised_value
Debt_Yield = annual_NOI / loan_amount  ← leverage-independent signal
```

**Engineered Features:**
- `ltv_raw` — base LTV ratio
- `ltv_vs_program_max` — distance from program ceiling (negative = at risk)
- `ltv_declining_market_flag` — 1 if state in {CT, FL, IL, NJ, NY} and LTV > state cap
- `debt_yield` — NOI/Loan (institutional floor: 9–10%)
- `debt_yield_vs_market` — relative to NCREIF / CRED iQ property type benchmarks
- `equity_cushion_pct` — (1 − LTV) as a default-recovery buffer
- `loan_vs_min_floor` — loan amount vs. lender minimum ($75K–$150K floors); below = ineligible
- `ltv_at_stress_appraisal` — LTV if appraised value declines 10%
- `max_loan_at_target_dscr` — maximum fundable loan at lender floor DSCR (bisection-solved)

### 2.3 Category C — Credit and Borrower Profile Features

**Hard FICO Caps by Program Tier (v11.2 verified):**

| FICO Range | Rate Adj (bps) | LTV Impact | Notes |
|---|---|---|---|
| 760+ | 0 (par) | None | Best tier; 6.125% rate at 70% LTV, 1.0 DSCR |
| 740–759 | +5 to +12 | None | Griffin modal file |
| 720–739 | +12.5 | None | Standard tier |
| 700–719 | +12.5 to +25 | −5% LTV | Mid tier |
| 680–699 | +50 (cliff) | −5% LTV | Visio floor; STR restrictions |
| 660–679 | +87.5 (cliff) | −10% LTV | Kiavi floor |
| 640–659 | +150 to +250 | −15% LTV | Defy/New Silver territory |
| 620–639 | +250 (hard floor) | −20% LTV | Griffin/LendingOne floor |
| <620 | Hard reject | N/A | Universal floor |

**Engineered Features:**
- `fico_score` — qualifying score (middle of 3, or lower of 2)
- `fico_tier` — ordinal 1–8 mapping to rate grid above
- `fico_to_program_floor` — distance from lender's published minimum
- `fico_rate_penalty_bps` — lookup from LLPA grid
- `tradeline_count_12mo` — minimum 3 tradelines ≥ 12 months (CAKE v4.0 requirement)
- `tradeline_count_24mo` — alternative qualifying path
- `housing_event_flag` — 1 if any 30+ DPD in prior 24 months
- `housing_event_severity` — 0=clean, 1=30DPD, 2=60DPD, 3=BK/FC/SS
- `housing_event_months_seasoned` — months since last housing event
- `is_experienced_investor` — 1 if owned non-OO property 12+ months in prior 3 years
- `is_first_time_homebuyer` — 1 if never owned any property (CAKE FTHB definition)
- `is_foreign_national` — 1 if non-US-resident; triggers separate FN risk tier
- `is_itin_borrower` — 1 if ITIN; SSN-required lenders (Kiavi) will reject
- `entity_vesting_type` — Individual / LLC / Corp / Trust
- `entity_layer_count` — 1 = single LLC, 2 = layered LLC (CAKE: max 2 layers)

### 2.4 Category D — Income and Rent Features (The Most Critical Signal Set)

The rent figure is where the highest-risk analytical failures occur. Three worlds exist — they must never be blended.

**World 1: Long-Term Rent (LT)**
```
qualifying_rent_LT = MIN(lease_rent, form_1007_market_rent)
override_rule: if form_1007 > lease × 1.20 → use MIN(lease × 1.20, form_1007)
vacancy_T1 = 0  (excluded from lender qualification)
vacancy_T2 = 0.05 to 0.10 (LT market-specific)
```

**World 2: STR Projected**
```
qualifying_rent_STR_proj = MIN(
    airdna_gross × (1 − haircut),
    form_1007_LT_market_rent  ← appraisal governs; wins over AirDNA always
)
haircut = 0.20 standard (CAKE v4.0: 20% vacancy factor if not appraiser-stated)
vacancy_T2 = 0.30 to 0.50 (STR seasonality is severe)
opex_ratio_STR = 0.45 to 0.65 of gross (vs. 0.30–0.45 for LT)
```

**World 3: STR Documented (12-month history)**
```
qualifying_rent_STR_doc = actual_12mo_receipts / 12 − vendor_mgmt_fees
min_history = 12 months from third-party platform
max_occupancy_cap = 2 persons per bedroom (CAKE v4.0 rule)
```

**Engineered Features:**
- `rent_source_world` — 1/2/3 (LT / STR-projected / STR-documented)
- `rent_vs_form_1007` — ratio of actual/proposed rent to appraisal market rent
- `rent_above_1007_flag` — 1 if lease > 1007 by > 20% (CAKE: caps qualifying at 120% of 1007)
- `rent_income_method` — GrossPITIA vs. NOI/PI (0.10–0.20 DSCR swing)
- `airdna_market_score` — must be ≥ 60 for CAKE v4.0 STR acceptance
- `airdna_comparable_count` — must have ≥ 3 comparables in AirDNA report
- `str_legality_status` — CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED
- `str_permit_status` — open / capped / closed (permit availability)
- `str_hoa_restriction_flag` — 1 if HOA silent or restrictive (requires attorney review)
- `str_min_stay_days` — local minimum stay requirement (>30 days kills STR thesis)
- `vacancy_rate_LT` — market LTV vacancy (Census/ATTOM data)
- `vacancy_rate_STR_seasonal_min` — worst monthly occupancy in trailing 12 months
- `monthly_dscr_min` — lowest single month DSCR (annual 1.15 can hide 0.60 off-season months)
- `rent_growth_yoy_market` — market-level YoY rent growth (ATTOM/RentCast)
- `rental_yield_compression_flag` — 1 if in one of the 54.8% of US counties with yield compression (2025→2026)

### 2.5 Category E — Rate and Debt Structure Features

**Live Market Anchors (June 17, 2026 — re-fetch at every session open):**

| Index | Value | Source |
|---|---|---|
| 10-Year Treasury (DGS10) | 4.44–4.47% | FRED |
| 5-Year Treasury | 4.26% | Northmarq |
| 30-Day Avg. SOFR | 3.59% | Northmarq |
| Fed Effective FFR | 3.62% | FRB H.15 |
| Freddie Mac 30yr Fixed | 6.53% | Multiple |
| DSCR Best-Tier par rate | **6.125%** | Griffin/HomeAbroad/Defy |

**Credit Spread Structure (not a flat spread — risk-tiered):**
- Best-tier (760 FICO / ≤70% LTV / 1.25 DSCR): 10yr + 175–225 bps = 6.2–6.7%
- Standard (typical file): 10yr + 250–350 bps = 6.9–7.8%
- Weaker file (low FICO/DSCR/STR/ARM): 10yr + 350–450 bps = 7.9–8.9%
- Foreign national: 7.00–7.25% competitive band (0.50 spread from standard)
- Full-market / thin file / condotel: up to 10.75%

**ARM SOFR Reset Engine:**
```python
index = sofr_30d  # 3.59% as of June 17, 2026
margin = lender_margin  # typically 250–350 bps over SOFR
floor_rate = initial_arm_rate  # most DSCR ARMs: initial rate = floor
reset_rate = max(floor_rate, index + margin)
cap_structure = {
    'initial_cap': 0.02,    # 2% most programs (some: 5%)
    'periodic_cap': 0.01,   # 1% per period
    'lifetime_cap': 0.05    # 5–6% over initial
}
recast_payment = PI(loan_balance_at_reset, reset_rate, remaining_term)
dscr_at_reset = qualifying_rent / recast_payment_plus_TIA
```

**Engineered Features:**
- `note_rate` — actual note rate
- `rate_vs_par` — spread above 6.125% par
- `rate_tier` — 1=competitive/2=standard/3=weaker/4=full-market
- `product_type` — 30yr_fixed / 40yr_fixed / ARM_5_1 / ARM_7_1 / IO
- `io_period_years` — if IO: years until amortizing recast
- `io_dscr_inflation` — DSCR boost from IO vs. amortizing (mask of true risk)
- `arm_sofr_margin` — lender margin over SOFR
- `arm_reset_rate_current_sofr` — reset rate at current 3.59% SOFR
- `arm_reset_rate_stress_sofr` — reset rate at 5.0% stress SOFR
- `arm_dscr_at_stress_reset` — T1 DSCR after stress reset
- `arm_double_shock_year` — year when IO expires AND rate resets simultaneously
- `arm_double_shock_flag` — 1 if IO expiry and reset occur in same year (highest risk)
- `aey_lender` — All-in Effective Yield via XIRR over expected hold period
- `aey_vs_par` — AEY spread above par rate (true cost comparison)
- `ppp_penalty_base` — 'remaining' (default) or 'original' (OH, some others — statutory)
- `ppp_structure` — 5-4-3-2-1 / 3-2-1 / flat / 6mo-interest / none
- `ppp_illegal_flag` — 1 if PPP structure prohibited for this state/entity/loan-size combo
- `ppp_no_ppp_rate_premium_bps` — rate increase if PPP disabled (50–80 bps)
- `breakeven_hold_months` — months until rate savings recoup PPP cost
- `points_recoup_months` — months to break even on discount points paid

### 2.6 Category F — Reserve and Liquidity Features

**Reserve Tiering Matrix (v11.2 verified):**

| DSCR Range | Base Reserve | STR Add | Sub-1.0 Add | Geographic |
|---|---|---|---|---|
| ≥ 1.25 (740 FICO / ≤75% LTV) | 3 months | +3–6 mo | N/A | N/A |
| ≥ 1.25 (< 740 FICO) | 6 months | +3–6 mo | N/A | N/A |
| 1.10–1.24 | 6 months | +3–6 mo | N/A | N/A |
| 1.00–1.09 | 6–9 months | +3–6 mo | N/A | +2 CA/NY |
| 0.75–0.99 | **9 months (floor)** | +3–6 mo | Specialist territory | +2 CA/NY |
| < 0.75 | Decline or 12–18 mo | — | — | — |

**Reserve Liquidity Hierarchy:**
- Tier 1 (100%): Cash, checking, savings, CDs
- Tier 2 (100%): Marketable securities (stocks, bonds, mutual funds — margin excluded)
- Tier 3 (70% if ≥59, 50% if <59): IRA/401k/Keogh
- Excluded: Home equity, crypto, gift funds (reserves only), borrowed funds
- Bitcoin/Ethereum exception: CAKE v4.0 allows for down payment (not reserves) if held on reputable exchange

**Engineered Features:**
- `reserves_months_post_close` — liquid reserves after down payment and closing costs
- `reserves_vs_requirement` — actual months minus required months
- `reserves_deficit_months` — negative = shortfall (kill criterion)
- `reserves_tier_quality` — weighted average of tier 1/2/3 composition
- `reserves_cash_pct` — percent in Tier 1 cash
- `portfolio_stack_reserves` — aggregate PITIA × months if multiple financed properties
- `seasoning_months_for_cashout` — months since acquisition (standard: 90 days note-to-note)
- `brrrr_arv_gap` — if ARV cash-out: (ARV_cashout_proceeds − cost_basis) / carry_cost
- `brrrr_seasoning_gate_flag` — 1 if STR cash-out and lender requires 12-month seasoning
- `easy_street_seasoning_waiver` — 1 if Easy Street Capital (only lender that waives 12-mo STR)

### 2.7 Category G — Property and Collateral Features

**Engineered Features:**
- `property_type` — SFR / 2-unit / 3-unit / 4-unit / condo / manufactured / condotel / rural
- `property_type_risk_tier` — 1=SFR/2-unit/2=3-4-unit/3=condo/4=condotel/manufactured
- `adu_flag` — 1 if accessory dwelling unit present (CAKE: county determines classification)
- `occupancy_status` — leased / vacant / STR
- `vacant_flag` — 1 if property is vacant (triggers 1007 as sole rent source)
- `appraisal_rent_vs_asking` — ratio of Form 1007 rent to projected rent
- `appraisal_value_vs_purchase` — ratio (below 1.0 = appraisal comes in low)
- `appraisal_rent_shock_flag` — 1 if qualifying rent from 1007 makes T1 < floor
- `appraisal_value_shock_flag` — 1 if appraised value < purchase price
- `cltv_vs_limit` — combined LTV vs. lender cap (subordinate financing rare in DSCR)
- `loan_amount_vs_program_min` — loan vs. lender minimum (most: $75K–$150K)
- `jumbo_flag` — 1 if loan > $2M (narrows eligible lenders; Griffin to $4M)
- `declining_market_overlay_flag` — 1 if state {CT, FL, IL, NJ, NY} or specific county
- `disaster_area_flag` — 1 if FEMA designated disaster area (special appraisal requirements)
- `condo_warrantable_flag` — 1 if warrantable (non-warrantable adds 50–100 bps)
- `flip_transaction_flag` — 1 if property purchased < 90 days ago (flip overlays apply)
- `solar_panel_subordinate` — 1 if PACE/solar subordinate lien (must include in DSCR)
- `leasehold_flag` — 1 if leasehold property (specialized title requirements)

### 2.8 Category H — Tax Reassessment Features (Highest-Priority Fix from v11.2)

**The Sellers Tax Bill Trap:** Using the seller's current tax bill silently overstates DSCR by 15–40% in high-tax-basis-reset states. This is the same class of failure as the vacancy haircut.

```python
reassessed_tax = purchase_price × effective_mill_rate(state, county)
PITIA_correct = PI + reassessed_tax/12 + insurance/12 + hoa/12
# DO NOT use: seller_current_tax_bill
```

**State Rules Encoded:**
- **California (Prop 13)**: Full reset to purchase price at sale. Prior owner may have had assessed value from 1978. Annual increase capped at 2% thereafter. Supplemental bill arrives post-closing.
- **Texas**: 2–3% of market value annually. Purchase triggers full market value reassessment.
- **Florida**: Purchase-year reset to market value.
- **NJ/NY/IL**: High-reassessment states; require per-county confirmation.

**Engineered Features:**
- `tax_reassessed_annual` — purchase_price × state_mill_rate
- `tax_seller_current_annual` — what seller is currently paying
- `tax_reassessment_delta_monthly` — (reassessed − seller_current) / 12
- `tax_reassessment_dscr_impact` — DSCR change from seller bill to buyer bill
- `tax_reassessment_state` — CA / TX / FL / NJ / NY / Other
- `ca_prop13_supplemental_bill_flag` — 1 if California purchase (stub-period bill)
- `effective_tax_rate_pct` — reassessed_tax / purchase_price

### 2.9 Category I — Insurance and Geographic Risk Features

**Kill Criterion Status (v11.2 elevated from line item to gate):**
- 90% of FL investors, 83% of CA investors missed deals due to insurance issues (2024 survey)
- 57% of all investors nationwide reported insurance-driven missed opportunities
- 1-in-3 affordable housing providers: premium increases ≥ 25% in 2023
- Multiple states: projected double-digit rate increases in 2026

**High-Risk Zones (insurance = kill criterion until bindable quote in hand):**
- FL (all), CA-Coastal, CA-Wildfire, TX-Gulf, LA-Coastal, select Midwest flood zones

**Engineered Features:**
- `insurance_status` — confirmed_bindable / quoted_unconfirmed / kill_criterion
- `insurance_annual_premium` — actual or estimated premium
- `insurance_vs_estimated` — ratio to standard market rate
- `high_risk_zone_flag` — 1 if in kill-criterion geography
- `ca_sustainable_insurance_zone_flag` — 1 if in CDOI expanded coverage area (2026 reform)
- `flood_zone_flag` — FEMA flood zone designation (A/AE/X)
- `insurance_stress_year3` — premium × 1.25 (3-year stress at 25% increase)
- `insurance_as_pct_gross_rent` — insurance_annual / (gross_rent × 12)

### 2.10 Category J — Tax and Return Features (After-Tax IRR Drivers)

**Depreciation Engine:**
```
building_basis = purchase_price - land_value
land_pct = 0.10–0.25 (higher in urban/coastal)
annual_depreciation = building_basis / 27.5

# OBBBA Bonus Depreciation (encoded as law, not placeholder):
if acquisition_date >= '2025-01-20':
    bonus_dep_rate = 1.00  # 100% — permanently reinstated
elif acquisition_date >= '2025-01-01':
    bonus_dep_rate = 0.40  # 40% (placed in service 2025)
elif acquisition_date >= '2026-01-01':
    bonus_dep_rate = 0.20  # 20% (placed in service 2026)

# Short-life components (cost seg): 5/7/15-year class
# Apply bonus_dep_rate to these components only
```

**After-Tax Stack:**
```
recapture_rate = 0.25 + (0.038 if MAGI > niit_threshold else 0)
# = 28.8% effective for high-income investors

ltcg_rate = 0.20 + (0.038 if NIIT_applies else 0)
# = 23.8% effective for top bracket

pal_allowance = max(0, 25000 - max(0, (MAGI - 100000) * 0.5))
# Fully phased out at MAGI ≥ $150,000
# REP exception: if hours ≥ 750 AND ≥ 50% of time → unlimited
```

**Engineered Features:**
- `depreciation_annual` — building_basis / 27.5
- `cost_seg_eligible_flag` — 1 if property_value ≥ $450K
- `cost_seg_first_year_savings` — estimated accelerated deduction
- `bonus_dep_pct` — from OBBBA table above
- `after_tax_noi_year1` — pre-tax NOI − depreciation × marginal_rate
- `pal_allowance` — passive loss allowance based on MAGI
- `niit_applies_flag` — 1 if MAGI > $200K single / $250K MFJ
- `recapture_tax_exit` — accumulated_depreciation × recapture_rate
- `after_tax_irr_pretax_adjustment` — IRR delta from after-tax vs. pre-tax
- `after_tax_irr` — computed via `pyxirr.xirr()` with full cash flow series
- `irr_grade` — A(≥15%) / B(12–15%) / C(8–12%) / D(<8%) / F(negative)
- `section_1031_eligible_flag` — 1 if structured for like-kind exchange
- `brrrr_return_on_equity` — (annual NOI − ADS) / total_equity_deployed
- `equity_multiple` — total_distributions / equity_invested

---

## PART III: LENDER QUALIFICATION PREDICTION FEATURES

### 3.1 Lender-Specific Program Compatibility Features

The AI Lender Matching Engine requires per-lender feature vectors. Hard eligibility gates must fire before any probabilistic scoring.

**Verified Lender Profiles (June 17, 2026):**

| Lender | Min DSCR | Min FICO | Max LTV | STR | FN/ITIN | Key Differentiator |
|---|---|---|---|---|---|---|
| Griffin Funding | 0.75 | 620 | 80% (15% dn possible) | Yes | Yes (FN) | Sub-1.0 nationwide; ARM from 5.125% |
| Defy Mortgage | 0.75 | 640 | **85%** (740 FICO SFR purchase only) | Yes (AirDNA) | Yes | 85% exception; 14–21d close |
| Easy Street Capital | 1.0 | 640 | 80% / 75% cash-out | Yes | Unknown | **Waives 12-mo STR seasoning** |
| Lima One Capital | 0.75 | 660 | 80% | Yes (AirDNA 45%) | No info | Portfolio/blanket; exit warning |
| Kiavi | 1.1 (prequalify) | 660 | 80% | Unverified | **No — SSN required** | Speed/tech |
| New Silver | 0.75 | 580 | 80% | Yes | Not stated | 580 FICO floor; instant approval |
| Visio Lending | 0.75 | 680 | 80% | Broadest STR | Not stated | Cleanest public T1 rule |
| Deephaven | 0.75 | 660 | 80% | Conditional | Not stated | **STALE — reverify priority** |
| American Heritage | 0.75 | 660 | 85% (760 FICO) | Yes | Not stated | Sub-1.0 with compensating factors |
| CAKE Mortgage (v4.0) | Varies | Varies | Per matrix | Yes (AirDNA purchase only) | Yes | Institutional guideline spec |

**Engineered Features:**
- `lender_fico_eligible_count` — number of lenders where FICO clears their floor
- `lender_dscr_eligible_count` — number of lenders where T1 DSCR clears their floor
- `lender_ltv_eligible_count` — number of lenders where LTV clears their ceiling
- `lender_property_type_eligible_count` — eligible count by property type
- `lender_str_eligible_flag` — 1 if property is STR and ≥1 lender accepts it
- `best_fit_lender_aey` — AEY of best-fit lender over expected hold
- `second_fit_lender_aey` — AEY of second-fit lender (two-quote rule)
- `aey_delta_dollars_hold` — AEY cost difference over hold period
- `lender_confidence_score` — 1–100 (provenance-based; tiebreaker only)
- `lender_data_stale_flag` — 1 if verifieddate > 90 days ago
- `counterparty_continuity_flag` — 1 if lender withdrew from market 2022–2023

### 3.2 PPP Legal Gate Features

```python
def ppp_legal_gate(state, entity_type, loan_amount, unit_count, product_type):
    if state == 'MN' and loan_purpose == 'consumer':
        return 'PROHIBITED'  # HF 3437 enacted April 23, 2026, eff. Aug 1, 2026
        # DSCR business-purpose: NOT reached by 58.137
    if state == 'PA' and unit_count <= 2 and loan_amount < 329411:  # 2026 indexed
        return 'PROHIBITED'
    if state == 'OH' and unit_count <= 2 and loan_amount < 116356:  # 2026 indexed
        return 'PROHIBITED'
    if state == 'NJ' and entity_type == 'Individual':
        return 'PROHIBITED'  # N.J.S.A. 46:10B-2
    if state == 'NJ' and entity_type == 'LLC':
        return 'HIGH_RISK'   # Lender matrix split: some allow LLC, some require C-corp
    if state == 'MS':
        return 'DECLINING_ONLY'  # Miss. Code 75-17-31: max 5-4-3-2-1
    if state == 'AK' and entity_type == 'Individual':
        return 'PROHIBITED'
    if state == 'AK' and entity_type in ['LLC', 'Corp']:
        return 'ALLOWED'
    ...
```

**Engineered Features:**
- `ppp_legal_status` — ALLOWED / PROHIBITED / HIGH_RISK / DECLINING_ONLY / AMBIGUOUS
- `ppp_rate_subsidy_lost_bps` — if prohibited, rate premium (50–80 bps standard)
- `ppp_dscr_impact_if_prohibited` — DSCR change from rate increase when PPP removed
- `oh_pa_reconfirm_flag` — 1 if OH or PA (thresholds indexed annually — reconfirm January)

---

## PART IV: PROBABILISTIC RISK ENGINE FEATURES

### 4.1 Monte Carlo Parameter Distributions

**10,000 trials per deal. t-copula (5–7 df) — Gaussian copula BANNED (2008 CDO failure mode).**

**Input Distributions (KBRA/ATTOM calibrated):**

| Variable | Distribution | Parameters | Correlation |
|---|---|---|---|
| Rent YoY growth | Normal | μ=2.0%, σ=4.5% | ρ(rent,vacancy)=−0.7 |
| Vacancy rate | Beta | α=2.5, β=22 (5% mean) | ρ(vacancy,rate)=+0.3 |
| Rate change (refi) | t(5df) | center=0, spread=150bps | — |
| Exit cap rate | Normal | μ=current_cap, σ=50bps | ρ(cap,rate)=+0.6 |
| Expense growth | Lognormal | μ=3%, σ=2% | — |
| Insurance premium | Lognormal | μ=8%, σ=15% (high-risk) | — |

**For counties with documented yield compression (54.8% of US counties 2025–2026):** adjust rent distribution to negative skew (fatter left tail).

**Outputs:**
- `p10_dscr` — 10th percentile DSCR over loan term
- `p50_dscr` — median DSCR
- `p90_dscr` — 90th percentile DSCR
- `prob_dscr_below_floor` — P(T1 < lender_floor) over loan term
- `prob_negative_cashflow` — P(T2 < 0) over loan term
- `irr_p10_pretax` — 10th percentile levered IRR (pre-tax)
- `irr_p50_pretax` — median levered IRR
- `irr_p90_pretax` — 90th percentile levered IRR
- `irr_p50_aftertax` — median after-tax levered IRR
- `reserve_burn_months_p10` — worst-case reserve drawdown path
- `prob_default_institutional_threshold` — P(DSCR < 1.00) > 10% triggers CONDITIONAL
- `prob_default_pass_threshold` — P(DSCR < 1.00) > 15% triggers PASS

### 4.2 Tornado Chart Sensitivity Features

Rank variables by absolute DSCR impact:
- ±$100/mo rent change → DSCR swing (LT: ~0.035, STR: up to 0.15)
- ±1% vacancy → DSCR swing (~0.01–0.05 depending on gross rent margin)
- ±100 bps rate change → DSCR swing (reference deal: ~0.038)
- ±25% insurance premium → DSCR swing (high-risk zones: 0.01–0.03)
- ±10% property tax reassessment → DSCR swing

**Engineered Features:**
- `sensitivity_rent_100mo` — DSCR change per $100/mo rent movement
- `sensitivity_rate_100bps` — DSCR change per 100 bps rate change
- `sensitivity_vacancy_1pct` — DSCR change per 1% vacancy change
- `binding_risk_variable` — variable with highest tornado impact
- `binding_risk_magnitude` — DSCR swing of top variable

---

## PART V: RETURN AND INVESTMENT VIABILITY FEATURES

### 5.1 Core Return Metrics

```python
# Cap Rate
cap_rate = annual_NOI / purchase_price

# Yield-on-Cost
yield_on_cost = stabilized_NOI / total_cost  # includes rehab

# Cash-on-Cash
coc_return = (annual_T2_cashflow) / (down_payment + closing_costs + reserves)

# Debt Yield
debt_yield = annual_NOI / loan_amount

# Break-Even Occupancy
breakeven_occupancy = (OpEx + ADS) / (GPR)

# Equity Multiple
equity_multiple = sum(all_distributions + exit_proceeds) / equity_invested

# Gross Rent Multiplier
grm = purchase_price / (monthly_gross_rent × 12)
```

**48-Cell Hold Matrix:**
- 4 hold periods (3, 5, 7, 10 years)
- 3 exit cap scenarios (−50bps, flat, +50bps)
- 4 rent growth rates (0%, 1%, 2%, 3%)

**Engineered Features:**
- `cap_rate_entry` — NOI at acquisition / purchase price
- `cap_rate_stabilized` — stabilized NOI / total cost
- `cap_rate_vs_market` — property cap rate vs. NCREIF/CBRE market comp
- `debt_yield` — annual NOI / loan amount
- `debt_yield_vs_floor` — distance from institutional 9–10% floor
- `coc_return_T2` — cash-on-cash using Track 2 income
- `equity_multiple_p50` — median equity multiple from Monte Carlo
- `levered_irr_pretax_p50` — median pre-tax levered IRR
- `levered_irr_aftertax_p50` — median after-tax levered IRR
- `irr_sensitivity_exit_cap` — IRR sensitivity to ±100bps exit cap change
- `deal_fragility_score` — 1 if IRR only clears target at bull cap + max rent growth
- `deal_robustness_flag` — 1 if IRR ≥ 12% at 0% rent growth and base cap

---

## PART VI: ML MODEL ARCHITECTURE

### 6.1 XGBoost Binary Classifier — Lender Approval Prediction

```python
# Target: approved (1) vs. rejected (0) at any lender
# Training data requirement: ≥10,000 historical records
# Transfer learning: pre-train on LendingClub/public datasets,
#                   fine-tune on proprietary DSCR origination data

model = XGBClassifier(
    n_estimators=500,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=neg_count/pos_count,  # handle class imbalance
    eval_metric='auc'
)

# SHAP explainability — mandatory, not optional
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
# Output: "Your deal was rejected primarily due to: [FICO, vacancy_risk, LTV]"
```

**Feature Importance Priority (based on literature + document synthesis):**
1. `dscr_t1_raw` — primary qualification signal
2. `fico_score` — hard-gate binary + continuous pricing signal
3. `ltv_raw` — leverage gate
4. `dscr_cushion_bps` — margin of safety
5. `rent_vs_form_1007` — rent verification quality
6. `str_legality_status` — STR kill criterion
7. `reserves_vs_requirement` — liquidity buffer
8. `ppp_legal_status` — compliance gate
9. `arm_double_shock_flag` — structural risk
10. `tax_reassessment_dscr_impact` — hidden cost signal

### 6.2 Multi-Output Regression — Default Risk Probability

```python
# Target: P(DSCR < 1.0 within 36 months)
# Architecture: gradient boosting regressor with quantile outputs

# Key features for default probability:
default_features = [
    'dscr_t1_raw',
    'dscr_t2_raw',
    'dscr_delta',              # qualification/survival gap
    'arm_dscr_at_stress_reset',
    'vacancy_rate_STR_seasonal_min',
    'reserves_deficit_months',
    'tax_reassessment_dscr_impact',
    'insurance_stress_year3',
    'rental_yield_compression_flag',
    'fico_to_program_floor',
    'binding_risk_magnitude',
    'prob_dscr_below_floor',   # from Monte Carlo
    'irr_sensitivity_exit_cap'
]
```

### 6.3 Data Flywheel Architecture

```
Deal submitted → features extracted → prediction generated
     ↓
Actual lender outcome recorded (approve/reject/close)
     ↓
Training data grows → model retrained quarterly
     ↓
Accuracy improves → competitive moat widens
     ↓
No new entrant can replicate without origination history
```

---

## PART VII: KILL CRITERIA — HARD GATES (NON-NEGOTIABLE)

These must fire BEFORE any probabilistic scoring or lender matching:

| # | Kill Criterion | Source |
|---|---|---|
| 1 | STR prohibited (city/county/HOA) | STR legality gate |
| 2 | PPP illegal for this state/entity AND no lender available without PPP | PPP gate |
| 3 | Insurance unconfirmed in high-risk zone | v11.2 elevated |
| 4 | FICO below all lender floors (< 580) | Universal floor |
| 5 | Track 1 DSCR < 0.75 | Hard floor |
| 6 | Appraisal rent break point exceeded ($4.83/sqft equivalent at reference deal) | T1 < floor |
| 7 | Value cash-gap unfundable (purchase > max loan at any DSCR) | Bisection |
| 8 | Reserves not liquid / not in acceptable tier | Liquidity check |
| 9 | Deal-break rate ≤ note rate | Rate feasibility |
| 10 | Declining-market LTV cap binds (CT/FL/IL/NJ/NY) | Overlay |
| 11 | Loan < lender minimum ($75K–$150K depending on lender) | Floor |
| 12 | BRRRR ARV cash-out gated by seasoning AND no Easy Street | Seasoning |
| 13 | Confidence < 60 on best-fit lender | Provenance |
| 14 | ARM double-shock year breaches T1 DSCR floor | Structural |
| 15 | P(DSCR < 1.00) > 15% over loan term | Monte Carlo |

**Track 2 Negative — Mandatory Acknowledgment (not automatic kill):**
> "This deal qualifies. It does not cash flow. Type 'I understand' to proceed."
> Proceed only if appreciation/tax strategy justifies negative carry — stated in $/month.

---

## PART VIII: VERDICT OUTPUT STRUCTURE

```
VERDICT: PROCEED / RESTRUCTURE / PASS

Binding constraint: [top kill/condition item]
Kill-switch: [specific, measurable condition that flips verdict]

THREE-METRIC CREDIT STANDARD:
  Track 1 DSCR (rate, product):  X.XX  [lender min: Y.YY]
  Debt Yield (NOI/Loan):         X.X%  [target: ≥9%]
  LTV:                           XX%   [lender cap: XX%]
  Deal-Break Rate:               X.XX% [cushion: XX bps]

RETURN STACK (N-year hold, base assumptions):
  Entry Cap Rate:                X.X%
  Year 1 CoC (Track 2):         X.X%
  N-Year Levered IRR (pre-tax): X.X%  [P10: X% | P90: X%]
  N-Year Levered IRR (after-tax): X.X%
  Return Grade:                  A/B/C/D/F
  Equity Multiple:               X.Xx

PROBABILISTIC STRESS:
  Binding Risk:                  [variable] ±$XXX/mo swing
  P(DSCR < floor) over term:    XX%  [FLAG if >10%]
  5th-pct DSCR (1-in-20yr):     X.XX

LENDER TRUE-COST RANKING (N-yr hold, AEY):
  1. [Lender A] X.X% + X pts → AEY X.X%  [PPP structure]
  2. [Lender B] X.X% + X pts → AEY X.X%  [Break-even: N mo]
  Recommended: [Lender X] — AEY superior at expected hold N yr

IC MEMO: Reproducible snapshot — all inputs, lender-data versions,
         rate anchors captured at time of generation.
```

**Return Grade Scale:**
- **A**: After-tax IRR ≥ 15%, T2 ≥ 1.10
- **B**: After-tax IRR 12–15%, T2 ≥ 1.00
- **C**: After-tax IRR 8–12%, T2 ≥ 1.00 with appreciation thesis
- **D**: After-tax IRR < 8% OR T2 negative
- **F**: PASS scenario — negative after-tax IRR, hard kill, or no eligible lender

---

## PART IX: ITEMS FLAGGED FOR RESEARCH

These gaps were identified across audit documents and cannot be populated from existing files:

| Priority | Item | Action Required |
|---|---|---|
| 🔴 CRITICAL | AirDNA enterprise API pricing | Contact AirDNA sales — not publicly listed |
| 🔴 CRITICAL | OH 2026 indexed PPP threshold ($116,356 — re-verify January) | Pull ORC 1343.011 annually |
| 🔴 CRITICAL | PA 2026 indexed PPP threshold ($329,411 — re-verify January) | Pull 40 P.S. § 1184 annually |
| 🔴 CRITICAL | Deephaven DSCR guidelines — STALE; highest reverify priority | Direct lender outreach |
| 🟠 HIGH | LenderSA competitive threat — AI aggregator scanning 200 lenders | Research competitive positioning |
| 🟠 HIGH | DSCR second mortgage/subordinate lien products (Deep Haven, etc.) | Market scan |
| 🟠 HIGH | 40-year amortization lender availability matrix | Verify per-lender |
| 🟠 HIGH | Section 1071 CFPB rule (revised May 2026) — full compliance scope | Legal review |
| 🟠 HIGH | WA ARM PPP blanket ban — unconfirmed; do not encode | Verify via lender matrix |
| 🟡 MEDIUM | NCREIF Property Index current cap rates by market/type | License or API |
| 🟡 MEDIUM | CRED iQ debt yield benchmarks by property type | Direct data access |
| 🟡 MEDIUM | RentCast API occupancy/vacancy data by MSA | Developer tier (free) |
| 🟡 MEDIUM | ATTOM yield compression county list (54.8% counties) | ATTOM API |
| 🟡 MEDIUM | NJ LLC vs. C-corp PPP matrix — lender-specific splits | Per-lender confirmation |
| 🟡 MEDIUM | CA CDOI Sustainable Insurance Strategy — which carriers, which zones | CDOI public filings |
| 🟡 MEDIUM | Kiavi AirDNA STR acceptance — listed as UNVERIFIED | Direct broker confirmation |
| 🟡 MEDIUM | Griffin 20M jumbo claim — UNVERIFIED; in-house max is $4M | Reverify |
| 🟢 LOW | Foreign national cap rate data by country of origin | Market research |
| 🟢 LOW | Cost segregation study pricing under $450K threshold | Cost seg firm survey |
| 🟢 LOW | Basel III CRE lending tightening 2026 impact on DSCR secondary market | Regulatory monitoring |

---

## PART X: PROVENANCE AND CONFIDENCE FRAMEWORK

Every lender record requires four mandatory fields before rendering:

```python
class LenderRecord:
    lender_name: str
    verified_date: date          # REQUIRED — no render without
    source_snapshot_id: str      # REQUIRED — URL/document reference
    provenance_label: str        # REQUIRED — one of four labels:
    confidence_score: int        # 1–100 (tiebreaker only)

# Provenance labels:
VERIFIED_PRIMARY = "Verified - Primary"     # Lender's own materials
VERIFIED_SECONDARY = "Verified - Secondary" # Credible third-party
MARKET_PATTERN = "Market Pattern - Verify"  # Consistent observation, unconfirmed
UNVERIFIED = "Unverified"                   # No reliable support found
```

**Confidence Decay Schedule:**
- Verified-Primary: −5 pts/90 days until re-verified
- Verified-Secondary: −10 pts/60 days
- Market Pattern: −15 pts/45 days
- Unverified: Auto-flag immediately; do not render in production

**Data as of:** June 17, 2026  
**Re-price against:** 10yr/5yr Treasury + SOFR — daily  
**Re-confirm:** OH/PA indexed thresholds — every January  
**Re-verify:** Lender matrix — per counterparty-continuity flag

---

*PROFESSIONAL DECISION-SUPPORT. Not a loan commitment, credit decision, appraisal, tax opinion, or substitute for legal, tax, and financial counsel. All rates dated June 17, 2026 — re-price as markets move. Tax outputs (depreciation, OBBBA bonus dep, recapture, NIIT, after-tax IRR) are estimates dependent on investor bracket, MAGI, REP status, filing status, entity, and cost-segregation election — confirm with a CPA. The licensed operator is the decision-maker of record.*
