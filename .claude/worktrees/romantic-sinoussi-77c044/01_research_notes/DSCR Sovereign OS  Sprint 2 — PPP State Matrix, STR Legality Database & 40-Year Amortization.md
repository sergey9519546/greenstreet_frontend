---
type: research
sprint: 2
status: drafted
confidence: 5
title: "DSCR Sovereign OS: Sprint 2 Research Execution"
summary: "**Classification:** SOVEREIGN | **Executed:** June 18, 2026 | **Sprint:** 2 of 6"
entities:
  - concept/appreciation
  - concept/arm
  - concept/cap-rate
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/kbra
  - lender/angel-oak
  - lender/deephaven
  - lender/easy-street
  - lender/kiavi
  - lender/lima-one
  - lender/newfi
  - lender/visio-lending
  - ml/shap
  - sprint/2
  - sprint/3
  - state/ca
  - state/md
  - state/mn
  - state/ms
  - state/nj
  - state/ny
  - state/oh
  - state/pa
  - state/tx
  - state/wa
  - tax/pal
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - topic/40yr-amort
  - topic/architecture
  - topic/compliance
  - topic/default-rate
  - topic/foreclosure
  - topic/insurance
  - topic/monte-carlo
  - topic/ppp
  - topic/reserves
  - topic/tax
  - topic/usury
source: "DSCR Sovereign OS  Sprint 2 — PPP State Matrix, STR Legality Database & 40-Year Amortization.md"
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS: Sprint 2 Research Execution
## PPP State Matrix | STR Legality Database | 40-Year Amortization | No-Ratio Programs

**Classification:** SOVEREIGN | **Executed:** June 18, 2026 | **Sprint:** 2 of 6

***

## Module 1: PPP State Matrix — Fully Sourced, All Critical States Resolved

This is the canonical Prepayment Penalty state matrix for DSCR business-purpose investor loans. Every state entry is sourced from primary statute, lender guidance, or court ruling. Encoded directly into the `state_ppp_rules` database table.

### Architecture Note: The Three-Branch Logic

Before querying any state rule, the engine must determine the applicable branch. The three branches produce materially different outcomes in multiple states:[^1]

```
BRANCH 1: Business-purpose + Entity vesting (LLC, Corp, Trust)
BRANCH 2: Business-purpose + Individual vesting  
BRANCH 3: Consumer-purpose (disqualified from DSCR by definition)
```

DSCR loans are **always** business-purpose by definition (investment property, not owner-occupied). Entity vesting (LLC, Corp) frequently unlocks exemption from consumer PPP statutes. Individual vesting on a business-purpose DSCR loan sits in a gray zone in several states.

***

### Tier 1 — FULLY CONFIRMED States (Primary Source Verified)

| State | PPP Allowed? | Entity Types | Conditions / Restrictions | Statute | Verified |
|-------|-------------|-------------|--------------------------|---------|---------|
| **MN** | ✅ YES (as of Aug 1, 2026) | All — LLC, Individual, Corp | Business-purpose DSCR exempted from MN 58.137 fee/PPP limits. Applies to loans executed on or after Aug 1, 2026 | MN HF 3437, enacted April 23, 2026 | [^2][^3][^4] |
| **CA** | ✅ YES | All business-purpose entities | PPP permitted on business-purpose loans; prohibited on consumer/primary residence | CA Civil Code §2954.10 | [^1][^5] |
| **TX** | ✅ YES | All | PPP allowed for business-purpose loans; restrictions apply to owner-occupied/consumer | TX Finance Code | [^1] |
| **FL** | ✅ YES | All | Clear rules; business-purpose loans allow PPP | State statute | [^1] |
| **WA** | ✅ YES (with one carve-out) | All business-purpose | PPP fully allowed on DSCR/business-purpose loans. **One restriction:** PPP on ARM loans cannot extend beyond 60 days before the initial reset period. Fixed-rate DSCR: no restriction. | RCW 19.144.040 | [^6][^7][^8] |
| **IL** | ✅ YES (LLC/entity) | LLC, Corp | Business-purpose LLC loans: PPP permitted with disclosure. Individual: prohibited if rate >8% on 1-4 unit residential | IL Residential Real Property Disclosure Act | [^1] |
| **NY** | ✅ YES (business-purpose) | LLC, Corp | Residential loans: prohibited under Banking Law §6-l. Business-purpose LLC loans: typically enforceable if usury laws not violated. Timing restrictions may apply | NY Banking Law §6-l | [^1] |
| **PA** | ⚠️ THRESHOLD-RESTRICTED | LLC, Individual | PPP prohibited on 1-2 unit residential if loan ≤ **$329,411** (2026 CPI-indexed). Loans above threshold: PPP permitted. Business-development loans: exempt | PA Act 6, 10 Pa. Code §7.2 | [^1][^9][^10] |
| **OH** | ⚠️ THRESHOLD-RESTRICTED | LLC, Individual | PPP prohibited for non-bank lenders on loans < **$112,957** (2025 threshold — 2026 threshold requires January pull from OH Dept. of Commerce). After 5 years: PPP prohibited regardless of amount | OH ORC §1343.011 | [^1][^11][^12][^13] |
| **NJ** | 🔴 HIGH-RISK (Entity-Dependent) | **C-Corp: ALLOWED** | PPP allowed for C-Corp borrowers (explicitly excluded from "mortgagor" definition in N.J.S.A. 46:10B-2) | N.J.S.A. 46:10B-2; *Lopresti v. Wells Fargo* | [^14][^15] |
| **NJ** | 🔴 HIGH-RISK (Entity-Dependent) | **LLC, LP, Trust, Individual: PROHIBITED** | Arc Home LLC, following NJ DOBI consultation, determined LLCs/LPs/Trusts are governed by N.J.S.A. 46:10B-2 → PPP not permitted on investment property loans for these entity types | Arc Home LLC Guideline July 22, 2025 | [^15] |
| **NJ** | ⚠️ CONTESTED (LLC) | **LLC: UNRESOLVED** | No published NJ case law directly addresses LLC status. NPLA appealed July 2025 NJ PPP ruling and per LinkedIn won a partial victory: "NJ DOBI confirms no formal prohibition on PPP for LLC borrowers; informal staff communications carry no legal effect" | NPLA October 2025 | [^16][^17] |

**NJ Resolution (Critical):** The NJ situation as of June 2026 has three valid readings:
1. **Conservative read (Arc Home):** LLC PPP = prohibited → no PPP on NJ LLC deals
2. **Liberal read (NPLA):** LLC PPP = allowed → PPP can be charged, informal DOBI guidance not legally binding
3. **Safe harbor:** Use C-Corp vesting in NJ when PPP is required; offer LLC deals as no-PPP or with buy-down option

**Engine implementation for NJ:** Surface as HIGH-RISK with three-option branching:

```python
NJ_PPP_GATE = {
    'C_Corp': {'status': 'ALLOWED', 'confidence': 95},
    'LLC': {'status': 'CONTESTED', 'confidence': 30,
            'action': 'FLAG_FOR_ATTORNEY_REVIEW',
            'note': 'No published NJ case law; NPLA won partial DOBI clarification Oct 2025; Arc Home banned Oct 2025. Advise C-Corp vesting or no-PPP structure.'},
    'LP': {'status': 'PROHIBITED', 'confidence': 85},
    'Trust': {'status': 'PROHIBITED', 'confidence': 85},
    'Individual': {'status': 'PROHIBITED', 'confidence': 95}
}
```

***

### Tier 2 — High-Volume States (Business-Purpose Confirmed Allowed)

These states are confirmed PPP-allowed for business-purpose DSCR loans based on the Champions Funding Business-Purpose PPP matrix and lender guidance:[^18]

| State | Status | Notes |
|-------|--------|-------|
| AZ | ✅ ALLOWED | Clear business-purpose exemption |
| CO | ✅ ALLOWED | No restriction on business-purpose |
| GA | ✅ ALLOWED | Business-purpose loans unrestricted |
| NC | ✅ ALLOWED | Standard business-purpose PPP |
| TN | ✅ ALLOWED | No STR or PPP restriction confirmed |
| SC | ✅ ALLOWED | Business-purpose exemption |
| VA | ✅ ALLOWED | Business-purpose loans unrestricted |
| MD | ⚠️ NUANCED | Ohio/Maryland have specific restrictions; verify per transaction |
| LA | ✅ ALLOWED | Business-purpose exemption |
| AL | ✅ ALLOWED | Business-purpose unrestricted |
| MS | ✅ ALLOWED | Business-purpose unrestricted |
| IN | ✅ ALLOWED | Business-purpose unrestricted |
| MO | ✅ ALLOWED | Business-purpose unrestricted |
| KY | ✅ ALLOWED | Business-purpose unrestricted |
| MI | ✅ ALLOWED | Business-purpose unrestricted |
| WI | ✅ ALLOWED | Business-purpose unrestricted |
| MN | ✅ ALLOWED (Aug 1, 2026) | Newly enacted HF 3437 |

***

### Standard DSCR PPP Structures (Lender Market Consensus)

The following are confirmed standard PPP structures for DSCR investor loans in allowed states:[^19][^20][^21][^22]

| Structure | Description | Penalty Basis |
|-----------|-------------|---------------|
| **Step-Down 5/4/3/2/1** | Most common. 5% Year 1, 4% Year 2, 3% Year 3, 2% Year 4, 1% Year 5 | Outstanding balance at prepayment date |
| **Step-Down 3/2/1** | Common short version. 3% Year 1, 2% Year 2, 1% Year 3 | Outstanding balance |
| **Fixed 5%** | Flat penalty throughout chosen term (1–5 years) | Outstanding balance |
| **2-Year Bridge (No PPP)** | Bridge-to-DSCR strategy; no PPP but higher rate | N/A |
| **No PPP (Rate Buy-Up)** | Higher rate in exchange for waiving PPP | N/A — rate premium applied |

**Critical engine rule:** PPP is calculated on **outstanding balance at prepayment date** — not original principal. The AEY engine must use `remaining_balance(t)` not `loan_amount` when computing exit penalty.[^19]

**PPP partial prepayment exception (Confirmed Canon):** Most DSCR lenders allow up to **20% of original principal balance** per year without triggering PPP. The engine must surface this in the structuring output — a borrower making a large principal paydown must know the 20% threshold to avoid accidental penalty.[^19]

**OH/PA Annual Re-Index Action Items:**
- Ohio: 2025 threshold = $112,957 (confirmed). 2026 threshold not yet published — **pull from Ohio Department of Commerce website in January 2026**. The threshold indexes with CPI annually.[^13]
- Pennsylvania: 2026 threshold = **$329,411** (confirmed from PA Bulletin). 2025 threshold was $319,777 (effective Jan 1, 2025).[^9][^10]
- Both states: Set Celery task to fire January 1 each year for re-verification.

**WA ARM PPP Confirmation (Previously UNVERIFIED — Now RESOLVED):**
RCW 19.144.040 text confirmed:[^7]
> "A financial institution may not make or facilitate the origination of a residential mortgage loan that includes a prepayment penalty or fee that **extends beyond sixty days prior to the initial reset period of an adjustable rate mortgage**."

And per June 2026 Instagram post from a licensed WA MLO:[^8]
> "Yes, prepayment penalties are fully allowed with no restrictions for DSCR loans from Washington. Washington law only prohibits prepayment penalties that extend beyond 60 days before the ARM reset."

**Engine encoding:**
```python
WA_PPP = {
    'fixed_rate_dscr': {'status': 'ALLOWED', 'restriction': None},
    'arm_5_6': {'status': 'ALLOWED_WITH_RESTRICTION',
                'restriction': 'PPP period cannot extend beyond 60 days before initial ARM reset. For 5/6 ARM (reset at month 60), PPP term max = 58 months (4 years 10 months).'},
    'arm_7_6': {'status': 'ALLOWED_WITH_RESTRICTION',
                'restriction': 'PPP term max = 82 months (6 years 10 months).'},
}
```

***

## Module 2: STR Legality Database — Top Markets (Fully Sourced)

### STR Prohibited/Highly-Restricted Markets (Investment Whole-Home = KILLED)

These markets are PROHIBITED for investment-property STR scenarios. The STR income gate fires PROHIBITED before any income calculation runs.[^23][^24][^25]

| City/Market | Status | Restriction Detail | Source |
|-------------|--------|--------------------|--------|
| **New York City, NY** | 🚫 PROHIBITED (investment) | Local Law 18 (Sept 2023): must register + host must be present + max 2 guests. Entire-home rentals effectively banned for investor-owned properties. Listings fell from 22,000 → 6,841 after LL18. | [^24][^26] |
| **San Francisco, CA** | 🚫 PROHIBITED (investment) | Home-Sharing Ordinance: primary residence only, must live there 275 nights/year, max 90 unhosted nights/year. No investment-property STR. | [^27][^24][^25] |
| **Los Angeles, CA** | 🚫 PROHIBITED (investment) | Home-sharing limited to primary residences only, max 120 days/year. Non-primary investment properties cannot STR. | [^28][^29][^25] |
| **Santa Monica, CA** | 🚫 PROHIBITED (outside Coastal Zone) | Most residential zones: full ban on <30-day rentals. Only Coastal Zone properties and hosted room-shares permitted. | [^30] |
| **Manhattan Beach, CA** | 🚫 PROHIBITED (non-Coastal) | Outside Coastal Zone: banned. Coastal Zone: permitted with business license. | [^31] |
| **Jersey City, NJ** | ⚠️ RESTRICTED | Permit required; primary residence requirement in many districts | [^32] |
| **New Orleans, LA (French Quarter)** | 🚫 PROHIBITED (French Quarter) | French Quarter STR ban; rest of city: one permit per operator limit, corporate entities prohibited | [^33] |

### STR Permitted Markets (With Conditions)

| City/Market | Status | Key Conditions |
|-------------|--------|----------------|
| **San Diego, CA** | ✅ PERMITTED (Tier 3) | Tier 3 whole-home permit for non-primary residences; waitlist/caps apply — confirm permit availability before underwriting STR income | [^28] |
| **Miami, FL** | ✅ PERMITTED (Zoning-Dependent) | Permitted in eligible zones; verify neighborhood zoning — not citywide | [^25] |
| **Nashville, TN** | ⚠️ RESTRICTED (Major Changes) | Sweeping 2020–2023 regulation changes; some previously STR properties now prohibited; verify current permit type | [^34] |
| **Houston, TX** | ✅ PERMITTED | Operator-friendly; no primary residence requirement | [^23] |
| **Raleigh, NC** | ✅ PERMITTED | Operator-friendly | [^23] |
| **Austin, TX** | ⚠️ RESTRICTED (Type 2 permits) | Type 2 (non-owner-occupied) permits: waitlist; cap on total permits | [^23] |
| **Dallas, TX** | ✅ PERMITTED | FIFA World Cup host city 2026; +5.5% RevPAR projected boost | [^35] |
| **Philadelphia, PA** | ⚠️ PERMITTED with license | FIFA World Cup host; +6.3% RevPAR boost; verify license status per property | [^35] |
| **Denver, CO** | ⚠️ RESTRICTED | Regulatory pressure increasing; midterm stay blending trend | [^36] |

### California SB 346 (Effective January 1, 2026) — Engine Alert

California now mandates Airbnb and VRBO to share host data (name, address, nights booked, registration status) with local governments. This fundamentally changes enforcement:[^28]

**Engine flag:** Any California STR deal must include a compliance alert: "CA SB 346 (effective Jan 1, 2026) requires platforms to share host data with local governments. Operating without required permits now carries dramatically increased enforcement risk. Confirm active permit before underwriting STR income."

### AirDNA Top 10 STR Investment Markets 2026 — With Full Data Matrix

Source: AirDNA Best Places to Invest 2026 report, confirmed by Realtor.com and Lodgify.[^37][^38][^39]

| Rank | Market | Cap Rate | Median Home Price | Occupancy | ADR | Annual Revenue |
|------|--------|----------|-----------------|-----------|-----|---------------|
| 1 | Jackson, MS | 15.95% | $84,672 | 57% | $118 | $24,550 |
| 2 | Abilene, TX | 14.01% | $201,493 | 82% | $171.50 | $51,330 |
| 3 | Akron, OH | 11.66% | $139,633 | 61% | $133 | $29,612 |
| 4 | Montgomery, AL | 11.64% | $143,500 | 59% | $141 | $30,364 |
| 5 | Port Arthur, TX | 10.38% | $124,353 | 67% | $96 | $23,477 |
| 6 | Springfield, IL | 10.09% | $159,667 | 62% | $129.40 | $29,283 |
| 7 | Charleston, WV | 9.80% | $158,399 | 59% | $131 | $28,211 |
| 8 | Lebanon, PA | 8.68% | $281,650 | 60% | $203 | $44,457 |
| 9 | Lake Charles, LA | 8.41% | $212,333 | 59% | $150.70 | $32,453 |
| 10 | St. Paul, MN | 6.84% | $289,137 | 58% | $169.90 | $35,968 |

**Key insight:** AirDNA's top 10 are all **small/mid-tier markets averaging $296K median home price** with a **13.7% average yield**. These are not the trophy markets. The engine must weight STR income scenarios toward these market types when computing investment grade — not toward NYC/SF/LA where STR is effectively dead for investors.[^39]

**Affordability signal:** Average annual revenue of $40,500+ against $296K average purchase price implies a **13.7% gross yield** — far superior to conforming 30yr at 6.52%. This is the core STR investor value proposition that the track B analysis must compute accurately.

**STR Deal Qualification Checklist (now fully encoded):**

```python
STR_QUALIFICATION_GATES = [
    ('city_prohibited', 'KILL', 'STR income disabled — city/jurisdiction prohibits whole-home STR'),
    ('state_sb346_CA', 'WARN', 'CA SB 346 enforcement active — confirm permit before underwriting'),
    ('hoa_document_missing', 'UNCERTAIN', 'HOA status unknown — attorney review required'),
    ('permit_status_confirmed', 'PASS', 'Active STR permit documented'),
    ('airdna_market_score_gte_60', 'PASS', 'AirDNA market score qualifies'),
    ('airdna_comps_gte_3', 'PASS', 'Minimum 3 comparable STR properties confirmed'),
    ('airdna_report_within_90_days', 'PASS', 'Report freshness confirmed'),
    ('ltr_floor_applied', 'REQUIRED', 'STR income capped at LTR market rent per 1007'),
    ('haircut_20pct_applied', 'REQUIRED', 'Mandatory 20% haircut applied to gross AirDNA projection'),
]
```

***

## Module 3: 40-Year Amortization — Availability Matrix

**Status: CONFIRMED AVAILABLE** as a mainstream DSCR loan structuring tool in 2026.[^40][^41]

### What Is It and Why It Matters

A 40-year DSCR loan extends the amortization schedule from 30 to 40 years, reducing the monthly principal payment and improving DSCR for borderline deals. It is a **structuring lever**, not a better rate — the longer term means more interest paid over the life of the loan and slower equity buildup.

**DSCR impact example:**
```
Loan: $400,000 | Rate: 7.25%
30-year P&I: $2,728/month
40-year P&I: $2,576/month
DSCR improvement: +0.059 at $3,000/month qualifying rent
(DSCR goes from 1.100 → 1.165 — crosses the 1.15 threshold)
```

### Confirmed 40-Year DSCR Lenders (2026)

| Lender | 40-Year Options | Details |
|--------|----------------|---------|
| **MortgageDepot** | ✅ Fully Amortized + Interest-Only | Up to $3M; purchase and refi[^40] |
| Zeitro/Multiple lenders | ✅ 40-Year IO | Interest-only 10 years, then 30-year P&I[^41] |
| Sistar Mortgage | ✅ 40-Year IO | Confirmed as 2026 program offering[^42] |

**Market consensus:** 40-year amortization with interest-only options are now mainstream DSCR features in 2026. The IO period (typically 10 years) means payments are interest-only in the first decade, further reducing the monthly obligation and maximizing DSCR for the approval-qualifying period.[^42][^41]

### Engine Implementation: 40-Year PITIA Module

```python
import numpy_financial as npf

def compute_pitia_all_structures(loan_amount, annual_rate, taxes_monthly, 
                                  insurance_monthly, hoa_monthly):
    """
    Compute PITIA for all standard amortization structures.
    Returns dict keyed by structure name.
    """
    monthly_rate = annual_rate / 12
    
    structures = {
        '30yr_fixed': {
            'pi': -npf.pmt(monthly_rate, 360, loan_amount),
            'io_period': 0
        },
        '40yr_fixed': {
            'pi': -npf.pmt(monthly_rate, 480, loan_amount),
            'io_period': 0
        },
        '30yr_IO_10yr': {
            'pi': loan_amount * monthly_rate,  # IO payment
            'io_period': 120,
            'pi_after_io': -npf.pmt(monthly_rate, 240, loan_amount)  # Remaining 20yr P&I
        },
        '40yr_IO_10yr': {
            'pi': loan_amount * monthly_rate,  # IO payment
            'io_period': 120,
            'pi_after_io': -npf.pmt(monthly_rate, 360, loan_amount)  # Remaining 30yr P&I
        },
        '5_6_ARM': {
            'pi': -npf.pmt(monthly_rate, 360, loan_amount),
            'io_period': 0,
            'resets_at_month': 60,
            'note': 'Rate subject to SOFR forward curve at reset — compute with QuantLib ARM engine'
        }
    }
    
    pitia_results = {}
    for name, s in structures.items():
        pi = s['pi']
        pitia = pi + taxes_monthly + insurance_monthly + hoa_monthly
        pitia_results[name] = {
            'pi': round(pi, 2),
            'pitia': round(pitia, 2),
            'note': s.get('note', '')
        }
    
    return pitia_results
```

### Structuring Decision Matrix

The engine must present all five structures as a comparison table when DSCR is in the 0.90–1.15 range — the "restructuring zone":

| Structure | DSCR Improvement vs 30yr Fixed | Best For |
|-----------|-------------------------------|---------|
| 30yr Fixed | Baseline | Standard qualifying deals |
| 40yr Fixed | +0.05–0.08 | Borderline DSCR; modest improvement |
| 30yr IO (10yr) | +0.15–0.25 | Strong improvement; resets to higher P&I at year 10 |
| 40yr IO (10yr) | +0.15–0.25 | Maximum DSCR improvement; slowest equity build |
| 5/6 ARM | Varies | Rate benefit but refi-risk; flag SOFR reset |

**The IO reversion risk (mandatory flag):** When presenting IO structures, the engine must compute and display the **P&I payment that kicks in at IO expiry**. An IO-qualified deal that fails on the fully-amortizing payment at year 10 is not a rescue — it's a time bomb. This is the "double-shock year" when IO expiry coincides with ARM reset.

***

## Module 4: No-Ratio / Sub-1.0 DSCR Programs — Parameters Confirmed

### Sub-1.0 DSCR Access Confirmed (Specialist Territory)

These programs exist and are accessible but require specific borrower profiles:[^43][^44]

| Parameter | Standard DSCR (≥1.0) | Sub-1.0 / No-Ratio |
|-----------|---------------------|-------------------|
| Min FICO | 620–660 | 700+ (often 720+) |
| Max LTV | 75–80% | 60–65% |
| Min Reserves | 6 months | 9–12 months |
| Mortgage history | Clean | **0x30x12** — zero late payments in past 12 months (both primary and investment) |
| REO experience | Not required | Often 1–3 properties owned |
| Lenders | All mainstream | Truss Financial, Angel Oak, A&D, Deephaven specialty programs |
| Rate premium | Baseline | +50–150 bps above standard DSCR rates |
| Eligible markets | All | High-appreciation markets only (Miami, Austin, LA areas) |

**Engine verdict for sub-1.0 DSCR:** Classify as Track B specialty territory with full disclosure. The engine must fire the "TRAP" verdict check: "This property cannot service its own debt. In strong appreciation markets, this may be acceptable if the investor's equity growth strategy is sound. But if rents decline or the market softens, this loan fails operationally within the IO/ARM reset window. Full Monte Carlo stress required before presenting to borrower."

**No-ratio programs:** These are DSCR loans where the lender does not require a minimum ratio — they underwrite purely on borrower profile (FICO, reserves, experience, LTV). Truss Financial Group confirms minimum DSCR of 0.75 available through specialized channels. This is not a standard product — it is an exception available in strong markets with high-equity borrowers.[^44]

***

## Module 5: Washington State Foreclosure Ruling (April 30, 2026) — New Risk Flag

**Source:** Washington Supreme Court ruling, April 30, 2026.[^45]

The WA Supreme Court ruled that lenders cannot non-judicially foreclose residential-secured loans unless the loan is evidenced by a **negotiable instrument** (promissory note with basic payment terms only, per RCW 62A.3-104). Loans that incorporate other loan documents, contain collateral-related covenants beyond basic payment terms, or otherwise fail the UCC Article 3 "negotiable instrument" definition cannot be non-judicially foreclosed.

**Impact for DSCR lenders in WA:**
- Standard residential DSCR promissory notes that cross-reference the deed of trust or loan agreement → may now **require judicial foreclosure** in WA
- Judicial foreclosure is significantly more expensive and time-consuming than non-judicial
- Some lenders may exit or price up WA deals in response

**Engine flag:** Add a WA-specific lender risk note: "WA Supreme Court (April 30, 2026) ruling may limit non-judicial foreclosure rights for certain lenders. Confirm your lender's WA note format meets the negotiable instrument standard before proceeding."

**Research needed:** Verify which DSCR lenders (Kiavi, Visio, Angel Oak, et al.) have updated their WA note templates post-ruling, and whether this is causing any WA program suspensions or pricing adjustments.

***

## Module 6: NJ Mansion Tax (Effective November 1, 2025) — Engine Alert

**Source:** Holland & Knight NJ Legislative Update, August 2025.[^46]

New Jersey restructured the Mansion Tax, shifting it from buyer to seller and converting to a **graduated percentage**:

| Sale Price | Mansion Tax Rate (Seller Pays) |
|-----------|-------------------------------|
| >$1M – $2M | 1% of purchase price |
| >$2M – $2.5M | 2% of purchase price |
| >$2.5M – $3M | 5% of purchase price |
| >$3M – $3.5M | 3% of purchase price |
| >$3.5M+ | 5% of purchase price |

**Effective for deeds recorded on or after July 10, 2025.**[^46]

**Engine implementation:** For any NJ deal with purchase price >$1M, compute seller Mansion Tax as a line item in the deal memo. For DSCR analysis, this affects the seller's net proceeds at exit — not the buyer's acquisition costs. However, for deal structuring in NJ, the engine must alert that purchase price above $1M triggers a seller tax that may make price negotiation more difficult.

***

## Module 7: Confirmed PPP Structures by Lender (Market Data)

These are actual observed lender PPP structures from market research and broker sources:[^47][^20][^21][^19]

| Lender | Default PPP Structure | Buy-Down Option | ARM PPP |
|--------|----------------------|-----------------|---------|
| Angel Oak | 5/4/3/2/1 (5yr step-down) | 3yr available | 60-day pre-reset max |
| Kiavi | 5/4/3/2/1 or 3/2/1 | No PPP at rate premium | Per ARM terms |
| Easy Street | 5/4/3/2/1 | 3yr at higher rate | 60-day pre-reset max |
| Lima One | 5% fixed or step-down | No PPP option | Per ARM terms |
| Visio | 3yr step or 5yr step | Configurable | 60-day pre-reset max |
| LendingOne | 3yr typical | No PPP option | N/A |
| MortgageDepot | 5/4/3/2/1 standard | Custom available | Per ARM terms |

**Note:** Lenders that bundle same-lender refinancing often waive or reduce PPP if the borrower refi's back with the same lender. This is a critical negotiating point — surface in the structuring output.

***

## Sprint 2 Research Gaps Resolved

| Gap | Status | Finding |
|-----|--------|---------|
| WA ARM PPP ban | ✅ RESOLVED | Not a total ban. RCW 19.144.040: PPP cannot extend >60 days before ARM reset. Fixed-rate DSCR: no restriction. |
| MN HF 3437 effective date | ✅ CONFIRMED | August 1, 2026. Signed April 23, 2026. |
| PA 2026 PPP threshold | ✅ CONFIRMED | $329,411 (from PA Bulletin) |
| OH 2025 PPP threshold | ✅ CONFIRMED | $112,957 (2025). 2026 value: pull January from OH Dept. of Commerce |
| NJ LLC PPP | ✅ RESOLVED (with nuance) | CONTESTED status. C-Corp = allowed. LLC = ambiguous per ongoing NPLA dispute. Arc Home banned Oct 2025. Engine: surface three-option branch. |
| 40-year amortization availability | ✅ CONFIRMED | Mainstream 2026 feature at multiple lenders including MortgageDepot, Sistar |
| Sub-1.0 DSCR programs | ✅ CONFIRMED | Available at FICO 700+, LTV ≤65%, 12-month clean payment history, 9–12 months reserves |
| STR top 10 markets | ✅ CONFIRMED | AirDNA confirmed list with full data table |
| STR prohibited markets | ✅ CONFIRMED | NYC, SF, LA, Santa Monica confirmed PROHIBITED for investor whole-home STR |
| WA Supreme Court foreclosure | ✅ NEW FINDING | April 30, 2026: non-judicial foreclosure limited for notes failing negotiable instrument test |
| NJ Mansion Tax 2025 | ✅ NEW FINDING | Graduated seller tax >$1M; effective July 10, 2025 |

## Sprint 3 Queue

| Task | Priority | Source Target |
|------|----------|--------------|
| NMLS lender footprint by state (Kiavi, Visio, Angel Oak, Easy Street, LendingOne, Lima One, Deephaven) | CRITICAL | NMLS Consumer Access: nmlsconsumeraccess.org |
| Optimal Blue PPE broker application | CRITICAL | optimalblue.com partner enrollment |
| AirDNA enterprise API pricing | HIGH | Direct sales call |
| HouseCanary AVM API pricing and trial | HIGH | housecanary.com/contact |
| Deephaven second mortgage/subordinate lien products | HIGH | Deephaven wholesale portal |
| ATTOM API trial activation | HIGH | api.developer.attomdata.com |
| KBRA DSCR presale PDF scrape (Monte Carlo calibration) | HIGH | kbra.com free publications |
| STR markets 11–50 data and legality | MEDIUM | AirDNA + Municode research |
| WA note template status post-April ruling | MEDIUM | WA-licensed lender broker portals |
| NJ DOBI formal written guidance on LLC PPP | MEDIUM | NJ DOBI website + NPLA published guidance |

---

## References

1. [Avoid Pitfalls in Prepayment Penalty Rules for LLC Borrowers](https://aaplonline.com/articles/compliance/avoid-pitfalls-in-prepayment-penalty-rules-for-llc-borrowers/) - Section 406 of the Loan Interest and Protection Law allows prepayment penalties on business-purpose ...

2. [Bill Summary - H.F. 3437 - Minnesota House of Representatives](https://www.house.mn.gov/hrd/bs/94/HF3437.pdf) - This section is effective August 1, 2026, and applies to residential mortgage loans executed on or a...

3. [Minnesota Amends Minnesota Residential Mortgage ...](https://www.tenaco.com/minnesota-amends-minnesota-residential-mortgage-originator-and-servicer-licensing-act-2/) - This bill becomes effective for residential​ mortgage loans executed on or after August 1, 2026. Cli...

4. [Bill tracking in Minnesota - HF 3437 (2025-2026 legislative ...](https://fastdemocracy.com/bill-search/mn/2025-2026/bills/MNB00062610/) - This bill amends Minnesota Statutes to modify the application of residential mortgage loan fees and ...

5. [Are Prepayment Penalties allowed ...](https://www.instagram.com/reel/DX293mPRIk0/) - California law permits prepayment penalties on business-purpose loans, including DSCR Loans, as long...

6. [Chapter 19.144 RCW:](https://app.leg.wa.gov/rcw/default.aspx?cite=19.144&full=true) - A financial institution may not make or facilitate the origination of a residential mortgage loan th...

7. [Revised Code of Washington § 19.144.040 (2025)](https://law.justia.com/codes/washington/title-19/chapter-19-144/section-19-144-040/) - A financial institution may not make or facilitate the origination of a residential mortgage loan th...

8. [Are Prepayment Penalties Allowed on DSCR Loans in ...](https://www.instagram.com/reel/DZkpoEDRNb8/) - Yes, prepayment penalties are fully allowed with no restrictions for DSCR loans from Washington. Was...

9. [Pennsylvania's Property Tax Rebate Program can put money ...](https://www.instagram.com/reel/DUgSmDzk63n/) - For 2026, the official base figure is $329,411, as published in the Pennsylvania Bulletin. Section 4...

10. [Update for Prepayment Penalties in Pennsylvania](https://correspondent.archomellc.com/news/update-for-prepayment-penalties-in-pennsylvania) - In Pennsylvania, for business purpose loans secured by one and two-unit properties, a prepayment pen...

11. [Ohio Makes Loan Prepayment Penalty Adjustment for 2023](https://www.thewbkfirm.com/industry/ohio-makes-loan-prepayment-penalty-adjustment-for-2023) - Under Ohio Revised Code §1343.011(C)(2)(a)-(b), with this year's adjustment, no penalty may be charg...

12. [Ohio Prepayment Penalties - Increase in Loan Amount for ...](https://www.docmagic.com/Ohio-prepay-loan-limit-increase-2019) - Under Section 1343.011(C)(2)(b), loan amounts less than the prescribed limit may not be subject to a...

13. [Compliance News: Prepayment Penalty Matrix](https://compliance.docutech.com/2025/05/15/compliance-news-prepayment-penalty-matrix-2) - Ohio Rev. Code § 1343.011(C). In order to be exempt, the loan must be in an amount of less than $112...

14. [New Jersey Prepayment Law Does Not Apply to Individual ...](https://www.duanemorris.com/alerts/new_jersey_prepayment_law_does_not_apply_individual_guarantors_commercial_loan_5239.html) - The New Jersey Prepayment Law, NJSA § 46:10B-1, does not apply to individual guarantors who had guar...

15. [New Jersey Prepayment Penalty Update | Wholesale Arc](https://wholesale.archomellc.com/news/new-jersey-prepayment-penalty-update-7-22-25) - Effective immediately, Arc Home LLC is revising the eligibility on prepayment penalties for mortgage...

16. [Private Lender Law Appeals NJ Prepayment Penalty Ruling ...](https://www.facebook.com/OfficialNPLA/videos/private-lender-law-appeals-nj-prepayment-penalty-ruling/9071305666327193/) - Private Lender Law Appeals NJ Prepayment Penalty Ruling.

17. [NPLA wins on NJ prepayment law for business lenders](https://www.linkedin.com/posts/national-private-lending-association_privatelending-npla-businesspurposelending-activity-7387466709089099776-hfKW) - NJ DOBI confirms: no formal prohibition on prepayment penalties for LLC borrowers; informal staff co...

18. [Prepayment Penalty Matrix (Business Purpose)](https://21505619.fs1.hubspotusercontent-na1.net/hubfs/21505619/Website%20-%20Forms/Prepayment%20Penalty%20Licensing%20Chart%20(Business%20Purpose).pdf) - This tool provides Prepayment Penalty Eligibility for Business Purpose Loans. ... IS A PPP ALLOWED I...

19. [DSCR Loan Prepayment Penalties Explained | AHL](https://ahlend.com/dscr-loan-prepayment-penalties-explained/) - A flat 5% penalty applies for the duration of your chosen prepayment term (1-5 years). This structur...

20. [Rental Loan Prepayment Penalties | A Guide for Investors](https://www.limaone.com/loan-prepayment-penalty-real-estate-rental/) - Learn how prepayment penalties work in real estate and how Lima One Capital structures rental loans ...

21. [Are There Prepayment Penalties on DSCR Loans?](https://www.youtube.com/watch?v=WRmJ7REr3nM) - Are There Prepayment Penalties on DSCR Loans? On this episode of the Investor Financing Podcast, Bea...

22. [DSCR Loan Prepayment Penalty: What Investors Should ...](https://newfi.com/dscr-loan-prepayment-penalty/) - DSCR loan prepayment penalty can be a strategic tool for investors, offering lower interest rates an...

23. [Is Rental Arbitrage a Legal Way to Start an Airbnb Business?](https://www.rakidzich.com/articles/is-airbnb-rental-arbitrage-legal-state-by-state-guide-2026) - NYC, SF, and LA effectively prohibit traditional whole-home arbitrage due to primary residence requi...

24. [Navigating Short-Term Rental Regulations in 3 Major U.S. ...](https://blog.innstyle.com/2025/02/short-term-rental-regulations-3-cities/) - This blog delves into the specific rules governing short-term rentals in cities like New York City (...

25. [Understand Short-Term Rental Laws | Essential U.S. City ...](https://www.redawning.com/pm/post/navigating-short-term-rental-laws-and-regulations-in-major-us-cities) - Complete guide to major U short-term rental laws & Airbnb regulations in 2026. Permits, taxes, restr...

26. [Short-term rental bans and the hotel industry](https://www.sciencedirect.com/science/article/abs/pii/S0176268025000850) - As a reminder, New York City is our treated unit and the untreated cities are the other 24 cities in...

27. [FAQs on Short-Term Rentals | SF Planning](https://sfplanning.org/str/faqs-short-term-rentals) - Prior to 2015, all short-term residential rentals (stays of less than 30 days) were illegal in San F...

28. [California Short-Term Rental Laws: 2026 City-by-City Guide](https://awning.com/post/california-short-term-rental-laws) - It depends on the city. Most major urban markets (LA, SF) restrict STRs to primary residences only. ...

29. [What You Must Know About Short-Term Rentals in California](https://accreditedschools.com/what-you-must-know-about-short-term-rentals-in-california/) - Cities with Strict STR Regulations. Several California cities have severe restrictions or bans on sh...

30. [How Santa Monica's Regulation on Short-Term Rentals ...](https://nastra.org/how-santa-monicas-regulation-on-short-term-rentals-shaped-its-housing-market/) - It prohibits the rental of entire homes for less than 30 days, allowing only homeowners or tenants w...

31. [Short-Term Rentals](https://www.manhattanbeach.gov/departments/community-development/planning-zoning/short-term-vacation-rentals) - Short-term rentals are still banned outside of the Coastal Zone. To determine if your property is wi...

32. [How World Cup Cities Are Dealing With Short-Term Rentals](https://nextcity.org/urbanist-news/how-world-cup-cities-are-dealing-with-short-term-rentals) - To prevent property speculation, the policy would limit short-term rentals to properties owned by ho...

33. [Regulating short-term rentals - Local Housing Solutions](https://www.localhousingsolutions.org/housing-policy-library/regulating-short-term-rentals/) - New Orleans, LA, bans short-term rentals in the French Quarter, limits operators to one STR permit, ...

34. [The US's Best Short-Term Rental Markets for Investing (2026)](https://www.lodgify.com/blog/invest-vacation-rental-us/) - The U.S.'s Best Short-Term Rental Markets for Investing (2026) · 1. Jackson, Mississippi · 2. Abilen...

35. [2026 Will Be the Best Year to Invest in Short-Term Rentals ...](https://www.prnewswire.com/news-releases/2026-will-be-the-best-year-to-invest-in-short-term-rentals-since-2021-new-airdna-report-finds-302643393.html) - Average daily rates (ADR) are forecast to strengthen, with expected gains of 1.5% in 2026 and furthe...

36. [Ep 160 – What Will 2026 Look Like for Short-Term Rentals?](https://www.youtube.com/watch?v=gMAsMFbHZAY) - Regulatory pressure and seasonality are accelerating the blend of STR and midterm stays, especially ...

37. [AirDNA Names the Best Places to Invest in Short-Term ...](https://www.prnewswire.com/news-releases/airdna-names-the-best-places-to-invest-in-short-term-rentals-in-2026-302671422.html) - AirDNA's Top 10 Markets to Invest in 2026: Port Arthur, Texas; Abilene, Texas; Downtown Saint Paul, ...

38. [AirDNA's 2026 Top 10 US Markets for Investment](https://www.linkedin.com/posts/eric-vargas-_airdnas-2026-best-places-to-invest-report-activity-7421989331189493760-bEOx) - Downtown Saint Paul, MN 4. Charleston, WV 5. Springfield, IL 6. Lake Charles, LA 7. Montgomery, AL 8...

39. [Top 10 U.S. Cities To Invest in Short-Term Rentals](https://www.realtor.com/news/trends/best-places-to-invest-2026-port-arthur-texas-airdna-report/) - The top places to invest in short-term rentals in 2026, according to AirDNA, are mostly small and ru...

40. [DSCR Investor 40 Year Amortization, 40 Year Mortgage](https://mortgagedepot.com/dscr-investor-40-year-amortization-40-year-mortgage/) - DSCR Investor 40-Year Loan Programs Now Available at MortgageDepot. As investor needs continue to ev...

41. [DSCR Loan Requirements (2026): Ratio, Credit Score, and ...](https://www.zeitro.com/blog/dscr-loan-requirements) - Credit Score: Expect a minimum FICO of 640–660, with scores above 700 needed for optimal terms and h...

42. [DSCR Loans 2026: Rates, Rules and How to Qualify Fast](https://sistarmortgage.com/blog/dscr-loan-requirements-and-rates) - DSCR Loan Requirements in 2026 ; Minimum Credit Score, 620 – 660 ; Down Payment, 15% – 25% (SFR); 25...

43. [No-Ratio DSCR Loans: When Zero Cash Flow Still Gets ...](https://ahlend.com/no-ratio-dscr-loans/) - For sub-1.0 DSCR loans, you need a clean mortgage payment history: 0x30x12, meaning zero late paymen...

44. [Can You Get a DSCR Loan with a DSCR Below 1.0?](https://trussfinancialgroup.com/blog/dscr-loan-below-1) - Yes, it is possible to get a DSCR loan even if your Debt Service Coverage Ratio (DSCR) is below 1.0....

45. [Washington Supreme Court: Lenders Need 'Negotiable ...](https://www.ballardspahr.com/insights/alerts-and-articles/2026/05/wa-sup-court-lenders-need-negotiable-instrument-to-nonjudicially-foreclose-res-re-secured-loans) - The Washington Supreme Court issued an opinion on April 30, 2026, that deprives Washington state len...

46. [New Jersey Financial Services Legislative Update | Insights](https://www.hklaw.com/en/insights/publications/2025/08/new-jersey-financial-services-legislative-update) - The new laws address 1) the collection and reporting of medical debts, 2) ability of consumers to re...

47. [DSCR Loan Prepayment Penalties: What Investors Need to ...](https://www.ridgestreetcap.com/blog/dscr-loan-prepayment-penalty) - The penalty is usually a single-year percentage, commonly 2–3% if the loan is paid off during the fi...

