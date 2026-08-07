---
type: dscr-analysis
deal_name: Retail_Strip_FL_800K
date: 2026-06-22 17:29
risk_rating: F
purchase_price: 800000
loan_amount: 600000
initial_rate: 0.075
property_type: RT
property_state: FL
t1_origin: 1.18
t2_origin: 0.88
default_probability: 0.69
expected_loss: 0.31
cash_flow: -1417
irr: 0.057
qbd: 1.00
tags: [dscr, monte-carlo, rt, fl]
---
# DSCR Analysis: Retail_Strip_FL_800K

## Risk Rating

> **F** - Failing

## Deal Parameters

| Parameter | Value |
|-----------|-------|
| Purchase Price | $800,000 |
| Loan Amount | $600,000 |
| LTV | 75.0% |
| Interest Rate | 7.50% |
| Gross Rent | $6,500/mo |
| Property Type | RT |
| State | FL |

## DSCR Analysis

### Track 1 (Lender Qualification)
- **Origin:** 1.18x
- **Final (10yr):** 1.44x
- **5th Percentile:** 1.23x
- **95th Percentile:** 1.66x

### Track 2 (Investor Survival)
- **Origin:** 0.88x
- **Final (10yr):** 0.77x
- **5th Percentile:** 0.00x
- **95th Percentile:** 1.14x

### Qualifies-but-Dangerous
- **QBD Percentage:** 100%
- **T1-T2 Delta:** 0.67x

## Risk Metrics

| Metric | Value |
|--------|-------|
| Default Probability | 69.3% |
| Expected Loss | 31.19% |
| Loss Given Default | 45% |
| Cash Flow (final) | $-1,417/mo |
| Positive CF | 36% |
| IRR | 5.7% |

## Property Value & Equity

| Metric | Value |
|--------|-------|
| Final Property Value | $1,393,795 |
| Final Equity | $873,025 |
| Underwater Ever | 50.5% |

## Breakeven Analysis

- **Breakeven Rate:** 9.78%
- **Rate Cushion:** -228 bps

## Stress Test Results

| Scenario | T2 DSCR | Default | Cash Flow |
|----------|---------|---------|-----------|
| Baseline | 0.88x | 69% | $-1,417 |

## Industry Benchmarks

- **OpEx Ratio Used:** 25% of EGI
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
- **Generated:** 2026-06-22 17:29

---
*This analysis is for informational purposes only. Not investment advice.*
