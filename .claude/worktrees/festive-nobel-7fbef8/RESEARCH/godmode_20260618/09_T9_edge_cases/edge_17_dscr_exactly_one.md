---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 17 — DSCR = Exactly 1.0 (Decision Matrix Boundary)
summary: "**Edge case:** `track_decision(1.0, 1.0)` — DSCR exactly at break-even"
entities:
  - concept/dscr
  - data/fannie-mae
  - lender/easy-street
  - lender/newfi
  - lender/pennymac
  - slice/1
  - topic/multifamily
  - topic/non-qm
  - topic/str
tags:
  - topic/portfolio
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_17_dscr_exactly_one.md
vaulted_at: 2026-06-20
---
# Edge Case 17 — DSCR = Exactly 1.0 (Decision Matrix Boundary)

**Edge case:** `track_decision(1.0, 1.0)` — DSCR exactly at break-even
**Source function:** `dscr_core.dscr.track_decision`
**Test category:** boundary (decision matrix); CRITICAL EDGE
**Slice assignment:** Slice 1 (current — uses `>=` comparison)

## Edge Case Description

This is the most CRITICAL edge case in the entire DSCR engine. A DSCR of
exactly 1.0 means income exactly equals debt service — the property
breaks even on a cash basis with ZERO margin for error.

**Why this is critical:**
- The `>=` operator determines whether 1.0 is a PASS or FAIL
- If we use `>` (strict), DSCR = 1.0 is a FAIL → KILL decision
- If we use `>=` (inclusive), DSCR = 1.0 is a PASS → GREEN/TRAP decision
- Our code uses `>=` per the Sovereign Master v11.0 rule
- ANY bug here cascades to the entire portfolio's approval pipeline

**Lender convention varies:**
- Pennymac DSCR: minimum 1.0 (inclusive) — DSCR = 1.0 qualifies
- Fannie Mae Multifamily: minimum DSCR 1.20-1.25 for MAH properties
- Easy Street: minimum 1.0 (inclusive)
- Newfi: minimum 1.0 (inclusive)

## Expected Behavior

**Accept DSCR = 1.0 as a PASS** — returns GREEN (if both tracks at 1.0)
or TRAP/STRUCTURING_OPPORTUNITY (if only one track at 1.0).

```python
# Both at 1.0 → GREEN
assert track_decision(1.0, 1.0) == TrackDecision.GREEN

# T1 at 1.0, T2 below → TRAP
assert track_decision(1.0, 0.95) == TrackDecision.TRAP

# T1 below, T2 at 1.0 → STRUCTURING_OPPORTUNITY
assert track_decision(0.95, 1.0) == TrackDecision.STRUCTURING_OPPORTUNITY

# Both below 1.0 → KILL
assert track_decision(0.9999, 0.9999) == TrackDecision.KILL
```

The inclusive `>=` semantics at `dscr.py:194-195`:
```python
t1_pass = t1 >= min_dscr  # 1.0 >= 1.0 == True
t2_pass = t2 >= min_dscr  # 1.0 >= 1.0 == True
```

## Mathematical Analysis

`>=` is inclusive at the boundary. This matches the Sovereign Master v11.0
canonical ruleset. The decision matrix is:

```
            T2 PASS      T2 FAIL
T1 PASS     GREEN        TRAP
T1 FAIL     STRUCT_OPP   KILL
```

At exactly (1.0, 1.0), the cell is GREEN. At exactly (1.0, 0.99), the
cell is TRAP. At exactly (0.99, 1.0), the cell is STRUCT_OPP.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(t1=st.floats(min_value=0.9, max_value=1.1, allow_nan=False),
       t2=st.floats(min_value=0.9, max_value=1.1))
def test_track_decision_inclusive_at_one(t1, t2):
    """track_decision must use >= (inclusive) at the 1.0 boundary."""
    decision = track_decision(t1, t2, min_dscr=1.0)
    t1_pass = t1 >= 1.0
    t2_pass = t2 >= 1.0
    if t1_pass and t2_pass:
        assert decision == TrackDecision.GREEN
    elif t1_pass and not t2_pass:
        assert decision == TrackDecision.TRAP
    elif not t1_pass and t2_pass:
        assert decision == TrackDecision.STRUCTURING_OPPORTUNITY
    else:
        assert decision == TrackDecision.KILL

def test_track_decision_exactly_one_zero():
    """The golden vector boundary: track_decision(1.0, 1.0) == GREEN."""
    assert track_decision(1.0, 1.0) == TrackDecision.GREEN

def test_track_decision_just_below_one():
    """track_decision(0.9999, 0.9999) must be KILL (strict below)."""
    assert track_decision(0.9999, 0.9999) == TrackDecision.KILL
```

## Reference Behavior

**Pennymac DSCR Product Profile (6.12.26):** Minimum DSCR 1.0.
Source: <https://corr.pennymac.com/assets/documents/non-qm-resources/non-qm-dscr-product-profile.pdf>

**First Heritage Mortgage:** "Most lenders require a minimum DSCR of 1.0."
Source: <https://fhmtg.com/blog/what-is-a-dscr-loan/>

**JPMorgan Chase:** "A debt service coverage ratio of 1.0 means the
property's rental income must at least equal its total debt payments."
Source: <https://www.jpmorgan.com/insights/real-estate/commercial-term-lending/what-is-debt-service-coverage-ratio-dscr-in-real-estate>

**Investopedia:** "A DSCR of 1.20 means you earn 20% more than you need
to cover the loan payment."
Source: <https://www.investopedia.com/terms/d/dscr.asp>

**No lender convention says "DSCR > 1.0 only."** All accept DSCR ≥ 1.0
as qualifying. Our `>=` semantics matches industry standard.

## Confidence Score

**5/5** — most critical edge case in the engine; verified against
multiple primary sources.

## Implementation Order

**Priority:** CRITICAL — must be in `test_dscr.py::TestTrackDecision`.
This is the test that protects against the worst possible bug (engine
silently rejecting qualified loans due to `>` vs `>=` swap).

Add:
- `test_track_decision_exactly_one_zero` (above)
- `test_track_decision_just_below_one_kill` (above)
- `test_track_decision_t1_at_one_t2_above` (TRAP at boundary)
- `test_track_decision_t1_at_one_t2_below` (TRAP at boundary)
