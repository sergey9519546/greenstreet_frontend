---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 24 — Max-Purchase with Infinite LTV (Raises)
summary: "**Edge case:** `max_purchase_price(target, rate, ltv=1.5)` — LTV > 1"
entities:
  - concept/dscr
  - concept/ltv
  - data/fannie-mae
  - lender/angel-oak
  - lender/easy-street
  - lender/kiavi
  - lender/newfi
  - lender/pennymac
  - slice/1
  - topic/non-qm
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_24_max_purchase_ltv.md
vaulted_at: 2026-06-20
---
# Edge Case 24 — Max-Purchase with Infinite LTV (Raises)

**Edge case:** `max_purchase_price(target, rate, ltv=1.5)` — LTV > 1
**Source function:** `dscr_core.leverage.max_purchase_price` (rejects at `leverage.py:275-276`)
**Test category:** error-path; out-of-range LTV
**Slice assignment:** Slice 1 (current)

## Edge Case Description

LTV > 1 means the loan amount exceeds the property value — this would
imply negative down payment, which is nonsensical. The engine must reject
with ValueError.

The guard at `leverage.py:275-276`: `if not 0 < ltv < 1`.

LTV = 0 also rejected (no loan means no DSCR concept).
LTV = 1 rejected (100% LTV = no equity, no real-world underwriting).

## Expected Behavior

**Reject with ValueError** for any LTV outside (0, 1).

```python
with pytest.raises(ValueError, match="ltv must be in"):
    max_purchase_price(1.05, 7.00, ltv=1.5)  # LTV > 1

with pytest.raises(ValueError, match="ltv must be in"):
    max_purchase_price(1.05, 7.00, ltv=0)    # LTV = 0

with pytest.raises(ValueError, match="ltv must be in"):
    max_purchase_price(1.05, 7.00, ltv=-0.1)  # negative LTV

with pytest.raises(ValueError, match="ltv must be in"):
    max_purchase_price(1.05, 7.00, ltv=1.0)   # boundary
```

## Mathematical Analysis

`ltv = loan / value`:
- ltv > 1: loan > value → negative equity at origination
- ltv = 1: 100% LTV → zero down payment (no DSCR loan product supports this)
- ltv = 0: no loan → no DSCR concept (cash buyer)

Real DSCR products: 65-80% LTV typical, 85% max (Kiavi), 90% in rare cases.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(ltv=st.floats(min_value=-1.0, max_value=2.0, allow_nan=False))
def test_max_purchase_price_rejects_ltv_out_of_range(ltv):
    """LTV must be in (0, 1) exclusive."""
    if not (0 < ltv < 1):
        with pytest.raises(ValueError, match="ltv must be in"):
            max_purchase_price(1.05, 7.00, ltv=ltv)

def test_max_purchase_price_accepts_typical_ltv():
    """LTV in typical range (0.5-0.85) must be accepted."""
    for ltv in [0.5, 0.65, 0.75, 0.80, 0.85]:
        result = max_purchase_price(1.05, 7.00, ltv=ltv, hoa_monthly=150)
        assert result > 0
```

## Reference Behavior

**Pennymac DSCR:** Max LTV 80% for purchases, 75% for rate/term refi,
70% for cash-out refi.
Source: <https://corr.pennymac.com/assets/documents/non-qm-resources/non-qm-dscr-product-profile.pdf>

**Fannie Mae HomeReady:** Max LTV 97% (but requires income, not DSCR).

**Kiavi:** Max LTV 80% for DSCR.
Source: <https://www.kiavi.com/lender-products> (verified 2026-06-18 via profile in RESEARCH/domain_3/lender_kiavi_profile.md)

**Newfi, Easy Street, Angel Oak:** Max LTV 80% typical.

**Conventional:** No DSCR product supports LTV > 100% by definition.

## Confidence Score

**5/5** — pure validation; universal convention.

## Implementation Order

**Priority:** High. The existing `test_deal_break_increases_with_rent`
and similar tests don't explicitly cover LTV out-of-range. Add explicit
LTV boundary tests.
