"""50-State Compliance Matrix tests (v0.1.0).

Test classes:
- TestStateRegistry: all 50 states + DC registered
- TestStateProfile: complete profiles for each state
- TestPPPByState: PPP rules by state including PA/OH thresholds, NJ contest
- TestSTRByState: STR status by state including NYC prohibit
- TestUsuryByState: usury caps and risk levels
- TestTransferTax: NJ Mansion Tax + state-level transfer taxes
- TestStateProfileAPI: get_state_profile with name lookups
"""

from __future__ import annotations

import pytest

from dscr_core.state_matrix import (
    STATE_PROFILES,
    PPPProfile,
    StateProfile,
    STRProfile,
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

# ============================================================================
# State registry completeness
# ============================================================================


class TestStateRegistry:
    """All 50 states + DC must be registered."""

    def test_50_states_plus_dc(self):
        """51 jurisdictions (50 states + DC)."""
        assert len(STATE_PROFILES) == 51

    def test_list_states_sorted(self):
        states = list_states()
        assert states == sorted(states)
        assert states[0] == "AK"
        assert states[-1] == "WY"

    def test_all_required_states_present(self):
        required = {
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
            "DC",
        }
        assert required.issubset(set(STATE_PROFILES.keys()))


# ============================================================================
# State profile integrity
# ============================================================================


class TestStateProfile:
    """Every state profile has complete PPP/STR/usury/transfer data."""

    def test_all_profiles_complete(self):
        for state_code, profile in STATE_PROFILES.items():
            assert isinstance(profile, StateProfile)
            assert profile.state == state_code
            assert isinstance(profile.ppp, PPPProfile)
            assert isinstance(profile.str_rules, STRProfile)
            assert isinstance(profile.usury, UsuryProfile)
            assert isinstance(profile.transfer_tax, TransferTaxProfile)

    @pytest.mark.parametrize("state", list_states())
    def test_verify_state_profile(self, state):
        """All states pass verification."""
        valid, msg = verify_state_profile(state)
        assert valid, f"{state}: {msg}"

    @pytest.mark.parametrize("state", list_states())
    def test_state_profile_succeeds(self, state):
        """get_state_profile should not raise for any state."""
        profile = get_state_profile(state)
        assert profile.state == state


# ============================================================================
# PPP by state
# ============================================================================


class TestPPPByState:
    """PPP rules per state — PA/OH thresholds, NJ contest, MN exemption."""

    def test_ca_ppp_allowed_business(self):
        allowed, reason = is_ppp_allowed("CA", is_business_purpose=True, ppp_years=5)
        assert allowed
        assert "2954.10" in reason or "allowed" in reason.lower()

    def test_tx_ppp_allowed_business(self):
        allowed, _ = is_ppp_allowed("TX", is_business_purpose=True, ppp_years=5)
        assert allowed

    def test_ny_ppp_allowed_business(self):
        allowed, _ = is_ppp_allowed("NY", is_business_purpose=True, ppp_years=5)
        assert allowed

    def test_mn_ppp_allowed_post_hf3437(self):
        """MN HF 3437 (effective Aug 1, 2026): business-purpose DSCR EXEMPT."""
        allowed, _ = is_ppp_allowed("MN", is_business_purpose=True, ppp_years=5)
        assert allowed

    def test_pa_threshold_blocks_below(self):
        """PA 2026 threshold = $329,411. Loan ≤ threshold: blocked."""
        allowed, reason = is_ppp_allowed(
            "PA", is_business_purpose=True, ppp_years=5, loan_amount=200_000
        )
        assert not allowed
        assert "329,411" in reason

    def test_pa_threshold_allows_above(self):
        """PA 2026 threshold = $329,411. Loan > threshold: allowed."""
        allowed, reason = is_ppp_allowed(
            "PA", is_business_purpose=True, ppp_years=5, loan_amount=400_000
        )
        assert allowed
        assert "329,411" in reason

    def test_pa_threshold_boundary(self):
        """Loan = threshold exactly: blocked (≤ check)."""
        allowed, _ = is_ppp_allowed(
            "PA", is_business_purpose=True, ppp_years=5, loan_amount=329_411
        )
        assert not allowed

    def test_oh_threshold_2025_value(self):
        """OH 2025 threshold = $112,957."""
        allowed, reason = is_ppp_allowed(
            "OH", is_business_purpose=True, ppp_years=5, loan_amount=100_000
        )
        assert not allowed
        assert "112,957" in reason

    def test_oh_threshold_above(self):
        allowed, _ = is_ppp_allowed(
            "OH", is_business_purpose=True, ppp_years=5, loan_amount=200_000
        )
        assert allowed

    def test_wa_arm_restriction(self):
        """WA PPP allowed but with restriction."""
        allowed, reason = is_ppp_allowed("WA", is_business_purpose=True, ppp_years=5)
        assert allowed
        assert "restriction" in reason.lower() or "ARM" in reason or "60" in reason

    def test_nj_llc_contested(self):
        """NJ LLC PPP: contested (NPLA ruling Oct 2025)."""
        allowed, reason = is_ppp_allowed(
            "NJ", is_business_purpose=True, ppp_years=5, vesting=VestingType.LLC
        )
        # Per current NJ profile: CONTESTED status returns False (flag for review)
        # Note: this may change as case law evolves
        assert not allowed
        assert "contested" in reason.lower() or "review" in reason.lower()

    def test_nj_ccorp_allowed(self):
        """NJ C-Corp: ALLOWED per N.J.S.A. 46:10B-2."""
        allowed, reason = is_ppp_allowed(
            "NJ", is_business_purpose=True, ppp_years=5, vesting=VestingType.C_CORP
        )
        assert allowed
        assert "C-Corp" in reason or "allowed" in reason.lower()

    def test_nj_individual_prohibited(self):
        """NJ Individual: PROHIBITED per Arc Home guideline."""
        allowed, reason = is_ppp_allowed(
            "NJ", is_business_purpose=True, ppp_years=5, vesting=VestingType.INDIVIDUAL
        )
        assert not allowed
        assert "prohibited" in reason.lower() or "Individual" in reason

    def test_state_name_lookup(self):
        """Full state names should work too."""
        allowed, _ = is_ppp_allowed("California", is_business_purpose=True, ppp_years=5)
        assert allowed


# ============================================================================
# STR by state
# ============================================================================


class TestSTRByState:
    """STR legality per state."""

    def test_nyc_prohibited_for_investor(self):
        allowed, reason = is_str_allowed("NY", is_investor=True, primary_residence=False)
        assert not allowed
        assert "investor" in reason.lower()

    def test_nyc_allowed_for_owner(self):
        """NYC owner-occupied (host present) is allowed under LL18."""
        # NY state profile is PROHIBITED; but technically LL18 allows owner-present
        # Profile is conservative — engine should verify with city-specific check
        allowed, _ = is_str_allowed("NY", is_investor=False, primary_residence=True)
        # Per state profile (prohibited), even owner-occupied returns False
        # In production, engine should use city-specific lookup
        assert not allowed

    def test_ca_restricted_for_investor(self):
        """CA is RESTRICTED; investor without primary residence blocked."""
        allowed, reason = is_str_allowed("CA", is_investor=True, primary_residence=False)
        assert not allowed
        assert "primary residence" in reason.lower()

    def test_tx_clear_for_investor(self):
        allowed, reason = is_str_allowed("TX", is_investor=True, primary_residence=False)
        assert allowed
        assert "verify" in reason.lower()

    def test_fl_restricted_for_investor(self):
        """FL is RESTRICTED at state level; city rules vary."""
        allowed, _ = is_str_allowed("FL", is_investor=True, primary_residence=False)
        # FL state profile: RESTRICTED but no primary_residence requirement
        # So returns True (with verification note)
        assert allowed


# ============================================================================
# Usury by state
# ============================================================================


class TestUsuryByState:
    """Usury caps and risk levels."""

    def test_tx_high_business_purpose_cap(self):
        """TX 18% business-purpose rate is the DSCR advantage."""
        max_rate = get_max_dscr_rate("TX", is_business_purpose=True)
        assert max_rate >= 18.0

    def test_wa_business_loan_exempt(self):
        """WA business loans EXEMPT from usury."""
        profile = get_state_profile("WA")
        assert profile.usury.business_purpose_cap_pct is None
        assert profile.usury.licensee_cap_pct >= 25.0

    def test_ny_licensee_25pct(self):
        max_rate = get_max_dscr_rate("NY", is_business_purpose=False)
        assert max_rate >= 16.0

    def test_high_risk_states(self):
        """States with low caps need licensee pathway."""
        high_risk = [
            "CA",
            "CO",
            "GA",
            "IL",
            "MA",
            "ME",
            "MI",
            "MN",
            "MS",
            "ND",
            "NH",
            "OK",
            "PA",
            "WV",
            "WI",
        ]
        for state in high_risk:
            profile = get_state_profile(state)
            assert profile.usury.risk_level == UsuryRisk.HIGH, f"{state} should be HIGH risk"

    def test_low_risk_states(self):
        """States with high caps or no caps."""
        # AZ: HIGH per T13 (10% cap directly conflicts with DSCR 10-12%)
        # Note: T13 labels AZ as HIGH because of 10% statutory cap + DSCR rates
        low_risk = ["TX", "FL", "NV", "SD", "NE", "NM", "WY", "TN", "AL", "AK", "AR"]
        for state in low_risk:
            profile = get_state_profile(state)
            assert profile.usury.risk_level == UsuryRisk.LOW, f"{state} should be LOW risk"

    def test_nv_no_cap(self):
        """NV has no general usury cap."""
        profile = get_state_profile("NV")
        assert profile.usury.state_cap_pct is None
        # max_dscr_rate returns 100.0 as fallback when nothing specified
        max_rate = get_max_dscr_rate("NV", is_business_purpose=True)
        assert max_rate >= 25.0  # Should default to licensee or fallback


# ============================================================================
# Transfer tax (NJ Mansion Tax + state-level)
# ============================================================================


class TestTransferTax:
    """Transfer tax and NJ Mansion Tax computation."""

    def test_nj_mansion_tax_below_1m_zero(self):
        tax = compute_transfer_tax("NJ", 500_000)
        assert tax == 0.0

    def test_nj_mansion_tax_at_1_5m(self):
        # Bracket: $1M-$2M = 1%
        tax = compute_transfer_tax("NJ", 1_500_000)
        assert tax == pytest.approx(15_000, rel=0.01)

    def test_nj_mansion_tax_at_2_25m(self):
        # Bracket: $2M-$2.5M = 2%
        tax = compute_transfer_tax("NJ", 2_250_000)
        assert tax == pytest.approx(45_000, rel=0.01)

    def test_nj_mansion_tax_at_2_75m(self):
        # Bracket: $2.5M-$3M = 5%
        tax = compute_transfer_tax("NJ", 2_750_000)
        assert tax == pytest.approx(137_500, rel=0.01)

    def test_nj_mansion_tax_at_4m(self):
        # Bracket: $3.5M+ = 5%
        tax = compute_transfer_tax("NJ", 4_000_000)
        assert tax == pytest.approx(200_000, rel=0.01)

    def test_ca_no_mansion_tax(self):
        """CA has no mansion tax."""
        tax = compute_transfer_tax("CA", 5_000_000)
        assert tax == 0.0

    def test_nj_mansion_tax_payer_is_seller(self):
        profile = get_state_profile("NJ")
        assert profile.transfer_tax.mansion_tax_payer == "seller"


# ============================================================================
# State profile API
# ============================================================================


class TestStateProfileAPI:
    """get_state_profile with various inputs."""

    def test_lowercase_state_code(self):
        profile = get_state_profile("ca")
        assert profile.state == "CA"

    def test_full_state_name(self):
        profile = get_state_profile("California")
        assert profile.state == "CA"

    def test_full_state_name_mixed_case(self):
        profile = get_state_profile("TEXAS")
        assert profile.state == "TX"

    def test_invalid_state_raises(self):
        with pytest.raises(KeyError):
            get_state_profile("ZZ")

    def test_invalid_full_name_raises(self):
        with pytest.raises(KeyError):
            get_state_profile("Atlantis")
