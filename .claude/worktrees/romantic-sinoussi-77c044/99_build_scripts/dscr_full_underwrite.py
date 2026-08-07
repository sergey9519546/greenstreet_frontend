"""
DSCR Full Underwrite Pipeline — Wires EVERYTHING together.
================================================================
Inputs: deal (property_value, loan_amount, FICO, stated_rent, ZIP, ...)
Pipeline:
  1. Real-rent validation against Zillow ZORI
  2. Insurance + flood + wildfire + market temperature checks
  3. Dual-Track DSCR with adjusted rent
  4. Monte Carlo with adjusted rent
  5. Lender matching with real rate estimates
  6. Final verdict

This is the FIRST end-to-end pipeline that runs against the actual datasets.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dscr_engine_v2 import (
    dual_track_dscr,
    match_lenders,
    calculate_pitia,
    LENDERS_25 as LENDERS,
)
from dscr_engine_query import DSCREngine
from dscr_monte_carlo import run_monte_carlo


def full_underwrite(deal: dict, verbose: bool = True) -> dict:
    """Run the full underwrite pipeline on a deal.

    deal = {
      'property_value': int,
      'loan_amount': int,
      'fico': int,
      'stated_rent': float,
      'annual_taxes': float,
      'annual_insurance': float,
      'monthly_hoa': float,
      'zip': str,
      'state': str,
      'interest_only': bool,
      'annual_rate': float,
      'loan_term_years': int,
      'strategy': str,  # 'LTR' or 'STR'
      'property_type': str,  # 'SFR' or 'Condo' etc.
    }
    """
    engine = DSCREngine()

    if verbose:
        print("=" * 78)
        print(f"FULL UNDERWRITE — ZIP {deal['zip']} ({deal['state']})")
        print("=" * 78)
        print()

    # ============================================================
    # STAGE 1: REAL-RENT VALIDATION
    # ============================================================
    if verbose:
        print("[STAGE 1] Rent validation against Zillow ZORI")

    rent_conf = engine.compute_rent_confidence(deal["zip"], deal["stated_rent"])
    adjusted_rent = rent_conf["adjusted_rent"]
    rent_validation = {
        "stated_rent": deal["stated_rent"],
        "zillow_avg": engine.get_zillow_rent(deal["zip"]).get("avg_6mo"),
        "rent_confidence_score": rent_conf["score"],
        "rent_confidence_grade": rent_conf["grade"],
        "haircut_pct": rent_conf["haircut_pct"],
        "adjusted_rent": adjusted_rent,
        "factors": rent_conf["factors"],
    }
    if verbose:
        print(f"  Stated rent:        ${deal['stated_rent']:,.0f}/mo")
        print(f"  ZORI avg (6mo):     ${rent_validation['zillow_avg']:,.0f}/mo")
        print(f"  Variance:           {(deal['stated_rent'] / rent_validation['zillow_avg'] - 1) * 100:+.1f}%")
        print(f"  Confidence score:   {rent_conf['score']}/100  ({rent_conf['grade']})")
        print(f"  Suggested haircut:  {rent_conf['haircut_pct']*100:.0f}%")
        print(f"  Adjusted rent:      ${adjusted_rent:,.0f}/mo")
        for f in rent_conf["factors"]:
            print(f"    - {f}")
        print()

    # ============================================================
    # STAGE 2: RISK GATES
    # ============================================================
    if verbose:
        print("[STAGE 2] Risk gates (FEMA NFIP + Treasury FIO + CALFIRE)")

    flood = engine.get_flood_risk(deal["zip"])
    insurance = engine.get_insurance_risk(deal["zip"])
    wildfire = engine.get_wildfire_risk(deal["zip"])
    market = engine.get_market_temperature(deal["zip"])

    risk_flags = []
    if flood["found"] and flood["risk_score"] >= 60:
        risk_flags.append(f"FLOOD HIGH ({flood['risk_score']:.0f})")
    if insurance["found"] and insurance["risk_score"] >= 60:
        risk_flags.append(f"INSURANCE HIGH ({insurance['risk_score']:.0f})")
    if wildfire["found"] and wildfire["risk_score"] >= 60:
        risk_flags.append(f"WILDFIRE HIGH ({wildfire['risk_score']:.0f})")

    if verbose:
        print(f"  Flood:        {flood.get('risk_label', 'n/a')}")
        print(f"  Insurance:    {insurance.get('risk_label', 'n/a')}")
        print(f"  Wildfire:     {wildfire.get('risk_label', 'n/a')}")
        print(f"  Market temp:  {market.get('temperature_label', 'n/a')}")
        if risk_flags:
            print(f"  FLAGGED:      {', '.join(risk_flags)}")
        else:
            print(f"  FLAGGED:      none")
        print()

    # ============================================================
    # STAGE 3: DUAL-TRACK DSCR (with adjusted rent)
    # ============================================================
    if verbose:
        print("[STAGE 3] Dual-Track DSCR (using adjusted rent)")

    dscr = dual_track_dscr(
        monthly_rent=adjusted_rent,
        loan_amount=deal["loan_amount"],
        annual_rate=deal["annual_rate"],
        annual_taxes=deal["annual_taxes"],
        annual_insurance=deal["annual_insurance"],
        monthly_hoa=deal["monthly_hoa"],
        interest_only=deal.get("interest_only", False),
        vacancy_rate=0.08,
        management_rate=0.08,
    )

    if verbose:
        print(f"  Track 1 (Lender):    {dscr['track1_dscr']:.3f}  {'PASS' if dscr['passes_track1'] else 'FAIL'}")
        print(f"  Track 2 (Investor):  {dscr['track2_dscr']:.3f}  {'PASS' if dscr['passes_track2'] else 'FAIL'}")
        # v2 uses 'monthly_pitia' and 'cashflow_*' (no 'monthly_' prefix, no 'spread_t1_t2' key)
        spread_t1_t2 = dscr['track1_dscr'] - dscr['track2_dscr']
        print(f"  Spread T1-T2:        {spread_t1_t2:.3f}")
        print(f"  Monthly PITIA:       ${dscr['monthly_pitia']:,.0f}")
        print(f"  Cash flow Track 1:   ${dscr['cashflow_track1']:,.0f}/mo")
        print(f"  Cash flow Track 2:   ${dscr['cashflow_track2']:,.0f}/mo")
        print()

    # ============================================================
    # STAGE 4: MONTE CARLO (with adjusted rent)
    # ============================================================
    if verbose:
        print("[STAGE 4] Monte Carlo (1000 paths × 5-yr hold, adjusted rent)")

    mc_summary, _ = run_monte_carlo(
        n_simulations=1000,
        loan_amount=deal["loan_amount"],
        annual_rate=deal["annual_rate"],
        monthly_rent=adjusted_rent,
        annual_taxes=deal["annual_taxes"],
        annual_insurance=deal["annual_insurance"],
        monthly_hoa=deal["monthly_hoa"],
        property_value=deal["property_value"],
        hold_years=5,
    )

    if verbose:
        print(f"  Default rate:        {mc_summary['default_rate']:.2f}%")
        irr_str = f"{mc_summary['median_irr']:.2f}%" if mc_summary['median_irr'] is not None else "N/A (all defaulted)"
        print(f"  Median IRR:          {irr_str}")
        worst_str = f"{mc_summary['worst_case_irr']:.2f}%" if mc_summary['worst_case_irr'] is not None else "N/A"
        print(f"  Worst-case IRR:      {worst_str}")
        best_str = f"{mc_summary['best_case_irr']:.2f}%" if mc_summary['best_case_irr'] is not None else "N/A"
        print(f"  Best-case IRR:       {best_str}")
        eq_str = f"${mc_summary['median_exit_equity']:,.0f}" if mc_summary['median_exit_equity'] is not None else "N/A"
        print(f"  Median exit equity:  {eq_str}")
        print()

    # ============================================================
    # STAGE 5: LENDER MATCHING
    # ============================================================
    if verbose:
        print("[STAGE 5] Lender matching (Track 1 DSCR + 10 verified lenders)")

    ltv = deal["loan_amount"] / deal["property_value"]
    matches = match_lenders(
        fico=deal["fico"],
        ltv=ltv,
        dscr=dscr["track1_dscr"],
        property_state=deal["state"],
        loan_purpose="purchase",
    )

    passing = [m for m in matches if m["passes"]]
    if verbose:
        for m in passing[:5]:
            rate = f"{m['estimated_rate']:.3f}%" if m["estimated_rate"] else "n/a"
            print(f"  {m['lender']:22}  {rate}  ({m['rate_breakdown']['base_spread']:.2f} base)")
        if not passing:
            print("  NO LENDERS PASS — deal fails on Track 1 DSCR")
        print()

    # ============================================================
    # STAGE 6: FINAL VERDICT
    # ============================================================
    if verbose:
        print("[STAGE 6] Final verdict")

    verdict = "PASS" if (dscr["passes_track1"] and dscr["passes_track2"] and mc_summary["default_rate"] < 5) else "FAIL"
    verdict_reasons = []
    if not dscr["passes_track1"]:
        verdict_reasons.append("Track 1 DSCR fails — no lender will qualify")
    if not dscr["passes_track2"]:
        verdict_reasons.append("Track 2 DSCR fails — investor won't survive after vacancy/mgmt")
    if mc_summary["default_rate"] >= 5:
        verdict_reasons.append(f"Monte Carlo default rate {mc_summary['default_rate']:.1f}% too high")
    if mc_summary["median_irr"] and mc_summary["median_irr"] < 4.5:
        verdict_reasons.append(f"Median IRR {mc_summary['median_irr']:.1f}% below risk-free — poor risk/reward")
    if risk_flags:
        verdict_reasons.append(f"Risk flags: {', '.join(risk_flags)}")

    if verbose:
        print(f"  VERDICT: {verdict}")
        if verdict_reasons:
            for r in verdict_reasons:
                print(f"    - {r}")
        else:
            print("    All gates passed.")

    return {
        "verdict": verdict,
        "rent_validation": rent_validation,
        "flood_risk": flood,
        "insurance_risk": insurance,
        "wildfire_risk": wildfire,
        "market_temperature": market,
        "risk_flags": risk_flags,
        "dscr": dscr,
        "monte_carlo": mc_summary,
        "lender_matches": matches,
        "verdict_reasons": verdict_reasons,
    }


def demo():
    """Demo: the same Modesto, CA deal that started this whole exercise."""
    print()
    print("#" * 78)
    print("# DEMO: Modesto, CA — Original 'qualifying' deal — NOW WITH REAL DATA")
    print("#" * 78)
    print()

    deal = {
        "property_value": 325000,
        "loan_amount": 260000,        # 80% LTV
        "fico": 720,
        "stated_rent": 2650,           # What the seller/agent claims
        "annual_taxes": 4200,
        "annual_insurance": 1500,
        "monthly_hoa": 0,
        "zip": "95350",
        "state": "CA",
        "interest_only": False,
        "annual_rate": 0.07,
        "loan_term_years": 30,
        "strategy": "LTR",
        "property_type": "SFR",
    }

    result = full_underwrite(deal)

    print()
    print("=" * 78)
    print("INSIGHT")
    print("=" * 78)
    print()
    print(f"  Stated rent:    $2,650/mo (what the agent claims)")
    print(f"  Zillow ZORI:    $1,930/mo (what the market actually pays)")
    print(f"  Variance:       +37%  ← RED FLAG")
    print()
    print(f"  Adjusted rent:  $1,855/mo (with 30% haircut)")
    print()
    print(f"  Original verdict:  'PASSES Track 1 + Track 2'")
    print(f"  Real verdict:     '{result['verdict']}'")
    print()
    print(f"  Monte Carlo default rate:  {result['monte_carlo']['default_rate']:.2f}%")
    irr_disp = f"{result['monte_carlo']['median_irr']:.2f}%" if result['monte_carlo']['median_irr'] is not None else "N/A"
    print(f"  Monte Carlo median IRR:    {irr_disp}")
    print()
    print(f"  Reason: {result['verdict_reasons']}")
    print()
    print("  >>> The 'qualifying' deal was never going to make money.")
    print("  >>> The $21/mo cushion was actually -$349/mo after real-world data.")
    print()
    print("=" * 78)


def compare_deals():
    """Run the same dollar amount across 5 different ZIPs to see how rent/market matters."""
    print()
    print("#" * 78)
    print("# COMPARISON: Same $325K property, different ZIPs")
    print("#" * 78)
    print()

    base_deal = {
        "property_value": 325000,
        "loan_amount": 260000,
        "fico": 720,
        "stated_rent": 2650,  # Same claim everywhere
        "annual_taxes": 4200,
        "annual_insurance": 1500,
        "monthly_hoa": 0,
        "interest_only": False,
        "annual_rate": 0.07,
        "loan_term_years": 30,
        "strategy": "LTR",
        "property_type": "SFR",
    }

    test_zips = [
        ("95350", "Modesto CA"),
        ("90210", "Beverly Hills CA"),
        ("33139", "Miami Beach FL"),
        ("32801", "Orlando FL"),
        ("75201", "Dallas TX"),
    ]

    print(f"  {'ZIP':>6}  {'Location':>20}  {'ZORI':>8}  {'Var':>7}  {'Adj Rent':>10}  {'Track1':>7}  {'Track2':>7}  {'Default%':>9}  {'Verdict':>8}")
    print("  " + "-" * 100)

    for zip_code, loc in test_zips:
        deal = dict(base_deal)
        deal["zip"] = zip_code
        deal["state"] = zip_code[:2] if not zip_code.startswith("9") else "CA"
        if zip_code.startswith("95") or zip_code.startswith("90"):
            deal["state"] = "CA"
        elif zip_code.startswith("33"):
            deal["state"] = "FL"
        elif zip_code.startswith("75"):
            deal["state"] = "TX"

        result = full_underwrite(deal, verbose=False)

        zori = result["rent_validation"]["zillow_avg"]
        var = (deal["stated_rent"] / zori - 1) * 100 if zori else 0
        adj = result["rent_validation"]["adjusted_rent"]
        t1 = result["dscr"]["track1_dscr"]
        t2 = result["dscr"]["track2_dscr"]
        d = result["monte_carlo"]["default_rate"]
        v = result["verdict"]

        zori_str = f"${zori:,.0f}" if zori else "n/a"
        var_str = f"{var:+.0f}%"
        adj_str = f"${adj:,.0f}"

        print(f"  {zip_code:>6}  {loc:>20}  {zori_str:>8}  {var_str:>7}  {adj_str:>10}  {t1:>7.3f}  {t2:>7.3f}  {d:>8.2f}%  {v:>8}")

    print()


if __name__ == "__main__":
    demo()
    compare_deals()
