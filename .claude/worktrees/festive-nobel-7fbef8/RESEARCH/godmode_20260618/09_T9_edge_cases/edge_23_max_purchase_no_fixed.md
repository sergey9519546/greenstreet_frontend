---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 23 — Max-Purchase Without Fixed Costs (Raises)
summary: "**Edge case:** `max_purchase_price(target_dscr, rate, hoa_monthly=0, ...)` — no fixed costs"
entities:
  - concept/dscr
  - concept/ltv
  - slice/1
  - topic/str
tags:
  - topic/default-rate
  - topic/flood-insurance
  - topic/insurance
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_23_max_purchase_no_fixed.md
vaulted_at: 2026-06-20
---
# Edge Case 23 — Max-Purchase Without Fixed Costs (Raises)

**Edge case:** `max_purchase_price(target_dscr, rate, hoa_monthly=0, ...)` — no fixed costs
**Source function:** `dscr_core.leverage.max_purchase_price`
**Test category:** boundary; degenerate closed-form
**Slice assignment:** Slice 1 (current)

## Edge Case Description

When all fixed costs (HOA, flood, MI) are zero, the closed-form max-purchase
formula at `leverage.py:249-251` simplifies to:

```
V* = target * c / (a - target * b)
```

With `c = 0` (no fixed costs), `V* = 0`. But this is the LIMIT, not the
actual max — at any positive value, DSCR is bounded by the asymptotic
ratio `rent_per_value_yr / 12 / (ltv * pf + (tax + ins) / 12)`.

When `c = 0`, the bisection at `leverage.py:330-341` may find the wrong
bracket because `dscr_at_value` at low values still satisfies the target.
Specifically:

- At `min_value = $1,000`: DSCR ≈ (1000 * rent_yield) / (1000 * ltv * pf) = rent_yield / (ltv * pf)
  ≈ 0.0847 / (0.75 * 0.00665) ≈ 17.0 (way above 1.0 target)
- At `max_value = $100M`: same ratio → DSCR still 17.0

Both bracket ends are above target, so the bisection finds the WRONG
direction. The function correctly raises at `leverage.py:318-322`.

## Expected Behavior

**Reject with ValueError** — message identifies "qualifies even at min_value".

```python
with pytest.raises(ValueError, match="qualifies even at min_value"):
    max_purchase_price(
        target_dscr=1.05,
        rate_pct=7.00,
        hoa_monthly=0,
        flood_monthly=0,
        mi_monthly=0,
    )
```

## Mathematical Analysis

Without fixed costs, DSCR is purely a ratio of yield to cost-of-capital:
```
DSCR = (V * yield / 12) / (V * ltv * pf + V * tax_factor / 12 + V * ins_factor / 12)
     = yield / (ltv * pf + tax/12 + ins/12)  # V cancels
     = constant for all V
```

If this constant > target, the deal always qualifies → no max price exists.
The function correctly rejects.

For the golden defaults:
```
yield / (ltv * pf + tax/12 + ins/12) = 0.0847 / (0.75 * 0.00665 + 0.018/12)
                                    = 0.007058 / (0.004989 + 0.0015)
                                    = 0.007058 / 0.006489
                                    = 1.0876
```

1.0876 > 1.05 target → no max price → ValueError raised.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(target=st.floats(min_value=1.0, max_value=1.05),
       yield_=st.floats(min_value=0.06, max_value=0.12),
       ltv=st.floats(min_value=0.5, max_value=0.9),
       rate=st.floats(min_value=4.0, max_value=10.0))
def test_max_purchase_price_no_fixed_costs_raises(target, yield_, ltv, rate):
    """No fixed costs combined with yield > cost-of-capital → no max price."""
    pf = payment_factor(rate, 360)
    asymptotic_dscr = yield_ / (ltv * pf + 0.018)
    if asymptotic_dscr > target:
        with pytest.raises(ValueError, match="qualifies even at min_value"):
            max_purchase_price(
                target_dscr=target,
                rate_pct=rate,
                rent_per_value_yr=yield_,
                tax_factor=0.012,
                insurance_factor=0.006,
                hoa_monthly=0,
                ltv=ltv,
                n_months=360,
            )
```

## Reference Behavior

**scipy.optimize.brentq:** Same bracket-sign-change requirement as
`deal_break_rate`.

**No reference implementation** has the closed-form `V* = c/(a-b)`
formula; this is our internal optimization.

**Bankrate:** No equivalent feature.

**Industry DSCR underwriting:** Always has fixed costs (taxes, insurance).
A zero-fixed-cost scenario is artificial.

## Confidence Score

**4/5** — the rejection is correct, but the error message could be more
specific. Could be improved to "DSCR asymptotically exceeds target —
add fixed costs (HOA/flood/MI) to bound the max price".

## Implementation Order

**Priority:** Medium. This case is partially covered by the existing
golden vector test (max_purchase_price with hoa_monthly=150 returns a
specific value). Add the explicit "no fixed costs raises" test.
