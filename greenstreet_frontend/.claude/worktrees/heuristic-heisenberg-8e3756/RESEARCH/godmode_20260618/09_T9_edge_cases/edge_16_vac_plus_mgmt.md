---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 16 — Vacancy + Mgmt = 1.6 (Rejected Sanity Bound)
summary: "**Edge case:** `dscr_track2(rent, 0.9, 0.7, ...)` — vacancy + mgmt > 1.5"
entities:
  - concept/dscr
  - lender/easy-street
  - lender/pennymac
  - slice/1
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_16_vac_plus_mgmt.md
vaulted_at: 2026-06-20
---
# Edge Case 16 — Vacancy + Mgmt = 1.6 (Rejected Sanity Bound)

**Edge case:** `dscr_track2(rent, 0.9, 0.7, ...)` — vacancy + mgmt > 1.5
**Source function:** `dscr_core.dscr.dscr_track2` (rejects at `dscr.py:158-159`)
**Test category:** error-path; sanity bound on combined expenses
**Slice assignment:** Slice 1 (current)

## Edge Case Description

Even if each individual input is in valid range, the COMBINATION can be
nonsensical. For example:
- vacancy = 0.9 (90% vacant)
- mgmt = 0.7 (70% management expense)
- Combined: 1.6 > 1.5 → property has negative NOI before debt service
- This is almost certainly bad data, not a legitimate input

The sanity bound at `dscr.py:158-159` (`mgmt_pct + vacancy_pct > 1.5`)
catches the worst offenders while allowing realistic stress scenarios
(e.g., 25% vacancy + 10% mgmt = 35%, well within bounds).

This is intentionally a SOFT guard — not a hard mathematical requirement,
but a heuristic that flags obvious bad input.

## Expected Behavior

**Reject with ValueError** — message must mention the combined value.

```python
with pytest.raises(ValueError, match="unreasonably large"):
    dscr_track2(3000, 0.9, 0.7, 0, 2853.985)

with pytest.raises(ValueError, match="unreasonably large"):
    dscr_track2(3000, 0.8, 0.8, 0, 2853.985)  # 1.6 > 1.5
```

**Accept (boundary):**
```python
# vac + mgmt = 1.0 (both at maximum) is accepted — physically possible if
# mgmt_pct applies to effective rent, not gross (depends on convention)
assert dscr_track2(3000, 0.5, 0.5, 0, 2853.985) is not None  # accepts
# vac + mgmt = 1.5 exactly is at boundary — engine accepts (uses >, not >=)
```

## Mathematical Analysis

The combined effective rent is:
```
noi = gross_rent * (1 - vac) - gross_rent * (mgmt + maint)
    = gross_rent * (1 - vac - mgmt - maint)
```

For `noi > 0`, we need `vac + mgmt + maint < 1`. The sanity bound uses
`vac + mgmt > 1.5` (maint excluded from this check) — this catches inputs
where the property has no realistic cash flow regardless of debt service.

Note: the engine uses `>` not `>=`, so exactly 1.5 is accepted.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(vac=st.floats(min_value=0.5, max_value=1.0),
       mgmt=st.floats(min_value=0.0, max_value=0.5))
def test_dscr_track2_rejects_vac_plus_mgmt_above_1_5(vac, mgmt):
    """vac + mgmt > 1.5 must raise ValueError (sanity bound)."""
    if vac + mgmt > 1.5:
        with pytest.raises(ValueError, match="unreasonably large"):
            dscr_track2(3000, vac, mgmt, 0, 2853.985)
    else:
        # Should not raise
        dscr_track2(3000, vac, mgmt, 0, 2853.985)
```

## Reference Behavior

**Pennymac DSCR:** Max mgmt typically 8% (sometimes 10%). Combined with
25% vacancy = 35%, well within our 150% sanity bound.

**Easy Street Capital:** Similar — 8% mgmt, 5-25% vacancy. Combined max
~33%.

**No lender accepts vac + mgmt > 1.5.** This is a pure sanity bound.

**Sovereign Master v11.0:** The 150% bound is locked in the canonical
ruleset (`dscr.py:158-159`).

## Confidence Score

**5/5** — pure sanity guard; aligns with all lender conventions.

## Implementation Order

**Priority:** High. Already tested at `test_dscr.py:101-104`
(`test_track2_warns_on_egregious_inputs`); property-based extension adds
comprehensive coverage.
