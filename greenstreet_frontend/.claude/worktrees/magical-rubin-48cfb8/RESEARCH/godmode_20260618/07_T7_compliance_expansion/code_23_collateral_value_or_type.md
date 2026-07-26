---
type: research
slice: 1
status: drafted
confidence: 5
title: Code 23 — Value or Type of Collateral Not Sufficient
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #23"
entities:
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/1
  - topic/condo
  - topic/condotel
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_23_collateral_value_or_type.md
vaulted_at: 2026-06-20
---
# Code 23 — Value or Type of Collateral Not Sufficient

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #23
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

**NOTE:** This Form C-1 code 23 is the **broad** collateral-insufficiency reason. The Slice 1 `ECOA_CODE_27_COLLATERAL_INSUFFICIENT = "27"` uses a slightly different text ("The collateral value is insufficient.") which is the legacy FCRA Appendix C form text. Form C-1 code 23 is the **current** Reg B Appendix C text. For DSCR, Form C-1 code 23 is the correct verbatim text. Slice 1's text should be updated to match.

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Value or type of collateral not sufficient"

## Industry Guidance

> "This reason should be used when the collateral does not meet underwriting standards, such as when an appraised value comes back lower than expected."

**Key scope**: This reason covers both **value** (LTV too high) and **type** (property type unacceptable). The Slice 1 separate code 28 ("Property type unacceptable") can be retained as a more specific sub-reason, with code 23 used for the broader "value or type" case.

## DSCR-Specific Application

**High DSCR relevance.** Collateral valuation is the second-most-common DSCR denial reason after DSCR failure. DSCR-specific collateral issues:

1. **LTV breach** (loan amount / appraised value exceeds max)
   - Pennymac: 80% LTV max for LTR; 75% for STR
   - Newfi: 80% LTV max LTR; 75% STR; 70% high-LTV markets
   - Griffin: 80% LTR; 75% STR
   - Angel Oak: 80% LTR; 75% STR
   - Deephaven: 80% LTR; 75% STR
2. **Appraised value** lower than purchase price (BRRRR scenario)
3. **Property type ineligible** (non-warrantable condo, condotel, 5+ unit)
4. **Condition rating C5/C6** (poor condition, requires repair)
5. **Loan amount above lender max** ($2M-$4M depending on lender)
6. **State-specific declining market** (CT, FL, IL, NJ, NY reduced LTV caps)

**DSCR-specific triggers for Code 23**:
- Appraised value $480K; loan amount $400K → LTV 83%; lender max 80% → code 23
- Property is condotel; lender doesn't accept condotel → code 23
- Subject is 5-unit; lender max 4 units → code 23
- Subject is in declining market (e.g., Bridgeport CT); lender LTV cap reduced 5pp → code 23

**Distinction from Code 28 (Property type unacceptable)**: Code 23 covers BOTH value and type. Code 28 is **type only**. Best practice: use **code 23** if both value and type are issues; use **code 28** alone if it's a type-only issue.

## Example Adverse Action Reason Text

> "The value or type of collateral for the subject property does not meet our underwriting standards. Specifically, the appraisal report dated [date] indicates a value of $[X], and the proposed loan amount of $[Y] results in a loan-to-value ratio of [N]%, which exceeds our maximum of [M]%. [OR: The subject property is a [condotel / 5-unit property / non-warrantable condo] which is not an acceptable property type for our program.]"

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 23? |
|---|---|
| `LTV_OVER_MAX` | YES (primary) |
| `PROPERTY_TYPE_UNACCEPTABLE` | YES (sub-trigger) |
| `APPRAISAL_LOW` | YES (sub-trigger) |
| `PROPERTY_CONDITION_C5_C6` | YES (sub-trigger) |
| `DECLINING_MARKET_LTV` | YES (sub-trigger) |

## Lender-Specific Variants

- **Pennymac**: 80% LTR / 75% STR; condotel not allowed in DSCR
- **Newfi**: 80% LTR / 75% STR; 70% high-LTV markets
- **Griffin**: 80% LTR / 75% STR; condotel case-by-case
- **Angel Oak**: 80% LTR / 75% STR; non-warrantable condo case-by-case
- **Deephaven**: 80% LTR / 75% STR; 5-unit case-by-case

## Test Specification

```python
def test_code_23_text_verbatim():
    assert ECOA_REASON_TEXTS["23"] == "Value or type of collateral not sufficient"

def test_code_23_for_ltv_breach():
    ke = EnrichedKillEvent(
        trigger="LTV_OVER_MAX",
        actual_ltv=0.83,
        ltv_threshold=0.80,
    )
    assert "23" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
5. Existing Slice 1 ECOA_CODE_27_COLLATERAL_INSUFFICIENT (text should be updated to Form C-1 code 23)
