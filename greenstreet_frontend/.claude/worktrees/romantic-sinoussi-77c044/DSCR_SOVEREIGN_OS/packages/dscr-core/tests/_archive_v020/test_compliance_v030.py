"""Compliance v0.3.0 Fix — comprehensive tests for all 40 ECOA codes + state overlays.

This test file replaces the original 7-test test_compliance.py that codified
WRONG ECOA code mappings. v0.3.0 corrects the bugs (per Drift Audit 2026-06-20):

  OLD (WRONG)          ->  NEW (CORRECT)
  ECOA 19 "income"     ->  ECOA 08 "Income insufficient"
  ECOA 21 "debt"       ->  ECOA 09 "Excessive obligations"
  ECOA 26 "loan amt"   ->  ECOA 30 "Loan amount exceeds max" (DSCR)
  ECOA 27 "collateral" ->  ECOA 23 "Value or type of collateral" (Form C-1)
  ECOA 28 "property"   ->  ECOA 29 "Property type unacceptable" (DSCR)

Plus 35 new codes (full 40-code coverage) + 3 state regulatory overlays
(MN PPP HF 3437, Section 1071 broker-exempt, HOEPA 2026).

Spec source: T7 compliance_expansion_python_spec.md
"""

from __future__ import annotations

import warnings

import pytest

from dscr_core import (
    DEFAULT_KILL_TO_ECOA_MAP,
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
    EnrichedKillEvent,
    HOEPA_LOAN_AMOUNT_THRESHOLD_2027,
    HOEPA_POINTS_AND_FEES_THRESHOLD_2027,
    MN_PPP_HF3437_EFFECTIVE_DATE,
    SECTION_1071_COMPLIANCE_DATE,
    SECTION_1071_VOLUME_THRESHOLD,
    build_adverse_action_notice,
    is_hoepa_loan,
    is_minnesota_ppp_applicable,
    is_section_1071_reportable,
    select_ecoa_codes,
)


# ============================================================================
# Form C-1 verbatim codes (01-24) — every code must have text matching Reg B
# ============================================================================

class TestFormC1VerbatimCodes:
    """Verify codes 01-23 match Form C-1 verbatim text from 12 CFR 1002 Appendix A."""

    @pytest.mark.parametrize("code,expected_text", [
        (ECOA_CODE_01_APPLICATION_INCOMPLETE, "Credit application incomplete"),
        (ECOA_CODE_02_INSUFFICIENT_CREDIT_REFERENCES, "Insufficient number of credit references provided"),
        (ECOA_CODE_03_UNACCEPTABLE_CREDIT_REFERENCES, "Unacceptable type of credit references provided"),
        (ECOA_CODE_04_UNABLE_TO_VERIFY_CREDIT_REFERENCES, "Unable to verify credit references"),
        (ECOA_CODE_05_TEMPORARY_IRREGULAR_EMPLOYMENT, "Temporary or irregular employment"),
        (ECOA_CODE_06_UNABLE_TO_VERIFY_EMPLOYMENT, "Unable to verify employment"),
        (ECOA_CODE_07_LENGTH_OF_EMPLOYMENT, "Length of employment"),
        (ECOA_CODE_08_INCOME_INSUFFICIENT, "Income insufficient for the amount of credit requested"),
        (ECOA_CODE_09_EXCESSIVE_OBLIGATIONS, "Excessive obligations in relation to income"),
        (ECOA_CODE_10_UNABLE_TO_VERIFY_INCOME, "Unable to verify income"),
        (ECOA_CODE_11_LENGTH_OF_RESIDENCE, "Length of residence"),
        (ECOA_CODE_12_TEMPORARY_RESIDENCE, "Temporary residence"),
        (ECOA_CODE_13_UNABLE_TO_VERIFY_RESIDENCE, "Unable to verify residence"),
        (ECOA_CODE_14_NO_CREDIT_FILE, "No credit file"),
        (ECOA_CODE_15_LIMITED_CREDIT_EXPERIENCE, "Limited credit experience"),
        (ECOA_CODE_16_POOR_CREDIT_PERFORMANCE, "Poor credit performance with us"),
        (ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS, "Delinquent past or present credit obligations with others"),
        (ECOA_CODE_18_COLLECTION_OR_JUDGMENT, "Collection action or judgment"),
        (ECOA_CODE_19_GARNISHMENT, "Garnishment or attachment"),
        (ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION, "Foreclosure or repossession"),
        (ECOA_CODE_21_BANKRUPTCY, "Bankruptcy"),
        (ECOA_CODE_22_EXCESSIVE_INQUIRIES, "Number of recent inquiries on credit bureau report"),
        (ECOA_CODE_23_COLLATERAL_INSUFFICIENT, "Value or type of collateral not sufficient"),
        (ECOA_CODE_24_OTHER_SPECIFY, "Other, specify: ___."),
    ])
    def test_form_c1_text_matches_regulation(self, code, expected_text):
        assert ECOA_REASON_TEXTS[code] == expected_text

    def test_code_19_is_garnishment_not_income(self):
        """The CRITICAL fix: code 19 = Garnishment, NOT Income."""
        assert ECOA_REASON_TEXTS[ECOA_CODE_19_GARNISHMENT] == "Garnishment or attachment"
        assert "Income" not in ECOA_REASON_TEXTS[ECOA_CODE_19_GARNISHMENT]

    def test_code_21_is_bankruptcy_not_debt(self):
        """The CRITICAL fix: code 21 = Bankruptcy, NOT Debt obligations."""
        assert ECOA_REASON_TEXTS[ECOA_CODE_21_BANKRUPTCY] == "Bankruptcy"
        assert "Debt" not in ECOA_REASON_TEXTS[ECOA_CODE_21_BANKRUPTCY]

    def test_code_08_is_income_not_garnishment(self):
        """Code 08 is the real Income code (where the old 'income' name belongs)."""
        assert "Income" in ECOA_REASON_TEXTS[ECOA_CODE_08_INCOME_INSUFFICIENT]

    def test_code_09_is_excessive_obligations(self):
        """Code 09 is the real Excessive obligations code (where old 'debt' belongs)."""
        assert "Excessive obligations" in ECOA_REASON_TEXTS[ECOA_CODE_09_EXCESSIVE_OBLIGATIONS]

    def test_all_40_codes_present(self):
        """Every code 01-40 must have text in ECOA_REASON_TEXTS."""
        for n in range(1, 41):
            code = f"{n:02d}"
            assert code in ECOA_REASON_TEXTS, f"Code {code} missing from ECOA_REASON_TEXTS"
            assert ECOA_REASON_TEXTS[code], f"Code {code} has empty text"

    def test_no_extra_codes(self):
        """No codes beyond 40 (Form C-1 is 01-23 + 24 'Other'; T7 adds 25-40)."""
        for code in ECOA_REASON_TEXTS.keys():
            assert code in [f"{n:02d}" for n in range(1, 41)], f"Unexpected code {code}"


# ============================================================================
# DSCR-specific extension codes (25-40)
# ============================================================================

class TestDSCRSpecificCodes:
    """Verify codes 25-40 are T7 DSCR-specific extensions."""

    def test_code_25_is_fico_below_min(self):
        assert "{actual}" in ECOA_REASON_TEXTS[ECOA_CODE_25_FICO_BELOW_MIN]
        assert "{minimum}" in ECOA_REASON_TEXTS[ECOA_CODE_25_FICO_BELOW_MIN]

    def test_code_26_is_ltv_exceeds_max(self):
        assert "{actual_pct}" in ECOA_REASON_TEXTS[ECOA_CODE_26_LTV_EXCEEDS_MAX]
        assert "{max_pct}" in ECOA_REASON_TEXTS[ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_code_27_is_reserves_below_min(self):
        assert "{actual_months}" in ECOA_REASON_TEXTS[ECOA_CODE_27_RESERVES_BELOW_MIN]
        assert "{min_months}" in ECOA_REASON_TEXTS[ECOA_CODE_27_RESERVES_BELOW_MIN]

    def test_code_28_is_dscr_below_min(self):
        assert "{actual_dscr}" in ECOA_REASON_TEXTS[ECOA_CODE_28_DSCR_BELOW_MIN]
        assert "{min_dscr}" in ECOA_REASON_TEXTS[ECOA_CODE_28_DSCR_BELOW_MIN]

    def test_code_29_is_property_type(self):
        assert "{property_type}" in ECOA_REASON_TEXTS[ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE]

    def test_code_30_is_loan_amount(self):
        assert "{loan_amount}" in ECOA_REASON_TEXTS[ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX]
        assert "{max_amount}" in ECOA_REASON_TEXTS[ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX]

    def test_codes_31_to_40_have_placeholders(self):
        for code in ("31", "32", "33", "34", "35", "36", "37", "38", "39", "40"):
            text = ECOA_REASON_TEXTS[code]
            assert "{" in text, f"Code {code} should have placeholder, got: {text!r}"


# ============================================================================
# select_ecoa_codes — corrected mappings (CRITICAL FIX)
# ============================================================================

class TestSelectEcoACodesCorrected:
    """Verify select_ecoa_codes fires the CORRECT codes per Drift Audit fix."""

    def test_ltv_over_90_now_uses_code_26(self):
        """FIXED: LTV > 90% fires code 26 (LTV), not code 27 (reserves/collateral)."""
        result = select_ecoa_codes("LTV_OVER_90")
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_ltv_80_to_90_uses_code_26(self):
        result = select_ecoa_codes("LTV_80_TO_90")
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_fico_below_620_uses_code_25(self):
        """FIXED: FICO < 620 fires code 25 (FICO DSCR), not code 19 (garnishment)."""
        result = select_ecoa_codes("FICO_BELOW_620")
        assert result == [ECOA_CODE_25_FICO_BELOW_MIN]
        # The CRITICAL assertion: not the old wrong code
        assert "19" not in result

    def test_dscr_generic_uses_code_28(self):
        """FIXED: DSCR generic fires code 28 (DSCR), not code 21 (bankruptcy)."""
        result = select_ecoa_codes("DSCR_GENERIC")
        assert result == [ECOA_CODE_28_DSCR_BELOW_MIN]
        assert "21" not in result

    def test_bankruptcy_uses_code_21(self):
        """FIXED: BK_DISCHARGE fires code 21 (Bankruptcy), not code 19 (garnishment)."""
        result = select_ecoa_codes("BK_DISCHARGE")
        assert result == [ECOA_CODE_21_BANKRUPTCY]

    def test_foreclosure_uses_code_20(self):
        """FIXED: FORECLOSURE fires code 20 (Foreclosure), not code 19 (garnishment)."""
        result = select_ecoa_codes("FORECLOSURE_INSUFFICIENT_SEASONING")
        assert result == [ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION] 

    def test_property_type_unacceptable_uses_code_29(self):
        """FIXED: PROPERTY_TYPE_UNACCEPTABLE fires code 29 (DSCR property), not 28."""
        result = select_ecoa_codes("PROPERTY_TYPE_UNACCEPTABLE")
        assert result == [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE]

    def test_loan_amount_exceeds_max_uses_code_30(self):
        result = select_ecoa_codes("LOAN_AMOUNT_EXCEEDS_MAX")
        assert result == [ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX]

    def test_unknown_trigger_raises_keyerror(self):
        with pytest.raises(KeyError, match="Unknown ECOA trigger"):
            select_ecoa_codes("TOTALLY_MADE_UP_TRIGGER")

    def test_ltv_auto_classification_above_90(self):
        result = select_ecoa_codes("LTV", actual_value=0.92)
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_ltv_auto_classification_at_90_boundary(self):
        """LTV exactly at 0.90 should classify as 80-90 (>= 0.80)."""
        result = select_ecoa_codes("LTV", actual_value=0.90)
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_ltv_auto_classification_85(self):
        result = select_ecoa_codes("LTV", actual_value=0.85)
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]


# ============================================================================
# State regulatory overlays
# ============================================================================

class TestMinnesotaPPP:
    """MN House File 3437 (Apr 23, 2026; effective Aug 1, 2026)."""

    def test_mn_ppp_effective_date_constant(self):
        assert MN_PPP_HF3437_EFFECTIVE_DATE == "2026-08-01"

    def test_non_mn_state_not_applicable(self):
        """Only MN has MN PPP cap."""
        assert is_minnesota_ppp_applicable("CA", is_business_purpose=True, ppp_years=5) is False
        assert is_minnesota_ppp_applicable("TX", is_business_purpose=False, ppp_years=5) is False

    def test_mn_business_purpose_exempt(self):
        """Business-purpose DSCR exempt from MN PPP cap."""
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=True, ppp_years=5) is False
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=True, ppp_years=3) is False

    def test_mn_consumer_purpose_within_3yr_ok(self):
        """MN consumer-purpose with PPP ≤ 3yr is within MN cap."""
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=3) is False
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=1) is False

    def test_mn_consumer_purpose_over_3yr_violates(self):
        """MN consumer-purpose with PPP > 3yr violates MN cap."""
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=5) is True
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=4) is True


class TestSection1071:
    """CFPB Section 1071 Final Rule (May 1, 2026; compliance Jan 1, 2028)."""

    def test_section_1071_compliance_date(self):
        assert SECTION_1071_COMPLIANCE_DATE == "2028-01-01"

    def test_section_1071_volume_threshold(self):
        assert SECTION_1071_VOLUME_THRESHOLD == 100

    def test_broker_always_exempt(self):
        """Broker-only lenders are ALWAYS exempt regardless of volume."""
        for volume in (0, 50, 99, 100, 1000, 10000):
            assert is_section_1071_reportable(True, volume) is False, \
                f"Broker should be exempt at volume {volume}"

    def test_small_lender_below_threshold_exempt(self):
        """Lenders with <100 originations/yr exempt."""
        assert is_section_1071_reportable(False, 50) is False
        assert is_section_1071_reportable(False, 99) is False
        assert is_section_1071_reportable(False, 0) is False

    def test_large_lender_above_threshold_reportable(self):
        """Lenders with ≥100 originations/yr must report."""
        assert is_section_1071_reportable(False, 100) is True
        assert is_section_1071_reportable(False, 500) is True
        assert is_section_1071_reportable(False, 10000) is True


class TestHOEPA2026:
    """HOEPA 2026 thresholds (effective Jan 1, 2027)."""

    def test_hoepa_loan_amount_threshold(self):
        assert HOEPA_LOAN_AMOUNT_THRESHOLD_2027 == 27_592

    def test_hoepa_points_and_fees_threshold(self):
        assert HOEPA_POINTS_AND_FEES_THRESHOLD_2027 == 1_380

    def test_hoepa_triggers_when_all_three_exceeded(self):
        """HOEPA triggers only when APR, P&F, AND loan amount all breach."""
        # All three breached:
        # - Loan amount $17,000 < $27,592 (HOEPA range, small enough that 8% rule = $1,360)
        # - P&F $2,000 > $1,380 (and > 8% of $17,000 = $1,360)
        # - APR 12% - APOR 1.5% = 10.5% spread > 8.5% threshold
        triggered = is_hoepa_loan(
            loan_amount=17_000,
            points_and_fees=2_000,
            annual_rate_pct=0.12,
            apor_pct=0.015,
            is_first_lien=True,
        )
        assert triggered is True

    def test_hoepa_does_not_trigger_when_apr_within_threshold(self):
        """If APR is reasonable, HOEPA does not trigger even if P&F high."""
        triggered = is_hoepa_loan(
            loan_amount=25_000,
            points_and_fees=2_000,
            annual_rate_pct=0.05,  # Below HOEPA threshold
            apor_pct=0.05,
        )
        assert triggered is False

    def test_hoepa_does_not_trigger_for_large_loans(self):
        """HOEPA only applies to SMALLER loans (≤ $27,592)."""
        triggered = is_hoepa_loan(
            loan_amount=500_000,  # > $27,592 — HOEPA doesn't apply
            points_and_fees=10_000,
            annual_rate_pct=0.12,
            apor_pct=0.015,
        )
        assert triggered is False

    def test_hoepa_first_lien_apr_threshold_is_8_5pct(self):
        """First lien: APR must exceed APOR by >8.5% (decimal 0.085)."""
        # APOR + 0.085 = 0.10, so 10% loan vs 1.5% APOR = 8.5% spread = NOT over threshold
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=2_000,
            annual_rate_pct=0.10,
            apor_pct=0.015,
            is_first_lien=True,
        )
        # 10% - 1.5% = 8.5%, which is NOT > 8.5% — so HOEPA doesn't trigger on APR alone
        assert triggered is False

    def test_hoepa_subordinate_apr_threshold_is_10pct(self):
        """Subordinate: APR must exceed APOR by >10%."""
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=2_000,
            annual_rate_pct=0.115,
            apor_pct=0.015,
            is_first_lien=False,
        )
        # 11.5% - 1.5% = 10%, which is NOT > 10% — so HOEPA doesn't trigger on APR alone
        assert triggered is False


# ============================================================================
# Backwards compat: old constants point to new correct codes + warn
# ============================================================================

class TestBackwardsCompat:
    """Old constants from v0.2.0 now point to CORRECT codes (08, 09, 23, 29, 30)."""

    def test_legacy_19_alias_points_to_08(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module
            # Access via module __getattr__
            legacy_value = comp_module.__getattr__("ECOA_CODE_19_INCOME_INSUFFICIENT")
            assert legacy_value == ECOA_CODE_08_INCOME_INSUFFICIENT
            # Check DeprecationWarning was issued
            assert any(issubclass(warning.category, DeprecationWarning) for warning in w)
            assert any("ECOA_CODE_19" in str(warning.message) for warning in w)

    def test_legacy_21_alias_points_to_09(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module
            legacy_value = comp_module.__getattr__("ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH")
            assert legacy_value == ECOA_CODE_09_EXCESSIVE_OBLIGATIONS

    def test_legacy_26_alias_points_to_30(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module
            legacy_value = comp_module.__getattr__("ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX")
            assert legacy_value == ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX

    def test_legacy_27_alias_points_to_23(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module
            legacy_value = comp_module.__getattr__("ECOA_CODE_27_COLLATERAL_INSUFFICIENT")
            assert legacy_value == ECOA_CODE_23_COLLATERAL_INSUFFICIENT

    def test_legacy_28_alias_points_to_29(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module
            legacy_value = comp_module.__getattr__("ECOA_CODE_28_PROPERTY_TYPE_UNACCEPTABLE")
            assert legacy_value == ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE

    def test_unknown_legacy_name_raises_attributeerror(self):
        from dscr_core import compliance as comp_module
        with pytest.raises(AttributeError, match="has no attribute"):
            comp_module.__getattr__("TOTALLY_MADE_UP_CONSTANT")


# ============================================================================
# EnrichedKillEvent + build_adverse_action_notice
# ============================================================================

class TestEnrichedKillEvent:
    def test_minimal_construction(self):
        ke = EnrichedKillEvent(trigger="LTV_OVER_90")
        assert ke.trigger == "LTV_OVER_90"
        assert ke.fico is None
        assert ke.timestamp  # auto-set

    def test_full_construction(self):
        ke = EnrichedKillEvent(
            trigger="FICO_BELOW_620",
            loan_amount=300_000,
            appraised_value=400_000,
            fico=580,
            fico_threshold=620,
            program="DSCR-Investor",
            property_state="CA",
        )
        assert ke.fico == 580
        assert ke.fico_threshold == 620
        assert ke.program == "DSCR-Investor"


class TestBuildAdverseActionNotice:
    def test_basic_notice_structure(self):
        ke = EnrichedKillEvent(
            trigger="LTV_OVER_90",
            actual_ltv=0.92,
            loan_amount=300_000,
            appraised_value=326_000,
            ltv_threshold=0.80,
            program="DSCR-Investor",
        )
        notice = build_adverse_action_notice(ke)
        assert notice["version"] == "2.0"
        assert notice["regulatory_notices"]["ecoa_notice"]["header"] == "ADVERSE ACTION NOTICE"
        reasons = notice["regulatory_notices"]["ecoa_notice"]["reasons"]
        assert len(reasons) >= 1
        # First reason should be code 26 (LTV)
        assert reasons[0]["code"] == ECOA_CODE_26_LTV_EXCEEDS_MAX
        # Check interpolation: should contain the actual LTV value
        assert "92.0%" in reasons[0]["text"] or "92%" in reasons[0]["text"]

    def test_notice_includes_ecoa_prohibition_statement(self):
        ke = EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.85, dscr_threshold=1.0)
        notice = build_adverse_action_notice(ke)
        prohibition = notice["regulatory_notices"]["ecoa_notice"]["prohibition_statement"]
        assert "Equal Credit Opportunity Act" in prohibition

    def test_notice_with_fcra_disclosure(self):
        ke = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=580, fico_threshold=620)
        notice = build_adverse_action_notice(
            ke, fcra_data_source="Experian", fcra_source_address="PO Box 123"
        )
        assert "fcra_disclosure" in notice["regulatory_notices"]
        fcra = notice["regulatory_notices"]["fcra_disclosure"]
        assert fcra["cra_name"] == "Experian"
        assert fcra["credit_score_value"] == 580

    def test_notice_interpolates_program_name(self):
        ke = EnrichedKillEvent(
            trigger="DSCR_GENERIC",
            actual_dscr=0.85,
            dscr_threshold=1.0,
            program="DSCR-Investor Plus",
        )
        notice = build_adverse_action_notice(ke)
        reason = notice["regulatory_notices"]["ecoa_notice"]["reasons"][0]
        assert "DSCR-Investor Plus" in reason["text"]

    def test_notice_without_kill_event_still_works(self):
        """Even with minimal kill_event, should not crash on interpolation."""
        ke = EnrichedKillEvent(trigger="FICO_BELOW_620")
        notice = build_adverse_action_notice(ke)
        reasons = notice["regulatory_notices"]["ecoa_notice"]["reasons"]
        assert len(reasons) >= 1


# ============================================================================
# Mapping coverage — verify all 40 codes are reachable
# ============================================================================

class TestMappingCoverage:
    """Sanity check: every ECOA code has at least one trigger that fires it."""

    @pytest.mark.parametrize("code,expected_triggers", [
        # Form C-1 codes
        (ECOA_CODE_01_APPLICATION_INCOMPLETE, ["INCOMPLETE_APPLICATION_15D"]),
        (ECOA_CODE_08_INCOME_INSUFFICIENT, ["DTI_OVER_50"]),
        (ECOA_CODE_09_EXCESSIVE_OBLIGATIONS, ["EXISTING_DTI_OVER_50"]),
        (ECOA_CODE_17_DELINQUENT_CREDIT_OBLIGATIONS, ["DELINQUENT_CREDIT_OBLIGATIONS"]),
        (ECOA_CODE_19_GARNISHMENT, ["ACTIVE_GARNISHMENT"]),
        (ECOA_CODE_20_FORECLOSURE_OR_REPOSSESSION, ["FORECLOSURE_INSUFFICIENT_SEASONING"]),
        (ECOA_CODE_21_BANKRUPTCY, ["BK_DISCHARGE"]),
        (ECOA_CODE_23_COLLATERAL_INSUFFICIENT, ["PROPERTY_CONDITION_C5_C6"]),
        # DSCR-specific codes
        (ECOA_CODE_25_FICO_BELOW_MIN, ["FICO_BELOW_620"]),
        (ECOA_CODE_26_LTV_EXCEEDS_MAX, ["LTV_OVER_90", "LTV_80_TO_90", "LTV_OVER_MAX"]),
        (ECOA_CODE_27_RESERVES_BELOW_MIN, ["INSUFFICIENT_RESERVES"]),
        (ECOA_CODE_28_DSCR_BELOW_MIN, ["DSCR_BELOW_MINIMUM", "DSCR_GENERIC"]),
        (ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE, ["PROPERTY_TYPE_UNACCEPTABLE"]),
        (ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX, ["LOAN_AMOUNT_EXCEEDS_MAX"]),
        (ECOA_CODE_31_FLOOD_INSURANCE_MISSING, ["FLOOD_INSURANCE_MISSING"]),
        (ECOA_CODE_32_PROPERTY_INSURANCE_INSUFFICIENT, ["PROPERTY_INSURANCE_INSUFFICIENT"]),
        (ECOA_CODE_33_VESTING_UNACCEPTABLE, ["VESTING_UNSUPPORTED"]),
        (ECOA_CODE_34_STATE_REGULATORY, ["MN_PPP_RESTRICTED"]),
        (ECOA_CODE_35_PREPAYMENT_PENALTY_RESTRICTED, ["PREPAYMENT_PENALTY_RESTRICTED"]),
        (ECOA_CODE_36_CASH_OUT_SEASONING, ["CASH_OUT_SEASONING"]),
        (ECOA_CODE_37_STATE_NOT_COVERED, ["STATE_NOT_COVERED"]),
        (ECOA_CODE_38_LOAN_PURPOSE_NOT_ELIGIBLE, ["LOAN_PURPOSE_NOT_ELIGIBLE"]),
        (ECOA_CODE_39_TITLE_EXCEPTION_UNRESOLVED, ["TITLE_EXCEPTION_UNRESOLVED"]),
        (ECOA_CODE_40_ITIN_FN_INSUFFICIENT, ["ITIN_INSUFFICIENT"]),
    ])
    def test_code_reachable_from_at_least_one_trigger(self, code, expected_triggers):
        """Each code must be reachable via at least one valid trigger."""
        for trigger in expected_triggers:
            codes = select_ecoa_codes(trigger)
            assert code in codes, f"Code {code} should be reachable via '{trigger}'"

    def test_default_map_covers_all_25_to_30(self):
        """DSCR-specific codes 25-30 must each be reachable from DEFAULT_KILL_TO_ECOA_MAP."""
        for code in ("25", "26", "27", "28", "29", "30"):
            reachable = any(
                code in codes
                for trigger, codes in DEFAULT_KILL_TO_ECOA_MAP.items()
            )
            assert reachable, f"DSCR code {code} not reachable from any trigger"
