---
type: code
slice: 1
status: drafted
confidence: 3
title: dscr-stress
summary: Stress + distributional DSCR layer for the DSCR Sovereign OS.
entities:
  - concept/arm
  - concept/dscr
  - concept/ltv
  - data/kbra
  - data/trepp
  - slice/1
  - slice/2
  - topic/multifamily
  - topic/str
tags:
  - topic/architecture
  - topic/default-rate
  - topic/insurance
  - topic/monte-carlo
  - topic/short-rate
  - topic/stress-test
  - topic/tax
  - topic/tournament
  - topic/yield-curve
  - type/audit
source: DSCR_SOVEREIGN_OS/packages/dscr-stress/README.md
vaulted_at: 2026-06-20
---
# dscr-stress

Stress + distributional DSCR layer for the DSCR Sovereign OS.

**Slice 2 P0-1** of the 8-layer hybrid architecture (Round 27 Algorithm Innovation Tournament).

## What this is

Slice 1 (`dscr-core`) computes a single point DSCR. The real 2026 vintage stress tests require a
**distributional** output that captures uncertainty. `dscr-stress` adds:

1. **5-Dim Distributional DSCR** — Replace point-DSCR with a 5-dimensional stochastic surface:
   - `p12` — P(DSCR < 1.0 in first 12 months)
   - `p36` — P(DSCR < 1.0 in first 36 months)
   - `lifetime` — P(min DSCR < 1.0 over [0, T])
   - `E_macro` — E[DSCR | macro recession scenario]
   - `CVaR_95` — Conditional VaR at 95th percentile macro

2. **Calibrated marginals** — KBRA-equivalent stress scenarios:
   - LTR rental growth: Normal(0%, 9.5%)
   - STR gross revenue: Lognormal(0%, 18-25%)
   - LTR vacancy: Beta(2, 22) ≈ 5-8%
   - STR vacancy: Beta(3, 7) ≈ 20-40%
   - Insurance escalation: Lognormal(7%, 5%) national; (12%, 8%) coastal
   - 10Y Treasury path: CIR or Hull-White (calibrated to live SOFR)

3. **Fixed-rate fully-amortizing** for Slice 2 P0-1 (ARM reset integration is P0-4, 80 hr).

## SR 26-02 Status

This layer **is a model** under SR 26-02. Requires Monte Carlo model card:
- Data sources (KBRA, AirDNA, RentCast calibration)
- Sample size (N=10,000 default; statistical convergence)
- Validation methodology (backtest on 2022-2025 vintages)
- Audit trail per inference

## Spec sources

- Round 27 Algorithm Innovation Tournament (Architecture A: Foundation + 5-Dim)
- v16 Sovereign Master / v3 Cross-Doc Synthesis
- dscr_sovereign_os_architectural_debt_and_math.md (DEBT 1 fix)
- KBRA DSCR methodology (calibration)
- 2026 market data: Trepp CMBS Multifamily 7.15% Mar 2026

## Usage

```python
from dscr_stress.distributional_dscr import distributional_dscr, Deal
from dscr_core.payment import pi

# Sovereign Master Deal A: $425K / 75% LTV / 7.00% / 30yr / $3K rent
deal = Deal(
    loan_amount=318_750.0,
    annual_rate=0.07,
    term_months=360,
    monthly_rent=3_000.0,
    monthly_tax=5_000.0 / 12,
    monthly_insurance=2_000.0 / 12,
    monthly_hoa=150.0,
    term_projection_months=36,
)

result = distributional_dscr(deal, n_paths=10_000, seed=42)
# {
#   'p12': 0.12,           # 12% chance of breach in 12 mo
#   'p36': 0.22,           # 22% in 36 mo
#   'lifetime': 0.29,      # 29% lifetime breach
#   'E_macro': 0.92,       # expected coverage under macro recession
#   'CVaR_95': 0.78,       # tail conditional coverage
# }
```
