---
type: research
status: drafted
confidence: 3
title: "Audit Card G4-06: Modified Dietz Method (Portfolio Time-Weighted Return)"
summary: "**10x Verification — 10-Point Protocol Applied**"
entities:
  - concept/dscr
  - lender/visio-lending
  - slice/1
  - slice/2
  - topic/str
tags:
  - topic/portfolio
  - type/audit
source: RESEARCH/godmode_20260618/03_T3_math_verification/math_g4_06_modified_dietz.md
vaulted_at: 2026-06-20
---
# Audit Card G4-06: Modified Dietz Method (Portfolio Time-Weighted Return)

**10x Verification — 10-Point Protocol Applied**

## Claim Statement

> The Modified Dietz method computes a portfolio's time-weighted rate of return, accounting for the **timing and magnitude** of cash flows. The formula:
> $$r = \frac{V_1 - V_0 - \sum_{i=1}^{N} CF_i}{V_0 + \sum_{i=1}^{N} CF_i \cdot w_i}$$
>
> where the weight `w_i = (T - t_i) / T`, `T` is the total measurement period, `t_i` is the time from start to cash flow `i`, `V_0` and `V_1` are beginning and ending portfolio values, and `CF_i` are cash flows (contributions positive, withdrawals negative).

## Derivation from First Principles

1. **Simple Dietz assumption.** All cash flows occur at the midpoint of the period (weight = 0.5). This is a poor approximation for uneven flows.
2. **Modified Dietz refinement.** Each cash flow is weighted by the *fraction of the period it is invested*: `w_i = (T − t_i) / T`. A cash flow at `t_i = 0` (start) has weight 1 (fully invested); a flow at `t_i = T` (end) has weight 0 (not invested).
3. **Why "modified Dietz"?** The formula is a *linear* (first-order) approximation of the true dollar-weighted (IRR) return. CAIA Association notes: "The modified Dietz formula is, in fact, a first-order approximation of the internal rate of return and is, therefore, a money-weighted return."
4. **Boundary check.** If all cash flows occur at `t = T/2` (midpoint), `w_i = 0.5` for all, and the formula reduces to the simple Dietz method. ✓
5. **Boundary check.** If there are no cash flows (only `V_0` and `V_1`), the formula reduces to `(V_1 − V_0) / V_0 = HPR` (holding period return). ✓
6. **Boundary check.** If `CF_i = 0` for all `i`, denominator is just `V_0`. ✓
7. **GIPS standard.** The Modified Dietz method is one of the GIPS-acceptable daily-weighted external cash-flow adjusted return methods (CFA Institute / Investment Performance Council).

## Numerical Example with Tolerance Band

Inputs (Corporate Finance Institute worked example):
- V(0) = $1,000
- V(1) = $1,200 (one-year period)
- CF at t=0.25 (3 months): +$500
- CF at t=0.75 (9 months): −$800
- T = 1 year

Weights:
- w(0.25) = (1 − 0.25)/1 = 0.75
- w(0.75) = (1 − 0.75)/1 = 0.25

Numerator: `1200 − 1000 − (500 + (−800)) = 1200 − 1000 − (−300) = 500`
Denominator: `1000 + (500 × 0.75) + (−800 × 0.25) = 1000 + 375 − 200 = 1175`
**r = 500 / 1175 = 42.55%** (per CFI worked example).

**Tolerance band: ±5 bps** (rounding in time-weighting; convention T=365 days vs. 1.0 years).

## Source 1 (Primary — Corporate Finance Institute)

**Corporate Finance Institute (CFI)**, "Modified Dietz Return — Overview, Formula, Example" (Published April 3, 2020; reviewed by Andrew Loo).
URL: https://corporatefinanceinstitute.com/resources/career-map/sell-side/capital-markets/modified-dietz-return/
Quote: "The Modified Dietz Return calculates the rate of return of an investment portfolio which includes the cashflows in and out of the portfolio." Provides the worked example above (V(0)=1000, V(1)=1200, CF at 25% = +500, CF at 75% = -800 → 42.55% return).

## Source 2 (Independent — Investopedia)

**Investopedia**, "Modified Dietz Method: Definition and How It's Used in Investing" (Updated Jan. 28, 2026).
URL: https://www.investopedia.com/terms/m/modifieddietzmethod.asp
Quote: "The modified Dietz method is a way to measure a portfolio's historical return that is based on a weighted calculation of its cash flow. The method takes into account the timing of cash flows and assumes that there is a constant rate of return over a specified period of time." Notes that the result is sometimes called the "modified internal rate of return (MIRR)" — though this is a different MIRR from the Excel MIRR function.

## Source 3 (Independent — CAIA Association)

**CAIA Association**, "The Multi-Period Conundrum of Private Market Performance Metrics" (Dec. 5, 2024).
URL: https://caia.org/blog/2024/12/05/multi-period-conundrum-private-market-performance-metrics
Quote: "The modified Dietz formula is, in fact, a first-order approximation of the internal rate of return and is, therefore, a money-weighted return." Critically, CAIA clarifies that Modified Dietz is a **money-weighted** (dollar-weighted) approximation, NOT a time-weighted return. This is a subtle but important distinction.

## Recency Check

CFI 2020 (stable math). Investopedia updated 2026. CAIA 2024. **All current.**

## Bias Assessment

- CFI: financial training firm, formula-correct, no vendor bias.
- Investopedia: encyclopedic, low bias.
- CAIA: chartered alternative investment analyst association, professional body. **High credibility.**

## 10-Point Verification Scorecard

| # | Check | Result |
|---|-------|--------|
| 1 | Source Type | Industry reference (CFI) + encyclopedic (Investopedia) + professional body (CAIA) ✓ |
| 2 | Multi-Source | 3 independent ✓ |
| 3 | Recency | All 2020+ ✓ |
| 4 | Methodology | Formula matches CFI/Investopedia/CAIA exactly ✓ |
| 5 | Bias | None material ✓ |
| 6 | Citation | CFI worked example ✓ |
| 7 | Expert | CAIA Association, CFA-aligned ✓ |
| 8 | Logic / boundary | Reduces to simple Dietz with t=T/2; reduces to HPR with no cash flows ✓ |
| 9 | Date | None stale ✓ |
| 10 | Context | GIPS-standard for portfolio return reporting ✓ |

## Verdict

**TIER 1 CONFIRMED**

The Modified Dietz formula as documented in the DSCR corpus is mathematically correct and matches CFI, Investopedia, and CAIA references exactly. The formula is GIPS-acceptable for portfolio reporting.

## Refinement Note (Important Distinction)

**Critical refinement:** The corpus should distinguish carefully between:
- **Time-weighted return (TWR):** Removes the effect of cash flow timing; reflects manager skill. Computed by geometric linking of sub-period returns.
- **Money-weighted return (MWR) / Dollar-weighted return (DWR):** Reflects both manager skill AND cash flow timing. The Modified Dietz is a *first-order approximation* of MWR (per CAIA), **not** a true TWR.

The original claim labels Modified Dietz as "portfolio time-weighted return." This is technically imprecise — Modified Dietz is a *dollar-weighted approximation*. For DSCR pool aggregation, this distinction matters: a TWR aggregation would understate the impact of origination timing on portfolio yield; a Modified Dietz (MWR proxy) is the correct choice for credit risk and yield analytics on a loan portfolio.

**Recommended corpus revision:** Replace "portfolio time-weighted return" with "portfolio dollar-weighted return (Modified Dietz approximation)."

## Confidence Score

**4 / 5** — Formula verified, but corpus's classification of Modified Dietz as "time-weighted" is incorrect (it is a dollar-weighted approximation per CAIA).

## Test Coverage Recommendation

**Slice 1** should include: (a) unit test of the Modified Dietz formula on a known cash flow stream (CFI example) to confirm 42.55% result; (b) cross-check that Modified Dietz ≠ geometric TWR for the same cash flows (the difference is the cash flow timing effect); (c) Slice 2 should add a true TWR computation (daily returns, geometrically linked) for comparison.
