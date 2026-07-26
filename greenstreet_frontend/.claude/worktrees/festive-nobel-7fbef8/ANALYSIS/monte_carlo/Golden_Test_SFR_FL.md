---
type: dscr-analysis
deal_name: Golden_Test_SFR_FL
date: 2026-06-22 17:22
risk_rating: F
purchase_price: 425000
loan_amount: 318750
initial_rate: 0.07
property_type: SFR
property_state: FL
t1_origin: 1.05
t2_origin: 0.64
default_probability: 0.62
expected_loss: 0.22
cash_flow: -1536
irr: 0.015
qbd: 1.00
tags: [dscr, monte-carlo, sfr, fl]
---
# DSCR Analysis: Golden_Test_SFR_FL

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $425,000 |
| Loan Amount | $318,750 |
| LTV | 75.0% |
| Interest Rate | 7.00% |
| Gross Rent | $3,000/mo |
| Property Type | SFR |
| State | FL |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.05x
- **Final (10yr):** 1.28x
- **5th Percentile:** 1.09x
- **95th Percentile:** 1.48x

### Track 2 (Investor Survival)
- **Origin:** 0.64x
- **Final (10yr):** 0.51x
- **5th Percentile:** 0.00x
- **95th Percentile:** 0.76x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.76x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 61.8% |
| Expected Loss | 21.61% |
| Loss Given Default | 35% |
| Cash Flow (final) | $-1,536/mo |
| Positive CF | 0% |
| IRR | 1.5% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $744,799 |
| Final Equity | $471,272 |
| Underwater Ever | 39.8% |

## Breakeven Analysis

- **Breakeven Rate:** 7.67%
- **Rate Cushion:** -67 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.64x | 62% | $-1,536 |

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
- **Generated:** 2026-06-22 17:22

---
*This analysis is for informational purposes only. Not investment advice.*
