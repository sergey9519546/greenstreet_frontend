---
type: research
status: drafted
confidence: 4
title: "Code 37 — Subject Property Not in Lender's Approved Coverage Area"
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with geography-specific text. Some DSCR lenders have geographic restrictions."
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - state/wv
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_37_state_not_covered.md
vaulted_at: 2026-06-20
---
# Code 37 — Subject Property Not in Lender's Approved Coverage Area

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with geography-specific text. Some DSCR lenders have geographic restrictions.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The subject property is not located in our approved coverage area."

Or more specifically:
> "The subject property is located in [State / MSA / County], which is not in our approved coverage area for [DSCR-Investor / DSCR-FN / DSCR-ITIN] loans."

## DSCR-Specific Application

**Medium DSCR relevance.** Geographic restrictions vary by lender:

- **Newfi**: 48 states (all except ND, SD)
- **Pennymac**: 48 states (excludes IA, ND, SD, VT)
- **Griffin Funding**: 47 states (excludes IA, ND, SD, VT, WV)
- **Angel Oak**: 45 states (excludes IA, ND, SD, VT, WV, WY)
- **Deephaven**: 48 states (all except ND, SD)

Some lenders have MSA-level restrictions within states. Some restrict rural areas.

**DSCR-specific triggers for Code 37**:
- Property in ND; lender doesn't accept ND → code 37
- Property in rural West Virginia; lender has rural overlay → code 37
- Property outside approved MSA in CA → code 37

**Lender policy**:
- **Newfi**: 48 states
- **Pennymac**: 48 states (no IA, ND, SD, VT)
- **Griffin Funding**: 47 states
- **Angel Oak**: 45 states
- **Deephaven**: 48 states

## Example Adverse Action Reason Text

> "The subject property is located in [State], which is not in our approved coverage area for [DSCR-Investor] loans. We may be able to refer your application to another lender who is licensed in this state."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 37? |
|---|---|
| `STATE_NOT_LICENSED` | YES (primary) |
| `GEO_RESTRICTION` | YES (sub-trigger) |
| `LENDER_NOT_LICENSED` | YES (sub-trigger, distinct from 34) |

## Lender-Specific Variants

- **Newfi**: 48 states
- **Pennymac**: 48 states (no IA, ND, SD, VT)
- **Griffin Funding**: 47 states
- **Angel Oak**: 45 states
- **Deephaven**: 48 states

## Test Specification

```python
def test_code_37_text_geography():
    assert "geography" in ECOA_REASON_TEXTS["37"].lower() or "coverage" in ECOA_REASON_TEXTS["37"].lower() or "state" in ECOA_REASON_TEXTS["37"].lower()

def test_code_37_for_state_not_licensed():
    ke = EnrichedKillEvent(
        trigger="STATE_NOT_LICENSED",
        property_type="SFR",
    )
    assert "37" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven coverage areas (T1_T2 sweep)
2. Form C-1 code 24 (Other) for fallback
