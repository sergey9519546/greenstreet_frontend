---
type: dscr-analysis
deal_name: Industrial_TX_1_5M
date: 2026-06-22 17:22
risk_rating: F
purchase_price: 1500000
loan_amount: 1125000
initial_rate: 0.065
property_type: IN
property_state: TX
t1_origin: 1.12
t2_origin: 0.84
default_probability: 0.94
expected_loss: 0.28
cash_flow: -3017
irr: 0.083
qbd: 1.00
tags: [dscr, monte-carlo, in, tx]
---
# DSCR Analysis: Industrial_TX_1_5M

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $1,500,000 |
| Loan Amount | $1,125,000 |
| LTV | 75.0% |
| Interest Rate | 6.50% |
| Gross Rent | $11,000/mo |
| Property Type | IN |
| State | TX |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.12x
- **Final (10yr):** 1.36x
- **5th Percentile:** 1.16x
- **95th Percentile:** 1.57x

### Track 2 (Investor Survival)
- **Origin:** 0.84x
- **Final (10yr):** 0.72x
- **5th Percentile:** 0.00x
- **95th Percentile:** 1.09x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.63x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 93.6% |
| Expected Loss | 28.08% |
| Loss Given Default | 30% |
| Cash Flow (final) | $-3,017/mo |
| Positive CF | 22% |
| IRR | 8.3% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $3,482,448 |
| Final Equity | $2,528,717 |
| Underwater Ever | 54.6% |

## Breakeven Analysis

- **Breakeven Rate:** 7.99%
- **Rate Cushion:** -149 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.84x | 94% | $-3,017 |

## Industry Benchmarks

- **OpEx Ratio Used:** 24% of EGI
- **Industry Min DSCR:** 1.20x
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
