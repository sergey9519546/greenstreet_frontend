---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 02 — Rate = 100% (Extreme High Rate)"
summary: "**Edge case:** `payment_factor(100.0, n_months)` — interest rate of 100% APR"
entities:
  - concept/dscr
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/reserves
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_02_rate_100pct.md
vaulted_at: 2026-06-20
---
# Edge Case 02 — Rate = 100% (Extreme High Rate)

**Edge case:** `payment_factor(100.0, n_months)` — interest rate of 100% APR
**Source function:** `dscr_core.payment.payment_factor`
**Test category:** boundary (numerical stability); extreme input
**Slice assignment:** Slice 1 (current — must not raise, must compute)

## Edge Case Description

An interest rate of 100% APR corresponds to a monthly rate of `100/100/12 ≈ 0.0833`.
At this monthly rate, the annuity factor is `r(1+r)^n / ((1+r)^n - 1)` which is
mathematically well-defined for any n ≥ 1. The test verifies:

1. No overflow / underflow in `Decimal` path
2. Float conversion preserves precision to ≥ 10 decimal places
3. The factor is monotonically increasing in rate (consistency check)

This rate appears in:

- Hard-money bridge loans (12-18% typical, not 100%)
- Stress-test scenarios where the engineer asks "what if rates 10× current?"
- Sanity floor for `deal_break_rate` upper bracket

## Expected Behavior

**Accept** — return a well-defined float in `(0, 1)` (the payment per dollar
of principal per month for a 100%-APR loan). At `n=360`, the factor should
be ≈ 0.08333 — i.e., the borrower pays the entire loan balance in interest
each month (roughly).

```python
f = payment_factor(100.0, 360)
# ≈ 0.08333... — i.e., $83.33/mo per $1 of loan at 100% APR 30yr
```

## Mathematical Analysis

At r = 100/100/12 = 1/12 ≈ 0.08333:
```
(1 + r)^360 = (1.08333)^360 ≈ 1.5e13  (large but representable)
f = r * (1+r)^n / ((1+r)^n - 1) ≈ 0.08333
```

The `(1+r)^n` term grows ~16 orders of magnitude vs. the input, but Python
`Decimal` with `prec=28` handles this without overflow. The subtraction
`(1+r)^n - 1` is the numerical hot spot — relative error could be ~28 orders
of magnitude, but since `prec=28`, the absolute precision is still ≥ 1e-28,
which is far below any practical concern.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=50.0, max_value=200.0, allow_nan=False),
       n=st.integers(min_value=12, max_value=600))
def test_payment_factor_high_rate_stable(rate, n):
    """payment_factor at extreme rates returns a finite, monotonic value."""
    f = payment_factor(rate, n)
    assert 0.0 < f < 1.0, f"factor {f} out of plausible range for {rate}%, {n}mo"
    # Verify monotonic: higher rate -> higher factor
    f_low = payment_factor(rate - 1.0, n)
    assert f > f_low
```

## Reference Behavior

**numpy-financial:** No special-case for rate ≥ 100%. `pmt(100/12/100, 360, 1)`
returns a large negative number. Same formula, no overflow protection.

**QuantLib:** `ql.InterestRate(1.0, ql.ActualActual())` accepts rates up to
~10^6 before precision breaks. For 100% APR, QuantLib is silent.

**Bankrate mortgage calculator:** Caps at 50% APR (UI limit). No computation
at 100%.

**Excel PMT(100/1200, 360, -100000):** Returns ≈ $8,333.34/mo — same as our
expected behavior. Confirms the formula is stable at 100%.

## Confidence Score

**4/5** — formula is well-defined, but the `(1+r)^n` growth means precision
degrades for very large rates. Test must verify monotonicity, not exact
value, for rates > 50%.

## Implementation Order

**Priority:** Medium. Add `test_payment_factor_at_100pct` to `test_payment.py`.
This guards against future refactors that might add `if rate < 0.5: ...` style
guards.
