---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 07 — Term as Float (Rejected Type Error)
summary: "**Edge case:** `payment_factor(rate, 360.0)` — passing float where int expected"
entities:
  - concept/dscr
  - slice/1
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_07_term_float.md
vaulted_at: 2026-06-20
---
# Edge Case 07 — Term as Float (Rejected Type Error)

**Edge case:** `payment_factor(rate, 360.0)` — passing float where int expected
**Source function:** `dscr_core.payment.payment_factor` (rejects non-int
at `payment.py:53-54`)
**Test category:** error-path; type-check
**Slice assignment:** Slice 1 (current)

## Edge Case Description

The `n_months` parameter is typed `int` but Python is dynamically typed, so
a caller could pass `360.0` (float) by accident. The standard amortization
formula works with either, but:

1. The Decimal path requires an exact integer exponent for `(1+r)^n`
2. A fractional term (e.g. `360.5`) would represent a half-month payment,
   which is non-standard for DSCR
3. Silent acceptance could mask data pipeline bugs

The engine must reject non-int with `TypeError`.

## Expected Behavior

**Reject with TypeError** — message must include the offending type name.

```python
with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, 360.0)

with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, "360")  # string also rejected

with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, None)
```

**NOTE:** `bool` is a subclass of `int` in Python. `payment_factor(7.0, True)`
must be accepted as n=1 (not raise TypeError). This is intentional —
`isinstance(True, int) == True`.

## Mathematical Analysis

No math — type guard. The `if not isinstance(n_months, int): raise TypeError(...)`
check fires before any formula evaluation.

For `np.int64` (numpy integer), the engine should also accept it
(`isinstance(np.int64(360), int)` is False in some Python versions).
This is a potential future enhancement — see "Implementation Order".

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(n=st.floats(min_value=1.0, max_value=600.0, allow_nan=False, allow_infinity=False))
def test_payment_factor_rejects_float_term(n):
    """Any float n (including whole-number floats) must raise TypeError."""
    with pytest.raises(TypeError, match="n_months must be int"):
        payment_factor(7.0, n)

def test_payment_factor_rejects_string_term():
    with pytest.raises(TypeError, match="n_months must be int"):
        payment_factor(7.0, "360")

def test_payment_factor_accepts_numpy_int64():
    """numpy int64 is a common interop type and should be accepted."""
    import numpy as np
    # Currently fails; documenting the expected enhancement
    with pytest.raises((TypeError, ValueError)):  # currently TypeError
        payment_factor(7.0, np.int64(360))
```

## Reference Behavior

**numpy-financial:** Does NOT enforce int on `nper`. Accepts float silently;
the internal cast to array allows floats. `pmt(0.07/12, 360.5, -100000)`
returns a slightly different payment than `pmt(0.07/12, 360, -100000)`.

**Excel:** `NPER` is always int (cell format enforces numeric integer);
no float allowed in formula entry.

**Python's decimal.Decimal:** `Decimal('360.5') ** Decimal('12')` works but
loses precision in unexpected ways. The DSCR engine's strict int requirement
is safer than numpy-financial's lax float acceptance.

**QuantLib:** `ql.AmortizingLoan` requires integer periods. Same as our
strict requirement.

## Confidence Score

**4/5** — type validation is correct; only nuance is `numpy.int64`
interoperability (currently rejected but should ideally be accepted).

## Implementation Order

**Priority:** High. Already tested at `test_payment.py:63-65`
(`test_factor_rejects_float_term`); add property-based version for floats
between 1.0 and 600.0 inclusive of all edge sub-cases (e.g., 360.000001).
