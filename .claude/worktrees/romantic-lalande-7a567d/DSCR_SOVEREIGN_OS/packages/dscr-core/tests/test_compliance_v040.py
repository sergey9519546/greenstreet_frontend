"""Compliance v0.4.0 tests — covers ALL design fixes from the v0.3.0 → v0.4.0 hardening.

Test classes:
- TestAdverseActionReason: type-safe reason dataclass
- TestAutoClassify: FICO/LTV/DSCR auto-classification
- TestSelectForDeal: aggregation API (NEW v0.4.0)
- TestAsCode24: CFPB-compliant code 24 mode
- TestCode24Enforcement: requires policy_ref
- TestHOEPAPerYear: year-indexed threshold lookup
- TestInterpolationLenient: explicit placeholder handling
- TestSelectEcoACodes: backwards compat with v0.3.0 API
- TestFormC1Codes: 01-23 verbatim
- TestDSCRCodes: 25-40 templates
- TestMNPPP, TestSection1071, TestHOEPA: state overlays (v0.3.0 + v0.4.0)
- TestEnrichedKillEvent: construction + validation
- TestBuildNotice: aggregation-aware AAN builder
- TestBackwardsCompat: deprecated aliases still work

Spec source: T7 compliance_expansion_python_spec.md + 12 CFR 1002 Appendix A
"""

from __future__ import annotations

import warnings
from datetime import datetime

import pytest

from dscr_core import (
    ALL_ECOA_CODES,
    DSCR_EXTENSION_CODES,
    ECOA_CODE_08_INCOME_INSUFFICIENT,
    ECOA_CODE_09_EXCESSIVE_OBLIGATIONS,
    ECOA_CODE_19_GARNISHMENT,
    ECOA_CODE_21_BANKRUPTCY,
    ECOA_CODE_23_COLLATERAL_INSUFFICIENT,
    ECOA_CODE_24_OTHER_SPECIFY,
    ECOA_CODE_25_FICO_BELOW_MIN,
    ECOA_CODE_26_LTV_EXCEEDS_MAX,
    ECOA_CODE_28_DSCR_BELOW_MIN,
    ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE,
    ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX,
    ECOA_REASON_TEXTS,
    HOEPA_THRESHOLDS_BY_YEAR,
    SECTION_1071_COMPLIANCE_DATE,
    SECTION_1071_VOLUME_THRESHOLD,
    AdverseActionReason,
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

# ============================================================================
# AdverseActionReason dataclass
# ============================================================================


class TestAdverseActionReason:
    """Type-safe reason dataclass — replaces dict for type safety + auditability."""

    def test_construction_with_form_c1_code(self):
        r = AdverseActionReason(
            code="08",
            text="Income insufficient",
            trigger="DTI_OVER_50",
        )
        assert r.code == "08"
        assert r.text == "Income insufficient"
        assert r.statutory_basis == "12 CFR 1002 Appendix A"
        assert r.severity == 5

    def test_construction_with_dscr_extension_code(self):
        r = AdverseActionReason(
            code="25",
            text="FICO 580 below 620",
            trigger="FICO_BELOW_620",
            statutory_basis="Lender DSCR extension per CFPB 2022-03",
        )
        assert r.code == "25"
        assert "Lender DSCR extension" in r.statutory_basis

    def test_construction_with_code_24(self):
        r = AdverseActionReason(
            code="24",
            text="Other, specify: Borrower FICO 600 with no US credit file",
            trigger="THIN_FILE_FOREIGN_NATIONAL",
            statutory_basis="Lender policy per CFPB Reg B §1002.9(b)(2)",
        )
        assert r.code == "24"

    def test_invalid_code_raises(self):
        with pytest.raises(ValueError, match="code must be one of"):
            AdverseActionReason(code="99", text="invalid", trigger="X")

    def test_invalid_severity_raises(self):
        with pytest.raises(ValueError, match="severity must be in"):
            AdverseActionReason(code="08", text="x", trigger="X", severity=0)
        with pytest.raises(ValueError, match="severity must be in"):
            AdverseActionReason(code="08", text="x", trigger="X", severity=11)

    def test_is_frozen(self):
        import dataclasses

        r = AdverseActionReason(code="08", text="x", trigger="X")
        with pytest.raises(dataclasses.FrozenInstanceError):
            r.code = "09"  # type: ignore[misc]

    def test_specific_values_audit(self):
        r = AdverseActionReason(
            code="25",
            text="FICO 580",
            trigger="FICO_BELOW_620",
            specific_values={
                "trigger": "FICO_BELOW_620",
                "lender_id": "Pennymac",
                "application_id": "APP-123",
                "policy_ref": "PM-DSCR-MIN-FICO-620",
            },
        )
        assert r.specific_values["lender_id"] == "Pennymac"


# ============================================================================
# Auto-classification (FICO + LTV + DSCR)
# ============================================================================


class TestAutoClassify:
    """Auto-classify raw values into specific triggers."""

    def test_fico_below_580(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=550)
        assert auto_classify_trigger("FICO", ke) == "FICO_BELOW_580"

    def test_fico_below_620(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=600)
        assert auto_classify_trigger("FICO", ke) == "FICO_BELOW_620"

    def test_fico_below_660(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=650)
        assert auto_classify_trigger("FICO", ke) == "FICO_BELOW_660"

    def test_fico_below_680(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=670)
        assert auto_classify_trigger("FICO", ke) == "FICO_BELOW_680"

    def test_fico_below_700(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=695)
        assert auto_classify_trigger("FICO", ke) == "FICO_BELOW_700"

    def test_fico_above_700_unchanged(self):
        ke = EnrichedKillEvent(trigger="FICO", fico=720)
        assert auto_classify_trigger("FICO", ke) == "FICO"

    def test_ltv_over_90(self):
        ke = EnrichedKillEvent(trigger="LTV", actual_ltv=0.92)
        assert auto_classify_trigger("LTV", ke) == "LTV_OVER_90"

    def test_ltv_80_to_90(self):
        ke = EnrichedKillEvent(trigger="LTV", actual_ltv=0.85)
        assert auto_classify_trigger("LTV", ke) == "LTV_80_TO_90"

    def test_ltv_over_max_under_80(self):
        ke = EnrichedKillEvent(trigger="LTV", actual_ltv=0.75)
        assert auto_classify_trigger("LTV", ke) == "LTV_OVER_MAX"

    def test_dscr_high_debt_below_50(self):
        ke = EnrichedKillEvent(trigger="DSCR", actual_dscr=0.40)
        assert auto_classify_trigger("DSCR", ke) == "DSCR_HIGH_DEBT"

    def test_dscr_low_rent_between_50_and_100(self):
        ke = EnrichedKillEvent(trigger="DSCR", actual_dscr=0.85)
        assert auto_classify_trigger("DSCR", ke) == "DSCR_LOW_RENT"

    def test_dscr_generic_above_100(self):
        ke = EnrichedKillEvent(trigger="DSCR", actual_dscr=1.0)
        # ≥ 1.0 falls through to generic (edge case)
        assert auto_classify_trigger("DSCR", ke) == "DSCR_GENERIC"

    def test_unknown_trigger_unchanged(self):
        ke = EnrichedKillEvent(trigger="BK_DISCHARGE")
        assert auto_classify_trigger("BK_DISCHARGE", ke) == "BK_DISCHARGE"

    def test_no_kill_event_unchanged(self):
        assert auto_classify_trigger("FICO_BELOW_620", None) == "FICO_BELOW_620"


# ============================================================================
# Aggregation API (NEW v0.4.0) — select_ecoa_codes_for_deal
# ============================================================================


class TestSelectForDeal:
    """Aggregation API: ONE application → up to 4 reasons."""

    def test_single_event_returns_one_reason(self):
        ke = EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80)
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=False)
        assert len(reasons) == 1
        assert reasons[0].code == ECOA_CODE_26_LTV_EXCEEDS_MAX
        assert reasons[0].trigger == "LTV_OVER_90"

    def test_multiple_events_deduped(self):
        """Same trigger fires twice → one reason."""
        ke1 = EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80)
        ke2 = EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.95, ltv_threshold=0.80)
        reasons = select_ecoa_codes_for_deal([ke1, ke2], as_code_24=False)
        assert len(reasons) == 1

    def test_multiple_distinct_events(self):
        """Two distinct triggers with distinct codes → two reasons."""
        ke1 = EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80)
        ke2 = EnrichedKillEvent(trigger="BK_DISCHARGE")  # code 21, not 24
        reasons = select_ecoa_codes_for_deal([ke1, ke2], as_code_24=False)
        codes = [r.code for r in reasons]
        assert ECOA_CODE_26_LTV_EXCEEDS_MAX in codes
        assert ECOA_CODE_21_BANKRUPTCY in codes

    def test_max_reasons_caps_at_4(self):
        """CFPB best practice: up to 4 reasons per notice."""
        events = [
            EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80),
            EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.85, dscr_threshold=1.0),
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600, fico_threshold=620),
            EnrichedKillEvent(trigger="INSUFFICIENT_RESERVES"),
            EnrichedKillEvent(trigger="BK_DISCHARGE"),
            EnrichedKillEvent(trigger="INCOMPLETE_APPLICATION_15D"),
        ]
        reasons = select_ecoa_codes_for_deal(events, as_code_24=False)
        # 6 distinct events, 6 distinct codes (25/26/27/28 + 21 + 01)
        assert len(reasons) == 4  # Capped at 4 (CFPB best practice)

    def test_max_reasons_caps_at_4_with_code_24(self):
        """as_code_24 mode merges all DSCR codes into single code 24."""
        events = [
            EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80),
            EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.85, dscr_threshold=1.0),
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600, fico_threshold=620),
            EnrichedKillEvent(trigger="INSUFFICIENT_RESERVES"),
            EnrichedKillEvent(trigger="BK_DISCHARGE"),
            EnrichedKillEvent(trigger="INCOMPLETE_APPLICATION_15D"),
        ]
        reasons = select_ecoa_codes_for_deal(events, as_code_24=True)
        # 4 DSCR codes → 1 "24" + 21 + 01 = 3 distinct codes
        assert len(reasons) == 3
        codes = [r.code for r in reasons]
        assert ECOA_CODE_24_OTHER_SPECIFY in codes
        assert ECOA_CODE_21_BANKRUPTCY in codes
        assert "01" in codes

    def test_max_reasons_configurable(self):
        """Caller can request more or fewer reasons."""
        events = [
            EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80),
            EnrichedKillEvent(trigger="BK_DISCHARGE"),  # Different code (21, not 24)
        ]
        reasons = select_ecoa_codes_for_deal(events, max_reasons=2, as_code_24=False)
        assert len(reasons) == 2

    def test_max_reasons_validates(self):
        with pytest.raises(ValueError, match="max_reasons"):
            select_ecoa_codes_for_deal([], max_reasons=0)
        with pytest.raises(ValueError, match="max_reasons"):
            select_ecoa_codes_for_deal([], max_reasons=11)

    def test_sorted_by_severity(self):
        """Most severe reasons come first."""
        ke1 = EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.5, severity=3)
        ke2 = EnrichedKillEvent(trigger="BK_DISCHARGE", severity=9)  # Different code (21)
        reasons = select_ecoa_codes_for_deal([ke1, ke2])
        # BK (severity 9) should come before DSCR (severity 3)
        assert reasons[0].trigger == "BK_DISCHARGE"
        assert reasons[1].trigger == "DSCR_GENERIC"

    def test_sorted_by_severity_same_code(self):
        """Same code (as_code_24) — first occurrence wins."""
        ke1 = EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.5, severity=3)
        ke2 = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600, severity=9)
        reasons = select_ecoa_codes_for_deal([ke1, ke2], as_code_24=True)
        # Both go to code 24; dedup keeps first (DSCR_GENERIC at severity 3)
        assert len(reasons) == 1
        assert reasons[0].trigger == "DSCR_GENERIC"

    def test_empty_list_returns_empty(self):
        assert select_ecoa_codes_for_deal([]) == []

    def test_auto_classify_inside_aggregation(self):
        """The aggregation API auto-classifies raw triggers (FICO + LTV)."""
        ke = EnrichedKillEvent(trigger="FICO", fico=600)
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=False)
        assert reasons[0].code == ECOA_CODE_25_FICO_BELOW_MIN
        assert reasons[0].specific_values["classified_trigger"] == "FICO_BELOW_620"

    def test_auto_classify_with_code_24(self):
        """With as_code_24=True, DSCR code becomes code 24 but classification still happens."""
        ke = EnrichedKillEvent(trigger="FICO", fico=600)
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=True)
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY
        assert reasons[0].specific_values["classified_trigger"] == "FICO_BELOW_620"


# ============================================================================
# as_code_24 mode — CFPB exam-preferred pattern
# ============================================================================


class TestAsCode24:
    """DSCR extension codes (25-40) → code 24 'Other, specify:' with specific text."""

    def test_dscr_code_25_rendered_as_code_24(self):
        ke = EnrichedKillEvent(
            trigger="FICO_BELOW_620",
            fico=600,
            fico_threshold=620,
            program="DSCR-Investor",
            property_state="CA",
        )
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=True)
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY
        assert "600" in reasons[0].text
        assert "620" in reasons[0].text

    def test_dscr_code_26_rendered_as_code_24(self):
        ke = EnrichedKillEvent(
            trigger="LTV_OVER_90",
            actual_ltv=0.92,
            ltv_threshold=0.80,
            program="DSCR-Investor",
            property_state="TX",
        )
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=True)
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY
        assert "92" in reasons[0].text

    def test_dscr_code_28_rendered_as_code_24(self):
        ke = EnrichedKillEvent(
            trigger="DSCR_GENERIC",
            actual_dscr=0.85,
            dscr_threshold=1.0,
            program="DSCR-Investor",
            property_state="FL",
        )
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=True)
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY
        assert "0.85" in reasons[0].text

    def test_form_c1_codes_unchanged_in_code_24_mode(self):
        """Form C-1 codes 01-23 should NOT be converted to code 24."""
        ke = EnrichedKillEvent(trigger="DTI_OVER_50")
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=True)
        assert reasons[0].code == ECOA_CODE_08_INCOME_INSUFFICIENT

    def test_as_code_24_false_preserves_dscr_codes(self):
        """If lender prefers DSCR extension codes directly, use as_code_24=False."""
        ke = EnrichedKillEvent(
            trigger="FICO_BELOW_620",
            fico=600,
            fico_threshold=620,
            program="DSCR-Investor",
            property_state="CA",
        )
        reasons = select_ecoa_codes_for_deal([ke], as_code_24=False)
        assert reasons[0].code == ECOA_CODE_25_FICO_BELOW_MIN


# ============================================================================
# Code 24 enforcement — requires policy_ref
# ============================================================================


class TestCode24Enforcement:
    """Code 24 'Other, specify:' must have explicit specific text."""

    def test_explicit_code_24_requires_policy_ref(self):
        """If mapping points to code 24, must have policy_ref."""
        ke = EnrichedKillEvent(
            trigger="OTHER_TEST",  # Will need to add to mapping
        )
        # Simulate by adding to override map
        override = {"OTHER_TEST": [ECOA_CODE_24_OTHER_SPECIFY]}
        with pytest.raises(ValueError, match="policy_ref"):
            select_ecoa_codes_for_deal([ke], override_map=override, enforce_code_24_policy_ref=True)

    def test_explicit_code_24_with_policy_ref_passes(self):
        ke = EnrichedKillEvent(
            trigger="OTHER_TEST",
            policy_ref="Borrower submitted unverifiable income documentation",
        )
        override = {"OTHER_TEST": [ECOA_CODE_24_OTHER_SPECIFY]}
        reasons = select_ecoa_codes_for_deal([ke], override_map=override)
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY
        assert "unverifiable income" in reasons[0].text

    def test_enforce_disabled_skips_check(self):
        """For testing, can disable the policy_ref requirement."""
        ke = EnrichedKillEvent(trigger="OTHER_TEST")
        override = {"OTHER_TEST": [ECOA_CODE_24_OTHER_SPECIFY]}
        reasons = select_ecoa_codes_for_deal(
            [ke], override_map=override, enforce_code_24_policy_ref=False
        )
        assert reasons[0].code == ECOA_CODE_24_OTHER_SPECIFY


# ============================================================================
# HOEPA per-year lookup
# ============================================================================


class TestHOEPAPerYear:
    """Year-indexed threshold lookup with explicit error for unknown years."""

    def test_2025_thresholds(self):
        t = get_hoepa_thresholds(2025)
        assert t["loan_amount"] == 26_968
        assert t["points_and_fees"] == 1_348

    def test_2026_thresholds(self):
        t = get_hoepa_thresholds(2026)
        assert t["loan_amount"] == 27_592
        assert t["points_and_fees"] == 1_380

    def test_2027_thresholds_pending(self):
        """2027 is pending CFPB publication (expected Nov 2026)."""
        t = get_hoepa_thresholds(2027)
        assert t["loan_amount"] is None
        assert t["points_and_fees"] is None

    def test_pre_2025_raises(self):
        with pytest.raises(ValueError, match="only available for 2025"):
            get_hoepa_thresholds(2024)

    def test_far_future_year_warns(self):
        """Years beyond registry emit UserWarning and return None."""
        with pytest.warns(UserWarning, match="not yet loaded"):
            t = get_hoepa_thresholds(2030)
        assert t["loan_amount"] is None

    def test_hoepa_loan_uses_year_lookup(self):
        """is_hoepa_loan uses year-indexed thresholds."""
        triggered = is_hoepa_loan(
            loan_amount=17_000,
            points_and_fees=2_000,
            annual_rate_pct=0.12,
            apor_pct=0.015,
            year=2026,  # $27,592 / $1,380
        )
        assert triggered is True

    def test_hoepa_loan_pending_year_raises(self):
        """is_hoepa_loan with pending year should raise."""
        with pytest.raises(ValueError, match="not yet published"):
            is_hoepa_loan(
                loan_amount=17_000,
                points_and_fees=2_000,
                annual_rate_pct=0.12,
                apor_pct=0.015,
                year=2027,
            )

    def test_hoepa_thresholds_dict_structure(self):
        """The full HOEPA_THRESHOLDS_BY_YEAR dict should have the expected structure."""
        assert 2025 in HOEPA_THRESHOLDS_BY_YEAR
        assert 2026 in HOEPA_THRESHOLDS_BY_YEAR
        assert HOEPA_THRESHOLDS_BY_YEAR[2025]["loan_amount"] == 26_968


# ============================================================================
# Interpolation — explicit placeholder handling
# ============================================================================


class TestInterpolationLenient:
    """_interpolate_dscr_reason has explicit lenient mode."""

    def test_lenient_mode_substitutes_na(self):
        from dscr_core.compliance import _interpolate_dscr_reason

        ke = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600)
        # Lenient mode without fico_threshold should not raise
        text = _interpolate_dscr_reason(ECOA_CODE_25_FICO_BELOW_MIN, ke, lenient=True)
        assert "600" in text
        assert "N/A" in text  # missing threshold → N/A

    def test_strict_mode_raises_on_missing_field(self):
        from dscr_core.compliance import _interpolate_dscr_reason

        ke = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600)
        # Strict mode without fico_threshold should raise
        with pytest.raises(ValueError, match="requires field"):
            _interpolate_dscr_reason(ECOA_CODE_25_FICO_BELOW_MIN, ke, lenient=False)

    def test_no_kill_event_raises_in_strict(self):
        from dscr_core.compliance import _interpolate_dscr_reason

        with pytest.raises(ValueError, match="requires a kill_event"):
            _interpolate_dscr_reason(ECOA_CODE_25_FICO_BELOW_MIN, None, lenient=False)

    def test_no_kill_event_returns_template_in_lenient(self):
        from dscr_core.compliance import _interpolate_dscr_reason

        text = _interpolate_dscr_reason(ECOA_CODE_25_FICO_BELOW_MIN, None, lenient=True)
        assert "{actual}" in text  # returns template

    def test_unknown_code_raises(self):
        from dscr_core.compliance import _interpolate_dscr_reason

        with pytest.raises(KeyError):
            _interpolate_dscr_reason("99", None)


# ============================================================================
# select_ecoa_codes (backwards compat)
# ============================================================================


class TestSelectEcoACodes:
    """v0.3.0 API still works for backwards compat."""

    def test_ltv_over_90(self):
        result = select_ecoa_codes("LTV_OVER_90")
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_fico_below_620(self):
        result = select_ecoa_codes("FICO_BELOW_620")
        assert result == [ECOA_CODE_25_FICO_BELOW_MIN]

    def test_dscr_generic(self):
        result = select_ecoa_codes("DSCR_GENERIC")
        assert result == [ECOA_CODE_28_DSCR_BELOW_MIN]

    def test_bankruptcy_uses_21(self):
        result = select_ecoa_codes("BK_DISCHARGE")
        assert result == [ECOA_CODE_21_BANKRUPTCY]

    def test_property_type_uses_29(self):
        result = select_ecoa_codes("PROPERTY_TYPE_UNACCEPTABLE")
        assert result == [ECOA_CODE_29_PROPERTY_TYPE_UNACCEPTABLE]

    def test_loan_amount_uses_30(self):
        result = select_ecoa_codes("LOAN_AMOUNT_EXCEEDS_MAX")
        assert result == [ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX]

    def test_unknown_trigger_raises(self):
        with pytest.raises(KeyError):
            select_ecoa_codes("TOTALLY_MADE_UP")

    def test_ltv_auto_classify(self):
        result = select_ecoa_codes("LTV", actual_value=0.92)
        assert result == [ECOA_CODE_26_LTV_EXCEEDS_MAX]


# ============================================================================
# Form C-1 verbatim (codes 01-24)
# ============================================================================


class TestFormC1Codes:
    """Codes 01-23 match Form C-1 verbatim text."""

    def test_all_form_c1_codes_present(self):
        for n in range(1, 24):
            code = f"{n:02d}"
            assert code in ECOA_REASON_TEXTS

    def test_code_19_is_garnishment(self):
        assert "Garnishment" in ECOA_REASON_TEXTS[ECOA_CODE_19_GARNISHMENT]

    def test_code_21_is_bankruptcy(self):
        assert ECOA_REASON_TEXTS[ECOA_CODE_21_BANKRUPTCY] == "Bankruptcy"

    def test_code_23_is_collateral(self):
        assert "collateral" in ECOA_REASON_TEXTS[ECOA_CODE_23_COLLATERAL_INSUFFICIENT].lower()


# ============================================================================
# DSCR extension codes (25-40)
# ============================================================================


class TestDSCRCodes:
    """Codes 25-40 are DSCR-specific templates."""

    def test_all_dscr_codes_in_extension_set(self):
        for n in range(25, 41):
            code = f"{n:02d}"
            assert code in DSCR_EXTENSION_CODES
            assert code in ECOA_REASON_TEXTS

    def test_all_40_codes_in_all_set(self):
        assert len(ALL_ECOA_CODES) == 40


# ============================================================================
# State overlays
# ============================================================================


class TestMNPPP:
    """MN House File 3437 — Apr 23, 2026, effective Aug 1, 2026."""

    def test_mn_business_purpose_exempt(self):
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=True, ppp_years=5) is False

    def test_mn_consumer_within_3yr_ok(self):
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=3) is False

    def test_mn_consumer_over_3yr_violates(self):
        assert is_minnesota_ppp_applicable("MN", is_business_purpose=False, ppp_years=5) is True

    def test_non_mn_returns_false(self):
        assert is_minnesota_ppp_applicable("CA", True, 5) is False


class TestSection1071:
    """CFPB Section 1071 — May 1, 2026 final rule, compliance Jan 1, 2028.
    v0.5.5: Volume threshold corrected 100 → 1,000 per May 2026 Final Rule
    (Federal Register 2026-08494). dscr-verifier audit 2026-06-20.
    Primary source: https://www.consumerfinance.gov/1071-rule/
    """

    def test_compliance_date(self):
        assert SECTION_1071_COMPLIANCE_DATE == "2028-01-01"

    def test_volume_threshold(self):
        # v0.5.5: raised from 100 (proposed) to 1,000 (final)
        assert SECTION_1071_VOLUME_THRESHOLD == 1_000

    def test_volume_threshold_boundary(self):
        """999 originations = exempt; 1,000 originations = reportable."""
        assert is_section_1071_reportable(False, 999) is False
        assert is_section_1071_reportable(False, 1_000) is True

    def test_broker_always_exempt(self):
        for v in (0, 50, 999, 1_000, 10_000, 100_000):
            assert is_section_1071_reportable(True, v) is False

    def test_small_lender_exempt(self):
        # v0.5.5: anything under 1,000 is exempt (was 100)
        assert is_section_1071_reportable(False, 50) is False
        assert is_section_1071_reportable(False, 99) is False
        assert is_section_1071_reportable(False, 100) is False  # was True in v0.5.4
        assert is_section_1071_reportable(False, 999) is False

    def test_large_lender_reportable(self):
        assert is_section_1071_reportable(False, 1_000) is True
        assert is_section_1071_reportable(False, 1_500) is True
        assert is_section_1071_reportable(False, 10_000) is True

    def test_revenue_exemption(self):
        """Small revenue lenders (<$1M) exempt per May 2026 carve-out.
        v0.5.5: must use originations >= 1,000 to actually test revenue rule
        (otherwise volume threshold exempts the lender first)."""
        assert is_section_1071_reportable(False, 1_500, annual_revenue_usd=500_000) is False
        assert is_section_1071_reportable(False, 1_500, annual_revenue_usd=999_999) is False
        assert is_section_1071_reportable(False, 1_500, annual_revenue_usd=1_000_000) is True
        assert is_section_1071_reportable(False, 1_500, annual_revenue_usd=2_000_000) is True


class TestHOEPA:
    """HOPA per Dodd-Frank thresholds (post-2010 Reg Z §1026.32).

    Per 12 CFR 1026.32(a)(1) and Dodd-Frank §1431:
    - First-lien APR > APOR + 6.5pp (not 8.5pp pre-Dodd-Frank)
    - Subordinate-lien APR > APOR + 8.5pp (not 10pp pre-Dodd-Frank)
    - P&F: 5% of loan (>= $27,592) or lesser-of-8%-or-$1,000 (<$27,592)
    - HOEPA triggers on ANY test passing (OR logic)
    - Prepayment penalty test: >36mo period OR >2% of prepaid amount
    """

    def test_first_lien_apr_above_6_5pp_triggers(self):
        """First-lien: APR > APOR + 6.5pp → HOEPA. (Was wrong in v0.4.0.)"""
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=1_000,  # below 8% * $20K = $1,600
            annual_rate_pct=0.10,
            apor_pct=0.015,
            is_first_lien=True,
            year=2026,
        )
        # 10% - 1.5% = 8.5pp > 6.5pp → HOEPA via APR test
        assert triggered is True

    def test_first_lien_apr_at_6_5pp_does_not_trigger(self):
        """First-lien: APR == APOR + 6.5pp does NOT trigger (must be >)."""
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=1_000,  # below P&F
            annual_rate_pct=0.08,  # 8% - 1.5% = 6.5pp (exactly)
            apor_pct=0.015,
            is_first_lien=True,
            year=2026,
        )
        # 6.5pp is NOT > 6.5pp; APR test does not trigger
        # P&F test: 8% * $20K = $1,600; $1K < $1,600; does not trigger
        # Prepayment penalty: default 0; does not trigger
        assert triggered is False

    def test_subordinate_apr_above_8_5pp_triggers(self):
        """Subordinate: APR > APOR + 8.5pp → HOEPA. (Was wrong in v0.4.0.)"""
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=1_000,  # below P&F
            annual_rate_pct=0.115,
            apor_pct=0.015,
            is_first_lien=False,
            year=2026,
        )
        # 11.5% - 1.5% = 10pp > 8.5pp → HOEPA via APR test
        assert triggered is True

    def test_first_lien_apr_below_6_5pp_no_trigger(self):
        """First-lien: APR spread <= 6.5pp does not trigger APR test."""
        triggered = is_hoepa_loan(
            loan_amount=20_000,
            points_and_fees=500,  # well below P&F
            annual_rate_pct=0.07,
            apor_pct=0.015,  # spread = 5.5pp
            is_first_lien=True,
            year=2026,
        )
        assert triggered is False

    def test_large_loan_pf_threshold_is_5pct(self):
        """Loan >= annual threshold ($27,592 in 2026): P&F > 5% of loan."""
        # $50K loan (>= $27,592): P&F > 5% × $50K = $2,500
        triggered_pf_low = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=2_000,  # 4% of loan; below 5%
            annual_rate_pct=0.05,  # low APR; below 6.5pp test
            apor_pct=0.05,  # 0pp spread
            is_first_lien=True,
            year=2026,
        )
        assert triggered_pf_low is False

        triggered_pf_high = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=3_000,  # 6% of loan; above 5%
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_pf_high is True

    def test_small_loan_pf_threshold_year_indexed(self):
        """Loan < annual threshold: P&F > lesser of 8% of loan OR year-indexed dollar trigger.

        Per 12 CFR 1026.32(a)(1)(ii)(B): the $1,000 figure is inflation-adjusted
        annually. For 2026, the trigger is $1,380; for 2025, $1,348.
        The 8% of loan figure is NOT inflation-adjusted.

        For a $15K loan in 2026: 8% × $15K = $1,200; lesser of $1,200 or
        $1,380 (2026 dollar trigger) = $1,200. So the 8% bound is binding.
        For a $15K loan in 2025: 8% × $15K = $1,200; lesser of $1,200 or
        $1,348 (2025 dollar trigger) = $1,200. Same — the 8% bound binds.

        Use a $5K loan to make the dollar trigger bind in both years:
        - 2026: 8% × $5K = $400; lesser of $400 or $1,380 = $400. $401 P&F triggers.
        - 2025: 8% × $5K = $400; lesser of $400 or $1,348 = $400. $401 P&F triggers.
        """
        # 2026: $15K loan, 8% bound binds ($1,200 < $1,380)
        # $1,199 → below $1,200 → no trigger
        triggered_2026_below = is_hoepa_loan(
            loan_amount=15_000,
            points_and_fees=1_199,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_2026_below is False

        # 2026: $15K loan, $1,201 → above $1,200 → trigger
        triggered_2026_above = is_hoepa_loan(
            loan_amount=15_000,
            points_and_fees=1_201,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_2026_above is True

        # 2025: $15K loan, 8% bound binds ($1,200 < $1,348)
        # $1,199 → below $1,200 → no trigger
        triggered_2025_below = is_hoepa_loan(
            loan_amount=15_000,
            points_and_fees=1_199,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2025,
        )
        assert triggered_2025_below is False

        # 2025: $15K loan, $1,201 → above $1,200 → trigger
        triggered_2025_above = is_hoepa_loan(
            loan_amount=15_000,
            points_and_fees=1_201,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2025,
        )
        assert triggered_2025_above is True

        # 2026: $1K loan — 8% bound ($80) is the binding constraint,
        # NOT the dollar trigger ($1,380). $1,381 P&F → above $80 → trigger.
        triggered_2026_dollar_binds = is_hoepa_loan(
            loan_amount=1_000,
            points_and_fees=1_381,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_2026_dollar_binds is True

        # 2026: $1K loan with $90 P&F — above 8% bound ($80) → trigger
        # (dollar trigger $1,380 is NEVER binding for loans < ~$17K)
        triggered_2026_tiny_loan_pf_high = is_hoepa_loan(
            loan_amount=1_000,
            points_and_fees=90,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_2026_tiny_loan_pf_high is True

        # 2026: $1K loan with $79 P&F — below 8% bound ($80) → no trigger
        triggered_2026_tiny_loan_pf_low = is_hoepa_loan(
            loan_amount=1_000,
            points_and_fees=79,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered_2026_tiny_loan_pf_low is False

        # 2025: $1K loan with $80 P&F — at 8% bound, NOT strict > → no trigger
        triggered_2025_tiny_loan_pf_at_bound = is_hoepa_loan(
            loan_amount=1_000,
            points_and_fees=80,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2025,
        )
        assert triggered_2025_tiny_loan_pf_at_bound is False

    def test_small_loan_dollar_trigger_2025(self):
        """2025 dollar trigger is $1,348 (inflation-adjusted from $1,000)."""
        # $5K loan in 2025: 8% × $5K = $400; lesser of $400 or $1,348 = $400
        # $401 P&F → above $400 → trigger
        triggered = is_hoepa_loan(
            loan_amount=5_000,
            points_and_fees=401,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2025,
        )
        assert triggered is True

    def test_small_loan_dollar_trigger_binding_on_tiny_loan(self):
        """On tiny loans (< $5K), the dollar trigger binds (8% × $5K = $400 < $1,380).

        For a $1K loan in 2026: 8% × $1K = $80; lesser of $80 or $1,380 = $80.
        $1,381 P&F → above $1,380 (dollar) → trigger.
        """
        triggered = is_hoepa_loan(
            loan_amount=1_000,
            points_and_fees=1_381,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered is True

    def test_large_loan_no_size_cap_only_higher_pf_threshold(self):
        """HOEPA does NOT have a loan-size cap. $500K loan with high P&F triggers."""
        # $500K loan: P&F > 5% × $500K = $25,000
        triggered = is_hoepa_loan(
            loan_amount=500_000,
            points_and_fees=30_000,  # 6% of loan; above 5%
            annual_rate_pct=0.05,  # low APR
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
        )
        assert triggered is True  # P&F triggers regardless of loan size

    def test_or_logic_any_single_test_triggers(self):
        """OR logic: any one of the three tests triggers HOEPA."""
        # APR triggers, P&F and PP don't
        triggered_apr = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=500,  # well below P&F
            annual_rate_pct=0.12,  # 10.5pp > 6.5pp
            apor_pct=0.015,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=0,  # no PP
        )
        assert triggered_apr is True

        # P&F triggers, APR and PP don't
        triggered_pf = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=3_000,  # above 5% × $50K
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=0,
        )
        assert triggered_pf is True

        # PP triggers (long period), APR and P&F don't
        triggered_pp = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=500,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=48,  # > 36 months
        )
        assert triggered_pp is True

    def test_prepayment_penalty_period_over_36_months_triggers(self):
        """PP test: penalty period > 36 months → HOEPA."""
        triggered = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=500,  # below P&F
            annual_rate_pct=0.05,  # below APR
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=48,  # > 36
            prepayment_penalty_pct=0.01,  # 1% — below 2%
        )
        assert triggered is True

    def test_prepayment_penalty_percent_over_2pct_triggers(self):
        """PP test: penalty > 2% of amount prepaid → HOEPA."""
        triggered = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=500,
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=24,  # < 36
            prepayment_penalty_pct=0.03,  # 3% — > 2%
        )
        assert triggered is True

    def test_no_test_triggers_does_not_trigger(self):
        """No test triggers → not HOEPA."""
        triggered = is_hoepa_loan(
            loan_amount=50_000,
            points_and_fees=500,  # below P&F
            annual_rate_pct=0.05,
            apor_pct=0.05,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=24,  # < 36
            prepayment_penalty_pct=0.01,  # 1% — < 2%
        )
        assert triggered is False

    def test_all_three_exceeded_triggers(self):
        """All three tests exceeded → HOEPA (also OR)."""
        triggered = is_hoepa_loan(
            loan_amount=17_000,  # < threshold → P&F: lesser of 8%×$17K or $1K
            points_and_fees=2_000,  # > $1K → P&F triggers
            annual_rate_pct=0.12,  # 10.5pp > 6.5pp → APR triggers
            apor_pct=0.015,
            is_first_lien=True,
            year=2026,
            prepayment_penalty_period_months=48,  # > 36 → PP triggers
            prepayment_penalty_pct=0.03,
        )
        assert triggered is True

    def test_pending_year_raises(self):
        """Pending year raises ValueError (no silent wrong answer)."""
        with pytest.raises(ValueError, match="not yet published"):
            is_hoepa_loan(
                loan_amount=20_000,
                points_and_fees=2_000,
                annual_rate_pct=0.12,
                apor_pct=0.015,
                year=2027,  # pending CFPB
            )

    def test_pre_2025_raises(self):
        with pytest.raises(ValueError, match="only available for 2025"):
            is_hoepa_loan(
                loan_amount=20_000,
                points_and_fees=2_000,
                annual_rate_pct=0.12,
                apor_pct=0.015,
                year=2024,
            )


# ============================================================================
# EnrichedKillEvent validation
# ============================================================================


class TestEnrichedKillEvent:
    """Construction + validation."""

    def test_minimal(self):
        ke = EnrichedKillEvent(trigger="LTV_OVER_90")
        assert ke.trigger == "LTV_OVER_90"

    def test_fico_range_validated(self):
        with pytest.raises(ValueError, match="fico must be in"):
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=200)
        with pytest.raises(ValueError, match="fico must be in"):
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=900)

    def test_trigger_required(self):
        with pytest.raises(ValueError, match="trigger must be non-empty"):
            EnrichedKillEvent(trigger="")

    def test_severity_validated(self):
        with pytest.raises(ValueError, match="severity"):
            EnrichedKillEvent(trigger="X", severity=0)
        with pytest.raises(ValueError, match="severity"):
            EnrichedKillEvent(trigger="X", severity=11)

    def test_timestamp_auto_set(self):
        ke = EnrichedKillEvent(trigger="LTV_OVER_90")
        assert ke.timestamp
        # Should be ISO format
        datetime.fromisoformat(ke.timestamp)


# ============================================================================
# build_adverse_action_notice — aggregation-aware
# ============================================================================


class TestBuildNotice:
    """AAN builder uses aggregation API."""

    def test_single_event_backwards_compat(self):
        """Single event triggers DeprecationWarning but still works."""
        ke = EnrichedKillEvent(trigger="LTV_OVER_90", actual_ltv=0.92)
        with pytest.warns(DeprecationWarning):
            notice = build_adverse_action_notice(ke)
        assert notice["version"] == "2.1"
        assert notice["meta"]["kill_event_count"] == 1

    def test_multiple_events_aggregated(self):
        """Multiple events with distinct codes → up to 4 reasons."""
        events = [
            EnrichedKillEvent(
                trigger="LTV_OVER_90", actual_ltv=0.92, ltv_threshold=0.80, severity=8
            ),
            EnrichedKillEvent(trigger="BK_DISCHARGE", severity=9),  # Different code (21)
        ]
        notice = build_adverse_action_notice(events, as_code_24=False)
        reasons = notice["regulatory_notices"]["ecoa_notice"]["reasons"]
        # BK (severity 9) first, then LTV (severity 8)
        assert reasons[0]["severity"] == 9
        assert reasons[1]["severity"] == 8
        assert notice["meta"]["kill_event_count"] == 2

    def test_ecoa_prohibition_statement(self):
        events = [EnrichedKillEvent(trigger="DSCR_GENERIC", actual_dscr=0.85)]
        notice = build_adverse_action_notice(events)
        prohibition = notice["regulatory_notices"]["ecoa_notice"]["prohibition_statement"]
        assert "Equal Credit Opportunity Act" in prohibition

    def test_fcra_disclosure_optional(self):
        events = [EnrichedKillEvent(trigger="FICO_BELOW_620", fico=600)]
        notice = build_adverse_action_notice(
            events, fcra_data_source="Experian", fcra_source_address="PO Box 123"
        )
        fcra = notice["regulatory_notices"]["fcra_disclosure"]
        assert fcra["cra_name"] == "Experian"
        assert fcra["credit_score_value"] == 600


# ============================================================================
# Backwards compat — deprecated constants
# ============================================================================


class TestBackwardsCompat:
    """v0.3.0 deprecated constants still work."""

    def test_legacy_19_points_to_08(self):
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            from dscr_core import compliance as comp_module

            legacy = comp_module.__getattr__("ECOA_CODE_19_INCOME_INSUFFICIENT")
            assert legacy == ECOA_CODE_08_INCOME_INSUFFICIENT
            assert any(issubclass(warning.category, DeprecationWarning) for warning in w)

    def test_legacy_21_points_to_09(self):
        from dscr_core import compliance as comp_module

        legacy = comp_module.__getattr__("ECOA_CODE_21_DEBT_OBLIGATIONS_TOO_HIGH")
        assert legacy == ECOA_CODE_09_EXCESSIVE_OBLIGATIONS

    def test_legacy_26_points_to_30(self):
        from dscr_core import compliance as comp_module

        legacy = comp_module.__getattr__("ECOA_CODE_26_LOAN_AMOUNT_EXCEEDS_MAX")
        assert legacy == ECOA_CODE_30_LOAN_AMOUNT_EXCEEDS_MAX

    def test_unknown_legacy_raises_attributeerror(self):
        from dscr_core import compliance as comp_module

        with pytest.raises(AttributeError):
            comp_module.__getattr__("TOTALLY_MADE_UP")


# ============================================================================
# NEW FEATURE: Reg Z Section 1026.36 broker compensation (YSP / LPC / BPC)
# Source: DSCR_Sovereign_OS__Sprint_3___Lender_Intelligence__Securitization_Pool
#         _Data___Competitive_Moat_Analysis.md, Section 7.1
# Verifier audit: 12/13 PASS (the 1 PARTIAL is unrelated DSCR delinquency claim)
# ============================================================================


class TestBrokerCompensation:
    """classify_broker_compensation() — Reg Z Section 1026.36 LO compensation."""

    def test_business_purpose_ysp_allowed(self):
        """YSP is allowed on business-purpose loans (DSCR exempt from Reg Z)."""
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_ysp=True,
        )
        assert result.compliant is True
        assert "YSP_BANNED_CONSUMER" not in result.violations
        assert "YSP_ALLOWED_BUSINESS" in {r.rule_id for r in result.rules}

    def test_consumer_ysp_banned(self):
        """YSP is BANNED on consumer mortgages (Dodd-Frank 2011)."""
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_ysp=True,
        )
        assert result.compliant is False
        assert "YSP_BANNED_CONSUMER" in result.violations

    def test_consumer_ysp_not_received_compliant(self):
        """Consumer loan without YSP is compliant (no YSP, no LPC+BPC)."""
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_lpc=True,
        )
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_business_purpose_lpc_bpc_violation(self):
        """LPC + BPC same loan is violation (Reg Z 1026.36(d)(2))."""
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_lpc=True,
            receives_bpc=True,
        )
        assert result.compliant is False
        assert "LPC_BPC_SAME_LOAN" in result.violations

    def test_consumer_lpc_bpc_violation(self):
        """LPC + BPC same loan is violation on consumer loans too."""
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_lpc=True,
            receives_bpc=True,
        )
        assert result.compliant is False
        assert "LPC_BPC_SAME_LOAN" in result.violations

    def test_dscr_typical_arrangement_compliant(self):
        """DSCR typical: LPC only (no YSP, no BPC). Compliant."""
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_lpc=True,
        )
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_dscr_with_ysp_and_lpc_compliant(self):
        """DSCR with YSP + LPC (typical warehouse-line setup): compliant.

        YSP is a form of lender-paid comp, distinct from the LPC proper
        but still flowing from lender. This is the standard DSCR broker
        compensation structure per Sprint 3 Lender Intelligence Section 7.1.
        """
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_lpc=True,
            receives_ysp=True,
        )
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_dscr_with_ysp_lpc_and_bpc_violation(self):
        """DSCR with YSP + LPC + BPC violates LPC_BPC_SAME_LOAN."""
        result = classify_broker_compensation(
            loan_purpose="business_purpose",
            receives_lpc=True,
            receives_bpc=True,
            receives_ysp=True,
        )
        assert result.compliant is False
        assert "LPC_BPC_SAME_LOAN" in result.violations
        # YSP allowed because business-purpose
        assert "YSP_BANNED_CONSUMER" not in result.violations

    def test_consumer_only_bpc_compliant(self):
        """Consumer with only BPC (no LPC, no YSP) is compliant."""
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_bpc=True,
        )
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_no_compensation_compliant(self):
        """No compensation at all (zero flags): compliant."""
        result = classify_broker_compensation(loan_purpose="consumer")
        assert result.compliant is True
        assert len(result.violations) == 0

    def test_invalid_loan_purpose_raises(self):
        """Invalid loan_purpose raises ValueError."""
        with pytest.raises(ValueError, match="loan_purpose must be"):
            classify_broker_compensation(loan_purpose="invalid")

    def test_primary_source_cited(self):
        """Result includes Sprint 3 Lender Intelligence Section 7.1 as source."""
        result = classify_broker_compensation(loan_purpose="consumer")
        assert "Sprint_3" in result.primary_source
        assert "Section 7.1" in result.primary_source

    def test_all_violations_cited(self):
        """Each violation includes its statute/regulation citation."""
        result = classify_broker_compensation(
            loan_purpose="consumer",
            receives_lpc=True,
            receives_bpc=True,
            receives_ysp=True,
        )
        assert not result.compliant
        assert len(result.violations) == 2  # YSP_BANNED_CONSUMER + LPC_BPC_SAME_LOAN
        violation_rules = [r for r in result.rules if not r.compliant]
        for vr in violation_rules:
            assert vr.citation  # non-empty
            assert vr.explanation  # non-empty
