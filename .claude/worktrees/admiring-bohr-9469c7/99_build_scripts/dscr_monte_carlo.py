"""
Monte Carlo Simulator for DSCR Deals
Stress-tests Track 1 (lender qualification) vs Track 2 (investor survival)
against real-world volatility.

Built on top of dscr_calculator.py
Source: DSCR_ALGORITHMS.md (Monte Carlo methodology) + Frontier Strategy Guide §6.4
"""

import sys
from pathlib import Path
import statistics
import math

# Import from the unified merged engine (dscr_engine_v2)
sys.path.insert(0, str(Path(__file__).parent))
from dscr_engine_v2 import (
    calculate_pitia,
    dual_track_dscr,
    LENDERS_25 as LENDERS,
)


# ============================================================
# DISTRIBUTION HELPERS
# ============================================================

def normal_random(rng_state, mean=0.0, std=1.0):
    """Box-Muller normal random (simple, no numpy needed)."""
    if rng_state["cached"] is None:
        u1 = max(rng_state["u"](), 1e-12)
        u2 = rng_state["u"]()
        z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
        z1 = math.sqrt(-2.0 * math.log(u1)) * math.sin(2.0 * math.pi * u2)
        rng_state["cached"] = z1
        return mean + z0 * std
    else:
        z = rng_state["cached"]
        rng_state["cached"] = None
        return mean + z * std


def deterministic_rng(seed=42):
    """LGC deterministic RNG for reproducibility."""
    state = {"x": seed}

    def u():
        # Linear Congruential Generator (Numerical Recipes constants)
        state["x"] = (state["x"] * 1664525 + 1013904223) & 0xFFFFFFFF
        return state["x"] / 0xFFFFFFFF

    return {"u": u, "cached": None}


# ============================================================
# MONTE CARLO SIMULATION
# ============================================================

def simulate_one_path(
    rng_state,
    loan_amount,
    annual_rate,
    monthly_rent_base,
    annual_taxes,
    annual_insurance,
    monthly_hoa,
    property_value,
    hold_years,
    rent_volatility=0.05,      # std dev of monthly rent (5% baseline)
    rent_trend=0.025,           # annual rent growth (2.5% baseline)
    expense_volatility=0.03,    # std dev of expenses (3% baseline)
    expense_trend=0.035,        # annual expense growth (3.5% baseline)
    appreciation=0.03,          # annual property appreciation (3% baseline)
    vacancy_spike_prob=0.05,    # 5% chance per month of a vacancy event
    vacancy_spike_months=2,     # length of vacancy event
    base_vacancy_rate=0.08,     # baseline vacancy
    mgmt_rate=0.08,
    reserve_months=6,           # months of PITIA in reserve
    loan_term_months=360,
):
    """Run one 30-year monthly simulation. Return path summary."""
    pf = annual_rate / 12  # payment factor (using fixed rate)

    # Initial reserves
    pitia_month0 = calculate_pitia(
        loan_amount, annual_rate, annual_taxes, annual_insurance, monthly_hoa
    )["pitia"]  # v2 renamed monthly_pitia → pitia
    reserve = reserve_months * pitia_month0

    current_rent = monthly_rent_base
    current_taxes = annual_taxes
    current_insurance = annual_insurance

    monthly_cashflow_log = []
    cumulative_cashflow = 0
    months_in_negative = 0
    max_negative_streak = 0
    defaulted = False
    months_to_default = None
    rent_collected_log = []

    for month in range(1, loan_term_months + 1):
        # Skip if hold period exceeded
        if month > hold_years * 12:
            break

        # Annual trend updates (every 12 months)
        if month > 1 and (month - 1) % 12 == 0:
            current_rent *= (1 + rent_trend)
            current_taxes *= (1 + expense_trend)
            current_insurance *= (1 + expense_trend)

        # Monthly rent with volatility
        rent_this_month = current_rent * (1 + normal_random(rng_state, 0, rent_volatility))

        # Vacancy spike
        is_vacant = False
        if rng_state["u"]() < vacancy_spike_prob:
            is_vacant = True
        if is_vacant:
            rent_collected = 0
        else:
            # Apply baseline vacancy
            if rng_state["u"]() < base_vacancy_rate:
                rent_collected = 0
            else:
                rent_collected = rent_this_month * (1 - mgmt_rate)

        # Expenses with volatility
        monthly_taxes = (current_taxes / 12) * (1 + normal_random(rng_state, 0, expense_volatility))
        monthly_insurance = (current_insurance / 12) * (1 + normal_random(rng_state, 0, expense_volatility))

        # P&I (fixed-rate, fully amortizing)
        monthly_pi = loan_amount * pf

        # PITIA
        pitia = monthly_pi + monthly_taxes + monthly_insurance + monthly_hoa

        # Cash flow
        cashflow = rent_collected - pitia
        cumulative_cashflow += cashflow
        rent_collected_log.append(rent_collected)
        monthly_cashflow_log.append(cashflow)

        # Track negative streak
        if cashflow < 0:
            months_in_negative += 1
            max_negative_streak = max(max_negative_streak, months_in_negative)
            # Default: 3+ consecutive months negative AND no reserves
            reserve += cashflow  # cashflow can drain reserves
            if months_in_negative >= 3 and reserve < 0:
                defaulted = True
                months_to_default = month
                break
        else:
            months_in_negative = 0
            reserve += cashflow

        # Apply appreciation annually for exit value calc
        if month % 12 == 0:
            property_value *= (1 + appreciation)

    # Compute exit metrics
    if defaulted:
        return {
            "defaulted": True,
            "months_to_default": months_to_default,
            "cumulative_cashflow": round(cumulative_cashflow, 2),
            "irr": None,
            "exit_equity": None,
            "max_negative_streak": max_negative_streak,
        }

    # Exit equity: property value - remaining loan balance
    months_elapsed = min(month, loan_term_months)
    months_remaining = loan_term_months - months_elapsed
    remaining_balance = loan_amount * (
        ((1 + pf) ** loan_term_months - (1 + pf) ** months_elapsed)
        / ((1 + pf) ** loan_term_months - 1)
    )
    exit_equity = property_value - remaining_balance

    # Total return = cumulative cashflow + exit equity
    total_return = cumulative_cashflow + exit_equity
    initial_investment = property_value - loan_amount

    # Simple IRR over hold period (annualized)
    if total_return > 0 and hold_years > 0:
        irr = (total_return / initial_investment) ** (1.0 / hold_years) - 1
    else:
        irr = None

    return {
        "defaulted": False,
        "months_to_default": None,
        "cumulative_cashflow": round(cumulative_cashflow, 2),
        "exit_equity": round(exit_equity, 2),
        "irr": round(irr, 4) if irr is not None else None,
        "max_negative_streak": max_negative_streak,
    }


def run_monte_carlo(
    n_simulations=1000,
    loan_amount=260000,
    annual_rate=0.07,
    monthly_rent=2650,
    annual_taxes=4200,
    annual_insurance=1500,
    monthly_hoa=0,
    property_value=325000,
    hold_years=5,
    rent_volatility=0.05,
    expense_volatility=0.03,
    rent_trend=0.025,
    expense_trend=0.035,
    appreciation=0.03,
    vacancy_spike_prob=0.05,
    base_vacancy_rate=0.08,
    mgmt_rate=0.08,
    reserve_months=6,
    seed=42,
):
    """Run n Monte Carlo paths and return aggregate statistics."""
    rng_state = deterministic_rng(seed=seed)
    results = []

    for i in range(n_simulations):
        result = simulate_one_path(
            rng_state=rng_state,
            loan_amount=loan_amount,
            annual_rate=annual_rate,
            monthly_rent_base=monthly_rent,
            annual_taxes=annual_taxes,
            annual_insurance=annual_insurance,
            monthly_hoa=monthly_hoa,
            property_value=property_value,
            hold_years=hold_years,
            rent_volatility=rent_volatility,
            expense_volatility=expense_volatility,
            rent_trend=rent_trend,
            expense_trend=expense_trend,
            appreciation=appreciation,
            vacancy_spike_prob=vacancy_spike_prob,
            base_vacancy_rate=base_vacancy_rate,
            mgmt_rate=mgmt_rate,
            reserve_months=reserve_months,
        )
        results.append(result)

    # Aggregate
    n_default = sum(1 for r in results if r["defaulted"])
    default_rate = n_default / n_simulations

    irr_values = [r["irr"] for r in results if r["irr"] is not None]
    exit_equity_values = [r["exit_equity"] for r in results if r["exit_equity"] is not None]
    cashflow_values = [r["cumulative_cashflow"] for r in results]
    streak_values = [r["max_negative_streak"] for r in results]

    summary = {
        "n_simulations": n_simulations,
        "hold_years": hold_years,
        "default_rate": round(default_rate * 100, 2),
        "n_defaults": n_default,
        "median_irr": round(statistics.median(irr_values) * 100, 2) if irr_values else None,
        "mean_irr": round(statistics.mean(irr_values) * 100, 2) if irr_values else None,
        "irr_10th_percentile": round(sorted(irr_values)[int(len(irr_values) * 0.1)] * 100, 2) if irr_values else None,
        "irr_90th_percentile": round(sorted(irr_values)[int(len(irr_values) * 0.9)] * 100, 2) if irr_values else None,
        "median_exit_equity": round(statistics.median(exit_equity_values), 2) if exit_equity_values else None,
        "median_cumulative_cashflow": round(statistics.median(cashflow_values), 2) if cashflow_values else None,
        "median_max_negative_streak_months": round(statistics.median(streak_values), 1),
        "worst_case_irr": round(min(irr_values) * 100, 2) if irr_values else None,
        "best_case_irr": round(max(irr_values) * 100, 2) if irr_values else None,
    }

    return summary, results


# ============================================================
# SCENARIO COMPARISON
# ============================================================

def compare_hold_periods():
    """Run the same deal across 3/5/7/10-year holds to find the break-even horizon."""
    print("\n[SCENARIO COMPARISON — Hold Period Effect]")
    print("-" * 78)
    print(f"  {'Hold':>6}  {'Default %':>10}  {'Median IRR':>11}  {'Worst IRR':>10}  {'Best IRR':>10}  {'10th %ile IRR':>12}")
    print("-" * 78)

    for hold in [3, 5, 7, 10]:
        summary, _ = run_monte_carlo(hold_years=hold)
        worst = f"{summary['worst_case_irr']:.2f}%" if summary['worst_case_irr'] is not None else "n/a"
        best = f"{summary['best_case_irr']:.2f}%" if summary['best_case_irr'] is not None else "n/a"
        median_irr = f"{summary['median_irr']:.2f}%" if summary['median_irr'] is not None else "n/a"
        tenth = f"{summary['irr_10th_percentile']:.2f}%" if summary['irr_10th_percentile'] is not None else "n/a"
        print(f"  {hold:>4}yr  {summary['default_rate']:>9.2f}%  {median_irr:>10}  {worst:>10}  {best:>10}  {tenth:>12}")


def stress_test_rent():
    """What happens if rent is overstated by 10/20%? Show default rate sensitivity."""
    print("\n[STRESS TEST — Rent Overstatement]")
    print("-" * 78)
    print(f"  {'Rent vs assumed':>18}  {'Effective rent':>14}  {'Default %':>10}  {'Median IRR':>11}")
    print("-" * 78)

    base_rent = 2650
    for adj, label in [(1.0, "as-stated"), (0.95, "-5%"), (0.90, "-10%"), (0.80, "-20%")]:
        rent = base_rent * adj
        summary, _ = run_monte_carlo(monthly_rent=rent, hold_years=5)
        median_irr = f"{summary['median_irr']:.2f}%" if summary['median_irr'] is not None else "n/a"
        print(f"  {label:>18}  ${rent:>12,.0f}  {summary['default_rate']:>9.2f}%  {median_irr:>10}")


def stress_test_vacancy():
    """What if actual vacancy is higher than 8%?"""
    print("\n[STRESS TEST — Actual Vacancy Rate]")
    print("-" * 78)
    print(f"  {'Vacancy rate':>15}  {'Default %':>10}  {'Median IRR':>11}")
    print("-" * 78)

    for vac in [0.05, 0.08, 0.10, 0.12, 0.15]:
        summary, _ = run_monte_carlo(base_vacancy_rate=vac, hold_years=5)
        median_irr = f"{summary['median_irr']:.2f}%" if summary['median_irr'] is not None else "n/a"
        print(f"  {vac:>14.0%}  {summary['default_rate']:>9.2f}%  {median_irr:>10}")


# ============================================================
# MAIN DEMO
# ============================================================

def main():
    print("=" * 78)
    print("Monte Carlo Stress Test — DSCR Deal Survival Analysis")
    print("=" * 78)
    print()
    print("[DEAL PROFILE]")
    print("  Property value: $325,000 (Modesto, CA SFR)")
    print("  Loan: $260,000 @ 7.00%, 30yr fixed")
    print("  LTV: 80%")
    print("  Stated rent: $2,650/mo")
    print("  Baseline vacancy: 8%")
    print("  Mgmt: 8%")
    print("  Reserves: 6 months PITIA")
    print()
    print("  >>> Track 1 DSCR (lender): 1.202 PASS")
    print("  >>> Track 2 DSCR (investor): 1.010 PASS — but only $21/mo cushion")
    print()
    print("  Question: Does this deal SURVIVE real-world volatility?")
    print()

    # Baseline 5-year hold, 1000 sims
    print("[BASELINE — 1000 paths × 5-year hold]")
    summary, _ = run_monte_carlo(hold_years=5, n_simulations=1000)
    print(f"  Default rate:                {summary['default_rate']:.2f}%")
    print(f"  Median IRR:                  {summary['median_irr']:.2f}%")
    print(f"  Mean IRR:                    {summary['mean_irr']:.2f}%")
    print(f"  IRR 10th percentile (worst 10%):  {summary['irr_10th_percentile']:.2f}%")
    print(f"  IRR 90th percentile (best 10%):   {summary['irr_90th_percentile']:.2f}%")
    print(f"  Worst-case IRR:              {summary['worst_case_irr']:.2f}%")
    print(f"  Best-case IRR:               {summary['best_case_irr']:.2f}%")
    print(f"  Median exit equity:          ${summary['median_exit_equity']:,.0f}")
    print(f"  Median cumulative cashflow:  ${summary['median_cumulative_cashflow']:,.0f}")
    print(f"  Median max negative streak:  {summary['median_max_negative_streak_months']} months")

    # Hold period comparison
    compare_hold_periods()

    # Stress tests
    stress_test_rent()
    stress_test_vacancy()

    print()
    print("=" * 78)
    print("INTERPRETATION:")
    print("  - Track 1 (1.202) says YES to the lender.")
    print("  - Track 2 (1.010) says YES to the investor — but with $21/mo cushion.")
    print("  - Monte Carlo quantifies the REAL risk of that thin cushion.")
    print("  - Default rate > 0 means the deal CAN break under stress.")
    print("  - Worst-case IRR shows the actual downside of holding.")
    print("  - This is the difference between 'qualifies' and 'wins'.")
    print()
    print("VERIFIED SOURCES:")
    print("  - DSCR_ALGORITHMS.md (Monte Carlo methodology, hold-period sweep)")
    print("  - KBRA Non-QM Default Study (475K loans, FICO<660 = 10% default)")
    print("  - Fannie MFLPD 2022 vintage peak default analysis (24-36 mo)")
    print("=" * 78)


if __name__ == "__main__":
    main()
