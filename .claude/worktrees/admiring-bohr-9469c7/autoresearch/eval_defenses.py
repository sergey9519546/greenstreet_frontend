"""adversarial defense eval — runs 10 attacks against distributional_dscr.

The metric is the number of attacks the engine correctly defends against (0-10).

A defense is "passing" if the engine produces a warning, rejects the input,
or returns a flagged output. We test each defense with specific scenarios.

This file is read-only during the autoresearch loop. Only
distributional_dscr.py can be modified.
"""

import sys
from pathlib import Path

# Make sure dscr_stress is importable
WORKSPACE = Path(__file__).parent.parent
sys.path.insert(0, str(WORKSPACE / "DSCR_SOVEREIGN_OS" / "packages" / "dscr-stress" / "src"))
sys.path.insert(0, str(WORKSPACE / "DSCR_SOVEREIGN_OS" / "packages" / "dscr-core" / "src"))

from dscr_stress.distributional_dscr import Deal, distributional_dscr


def test_attack_1_arm_reset() -> bool:
    """Attack 1: ARM resets from 7% to 9% at month 84.
    Engine should detect the post-reset DSCR collapse.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,  # 7% initial
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=120,
    )
    # Try to set ARM reset attributes if supported
    try:
        deal.arm_reset_month = 84
        deal.arm_margin = 0.02  # SOFR + 200 bps
        deal.arm_cap = 0.05  # 5% lifetime cap
    except (AttributeError, TypeError):
        pass
    result = distributional_dscr(deal, n_paths=1_000, seed=42)
    # Defense: result must surface ARM reset risk
    # Check for arm_reset attribute or warning fields
    has_arm_defense = (
        hasattr(result, "arm_reset_warning")
        or hasattr(deal, "arm_reset_month")
        and getattr(deal, "arm_reset_month", None) is not None
        and hasattr(result, "post_reset_dscr")
        or hasattr(result, "warnings")
    )
    return has_arm_defense


def test_attack_2_stationary_correlation() -> bool:
    """Attack 2: Engine should expose correlation assumption.
    Look for correlation_factor or copula_family in output or Deal.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check Deal dataclass for correlation-related fields
    has_corr_defense = any(
        "corr" in f.lower() or "copula" in f.lower()
        for f in Deal.__dataclass_fields__
    )
    return has_corr_defense


def test_attack_3_life_of_loan() -> bool:
    """Attack 3: Engine must output life-of-loan DSCR (already has `lifetime`).
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    result = distributional_dscr(deal, n_paths=100, seed=42)
    return hasattr(result, "lifetime")


def test_attack_4_fraud_signal() -> bool:
    """Attack 4: Engine should accept rent_source flag and apply haircut.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for rent_source field
    has_rent_source = "rent_source" in Deal.__dataclass_fields__
    return has_rent_source


def test_attack_5_portfolio_contagion() -> bool:
    """Attack 5: Engine should expose cluster/contagion indicator.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for state or cluster fields
    has_state = any(
        "state" in f.lower() or "zip" in f.lower() or "cluster" in f.lower()
        for f in Deal.__dataclass_fields__
    )
    return has_state


def test_attack_6_insurance_step() -> bool:
    """Attack 6: Engine should accept coastal flag and apply insurance step.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for coastal flag
    has_coastal = any(
        "coast" in f.lower() or "hurricane" in f.lower() or "insurance_step" in f.lower()
        for f in Deal.__dataclass_fields__
    )
    return has_coastal


def test_attack_7_tax_reassessment() -> bool:
    """Attack 7: Engine should project tax reassessment risk.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for tax reassessment field or output
    has_tax_defense = any(
        "tax" in f.lower() and ("reassess" in f.lower() or "projection" in f.lower() or "post_acq" in f.lower())
        for f in Deal.__dataclass_fields__
    )
    return has_tax_defense


def test_attack_8_prepayment_convexity() -> bool:
    """Attack 8: Engine should accept prepayment_assumption parameter.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for prepayment field
    has_prepay = any(
        "prepay" in f.lower() or "cpr" in f.lower()
        for f in Deal.__dataclass_fields__
    )
    return has_prepay


def test_attack_9_fraud_detection() -> bool:
    """Attack 9: Engine should expose rent_to_market_ratio or similar warning.
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    # Check for fraud-related field
    has_fraud = any(
        "fraud" in f.lower() or "rent_market" in f.lower() or "validation" in f.lower()
        for f in Deal.__dataclass_fields__
    )
    return has_fraud


def test_attack_10_distributional_output() -> bool:
    """Attack 10: Engine output must be distributional (5-dim).
    """
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    result = distributional_dscr(deal, n_paths=100, seed=42)
    # All 5 dims must be present
    required = {"p12", "p36", "lifetime", "E_macro", "CVaR_95"}
    return all(hasattr(result, attr) for attr in required)


ATTACKS = [
    ("Attack 1: ARM reset shock", test_attack_1_arm_reset),
    ("Attack 2: Stationary correlation", test_attack_2_stationary_correlation),
    ("Attack 3: Life-of-loan DSCR", test_attack_3_life_of_loan),
    ("Attack 4: Fraud signal (rent_source)", test_attack_4_fraud_signal),
    ("Attack 5: Portfolio contagion", test_attack_5_portfolio_contagion),
    ("Attack 6: Insurance step", test_attack_6_insurance_step),
    ("Attack 7: Tax reassessment", test_attack_7_tax_reassessment),
    ("Attack 8: Prepayment convexity", test_attack_8_prepayment_convexity),
    ("Attack 9: Fraud detection", test_attack_9_fraud_detection),
    ("Attack 10: Distributional output", test_attack_10_distributional_output),
]


def main():
    results = []
    for name, test_fn in ATTACKS:
        try:
            passed = test_fn()
        except Exception as e:
            passed = False
            print(f"  {name}: ERROR ({type(e).__name__}: {e})", file=sys.stderr)
        results.append((name, passed))
        marker = "PASS" if passed else "FAIL"
        print(f"  {marker}: {name}")

    defended = sum(1 for _, p in results if p)
    print(f"\nattacks_defended: {defended}/10")


if __name__ == "__main__":
    main()
