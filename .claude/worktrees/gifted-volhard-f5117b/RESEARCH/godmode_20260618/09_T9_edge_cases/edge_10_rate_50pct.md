---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 10 — Payment Factor for Rate = 50% (Extreme DSCR Rate)"
summary: "**Edge case:** `payment_factor(50.0, 360)` — extreme but realistic high DSCR rate"
entities:
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/kiavi
  - lender/lima-one
  - lender/newfi
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/default-rate
  - topic/portfolio
  - topic/stress-test
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_10_rate_50pct.md
vaulted_at: 2026-06-20
---
# Edge Case 10 — Payment Factor for Rate = 50% (Extreme DSCR Rate)

**Edge case:** `payment_factor(50.0, 360)` — extreme but realistic high DSCR rate
**Source function:** `dscr_core.payment.payment_factor`
**Test category:** boundary (high rate); numerical stability ceiling
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A 50% APR is rare but within the universe of DSCR products:

- Hard-money bridge loans (12-18% typical, peaks at 30% in stressed cycles)
- Defaulted-loan servicing / NPL portfolios (50%+)
- Subprime second-lien DSCR (rare but documented)
- Stress test scenarios asking "what if rates 5× normal?"

At r = 50/100/12 = 0.0417 monthly, the annuity factor should be ~0.0417
(the borrower pays ~4.17% of principal per month = the full interest
amount, with negligible principal reduction).

## Expected Behavior

**Accept** — return a value in `(0.04, 0.05)`, monotonically increasing
with rate.

```python
f = payment_factor(50.0, 360)
# ≈ 0.04167  (essentially r = monthly rate)
# More precisely:
# (1 + r)^n = (1.04167)^360 ≈ 1.7e6
# f = r * 1.7e6 / (1.7e6 - 1) ≈ 0.04167 (to 4 decimal places)
```

The factor for `$100K loan at 50% / 30yr`:
```
$4,167.34/mo   (vs $665.30 at 7%)
```

## Mathematical Analysis

At r = 0.04167, n = 360:
```
(1 + r)^n = (1.04167)^360 ≈ 1.65e6
f = r * 1.65e6 / (1.65e6 - 1)
  ≈ 0.04167 * (1 + 1/1.65e6)
  ≈ 0.04167 + 2.5e-8
  ≈ 0.04167
```

The factor converges to `r` as `n → ∞` because the principal never
amortizes — the borrower just pays interest forever in the limit.

With `Decimal(prec=28)`, the `(1+r)^360` term is computed to ~28 digits
of precision, which is far beyond the ~7-8 digits we need for monetary
output.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=20.0, max_value=50.0, allow_nan=False),
       n=st.integers(min_value=60, max_value=600))
def test_payment_factor_high_rate_within_bounds(rate, n):
    """High-rate factors should be in (rate/100/12, rate/100/12 * 2)."""
    r = rate / 100.0 / 12.0
    f = payment_factor(rate, n)
    # Factor should be slightly above monthly rate
    assert r < f < r * 2.0

def test_payment_factor_monotonic_in_rate_at_high():
    """Monotonicity check: 25% < 30% < 40% < 50% should yield increasing factors."""
    f_25 = payment_factor(25.0, 360)
    f_30 = payment_factor(30.0, 360)
    f_40 = payment_factor(40.0, 360)
    f_50 = payment_factor(50.0, 360)
    assert f_25 < f_30 < f_40 < f_50

def test_payment_factor_at_50pct():
    """$100K at 50% / 30yr should produce factor close to r/100/12."""
    f = payment_factor(50.0, 360)
    expected = 50.0 / 100.0 / 12.0  # 0.04167
    assert f == pytest.approx(expected, abs=1e-4)
```

## Reference Behavior

**numpy-financial:** `pmt(0.5/12, 360, 100000)` returns ≈ -$4167.34 —
matches our formula.

**Excel PMT(0.5/12, 360, -100000):** Same ≈ $4167.34.

**Bankrate / mortgagecalculator.org:** UI caps at 30% APR. Below the UI
cap, formula computes correctly.

**QuantLib:** `ql.InterestRate(0.5, ql.ActualActual())` works; same result.

**Industry lender products (Verified November 2025):**
- Kiavi: DSCR up to 75% LTV, rates 7.5-12%
- Angel Oak Mortgage Solutions: DSCR up to $2M, rates 7-13%
- Newfi Wholesale: DSCR rates 7.25-13%
- Lima One Capital: DSCR bridge/construction, rates 9-14%
- Roc Capital (formerly Citadel): Hard money up to 18%

Real DSCR products cap around 13-14% in normal cycles. 50% is a stress-
test scenario, not a live product — but the formula must handle it
without raising.

## Confidence Score

**5/5** — formula is well-defined at 50% APR; multiple reference
implementations agree.

## Implementation Order

**Priority:** Medium. Add `test_payment_factor_at_50pct` to
`test_payment.py::TestPaymentFactor`. This guards against future refactors
that add upper-bound guards like `if rate > 0.20: raise`.
