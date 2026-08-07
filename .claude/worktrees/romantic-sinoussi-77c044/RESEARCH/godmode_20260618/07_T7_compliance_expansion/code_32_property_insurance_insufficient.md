---
type: research
status: drafted
confidence: 4
title: Code 32 — Property Insurance Insufficient (DSCR Insurance Overlay)
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with property-insurance-specific text. DSCR lenders require property insurance (hazard) for habitational properties."
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/flood-insurance
  - topic/insurance
  - topic/kill-criteria
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_32_property_insurance_insufficient.md
vaulted_at: 2026-06-20
---
# Code 32 — Property Insurance Insufficient (DSCR Insurance Overlay)

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with property-insurance-specific text. DSCR lenders require property insurance (hazard) for habitational properties.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The property insurance binder for the subject property does not meet our requirements."

Or more specifically:
> "The property insurance binder for the subject property is insufficient. Our standard requires a property insurance binder in place at the time of application with [specific requirements]."

## DSCR-Specific Application

**Critical for DSCR.** Property insurance is a hard kill criterion. DSCR-specific scenarios:

1. **No property insurance binder** — required for habitational properties
2. **Coverage insufficient** — less than loan amount or appraised value
3. **Carrier not approved** — not on lender's approved list
4. **Deductible too high** — greater than lender's max (typically 2-5% of coverage)
5. **Effective date** — after closing date
6. **Named insured** — must match borrowing entity exactly
7. **Wind/hail excluded** — coastal properties (FL, TX Gulf, NC Outer Banks)
8. **Flood excluded** — must be separate NFIP policy

**DSCR-specific triggers for Code 32**:
- No property insurance binder → code 32
- Property insurance binder with coverage $400K; loan amount $500K → code 32
- Property insurance carrier "ABC Insurance" not on approved list → code 32
- Wind/hail excluded in FL coastal → code 32 (most lenders require wind coverage)

**Lender policy**:
- **Newfi**: 100% of loan amount or appraised value (whichever is less); approved carrier list
- **Pennymac**: 100% replacement cost; approved carrier list
- **Griffin Funding**: 100% of loan amount
- **Angel Oak**: 100% of loan amount
- **Deephaven**: 100% replacement cost

## Example Adverse Action Reason Text

> "The property insurance binder for the subject property does not meet our requirements. Specifically, [the binder has not been provided / the dwelling coverage is insufficient / the carrier is not on our approved list / the deductible is too high / wind/hail coverage is excluded]. Our standard requires [specific requirements]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 32? |
|---|---|
| `PROPERTY_INSURANCE_MISSING` | YES (primary) |
| `PROPERTY_INSURANCE_INSUFFICIENT` | YES (sub-trigger) |
| `CARRIER_NOT_APPROVED` | YES (sub-trigger) |
| `WIND_HAIL_EXCLUDED` | YES (sub-trigger, for coastal) |

## Lender-Specific Variants

- **Newfi**: Approved carrier list; 100% loan/appraised
- **Pennymac**: Approved carrier list; 100% replacement
- **Griffin Funding**: 100% loan amount
- **Angel Oak**: 100% loan amount
- **Deephaven**: 100% replacement cost

## Test Specification

```python
def test_code_32_text_insurance():
    assert "insurance" in ECOA_REASON_TEXTS["32"].lower() or "property" in ECOA_REASON_TEXTS["32"].lower()

def test_code_32_for_insurance_missing():
    ke = EnrichedKillEvent(
        trigger="PROPERTY_INSURANCE_MISSING",
        property_type="STR",
    )
    assert "32" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven insurance requirements (T1_T2 sweep)
2. Form C-1 code 24 (Other) for fallback
