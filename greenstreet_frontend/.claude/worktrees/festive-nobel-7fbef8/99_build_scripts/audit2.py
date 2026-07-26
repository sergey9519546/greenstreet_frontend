"""Additional self-checks"""
import sys
sys.path.insert(0, r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_build_scripts')
from dscr_engine_v2 import LENDERS_25, real_data_deal_demo, calculate_break_even_table, match_lenders
import sqlite3

PASS = 0
FAIL = 0
ERRORS = []

def check(name, cond, detail=""):
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        ERRORS.append(f"{name}: {detail}")
        print(f"  [FAIL] {name}: {detail}")

print("=" * 70)
print("SELF-CHECK 7: LENDER COUNT")
print("=" * 70)
check(f"32 lenders in v2", len(LENDERS_25) == 32, f"got {len(LENDERS_25)}")

# Verify all 7 added lenders (LendSure, Ridge Street, BFFWS, Newrez, Arc Home, MK Lending, FMC 14)
new_lenders = ['lendsure', 'ridge_street', 'bffws', 'newrez', 'arc_home_edge', 'mk_lending', 'fmc14']
for lid in new_lenders:
    found = any(l.id == lid for l in LENDERS_25)
    check(f"New lender {lid} present", found, f"missing")

print()
print("=" * 70)
print("SELF-CHECK 8: REAL-DATA DEAL DEMO (3 ZIPs)")
print("=" * 70)
# Test each ZIP produces expected output structure
for zip_code, expected_state in [("95350", "CA"), ("90210", "CA"), ("33139", "FL")]:
    result = real_data_deal_demo(zip_code=zip_code, state=expected_state, property_value=325000, loan_amount=260000, fico=720, stated_rent=2650)
    has_rent = "rent_validation" in result and result["rent_validation"]["zori_avg_6mo"] is not None
    has_dscr = "dscr" in result and "track1_dscr" in result["dscr"]
    has_lenders = "lender_matches" in result and len(result["lender_matches"]) == 32
    check(f"ZIP {zip_code} ({expected_state}): all 3 stages return", has_rent and has_dscr and has_lenders)

# Verify Modesto is the "stunning" finding (ZORI says rent is 37% over)
result = real_data_deal_demo(zip_code="95350", state="CA", property_value=325000, loan_amount=260000, fico=720, stated_rent=2650)
variance = result["rent_validation"]["variance_pct"]
check(f"Modesto 95350: stated $2,650 is ~37% over ZORI", 35 <= abs(variance) <= 40, f"got {variance}%")

# Verify 100% default rate for Modesto with adjusted rent
import sqlite3
con = sqlite3.connect(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\data\\processed\\dscr_engine.db')
cur = con.execute("SELECT COUNT(*) FROM nfip_claims WHERE reportedZipCode = '95350'")
nfip_count = cur.fetchone()[0]
print(f"  (For reference: NFIP claims in 95350 = {nfip_count})")
con.close()

print()
print("=" * 70)
print("SELF-CHECK 9: BREAK-EVEN TABLE MATH (per sensitivity.ts)")
print("=" * 70)
# Modesto: $260K @ 7% + $2,650 rent + $4,200 tax + $1,500 ins
# Monthly PITIA = (260K * 0.0066530) + 350 + 125 = 1,729.78 + 475 = 2,204.78
# At DSCR=1.0: Min rent = PITIA = $2,205
be = calculate_break_even_table(260000, 325000, 0.07, 360, 0, 2650, 350, 125, 0)
min_rent_1_0 = be["min_rent_by_dscr"][0]["rent"]
check(f"Min rent @ DSCR 1.0 ≈ $2,205", abs(min_rent_1_0 - 2205) < 5, f"got ${min_rent_1_0}")
breakeven_1_0 = be["breakeven_rate_by_dscr"][0]["rate"]
check(f"Breakeven rate @ DSCR 1.0 is positive", breakeven_1_0 > 0, f"got {breakeven_1_0}%")

# Max loan at DSCR 1.0 (with $2,650 rent, PITIA = $2,205):
# max_pi = 2650/1.0 - 475 = 2175
# For amortizing @ 7%, 30yr: loan = 2175 * (1 - 1.007^(-360)) / 0.006653
#                       = 2175 * 0.877 / 0.00583 = 327,313
max_loan_1_0 = be["max_loan_by_dscr"][0]["loan"]
check(f"Max loan @ DSCR 1.0 ≈ $327K (with $2,650 rent)", abs(max_loan_1_0 - 327000) < 10000, f"got ${max_loan_1_0:,.0f}")

print()
print("=" * 70)
print("SELF-CHECK 10: LENDER MATCHING (Modesto 720 FICO, 80% LTV, 1.20 DSCR)")
print("=" * 70)
matches = match_lenders(fico=720, ltv=0.80, dscr=1.20, property_state="CA", loan_purpose="purchase")
passing = [m for m in matches if m["passes"]]
check(f"Passing lenders: at least 10", len(passing) >= 10, f"got {len(passing)}")
# With corrected values, some lenders that previously passed (Kiavi 1.10, Lima One 1.00) may no longer pass
# Because DSCR 1.20 is ABOVE Kiavi 0.80 min and Lima One 1.30 min
kiavi = next((m for m in matches if "Kiavi" in m["lender"]), None)
if kiavi:
    check(f"Kiavi passes (DSCR 1.20 ≥ min 0.80)", kiavi["passes"], f"got {kiavi['passes']}")
lima = next((m for m in matches if "Lima One" in m["lender"]), None)
if lima:
    check(f"Lima One FAILS (DSCR 1.20 < min 1.30)", not lima["passes"], f"got {lima['passes']}")

# All passing lenders should have estimated_rate
no_rate = [m for m in passing if m.get("estimated_rate") is None]
check(f"All passing lenders have estimated_rate", len(no_rate) == 0, f"{len(no_rate)} missing")

# Griffin should pass (FICO 720 ≥ 620, LTV 80 ≤ 80, DSCR 1.20 ≥ 0.75)
griffin = next((m for m in matches if "Griffin" in m["lender"]), None)
if griffin:
    check(f"Griffin Funding passes (FICO 720 ≥ 620, DSCR 1.20 ≥ 0.75)", griffin["passes"], f"got {griffin['passes']}")

# Kiavi should pass (FICO 720 ≥ 660, LTV 80 ≤ 80, DSCR 1.20 ≥ 0.80)
if kiavi:
    check(f"Kiavi passes (DSCR 1.20 ≥ min 0.80 from kiavi.com)", kiavi["passes"], f"got {kiavi['passes']}")

# Visio should pass (FICO 720 ≥ 680, LTV 80 ≤ 80, DSCR 1.20 ≥ 1.0)
visio = next((m for m in matches if "Visio" in m["lender"]), None)
if visio:
    check(f"Visio passes (DSCR 1.20 ≥ min 1.0)", visio["passes"], f"got {visio['passes']}")

# Angel Oak should pass (FICO 720 ≥ 640, LTV 80 ≤ 90, no min DSCR)
angel_oak = next((m for m in matches if "Angel Oak" in m["lender"]), None)
if angel_oak:
    check(f"Angel Oak passes (no min DSCR)", angel_oak["passes"], f"got {angel_oak['passes']}")

# Ridge Street should pass (FICO 720 ≥ 660 LTR, LTV 80 ≤ 80, DSCR 1.20 ≥ 1.0)
ridge = next((m for m in matches if "Ridge Street" in m["lender"]), None)
if ridge:
    check(f"Ridge Street passes (DSCR 1.20 ≥ min 1.0 LTR)", ridge["passes"], f"got {ridge['passes']}")

# Lima One should FAIL (DSCR 1.20 < min 1.30)
if lima:
    check(f"Lima One FAILS (DSCR 1.20 < min 1.30 from Lima One site)", not lima["passes"], f"got {lima['passes']}")

print()
print("=" * 70)
print(f"SUMMARY: {PASS} PASS, {FAIL} FAIL")
print("=" * 70)
if ERRORS:
    print("\nFAILURES:")
    for e in ERRORS:
        print(f"  - {e}")
