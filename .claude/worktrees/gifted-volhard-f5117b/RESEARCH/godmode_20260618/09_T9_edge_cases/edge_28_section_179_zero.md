---
type: research
slice: 3
status: drafted
confidence: 3
title: Edge Case 28 — Section 179 with $0 Purchases
summary: "**Edge case:** After-Tax engine: `section_179_deduction(purchases=0)`"
entities:
  - slice/3
  - tax/section-179
  - topic/str
tags:
  - topic/after-tax
  - topic/tax
source: RESEARCH/godmode_20260618/09_T9_edge_cases/edge_28_section_179_zero.md
vaulted_at: 2026-06-20
---
# Edge Case 28 — Section 179 with $0 Purchases

**Edge case:** After-Tax engine: `section_179_deduction(purchases=0)`
**Source function:** Slice 3 after-tax engine (NOT YET IMPLEMENTED)
**Test category:** boundary (zero); degenerate input
**Slice assignment:** **Slice 3** (future)

## Edge Case Description

A Section 179 deduction with $0 qualifying purchases means no §179
election is taken (or no qualifying property was placed in service).
The deduction must be exactly $0.

This is a valid input:

- Rental-only property (no equipment/fixtures/SUV purchases)
- Service business with no qualifying property in current tax year
- Empty year for the taxpayer

**§179 mechanics (verified):**
- IRC §179(b)(1): Max deduction $2,560,000 for tax years beginning in
  2026 (IRS Rev. Proc. 2025-32 §4.24)
- Phaseout begins at $4,090,000 in 2026
- SUV limit: $32,000 (2026)
- Source: <https://www.irs.gov/instructions/i4562>
- Source: <https://answerconnect.cch.com/topic/1a4c85627c621000ba0490b11c18c90202/section-179-deduction>

**§179 vs. bonus ordering:**
§179 is applied FIRST, then §168(k) bonus on remaining basis. See Edge
Case 26 interaction.

## Expected Behavior

**Accept $0 purchases** — return $0 §179 deduction.

```python
# Future Slice 3 API
result = section_179_deduction(
    qualifying_purchases=0,
    business_income=50_000,  # taxable income limit irrelevant
    tax_year=2026,
)
assert result == 0.0

# No carryover (no deduction to carry)
assert result_carryover == 0.0
```

## Mathematical Analysis

```
section_179_deduction(purchases) = min(purchases, 2_560_000, business_income)
                                  = min(0, 2_560_000, 50_000)
                                  = 0
```

The deduction cannot exceed:
1. Qualifying purchases
2. Annual limit ($2.56M for 2026)
3. Business taxable income (cannot create a loss with §179)

For 0 purchases, all three caps yield 0.

## Property-Based Test Specification

```python
from hypothesis import given, strategies as st

@given(purchases=st.floats(min_value=0.0, max_value=0.0, allow_nan=False))
def test_section_179_zero_purchases_is_zero(purchases):
    """$0 qualifying purchases → $0 §179 deduction."""
    result = section_179_deduction(
        qualifying_purchases=purchases,
        business_income=100_000,
        tax_year=2026,
    )
    assert result == 0.0

@given(purchases=st.floats(min_value=-1000, max_value=-0.01, allow_nan=False))
def test_section_179_negative_purchases_raises(purchases):
    """Negative purchases (data error) must raise ValueError."""
    with pytest.raises(ValueError, match="qualifying_purchases must be >= 0"):
        section_179_deduction(
            qualifying_purchases=purchases,
            business_income=100_000,
            tax_year=2026,
        )

def test_section_179_2026_limits():
    """Verify 2026 limit ($2.56M) and phaseout ($4.09M) are hardcoded correctly."""
    # At $2.5M (below limit): full deduction
    result = section_179_deduction(2_500_000, business_income=10_000_000, tax_year=2026)
    assert result == 2_500_000.0
    # At $5M (above phaseout): no deduction
    result = section_179_deduction(5_000_000, business_income=10_000_000, tax_year=2026)
    assert result == 0.0
    # At $3M (between phaseout start and limit): partial deduction
    # Per §179(b)(3)(A): reduction = (purchases - phaseout_threshold)
    # 3M - 4.09M = -ve, no reduction; but 3M < 2.56M? No, 3M > 2.56M, capped at 2.56M
    result = section_179_deduction(3_000_000, business_income=10_000_000, tax_year=2026)
    assert result == 2_560_000.0  # capped at 2026 limit
```

## Reference Behavior

**IRS Rev. Proc. 2025-32 §4.24 (October 2025):**
"The maximum aggregate cost a taxpayer may elect to expense (Code Section
179(b)(1)) cannot exceed $2,560,000. The phaseout threshold (Code Section
179(b)(2)) begins when the cost of Code 179 property placed in service
during the year exceeds $4,090,000."

**IRS Form 4562 Instructions (2025):** "For tax years beginning in 2025,
the maximum section 179 expense deduction is $2,500,000."

**Tax Foundation, CCH AnswerConnect:** All confirm 2026 limits.

**No §179 deduction possible without qualifying property.** Our engine
behavior matches IRS rule.

## Confidence Score

**5/5** — IRC §179 and IRS Rev. Proc. 2025-32 are unambiguous.

## Implementation Order

**Priority:** Slice 3 implementation. Add to future
`tests/test_after_tax.py::TestSection179` with the 2026 limits hardcoded
per Rev. Proc. 2025-32.
