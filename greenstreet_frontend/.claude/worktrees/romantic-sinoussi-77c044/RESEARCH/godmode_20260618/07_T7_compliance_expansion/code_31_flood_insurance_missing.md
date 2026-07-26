---
type: research
status: drafted
confidence: 4
title: Code 31 — Flood Insurance Not in Place (DSCR Insurance Overlay)
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with flood-insurance-specific text. DSCR lenders treat missing flood insurance as a **kill criterion**, not just a closing condition."
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
  - topic/flood-insurance
  - topic/insurance
  - topic/kill-criteria
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_31_flood_insurance_missing.md
vaulted_at: 2026-06-20
---
# Code 31 — Flood Insurance Not in Place (DSCR Insurance Overlay)

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with flood-insurance-specific text. DSCR lenders treat missing flood insurance as a **kill criterion**, not just a closing condition.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** FEMA NFIP; lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "Flood insurance is required for the subject property, but a flood insurance binder is not in place."

Or more specifically:
> "The subject property is located in a Special Flood Hazard Area (SFHA) and the required flood insurance binder has not been provided. Our standard requires a flood insurance binder in place at the time of application or commitment."

## DSCR-Specific Application

**Critical for DSCR.** Flood insurance is a hard kill criterion for DSCR. Most lenders will not even start underwriting a DSCR loan without flood insurance binder if the property is in an SFHA. Common scenarios:

1. **SFHA Zone A, AE, V, VE** — flood insurance REQUIRED by federal law (NFIP)
2. **Zone X (moderate)** — flood insurance recommended but not required
3. **Zone X (minimal)** — no flood insurance required
4. **Pending FIRM remap** — property is in a remap zone; flood insurance may be required
5. **Lender overlay** — some DSCR lenders require flood insurance even outside SFHA (e.g., Griffin)

**DSCR-specific triggers for Code 31**:
- Subject in SFHA; no flood binder → code 31
- Subject in SFHA; flood binder with insufficient dwelling coverage → code 31
- Subject in SFHA; flood binder effective date after closing → code 31
- Subject in SFHA; flood carrier not on WYO list → code 31
- Pending FIRM remap; lender requires flood binder pre-closing → code 31

**Lender policy**:
- **Newfi**: SFHA flood binder required at application
- **Pennymac**: SFHA flood binder required at application
- **Griffin Funding**: SFHA + lender overlay on Zone X (moderate)
- **Angel Oak**: SFHA flood binder required
- **Deephaven**: SFHA + lender overlay on coastal properties

## Example Adverse Action Reason Text

> "The subject property is located in a Special Flood Hazard Area (SFHA) and the required flood insurance binder has not been provided. Our standard requires a flood insurance binder in place at the time of application. The flood insurance must be on the NFIP WYO list, with a dwelling coverage amount equal to or greater than the loan amount, and an effective date on or before the closing date."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 31? |
|---|---|
| `FLOOD_INSURANCE_MISSING` | YES (primary) |
| `FLOOD_INSURANCE_INSUFFICIENT` | YES (sub-trigger) |
| `FLOOD_NOT_WYO` | YES (sub-trigger) |
| `PENDING_FIRM_REMAP` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: SFHA at application
- **Pennymac**: SFHA at application
- **Griffin Funding**: SFHA + Zone X (moderate) overlay
- **Angel Oak**: SFHA at application
- **Deephaven**: SFHA + coastal overlay

## Test Specification

```python
def test_code_31_text_flood():
    assert "flood" in ECOA_REASON_TEXTS["31"].lower()

def test_code_31_for_flood_missing():
    ke = EnrichedKillEvent(
        trigger="FLOOD_INSURANCE_MISSING",
        property_type="SFR",
    )
    assert "31" in select_ecoa_codes(ke.trigger)
```

## Sources

1. FEMA NFIP — National Flood Insurance Program
2. Newfi, Pennymac, Griffin, Angel Oak, Deephaven insurance requirements (T1_T2 sweep)
3. Form C-1 code 24 (Other) for fallback
