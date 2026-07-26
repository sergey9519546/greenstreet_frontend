---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 15 — Mgmt = -0.01 (Rejected Negative Management)
summary: "**Edge case:** `dscr_track2(rent, vac, -0.01, ...)` — negative mgmt (must reject)"
entities:
  - concept/dscr
  - lender/easy-street
  - lender/kiavi
  - lender/newfi
  - lender/pennymac
  - slice/1
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_15_mgmt_negative.md
vaulted_at: 2026-06-20
---
# Edge Case 15 — Mgmt = -0.01 (Rejected Negative Management)

**Edge case:** `dscr_track2(rent, vac, -0.01, ...)` — negative mgmt (must reject)
**Source function:** `dscr_core.dscr.dscr_track2` (rejects at `dscr.py:156-157`)
**Test category:** error-path; sign validation on expense pct
**Slice assignment:** Slice 1 (current)

## Edge Case Description

Management and maintenance percentages must be non-negative — they
represent cash OUTFLOWS as a fraction of GPR. Negative values would imply
the property RECEIVES money from the management company, which is not the
standard DSCR convention.

This guard catches:

- Data entry errors
- Pipeline sign flips
- Reverse-engineering mistakes (e.g., user subtracted from GPR instead of
  using the explicit `maint_pct` parameter)

The guard is `mgmt_pct < 0 or maint_pct < 0`. See `dscr.py:156-157`.

## Expected Behavior

**Reject with ValueError** — message includes both mgmt and maint values
for debuggability.

```python
with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
    dscr_track2(3000, 0.05, -0.01, 0, 2853.985)

with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
    dscr_track2(3000, 0.05, 0, -0.01, 2853.985)  # maint negative also rejected
```

## Mathematical Analysis

```
expenses = gross_rent * (mgmt_pct + maint_pct)
noi = gross_rent * (1 - vacancy_pct) - expenses
```

If `mgmt_pct = -0.01`, then `expenses = -30` (negative, meaning income).
This would artificially inflate NOI. The guard prevents this.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(mgmt=st.floats(max_value=-1e-9, allow_nan=False))
def test_dscr_track2_rejects_negative_mgmt(mgmt):
    """Any mgmt < 0 must raise ValueError."""
    with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
        dscr_track2(3000, 0.05, mgmt, 0, 2853.985)

@given(maint=st.floats(max_value=-1e-9))
def test_dscr_track2_rejects_negative_maint(maint):
    """Any maint < 0 must raise ValueError (same guard)."""
    with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
        dscr_track2(3000, 0.05, 0, maint, 2853.985)
```

## Reference Behavior

**Pennymac DSCR:** Uses 5-8% management allowance as a fraction of GPR.
Always non-negative.

**Easy Street Capital DSCR:** Uses 5-8% mgmt + 5-8% maint, always positive.

**Coldesina Capital, Newfi, Kiavi:** All use positive expense fractions
(0-15% range typical).

**Industry convention:** Expenses are always positive fractions of GPR.
A negative expense would be a data error.

## Confidence Score

**5/5** — pure validation; industry standard.

## Implementation Order

**Priority:** Critical. Already tested at `test_dscr.py:97-99`
(`test_track2_rejects_negative_mgmt`); property-based extension adds
coverage for near-zero negatives.
