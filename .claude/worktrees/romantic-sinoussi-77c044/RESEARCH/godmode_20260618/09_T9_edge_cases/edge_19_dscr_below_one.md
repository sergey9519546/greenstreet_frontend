---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 19 — DSCR = 0.995 (Negative Decision)
summary: "**Edge case:** `track_decision(0.995, 0.995)` — DSCR just below 1.0"
entities:
  - concept/dscr
  - data/fannie-mae
  - lender/pennymac
  - slice/1
  - state/de
  - topic/multifamily
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_19_dscr_below_one.md
vaulted_at: 2026-06-20
---
# Edge Case 19 — DSCR = 0.995 (Negative Decision)

**Edge case:** `track_decision(0.995, 0.995)` — DSCR just below 1.0
**Source function:** `dscr_core.dscr.track_decision`
**Test category:** boundary (just below 1.0); KILL/STRUCT_OPP decision
**Slice assignment:** Slice 1 (current)

## Edge Case Description

DSCR = 0.995 is just below the 1.0 threshold. The property barely fails
to cover its debt service. The decision should be:

- (0.995, 0.995) → KILL (both fail)
- (0.995, 1.005) → STRUCTURING_OPPORTUNITY (T1 fail, T2 pass)
- (1.005, 0.995) → TRAP (T1 pass, T2 fail)

The asymmetry vs Edge 17 (DSCR = 1.0) is exactly what tests the `>=`
operator's behavior.

## Expected Behavior

**Reject (KILL)** when both tracks below 1.0:

```python
assert track_decision(0.995, 0.995) == TrackDecision.KILL
assert track_decision(0.99, 0.99) == TrackDecision.KILL
```

**STRUCTURING_OPPORTUNITY** when T1 fails but T2 passes:
```python
assert track_decision(0.995, 1.005) == TrackDecision.STRUCTURING_OPPORTUNITY
```

**TRAP** when T1 passes but T2 fails:
```python
assert track_decision(1.005, 0.995) == TrackDecision.TRAP
```

## Mathematical Analysis

At 0.995, the property is short by 0.5% on debt service coverage.
The decision depends on the matrix cell:

```
            T2 = 0.995    T2 = 1.005
T1 = 0.995  KILL          STRUCT_OPP
T1 = 1.005  TRAP          GREEN
```

The `>=` at `dscr.py:194-195` is critical: `0.995 >= 1.0` is False, so
the T1 pass/fail is correctly False.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(t1=st.floats(min_value=0.99, max_value=0.9999, allow_nan=False),
       t2=st.floats(min_value=0.99, max_value=0.9999))
def test_track_decision_both_below_one_kill(t1, t2):
    """Both tracks below 1.0 → KILL."""
    assert track_decision(t1, t2) == TrackDecision.KILL

@given(t1=st.floats(min_value=0.99, max_value=0.9999),
       t2=st.floats(min_value=1.0001, max_value=1.10))
def test_track_decision_t1_fail_t2_pass_struct_opp(t1, t2):
    """T1 below, T2 above → STRUCTURING_OPPORTUNITY."""
    assert track_decision(t1, t2) == TrackDecision.STRUCTURING_OPPORTUNITY

def test_track_decision_at_995_995():
    """The negative decision boundary: track_decision(0.995, 0.995) == KILL."""
    assert track_decision(0.995, 0.995) == TrackDecision.KILL
```

## Reference Behavior

**Pennymac DSCR:** Below 1.0 is a fail. Some "no-ratio DSCR" lenders
(AHLend) allow 0.75x. Our threshold of 1.0 matches Pennymac's standard.

**No-Ratio DSCR Loans (AHLend, Delaware Mortgage):**
"AHL finances deals down to 0.75x DSCR" — but this is for no-ratio
products where income verification is waived. Our standard DSCR engine
uses 1.0 as the threshold.
Source: <https://ahlend.com/no-ratio-dscr-loans/>

**Truss Financial Group:** "Yes, it is possible to get a DSCR loan even
if your Debt Service Coverage Ratio (DSCR) is below 1.0." But this is for
specialty programs, not standard DSCR.
Source: <https://trussfinancialgroup.com/blog/dscr-loan-below-1>

**Fannie Mae Multifamily:** Min DSCR 1.20-1.25 for small MAH loans.

**Standard convention:** DSCR < 1.0 is a fail. KILL decision matches.

## Confidence Score

**5/5** — trivial decision matrix; well-defined boundaries.

## Implementation Order

**Priority:** High. The `test_kill_when_both_fail` test at `test_dscr.py:169-170`
covers part of this. Add the specific 0.995/0.995 boundary test plus
property-based coverage for the [0.99, 0.9999] range.
