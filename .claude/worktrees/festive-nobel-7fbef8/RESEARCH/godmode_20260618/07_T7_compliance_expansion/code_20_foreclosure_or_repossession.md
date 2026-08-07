---
type: research
slice: 1
status: drafted
confidence: 5
title: Code 20 — Foreclosure or Repossession
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #20"
entities:
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/ecoa
  - regulation/reg-b
  - slice/1
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/foreclosure
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_20_foreclosure_or_repossession.md
vaulted_at: 2026-06-20
---
# Code 20 — Foreclosure or Repossession

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #20
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

**NOTE:** This is the Form C-1 code 20. The current Slice 1 ECOA_CODE_27_COLLATERAL_INSUFFICIENT is **distinct** from this code and is a separate reason text ("The collateral value is insufficient"). DSCR lenders may use Code 20 for the borrower's **credit history** event of prior foreclosure/repossession, distinct from Code 27 (current collateral valuation issue).

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Foreclosure or repossession"

## Industry Guidance

> "This reason should only be used when the credit report indicates a foreclosure or repossession that does not satisfy our credit standards."

**Distinction from Code 27 (collateral value is insufficient)**: Code 20 = **historical** event of losing prior property. Code 27 = **current** collateral value (appraisal) does not support the loan.

## DSCR-Specific Application

**High DSCR relevance.** Foreclosure seasoning is a major DSCR credit overlay.

**Lender policy**:
- **Newfi**: 36-month foreclosure seasoning (post-discharge date)
- **Pennymac DSCR**: 48-month foreclosure seasoning
- **Griffin Funding**: 36-month seasoning
- **Angel Oak**: 24-month seasoning for DSCR-Investor
- **Deephaven**: 36-month seasoning

**DSCR-specific triggers for Code 20**:
- Foreclosure discharged 24 months ago; lender requires 36 → code 20
- Foreclosure discharged 18 months ago; lender requires 36 → code 20
- Auto repossession 12 months ago; lender requires 24 → code 20
- Foreclosure discharged 60 months ago; lender requires 36 → NOT code 20 (acceptable)

**Distinction from Code 18 (collection/judgment)**: A foreclosure that resulted in a deficiency judgment is a **judgment** (Code 18). A foreclosure that was discharged in BK is **Code 18 + Code 20** if the BK didn't eliminate the deficiency.

## Example Adverse Action Reason Text

> "Your credit report indicates a foreclosure or repossession that does not meet our credit standards. Specifically, your credit report reflects [a foreclosure on a property located at X, discharged on date / a repossession of a Y, discharged on date]. Our standard requires a minimum of [N] months between the discharge date of a foreclosure or repossession and the date of this application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 20? |
|---|---|
| `FORECLOSURE_INSUFFICIENT_SEASONING` | YES (primary) |
| `REPO_INSUFFICIENT_SEASONING` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 36-month foreclosure seasoning
- **Pennymac DSCR**: 48-month foreclosure seasoning
- **Griffin Funding**: 36-month seasoning
- **Angel Oak**: 24-month seasoning for DSCR-Investor
- **Deephaven**: 36-month seasoning

## Test Specification

```python
def test_code_20_text_verbatim():
    assert ECOA_REASON_TEXTS["20"] == "Foreclosure or repossession"

def test_code_20_for_foreclosure_recent():
    ke = EnrichedKillEvent(
        trigger="FORECLOSURE_INSUFFICIENT_SEASONING",
        fico=680,
    )
    assert "20" in select_ecoa_codes(ke.trigger)

def test_code_20_vs_27_distinction():
    """Code 20 = prior foreclosure event; Code 27 = current appraisal value."""
    foreclosure = EnrichedKillEvent(
        trigger="FORECLOSURE_INSUFFICIENT_SEASONING",
        appraised_value=500000,
    )
    insufficient_appraisal = EnrichedKillEvent(
        trigger="LTV_OVER_90",
        appraised_value=400000,
    )
    assert "20" in select_ecoa_codes(foreclosure.trigger)
    assert "20" not in select_ecoa_codes(insufficient_appraisal.trigger)
    assert "27" in select_ecoa_codes(insufficient_appraisal.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi, Pennymac, Griffin, Angel Oak, Deephaven product guidelines
5. Existing Slice 1 ECOA_CODE_27_COLLATERAL_INSUFFICIENT (distinct, both retained)
