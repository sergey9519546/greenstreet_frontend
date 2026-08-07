---
type: dscr-analysis
deal_name: MF_12Unit_CA_1_2M
date: 2026-06-22 17:28
risk_rating: F
purchase_price: 1200000
loan_amount: 900000
initial_rate: 0.065
property_type: MF
property_state: CA
t1_origin: 1.65
t2_origin: 1.00
default_probability: 0.81
expected_loss: 0.20
cash_flow: -1523
irr: 0.085
qbd: 0.78
tags: [dscr, monte-carlo, mf, ca]
---
# DSCR Analysis: MF_12Unit_CA_1_2M

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
- **Final (10yr):** 2.03x
- **5th Percentile:** 1.72x
- **95th Percentile:** 2.36x

### Track 2 (Investor Survival)
- **Origin:** 1.00x
- **Final (10yr):** 0.81x
- **5th Percentile:** 0.00x
- **95th Percentile:** 1.21x

### Qualifies-but-Dangerous
- **QBD Percentage:** 78%
- **T1-T2 Delta:** 1.22x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 81.5% |
| Expected Loss | 20.36% |
| Loss Given Default | 25% |
| Cash Flow (final) | $-1,523/mo |
| Positive CF | 54% |
| IRR | 8.5% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $2,110,987 |
| Final Equity | $1,348,002 |
| Underwater Ever | 37.8% |

## Breakeven Analysis

- **Breakeven Rate:** 13.63%
- **Rate Cushion:** -713 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 1.00x | 81% | $-1,523 |

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
- **Generated:** 2026-06-22 17:28

---
*This analysis is for informational purposes only. Not investment advice.*
