---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 06 — Loan = -1 (Rejected Negative Principal)
summary: "**Edge case:** `pi(-1, rate, n)` — negative loan principal (must reject)"
entities:
  - concept/dscr
  - slice/1
  - tax/pal
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_06_loan_negative_one.md
vaulted_at: 2026-06-20
---
# Edge Case 06 — Loan = -1 (Rejected Negative Principal)

**Edge case:** `pi(-1, rate, n)` — negative loan principal (must reject)
**Source function:** `dscr_core.payment.pi` (rejects negative per
`payment.py:82-83`)
**Test category:** error-path; type-check on sign
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A negative loan amount is nonsensical — you cannot borrow a negative amount
of money. It indicates a data error: the user might have entered a sign
wrong, an upstream pipeline flipped the sign, or the value was used as
"net cash flow" instead of "loan principal". The engine must reject with
a clear `ValueError` so the upstream caller knows to fix the input.

## Expected Behavior

**Reject with ValueError** — message must include the offending value
for debuggability.

```python
with pytest.raises(ValueError, match="loan must be >= 0, got -1"):
    pi(-1, 7.0, 360)

with pytest.raises(ValueError, match="loan must be >= 0"):
    pi(-1_000_000, 7.0)  # large negative also rejected
```

## Mathematical Analysis

No math — pure input validation. The `if loan < 0: raise ValueError(...)`
guard fires before any formula evaluation.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(loan=st.floats(max_value=-1e-9, allow_nan=False, allow_infinity=False))
def test_pi_rejects_any_negative_loan(loan):
    """Any loan < 0 must raise ValueError, no matter how close to zero."""
    with pytest.raises(ValueError, match="loan must be >= 0"):
        pi(loan, 7.0, 360)

def test_pi_rejects_specific_negative_one():
    """The -1 sentinel must be rejected with a clear message."""
    with pytest.raises(ValueError) as exc_info:
        pi(-1, 7.0, 360)
    assert "-1" in str(exc_info.value)
    assert "loan must be >= 0" in str(exc_info.value)
```

## Reference Behavior

**numpy-financial.pmt:** Does NOT explicitly reject negative `pv`. The
formula still computes (treats `pv < 0` as an inflow, so `pmt` becomes
positive — i.e., the "borrower" is receiving money). This is a numpy-
financial silent-failure mode; our explicit rejection is stricter and
safer.

**Excel PMT:** No sign validation. Returns nonsense for `pv < 0`.

**Bankrate:** UI rejects; underlying formula returns same nonsense as Excel.

**Best practice (Koyfin, Polygon, S&P ClariFI):** All require positive
principal. Our explicit guard matches industry standard.

## Confidence Score

**5/5** — pure validation; no math edge case.

## Implementation Order

**Priority:** High. Already tested at `test_payment.py:79-81`
(`test_pi_rejects_negative_loan`); the property-based extension adds
coverage for edge values like -1e-9 and -1.
