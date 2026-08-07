---
type: research
slice: 3
status: drafted
confidence: 3
title: Edge Case 26 — OBBBA Bonus on $0 Cost Basis
summary: "**Edge case:** After-Tax engine: `bonus_depreciation(cost_basis=0)`"
entities:
  - slice/3
  - tax/bonus-depreciation
  - tax/obba
  - topic/str
tags:
  - topic/after-tax
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_26_obba_bonus_zero_basis.md
vaulted_at: 2026-06-20
---
# Edge Case 26 — OBBBA Bonus on $0 Cost Basis

**Edge case:** After-Tax engine: `bonus_depreciation(cost_basis=0)`
**Source function:** Slice 3 after-tax engine (NOT YET IMPLEMENTED)
**Test category:** boundary (zero basis); degenerate input
**Slice assignment:** **Slice 3** (future — after-tax engine)

## Edge Case Description

A cost basis of exactly $0 means there's nothing to depreciate. OBBBA
100% bonus depreciation should yield exactly $0 deduction — no carryover,
no negative numbers, no infinite adjustment.

This edge case is important because:

1. New construction that hasn't been placed in service yet
2. Land-only acquisitions (land is non-depreciable)
3. Fully-depreciated property with basis remaining only in land

**OBBBA context (verified):**
- IRC §168(k) as amended by OBBBA §70302 (P.L. 119-21, July 4, 2025)
- Permanent 100% bonus for qualified property acquired AND placed in
  service on or after Jan 19, 2025
- Source: <https://www.irs.gov/newsroom/additional-first-year-depreciation-deduction-bonus-faq>

## Expected Behavior

**Accept $0 cost basis** — return $0 bonus depreciation deduction.

```python
# Future Slice 3 API
result = bonus_depreciation(cost_basis=0, placed_in_service='2026-01-15')
assert result == 0.0

# Carryover = 0 (no deduction to carry forward)
assert carryover_after_bonus(cost_basis=0) == 0.0
```

## Mathematical Analysis

```
bonus_depreciation(cost_basis) = cost_basis * bonus_pct
                              = 0 * 1.0 = 0
```

For OBBBA post-Jan 19, 2025: `bonus_pct = 1.0` (permanent 100%).

Pre-OBBBA TCJA phase-down:
- 2023: 80%
- 2024: 60%
- 2025: 40% (Jan 1-19), 100% (Jan 19 onwards)
- 2026: 20% (TCJA) / 100% (OBBBA)
- 2027+: 0% (TCJA) / 100% (OBBBA)

Source: <https://www.plantemoran.com/explore-our-thinking/insight/2022/08/the-tcja-100-percent-bonus-depreciation-starts-to-phase-out-after-2022>
Source: <https://www.grantthornton.com/insights/alerts/tax/2025/insights/obbba-offers-new-ways-to-accelerate-depreciation>

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(cost_basis=st.floats(min_value=0.0, max_value=0.0, allow_nan=False))
def test_bonus_depreciation_zero_basis_is_zero(cost_basis):
    """cost_basis = 0 must yield exactly 0 bonus depreciation."""
    result = bonus_depreciation(cost_basis=cost_basis, year=2026)
    assert result == 0.0

def test_bonus_depreciation_negative_basis_raises():
    """Negative cost basis (e.g., data error) must raise ValueError."""
    with pytest.raises(ValueError, match="cost_basis must be >= 0"):
        bonus_depreciation(cost_basis=-1000, year=2026)

def test_bonus_depreciation_obba_2026_100pct():
    """OBBBA 2026: bonus = 100% of cost basis for qualified property."""
    result = bonus_depreciation(cost_basis=100_000, year=2026, qualified=True)
    assert result == 100_000.0
```

## Reference Behavior

**IRS Rev. Proc. 2025-32** (October 2025): Confirms permanent 100% bonus
for qualified property acquired and placed in service after Jan 19, 2025.

**IRC §168(k)(1) and (k)(2)** (as amended): "the additional first-year
depreciation deduction is 100 percent of the adjusted basis of qualified
property."

**Big 4 confirmations:**
- Grant Thornton: <https://www.grantthornton.com/insights/alerts/tax/2025/insights/obbba-offers-new-ways-to-accelerate-depreciation>
- Allen Matkins: "The OBBBA permanently reinstates 100 percent bonus depreciation"
  <https://www.allenmatkins.com/real-ideas/bonus-depreciation-is-back-and-other-big-beautiful-taxes.html>
- Mayer Brown, Kutak Rock, Thomson Reuters: all confirm.

**Taxstra Cost Segregation Study (2026):** "20-35% Year-1 Write-Off"
typical when layered with cost seg.
Source: <https://taxstra.com/strategies/cost-segregation/>

**Engine expectation:** `bonus_dep_pct = 1.0` for `tax_year >= 2025` and
acquired/post-Jan 19, 2025. For 0 basis, deduction is 0 regardless.

## Confidence Score

**5/5** — trivial math; OBBBA confirmed by multiple Tier 1 sources.

## Implementation Order

**Priority:** Slice 3 — the after-tax engine doesn't exist yet. This edge
case is part of the Slice 3 implementation spec. The test code goes into
the future `tests/test_after_tax.py`.
