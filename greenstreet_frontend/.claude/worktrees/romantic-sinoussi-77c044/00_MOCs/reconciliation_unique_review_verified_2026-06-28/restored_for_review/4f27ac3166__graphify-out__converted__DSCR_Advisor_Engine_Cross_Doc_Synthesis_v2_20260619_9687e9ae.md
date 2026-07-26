<!-- converted from DSCR_Advisor_Engine_Cross_Doc_Synthesis_v2_20260619.docx -->

DSCR Advisor-Grade Decision Engine
Cross-Document Synthesis v2.0 — Full Workspace Audit

60+ source documents analyzed in full
8 master MDs + 14 architectural PDFs + 6 Sprint research execution reports
v14/v15/v16 master consolidated specs + Definitive Blueprint v3 + Definitive Product Spec v12
Slice 1 source code + audit + golden vectors + 132 tests

Prepared: 2026-06-19  -  Workspace: DSCR_LOAN OFFICE
Status: Synthesis v2 — corrects v1 errors, adds Sprint 0-6, FCRA, Definitive Blueprint,
Definitive Product Spec, v16 fixes, Master Knowledge, 2026 Master Knowledge Paper

ADVISOR-GRADE  -  RESEARCH-BACKED  -  AUDITABLE  -  SR 26-02 COMPLIANT
Every formula source-cited  -  Every assumption labeled [ASSUMPTION]
Deterministic math first, AI explanation second
v2.0 corrects 7 errors in v1.0 synthesis — see Section 1.4

# Table of Contents
PART I — STRATEGIC FOUNDATION
1. Executive Summary & v2 Corrections
2. Six-Function Doctrine & Three-Audience Framework
3. Three-Plane Architecture (Graph-Native OS)
PART II — DETERMINISTIC FINANCIAL CORE
4. Dual-Track DSCR + Stabilized + All-In (4 tracks)
5. BUG/FLAW Catalog (v16 reconciled)
6. After-Tax Engine (OBBBA + §1250 + NIIT + PAL + REP)
7. ARM Reset Engine + IO Reversion Cliff
PART III — STRESS & RISK
8. t-Copula Monte Carlo (Sprint 6 implementation)
9. Macro Archetypes + Sequential Drawdown + MCID
10. Cap-Rate Linked Refi Solver (Sprint 3)
11. STR Risk Scoring (Sprint 2/3)
PART IV — LENDER & COMPLIANCE
12. Lender Footprint Matrix (Sprint 3 + Definitive Blueprint)
13. PPP State Matrix (Sprint 2 — all 50 states)
14. ECOA / FCRA / SR 26-02 Compliance Layer
15. Adverse-Action Notice Payload (FCRA PDF spec)
PART V — LIVE DATA & ARCHITECTURE
16. Live Rate Triplet (FRED + CME SOFR, June 17-18 2026)
17. RentCast + AirDNA + Optimal Blue Integration
18. Three-Metric Credit Standard + Dual-Audience Architecture
PART VI — IMPLEMENTATION ROADMAP
19. v1 → v2 Corrections Summary
20. Slice-by-Slice Build Plan (consolidated)
21. Specific Code-Level Action Items
22. SR 26-02 Compliance Status
PART VII — APPENDICES
A. Document Inventory (60+ sources)
B. Pseudocode Library (canonical, expanded)
C. Live Rate Triplet + Market Data (June 17-18 2026)
D. Lender Footprint Matrix
E. References & Source Anchors

# Part I — Strategic Foundation
## 1. Executive Summary & v2 Corrections
Sixty-plus source documents were analyzed end-to-end to inform the upgrade of DSCR Sovereign OS into an Advisor-Grade Decision Engine. The corpus spans master specifications (Markdown, ~1.5 MB), architectural blueprint PDFs (~2.5 MB / ~750 pages), Sprint 0-6 research execution reports, the v14/v15/v16 master consolidated specs, the Definitive Master Blueprint v3, the Definitive Product Specification v12, and the Slice 1 source code itself (payment/dscr/leverage/ltv/compliance + audit + golden vectors).
## 1.1 The Verdict (v2)
The corpus converges on a remarkably consistent architectural vision but diverges significantly on specific numerical parameters and feature names. The flagship value is the Qualifies-but-Dangerous (QbD) detector. The Six-Function Doctrine + Three-Audience Framework + Three-Plane Graph-Native Architecture are the canonical strategic foundation. The Dual-Track DSCR + After-Tax Engine + Monte Carlo + Live Data + Audit Trail are the canonical technical foundation.
## 1.2 Headline Architecture (SR 26-02 Critical Insight)
[SR 26-02 INSIGHT] SR 26-02 (OCC Bulletin 2026-13, effective April 17, 2026) EXPLICITLY EXCLUDES simple arithmetic calculations and deterministic rule-based processes from model governance. The DSCR calculator + Legal Rules Engine + After-Tax engine are NOT models. Only the Monte Carlo engine, ML forecasters, and approval predictor fall under model governance. This eliminates validation overhead on the most-used layer — a deliberate moat.
## 1.3 The Headline Numbers (v2)
## 1.4 v1 → v2 Corrections — Important
[CRITICAL CORRECTIONS] v1.0 synthesis contained 7 errors corrected in v2.0. Do NOT act on v1.0 numbers — they are stale or wrong.
## 1.5 The Six Big Findings (v2)
Finding 1: SR 26-02 architectural split is the biggest moat.
Deterministic math (DSCR calc, legal rules engine, after-tax engine) is explicitly excluded from model governance. Only Monte Carlo + ML need full model cards. This means the engine can ship the deterministic layer 5x faster than competitors still operating under SR 11-7's blanket definition.
Finding 2: Dual-audience architecture (Borrower + Loan Officer) is the product frame.
Borrower wants truth (DSCR survives? deal makes money?). Loan Officer wants speed (10-min verdict, zero-defect file). The same engine must serve both simultaneously via the Three-Plane architecture (Projection/Graph/Ledger). The 10-Minute Committee-Grade Verdict + 150-word Investment Thesis Block + Adverse-Case Recourse Table are the LO-facing outputs.
Finding 3: The Three-Metric Credit Standard replaces single DSCR for credit decisions.
DSCR (Cash Control) + Debt Yield ≥ 9% (Workout Metric) + LTV (Loss-Given-Default). A deal passing DSCR but failing Debt Yield is fragile; one with low LTV but bad DSCR is liquidity-stressed. All three are required outputs.
Finding 4: After-Tax IRR is a deal-flopper. OBBBA changes everything.
OBBBA 100% bonus depreciation (permanent, acquired after Jan 19, 2025) + §1250 recapture 25% on residential (Bucket 1 = 0; Bucket 2 = 25%; Bucket 3 = LTCG) + NIIT 3.8% on rental income for MFJ MAGI > $250K + PAL phase-out $150K complete + 1031 exchange deferral. A negative-carry deal can be a winner after depreciation shelters income. The engine MUST compute after-tax IRR alongside pre-tax.
Finding 5: S&P institutional stress = DSCR × 1.5-2.5x.
S&P Global Ratings applies a DSCR adjustment factor of 1.50x-2.50x when rating non-QM/DSCR pools (NRMLT 2026-NQM1 methodology). A borrower's 1.20 DSCR looks like 0.48-0.80 under S&P's stressed view. The engine's Monte Carlo must reproduce this range to validate institutional alignment.
Finding 6: t-Copula (NOT Gaussian) for correlated RE risk.
Gaussian copula = 2008 CDO failure mechanism. t-Copula with ν=5-7 df captures tail dependence (under stress, rent declines, vacancy spikes, cap rate expansion co-move). KBRA-calibrated 5-factor correlation matrix: rent↔vac -0.55, rent↔exp 0.25, rent↔cap 0.35, vac↔cap -0.30, cap↔rate 0.20. **Gaussian copula is BANNED from production use**.

## 2. Six-Function Doctrine & Three-Audience Framework
### 2.1 The Six Functions (Godmode v7 — from THE COMPLETE SOVEREIGN MASTER DOCUMENT)
Every feature, every code module, every operational decision must trace back to exactly one of these six functions. The Iron Rule prevents the platform from becoming a feature graveyard.
### 2.2 Three Audiences of Every Quote
Every DSCR quote is read by three audiences simultaneously:
- BORROWER — cares whether deal closes and at what cost; judges by rate, fees, fairness
- CAPITAL PARTNER (lender UW, investor asset manager, credit committee) — cares whether file is clean and defensible; judges by defect rate, audit trail
- OPERATOR (loan officer) — cares whether 10 minutes produced a verdict that holds through closing
A quote that satisfies only one audience is a failure.

## 3. Three-Plane Architecture (Graph-Native OS)
From DEFINITIVE PRODUCT SPEC v12 + THE COMPLETE SOVEREIGN MASTER DOCUMENT. The OS is not a flat database app — it's a Graph-Native Financial OS.
### 3.1 Semantic Diff Engine
Classifies changes by facet (Location, Timing, Budget, Legal). A structural change (e.g., LLC to Individual vesting) triggers causal propagation through the PPP Legal Branching Gate without destroying unrelated underwriting work. A cosmetic change (typo fix) produces no propagation.
### 3.2 Evidence Vault (JSONB in PostgreSQL)
Staleness is active: evidence older than its TTL decays in confidence automatically. Stale data self-flags. No manual discipline required.

# Part II — Deterministic Financial Core
## 4. Four DSCR Tracks (v16 Master Consolidated)
[EXPANDED FROM v1.0] v1.0 said dual-track. v2.0 (v16) establishes FOUR tracks. The engine must implement all four.
Engine Enforcement: no cross-track comparison is allowed without explicit labeling. A deal can pass Track 1 lender qualification while failing Track 2 investor survival.
## 4.1 Golden Vector (PIN as Unit Tests — matches Slice 1)
Payment Factor Formula: factor(r) = r(1+r)^360 / ((1+r)^360 - 1), r = annual_rate / 12
Verified factors: 6.125% -> 0.0060761 | 7.00% -> 0.0066530 | 8.25% -> 0.0075127
IO: Monthly_IO = Loan * rate / 12

Reference Deal ($425K / 75% LTV / 7.00% / lease $3,000 = 1007 / tax $5K / ins $2K / HOA $150):
  P&I = $318,750 * 0.0066530 = $2,121
  PITIA = $2,121 + $416.67 + $166.67 + $12.50 = $2,855 monthly
  Track 1 DSCR @ 7.00% = $3,000 / $2,855 = 1.05
  Track 1 DSCR @ 8.25% = $3,000 / $3,192 = 0.96
  Track 2 DSCR (8% vac, 8% mgmt) = 0.88 -> negative $335/mo
  Rent break-even (T1=1.0) = $2,855 (-4.83%)
  Deal-break rate ~= 7.67%
  Max price at T1=1.0 ~= $454,100
## 4.2 Returns Engine (Pre-Tax)
Accounting Split (define once, never mix):
  EGI = GPR * (1 - Vacancy)
  OpEx = Mgmt + Maint + Tax + Ins + HOA + Util + Turnover  [NO debt, NO capex]
  NOI = EGI - OpEx
  ADS = P&I * 12
  CapEx reserve: modeled separately at 5-8% EGI
  PITIA is the LENDER denominator; NOI is the INVESTOR result.
## 4.3 Levered IRR + Exit Model (Sensitivity Grid)
m0: -Cash_Invested
m1..n: (NOI/12 - P&I)
mn: + [Exit_NOI/Exit_Cap - Selling_Costs - Remaining_Balance - Prepay(exit_year)]
Sensitivity grid: 4 hold periods (3/5/7/10yr) x 3 exit cap scenarios (bear/base/bull) x 4 rent growth rates (0/1/2/3%) = 48-cell matrix
Flag: IRR's sensitivity to EXIT CAP is the most fragile input in every model.

## 5. BUG / FLAW Catalog (v16 Master Consolidated — fully reconciled)
[ACTION REQUIRED] Slice 1 already fixed BUG-01/05/06. v16 Master Consolidated adds BUG-02/03 + FLAW-01/02 + IMP-08. These must be added in Slice 2.
### 5.1 Critical Bugs
### 5.2 Logic Flaws
### 5.3 Dimensional Types (Required)
class Rate:
    annual: number  # decimal, e.g. 0.07
    @property
    def monthly(self): return self.annual / 12
    @property
    def display(self): return f'{(self.annual*100).toFixed(3)}%'
FORBIDDEN: raw rate%, ambiguous 7 vs 0.07, mixing monthly numerator with annual denominator

## 6. After-Tax Engine (OBBBA + §1250 + NIIT + PAL + REP)
### 6.1 OBBBA 100% Bonus Depreciation (Sprint 4 verified)
Source: Treasury/IRS Notice 2026-11 (issued Jan 13, 2026).
ELIGIBLE: 5-yr property (appliances, carpet, furniture), 7-yr (office furniture, fixtures), 15-yr (land improvements, fencing, paving), used property if not previously owned by this taxpayer, cost-seg components.
NOT ELIGIBLE: building structure (always 27.5-yr straight-line), land, residential rental building.
### 6.2 Cost Segregation Reclassification (Sprint 4)
COST_SEGREGATION_RECLASSIFICATION = {
    'total_building_basis': 1.0,           # 100% basis
    'structure_27_5_yr': 0.60,             # 60%: non-reclassifiable (straight-line)
    'land_improvements_15_yr': 0.15,       # 15%: eligible for 100% bonus
    'personal_property_5_yr': 0.15,        # 15%: eligible for 100% bonus
    'personal_property_7_yr': 0.10,        # 10%: eligible for 100% bonus
    'reclassifiable_total': 0.40,
    'study_cost_range': (5000, 15000),
    'minimum_basis_for_study': 500000,
}
# $750K acquisition example: $253,091 Year-1 depreciation vs $21,818 standard = $231,273 advantage
# At 37% marginal rate = $85,571 deferred tax; net Year-1 benefit ~$79,571
### 6.3 §1250 Recapture — Three Buckets
### 6.4 NIIT — Fixed (NOT CPI-Adjusted) Since 2013
[CRITICAL TAX INSIGHT] NIIT thresholds are FIXED by statute (IRC §1411). More investors hit threshold every year from inflation bracket creep. Engine must surface as compounding risk for near-threshold investors.
### 6.5 PAL — Phase-Out at $150K (Canonical Resolution)
[v1.0 CORRECTION] v1.0 had Uncle Kam CPA's $200K MFJ figure. Sprint 4 statutory analysis confirms $150K for ALL individual filers (Single/HH/MFJ). The $100K-$150K applies to Single; Uncle Kam's $200K reflects NIIT threshold not PAL.
PAL_ENGINE = {
    'standard_allowance': 25000,
    'phase_out_threshold': 100000,
    'phase_out_rate': 0.50,
    'phase_out_complete_magi': 150000,  # NOT 200K
    'rep_hours_minimum': 750,
    'rep_time_pct_minimum': 0.50,
}
### 6.6 REP Status — Highest-Leverage Tax Planning
Real Estate Professional under IRC §469(c)(7):
- More than 750 hours in real property trades/businesses AND
- More than 50% of personal services in real property
- Result: ALL rental losses deductible against W-2 + active business income
- NIIT also eliminated on rental income
REP status is the highest-leverage tax status the engine can advise.
### 6.7 After-Tax IRR Computation (Full Pipeline)
def compute_after_tax_irr(deal, tax_profile, hold_years):
    # Phase 1: Cash flows
    annual_pre_tax_cf = deal.monthly_noi * 12 - deal.monthly_pitia * 12
    # Phase 2: Depreciation (OBBBA + cost-seg)
    building_basis = deal.purchase_price - deal.land_value
    if deal.cost_seg_elected and deal.purchase_price >= 500000:
        bonus_eligible = building_basis * 0.40
        structure = building_basis * 0.60
        yr1_dep = bonus_eligible + (structure / 27.5)
        ongoing_dep = structure / 27.5
    # Phase 3: Year-by-year tax computation
    # Phase 4: NIIT, PAL, REP status, §1250 recapture at exit
    # Phase 5: XIRR via pyxirr

## 7. ARM Reset Engine + IO Reversion Cliff
### 7.1 SOFR Anchors (June 17, 2026 — Sprint 5 verified)
[LICENSING CONSTRAINT] CME Term SOFR requires Category One Use License for commercial use ($ enterprise pricing). FREE alternative: NY Fed SOFR Averages + FRED historical. Most DSCR ARMs use 30-day SOFR avg, not CME Term.
### 7.2 ARM Reset Formula (Canonical)
Fully_Indexed_Rate = Index_t + Margin
New_Rate = min(max(SOFR_t + Margin, Floor),
                min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))
Reset_Payment = Remaining_Balance * New_Rate/12 / (1 - (1 + New_Rate/12)^(-n_remaining))
### 7.3 IO + ARM Double-Shock — Kill-Switch Year
When IO expires, loan recasts to amortizing simultaneously with potential rate reset. The double-shock year must be flagged as a kill-criterion checkpoint.
Engine output: "Kill-Switch Year: Year N — IO expires and rate resets simultaneously."
### 7.4 ARM Worked Example (Sprint 5)
5/6 ARM resetting at month 60, start rate 7.25%:
- Index = 6-Month Term SOFR at reset (currently 3.731%)
- Margin = 2.50% (typical DSCR)
- Computed new rate = 3.731% + 2.50% = 6.231%
- Periodic cap +2%, Lifetime cap +5%
[COUNTERINTUITIVE FINDING] With current inverted-to-flat curve, ARM reset rate (6.231%) is LOWER than start rate (7.25%). Engine must compute explicitly rather than assuming rates move adversely.

# Part III — Stress & Risk
## 8. t-Copula Monte Carlo (Sprint 6 — full implementation)
### 8.1 Why t-Copula, NOT Gaussian
[MANDATORY] Gaussian copula = 2008 CDO failure mechanism. t-Copula with ν=5-7 df captures tail dependence that Gaussian misses. Under stress, rent declines, vacancy spikes, cap rate expansion co-move. Gaussian copula is BANNED from production use.
### 8.2 KBRA-Calibrated Correlation Matrix (5 factors)
### 8.3 Marginal Distributions (Sprint 6 calibrated)
### 8.4 Verdict Bands (Sprint 6)
[INSTITUTIONAL VALIDATION] S&P Global Ratings applies DSCR adjustment factor 1.50x-2.50x when rating non-QM/DSCR pools. A borrower's 1.20 DSCR looks like 0.48-0.80 under S&P's stressed view. Engine Monte Carlo must reproduce this range to validate institutional alignment.
### 8.5 Verdict Triage + Hard NO-GO Rule
P(DSCR<1.00) > 15% → HARD NO-GO regardless of lender Track 1 qualification.

## 9. Macro Archetypes + Sequential Drawdown + MCID
### 9.1 Deterministic Macro Archetypes (4 — from Sprint 6)
### 9.2 Sequential Drawdown Array (Sprint 6)
def sequential_drawdown(
    monthly_rent: list[float],     # 36 months
    monthly_opex: list[float],
    monthly_debt_service: list[float],
    capex_events: dict[int, float],
    starting_reserves: float,
) -> dict:
    balance = starting_reserves
    ruin_month = None
    for t in range(36):
        ncf = monthly_rent[t] - monthly_opex[t] - monthly_debt_service[t]
        if t in capex_events: ncf -= capex_events[t]
        balance += ncf
        if balance < 0 and ruin_month is None: ruin_month = t + 1
    return {'liquidity_failure': ruin_month is not None,
            'ruin_month': ruin_month, 'min_balance': min(balance, 0)}
### 9.3 STR Seasonality — Maximum Cumulative Intra-Year Deficit (MCID)
def compute_mcid(monthly_net_cashflow):
    cumulative = 0; min_cumulative = 0
    for cash in monthly_net_cashflow:
        cumulative += cash
        if cumulative < min_cumulative: min_cumulative = cumulative
    return abs(min_cumulative)
# Required reserves >= MCID, else fail seasonality trough test

## 10. Cap-Rate Linked Refi Solver
def break_even_refi_cap_linked(noi, loan_balance, current_rate,
                                target_dscr, current_cap_rate,
                                cap_rate_beta,  # 0.5-1.5 multifamily
                                max_matrix_ltv, remaining_term_months):
    def check(rate):
        pmt = (loan_balance * (rate/12) * (1 + rate/12)**remaining_term_months) / \
              ((1 + rate/12)**remaining_term_months - 1)
        dscr = noi / (pmt * 12)
        projected_cap = current_cap_rate + cap_rate_beta * (rate - current_rate)
        projected_value = noi / projected_cap
        ltv = loan_balance / projected_value
        return (dscr >= target_dscr) and (ltv <= max_matrix_ltv)
    # Binary search...
    return break_even_rate
Cap_Rate_Beta default by asset class:
- Multifamily: 0.5-1.5 (UNC cap-rate study)
- Office: 0.8-2.0 (higher due to secular headwinds)
- Retail: 0.6-1.5
- Industrial: 0.3-0.8 (lowest due to secular tailwinds)

## 11. STR Risk Scoring (Sprint 2/3)
### 11.1 STR Legality (Gating)
[CA SB 346 ALERT] California SB 346 (effective Jan 1, 2026) — Airbnb/VRBO must share host data with local governments. Enforcement risk dramatically increased. Engine must flag CA STR deals.
### 11.2 STR Top 10 Markets (AirDNA 2026 — small/mid-tier focus)
Avg purchase $296K, avg yield 13.7%. Trophy markets (NYC/SF/LA) effectively dead for investors — engine must weight STR income toward these market types.
### 11.3 STR Income Qualification
- If multiple sources: LOWEST monthly income figure used
- Mandatory 20% haircut on gross AirDNA projection
- STR income capped at LTR market rent per Form 1007 (LTR floor)
- AirDNA: 12mo forecast, 3 comps, market score ≥ 60, dated within 90 days, ≤ 2 individuals/bedroom

# Part IV — Lender & Compliance
## 12. Lender Footprint Matrix (Sprint 3 + Definitive Blueprint)
### 12.1 Deephaven DSCR Second — Use Cases
- Preserve Legacy Rate: keep 3.75% first mortgage, second lien at 8-10% beats cash-out refi to 7%+
- Bridge Down Payment: pull equity from Property A as down payment for Property B
- Renovation Capital: $150K without refi; no reserves; AVM at < $400K
### 12.2 Pool Benchmark Calibration (AOMT 2025-6 / NRMLT 2026-NQM1)
[POOL-CENTER CALIBRATION] When deal inputs EXCEED pool center (higher FICO, lower LTV, higher DSCR), engine gives confidence premium. When BELOW pool center, widen Monte Carlo confidence interval.
## 12.3 Competitive Threat Map

## 13. PPP State Matrix (Sprint 2 — 2026 verified)
### 13.1 Three-Branch Logic (BEFORE any state lookup)
BRANCH 1: Business-purpose + Entity vesting (LLC, Corp, Trust)
BRANCH 2: Business-purpose + Individual vesting
BRANCH 3: Consumer-purpose (disqualified from DSCR by definition)
# DSCR loans are always business-purpose (investment property)
# Entity vesting frequently unlocks exemption from consumer PPP statutes
### 13.2 Critical States (2026 thresholds — CORRECTED FROM v1.0)
[ANNUAL RE-INDEXING REQUIRED] OH and PA thresholds are CPI-indexed annually. Engine must fire Celery cron on Jan 1 each year to pull from OH Dept. of Commerce + PA Bulletin.
### 13.3 PPP Penalty Mechanics (Canonical)
# PENALTY BASE (per state/contract):
# DEFAULT = REMAINING balance x step rate (market-standard DSCR)
# STATUTORY OVERRIDE = ORIGINAL principal (OH; some others)
STORE penalty_base as per-state, per-loan field. Apply binding rule.

# PARTIAL PREPAY EXCEPTION: Most DSCR lenders allow 20% of original principal/year
# without triggering PPP. Engine must surface.

# STRUCTURES: 5/4/3/2/1, 3/2/1, flat 5/5/5, floored, six-months-interest, ~20%/yr partial-prepay
### 13.4 NJ Three-Branch Resolution (Engine Implementation)
NJ_PPP_GATE = {
    'C_Corp':   {'status': 'ALLOWED',    'confidence': 95},
    'LLC':      {'status': 'CONTESTED',  'confidence': 30,
                'action': 'FLAG_FOR_ATTORNEY_REVIEW',
                'note': 'No published NJ case law; NPLA won partial DOBI clarification Oct 2025; Arc Home banned Jul 2025. Advise C-Corp vesting or no-PPP structure.'},
    'LP':       {'status': 'PROHIBITED', 'confidence': 85},
    'Trust':    {'status': 'PROHIBITED', 'confidence': 85},
    'Individual':{'status': 'PROHIBITED','confidence': 95}
}
# SAFE HARBOR: Use C-Corp in NJ when PPP is required; offer LLC deals as no-PPP or buy-down

## 14. ECOA / FCRA / SR 26-02 Compliance Layer
### 14.1 SR 26-02 Architectural Status (v2.0 — CORRECTED FROM v1.0)
[SR 26-02 MOAT] SR 26-02 (OCC Bulletin 2026-13, effective April 17, 2026) supersedes SR 11-7 (2011). It narrows the definition of model to complex quantitative methods. Simple arithmetic + deterministic rule-based processes are EXPLICITLY EXCLUDED. This is a deliberate moat — deterministic layers ship faster.
### 14.2 ECOA Reason Codes (Form C-1 verbatim — v1.0 CORRECTION)
[v1.0 CORRECTION] v1.0 said re-number Slice 1 ECOA codes. v2.0 says: DO NOT. Slice 1 codes 19/21/26/27/28 ARE Form C-1 verbatim. Per FCRA PDF (p.6) the mapping is:
### 14.3 Nuanced Mapping (Dynamic — not static lookup)
Per FCRA PDF: a static one-to-one mapping is INSUFFICIENT. Engine must evaluate kill event data + lender-specific config to select the most accurate reason code:
# LTV-driven reason:
if ltv > 0.90: code = 27  # collateral insufficient
elif ltv > 0.80: code = 26  # exceeds max loan amount
# DSCR-driven reason (nuanced by sub-cause):
if dscr_e < 1.0:
    if rent_below_market: code = 19  # income insufficient
    elif ads_too_high: code = 21  # debt payments too high
# Property type:
if property_type_rejected: code = 28

## 15. Adverse-Action Notice Payload (FCRA PDF Spec)
Per FCRA PDF p.8-9, the payload schema:
{
  'version': '1.0',
  'as_of': 'YYYY-MM-DDTHH:MM:SSZ',
  'lender_id': 'CLIENT_XXXX',
  'application_id': 'APP_YYYYYY',
  'is_compliant': true,
  'regulatory_notices': {
    'ecoa_notice': {
      'header': 'ADVERSE ACTION NOTICE',
      'prohibition_statement': '<verbatim Reg B text>',
      'reasons': [
        {'code': '27', 'text': 'The collateral value is insufficient.'},
        {'code': '21', 'text': 'Your debt payments or other obligations are too high.'}
      ]
    },
    'fcra_disclosure': {
      'header': 'DISCLOSURE REQUIRED BY THE FAIR CREDIT REPORTING ACT',
      'statement': '<verbatim FCRA text>',
      'data_source': 'CoreLogic, Inc.',
      'source_address': '123 Main St, Anytown, ST 12345'
    }
  },
  'state_specific_notices': [
    // {'state': 'CA', 'text': 'Additional CA-specific language...'}
  ],
  'meta': {
    'generation_timestamp': 'YYYY-MM-DDTHH:MM:SSZ',
    'engine_version': 'DSCR_Engine_v15.0.0',
    'explanation_layer_version': '1.0.0'
  }
}
Configuration via YAML/JSON (per FCRA PDF — Slice 1 compliance.py already supports this):
- Default federally-compliant config shipped with engine
- Lender clients customize via YAML overlay
- California-specific state_notices appended for CA lenders
- FCRA disclosure required when CRA data (CoreLogic, credit reports) used in decision
### 15.1 Explainability_Layer Architecture
Three-stage process: interception → enrichment → assembly
- Intercept: any KILL tagged event routes to Explainability_Layer
- Enrich: append raw inputs + intermediate values + threshold breached
- Assemble: dynamic config lookup → ECOA codes + FCRA disclosures + state notices

# Part V — Live Data & Architecture
## 16. Live Rate Triplet + SOFR Anchors (June 17-18, 2026)
Refreshed on session open + every 4 hours via Celery. Source: FRED + NY Fed (free, no CME license).
### 16.1 Pricing Calibration (June 17, 2026 — verified)
### 16.2 LLPA Pricing Levers (verified off 740/par anchor)

## 17. RentCast + AirDNA + Optimal Blue Integration
### 17.1 RentCast (LTR / Form 1007 Equivalent)
[v1.0 CORRECTION] v1.0 cited consumer platform pricing ($29/$99/$199). Those are LANDLORD PORTFOLIO TRACKING plans, NOT API pricing. API pricing is volume-based. v2.0 correction.
### 17.2 RentCast Confidence Gates
RENTCAST_CONFIDENCE_GATES = {
    'HIGH':    {'min': 80, 'max': 100, 'action': 'USE',
               'note': 'High confidence — use as primary rent input'},
    'MEDIUM':  {'min': 60, 'max': 79,  'action': 'USE_WITH_WARN'},
    'LOW':     {'min': 0,  'max': 59,  'action': 'REQUIRE_MANUAL'},
    'MISSING': {'min': None,'max': None,'action': 'REQUIRE_MANUAL'}
}
# LOW/MISSING: Order Form 1007 from licensed appraiser
### 17.3 AirDNA (STR)
### 17.4 Optimal Blue PPE / Loansifter
### 17.5 Hybrid AI-OCR Intake (Sprint 0)
Multi-engine OCR pipeline:
- Docling — digital PDFs and table reconstruction
- Mistral OCR 2505 — scanned and handwritten addenda
- GPT-4o Vision — structured JSON via Pydantic schemas
Every extracted field tagged with bounding-box ID + confidence score. Fields with < 0.85 confidence → Human-in-the-Loop queue. Market Rent Guardrail: any lease deviating > ±30% from live RentCast AVM is flagged (instant fraud/stale-lease detection).

## 18. Three-Metric Credit Standard + Dual-Audience Architecture
### 18.1 The Three-Metric Credit Standard (Replaces Single DSCR for Credit)
### 18.2 All-In Effective Yield (AEY) — True Cost of Capital
True_Cost(hold) = Interest_During_Hold + Points$ + Lender/Broker/UW Fees +
                   Lock_Cost + Prepay(exit_year) + Refi_Costs(if planned)
Render at 12/24/36/60-mo + APR-equivalent.

All-In Effective Yield (AEY) = XIRR of actual borrower cash flows:
  [Net_Proceeds_0, -P_1, -P_2, ..., -(P_n + Balance_n + PPP_n)]
Net_Proceeds_0 = Loan_Amount - (Points$ + Lender_Fees)

Algorithm: SciPy brentq — guaranteed convergence on non-monotonic mortgage flows
# Lender with LOWEST AEY over expected hold is cheapest, regardless of stated rate
# TWO-QUOTE RULE: always one flex/fit + one rate-competitive, with AEY delta in dollars
# NEVER a single quote
### 18.3 10-Minute Committee-Grade Verdict + 150-Word Investment Thesis Block
Structured output for the Loan Officer:
- Property metrics (DSCR 4-track + Debt Yield + LTV + Cap Rate + Cash-on-Cash)
- Qualification status (PASS / CONDITIONAL / NO-GO with reason)
- Returns stack (Pre-Tax IRR + After-Tax IRR + CoC Y1/Y3/Y5 + Equity Multiple)
- Binding risks (Kill-Switch Conditions: "If 1007 comes back below $2,100/mo, deal flips to NO-GO")
### 18.4 Adverse-Case Recourse Table
When file hits NO-GO, engine generates operator-action mapping:
### 18.5 Kill-Switch Monitor (Continuous)
- Polls RentCast API every 30 days
- Monitors lender guideline diffs
- Tracks 10-Year Treasury (current 4.43%)
- Alerts LO within 1 hour on breach

# Part VI — Implementation Roadmap
## 19. v1.0 → v2.0 Corrections Summary
[MANDATORY CORRECTIONS] v1.0 synthesis had 7 critical errors. v2.0 corrects all. Do NOT act on v1.0 numbers.
## 20. Slice-by-Slice Build Plan (Consolidated)
### 20.1 Slice 1 — Already Shipped (132 tests, 94.37% coverage)
- payment.py — payment_factor formula (Decimal prec=28, MAX_TERM=600)
- dscr.py — Track 1 (Lender) + Track 2 (Stressed) [BUG-01/05/06 fixed]
- leverage.py — brentq deal_break_rate + bisection max_purchase
- ltv.py — BUG-01 (min price/appraisal), BUG-05 (OpEx in breakeven), BUG-06 (Decimal rate)
- compliance.py — ECOA codes 19/21/26/27/28 (CORRECT — DO NOT RENUMBER)
### 20.2 Slice 2 Plan (4-6 weeks, ~200 hr) — Highest Priority
Objective: Make the engine QbD-capable with Sequential Drawdown + Macro Archetypes + 6-class Recommendation.
### 20.3 Slice 3 Plan (8-12 weeks, ~400 hr)
### 20.4 Slice 4 Plan (12-16 weeks, ~600 hr)
- Live Data APIs (FRED + RentCast + AirDNA — full Sprint 5 integration)
- AEY True Cost of Capital (brentq XIRR)
- Three-Metric Credit Standard output (DSCR + Debt Yield + LTV)
- 10-Minute Committee-Grade Verdict + 150-word Investment Thesis Block
- Kill-Switch Monitor (continuous polling)
- TimesFM 2.5 forecasters for DSCR trajectory + OBBBA-aware scenarios
- Approval Predictor (XGBoost ensemble) — SR 26-02 model card required
- Backtest + PSI drift detection + champion/challenger
### 20.5 Slice 5 Plan (16+ weeks) — Multi-Tenant + IC Memo
- IC Memo Command (institutional credit memo generation)
- 1031 Exchange deferral modeling
- Multi-tenant (5+ unit) + Commercial underwriting
- Full 50-state compliance variations
- PPP annual re-index cron (Jan 1)

## 21. Specific Code-Level Action Items
### 21.1 Immediate (this week)
AI-1: Add BUG-02 fix (NOI growth off-by-one) to Slice 1 dscr.py.
Convention: Year1_NOI is the first full operating year. Year3_NOI = Year1_NOI × (1+g)^2 (not ^3). Affects Track 3 Stabilized DSCR, Levered IRR, Monte Carlo exit NOI. Effort: 2 hr.
AI-2: Add BUG-03 fix (vacancy tornado labels) to Slice 1 dscr.py.
vac_best = max(0, vac - 0.05); vac_worst = min(1, vac + 0.05). Swing must be non-negative. Right side = High DSCR / Low Vacancy / Best Case. Effort: 1 hr.
AI-3: Document SR 26-02 status inline in Slice 1 code.
Add docstring to each module: "SR 26-02 status: NOT a model (simple arithmetic). Unit tests + CI/CD sufficient." Effort: 1 hr.
### 21.2 Slice 2 Entry (next 2 weeks)
AI-4: Build drawdown.py (Sequential Drawdown Array).
Highest-leverage Slice 2 addition. Use Sprint 6 pseudocode. Effort: 8 hr skeleton + 16 hr tests.
AI-5: Adopt macro archetype library as config JSON.
4 archetypes (Stagflation/Recession/Climate/Local Distress) per Sprint 6. Effort: 4 hr.
AI-6: Switch ISS to minimum-gate.
ISS = min(S_DSCR, S_LSC, S_Refi, S_CapEx), not weighted average. Effort: 4 hr.
### 21.3 Slice 2 Build (4-6 weeks)
AI-7: Implement 6-class Recommendation State Machine.
STRONG / MONITOR / FRAGILE / QbD-MINOR / QbD-MODERATE / QbD-CRITICAL / HALT / REJECT. Maps directly to remediation actions. Effort: 8 hr.
AI-8: Implement Extended QbD (7 triggers per Doc 17 #21).
QbD = TRUE if lender_pass AND any of: DSCR_E<1.0 OR Seasonal_DSCR<1.0 OR RWDSCR<1.0 OR drawdown_fail OR refi_fail OR ACS<0.6 OR ISS<0.6. Effort: 8 hr.

## 22. SR 26-02 Compliance Status (The Biggest Moat)
SR 26-02 (OCC Bulletin 2026-13, effective April 17, 2026) supersedes SR 11-7. Key implications for DSCR Sovereign OS:
[SR 26-02 MOAT] Architectural moat: deterministic layer ships WITHOUT model governance overhead. Monte Carlo + ML require full SR 26-02 cards. Competitors operating under blanket SR 11-7 definition must build full model governance for the deterministic layer too — we don't. This is 60-70% governance overhead reduction on the most-used components.
### 22.1 Model Card Template (for Monte Carlo + ML components)
Model Card: [Component Name]
  - SR 26-02 Classification: [HIGH-MATERIALITY MODEL / etc.]
  - Purpose: [Description]
  - Inputs: [List with sources]
  - Outputs: [List]
  - Methodology: [Copula type, distributions, etc.]
  - Validation: [Backtest results]
  - Champion Model: [Production baseline]
  - Challenger Models: [Alternatives]
  - Performance Metrics: [AUC, calibration, etc.]
  - Fairness Audit: [Disparate impact test results]
  - Monitoring: [PSI thresholds, retraining cadence]
  - Limitations: [Known edge cases]
  - Approver: [Name + Date]

# Part VII — Appendices
## Appendix A: Document Inventory (60+ sources)
### A.1 Master Specifications (MDs — 8)
- six-function-doctrine.md
- Advisor_Grade_DSCR_Decision_Engine_Usable_Master_Spec.md
- Advisor_Grade_DSCR_Decision_Engine_Organized_Research.md
- AEGIS_DSCR_Algorithm_Gap_Upgrade_Pack.md
- AEGIS_DSCR_Advisor_Grade_Operating_Model_Upgrade_Pack.md
- AEGIS_DSCR_Deterministic_Core_Keeps_Detailed.md
- AEGIS_DSCR_Complete_Usable_Master_Doc_v3.md
- DSCR_Engine_Master_Specification.md
### A.2 Architectural Blueprint PDFs (14)
- From Black Box to Glass Box — adversarial hardening
- From Calculator to Counselor — adversarial validation blueprint
- From Calculation to Counsel — quantitative innovation
- Architecting the Advisor-Grade DSCR Engine — 11-module + lender adapter
- Beyond the DSCR — dual-ledger + stabilization
- From Static Snapshot to Dynamic Trajectory — temporal/path
- From Calculator to Containment — adversarial hardening MVP
- AI Algorithm Improvement Prompt — 15 research loops
- AI Algorithm Improvement Prompt 2 — per-formula hardening
- FCRA Adverse Action Engine for Institutional Compliance — reason codes + payload
- Beyond the Rulebook (x2) — dynamic data + probabilistic underwriting
- From Blueprint to Sovereign Engine — TimesFM hardening
- From Policy to Profit — Cake Mortgage 2026 strategy
- From Restriction to Dominance — Cake Mortgage arbitrage
### A.3 Sprint Research Execution (6)
- Sprint 0 & 1 — Live Research Execution Findings
- Sprint 2 — PPP State Matrix + STR Legality + 40-Year Amortization
- Sprint 3 — Lender Footprints + Securitization Pool + Competitive Threat
- Sprint 4 — After-Tax IRR + OBBBA + Insurance Kill + Flood Gate + Compliance
- Sprint 5 — Live Data APIs + Rate Anchors + Property Tax Matrix + Architecture
- Sprint 6 — t-Copula MC + QuantLib ARM + After-Tax IRR + IC Memo + 1031 + XGBoost
### A.4 Master Specs (6)
- DSCR_Underwriting_Engine_v14_Complete_Master_Document.md
- DSCR_Underwriting_Engine_Master_Consolidated_v16.md (BUG-02/03 + FLAW-01/02)
- DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md (SR 26-02 + 7 critical corrections)
- DSCR SOVEREIGN OS_ THE DEFINITIVE PRODUCT SPECIFICATION.md (Dual-Audience v12)
- DSCR Sovereign OS THE MASTER BLUEPRINT.md
- THE COMPLETE SOVEREIGN MASTER DOCUMENT.md (2 versions — full + shorter)
### A.5 Knowledge Documents (5)
- Master DSCR Knowledge Document.md
- The 2026 DSCR Master Knowledge Paper.md (Manus AI synthesis)
- DSCR Sovereign OS MASTER RESEARCH SYNTHESIS.md
- DSCR Sovereign OS & Non-QM Wholesale Lender Definitive Master Research Report.md
- DSCR DUAL TRUTH ENGINE CHATGPT RESEARCH.md
### A.6 Analysis & Strategy Documents (10)
- DSCR Sovereign OS Upgrade Intelligence Report (3 versions)
- dscr_sovereign_os_architectural_debt_and_math.md
- dscr_sovereign_os_deep_debt_analysis.md
- DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md
- DSCR_Appendix_B_Research_Resolution_Report.md
- DSCR_Blueprint_Verification_Corrections_Log.md
- DSCR Forumals.md
- Actionable Next Steps for the 20X DSCR Deal Engine.md
- NEW_DSCR Deal Desk Build-Ready Research Report.md
- TimesFM_LoRA_Complete_Engineering_Spec.md
### A.7 Slice 1 Codebase (read)
- DSCR_SOVEREIGN_OS/packages/dscr-core/src/dscr_core/payment.py (4,709 B)
- DSCR_SOVEREIGN_OS/packages/dscr-core/src/dscr_core/dscr.py (13,069 B)
- DSCR_SOVEREIGN_OS/packages/dscr-core/src/dscr_core/leverage.py (12,653 B)
- DSCR_SOVEREIGN_OS/packages/dscr-core/src/dscr_core/ltv.py (8,472 B, BUG-01/05/06 fixed)
- DSCR_SOVEREIGN_OS/packages/dscr-core/src/dscr_core/compliance.py (13,012 B)
- DSCR_SOVEREIGN_OS/packages/dscr-core/golden_vectors.json (3,211 B)
- DSCR_SOVEREIGN_OS/packages/dscr-core/audit doc + 132 tests / 94.37% coverage

## Appendix B: Pseudocode Library (Canonical, Expanded)
### B.1 Sequential Drawdown Array (P0-1)
def sequential_drawdown(
    monthly_rent: list[float],       # 36 months
    monthly_opex: list[float],      # 36 months
    monthly_debt_service: list[float],
    capex_events: dict[int, float],
    starting_reserves: float,
) -> dict:
    balance = starting_reserves
    ruin_month = None
    for t in range(36):
        ncf = monthly_rent[t] - monthly_opex[t] - monthly_debt_service[t]
        if t in capex_events: ncf -= capex_events[t]
        balance += ncf
        if balance < 0 and ruin_month is None: ruin_month = t + 1
    return {'liquidity_failure': ruin_month is not None,
            'ruin_month': ruin_month}
### B.2 t-Copula Monte Carlo (Sprint 6 implementation)
from scipy import stats
import numpy as np

CORRELATION_MATRIX = np.array([
    [ 1.00, -0.55,  0.25,  0.35, -0.10],
    [-0.55,  1.00,  0.15, -0.30,  0.05],
    [ 0.25,  0.15,  1.00,  0.10, -0.05],
    [ 0.35, -0.30,  0.10,  1.00,  0.20],
    [-0.10,  0.05, -0.05,  0.20,  1.00],
])

def run_monte_carlo(noi, monthly_pitia, hold_years, n_trials=10_000, nu=6):
    rng = np.random.default_rng(42)
    L = np.linalg.cholesky(CORRELATION_MATRIX)
    Z = rng.standard_normal((n_trials, 5))
    chi2 = rng.chisquare(nu, size=(n_trials, 1))
    X = (Z @ L.T) / np.sqrt(chi2 / nu)
    U = stats.t.cdf(X, df=nu)
    rent_growth = stats.norm.ppf(U[:, 0], loc=0.02, scale=0.05)
    vacancy = np.clip(stats.beta.ppf(U[:, 1], a=2, b=36), 0, 0.35)
    # ... map remaining marginals
    # Returns: dscr_p5, dscr_p50, prob_dscr_sub_1_0, stress_verdict
### B.3 OBBBA After-Tax IRR (Sprint 4)
def compute_after_tax_irr(deal, tax_profile, hold_years):
    # OBBBA 100% bonus (acquired after Jan 19, 2025)
    # Cost-seg reclassification: 60% structure / 40% bonus-eligible
    building_basis = deal.purchase_price - deal.land_value
    if deal.cost_seg_elected and deal.purchase_price >= 500000:
        bonus = building_basis * 0.40
        structure = building_basis * 0.60
        yr1_dep = bonus + structure / 27.5
        ongoing_dep = structure / 27.5
    # §1250 recapture at exit (residential: Bucket 1=0, Bucket 2=25%, Bucket 3=LTCG)
    # NIIT 3.8% if MAGI > threshold (FIXED, NOT CPI)
    # PAL phase-out: $150K complete (not $200K)
    # REP status: >750 hrs + >50% real property -> no NIIT on rental
    # XIRR via pyxirr
### B.4 Extended QbD (Doc 17 — 7 triggers)
def qualifies_but_dangerous(lender_pass, dscr_e, seasonal_dscr_min,
                             rwdscr, drawdown_pass, refi_pass, acs, iss):
    if not lender_pass: return False, 'LENDER_FAIL'
    triggers = []
    if dscr_e < 1.0: triggers.append('DSCR_E_BREACH')
    if seasonal_dscr_min < 1.0: triggers.append('SEASONAL_BREACH')
    if rwdscr < 1.0: triggers.append('RWDSCR_BREACH')
    if not drawdown_pass: triggers.append('LIQUIDITY_FAILURE')
    if not refi_pass: triggers.append('REFI_FAILURE')
    if acs < 0.6: triggers.append('LOW_DATA_CONFIDENCE')
    if iss < 0.6: triggers.append('LOW_SURVIVAL')
    if not triggers: return False, 'NONE'
    severity = ('CRITICAL' if len(triggers) >= 3 else
                'MODERATE' if len(triggers) == 2 else 'MINOR')
    return True, severity
### B.5 ARM Reset + Cap-Rate Linked Refi (Sprint 5/3)
def arm_reset_with_sofr_curve(loan_balance, initial_rate, margin,
                               periodic_cap, lifetime_cap, sofr_rates):
    """Sprint 5 QuantLib ARM Reset"""
    new_rate = sofr_rates['6m'] + margin
    new_rate = min(new_rate, initial_rate + periodic_cap)
    new_rate = min(new_rate, initial_rate + lifetime_cap)
    # PMT(loan, new_rate, remaining_term)

def break_even_refi_cap_linked(noi, loan_balance, current_rate,
                                target_dscr, current_cap_rate,
                                cap_rate_beta, max_matrix_ltv,
                                remaining_term_months):
    # Dual gate: DSCR AND LTV
    def check(rate):
        pmt = compute_pmt(loan_balance, rate, remaining_term_months)
        dscr = noi / (pmt * 12)
        proj_cap = current_cap_rate + cap_rate_beta * (rate - current_rate)
        proj_value = noi / proj_cap
        ltv = loan_balance / proj_value
        return (dscr >= target_dscr) and (ltv <= max_matrix_ltv)
    # Binary search for break_even_rate
### B.6 6-Class Recommendation (Doc 17 + State Machine)
def recommend(acs, lender_pass, qbd_severity, iss, dfs, drawdown_pass):
    if acs < 0.6:
        return 'HALT - INSUFFICIENT DATA', ['ACS_BELOW_THRESHOLD']
    if not lender_pass:
        return 'REJECT - DOES NOT QUALIFY', ['LENDER_FAIL']
    if qbd_severity == 'CRITICAL':
        return 'QUALIFIES BUT CRITICAL RISK', ['QBD_CRITICAL']
    if qbd_severity == 'MODERATE':
        return 'QUALIFIES BUT DANGEROUS', ['QBD_MODERATE']
    if qbd_severity == 'MINOR' or not drawdown_pass or iss < 50 or dfs < 30:
        return 'FRAGILE - MONITOR CLOSELY', ['FRAGILITY_FLAG']
    if iss >= 80 and dfs >= 60:
        return 'STRONG DEAL', ['STRONG_PASS']
    return 'ACCEPTABLE - MONITOR KEY RISKS', ['MONITOR_ONLY']
### B.7 Adverse_Action_Notice_Payload (FCRA PDF spec)
def emit_adverse_action(lender_id, application_id, kill_event,
                       fcra_data_sources, state):
    """FCRA PDF p.8-9 compliant payload"""
    reasons = dynamic_ecoa_mapping(kill_event)
    payload = {
        'version': '1.0',
        'as_of': utcnow().isoformat(),
        'lender_id': lender_id,
        'application_id': application_id,
        'is_compliant': True,
        'regulatory_notices': {
            'ecoa_notice': {
                'header': 'ADVERSE ACTION NOTICE',
                'prohibition_statement': REG_B_PROHIBITION_TEXT,
                'reasons': reasons
            },
            'fcra_disclosure': {
                'header': 'DISCLOSURE REQUIRED BY THE FAIR CREDIT REPORTING ACT',
                'statement': FCRA_STANDARD_TEXT,
                'data_source': fcra_data_sources[0]['name'],
                'source_address': fcra_data_sources[0]['address']
            }
        },
        'state_specific_notices': get_state_specific_notices(state),
        'meta': {
            'generation_timestamp': utcnow().isoformat(),
            'engine_version': ENGINE_VERSION,
            'explanation_layer_version': '1.0.0'
        }
    }
    return payload

## Appendix C: Live Rate Triplet + Market Data (June 17-18, 2026)

## Appendix D: Lender Footprint Matrix (June 2026)
### D.1 Angel Oak Rental AVM (Industry-First)
Launched Nov 4, 2025. Powered by Clear Capital. Locks at pre-qualification, held through closing (unless property materially changes).
[COMPETITIVE EDGE] Engine implication: surface Angel Oak as preferred lender when speed-of-certainty matters. Eliminates #1 DSCR deal-kill risk (appraisal coming back with lower rent than assumed).

## Appendix E: References & Source Anchors
### E.1 Primary Regulatory Sources
- OCC Bulletin 2026-13 — SR 26-02 Model Risk Management (effective April 17, 2026)
- Fannie Mae Selling Guide (B2-2-03, B2-3-03, B7-3-02) — DSCR, NCF, replacement reserves
- Freddie Mac Single-Family Seller/Servicer Guide
- CFPB Circular 2022-03 — Adverse action reasons for complex algorithms
- Regulation B (ECOA) — Equal Credit Opportunity Act
- Regulation Z (TRID) — Truth in Lending disclosures
- IRC §1411 — Net Investment Income Tax (NIIT)
- IRC §469 — Passive Activity Loss (PAL) rules
- IRC §1250 — Unrecaptured gain
- Treasury/IRS Notice 2026-11 — OBBBA Bonus Depreciation
- FinCEN Interim Final Rule (Mar 21-26, 2025) — Corporate Transparency Act BOI
- HOEPA High-Cost Mortgage Thresholds (2026: $27,592 loan / $1,380 P&F)
- FHFA AB-2022-03 — Fair Lending AI/ML
- Basel III Finalising Post-Crisis Reforms (BCBS d424)
- EBA 2025 EU-wide Stress Test
- PA Act 6, 10 Pa. Code §7.2; OH ORC §1343.011
- MN HF 3437 (enacted April 23, 2026; effective Aug 1, 2026)
### E.2 Market Data Sources
- KBRA Single-Borrower CMBS Default and Loss Study
- KBRA CMBS Loan Performance Trends (Feb/Apr 2026)
- KBRA CRE CLO Loan Default and Loss Study (Jun 2026)
- Trepp CMBS distress rate
- CRED iQ CMBS Conduit Underwriting Trends (Feb 2026)
- S&P Global Ratings DSCR adjustment factor methodology (NRMLT 2026-NQM1)
- Fitch Ratings Multifamily/Office CMBS Delinquency
- Matthews 2026 Cap Rate Analysis
- NCREIF Property Index
- MSCI Real Capital Analytics
- MMCG CRE Insights
- John Burns Real Estate Consulting
- AirDNA Best Places to Invest 2026
- RentCast API (rentcast.io/api)
- Optimal Blue PPE 2026
### E.3 Academic / Methodology
- Demarta & McNeil (2005) — t-copula dependency modeling, DOI
- Artzner et al (1999) — Coherent risk measures
- BIS Supervisory Stress Testing (BCBS d427)
- IMF Macro-Financial Stress Test Framework
- OECD Commercial Real Estate Markets 2024
- ESRB CRE Lending Risks (Occasional Paper No. 29)
- UNC Cap Rate Determinants (Tsui-Morgan 2025)
- MIT Sloan Statistical Learning for Finance
- TimesFM 2.5 paper (Google Research)
### E.4 Reference Preservation
All source documents preserved in workspace. PDF text extractions in RESEARCH/pdf_extractions/. Sprint files in RESEARCH/sprint_short/. Full bibliography of 170+ entries preserved in the original PDFs (Calculator to Counselor, Calculation to Counsel, Beyond the DSCR, From Static Snapshot, From Calculator to Containment).

--- END OF v2 SYNTHESIS ---
Prepared for DSCR Sovereign OS / 20X DSCR Deal Engine
Workspace: C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE
Output: output/doc/DSCR_Advisor_Engine_Cross_Doc_Synthesis_v2_20260619.docx
v2.0 corrects 7 errors in v1.0; adds Sprint 0-6, FCRA, Definitive Blueprint,
Definitive Product Spec, v16 fixes, Master Knowledge, 2026 Master Knowledge Paper
60+ source documents analyzed end-to-end
| Component | SR 26-02 Classification | Governance |
| --- | --- | --- |
| DSCR calculator (QuantLib/pyxirr) | Not a model | Unit tests + CI/CD |
| Legal Rules Engine | Not a model | Quarterly counsel review |
| After-Tax Engine | Not a model | Unit tests + IRS source verification |
| Monte Carlo Risk Engine | High-materiality model | Full model card + challenger |
| TimesFM/TFT Forecasters | Medium-high model | Model card + backtesting |
| Approval Predictor (XGBoost) | High-materiality model | Full card + outcomes analysis |
| Metric | Baseline | Target After v2 Improvements |
| --- | --- | --- |
| DSCR measurement | Single static ratio (Track 1 only) | 4 tracks: Track 1 Lender + Track 2 Investor + Track 3 Stabilized + All-In |
| Time horizon | Year-1 snapshot | 10-year trajectory + 36mo sequential drawdown + IO+ARM reset |
| Stress scenarios | 3 independent shocks | 4+ correlated macro archetypes (Stagflation/Recession/Climate/Local) |
| Monte Carlo | Absent | t-copula, 10K trials, KBRA-calibrated 5-factor correlation |
| Breakpoint solver | Single-variable algebra | Multi-variable constrained opt + Matrix grid + Counterfactual |
| ECOA compliance | Abstract scores | 40 reason codes (Form C-1 verbatim) + FCRA disclosure + state notices |
| Refi realism | Break-even rate only | Cap-rate-linked dual gate (DSCR + LTV) with Cap_Rate_Beta |
| Audit trail | Log file | SHA-256 + Merkle + SR 26-02 model cards + version-pinned JSON |
| After-tax | Pre-tax only | OBBBA 100% bonus + §1250 recapture + NIIT + PAL + 1031 |
| SR 26-02 status | Not classified | Deterministic core excluded from model governance |
| # | v1.0 Statement | v2.0 Correction | Source |
| --- | --- | --- | --- |
| 1 | ECOA codes 19/21/26/27/28 should be re-numbered to match Form C-1 verbatim | DO NOT re-number — codes are CORRECT. v1.0 was wrong. | FCRA PDF p.6 |
| 2 | PPP PA threshold = $319,777 | $319,777 was 2025; 2026 figure = **$329,411** (LIPL-indexed) | Sprint 2 + Definitive Blueprint v3 |
| 3 | LLC-vested non-bank financing triggers FinCEN BOI reporting | **WRONG** under current law — non-bank lenders exempt per FinCEN Mar 2025 interim final rule | Definitive Blueprint v3 §FinCEN |
| 4 | Architecture: deterministic core is a model under SR 11-7 | **NOT a model** under SR 26-02 (April 2026); simpler compliance | Definitive Blueprint v3 §SR 26-02 |
| 5 | TimesFM 2.0 with 500M params | **TimesFM 2.5**: 200M params (faster), 15,360 context (7.5x), native quantile head, XReg covariates | Google BigQuery docs Jun 12 2026 |
| 6 | Three DSCR tracks (Track 1/2 only) | **Four tracks**: Track 1 Lender + Track 2 Investor + Track 3 Stabilized + All-In | v16 Master Consolidated |
| 7 | v1.0 said 'compress 36mo simulation to scalar LSC' | v2.0 keeps LSC as quick diagnostic but uses **Sequential Drawdown Array** for gating | Sprint 6 + multiple docs |
| # | Function | Elite Standard | Module |
| --- | --- | --- | --- |
| 01 | Scenario Accuracy | GO/NO-GO verdict with confidence score in under 10 minutes | engine.ts + preflightGate.ts + rentCompAggregator.ts |
| 02 | Guideline Intelligence | 25+ verified lenders with auto-fit scoring and two-quote rule | lenders.ts + lenderGuidelines.ts + fitScorer.ts |
| 03 | Borrower Trust | Every quote regulator-ready, backed by full constraint disclosure | quoteExplainer.ts + pdfQuotePack.ts |
| 04 | Capital Partner Trust | Zero-defect file standard, first-pass clean rate above 90% | fileCompletenessEngine.ts + defectScorer.ts |
| 05 | Distribution | 60%+ of revenue from repeat referral channels | referralPortal.ts + channelAttribution.ts |
| 06 | Risk Discipline | Hard decline gates + adverse-action compliance, false-decline below 5% | declineGate.ts + adverseActionEngine.ts |
| Plane | Definition | Implementation |
| --- | --- | --- |
| Projection Plane | Human-facing views | Scenario Builder, Lender Matchmaker, After-Tax IRR Studio, IC Memo Command |
| Graph Plane | Causal central nervous system | Nodes (Borrower, Property, Lender, Law, Rate) with Typed Edges (Qualifies, Conflicts, Supersedes, Shocks) |
| Ledger Plane | Immutable append-only event log | Every mutation, approval, export captured with full provenance |
| Field | Type | Description |
| --- | --- | --- |
| source_id | string | Vendor identifier (rentcast, airdna, fred, ocrolus, etc.) |
| as_of_timestamp | datetime (UTC) | When the data was retrieved from source |
| effective_date | datetime | What date the data describes |
| confidence_score | float [0–1] | Source-specific reliability rating |
| hash | string | SHA-256 of raw response payload |
| ttl_hours | int | Time-to-live before staleness flag |
| provenance_tier | enum | primary_source / vendor_model / derived / user_input |
| decay_rate | float | Confidence reduction per hour after TTL |
| Track | Numerator | Denominator | Frequency | Use Case | Rule |
| --- | --- | --- | --- | --- | --- |
| Track 1 — Lender Qualifying DSCR | Qualifying rent: lower of lease or market rent (Form 1007) | PITIA | Monthly | DSCR loan qualification | Qualifying_Rent_Monthly / PITIA_Monthly |
| Track 2 — Investor Survival DSCR | NOI = EGI − OpEx (excl. debt service) | ADS = annual debt service | Annual | True property-level debt coverage | NOI_Annual / ADS_Annual |
| Track 3 — Stabilized DSCR | Stabilized Year-N NOI (usually Year 3 after rehab/lease-up) | ADS after recast or perm debt | Annual | Value-add, bridge-to-perm, repositioning | Stabilized_NOI / Stabilized_ADS |
| All-In DSCR | NOI | PI + T + I + HOA annualized | Annual | Conservative lender/investor variant | NOI / All_In_Housing_Cost |
| Metric | Formula |
| --- | --- |
| Cap Rate | NOI / Price |
| Yield-on-Cost | Stabilized_NOI / Total_Cost |
| CoC | (NOI - ADS) / Cash_Invested [Year 1, 3, 5] |
| Debt Yield | NOI / Loan [target >= 9% institutional] |
| Break-even Occupancy | (OpEx + ADS) / GPR |
| Equity Multiple | Total_Distributions / Total_Equity_Invested |
| DSCR Cushion | Track1 - Lender_Floor |
| ID | Bug | Fix | Slice 1 Status |
| --- | --- | --- | --- |
| BUG-01 | LTV denominator must use min(purchase, appraisal) for purchases | value_for_ltv() per transaction type | FIXED in ltv.py |
| BUG-02 | NOI growth exponent off-by-one (Year3 = Year1 * (1+g)^2 not ^3) | year1_noi * (1+g)^(year-1) | NEW — Slice 2 |
| BUG-03 | Vacancy tornado labels swapped (low vac = best case, high vac = worst) | vac_best = max(0, vac - 0.05); vac_worst = min(1, vac + 0.05) | NEW — Slice 2 |
| BUG-05 | Breakeven Occupancy must include OpEx | (ADS + OpEx) / Potential_Gross_Income | FIXED in ltv.py |
| BUG-06 | IO Max Loan must use decimal rate (not percent) | Max_Loan_IO = (Max_PI * 12) / annual_rate_decimal | FIXED in ltv.py |
| ID | Flaw | Fix |
| --- | --- | --- |
| FLAW-01 | Required DSCR risk factors don't stack | Additive model: product_minimum + sum of risk_adjustments (capped at 1.30) |
| FLAW-02 | Waterfall promote is cliff model not tranched | Sequential tranche waterfall with LP IRR hurdle |
| IMP-08 | Stressed DS re-amortization not handled | Recalc PMT over shortened remaining term after IO expiry + rate reset |
| Test | Rule |
| --- | --- |
| TEST 1 — Acquisition Date | Property must be acquired after January 19, 2025 |
| TEST 2 — Binding Contract | If binding written contract executed before Jan 20, 2025: NOT ELIGIBLE for 100% bonus |
| TEST 3 — 10% Safe Harbor | If more than 10% of total hard costs incurred before Jan 20, 2025: NOT ELIGIBLE |
| Bucket | Definition | Tax Rate | Applies to |
| --- | --- | --- | --- |
| Bucket 1 — Recaptured §1250 | Depreciation in EXCESS of straight-line | ORDINARY (up to 37%) | Commercial (39-yr) where accelerated taken; ZERO for residential 27.5-yr |
| Bucket 2 — Unrecaptured §1250 | Total straight-line depreciation taken | Max 25% federal | Every residential rental seller (Form 4797 Part III) |
| Bucket 3 — Remaining Gain | Sale price - adjusted basis - Bucket 2 | LTCG 0/15/20% | True appreciation |
| Filing Status | MAGI Threshold | NIIT Rate |
| --- | --- | --- |
| Married Filing Jointly | $250,000 | 3.8% |
| Single / Head of Household | $200,000 | 3.8% |
| Married Filing Separately | $125,000 | 3.8% |
| Qualifying Widow(er) | $250,000 | 3.8% |
| Series | FRED ID | Value | Source |
| --- | --- | --- | --- |
| 10-Year Treasury (DGS10) | DGS10 | 4.43% | FRED |
| SOFR Overnight | SOFR | 3.63% | FRED |
| 30-Day Average SOFR | NY Fed | 3.609% | NY Fed |
| 90-Day Average SOFR | NY Fed | 3.636% | NY Fed |
| 1-Month Term SOFR | CME | 3.637% | CME Term SOFR |
| 3-Month Term SOFR | CME | 3.668% | CME Term SOFR |
| 6-Month Term SOFR | CME | 3.731% | CME Term SOFR |
| 12-Month Term SOFR | CME | 3.869% | CME Term SOFR |
| Factor Pair | Correlation | Rationale |
| --- | --- | --- |
| Rent ↔ Vacancy | -0.55 | Inverse: high rent → low vacancy |
| Rent ↔ Expense | +0.25 | Both rise with market |
| Rent ↔ Cap Rate | +0.35 | Cap rate expands when rents pressured |
| Vacancy ↔ Cap | -0.30 | Vacancy up, values down |
| Cap ↔ Rate | +0.20 | Rate hikes → cap expansion |
| Expense ↔ Cap | +0.10 | Modest co-movement |
| Factor | Distribution | Parameters | Source |
| --- | --- | --- | --- |
| LTR Rental Growth | Normal | μ=2%, σ=5% | KBRA / MMCG |
| STR Gross Revenue | Lognormal | μ=0%, σ=18-25% | AirDNA |
| LTR Vacancy | Beta(α=2, β=36) | mean ≈ 5.3% | CoStar/Trepp |
| STR Vacancy | Beta(α=3, β=7) | mean 20-40% | AirDNA |
| Insurance Escalation | Lognormal | μ=7%, σ=5%; coastal μ=12% | Post-2024 crisis |
| Property Tax Growth | Truncated Normal | μ=3%, σ=1%; CA cap 2% | Prop 13; TX/FL uncapped |
| 10Y Treasury Path | CIR / Hull-White | Calibrated to live SOFR | FRED + QuantLib |
| Rate Drift | Normal | μ=0%, σ=0.5% | Current flat curve |
| Verdict | P5 DSCR | P(DSCR<1.0) |
| --- | --- | --- |
| RESILIENT | >= 1.0 | < 5% |
| MODERATE_RISK | >= 0.90 | < 15% |
| ELEVATED_RISK | >= 0.75 | < 35% |
| STRESSED — REVIEW | < 0.75 | >= 35% |
| Archetype | Rent | Vacancy | OpEx | Rate | Cap Rate |
| --- | --- | --- | --- | --- | --- |
| Stagflation | flat | flat | +10% | +200 bps | +50 bps |
| Recession | -15% | +10% | -5% | -100 bps | +75 bps |
| Climate/Regional | -5% | -3% | +50% insurance | flat | -10% value |
| Local Distress | -10% | +5% | flat | flat | +100 bps |
| Status | Action |
| --- | --- |
| PROHIBITED (NYC, SF, LA, Santa Monica, Manhattan Beach, NO French Quarter) | KILL — STR income disabled |
| RESTRICTED (Nashville, Austin, Denver, Jersey City) | Verify permit before underwriting |
| PERMITTED with conditions (Miami, San Diego) | Check zoning, permit availability |
| PERMITTED (Houston, Dallas, Raleigh) | No restrictions |
| Rank | Market | Cap Rate | Median Price | Annual Revenue |
| --- | --- | --- | --- | --- |
| 1 | Jackson, MS | 15.95% | $84,672 | $24,550 |
| 2 | Abilene, TX | 14.01% | $201,493 | $51,330 |
| 3 | Akron, OH | 11.66% | $139,633 | $29,612 |
| 4 | Montgomery, AL | 11.64% | $143,500 | $30,364 |
| 5 | Port Arthur, TX | 10.38% | $124,353 | $23,477 |
| 6 | Springfield, IL | 10.09% | $159,667 | $29,283 |
| 7 | Charleston, WV | 9.80% | $158,399 | $28,211 |
| 8 | Lebanon, PA | 8.68% | $281,650 | $44,457 |
| 9 | Lake Charles, LA | 8.41% | $212,333 | $32,453 |
| 10 | St. Paul, MN | 6.84% | $289,137 | $35,968 |
| Lender | NMLS | States | Key Specs |
| --- | --- | --- | --- |
| Visio Lending | 1935590 | 41+DC | DSCR floor 1.00; FICO 680; LTV 80%/75% CO; $100K-$5M; 5/4/3/2/1 or 3/2/1 PPP; #1 DSCR lender ($854.6M 2024) |
| Kiavi | — | 49+DC | Tech-forward, AVM-heavy, rapid closings |
| Angel Oak | 1160240 | 47+DC | Rental AVM (Clear Capital) Nov 2025 — locks at pre-qual; non-warrantable condo specialist |
| Griffin Funding | — | 46+DC | Sub-1.0/low-DSCR/no-ratio/jumbo DSCR |
| LendingOne | — | All+exempt | Licensed or exempt in all other states |
| Lima One Capital | — | National | Premier business-purpose; $10B+ lifetime; DSCR/bridge/construction |
| Deephaven | — | National | DSCR First + DSCR Second Mortgage ($75K-$500K, no reserves, no income docs, AVM option) |
| MortgageDepot | — | Verified | 40-yr amortized + 40-yr IO (up to $3M) |
| Sistar Mortgage | — | Verified | 40-yr IO confirmed 2026 |
| Pool Statistic | AOMT 2025-6 (Angel Oak) | NRMLT 2026-NQM1 (Rithm) |
| --- | --- | --- |
| WA FICO | 746 | 758 |
| WA CLTV | 71.95% | Per filing |
| WA DSCR (DSCR loans) | 1.19 | N/A |
| Sub-1.0 DSCR concentration | 4.20% | — |
| DSCR loan % of pool | 42.43% | — |
| IO feature | 11.91% | — |
| Fixed vs ARM | 99.01% / 0.99% | — |
| Pool balance | $349.65M | $502.1M |
| Competitor | Threat | Counter-Moat |
| --- | --- | --- |
| YieldStack AI (Apr 2026) | 180+ lender programs, program-level matching, zero cost | YieldStack matches; we ANALYZE (dual-track, MC, AEY, after-tax) + compliance gates + IC memo |
| LenderSA 3.2 (Jan 2026) | Hard money focus, AI negotiation, hundreds of lenders | Different segment (fix-and-flip not DSCR); moat in analytical depth |
| Angel Oak Rental AVM | Industry-first AVM at pre-qual (locked through closing) | Surface as preferred lender for speed-certainty purchases |
| State | PPP Status (2026) | Threshold | Statute |
| --- | --- | --- | --- |
| MN | ALLOWED (Aug 1, 2026) | N/A | MN HF 3437 enacted Apr 23, 2026; §58.137 applies only to personal/family/household |
| PA | THRESHOLD-RESTRICTED | $329,411 (2026, was $319,777 in 2025) | PA Act 6, 10 Pa. Code §7.2 — CPI indexed |
| OH | THRESHOLD-RESTRICTED | $112,957 (2025; 2026 needs Jan pull) | OH ORC §1343.011 — CPI indexed |
| WA | ALLOWED w/ ARM restriction | 60 days before ARM reset | RCW 19.144.040 |
| NJ | ENTITY-DEPENDENT (3-branch) | C-Corp ALLOWED, LLC CONTESTED, LP/Trust/Ind PROHIBITED | N.J.S.A. 46:10B-2; Arc Home Jul 2025; NPLA Oct 2025 |
| CA | ALLOWED (business-purpose) | N/A | CA Civil Code §2954.10 |
| TX, FL, GA, NC, TN, SC, VA, AL, IN, KY, MI, MO, WI, LA, AZ, CO | ALLOWED | N/A | Business-purpose exemption |
| NY | ALLOWED (business-purpose LLC) | Banking Law §6-l | Verify usury not violated |
| IL | ALLOWED (LLC) | Individual prohibited if rate >8% | IL Residential Real Property Disclosure Act |
| MS | DECLINING STRUCTURES only | Flat banned >1yr | §75-17-31 |
| AR | ALLOWED first 3yr | Penalty base = REMAINING balance | State PPP matrix |
| Component | SR 26-02 Status | Governance |
| --- | --- | --- |
| DSCR Calculator (QuantLib/pyxirr) | NOT a model (explicitly excluded) | Unit tests + CI/CD |
| Legal Rules Engine (state PPP, usury) | NOT a model | Quarterly counsel review |
| After-Tax Engine (OBBBA, §1250, NIIT, PAL) | NOT a model | Unit tests + IRS source verification |
| Lender Qualification Engine | NOT a model (rule-based) | Config + version control |
| Monte Carlo Risk Engine | HIGH-materiality MODEL | Full model card + champion/challenger |
| TimesFM 2.5 / TFT Forecasters | MEDIUM-HIGH model | Model card + backtesting |
| Approval Predictor (XGBoost) | HIGH-materiality MODEL | Full card + outcomes analysis + disparate impact monitor |
| LLM narrative generation | Outside SR 26-02 but needs internal governance | Risk policy + audit trail |
| Code | Verbatim Text | Trigger (FCRA PDF p.6) |
| --- | --- | --- |
| 19 | Your income is not sufficient to meet your expenses and debt payments. | DSCR low (rent-driven) / FICO < 620 / Reserves < 3mo |
| 21 | Your debt payments or other obligations are too high. | DSCR low (ADS-driven) |
| 26 | You requested an amount that exceeds the maximum loan amount permitted by our regulations. | LTV 80-90% |
| 27 | The collateral value is insufficient. | LTV > 90% |
| 28 | The type of property you selected is not acceptable to us. | STR prohibited / property type rejection |
| Series | Value (Jun 16-18, 2026) | Source |
| --- | --- | --- |
| DGS10 (10Y Treasury) | 4.43% | FRED |
| DGS30 (30Y Treasury) | — | FRED |
| DGS5 (5Y Treasury — ARM benchmark) | — | FRED |
| SOFR Overnight | 3.63% | FRED |
| 30-Day Avg SOFR | 3.609% | NY Fed |
| 90-Day Avg SOFR | 3.636% | NY Fed |
| Fed Funds Effective | 3.50-3.75% | FRED (held 4th consecutive FOMC) |
| Conventional 30yr IP (Freddie Mac) | 6.53% | Freddie Mac Jun 8 |
| DSCR Premium vs Conventional | +50-125 bps | Multiple sources |
| Tier | Rate Range | Profile |
| --- | --- | --- |
| Competitive | 6.125-6.49% (par 6.125%, 0 pts) | 740+ FICO, ≤70-75% LTV, 1.0+ DSCR — Griffin Jun 2026 |
| ARM (from 5.125%) | 5.125%+ | Same profile, ARM structure |
| Typical | 6.50-7.50% | Standard files |
| Full-market | up to 10.75% | Thin/non-prime/low DSCR/STR/FN |
| Lever | Adjustment |
| --- | --- |
| FICO 760+ | −0.05 to −0.125 |
| FICO 720-739 | +0.125 |
| FICO 700-719 | +0.125 to +0.25 |
| FICO 680-699 | +0.50 (cliff) |
| FICO 660-679 | +0.875 (cliff) |
| FICO 640-659 | +1.50 to +2.50 |
| LTV per 5% increment | +0.125 to +0.25 |
| DSCR per 0.10 below 1.25 | +0.125 |
| 85% LTV (select lenders) | 740+/SFR purchase/DSCR ≥1.0 only |
| IO | +0.25 |
| ARM | −0.125 to −0.375 vs 30yr fixed |
| 1 discount point | ≈ −0.25% rate |
| Cash-out | +0.25 to +0.50 |
| Loan <$150K | DSCR floor often 1.25 |
| Foreign national | +0.50 to +1.50 |
| No-PPP | +0.50 to +0.80 |
| 6+ mo reserves | −0.10 to −0.25 |
| Rate lock 60d | +0.125 |
| Aspect | Detail |
| --- | --- |
| Coverage | 140M+ property records, all 50 states |
| Free tier | 50 API calls/month (Developer plan) — CORRECTED FROM V1.0 |
| Auth | X-Api-Key header |
| Base URL | https://api.rentcast.io/v1/ |
| Critical endpoints | /avm/rent/long-term, /avm/value, /markets |
| STR support | NONE — STR requires AirDNA |
| Aspect | Detail |
| --- | --- |
| Coverage | 10M+ STR properties, 120K+ markets; Airbnb/VRBO/Booking.com |
| Data accuracy | 97% (daily scrape of 100% listings) |
| Pricing | $15-40/month per market (Professional); Enterprise API custom ($50K+/yr) |
| Free tier | Limited market data, no Rentalizer |
| Critical for | DSCR deals where STR income is primary qualifying metric |
| Aspect | Detail |
| --- | --- |
| Access | Commercial lender/broker API entitlements required |
| Pricing | $15K-$50K+/yr |
| 2026 features | Virtual Economist AI/ML forecasting, Profitability Center, Competitive Data License Plus |
| Lock time | Cuts from 15 minutes to seconds via API |
| Metric | Question | Target |
| --- | --- | --- |
| DSCR (Cash Control) | Can the borrower make the payment? | Per lender matrix (typically ≥ 1.00-1.25) |
| Debt Yield (Workout Metric) | What is the lender's cap rate if they foreclose? | ≥ 9% institutional standard |
| LTV (Loss-Given-Default) | How much asset deflation can the lender absorb? | Per matrix + LGD model |
| Failure | Suggested Fix (ranked) |
| --- | --- |
| Track A DSCR = 0.94 | Reduce loan by $14K (→1.00x) OR route to IO product (1 day) |
| Debt Yield < 9% | Lower price by X OR seek higher-rent lease comp |
| LTV > matrix | Increase down payment OR switch to lower-LTV matrix |
| FICO below floor | No automatic fix — refer to manual UW |
| # | v1.0 Wrong | v2.0 Correct | Source Authority |
| --- | --- | --- | --- |
| 1 | Renumber Slice 1 ECOA codes | DO NOT renumber — codes ARE Form C-1 verbatim | FCRA PDF p.6 |
| 2 | PA PPP threshold = $319,777 | $329,411 (2026, was $319,777 in 2025) | Sprint 2 + Definitive Blueprint v3 |
| 3 | LLC non-bank financing triggers FinCEN BOI | NOT triggered (FinCEN Mar 2025 interim final rule) | Definitive Blueprint v3 §FinCEN |
| 4 | Deterministic core = model under SR 11-7 | NOT a model under SR 26-02 (Apr 17, 2026) | OCC Bulletin 2026-13 |
| 5 | TimesFM 2.0 with 500M params | TimesFM 2.5: 200M, 15,360 ctx, quantile head, XReg | Google BigQuery docs Jun 12, 2026 |
| 6 | Two DSCR tracks (Track 1/2) | Four tracks (Lender/Investor/Stabilized/All-In) | v16 Master Consolidated |
| 7 | PAL MFJ phase-out = $200K | PAL phase-out completes at $150K for ALL individual filers | IRC §469(i); Sprint 4 statutory analysis |
| 8 | RentCast $29/$99/$199 tiers | API free tier = 50 calls/mo; paid = volume-based | rentcast.io/api |
| 9 | Gaussian copula acceptable | t-Copula ν=5-7 mandatory; Gaussian BANNED | Sprint 6 + multiple sources |
| 10 | Three-track stress (Base/Conservative/Severe) | Four archetype scenarios + macro stacking | Sprint 6 |
| # | Module | Effort | Dependencies |
| --- | --- | --- | --- |
| P0-1 | Sequential Drawdown Array (month-by-month cash simulation) | 30 hr | Slice 1 payment.py |
| P0-2 | Stress Scenario Engine (Base/Conservative/Severe + 4 Macro Archetypes) | 40 hr | Sprint 6 KBRA-calibrated distributions |
| P0-3 | DFS + ISS (min-gate) + QbD (7-trigger) | 40 hr | Sprint 6 + Doc 17 pseudocode |
| P0-4 | Counterfactual Generator (binary search) | 20 hr | P0-3 |
| P0-5 | 6-class Recommendation State Machine | 20 hr | P0-3 + P0-4 |
| P0-6 | BUG-02 NOI growth off-by-one + BUG-03 vacancy tornado labels | 10 hr | Slice 1 dscr.py |
| P0-7 | Stabilized Economic NOI (Ledger 2 foundation) | 20 hr | P0-1 + Slice 1 dscr.py |
| P0-8 | MCID detector (STR-specific) | 15 hr | P0-1 |
| P0-9 | Triangulated Rent Validator (4-source weighted + CV) | 15 hr | Slice 1 dscr.py |
| TOTAL |  | 210 hr (~5-6 weeks) |  |
| # | Module | Effort |
| --- | --- | --- |
| P1-1 | Track 3 Stabilized DSCR + All-In DSCR (4-track complete) | 40 hr |
| P1-2 | Multi-Year DSCR Trajectory (10-year roll-up w/ IO+ARM reset) | 60 hr |
| P1-3 | Cap-Rate Linked Refi Solver (dual gate DSCR+LTV) | 60 hr |
| P1-4 | Matrix Grid Solver + Multi-Variable Constrained Opt | 80 hr |
| P1-5 | After-Tax Engine (OBBBA 100% bonus + §1250 + NIIT + PAL + REP) | 80 hr |
| P1-6 | t-Copula Monte Carlo (Sprint 6 implementation) | 60 hr |
| P1-7 | SHA-256 + Merkle Audit Trail + SR 26-02 model cards | 40 hr |
| TOTAL | All modules | 420 hr (~10 weeks) |
| Component | SR 26-02 Class | Required Governance | Engine Impact |
| --- | --- | --- | --- |
| DSCR Calculator | NOT a model | Unit tests + CI/CD | Ship 5x faster than competitors |
| Legal Rules Engine | NOT a model | Quarterly counsel review | Ship 5x faster |
| After-Tax Engine | NOT a model | IRS source verification + unit tests | Ship 5x faster |
| Lender Qualification | NOT a model (rule-based) | Config + version control | Ship 5x faster |
| Monte Carlo | HIGH-materiality MODEL | Full model card + champion/challenger + outcomes | Required for production |
| TimesFM 2.5 / TFT | MEDIUM-HIGH model | Model card + backtesting | Required for production |
| Approval Predictor | HIGH-materiality MODEL | Full card + outcomes + disparate impact monitor | Required for production |
| Data Point | Value (Jun 17-18, 2026) | Source | Refresh |
| --- | --- | --- | --- |
| 10-Year Treasury (DGS10) | 4.43% | FRED | Every 4 hours |
| SOFR Overnight | 3.63% | FRED | Every 4 hours |
| 30-Day Avg SOFR | 3.609% | NY Fed (free) | Daily |
| 90-Day Avg SOFR | 3.636% | NY Fed | Daily |
| 1M Term SOFR | 3.637% | CME (paid license) | Continuous |
| 3M Term SOFR | 3.668% | CME | Continuous |
| 6M Term SOFR | 3.731% | CME | Continuous |
| 12M Term SOFR | 3.869% | CME | Continuous |
| Fed Funds Effective | 3.50-3.75% | FRED | After FOMC |
| Conventional 30yr IP | 6.53% | Freddie Mac Jun 8 | Weekly |
| DSCR Premium over Conv | +50-125 bps | Multiple | Per rate sheet |
| Visio DSCR Q1 2026 range | 6.75-9.50% | HonestCasa aggregator | Per rate sheet |
| KBRA CMBS 30+ DQ Feb 2026 | 7.5% | KBRA | Monthly |
| KBRA Office DQ Feb 2026 | 12.8% | KBRA | Monthly |
| KBRA CMBS Distress Feb 2026 | 10.3% | KBRA | Monthly |
| DSCR Origination Growth Jan 2025 YoY | +123% | Market data | Monthly |
| DSCR Avg Rate Q1 2026 | Below 7% (first time since Jun 2022) | Market data | Quarterly |
| Lender | NMLS | States | Min FICO | DSCR Floor | Max LTV (P/CO) | Key Feature |
| --- | --- | --- | --- | --- | --- | --- |
| Visio Lending | 1935590 | 41+DC | 680 | 1.00 (sub-1.0 case-by-case) | 80%/75% | #1 DSCR; 11 S&P deals ~$2B |
| Kiavi | — | 49+DC | — | — | — | AVM-heavy, rapid closings |
| Angel Oak | 1160240 | 47+DC | — | — | — | Rental AVM (Clear Capital) Nov 2025 |
| Griffin Funding | — | 46+DC | — | Sub-1.0 | — | No-ratio, jumbo DSCR |
| LendingOne | — | All+exempt | — | — | — | — |
| Lima One Capital | — | National | — | — | — | $10B+ lifetime; DSCR/bridge/construction |
| Deephaven | — | National | 680 | 1.00 (combined) | 80% CLTV | DSCR Second (no reserves, no income docs) |
| MortgageDepot | — | Verified | — | — | — | 40-yr amort + 40-yr IO up to $3M |
| Sistar Mortgage | — | Verified | — | — | — | 40-yr IO confirmed 2026 |
| Cake Mortgage (Non-QM Wholesale) | — | National | — | — | — | Bank statement + DSCR; primary research target |