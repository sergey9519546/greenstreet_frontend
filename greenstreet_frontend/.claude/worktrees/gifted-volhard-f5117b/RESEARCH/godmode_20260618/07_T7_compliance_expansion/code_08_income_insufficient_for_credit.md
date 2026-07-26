---
type: research
slice: 1
status: drafted
confidence: 5
title: Code 08 — Income Insufficient for Amount of Credit Requested
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #8"
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
  - regulation/fcra
  - regulation/reg-b
  - slice/1
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/reserves
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_08_income_insufficient_for_credit.md
vaulted_at: 2026-06-20
---
# Code 08 — Income Insufficient for Amount of Credit Requested

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #8
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

**NOTE:** The current Slice 1 code 19 ("Income insufficient") is the legacy FCRA text and overlaps with this Form C-1 code 8. For DSCR applications, **Code 08 is the more specific and accurate** choice when the proposed PITIA pushes DTI above the lender's maximum.

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Income insufficient for amount of credit requested"

## Industry Guidance

> "This reason should be used when an applicant's proposed **debt-to-income ratio exceeds the financial institution's maximum DTI ratio after the proposed payment is added into the DTI calculation**. A corresponding DTI should be retained in the denied file."

**Key distinction from Code 09 (Excessive obligations)**: Code 08 = **proposed payment** pushes DTI over the cap. Code 09 = **existing** obligations already push DTI over the cap. For DSCR, the proposed PITIA includes P&I + T+I+A.

## DSCR-Specific Application

For DSCR loans, DTI is typically a **secondary** qualifying metric (DSCR is primary). However, some lenders impose a DTI cap for non-ITIN/non-FN borrowers:

- **Newfi DSCR-Full Doc**: 50% DTI cap (PG personal debt-to-income)
- **Pennymac DSCR**: 55% DTI cap for W-2 PG
- **Griffin DSCR-Investor**: DTI waived if DSCR ≥ 1.20
- **Angel Oak DSCR-Investor Plus**: DTI waived if DSCR ≥ 1.50
- **Deephaven DSCR-Asset Depletion**: 36-month asset depletion methodology

**DSCR-specific triggers for Code 08**:
- PG W-2 income $8,000/month; existing debts $3,000/month; proposed PITIA $2,500 → DTI = 68% (over 50% cap) → code 08
- DSCR 1.45 (good) but PG DTI 62% (over 50% cap) → code 08 NOT code 19
- ITIN borrower with DSCR 1.65 and DTI 70% → code 08 if DTI is checked, else DSCR-only path

**Important**: For pure DSCR-Investor (no DTI), if the lender uses no DTI at all, code 08 is **not applicable**. The lender should select a different code (e.g., 21 for debt-to-income if applicable, or 27 for insufficient collateral).

## Example Adverse Action Reason Text

> "Your income is insufficient to support the amount of credit requested. Our standard requires a maximum debt-to-income ratio of 50% when the proposed monthly payment is included. Your current monthly income is $[X], your existing monthly debt obligations are $[Y], and the proposed monthly payment for the new loan would be $[Z]. Your total proposed debt-to-income ratio is [N]%, which exceeds our maximum. We may reconsider if the loan amount is reduced or your income increases."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 08? |
|---|---|
| `DTI_OVER_50` | YES (primary, when proposed payment drives DTI) |
| `INCOME_INSUFFICIENT_FOR_LOAN` | YES (sub-trigger) |
| `INSUFFICIENT_RESERVES` | NO (use Code 19 or Code 22) |

## Lender-Specific Variants

- **Newfi DSCR-Full Doc**: 50% back-end DTI; 45% front-end
- **Pennymac DSCR**: 55% back-end; 50% for LTR, 55% for STR
- **Griffin DSCR-Investor**: DTI waived if DSCR ≥ 1.20; otherwise 50% cap
- **Angel Oak DSCR-Investor Plus**: DTI waived if DSCR ≥ 1.50

## Test Specification

```python
def test_code_08_text_verbatim():
    assert ECOA_REASON_TEXTS["08"] == "Income insufficient for amount of credit requested"

def test_code_08_dti_drive_proposed_payment():
    """Code 08 is for DTI breach after proposed payment."""
    ke = EnrichedKillEvent(
        trigger="DTI_OVER_50",
        rent_monthly=3500,
        pitia_monthly=2800,
    )
    assert "08" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Existing Slice 1 ECOA_CODE_19_INCOME_INSUFFICIENT (to be deprecated for DSCR)
