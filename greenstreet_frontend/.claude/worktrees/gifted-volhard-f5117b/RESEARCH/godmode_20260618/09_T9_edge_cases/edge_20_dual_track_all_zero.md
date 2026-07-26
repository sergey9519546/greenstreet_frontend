---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 20 — DualTrack with All-Zero Inputs
summary: "**Edge case:** `dual_track(0, 0, 0, 0, 0, 0, pitia)` — all rent/lease/appraisal = 0"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/pennymac
  - slice/1
  - topic/str
tags:
  - topic/default-rate
  - topic/portfolio
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_20_dual_track_all_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 20 — DualTrack with All-Zero Inputs

**Edge case:** `dual_track(0, 0, 0, 0, 0, 0, pitia)` — all rent/lease/appraisal = 0
**Source function:** `dscr_core.dscr.dual_track`
**Test category:** boundary (degenerate input); all-zero
**Slice assignment:** Slice 1 (current)

## Edge Case Description

The `dual_track` function takes lease rent, appraisal rent, and gross
rent — all of which could be zero simultaneously in degenerate cases:

- Property is entirely vacant (no in-place lease, no market comp because
  it's a unique property)
- Bug in upstream pipeline (all rents default to 0)
- Stress scenario: "what if the property has no income at all?"

The function must handle this gracefully — return all-zero DSCR with
KILL decision, not crash.

## Expected Behavior

**Accept all-zero inputs** — return dict with all-zero DSCR and KILL
decision.

```python
result = dual_track(0, 0, 0, 0.05, 0.08, 0.05, pitia=2853.985)
assert result["qualifying_rent"] == 0
assert result["dscr_t1"] == 0.0
assert result["dscr_t2"] == 0.0
assert result["dscr_t1_rounded"] == 0.0
assert result["dscr_t2_rounded"] == 0.0
assert result["t1_pass"] is False
assert result["t2_pass"] is False
assert result["both_pass"] is False
assert result["decision"] == TrackDecision.KILL
```

## Mathematical Analysis

When all rents are 0:
```
qualifying_rent = min(0, 0) = 0
DSCR T1 = 0 / PITIA = 0
DSCR T2 = (0 * 0.95 - 0 * 0.13) / PITIA = 0 / PITIA = 0
```

Both tracks are 0, both fail (0 < 1.0), so decision is KILL.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(pitia=st.floats(min_value=0.01, max_value=10000.0, allow_nan=False),
       vac=st.floats(min_value=0.0, max_value=1.0),
       mgmt=st.floats(min_value=0.0, max_value=0.5),
       maint=st.floats(min_value=0.0, max_value=0.5))
def test_dual_track_all_zero_rents(pitia, vac, mgmt, maint):
    """dual_track(0, 0, 0, ...) must return all-zero DSCR and KILL."""
    # Sanity guard: vac + mgmt <= 1.5
    if vac + mgmt > 1.5:
        return
    result = dual_track(0, 0, 0, vac, mgmt, maint, pitia=pitia)
    assert result["qualifying_rent"] == 0
    assert result["dscr_t1"] == 0.0
    assert result["dscr_t2"] == 0.0
    assert result["decision"] == TrackDecision.KILL
```

## Reference Behavior

**JPMorgan Chase:** DSCR of 0 means no income covers no debt — fails
qualification. KILL.

**Pennymac DSCR:** Min DSCR 1.0. Zero DSCR is automatic fail.

**No lender convention** for all-zero inputs — typically the deal would
never get this far in underwriting. But the engine must not crash.

**No reference implementation has explicit handling** for all-zero
because the inputs are usually validated upstream. Our test guards
against downstream crash.

## Confidence Score

**5/5** — trivial case; well-defined math.

## Implementation Order

**Priority:** High. Add `test_dual_track_all_zero_rents` to
`test_dscr.py::TestDualTrack`. This is the most common "vacant property"
scenario in real DSCR portfolios and must not crash.
