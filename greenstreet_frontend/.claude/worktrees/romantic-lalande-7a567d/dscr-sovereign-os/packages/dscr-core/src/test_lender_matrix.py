"""
Tests for DSCR Sovereign OS – Lender Matrix Engine
====================================================
20+ tests covering eligibility, ranking, rate lookup, overlays,
serialisation, and lender-specific rules.
"""

import json
import pytest

from lender_matrix import (
    DealProfile,
    EligibilityResult,
    EntityType,
    LenderMatrix,
    LenderProfile,
    RateBand,
    OverlayRule,
    STRSeasoning,
    apply_overlays,
    check_eligibility,
    check_eligibility_all,
    get_matrix,
    lookup_rate_band,
    price_deal,
    rank_lenders_pareto,
)


# ── Fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def matrix():
    return LenderMatrix(version="test-1.0")


@pytest.fixture
def strong_deal():
    return DealProfile(
        fico=740,
        ltv=75.0,
        dscr=1.25,
        loan_amount=300_000,
        property_state="TX",
        entity_type=EntityType.LLC,
        is_str=True,
        str_seasoning_months=24,
    )


@pytest.fixture
def weak_deal():
    return DealProfile(
        fico=590,
        ltv=82.0,
        dscr=0.80,
        loan_amount=200_000,
        property_state="CA",
        entity_type=EntityType.INDIVIDUAL,
        is_str=False,
    )


# ── 1. Matrix construction ──────────────────────────────────────────────

def test_matrix_loads_10_lenders(matrix):
    assert len(matrix.lenders) == 10


def test_matrix_version(matrix):
    assert matrix.version == "test-1.0"


# ── 2. Eligibility – strong deal passes all lenders ─────────────────────

def test_strong_deal_eligible_all(matrix, strong_deal):
    results = check_eligibility_all(strong_deal, matrix)
    eligible_names = [r.lender.name for r in results if r.eligible]
    assert len(eligible_names) >= 9  # at least 9 of 10 should pass


# ── 3. FICO floor rejection ─────────────────────────────────────────────

def test_fico_below_visio(matrix, weak_deal):
    """Visio requires 680; weak_deal has 590 → should be rejected."""
    visio = matrix.get("visio")
    result = check_eligibility(weak_deal, visio)
    assert not result.eligible
    assert any("FICO" in r for r in result.reasons)


def test_fico_at_griffin_min():
    """Griffin min is 620; deal with 620 should pass FICO check."""
    griffin = get_matrix().get("griffin")
    deal = DealProfile(fico=620, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX")
    result = check_eligibility(deal, griffin)
    # Should pass FICO (may fail other checks)
    assert not any("FICO" in r for r in result.reasons)


# ── 4. DSCR floor rejection ─────────────────────────────────────────────

def test_dscr_below_rocket():
    """Rocket Pro TPO requires DSCR 1.0; deal with 0.85 should fail."""
    matrix = get_matrix()
    rocket = matrix.get("rocket_pro")
    deal = DealProfile(fico=700, ltv=75, dscr=0.85, loan_amount=200_000,
                       property_state="TX")
    result = check_eligibility(deal, rocket)
    assert not result.eligible
    assert any("DSCR" in r for r in result.reasons)


def test_no_ratio_angel_oak(matrix):
    """Angel Oak is no-ratio (dscr_min=0.0); any DSCR should pass DSCR check."""
    angel = matrix.get("angel_oak")
    deal = DealProfile(fico=650, ltv=75, dscr=0.50, loan_amount=200_000,
                       property_state="FL")
    result = check_eligibility(deal, angel)
    assert not any("DSCR" in r for r in result.reasons)


# ── 5. LTV ceiling rejection ────────────────────────────────────────────

def test_ltv_exceeds_griffin(matrix, weak_deal):
    """weak_deal LTV 82% > Griffin max 80%."""
    griffin = matrix.get("griffin")
    result = check_eligibility(weak_deal, griffin)
    assert not result.eligible
    assert any("LTV" in r for r in result.reasons)


def test_ltv_angel_oak_90(matrix):
    """Angel Oak max LTV 90%; 89% should pass LTV check."""
    angel = matrix.get("angel_oak")
    deal = DealProfile(fico=750, ltv=89, dscr=1.0, loan_amount=200_000,
                       property_state="TX")
    result = check_eligibility(deal, angel)
    assert not any("LTV" in r for r in result.reasons)


# ── 6. State filtering ──────────────────────────────────────────────────

def test_state_all_50(matrix, strong_deal):
    """All lenders have all 50 states; TX deal should pass state check."""
    for lp in matrix.lenders:
        result = check_eligibility(strong_deal, lp)
        assert not any("State" in r for r in result.reasons)


# ── 7. STR seasoning overlay ────────────────────────────────────────────

def test_str_deephaven_conditional():
    """Deephaven requires 12-mo STR seasoning."""
    matrix = get_matrix()
    deephaven = matrix.get("deephaven")
    deal = DealProfile(fico=650, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX", is_str=True, str_seasoning_months=6)
    result = check_eligibility(deal, deephaven)
    assert not result.eligible
    assert any("seasoning" in r.lower() for r in result.reasons)


def test_str_deephaven_pass_with_12mo():
    """Deephaven passes with 12-mo seasoning."""
    matrix = get_matrix()
    deephaven = matrix.get("deephaven")
    deal = DealProfile(fico=650, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX", is_str=True, str_seasoning_months=12)
    result = check_eligibility(deal, deephaven)
    assert result.eligible


def test_easy_street_waives_seasoning():
    """Easy Street overlay waives STR seasoning."""
    matrix = get_matrix()
    easy = matrix.get("easy_street")
    deal = DealProfile(fico=650, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX", is_str=True, str_seasoning_months=0)
    result = check_eligibility(deal, easy)
    # Should not fail on STR seasoning
    assert not any("seasoning" in r.lower() for r in result.reasons)


# ── 8. Entity type ──────────────────────────────────────────────────────

def test_entity_llc_eligible_all(matrix, strong_deal):
    """All lenders accept LLC."""
    results = check_eligibility_all(strong_deal, matrix)
    for r in results:
        if not r.eligible:
            assert not any("entity" in reason.lower() for reason in r.reasons)


# ── 9. Loan amount floors ───────────────────────────────────────────────

def test_loan_amount_below_rocket_floor():
    """Rocket Pro TPO floor is $100K; $80K should fail."""
    matrix = get_matrix()
    rocket = matrix.get("rocket_pro")
    deal = DealProfile(fico=700, ltv=75, dscr=1.0, loan_amount=80_000,
                       property_state="TX")
    result = check_eligibility(deal, rocket)
    assert not result.eligible
    assert any("floor" in r.lower() or "below" in r.lower() for r in result.reasons)


# ── 10. Rate band lookup ────────────────────────────────────────────────

def test_lookup_returns_rate(matrix):
    """Good deal should return a rate from the band grid."""
    griffin = matrix.get("griffin")
    rate, aey = lookup_rate_band(griffin, 740, 75, 1.25)
    assert rate is not None
    assert aey is not None
    assert aey > rate


def test_lookup_high_fico_lower_rate(matrix):
    """Higher FICO should get a lower (or equal) rate than lower FICO."""
    griffin = matrix.get("griffin")
    rate_high, _ = lookup_rate_band(griffin, 760, 70, 1.25)
    rate_low, _ = lookup_rate_band(griffin, 600, 70, 1.25)
    assert rate_high is not None
    assert rate_low is not None
    assert rate_high <= rate_low


# ── 11. Pareto ranking ─────────────────────────────────────────────────

def test_pareto_at_least_one(matrix, strong_deal):
    """At least one lender should be Pareto-optimal."""
    ranked = rank_lenders_pareto(strong_deal, matrix)
    pareto = [r for r in ranked if r.is_pareto]
    assert len(pareto) >= 1


def test_pareto_sorted_by_aey(matrix, strong_deal):
    """Eligible lenders should be sorted by AEY ascending."""
    ranked = rank_lenders_pareto(strong_deal, matrix)
    eligible = [r for r in ranked if r.eligible and r.ae_y is not None]
    aey_values = [r.ae_y for r in eligible]
    assert aey_values == sorted(aey_values)


def test_pareto_best_aey_is_lowest(matrix, strong_deal):
    """The first eligible lender should have the lowest AEY."""
    ranked = rank_lenders_pareto(strong_deal, matrix)
    eligible = [r for r in ranked if r.eligible]
    if eligible:
        assert ranked[0].ae_y <= eligible[-1].ae_y


# ── 12. Overlay application ─────────────────────────────────────────────

def test_apply_rate_overlay():
    """Overlay with rate_adjustment_bps should modify rate."""
    lp = LenderProfile(
        lender_id="test", name="Test", dscr_min=0.75, fico_min=620,
        ltv_max=80.0, str_seasoning=STRSeasoning.YES, active_states=[],
        overlays=[OverlayRule(name="test_adj", description="",
                              rate_adjustment_bps=25.0)],
    )
    deal = DealProfile(fico=700, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX")
    rate, ltv, adj = apply_overlays(lp, deal, 7.0, 80.0)
    assert rate == 7.25
    assert adj.rate_delta_bps == 25.0


def test_apply_ltv_overlay():
    """Overlay with ltv_adjustment should modify ltv_max."""
    lp = LenderProfile(
        lender_id="test", name="Test", dscr_min=0.75, fico_min=620,
        ltv_max=80.0, str_seasoning=STRSeasoning.YES, active_states=[],
        overlays=[OverlayRule(name="ltv_adj", description="",
                              ltv_adjustment=-5.0)],
    )
    deal = DealProfile(fico=700, ltv=75, dscr=1.0, loan_amount=200_000,
                       property_state="TX")
    _, ltv, adj = apply_overlays(lp, deal, 7.0, 80.0)
    assert ltv == 75.0
    assert adj.ltv_delta == -5.0


# ── 13. Serialisation round-trip ────────────────────────────────────────

def test_matrix_json_roundtrip(matrix, strong_deal):
    """Matrix → JSON → Matrix should preserve lender count and eligibility."""
    j = matrix.to_json()
    restored = LenderMatrix.from_json(j)
    assert len(restored.lenders) == len(matrix.lenders)
    orig_results = check_eligibility_all(strong_deal, matrix)
    restored_results = check_eligibility_all(strong_deal, restored)
    orig_eligible = [r.lender.name for r in orig_results if r.eligible]
    restored_eligible = [r.lender.name for r in restored_results if r.eligible]
    assert orig_eligible == restored_eligible


# ── 14. price_deal integration ──────────────────────────────────────────

def test_price_deal_returns_best(matrix, strong_deal):
    """price_deal should return a best_lender and best_aey."""
    result = price_deal(strong_deal, matrix)
    assert "best_lender" in result
    assert "best_aey" in result
    assert result["best_lender"] is not None


# ── 15. PostgreSQL DDL ──────────────────────────────────────────────────

def test_postgres_ddl_contains_tables():
    ddl = LenderMatrix.postgres_ddl()
    for table in ["lender_matrix", "lender_profile", "lender_rate_band", "lender_overlay"]:
        assert table in ddl


# ── 16. Deactivate lender ───────────────────────────────────────────────

def test_deactivate_lender(matrix, strong_deal):
    """Deactivated lenders should not appear in results."""
    matrix.deactivate("kiavi")
    assert len(matrix.lenders) == 9
    results = check_eligibility_all(strong_deal, matrix)
    names = [r.lender.name for r in results]
    assert "Kiavi" not in names


# ── 17. Insert params ───────────────────────────────────────────────────

def test_to_insert_params(matrix):
    params = matrix.to_insert_params()
    tables = [p[0] for p in params]
    assert "lender_matrix" in tables
    assert "lender_profile" in tables
    # Should have at least 1 matrix + 10 profiles = 11 rows minimum
    assert len(params) >= 11
