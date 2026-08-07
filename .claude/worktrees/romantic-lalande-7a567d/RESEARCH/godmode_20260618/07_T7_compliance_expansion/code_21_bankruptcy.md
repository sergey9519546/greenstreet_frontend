---
type: research
slice: 1
status: drafted
confidence: 5
title: Code 21 — Bankruptcy
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #21"
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/1
  - slice/2
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/foreclosure
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_21_bankruptcy.md
vaulted_at: 2026-06-20
---
# Code 21 — Bankruptcy

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #21
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

**NOTE:** This is the Form C-1 code 21. It is **distinct** from the Slice 1 ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH (which is the legacy FCRA text "Your debt payments or other obligations are too high" and which maps to Form C-1 code 9 "Excessive obligations in relation to income"). To resolve this naming collision, Slice 1's code 21 should be **renamed/re-aliased** to the new key (e.g., ECOA_CODE_09_EXCESSIVE_OBLIGATIONS), and Form C-1 code 21 (Bankruptcy) should be added as ECOA_CODE_21_BANKRUPTCY.

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Bankruptcy"

## Industry Guidance

> "This reason should be used when the credit report reflects a bankruptcy that does not satisfy our credit standards."

**Distinction from Code 20 (Foreclosure)**: Code 21 = **bankruptcy** filing (Ch 7, Ch 11, Ch 13). Code 20 = foreclosure of property or repossession of vehicle.

## DSCR-Specific Application

**High DSCR relevance.** Bankruptcy seasoning is a major DSCR credit overlay. Most DSCR lenders require:

- **Ch 7 BK**: 36-48 month seasoning from discharge date
- **Ch 13 BK**: 36-48 month seasoning from discharge date (some lenders count from filing date)
- **No active Ch 13**: PG must be discharged or dismissed

**Lender policy**:
- **Newfi**: Ch 7 = 36 months from discharge; Ch 13 = 36 months from discharge or 0 from filing with 12 months perfect payments
- **Pennymac DSCR**: Ch 7 = 48 months; Ch 13 = 48 months from discharge
- **Griffin Funding**: Ch 7 = 36 months; Ch 13 = 36 months from discharge
- **Angel Oak**: Ch 7 = 24 months for DSCR-Investor; Ch 13 = 24 months
- **Deephaven**: Ch 7 = 36 months; Ch 13 = 36 months from discharge

**DSCR-specific triggers for Code 21**:
- Ch 7 BK discharged 24 months ago; lender requires 36 → code 21
- Ch 13 BK filed 18 months ago with 12 perfect payments; Newfi allows → acceptable
- Ch 13 BK dismissed 6 months ago; most lenders deny
- Multiple BK filings (Ch 7 + Ch 13) → code 21 (most lenders decline)

**Distinction from Code 18 (Collection)**: A BK that didn't eliminate a deficiency judgment is **Code 18 + Code 21**. A BK that fully discharged all debts is **Code 21** only.

## Example Adverse Action Reason Text

> "Your credit report indicates a bankruptcy that does not meet our credit standards. Specifically, your credit report reflects a Chapter [7/13] bankruptcy [discharged/dismissed] on [date]. Our standard requires a minimum of [N] months between the bankruptcy discharge date and the date of this application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 21? |
|---|---|
| `BK_DISCHARGE` | YES (primary) |
| `BK_CH7_UNDER_36MO` | YES (sub-trigger) |
| `BK_CH13_UNDER_36MO` | YES (sub-trigger) |
| `BK_MULTIPLE_FILINGS` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 36-month Ch 7; 36-month Ch 13 (or 0 from filing with 12 perfect)
- **Pennymac**: 48-month both
- **Griffin Funding**: 36-month both
- **Angel Oak**: 24-month both for DSCR-Investor
- **Deephaven**: 36-month both

## ⚠️ NAMING COLLISION RESOLUTION

The current Slice 1 `ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH = "21"` is **mislabeled** — it actually corresponds to Form C-1 code 9 (Excessive obligations in relation to income). For Slice 2 P0-4, the renaming should be:

```python
# DEPRECATED (Slice 1)
ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH = "21"  # actual Form C-1 code 9 text

# NEW (Slice 2)
ECOA_CODE_09_EXCESSIVE_OBLIGATIONS = "9"  # "Excessive obligations in relation to income"
ECOA_CODE_21_BANKRUPTCY = "21"  # "Bankruptcy"  <-- THIS IS FORM C-1 CODE 21
```

## Test Specification

```python
def test_code_21_text_verbatim():
    assert ECOA_REASON_TEXTS["21"] == "Bankruptcy"

def test_code_21_for_ch7_recent():
    ke = EnrichedKillEvent(
        trigger="BK_DISCHARGE",
        fico=640,
    )
    assert "21" in select_ecoa_codes(ke.trigger)

def test_code_21_renamed_collision_resolution():
    """Slice 2 must NOT have code 21 = Debt obligations. That should be code 9."""
    assert "9" in ECOA_REASON_TEXTS  # Excessive obligations
    assert ECOA_REASON_TEXTS["9"] == "Excessive obligations in relation to income"
    assert "21" in ECOA_REASON_TEXTS  # Bankruptcy
    assert ECOA_REASON_TEXTS["21"] == "Bankruptcy"
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
5. Existing Slice 1 compliance.py (collision to be resolved)
