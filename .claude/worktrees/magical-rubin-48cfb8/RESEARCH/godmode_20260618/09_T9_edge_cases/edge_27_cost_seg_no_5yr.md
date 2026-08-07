---
type: research
slice: 3
status: drafted
confidence: 3
title: Edge Case 27 — Cost Segregation with No 5-Year Property
summary: "**Edge case:** After-Tax engine: `cost_segregation_study(building=100K, land=20K, seg_5yr=0, seg_7yr=0, seg_15yr=0)`"
entities:
  - slice/3
  - topic/str
tags:
  - topic/after-tax
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_27_cost_seg_no_5yr.md
vaulted_at: 2026-06-20
---
# Edge Case 27 — Cost Segregation with No 5-Year Property

**Edge case:** After-Tax engine: `cost_segregation_study(building=100K, land=20K, seg_5yr=0, seg_7yr=0, seg_15yr=0)`
**Source function:** Slice 3 after-tax engine (NOT YET IMPLEMENTED)
**Test category:** boundary (degenerate); zero reclassification
**Slice assignment:** **Slice 3** (future)

## Edge Case Description

A cost segregation study with no 5/7/15-year property identified is the
all-land scenario (or land-heavy acquisition). The engine must return a
normal 27.5-year (residential) or 39-year (nonresidential) depreciation
schedule without any cost-seg benefit.

This is a valid input, not an error:

- Land is non-depreciable (always 0 depreciation)
- Some properties (e.g., parking lots, undeveloped land) have no
  identifiable personal property
- Engineered cost seg studies always have *some* reclassification
  (typically 20-30% per Cost Segregation Results / Journal of Accountancy),
  but a no-reclassification scenario is the conservative baseline

**Cost seg class lives (verified):**
- IRC §168(e)(2): residential rental = 27.5-yr; nonresidential real = 39-yr
- Rev. Proc. 87-56: asset class lives for 3/5/7/10/15/20/27.5/39-yr
- IRS Cost Segregation Audit Techniques Guide (Pub 5653)
- Source: <https://www.irs.gov/pub/irs-access/p5653_accessible.pdf>

## Expected Behavior

**Accept zero reclassification** — return standard MACRS schedule with
no accelerated depreciation.

```python
# Future Slice 3 API
result = cost_segregation(
    building_basis=100_000,
    land_basis=20_000,         # land is non-depreciable
    seg_5yr_basis=0,
    seg_7yr_basis=0,
    seg_15yr_basis=0,
    property_type='residential',  # 27.5-year
)
# Total depreciable basis = 100,000 (building only; land excluded)
# Year 1 depreciation (no seg, no bonus) = 100,000 / 27.5 = $3,636.36
assert result['year_1_depreciation'] == pytest.approx(3636.36, abs=0.01)
assert result['total_depreciable_basis'] == 100_000  # excludes land
```

## Mathematical Analysis

```
Total depreciable basis = building_basis + seg_5yr + seg_7yr + seg_15yr
                       = 100,000 + 0 + 0 + 0 = 100,000
```

For residential rental (27.5-year straight-line):
```
Year 1 depreciation = 100,000 / 27.5 = $3,636.36
```

For nonresidential (39-year straight-line):
```
Year 1 depreciation = 100,000 / 39 = $2,564.10
```

**Land is NOT depreciable** — must be excluded from the basis.
This is a hard IRS rule per IRC §167 and §168.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(seg_5yr=st.floats(min_value=0, max_value=0),
       seg_7yr=st.floats(min_value=0, max_value=0),
       seg_15yr=st.floats(min_value=0, max_value=0),
       building=st.floats(min_value=10_000, max_value=10_000_000),
       land=st.floats(min_value=0, max_value=1_000_000))
def test_cost_segregation_zero_reclassification(seg_5yr, seg_7yr, seg_15yr, building, land):
    """No cost seg reclassification → standard MACRS only, land excluded."""
    result = cost_segregation(
        building_basis=building,
        land_basis=land,
        seg_5yr_basis=seg_5yr,
        seg_7yr_basis=seg_7yr,
        seg_15yr_basis=seg_15yr,
        property_type='residential',
    )
    # Land must be excluded
    assert result['total_depreciable_basis'] == building
    # Year 1 must equal building / 27.5 (residential straight-line)
    expected_y1 = building / 27.5
    assert result['year_1_depreciation'] == pytest.approx(expected_y1, abs=0.01)

def test_cost_segregation_land_excluded():
    """Land basis must NOT be depreciable."""
    result = cost_segregation(
        building_basis=100_000,
        land_basis=20_000,  # 20% land
        seg_5yr_basis=0,
        seg_7yr_basis=0,
        seg_15yr_basis=0,
        property_type='residential',
    )
    # Land $20K must be 100% excluded
    assert result['total_depreciable_basis'] == 100_000  # not 120,000
```

## Reference Behavior

**IRS Pub 5653 — Cost Segregation Audit Techniques Guide:**
"Groups by asset class or recovery period (i.e. land, 3, 5, 7, 10, 15, 20,
27.5 and/or 39-year property.)"
Source: <https://www.irs.gov/pub/irs-access/p5653_accessible.pdf>

**Journal of Accountancy (cited by Cost Segregation Results):**
"Each $100,000 in assets reclassified from a 39 year recovery period to
a five-year recovery period results in approximately $22,000 in net present
value savings."
Source: <https://costsegresults.com/>

**Bradford Tax Institute:** Typical cost seg reclassification 20-30% of
depreciable basis from 27.5/39-yr to 5/15-yr.

**Taxstra 2026:** "20-35% Year-1 Write-Off" with cost seg + bonus.

**EisnerAmper:** "Using the Modified Asset Cost Recovery System (MACRS),
27.5 years for residential real property."
Source: <https://www.eisneramper.com/insights/real-estate/cost-segregation-common-questions-0623/>

**No cost seg study should yield 0 reclassification for an actual property
with personal property.** But for the degenerate case (land only), it's
correct.

## Confidence Score

**5/5** — IRS Pub 5653 and IRC §168 are unambiguous on land exclusion
and 27.5/39-year lives.

## Implementation Order

**Priority:** Slice 3 implementation. The land-exclusion logic is a
critical guard. Add to future `tests/test_after_tax.py`.
