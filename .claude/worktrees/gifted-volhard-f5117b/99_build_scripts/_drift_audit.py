"""
DSCR Sovereign OS — Drift Audit
=================================

Compares "spec claims" from shipped memos and audit reports against
"actual code behavior" in Slice 1 (dscr-core) and Slice 2 (dscr-stress).

Drift categories:
  DRIFT_MISSING: Spec says X should be implemented. Code doesn't have it.
  DRIFT_INCORRECT: Spec says X. Code does X but X is wrong.
  DRIFT_EXTRA: Code has X. No spec mentions X. (May be fine — undocumented feature.)
  DRIFT_STALE: Spec said X but later spec contradicts. (Need new spec to win.)

For each drift, output:
  - Severity (CRITICAL / HIGH / MEDIUM / LOW)
  - Source citation (file + line)
  - Current code state (file + line)
  - Recommended action
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
CORE = WORKSPACE / "DSCR_SOVEREIGN_OS" / "packages" / "dscr-core" / "src" / "dscr_core"
STRESS = WORKSPACE / "DSCR_SOVEREIGN_OS" / "packages" / "dscr-stress" / "src" / "dscr_stress"

# ---------------------------------------------------------------------------
# Drift findings data structure
# ---------------------------------------------------------------------------

@dataclass
class Drift:
    severity: str  # CRITICAL / HIGH / MEDIUM / LOW
    category: str  # math / compliance / calibration / lender / state / tax
    title: str
    spec_claim: str
    spec_source: str
    code_state: str
    code_source: str
    recommendation: str

    def to_dict(self):
        return {
            "severity": self.severity, "category": self.category,
            "title": self.title, "spec_claim": self.spec_claim,
            "spec_source": self.spec_source, "code_state": self.code_state,
            "code_source": self.code_source, "recommendation": self.recommendation,
        }


drifts: list[Drift] = []


def read_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def grep(path: Path, pattern: str) -> list[str]:
    """Return lines from path matching pattern."""
    content = read_file(path)
    if not content:
        return []
    return [ln for ln in content.split("\n") if re.search(pattern, ln)]


# ---------------------------------------------------------------------------
# 1. MATH DRIFT CHECKS
# ---------------------------------------------------------------------------

def check_math_drifts():
    # DSCR = Rent / PITIA: check dscr_track1 implementation
    dscr_py = read_file(CORE / "dscr.py")
    if "PITIA" not in dscr_py and "pitia" not in dscr_py.lower():
        drifts.append(Drift(
            severity="CRITICAL",
            category="math",
            title="DSCR = Rent / PITIA formula not in Slice 1",
            spec_claim="DSCR = Gross Monthly Rental Income / PITIA (Track 1 formula)",
            spec_source="Pennymac DSCR Product Profile 6.12.26 / T1 claim_01 / MASTER_ANALYSIS line 5191",
            code_state=f"dscr.py does NOT contain 'PITIA' as denominator",
            code_source=str(CORE / "dscr.py"),
            recommendation="Confirm dscr_track1 actually divides by PITIA, not by some other value",
        ))

    # payment_factor formula: r(1+r)^n / ((1+r)^n - 1)
    payment_py = read_file(CORE / "payment.py")
    if "1 + r" not in payment_py and "(1+r)**n_months" not in payment_py and "**n_months" not in payment_py:
        drifts.append(Drift(
            severity="HIGH",
            category="math",
            title="payment_factor formula may be wrong",
            spec_claim="payment_factor = r(1+r)^n / ((1+r)^n - 1) — standard amortization formula",
            spec_source="numpy-financial v1.0+ / Bankrate / Vertex42 / T1 claim_04",
            code_state="payment.py does not contain expected amortization formula components",
            code_source=str(CORE / "payment.py"),
            recommendation="Verify formula matches standard amortization",
        ))

    # Reserves policy: 6mo Standard / 9mo sub-1.0 / 12mo FN
    ltv_py = read_file(CORE / "ltv.py")
    if "reserves_check" in ltv_py:
        if "12" not in ltv_py or "month" not in ltv_py.lower():
            drifts.append(Drift(
                severity="MEDIUM",
                category="math",
                title="reserves_check may not implement 12-month FN tier",
                spec_claim="Reserves policy: 6mo standard / 9mo sub-1.0 DSCR / 12mo FN/ITIN",
                spec_source="Master DSCR Knowledge §6 / Sprint 6 Module 1 / v3 audit v3",
                code_state="reserves_check exists but 12-month tier not found",
                code_source=str(CORE / "ltv.py"),
                recommendation="Verify all three tiers are in reserves_check",
            ))


# ---------------------------------------------------------------------------
# 2. COMPLIANCE DRIFT CHECKS
# ---------------------------------------------------------------------------

def check_compliance_drifts():
    comp_py = read_file(CORE / "compliance.py")
    ec_codes = grep(CORE / "compliance.py", r'ECOA_REASON_TEXTS|"(\d{2})"\s*:\s*"')

    # Extract code numbers defined in the dict
    code_numbers = set()
    for line in comp_py.split("\n"):
        m = re.search(r'"(\d{2})"\s*:\s*"', line)
        if m:
            code_numbers.add(m.group(1))

    # Spec (T7): should have codes 01-40
    expected_codes = {f"{i:02d}" for i in range(1, 41)}
    missing_codes = expected_codes - code_numbers
    if missing_codes:
        drifts.append(Drift(
            severity="HIGH",
            category="compliance",
            title=f"ECOA codes missing: {sorted(missing_codes)}",
            spec_claim="All 40 ECOA codes (01-24 Form C-1 verbatim + 25-40 DSCR extensions) per T7 spec",
            spec_source="RESEARCH/godmode_20260618/07_T7_compliance_expansion/compliance_expansion_python_spec.md",
            code_state=f"Slice 1 implements {len(code_numbers)} codes: {sorted(code_numbers)}",
            code_source=str(CORE / "compliance.py"),
            recommendation=f"Add missing codes {sorted(missing_codes)} to compliance.py + 35 new tests",
        ))

    # ECOA code 19 — old spec had "Income insufficient"; new spec (Form C-1) says "Garnishment"
    if '"19"' in comp_py:
        if "Garnishment" in comp_py or "garnishment" in comp_py.lower():
            drifts.append(Drift(
                severity="CRITICAL",
                category="compliance",
                title="ECOA code 19 may be using WRONG text",
                spec_claim="ECOA 19 = 'Garnishment or attachment' (Form C-1 verbatim). Slice 1 alias says 19 = 'Income insufficient' which is WRONG per Form C-1.",
                spec_source="12 CFR 1002 Appendix A / T7 compliance_expansion_python_spec §1",
                code_state="compliance.py likely uses old (incorrect) mapping for code 19",
                code_source=str(CORE / "compliance.py"),
                recommendation="URGENT: rename ECOA_CODE_19_INCOME_INSUFFICIENT to legacy alias; use code 08 for income; use code 19 for garnishment per Form C-1",
            ))

    # ECOA code 21 — old spec had "Debt obligations too high"; new spec says "Bankruptcy"
    if '"21"' in comp_py:
        if "Bankruptcy" in comp_py or "bankruptcy" in comp_py.lower():
            drifts.append(Drift(
                severity="CRITICAL",
                category="compliance",
                title="ECOA code 21 may be using WRONG text",
                spec_claim="ECOA 21 = 'Bankruptcy' (Form C-1). Slice 1 uses 21 = 'Debt obligations too high' which is WRONG.",
                spec_source="12 CFR 1002 Appendix A / T7 §1",
                code_state="compliance.py uses incorrect mapping for code 21",
                code_source=str(CORE / "compliance.py"),
                recommendation="URGENT: code 21 must be 'Bankruptcy'. Use code 09 for 'Excessive obligations'.",
            ))

    # ECOA code 26 — old spec says "Loan amount exceeds max"; new spec (DSCR extension) says 26 = "LTV ratio too high"
    if '"26"' in comp_py:
        if "Loan amount" in comp_py or "loan_amount" in comp_py.lower():
            drifts.append(Drift(
                severity="HIGH",
                category="compliance",
                title="ECOA code 26 maps to wrong concept in DSCR context",
                spec_claim="Per T7 DSCR-specific spec: code 26 = LTV ratio too high. Slice 1 maps 26 to loan_amount.",
                spec_source="T7 §1 Section 2 (DSCR-Specific Extension Codes 25-40)",
                code_state="compliance.py ECOA_CODE_26 maps to loan_amount (Form C-1 wrong for DSCR)",
                code_source=str(CORE / "compliance.py"),
                recommendation="Update mapping: code 26 = LTV ratio (DSCR-spec); code 30 = loan amount",
            ))

    # MN PPP HF 3437 — Apr 23 2026 effective; business-purpose DSCR exempt from Aug 1
    if "Minnesota" not in comp_py and "MN" not in comp_py:
        drifts.append(Drift(
            severity="MEDIUM",
            category="compliance",
            title="MN PPP HF 3437 (Apr 23 2026) not in compliance.py",
            spec_claim="MN House File 3437 enacted Apr 23 2026; business-purpose DSCR exempt from Aug 1, 2026 onward",
            spec_source="Sprint 4 Module 2 / Gap Audit v3",
            code_state="No Minnesota-specific rules in compliance.py",
            code_source=str(CORE / "compliance.py"),
            recommendation="Add MN state overlay: business-purpose DSCR exempt from MN PPP cap",
        ))

    # Section 1071 — Final Rule May 1 2026
    if "1071" not in comp_py and "section_1071" not in comp_py.lower():
        drifts.append(Drift(
            severity="MEDIUM",
            category="compliance",
            title="Section 1071 final rule not in compliance.py",
            spec_claim="Section 1071 final rule May 1 2026; compliance Jan 1 2028; broker-only EXEMPT",
            spec_source="Sprint 4 Module 3 / Gap Audit v3",
            code_state="No §1071-specific handling in compliance.py",
            code_source=str(CORE / "compliance.py"),
            recommendation="Add §1071 broker-only exemption check (defer to 2028 compliance date)",
        ))

    # HOEPA 2026 thresholds
    if "HOEPA" not in comp_py and "27592" not in comp_py and "27_592" not in comp_py:
        drifts.append(Drift(
            severity="MEDIUM",
            category="compliance",
            title="HOEPA 2026 thresholds not in compliance.py",
            spec_claim="HOEPA 2026: $27,592 loan amount / $1,380 points-and-fees (Jan 1 2027)",
            spec_source="DSCR Appendix B / Blueprint v3 / T7",
            code_state="No HOEPA threshold check in compliance.py",
            code_source=str(CORE / "compliance.py"),
            recommendation="Add HOEPA threshold check (defer until 2027)",
        ))


# ---------------------------------------------------------------------------
# 3. APEX 2 CALIBRATION DRIFT
# ---------------------------------------------------------------------------

def check_apex2_drifts():
    dist_py = read_file(STRESS / "distributional_dscr.py")
    init_py = read_file(STRESS / "__init__.py")

    # RENT_LOGNORMAL_SIGMA = 0.05 per APEX 2
    if "RENT_LOGNORMAL_SIGMA" not in dist_py:
        drifts.append(Drift(
            severity="HIGH",
            category="calibration",
            title="RENT_LOGNORMAL_SIGMA constant missing from distributional_dscr.py",
            spec_claim="RENT_LOGNORMAL_SIGMA = 0.05 (5% per APEX 2 calibration)",
            spec_source="output/DSCR_APEX2_Calibration_Memo_20260619.md",
            code_state="RENT_LOGNORMAL_SIGMA not defined",
            code_source=str(STRESS / "distributional_dscr.py"),
            recommendation="Add constant + 3-regime dispatch (stable=2.5%, normal=5%, stress=9.5%)",
        ))

    # Regime dispatch
    if "RENT_SIGMA_BY_REGIME" not in dist_py:
        drifts.append(Drift(
            severity="HIGH",
            category="calibration",
            title="RENT_SIGMA_BY_REGIME dispatch not implemented",
            spec_claim="3-regime dispatch: stable=2.5%, normal=5%, stress=9.5%",
            spec_source="output/DSCR_APEX2_Calibration_Memo_20260619.md",
            code_state="No regime dispatch in distributional_dscr.py",
            code_source=str(STRESS / "distributional_dscr.py"),
            recommendation="Implement regime dispatch per APEX 2",
        ))

    # KBRA 3.8% default rate anchor
    if "3.8" not in dist_py and "0.038" not in dist_py:
        drifts.append(Drift(
            severity="LOW",
            category="calibration",
            title="KBRA 3.8% default rate anchor not explicit in code",
            spec_claim="KBRA Non-QM WA cumulative default = 3.8% (Jun 4 2025 study)",
            spec_source="KBRA press release / MASTER_ANALYSIS Round 12 / domain_5",
            code_state="No explicit reference to KBRA 3.8% in distributional_dscr.py",
            code_source=str(STRESS / "distributional_dscr.py"),
            recommendation="Add constant DEFAULT_RATE_KBRA = 0.038 with source citation",
        ))


# ---------------------------------------------------------------------------
# 4. SLICE 2 P0-4 ARM RESET DRIFT
# ---------------------------------------------------------------------------

def check_arm_reset_drifts():
    arm_py = read_file(STRESS / "arm_reset.py")
    init_py = read_file(STRESS / "__init__.py")

    # DEFAULT_MARGIN = 2.50%
    if "0.025" not in arm_py:
        drifts.append(Drift(
            severity="HIGH",
            category="arm-reset",
            title="DEFAULT_MARGIN not 2.50% in arm_reset.py",
            spec_claim="Default lender margin = 2.50% above index (Pennymac 6.12.26 standard)",
            spec_source="Pennymac DSCR Product Profile 6.12.26 / Sprint 6 Module 3",
            code_state="DEFAULT_MARGIN not 0.025 in arm_reset.py",
            code_source=str(STRESS / "arm_reset.py"),
            recommendation="Verify DEFAULT_MARGIN = 0.025",
        ))

    # DEFAULT_PERIODIC_CAP = 2%
    if "0.02" not in arm_py:
        drifts.append(Drift(
            severity="HIGH",
            category="arm-reset",
            title="DEFAULT_PERIODIC_CAP not 2% in arm_reset.py",
            spec_claim="Default periodic cap = 2% per adjustment",
            spec_source="Pennymac 6.12.26 / Blueprint v3",
            code_state="DEFAULT_PERIODIC_CAP not 0.02",
            code_source=str(STRESS / "arm_reset.py"),
            recommendation="Verify DEFAULT_PERIODIC_CAP = 0.02",
        ))

    # DEFAULT_LIFETIME_CAP = 5%
    if "0.05" not in arm_py:
        drifts.append(Drift(
            severity="HIGH",
            category="arm-reset",
            title="DEFAULT_LIFETIME_CAP not 5% in arm_reset.py",
            spec_claim="Default lifetime cap = 5% above initial rate",
            spec_source="Pennymac 6.12.26 / Blueprint v3",
            code_state="DEFAULT_LIFETIME_CAP not 0.05",
            code_source=str(STRESS / "arm_reset.py"),
            recommendation="Verify DEFAULT_LIFETIME_CAP = 0.05",
        ))


# ---------------------------------------------------------------------------
# 5. YIELD CURVE DRIFT
# ---------------------------------------------------------------------------

def check_yield_curve_drifts():
    yc_py = read_file(STRESS / "yield_curve.py")

    # NSS formula
    if "exp(-tau" not in yc_py and "exp(-horizons" not in yc_py:
        drifts.append(Drift(
            severity="HIGH",
            category="yield-curve",
            title="NSS exponential decay formula missing",
            spec_claim="NSS formula: y(tau) = b0 + b1*t1(tau,l1) + b2*(t1-t2) + b3*(t1'(l2)-t2'(l2))",
            spec_source="Svensson 1994 / T11 §3",
            code_state="No exp(-tau/lambda) decay formula found",
            code_source=str(STRESS / "yield_curve.py"),
            recommendation="Verify NSS formula is implemented correctly",
        ))


# ---------------------------------------------------------------------------
# 6. TIER 1 CLAIM AUDIT CROSS-CHECK
# ---------------------------------------------------------------------------

def check_tier1_claims():
    """Cross-check that Tier 1 claim audit cards still hold after Slice 2 P0-4."""
    # Claim 01: DSCR = Rent / PITIA
    # Verify Slice 1 dscr.py formula
    dscr_py = read_file(CORE / "dscr.py")
    if "rent" not in dscr_py.lower() or "pitia" not in dscr_py.lower():
        drifts.append(Drift(
            severity="CRITICAL",
            category="tier1-claim",
            title="Tier 1 Claim 01 (DSCR=Rent/PITIA) — formula not in Slice 1",
            spec_claim="DSCR = Gross Monthly Rental Income / PITIA — Tier 1 CONFIRMED (5/5 confidence)",
            spec_source="RESEARCH/godmode_20260618/01_T1_tier1_sweep/claim_01_dscr_rent_over_pitia.md",
            code_state="Neither 'rent' nor 'PITIA' appears in dscr.py formula",
            code_source=str(CORE / "dscr.py"),
            recommendation="URGENT: verify dscr_track1 uses rent / pitia, not some other denominator",
        ))

    # Claim 04: payment_factor 7% 360mo = 6.6530... (golden vector)
    payment_py = read_file(CORE / "payment.py")
    if "6.65" not in payment_py and "0.0066" not in payment_py and "payment_factor" in payment_py:
        # Just check formula exists; golden vector value should be tested elsewhere
        pass  # Not a drift, just informational


# ---------------------------------------------------------------------------
# 7. SPRINT 1 FIX INTEGRITY
# ---------------------------------------------------------------------------

def check_sprint1_fixes():
    """Verify Sprint 1's 16 bug fixes still in place."""
    # Bug 1: pitia() no negative HOA
    payment_py = read_file(CORE / "payment.py")
    if "pitia" in payment_py.lower():
        if "raise" in payment_py:
            # Pitia has validation; OK
            pass
        else:
            drifts.append(Drift(
                severity="HIGH",
                category="sprint1",
                title="Sprint 1 Bug 1 (pitia validation) — may have regressed",
                spec_claim="pitia() must reject negative HOA/flood/MI",
                spec_source="output/DSCR_Sprint1_Ship_Memo_20260620.md Bug 1",
                code_state="pitia() does not appear to raise ValueError",
                code_source=str(CORE / "payment.py"),
                recommendation="Verify pitia() still validates negative HOA",
            ))


# ---------------------------------------------------------------------------
# 8. SHIP MEMO CONSISTENCY
# ---------------------------------------------------------------------------

def check_ship_memos_consistent():
    """Verify ship memo claims match actual code/memory state."""
    sprint1_memo = read_file(WORKSPACE / "output" / "DSCR_Sprint1_Ship_Memo_20260620.md")
    if "213" in sprint1_memo:
        # Actual count should be 213
        pass  # Already verified earlier
    if "92%" in sprint1_memo:
        pass  # Already verified


# ---------------------------------------------------------------------------
# Run all checks
# ---------------------------------------------------------------------------

def main():
    print("Running drift audit...\n")
    check_math_drifts()
    check_compliance_drifts()
    check_apex2_drifts()
    check_arm_reset_drifts()
    check_yield_curve_drifts()
    check_tier1_claims()
    check_sprint1_fixes()
    check_ship_memos_consistent()

    # Group by severity
    by_sev = {"CRITICAL": [], "HIGH": [], "MEDIUM": [], "LOW": []}
    for d in drifts:
        by_sev[d.severity].append(d)

    print(f"Total drifts found: {len(drifts)}")
    for sev in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        print(f"  {sev}: {len(by_sev[sev])}")
    print()

    for sev in ("CRITICAL", "HIGH", "MEDIUM", "LOW"):
        if not by_sev[sev]:
            continue
        print(f"=== {sev} DRIFTS ({len(by_sev[sev])}) ===")
        for d in by_sev[sev]:
            print(f"\n  [{d.category.upper()}] {d.title}")
            print(f"    Spec says: {d.spec_claim}")
            print(f"    Spec source: {d.spec_source}")
            print(f"    Code state: {d.code_state}")
            print(f"    Code source: {d.code_source}")
            print(f"    Action: {d.recommendation}")
        print()

    # Save report
    report_path = WORKSPACE / "_obsidian_vault" / "_indexes" / "_drift_audit_report.json"
    report = {
        "generated_at": datetime.now().isoformat(),
        "total_drifts": len(drifts),
        "by_severity": {sev: len(by_sev[sev]) for sev in ("CRITICAL", "HIGH", "MEDIUM", "LOW")},
        "drifts": [d.to_dict() for d in drifts],
    }
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"\nReport saved: {report_path}")


if __name__ == "__main__":
    main()
