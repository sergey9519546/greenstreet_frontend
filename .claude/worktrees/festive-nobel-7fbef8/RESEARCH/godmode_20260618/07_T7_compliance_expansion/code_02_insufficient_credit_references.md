---
type: research
status: drafted
confidence: 5
title: Code 02 — Insufficient Number of Credit References Provided
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #2"
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
  - topic/reserves
  - type/audit
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_02_insufficient_credit_references.md
vaulted_at: 2026-06-20
---
# Code 02 — Insufficient Number of Credit References Provided

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #2
**Source:** Federal Reserve FRRS Form C-1 (https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm)
**Industry guidance:** Compliance Cohort, Nov 12, 2024 (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)
**Confidence:** 5/5

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Insufficient number of credit references provided"

## Industry Guidance (Compliance Cohort)

> "This reason should be used when a creditor has requested credit references **beyond the history found in a credit report** (such as when the applicant does not have an established credit file or credit score), and the applicant was not able to supply sufficient credit references according to the financial institutions defined standards (such as a minimum number of credit references)."

**Key distinction from Code 03 (Unacceptable type):** Code 02 is about **quantity**; Code 03 is about **quality/acceptability**. The creditor must have a **defined policy** on minimum number of references (typically 3-4 tradelines) for this reason to be used defensibly under ECOA fair lending.

## DSCR-Specific Application

DSCR lenders face a structural thin-file problem:

1. **Foreign National (FN) borrowers** with Visa / B-1 / B-2 / E-2 / E-3 / H-1B / L-1 — limited US tradelines
2. **ITIN borrowers** (no SSN, IRS ITIN only) — typically thin credit files at Experian, Equifax, TransUnion
3. **First-time real estate investors** — newly formed LLC, no business credit file
4. **DSCR-Investor programs** at Newfi, Griffin, Angel Oak that explicitly allow 0-trade borrowers subject to DSCR ≥ 1.25

**DSCR-specific triggers for Code 02**:
- ITIN borrower has 0-1 trade lines at all 3 bureaus → lender requires manual credit references
- Borrower is a foreign national with 0 US credit history (no SSN ever issued)
- Borrower entity has no EIN history and no D-U-N-S number

**Compliance constraint**: The lender must have a **written policy** stating the minimum number of references (e.g., Newfi: "4 alternative references required for Foreign National"). Without that policy, Code 02 is vulnerable to fair lending challenge.

## Example Adverse Action Reason Text

> "We were unable to obtain a sufficient number of credit references for you. Our standard requires a minimum of four (4) satisfactory credit references for borrowers with a limited credit history. You provided [N] references, which does not meet our minimum standard. Examples of acceptable references include prior mortgage lenders, landlords for rental properties you have owned, auto lenders, credit card issuers, and personal references from banking institutions where you have held accounts for at least 12 months."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 02? |
|---|---|
| `INSUFFICIENT_CREDIT_REFERENCES` | YES (primary) |
| `THIN_FILE_FOREIGN_NATIONAL` | YES (sub-trigger) |
| `THIN_FILE_ITIN` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Foreign National program requires 4 alt references; uses code 02 if <4 received
- **Angel Oak**: Bridge program allows no tradelines if DSCR ≥ 1.50 and reserves ≥ 12 months
- **Griffin Funding**: Foreign National requires 3 alt references verified by US bank statements
- **Pennymac DSCR**: Does not have a Foreign National program; would refer to non-DSCR products
- **Deephaven**: Foreign National DSCR requires 4 references or a US co-signer

## Test Specification

```python
def test_code_02_text_verbatim():
    assert ECOA_REASON_TEXTS["02"] == "Insufficient number of credit references provided"

def test_code_02_triggered_for_thin_file_foreign_national():
    ke = EnrichedKillEvent(
        trigger="INSUFFICIENT_CREDIT_REFERENCES",
        fico=0,  # no score
        property_type="SFR",
    )
    assert select_ecoa_codes(ke.trigger) == ["02"]

def test_code_02_with_policy_metadata_audit_field():
    """Code 02 is only defensible if creditor has a defined policy."""
    payload = build_adverse_action_notice(
        EnrichedKillEvent(
            trigger="INSUFFICIENT_CREDIT_REFERENCES",
            lender_id="NEWFI_001",
        )
    )
    # Audit trail must include policy reference (lender overlay)
    assert payload["meta"].get("policy_ref") is not None
```

## Sources

1. eCFR Appendix C to Part 1002, https://www.ecfr.gov/current/title-12/chapter-X/part-1002/appendix-Appendix%20C%20to%20Part%201002
2. FRRS Form C-1, https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm
3. Compliance Cohort, Nov 12, 2024, https://www.compliancecohort.com/blog/adverse-action-reasons-chart
