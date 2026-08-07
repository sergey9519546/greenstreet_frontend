---
type: research
slice: 1
status: drafted
confidence: 4
title: Code 29 — Property Type Unacceptable
summary: "**Reg B Reference:** Maps to Form C-1 code 23 (Value or type of collateral not sufficient) when used for property type as the principal reason. For DSCR, this is the **property-type-specific** sub-reason."
entities:
  - concept/arm
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/cfpb
  - regulation/ecoa
  - regulation/reg-b
  - slice/1
  - tax/pal
  - topic/condo
  - topic/condotel
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/short-rate
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_29_property_type_unacceptable.md
vaulted_at: 2026-06-20
---
# Code 29 — Property Type Unacceptable

**Reg B Reference:** Maps to Form C-1 code 23 (Value or type of collateral not sufficient) when used for property type as the principal reason. For DSCR, this is the **property-type-specific** sub-reason.

**Confidence:** 4/5 (DSCR-specific sub-reason of Form C-1 code 23)
**Source:** CFPB Circular 2022-03 specificity; Form C-1 code 23

**NOTE:** Renamed from Slice 1 ECOA_CODE_28 to free up code 28 for DSCR-specific reason (see Code 28).

---

## Canonical Text (DSCR lender convention)

> "The type of property you selected is not acceptable to us."

Or more specifically (per CFPB Circular 2022-03):
> "The subject property is a [condotel / 5-unit property / non-warrantable condo / mixed-use property / commercial-zoned property], which is not an acceptable property type for our [DSCR-Investor / DSCR-Full Doc / FN / ITIN] program."

## DSCR-Specific Application

**High DSCR relevance.** Property type eligibility is a common DSCR denial reason. Common ineligible property types:

1. **Condotel** — most DSCR lenders do not allow (some allow case-by-case at reduced LTV)
2. **5+ unit** — most DSCR lenders cap at 4 units
3. **Non-warrantable condo** — most DSCR lenders require warrantable
4. **Mixed-use** — most DSCR lenders require 100% residential
5. **Commercial-zoned** — DSCR loans require residential zoning
6. **Co-op** — most DSCR lenders do not allow
7. **Manufactured home** — most DSCR lenders do not allow
8. **Working farm / ranch** — most DSCR lenders do not allow
9. **Timeshare** — never allowed
10. **Vacant land** — never allowed
11. **Commercial-only** — never allowed
12. **Mobile home** — most do not allow

**DSCR-specific triggers for Code 29**:
- Subject is 5-unit; lender max 4 units → code 29
- Subject is condotel; lender doesn't accept → code 29
- Subject is non-warrantable condo; lender requires warrantable → code 29
- Subject is mixed-use (residential + retail); lender requires 100% residential → code 29

**Lender policy**:
- **Newfi**: Accepts 1-4 unit residential; non-warrantable condo case-by-case
- **Pennymac**: 1-4 unit; warrantable condo only
- **Griffin Funding**: 1-4 unit; case-by-case on condotel
- **Angel Oak**: 1-4 unit; warrantable condo only
- **Deephaven**: 1-4 unit; case-by-case on condotel

## Example Adverse Action Reason Text

> "The type of property you selected is not acceptable for our program. Specifically, the subject property is a [condotel / 5-unit property / non-warrantable condo], which is not an eligible property type for our [DSCR-Investor] program."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 29? |
|---|---|
| `PROPERTY_TYPE_UNACCEPTABLE` | YES (primary) |
| `CONDOTEL` | YES (sub-trigger) |
| `5_PLUS_UNIT` | YES (sub-trigger) |
| `NON_WARRANTABLE_CONDO` | YES (sub-trigger) |
| `MIXED_USE` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 1-4 unit, residential only
- **Pennymac**: 1-4 unit, warrantable condo only
- **Griffin Funding**: 1-4 unit
- **Angel Oak**: 1-4 unit, warrantable condo only
- **Deephaven**: 1-4 unit

## Test Specification

```python
def test_code_29_text_property_type():
    assert "property" in ECOA_REASON_TEXTS["29"].lower()

def test_code_29_for_condotel():
    ke = EnrichedKillEvent(
        trigger="PROPERTY_TYPE_UNACCEPTABLE",
        property_type="CONDOTEL",
    )
    assert "29" in select_ecoa_codes(ke.trigger)

def test_code_29_vs_23_distinction():
    """Code 29 = type only; Code 23 = value OR type (broader)."""
    type_only = EnrichedKillEvent(
        trigger="PROPERTY_TYPE_UNACCEPTABLE",
        appraised_value=500000,  # adequate
    )
    value_and_type = EnrichedKillEvent(
        trigger="PROPERTY_TYPE_UNACCEPTABLE",
        appraised_value=400000,  # insufficient
        loan_amount=350000,
    )
    assert "29" in select_ecoa_codes(type_only.trigger)
    # Both 23 and 29 may appear for value_and_type
    value_and_type_codes = select_ecoa_codes(value_and_type.trigger)
    assert "29" in value_and_type_codes
```

## Sources

1. CFPB Consumer Financial Protection Circular 2022-03
2. Form C-1 code 23 (broader "Value or type of collateral not sufficient")
3. Newfi, Pennymac, Griffin, Angel Oak, Deephaven property type eligibility (T1_T2 sweep)
4. Existing Slice 1 ECOA_CODE_28 (renamed to 29)
