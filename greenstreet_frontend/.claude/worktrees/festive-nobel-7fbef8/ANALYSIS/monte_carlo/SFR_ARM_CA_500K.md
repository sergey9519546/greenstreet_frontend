---
type: dscr-analysis
deal_name: SFR_ARM_CA_500K
date: 2026-06-22 17:30
risk_rating: F
purchase_price: 500000
loan_amount: 375000
initial_rate: 0.06
property_type: SFR
property_state: CA
t1_origin: 1.20
t2_origin: 0.73
default_probability: 0.77
expected_loss: 0.27
cash_flow: -1648
irr: 0.006
qbd: 1.00
tags: [dscr, monte-carlo, sfr, ca]
---
# DSCR Analysis: SFR_ARM_CA_500K

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $500,000 |
| Loan Amount | $375,000 |
| LTV | 75.0% |
| Interest Rate | 6.00% |
| Gross Rent | $3,500/mo |
| Property Type | SFR |
| State | CA |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.20x
- **Final (10yr):** 1.34x
- **5th Percentile:** 1.10x
- **95th Percentile:** 1.60x

### Track 2 (Investor Survival)
- **Origin:** 0.73x
- **Final (10yr):** 0.54x
- **5th Percentile:** 0.00x
- **95th Percentile:** 0.82x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.80x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 76.6% |
| Expected Loss | 26.80% |
| Loss Given Default | 35% |
| Cash Flow (final) | $-1,648/mo |
| Positive CF | 0% |
| IRR | 0.6% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $866,016 |
| Final Equity | $549,493 |
| Underwater Ever | 39.7% |

## Breakeven Analysis

- **Breakeven Rate:** 8.31%
- **Rate Cushion:** -231 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.73x | 77% | $-1,648 |

## Industry Benchmarks

- **OpEx Ratio Used:** 39% of EGI
- **Industry Min DSCR:** 1.20x
- **Calibration Source:** cmbs_calibration

## Related Knowledge

- [[DSCR_Core_Engine]]
- [[Monte Carlo Engine]]
- [[ARM_Reset_Engine]]
- [[Compliance_Engine]]
- [[DSCR_Unit_Tests]]

## Audit Trail

- **Engine:** DSCR Monte Carlo v5
- **Calibration:** 279,187 CMBS loans, 115,240 DSCR observations
- **Sources:** Trepp, MetLife/Moody's, Freddie Mac, IREM/CBRE
- **Generated:** 2026-06-22 17:30

---
*This analysis is for informational purposes only. Not investment advice.*
