# Unique Content Review

- Row key: 63005fbec5
- Source path: 01_research_notes/DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md
- Archived path: 01_research_notes/_archive/superseded_by_docs_research_2026-06-28/DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md
- Replacement path: docs/research/specs/DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0.9123
- Unique words: 998
- Preliminary classification: ROOT_NOTE_UNIQUE_CONTENT_REVIEW
- Review copy: 00_MOCs\reconciliation_unique_review_verified_2026-06-28\restored_for_review\63005fbec5__01_research_notes__DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md

## Unique Headings
- None found by heading comparison.

## First Unique Blocks

### Block 1
```text
--- type: research status: drafted confidence: 3 title: "DSCR Sovereign OS: Upgrade Intelligence Report" summary: "**Classification:** Institutional-Grade Production Blueprint" entities: - concept/appreciation - concept/arm - concept/cap-rate - concept/cltv - concept/dscr - concept/io - concept/itia - concept/ltv - concept/pitia - data/fannie-mae - data/fred - data/freddie-mac - data/kbra - data/trepp - lender/angel-oak - lender/deephaven - lender/griffin-funding - lender/rocket-pro - lender/verus - lender/visio-lending - math/copula - math/t-copula - ml/conformal - ml/shap - ml/timesfm - ml/xgboost - regulation/cfpb - regulation/ecoa - regulation/fcra - regulation/hoepa - regulation/reg-z - regulation/section-1071 - state/ca - state/nj - state/ny - state/oh - state/pa - tax/1031 - tax/bonus-depreciation - tax/niit - tax/pal - tax/section-179 - topic/condo - topic/multifamily - topic/non-qm - topic/sfr - topic/str tags: - concept/io - ml/xgboost - topic/40yr-amort - topic/adverse-action - topic/after-tax - topic/architecture - topic/compliance - topic/default-rate - topic/ic-memo - topic/insurance - topic/llpa - topic/monte-carlo - topic/portfolio - topic/ppp - topic/short-rate - t ... [truncated]
```

### Block 2
```text
| State | Threshold | Rule | Source | Re-verify | |---|---|---|---|---| | **Pennsylvania** | **$329,411** (business-purpose, 1–2 unit) | Arch Home Loans wholesale guidelines + LIPL | Arch/Ticor wholesale bulletin | Annually (January) | | **Ohio** | **$116,356** | ORC **§1343.011** (annual CPI adjustment) | OH Dept. of Commerce official page | Annually (January) | | **New York** | No stated loan amount threshold; Criminal Usury 25% cap (Penal Law §190.40) applies to ALL loans | NY Penal Law §190.40 | AAPL compliance guidance | Ongoing | | **New Jersey** | Business-purpose corp borrowers generally not protected under anti-prepay statute; confirm entity type | NJ Rev. Stat. 46:10B-2 | AAPL 2025 guidance | Annual | | **California** | Business-purpose loans on investment property: prepay generally permitted; confirm property type | CA Civil Code §2954.10 | AAPL 2025 guidance | Annual |
```

### Block 3
```text
> **Note on PA threshold:** $329,411 is the verified 2026 figure for business-purpose loans secured by 1–2 unit residential properties. The LIPL threshold adjusts annually. Set a January 1 re-verify reminder. The Act 6 rate chart (monthly max rates) is a separate compliance dimension: June/July 2026 rate cap is **7.25%** (confirmed from PA DOBS).
```

### Block 4
```text
**STR Income Calculation (Verified Market Standard):** - AirDNA projected gross revenue × (1 − platform haircut 10–20%) subject to `MIN(projected gross × (1 − haircut), LTR market rent)` - The MIN function prevents STR income from exceeding what the property could earn as a long-term rental — a conservative floor used by sophisticated non-QM lenders - Angel Oak's STR program (80% LTV at 720 FICO + 1.0x DSCR) uses Clear Capital Rental AVM + market rent data
```

### Block 5
```text
#### Angel Oak Mortgage Solutions — Non-QM Leader + STR Innovator *(Verified from angeloakms.com/programs, May 3, 2026 and Zeitro lender comparison, January 2026)*
```

### Block 6
```text
| Parameter | Specification | |---|---| | Max Loan Amount | Up to $3M+ | | Min FICO (standard DSCR) | **700** | | Min FICO (STR, 80% LTV) | **720** (new 2026 tier — previously 700 at 75% LTV) | | Min FICO (select programs) | 640 (certain non-QM overlays only) | | Max LTV | Up to 85% (program-specific) | | STR program | 80% LTV at 720 FICO + 1.00x DSCR — expanded from 75% LTV in 2026 | | AVM | Clear Capital Rental AVM locked at prequal | | Second Liens | $100K–$350K; min FICO 700; max CLTV 75%; min DSCR 1.20x; 2-yr experience | | Notes | Largest non-QM securitization issuer; vertically integrated with Angel Oak Capital Advisors |
```

### Block 7
```text
> ⚠️ **V2.0 Correction:** Standard DSCR minimum is **700**, not 680. STR 80% LTV tier requires **720**. The 640 floor applies to certain bank statement / investment property overlay programs, not to the primary DSCR/Investor Cash Flow program.
```

### Block 8
```text
| Parameter | Specification | |---|---| | Max Loan Amount | Up to **$20M** (varies by state; $5M on DC; $4M+ national standard) | | Min FICO | 620 (CA page); **640** (national typical floor) | | Min DSCR | **0.75x** (floor; sub-0.75 not accepted contrary to prior notes) | | Max LTV | 80% (purchase); 75% (cash-out) | | IO Options | 30-year fixed + IO available | | Licensing | **All 50 states + DC** (updated from prior "46 states + DC") | | Close Time | As fast as 6 days (marketing claim); verify with AE for operational average | | AI Underwriting | "LIA" AI agent accelerating loan decisions in 2026 | | Notes | Widest credit flexibility; best for complex STR, LLC, and portfolio borrowers |
```

### Block 9
```text
> ⚠️ **V2.0 Correction:** All 50 states + DC — not 46 states. Maximum loan amount varies significantly by state (up to $20M on CA page). Min DSCR is 0.75 as a floor, not "below 0.75 accepted."
```

### Block 10
```text
| Section | Draft Claim | V2.0 Correction | Primary Source | Date Verified | |---|---|---|---|---| | §2 | RentCast tiers $29/$99/$199/Custom (API) | 50 free calls/month, volume-based API pricing — no named dollar tiers | rentcast.io/api, RentCast CEO Nov 2025 | Jun 2026 | | §2 | HouseCanary "$19/mo for basic access" | $19/mo = consumer plan; institutional API requires enterprise contract $25K–$100K+/yr | HouseCanary pricing | Jun 2026 | | §4 | "LLC-vested purchases trigger FinCEN BOI" | **WRONG** — domestic U.S. LLCs exempt from CTA BOI since March 2025 interim final rule; DSCR loans are financed transactions exempt from FinCEN RRE Rule | FinCEN.gov official page, March 2025 IFR | Jun 2026 | | §4 | PA Act 6 threshold $329,411 | **$329,411** for business-purpose loans on 1–2 unit (Arch wholesale guidelines) | Arch Home Loans bulletin | Jun 2026 | | §4 | ORC §1343.01 | Correct section is **§1343.011** | OH Dept. of Commerce | Jun 2026 | | §6 | Rocket Pro TPO FICO: 680 | **660** per official product page (March 4, 2026) | rocketpro.com/non-agency-products/dscr | Jun 2026 | | §6 | Rocket Pro max loan $3M | **$3.5M** per official product page | rocketpro.com/non-agency-products/dscr | J ... [truncated]
```
