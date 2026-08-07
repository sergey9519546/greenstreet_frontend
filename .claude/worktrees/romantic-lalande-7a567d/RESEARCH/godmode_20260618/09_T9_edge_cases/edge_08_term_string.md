---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 08 — Term as String (Rejected Type Error)
summary: "**Edge case:** `payment_factor(rate, \"360\")` — passing string where int expected"
entities:
  - concept/dscr
  - slice/1
  - topic/str
tags:
  - topic/default-rate
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_08_term_string.md
vaulted_at: 2026-06-20
---
# Edge Case 08 — Term as String (Rejected Type Error)

**Edge case:** `payment_factor(rate, "360")` — passing string where int expected
**Source function:** `dscr_core.payment.payment_factor`
**Test category:** error-path; type-check on string
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A common bug in data pipelines is passing string-typed numbers from CSV
imports or JSON loads. Python's dynamic typing means `payment_factor(7.0,
"360")` would otherwise fall through to the formula with a string exponent,
which `Decimal.__pow__` would either reject or silently coerce.

The engine must explicitly reject strings (and other non-int, non-bool,
non-numpy.int64 types) with `TypeError`.

## Expected Behavior

**Reject with TypeError.**

```python
with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, "360")

with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, "thirty years")  # gibberish

with pytest.raises(TypeError, match="n_months must be int"):
    payment_factor(7.0, b"360")  # bytes — also string-like
```

## Mathematical Analysis

No math — pure type guard. The `if not isinstance(n_months, int): raise
TypeError(...)` check catches strings before any computation.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(s=st.text(min_size=1, max_size=10))
def test_payment_factor_rejects_any_string(s):
    """Any non-empty string must raise TypeError."""
    with pytest.raises(TypeError, match="n_months must be int"):
        payment_factor(7.0, s)

def test_payment_factor_rejects_empty_string():
    with pytest.raises(TypeError, match="n_months must be int"):
        payment_factor(7.0, "")

def test_payment_factor_rejects_numeric_string():
    """Even a numeric-looking string must be rejected (explicit type discipline)."""
    with pytest.raises(TypeError, match="n_months must be int"):
        payment_factor(7.0, "360.0")
```

## Reference Behavior

**numpy-financial:** No string rejection; `pmt(0.07/12, "360", -100000)`
raises `numpy.core._exceptions._UFuncOutputCastingError` deep in the stack —
poor error message, hard to debug.

**Python's built-in:** `int("360")` succeeds; `"360" ** 2` raises `TypeError`.
Our guard catches the issue at the function boundary.

**pandas:** `pd.read_csv` infers int dtype by default, so strings from CSV
are typically auto-converted. The bug arises when users force
`dtype=str` or pass through `dict` literals from JSON.

**Best practice (pydantic, mypy):** Type validation at function boundary
is the canonical defense — exactly what our guard does.

## Confidence Score

**5/5** — pure type validation; aligns with all modern Python best practices.

## Implementation Order

**Priority:** Medium. The existing `test_factor_rejects_float_term` covers
float rejection, but strings are not explicitly tested. Add a string
rejection test to `test_payment.py::TestPaymentFactor::test_factor_rejects_string_term`.
