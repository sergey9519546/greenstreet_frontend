---
type: research
status: drafted
confidence: 4
title: Code 40 — ITIN/FN Documentation Insufficient
summary: "**Reg B Reference:** Maps to Form C-1 code 24 (Other) with ITIN/FN-specific text. DSCR lenders have specific documentation requirements for ITIN and Foreign National borrowers."
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
  - topic/tax
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/code_40_itin_fn_documentation.md
vaulted_at: 2026-06-20
---
# Code 40 — ITIN/FN Documentation Insufficient

**Reg B Reference:** Maps to Form C-1 code 24 (Other) with ITIN/FN-specific text. DSCR lenders have specific documentation requirements for ITIN and Foreign National borrowers.

**Confidence:** 4/5 (not a separate Reg B code; DSCR industry convention)
**Source:** Lender product guidelines

---

## Canonical Text (DSCR lender convention)

> "The ITIN documentation provided is not sufficient for our [DSCR-ITIN] program."

Or more specifically:
> "The ITIN assignment letter, ITIN ID, and supporting identification documents do not meet our program requirements. We may reconsider with [specific additional documentation]."

For Foreign National:
> "The visa, passport, and supporting documentation do not meet our [DSCR-FN] program requirements."

## DSCR-Specific Application

**Critical for DSCR.** ITIN and FN documentation is highly lender-specific. Standard requirements:

**ITIN Borrower (DSCR-ITIN)**:
1. **ITIN assignment letter** (IRS Notice CP565 or ITIN card)
2. **Photo ID** (passport, driver's license from home country)
3. **Residency evidence** (utility bill, bank statement)
4. **Tax returns** (last 2 years US if filed, or foreign tax returns translated)
5. **Bank statements** (2 months US or foreign)
6. **Employment letter** (or self-employed docs)
7. **Credit references** (4 alternative references if thin file)
8. **ITIN must be valid** (not expired)

**Foreign National (DSCR-FN)**:
1. **Passport** (current, with visa page)
2. **Visa / ESTA** (B-1, B-2, E-2, E-3, H-1B, L-1, TN, etc.)
3. **I-94** (arrival/departure record)
4. **Residency in home country** (utility bill, bank statement)
5. **Foreign credit report** (some lenders — Newfi accepts, Griffin does not)
6. **Foreign tax returns** (translated and apostilled)
7. **US bank statement** (12 months for income verification)
8. **DSCR ≥ 1.10** (most lenders)
9. **First-time US investor** documentation

**DSCR-specific triggers for Code 40**:
- ITIN expired; lender requires valid ITIN → code 40
- ITIN borrower has no ITIN assignment letter → code 40
- FN has no US bank statement; lender requires 12 months → code 40
- FN visa is B-2 (tourist); lender requires E-2, E-3, H-1B, L-1 → code 40
- FN passport expires within 6 months of closing → code 40 (some lenders require 12-month validity)

**Lender policy**:
- **Newfi**: ITIN and FN programs; specific doc requirements
- **Pennymac**: ITIN program; no FN
- **Griffin Funding**: ITIN and FN programs
- **Angel Oak**: ITIN and FN programs
- **Deephaven**: ITIN and FN programs

## Example Adverse Action Reason Text

> "The ITIN documentation provided is not sufficient for our [DSCR-ITIN] program. Specifically, [the ITIN assignment letter has not been provided / the ITIN has expired / the photo ID is not from a recognized issuing country]. We may reconsider with the following additional documentation: [list]."

## Mapping to DSCR Kill Criteria (TOPIC 17)

| v16 IMP-06 Kill Trigger | Maps to Code 40? |
|---|---|
| `ITIN_INSUFFICIENT` | YES (primary) |
| `FN_VISA_NOT_ACCEPTED` | YES (sub-trigger) |
| `FN_NO_US_BANK` | YES (sub-trigger) |
| `PASSPORT_EXPIRING_SOON` | YES (sub-trigger) |

## Lender-Specific Variants

- **Newfi**: ITIN+FN; specific doc requirements
- **Pennymac**: ITIN only; no FN
- **Griffin Funding**: ITIN+FN
- **Angel Oak**: ITIN+FN
- **Deephaven**: ITIN+FN

## Test Specification

```python
def test_code_40_text_itin_fn():
    assert "ITIN" in ECOA_REASON_TEXTS["40"] or "Foreign National" in ECOA_REASON_TEXTS["40"] or "FN" in ECOA_REASON_TEXTS["40"]

def test_code_40_for_itin_expired():
    ke = EnrichedKillEvent(
        trigger="ITIN_INSUFFICIENT",
        property_type="SFR",
    )
    assert "40" in select_ecoa_codes(ke.trigger)

def test_code_40_for_fn_visa_not_accepted():
    ke = EnrichedKillEvent(
        trigger="FN_VISA_NOT_ACCEPTED",
        property_type="SFR",
    )
    assert "40" in select_ecoa_codes(ke.trigger)
```

## Sources

1. Newfi, Pennymac, Griffin, Angel Oak, Deephaven ITIN/FN documentation (T1_T2 sweep)
2. IRS Publication 1915 (ITIN documentation)
3. Form C-1 code 24 (Other) for fallback
