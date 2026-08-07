---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 05 — Loan = 0 (Zero Principal)
summary: "**Edge case:** `pi(0, rate, n)` — zero principal, no money borrowed"
entities:
  - concept/dscr
  - slice/1
  - tax/pal
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_05_loan_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 05 — Loan = 0 (Zero Principal)

**Edge case:** `pi(0, rate, n)` — zero principal, no money borrowed
**Source function:** `dscr_core.payment.pi` (accept 0; reject negative)
**Test category:** boundary (zero); degenerate input
**Slice assignment:** Slice 1 (current — guard at `payment.py:82-83`)

## Edge Case Description

A loan amount of exactly $0 represents "no loan" — could arise in:

- A DSCR model where the property is all-cash (no financing)
- A refinance scenario where the borrower paid off the loan
- Stress scenario showing what happens with zero leverage
- Bug in upstream data where loan field is missing

The function must accept 0 and return 0 (no payment on no loan). It must
reject negative loan amounts.

## Expected Behavior

**Accept 0** — return 0.0 regardless of rate and term.

```python
assert pi(0, 7.0, 360) == 0.0
assert pi(0, 0.0, 360) == 0.0
assert pi(0, 50.0, 12) == 0.0
```

**Reject negative** — raise `ValueError` per existing guard at
`payment.py:82-83`.

```python
with pytest.raises(ValueError, match="loan must be >= 0"):
    pi(-1000, 7.0)
```

## Mathematical Analysis

`pi(loan, rate, n) = loan * payment_factor(rate, n)`

When `loan = 0`:
```
pi(0, r, n) = 0 * payment_factor(r, n) = 0
```

This is exact (no floating-point edge case) because `0 * anything = 0` in
IEEE 754. The `payment_factor` function is still called, which is fine
because the rate/term validation happens inside `payment_factor`.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rate=st.floats(min_value=0.0, max_value=20.0, allow_nan=False),
       n=st.integers(min_value=12, max_value=600))
def test_pi_zero_loan_is_zero(rate, n):
    """pi(0, r, n) must be exactly 0.0 for any valid rate/term."""
    assert pi(0.0, rate, n) == 0.0

@given(loan=st.floats(min_value=-1e6, max_value=-0.01, allow_nan=False))
def test_pi_rejects_negative_loan(loan):
    """Negative loan amounts must raise ValueError."""
    with pytest.raises(ValueError, match="loan must be >= 0"):
        pi(loan, 7.0)
```

## Reference Behavior

**numpy-financial.pmt:** Accepts `pv=0` and returns 0.0 for the payment (no
cash flow on no balance). Matches our behavior.

**Excel PMT(rate, nper, 0):** Returns $0.00 — same.

**Bankrate mortgage calculator:** Rejects loan amount of $0 in the UI.
Underlying formula returns $0 if forced.

**Investopedia amortization calculator:** Same as Bankrate — UI rejects 0.

## Confidence Score

**5/5** — universal convention; trivial math.

## Implementation Order

**Priority:** High. Already tested at `test_payment.py:76-77`
(`test_pi_zero_loan`); the property-based extension in this spec is a
strict superset. Add as a property test for broader coverage.
