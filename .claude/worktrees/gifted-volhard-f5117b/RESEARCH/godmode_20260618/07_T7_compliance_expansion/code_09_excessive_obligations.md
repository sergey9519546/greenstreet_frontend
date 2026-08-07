---
type: research
slice: 1
status: drafted
confidence: 5
title: Code 09 — Excessive Obligations in Relation to Income
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #9"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - slice/1
  - tax/pal
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/reserves
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_09_excessive_obligations.md
vaulted_at: 2026-06-20
---
# Code 09 — Excessive Obligations in Relation to Income

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #9
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

**NOTE:** The current Slice 1 code 21 ("Debt obligations too high") maps to this Form C-1 code 9. This is the **existing obligations** version of Code 08.

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Excessive obligations in relation to income"

## Industry Guidance

> "This reason should be used when an applicant's **current** debt-to-income ratio exceeds the financial institution's maximum DTI ratio **before the proposed payment is added into the DTI calculation**. A corresponding DTI should be retained in the denied file."

**Key distinction from Code 08**: Code 09 is **existing** debt burden; Code 08 is **proposed** debt burden.

## DSCR-Specific Application

For DSCR, this reason applies when the PG's pre-application DTI is over the lender's cap. Less common than Code 08 because DSCR lenders typically use post-application (proposed) DTI.

**DSCR-specific triggers for Code 09**:
- PG W-2 income $8,000/month; existing debts $4,500/month (already 56% DTI pre-loan) → code 09
- DSCR 1.85 (strong) but PG existing DTI 60% (over 50% cap) → code 09
- Multiple financed properties: aggregate housing expense already exceeds 40% of income

**Combined use**: A denied DSCR file might have both Code 08 (proposed PITIA pushes DTI) and Code 09 (existing obligations already high). This is acceptable per Compliance Cohort — provide all principal reasons.

## Example Adverse Action Reason Text

> "Your existing debt obligations are excessive in relation to your income. Our standard requires a maximum debt-to-income ratio of 50% before the proposed mortgage payment is added. Your current monthly income is $[X] and your current monthly debt obligations are $[Y], for a current debt-to-income ratio of [N]%, which exceeds our maximum."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 09? |
|---|---|
| `EXISTING_DTI_OVER_50` | YES (primary) |
| `MULTIPLE_FINANCED_PROPERTIES` | YES (sub-trigger) |
| `INSUFFICIENT_RESERVES` | NO (use Code 19) |

## Lender-Specific Variants

- **Newfi**: Computes pre-application DTI; uses 50% cap
- **Pennymac**: Computes pre-application DTI; uses 55% cap
- **Griffin**: Pre-app DTI check waived if DSCR ≥ 1.20
- **Angel Oak**: Pre-app DTI check waived if DSCR ≥ 1.50
- **Deephaven**: Has 60% pre-app DTI for Asset Depletion path

## Test Specification

```python
def test_code_09_text_verbatim():
    assert ECOA_REASON_TEXTS["09"] == "Excessive obligations in relation to income"

def test_code_09_existing_dti_over_50():
    ke = EnrichedKillEvent(
        trigger="EXISTING_DTI_OVER_50",
        fico=680,
    )
    assert "09" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Existing Slice 1 ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH (deprecate in favor of 09 for DSCR)
