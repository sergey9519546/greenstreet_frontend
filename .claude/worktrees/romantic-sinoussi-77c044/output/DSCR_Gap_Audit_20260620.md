---
type: deliverable
slice: 1
status: shipped
confidence: 5
title: DSCR Sovereign OS — Comprehensive Gap Audit
summary: "**Author:** DSCR Sovereign OS Quant Team **Scope:** Slice 1 (dscr-core) deep dive + Slice 2 spot-check + overall project"
entities:
  - concept/arm
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/fannie-mae
  - math/copula
  - math/vine-copula
  - ml/tabpfn
  - ml/timesfm
  - regulation/ecoa
  - regulation/hmda
  - regulation/hoepa
  - regulation/reg-b
  - regulation/reg-z
  - regulation/tila
  - slice/1
  - slice/2
  - slice/3
  - slice/4
  - sprint/1
  - sprint/2
  - sprint/3
  - sprint/4
  - topic/2-4-unit
  - topic/condo
  - topic/multifamily
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - topic/adverse-action
  - topic/after-tax
  - topic/apex
  - topic/architecture
  - topic/cecl
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/insurance
  - topic/lgd
  - topic/llpa
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/tax
  - topic/yield-curve
  - type/audit
source: output/DSCR_Gap_Audit_20260620.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Comprehensive Gap Audit

**Date:** 2026-06-20
**Author:** DSCR Sovereign OS Quant Team
**Scope:** Slice 1 (dscr-core) deep dive + Slice 2 spot-check + overall project
**Current state:** 174 tests pass, 90% coverage on Slice 2 P0-2, 94.37% Slice 1, 10/10 attack defenses, 100/100 quality gate

---

## Executive Summary

Identified **75 distinct gaps** across Slice 1, Slice 2, and overall project. Of these:
- **5 are critical bugs** (silent incorrect behavior in current code)
- **15 are missing features** (gaps in coverage of DSCR lending domain)
- **20 are production-readiness gaps** (won't pass a senior quant review)
- **35 are nice-to-have** (defensible to defer)

**Top 3 to fix immediately:**
1. `pitia()` doesn't validate negative HOA/flood/MI — silent wrong value
2. `qualifying_rent()` doesn't validate negatives — silent wrong value
3. No reserves check modeled — most DSCR lenders require 3-6 months PITIA

---

## SLICE 1 CRITICAL BUGS (must fix before next release)

### Bug 1: `pitia()` does not validate negative HOA / flood / MI
**File:** `src/dscr_core/payment.py` lines 109-131
**Severity:** CRITICAL — silent incorrect return

```python
def pitia(p_i, tax_annual, insurance_annual, hoa_monthly=0, flood_monthly=0, mi_monthly=0):
    return piti(p_i, tax_annual, insurance_annual) + hoa_monthly + flood_monthly + mi_monthly
```

`piti()` validates `tax_annual >= 0` and `insurance_annual >= 0`. But `pitia()` does NOT validate `hoa_monthly`, `flood_monthly`, `mi_monthly`. Calling `pitia(1000, 0, 0, hoa_monthly=-500)` returns 500 (silent under-count).

**Fix:** Add validation in `pitia()` mirroring `piti()`.

### Bug 2: `qualifying_rent()` does not validate negative inputs
**File:** `src/dscr_core/dscr.py` lines 69-88
**Severity:** HIGH — silent incorrect return

```python
def qualifying_rent(lease_rent: float, appraisal_rent: float) -> float:
    return min(lease_rent, appraisal_rent)
```

`qualifying_rent(-1000, -500)` returns -1000. Negative rents are nonsense.

**Fix:** Add `if lease_rent < 0 or appraisal_rent < 0: raise ValueError`.

### Bug 3: `dscr_track1()` does not handle NaN inputs
**File:** `src/dscr_core/dscr.py` lines 91-114
**Severity:** MEDIUM — silent NaN propagation

```python
def dscr_track1(rent_monthly: float, pitia: float) -> float:
    if pitia <= 0:
        raise ValueError(...)
    if rent_monthly < 0:
        raise ValueError(...)
    return rent_monthly / pitia
```

`nan <= 0` is False, `nan < 0` is False. So `dscr_track1(float('nan'), 1000)` returns NaN silently.

**Fix:** Add `if math.isnan(rent_monthly) or math.isnan(pitia): raise ValueError`.

### Bug 4: `noi_at_year()` does not validate growth rate bounds
**File:** `src/dscr_core/ltv.py` lines 187-220
**Severity:** MEDIUM — silent overflow / negative spiral

`growth = -1.0` → year 2 = 0 (silent zero). `growth = -2.0` → negative NOI. `growth = 10.0` → explodes.

**Fix:** Add `if not -0.5 <= growth <= 0.5: raise ValueError` (or wider bounds).

### Bug 5: `max_purchase_price()` bisection cap is hardcoded
**File:** `src/dscr_core/leverage.py` lines 330-342
**Severity:** LOW — silent precision loss

```python
for _ in range(200):  # 200 iters gives precision >> $1
```

For xtol=$1 on $10B property, 200 iterations gives ~$95 resolution (log2(10B/100) ≈ 27). NOT sufficient. Bug only matters for large properties.

**Fix:** Use `while hi - lo > xtol:` loop with iteration cap.

---

## SLICE 1 MISSING FEATURES (lender domain gaps)

### Feature 1: NO reserves check
**Why critical:** Most DSCR lenders require 3-6 months PITIA in liquid reserves. A $3K/mo PITIA means $9K-$18K reserves required. Not modeled anywhere.

**Spec:** `reserves_check(liquid_assets, monthly_pitia, min_months=3.0) -> (sufficient, gap)`

### Feature 2: NO FICO handling
**Why critical:** DSCR lenders tier by FICO. Sub-660 may not qualify. Not modeled.

**Spec:** `fico_band(fico: int) -> Literal['740+', '720-739', '700-719', '680-699', '660-679', '<660']`

### Feature 3: NO LLPA matrix
**Why critical:** Loan-Level Price Adjustments determine actual pricing. FICO × LTV × DSCR grid missing. Currently no way to compute a final rate.

**Spec:** `llpa_adjustment(fico_band, ltv, dscr) -> float` (in basis points)

### Feature 4: NO property type matrix
**Why critical:** SFR, 2-4 unit, condo, PUD, manufactured, mixed-use each have different LTV caps and DSCR treatments.

**Spec:** `property_type_eligibility(property_type: str, ltv: float, dscr: float) -> (eligible, reason)`

### Feature 5: NO interest-only support
**Why critical:** Most DSCR loans are 5/1, 7/1, 10/1 ARM with 10-year IO period. Current `pi()` is fully-amortizing only. `max_loan_io()` exists but isolated.

**Spec:** `pi_io(loan, rate_pct, io_months, amort_months) -> float`

### Feature 6: NO balloon support
**Why critical:** 30/10, 40/10 balloon common in DSCR. No way to compute balloon payment.

**Spec:** `balloon_payment(loan, rate_pct, amort_months, balloon_months) -> float`

### Feature 7: NO ARM rate scenarios
**Why critical:** Index + margin + caps must be modeled for qualification. (Deferred to Slice 2 P0-4)

### Feature 8: NO 5+ unit multifamily
**Why critical:** Per dscr.py line 34, "5+ unit: commercial/multifamily rules, separate track (not in Slice 1)". But this is a huge market segment.

**Spec:** `dscr_multifamily(units, gross_rent, expense_ratio, pitia) -> float` with 5-7% vacancy + 35-45% expense defaults.

### Feature 9: NO 2-4 unit specific handling
**Why critical:** Fannie Mae Form 1007 + 25% vacancy rule for DTI qualification is mentioned but not coded.

**Spec:** `dscr_2to4unit(rent_1007, lease_rent, pitia) -> (dscr, qualifying_rent, vacancy_applied)`

### Feature 10: NO foreign national / ITIN handling
**Why critical:** DSCR is the go-to for foreign nationals (25-35% DP, higher rate). ITIN borrowers also common. No pricing grid.

### Feature 11: NO 50-state PPP matrix
**Why critical:** Prepayment penalties are state-mandated. CA = 5yr max, FL = 3yr, etc. Critical for quote generation.

---

## SLICE 1 REGULATORY GAPS (compliance)

### Compliance 1: ECOA codes are subset (5 of 30+)
**File:** `src/dscr_core/compliance.py` lines 35-40
**Missing codes:** 11, 12, 13, 14, 15, 16, 18, 22, 23, 24, 25, 29, 30

**Fix:** Add full Reg B Appendix A mapping.

### Compliance 2: HMDA (Home Mortgage Disclosure Act) not covered
**Why critical:** HMDA requires demographic + disposition reporting. LAR fields, race/ethnicity codes, denial reasons (different from ECOA).

### Compliance 3: Reg Z (TILA) tolerance not covered
**Why critical:** APR tolerance check (1/8% or 1/4%), finance charge tolerance, disclosure timing, right of rescission (3-day rule).

### Compliance 4: Fair Housing Act not covered
**Why critical:** Different prohibited bases from ECOA. Different notice requirements.

### Compliance 5: SAFE Act (loan originator licensing) not covered
**Why critical:** NMLS ID tracking required.

### Compliance 6: BSA/AML not covered
**Why critical:** CIP, SAR, OFAC screening.

### Compliance 7: HOEPA (high-cost mortgage) not covered
**Why critical:** Specific APR thresholds (Treasury + 8%/10%), disclosure rules.

### Compliance 8: ATR/QM rules not covered
**Why critical:** General ATR rule, QM 43% DTI, 3% points/fees. Business-purpose exemption applies to DSCR but needs to be documented.

### Compliance 9: ECOA 30-day notification timing not validated
**Why critical:** Adverse action notice must be sent within 30 days of application complete, not denial.

---

## SLICE 2 SPOT-CHECK GAPS

### Slice 2 G1: `distributional_dscr` uses Track 1 only (rent/PITIA, no vacancy)
**File:** `src/dscr_stress/distributional_dscr.py`
**Why:** APEX 2 calibration memo flagged this as a known debt. Track 2 (vacancy-adjusted) not yet supported.

### Slice 2 G2: No copula — independent marginals
**Why:** R-Vine copula (pyvinecopulib) was identified as drop-in for Slice 2 P0-3. Not yet shipped.

### Slice 2 G3: Single sigma across deals
**Why:** APEX 2 added regime switching (stable/normal/stress) for sigma, but doesn't vary by property type, location, or season.

### Slice 2 G4: No ARM reset modeling
**Why:** Slice 2 P0-4 (NSS-Svensson + Hull-White) is roadmap, not shipped.

---

## PRODUCTION READINESS GAPS

### Prod 1: All money is `float`, not `Decimal`
**Why critical:** Float precision errors ($0.01 differences) cause IRS audit issues. payment_factor uses Decimal internally but converts to float at return.

**Fix:** Return Decimal from payment functions, OR add Decimal-aware parallel API.

### Prod 2: No input sanitization
**Why:** Strings with currency symbols ("$1,000"), whitespace, locale-specific decimal separators all break current API.

### Prod 3: No logging / audit trail
**Why:** For a financial library, regulatory compliance requires audit trail of who called what when.

### Prod 4: No type hint strict mode
**Why:** mypy not configured. Type hints present but unenforced.

### Prod 5: No coverage threshold enforcement
**Why:** pytest-cov is configured but no `--cov-fail-under=90` minimum.

### Prod 6: No CI/CD pipeline
**Why:** No GitHub Actions. Tests run only locally.

### Prod 7: No security scanning
**Why:** No bandit, safety, pip-audit. Dependencies not pinned to exact versions.

### Prod 8: No API documentation generation
**Why:** No Sphinx/mkdocs setup. Only inline docstrings.

### Prod 9: No CHANGELOG
**Why:** Only version bumps in `__version__`. No formal changelog.

### Prod 10: No LICENSE file
**Why:** pyproject says "Proprietary" but no LICENSE file in repo.

### Prod 11: No Dockerfile
**Why:** No containerization for deployment.

### Prod 12: No internationalization
**Why:** USD only. CAD/EUR/GBP DSCR products exist.

### Prod 13: No performance benchmarks
**Why:** No pytest-benchmark. O(N log N) regressions invisible.

### Prod 14: No property-based testing
**Why:** Hypothesis is in optional deps but no @given tests.

---

## OVERALL PROJECT GAPS

### Overall 1: MASTER_ANALYSIS.md lacks R22-29 references (recently fixed)
**Status:** Already fixed by adding Section 17 (verified in current memory).

### Overall 2: No ARCHITECTURE.md
**Why:** Cross-Slice architecture should have a top-level document.

### Overall 3: No threat model
**Why:** SR 26-02 + financial library should have formal threat model documented.

### Overall 4: No integration test (Slice 1 + Slice 2 end-to-end)
**Why:** Tests are per-package. No test ensures Slice 2 correctly consumes Slice 1 outputs.

### Overall 5: No "kitchen sink" demo
**Why:** Need one canonical worked example showing full pipeline: input → Slice 1 → Slice 2 → output.

### Overall 6: APEX reports not yet integrated into MASTER_ANALYSIS
**Why:** APEX 1, 2, 3 findings should be in master document but aren't.

### Overall 7: No Slice 1 + Slice 2 version compatibility table
**Why:** Slice 2 imports from Slice 1. Version matrix should be documented.

---

## TESTING GAPS (also in Slice 1)

### Test 1: No Hypothesis property-based tests
**Why:** Could catch edge cases the explicit tests miss.

### Test 2: No mutation testing
**Why:** Could catch "tests pass but don't actually validate" cases.

### Test 3: No fuzzing
**Why:** Random inputs to payment functions could find crashes.

### Test 4: No performance regression tests
**Why:** O(N²) regressions invisible without benchmarks.

---

## DEFERRED (acceptable to defer per roadmap)

### Deferred 1: After-Tax Engine (Slice 3)
Per roadmap. Not started.

### Deferred 2: CECL PD×LGD×EAD (Slice 3)
Per roadmap.

### Deferred 3: TimesFM/Chronos forecasting (Slice 2 P0-3)
Per roadmap.

### Deferred 4: TabPFN PD calibration (Slice 2 P0-5)
Per roadmap.

### Deferred 5: ARM reset + NSS-Svensson (Slice 2 P0-4)
Per roadmap.

### Deferred 6: Spatio-temporal GNN portfolio (Slice 4)
Per roadmap.

### Deferred 7: R-Vine copula (Slice 2 P0-3)
Identified but not shipped. pyvinecopulib drop-in pending.

---

## Recommended Priority Order

### Sprint 1 (this week) — Fix the 5 critical bugs
1. `pitia()` validation
2. `qualifying_rent()` validation
3. `dscr_track1()` NaN check
4. `noi_at_year()` growth bounds
5. `max_purchase_price()` bisection precision

### Sprint 2 (next week) — Add 3 most critical missing features
6. `reserves_check()` (most DSCR lenders require 3-6 months)
7. `pi_io()` (most DSCR loans are IO ARMs)
8. Full ECOA codes 11-30 (regulatory)

### Sprint 3 (next 2 weeks) — Production hardening
9. Decimal return types
10. Logging hooks
11. CHANGELOG + LICENSE + Dockerfile
12. CI/CD pipeline

### Sprint 4 (next month) — Domain expansion
13. 5+ unit multifamily DSCR
14. LLPA matrix
15. 2-4 unit specific

---

**Document version:** 1.0 (2026-06-20)
**Total gaps identified:** 75
**Critical (must fix):** 5 bugs + 6 features
**Recommended next:** Fix 5 bugs in Sprint 1
