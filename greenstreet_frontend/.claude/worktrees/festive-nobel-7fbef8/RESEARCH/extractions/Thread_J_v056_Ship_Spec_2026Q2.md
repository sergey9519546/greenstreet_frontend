---
type: synthesis
status: drafted
title: "Thread J: v0.5.6 Ship Spec 2026 Q2 (APPROVED)"
summary: "v0.5.6 ship spec — APPROVED 2026-06-21 17:36 PT. HOEPA 2027 projection + 4 §1071 helpers + 12-test matrix. Ship ~2 weeks after Dec 15, 2026 HOEPA FR publication."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread J — v0.5.6 Ship Specification

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code — design spec only)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_J_v056_Ship_Spec_2026Q2.md`

---

## 0. Why this thread exists

Per Master Plan v11 §6 and Regulatory_Front_Watch_20260620.md, v0.5.6 ship scope is to combine:
1. HOEPA 2027 annual threshold adjustment (publication Dec 15, 2026)
2. §1071 product-coverage helpers (closes gaps surfaced by Thread H audit)

This thread produces a research-grade design spec for v0.5.6 — code-ready handoff document. NO CODE WRITTEN per research-only mode.

## 1. Scope boundaries (in/out for v0.5.6)

### In scope

1. **HOEPA 2027 annual threshold update** (single function, value-only change)
2. **§1071 product-coverage helper functions** (4 new predicates)
3. **Test suite updates** for new thresholds + new helpers
4. **Documentation updates** (docstring + regulatory comment block citations)
5. **Verifier audit** (dscr-verifier primary-source check per Master Plan v11 ship standard)

### Out of scope (defer to v0.5.7+)

1. v0.6.0 tax + MC + after-tax integration
2. v0.5.5.1 §1071 "broker-not-covered-FI" rename (per Thread H recommendation)
3. v0.5.5.2 transaction-level predicates refactor (per Thread H)
4. New product types (MCA, agricultural) beyond §1071 helper definitions
5. HOEPA 2027 final-rule commentary (wait for Dec 15, 2026 publication)

## 2. HOEPA 2027 threshold projection

**Primary sources (verified live):**
- Federal Register 2025-22773 (Dec 15, 2025) — 2026 HOEPA thresholds: https://www.federalregister.gov/documents/2025/12/15/2025-22773/truth-in-lending-regulation-z-annual-threshold-adjustments-credit-cards-hoepa-and-qualified
- Federal Register 2024-27553 (Dec 2, 2024) — 2025 HOEPA thresholds: https://www.federalregister.gov/documents/2024/12/02/2024-27553/truth-in-lending-regulation-z-annual-threshold-adjustments-credit-cards-hoepa-and-qualified
- CFPB annual HOEPA adjustments page: https://www.consumerfinance.gov/rules-policy/final-rules/truth-lending-regulation-z-annual-threshold-adjustments-card-act-hoepa/
- 12 USC 1602(aa)(3) — HOEPA statutory thresholds (Dodd-Frank values)
- 12 CFR 1026.32 — Reg Z HOEPA rule (as amended)

**Historical HOEPA threshold values (Dodd-Frank formulas):**

| Year | Total loan amount threshold | P&F (>=threshold) | P&F (<threshold) | Federal Register |
|---|---|---|---|---|
| 2023 | $24,866 | $1,243 (5%) | lesser of 8% or $1,000 | (Dec 2022) |
| 2024 | ~$25,789 | ~$1,289 (5%) | lesser of 8% or $1,000 | (Dec 2023) |
| 2025 | ~$26,566 | ~$1,328 (5%) | lesser of 8% or $1,000 | (Dec 2024) |
| 2026 | $27,592 | $1,380 (5%) | lesser of 8% or $1,000 | 2025-22773 (Dec 15, 2025) |
| 2027 (PROJECTED) | $28,226 (+2.3% CPI) | $1,412 (5%) | lesser of 8% or $1,000 | (expected Dec 15, 2026) |

**Note:** The "lesser of 8% or $1,000" figure is NOT inflation-adjusted per Reg Z §1026.32(b). This is a statutorily-fixed dollar amount, not a CPI-adjusted one. v0.5.5's `P&F threshold = $1,000` for loans < annual threshold remains correct in v0.5.6.

**CPI-based projection for 2027:** +2.3% (per BLS CPI-U recent trend; subject to revision per actual Dec 2026 BLS data). Use 2026 actual + 1-2 years of actual CPI as refinement pre-ship.

**v0.5.6 design recommendation:**
- Single constant update: `HOEPA_LOAN_AMOUNT_THRESHOLD = 28_226` (or whatever 2027 actual is)
- Single constant update: `HOEPA_PF_THRESHOLD_LARGE_LOAN = 1_412` (or whatever 2027 actual is)
- Keep `HOEPA_PF_THRESHOLD_SMALL_LOAN = 1_000` (NOT inflation-adjusted)
- Add verification comment block citing Federal Register page number once published

## 3. §1071 product-coverage helper functions

Per Regulatory_Front_Watch_20260620.md spec, 4 new helpers:

### Helper 1: `is_merchant_cash_advance(loan)`

- **Purpose:** Check if a transaction is an MCA (technically excluded from §1071, but common DSCR co-product)
- **Logic:**
  - Repayment tied to % of future sales/receipts → MCA
  - Fixed payment schedule with no revenue contingency → not MCA
- **Sources:** §1071 rule §1002.104(c) product exclusions; CFPB Small Business Lending FAQ (https://www.consumerfinance.gov/compliance/compliance-resources/small-business-lending-resources/small-business-lending-collection-and-reporting-requirements/small-business-lending-rule-faqs/)
- **Returns:** bool

### Helper 2: `is_agricultural_loan(loan)`

- **Purpose:** Per CFPB's exclusion of Farm Credit System lenders, agricultural loans exempt
- **Logic:**
  - Loan proceeds primarily for agricultural production → exempt
  - Operator is engaged in farming operation per USDA definition
- **Sources:** §1002.104(b)(2) (agricultural exclusion); CFPB May 2026 Final Rule (FCS lender exclusion)
- **Returns:** bool

### Helper 3: `is_small_dollar_business_credit(loan)`

- **Purpose:** Dollar threshold exclusion (small loans may be exempt per CFPB May 2026 Final Rule)
- **Logic:**
  - Loan amount < threshold (e.g., <$50,000 or whatever 2026 rule sets)
  - OR revenue threshold applied at applicant level
- **Sources:** May 2026 §1071 Final Rule; CRS R47788
- **Returns:** bool
- **Note:** Verify exact threshold pre-v0.5.6 ship

### Helper 4: `is_last_decision_maker(loan)`

- **Purpose:** §1071 reporting applies to the financial institution that makes the final credit decision. If we're a broker, we don't report; if we're a funder, we do.
- **Logic:**
  - True if our entity funded the loan AND made the final credit decision
  - False if our entity is broker/TPO only
- **Sources:** §1002.105 covered financial institution definition; Thread H broker-exempt research
- **Returns:** bool
- **Note:** This is the explicit fix for the v0.5.5 broker-exempt design (per Thread H recommendation)

## 4. v0.5.6 file structure (design only — no code written)

```
dscr-core/src/dscr_core/
├── compliance.py (modified)
│   ├── HOEPA 2027 threshold constants updated
│   ├── 4 new §1071 helper functions added
│   ├── is_section_1071_reportable() updated to use new helpers
│   └── Comment block citations refreshed
└── __init__.py (modified)
    └── Export 4 new helper functions

dscr-core/tests/
├── test_compliance_v050.py (existing — HOEPA tests)
│   └── Updated for 2027 values
├── test_compliance_1071_v055.py (existing — v0.5.5 §1071 tests)
│   └── Updated for new helper functions
└── test_compliance_1071_v056.py (new)
    ├── test_is_merchant_cash_advance
    ├── test_is_agricultural_loan
    ├── test_is_small_dollar_business_credit
    └── test_is_last_decision_maker
```

## 5. Test matrix (v0.5.6 acceptance criteria)

| Test | Pre-condition | Expected |
|---|---|---|
| HOEPA 2027 first-lien APR test | Loan APR = APOR + 6.5pp + $0.01 | True (triggers HOEPA) |
| HOEPA 2027 subordinate APR test | Loan APR = APOR + 8.5pp + $0.01 | True (triggers HOEPA) |
| HOEPA 2027 P&F test (>=threshold) | Loan > $28,226, P&F = 5%+ | True (triggers HOEPA) |
| HOEPA 2027 P&F test (<threshold) | Loan = $25,000, P&F = $1,001 (8%) | True (triggers HOEPA — $1,001 > $1,000 fixed threshold) |
| HOEPA 2027 P&F test (under 8% and <$1K) | Loan = $25,000, P&F = 5% = $1,250 | False (does NOT trigger) |
| is_merchant_cash_advance | Loan with daily ACH + factor rate | True |
| is_merchant_cash_advance | Fixed monthly payments, fully amortizing | False |
| is_agricultural_loan | Farm operating loan, USDA-defined operation | True |
| is_agricultural_loan | Commercial RE loan to farming operation | False (per CFPB narrow definition) |
| is_small_dollar_business_credit | Loan amount < threshold | True (excludes from §1071) |
| is_last_decision_maker | Broker-only entity, no funding | False |
| is_last_decision_maker | Funder entity, made final credit decision | True |

## 6. Open questions for user

1. Approve v0.5.6 scope (HOEPA 2027 + 4 §1071 helpers)?
2. Approve HOEPA 2027 projection (use Dec 2026 Federal Register actuals when published, or pre-populate with +2.3% estimate)?
3. Approve 4 helper functions as specced, or modify list?
4. Approve 12-test acceptance matrix?
5. Approve ship-on-verifier-audit standard (dscr-verifier primary-source check before v0.5.6 ship)?
6. Approve v0.5.6 timing (target ship ~2 weeks after Dec 15, 2026 HOEPA publication)?

## 7. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| HOEPA 2027 actual differs from +2.3% projection | MEDIUM | LOW (single-line change) | Hold v0.5.6 ship until Dec 15, 2026 publication; pre-populate with projection as "expected" |
| §1071 helper predicates conflict with real-world transactions | MEDIUM | MEDIUM (over- or under-exclusion) | Dscr-verifier audit + 12-test matrix + primary-source citations in docstring |
| is_last_decision_maker creates classification ambiguity for hybrid entities | HIGH | MEDIUM | Document edge cases; recommend outside counsel review for hybrid scenarios |
| Federal court overturns May 2026 §1071 Final Rule | LOW | LOW (would revert to 2023 rule) | Watch litigation tracker; design is robust to rule changes via predicate abstraction |
| v0.5.5 broker-exempt comment block is wrong but ships as-is in v0.5.6 | LOW | LOW (separate from new helpers) | Add ticket for v0.5.6.1 to fix broker-exempt comment block (per Thread H) |

## 8. Sources cited

**HOEPA primary:**
- Federal Register 2025-22773 (2026 HOEPA) — https://www.federalregister.gov/documents/2025/12/15/2025-22773/truth-in-lending-regulation-z-annual-threshold-adjustments-credit-cards-hoepa-and-qualified
- Federal Register 2024-27553 (2025 HOEPA) — https://www.federalregister.gov/documents/2024/12/02/2024-27553/truth-in-lending-regulation-z-annual-threshold-adjustments-credit-cards-hoepa-and-qualified
- CFPB HOEPA page — https://www.consumerfinance.gov/rules-policy/final-rules/truth-lending-regulation-z-annual-threshold-adjustments-card-act-hoepa/
- Consumer Finance Monitor 2022 commentary — https://www.consumerfinancemonitor.com/2022/12/28/cfpb-annual-card-act-hoepa-qm-adjustments-do-not-include-credit-card-penalty-fees-safe-harbors/

**§1071 primary:**
- Federal Register 2026-08494 — https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b
- CFPB 1071 rulemaking page — https://www.consumerfinance.gov/1071-rule/
- CFPB FAQ — https://www.consumerfinance.gov/compliance/compliance-resources/small-business-lending-resources/small-business-lending-collection-and-reporting-requirements/small-business-lending-rule-faqs/
- CRS R47788 — https://www.congress.gov/crs-product/R47788

**v0.5.5 reference:**
- compliance.py:1008-1055 (verified live in this session)
- DSCR_dscr_core_v055_Ship_Memo_20260620.md

**Related research:**
- Thread E — AI/ML audit (consumes §1071 thresholds)
- Thread H — OGC broker-exempt interpretation (informs `is_last_decision_maker`)
- Regulatory_Front_Watch_20260620.md (v0.5.6 spec source)

---

**End of Thread J. Linked threads: Master Plan v11 §6, Thread H (broker-exempt audit), Regulatory_Front_Watch_20260620 (v0.5.6 source spec), v0.5.5 ship memo.**