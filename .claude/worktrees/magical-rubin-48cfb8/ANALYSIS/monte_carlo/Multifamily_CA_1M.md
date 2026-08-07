---
type: dscr-analysis
deal_name: Multifamily_CA_1M
date: 2026-06-22 17:22
risk_rating: F
purchase_price: 1200000
loan_amount: 900000
initial_rate: 0.065
property_type: MF
property_state: CA
t1_origin: 1.65
t2_origin: 1.00
default_probability: 0.82
expected_loss: 0.21
cash_flow: -1375
irr: 0.086
qbd: 0.79
tags: [dscr, monte-carlo, mf, ca]
---
# DSCR Analysis: Multifamily_CA_1M

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $1,200,000 |
| Loan Amount | $900,000 |
| LTV | 75.0% |
| Interest Rate | 6.50% |
| Gross Rent | $12,000/mo |
| Property Type | MF |
| State | CA |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.65x
- **Final (10yr):** 2.04x
- **5th Percentile:** 1.74x
- **95th Percentile:** 2.38x

### Track 2 (Investor Survival)
- **Origin:** 1.00x
- **Final (10yr):** 0.83x
- **5th Percentile:** 0.00x
- **95th Percentile:** 1.22x

### Qualifies-but-Dangerous
- **QBD Percentage:** 79%
- **T1-T2 Delta:** 1.21x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 82.1% |
| Expected Loss | 20.52% |
| Loss Given Default | 25% |
| Cash Flow (final) | $-1,375/mo |
| Positive CF | 56% |
| IRR | 8.6% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $2,111,397 |
| Final Equity | $1,348,412 |
| Underwater Ever | 37.1% |

## Breakeven Analysis

- **Breakeven Rate:** 13.63%
- **Rate Cushion:** -713 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 1.00x | 82% | $-1,375 |

## Industry Benchmarks

- **OpEx Ratio Used:** 39% of EGI
- **Industry Min DSCR:** 1.20x
- **Calibration Source:** cmbs_calibration

## Related Knowledge

- [[Distributional_DSCR_Lib]]
- [[Monte Carlo Engine]]
- [[ARM_Reset_Engine]]
- [[Compliance_Engine]]
- [[DSCR_Unit_Tests]]

## Audit Trail

- **Engine:** DSCR Monte Carlo v5
- **Calibration:** 279,187 CMBS loans, 115,240 DSCR observations
- **Sources:** Trepp, MetLife/Moody's, Freddie Mac, IREM/CBRE
- **Generated:** 2026-06-22 17:22

---
*This analysis is for informational purposes only. Not investment advice.*
