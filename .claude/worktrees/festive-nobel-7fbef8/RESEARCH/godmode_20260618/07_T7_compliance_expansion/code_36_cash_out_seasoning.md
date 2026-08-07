---
type: research
status: drafted
confidence: 4
title: Code 36 — Cash-Out Seasoning Not Met (BRRRR / Cash-Out Refi)
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with cash-out-seasoning-specific text. DSCR lenders require seasoning on cash-out refinances."
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - topic/sfr
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_36_cash_out_seasoning.md
vaulted_at: 2026-06-20
---
# Code 36 — Cash-Out Seasoning Not Met (BRRRR / Cash-Out Refi)

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with cash-out-seasoning-specific text. DSCR lenders require seasoning on cash-out refinances.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The property was purchased less than [N] months ago, which does not meet our minimum cash-out seasoning requirement of [M] months."

Or more specifically:
> "Cash-out refinance is not permitted until [N] months have elapsed since the subject property was purchased. Our standard requires a minimum of [N] months of ownership before cash-out refinance is eligible."

## DSCR-Specific Application

**High DSCR relevance.** Cash-out seasoning is a major DSCR credit overlay. Most DSCR lenders require:

- **Standard cash-out**: 6-12 months seasoning (Pennymac: 6, Newfi: 6, Griffin: 6, Angel Oak: 6, Deephaven: 12)
- **BRRRR cash-out**: 12 months seasoning with documented improvements
- **Delayed cash-out**: 12 months seasoning on all lender cash-out
- **No cash-out**: Some lenders (Griffin) limit cash-out to $100K

**DSCR-specific triggers for Code 36**:
- Property purchased 3 months ago; lender requires 6 → code 36
- Property purchased 6 months ago; BRRRR scenario; lender requires 12 → code 36
- Property purchased 9 months ago; no documented improvements → code 36

**Lender policy**:
- **Newfi**: 6 months standard; 12 months BRRRR
- **Pennymac**: 6 months standard; 12 months BRRRR
- **Griffin Funding**: 6 months; cash-out cap $100K
- **Angel Oak**: 6 months; 12 months BRRRR
- **Deephaven**: 12 months standard; 12 months BRRRR

## Example Adverse Action Reason Text

> "The property was purchased [N] months ago, which does not meet our minimum cash-out seasoning requirement of [M] months. We may be able to consider a rate-and-term refinance now, and a cash-out refinance after [date]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 36? |
|---|---|
| `CASH_OUT_SEASONING` | YES (primary) |
| `BRRRR_SEASONING` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 6 standard; 12 BRRRR
- **Pennymac**: 6 standard; 12 BRRRR
- **Griffin Funding**: 6; cash-out cap $100K
- **Angel Oak**: 6; 12 BRRRR
- **Deephaven**: 12 standard; 12 BRRRR

## Test Specification

```python
def test_code_36_text_cash_out():
    assert "cash" in ECOA_REASON_TEXTS["36"].lower() or "seasoning" in ECOA_REASON_TEXTS["36"].lower()

def test_code_36_for_cash_out_recent_purchase():
    ke = EnrichedKillEvent(
        trigger="CASH_OUT_SEASONING",
        property_type="SFR",
    )
    assert "36" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven cash-out seasoning (T1_T2 sweep)
2. Form C-1 code 24 (Other) for fallback
