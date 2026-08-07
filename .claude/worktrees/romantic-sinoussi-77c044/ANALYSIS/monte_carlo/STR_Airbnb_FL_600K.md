---
type: dscr-analysis
deal_name: STR_Airbnb_FL_600K
date: 2026-06-22 17:29
risk_rating: F
purchase_price: 600000
loan_amount: 450000
initial_rate: 0.08
property_type: STR
property_state: FL
t1_origin: 1.25
t2_origin: 0.46
default_probability: 1.00
expected_loss: 0.35
cash_flow: -3565
irr: -0.038
qbd: 1.00
tags: [dscr, monte-carlo, str, fl]
---
# DSCR Analysis: STR_Airbnb_FL_600K

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $600,000 |
| Loan Amount | $450,000 |
| LTV | 75.0% |
| Interest Rate | 8.00% |
| Gross Rent | $5,500/mo |
| Property Type | STR |
| State | FL |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.25x
- **Final (10yr):** 1.52x
- **5th Percentile:** 1.29x
- **95th Percentile:** 1.77x

### Track 2 (Investor Survival)
- **Origin:** 0.46x
- **Final (10yr):** 0.27x
- **5th Percentile:** 0.00x
- **95th Percentile:** 0.41x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 1.24x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 99.9% |
| Expected Loss | 34.98% |
| Loss Given Default | 35% |
| Cash Flow (final) | $-3,565/mo |
| Positive CF | 0% |
| IRR | -3.8% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $1,062,172 |
| Final Equity | $667,411 |
| Underwater Ever | 50.2% |

## Breakeven Analysis

- **Breakeven Rate:** 11.34%
- **Rate Cushion:** -334 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.46x | 100% | $-3,565 |

## Industry Benchmarks

- **OpEx Ratio Used:** 63% of EGI
- **Industry Min DSCR:** 1.25x
- **Calibration Source:** cmbs_calibration

## Related Knowledge

- [[Monte Carlo Engine]]
- [[ARM_Reset_Engine]]
- [[Compliance_Engine]]
- [[DSCR_Unit_Tests]]

## Audit Trail

- **Engine:** DSCR Monte Carlo v5
- **Calibration:** 279,187 CMBS loans, 115,240 DSCR observations
- **Sources:** Trepp, MetLife/Moody's, Freddie Mac, IREM/CBRE
- **Generated:** 2026-06-22 17:29

---
*This analysis is for informational purposes only. Not investment advice.*
