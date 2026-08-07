---
type: research
status: drafted
confidence: 4
title: Code 38 — Loan Purpose Not Eligible
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with loan-purpose-specific text. Some DSCR lenders restrict loan purpose (e.g., construction-to-perm only, refinance only)."
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
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_38_loan_purpose_not_eligible.md
vaulted_at: 2026-06-20
---
# Code 38 — Loan Purpose Not Eligible

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with loan-purpose-specific text. Some DSCR lenders restrict loan purpose (e.g., construction-to-perm only, refinance only).

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The loan purpose of [purchase / refinance / cash-out / construction] is not eligible for our program."

Or more specifically:
> "Our [DSCR-Investor / DSCR-FN / DSCR-ITIN] program does not offer [purchase / refinance / cash-out] loans."

## DSCR-Specific Application

**Medium DSCR relevance.** Loan purpose restrictions:

1. **Purchase** — most DSCR lenders offer
2. **Rate-and-term refinance** — most offer
3. **Cash-out refinance** — most offer (with seasoning)
4. **Construction-to-permanent** — some offer (Newfi, Griffin); most don't
5. **Renovation (FHA 203k style)** — most don't offer
6. **Delayed purchase** — some offer; most don't
7. **Assumption** — some offer
8. **Modification** — rare

**DSCR-specific triggers for Code 38**:
- Borrower requests construction-to-perm; lender doesn't offer → code 38
- Borrower requests renovation loan; lender doesn't offer → code 38
- Borrower requests assumption; lender doesn't allow → code 38

**Lender policy**:
- **Newfi**: Purchase, refi, cash-out, construction-to-perm
- **Pennymac**: Purchase, refi, cash-out
- **Griffin Funding**: Purchase, refi, cash-out, construction-to-perm
- **Angel Oak**: Purchase, refi, cash-out
- **Deephaven**: Purchase, refi, cash-out, construction-to-perm

## Example Adverse Action Reason Text

> "The loan purpose of [construction-to-permanent / renovation / assumption] is not eligible for our [DSCR-Investor] program. We may be able to refer your application to another lender who offers this loan purpose."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 38? |
|---|---|
| `LOAN_PURPOSE_NOT_ELIGIBLE` | YES (primary) |
| `CONSTRUCTION_TO_PERM` | YES (sub-trigger) |
| `ASSUMPTION_NOT_ALLOWED` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: Purchase, refi, cash-out, construction-to-perm
- **Pennymac**: Purchase, refi, cash-out
- **Griffin Funding**: Purchase, refi, cash-out, construction-to-perm
- **Angel Oak**: Purchase, refi, cash-out
- **Deephaven**: Purchase, refi, cash-out, construction-to-perm

## Test Specification

```python
def test_code_38_text_loan_purpose():
    assert "loan purpose" in ECOA_REASON_TEXTS["38"].lower() or "purpose" in ECOA_REASON_TEXTS["38"].lower()

def test_code_38_for_construction_to_perm():
    ke = EnrichedKillEvent(
        trigger="LOAN_PURPOSE_NOT_ELIGIBLE",
        property_type="SFR",
    )
    assert "38" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven loan purpose eligibility (T1_T2 sweep)
2. Form C-1 code 24 (Other) for fallback
