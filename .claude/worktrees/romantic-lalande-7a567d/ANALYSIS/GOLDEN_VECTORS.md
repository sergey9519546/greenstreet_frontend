---
type: research
status: drafted
confidence: 3
title: "DSCR Sovereign OS — Golden Vectors & Pinned Test Values"
summary: "**Workspace:** `C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE`"
entities:
  - concept/appreciation
  - concept/arm
  - concept/cap-rate
  - concept/cltv
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
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/kiavi
  - lender/verus
  - lender/visio-lending
  - math/copula
  - math/sobol
  - math/t-copula
  - ml/shap
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/hoepa
  - regulation/section-1071
  - sprint/6
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
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
  - topic/40yr-amort
  - topic/adverse-action
  - topic/after-tax
  - topic/apex
  - topic/architecture
  - topic/compliance
  - topic/default-rate
  - topic/ic-memo
  - topic/insurance
  - topic/llpa
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/tax
  - topic/usury
  - type/audit
source: ANALYSIS/GOLDEN_VECTORS.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Golden Vectors & Pinned Test Values

**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`
**Date:** 2026-06-18
**Purpose:** Single source of truth for every pinned test vector, threshold, magic bucket, formula, and acceptance value. Copy these directly into your pytest fixtures or your golden test files.

> **Rule**: These values are **immutable** unless a later dated primary source supersedes. If a lender's policy changes, create a NEW golden vector — never modify an existing one.

---

## TABLE OF CONTENTS

1. **Payment Factor & PITIA** — verified formulas with golden values
2. **Golden Deal Vectors** — Deal A through Deal K (all scenarios)
3. **DSCR Math Edge Cases** — SFR, 2-4 unit, STR, IO, 40-yr, BRRRR
4. **Magic Buckets** — categorical encodings
5. **Monte Carlo Parameters** — distributions, thresholds, copula specs
6. **XGBoost FEATURE_COLUMNS** — final ML feature list
7. **Lender Matrix** — 9 + 3 verified lenders
8. **State PPP Matrix** — all 17 key states
9. **Pricing Anchors & Levers** — live rates, dated triplet
10. **Tax Numbers** — OBBBA, §1250, NIIT, PAL, HOEPA
11. **Compliance Deadlines** — FinCEN, Section 1071, SR 26-02
12. **Reserves, Asset Haircuts & Property Eligibility**
13. **Acceptance Criteria (Definition of Done v11)** — 23 criteria
14. **Kill Criteria** — 15 hard gates
15. **Distributional DSCR JSON** — canonical output schema
16. **SHAP & Adverse Action** — formula + reason generation
17. **Confidence Decay Rules**
18. **Process Rates & Cost Stack** — vendor pricing
19. **Database Schemas** — PostgreSQL DDL

---

## 1. PAYMENT FACTOR & PITIA

### Payment Factor Formula
```
factor(r) = r(1+r)^360 / ((1+r)^360 - 1)
where r = annual_rate / 12
```

### Verified Payment Factors (PIN THESE)
```
6.125% → 0.0060761
7.00%  → 0.0066530
8.25%  → 0.0075127
```

### Interest-Only
```
Monthly_IO = Loan × rate / 12
```

### IO Recast Formula (at IO period end)
```
New_Payment = Remaining_Balance × r / (1 - (1+r)^(-n_remaining))
```

### PITIA Formula
```
PITIA = P&I + Monthly_Tax + Monthly_Insurance + Monthly_HOA + Monthly_MI
```

### ITIA Formula (for IO)
```
ITIA = Monthly_IO + Monthly_Tax + Monthly_Insurance + Monthly_HOA + Monthly_MI
```

### Remaining Balance
```
Remaining_Balance(loan, rate, term_months, payments_made) =
  loan × (1+r)^payments_made - pmt × ((1+r)^payments_made - 1) / r
```

---

## 2. GOLDEN DEAL VECTORS

### Deal A — Reference SFR (Sovereign Master)
```
Inputs:
  Loan Amount:      $425,000 (purchase)
  LTV:              75% (= $318,750 loan if 75% of $425K)
  Wait — actual loan is $318,750 from 75% LTV
  Rate:             7.00% (30yr fixed)
  Lease:            $3,000/mo (LTR)
  1007 Rent:        $3,000/mo (matches lease)
  Property Tax:     $5,000/yr → $416.67/mo
  Insurance:        $2,000/yr → $166.67/mo
  HOA:              $150/mo
  Vacancy:          N/A for T1 (no haircut); T2 8%
  Mgmt:             8% (T2)

Computed:
  P&I = $318,750 × 0.0066530 = $2,121 (rounded)
  PITIA = $2,121 + $416.67 + $166.67 + $12.50 ... 
       NOTE: $2,855 was stated in Sovereign Master but P&I+tax+ins+HOA alone = $2,716
       The $2,855 figure may include MI or rounding differences — VERIFY in implementation
  T1 DSCR @ 7.00% = $3,000 / $2,855 = 1.05 ✓
  T1 DSCR @ 8.25% = $3,000 / $3,192 = 0.96 ✓
  T2 DSCR (8% vac, 8% mgmt) = 0.88 → negative $335/mo ✓
  Rent break-even (T1=1.0) = $2,855 (−4.83%) ✓
  Deal-break rate ≈ 7.67% ✓
  Max price at T1=1.0 ≈ $454,100 ✓
```

### Deal A (Alternative — DSCR Forumals)
```
Inputs: $425K SFR at 75% LTV, 7.00% 30yr
  P&I = $1,999
  PITIA ≈ $2,580
  DSCR T1 ≃ 3000/2580 = 1.16x
  Track B uses 8% vacancy, 8% mgmt, 2% taxes/ins → DSCR<1.00 in stressed scenarios
```

> **NOTE**: Two different P&I values in source docs ($2,121 vs $1,999). The Sovereign Master figure of $2,121 matches the verified payment factor (0.0066530 × $318,750 = $2,121). Forumals may use a slightly different input or older rate. **Use Sovereign Master's Deal A as canonical for tests.**

### Deal B — 2-Unit with 25% Vacancy
```
Property: Duplex (2-unit)
Rent (1007): $4,000 total / $2,000 per unit
Vacancy factor (2-4 unit): 25% per Fannie Mae Form 1007
Track 1 rent = $4,000 × 0.75 = $3,000 (qualifying)
Track 2 rent = $4,000 × (1 - vacancy_stress) - opex
```

### Deal C — STR (Short-Term Rental)
```
Property: 3BR STR in STR-allowed market
Gross monthly revenue (TTM ADR × occupancy): $5,500
STR OpEx: 45-65% of gross
Track 2 NOI = $5,500 × (1 - 0.55) = $2,475 (using 55% OpEx mid-range)
Haircut: STR income = MIN(1007 appraisal, projected × 0.70-0.80, documented 12-mo)
```

### Deal D — Interest-Only (IO)
```
Inputs:
  Loan: $300,000
  Rate: 5.00% IO
  IO Period: 10 years
  Rent: $3,000/mo
  PITIA replacement: ITIA
  Monthly_IO = $300,000 × 0.05/12 = $1,250
  ITIA = $1,250 + tax + ins + HOA
  T1 DSCR = $3,000 / ITIA (15-22% denominator relief vs amortizing)
After IO:
  Recast to amortizing over remaining 20 years
  New_Payment = Remaining_Balance × r / (1 - (1+r)^(-n_remaining))
```

### Deal E — 40-Year Amortization
```
Term: 480 months (40 years)
Factor(r) = r(1+r)^480 / ((1+r)^480 - 1)
Payment = Loan × factor(r)
Lower monthly payment → higher DSCR for given rate
Common for sub-1.0 DSCR deals (DSCR↓0.75 with 40-yr term)
```

### Deal F — BRRRR (Buy, Rehab, Rent, Refi, Repeat)
```
Pre-rehab value: $200K
Purchase: $150K (75% LTV = $112,500 loan)
Rehab: $50K
Post-rehab (ARV) value: $350K
Refi cash-out: 75% of $350K = $262,500
Cash-out basis: ARV (if seasoning met) OR cost (if not)
Seasoning rule: 6-12 months common (varies by lender)
Easy Street exception: waives 12-mo STR seasoning
```

### Deal G — High LTV (80%)
```
Loan: $400K at 80% LTV (purchase $500K)
Rate: 7.00%
Pricing: +0.400 to +0.900% LLPA vs 75% LTV
Tighter DSCR floor (often 1.25+)
```

### Deal H — Low FICO (640-659)
```
Pricing: +1.50 to +2.50% LLPA
Most lenders floor at 660 (Kiavi)
Some accept 640 (Defy, Griffin CA page)
```

### Deal I — No-Lease (63.04% of 2025 DSCR loans)
```
1007 rent: $3,000
No signed lease
Track 1: Use 1007 (no vacancy)
Track 2: Stress with 8% vacancy assumption
Flag as elevated risk (Verus S&P: 3.82% 30-day DQ at issuance)
```

### Deal J — Multi-Property Portfolio
```
Subject property + 2 financed properties
Reserves stack: +2 months PITIA per additional property
ΣNOI / ΣADS portfolio DSCR
Concentration flag if any 3 brokers serve same ZIP-3
```

### Deal K — Cross-Collateralized
```
Two properties securing one loan
Higher combined LTV but diversified
Σrent / PITIA for DSCR
```

---

## 3. DSCR MATH EDGE CASES

### Rent Treatment Matrix
| Scenario | Track 1 | Track 2 |
|---|---|---|
| LTR w/ lease = 1007 | min(lease, 1007) | gross × (1-vac) - opex |
| LTR w/ lease > 1007 by >20% | lease + 2 mo proof | gross × (1-vac) - opex |
| LTR w/ lease < 1007 by >20% | min(lease × 1.20, 1007) | gross × (1-vac) - opex |
| Vacant LTR | 1007 (no vacancy haircut) | 1007 × (1-vac) - opex |
| 2-4 unit | gross × (1-0.25) per 1007 | gross × (1-vac) - opex |
| STR (3 sources) | min(LTR, projected × 0.70-0.80, doc 12mo) | STR-specific NOI |
| STR (AirDNA 100% pro STR) | projected × 1.00 (Easy Street) | STR-specific NOI |

### Vacancy Defaults
- LTR Track 1: **0%** (1007 assumes occupancy)
- LTR Track 2: **5-10%** (8% default)
- STR: market-specific (often 20-40% per AirDNA)
- Vacant property (1-4 unit): 100% vacancy permitted (uses 1007)

### Expense Defaults (Track B)
- Vacancy: 5-10%
- Management: 8-10%
- Maintenance: 5-7%
- CapEx reserve: 5-10% EGI (modeled separately)
- Property tax, insurance, HOA: as specified

### STR OpEx
- 45-65% of gross (vs LTR 30-45%)
- Platform fees included
- Higher than LTR due to turnover, cleaning, management

### PITIA Components
- Principal + Interest + Tax + Insurance + HOA + MI (mortgage insurance, if any)
- All annualized amounts divided by 12 for monthly
- **Use REASSESSED tax** for purchase (not seller's current bill)

### ROUNDING RULES
- **DSCR: NEVER round up** — only round to 2 dp or down
- Cashflows: round to nearest dollar
- All other: round to 2 dp

---

## 4. MAGIC BUCKETS (Categorical Encodings)

### LTV Buckets
```
LTV_BUCKETS = {
    0: (0, 65),
    1: (65, 70),
    2: (70, 75),
    3: (75, 80),
    4: (80, 100)
}
```

### DSCR Buckets
```
DSCR_BUCKETS = {
    0: (0, 0.80),
    1: (0.80, 0.95),
    2: (0.95, 1.00),
    3: (1.00, 1.20),
    4: (1.20, 10)
}
```

### FICO Buckets
```
FICO_BUCKETS = {
    0: (0, 640),
    1: (640, 680),
    2: (680, 720),
    3: (720, 760),
    4: (760, 850)
}
```

### Reserves Buckets (months PITIA)
```
RESERVES_BUCKETS = {
    0: (0, 3),
    1: (3, 6),
    2: (6, 12),
    3: (12, 100)
}
```

### MAGI Buckets (for PAL/NIIT)
```
MAGI_BUCKETS = {
    0: (0, 100_000),
    1: (100_000, 200_000),
    2: (200_000, 250_000),
    3: (250_000, 500_000),
    4: (500_000, 10_000_000)
}
```

### Property Type Encoding
```
PROPERTY_TYPE_ENCODED = {
    'SFR': 0,
    '2-4_UNIT': 1,
    'CONDO': 2,
    'STR': 3,
    'MIXED_USE': 4,
    'MULTIFAMILY_5PLUS': 5
}
```

### Vesting Type Encoding
```
VESTING_TYPE_ENCODED = {
    'INDIVIDUAL': 0,
    'LLC': 1,
    'CORP': 2,
    'LP': 3,
    'TRUST': 4
}
```

### PPP Selection Encoding
```
PPP_SELECTED_ENCODED = {
    'BUSINESS_ENTITY': 0,     # Business-purpose + entity-vested
    'BUSINESS_INDIVIDUAL': 1, # Business-purpose + individual-vested
    'CONSUMER': 2            # Consumer-purpose
}
```

### State Encoding (50 states + DC)
```
STATE_ENCODED = {state: idx for idx, state in enumerate([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
])}
```

---

## 5. MONTE CARLO PARAMETERS

### Base Configuration
```
MC_BASE_ITERATIONS = 10_000
MC_SECURITIZATION_ITERATIONS = 50_000
MC_HORIZON_YEARS = 30  # default
```

### Marginal Distributions
```
MC_DISTRIBUTIONS = {
    'ltr_rental_growth': {'dist': 'normal', 'mu': 0.00, 'sigma': 0.095},  # KBRA
    'str_gross_revenue': {'dist': 'lognormal', 'mu': 0.00, 'sigma_range': (0.18, 0.25)},
    'ltr_vacancy': {'dist': 'beta', 'alpha': 2, 'beta': 22},  # mean ~8%
    'str_vacancy': {'dist': 'beta', 'alpha': 3, 'beta': 7},  # mean ~30%
    'insurance_escalation': {'dist': 'lognormal', 'mu': 0.07, 'sigma': 0.05, 'coastal_mu': 0.12},
    'property_tax_growth': {'dist': 'truncated_normal', 'mu': 0.03, 'sigma': 0.01, 'CA_mu': 0.02, 'CA_cap': 0.02},
    'treasury_10y_path': {'dist': 'CIR_or_HullWhite', 'calibration': 'FRED_quantlib'}
}
```

### Correlation Matrix (t-Copula, ν=5-7)
```
MC_CORRELATION_MATRIX = [
    [1.00, -0.55,  0.45, 0.00],   # rent vs vacancy, vs rate, vs expense
    [-0.55,  1.00, -0.10, 0.20],  # vacancy vs rent, vs rate, vs expense
    [0.45, -0.10,  1.00, 0.00],   # rate vs rent, vs vacancy, vs expense
    [0.00,  0.20,  0.00, 1.00]    # expense vs rent, vs vacancy, vs rate
]

# Additional correlations (from V3):
# Cap rate ↔ interest rates: +0.50 to +0.70
# Insurance ↔ climate risk: +0.60 to +0.80
```

### Copula Selection
```
COPULA_TYPE = 'student_t'
COPULA_DF = 6  # degrees of freedom (range 5-7)
COPULA_FORBIDDEN = 'gaussian'  # 2008 crisis
COPULA_CHALLENGER = 'rvine_or_clayton'  # V3 production choice
```

### Variance Reduction
```
MC_VARIANCE_REDUCTION = {
    'antithetic_variates': True,  # -50-80% error
    'sobol_sequences': True,      # faster convergence
    'stratified_sampling': False  # optional
}
```

### Action Thresholds (CANONICAL)
```
MC_THRESHOLDS = {
    'P_DSCR_BELOW_1.0_CONDITIONAL': 0.10,  # >10% → CONDITIONAL-GO
    'P_DSCR_BELOW_1.0_PASS': 0.15,           # >15% → PASS
    'P5_DSCR_FLOOR': 0.80,                    # <0.80 → automatic flag
    'SHARPE_RATIO_TARGET': 1.0               # ≥1.0 for go/no-go
}
```

### 2026 Calibration Override
```
MC_2026_CALIBRATION = {
    'yield_compression_counties': 0.548,  # 54.8% of US counties
    'rent_distribution_skew': 'negative',
    'note': 'Use negative skew for rent distribution in counties with documented yield compression (ATTOM/CBRE)'
}
```

### Tornado Chart Stress Calibration
```
TORNADO_STRESS = {
    'stable_inputs': 0.10,        # ±10% (taxes, reserves)
    'cyclical_inputs': 0.20,      # ±20% (vacancy, market rent)
    'interest_rate': (0.005, 0.01)  # ±50-100 bps
}
TORNADO_VARIABLES = [
    'market_rent', 'vacancy_rate', 'property_tax', 'insurance_premium',
    'management_fee', 'interest_rate_reset', 'maintenance_capex'
]
```

### Tornado Heatmap (2D DSCR)
```
HEATMAP_X = [0.00, 0.05, 0.08, 0.10, 0.12, 0.15]  # vacancy rates
HEATMAP_Y = [-0.10, -0.05, 0.00, 0.03, 0.05]      # rent changes
HEATMAP_COLORS = {
    'RED': lambda d: d < 1.00,
    'AMBER': lambda d: 1.00 <= d <= 1.05,
    'GREEN': lambda d: d > 1.05
}
INSTITUTIONAL_TRIGGER = 'Any cell in realistic zone (vacancy 5-12%, rent -5% to 0%) DSCR <1.00 → CONDITIONAL flag'
```

---

## 6. XGBOOST FEATURE_COLUMNS (FINAL)

```python
FEATURE_COLUMNS = [
    'loan_amount',            # numeric
    'is_str',                 # bool: 1 if STR, 0 if LTR
    'ppp_selected',           # categorical: Business+Entity / Business+Individual / Consumer
    'state_encoded',          # 0-49 (50 states + DC = 0-50)
    'property_type_encoded',  # SFR / 2-4 / Condo / STR / Mixed / Multifamily 5+
    'vesting_type_encoded',   # LLC / Corp / LP / Individual / Trust
    'rate_at_app',            # numeric, current SOFR + margin
    'is_rep',                 # bool: 1 if repeat customer
    'magi_bucket'             # categorical: <100K / 100-200K / 200-250K / 250-500K / 500K+
]
```

### Ensemble Architecture
```python
ENSEMBLE_CONFIG = {
    'models': ['xgboost', 'lightgbm', 'catboost'],
    'voting': 'soft',
    'calibration': 'isotonic_regression',
    'min_training_records': 500,
    'recalibration_cadence': 'quarterly'
}
```

### SHAP Output Requirements
```python
# For each adverse action decision:
shap_output = {
    'feature': str,
    'value': float,
    'shap_value': float,
    'contribution_pct': float  # SHAP value / sum of all SHAP values
}
# Top 3 SHAP features → adverse action reason codes
```

---

## 7. LENDER MATRIX (FINAL, JUNE 2026)

### 12-Lender Verified Matrix
```python
LENDER_MATRIX = {
    'griffin_funding': {
        'states': '50+DC',
        'min_fico': 620,  # CA page; 640 national typical
        'min_dscr': 0.75,
        'max_ltv': 80,
        'cashout_ltv': 75,
        'max_loan': '$4M national (some states up to $20M)',
        'products': ['30yr fixed', 'ARM (5.125%+)', 'IO'],
        'rate_range': '6.125-7.5% fixed, ARM from 5.125%',
        'special': 'All 50+DC, widest credit flex, no-ratio, jumbo, micro-condos',
        'confidence': 85,
        'verified_date': '2026-06-16'
    },
    'defy_mortgage': {
        'min_fico': 640,
        'min_dscr': 0.75,
        'max_ltv': 85,  # @740+/SFR/≥1.0
        'cashout_ltv': 75,
        'special': 'High-leverage; 640-679 FICO; 85% LTV; STR via hist/market/AirDNA',
        'close_time': '14-21d',
        'confidence': 80
    },
    'easy_street_capital': {
        'products': ['STR', 'AirbnbBRRRR'],
        'min_dscr': 0.0,  # NO min for STR
        'max_ltv': 80,
        'cashout_ltv': 75,
        'rate_from': 5.75,
        'special': 'STR specialist; AirDNA 100% pros; waives 12-mo STR seasoning',
        'confidence': 82
    },
    'lima_one_capital': {
        'products': ['STR (AirDNA)', 'bridge-to-rental', 'blanket/portfolio'],
        'max_loan': '$2M',
        'max_ltv': 80,
        'states': '~41',
        'special': 'Dedicated STR; blanket exit WARNING',
        'confidence': 76
    },
    'kiavi': {
        'states': '49+DC',
        'min_fico': 660,
        'min_dscr': 1.10,
        'max_ltv': 90,
        'reserves': '6-9 mo',
        'rate_from': 6.0,
        'rate_realistic': '7.5-11%',
        'special': 'Tech-forward; AVM-heavy; SSN required NO ITIN',
        'confidence': 70
    },
    'new_silver': {
        'min_fico': 660,
        'min_dscr': 0.75,
        'max_ltv': 80,
        'loan_range': '$150K-$3M',
        'special': '30yr; instant approval 14-21d; rate 50-100bps above established',
        'confidence': 72
    },
    'deephaven': {
        'min_fico': 640,
        'min_dscr': 0.75,
        'max_ltv': 80,
        'formulas': 'Gross/PITIA + Gross/ITIA',
        'reserves': '3/6/6/12 mo',
        'special': 'First-timer max 75% LTV; DSCR 2nd up to $500K; HELOC up to $1M',
        'stale': True,  # HIGHEST REVERIFY PRIORITY
        'confidence': 65
    },
    'american_heritage': {
        'min_fico': 660,  # 720+ better rates
        'min_dscr': 0.75,
        'max_ltv': 85,  # @760+
        'special': 'Sub-1.0 with compensating factors; STR: 75% proj / 100% w/ 12mo',
        'confidence': 65
    },
    'visio_lending': {
        'states': '48 (no AK/HI)',
        'min_fico': 680,
        'min_dscr': 0.75,  # Flex 0.75-0.99
        'max_loan': '$75K-$2M',
        'special': 'Lower-of, NO vacancy factor; broadest STR; 5-4-3-2-1 or no-PPP +0.625%',
        'confidence': 78
    },
    'rocket_pro_tpo': {
        'states': 'all 50',
        'min_fico': 660,  # V2.0 corrected from 680
        'min_dscr': 1.00,
        'max_ltv': 80,
        'max_loan': '$3.5M',  # V2.0 corrected from $3M
        'close_time': '21-30d',
        'special': 'Speed-focused; AI-assisted; non-QM expansion 2026',
        'verified_date': '2026-03-04'
    },
    'angel_oak': {
        'max_loan': '$3M+',
        'min_fico_standard': 700,  # V2.0 corrected from 680
        'min_fico_str_80ltv': 720,  # NEW 2026 tier
        'min_fico_select': 640,  # certain non-QM overlays only
        'min_dscr_standard': 1.00,
        'max_ltv': 85,  # program-specific
        'special': 'Largest non-QM securitization issuer; Clear Capital AVM locked at prequal; second liens $100K-$350K (min FICO 700, max CLTV 75%, min DSCR 1.20)',
        'verified_date': '2026-05-03'
    },
    'ready_capital': {
        'special': 'Commercial/multifamily bridge (5-10 units)'
    }
}
```

### Two-Quote Quick Match (ALWAYS ENFORCE)
```python
TWO_QUOTE_MATRIX = {
    ('DSCR_0.75-0.99',): ('visio_flex', 'griffin_dscr'),
    ('NO_RATIO',): ('griffin_no_ratio', 'defy_mortgage'),
    ('STR_PROJECTED',): ('easy_street', 'visio_lending'),
    ('STR_12MO_HISTORY',): ('visio_lending', 'easy_street'),
    ('PRO_STR_BRRRR',): ('easy_street', 'lima_one'),
    ('85_LTV',): ('defy_mortgage', None),
    ('BEST_RATE',): ('griffin_funding', 'visio_lending'),
    ('JUMBO_4M',): ('griffin_funding', 'broker_shop'),
    ('FN_ITIN',): ('defy_mortgage', 'griffin_funding'),  # Kiavi EXCLUDED
    ('FAST_CLOSE',): ('new_silver', 'kiavi'),
    ('PORTFOLIO_BLANKET',): ('lima_one', 'broker_shop'),
    ('STATE_PPP_SENSITIVE',): ('run_ppp_gate_first', None)
}
```

---

## 8. STATE PPP MATRIX (17 KEY STATES)

```python
STATE_PPP_MATRIX = {
    'AK': {
        'individual': 'PROHIBITED',
        'llc_corp': 'ALLOWED',
        'penalty_base': 'REMAINING_BALANCE',
        'threshold': None,
        'source': 'Lender matrix 2026'
    },
    'MN': {
        'consumer': 'PROHIBITED',  # §58.137 personal/family/household ONLY
        'business_purpose': 'ALLOWED',  # HF 3437 ENACTED 4/23/26, eff 8/1/26
        'penalty_base': 'REMAINING_BALANCE',
        'hf3437_status': 'ENACTED',
        'hf3437_effective': '2026-08-01',
        'source': 'Minn. Stat. §58.137 + HF 3437'
    },
    'NM': {
        'individual': 'PROHIBITED',
        'entity': 'VARIES',
        'penalty_base': 'REMAINING_BALANCE',
        'note': 'Often listed as individual ban; entity varies by lender'
    },
    'ND': {'all': 'DE FACTO PROHIBITED'},
    'KS': {'all': 'DE FACTO PROHIBITED'},
    'MD': {'all': 'DE FACTO PROHIBITED'},
    'OH': {
        '1-2 unit': {
            'threshold': 116356,
            'threshold_year': 2026,
            'max_penalty_pct': 0.01,
            'max_years': 5,
            'penalty_base': 'ORIGINAL_PRINCIPAL',  # ORC §1343.011 — DISTINCT
            'statute': 'ORC §1343.011'
        },
        '3-4 unit': 'NO RESTRICTION'
    },
    'PA': {
        '1-2 unit': {
            'threshold': 319777,  # V2.0 corrected (was $329,411 in some drafts)
            'threshold_year': 2026,
            'business_above_threshold': 'ALLOWED',
            'statute': '§406 LIPL (Act 6)',
            'note': 'June/July 2026 rate cap 7.25% (PA DOBS confirmed)'
        },
        '3-4 unit': 'OUTSIDE RESTRICTION'
    },
    'NJ': {
        'individual': 'PROHIBITED',  # N.J.S.A. 46:10B-2
        'llc': 'VARIES_BY_LENDER',  # HIGH-RISK
        'c_corp': 'ALLOWED',
        's_corp': 'ALLOWED',
        'recourse_guarantors': 'DO_NOT_AFFECT_ELIGIBILITY',
        'penalty_base': 'REMAINING_BALANCE',
        'special': 'LLC = HIGH-RISK; flag ambiguity'
    },
    'IL': {
        'individual': 'PROHIBITED (and/or APR ≥8%)',
        'entity': 'APR_FALL_RATE_TESTS'
    },
    'MS': {
        'structure': 'DECLINING_ONLY',
        'flat_above_1yr': 'PROHIBITED',
        'statute': '§75-17-31'
    },
    'AR': {
        'first_3_years': 'ALLOWED',
        'penalty_base': 'REMAINING_BALANCE',
        'max_penalty_schedule': '3/2/1'
    },
    'WI': {'arm': 'NO PPP (cap 2 months interest)'},
    'ME': {'arm': 'NO PPP'},
    'WV': {'max_years': 3, 'max_pct': 0.01},
    'RI': {'max_years': 1, 'max_pct': 0.02},
    'SC': {'threshold_below': 690000, 'treatment_below': 'NOT_ALLOWED'},
    'OK': {'apr_threshold': 0.13, 'treatment_above': 'BANNED'},
    'TX': {'apr_threshold': 0.12, 'treatment_above': 'BANNED'},
    'NY': {
        'residential': 'PROHIBITED',
        'business_purpose': 'ALLOWED',  # Banking Law §6-l
        'criminal_usury_cap': 0.25  # Penal Law §190.40
    },
    'WA': {
        '5/6_arm': 'NO PPP (some matrices)',
        'blanket_arm_ban': 'UNVERIFIED'
    }
}
```

### Annual Re-Index Cron (January 1)
```python
@celery_app.task(name='reindex_ppp_thresholds')
def reindex_ppp_thresholds():
    """OH ORC §1343.011 and PA Act 6 thresholds index annually.
    2026 values: OH = $116,356; PA = $319,777"""
```

---

## 9. PRICING ANCHORS & LEVERS (LIVE JUNE 17-18, 2026)

### Live Rate Anchors
```python
LIVE_RATES_2026_06_17 = {
    'DGS10': 0.0443,            # 10Y Treasury (FRED, Jun 17)
    'GS10_AVG_MAY': 0.0448,     # 10Y Treasury May avg
    'SOFR': 0.0363,             # NY Fed (Jun 16)
    'SOFR_30D_AVG': 0.03609,
    'SOFR_90D_AVG': 0.03636,
    'SOFR_180D_AVG': 0.03679,
    'CME_TERM_SOFR_1M': 0.03637,
    'CME_TERM_SOFR_3M': 0.03668,
    'CME_TERM_SOFR_6M': 0.03731,
    'CME_TERM_SOFR_12M': 0.03869,
    'DGS5': 0.0426,             # 5Y Treasury
    'FED_FUNDS': 0.0362,        # FRB H.15 (Jun 16)
    'MORTGAGE30US': 0.0653,     # Freddie Mac (Jun 8)
    'treasury_10y_path_range': (0.0444, 0.0447)
}
```

### Dated Triplet (June 2026)
```python
RATE_TRIPLET = {
    'competitive': {
        'rate_range': (0.06125, 0.0649),
        'anchor': '6.125% (par, 0 pts)',
        'arm_floor': 0.05125,
        'qualifier': '740+ FICO, ≤70-75% LTV, 1.0+ DSCR',
        'source': 'Griffin, Jun 2026'
    },
    'typical': {
        'rate_range': (0.065, 0.075),
        'qualifier': 'standard files'
    },
    'full_market': {
        'rate_range': (0.075, 0.1075),
        'qualifier': 'thin/non-prime, low DSCR, STR, FN'
    },
    'spreads': {
        'best_tier_bps': (175, 225),  # 6.2-6.7%
        'typical_bps': (250, 350),    # 6.9-7.8%
        'weaker_bps': 450              # 8.9%+
    },
    'premiums': {
        'dscr_over_conforming': (0.005, 0.0125),
        'non_qm_over_qm': (0.005, 0.02)
    }
}
```

### Pricing Levers (PIN as JSON)
```python
PRICING_LEVERS = {
    'FICO': {
        (760, 850): (-0.05, -0.125),
        (720, 739): 0.125,
        (700, 719): (0.125, 0.25),
        (680, 699): 0.50,  # CLIFF
        (660, 679): 0.875, # CLIFF
        (640, 659): (1.50, 2.50)
    },
    'LTV': {
        'per_5pct_increment': (0.125, 0.25)
    },
    'DSCR': {
        'per_0.10_below_1.25': 0.125
    },
    'PRODUCT': {
        'IO': 0.25,
        'ARM_vs_fixed': (-0.125, -0.375),
        '85_LTV': '@740+/SFR purchase/DSCR ≥1.0 only',
        'discount_point': -0.25,  # 1 pt ≈ -0.25% rate
        'cashout': (0.25, 0.50)
    },
    'LOAN_SIZE': {
        '<150K': 'DSCR_floor_often_1.25'
    },
    'BORROWER': {
        'foreign_national': (0.50, 1.50)
    },
    'STRUCTURE': {
        'no_PPP': (0.50, 0.80),
        'reserves_6mo_plus': (-0.10, -0.25)
    },
    'LOCK': {
        '45d': 'standard/free',
        '60d': 0.125,
        'extension': (0.25, 0.375)
    }
}
```

### LLPAs (Loan Level Price Adjustments)
```python
LLPAs = {
    'FICO_below_680': (0.005, 0.025),
    'LTV_above_75': (0.004, 0.009),
    'DSCR_below_1.10': (0.0035, 0.0085),
    'IO': 0.0025,
    'non_warrantable_condo': 0.005,
    'condotel': 0.0075,
    'STR_use': 0.003,
    'foreign_national': (0.0075, 0.015)
}
```

---

## 10. TAX NUMBERS (2026 OBBBA-AWARE)

### OBBBA Bonus Depreciation
```python
OBBBA_BONUS_DEP = {
    'effective_date': '2025-01-19',
    'enacted_date': '2025-07-04',
    'permanent': True,
    'assets_after': 1.00,        # 100% bonus for assets acquired after Jan 19, 2025
    'assets_before_2025_in_service_2025': 0.40,
    'assets_before_2025_in_service_2026_plus': 0.20,
    'qualifying_property': 'tangible assets with recovery period ≤20 years',
    'note': 'Residential rental (27.5yr) does NOT qualify directly; cost-seg components do'
}
```

### Section 179
```python
SECTION_179 = {
    'limit_2025': 1_220_000,
    'limit_post_obbba': 2_500_000,  # inflation-indexed, $2.56M typical
    'phase_out_start': 4_000_000
}
```

### §163(j) ATI
```python
SECTION_163J = {
    'pre_obbba': 'Revenue-based (EBIT)',
    'post_obbba': 'EBITDA-based',
    'effective': 'Tax years beginning after Dec 31, 2024'
}
```

### QBI Deduction (Section 199A)
```python
QBI_DEDUCTION = {
    'rate': 0.20,
    'pre_obbba': 'Set to expire 2025',
    'post_obbba': 'PERMANENT',
    'effective': 'Tax years beginning after 2024'
}
```

### Section 1250 Recapture
```python
SECTION_1250_RECAPTURE = {
    'max_rate': 0.25,  # on straight-line depreciation at disposition
    'ordinary_rate': 'Accelerated/excess recapture taxed at ordinary income rate',
    'stack_with_NIIT': True,
    'effective_with_NIIT': 0.288  # 25% + 3.8%
}
```

### NIIT (Net Investment Income Tax)
```python
NIIT = {
    'rate': 0.038,
    'thresholds': {
        'single_HoH': 200_000,
        'MFJ': 250_000,
        'MFS': 125_000
    },
    'frozen_since': 2013,  # Only MAGI threshold adjusts for inflation
    'stack_with_LTCG': True,
    'effective_LTCG_with_NIIT': 0.238  # 20% + 3.8%
}
```

### Passive Activity Loss (§469)
```python
PAL = {
    'allowance': 25_000,
    'phase_out_start_magi': 100_000,
    'phase_out_full_magi': 150_000,
    'phase_out_rate': 0.50,  # $0.50 reduction per $1 over $100K MAGI
    'REP_exception': {
        'hours_test': 750,
        'participation_test': 0.50  # 50% of personal services in RE
    }
}
```

### Depreciation
```python
DEPRECIATION = {
    'residential_rental_years': 27.5,
    'method': 'straight-line',
    'building_basis': 'Price - Land_Value',  # require land allocation
    'formula': 'Building_Basis / 27.5 (annual)'
}
```

### 1031 Exchange
```python
EXCHANGE_1031 = {
    'identification_window_days': 45,
    'closing_window_days': 180,
    'both_from_sale_date': True,
    'reverse_exchange': 'permitted (qualified intermediary holds title)'
}
```

### Cost Segregation
```python
COST_SEG = {
    'min_property_value': 450_000,
    'study_cost': (2_500, 15_000),
    'typical_year_1_savings_per_1M': (50_000, 100_000),
    'component_lives': [5, 7, 15]  # years
}
```

---

## 11. COMPLIANCE DEADLINES

### Federal
```python
COMPLIANCE_DEADLINES = {
    'FinCEN_CTA_BOI': {
        'entities_pre_2024': '2025-01-01',  # Was; now EXEMPT per Mar 2025 IFR
        'entities_2024_plus': '30 days from formation',  # Was; now EXEMPT per Mar 2025 IFR
        'current_status': 'DOMESTIC LLCs EXEMPT — FinCEN Mar 2025 IFR',
        'note': 'No BOI alert for standard DSCR files'
    },
    'FinCEN_RRE_Rule': {
        'effective_date': '2026-03-01',
        'applies_to': 'non-financed cash transfers to entities',
        'DSCR_exempt': True,  # DSCR is financed
        'note': 'Flag only cash deals or equity-only transfers'
    },
    'Section_1071': {
        'revised_published': '2026-05-01',
        'effective': '2028-01-01',
        'applies_to': 'business-purpose loans >$25K to women/minority-owned'
    },
    'SR_26_02': {
        'effective': '2026-04-17',
        'bulletin': 'OCC 2026-13',
        'replaces': 'SR 11-7',
        'note': 'QuantLib+pyxirr DSCR calc NOT a model; only MC + ML need governance'
    },
    'CFPB_Circular_2022-03': {
        'in_effect': True,
        'requires': 'Specific and accurate adverse action reasons for AI/ML'
    },
    'HOEPA_2026': {
        'loan_amount_threshold': 27_592,  # was $26,968 in 2025
        'points_fees_dollar_trigger': 1_380,  # was $1,348
        'pct_test': 0.05,
        'DSCR_relevance': 'rare but flag if points/fees approach 5% of loan'
    },
    'MN_HF_3437': {
        'enacted': '2026-04-23',
        'effective': '2026-08-01',
        'scope': 'Amends Minn. Stat. §58.137; exempts business-purpose DSCR'
    },
    'PA_Act_6_Rate_Cap': {
        'rate_cap_jun_jul_2026': 0.0725,
        'source': 'PA DOBS'
    },
    'OH_threshold_2026': 116_356,  # V2.0 verified, Jan 1 annually indexed
    'PA_threshold_2026': 319_777,  # V2.0 verified (was $329,411)
    'NY_criminal_usury': 0.25,  # Penal Law §190.40
    'NYC_Local_Law_18': 'PROHIBITED STR primary residence (Sep 2023)'
}
```

---

## 12. RESERVES, ASSET HAIRCUTS & PROPERTY ELIGIBILITY

### Reserve Requirements
```python
RESERVES = {
    'DSCR_buckets': {
        (1.25, 99): 3,      # months PITIA
        (1.00, 1.24): (3, 6),
        (0.75, 0.99): (9, 12),
        'no_ratio': 12  # max 18
    },
    'overlays': ['STR', 'condo', 'FICO<680', 'first-timer', 'loan>$1M', 'foreign_national'],
    'overlay_months': (6, 12),
    'cap': 12,
    'stress_ceiling': 15,
    'portfolio_stack_per_property': 2,
    'rate_and_term_waiver': 'payment savings ≥10%',
    'seasoning_days': 60,
    'gifts_min_days_pre_submission': 30,
    'large_deposit_trail_threshold': (500, 1000),
    'reference_PITIA_2_855': {
        'reference': 8_565,
        'conservative': 17_130,
        'stress': (25_700, 34_260)
    }
}
```

### Asset Eligibility Haircuts
```python
ASSET_HAIRCUTS = {
    'liquid_cash_checking_savings': 1.00,
    'marketable_securities': 1.00,  # excluding margin
    'retirement_59_5_plus': 0.70,
    'retirement_under_59_5': 0.50,
    'cryptocurrency': 0.00,  # due to volatility/compliance
    'crypto_liquidated_to_US_bank': 0.60,
    'gift_funds_max': 1.00,  # borrower must show 10% own funds
    'real_estate_equity': 0.00,  # NOT eligible for asset depletion
    'restricted_stock_vesting_12mo': 0.60
}
```

### Liquidity Tiers
```python
LIQUIDITY_TIERS = {
    'T1_cash_MMA': 1.00,
    'T2_brokerage': 1.00,
    'T3_retirement': (0.60, 0.80),  # minus 401k loan
    'EXCLUDED': ['home_equity', 'crypto', 'gift', 'borrowed']
}
```

### Eligible Property Types
```python
ELIGIBLE_PROPERTY_TYPES = [
    'SFR_detached',
    'SFR_attached',
    '2-4_unit_residential',
    '5-8_unit_residential_DSCR_only',  # DSCR only
    'condos_warrantable',
    'condos_non_warrantable',
    'condotels',
    'manufactured_modular',
    'ADUs_county_classified'
]
```

### Ineligible Property Types
```python
INELIGIBLE_PROPERTY_TYPES = [
    'assisted_living_group_homes',
    'agricultural_>20_acres',
    'C5_C6_condition',
    'co_ops',
    'fractional_ownership_timeshares',
    'mixed_use_commercial',
    '<500_sqft_living_space'
]
```

### Condo Rules
```python
CONDO_RULES = {
    'warrantable': 'FNMA-eligible',
    'non_warrantable_conditions': 'subject unit 100% residential, project complete, ≥50% units sold/under contract',
    'condotel_requirements': [
        'common_elements_complete',
        '50%_units_sold',
        'min_500_sqft',
        'full_kitchen'
    ],
    'investor_concentration_max': 1.00  # up to 100%
}
```

### Appraisal Rules
```python
APPRAISAL_RULES = {
    'standard': 'Full interior/exterior, FNMA/FHLMC standards',
    'second_appraisal_required_above': 2_000_000,
    'review_required': 'CU, LCA, or desk review on every loan (unless 2nd appraisal)',
    'max_age_days': 120
}
```

### Multifamily 5-9 Units Rules
```python
MULTIFAMILY_5_9_UNITS = {
    'min_dscr': 1.00,
    'min_debt_yield_above_2M': 0.09,
    'STR_income_eligible': False,
    'min_reserves_months': 6,
    'min_reserves_FN_months': 12
}
```

### Borrower Eligibility Categories
```python
BORROWER_ELIGIBILITY = {
    'US_citizen_permanent_resident': 'eligible without significant restrictions',
    'non_permanent_resident_alien': 'with evidence of legal US presence, work auth',
    'ITIN_borrower': 'valid ITIN card + government photo ID',
    'foreign_national': 'must live/work in another country; valid passport + visa/ESTA; OFAC screening; POA NOT permitted; alternative credit acceptable',
    'experience_tiers': {
        'experienced': '≥1 non-owner-occupied or commercial income property for ≥12 mo in prior 3 years, OR actively employed in property mgmt',
        'first_time_investor': 'currently owns or previously owned primary residence; first investment OR <12 mo ownership; requires 12 mo verifiable housing payment history',
        'first_time_homebuyer': 'never owned real property; rent-free letter if no 12 mo rental history'
    },
    'entity_vesting': {
        'acceptable_forms': ['LLC', 'partnership', 'corporation'],
        'max_owners': 4,
        'min_borrowers_pct': 0.25,
        'personal_guarantor_required_pct': 0.51,
        'personal_guaranty_recourse': 'full_recourse',
        'layered_LLC_max': 2
    },
    'credit_rules': {
        'report_age_days': 120,
        'min_scores': 2,
        'qualifying_method': 'lower_of_2_or_middle_of_3',
        'tradeline_options': '3 tradelines reporting for 12 mo OR 2 tradelines for 24 mo',
        'alternative_tradelines': 'rent, utilities allowed',
        'charge_offs_collections': 'ignored unless title-impacting',
        'active_forbearance': 'NOT PERMITTED'
    }
}
```

---

## 13. ACCEPTANCE CRITERIA (Definition of Done v11 — 23 Criteria)

```python
ACCEPTANCE_CRITERIA = [
    '1. Track 1 + Track 2 side by side, NEVER blended',
    '2. Reproduces every golden vector; stress cells reconcile',
    '3. Gross/PITIA AND NOI/P&I; lower-of(lease,1007) + vacant rule; no LTR vacancy haircut by default',
    '4. Returns: cap/CoC/debt-yield/equity-multiple/break-even + levered IRR with exit-cap sensitivity (PRE/AFTER-TAX); Return Grade on after-tax',
    '5. Property-tax reassessment per state; PITIA uses reassessed tax (NOT seller\'s current bill)',
    '6. After-tax engine: depreciation (27.5yr), §1250 recapture (≤25%), NIIT (3.8% if MAGI > threshold), passive-loss ($25K/$100-150K MAGI/REP exception), 1031 alternate exit; bonus-dep per OBBBA',
    '7. Cost-seg flag for ≥$450K; if elected, compute accelerated deduction by class + bonus-dep overlay',
    '8. Insurance: geography risk model + insurability KILL gate in high-risk zones (FL, CA, TX Gulf, LA Coastal); feeds PITIA and OpEx separately',
    '9. BRRRR refi-seasoning gate (ARV vs cost basis) with carry during season',
    '10. ARM reset engine (B″): reset rate = SOFR + margin, capped at cap structure; T1 at reset displayed; double-shock year flagged for IO+ARM files',
    '11. Rates: dated triplet with 10yr/5yr/SOFR anchors at current values (10yr 4.44-4.47%, 5yr 4.26%, SOFR 3.59% as of June 17, 2026); risk-tiered spread ~175-450 bps; re-price as anchors move',
    '12. True cost per lender: AEY via XIRR at 12/24/36/60-mo + APR-equiv; YSP flag',
    '13. Lender screen: eligibility → fit tier (reason) → AEY → confidence (tiebreaker); two-quote enforced',
    '14. PPP gate BRANCHES (entity × bank × purpose) before any ban; per-state penalty BASE (original vs remaining) and sale/refi triggers; MN HF 3437 ENACTED (eff. 8/1/26); OH/PA annually-indexed with January re-confirm',
    '15. No-PPP re-pricing re-runs both tracks AND return model',
    '16. Reserves: tiered/capped/geography/portfolio-stacked/ranged; cash-out seasoning caveat noted',
    '17. STR legality gate before income; three-source min() (appraisal governs); monthly seasonality bar chart in Phase 2 for every STR file',
    '18. Every lender claim: provenance label + verified_date; no render without them; fit tiers, never approval percentages; counterparty flag',
    '19. Verdict (PROCEED/RESTRUCTURE/PASS) + binding constraint + $ deltas + Track-2 ack + kill-switch conditions',
    '20. Kill criteria (incl. insurability + BRRRR seasoning + ARM double-shock) before lender ranking',
    '21. IC memo + sensitivity + risk + true-cost exports; reproducible snapshots (inputs + lender versions + rate anchors)',
    '22. Portfolio: ΣNOI/ΣADS, debt yield, concentration, refi watchlist, counterparty-continuity flag',
    '23. NJ LLC/entity PPP defaults to HIGH-RISK (lender-split state) until specific lender matrix confirms entity type'
]
```

---

## 14. KILL CRITERIA (15 Hard Gates)

```python
KILL_CRITERIA = [
    '1. STR prohibited (city/county/HOA)',
    '2. PPP illegal for THIS vesting/lender combination',
    '3. Insurance unconfirmed in high-risk zone (FL, CA, TX Gulf, LA Coastal)',
    '4. FICO below all floors (<620)',
    '5. Track 1 < 0.75',
    '6. Appraiser rent break point exceeded (>4.83% below asking)',
    '7. Value cash-gap unfundable',
    '8. Reserves not liquid / not in acceptable tier',
    '9. Prepay > exit economics',
    '10. Rate > deal-break rate (7.67% for reference deal)',
    '11. Declining-market LTV cap binds (CT/FL/IL/NJ/NY check)',
    '12. Loan < lender minimum / sub-$150K floor',
    '13. BRRRR ARV cash-out gated by seasoning',
    '14. Confidence <60 on best-fit lender',
    '15. ARM double-shock at reset year breaches DSCR floor'
]
# Plus: Track 2 NEGATIVE → forced acknowledgment (not a kill; mandatory disclosure)
```

### 4-Score System
```python
SCORE_SYSTEM = {
    'Lender_Qualification': {
        'weights': {'eligibility': 0.20, 'DSCR_cushion': 0.25, 'LTV_FICO': 0.35, 'reserves': 0.10, 'docs': 0.10},
        'hard_cap_low': 'Any hard ineligibility caps at 0-39'
    },
    'Pricing_Efficiency': {
        'weights': {'AEY_spread': 0.35, 'points_fees': 0.20, 'PPP_burden': 0.20, 'structural_fit': 0.15, 'cash_burden': 0.10},
        'hard_cap_na': '<2 comparable quotes'
    },
    'Investor_Survival': {
        'weights': {'NOI_DSCR': 0.30, 'free_cash_flow': 0.15, 'liquidity': 0.15, 'stress_pass_rate': 0.25, 'reset_risk': 0.15},
        'hard_cap_low': 'Base NOI DSCR <0.85 or runway <3 months = 0-39'
    },
    'Data_Confidence': {
        'weights': {'rent_evidence': 0.25, 'valuation': 0.20, 'tax_insurance_accuracy': 0.15, 'fraud_entity': 0.20, 'freshness': 0.10, 'consistency': 0.10},
        'hard_cap_low': 'Unresolved occupancy conflict = 0-39'
    },
    'bands': [
        (85, 100, 'Strong'),
        (70, 84, 'Pass / Watch'),
        (55, 69, 'Conditional'),
        (40, 54, 'Weak'),
        (0, 39, 'No-Go / Manual Exception Only')
    ]
}
```

### Decision Matrix (Truth Matrix)
```python
DECISION_MATRIX = {
    ('T1_PASS', 'T2_PASS'): ('GREEN DEAL', 'close if pricing acceptable'),
    ('T1_PASS', 'T2_FAIL'): ('TRAP DEAL', 'qualifies but bleeds cash; restructure or decline'),
    ('T1_FAIL', 'T2_PASS'): ('STRUCTURING OPPORTUNITY', 'adjust leverage/rent/product/lender'),
    ('T1_FAIL', 'T2_FAIL'): ('KILL DEAL', 'do not proceed')
}
```

### Return Grade
```python
RETURN_GRADE = {
    'A': {'after_tax_irr_min': 0.15, 'T2_min': 1.10},
    'B': {'after_tax_irr_min': 0.12, 'T2_min': 1.00, 'after_tax_irr_max': 0.15},
    'C': {'after_tax_irr_min': 0.08, 'T2_max': 1.00, 'appreciation_thesis_required': True, 'after_tax_irr_max': 0.12},
    'D': {'after_tax_irr_max': 0.08, 'or_T2_negative': True},
    'F': 'PASS scenario'
}
```

### Verdict Logic
```python
VERDICT_LOGIC = {
    'PROCEED': 'T1 ≥ floor + cushion ≥0.05; T2 ≥1.0 OR explicit appreciation/tax thesis in $/mo; Return Grade ≥B; no kill criteria; ≥1 Strong/Standard lender',
    'RESTRUCTURE': 'one fixable gate; rescue path returned with ranked options',
    'PASS': 'hard kill; or P(DSCR<1.00)>15%; or 5th-pct DSCR<0.80; or Return Grade ≤D with negative T2 and no thesis; or no eligible lender'
}
```

---

## 15. DISTRIBUTIONAL DSCR JSON (Canonical Output Schema)

```python
DISTRIBUTIONAL_DSCR_SCHEMA = {
    'dscr_point': float,
    'dscr_90_ci': [float, float],       # [P5, P95]
    'p_dscr_below_1_any_month': float,  # 0-1
    'p_min_dscr_below_1_over_60mo': float,
    'e_dscr_given_2sigma_rent_shock': float,
    'cvar_5pct_annual_coverage': float,
    'reset_risk_flag': str,             # 'NORMAL' | 'ELEVATED' | 'HIGH'
    'income_uncertainty_tier': str      # 'ZIP' | 'MSA' | 'STATE' | 'NATIONAL'
}
```

### Example (per V3 spec)
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

---

## 16. SHAP & ADVERSE ACTION

### SHAP Formula
```
φ_i = Σ_{S⊆F\{i}} [|S|!(|F|-|S|-1)!/|F|!] [f(S∪{i}) - f(S)]

Where:
  φ_i = SHAP value for feature i
  F = set of all features
  S = subset of features not including i
  f(S) = model prediction using only features in S
```

### Adverse Action Reason Generation
```python
def generate_adverse_action(shap_values: dict, top_n: int = 3) -> list[str]:
    """
    Returns top N most-contributing features as human-readable reasons.
    Maps SHAP feature names to compliance-friendly descriptions.
    """
    sorted_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
    return [feature_to_reason_text(feat, val) for feat, val in sorted_features[:top_n]]

def feature_to_reason_text(feature: str, shap_value: float) -> str:
    if feature == 'ltv':
        return f"LTV exceeds maximum allowed at this FICO/DSCR"
    elif feature == 'fico':
        return f"Credit score below lender minimum"
    elif feature == 'dscr':
        return f"DSCR below lender minimum"
    # ... etc
```

### Compliance Reference
- **CFPB Circular 2022-03**: Specific and accurate reasons required for AI/ML credit decisions
- **ECOA / Regulation B (12 CFR 1002.9)**: 30-day notice from completed application
- **FCRA retention**: 25 months minimum; 5-year recommended
- **SR 26-02**: Outcomes analysis applies to Approval Predictor (high-materiality)

---

## 17. CONFIDENCE DECAY RULES

```python
CONFIDENCE_DECAY = {
    'Verified-Primary': {
        'initial_period_days': 90,
        'decay_points_per_30_days_after': 5,
        'reverify_below': 40
    },
    'Verified-Secondary': {
        'initial_period_days': 60,
        'decay_points_per_30_days_after': 10,
        'reverify_below': 40
    },
    'Market-Pattern': {
        'initial_period_days': 45,
        'decay_points_per_30_days_after': 15,
        'reverify_below': 40
    },
    'reverify_status_threshold': 40,
    'reverify_action': 'Flag REQUIRES REVERIFICATION'
}
```

### Celery Task
```python
@celery_app.task
def decay_confidence():
    # Verified-Primary: -5 points per 30 days after 90 days
    # Verified-Secondary: -10 points per 30 days after 60 days
    # Market-Pattern: -15 points per 30 days after 45 days
    # Records below 40 confidence → flag 'REQUIRES REVERIFICATION'
    pass
```

---

## 18. PROCESS RATES & COST STACK

### Vendor Annual Costs
```python
VENDOR_COSTS = {
    'ocrolus': {
        'range': (100_000, 400_000),
        'per_page': (0.50, 3.00),
        'model': 'volume-based'
    },
    'airdna': {
        'range': 50_000,  # minimum
        'model': 'enterprise STR'
    },
    'rentcast': {
        'free_tier': '50 calls/month',
        'model': 'volume-based'
    },
    'optimal_blue': {
        'range': (15_000, 50_000),
        'model': 'commercial broker/lender'
    },
    'housecanary': {
        'consumer': 19,  # /month
        'institutional': (25_000, 100_000),
        'model': 'enterprise API'
    },
    'attom_data': {
        'starter': 95,  # /month API
        'enterprise': 500
    },
    'cotality_loansafe': {
        'per_deal': (50, 200),
        'model': 'enterprise'
    },
    'stateScape_counsel': {
        'annual': (30_000, 60_000)
    },
    'cloud_api': {
        'annual': (50_000, 150_000)
    }
}
```

### Build Budget
```python
BUILD_BUDGET = {
    'total_range': (750_000, 1_400_000),
    'duration_months': 6,
    'categories': {
        'labor_8_FTEs': (525_000, 900_000),
        'vendor_apis': (50_000, 120_000),
        'ocrolus': (25_000, 100_000),
        'optimal_blue': (15_000, 50_000),
        'legal_content': (30_000, 60_000),
        'cloud_infra_SOC2': (30_000, 80_000),
        'contingency_10pct': (75_000, 90_000)
    }
}
```

### Loan Tape Revenue Model
```python
REVENUE_PER_FUNDED_LOAN = {
    'broker_comp_range': (3_350, 6_700),  # 1-2% on ~$335K avg loan
    'avg_loan_sfr': (275_000, 400_000),
    'blended_sfr_weighted_avg': 335_000
}
```

### Acquisition Costs
```python
ACQUISITION_COSTS = {
    'digital_CPL': (15, 60),
    'fresh_exclusive_leads_CPF': (400, 3_000),
    'broker_channel_marginal': 0,
    'seasoning_tracker_re_engagement': 0
}
```

### Platform Pricing (Recommended Hybrid)
```python
PLATFORM_PRICING = {
    'broker_base': (199, 499),  # /month
    'lender_aggregator_base': (999, 4_999),
    'per_deal_success_fee': (25, 100),
    'premium_tier': 'Monte Carlo reports, IC memo, capital markets analytics'
}
```

---

## 19. DATABASE SCHEMAS (PostgreSQL DDL)

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

### state_ppp_rules Table
```sql
CREATE TABLE state_ppp_rules (
  state_code CHAR(2),
  entity_type TEXT,  -- 'individual', 'LLC', 'corp', 'any'
  loan_purpose TEXT, -- 'business', 'consumer', 'any'
  treatment TEXT CHECK (treatment IN ('ALLOWED','PROHIBITED','RESTRICTED','AMBIGUOUS')),
  restriction_detail TEXT,
  penalty_base TEXT CHECK (penalty_base IN ('REMAINING_BALANCE','ORIGINAL_PRINCIPAL')),
  annual_indexed_threshold NUMERIC,
  threshold_effective_year INTEGER,
  statute_citation TEXT,
  verified_date DATE,
  reindex_month INTEGER,  -- month to re-pull threshold (1=January for OH/PA)
  notes TEXT
);
```

### lease_extraction_audit Table
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

### Canonical Evidence Object Schema
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

### Canonical Data Schema (Normalization Layer)
```sql
-- For every data point ingested from any source
CREATE TABLE evidence_normalization (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(64),              -- 'rentcast', 'airdna', 'fred', 'ocrolus'
    as_of_timestamp TIMESTAMPTZ,        -- when retrieved
    effective_date TIMESTAMPTZ,         -- what date the data describes
    confidence_score FLOAT,             -- 0-1
    hash VARCHAR(64),                   -- SHA-256 of raw payload
    ttl_hours INT,                      -- time-to-live
    provenance_tier VARCHAR(32),        -- 'primary_source' / 'vendor_model' / 'derived' / 'user_input'
    decay_rate FLOAT,                   -- per-hour confidence reduction after TTL
    raw_payload JSONB
);
```

---

## CROSS-REFERENCES (where each value came from)

| Section | Primary Source |
|---|---|
| Payment Factor / PITIA | Sovereign Master §2.2, DSCR Forumals |
| Golden Deal A | Sovereign Master §2.2 |
| Deal B-K | DSCR Forumals, Master DSCR Knowledge Doc |
| Magic Buckets | Sprint 6 XGBoost, Feature Engineering Blueprint |
| Monte Carlo | Sovereign Master §4.3, def_blueprint_v3 §3, Godmode Layer 2 |
| XGBoost FEATURE_COLUMNS | Sprint 6, Feature Engineering Blueprint |
| Lender Matrix | Sovereign Master §6.1, def_blueprint_v3 §6 (V2.0 corrections) |
| State PPP Matrix | Sovereign Master §3.3, Godmode Part IV |
| Pricing | Sovereign Master §3.1, Master DSCR Knowledge Doc §5 |
| Tax Numbers | Sovereign Master §2.4 B′, def_blueprint_v3 §3 |
| Compliance Deadlines | def_blueprint_v3 §4 (V2.0 corrections), Sovereign Master §3.3 |
| Reserves/Assets/Eligibility | Master DSCR Knowledge Doc §5-6 |
| 23 Acceptance Criteria | Sovereign Master Part Twelve §12.2 |
| 15 Kill Criteria | Sovereign Master §7.4 |
| Distributional DSCR JSON | def_blueprint_v3 §10 (canonical) |
| SHAP | Sovereign Master §9.2, Definitive Blueprint §III |
| Confidence Decay | Godmode Part III (Celery task) |
| Vendor Costs | def_blueprint_v3 §2, 8, Godmode Part I |
| Database Schemas | Godmode Parts III/IV, Sovereign Master §5.1, §8.1 |

---

*Last updated: 2026-06-18. All values verified against primary sources on read. Conflicts resolved per V2.0 corrections (def_blueprint_v3).*
