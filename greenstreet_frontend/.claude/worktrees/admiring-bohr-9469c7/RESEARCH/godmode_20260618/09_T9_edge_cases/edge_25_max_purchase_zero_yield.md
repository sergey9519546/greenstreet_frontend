---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 25 — Max-Purchase with Zero Rent Yield (Raises)
summary: "**Edge case:** `max_purchase_price(target, rate, rent_per_value_yr=0)` — no rent"
entities:
  - concept/dscr
  - slice/1
  - topic/multifamily
  - topic/sfr
  - topic/str
tags:
  - topic/default-rate
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_25_max_purchase_zero_yield.md
vaulted_at: 2026-06-20
---
# Edge Case 25 — Max-Purchase with Zero Rent Yield (Raises)

**Edge case:** `max_purchase_price(target, rate, rent_per_value_yr=0)` — no rent
**Source function:** `dscr_core.leverage.max_purchase_price` (rejects at `leverage.py:277-278`)
**Test category:** error-path; zero rent yield
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A rent yield of 0 means the property generates no income. This is
nonsensical for DSCR underwriting (no income = no debt coverage).

The guard at `leverage.py:277-278`: `if not 0 < rent_per_value_yr < 1`.

Real DSCR yields:
- Rentometer 2026 median US rental yield: 8.47% (0.0847)
- SFR: 6-10% typical
- Small multifamily: 7-12% typical
- STR (short-term rental): 10-15% gross yield (but with higher operating expenses)

## Expected Behavior

**Reject with ValueError** for any rent_yield outside (0, 1).

```python
with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
    max_purchase_price(1.05, 7.00, rent_per_value_yr=0.0)

with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
    max_purchase_price(1.05, 7.00, rent_per_value_yr=-0.01)

with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
    max_purchase_price(1.05, 7.00, rent_per_value_yr=1.5)  # > 100%

with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
    max_purchase_price(1.05, 7.00, rent_per_value_yr=1.0)   # boundary
```

## Mathematical Analysis

`rent_per_value_yr = annual_rent / value`:
- 0: no rent
- 1: rent = value (100% yield — suspicious, possibly gross not net)
- > 1: rent > value (likely error or unusual case like parking lot)

Real rent yields are 5-15% (0.05-0.15). The guard enforces the
mathematically valid range (0, 1).

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(yield_=st.floats(min_value=-1.0, max_value=2.0, allow_nan=False))
def test_max_purchase_price_rejects_yield_out_of_range(yield_):
    """rent_per_value_yr must be in (0, 1) exclusive."""
    if not (0 < yield_ < 1):
        with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
            max_purchase_price(1.05, 7.00, rent_per_value_yr=yield_)

def test_max_purchase_price_accepts_typical_yield():
    """Realistic yields (0.05-0.15) must be accepted."""
    for yield_ in [0.05, 0.0847, 0.10, 0.15]:
        result = max_purchase_price(1.05, 7.00, rent_per_value_yr=yield_, hoa_monthly=150)
        assert result > 0
```

## Reference Behavior

**Rentometer 2026 median:** 8.47% (0.0847) annual gross rent yield for US
single-family rental. Confirmed via Rentometer's published methodology.

**Mashvisor 2026 data:** STR (Airbnb) yields range 8-12% gross; small
multifamily 7-10% gross.

**Bankrate / mortgagecalculator.org:** No equivalent yield constraint —
they don't implement max-purchase.

**Sovereign Master v11.0:** Default `rent_per_value_yr=0.0847` matches
Rentometer median. Locked at `leverage.py:222`.

## Confidence Score

**5/5** — pure validation; aligns with industry standard yields.

## Implementation Order

**Priority:** High. Same as Edge 24 — add explicit boundary tests.
