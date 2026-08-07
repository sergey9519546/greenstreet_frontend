---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 12 — Rent = 0 (Accepted, Returns 0 DSCR)
summary: "**Edge case:** `dscr_track1(0, pitia)` and `dscr_track2(0, ...)`"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/fannie-mae
  - lender/pennymac
  - lender/visio-lending
  - slice/1
  - topic/multifamily
  - topic/str
tags:
  - topic/portfolio
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_12_rent_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 12 — Rent = 0 (Accepted, Returns 0 DSCR)

**Edge case:** `dscr_track1(0, pitia)` and `dscr_track2(0, ...)`
**Source function:** `dscr_core.dscr.dscr_track1`, `dscr_core.dscr.dscr_track2`
**Test category:** boundary (zero numerator)
**Slice assignment:** Slice 1 (current)

## Edge Case Description

A rent of exactly $0 represents a property with no rental income — could be:

- Vacant property (between tenants)
- Owner-occupied misuse of DSCR (DSCR requires non-owner-occupied per
  Pennymac, but the math doesn't enforce this)
- Stress scenario: "what if the property sits empty?"

The function must accept 0 and return 0 (no income covers no debt service).
This signals "KILL" decision and a clear need for restructuring.

## Expected Behavior

**Accept 0** — return 0.0. Both Track 1 and Track 2.

```python
assert dscr_track1(0, 2853.985) == 0.0
assert dscr_track2(0, 0.0, 0.0, 0.0, pitia=2853.985) == 0.0
```

The `track_decision` matrix will return KILL:
```python
assert track_decision(0.0, 0.0) == TrackDecision.KILL
```

## Mathematical Analysis

```
DSCR = rent / PITIA = 0 / PITIA = 0
```

No division-by-zero issue because numerator is 0 (not denominator).

For Track 2 with non-zero mgmt/maint:
```
noi = 0 * (1 - vac) - 0 * (mgmt + maint) = 0
DSCR = 0 / PITIA = 0
```

Both tracks converge to 0 when rent is 0.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(pitia=st.floats(min_value=0.01, max_value=10000.0, allow_nan=False))
def test_dscr_track1_zero_rent_is_zero(pitia):
    """dscr_track1(0, pitia) must be exactly 0.0 for any positive PITIA."""
    assert dscr_track1(0.0, pitia) == 0.0

@given(pitia=st.floats(min_value=0.01, max_value=10000.0),
       vac=st.floats(min_value=0.0, max_value=1.0),
       mgmt=st.floats(min_value=0.0, max_value=0.5),
       maint=st.floats(min_value=0.0, max_value=0.5))
def test_dscr_track2_zero_rent_is_zero(pitia, vac, mgmt, maint):
    """dscr_track2(0, ...) must be exactly 0.0."""
    assert dscr_track2(0.0, vac, mgmt, maint, pitia=pitia) == 0.0
```

## Reference Behavior

**JPMorgan Chase CRE Guide:** Same as Edge 11 — DSCR is defined as long as
NOI ≥ 0. A NOI of 0 means break-even on operating income (before debt);
DSCR = 0 means operating income alone doesn't cover debt.

**Pennymac DSCR:** Min DSCR for qualification is typically 1.0 (per
Pennymac DSCR Product Profile 6.12.26). DSCR = 0 means automatic fail.

**Fannie Mae Multifamily Guide (B3-3.8-01):** "For a Small Mortgage Loan
secured by an MAH Property underwritten per this Chapter, you must comply
with the minimum DSCR requirement for an MAH Property per [the matrix]."
Source: <https://mfguide.fanniemae.com/node/3781>
Minimum DSCR for small MAH loans is typically 1.20-1.25; DSCR = 0 fails.

**AHLend No-Ratio DSCR:** Allows DSCR as low as 0.75x. DSCR = 0 still fails.

**Commercial Real Estate Loans glossary:** "If the project is not producing
enough income to cover the debt service, it may be considered a high-risk
loan. A DSCR of less than 1 indicates that there is not enough cash flow to
cover the loan payment."
Source: <https://www.commercialrealestate.loans/commercial-real-estate-glossary/dscr-debt-service-coverage-ratio>

## Confidence Score

**5/5** — trivial math; universal convention.

## Implementation Order

**Priority:** High. Add `test_dscr_track1_zero_rent` and
`test_dscr_track2_zero_rent` to `test_dscr.py::TestDSCRTrack1` and
`TestDSCRTrack2` respectively. This is the most common "vacant property"
scenario in real DSCR portfolios.
