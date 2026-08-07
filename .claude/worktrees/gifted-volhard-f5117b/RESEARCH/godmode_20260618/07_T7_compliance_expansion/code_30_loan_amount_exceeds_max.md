---
type: research
slice: 1
status: drafted
confidence: 4
title: Code 30 — Loan Amount Exceeds Lender Maximum
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with loan-amount-specific text. Distinct from Code 26 (LTV too high) — this is about the **lender's loan amount cap**, not the LTV ratio."
entities:
  - concept/dscr
  - concept/ltv
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/1
tags:
  - topic/adverse-action
  - topic/compliance
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_30_loan_amount_exceeds_max.md
vaulted_at: 2026-06-20
---
# Code 30 — Loan Amount Exceeds Lender Maximum

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with loan-amount-specific text. Distinct from Code 26 (LTV too high) — this is about the **lender's loan amount cap**, not the LTV ratio.

**Confidence:** 4/5 (not a separate Reg B code; lender convention)
**Source:** Lender product guidelines

**NOTE:** This is **distinct** from the Slice 1 `ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX = "26"` which uses different text ("You requested an amount that exceeds the maximum loan amount permitted by our regulations"). For DSCR, this code 30 captures the **lender's program-level loan amount cap** as a specific reason.

---

## Canonical Text (DSCR lender convention)

> "The loan amount of $[X] exceeds the maximum loan amount of $[Y] for our [program]."

Or the more specific:
> "The proposed loan amount of $[X] exceeds the maximum loan amount of $[Y] permitted by our regulations" (legacy text).

## DSCR-Specific Application

**Medium DSCR relevance.** Loan amount caps vary by lender:

| Lender | Max Loan Amount | Min Loan Amount |
|---|---|---|
| **Newfi** | $2.5M (DSCR); $3M (DSCR-Investor) | $150K |
| **Pennymac** | $2.5M | $100K |
| **Griffin Funding** | $4M | $150K |
| **Angel Oak** | $3M (DSCR-Investor) | $150K |
| **Deephaven** | $3M | $100K |
| **Rocket Pro TPO** | $3.5M | $150K |
| **UWM** | $2M | $100K |
| **JMAC Lending** | $3M | $100K |

**DSCR-specific triggers for Code 30**:
- Borrower requests $3M; Griffin max is $4M → within limits (acceptable)
- Borrower requests $3.5M; Newfi max is $2.5M → code 30
- Borrower requests $80K; lender min is $100K → code 30 (use different specific text)

**Distinction from Code 26 (LTV too high)**: Code 30 is about the **loan amount** itself. Code 26 is about the **ratio** of loan to value. A $2M loan on a $1M property is code 26 (LTV 200%). A $5M loan on a $10M property is code 30 (loan exceeds lender cap), but LTV is only 50%.

## Example Adverse Action Reason Text

> "The proposed loan amount of $[X] exceeds the maximum loan amount of $[Y] permitted for our [DSCR-Investor / DSCR-Full Doc / FN / ITIN] program. We may be able to consider your application with a different program or a reduced loan amount."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 30? |
|---|---|
| `LOAN_AMOUNT_OVER_LENDER_MAX` | YES (primary) |
| `LOAN_AMOUNT_BELOW_MIN` | YES (sub-trigger, with reverse text) |

## Lender-Specific Variants

- **Newfi**: $2.5M-$3M cap
- **Pennymac**: $2.5M cap
- **Griffin Funding**: $4M cap (highest)
- **Angel Oak**: $3M cap
- **Deephaven**: $3M cap

## Test Specification

```python
def test_code_30_text_loan_amount():
    assert "loan amount" in ECOA_REASON_TEXTS["30"].lower() or "amount" in ECOA_REASON_TEXTS["30"].lower()

def test_code_30_for_loan_over_max():
    ke = EnrichedKillEvent(
        trigger="LOAN_AMOUNT_OVER_LENDER_MAX",
        loan_amount=3_500_000,
    )
    assert "30" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Lender product guidelines (T1_T2 sweep)
2. Slice 1 ECOA_CODE_26 (legacy FCRA text, retained for back-compat)
