---
type: research
status: drafted
confidence: 4
title: Code 33 — Vesting Entity Not Acceptable
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with vesting-specific text. DSCR lenders have strict vesting requirements; this is a common kill criterion."
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
  - topic/kill-criteria
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_33_vesting_entity_unacceptable.md
vaulted_at: 2026-06-20
---
# Code 33 — Vesting Entity Not Acceptable

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with vesting-specific text. DSCR lenders have strict vesting requirements; this is a common kill criterion.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The vesting type/entity for the borrowing entity is not acceptable for our program."

Or more specifically:
> "The borrowing entity [is a [foreign entity / revocable trust / irrevocable trust] / is not in good standing with the [State] Secretary of State / has the wrong EIN classification] which is not acceptable for our [DSCR-Investor / DSCR-FN / DSCR-ITIN] program."

## DSCR-Specific Application

**High DSCR relevance.** DSCR lenders have very specific vesting rules:

1. **LLC** — most common; all DSCR lenders accept
2. **LP** — most accept
3. **Corporation (C-corp, S-corp)** — most accept for DSCR
4. **Trust (revocable)** — case-by-case; some accept (Pennymac), some don't
5. **Trust (irrevocable)** — most decline
6. **Foreign entity** — Foreign National program (Newfi, Griffin, Angel Oak, Deephaven)
7. **Individual (personal name)** — most decline for DSCR (entity-vested only)
8. **ITIN vesting** — entity-vested only; PG has ITIN
9. **Multi-member LLC** — most accept
10. **Single-member LLC disregarded** — most accept
11. **Series LLC** — case-by-case; some accept (DE, IL, NM, TN, UT, WY)

**DSCR-specific triggers for Code 33**:
- Vesting is revocable trust; lender doesn't accept → code 33
- Vesting is foreign entity; borrower is not in FN program → code 33
- Vesting is single-member LLC but entity is not registered with SOS → code 33
- Vesting is individual (personal name); lender requires entity → code 33
- Vesting is series LLC in non-series state → code 33

**Lender policy**:
- **Newfi**: LLC, LP, Corp; revocable trust case-by-case; FN program for foreign
- **Pennymac**: LLC, LP, Corp; revocable trust allowed
- **Griffin Funding**: LLC, LP, Corp; trust case-by-case
- **Angel Oak**: LLC, LP, Corp; foreign entities in FN program
- **Deephaven**: LLC, LP, Corp; foreign entities in FN program

## Example Adverse Action Reason Text

> "The vesting type/entity for the borrowing entity is not acceptable for our [DSCR-Investor] program. Specifically, the borrowing entity is [a revocable trust / a foreign entity not in our FN program / a single-member LLC not registered with the State Secretary of State], which is not an acceptable vesting for our program."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 33? |
|---|---|
| `VESTING_UNSUPPORTED` | YES (primary) |
| `REVOCABLE_TRUST_NOT_ALLOWED` | YES (sub-trigger) |
| `FOREIGN_ENTITY_NOT_FN` | YES (sub-trigger) |
| `ENTITY_NOT_GOOD_STANDING` | YES (sub-trigger) |
| `INDIVIDUAL_VESTING` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: LLC, LP, Corp; revocable trust case-by-case
- **Pennymac**: LLC, LP, Corp; revocable trust allowed
- **Griffin Funding**: LLC, LP, Corp
- **Angel Oak**: LLC, LP, Corp; foreign entities in FN program
- **Deephaven**: LLC, LP, Corp; foreign entities in FN program

## Test Specification

```python
def test_code_33_text_vesting():
    assert "vesting" in ECOA_REASON_TEXTS["33"].lower() or "entity" in ECOA_REASON_TEXTS["33"].lower()

def test_code_33_for_trust_not_allowed():
    ke = EnrichedKillEvent(
        trigger="VESTING_UNSUPPORTED",
        property_type="SFR",
    )
    assert "33" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven vesting requirements (T1_T2 sweep)
2. Form C-1 code 24 (Other) for fallback
