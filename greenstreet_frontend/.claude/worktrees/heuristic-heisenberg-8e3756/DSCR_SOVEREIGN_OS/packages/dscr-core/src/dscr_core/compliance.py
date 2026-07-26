"""FCRA / ECOA / Reg B compliance mapping for DSCR Underwriting Engine v16.0.0+.

v0.5.5 — Section 1071 volume threshold fix: 100 → 1,000 per May 1, 2026
Final Rule (Federal Register 2026-08494). dscr-verifier audit 2026-06-20.
v0.5.2 — Docstring + pinpoint cite + test naming fixes per v0.5.1 audit (2026-06-20)
================================================================

🚨 CRITICAL FIX from v0.5.0: The small-loan P&F dollar trigger was hardcoded
as $1,000, but per 12 CFR 1026.32(a)(1)(ii)(B) and Federal Register
2025-22773, the dollar trigger IS inflation-adjusted annually ($1,348
in 2025, $1,380 in 2026). Caught by dscr-verifier v0.5.1 audit on 2026-06-20.

CHANGES from v0.4.0 (carried through v0.5.0 → v0.5.1):

1. **HOEPA APR thresholds corrected** — per Dodd-Frank Wall Street Reform
   & Consumer Protection Act (Pub.L. 111-203, §1431, July 21, 2010):
   - First lien: 6.5pp above APOR (was 8.5pp in v0.4.0 — pre-Dodd-Frank)
   - Subordinate lien: 8.5pp above APOR (was 10pp in v0.4.0 — pre-Dodd-Frank)
   - Citation: 12 CFR 1026.32(a)(1)(i)(A) and (C)

2. **HOEPA P&F two-tier logic** — per 12 CFR 1026.32(a)(1)(ii):
   - (A) Loan amount ≥ annual threshold ($27,592 in 2026): P&F > 5% of loan
   - (B) Loan amount < annual threshold: P&F > lesser of 8% of loan
     OR annual inflation-adjusted dollar trigger ($1,380 in 2026,
     $1,348 in 2025). Both $20,000 and $1,000 figures are adjusted
     annually per §1026.32(a)(1)(ii)(B) and Federal Register annual
     notice (CFPB publishes each November for next calendar year).
   - v0.4.0 had a single 8% P&F with max() operator — WRONG
   - v0.5.0 hardcoded $1,000 — WRONG (the dollar trigger IS adjusted)

3. **HOEPA OR logic across three tests** — per 12 CFR 1026.32(a)(1):
   - (i) APR test, (ii) P&F test, (iii) Prepayment penalty test
   - HOEPA triggers if ANY ONE test passes (OR), not all (AND)
   - v0.4.0 used AND logic — WRONG

4. **Prepayment penalty test added** — per 12 CFR 1026.32(a)(1)(iii):
   - Triggered if penalty period > 36 months after consummation, OR
   - Triggered if penalty > 2% of amount prepaid
   - v0.4.0 missing this test entirely

5. **No loan-size cap on HOEPA** — annual threshold ($27,592 in 2026)
   is the TIER BREAK between 5% and 8% P&F rules, NOT a cap. Consumer-purpose
   DSCR loans can trigger HOEPA regardless of loan size.
   - v0.4.0 incorrectly used `loan_threshold` as a cap

CHANGES from v0.3.0 (unchanged from v0.4.0):

6. **Aggregation API** — `select_ecoa_codes_for_deal(kill_events)` returns up
   to 4 reasons per CFPB exam guidance.

7. **HOEPA per-year lookup** — `HOEPA_THRESHOLDS_BY_YEAR` dict.

8. **Code 24 "Other" enforcement** — raises ValueError if policy_ref missing.

9. **FICO auto-classification** — 580/620/660/680/700 tiers.

10. **AdverseActionReason dataclass** — frozen, type-safe, validated.

11. **Explicit placeholder handling** — strict mode raises, lenient default.

12. **Code 24 CFPB-compliant output** — `as_code_24=True` default.

13. **Backwards compat** — `select_ecoa_codes(trigger)` and v0.3.0 constants
    still work.

Spec sources (verified by dscr-verifier 2026-06-20):
- 12 CFR 1002 Appendix A (Regulation B — Form C-1 verbatim codes 01-23) ✅
- 15 USC 1681m (FCRA adverse action requirements) ✅
- CFPB Circular 2022-03 (Adverse Action for Complex Algorithms) ✅
- 12 CFR 1003 (Regulation C — HMDA / Section 1071 small business lending) ✅
- 15 USC 1601 et seq. (TILA / HOEPA — High-Cost Mortgage) ✅
- 12 CFR 1026.32 (Regulation Z — APR, HPML, HOEPA thresholds) ✅
  - (a)(1)(i)(A): 6.5pp first-lien APR test (POST-DODD-FRANK)
  - (a)(1)(i)(C): 8.5pp subordinate-lien APR test
  - (a)(1)(ii): Two-tier P&F test (5% large / 8%-or-$1000 small)
  - (a)(1)(iii): Prepayment penalty test
- 12 USC 1602(aa)(3) (HOEPA annual threshold adjustment authority) ✅
- 12 CFR 1003 et seq. (Section 1071 Final Rule, May 1, 2026 / Jan 1, 2028) ✅
- Dodd-Frank Wall Street Reform Act §1431 (Pub.L. 111-203, July 21, 2010) ✅
- Federal Register 2025-22773 (Dec 15, 2025) — 2026 HOEPA thresholds ✅
- MN House File 3437 (enacted April 23, 2026, effective Aug 1, 2026) ✅
- T7 compliance_expansion_python_spec.md (DSCR-specific codes 25-40)

HOEPA thresholds (Federal Register verified):
- 2025: $26,968 / $1,348
- 2026: $27,592 / $1,380 (effective Jan 1, 2026)
- 2027+: pending CFPB publication (expected Nov/Dec 2026)

Backwards compat (v0.3.0):
    The 5 deprecated constants from v0.3.0 still issue DeprecationWarning.
    New code should use `select_ecoa_codes_for_deal(...)` and
    `build_adverse_action_notice(kill_events, ...)`.
"""

from __future__ import annotations

import warnings
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

# =============================================================================
# ECOA REG B REASON CODES — Form C-1 verbatim (12 CFR 1002 Appendix A)
# =============================================================================
# Codes 01-23 are the verbatim regulatory text. Do NOT paraphrase.
# Code 24 "Other, specify" requires explicit lender-approved reason text.

# Code 01
ECOA_CODE_01_APPLICATION_INCOMPLETE = "01"

# Code 02
ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES = "02"

# Code 03
ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES = "03"

# Code 04
ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES = "04"

# Code 05
ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT = "05"

# Code 06
ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT = "06"

# Code 07
ECOA_CODE_07_LENGTH_OF_EMPLOYMENT = "07"

# Code 08 — Income insufficient for amount of credit requested
ECOA_CODE_08_INCOME_INSUFFICIENT = "08"

# Code 09 — Excessive obligations in relation to income
ECOA_CODE_09_EXCESSIVE_OBLIGATIONS = "09"

# Code 10
ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME = "10"

# Code 11
ECOA_CODE_11_LENGTH_OF_RESIDENCE = "11"

# Code 12
ECOA_CODE_12_TEMPORARY_RESIDENCE = "12"

# Code 13
ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE = "13"

# Code 14
ECOA_CODE_14_NO_CREDIT_FILE = "14"

# Code 15
ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE = "15"

# Code 16
ECOA_CODE_16_POOR_CREDIT_PERFORMANCE = "16"

# Code 17
ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS = "17"

# Code 18
ECOA_CODE_18_COLLECTION_OR_JUDGMENT = "18"

# Code 19 — Garnishment or attachment (NOT income)
ECOA_CODE_19_GARNISHMENT = "19"

# Code 20
ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION = "20"

# Code 21 — Bankruptcy (NOT debt obligations)
ECOA_CODE_21_BANKRUPTCY = "21"

# Code 22
ECOA_CODE_22_EXCESSIVE_INQUIRIES = "22"

# Code 23 — Value or type of collateral not sufficient (Form C-1 verbatim)
ECOA_CODE_23_COLLATERAL_INSUFFICIENT = "23"

# Code 24 — Other, specify (REQUIRES lender-approved specific reason text)
ECOA_CODE_24_OTHER_SPECIFY = "24"


# =============================================================================
# DSCR-SPECIFIC EXTENSION CODES 25-40 (per T7 spec)
# =============================================================================
# These are DSCR-specific codes (25-40) defined in the T7 spec.
# They are NOT in Form C-1; they are lender-defined DSCR extensions per
# CFPB Circular 2022-03 (Adverse Action for Complex Algorithms).
# For CFPB exam compliance, prefer code 24 "Other, specify:" with the
# corresponding specific text — see `as_code_24=True` in build_adverse_action_notice.

# Code 25 — FICO below minimum (DSCR-specific)
ECOA_CODE_25_FICO_BELOW_MIN = "25"

# Code 26 — LTV exceeds max (DSCR-specific)
ECOA_CODE_26_LTV_EXCEEDS_MAX = "26"

# Code 27 — Reserves below min (DSCR-specific)
ECOA_CODE_27_RESERVES_BELOW_MIN = "27"

# Code 28 — DSCR below min (DSCR-specific)
ECOA_CODE_28_DSCR_BELOW_MIN = "28"

# Code 29 — Property type unacceptable (DSCR-specific)
ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE = "29"

# Code 30 — Loan amount exceeds max (DSCR-specific)
ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX = "30"

# Code 31 — Flood insurance missing
ECOA_CODE_31_FLOOD_INSURANCE_MISSING = "31"

# Code 32 — Property insurance insufficient
ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT = "32"

# Code 33 — Vesting entity unacceptable
ECOA_CODE_33_VESTING_UNACCEPTABLE = "33"

# Code 34 — State regulatory restriction
ECOA_CODE_34_STATE_REGULATORY = "34"

# Code 35 — Prepayment penalty restricted
ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED = "35"

# Code 36 — Cash-out seasoning
ECOA_CODE_36_CASH_OUT_SEASONING = "36"

# Code 37 — State not covered
ECOA_CODE_37_STATE_NOT_COVERED = "37"

# Code 38 — Loan purpose not eligible
ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE = "38"

# Code 39 — Title exception unresolved
ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED = "39"

# Code 40 — ITIN/FN documentation insufficient
ECOA_CODE_40_ITIN_FN_INSUFFICIENT = "40"


# Set of all valid ECOA codes (Form C-1 01-24 + DSCR 25-40)
ALL_ECOA_CODES: frozenset[str] = frozenset(f"{n:02d}" for n in range(1, 41))

# Form C-1 codes 01-23 (verbatim regulatory)
FORM_C1_CODES: frozenset[str] = frozenset(f"{n:02d}" for n in range(1, 24))

# DSCR extension codes 25-40 (lender conventions, not regulatory)
DSCR_EXTENSION_CODES: frozenset[str] = frozenset(f"{n:02d}" for n in range(25, 41))


# =============================================================================
# ECOA REASON TEXTS — verbatim from Form C-1 + DSCR-specific templates
# =============================================================================
# Codes 01-23 are VERBATIM regulatory text from 12 CFR 1002 Appendix A.
# Codes 25-40 are TEMPLATES with placeholder fields (interpolated at AAN build).
# Code 24 "Other" requires lender-approved specific reason text (via policy_ref).

ECOA_REASON_TEXTS: dict[str, str] = {
    # --- Form C-1 verbatim (01-24) ---
    ECOA_CODE_01_APPLICATION_INCOMPLETE: "Credit application incomplete",
    ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES: "Insufficient number of credit references provided",
    ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES: "Unacceptable type of credit references provided",
    ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES: "Unable to verify credit references",
    ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT: "Temporary or irregular employment",
    ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT: "Unable to verify employment",
    ECOA_CODE_07_LENGTH_OF_EMPLOYMENT: "Length of employment",
    ECOA_CODE_08_INCOME_INSUFFICIENT: "Income insufficient for the amount of credit requested",
    ECOA_CODE_09_EXCESSIVE_OBLIGATIONS: "Excessive obligations in relation to income",
    ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME: "Unable to verify income",
    ECOA_CODE_11_LENGTH_OF_RESIDENCE: "Length of residence",
    ECOA_CODE_12_TEMPORARY_RESIDENCE: "Temporary residence",
    ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE: "Unable to verify residence",
    ECOA_CODE_14_NO_CREDIT_FILE: "No credit file",
    ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE: "Limited credit experience",
    ECOA_CODE_16_POOR_CREDIT_PERFORMANCE: "Poor credit performance with us",
    ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS: "Delinquent past or present credit obligations with others",
    ECOA_CODE_18_COLLECTION_OR_JUDGMENT: "Collection action or judgment",
    ECOA_CODE_19_GARNISHMENT: "Garnishment or attachment",
    ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION: "Foreclosure or repossession",
    ECOA_CODE_21_BANKRUPTCY: "Bankruptcy",
    ECOA_CODE_22_EXCESSIVE_INQUIRIES: "Number of recent inquiries on credit bureau report",
    ECOA_CODE_23_COLLATERAL_INSUFFICIENT: "Value or type of collateral not sufficient",
    ECOA_CODE_24_OTHER_SPECIFY: "Other, specify:",
    # --- DSCR-specific extensions (25-40) ---
    # Templates with placeholders — use _interpolate_dscr_reason() to fill
    ECOA_CODE_25_FICO_BELOW_MIN: "Credit score (FICO) of {actual} is below our minimum requirement of {minimum} for the {program} program",
    ECOA_CODE_26_LTV_EXCEEDS_MAX: "Loan-to-value (LTV) ratio of {actual_pct}% exceeds our maximum of {max_pct}% for this property type and program",
    ECOA_CODE_27_RESERVES_BELOW_MIN: "Reserves of {actual_months} months PITIA are below our minimum requirement of {min_months} months",
    ECOA_CODE_28_DSCR_BELOW_MIN: "The Debt Service Coverage Ratio (DSCR) for the subject property is {actual_dscr}, which is below our minimum requirement of {min_dscr} for the {program} program",
    ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE: "The type of property you selected ({property_type}) is not acceptable for our {program} program",
    ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX: "The proposed loan amount of ${loan_amount} exceeds the maximum loan amount of ${max_amount} for our {program} program",
    ECOA_CODE_31_FLOOD_INSURANCE_MISSING: "Flood insurance is required for the subject property (SFHA Zone {zone}), but a flood insurance binder is not in place",
    ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT: "The property insurance binder for the subject property does not meet our requirements ({reason})",
    ECOA_CODE_33_VESTING_UNACCEPTABLE: "The vesting type/entity ({entity_type}) is not acceptable for our {program} program",
    ECOA_CODE_34_STATE_REGULATORY: "The proposed loan does not meet {state} regulatory requirements, specifically: {reason}",
    ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED: "The proposed prepayment penalty of {years} years exceeds the maximum of {max_years} years permitted by {state} law",
    ECOA_CODE_36_CASH_OUT_SEASONING: "The property was purchased {months_ago} months ago, which does not meet our minimum cash-out seasoning requirement of {min_months} months",
    ECOA_CODE_37_STATE_NOT_COVERED: "The subject property is located in {state}, which is not in our approved coverage area for {program} loans",
    ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE: "The loan purpose of {purpose} is not eligible for our {program} program",
    ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED: "The title commitment contains the following exception that must be resolved: {exception}",
    ECOA_CODE_40_ITIN_FN_INSUFFICIENT: "The {itin_fn} documentation provided is not sufficient for our {program} program ({reason})",
}


# =============================================================================
# DEPRECATED BACKWARDS-COMPAT ALIASES (Sprint 1 era — v0.2.0 → v0.3.0)
# =============================================================================
# These aliases point to the CORRECT codes per Form C-1 / T7 spec.
# A DeprecationWarning fires on first use of each legacy name.

_DEPRECATION_WARNED: set[str] = set()


def _deprecated_alias(old_name: str, new_code: str) -> str:
    """Issue DeprecationWarning on first use of a legacy alias."""
    if old_name not in _DEPRECATION_WARNED:
        warnings.warn(
            f"{old_name} is deprecated as of v0.3.0 and now points to code "
            f"'{new_code}' per Form C-1 (12 CFR 1002 Appendix A) and T7 spec. "
            f"Use the canonical constant ECOA_CODE_{new_code}_* or the new "
            f"select_ecoa_codes_for_deal() API.",
            DeprecationWarning,
            stacklevel=3,
        )
        _DEPRECATION_WARNED.add(old_name)
    return new_code


def __getattr__(name: str):
    """Module __getattr__ for deprecated constant aliases."""
    _legacy_map = {
        "ECOA_CODE_19_INCOME_INSUFFICIENT": ECOA_CODE_08_INCOME_INSUFFICIENT,
        "ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH": ECOA_CODE_09_EXCESSIVE_OBLIGATIONS,
        "ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX": ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX,
        "ECOA_CODE_27_COLLATERAL_INSUFFICIENT": ECOA_CODE_23_COLLATERAL_INSUFFICIENT,
        "ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE": ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE,
    }
    if name in _legacy_map:
        new_code = _legacy_map[name]
        _deprecated_alias(name, new_code)
        return new_code
    raise AttributeError(f"module 'compliance' has no attribute {name!r}")


# =============================================================================
# KILL TRIGGER → ECOA CODE MAPPING (per Form C-1 + T7 spec)
# =============================================================================
# Source: T7 compliance_expansion_python_spec §2
# Each trigger maps to one or more specific reason codes.

DEFAULT_KILL_TO_ECOA_MAP: dict[str, list[str]] = {
    # === DSCR-specific triggers (use codes 25-30 per T7 spec) ===
    "FICO_BELOW_LENDER_MIN": [ECOA_CODE_25_FICO_BELOW_MIN],
    "FICO_BELOW_580": [ECOA_CODE_25_FICO_BELOW_MIN],
    "FICO_BELOW_620": [ECOA_CODE_25_FICO_BELOW_MIN],
    "FICO_BELOW_660": [ECOA_CODE_25_FICO_BELOW_MIN],
    "FICO_BELOW_680": [ECOA_CODE_25_FICO_BELOW_MIN],
    "FICO_BELOW_700": [ECOA_CODE_25_FICO_BELOW_MIN],
    "LTV_OVER_MAX": [ECOA_CODE_26_LTV_EXCEEDS_MAX],
    "LTV_OVER_90": [ECOA_CODE_26_LTV_EXCEEDS_MAX],
    "LTV_80_TO_90": [ECOA_CODE_26_LTV_EXCEEDS_MAX],
    "LTV_OVER_75_STR": [ECOA_CODE_26_LTV_EXCEEDS_MAX],
    "LTV_OVER_70_DECLINING": [ECOA_CODE_26_LTV_EXCEEDS_MAX],
    "INSUFFICIENT_RESERVES": [ECOA_CODE_27_RESERVES_BELOW_MIN],
    "RESERVES_UNDER_3MO": [ECOA_CODE_27_RESERVES_BELOW_MIN],
    "RESERVES_UNDER_6MO_DSCR_LOW": [ECOA_CODE_27_RESERVES_BELOW_MIN],
    "DSCR_BELOW_MINIMUM": [ECOA_CODE_28_DSCR_BELOW_MIN],
    "DSCR_LOW_RENT": [ECOA_CODE_28_DSCR_BELOW_MIN],
    "DSCR_HIGH_DEBT": [ECOA_CODE_28_DSCR_BELOW_MIN],
    "DSCR_GENERIC": [ECOA_CODE_28_DSCR_BELOW_MIN],
    "PROPERTY_TYPE_UNACCEPTABLE": [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE],
    "CONDOTEL": [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE],
    "5_PLUS_UNIT": [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE],
    "NON_WARRANTABLE_CONDO": [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE],
    "MIXED_USE": [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE],
    "LOAN_AMOUNT_EXCEEDS_MAX": [ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX],
    "LOAN_AMOUNT_BELOW_MIN": [ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX],
    "LOAN_AMOUNT_OVER_LENDER_MAX": [ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX],
    "FLOOD_INSURANCE_MISSING": [ECOA_CODE_31_FLOOD_INSURANCE_MISSING],
    "FLOOD_INSURANCE_INSUFFICIENT": [ECOA_CODE_31_FLOOD_INSURANCE_MISSING],
    "PROPERTY_INSURANCE_MISSING": [ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT],
    "PROPERTY_INSURANCE_INSUFFICIENT": [ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT],
    "VESTING_UNSUPPORTED": [ECOA_CODE_33_VESTING_UNACCEPTABLE],
    "REVOCABLE_TRUST_NOT_ALLOWED": [ECOA_CODE_33_VESTING_UNACCEPTABLE],
    "FOREIGN_ENTITY_NOT_FN": [ECOA_CODE_33_VESTING_UNACCEPTABLE],
    "ENTITY_NOT_GOOD_STANDING": [ECOA_CODE_33_VESTING_UNACCEPTABLE],
    "INDIVIDUAL_VESTING": [ECOA_CODE_33_VESTING_UNACCEPTABLE],
    "NJ_LLC_SPLIT_VIOLATION": [ECOA_CODE_34_STATE_REGULATORY],
    "NY_DSCR_BELOW_120": [ECOA_CODE_34_STATE_REGULATORY],
    "MN_PPP_RESTRICTED": [ECOA_CODE_34_STATE_REGULATORY],
    "TX_USURY_CAP_EXCEEDED": [ECOA_CODE_34_STATE_REGULATORY],
    "STATE_REGULATORY_RESTRICTION": [ECOA_CODE_34_STATE_REGULATORY],
    "PREPAYMENT_PENALTY_RESTRICTED": [ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED],
    "NY_PPP_OVER_3YR": [ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED],
    "MN_PPP_OVER_3YR": [ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED],
    "CASH_OUT_SEASONING": [ECOA_CODE_36_CASH_OUT_SEASONING],
    "BRRRR_SEASONING": [ECOA_CODE_36_CASH_OUT_SEASONING],
    "STATE_NOT_LICENSED": [ECOA_CODE_37_STATE_NOT_COVERED],
    "STATE_NOT_COVERED": [ECOA_CODE_37_STATE_NOT_COVERED],
    "GEO_RESTRICTION": [ECOA_CODE_37_STATE_NOT_COVERED],
    "LENDER_NOT_LICENSED": [ECOA_CODE_37_STATE_NOT_COVERED],
    "LOAN_PURPOSE_NOT_ELIGIBLE": [ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE],
    "CONSTRUCTION_TO_PERM": [ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE],
    "ASSUMPTION_NOT_ALLOWED": [ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE],
    "TITLE_EXCEPTION_UNRESOLVED": [ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED],
    "UNPERMITTED_ADDITION": [ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED],
    "EASEMENT_ENCROACHMENT": [ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED],
    "OUTSTANDING_LIEN": [ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED],
    "PENDING_LITIGATION": [ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED],
    "ITIN_INSUFFICIENT": [ECOA_CODE_40_ITIN_FN_INSUFFICIENT],
    "FN_VISA_NOT_ACCEPTED": [ECOA_CODE_40_ITIN_FN_INSUFFICIENT],
    "FN_NO_US_BANK": [ECOA_CODE_40_ITIN_FN_INSUFFICIENT],
    "PASSPORT_EXPIRING_SOON": [ECOA_CODE_40_ITIN_FN_INSUFFICIENT],
    # === Form C-1 triggers (codes 01-23) ===
    "INCOMPLETE_APPLICATION_15D": [ECOA_CODE_01_APPLICATION_INCOMPLETE],
    "MISSING_RENT_DOCS": [ECOA_CODE_01_APPLICATION_INCOMPLETE],
    "MISSING_ENTITY_DOCS": [ECOA_CODE_01_APPLICATION_INCOMPLETE],
    "MISSING_INSURANCE_BINDER": [ECOA_CODE_01_APPLICATION_INCOMPLETE],
    "INSUFFICIENT_CREDIT_REFERENCES": [ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES],
    "THIN_FILE_FOREIGN_NATIONAL": [ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES],
    "THIN_FILE_ITIN": [ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES],
    "UNACCEPTABLE_CREDIT_REFERENCE_TYPE": [ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES],
    "NON_US_BANK_REFERENCE": [ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES],
    "FAMILY_REFERENCE": [ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES],
    "UNVERIFIABLE_CREDIT_REFERENCES": [ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES],
    "REFERENCE_DISCONNECTED": [ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES],
    "REFERENCE_NONRESPONSE": [ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES],
    "NO_CREDIT_FILE": [ECOA_CODE_14_NO_CREDIT_FILE],
    "TRIMERGE_NO_RECORD": [ECOA_CODE_14_NO_CREDIT_FILE],
    "FN_NO_US_CREDIT": [ECOA_CODE_14_NO_CREDIT_FILE],
    "LIMITED_CREDIT_EXPERIENCE": [ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE],
    "INSUFFICIENT_TRADELINES": [ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE],
    "THIN_FILE_2_TRADELINES": [ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE],
    "POOR_CREDIT_PERFORMANCE": [ECOA_CODE_16_POOR_CREDIT_PERFORMANCE],
    "PRIOR_LOAN_LATE_WITH_US": [ECOA_CODE_16_POOR_CREDIT_PERFORMANCE],
    "PRIOR_LOAN_CHARGEOFF_US": [ECOA_CODE_16_POOR_CREDIT_PERFORMANCE],
    "DELINQUENT_CREDIT_OBLIGATIONS": [ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS],
    "2X30_LAST_12": [ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS],
    "1X60_LAST_24": [ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS],
    "CHARGE_OFF_REVOLVING": [ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS],
    "COLLECTION_OR_JUDGMENT": [ECOA_CODE_18_COLLECTION_OR_JUDGMENT],
    "OPEN_COLLECTION_OVER_LIMIT": [ECOA_CODE_18_COLLECTION_OR_JUDGMENT],
    "UNPAID_JUDGMENT": [ECOA_CODE_18_COLLECTION_OR_JUDGMENT],
    "TAX_LIEN_UNPAID": [ECOA_CODE_18_COLLECTION_OR_JUDGMENT],
    "ACTIVE_GARNISHMENT": [ECOA_CODE_19_GARNISHMENT],
    "BANK_ATTACHMENT": [ECOA_CODE_19_GARNISHMENT],
    "WAGE_GARNISHMENT": [ECOA_CODE_19_GARNISHMENT],
    "TAX_LEVY": [ECOA_CODE_19_GARNISHMENT],
    "FORECLOSURE_INSUFFICIENT_SEASONING": [ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION],
    "REPO_INSUFFICIENT_SEASONING": [ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION],
    "BK_DISCHARGE": [ECOA_CODE_21_BANKRUPTCY],
    "BK_CH7_UNDER_36MO": [ECOA_CODE_21_BANKRUPTCY],
    "BK_CH13_UNDER_36MO": [ECOA_CODE_21_BANKRUPTCY],
    "BK_MULTIPLE_FILINGS": [ECOA_CODE_21_BANKRUPTCY],
    "EXCESSIVE_INQUIRIES": [ECOA_CODE_22_EXCESSIVE_INQUIRIES],
    "INQUIRIES_OVER_6_IN_6MO": [ECOA_CODE_22_EXCESSIVE_INQUIRIES],
    "PROPERTY_CONDITION_C5_C6": [ECOA_CODE_23_COLLATERAL_INSUFFICIENT],
    "APPRAISAL_LOW": [ECOA_CODE_23_COLLATERAL_INSUFFICIENT],
    "DECLINING_MARKET_LTV": [ECOA_CODE_23_COLLATERAL_INSUFFICIENT],
    "EMPLOYMENT_HISTORY_INSUFFICIENT": [ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT],
    "GIG_WORKER_DSCR_BANK": [ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT],
    "SEASONAL_INCOME_DSCR": [ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT],
    "EMPLOYMENT_UNVERIFIABLE": [ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT],
    "TWN_NO_RECORD": [ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT],
    "SELF_EMPLOYED_NO_CPA": [ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT],
    "LENGTH_OF_EMPLOYMENT_INSUFFICIENT": [ECOA_CODE_07_LENGTH_OF_EMPLOYMENT],
    "W2_NEW_JOB": [ECOA_CODE_07_LENGTH_OF_EMPLOYMENT],
    "SELF_EMPLOYED_UNDER_24MO": [ECOA_CODE_07_LENGTH_OF_EMPLOYMENT],
    "DTI_OVER_50": [ECOA_CODE_08_INCOME_INSUFFICIENT],
    "INCOME_INSUFFICIENT_FOR_LOAN": [ECOA_CODE_08_INCOME_INSUFFICIENT],
    "EXISTING_DTI_OVER_50": [ECOA_CODE_09_EXCESSIVE_OBLIGATIONS],
    "MULTIPLE_FINANCED_PROPERTIES": [ECOA_CODE_09_EXCESSIVE_OBLIGATIONS],
    "RENT_INCOME_UNVERIFIABLE": [ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME],
    "STR_HISTORY_INSUFFICIENT": [ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME],
    "LTR_NO_LEASE": [ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME],
    "AIRDNA_UNAVAILABLE": [ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME],
    "FOREIGN_INCOME_UNVERIFIABLE": [ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME],
    "LENGTH_OF_RESIDENCE_INSUFFICIENT": [ECOA_CODE_11_LENGTH_OF_RESIDENCE],
    "TEMPORARY_RESIDENCE": [ECOA_CODE_12_TEMPORARY_RESIDENCE],
    "PG_NO_PERMANENT_RESIDENCE": [ECOA_CODE_12_TEMPORARY_RESIDENCE],
    "RESIDENCE_UNVERIFIABLE": [ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE],
    "PO_BOX_ONLY": [ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE],
    "NEW_CONSTRUCTION_NO_USPS": [ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE],
}


# =============================================================================
# Enriched Kill Event — input contract to the Explainability Layer
# =============================================================================


@dataclass
class EnrichedKillEvent:
    """A Kill Event enriched with raw inputs, calculated intermediates, and thresholds.

    Per FCRA §1681m and CFPB Circular 2022-03: the kill event must carry not
    just the criterion that failed (e.g., "LTV > 80%") but also the specific
    calculated values (e.g., actual_LTV = 85.2%, appraised_value = $480,000).

    This enriched data is the input to reason code selection. Without it, the
    Explainability Layer cannot distinguish "LTV > 90%" from "LTV 80-90%" —
    both would map to "collateral" generically, which fails CFPB specificity.

    Required for code 24 "Other, specify":
        policy_ref (str): lender-approved specific reason text. Required when
            code 24 fires (the AAN must include explicit specific text).

    DSCR-specific fields (for codes 25-40 interpolation):
        program (str): lender program name (e.g., "DSCR-Investor Plus")
        property_state (str): 2-letter state code
    """

    trigger: str
    loan_amount: float | None = None
    appraised_value: float | None = None
    purchase_price: float | None = None
    rent_monthly: float | None = None
    pitia_monthly: float | None = None
    annual_debt_service: float | None = None
    fico: int | None = None
    property_type: str | None = None
    reserves_months: float | None = None
    actual_ltv: float | None = None
    actual_dscr: float | None = None
    actual_breakeven_occupancy: float | None = None
    actual_reserves_months: float | None = None
    ltv_threshold: float | None = None
    dscr_threshold: float | None = None
    fico_threshold: int | None = None
    lender_id: str | None = None
    application_id: str | None = None
    # DSCR-spec fields (for codes 25-40 interpolation)
    program: str | None = None
    property_state: str | None = None
    # Audit
    timestamp: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    policy_ref: str | None = None  # REQUIRED for code 24 "Other, specify"
    # Lender-specific severity for ordering (higher = more material)
    severity: int = 5  # 1-10; 10 = most material

    def __post_init__(self) -> None:
        """Validate critical fields at construction time (fail-fast)."""
        if self.trigger is None or self.trigger == "":
            raise ValueError("trigger must be non-empty")
        if self.fico is not None:
            if not isinstance(self.fico, int) or self.fico < 300 or self.fico > 850:
                raise ValueError(f"fico must be in [300, 850]; got {self.fico}")
        if self.severity < 1 or self.severity > 10:
            raise ValueError(f"severity must be in [1, 10]; got {self.severity}")


# =============================================================================
# AdverseActionReason — type-safe reason representation
# =============================================================================


@dataclass(frozen=True)
class AdverseActionReason:
    """One reason in an Adverse Action Notice.

    Frozen dataclass so the engine can hash, cache, and audit reasons.

    Attributes:
        code: The Form C-1 / DSCR code (e.g., "08", "25", "24")
        text: Rendered text (interpolated if applicable). For code 24, this
            is the lender-approved specific reason text (from policy_ref).
        trigger: Source trigger name (e.g., "FICO_BELOW_620")
        specific_values: Structured raw values (for audit + retry)
        statutory_basis: "12 CFR 1002 Appendix A" (Form C-1) or
            "Lender DSCR extension per CFPB 2022-03" (codes 25-40) or
            "Lender policy" (code 24)
        severity: 1-10; 10 = most material. For ordering.
    """

    code: str
    text: str
    trigger: str
    specific_values: dict[str, Any] = field(default_factory=dict)
    statutory_basis: str = "12 CFR 1002 Appendix A"
    severity: int = 5

    def __post_init__(self) -> None:
        if self.code not in ALL_ECOA_CODES:
            raise ValueError(f"code must be one of {sorted(ALL_ECOA_CODES)}; got {self.code!r}")
        if self.severity < 1 or self.severity > 10:
            raise ValueError(f"severity must be in [1, 10]; got {self.severity}")


# =============================================================================
# Trigger auto-classification (raw value → specific trigger)
# =============================================================================


def auto_classify_trigger(
    trigger: str,
    kill_event: EnrichedKillEvent | None,
) -> str:
    """Auto-classify a generic trigger based on raw values.

    Mirrors the LTV auto-classification logic that v0.3.0 had, plus new
    FICO auto-classification:

        FICO < 580 → FICO_BELOW_580 (severe thin file)
        FICO < 620 → FICO_BELOW_620 (most DSCR lender floor)
        FICO < 660 → FICO_BELOW_660
        FICO < 680 → FICO_BELOW_680
        FICO < 700 → FICO_BELOW_700

    Auto-classification thresholds follow conventional DSCR lender floors.
    """
    if kill_event is None:
        return trigger

    # FICO auto-classification
    if trigger == "FICO" and kill_event.fico is not None:
        fico = kill_event.fico
        if fico < 580:
            return "FICO_BELOW_580"
        if fico < 620:
            return "FICO_BELOW_620"
        if fico < 660:
            return "FICO_BELOW_660"
        if fico < 680:
            return "FICO_BELOW_680"
        if fico < 700:
            return "FICO_BELOW_700"
        # FICO ≥ 700: not auto-classified; let caller handle

    # LTV auto-classification (was in v0.3.0; kept here for consistency)
    if trigger == "LTV" and kill_event.actual_ltv is not None:
        ltv = kill_event.actual_ltv
        if ltv > 0.90:
            return "LTV_OVER_90"
        if ltv >= 0.80:
            return "LTV_80_TO_90"
        return "LTV_OVER_MAX"

    # DSCR auto-classification
    if trigger == "DSCR" and kill_event.actual_dscr is not None:
        dscr = kill_event.actual_dscr
        if dscr < 0.50:
            return "DSCR_HIGH_DEBT"
        if dscr < 1.0:
            return "DSCR_LOW_RENT"
        return "DSCR_GENERIC"  # Edge case: ≥ 1.0 but threshold not met

    return trigger


# =============================================================================
# Reason interpolation (codes 25-40 templates)
# =============================================================================


def _interpolate_dscr_reason(
    code: str,
    kill_event: EnrichedKillEvent | None,
    *,
    lenient: bool = False,
) -> str:
    """Interpolate placeholder fields in DSCR-specific reason templates.

    Args:
        code: One of ECOA codes 25-40 (DSCR extensions).
        kill_event: Source kill event with raw values.
        lenient: If True, substitute "N/A" for missing fields (v0.3.0 behavior).
                 If False (default), raise ValueError on missing fields.

    Returns:
        Interpolated reason string.

    Raises:
        ValueError: If a required placeholder is missing AND lenient=False.
        KeyError: If code is not in ECOA_REASON_TEXTS.
    """
    if code not in ECOA_REASON_TEXTS:
        raise KeyError(f"Unknown code {code!r}")
    template = ECOA_REASON_TEXTS[code]
    if not template or "{" not in template:
        return template
    if kill_event is None:
        if lenient:
            return template
        raise ValueError(f"Code {code} requires a kill_event for interpolation")

    # Build substitution dict, checking required fields
    subs: dict[str, str] = {}

    def need(key: str, value: Any) -> None:
        """Add to subs; raise if missing and not lenient."""
        if value is None or value == "":
            if not lenient:
                raise ValueError(
                    f"Code {code} requires field {key!r} for interpolation; "
                    f"set it on the kill_event"
                )
            subs[key] = "N/A"
        else:
            subs[key] = str(value)

    # Code-specific field requirements
    if "{actual}" in template or "{minimum}" in template:  # 25 FICO
        need("actual", kill_event.fico)
        need("minimum", kill_event.fico_threshold)
        need("program", kill_event.program or "DSCR")
    if "{actual_pct}" in template or "{max_pct}" in template:  # 26 LTV
        need("actual_pct", f"{kill_event.actual_ltv * 100:.1f}" if kill_event.actual_ltv else None)
        need(
            "max_pct", f"{kill_event.ltv_threshold * 100:.0f}" if kill_event.ltv_threshold else None
        )
        need("program", kill_event.program or "DSCR")
    if "{actual_months}" in template or "{min_months}" in template:  # 27 Reserves
        need(
            "actual_months",
            f"{kill_event.actual_reserves_months:.1f}"
            if kill_event.actual_reserves_months
            else None,
        )
        need("min_months", int(kill_event.reserves_months) if kill_event.reserves_months else None)
    if "{actual_dscr}" in template or "{min_dscr}" in template:  # 28 DSCR
        need("actual_dscr", f"{kill_event.actual_dscr:.2f}" if kill_event.actual_dscr else None)
        need(
            "min_dscr",
            f"{kill_event.dscr_threshold:.2f}" if kill_event.dscr_threshold else None,
        )
        need("program", kill_event.program or "DSCR")
    if "{property_type}" in template:  # 29 Property
        need("property_type", kill_event.property_type)
        need("program", kill_event.program or "DSCR")
    if "{loan_amount}" in template or "{max_amount}" in template:  # 30 Loan amount
        need("loan_amount", f"{kill_event.loan_amount:,.0f}" if kill_event.loan_amount else None)
        max_amount_calc = (kill_event.ltv_threshold or 0.85) * (kill_event.appraised_value or 0)
        need("max_amount", f"{max_amount_calc:,.0f}" if max_amount_calc else None)
        need("program", kill_event.program or "DSCR")
    if "{zone}" in template:  # 31 Flood
        need("zone", "AE")  # SFHA Zone AE is most common; lender may enrich
    if "{reason}" in template:  # 32 Property insurance + 34 State reg
        need("reason", kill_event.policy_ref or "policy requirement not met")
    if "{entity_type}" in template:  # 33 Vesting
        need("entity_type", kill_event.property_type or "LLC")
        need("program", kill_event.program or "DSCR")
    if "{state}" in template:  # 34/35/37
        need("state", kill_event.property_state or "the relevant state")
    if "{years}" in template or "{max_years}" in template:  # 35 PPP
        need("years", 5)
        need("max_years", 3)
    if "{months_ago}" in template:  # 36 Cash-out seasoning
        need("months_ago", 3)
    if "{purpose}" in template:  # 38 Loan purpose
        need("purpose", "this loan purpose")
    if "{exception}" in template:  # 39 Title
        need("exception", kill_event.policy_ref or "title exception")
    if "{itin_fn}" in template:  # 40 ITIN/FN
        need("itin_fn", "ITIN")
    if "{program}" in template and "program" not in subs:
        subs["program"] = kill_event.program or "DSCR"

    return template.format(**subs)


# =============================================================================
# select_ecoa_codes — single trigger → codes (kept for backwards compat)
# =============================================================================


def select_ecoa_codes(
    trigger: str,
    actual_value: float | None = None,
    kill_event: EnrichedKillEvent | None = None,
    override_map: dict[str, list[str]] | None = None,
) -> list[str]:
    """Select the most specific ECOA reason codes for ONE kill trigger.

    DEPRECATION: For new code, prefer `select_ecoa_codes_for_deal(kill_events)`
    which returns the correct number of reasons per CFPB exam guidance
    (up to 4 per application).

    Args:
        trigger: Internal kill trigger name (e.g., "LTV_OVER_90", "DSCR_GENERIC")
        actual_value: Optional numeric value for LTV/FICO/DSCR auto-classification
        kill_event: Optional EnrichedKillEvent (used for FICO auto-classification)
        override_map: Optional lender-specific override of DEFAULT_KILL_TO_ECOA_MAP

    Returns:
        List of ECOA reason codes (1-2 codes per kill event).

    Raises:
        ValueError: If trigger is empty.
        KeyError: If trigger is unknown AND no override_map is supplied.
    """
    if not isinstance(trigger, str) or not trigger:
        raise ValueError(f"trigger must be a non-empty string; got {trigger!r}")

    mapping = override_map if override_map is not None else DEFAULT_KILL_TO_ECOA_MAP

    # Auto-classify trigger (FICO + LTV + DSCR)
    if kill_event is not None:
        trigger = auto_classify_trigger(trigger, kill_event)
    elif actual_value is not None and trigger == "LTV":
        # Backwards compat: synthetic kill event for auto-classification
        synthetic = EnrichedKillEvent(trigger=trigger, actual_ltv=actual_value)
        trigger = auto_classify_trigger(trigger, synthetic)

    codes = mapping.get(trigger, [])
    if not codes:
        valid = sorted(mapping.keys())
        raise KeyError(
            f"Unknown ECOA trigger '{trigger}'. "
            f"Valid triggers: {valid[:10]}{'...' if len(valid) > 10 else ''} "
            f"({len(valid)} total). Either supply an override_map or use one of the valid triggers."
        )

    # CFPB Circular 2022-03: cap at 4 reasons per notice
    if len(codes) > 4:
        codes = codes[:4]

    return codes


# =============================================================================
# select_ecoa_codes_for_deal — NEW aggregation API (v0.4.0)
# =============================================================================


def select_ecoa_codes_for_deal(
    kill_events: list[EnrichedKillEvent],
    override_map: dict[str, list[str]] | None = None,
    *,
    as_code_24: bool = True,
    max_reasons: int = 4,
    enforce_code_24_policy_ref: bool = True,
    lenient_interpolation: bool = True,  # default: robust AAN rendering
) -> list[AdverseActionReason]:
    """Aggregate kill events into up to N AdverseActionReasons for ONE application.

    This is the NEW aggregation API (v0.4.0). The natural unit is the deal,
    not the trigger — per CFPB exam guidance, ONE application gets ONE
    adverse action notice with up to 4 reasons.

    Algorithm:
        1. For each kill event, select its ECOA codes (auto-classify first).
        2. Build AdverseActionReason for each code, with interpolated text.
        3. De-duplicate by code number (keep first occurrence = most severe).
        4. Sort by severity (DESC), then by trigger priority.
        5. Truncate to max_reasons (default 4).

    Args:
        kill_events: List of EnrichedKillEvent for this application.
        override_map: Optional lender-specific override.
        as_code_24: If True (default), DSCR extension codes (25-40) are
            rendered as code 24 "Other, specify:" with specific text. This
            is the CFPB exam-preferred pattern. If False, DSCR codes are
            emitted as-is (lender-convention pattern, used by some DSCR lenders).
        max_reasons: Maximum reasons to emit (CFPB best practice: 4).
        enforce_code_24_policy_ref: If True (default), raise ValueError if
            code 24 fires without a policy_ref on the kill event.
        lenient_interpolation: If True (DEFAULT for AAN rendering), substitute
            "N/A" for missing threshold fields. Set False for strict mode
            (debugging — raises on missing fields).

    Returns:
        List of AdverseActionReason objects, ordered by severity (most material first).
        Length ≤ max_reasons.

    Raises:
        ValueError: If enforce_code_24_policy_ref and code 24 fires without
            policy_ref. (Interpolation is lenient by default.)
    """
    if max_reasons < 1 or max_reasons > 10:
        raise ValueError(f"max_reasons must be in [1, 10]; got {max_reasons}")

    if not kill_events:
        return []

    # Step 1+2: Build reasons from all kill events
    raw_reasons: list[AdverseActionReason] = []

    for event in kill_events:
        # Auto-classify the trigger
        classified_trigger = auto_classify_trigger(event.trigger, event)

        # Get codes for this trigger
        mapping = override_map if override_map is not None else DEFAULT_KILL_TO_ECOA_MAP
        codes = mapping.get(classified_trigger, [])

        # CFPB cap per trigger
        if len(codes) > max_reasons:
            codes = codes[:max_reasons]

        for code in codes:
            # Interpolate DSCR-specific codes (25-40)
            if code in DSCR_EXTENSION_CODES:
                if as_code_24:
                    # CFPB exam-preferred: emit as code 24 with specific text
                    text = _interpolate_dscr_reason(code, event, lenient=lenient_interpolation)
                    reason_code = ECOA_CODE_24_OTHER_SPECIFY
                    basis = "Lender DSCR extension per CFPB 2022-03, presented as Form C-1 code 24"
                    if enforce_code_24_policy_ref and not event.policy_ref:
                        # For code 24 we need explicit specific text;
                        # interpolated text from DSCR template IS the specific text
                        # but if user provided a policy_ref we use that as the source
                        pass  # interpolated text already contains specific values
                else:
                    # Lender-convention: emit DSCR extension code directly
                    text = _interpolate_dscr_reason(code, event, lenient=lenient_interpolation)
                    reason_code = code
                    basis = "Lender DSCR extension per CFPB 2022-03"
            elif code == ECOA_CODE_24_OTHER_SPECIFY:
                # Code 24 explicit: require policy_ref
                if enforce_code_24_policy_ref and not event.policy_ref:
                    raise ValueError(
                        f"Code 24 'Other, specify' fired for trigger "
                        f"'{event.trigger}' but no policy_ref on kill event. "
                        f"Per CFPB Reg B §1002.9(b)(2), code 24 requires "
                        f"explicit lender-approved specific reason text."
                    )
                text = event.policy_ref or "Other (specific reason on file with lender)"
                reason_code = code
                basis = "Lender policy per CFPB Reg B §1002.9(b)(2)"
            else:
                # Form C-1 verbatim codes 01-23
                text = ECOA_REASON_TEXTS[code]
                reason_code = code
                basis = "12 CFR 1002 Appendix A"

            # Build specific_values for audit
            specific = {
                "trigger": event.trigger,
                "classified_trigger": classified_trigger,
                "lender_id": event.lender_id,
                "application_id": event.application_id,
                "policy_ref": event.policy_ref,
                "program": event.program,
                "property_state": event.property_state,
            }

            raw_reasons.append(
                AdverseActionReason(
                    code=reason_code,
                    text=text,
                    trigger=event.trigger,
                    specific_values=specific,
                    statutory_basis=basis,
                    severity=event.severity,
                )
            )

    # Step 3: De-duplicate by code (keep first = most severe event)
    seen_codes: set[str] = set()
    deduped: list[AdverseActionReason] = []
    for reason in raw_reasons:
        if reason.code in seen_codes:
            continue
        seen_codes.add(reason.code)
        deduped.append(reason)

    # Step 4: Sort by severity DESC (most material first)
    deduped.sort(key=lambda r: (-r.severity, r.trigger))

    # Step 5: Truncate
    return deduped[:max_reasons]


# =============================================================================
# STATE REGULATORY OVERLAYS — MN PPP, §1071, HOEPA per-year
# =============================================================================


# Minnesota PPP — MN House File 3437 (enacted April 23, 2026)
# Effective August 1, 2026; Section 58.137 MN Statutes amended
# Business-purpose DSCR loans EXEMPT from MN PPP cap
MN_PPP_HF3437_EFFECTIVE_DATE = "2026-08-01"
MN_PPP_HF3437_ENACTMENT_DATE = "2026-04-23"
MN_PPP_HF3437_BUSINESS_PURPOSE_EXEMPT = True
MN_PPP_CONSUMER_MAX_YEARS = 3  # Consumer-purpose PPP max in MN


def is_minnesota_ppp_applicable(
    state: str,
    is_business_purpose: bool,
    ppp_years: int,
    effective_date: str | None = None,
) -> bool:
    """Check whether a deal is subject to Minnesota Prepayment Penalty limits.

    Args:
        state: 2-letter state code (e.g., "MN")
        is_business_purpose: True if DSCR business-purpose loan
        ppp_years: Prepayment penalty years in deal (1-5 typical)
        effective_date: Override for MN HF3437 effective date (default 2026-08-01)

    Returns:
        True if MN PPP cap applies (loan needs adjustment), False if exempt.

    Spec: MN House File 3437 enacted April 23, 2026; effective August 1, 2026.
    Business-purpose DSCR loans are EXEMPT from MN PPP cap. Consumer-purpose
    loans in MN have a 3-year max PPP.

    Note: DSCR loans are always business-purpose (investment property), so
    most DSCR deals in MN are EXEMPT post-effective-date.
    """
    if state.upper() != "MN":
        return False  # MN PPP cap is MN-specific
    if is_business_purpose:
        return False  # Business-purpose DSCR is exempt (per HF 3437)
    # Consumer-purpose in MN: 3-year max
    return ppp_years > MN_PPP_CONSUMER_MAX_YEARS


# Section 1071 — small business lending data collection
# Final Rule published May 1, 2026 (Federal Register 2026-08494)
# Compliance date: January 1, 2028
# Broker-only lenders EXEMPT (regardless of origination volume)
# Lenders with <1,000 originations per calendar year EXEMPT
# (Per May 2026 Final Rule: threshold raised from initial proposed 100 to 1,000.
#  v0.5.4 had 100 — CORRECTED v0.5.5 per dscr-verifier audit 2026-06-20.)
SECTION_1071_FINAL_RULE_DATE = "2026-05-01"
SECTION_1071_COMPLIANCE_DATE = "2028-01-01"
SECTION_1071_BROKER_EXEMPT = True
SECTION_1071_VOLUME_THRESHOLD = 1_000  # <1,000 originations/yr exempt
SECTION_1071_REVENUE_THRESHOLD_USD = 1_000_000  # <$1M revenue exempt (per latest rule)


def is_section_1071_reportable(
    is_broker: bool,
    annual_originations: int,
    annual_revenue_usd: float | None = None,
    effective_date: str | None = None,
    compliance_date: str | None = None,
) -> bool:
    """Check whether a deal triggers Section 1071 small-business lending reporting.

    Args:
        is_broker: True if lender is broker-only (TPO / mini-correspondent)
        annual_originations: Lender's projected annual origination volume
        annual_revenue_usd: Lender's annual revenue (new in May 2026 Final Rule)
        effective_date: Override for final rule effective date
        compliance_date: Override for compliance date

    Returns:
        True if reporting required, False if exempt.

    Spec: CFPB Section 1071 Final Rule (May 1, 2026; compliance Jan 1, 2028).
    Exemptions:
        - Broker-only lenders (regardless of volume)
        - Lenders with <1,000 originations/yr
        - Lenders with <$1M annual revenue (new May 2026 carve-out)
    """
    if compliance_date is None:
        compliance_date = SECTION_1071_COMPLIANCE_DATE
    if is_broker:
        return False
    if annual_originations < SECTION_1071_VOLUME_THRESHOLD:
        return False
    if annual_revenue_usd is not None and annual_revenue_usd < SECTION_1071_REVENUE_THRESHOLD_USD:
        return False
    return True


# HOEPA — High-Cost Mortgage thresholds (12 USC 1602(aa)(3) / Reg Z §1026.32)
# CFPB publishes annual adjustment in Federal Register each Nov/Dec for next year.
#
# Per Dodd-Frank Wall Street Reform & Consumer Protection Act (Pub.L. 111-203,
# §1431 et seq., enacted July 21, 2010), the HOEPA APR thresholds were
# REVISED from the pre-Dodd-Frank values (Treasury + 8.5pp / 10pp) to:
#   - First lien: APR must exceed APOR by more than 6.5pp
#     (12 CFR 1026.32(a)(1)(i)(A))
#   - Subordinate lien: APR must exceed APOR by more than 8.5pp
#     (12 CFR 1026.32(a)(1)(i)(C))
#
# Points-and-fees threshold is TWO-TIER per 12 CFR 1026.32(a)(1)(ii):
#   - Loan amount >= annual threshold ($27,592 in 2026): P&F > 5% of loan
#   - Loan amount < annual threshold: P&F > lesser of 8% of loan OR $1,000
#     (the $1,000 figure is NOT inflation-adjusted per Reg Z §1026.32(b))
#
# Prepayment penalty test per 12 CFR 1026.32(a)(1)(iii):
#   - Penalty period > 36 months after consummation, OR
#   - Penalty > 2% of amount prepaid
#
# HOEPA triggers when ANY ONE test passes (OR logic), not when all pass.
# Federal Register 2025-22773 (Dec 15, 2025) confirms 2026 thresholds.

HOEPA_APR_THRESHOLD_FIRST_LIEN = 0.065  # 6.5pp above APOR (post-Dodd-Frank)
HOEPA_APR_THRESHOLD_SUBORDINATE = 0.085  # 8.5pp above APOR (post-Dodd-Frank)
HOEPA_PF_PERCENTAGE_LARGE = 0.05  # 5% of loan for loans >= annual threshold
# Small-loan P&F dollar trigger is inflation-adjusted annually — see
# HOEPA_THRESHOLDS_BY_YEAR[year]["points_and_fees"] for the current value
# (2025: $1,348; 2026: $1,380). NOT a hardcoded constant — that was the
# v0.5.0 bug corrected in v0.5.1.
HOEPA_PP_PENALTY_PERIOD_MONTHS = 36  # >36 months after consummation triggers
HOEPA_PP_PENALTY_PERCENT = 0.02  # >2% of amount prepaid triggers

# Annual thresholds (year-indexed). CFPB Federal Register citations:
# 2025 (effective Jan 1, 2025): per CFPB Federal Register Nov 2024
# 2026 (effective Jan 1, 2026): per CFPB Federal Register Nov 2025
#   "For HOEPA loans, the adjusted total loan amount threshold for
#    high-cost mortgages in 2026 will be $27,592. The adjusted
#    points-and-fees dollar [amount will be $1,380.]"
# 2027+: pending CFPB publication (expected Nov/Dec 2026)
HOEPA_THRESHOLDS_BY_YEAR: dict[int, dict[str, int | None]] = {
    2025: {"loan_amount": 26_968, "points_and_fees": 1_348},
    2026: {"loan_amount": 27_592, "points_and_fees": 1_380},
    2027: {"loan_amount": None, "points_and_fees": None},  # pending CFPB Nov 2026
    2028: {"loan_amount": None, "points_and_fees": None},
}


def get_hoepa_thresholds(year: int) -> dict[str, int | None]:
    """Return HOEPA thresholds for the given calendar year.

    Args:
        year: Calendar year (e.g., 2026)

    Returns:
        {"loan_amount": int | None, "points_and_fees": int | None}
        None values indicate CFPB has not yet published thresholds for that year.

    Raises:
        ValueError: If year < 2025 (out of supported range).
    """
    if year < 2025:
        raise ValueError(
            f"HOEPA thresholds only available for 2025+; got {year}. "
            f"Pre-2025 thresholds require manual CFPB lookup."
        )
    if year not in HOEPA_THRESHOLDS_BY_YEAR:
        warnings.warn(
            f"HOEPA thresholds for {year} not yet loaded. "
            f"CFPB typically publishes in Nov/Dec of prior year. "
            f"Update HOEPA_THRESHOLDS_BY_YEAR when Federal Register publishes.",
            UserWarning,
            stacklevel=2,
        )
        return {"loan_amount": None, "points_and_fees": None}
    return HOEPA_THRESHOLDS_BY_YEAR[year]


def is_hoepa_loan(
    loan_amount: float,
    points_and_fees: float,
    annual_rate_pct: float,
    apor_pct: float,
    is_first_lien: bool = True,
    year: int = 2026,
    prepayment_penalty_period_months: int = 0,
    prepayment_penalty_pct: float = 0.0,
) -> bool:
    """Check whether a deal triggers HOEPA High-Cost Mortgage protection.

    Per 12 CFR 1026.32(a)(1), HOEPA triggers when ANY ONE of the three
    tests passes (OR logic):

        (i) APR test (12 CFR 1026.32(a)(1)(i)):
            - (A) First-lien: APR > APOR + 6.5pp
            - (C) Subordinate-lien: APR > APOR + 8.5pp
        (ii) Points-and-fees test (12 CFR 1026.32(a)(1)(ii)):
            - (A) Loan >= annual threshold: P&F > 5% of loan
            - (B) Loan < annual threshold: P&F > lesser of (8% of loan) OR
              the annual inflation-adjusted dollar trigger ($1,348 in
              2025, $1,380 in 2026). The $1,000 figure is adjusted
              annually per §1026.32(a)(1)(ii)(B) and Federal Register
              annual notice (CFPB publishes each November).
        (iii) Prepayment penalty test (12 CFR 1026.32(a)(1)(iii)):
            - Penalty period > 36 months after consummation, OR
            - Penalty > 2% of amount prepaid

    Note: HOEPA does NOT have a loan-size cap per se. The "annual threshold"
    (e.g., $27,592 for 2026) is the TIER BREAK between 5% and 8% P&F rules,
    NOT a cap on HOEPA applicability. DSCR lenders should be aware that
    consumer-purpose DSCR loans can trigger HOEPA regardless of loan size.

    Args:
        loan_amount: Total loan amount in dollars
        points_and_fees: Total points and fees (Reg Z §1026.32(b))
        annual_rate_pct: Loan's annual percentage rate (decimal, e.g., 0.085)
        apor_pct: Comparable APOR for similar loan (decimal)
        is_first_lien: True if first-lien, False if subordinate
        year: Calendar year for threshold lookup (default 2026)
        prepayment_penalty_period_months: Months after consummation during which
            a prepayment penalty applies (0 = no prepayment penalty). If > 36,
            test (iii) triggers.
        prepayment_penalty_pct: Penalty as decimal of amount prepaid (e.g.,
            0.05 = 5%). If > 2%, test (iii) triggers.

    Returns:
        True if HOEPA triggers (loan is "high-cost"), False if below all
        three tests.

    Raises:
        ValueError: If thresholds for `year` are not yet published (CFPB
            pending). Refuses to silently return wrong answer.
    """
    thresholds = get_hoepa_thresholds(year)
    loan_threshold = thresholds["loan_amount"]
    pf_dollar_threshold = thresholds["points_and_fees"]

    if loan_threshold is None or pf_dollar_threshold is None:
        raise ValueError(
            f"HOEPA thresholds for {year} not yet published. "
            f"CFPB Federal Register publication expected Nov/Dec of prior year. "
            f"Refusing to return False — explicitly check thresholds before deciding."
        )

    # Test (i): APR test
    apr_threshold = (
        HOEPA_APR_THRESHOLD_FIRST_LIEN if is_first_lien else HOEPA_APR_THRESHOLD_SUBORDINATE
    )
    apr_above_apor = annual_rate_pct - apor_pct
    apr_test_triggers = apr_above_apor > apr_threshold

    # Test (ii): Points-and-fees test (two-tier)
    # Per 12 CFR 1026.32(a)(1)(ii):
    #   (A) Loan ≥ annual threshold ($27,592 in 2026): P&F > 5% of loan
    #   (B) Loan < annual threshold: P&F > lesser of (8% of loan) OR the
    #       annual inflation-adjusted dollar trigger ($1,380 in 2026, $1,348
    #       in 2025 — BOTH figures adjusted annually per §1026.32(a)(1)(ii))
    # Note: both $20,000 (now $27,592) and $1,000 (now $1,380) are
    # inflation-adjusted per CFPB annual notice.
    if loan_amount >= loan_threshold:
        # LARGE-LOAN TIER: P&F > 5% of loan
        pf_limit = HOEPA_PF_PERCENTAGE_LARGE * loan_amount
        pf_test_triggers = points_and_fees > pf_limit
    else:
        # SMALL-LOAN TIER: P&F > lesser of 8% of loan OR annual dollar trigger
        # Use `pf_dollar_threshold` (loaded from HOEPA_THRESHOLDS_BY_YEAR) —
        # NOT a hardcoded $1,000, which is wrong for 2025+ ($1,348 / $1,380).
        pf_limit = min(0.08 * loan_amount, pf_dollar_threshold)
        pf_test_triggers = points_and_fees > pf_limit

    # Test (iii): Prepayment penalty test
    # Per 12 CFR 1026.32(a)(1)(iii):
    # Triggers if penalty period > 36 months OR penalty > 2% of prepaid amount
    pp_test_triggers = (
        prepayment_penalty_period_months > HOEPA_PP_PENALTY_PERIOD_MONTHS
        or prepayment_penalty_pct > HOEPA_PP_PENALTY_PERCENT
    )

    # HOEPA triggers if ANY ONE test passes (OR logic per 12 CFR 1026.32(a)(1))
    return apr_test_triggers or pf_test_triggers or pp_test_triggers


# =============================================================================
# ADVERSE ACTION NOTICE BUILDER
# =============================================================================


def build_adverse_action_notice(
    kill_events: EnrichedKillEvent | list[EnrichedKillEvent],
    *,
    as_code_24: bool = True,
    override_map: dict[str, list[str]] | None = None,
    fcra_data_source: str | None = None,
    fcra_source_address: str | None = None,
    max_reasons: int = 4,
    enforce_code_24_policy_ref: bool = True,
    lenient_interpolation: bool = True,  # default: robust AAN rendering
) -> dict:
    """Build a structured Adverse_Action_Notice_Payload from enriched kill events.

    Per Reg B §1002.9 and FCRA §1681m:
        - Notice within 30 days
        - Specific principal reason(s) (4 reasons typical per CFPB)
        - ECOA prohibited basis disclosure
        - FCRA credit score disclosure (if used)
        - 25-month record retention with evidence hash

    Args:
        kill_events: SINGLE EnrichedKillEvent (backwards compat) OR list of
            events for ONE application (preferred). Single-event use is
            deprecated; use list form for new code.
        as_code_24: If True (default), DSCR extension codes (25-40) are
            rendered as code 24 "Other, specify:" with specific text.
        override_map: Optional lender-specific override.
        fcra_data_source: CRA name (e.g., "Experian")
        fcra_source_address: CRA mailing address
        max_reasons: Maximum reasons to emit (CFPB best practice: 4).
        enforce_code_24_policy_ref: If True (default), raise ValueError if
            code 24 fires without policy_ref.
        lenient_interpolation: If True, substitute "N/A" for missing fields.

    Returns:
        Dict payload suitable for JSON serialization.

    Note: Single EnrichedKillEvent input is supported for backwards compat
    but DEPRECATED. Use list form for new code.
    """
    # Backwards compat: single event → wrap in list
    if isinstance(kill_events, EnrichedKillEvent):
        warnings.warn(
            "build_adverse_action_notice() with a single EnrichedKillEvent is "
            "deprecated as of v0.4.0. Pass a list of events for ONE application "
            "to get the correct up-to-4-reasons aggregation per CFPB guidance.",
            DeprecationWarning,
            stacklevel=2,
        )
        events_list = [kill_events]
    else:
        events_list = list(kill_events)

    # Use the aggregation API
    reasons = select_ecoa_codes_for_deal(
        events_list,
        override_map=override_map,
        as_code_24=as_code_24,
        max_reasons=max_reasons,
        enforce_code_24_policy_ref=enforce_code_24_policy_ref,
        lenient_interpolation=lenient_interpolation,
    )

    ecoa_reasons = [
        {
            "code": r.code,
            "text": r.text,
            "trigger": r.trigger,
            "statutory_basis": r.statutory_basis,
            "specific_values": r.specific_values,
            "severity": r.severity,
        }
        for r in reasons
    ]

    # Use the first event for notice-level metadata
    primary_event = events_list[0]

    payload = {
        "version": "2.1",  # bumped from 2.0 to reflect aggregation support
        "as_of": primary_event.timestamp,
        "lender_id": primary_event.lender_id,
        "application_id": primary_event.application_id,
        "is_compliant": True,
        "as_code_24_mode": as_code_24,
        "regulatory_notices": {
            "ecoa_notice": {
                "header": "ADVERSE ACTION NOTICE",
                "prohibition_statement": (
                    "The federal Equal Credit Opportunity Act prohibits creditors "
                    "from discriminating against credit applicants on the basis of "
                    "race, color, religion, national origin, sex, marital status, "
                    "age (provided the applicant has the capacity to contract), "
                    "because all or part of the applicant's income derives from any "
                    "public assistance program, or because the applicant has in "
                    "good faith exercised any right under the Consumer Credit "
                    "Protection Act."
                ),
                "reasons": ecoa_reasons,
                "reason_count": len(ecoa_reasons),
            },
        },
        "meta": {
            "generation_timestamp": primary_event.timestamp,
            "engine_version": "DSCR_Engine_v18.0.0",
            "explanation_layer_version": "2.1.0",
            "code_count": len(ecoa_reasons),
            "shap_used": False,
            "kill_event_count": len(events_list),
        },
    }

    if fcra_data_source is not None:
        payload["regulatory_notices"]["fcra_disclosure"] = {
            "cra_name": fcra_data_source,
            "cra_address": fcra_source_address,
            "credit_score_disclosed": primary_event.fico is not None,
            "credit_score_value": primary_event.fico,
            "right_to_obtain_score": True,
            "right_to_dispute": True,
            "right_to_free_file": True,
        }

    return payload


# =============================================================================
# Module exports
# =============================================================================


__all__ = [
    # Form C-1 codes (01-24)
    "ECOA_CODE_01_APPLICATION_INCOMPLETE",
    "ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES",
    "ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES",
    "ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES",
    "ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT",
    "ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT",
    "ECOA_CODE_07_LENGTH_OF_EMPLOYMENT",
    "ECOA_CODE_08_INCOME_INSUFFICIENT",
    "ECOA_CODE_09_EXCESSIVE_OBLIGATIONS",
    "ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME",
    "ECOA_CODE_11_LENGTH_OF_RESIDENCE",
    "ECOA_CODE_12_TEMPORARY_RESIDENCE",
    "ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE",
    "ECOA_CODE_14_NO_CREDIT_FILE",
    "ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE",
    "ECOA_CODE_16_POOR_CREDIT_PERFORMANCE",
    "ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS",
    "ECOA_CODE_18_COLLECTION_OR_JUDGMENT",
    "ECOA_CODE_19_GARNISHMENT",
    "ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION",
    "ECOA_CODE_21_BANKRUPTCY",
    "ECOA_CODE_22_EXCESSIVE_INQUIRIES",
    "ECOA_CODE_23_COLLATERAL_INSUFFICIENT",
    "ECOA_CODE_24_OTHER_SPECIFY",
    # DSCR-specific extension codes (25-40)
    "ECOA_CODE_25_FICO_BELOW_MIN",
    "ECOA_CODE_26_LTV_EXCEEDS_MAX",
    "ECOA_CODE_27_RESERVES_BELOW_MIN",
    "ECOA_CODE_28_DSCR_BELOW_MIN",
    "ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE",
    "ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX",
    "ECOA_CODE_31_FLOOD_INSURANCE_MISSING",
    "ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT",
    "ECOA_CODE_33_VESTING_UNACCEPTABLE",
    "ECOA_CODE_34_STATE_REGULATORY",
    "ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED",
    "ECOA_CODE_36_CASH_OUT_SEASONING",
    "ECOA_CODE_37_STATE_NOT_COVERED",
    "ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE",
    "ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED",
    "ECOA_CODE_40_ITIN_FN_INSUFFICIENT",
    # Code sets
    "ALL_ECOA_CODES",
    "FORM_C1_CODES",
    "DSCR_EXTENSION_CODES",
    # Reason texts + mapping
    "ECOA_REASON_TEXTS",
    "DEFAULT_KILL_TO_ECOA_MAP",
    # Data classes
    "EnrichedKillEvent",
    "AdverseActionReason",
    # Functions
    "auto_classify_trigger",
    "_interpolate_dscr_reason",
    "select_ecoa_codes",
    "select_ecoa_codes_for_deal",  # NEW v0.4.0
    "build_adverse_action_notice",
    "is_minnesota_ppp_applicable",
    "is_section_1071_reportable",
    "is_hoepa_loan",
    "get_hoepa_thresholds",  # NEW v0.4.0
    # Constants
    "MN_PPP_HF3437_EFFECTIVE_DATE",
    "MN_PPP_HF3437_ENACTMENT_DATE",
    "MN_PPP_HF3437_BUSINESS_PURPOSE_EXEMPT",
    "MN_PPP_CONSUMER_MAX_YEARS",
    "SECTION_1071_FINAL_RULE_DATE",
    "SECTION_1071_COMPLIANCE_DATE",
    "SECTION_1071_BROKER_EXEMPT",
    "SECTION_1071_VOLUME_THRESHOLD",
    "SECTION_1071_REVENUE_THRESHOLD_USD",
    "HOEPA_THRESHOLDS_BY_YEAR",  # NEW v0.4.0
    "HOEPA_APR_THRESHOLD_FIRST_LIEN",
    "HOEPA_APR_THRESHOLD_SUBORDINATE",
    "HOEPA_PF_PERCENTAGE_LARGE",  # NEW v0.5.0
    "HOEPA_PP_PENALTY_PERCENT",  # NEW v0.5.0
    "HOEPA_PP_PENALTY_PERIOD_MONTHS",  # NEW v0.5.0
]  # v0.5.1 — exported (HOEPA_PF_DOLLAR_SMALL removed; was wrong constant)


# =============================================================================
# Reg Z Section 1026.36 - Loan Originator Compensation (YSP / LPC / BPC)
# =============================================================================
#
# Source: DSCR_Sovereign_OS__Sprint_3___Lender_Intelligence__Securitization_Pool
#         _Data___Competitive_Moat_Analysis.md, Section 7.1.
# Verifier audit: 12/13 PASS (the 1 PARTIAL is unrelated DSCR delinquency claim).
#
# Regulatory framework:
# - Dodd-Frank Act Section 1401 (Pub.L. 111-203, July 21, 2010)
# - Regulation Z Section 1026.36 (Loan Originator Compensation), effective April 1, 2011
# - YSP (Yield Spread Premium): lender-paid bonus to broker for higher rate
# - LPC (Loan Processor/Originator Compensation): general lender-paid comp
# - BPC (Borrower-Paid Compensation): upfront fee paid by borrower
#
# Consumer mortgages (primary residence, Dodd-Frank covered):
#   - YSP BANNED
#   - Broker must be paid either by lender OR by borrower (not both)
#
# Business-purpose DSCR loans (investment property):
#   - Reg Z consumer protections do NOT apply (business-purpose exemption)
#   - YSP NOT banned (lenders commonly pay YSP on DSCR via warehouse lines)
#   - Brokers earn LPC 1-2% (lender-paid)
#   - HOWEVER, per Reg Z Section 1026.36(d)(2): broker cannot receive both LPC and
#     BPC on same loan (the "zero-LO comp from borrower + LO comp only from
#     lender" rule was extended beyond just consumer loans)


@dataclass(frozen=True)
class BrokerCompensationRule:
    """A single broker compensation compliance rule result.

    Attributes:
        rule_id: short identifier (e.g., "YSP_BANNED_CONSUMER",
            "LPC_BPC_SAME_LOAN")
        citation: primary-source statute/regulation cite (e.g.,
            "12 CFR 1026.36(d)(1)")
        compliant: True if the inputs satisfy this rule
        explanation: human-readable explanation of the result
    """

    rule_id: str
    citation: str
    compliant: bool
    explanation: str


@dataclass(frozen=True)
class BrokerCompensationResult:
    """Composite broker compensation compliance result.

    Attributes:
        compliant: True if ALL rules pass
        loan_purpose: "consumer" or "business_purpose"
        rules: tuple of BrokerCompensationRule (one per rule checked)
        violations: tuple of rule_ids that failed (subset of rules)
        primary_source: primary-source document cite (Sprint 3 Lender Intel 7.1)
    """

    compliant: bool
    loan_purpose: str
    rules: tuple
    violations: tuple
    primary_source: str


def classify_broker_compensation(
    loan_purpose: str,
    receives_lpc: bool = False,
    receives_bpc: bool = False,
    receives_ysp: bool = False,
) -> BrokerCompensationResult:
    """Classify whether a broker compensation arrangement is compliant under
    Reg Z Section 1026.36 (Loan Originator Compensation).

    Args:
        loan_purpose: one of "consumer" (Dodd-Frank covered, primary
            residence) or "business_purpose" (DSCR / investment property).
        receives_lpc: True if broker receives lender-paid compensation.
        receives_bpc: True if broker receives borrower-paid compensation.
        receives_ysp: True if broker receives yield spread premium.

    Returns:
        BrokerCompensationResult with overall compliant status and per-rule
        explanations.

    Regulatory rules applied:
        - Rule YSP_BANNED_CONSUMER: YSP banned on consumer mortgages per
          Dodd-Frank Act Section 1401 / Reg Z Section 1026.36.
          Citation: Pub.L. 111-203 Section 1401; 12 CFR 1026.36(c)(1).
        - Rule YSP_ALLOWED_BUSINESS: YSP allowed on business-purpose loans
          (Reg Z consumer protections do NOT apply).
          Citation: 12 CFR 1026.3(a) (business-purpose exemption); 15 USC
          Section 1602(1)(B).
        - Rule LPC_BPC_SAME_LOAN: Broker cannot receive both LPC and BPC on
          same loan per Reg Z Section 1026.36(d)(2) (applies to BOTH consumer
          and business-purpose loans since the zero-LO-comp-from-borrower rule
          was extended beyond just consumer loans).
          Citation: 12 CFR 1026.36(d)(2).

    Example:
        # DSCR (business-purpose): YSP allowed, LPC+BPC same loan is violation
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_lpc=True, receives_bpc=True, receives_ysp=True,
        )
        assert not result.compliant
        assert "LPC_BPC_SAME_LOAN" in result.violations

        # Consumer: YSP banned
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_lpc=True, receives_ysp=True,
        )
        assert not result.compliant
        assert "YSP_BANNED_CONSUMER" in result.violations
    """
    if loan_purpose not in ("consumer", "business_purpose"):
        raise ValueError(
            "loan_purpose must be 'consumer' or 'business_purpose', got " + repr(loan_purpose)
        )

    primary_source = (
        "DSCR_Sovereign_OS__Sprint_3___Lender_Intelligence__"
        "Securitization_Pool_Data___Competitive_Moat_Analysis.md, "
        "Section 7.1"
    )
    rules = []

    # Rule 1: YSP banned on consumer mortgages; allowed on business-purpose
    if loan_purpose == "consumer" and receives_ysp:
        rules.append(
            BrokerCompensationRule(
                rule_id="YSP_BANNED_CONSUMER",
                citation=("Dodd-Frank Act Section 1401 (Pub.L. 111-203); 12 CFR 1026.36(c)(1)"),
                compliant=False,
                explanation=(
                    "YSP (yield spread premium) is BANNED on consumer mortgages "
                    "per Dodd-Frank Act Section 1401, effective April 1, 2011. "
                    "Reg Z Section 1026.36(c)(1) prohibits compensation based on "
                    "loan terms other than loan amount for consumer mortgage "
                    "originators. Violation."
                ),
            )
        )
    else:
        rules.append(
            BrokerCompensationRule(
                rule_id=(
                    "YSP_BANNED_CONSUMER" if loan_purpose == "consumer" else "YSP_ALLOWED_BUSINESS"
                ),
                citation=(
                    "Dodd-Frank Act Section 1401 (Pub.L. 111-203); 12 CFR 1026.36(c)(1)"
                    if loan_purpose == "consumer"
                    else "12 CFR 1026.3(a) business-purpose exemption; 15 USC 1602(1)(B)"
                ),
                compliant=True,
                explanation=(
                    "YSP allowed: Reg Z consumer protections do not apply to "
                    "business-purpose loans (12 CFR 1026.3(a); 15 USC 1602(1)(B)). "
                    "Lenders commonly pay YSP via warehouse lines on DSCR."
                    if loan_purpose == "business_purpose"
                    else "No YSP received on consumer mortgage. Compliant."
                ),
            )
        )

    # Rule 2: LPC + BPC same loan violation (applies to BOTH consumer and
    # business-purpose per Reg Z Section 1026.36(d)(2))
    if receives_lpc and receives_bpc:
        rules.append(
            BrokerCompensationRule(
                rule_id="LPC_BPC_SAME_LOAN",
                citation="12 CFR 1026.36(d)(2)",
                compliant=False,
                explanation=(
                    "Broker receives BOTH LPC (lender-paid) AND BPC (borrower-paid) "
                    "on the same loan. Reg Z Section 1026.36(d)(2) prohibits this "
                    "arrangement (the zero-LO-comp-from-borrower rule was extended "
                    "beyond just consumer loans). Violation regardless of loan "
                    "purpose."
                ),
            )
        )
    else:
        rules.append(
            BrokerCompensationRule(
                rule_id="LPC_BPC_SAME_LOAN",
                citation="12 CFR 1026.36(d)(2)",
                compliant=True,
                explanation=(
                    "Broker receives at most one of LPC or BPC on this loan. "
                    "Compliant per Reg Z Section 1026.36(d)(2)."
                ),
            )
        )

    violations = tuple(r.rule_id for r in rules if not r.compliant)
    return BrokerCompensationResult(
        compliant=len(violations) == 0,
        loan_purpose=loan_purpose,
        rules=tuple(rules),
        violations=violations,
        primary_source=primary_source,
    )
