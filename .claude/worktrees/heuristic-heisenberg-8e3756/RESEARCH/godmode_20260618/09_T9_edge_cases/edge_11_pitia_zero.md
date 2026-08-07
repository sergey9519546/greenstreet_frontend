---
type: research
slice: 1
status: drafted
confidence: 3
title: Edge Case 11 — PITIA = 0 (Rejected Zero Denominator)
summary: "**Edge case:** `dscr_track1(rent, 0)` and `dscr_track2(rent, vac, mgmt, maint, 0)`"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/pennymac
  - lender/visio-lending
  - slice/1
  - slice/2
  - state/de
  - topic/non-qm
  - topic/str
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_11_pitia_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 11 — PITIA = 0 (Rejected Zero Denominator)

**Edge case:** `dscr_track1(rent, 0)` and `dscr_track2(rent, vac, mgmt, maint, 0)`
**Source function:** `dscr_core.dscr.dscr_track1`, `dscr_core.dscr.dscr_track2`
**Test category:** error-path; zero-divisor guard
**Slice assignment:** Slice 1 (current — guard at `dscr.py:110-111`)

## Edge Case Description

DSCR is a ratio: `rent / PITIA`. If PITIA is 0, the denominator is zero
and the ratio is undefined. A PITIA of 0 means "no monthly housing cost",
which is the all-cash buyer scenario (no debt service).

The engine must reject PITIA=0 with ValueError because:

1. Division by zero is mathematically undefined
2. An all-cash buyer has no DSCR concept (DSCR is about debt coverage)
3. Silent return of 0 or infinity would corrupt downstream analysis

## Expected Behavior

**Reject with ValueError** in both Track 1 and Track 2.

```python
with pytest.raises(ValueError, match="pitia must be > 0"):
    dscr_track1(3000, 0)

with pytest.raises(ValueError, match="pitia must be > 0"):
    dscr_track2(3000, 0.05, 0.08, 0.05, pitia=0)
```

**NOTE on Slice 2+:** Track 3 (`dscr_track3_stabilized`) and All-In DSCR
also have similar guards; see `dscr.py:230-233` and `dscr.py:268-271`.

## Mathematical Analysis

```
DSCR = rent / PITIA
```

If PITIA = 0:
- rent > 0: undefined (∞)
- rent = 0: indeterminate (0/0)
- rent < 0: undefined (and rejected separately)

The function rejects at the boundary, before the division, to give a
clear error message.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(pitia=st.floats(max_value=0.0, allow_nan=False, allow_infinity=False))
def test_dscr_track1_rejects_zero_or_negative_pitia(pitia):
    """Any PITIA <= 0 must raise ValueError."""
    if pitia <= 0:
        with pytest.raises(ValueError, match="pitia must be > 0"):
            dscr_track1(3000, pitia)

@given(pitia=st.floats(max_value=0.0))
def test_dscr_track2_rejects_zero_or_negative_pitia(pitia):
    if pitia <= 0:
        with pytest.raises(ValueError, match="pitia must be > 0"):
            dscr_track2(3000, 0.05, 0.08, 0.05, pitia=pitia)
```

## Reference Behavior

**JPMorgan Chase CRE Underwriting Guide** ("What is DSCR in real estate"):
"The DSCR is calculated by dividing the property's annual net operating income
(NOI) by its annual debt service payments. A DSCR of 1.0 means break-even."
Source: <https://www.jpmorgan.com/insights/real-estate/commercial-term-lending/what-is-debt-service-coverage-ratio-dscr-in-real-estate>

Implication: DSCR = NOI / Debt Service. If Debt Service = 0 (no loan), DSCR
is undefined. Our ValueError aligns with JPM's implicit assumption that
debt service exists.

**First Heritage Mortgage, Truss Financial Group, AHLend:**
"A DSCR loan with DSCR below 1.0" — implies DSCR ≥ 0, debt service > 0.
<https://trussfinancialgroup.com/blog/dscr-loan-below-1>
<https://ahlend.com/no-ratio-dscr-loans/>

**No-Ratio DSCR loans (AHLend, Delaware Mortgage Loans):** Allow DSCR as
low as 0.75x, but still require a positive PITIA (the loan exists).

**Pennymac DSCR Product Profile (06.12.26):**
"Debt Service Coverage Ratio: For real estate investors where loan
qualification is based on the property's cash flow"
Source: <https://corr.pennymac.com/assets/documents/non-qm-resources/non-qm-dscr-product-profile.pdf>

**Investopedia:**
"A DSCR of 1.20 means you earn 20% more than you need to cover the loan
payment." — Implies loan payment > 0; PITIA = 0 is not a meaningful DSCR.

## Confidence Score

**5/5** — universal convention; mathematical necessity.

## Implementation Order

**Priority:** Critical. Already tested at `test_dscr.py:60-62`
(`test_track1_rejects_zero_pitia`); property-based version adds coverage
for all sub-zero values. The Track 2 version is missing — must add.
