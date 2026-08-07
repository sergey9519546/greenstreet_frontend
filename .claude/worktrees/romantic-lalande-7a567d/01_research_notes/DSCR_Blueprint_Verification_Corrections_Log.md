---
type: research
status: drafted
confidence: 3
title: "DSCR Blueprint — Full Research Verification & Corrections Log"
summary: "**Method:** Primary-source verification across vendor docs, regulatory filings, academic papers, and live market data"
entities:
  - concept/dscr
  - concept/ltv
  - data/fred
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/rocket-pro
  - ml/conformal
  - ml/timesfm
  - regulation/cfpb
  - regulation/hoepa
  - state/oh
  - state/pa
  - tax/pal
  - tax/section-179
  - topic/non-qm
  - topic/str
tags:
  - topic/after-tax
  - topic/architecture
  - topic/compliance
  - topic/tax
  - topic/usury
source: DSCR_Blueprint_Verification_Corrections_Log.md
vaulted_at: 2026-06-20
---
# DSCR Blueprint — Full Research Verification & Corrections Log

**Date:** June 18, 2026  
**Method:** Primary-source verification across vendor docs, regulatory filings, academic papers, and live market data  
**Scope:** All 10 sections of the Unbeatable DSCR Analysis Machine Blueprint  

---

## Verification Summary by Section

| Section | Status | Critical Corrections | Confirmations |
|---|---|---|---|
| 1. Architecture Overview | ✅ CONFIRMED | 0 | SR 26-02 scope confirmed; BigQuery TimesFM confirmed production |
| 2. Data Layer | ⚠️ CORRECTED | 1 critical | FRED free tier ✅; AirDNA requirement ✅ |
| 3. AI/ML & Math Layer | ✅ CONFIRMED + ADDED | 0 corrections | CPTC NeurIPS 2025 ✅; TimesFM 2.5 specs ✅; OBBBA elevated |
| 4. Compliance & Legal | ⚠️ CORRECTED | 3 critical | OH threshold ✅; HOEPA 2026 ✅; NY criminal usury ✅ |
| 5. Document & Evidence | ✅ CONFIRMED | 0 | Ocrolus GA April 1 ✅; conditioning workflow ✅ |
| 6. Lender Matrix | ⚠️ CORRECTED | 4 critical | Griffin all 50 states ✅; Deephaven equity products ✅ |
| 7. Infrastructure | ✅ CONFIRMED | 0 | BigQuery production-ready ✅ |
| 8. Team & Budget | ✅ CONFIRMED | 0 | Timeline achievable ✅ |
| 9. Monetization | ✅ CONFIRMED | 0 | Loan size ✅; Non-QM sizing noted |
| 10. Risk & Moat | ✅ CONFIRMED | 0 | All moat descriptions accurate |

---

## Critical Corrections (Apply Immediately)

### C1 — RentCast API Pricing
**Was:** Starter/Growth/Pro/Enterprise at $29/$99/$199/Custom  
**Is:** 50 free API calls/month; volume-based pricing; no publicly listed tier names for API  
**Why wrong:** Prior description cited consumer landlord platform tiers, not API developer tiers  
**Source:** rentcast.io/api; RentCast CEO video Nov 2025  

### C2 — Rocket Pro TPO Min FICO
**Was:** 680  
**Is:** **660**  
**Source:** rocketpro.com/non-agency-products/dscr, March 4, 2026  

### C3 — Rocket Pro TPO Max Loan Amount
**Was:** $3M purchase / $2.5M cash-out  
**Is:** **$3.5M**  
**Source:** rocketpro.com/non-agency-products/dscr, March 4, 2026  

### C4 — Angel Oak Standard FICO
**Was:** 680 (standard); 700+ for LTV ≤80%  
**Is:** **700** (standard); **720** for STR at 80% LTV (new 2026 tier)  
**Source:** angeloakms.com/programs May 3, 2026; Zeitro lender comparison Jan 2026  

### C5 — FinCEN BOI (MOST CRITICAL)
**Was:** "LLC-vested purchases with non-bank financing trigger FinCEN BOI reporting requirements through title companies."  
**Is:** **WRONG.** Domestic U.S. LLCs are EXEMPT from BOI reporting under FinCEN's March 2025 interim final rule. DSCR loans are financed transactions and do not trigger the FinCEN RRE Rule (which applies only to non-financed cash transfers to entities).  
**Source:** FinCEN.gov interim final rule March 21–26, 2025; operative as of June 2026  

### C6 — Pennsylvania Act 6 Threshold
**Was:** $329,411  
**Is:** **$329,411** (business-purpose loans, 1–2 unit residential)  
**Source:** Arch Home Loans wholesale/correspondent guidelines 2026  

### C7 — Ohio Statutory Citation
**Was:** ORC §1343.01  
**Is:** **ORC §1343.011**  
**Threshold confirmed correct:** $116,356 effective January 1, 2026  
**Source:** OH Dept. of Commerce official page  

### C8 — Griffin Funding Licensing
**Was:** 46 states + DC  
**Is:** **All 50 states + DC**  
**Source:** griffinfunding.com/non-qm-mortgages/dscr-loans, June 16, 2026  

### C9 — Griffin Max Loan Amount
**Was:** $4M  
**Is:** Up to **$20M** (CA page); $5M (DC page); $4M+ national standard  
**Source:** griffinfunding.com state-specific pages, June 2026  

### C10 — Ocrolus Document Count
**Was:** ">2,000 document types"  
**Is:** **">95% of mortgage document types"** (1,600+ financial document types — coverage metric, not raw count)  
**Source:** Ocrolus PR March 17, 2026  

---

## Addenda (Elevate to Blueprint)

### A1 — TimesFM 2.5 Parameters (Upgrade Over 2.0)
- 200M parameters (vs. 500M — 2.5× faster inference)
- 16K context window (vs. 2,048 — 7.5× more historical data)
- Optional 30M quantile head (native quantile outputs up to 1,000-step horizon)
- XReg covariate support restored (rate, employment, permit data as external regressors)
- Frequency indicator removed (simpler API)
- LoRA fine-tuning supported (open-source deployment)
- **Recommendation:** Use 2.5 exclusively for rent forecasting; 2.0 is legacy

### A2 — OBBBA Full Details (Elevate from Moat to Math Layer)
- Signed: July 4, 2025
- 100% bonus dep: permanent, for property acquired + placed in service after January 19, 2025
- Applies to: tangible property ≤20yr recovery (5/7/15-year components via cost seg)
- Section 179: $2.5M–$2.56M (inflation-indexed), phase-out at $4M
- §163(j) ATI: restored to EBITDA basis (more deductible interest)
- 20% QBI deduction: permanent for pass-through entities
- **Impact on after-tax IRR:** Material. A REP (Real Estate Professional) with cost-seg + 100% bonus dep can generate Year 1 losses that offset W-2 income. A passive investor at $250K AGI faces PAL phase-out. The system must capture borrower's tax status at intake.

### A3 — CPTC Verification
Confirmed NeurIPS 2025 acceptance at three sources:
- NeurIPS virtual poster 118881
- NeurIPS virtual page 133928  
- arXiv 2509.02844v1
- GitHub: Rose-STL-Lab/CPTC (official implementation)

### A4 — FinCEN RRE Rule Positive Clarification (New — March 1, 2026)
A new FinCEN rule effective March 1, 2026 requires reporting for non-financed residential transfers to entities/trusts. This is NOT triggered by DSCR loans (which are financed). But the system should flag cash deals or equity-only transfers into entities — those transactions DO trigger the RRE Rule. This is a compliance value-add the system can offer that title companies may miss.

---

## Items Confirmed Accurate (Primary Source)

| Claim | Primary Source | Confirmed |
|---|---|---|
| TimesFM 2.0 max context 2,048; 2.5 max 15,360 | BigQuery AI.FORECAST docs, June 12, 2026 | ✅ |
| SR 26-02 effective April 17, 2026, supersedes SR 11-7 | OCC Bulletin 2026-13 | ✅ |
| Ocrolus automated conditioning GA April 1, 2026 | Ocrolus press release March 17, 2026 | ✅ |
| CPTC at NeurIPS 2025 | NeurIPS + arXiv + GitHub | ✅ |
| Griffin min DSCR 0.75 (floor, not sub-0.75 accepted) | griffinfunding.com June 2026 | ✅ |
| Ohio prepayment threshold $116,356 effective Jan 1, 2026 | OH Dept. of Commerce | ✅ |
| HOEPA 2026 points-and-fees trigger $1,380 | Federal Register Dec 14, 2025 / CFPB | ✅ |
| HOEPA 2026 loan amount threshold $27,592 | CFPB / Credit Union Outlook | ✅ |
| OBBBA 100% bonus dep permanent, after Jan 19, 2025 | Grant Thornton Nov 2025; HCVT Feb 2026 | ✅ |
| Angel Oak STR 80% LTV at 720 FICO (new 2026 tier) | angeloakms.com May 3, 2026 | ✅ |
| NY Criminal Usury 25% cap (Penal Law §190.40) applies to all loans | AAPL 2025 compliance guidance | ✅ |
| NYC Local Law 18 STR primary residence enforcement | NYC OER | ✅ |
| pyvinecopulib C++ backend, TU Munich | vinecopulib.github.io | ✅ |
| FRED rate limit 120 req/min with API key | FRED API docs | ✅ |
| Conformal prediction finite-sample coverage guarantee | Statistical theory; NeurIPS CPTC paper | ✅ |
| Angel Oak Clear Capital Rental AVM at prequal | Angel Oak press releases 2026 | ✅ |
| Domestic LLC BOI exemption as of March 2025 IFR | FinCEN.gov; incorp.com Jan 2026 | ✅ |

---

*This log should be attached to the V2.0 blueprint as Appendix C. Each correction is dated and sourced. Re-run this verification process quarterly for all regulatory thresholds and annually for all lender parameters.*
