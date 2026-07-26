---
type: research
status: drafted
confidence: 5
title: Code 14 — No Credit File
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #14"
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_14_no_credit_file.md
vaulted_at: 2026-06-20
---
# Code 14 — No Credit File

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #14
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "No credit file"

## Industry Guidance

> "This reason should be used when a creditor requests a credit report on an applicant, but the applicant does not have (or the creditor is unable to locate) an established credit file."

**Distinction from Code 15 (Limited credit experience)**: Code 14 = **no file at all** (credit report returns "no record found"). Code 15 = **file exists but is thin** (credit report returns 1-2 tradelines).

## DSCR-Specific Application

**Medium-high DSCR relevance.** Many DSCR-eligible borrowers have no credit file:

1. **Foreign National (FN)** with no US credit history — never had SSN, never had US loan
2. **ITIN borrower** with no US tradelines — no SSN means most US lenders don't report
3. **First-time real estate investor** — never borrowed personally, no business credit
4. **Young investor** — under 21, no credit file yet
5. **Recent immigrant** — recently arrived in US, no credit file

**DSCR-specific triggers for Code 14**:
- Newfi FN program: borrower has no US credit file at all 3 bureaus → code 14
- Griffin DSCR-Investor: requires 4 alt references if no credit file → code 14 if no references supplied
- Pennymac: Tri-Merge returns "no record" for new immigrant PG → code 14

**Lender policy exception**: Some DSCR lenders (Newfi, Angel Oak, Deephaven) have **"No Credit File" exception** for DSCR-Investor with DSCR ≥ 1.25, treating it as acceptable if the DSCR clears.

## Example Adverse Action Reason Text

> "We were unable to obtain a credit report on you. Our standard practice includes obtaining a tri-merge credit report from [Experian, Equifax, TransUnion]. The credit bureaus returned "no record found" for your name, address, and Social Security Number (or ITIN). As a result, we could not evaluate your credit history."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 14? |
|---|---|
| `NO_CREDIT_FILE` | YES (primary) |
| `TRIMERGE_NO_RECORD` | YES (sub-trigger) |
| `FN_NO_US_CREDIT` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Code 14 = use alternative references (4 minimum) or deny
- **Angel Oak**: Code 14 = DSCR-Investor with DSCR ≥ 1.25 acceptable
- **Griffin Funding**: Code 14 = manual underwrite required
- **Pennymac**: Code 14 = refer to non-DSCR products
- **Deephaven**: Code 14 = DSCR-Asset Depletion path

## Test Specification

```python
def test_code_14_text_verbatim():
    assert ECOA_REASON_TEXTS["14"] == "No credit file"

def test_code_14_for_foreign_national_no_us_credit():
    ke = EnrichedKillEvent(
        trigger="NO_CREDIT_FILE",
        fico=0,  # no score
        property_type="STR",
    )
    assert "14" in select_ecoa_codes(ke.trigger)

def test_code_14_vs_15_distinction():
    """Code 14 = no file at all; Code 15 = thin file."""
    no_file = EnrichedKillEvent(trigger="NO_CREDIT_FILE", fico=0)
    thin_file = EnrichedKillEvent(trigger="LIMITED_CREDIT_EXPERIENCE", fico=640)
    assert "14" in select_ecoa_codes(no_file.trigger)
    assert "14" not in select_ecoa_codes(thin_file.trigger)
    assert "15" in select_ecoa_codes(thin_file.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Newfi FN program guidelines
5. Angel Oak DSCR-Investor product
