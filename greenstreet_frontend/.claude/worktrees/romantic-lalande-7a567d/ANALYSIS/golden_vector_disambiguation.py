"""Disambiguate the P&I conflict: $2,121 vs $1,999 in the notes.
Sovereign Master v11.0 says: $425K / 75% LTV / 7.00% 30yr / $3K rent / $5K tax / $2K ins / $150 HOA
DSCR Forumals.md says: same property, P&I = $1,999, DSCR = 1.16
Goal: figure out which inputs are internally consistent.
"""


def pi(loan, annual_rate_pct, n_months=360):
    r = annual_rate_pct / 100 / 12
    if r == 0:
        return loan / n_months
    return loan * r * (1 + r) ** n_months / ((1 + r) ** n_months - 1)


def pitia(p_i, tax_annual, ins_annual, hoa_monthly, flood_monthly=0):
    return p_i + tax_annual / 12 + ins_annual / 12 + hoa_monthly + flood_monthly


def fmt(x):
    return f"{x:,.4f}"


print("=" * 80)
print("SCENARIO A: $425K property, 75% LTV, 7.00%, 30yr (Sovereign Master canonical)")
print("=" * 80)
loan_a = 425000 * 0.75
pi_a = pi(loan_a, 7.00)
pitia_a = pitia(pi_a, 5000, 2000, 150)
dscr_t1_a = 3000 / pitia_a
print(f"  Loan amount:       ${loan_a:>12,.2f}")
print(f"  P&I:               ${pi_a:>12,.4f}")
print(f"  PITIA:             ${pitia_a:>12,.4f}")
print(f"  Track 1 DSCR:      {dscr_t1_a:>12,.4f}x")
print(f"  Track 2 (75% occ): {(3000 * 0.75 - 0 - 0) / pitia_a:>12,.4f}x")

print()
print("=" * 80)
print("SCENARIO B: $425K property, P&I = $1,999 (DSCR Forumals claim)")
print("=" * 80)
loan_b = 1999 / pi(1, 7.00)
pitia_b = pitia(1999, 5000, 2000, 150)
dscr_t1_b = 3000 / pitia_b
print(f"  Implied loan:      ${loan_b:>12,.2f}  (LTV {loan_b/425000:.2%})")
print(f"  P&I:               ${1999:>12,.4f}")
print(f"  PITIA:             ${pitia_b:>12,.4f}")
print(f"  Track 1 DSCR:      {dscr_t1_b:>12,.4f}x")

print()
print("=" * 80)
print("SCENARIO C: $300K loan (NOT 75% LTV), 7.00%, 30yr")
print("=" * 80)
pi_c = pi(300000, 7.00)
pitia_c = pitia(pi_c, 5000, 2000, 150)
dscr_t1_c = 3000 / pitia_c
print(f"  Loan amount:       ${300000:>12,.2f}  (LTV {300000/425000:.2%})")
print(f"  P&I:               ${pi_c:>12,.4f}")
print(f"  PITIA:             ${pitia_c:>12,.4f}")
print(f"  Track 1 DSCR:      {dscr_t1_c:>12,.4f}x")

print()
print("=" * 80)
print("SCENARIO D: Sovereign Master at 6.125% (try alternate rate)")
print("=" * 80)
loan_d = 425000 * 0.75
pi_d = pi(loan_d, 6.125)
pitia_d = pitia(pi_d, 5000, 2000, 150)
dscr_t1_d = 3000 / pitia_d
print(f"  Loan amount:       ${loan_d:>12,.2f}  (75% LTV)")
print(f"  Rate:              6.125%")
print(f"  P&I:               ${pi_d:>12,.4f}")
print(f"  PITIA:             ${pitia_d:>12,.4f}")
print(f"  Track 1 DSCR:      {dscr_t1_d:>12,.4f}x")

print()
print("=" * 80)
print("CONCLUSION")
print("=" * 80)
print("Sovereign Master v11.0 ($425K / 75% LTV / 7.00% / $3K rent):")
print(f"  -> P&I = ${pi_a:,.2f}, PITIA = ${pitia_a:,.2f}, T1 DSCR = {dscr_t1_a:.3f}x")
print()
print("DSCR Forumals.md ($1,999 P&I, DSCR 1.16):")
print(f"  -> Inconsistent at this property value. Only matches with:")
print(f"     - ${loan_b:,.0f} loan ({loan_b/425000:.1%} LTV) at 7.00%, OR")
print(f"     - Smaller property not in spec")
print()
print(f"DECISION: Lock the Sovereign Master v11.0 vector as canonical.")
print(f"  Golden Vector v11.0: $425K / $318,750 loan (75% LTV) / 7.00% / 30yr")
print(f"                      $3K rent / $5K tax / $2K ins / $150 HOA")
print(f"  Expected: P&I ${pi_a:.4f}, PITIA ${pitia_a:.4f}, T1 DSCR {dscr_t1_a:.4f}")