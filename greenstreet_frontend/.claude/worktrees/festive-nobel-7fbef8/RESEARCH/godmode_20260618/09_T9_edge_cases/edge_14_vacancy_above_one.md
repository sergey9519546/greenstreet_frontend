---
type: research
slice: 1
status: drafted
confidence: 3
title: "Edge Case 14 — Vacancy = 1.5 (Rejected > 100%)"
summary: "**Edge case:** `dscr_track2(rent, 1.5, ...)` — vacancy > 100% (must reject)"
entities:
  - concept/dscr
  - data/fannie-mae
  - lender/pennymac
  - slice/1
  - topic/2-4-unit
  - topic/multifamily
  - topic/non-qm
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_14_vacancy_above_one.md
vaulted_at: 2026-06-20
---
# Edge Case 14 — Vacancy = 1.5 (Rejected > 100%)

**Edge case:** `dscr_track2(rent, 1.5, ...)` — vacancy > 100% (must reject)
**Source function:** `dscr_core.dscr.dscr_track2` (rejects at `dscr.py:154-155`)
**Test category:** error-path; range validation
**Slice assignment:** Slice 1 (current)

## Edge Case Description

Vacancy is a fraction in `[0, 1]` — physically cannot exceed 100%. A
vacancy of 1.5 (150%) would imply the property has NEGATIVE occupied
rent, which is nonsensical. This guard catches:

- Data entry errors (user entered 150% thinking it was a percentage 0-100)
- Decimal/float misplacement (user meant 0.15 but entered 15 then
  the system scaled by 100 thinking it was already a percentage)
- Wrong scaling convention (some lenders use 0-100 instead of 0-1)

Pennymac DSCR Product Profile (06.12.26) Section on Rental Income states:
"Gross Rental Income is calculated using the lower of: Executed Lease
Agreement or 1007/1025 Market rent from appraisal." For 2-4 unit
residential, Fannie Form 1007 25% vacancy rule applies (but to DTI
qualification, not DSCR ratio — see Edge Case context).

## Expected Behavior

**Reject with ValueError** — message must include the range constraint.

```python
with pytest.raises(ValueError, match="vacancy_pct must be in"):
    dscr_track2(3000, 1.5, 0, 0, 2853.985)

with pytest.raises(ValueError, match="vacancy_pct must be in"):
    dscr_track2(3000, 2.0, 0, 0, 2853.985)  # 200% also rejected

with pytest.raises(ValueError, match="vacancy_pct must be in"):
    dscr_track2(3000, -0.1, 0, 0, 2853.985)  # negative also rejected (by same guard)
```

## Mathematical Analysis

```
vacancy_pct must be in [0, 1]
```

The guard at `dscr.py:154-155` enforces this. Mathematically, `1 - vacancy_pct`
must be ≥ 0 to avoid negative effective rent. The guard is `0 <= vacancy_pct <= 1`.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(vac=st.floats(min_value=1.000001, max_value=10.0, allow_nan=False))
def test_dscr_track2_rejects_vacancy_above_one(vac):
    """Any vacancy > 1 must raise ValueError."""
    with pytest.raises(ValueError, match="vacancy_pct must be in"):
        dscr_track2(3000, vac, 0, 0, 2853.985)

@given(vac=st.floats(min_value=-10.0, max_value=-1e-9))
def test_dscr_track2_rejects_vacancy_below_zero(vac):
    """Negative vacancy also rejected by same guard."""
    with pytest.raises(ValueError, match="vacancy_pct must be in"):
        dscr_track2(3000, vac, 0, 0, 2853.985)

def test_dscr_track2_accepts_vacancy_boundary():
    """vacancy = 0 and vacancy = 1 must be accepted (boundary)."""
    assert dscr_track2(3000, 0.0, 0.0, 0.0, 2853.985) == pytest.approx(1.0512, abs=0.001)
    assert dscr_track2(3000, 1.0, 0.0, 0.0, 2853.985) == 0.0  # 100% vac = $0 effective rent
```

## Reference Behavior

**Pennymac DSCR Product Profile (06.12.26):**
"No more than 25% of the total [rental income from non-leased units]..."
Source: <https://corr.pennymac.com/assets/documents/non-qm-resources/non-qm-dscr-product-profile.pdf>

For STR refinance, Pennymac uses "100% actual 12-mo STR history" —
implies vacancy ranges from 0% (fully booked) to 100% (no bookings).

**Fannie Mae Form 1007:** Uses 25% vacancy as the standard allowance for
2-4 unit residential DTI qualification. 25% = 0.25 (in fractional form).

**Fannie Mae Multifamily DSCR Matrix (B3-3.8-01):** Vacancy allowances vary
by property type and location, but all are in [0, 1].

**No reference implementation accepts vacancy > 1.** Standard financial
modeling convention treats vacancy as a fractional value.

## Confidence Score

**5/5** — universal convention; pure validation.

## Implementation Order

**Priority:** High. Already tested at `test_dscr.py:93-95`
(`test_track2_rejects_excessive_vacancy`); property-based extension adds
coverage for the full range. Boundary acceptance (vac=0, vac=1) is not
explicitly tested and should be added.
