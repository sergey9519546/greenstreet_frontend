---
type: dscr-analysis
deal_name: Office_TX_2M
date: 2026-06-22 17:22
risk_rating: F
purchase_price: 2500000
loan_amount: 1875000
initial_rate: 0.07
property_type: OF
property_state: TX
t1_origin: 1.04
t2_origin: 0.70
default_probability: 0.83
expected_loss: 0.33
cash_flow: -7802
irr: -0.023
qbd: 1.00
tags: [dscr, monte-carlo, of, tx]
---
# DSCR Analysis: Office_TX_2M

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $2,500,000 |
| Loan Amount | $1,875,000 |
| LTV | 75.0% |
| Interest Rate | 7.00% |
| Gross Rent | $18,000/mo |
| Property Type | OF |
| State | TX |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.04x
- **Final (10yr):** 1.26x
- **5th Percentile:** 1.08x
- **95th Percentile:** 1.46x

### Track 2 (Investor Survival)
- **Origin:** 0.70x
- **Final (10yr):** 0.59x
- **5th Percentile:** 0.00x
- **95th Percentile:** 0.87x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.67x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 83.5% |
| Expected Loss | 33.40% |
| Loss Given Default | 40% |
| Cash Flow (final) | $-7,802/mo |
| Positive CF | 0% |
| IRR | -2.3% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $3,611,844 |
| Final Equity | $2,002,862 |
| Underwater Ever | 57.3% |

## Breakeven Analysis

- **Breakeven Rate:** 7.58%
- **Rate Cushion:** -58 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.70x | 84% | $-7,802 |

## Industry Benchmarks

- **OpEx Ratio Used:** 33% of EGI
- **Industry Min DSCR:** 1.25x
- **Calibration Source:** cmbs_calibration

## Related Knowledge

- [[Deal_Scoring_Engine]]
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
