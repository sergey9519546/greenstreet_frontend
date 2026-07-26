"""
DSCR Sovereign OS — PPP Rules Engine Tests
Covers all 11 states in the PPP matrix: PA, OH, MN, NJ, NY, CA, FL, WA, IL, MS, AK
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from ppp_rules import (
    PPPEligibility,
    StatePPPRule,
    PPP_MATRIX,
    check_ppp_eligibility,
)

# ── Constants ───────────────────────────────────────────────────────────────
PA_THRESHOLD = 329_411
OH_THRESHOLD = 116_356
FL_THRESHOLD = 100_000


# ═══════════════════════════════════════════════════════════════════════════
# 1. Matrix completeness — all 11 states present
# ═══════════════════════════════════════════════════════════════════════════
class TestMatrixCompleteness:
    """Verify all 11 states are defined in the PPP matrix"""

    EXPECTED_STATES = {"PA", "OH", "MN", "NJ", "NY", "CA", "FL", "WA", "IL", "MS", "AK"}

    def test_all_11_states_present(self):
        assert set(PPP_MATRIX.keys()) == self.EXPECTED_STATES

    def test_each_rule_is_stateppprule(self):
        for code, rule in PPP_MATRIX.items():
            assert isinstance(rule, StatePPPRule), f"{code} rule is not StatePPPRule"

    def test_each_rule_has_statute(self):
        for code, rule in PPP_MATRIX.items():
            assert rule.statute, f"{code} missing statute"

    def test_each_rule_has_notes(self):
        for code, rule in PPP_MATRIX.items():
            assert rule.notes, f"{code} missing notes"


# ═══════════════════════════════════════════════════════════════════════════
# 2. Business-purpose exemption states (6 states: OH, MN, CA, FL, IL, AK)
# ═══════════════════════════════════════════════════════════════════════════
class TestBusinessExemptStates:
    """States where business-purpose loans are exempt from PPP restrictions"""

    @pytest.mark.parametrize("state", ["OH", "MN", "CA", "FL", "IL", "AK"])
    def test_business_exempt_llc(self, state):
        result = check_ppp_eligibility(
            state=state,
            entity_type="LLC",
            loan_amount=500_000,  # Above all thresholds
            unit_count=2,
            is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED
        assert "Business-purpose exempt" in result["notes"]

    @pytest.mark.parametrize("state", ["OH", "MN", "CA", "FL", "IL", "AK"])
    def test_business_exempt_corp(self, state):
        result = check_ppp_eligibility(
            state=state,
            entity_type="Corp",
            loan_amount=500_000,
            unit_count=2,
            is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED


# ═══════════════════════════════════════════════════════════════════════════
# 3. Threshold-based states: PA, OH, FL
# ═══════════════════════════════════════════════════════════════════════════
class TestPAThreshold:
    """PA Act 6/LIPL — threshold $329,411"""

    def test_pa_below_threshold_prohibited(self):
        result = check_ppp_eligibility(
            state="PA", entity_type="Individual",
            loan_amount=200_000, unit_count=1, is_business_purpose=False,
        )
        assert result["eligibility"] == PPPEligibility.PROHIBITED
        assert result["threshold"] == PA_THRESHOLD

    def test_pa_above_threshold_consumer_ambiguous(self):
        result = check_ppp_eligibility(
            state="PA", entity_type="Individual",
            loan_amount=400_000, unit_count=1, is_business_purpose=False,
        )
        # Above threshold, consumer — ambiguous
        assert result["eligibility"] in (PPPEligibility.AMBIGUOUS, PPPEligibility.ALLOWED)

    def test_pa_above_threshold_business_allowed(self):
        result = check_ppp_eligibility(
            state="PA", entity_type="LLC",
            loan_amount=400_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED

    def test_pa_exact_threshold(self):
        """At exact threshold — loan_amount == threshold is NOT below"""
        result = check_ppp_eligibility(
            state="PA", entity_type="Individual",
            loan_amount=PA_THRESHOLD, unit_count=1, is_business_purpose=False,
        )
        # At threshold: not < threshold, so not prohibited by threshold check
        assert result["eligibility"] != PPPEligibility.PROHIBITED or "below" not in result["notes"]


class TestOHThreshold:
    """OH ORC §1343.011 — threshold $116,356, 1% cap, 5yr term"""

    def test_oh_below_threshold_prohibited(self):
        result = check_ppp_eligibility(
            state="OH", entity_type="Individual",
            loan_amount=80_000, unit_count=1, is_business_purpose=False,
        )
        assert result["eligibility"] == PPPEligibility.PROHIBITED
        assert result["threshold"] == OH_THRESHOLD

    def test_oh_above_threshold_business_allowed(self):
        result = check_ppp_eligibility(
            state="OH", entity_type="LLC",
            loan_amount=200_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED

    def test_oh_rule_has_1pct_cap(self):
        rule = PPP_MATRIX["OH"]
        assert rule.max_ppp_pct == 0.01

    def test_oh_rule_has_5yr_term(self):
        rule = PPP_MATRIX["OH"]
        assert rule.ppp_term_years == 5


class TestFLThreshold:
    """FL Stat. §687.04 — threshold $100,000"""

    def test_fl_below_threshold_prohibited(self):
        result = check_ppp_eligibility(
            state="FL", entity_type="Individual",
            loan_amount=50_000, unit_count=1, is_business_purpose=False,
        )
        assert result["eligibility"] == PPPEligibility.PROHIBITED
        assert result["threshold"] == FL_THRESHOLD

    def test_fl_above_threshold_business_allowed(self):
        result = check_ppp_eligibility(
            state="FL", entity_type="LLC",
            loan_amount=300_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED


# ═══════════════════════════════════════════════════════════════════════════
# 4. State-specific logic
# ═══════════════════════════════════════════════════════════════════════════
class TestNJLLCHighRisk:
    """NJ LLCs are HIGH-RISK per Arc Home update"""

    def test_nj_llc_high_risk(self):
        result = check_ppp_eligibility(
            state="NJ", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.HIGH_RISK
        assert "HIGH-RISK" in result["notes"]

    def test_nj_corp_not_high_risk(self):
        result = check_ppp_eligibility(
            state="NJ", entity_type="Corp",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED

    def test_nj_business_exempt_false(self):
        rule = PPP_MATRIX["NJ"]
        assert rule.business_exempt is False


class TestMSDecliningOnly:
    """MS max declining structure 5-4-3-2-1"""

    def test_ms_declining_only(self):
        result = check_ppp_eligibility(
            state="MS", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.DECLINING_ONLY
        assert "5-4-3-2-1" in result["notes"]

    def test_ms_business_not_exempt(self):
        rule = PPP_MATRIX["MS"]
        assert rule.business_exempt is False


class TestAKIndividualProhibited:
    """AK: Individual prohibited, LLC/Corp allowed"""

    def test_ak_individual_prohibited(self):
        result = check_ppp_eligibility(
            state="AK", entity_type="Individual",
            loan_amount=500_000, unit_count=1, is_business_purpose=False,
        )
        assert result["eligibility"] == PPPEligibility.PROHIBITED
        assert "individual prohibited" in result["notes"].lower() or "Individual" in result["notes"]

    def test_ak_llc_allowed(self):
        result = check_ppp_eligibility(
            state="AK", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED

    def test_ak_corp_allowed(self):
        result = check_ppp_eligibility(
            state="AK", entity_type="Corp",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED


class TestNYUsuryCap:
    """NY Penal Law §190.40 — 25% criminal usury cap"""

    def test_ny_rule_has_25pct_cap(self):
        rule = PPP_MATRIX["NY"]
        assert rule.max_ppp_pct == 0.25

    def test_ny_business_allowed(self):
        result = check_ppp_eligibility(
            state="NY", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED


class TestMNBusinessExempt:
    """MN HF 3437 — business-purpose entirely outside scope"""

    def test_mn_business_exempt(self):
        rule = PPP_MATRIX["MN"]
        assert rule.business_exempt is True

    def test_mn_no_threshold(self):
        rule = PPP_MATRIX["MN"]
        assert rule.threshold is None

    def test_mn_effective_date_aug2026(self):
        rule = PPP_MATRIX["MN"]
        assert rule.effective_date == "2026-08-01"


class TestWAandIL:
    """WA and IL baseline tests"""

    def test_wa_business_not_exempt(self):
        rule = PPP_MATRIX["WA"]
        assert rule.business_exempt is False

    def test_wa_business_allowed(self):
        result = check_ppp_eligibility(
            state="WA", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED

    def test_il_business_exempt(self):
        rule = PPP_MATRIX["IL"]
        assert rule.business_exempt is True

    def test_il_business_allowed(self):
        result = check_ppp_eligibility(
            state="IL", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.ALLOWED


class TestUnknownState:
    """Unknown state code returns AMBIGUOUS with counsel note"""

    def test_unknown_state_ambiguous(self):
        result = check_ppp_eligibility(
            state="ZZ", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.AMBIGUOUS
        assert "counsel" in result["notes"].lower()
        assert result["statute"] is None

    def test_unknown_state_lowercase(self):
        """Lowercase input should be normalized"""
        result = check_ppp_eligibility(
            state="zz", entity_type="LLC",
            loan_amount=500_000, unit_count=2, is_business_purpose=True,
        )
        assert result["eligibility"] == PPPEligibility.AMBIGUOUS


class TestAllStatesBusinessAllowed:
    """All 11 states should produce a non-PROHIBITED result for business-purpose Corp loans above thresholds"""

    @pytest.mark.parametrize("state", sorted(PPP_MATRIX.keys()))
    def test_business_purpose_above_threshold(self, state):
        result = check_ppp_eligibility(
            state=state,
            entity_type="Corp",  # Corp to avoid NJ LLC issue
            loan_amount=500_000,
            unit_count=2,
            is_business_purpose=True,
        )
        # All states should allow or provide specific structure for business-purpose Corp above threshold
        # MS returns DECLINING_ONLY (not a failure — it's the correct state-specific rule)
        # PROHIBITED would be a failure
        assert result["eligibility"] != PPPEligibility.PROHIBITED, (
            f"{state}: unexpectedly PROHIBITED"
        )
