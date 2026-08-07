---
type: research
status: drafted
confidence: 5
title: Code 06 — Unable to Verify Employment
summary: "**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #6"
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
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_06_unable_to_verify_employment.md
vaulted_at: 2026-06-20
---
# Code 06 — Unable to Verify Employment

**Reg B Reference:** 12 CFR Part 1002, Appendix C, Sample Form C-1, Part I, Reason #6
**Confidence:** 5/5
**Source:** FRRS Form C-1; Compliance Cohort (https://www.compliancecohort.com/blog/adverse-action-reasons-chart)

---

## Canonical Reg B Form C-1 Text (verbatim)

> "Unable to verify employment"

## Industry Guidance

> "This reason should be used when a creditor regularly verifies employment and is unable to verify the employment of an applicant after a verification attempt was made. The denied file should document the creditor's attempts to verify employment."

**Documentation requirement**: Same as Code 04 — the denied file must document VoE attempts (date, employer HR contact, result).

## DSCR-Specific Application

In DSCR lending, VoE is performed via:

1. **The Work Number (TWN)** — Equifax employment database (most common automated)
2. **Direct employer contact** — phone or written verification
3. **Pay stub + W-2 cross-check** — 30-day recent pay stub + 2 years W-2

**DSCR-specific triggers for Code 06**:
- TWN returns "no record" for PG
- Employer HR department returns "no longer employed" or "unable to verify"
- Self-employed PG cannot produce CPA letter or business license
- PG refuses to authorize §1002.10(b) verification
- Foreign national employer cannot be verified through US channels

**DSCR-Rental Income** lenders (DSCR-Investor programs) that **waive** PG employment typically do not use Code 06 unless explicitly required (e.g., DSCR-Bank Statement for self-employed PG).

## Example Adverse Action Reason Text

> "We were unable to verify your employment. Our standard practice includes verification of employment through [The Work Number / direct employer contact / state licensing database]. We made the following attempts on [dates] with [employer name/contact method]. The verification was not completed. As a result, we could not confirm the income you stated on your application."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 06? |
|---|---|
| `EMPLOYMENT_UNVERIFIABLE` | YES (primary) |
| `TWN_NO_RECORD` | YES (sub-trigger) |
| `SELF_EMPLOYED_NO_CPA` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: TWN first; falls back to written verification if TWN returns no record
- **Pennymac**: TWN + recent pay stub; no record + stale stub = code 06
- **Angel Oak**: Accepts CPA letter as alternative to VoE
- **Griffin Funding**: Requires §1002.10(b) authorization; refusal triggers code 06
- **Deephaven**: Has exception for self-employed with 2 years tax returns

## Test Specification

```python
def test_code_06_text_verbatim():
    assert ECOA_REASON_TEXTS["06"] == "Unable to verify employment"

def test_code_06_for_self_employed_no_cpa():
    ke = EnrichedKillEvent(
        trigger="EMPLOYMENT_UNVERIFIABLE",
        fico=700,
    )
    assert "06" in select_ecoa_codes(ke.trigger)
```

## Sources

1. eCFR Appendix C to Part 1002
2. FRRS Form C-1
3. Compliance Cohort, Nov 12, 2024
4. Reg B §1002.10(b) authorization requirement
