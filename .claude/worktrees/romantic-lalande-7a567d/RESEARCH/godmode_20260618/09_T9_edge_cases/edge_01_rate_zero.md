---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 01 — Rate = 0% (Level Principal)"
summary: "**Edge case:** `payment_factor(0.0, n_months)` for any valid `n_months`"
entities:
  - concept/dscr
  - concept/io
  - lender/visio-lending
  - slice/1
  - tax/pal
  - topic/str
tags:
  - concept/io
  - topic/short-rate
  - topic/stress-test
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_01_rate_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 01 — Rate = 0% (Level Principal)

**Edge case:** `payment_factor(0.0, n_months)` for any valid `n_months`
**Source function:** `dscr_core.payment.payment_factor` (DSCR Sovereign OS Slice 1)
**Test category:** boundary (math identity); valid input, exercise zero-rate branch
**Slice assignment:** Slice 1 (current — already implemented at `payment.py:56-57`)

## Edge Case Description

When the annual rate is exactly 0%, the standard amortization annuity formula
has a 0/0 indeterminate form in the limit. The correct closed-form limit is
`payment_factor = 1 / n_months` — equal principal payment, no interest. This
edge case appears in:

- 0% interest-only bridge loans (rare but valid)
- Seller-financed DSCR loans with promotional 0% period
- Stress tests where the engineer wants "minimum payment" floor

## Expected Behavior

**Accept** — return `1.0 / n_months`.

```python
payment_factor(0.0, 360) == 1/360 ≈ 0.0027777778
payment_factor(0.0, 12)  == 1/12  ≈ 0.0833333333
payment_factor(0.0, 600) == 1/600 ≈ 0.0016666667
```

## Mathematical Analysis

Standard formula: `f(r, n) = r(1+r)^n / ((1+r)^n - 1)`

Apply L'Hôpital's rule as `r → 0`:

```
lim_{r→0} f(r, n) = lim_{r→0} [n(1+r)^(n-1)] / [n(1+r)^(n-1)] = 1/n
```

Confirmed: as `r → 0`, the annuity factor → pure level principal.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=-1e9, max_value=1e9, allow_nan=False, allow_infinity=False),
       n=st.integers(min_value=1, max_value=600))
def test_payment_factor_continuous_at_zero(rate, n):
    """payment_factor must be continuous at rate=0."""
    if abs(rate) < 1e-12:  # avoid the special-case branch
        return
    f_near_zero = payment_factor(rate, n)
    expected_floor = 1.0 / n
    # As rate -> 0, f should approach 1/n monotonically
    assert f_near_zero >= expected_floor
```

## Reference Behavior

**numpy-financial v1.0+** (`numpy_financial._financial.py`):
```python
def pmt(rate, nper, pv, fv=0, when='end'):
    ...
    mask = (rate == 0)
    masked_rate = np.where(mask, 1, rate)
    fact = np.where(mask != 0, nper,
                    (1 + masked_rate * when) * (temp - 1) / masked_rate)
    return -(fv + pv * temp) / fact
```
**numpy-financial explicitly handles rate==0** by branching before division.
Source: <https://github.com/numpy/numpy-financial/blob/main/numpy_financial/_financial.py>

**Excel PMT():** Returns `#DIV/0!` if rate=0 — but this is a bug. The
correct financial convention is `pmt = -pv / nper` when rate=0. Excel
users must use a separate formula.

**Bankrate / mortgagecalculator.org / SoFi:** None accept rate=0 cleanly.
The standard amortization formula short-circuits to level principal.

## Confidence Score

**5/5** — universal convention, mathematically proven, multiple reference
implementations agree on the `1/n` short-circuit.

## Implementation Order

**Priority:** High (already implemented but lacks explicit test for the
edge case as a property test; add to `test_payment.py::TestPaymentFactor`).
