---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 22 — Deal-Break Rate with Extreme Rent ($100K)
summary: "**Edge case:** `deal_break_rate(loan, target, 100_000, ...)` — absurdly high rent"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - slice/1
  - topic/sfr
  - topic/str
tags:
  - topic/default-rate
  - topic/insurance
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_22_deal_break_extreme_rent.md
vaulted_at: 2026-06-20
---
# Edge Case 22 — Deal-Break Rate with Extreme Rent ($100K)

**Edge case:** `deal_break_rate(loan, target, 100_000, ...)` — absurdly high rent
**Source function:** `dscr_core.leverage.deal_break_rate` (rejects at `leverage.py:208-213`)
**Test category:** error-path; super-qualified deal
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A rent of $100K/month ($1.2M/year) for a residential DSCR loan is absurd —
typical SFR rent is $1,500-$5,000/mo. This edge case catches:

- Data pipeline sign flip (rent entered as $100K instead of $100K annual)
- Currency conversion error (foreign currency)
- Test data that wasn't scaled down

The function must detect "deal qualifies even at maximum rate" and raise
because the bracket `[min_rate, max_rate]` does not contain the root.

## Expected Behavior

**Reject with ValueError** — message identifies "qualifies even at maximum rate".

```python
with pytest.raises(ValueError, match="qualifies even at maximum rate"):
    deal_break_rate(
        loan=100_000,
        target_dscr=1.0,
        rent_monthly=100_000,  # absurd rent
        tax_annual=0,
        insurance_annual=0,
        hoa_monthly=0,
    )
```

## Mathematical Analysis

At rate = 20% (max_rate_pct default), rent = $100K, loan = $100K, n = 360:
```
payment_factor(20, 360) ≈ 0.01613
P&I = 100000 * 0.01613 = $1,613/mo
PITIA (no tax/ins/hoa) = $1,613
DSCR = 100000 / 1613 = 62.0  (way above target 1.0)
```

DSCR at max rate is 62.0, still far above 1.0 target. The bracket
[0%, 20%] does not contain the root. Function correctly raises at
`leverage.py:208-213`.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rent=st.floats(min_value=50_000, max_value=10_000_000),
       loan=st.floats(min_value=10_000, max_value=500_000))
def test_deal_break_rate_extreme_rent_raises(rent, loan):
    """Extreme rent (DSCR at max_rate still > target) must raise ValueError."""
    # At max rate (20%), DSCR = rent / (loan * payment_factor(20, 360))
    pf_20 = payment_factor(20.0, 360)
    max_dscr = rent / (loan * pf_20)
    if max_dscr > 1.0:  # target
        with pytest.raises(ValueError, match="qualifies even at maximum rate"):
            deal_break_rate(
                loan=loan,
                target_dscr=1.0,
                rent_monthly=rent,
                tax_annual=0,
                insurance_annual=0,
                hoa_monthly=0,
            )
```

## Reference Behavior

**scipy.optimize.brentq:**
"Brent's method requires f(a) and f(b) to have opposite signs."
If both same sign, ValueError raised by scipy.
Source: <https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.brentq.html>

Our `deal_break_rate` pre-checks the bracket (`f_low < 0`, `f_high > 0`)
at `leverage.py:199-213` and raises with a domain-specific message that
helps the user (e.g., "qualifies even at maximum rate 20%").

**Brent (1971) algorithm:** Same behavior — requires sign change.

**Bankrate:** No equivalent feature; user must trial-and-error.

## Confidence Score

**5/5** — well-defined error path; aligns with scipy conventions.

## Implementation Order

**Priority:** High. Already tested at `test_leverage.py:73-83`
(`test_extreme_value_raises`). Property-based extension adds coverage
for the full range of extreme rent values.
