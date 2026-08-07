---
type: research
status: drafted
confidence: 4
title: Code 25 — DSCR-Specific Reason (FICO Below Lender Minimum)
summary: "**Reg B Reference:** This is a **DSCR-specific** extension code, NOT from Form C-1 directly. It maps to Form C-1 code 17 (Delinquent) or code 24 (Other) when the FICO breach is the actual principal reason. For DSCR lenders, a FICO below the lender's minimum is most commonly expressed as \"Credit score (FICO) below our minimum.\""
entities:
  - concept/dscr
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - regulation/cfpb
  - regulation/ecoa
  - regulation/reg-b
  - tax/pal
  - topic/str
tags:
  - topic/adverse-action
  - topic/compliance
  - topic/reserves
  - topic/short-rate
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_25_fico_below_minimum.md
vaulted_at: 2026-06-20
---
# Code 25 — DSCR-Specific Reason (FICO Below Lender Minimum)

**Reg B Reference:** This is a **DSCR-specific** extension code, NOT from Form C-1 directly. It maps to Form C-1 code 17 (Delinquent) or code 24 (Other) when the FICO breach is the actual principal reason. For DSCR lenders, a FICO below the lender's minimum is most commonly expressed as "Credit score (FICO) below our minimum."

**Confidence:** 4/5 (not from Form C-1 verbatim; lender convention)
**Source:** Industry convention from DSCR lender guidelines; CFPB Circular 2022-03 specificity requirement

---

## Canonical Text (DSCR lender convention — not Reg B)

> "Credit score (FICO) of [N] is below our minimum requirement of [M]."

This is the **FICO/credit score** principal reason. The verbatim Reg B Form C-1 does not include a specific "credit score" reason code — it falls under either code 17 (delinquency) or code 24 (other). The DSCR industry convention is to use the "Other" code with a FICO-specific text.

## DSCR-Specific Application

**Critical for DSCR.** FICO minimums are lender-specific:

| Lender | FICO Min (DSCR-Investor) | FICO Min (DSCR-Full Doc) | FICO Min (FN) | FICO Min (ITIN) |
|---|---|---|---|---|
| **Newfi** | 660 | 700 | 680 | 660 |
| **Pennymac** | 680 | 680 | N/A | 660 |
| **Griffin** | 640 | 680 | 660 | 640 |
| **Angel Oak** | 620 (DSCR-Investor+) | 680 | 660 | 620 |
| **Deephaven** | 660 | 700 | 660 | 660 |

**DSCR-specific triggers for Code 25** (FICO below min):
- Tri-merge middle FICO 620; lender min 660 → code 25
- Tri-merge middle FICO 580; lender min 620 → code 25
- For ITIN/FN: FICO 640; lender ITIN min 660 → code 25

**Distinction from Code 24 (Other)**: Code 25 is the **specific FICO** sub-reason of Code 24. Use code 25 if the lender's principal reason is FICO; use code 24 if the principal reason is something else (DSCR, reserves, etc.).

## Example Adverse Action Reason Text

> "The credit score (FICO) used to evaluate your application is [N], which is below our minimum requirement of [M] for the [DSCR-Investor / DSCR-Full Doc / FN / ITIN] program. The credit score was obtained from [Experian / Equifax / TransUnion] on [date]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 25? |
|---|---|
| `FICO_BELOW_LENDER_MIN` | YES (primary) |
| `FICO_BELOW_620` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: 660/700/680/660 by program
- **Pennymac**: 680/680/N/A/660
- **Griffin**: 640/680/660/640
- **Angel Oak**: 620 (DSCR-Investor+) / 680 / 660 / 620
- **Deephaven**: 660/700/660/660

## Test Specification

```python
def test_code_25_text_standard():
    assert "FICO" in ECOA_REASON_TEXTS["25"] or "credit score" in ECOA_REASON_TEXTS["25"].lower()

def test_code_25_for_fico_below_620():
    ke = EnrichedKillEvent(
        trigger="FICO_BELOW_620",
        fico=600,
        fico_threshold=620,
    )
    assert "25" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Form C-1 (general — code 24 "Other" with FICO-specific text)
2. CFPB Circular 2022-03 specificity requirement
3. Newfi, Pennymac, Griffin, Angel Oak, Deephaven FICO matrices (T1_T2 sweep)
