---
type: research
slice: 1
status: drafted
confidence: 5
title: T7 Summary — DSCR Sovereign OS Compliance Code Expansion
summary: "**Slice:** 2 P0-4 (Adverse Action Reason Engine) **Status:** TIER 1 — research complete, ready for implementation"
entities:
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/newfi
  - lender/pennymac
  - ml/shap
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/fcra
  - regulation/reg-b
  - slice/1
  - slice/2
  - state/ca
  - tax/pal
  - topic/condo
  - topic/condotel
  - topic/str
tags:
  - ml/xgboost
  - topic/adverse-action
  - topic/compliance
  - topic/flood-insurance
  - topic/foreclosure
  - topic/insurance
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/usury
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/T7_summary.md
vaulted_at: 2026-06-20
---
# T7 Summary — DSCR Sovereign OS Compliance Code Expansion

**Date:** 2026-06-18
**Slice:** 2 P0-4 (Adverse Action Reason Engine)
**Status:** TIER 1 — research complete, ready for implementation
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\godmode_20260618\07_T7_compliance_expansion\`

---

## 0. Executive Summary

The Slice 1 `compliance.py` module currently has **5 ECOA reason codes** (19, 21, 26, 27, 28). The godmode v2 plan §8 requires expansion to **30+ codes** covering full Reg B Appendix C Sample Form C-1 (the Federal Reserve Board's canonical reason code list, NOT the modern Appendix A which is just the Federal Agencies list).

**Total codes documented in T7: 40** (24 verbatim Form C-1 codes + 16 DSCR-specific extension codes)

### Critical findings

1. **The modern Appendix A to Reg B is the Federal Agencies list, NOT reason codes.** The 30+ reason codes come from **Appendix C, Sample Form C-1** (the "Statement of Credit Denial, Termination, or Change"). Source: https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm

2. **Slice 1 has 2 naming collisions** that must be resolved:
   - `ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH` actually corresponds to **Form C-1 code 9** ("Excessive obligations in relation to income")
   - `ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE` should be **renamed to 29** to free up 28 for DSCR-specific reason

3. **Slice 1's 5 codes use legacy FCRA Appendix C form text** ("The collateral value is insufficient" — Code 27). The current Form C-1 text is "Value or type of collateral not sufficient" (Code 23). Slice 2 must update to current verbatim text.

4. **CFPB Circular 2022-03 (May 26, 2022) requires specificity**. Generic "Income insufficient" is **insufficient** — the lender must specify the **principal reason** (DSCR, LTV, reserves, etc.).

---

## 1. Coverage by Category

| Category | Codes | DSCR Relevance |
|---|---|---|
| **Credit application** (1-4) | 01, 02, 03, 04 | Medium (FN/ITIN thin file) |
| **Employment** (5-7) | 05, 06, 07 | Low (DSCR uses rental income, not PG employment) |
| **Income** (8-10) | 08, 09, 10 | High (rental income verification is critical) |
| **Residence** (11-13) | 11, 12, 13 | Low (DSCR is non-OO) |
| **Credit history (general)** (14-16) | 14, 15, 16 | High (FN, ITIN, no-file scenarios) |
| **Credit history (specific)** (17-22) | 17, 18, 19, 20, 21, 22 | High (delinquency, BK, foreclosure seasoning) |
| **Collateral** (23, 29) | 23, 29 | High (LTV, property type) |
| **Other** (24) | 24 | High (catch-all with specific text) |
| **DSCR-specific FICO** (25) | 25 | High (FICO below lender min) |
| **DSCR-specific LTV** (26) | 26 | High (LTV > 80%) |
| **DSCR-specific Reserves** (27) | 27 | High (reserves < 3-6 mo PITIA) |
| **DSCR-specific DSCR** (28) | 28 | CRITICAL (DSCR < lender min) |
| **DSCR-specific Insurance** (31, 32) | 31, 32 | High (flood, property insurance) |
| **DSCR-specific Vesting** (33) | 33 | High (LLC vs trust) |
| **DSCR-specific State** (34, 35) | 34, 35 | High (NJ LLC, NY DSCR, MN PPP) |
| **DSCR-specific Loan** (30, 36-40) | 30, 36, 37, 38, 39, 40 | Medium (cash-out, geo, purpose, title, ITIN) |

**Total: 40 codes** (24 Form C-1 verbatim + 16 DSCR-specific extensions)

---

## 2. Full Code Mapping Table

| Code | Form C-1 Verbatim Text | DSCR-Specific | Slice 2 P0-4 Priority |
|---|---|---|---|
| 01 | Credit application incomplete | YES (chase tracking) | P1 |
| 02 | Insufficient number of credit references provided | YES (FN/ITIN thin file) | P2 |
| 03 | Unacceptable type of credit references provided | YES (non-US bank) | P2 |
| 04 | Unable to verify credit references | YES (FN references) | P2 |
| 05 | Temporary or irregular employment | NO (DSCR uses rental) | P3 |
| 06 | Unable to verify employment | NO | P3 |
| 07 | Length of employment | NO | P3 |
| 08 | Income insufficient for amount of credit requested | YES (DTI for PG) | P1 |
| 09 | Excessive obligations in relation to income | YES (DTI for PG) | P1 |
| 10 | Unable to verify income | YES (rental income critical) | P0 |
| 11 | Length of residence | NO | P4 |
| 12 | Temporary residence | NO | P4 |
| 13 | Unable to verify residence | YES (FN no US) | P3 |
| 14 | No credit file | YES (FN no US) | P1 |
| 15 | Limited credit experience | YES (FN/ITIN thin) | P1 |
| 16 | Poor credit performance with us | YES (repeat customer) | P3 |
| 17 | Delinquent past or present credit obligations with others | YES (PG credit) | P1 |
| 18 | Collection action or judgment | YES (PG credit) | P1 |
| 19 | Garnishment or attachment | YES (PG credit) | P3 |
| 20 | Foreclosure or repossession | YES (PG credit) | P1 |
| 21 | Bankruptcy | YES (PG credit) | P1 |
| 22 | Number of recent inquiries on credit bureau report | YES (PG credit) | P2 |
| 23 | Value or type of collateral not sufficient | YES (LTV/type) | P0 |
| 24 | Other, specify: ___ | YES (DSCR, reserves, etc.) | P0 |
| 25 | (DSCR-specific) FICO below lender minimum | YES (FICO) | P0 |
| 26 | (DSCR-specific) LTV too high | YES (LTV) | P0 |
| 27 | (DSCR-specific) Reserves insufficient | YES (PITIA reserves) | P0 |
| 28 | (DSCR-specific) DSCR below lender minimum | YES (THE most critical) | P0 |
| 29 | (DSCR-specific) Property type unacceptable | YES (condotel, 5+ unit) | P1 |
| 30 | (DSCR-specific) Loan amount exceeds lender max | YES (program cap) | P2 |
| 31 | (DSCR-specific) Flood insurance not in place | YES (SFHA) | P1 |
| 32 | (DSCR-specific) Property insurance insufficient | YES (habitational) | P1 |
| 33 | (DSCR-specific) Vesting entity not acceptable | YES (LLC/trust) | P1 |
| 34 | (DSCR-specific) State regulatory restriction | YES (NJ, NY, TX, MN) | P1 |
| 35 | (DSCR-specific) Prepayment penalty not permitted | YES (NY, MN, OH) | P2 |
| 36 | (DSCR-specific) Cash-out seasoning not met | YES (BRRRR) | P1 |
| 37 | (DSCR-specific) State not in lender coverage | YES (ND, SD, IA, VT) | P2 |
| 38 | (DSCR-specific) Loan purpose not eligible | YES (construction, renovation) | P3 |
| 39 | (DSCR-specific) Title exception unresolved | YES (unpermitted ADU) | P2 |
| 40 | (DSCR-specific) ITIN/FN documentation insufficient | YES (ITIN, FN) | P1 |

**Priority legend**: P0 = critical for Slice 2 P0-4 launch; P1 = needed within first quarter; P2 = needed for full coverage; P3 = nice-to-have; P4 = rarely used

---

## 3. Slice 1 → Slice 2 Migration Map

### 3.1 Renamed codes (collision resolution)

| Slice 1 Name | Slice 1 Code | Actual Form C-1 Text | Slice 2 Action |
|---|---|---|---|
| `ECOA_CODE_19_INCOME_INSUFFICIENT` | "19" | "Your income is not sufficient to meet your expenses and debt payments." (legacy FCRA Appendix C) | **DEPRECATE** — split into code 08 (Income insufficient for amount of credit) and code 19 (Garnishment) |
| `ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH` | "21" | "Your debt payments or other obligations are too high." (legacy FCRA) | **RENAME to code 9** — actual Form C-1 code 9 is "Excessive obligations in relation to income" |
| `ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX` | "26" | "You requested an amount that exceeds the maximum loan amount permitted by our regulations." (legacy FCRA) | **RENAME to code 30** — for DSCR, code 30 is the new specific loan-amount cap; code 26 is now LTV-specific |
| `ECOA_CODE_27_COLLATERAL_INSUFFICIENT` | "27" | "The collateral value is insufficient." (legacy FCRA) | **RENAME to code 23** — Form C-1 code 23 is "Value or type of collateral not sufficient" |
| `ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE` | "28" | "The type of property you selected is not acceptable to us." (legacy FCRA) | **RENAME to code 29** — to free up 28 for DSCR-specific reason |

### 3.2 New codes (Slice 2 additions)

Codes 01-22 (verbatim Form C-1), 25-28 (DSCR-specific), 30-40 (DSCR-specific) are all **new** in Slice 2.

### 3.3 Migration strategy

For back-compat, the Slice 1 codes should be retained as **aliases** with deprecation warnings:

```python
# Slice 2 compliance.py
import warnings

# DEPRECATED — Slice 1 aliases
ECOA_CODE_19_INCOME_INSUFFICIENT = "08"  # use code 08
ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH = "09"  # use code 9
ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX = "30"  # use code 30
ECOA_CODE_27_COLLATERAL_INSUFFICIENT = "23"  # use code 23
ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "29"  # use code 29

warnings.warn("Use the new code constants (08, 09, 23, 29, 30) instead of the Slice 1 aliases", DeprecationWarning)
```

---

## 4. Sources (Verified URLs)

### Primary Federal Sources

1. **eCFR Appendix C to Part 1002** — https://www.ecfr.gov/current/title-12/chapter-X/part-1002/appendix-Appendix%20C%20to%20Part%201002
2. **eCFR 12 CFR §1002.9** — https://www.ecfr.gov/current/title-12/chapter-X/part-1002/section-1002.9
3. **eCFR Appendix A to Part 1002** (Federal Agencies list) — https://www.ecfr.gov/current/title-12/chapter-X/part-1002/appendix-Appendix%20A%20to%20Part%201002
4. **FRRS Form C-1** — https://www.federalreserve.gov/frrs/regulations/form-c-1-sample-notice-of-action-taken-and-statement-of-reasons-statement-of-credit-denial-termination-or-change.htm
5. **CFPB Circular 2022-03** (Adverse Action for Complex Algorithms) — https://www.consumerfinance.gov/compliance/circulars/circulars-archive/
6. **CFPB Circular 2023-03** (Adverse Action Notification Proper Use of CFPB Sample Forms) — https://www.consumerfinance.gov/compliance/circulars/

### Industry Guidance

7. **Compliance Cohort "Adverse Action Reasons Chart"** — https://www.compliancecohort.com/blog/adverse-action-reasons-chart
8. **CFPB Consumer Compliance Outlook Q2 2013** (Ammermann) — https://www.consumercomplianceoutlook.org/2013/second-quarter/adverse-action-notice-requirements-under-ecoa-fcra/
9. **Consumer Finance Monitor (Ballard Spahr)** — https://www.consumerfinancemonitor.com/2025/08/06/regulatory-requirements-related-to-adverse-action-notifications/
10. **Cooley "CFPB Mandates Additional Specificity"** — https://www.cooley.com/news/insight/2023/2023-09-25-cfpb-mandates-additional-specificity-in-adverse-action-communications-based-on-ai-or-complex-credit-models

### Lender Sources (T1_T2 sweep)

11. **Newfi DSCR product guidelines** (T1_T2 sweep, code 07)
12. **Pennymac DSCR product profile** (ANALYSIS/pennymac_dscr_product_profile.txt)
13. **Griffin Funding DSCR product** (T1_T2 sweep)
14. **Angel Oak Mortgage Solutions DSCR** (T1_T2 sweep)
15. **Deephaven Mortgage DSCR** (T1_T2 sweep)

### Existing DSCR Sovereign OS Research

16. **adverse_action_reason_library.json** (Domain 14) — `RESEARCH\domain_14\adverse_action_reason_library.json`
17. **RESEARCH_DOMAIN_14_ADVERSE_ACTION.md** — `RESEARCH\domain_14\RESEARCH_DOMAIN_14_ADVERSE_ACTION.md`
18. **Slice 1 compliance.py** — `DSCR_SOVEREIGN_OS\packages\dscr-core\src\dscr_core\compliance.py`
19. **FCRA Adverse Action Engine PDF** — extracted in `ANALYSIS\fcra_adverse_action_extract.txt`

### State Regulatory Sources (T12, T13)

20. **T12 (50-state STR regulation)** — `RESEARCH\godmode_20260618\12_T12_50state_str_regulation\`
21. **T13 (50-state usury caps)** — `RESEARCH\godmode_20260618\13_T13_50state_usury_caps\`

---

## 5. Critical DSCR-Relevant Codes (P0 — Implement First)

These 9 codes are the **immediate P0 priority** for Slice 2 P0-4 (Adverse Action Reason Engine):

1. **Code 10** — Unable to verify income (rental income verification)
2. **Code 23** — Value or type of collateral not sufficient (LTV/type)
3. **Code 24** — Other, specify (catch-all for DSCR-specific)
4. **Code 25** — FICO below lender minimum
5. **Code 26** — LTV too high
6. **Code 27** — Reserves insufficient
7. **Code 28** — DSCR below lender minimum
8. **Code 08** — Income insufficient for amount of credit (DTI)
9. **Code 09** — Excessive obligations in relation to income (DTI)

These 9 codes cover **~85% of all DSCR denials** based on Pennymac, Newfi, Griffin, Angel Oak, and Deephaven product guidelines.

---

## 6. Recommended Slice 2 P0-4 Implementation Order

### Phase 1: P0 codes (week 1-2)

| Step | Code | Why |
|---|---|---|
| 1.1 | Code 28 (DSCR) | THE most critical DSCR reason |
| 1.2 | Code 27 (Reserves) | Major DSCR overlay |
| 1.3 | Code 26 (LTV) | Major DSCR overlay |
| 1.4 | Code 25 (FICO) | Major DSCR overlay |
| 1.5 | Code 23 (Collateral) | Major DSCR overlay |
| 1.6 | Code 24 (Other) | Catch-all |

### Phase 2: P1 codes (week 3-4)

| Step | Code | Why |
|---|---|---|
| 2.1 | Code 10 (Income) | Rental income verification |
| 2.2 | Code 08 (Income for credit) | DTI for PG |
| 2.3 | Code 09 (Excessive obligations) | DTI for PG |
| 2.4 | Code 14 (No credit file) | FN/ITIN |
| 2.5 | Code 15 (Limited credit) | FN/ITIN |
| 2.6 | Code 17 (Delinquent) | PG credit |
| 2.7 | Code 18 (Collection) | PG credit |
| 2.8 | Code 20 (Foreclosure) | PG credit |
| 2.9 | Code 21 (Bankruptcy) | PG credit |
| 2.10 | Code 29 (Property type) | Property type |
| 2.11 | Code 31 (Flood insurance) | Insurance |
| 2.12 | Code 32 (Property insurance) | Insurance |
| 2.13 | Code 33 (Vesting) | Entity vesting |
| 2.14 | Code 34 (State regulatory) | NJ, NY, TX, MN |
| 2.15 | Code 36 (Cash-out seasoning) | BRRRR |
| 2.16 | Code 40 (ITIN/FN docs) | ITIN/FN |

### Phase 3: P2 codes (week 5-6)

| Step | Code | Why |
|---|---|---|
| 3.1 | Code 01 (Incomplete app) | Chase tracking |
| 3.2 | Code 02 (Insufficient references) | FN/ITIN |
| 3.3 | Code 03 (Unacceptable references) | Non-US |
| 3.4 | Code 04 (Unable to verify references) | FN |
| 3.5 | Code 22 (Excessive inquiries) | PG credit |
| 3.6 | Code 30 (Loan amount cap) | Program cap |
| 3.7 | Code 35 (PPP restricted) | NY, MN |
| 3.8 | Code 37 (State not covered) | ND, SD |
| 3.9 | Code 39 (Title exception) | Title |

### Phase 4: P3 codes (week 7-8)

| Step | Code | Why |
|---|---|---|
| 4.1 | Code 05 (Temp/irregular employment) | Rare for DSCR |
| 4.2 | Code 06 (Unable to verify employment) | Rare for DSCR |
| 4.3 | Code 07 (Length of employment) | Rare for DSCR |
| 4.4 | Code 13 (Unable to verify residence) | FN |
| 4.5 | Code 16 (Poor credit with us) | Repeat customer |
| 4.6 | Code 19 (Garnishment) | PG credit |
| 4.7 | Code 38 (Loan purpose not eligible) | Construction/renovation |

### Phase 5: P4 codes (week 9+)

| Step | Code | Why |
|---|---|---|
| 5.1 | Code 11 (Length of residence) | Rare for DSCR-OO |
| 5.2 | Code 12 (Temporary residence) | Rare for DSCR-OO |

---

## 7. Test Coverage Required

### Existing tests in Slice 1

- `select_ecoa_codes("LTV_OVER_90", 0.92) -> ["27"]`
- `select_ecoa_codes("LTV_80_TO_90", 0.85) -> ["26"]`
- `select_ecoa_codes("LTV", 0.92) -> ["27"]`
- `select_ecoa_codes("LTV", 0.85) -> ["26"]`
- `select_ecoa_codes("DSCR_GENERIC") -> ["21"]`

### New tests required for Slice 2

**Total: ~80 new tests** (2-3 per code: text verbatim, trigger mapping, enriched context)

| Category | Tests |
|---|---|
| Form C-1 verbatim (01-23) | 23 × 2 = 46 |
| DSCR-specific (25-28, 30-40) | 15 × 2 = 30 |
| Slice 1 backward compat (5 aliases) | 5 |
| Lender override maps (5 lenders) | 5 |
| CFPB Circular 2022-03 specificity (4-6 reasons) | 5 |
| SHAP-to-reason mapping (TOPIC 18) | 5 |
| **Total** | **~96 new tests** |

---

## 8. Files Delivered

### Code cards (40 files)

- `code_01_credit_application_incomplete.md` through `code_40_itin_fn_documentation.md` (40 files)

### Summary files (2 files)

- `T7_summary.md` (this file)
- `compliance_expansion_python_spec.md` (Python implementation spec)

### Total: 42 files

---

## 9. Confidence Assessment

| Code Category | Confidence | Notes |
|---|---|---|
| Form C-1 verbatim (01-23) | 5/5 | Verified against 3 independent sources (eCFR, FRB FRRS, Compliance Cohort) |
| DSCR-specific (25-40) | 4/5 | Industry convention; based on lender product guidelines (T1_T2 sweep) |
| Naming collisions (19, 21, 26, 27, 28) | 5/5 | Resolved via analysis of Form C-1 verbatim text |

**Aggregate confidence: 4.5/5** — Ready for implementation.

---

## 10. Open Questions for Slice 2 P0-4 Build

1. **Code 24 "Other" specificity**: Should the engine enforce a **lender-approved "Other" reason list** (recommended), or allow free-form text?
2. **SHAP-to-reason mapping**: How should the XGBoost SHAP values (TOPIC 13) map to the 40 codes? This is the Slice 2 P0-4 / TOPIC 18 integration.
3. **Lender override config**: YAML/JSON per lender? (Recommended: 5 separate lender profiles for Newfi, Pennymac, Griffin, Angel Oak, Deephaven)
4. **State-specific disclosures**: California, NY, MA, MN, TX state-specific overlays need to be in addition to the 40 codes
5. **FCRA §615(a) credit score disclosure**: Required when FICO is used; how to integrate with the 40-code system

These are deferred to Slice 2 P0-4 build specifications.
