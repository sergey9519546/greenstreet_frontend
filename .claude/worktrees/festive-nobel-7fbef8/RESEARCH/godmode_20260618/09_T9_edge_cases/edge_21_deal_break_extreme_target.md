---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 21 — Deal-Break Rate with Extreme Target (2.0)
summary: "**Edge case:** `deal_break_rate(loan, 2.0, rent, ...)` — DSCR target 2.0 (very high)"
entities:
  - concept/dscr
  - slice/1
  - topic/str
tags:
  - topic/insurance
  - topic/stress-test
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_21_deal_break_extreme_target.md
vaulted_at: 2026-06-20
---
# Edge Case 21 — Deal-Break Rate with Extreme Target (2.0)

**Edge case:** `deal_break_rate(loan, 2.0, rent, ...)` — DSCR target 2.0 (very high)
**Source function:** `dscr_core.leverage.deal_break_rate` (rejects at `leverage.py:202-207`)
**Test category:** error-path; unreachable target
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A DSCR target of 2.0 means "income must be 2× debt service" — extremely
conservative. Most real DSCR products require 1.0-1.25; 2.0 is reserved
for super-prime CRE or stress test scenarios.

This edge case verifies that:

1. The deal never qualifies at 0% (even no-interest scenario doesn't reach 2.0)
2. The function raises a clear ValueError
3. The error message identifies the failure (DSCR at min rate)

This is the "underwater" or "unworkable deal" guard at `leverage.py:202-207`.

## Expected Behavior

**Reject with ValueError** — message identifies "does not qualify at minimum rate".

```python
with pytest.raises(ValueError, match="does not qualify at minimum rate"):
    deal_break_rate(
        loan=1_000_000,  # large loan
        target_dscr=2.0,  # unreachable target
        rent_monthly=3000,
        tax_annual=5000,
        insurance_annual=2000,
        hoa_monthly=150,
    )
```

## Mathematical Analysis

For a deal to qualify at target DSCR = 2.0 at rate = 0%:
```
DSCR at 0% = rent / (loan/n + tax/12 + ins/12 + hoa)
```

For rent = $3000/mo, loan = $1M, n = 360 (30yr):
```
P&I at 0% = 1,000,000 / 360 = $2,777.78/mo
DSCR = 3000 / 2777.78 = 1.08
```

DSCR at 0% is only 1.08, far below target 2.0. The function correctly
rejects.

The function checks `f_low < 0` at `leverage.py:202` — meaning DSCR at
min_rate is below target — and raises.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(target_dscr=st.floats(min_value=1.5, max_value=10.0, allow_nan=False),
       loan=st.floats(min_value=100_000, max_value=5_000_000),
       rent=st.floats(min_value=100, max_value=10_000))
def test_deal_break_rate_unreachable_target_raises(target_dscr, loan, rent):
    """Target DSCR > achievable max DSCR must raise ValueError."""
    # Realistic DSCR at 0% is bounded by rent/P&I_at_0 = rent*n/loan
    max_dscr_at_zero = (rent * 360) / loan  # 0% interest, 30yr
    if target_dscr > max_dscr_at_zero:
        with pytest.raises(ValueError, match="does not qualify at minimum rate"):
            deal_break_rate(
                loan=loan,
                target_dscr=target_dscr,
                rent_monthly=rent,
                n_months=360,
            )
```

## Reference Behavior

**scipy.optimize.brentq** (reference implementation):
"If f(a) and f(b) have the same sign, a ValueError is raised."
Source: <https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.brentq.html>

Our `deal_break_rate` adds the explicit "unreachable target" check BEFORE
calling brentq, with a clearer error message ("does not qualify at minimum
rate") that helps the user diagnose the problem.

**Brent (1971) original algorithm:**
"An algorithm with guaranteed convergence for finding a zero of a function."
Requires a sign change in the bracket. Same as scipy.

**Bankrate / mortgagecalculator.org:** No built-in "deal break rate" feature;
the user must run the calculator multiple times to find it manually.

**Industry DSCR lenders:** Target 1.0-1.25 typical. 2.0 is not a real
product target but useful for stress testing.

## Confidence Score

**5/5** — well-defined error path; aligns with scipy.optimize.brentq
conventions.

## Implementation Order

**Priority:** High. Already tested at `test_leverage.py:61-71`
(`test_underwater_deal_raises`). The property-based version adds coverage
for the full range of unreachable targets.
