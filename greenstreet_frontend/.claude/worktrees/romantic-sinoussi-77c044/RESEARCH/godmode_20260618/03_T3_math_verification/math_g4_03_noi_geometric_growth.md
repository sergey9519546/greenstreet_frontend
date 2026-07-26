---
type: research
status: drafted
confidence: 3
title: "Audit Card G4-03: NOI Geometric Growth (Year N = Year 1 × (1+g)^(N-1))"
summary: "**10x Verification — 10-Point Protocol Applied**"
entities:
  - concept/cap-rate
  - concept/dscr
  - concept/ltv
  - slice/1
  - slice/2
  - topic/str
tags:
  - topic/stress-test
  - type/audit
source: RESEARCH/godmode_20260618/03_T3_math_verification/math_g4_03_noi_geometric_growth.md
vaulted_at: 2026-06-20
---
# Audit Card G4-03: NOI Geometric Growth (Year N = Year 1 × (1+g)^(N-1))

**10x Verification — 10-Point Protocol Applied**

## Claim Statement

> Under a constant annual growth rate `g`, the Net Operating Income in any future year `N` compounds geometrically from the Year-1 (stabilized) NOI:
> $$NOI_N = NOI_1 \cdot (1+g)^{N-1}$$
>
> This is equivalent to projecting from a "Year-0" stabilized baseline as `NOI_N = NOI_0 · (1+g)^N`; the indexing convention differs by one period but the compound rate is identical.

## Derivation from First Principles

1. **Definition of compound growth.** A quantity that grows by factor `(1+g)` each period evolves as a geometric series.
2. **Year indexing convention.** The corpus uses "Year 1" as the *first stabilized year* (post-construction lease-up). Year 2 = Year 1 × (1+g), Year 3 = Year 2 × (1+g) = Year 1 × (1+g)^2, etc. By induction, Year N = Year 1 × (1+g)^(N-1). ✓
3. **Boundary check.** N=1 → NOI_1 = NOI_1 × (1+g)^0 = NOI_1. ✓
4. **Sensitivity to g.** A 100 bps change in `g` (e.g., 2% → 3%) over 10 years compounds to (1.03/1.02)^10 ≈ 10.4% higher terminal NOI — significant for terminal value.
5. **Assumptions of the geometric model.** (a) Growth is constant year-over-year; (b) NOI is the *base* before debt service and capital costs. The model is a first-order approximation; real-world NOI is mean-reverting and cyclical.

## Numerical Example with Tolerance Band

Inputs: `NOI_1 = $100,000`, `g = 3.0%`, hold = 5 years.

| Year | Formula | NOI |
|------|---------|----:|
| 1 | $100,000 × 1.03^0 | $100,000 |
| 2 | $100,000 × 1.03^1 | $103,000 |
| 3 | $100,000 × 1.03^2 | $106,090 |
| 4 | $100,000 × 1.03^3 | $109,273 |
| 5 | $100,000 × 1.03^4 | $112,551 |

Sanity: `=100000*(1+0.03)^(5-1) = $112,551`. ✓

**Tolerance band: < 1 bp** (closed-form; no iteration).

## Source 1 (Primary — Academic/Textbook)

**Damodaran, A.** "Valuing Real Estate" — NYU Stern (Chapter 26).
URL: https://pages.stern.nyu.edu/~adamodar/pdfiles/valn2ed/ch26.pdf
Establishes the Gordon Growth / finite-horizon NOI projection: `NOI_t = NOI_1 · (1+g)^(t-1)`. Damodaran explicitly decomposes the cap rate: `R = (r − g)` where `r` is the discount rate and `g` is the NOI growth rate (Gordon model form).

## Source 2 (Independent — Industry CFA Material)

**AnalystPrep**, "Property Valuation Methods" (CFA Level II study notes).
URL: https://analystprep.com/study-notes/cfa-level-2/computing-property-values-using-direct-capitalization-and-discounted-cash-flow-methods/
Confirms: "The direct capitalization method estimates the value of a property. Cap rate = Discount rate – the [growth rate]. The terminal cap rate is the cap rate used to [value the property at exit]." Implicitly uses `NOI_n = NOI_1 × (1+g)^(n-1)`.

## Source 3 (Independent — J.P. Morgan Real Estate)

**J.P. Morgan**, "Calculating Net Operating Income (NOI) & Cash Flow."
URL: https://www.jpmorgan.com/insights/real-estate/commercial-term-lending/calculating-net-operating-income-and-cash-flow
Confirms NOI definition (`total income – total operating expenses`) and that lenders use forward NOI for DSCR/LTV underwriting; growth assumptions are explicit and feed into the cap-rate/growth identity.

## Recency Check

Damodaran Ch. 26 is foundational (2009, updated periodically). AnalystPrep mirrors current CFA curriculum (2025). **Current.**

## Bias Assessment

- Damodaran: academic, no commercial bias.
- AnalystPrep: paid prep provider, but content is CFA-mirrored.
- JPM: institutional lender perspective, no DSCR conflict (in fact aligned).

## 10-Point Verification Scorecard

| # | Check | Result |
|---|-------|--------|
| 1 | Source Type | Textbook (Damodaran) + industry CFA + bank ✓ |
| 2 | Multi-Source | 3 independent ✓ |
| 3 | Recency | All current ✓ |
| 4 | Methodology | Geometric series, closed-form, verified by induction ✓ |
| 5 | Bias | None material ✓ |
| 6 | Citation | Damodaran's `R = r − g` decomposition cited ✓ |
| 7 | Expert | Damodaran (NYU Stern), CFA-aligned ✓ |
| 8 | Logic / boundary | N=1 returns base; closed-form; no iteration ✓ |
| 9 | Date | None stale ✓ |
| 10 | Context | Critical for DSCR terminal valuation ✓ |

## Verdict

**TIER 1 CONFIRMED**

The geometric NOI growth formula is mathematically elementary and correctly applied. The corpus's use of `NOI_N = NOI_1 × (1+g)^(N-1)` is the standard convention (Year-1 stabilized base), identical in substance to `NOI_N = NOI_0 × (1+g)^N` with the appropriate redefinition of `NOI_0`.

## Refinement Note (Optional)

For DSCR loans specifically, two refinements are common in market practice:
1. **Step-up then reversion:** Years 1-2 may use a higher "lease-up" growth (e.g., 5-7%), reverting to long-run market growth (2-3%) from Year 3+. The corpus's single-rate model is a simplification.
2. **Real vs. nominal:** A 3% nominal `g` may overstate real NOI growth if inflation runs 2-3%. Damodaran notes this distinction.

Neither refinement invalidates the corpus math; both are second-order considerations for Slice 2 stress testing.

## Confidence Score

**5 / 5** — Elementary math, multi-source confirmed, no ambiguity.

## Test Coverage Recommendation

**Slice 1** should include: (a) unit test of the closed-form formula against an iterative year-by-year loop to confirm equivalence; (b) sensitivity test varying `g` by ±200 bps to confirm the terminal-value sensitivity magnitude (~21% per 100 bps over 10 years is the expected result).
