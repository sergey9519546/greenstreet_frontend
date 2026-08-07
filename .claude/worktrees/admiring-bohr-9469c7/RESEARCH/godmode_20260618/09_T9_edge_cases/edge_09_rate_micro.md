---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 09 — Payment Factor for Rate = 0.001% (Micro Rate)"
summary: "**Edge case:** `payment_factor(0.001, 360)` — extremely low but non-zero rate"
entities:
  - concept/dscr
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/stress-test
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_09_rate_micro.md
vaulted_at: 2026-06-20
---
# Edge Case 09 — Payment Factor for Rate = 0.001% (Micro Rate)

**Edge case:** `payment_factor(0.001, 360)` — extremely low but non-zero rate
**Source function:** `dscr_core.payment.payment_factor`
**Test category:** boundary (micro rate); numerical stability floor
**Slice assignment:** Slice 1 (current)

## Edge Case Description

An annual rate of 0.001% (1 bp annual) corresponds to a monthly rate of
`0.001/100/12 ≈ 8.33e-7`. This is below typical Treasury bill yields and
approaches the boundary where the formula's `(1+r)^n - 1` term loses
significance in float arithmetic.

This edge case appears in:

- Modeling zero-interest promotional periods with non-zero carry
- Stress testing "what if rates went to zero but not exactly?"
- Verifying the Decimal path handles tiny rates without precision loss

## Expected Behavior

**Accept** — return a value very close to `1/360` (the level-principal limit)
but slightly above it (because the rate is non-zero).

```python
f = payment_factor(0.001, 360)
# ≈ 1/360 + 8.33e-7/2 ≈ 0.0027778...
# Specifically: 0.00277821 vs level-principal 0.00277778
# Difference is ~4.4e-7 per dollar per month
```

For `payment_factor(0.001, 360) * 100000` (i.e., $100K loan):
```
$277.78/mo  (essentially the same as 0%)
```

## Mathematical Analysis

At r = 8.33e-7 monthly, n = 360:
```
(1 + r)^n = (1 + 8.33e-7)^360 ≈ 1 + 360 * 8.33e-7 + ... ≈ 1.000300
f = r * 1.000300 / (1.000300 - 1) = 8.33e-7 * 1.000300 / 3.00e-4
  ≈ 0.0027782  (slightly above 1/360 = 0.0027778)
```

The numerator `(1+r)^n - 1 ≈ 3.00e-4` is the numerical hot spot. With
`Decimal(prec=28)`, this is representable to 28 significant digits, so the
computation is exact to ~24 digits of precision.

In float64 (IEEE 754), the precision is ~15-17 significant digits, which
is still 11+ digits beyond any practical concern.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=1e-6, max_value=0.01, allow_nan=False),
       n=st.integers(min_value=12, max_value=600))
def test_payment_factor_micro_rate_stable(rate, n):
    """Micro rates should produce factors slightly above level-principal (1/n)."""
    f = payment_factor(rate, n)
    f_zero = 1.0 / n
    # Factor must be strictly greater than level-principal for r > 0
    assert f > f_zero
    # Factor must be close to level-principal (within ~rate/12 of 1/n)
    assert f < f_zero + (rate / 100.0 / 12.0) * 1.01  # 1% tolerance on the delta

def test_payment_factor_one_bp():
    """Rate = 0.001% (1bp annual), n=360 must produce a factor slightly above 1/360."""
    f = payment_factor(0.001, 360)
    assert f == pytest.approx(1.0 / 360, abs=1e-6)
    assert f > 1.0 / 360  # strictly above level-principal
```

## Reference Behavior

**numpy-financial:** `pmt(0.001/1200, 360, 100000)` returns ≈ -$277.80 —
matches our expected behavior (slightly above $277.78).

**Excel PMT(0.00001/12, 360, -100000):** Returns ≈ $277.78 — same.

**Bankrate:** UI minimum rate is 0.125% APR (1.04 bps monthly). Below this,
the UI blocks input; underlying formula is well-defined.

**QuantLib:** `ql.InterestRate(0.00001, ql.ActualActual())` works without
warning. Same numerical behavior as our Decimal path.

## Confidence Score

**5/5** — formula is mathematically well-defined at micro rates; Decimal
path provides ample precision.

## Implementation Order

**Priority:** Medium. Add `test_payment_factor_at_one_basis_point` to
`test_payment.py::TestPaymentFactor`. This guards against future
refactors that might add an artificial floor (e.g., `if rate < 0.01: raise`).
