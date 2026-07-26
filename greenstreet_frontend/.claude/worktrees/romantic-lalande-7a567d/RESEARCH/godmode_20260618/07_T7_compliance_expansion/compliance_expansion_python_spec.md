---
type: research
slice: 1
status: drafted
confidence: 3
title: compliance.py Expansion — Python Implementation Spec (Slice 1 → Slice 2)
summary: "**Target:** `DSCR_SOVEREIGN_OS\\packages\\dscr-core\\src\\dscr_core\\compliance.py`"
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
  - slice/3
  - topic/condo
  - topic/condotel
  - topic/str
tags:
  - ml/xgboost
  - topic/adverse-action
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/foreclosure
  - topic/insurance
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/tax
  - topic/usury
  - type/audit
source: RESEARCH/godmode_20260618/07_T7_compliance_expansion/compliance_expansion_python_spec.md
vaulted_at: 2026-06-20
---
# compliance.py Expansion — Python Implementation Spec (Slice 1 → Slice 2)

**Date:** 2026-06-18
**Target:** `DSCR_SOVEREIGN_OS\packages\dscr-core\src\dscr_core\compliance.py`
**Status:** Implementation spec — ready for Slice 2 P0-4 build
**Author:** T7 Compliance Expansion (10x deep-research)

---

## 0. Goal

Expand the Slice 1 `compliance.py` module from **5 codes** (19, 21, 26, 27, 28) to **40 codes** (24 verbatim Form C-1 + 16 DSCR-specific extensions), with:

1. **Naming collision resolution** (5 renames)
2. **CFPB Circular 2022-03 specificity** for AI/ML explainability
3. **DSCR-specific reason codes** (DSCR, LTV, reserves, FICO, insurance, vesting, state, etc.)
4. **Lender override maps** (5 lenders: Newfi, Pennymac, Griffin, Angel Oak, Deephaven)
5. **SHAP-to-reason integration** (TOPIC 13 + TOPIC 18)
6. **Code 24 "Other" approved reason list** enforcement
7. **Backward compatibility** with Slice 1 (deprecation warnings)

---

## 1. Final Module Structure

```python
# Slice 2 compliance.py

# Section 1: Form C-1 Verbatim Codes (01-23)
ECOA_CODES_FORM_C1 = {
    "01": "Credit application incomplete",
    "02": "Insufficient number of credit references provided",
    "03": "Unacceptable type of credit references provided",
    "04": "Unable to verify credit references",
    "05": "Temporary or irregular employment",
    "06": "Unable to verify employment",
    "07": "Length of employment",
    "08": "Income insufficient for amount of credit requested",
    "09": "Excessive obligations in relation to income",
    "10": "Unable to verify income",
    "11": "Length of residence",
    "12": "Temporary residence",
    "13": "Unable to verify residence",
    "14": "No credit file",
    "15": "Limited credit experience",
    "16": "Poor credit performance with us",
    "17": "Delinquent past or present credit obligations with others",
    "18": "Collection action or judgment",
    "19": "Garnishment or attachment",
    "20": "Foreclosure or repossession",
    "21": "Bankruptcy",
    "22": "Number of recent inquiries on credit bureau report",
    "23": "Value or type of collateral not sufficient",
    "24": "Other, specify: ___.",
}

# Section 2: DSCR-Specific Extension Codes (25-40)
ECOA_CODES_DSCR_SPECIFIC = {
    "25": "Credit score (FICO) of {actual} is below our minimum requirement of {minimum} for the {program} program",
    "26": "Loan-to-value (LTV) ratio of {actual_pct}% exceeds our maximum of {max_pct}% for this property type and program",
    "27": "Reserves of {actual_months} months PITIA are below our minimum requirement of {min_months} months",
    "28": "The Debt Service Coverage Ratio (DSCR) for the subject property is {actual_dscr}, which is below our minimum requirement of {min_dscr} for the {program} program",
    "29": "The type of property you selected ({property_type}) is not acceptable for our {program} program",
    "30": "The proposed loan amount of ${loan_amount} exceeds the maximum loan amount of ${max_amount} for our {program} program",
    "31": "Flood insurance is required for the subject property (SFHA Zone {zone}), but a flood insurance binder is not in place",
    "32": "The property insurance binder for the subject property does not meet our requirements ({reason})",
    "33": "The vesting type/entity ({entity_type}) is not acceptable for our {program} program",
    "34": "The proposed loan does not meet {state} regulatory requirements, specifically: {reason}",
    "35": "The proposed prepayment penalty of {years} years exceeds the maximum of {max_years} years permitted by {state} law",
    "36": "The property was purchased {months_ago} months ago, which does not meet our minimum cash-out seasoning requirement of {min_months} months",
    "37": "The subject property is located in {state}, which is not in our approved coverage area for {program} loans",
    "38": "The loan purpose of {purpose} is not eligible for our {program} program",
    "39": "The title commitment contains the following exception that must be resolved: {exception}",
    "40": "The {itin_fn} documentation provided is not sufficient for our {program} program ({reason})",
}

# Section 3: Combined canonical text dictionary
ECOA_REASON_TEXTS = {**ECOA_CODES_FORM_C1, **ECOA_CODES_DSCR_SPECIFIC}

# Section 4: Backward-compat aliases (Slice 1)
# DEPRECATED — will be removed in Slice 3
ECOA_CODE_19_INCOME_INSUFFICIENT = "08"  # use code 08
ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH = "09"  # use code 09
ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX = "30"  # use code 30
ECOA_CODE_27_COLLATERAL_INSUFFICIENT = "23"  # use code 23
ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "29"  # use code 29
```

---

## 2. DSCR Kill Trigger → ECOA Code Mapping

```python
DEFAULT_KILL_TO_ECOA_MAP: dict[str, list[str]] = {
    # === Form C-1 verbatim (01-23) ===
    # Code 01
    "INCOMPLETE_APPLICATION_15D": ["01"],
    "MISSING_RENT_DOCS": ["01"],
    "MISSING_ENTITY_DOCS": ["01"],
    "MISSING_INSURANCE_BINDER": ["01"],
    # Code 02
    "INSUFFICIENT_CREDIT_REFERENCES": ["02"],
    "THIN_FILE_FOREIGN_NATIONAL": ["02"],
    "THIN_FILE_ITIN": ["02"],
    # Code 03
    "UNACCEPTABLE_CREDIT_REFERENCE_TYPE": ["03"],
    "NON_US_BANK_REFERENCE": ["03"],
    "FAMILY_REFERENCE": ["03"],
    # Code 04
    "UNVERIFIABLE_CREDIT_REFERENCES": ["04"],
    "REFERENCE_DISCONNECTED": ["04"],
    "REFERENCE_NONRESPONSE": ["04"],
    # Code 05
    "EMPLOYMENT_HISTORY_INSUFFICIENT": ["05"],
    "GIG_WORKER_DSCR_BANK": ["05"],
    "SEASONAL_INCOME_DSCR": ["05"],
    # Code 06
    "EMPLOYMENT_UNVERIFIABLE": ["06"],
    "TWN_NO_RECORD": ["06"],
    "SELF_EMPLOYED_NO_CPA": ["06"],
    # Code 07
    "LENGTH_OF_EMPLOYMENT_INSUFFICIENT": ["07"],
    "W2_NEW_JOB": ["07"],
    "SELF_EMPLOYED_UNDER_24MO": ["07"],
    # Code 08 (was Slice 1 code 19)
    "DTI_OVER_50": ["08"],
    "INCOME_INSUFFICIENT_FOR_LOAN": ["08"],
    # Code 09 (was Slice 1 code 21)
    "EXISTING_DTI_OVER_50": ["09"],
    "MULTIPLE_FINANCED_PROPERTIES": ["09"],
    # Code 10
    "RENT_INCOME_UNVERIFIABLE": ["10"],
    "STR_HISTORY_INSUFFICIENT": ["10"],
    "LTR_NO_LEASE": ["10"],
    "AIRDNA_UNAVAILABLE": ["10"],
    "FOREIGN_INCOME_UNVERIFIABLE": ["10"],
    # Code 11
    "LENGTH_OF_RESIDENCE_INSUFFICIENT": ["11"],
    # Code 12
    "TEMPORARY_RESIDENCE": ["12"],
    "PG_NO_PERMANENT_RESIDENCE": ["12"],
    # Code 13
    "RESIDENCE_UNVERIFIABLE": ["13"],
    "PO_BOX_ONLY": ["13"],
    "NEW_CONSTRUCTION_NO_USPS": ["13"],
    # Code 14
    "NO_CREDIT_FILE": ["14"],
    "TRIMERGE_NO_RECORD": ["14"],
    "FN_NO_US_CREDIT": ["14"],
    # Code 15
    "LIMITED_CREDIT_EXPERIENCE": ["15"],
    "INSUFFICIENT_TRADELINES": ["15"],
    "THIN_FILE_2_TRADELINES": ["15"],
    # Code 16
    "PRIOR_LOAN_LATE_WITH_US": ["16"],
    "PRIOR_LOAN_CHARGEOFF_US": ["16"],
    # Code 17
    "DELINQUENT_CREDIT_OBLIGATIONS": ["17"],
    "2X30_LAST_12": ["17"],
    "1X60_LAST_24": ["17"],
    "CHARGE_OFF_REVOLVING": ["17"],
    # Code 18
    "COLLECTION_OR_JUDGMENT": ["18"],
    "OPEN_COLLECTION_OVER_LIMIT": ["18"],
    "UNPAID_JUDGMENT": ["18"],
    "TAX_LIEN_UNPAID": ["18"],
    # Code 19 (was Slice 1 code 19 — renamed to 19 Garnishment per Form C-1)
    "ACTIVE_GARNISHMENT": ["19"],
    "BANK_ATTACHMENT": ["19"],
    "WAGE_GARNISHMENT": ["19"],
    "TAX_LEVY": ["19"],
    # Code 20
    "FORECLOSURE_INSUFFICIENT_SEASONING": ["20"],
    "REPO_INSUFFICIENT_SEASONING": ["20"],
    # Code 21 (was Slice 1 code 21 — renamed to 21 Bankruptcy per Form C-1)
    "BK_DISCHARGE": ["21"],
    "BK_CH7_UNDER_36MO": ["21"],
    "BK_CH13_UNDER_36MO": ["21"],
    "BK_MULTIPLE_FILINGS": ["21"],
    # Code 22
    "EXCESSIVE_INQUIRIES": ["22"],
    "INQUIRIES_OVER_6_IN_6MO": ["22"],
    # Code 23 (was Slice 1 code 27)
    "LTV_OVER_MAX": ["23"],
    "PROPERTY_TYPE_UNACCEPTABLE": ["23"],
    "APPRAISAL_LOW": ["23"],
    "PROPERTY_CONDITION_C5_C6": ["23"],
    "DECLINING_MARKET_LTV": ["23"],

    # === DSCR-Specific (25-40) ===
    # Code 25
    "FICO_BELOW_LENDER_MIN": ["25"],
    "FICO_BELOW_620": ["25"],
    "FICO_BELOW_660": ["25"],
    "FICO_BELOW_680": ["25"],
    "FICO_BELOW_700": ["25"],
    # Code 26
    "LTV_OVER_90": ["26"],
    "LTV_80_TO_90": ["26"],
    "LTV_OVER_75_STR": ["26"],
    "LTV_OVER_70_DECLINING": ["26"],
    # Code 27
    "INSUFFICIENT_RESERVES": ["27"],
    "RESERVES_UNDER_3MO": ["27"],
    "RESERVES_UNDER_6MO_DSCR_LOW": ["27"],
    # Code 28
    "DSCR_BELOW_MINIMUM": ["28"],
    "DSCR_LOW_RENT": ["28"],
    "DSCR_GENERIC": ["28"],
    # Code 29 (was Slice 1 code 28)
    "CONDOTEL": ["29"],
    "5_PLUS_UNIT": ["29"],
    "NON_WARRANTABLE_CONDO": ["29"],
    "MIXED_USE": ["29"],
    # Code 30 (was Slice 1 code 26)
    "LOAN_AMOUNT_OVER_LENDER_MAX": ["30"],
    "LOAN_AMOUNT_BELOW_MIN": ["30"],
    # Code 31
    "FLOOD_INSURANCE_MISSING": ["31"],
    "FLOOD_INSURANCE_INSUFFICIENT": ["31"],
    "FLOOD_NOT_WYO": ["31"],
    "PENDING_FIRM_REMAP": ["31"],
    # Code 32
    "PROPERTY_INSURANCE_MISSING": ["32"],
    "PROPERTY_INSURANCE_INSUFFICIENT": ["32"],
    "CARRIER_NOT_APPROVED": ["32"],
    "WIND_HAIL_EXCLUDED": ["32"],
    # Code 33
    "VESTING_UNSUPPORTED": ["33"],
    "REVOCABLE_TRUST_NOT_ALLOWED": ["33"],
    "FOREIGN_ENTITY_NOT_FN": ["33"],
    "ENTITY_NOT_GOOD_STANDING": ["33"],
    "INDIVIDUAL_VESTING": ["33"],
    # Code 34
    "NJ_LLC_SPLIT_VIOLATION": ["34"],
    "NY_DSCR_BELOW_120": ["34"],
    "MN_PPP_RESTRICTED": ["34"],
    "TX_USURY_CAP_EXCEEDED": ["34"],
    # Code 35
    "PREPAYMENT_PENALTY_RESTRICTED": ["35"],
    "NY_PPP_OVER_3YR": ["35"],
    "MN_PPP_OVER_3YR": ["35"],
    # Code 36
    "CASH_OUT_SEASONING": ["36"],
    "BRRRR_SEASONING": ["36"],
    # Code 37
    "STATE_NOT_LICENSED": ["37"],
    "GEO_RESTRICTION": ["37"],
    "LENDER_NOT_LICENSED": ["37"],
    # Code 38
    "LOAN_PURPOSE_NOT_ELIGIBLE": ["38"],
    "CONSTRUCTION_TO_PERM": ["38"],
    "ASSUMPTION_NOT_ALLOWED": ["38"],
    # Code 39
    "TITLE_EXCEPTION_UNRESOLVED": ["39"],
    "UNPERMITTED_ADDITION": ["39"],
    "EASEMENT_ENCROACHMENT": ["39"],
    "OUTSTANDING_LIEN": ["39"],
    "PENDING_LITIGATION": ["39"],
    # Code 40
    "ITIN_INSUFFICIENT": ["40"],
    "FN_VISA_NOT_ACCEPTED": ["40"],
    "FN_NO_US_BANK": ["40"],
    "PASSPORT_EXPIRING_SOON": ["40"],
}
```

---

## 3. EnrichedKillEvent — Slice 2 Additions

The existing `EnrichedKillEvent` dataclass should be extended to carry DSCR-specific fields:

```python
@dataclass
class EnrichedKillEvent:
    # === Existing Slice 1 fields ===
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
    timestamp: str = field(default_factory=lambda: datetime.now(UTC).isoformat())

    # === Slice 2 additions ===
    # Credit
    tradelines_count: int | None = None
    tradelines_required: int | None = None
    late_30_count_12mo: int | None = None
    late_60_count_24mo: int | None = None
    collections_open_count: int | None = None
    foreclosure_date: str | None = None  # YYYY-MM-DD
    bk_chapter: int | None = None  # 7, 11, 13
    bk_discharge_date: str | None = None
    bk_filing_date: str | None = None
    inquiries_count_6mo: int | None = None
    fico_bureau: str | None = None  # "Experian", "Equifax", "TransUnion"
    fico_date: str | None = None

    # Employment (rare for DSCR)
    employment_length_months: int | None = None
    employment_length_required: int | None = None
    employment_verified: bool | None = None
    self_employed: bool | None = None

    # Income
    dti_existing: float | None = None  # 0.0-1.0
    dti_proposed: float | None = None  # 0.0-1.0
    dti_max: float | None = None  # lender max, e.g., 0.50

    # Residence
    residence_length_months: int | None = None
    residence_verified: bool | None = None
    residence_temporary: bool | None = None

    # Insurance
    flood_zone: str | None = None  # "A", "AE", "V", "VE", "X"
    flood_binder_in_place: bool | None = None
    property_insurance_binder_in_place: bool | None = None
    property_insurance_carrier_approved: bool | None = None

    # Vesting
    vesting_type: str | None = None  # "LLC", "Trust", "Individual", "Foreign Entity", "Corp"
    entity_state: str | None = None
    entity_good_standing: bool | None = None

    # Loan structure
    loan_purpose: str | None = None  # "purchase", "refi", "cash-out", "construction"
    cash_out_seasoning_months: int | None = None
    ppp_years: int | None = None
    loan_amount_max_lender: float | None = None

    # State
    subject_state: str | None = None  # 2-letter
    state_licensed: bool | None = None
    state_dscr_minimum: float | None = None  # e.g., 1.20 for NY

    # Title
    title_exception: str | None = None  # free text description
    title_exception_type: str | None = None  # "lien", "easement", "unpermitted", etc.

    # ITIN/FN
    itin_valid: bool | None = None
    fn_visa_type: str | None = None  # "B-1", "B-2", "E-2", "E-3", "H-1B", "L-1", "TN"
    fn_accepted_visa: list[str] | None = None
    fn_us_bank_months: int | None = None

    # Program context (TOPIC 17 / lender program)
    lender_program: str | None = None  # "DSCR-Investor", "DSCR-Full Doc", "DSCR-FN", "DSCR-ITIN"
    lender_name: str | None = None  # "Newfi", "Pennymac", "Griffin", "Angel Oak", "Deephaven"

    # SHAP values for explainability (TOPIC 13 + 18)
    shap_features: list[dict] | None = None
    # Each: {"feature": str, "shap_value": float, "direction": "below_minimum" | "above_maximum"}

    # Audit
    policy_ref: str | None = None  # lender policy citation for non-Reg B codes (code 24 "Other")
    verification_attempts: list[dict] | None = None
```

---

## 4. select_ecoa_codes — Slice 2 Logic

```python
def select_ecoa_codes(
    trigger: str,
    actual_value: float | None = None,
    kill_event: EnrichedKillEvent | None = None,
    override_map: dict[str, list[str]] | None = None,
    lender_id: str | None = None,
) -> list[str]:
    """Select the most specific ECOA reason codes for a given kill trigger + actual value.

    Slice 2 changes:
    - Accept EnrichedKillEvent (richer context)
    - SHAP-aware: if trigger is generic, use shap_features to find the most specific code
    - Lender override map support
    - Code 24 "Other" approved-list enforcement
    - Multi-code support: LTV + DSCR + Reserves can all be returned together

    Returns:
        List of ECOA reason codes (typically 1-2 codes per kill event, max 4 per CFPB)
    """
    mapping = override_map if override_map is not None else DEFAULT_KILL_TO_ECOA_MAP

    # === Auto-classify by actual value (Slice 1 logic, expanded) ===
    if trigger == "LTV" and actual_value is not None:
        if actual_value > 0.90:
            trigger = "LTV_OVER_90"
        elif actual_value >= 0.80:
            trigger = "LTV_80_TO_90"
        else:
            trigger = "LTV_OVER_MAX"  # generic

    if trigger == "DSCR" and actual_value is not None:
        trigger = "DSCR_BELOW_MINIMUM"  # always code 28

    # === Get the codes from the map ===
    codes = mapping.get(trigger, [])

    # === SHAP-aware fallback (TOPIC 13 + 18) ===
    if not codes and kill_event is not None and kill_event.shap_features:
        # Find the top SHAP feature and map it to a code
        top_feature = max(kill_event.shap_features, key=lambda f: abs(f["shap_value"]))
        feature_to_code = {
            "dscr_calculated": "28",
            "fico_score": "25",
            "ltv_calculated": "26",
            "reserves_months": "27",
            "rent_monthly": "10",
            "pitia_monthly": "08",
            "delinquencies": "17",
            "collections": "18",
            "bankruptcy": "21",
            "foreclosure": "20",
            "inquiries": "22",
            "property_type": "29",
            "loan_amount": "30",
        }
        code = feature_to_code.get(top_feature["feature"])
        if code:
            codes = [code]

    # === Code 24 "Other" approved-list enforcement ===
    if "24" in codes and kill_event is not None:
        if not _is_approved_other_reason(kill_event):
            # Code 24 must have a specific reason text from lender's approved list
            raise ValueError(
                f"Code 24 'Other' requires a specific reason from lender's approved list. "
                f"Trigger: {trigger}, lender: {kill_event.lender_name}. "
                f"Add reason text to lender's approved 'Other' reasons list."
            )

    # === CFPB Circular 2022-03 — 4-6 reasons per notice ===
    if len(codes) > 4:
        # CFPB recommends up to 4 reasons
        codes = codes[:4]

    return codes if codes else []  # empty list if no match
```

---

## 5. Lender Override Maps

```python
# In a separate config file: config/dscr_lender_profiles.yaml

LENDER_OVERRIDE_MAPS = {
    "NEWFI": {
        # Newfi's LTV caps are 80% LTR / 75% STR / 70% declining
        "LTV_OVER_80": ["26"],
        "LTV_OVER_75": ["26"],
        "LTV_OVER_70_DECLINING": ["26"],
        # Newfi's DSCR minimums
        "DSCR_BELOW_125_80LTV": ["28"],
        "DSCR_BELOW_100_75LTV": ["28"],
        # Newfi's reserves
        "RESERVES_UNDER_3MO_DSCR_125": ["27"],
        "RESERVES_UNDER_6MO_DSCR_LOW": ["27"],
        # Newfi's state overlays
        "NJ_LLC_SPLIT": ["34"],
        "NY_DSCR_BELOW_120": ["34"],
    },
    "PENNYMAC": {
        # Pennymac's LTV caps
        "LTV_OVER_80": ["26"],
        "LTV_OVER_75_STR": ["26"],
        # Pennymac's DSCR minimums
        "DSCR_BELOW_100_80LTV": ["28"],
        "DSCR_BELOW_75_75LTV": ["28"],
        # Pennymac's reserves
        "RESERVES_UNDER_3MO": ["27"],
        "RESERVES_UNDER_6MO": ["27"],
    },
    "GRIFFIN": {
        "LTV_OVER_80": ["26"],
        "LTV_OVER_75_STR": ["26"],
        "DSCR_BELOW_100": ["28"],
        "LOAN_AMOUNT_OVER_4M": ["30"],
    },
    "ANGEL_OAK": {
        "LTV_OVER_80": ["26"],
        "LTV_OVER_75_STR": ["26"],
        "DSCR_BELOW_75_INVESTOR_PLUS": ["28"],
        "DSCR_BELOW_100": ["28"],
    },
    "DEEPHAVEN": {
        "LTV_OVER_80": ["26"],
        "LTV_OVER_75_STR": ["26"],
        "DSCR_BELOW_100": ["28"],
        "DSCR_BELOW_125_80LTV": ["28"],
    },
}
```

---

## 6. build_adverse_action_notice — Slice 2 Updates

The existing `build_adverse_action_notice` function needs minor updates:

```python
def build_adverse_action_notice(
    kill_event: EnrichedKillEvent,
    override_map: dict[str, list[str]] | None = None,
    fcra_data_source: str | None = None,
    fcra_source_address: str | None = None,
    state_specific_notices: list[dict] | None = None,
) -> dict:
    """Build structured Adverse_Action_Notice_Payload from enriched kill event.

    Slice 2 changes:
    - Pass EnrichedKillEvent to select_ecoa_codes (for SHAP fallback)
    - Add code 24 specific reason text from kill_event.policy_ref
    - Add lender-specific override map selection
    - Add FICO disclosure (FCRA §615(a)(2)) if FICO was used
    """
    # === Select codes (Slice 2 — uses EnrichedKillEvent) ===
    ecoa_codes = select_ecoa_codes(
        kill_event.trigger,
        actual_value=kill_event.actual_ltv,
        kill_event=kill_event,
        override_map=override_map,
        lender_id=kill_event.lender_id,
    )

    # === Build reasons array (Slice 2 — supports code 24 specific text) ===
    ecoa_reasons = []
    for code in ecoa_codes:
        text = ECOA_REASON_TEXTS.get(code, f"ECOA code {code}")
        # For codes with placeholders (25-40), substitute actual values
        if code in ("25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"):
            text = _interpolate_dscr_reason(code, text, kill_event)
        ecoa_reasons.append({"code": code, "text": text})

    # === Build payload (Slice 2 — added FICO disclosure) ===
    payload = {
        "version": "2.0",
        "as_of": kill_event.timestamp,
        "lender_id": kill_event.lender_id,
        "lender_name": kill_event.lender_name,
        "lender_program": kill_event.lender_program,
        "application_id": kill_event.application_id,
        "is_compliant": True,
        "regulatory_notices": {
            "ecoa_notice": {
                "header": "ADVERSE ACTION NOTICE",
                "prohibition_statement": _ecoa_prohibition_statement(),
                "reasons": ecoa_reasons,
                "enriched_context": _enriched_context_to_dict(kill_event),
            },
        },
        "state_specific_notices": state_specific_notices or [],
        "meta": {
            "generation_timestamp": kill_event.timestamp,
            "engine_version": "DSCR_Engine_v17.0.0",
            "explanation_layer_version": "2.0.0",
            "code_count": len(ecoa_codes),
            "shap_used": kill_event.shap_features is not None,
        },
    }

    # === FCRA disclosure (Slice 2 — added credit score disclosure) ===
    if fcra_data_source is not None:
        payload["regulatory_notices"]["fcra_disclosure"] = _build_fcra_disclosure(
            fcra_data_source, fcra_source_address, kill_event
        )

    return payload
```

---

## 7. Helper Functions

```python
def _interpolate_dscr_reason(code: str, template: str, kill_event: EnrichedKillEvent) -> str:
    """Substitute placeholders in DSCR-specific reason templates."""
    if code == "25":  # FICO
        return template.format(
            actual=kill_event.fico,
            minimum=kill_event.fico_threshold,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "26":  # LTV
        return template.format(
            actual_pct=f"{kill_event.actual_ltv * 100:.1f}" if kill_event.actual_ltv else "N/A",
            max_pct=f"{kill_event.ltv_threshold * 100:.0f}" if kill_event.ltv_threshold else "N/A",
        )
    elif code == "27":  # Reserves
        return template.format(
            actual_months=kill_event.actual_reserves_months,
            min_months=3,  # TODO: lender-specific
        )
    elif code == "28":  # DSCR
        return template.format(
            actual_dscr=kill_event.actual_dscr,
            min_dscr=kill_event.dscr_threshold,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "29":  # Property type
        return template.format(
            property_type=kill_event.property_type,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "30":  # Loan amount
        return template.format(
            loan_amount=f"{kill_event.loan_amount:,.0f}" if kill_event.loan_amount else "N/A",
            max_amount=f"{kill_event.loan_amount_max_lender:,.0f}" if kill_event.loan_amount_max_lender else "N/A",
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "31":  # Flood
        return template.format(zone=kill_event.flood_zone or "SFHA")
    elif code == "32":  # Property insurance
        return template.format(reason=kill_event.policy_ref or "coverage insufficient")
    elif code == "33":  # Vesting
        return template.format(
            entity_type=kill_event.vesting_type,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "34":  # State regulatory
        return template.format(
            state=kill_event.subject_state,
            reason=kill_event.policy_ref or "regulatory requirement not met",
        )
    elif code == "35":  # PPP
        return template.format(
            years=kill_event.ppp_years,
            max_years=3,  # TODO: state-specific
            state=kill_event.subject_state,
        )
    elif code == "36":  # Cash-out
        return template.format(
            months_ago=kill_event.cash_out_seasoning_months,
            min_months=6,  # TODO: lender-specific
        )
    elif code == "37":  # State not covered
        return template.format(
            state=kill_event.subject_state,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "38":  # Loan purpose
        return template.format(
            purpose=kill_event.loan_purpose,
            program=kill_event.lender_program or "DSCR",
        )
    elif code == "39":  # Title
        return template.format(exception=kill_event.title_exception or "title exception")
    elif code == "40":  # ITIN/FN
        return template.format(
            itin_fn="ITIN" if kill_event.itin_valid is not None else "Foreign National",
            program=kill_event.lender_program or "DSCR",
            reason=kill_event.policy_ref or "documentation insufficient",
        )
    return template


def _is_approved_other_reason(kill_event: EnrichedKillEvent) -> bool:
    """Check if the 'Other' reason is on the lender's approved list."""
    if kill_event.lender_name is None:
        return False
    approved_list = APPROVED_OTHER_REASONS.get(kill_event.lender_name, [])
    return kill_event.policy_ref in approved_list


APPROVED_OTHER_REASONS = {
    "NEWFI": [
        "DSCR below our minimum 1.00",
        "Reserves below our minimum 3 months PITIA",
        "Flood insurance not in place",
        "Property insurance binder not in place",
        "Vesting entity not acceptable",
        "NJ LLC lender-split not satisfied",
        "NY DSCR below 1.20",
        # ... 28 reasons
    ],
    "PENNYMAC": [
        # ... 32 reasons
    ],
    # etc.
}
```

---

## 8. Test Specification (~96 new tests)

```python
# tests/test_compliance_slice2.py

# === Form C-1 verbatim (01-23): 46 tests ===
@pytest.mark.parametrize("code,expected_text", [
    ("01", "Credit application incomplete"),
    ("02", "Insufficient number of credit references provided"),
    ("03", "Unacceptable type of credit references provided"),
    ("04", "Unable to verify credit references"),
    ("05", "Temporary or irregular employment"),
    ("06", "Unable to verify employment"),
    ("07", "Length of employment"),
    ("08", "Income insufficient for amount of credit requested"),
    ("09", "Excessive obligations in relation to income"),
    ("10", "Unable to verify income"),
    ("11", "Length of residence"),
    ("12", "Temporary residence"),
    ("13", "Unable to verify residence"),
    ("14", "No credit file"),
    ("15", "Limited credit experience"),
    ("16", "Poor credit performance with us"),
    ("17", "Delinquent past or present credit obligations with others"),
    ("18", "Collection action or judgment"),
    ("19", "Garnishment or attachment"),
    ("20", "Foreclosure or repossession"),
    ("21", "Bankruptcy"),
    ("22", "Number of recent inquiries on credit bureau report"),
    ("23", "Value or type of collateral not sufficient"),
    ("24", "Other, specify: ___."),
])
def test_form_c1_verbatim_text(code, expected_text):
    assert ECOA_REASON_TEXTS[code] == expected_text


# === DSCR-specific (25-40): 30 tests ===
def test_code_25_fico_substitution():
    ke = EnrichedKillEvent(trigger="FICO_BELOW_LENDER_MIN", fico=600, fico_threshold=620, lender_program="DSCR-Investor")
    text = _interpolate_dscr_reason("25", ECOA_REASON_TEXTS["25"], ke)
    assert "600" in text
    assert "620" in text
    assert "DSCR-Investor" in text

def test_code_28_dscr_substitution():
    ke = EnrichedKillEvent(trigger="DSCR_BELOW_MINIMUM", actual_dscr=0.85, dscr_threshold=1.00, lender_program="DSCR-Investor")
    text = _interpolate_dscr_reason("28", ECOA_REASON_TEXTS["28"], ke)
    assert "0.85" in text
    assert "1.0" in text

# === Slice 1 backward compat: 5 tests ===
def test_slice1_alias_19_now_points_to_08():
    assert ECOA_CODE_19_INCOME_INSUFFICIENT == "08"

def test_slice1_alias_21_now_points_to_09():
    assert ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH == "09"

# === Lender override maps: 5 tests ===
def test_newfi_override_dscr_below_100():
    ke = EnrichedKillEvent(trigger="DSCR_BELOW_MINIMUM", actual_dscr=0.95, lender_name="Newfi")
    override = LENDER_OVERRIDE_MAPS["NEWFI"]
    codes = select_ecoa_codes(ke.trigger, kill_event=ke, override_map=override)
    assert "28" in codes

# === CFPB Circular 2022-03 specificity: 5 tests ===
def test_4_to_6_reasons_per_notice():
    """CFPB recommends up to 4 reasons; we cap at 4."""
    ke = EnrichedKillEvent(trigger="MULTI_KILL")
    payload = build_adverse_action_notice(ke)
    reasons = payload["regulatory_notices"]["ecoa_notice"]["reasons"]
    assert 1 <= len(reasons) <= 4

# === SHAP-to-reason: 5 tests ===
def test_shap_top_feature_maps_to_dscr():
    ke = EnrichedKillEvent(
        trigger="UNKNOWN_TRIGGER",
        shap_features=[
            {"feature": "dscr_calculated", "shap_value": -0.18, "direction": "below_minimum"},
            {"feature": "fico_score", "shap_value": -0.05, "direction": "below_minimum"},
        ],
    )
    codes = select_ecoa_codes("UNKNOWN_TRIGGER", kill_event=ke)
    assert "28" in codes  # top SHAP is DSCR
```

---

## 9. Migration Path for Slice 1 Code

```python
# In compliance.py (Slice 2)

import warnings

# Slice 1 constants (kept for back-compat)
ECOA_CODE_19_INCOME_INSUFFICIENT = "08"  # was 19, now points to 08
ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH = "09"  # was 21, now points to 09
ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX = "30"  # was 26, now points to 30
ECOA_CODE_27_COLLATERAL_INSUFFICIENT = "23"  # was 27, now points to 23
ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE = "29"  # was 28, now points to 29

# Slice 1 texts (updated to current Form C-1 text)
ECOA_REASON_TEXTS = {
    "08": "Income insufficient for amount of credit requested",  # was 19
    "09": "Excessive obligations in relation to income",  # was 21
    "23": "Value or type of collateral not sufficient",  # was 27
    "29": "The type of property you selected is not acceptable to us.",  # was 28
    "30": "You requested an amount that exceeds the maximum loan amount permitted by our regulations.",  # was 26
    # ... plus 24, 25, 26, 27, 28 and all new
}

# Deprecation warnings
warnings.warn(
    "ECOA_CODE_19, _21, _26, _27, _28 constants are deprecated. "
    "Use the new code constants (08, 09, 23, 29, 30) or the ECOA_REASON_TEXTS dict directly.",
    DeprecationWarning,
    stacklevel=2,
)
```

---

## 10. Implementation Order (P0 → P4)

| Week | Codes | Tests | Effort |
|---|---|---|---|
| **1** | 28 (DSCR), 27 (Reserves), 26 (LTV) | 6 | 8 hr |
| **2** | 25 (FICO), 23 (Collateral), 24 (Other) | 8 | 12 hr |
| **3** | 10, 08, 09, 14, 15, 17, 18, 20, 21, 29 | 20 | 16 hr |
| **4** | 31, 32, 33, 34, 36, 40 | 12 | 12 hr |
| **5** | 01, 02, 03, 04, 22, 30, 35, 37, 39 | 18 | 16 hr |
| **6** | 05, 06, 07, 13, 16, 19, 38 | 14 | 12 hr |
| **7** | 11, 12 (and integration) | 4 | 4 hr |
| **Total** | 40 codes | ~96 tests | **~80 hr** |

---

## 11. Open Questions

1. **Code 24 "Other" enforcement**: Should the engine **raise an error** if code 24 is selected without an approved lender reason? Or just **log a warning**?
   - **Recommendation**: Raise error (CFPB Circular 2022-03 specificity)
2. **Lender override map format**: YAML (recommended) or JSON or Python dict?
   - **Recommendation**: YAML for ops flexibility
3. **SHAP-to-reason mapping**: Is the XGBoost model in Slice 2 P0-4 already returning SHAP values? If not, defer to TOPIC 13 integration.
4. **State-specific disclosures (CA, NY, MA, MN, TX)**: Should be in addition to the 40 codes, not replacing them.
5. **FCRA §615(a) credit score disclosure**: Required when FICO is used; how to integrate with code 25?

These are deferred to Slice 2 P0-4 build specifications.
