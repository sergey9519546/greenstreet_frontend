---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 03 — Term = 1 Month
summary: "**Edge case:** `payment_factor(rate, 1)` — fully amortized single-month loan"
entities:
  - concept/dscr
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/short-rate
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_03_term_one_month.md
vaulted_at: 2026-06-20
---
# Edge Case 03 — Term = 1 Month

**Edge case:** `payment_factor(rate, 1)` — fully amortized single-month loan
**Source function:** `dscr_core.payment.payment_factor`
**Test category:** boundary (math identity); minimum valid term
**Slice assignment:** Slice 1 (current — guard at `payment.py:49-50`)

## Edge Case Description

For `n_months = 1`, the formula becomes:
```
f(r, 1) = r(1+r)^1 / ((1+r)^1 - 1)
        = r(1+r) / r
        = 1 + r
```

So the borrower pays `(1 + r) * loan` in month 1 — entire principal plus one
month's interest. This is a "bullet payment" loan. Real DSCR loans never
have n=1 (minimum is typically 60 months), but the engine must handle it
without raising — it could be a stress scenario or a bridge loan modeling
error.

## Expected Behavior

**Accept** — return `1 + r` (in monthly decimal) for any rate `r ≥ 0`.

```python
payment_factor(7.0, 1) == 1 + (7/100/12) ≈ 1.0058333...
payment_factor(0.0, 1) == 1.0  # pure principal, no interest
payment_factor(50.0, 1) == 1 + (50/100/12) ≈ 1.0417
```

## Mathematical Analysis

The standard formula has `(1+r)^n - 1` in the denominator. At `n=1`,
`(1+r)^1 - 1 = r`, so the `r` in the numerator cancels exactly.
The result is `1 + r` (loan + 1 month interest).

For `r = 0`, the `r` cancellation becomes 0/0 and we use the level-principal
short-circuit: `payment_factor(0, 1) = 1/1 = 1`. Matches `1 + 0 = 1`.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=0.0, max_value=100.0, allow_nan=False))
def test_payment_factor_at_one_month(rate):
    """payment_factor(rate, 1) should equal 1 + rate/100/12 for rate > 0,
       or exactly 1.0 for rate == 0 (level-principal limit)."""
    f = payment_factor(rate, 1)
    if rate == 0:
        assert f == pytest.approx(1.0, abs=1e-12)
    else:
        expected = 1.0 + (rate / 100.0 / 12.0)
        assert f == pytest.approx(expected, abs=1e-9)
```

## Reference Behavior

**numpy-financial:** `pmt(0.07/12, 1, 100000) == -100583.33` (principal +
1 month interest). Matches our expected behavior.

**Excel PMT(0.07/12, 1, -100000):** ≈ $100,583.33 — same.

**Bankrate / mortgagecalculator.org:** These calculators start at 12-month
term minimum; n=1 is UI-blocked but the underlying formula returns the
correct value if the user bypasses the UI.

## Confidence Score

**5/5** — formula is algebraic identity at n=1; multiple reference
implementations agree.

## Implementation Order

**Priority:** High. Add `test_payment_factor_at_one_month` to
`test_payment.py::TestPaymentFactor`. This is a critical boundary case.
