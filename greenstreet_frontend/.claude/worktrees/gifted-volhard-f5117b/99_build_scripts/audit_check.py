"""Comprehensive self-audit of dscr_engine_v2.py"""
import sys
sys.path.insert(0, r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_build_scripts')
from dscr_engine_v2 import (
    LENDERS_25, calculate_pitia, dual_track_dscr, payment_factor,
    get_bonus_dep_rate, calculate_pal_allowance,
    check_ppp_eligibility, GOLDEN_VALUES, BASE_RATE_ANCHOR
)

PASS = 0
FAIL = 0
ERRORS = []

def check(name, expected, actual, tol=0.01):
    global PASS, FAIL
    if abs(expected - actual) <= tol:
        PASS += 1
        print(f"  [PASS] {name}: expected {expected}, actual {actual}")
    else:
        FAIL += 1
        ERRORS.append(f"{name}: expected {expected}, actual {actual}")
        print(f"  [FAIL] {name}: expected {expected}, actual {actual}")

def check_eq(name, expected, actual):
    global PASS, FAIL
    if expected == actual:
        PASS += 1
        print(f"  [PASS] {name}: = {actual}")
    else:
        FAIL += 1
        ERRORS.append(f"{name}: expected {expected!r}, actual {actual!r}")
        print(f"  [FAIL] {name}: expected {expected!r}, actual {actual!r}")

print("=" * 70)
print("SELF-AUDIT 1: GOLDEN VALUES (per audit_final_1_math.md)")
print("=" * 70)
pv = calculate_pitia(300000, 0.0825, 360, 0, 0, 0)
check("PI $300K @ 8.25%", 2254, pv["pi"], tol=1)

pv = calculate_pitia(318750, 0.0825, 360, 0, 5000, 2000, 150)
check("PITIA $318,750 @ 8.25% + fixed", 3129, pv["pitia"], tol=1)

pv = calculate_pitia(318750, 0.07, 360, 0, 5000, 2000, 150)
check("PITIA $318,750 @ 7% + fixed", 2855, pv["pitia"], tol=1)

check("Payment factor 8.25%", 0.0075127, payment_factor(0.0825), tol=0.0001)
check("Payment factor 7.00%", 0.0066530, payment_factor(0.07), tol=0.0001)
check("Payment factor 6.125%", 0.0060761, payment_factor(0.06125), tol=0.0001)
check("Payment factor 0.00 (boundary)", 0.002778, payment_factor(0.0), tol=0.0001)
check("Payment factor 1e-12 (epsilon)", 0.002778, payment_factor(1e-12), tol=0.0001)

print()
print("=" * 70)
print("SELF-AUDIT 2: OBBBA BONUS DEPRECIATION (per IRC §168(k) + OBBBA)")
print("=" * 70)
check("100% post-1/19/25", 1.00, get_bonus_dep_rate("2026-06-15"))
check("100% post-1/19/25 (alt)", 1.00, get_bonus_dep_rate("2025-06-15"))
check("40% transitional 1/1-1/19/25", 0.40, get_bonus_dep_rate("2025-01-10"))
check("60% in 2024", 0.60, get_bonus_dep_rate("2024-06-15"))
check("80% in 2023", 0.80, get_bonus_dep_rate("2023-06-15"))
check("100% in 2022 (pre-TCJA)", 1.00, get_bonus_dep_rate("2022-06-15"))
check("40% with elect-out (post-1/19/25)", 0.40, get_bonus_dep_rate("2026-06-15", elect_out=True))

print()
print("=" * 70)
print("SELF-AUDIT 3: PAL §469 ALLOWANCE")
print("=" * 70)
check("MAGI $50K → $25K", 25000, calculate_pal_allowance(50000, is_rep=False))
check("MAGI $100K → $25K", 25000, calculate_pal_allowance(100000, is_rep=False))
check("MAGI $125K → $12.5K (50% phase-out)", 12500, calculate_pal_allowance(125000, is_rep=False))
check("MAGI $150K → $0 (full phase-out)", 0, calculate_pal_allowance(150000, is_rep=False))
check("MAGI $200K → $0", 0, calculate_pal_allowance(200000, is_rep=False))
check("MAGI $500K REP → inf", float("inf"), calculate_pal_allowance(500000, is_rep=True))
check("MFS MAGI $25K → $12.5K", 12500, calculate_pal_allowance(25000, is_rep=False, filing_status="mfs"))
check("MFS MAGI $100K → $0", 0, calculate_pal_allowance(100000, is_rep=False, filing_status="mfs"))

print()
print("=" * 70)
print("SELF-AUDIT 4: DUAL-TRACK DSCR (Modesto, $2,650 stated)")
print("=" * 70)
# Track 1: gross_rent / PITIA
# PITIA @ 7% on $260K = $2,205 (per earlier test)
# T1 = 2650/2205 = 1.202
dscr = dual_track_dscr(2650, 260000, 0.07, 4200, 1500, 0)
check("Track 1 DSCR @ 7% (stated $2,650)", 1.202, dscr["track1_dscr"], tol=0.005)
# Track 2: 2650 * 0.84 / 2205 = 1.010
check("Track 2 DSCR @ 7% (stated $2,650)", 1.010, dscr["track2_dscr"], tol=0.005)
# Cash flow T1: 2650 - 2205 = +445
check("Cash flow Track 1", 445, dscr["cashflow_track1"], tol=1)
# Cash flow T2: 2650*0.84 - 2205 = 2226 - 2205 = +21
check("Cash flow Track 2", 21, dscr["cashflow_track2"], tol=5)

print()
print("=" * 70)
print("SELF-AUDIT 5: STATE PPP LAWS (per state statutes)")
print("=" * 70)
# PA: amount_conditional, threshold $329,411
r = check_ppp_eligibility("PA", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("PA: $260K should be REJECTED (< $329,411 threshold)", False, r["ppp_allowed"])
r = check_ppp_eligibility("PA", "llc", 400000, "fixed_rate", "soft_5yr")
check_eq("PA: $400K should be ALLOWED (above threshold)", True, r["ppp_allowed"])

# OH: amount_conditional, threshold $116,356
r = check_ppp_eligibility("OH", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("OH: $260K should be ALLOWED (above $116,356)", True, r["ppp_allowed"])

# KS: effectively_prohibited
r = check_ppp_eligibility("KS", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("KS: $260K should be REJECTED (KS prohibits)", False, r["ppp_allowed"])

# NJ: individual_barred
r = check_ppp_eligibility("NJ", "individual", 260000, "fixed_rate", "soft_5yr")
check_eq("NJ: individual should be REJECTED", False, r["ppp_allowed"])
r = check_ppp_eligibility("NJ", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("NJ: LLC should be ALLOWED", True, r["ppp_allowed"])

# WA: arm_restricted
r = check_ppp_eligibility("WA", "llc", 260000, "arm", "soft_5yr")
check_eq("WA: ARM should be REJECTED", False, r["ppp_allowed"])
r = check_ppp_eligibility("WA", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("WA: fixed should be ALLOWED", True, r["ppp_allowed"])

# MS: structure_restricted
r = check_ppp_eligibility("MS", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("MS: soft_5yr should be REJECTED (declining only)", False, r["ppp_allowed"])

# CA: allowed (default)
r = check_ppp_eligibility("CA", "llc", 260000, "fixed_rate", "soft_5yr")
check_eq("CA: should be ALLOWED", True, r["ppp_allowed"])

print()
print("=" * 70)
print("SELF-AUDIT 6: LENDER MATRIX (32 lenders, primary-source check)")
print("=" * 70)
# Check 7 critical lenders against verified file
checks_7 = {
    'kiavi': (660, 80, 0.80, 3000000, 'kiavi.com rental loans page'),
    'lima_one': (700, 80, 1.3, 2500000, 'Lima One rental page'),
    'angel_oak': (640, 90, 0.0, 4000000, 'Angel Oak programs page'),
    'deephaven': (640, 80, 0.0, 3500000, 'Deephaven DSCR page'),
    'easy_street': (620, 80, 0.80, 2000000, 'Easy Street site'),
    'visio': (680, 80, 1.0, 2000000, 'Visio site'),
    'griffin_funding': (620, 80, 0.75, 4000000, 'Griffin site + v11.1 audit'),
}
for lid, (fico, ltv, dscr_min, max_loan, source) in checks_7.items():
    lender = next((l for l in LENDERS_25 if l.id == lid), None)
    if not lender:
        print(f"  [FAIL] {lid}: NOT IN LENDERS_25")
        FAIL += 1
        continue
    fico_ok = lender.min_fico == fico
    ltv_ok = lender.max_ltv == ltv
    dscr_ok = abs(lender.min_dscr - dscr_min) < 0.01
    max_ok = abs(lender.max_loan - max_loan) < 1000
    all_ok = fico_ok and ltv_ok and dscr_ok and max_ok
    if all_ok:
        PASS += 1
        print(f"  [PASS] {lid}: FICO={lender.min_fico} LTV={lender.max_ltv} DSCR={lender.min_dscr} Max=${lender.max_loan:,} (source: {source})")
    else:
        FAIL += 1
        ERRORS.append(f"{lid}: mismatch (source: {source})")
        print(f"  [FAIL] {lid}: expected FICO={fico} LTV={ltv} DSCR={dscr_min} Max=${max_loan:,}, got FICO={lender.min_fico} LTV={lender.max_ltv} DSCR={lender.min_dscr} Max=${lender.max_loan:,} (source: {source})")

print()
print("=" * 70)
print(f"SUMMARY: {PASS} PASS, {FAIL} FAIL")
print("=" * 70)
if ERRORS:
    print("\nFAILURES:")
    for e in ERRORS:
        print(f"  - {e}")
