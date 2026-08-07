---
type: dscr-analysis
deal_name: SelfStorage_FL_2M
date: 2026-06-22 17:29
risk_rating: F
purchase_price: 2000000
loan_amount: 1500000
initial_rate: 0.065
property_type: SS
property_state: FL
t1_origin: 1.27
t2_origin: 0.79
default_probability: 0.66
expected_loss: 0.16
cash_flow: -4854
irr: 0.131
qbd: 1.00
tags: [dscr, monte-carlo, ss, fl]
---
# DSCR Analysis: SelfStorage_FL_2M

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $2,000,000 |
| Loan Amount | $1,500,000 |
| LTV | 75.0% |
| Interest Rate | 6.50% |
| Gross Rent | $16,000/mo |
| Property Type | SS |
| State | FL |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.27x
- **Final (10yr):** 1.55x
- **5th Percentile:** 1.32x
- **95th Percentile:** 1.80x

### Track 2 (Investor Survival)
- **Origin:** 0.79x
- **Final (10yr):** 0.65x
- **5th Percentile:** 0.00x
- **95th Percentile:** 0.96x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.90x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 65.9% |
| Expected Loss | 16.47% |
| Loss Given Default | 25% |
| Cash Flow (final) | $-4,854/mo |
| Positive CF | 2% |
| IRR | 13.1% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $5,356,059 |
| Final Equity | $4,084,417 |
| Underwater Ever | 25.6% |

## Breakeven Analysis

- **Breakeven Rate:** 9.70%
- **Rate Cushion:** -320 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.79x | 66% | $-4,854 |

## Industry Benchmarks

- **OpEx Ratio Used:** 38% of EGI
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
