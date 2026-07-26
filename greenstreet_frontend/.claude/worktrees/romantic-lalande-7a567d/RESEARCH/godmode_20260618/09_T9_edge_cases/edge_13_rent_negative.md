---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 13 — Rent = -100 (Rejected Negative Rent)
summary: "**Edge case:** `dscr_track1(-100, pitia)` — negative rent (must reject)"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/pennymac
  - lender/visio-lending
  - slice/1
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_13_rent_negative.md
vaulted_at: 2026-06-20
---
# Edge Case 13 — Rent = -100 (Rejected Negative Rent)

**Edge case:** `dscr_track1(-100, pitia)` — negative rent (must reject)
**Source function:** `dscr_core.dscr.dscr_track1` (rejects at `dscr.py:112-113`)
**Test category:** error-path; sign validation
**Slice assignment:** Slice 1 (current)

## Edge Case Description

Negative rent is nonsensical — the property wouldn't PAY a tenant to live
there (except in rare subsidized housing scenarios, which are not DSCR-
eligible). Negative rent indicates:

- Data pipeline sign flip (most common bug)
- User entered net cash flow instead of gross rent
- Subsidized housing case incorrectly routed to DSCR engine
- Currency conversion error (e.g., negative in foreign currency)

The engine must reject with `ValueError` so the caller knows to fix the
input.

## Expected Behavior

**Reject with ValueError** — message must include the offending value.

```python
with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
    dscr_track1(-100, 2853.985)

with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
    dscr_track1(-1_000_000, 2853.985)  # large negative also rejected
```

For Track 2, the same guard exists at `dscr.py:152-153` for `gross_rent_monthly`.

## Mathematical Analysis

No math — pure validation. The `if rent_monthly < 0: raise ValueError(...)`
guard fires before any division.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(rent=st.floats(max_value=-1e-9, allow_nan=False, allow_infinity=False))
def test_dscr_track1_rejects_any_negative_rent(rent):
    """Any rent < 0 must raise ValueError, no matter how close to zero."""
    with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
        dscr_track1(rent, 2853.985)

@given(rent=st.floats(max_value=-1e-9))
def test_dscr_track2_rejects_any_negative_rent(rent):
    with pytest.raises(ValueError, match="gross_rent_monthly must be >= 0"):
        dscr_track2(rent, 0.05, 0.08, 0.05, pitia=2853.985)
```

## Reference Behavior

**numpy-financial:** No sign validation. `pmt(rate, n, +100)` (positive
pv = loan received) returns negative pmt (cash outflow). The sign convention
is a source of confusion. Our explicit rejection is safer.

**Excel:** No sign validation on rent in DSCR calculations. User error
typically yields nonsense like DSCR = -3.5.

**Pennymac DSCR Product Profile:** Requires positive rental income per
"gross rental income is calculated using the lower of: Executed Lease
Agreement or 1007/1025 Market rent from appraisal." Both are inherently
positive numbers.

**No-Ratio DSCR Loans (AHLend):** Allow negative cash flow properties,
but rent itself must still be positive — it's the loan qualification
that uses other criteria.

## Confidence Score

**5/5** — pure validation; aligns with industry standard.

## Implementation Order

**Priority:** Critical. Already tested at `test_dscr.py:64-66`
(`test_track1_rejects_negative_rent`); Track 2 has similar test at
`test_dscr.py:106-109`. Property-based extensions add coverage for
near-zero negatives.
