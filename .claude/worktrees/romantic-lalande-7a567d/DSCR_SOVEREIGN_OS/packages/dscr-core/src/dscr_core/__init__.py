"""Deterministic math core for the DSCR Sovereign OS.

Slice 1: pure stdlib, no ML, no DB, no API.
Every downstream system (TimesFM, MC stress, LLPA, IC memo) calls into this.

Spec sources:
    - Sovereign Master v11.0 (Track 1 / Track 2 baseline)
    - DSCR Underwriting Engine Master Consolidated v16.0.0 (BUG-01, BUG-02,
      BUG-05, BUG-06, FLAW-05, etc.)
    - Pennymac / Newfi / Fannie Mae Selling Guide (Track 1 lender formula)
    - AEGIS_DSCR_Complete §5.3 (ITIA for IO loans)
    - Sprint 6 Module 1 / Master DSCR §6 (reserves: 6/9/12 months)
    - 12 CFR 1002 Appendix A (ECOA Reg B Form C-1 verbatim codes)
    - T7 compliance_expansion_python_spec.md (DSCR-specific codes 25-40)
    - MN House File 3437 (Apr 23, 2026) — MN PPP business-purpose exemption
    - CFPB Section 1071 Final Rule (May 1, 2026; compliance Jan 1, 2028)
    - 12 CFR 1026.32 (HOEPA High-Cost Mortgage)
    - 12 USC 1602(aa)(3) (HOEPA annual threshold adjustment authority)
    - T12 50-state STR matrix (godmode_20260618/12_T12_50state_str_regulation/)
    - T13 50-state usury caps (godmode_20260618/13_T13_50state_usury_caps/)
    - Sprint 2 — PPP State Matrix, STR Legality Database (Jun 18, 2026)
"""

from dscr_core.compliance import (
    ALL_ECOA_CODES,
    DEFAULT_KILL_TO_ECOA_MAP,
    DSCR_EXTENSION_CODES,
    ECOA_CODE_01_APPLICATION_INCOMPLETE,
    ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES,
    ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES,
    ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES,
    ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT,
    ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT,
    ECOA_CODE_07_LENGTH_OF_EMPLOYMENT,
    ECOA_CODE_08_INCOME_INSUFFICIENT,
    ECOA_CODE_09_EXCESSIVE_OBLIGATIONS,
    ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME,
    ECOA_CODE_11_LENGTH_OF_RESIDENCE,
    ECOA_CODE_12_TEMPORARY_RESIDENCE,
    ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE,
    ECOA_CODE_14_NO_CREDIT_FILE,
    ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE,
    ECOA_CODE_16_POOR_CREDIT_PERFORMANCE,
    ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS,
    ECOA_CODE_18_COLLECTION_OR_JUDGMENT,
    ECOA_CODE_19_GARNISHMENT,
    ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION,
    ECOA_CODE_21_BANKRUPTCY,
    ECOA_CODE_22_EXCESSIVE_INQUIRIES,
    ECOA_CODE_23_COLLATERAL_INSUFFICIENT,
    ECOA_CODE_24_OTHER_SPECIFY,
    ECOA_CODE_25_FICO_BELOW_MIN,
    ECOA_CODE_26_LTV_EXCEEDS_MAX,
    ECOA_CODE_27_RESERVES_BELOW_MIN,
    ECOA_CODE_28_DSCR_BELOW_MIN,
    ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE,
    ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX,
    ECOA_CODE_31_FLOOD_INSURANCE_MISSING,
    ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT,
    ECOA_CODE_33_VESTING_UNACCEPTABLE,
    ECOA_CODE_34_STATE_REGULATORY,
    ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED,
    ECOA_CODE_36_CASH_OUT_SEASONING,
    ECOA_CODE_37_STATE_NOT_COVERED,
    ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE,
    ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED,
    ECOA_CODE_40_ITIN_FN_INSUFFICIENT,
    ECOA_REASON_TEXTS,
    FORM_C1_CODES,
    HOEPA_APR_THRESHOLD_FIRST_LIEN,
    HOEPA_APR_THRESHOLD_SUBORDINATE,
    HOEPA_PF_PERCENTAGE_LARGE,  # v0.5.0 — 5% for loans >= annual threshold
    HOEPA_PP_PENALTY_PERCENT,  # v0.5.0 — prepayment penalty test (2%)
    HOEPA_PP_PENALTY_PERIOD_MONTHS,  # v0.5.0 — prepayment penalty test (36mo)
    HOEPA_THRESHOLDS_BY_YEAR,
    MN_PPP_CONSUMER_MAX_YEARS,
    MN_PPP_HF3437_BUSINESS_PURPOSE_EXEMPT,
    MN_PPP_HF3437_EFFECTIVE_DATE,
    MN_PPP_HF3437_ENACTMENT_DATE,
    SECTION_1071_BROKER_EXEMPT,
    SECTION_1071_COMPLIANCE_DATE,
    SECTION_1071_FINAL_RULE_DATE,
    SECTION_1071_REVENUE_THRESHOLD_USD,
    SECTION_1071_VOLUME_THRESHOLD,
    AdverseActionReason,
    BrokerCompensationResult,
    BrokerCompensationRule,
    EnrichedKillEvent,
    auto_classify_trigger,
    build_adverse_action_notice,
    classify_broker_compensation,
    get_hoepa_thresholds,
    is_hoepa_loan,
    is_minnesota_ppp_applicable,
    is_section_1071_reportable,
    select_ecoa_codes,
    select_ecoa_codes_for_deal,
)
from dscr_core.dscr import (
    dscr_all_in,
    dscr_track1,
    dscr_track2,
    dscr_track3_stabilized,
    dual_track,
    qualifying_rent,
    round_dscr,
    track_decision,
)
from dscr_core.leverage import (
    deal_break_rate,
    max_purchase_price,
)
from dscr_core.ltv import (
    breakeven_occupancy,
    ltv,
    max_loan_io,
    noi_at_year,
    reserves_check,
    value_for_ltv,
)
from dscr_core.payment import (
    MAX_TERM_MONTHS,
    itia,
    payment_factor,
    pi,
    pi_io,
    piti,
    pitia,
)
from dscr_core.state_matrix import (
    STATE_PROFILES,
    PPPProfile,
    PPPStatus,
    StateProfile,
    STRProfile,
    STRStatus,
    TransferTaxProfile,
    UsuryProfile,
    UsuryRisk,
    VestingType,
    compute_transfer_tax,
    get_max_dscr_rate,
    get_state_profile,
    is_ppp_allowed,
    is_str_allowed,
    list_states,
    verify_state_profile,
)
from dscr_core.tax import (
    MACRS_PERIOD_COMMERCIAL,
    MACRS_PERIOD_RESIDENTIAL,
    NIIT_MAGI_THRESHOLD,
    PAL_ALLOWANCE_BASE,
    PAL_PHASEOUT_END,
    PAL_PHASEOUT_RATE,
    PAL_PHASEOUT_START,
    SECTION_1250_RECAPTURE_RATE,
    DepreciationSchedule,
    FilingStatus,
    PropertyType,
    after_tax_cash_flow,
    macrs_depreciation_schedule,
    niit,
    pal_phaseout,
    rep_status,
    section_1250_recapture,
)

__version__ = "0.5.5"  # v0.5.5 §1071 threshold fix (100→1,000) per May 2026 Final Rule

__all__ = [
    # payment
    "payment_factor",
    "pi",
    "pi_io",
    "piti",
    "pitia",
    "itia",
    "MAX_TERM_MONTHS",
    # dscr
    "dscr_track1",
    "dscr_track2",
    "dscr_track3_stabilized",
    "dscr_all_in",
    "dual_track",
    "qualifying_rent",
    "round_dscr",
    "track_decision",
    # leverage
    "deal_break_rate",
    "max_purchase_price",
    # ltv
    "value_for_ltv",
    "ltv",
    "breakeven_occupancy",
    "max_loan_io",
    "noi_at_year",
    "reserves_check",
    # compliance v0.4.0 (FCRA/ECOA Explainability Layer)
    "EnrichedKillEvent",
    "AdverseActionReason",  # NEW v0.4.0
    "build_adverse_action_notice",
    "select_ecoa_codes",
    "select_ecoa_codes_for_deal",  # NEW v0.4.0 (aggregation API)
    "auto_classify_trigger",  # NEW v0.4.0
    # Reg Z Section 1026.36 broker compensation (NEW v0.4.1, Sprint 3 Lender Intel 7.1)
    "BrokerCompensationRule",
    "BrokerCompensationResult",
    "classify_broker_compensation",
    "DEFAULT_KILL_TO_ECOA_MAP",
    "ECOA_REASON_TEXTS",
    "ALL_ECOA_CODES",  # NEW v0.4.0
    "FORM_C1_CODES",  # NEW v0.4.0
    "DSCR_EXTENSION_CODES",  # NEW v0.4.0
    # Form C-1 codes (verbatim)
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
    # DSCR-specific extension codes
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
    # State regulatory overlays
    "is_minnesota_ppp_applicable",
    "is_section_1071_reportable",
    "is_hoepa_loan",
    "get_hoepa_thresholds",  # NEW v0.4.0
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
    "HOEPA_PF_PERCENTAGE_LARGE",  # 5% for loans >= annual threshold
    # Note: HOEPA_PF_DOLLAR_SMALL removed in v0.5.1 — it was the wrong
    # constant (used static $1,000 instead of inflation-adjusted value).
    # The dollar trigger now comes from HOEPA_THRESHOLDS_BY_YEAR[year]["points_and_fees"].
    "HOEPA_PP_PENALTY_PERCENT",  # prepayment penalty test (2%)
    "HOEPA_PP_PENALTY_PERIOD_MONTHS",  # prepayment penalty test (36mo)
    # 50-State Matrix v0.1.0 (NEW v0.4.0)
    "STATE_PROFILES",
    "StateProfile",
    "PPPProfile",
    "PPPStatus",
    "STRProfile",
    "STRStatus",
    "UsuryProfile",
    "UsuryRisk",
    "TransferTaxProfile",
    "VestingType",
    "get_state_profile",
    "is_ppp_allowed",
    "is_str_allowed",
    "compute_transfer_tax",
    "get_max_dscr_rate",
    "list_states",
    "verify_state_profile",
    # Slice 3 After-Tax Engine (NEW v0.5.4)
    "FilingStatus",
    "PropertyType",
    "DepreciationSchedule",
    "MACRS_PERIOD_RESIDENTIAL",
    "MACRS_PERIOD_COMMERCIAL",
    "SECTION_1250_RECAPTURE_RATE",
    "NIIT_MAGI_THRESHOLD",
    "PAL_ALLOWANCE_BASE",
    "PAL_PHASEOUT_START",
    "PAL_PHASEOUT_END",
    "PAL_PHASEOUT_RATE",
    "macrs_depreciation_schedule",
    "section_1250_recapture",
    "niit",
    "pal_phaseout",
    "rep_status",
    "after_tax_cash_flow",
]  # v0.5.5 §1071 threshold fix (100→1,000) per May 2026 Final Rule
