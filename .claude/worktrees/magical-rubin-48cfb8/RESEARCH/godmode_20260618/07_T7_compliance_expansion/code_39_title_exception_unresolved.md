---
type: research
status: drafted
confidence: 4
title: Code 39 — Title Exception Unresolved
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with title-specific text. Title exceptions (Schedule B-I) are common DSCR denial reasons."
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_39_title_exception_unresolved.md
vaulted_at: 2026-06-20
---
# Code 39 — Title Exception Unresolved

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with title-specific text. Title exceptions (Schedule B-I) are common DSCR denial reasons.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The title commitment for the subject property contains exceptions that are not acceptable to us."

Or more specifically:
> "The title commitment dated [date] contains the following exception that must be resolved: [unpermitted addition / easement encroachment / lien / pending litigation / access restriction]."

## DSCR-Specific Application

**High DSCR relevance.** Title exceptions are common DSCR denial reasons. Common exceptions:

1. **Unpermitted additions** — added rooms, ADU, garage conversion
2. **Easement encroachment** — fence, driveway, building over easement
3. **Outstanding lien** — mechanic's lien, IRS lien, HOA lien
4. **Pending litigation** — title dispute, eminent domain
5. **Access restriction** — easement, shared drive, private road
6. **Survey exception** — no ALTA survey
7. **Mineral rights** — reserved mineral rights
8. **HOA/PUD** — not in good standing
9. **Covenant violations** — unrecorded restrictions
10. **Bankruptcy exception** — property in pending BK

**DSCR-specific triggers for Code 39**:
- Title shows unpermitted ADU; lender doesn't allow → code 39
- Title shows access restriction; lender requires fee simple access → code 39
- Title shows outstanding IRS lien → code 39
- Title shows pending litigation → code 39

**Lender policy**:
- **Newfi**: All exceptions must be cleared or insured over
- **Pennymac**: All exceptions must be cleared
- **Griffin Funding**: Most exceptions cleared or insured
- **Angel Oak**: All exceptions must be cleared
- **Deephaven**: All exceptions must be cleared

## Example Adverse Action Reason Text

> "The title commitment for the subject property contains the following exception that must be resolved: [exception]. Our standard requires that all title exceptions be cleared, insured over (e.g., with an ALTA endorsement), or otherwise addressed prior to closing."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 39? |
|---|---|
| `TITLE_EXCEPTION_UNRESOLVED` | YES (primary) |
| `UNPERMITTED_ADDITION` | YES (sub-trigger) |
| `EASEMENT_ENCROACHMENT` | YES (sub-trigger) |
| `OUTSTANDING_LIEN` | YES (sub-trigger) |
| `PENDING_LITIGATION` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: All exceptions cleared
- **Pennymac**: All exceptions cleared
- **Griffin Funding**: Most cleared/insured
- **Angel Oak**: All exceptions cleared
- **Deephaven**: All exceptions cleared

## Test Specification

```python
def test_code_39_text_title():
    assert "title" in ECOA_REASON_TEXTS["39"].lower() or "exception" in ECOA_REASON_TEXTS["39"].lower()

def test_code_39_for_unpermitted_addition():
    ke = EnrichedKillEvent(
        trigger="TITLE_EXCEPTION_UNRESOLVED",
        property_type="SFR",
    )
    assert "39" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven title requirements (T1_T2 sweep)
2. ALTA Endorsement forms (industry standard)
3. Form C-1 code 24 (Other) for fallback
