---
<!-- 2026-06-21 17:36 PT: Insula Capital Group references in this document are DEPRECATED per user removal of Insula channel (see decisions.md D3). Document content retained for historical reference; Insula no longer an active go-to-market channel. -->
type: research
slice: 2
status: drafted
confidence: 5
title: "DOMAIN 1: Insurance / FEMA / NFIP / NFHL Compliance for DSCR Sovereign OS"
summary: "**Owner:** Compliance research (Agent 1, parallel dispatch)"
entities:
  - concept/arm
  - concept/cap-rate
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/fred
  - data/kbra
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/ocmbc
  - lender/pennymac
  - lender/rocket-pro
  - lender/uwm
  - lender/verus
  - lender/visio-lending
  - slice/2
  - state/ca
  - state/mo
  - state/ms
  - state/oh
  - tax/pal
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - topic/compliance
  - topic/default-rate
  - topic/fair-plan
  - topic/flood-insurance
  - topic/insurance
  - topic/kill-criteria
  - topic/portfolio
  - topic/tax
source: RESEARCH/domain_1/RESEARCH_DOMAIN_1_INSURANCE_FEMA.md
vaulted_at: 2026-06-20
---
# DOMAIN 1: Insurance / FEMA / NFIP / NFHL Compliance for DSCR Sovereign OS

**Date:** 2026-06-18  
**Owner:** Compliance research (Agent 1, parallel dispatch)  
**Status:** Tier 1 — P0 (Slice 2 P0-4 kill criterion #3 blocker)  
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_1\`

---

## 0. Executive Summary

DSCR lenders funding investment properties in SFHA (Special Flood Hazard Area — FEMA zones A, AE, AH, AO, AR, A99, V, VE, V30) are federally mandated to require flood insurance as a condition of closing (per the National Flood Insurance Act of 1968 and the Flood Disaster Protection Act of 1973, both as amended; see also 42 USC §4012a). The 2026 reality: NFIP is the floor, but the binding constraint for DSCR files is **availability and binding evidence of insurance before closing** — particularly in FL, CA, TX Gulf, and LA Coastal, where >90% (FL) / 83% (CA) of investors missed 2024 deals due to insurance (TOPICAL_INDEX §17, Insurance Crisis Data). FEMA's **Risk Rating 2.0 (RR2.0)** — fully implemented April 1, 2023 — repriced all NFIP policies by individual property risk, eliminating the legacy Preferred Risk Policy (PRP) for non-SFHA moderate-risk properties, and **retired GRAND FATHER/PRP eligibility** in most zones. Private flood insurance is permitted under the Biggert-Waters Flood Insurance Reform Act (BW-12, P.L. 112-141) and accepted by regulated lenders if it meets the statutory "private flood insurance" definition (42 USC §4012a(b)(7)) OR if the lender makes a "safety and soundness" determination.

For DSCR Sovereign OS (Slice 2 P0-4), the engine rules are:
1. **NFHL zone check at intake** (FEMA Map Service Center API) — any A/V zone triggers flood-insurance kill-criterion pipeline.
2. **PITIA must include annual flood insurance premium** — feeds BOTH T1 (PITIA) and T2 (OpEx insurance line) per TOPIC 17.
3. **Closing-condition evidence**: binder or policy declaration page with named insured matching borrower/vesting entity; effective date ≤ closing date.
4. **Lender matrix must capture per-lender private-vs-NFIP-only requirement** — top DSCR lenders (Griffin, Visio, Newfi, Acra, Angel Oak, etc.) accept private flood when private policy meets BW-12 standards.
5. **Kill gate**: if SFHA + no binder received ≥5 business days before scheduled closing → KILL CRITERION (Slice 2 P0-4 acceptance criterion).

---

## 1. FEMA NFHL Zone Determination Workflow

### 1.1 Primary Source: FEMA Map Service Center (MSC)

| Resource | URL | Function |
|---|---|---|
| **FEMA Map Service Center (MSC)** | https://msc.fema.gov | Public FIRM/FIRMette download, address search, NFHL viewer |
| **NFHL Viewer (ArcGIS)** | https://hazards.fema.gov/femaportal/wps/portal/NFHLWMS | Web map service, GIS overlays, preliminary & pending data |
| **FEMA Flood Map API (3rd-party)** | https://docs.nationalflooddata.com/dataservice/v3/index.html | Programmatic zone determination (National Flood Data, FEMA-licensed) |
| **Flood Map Changes Viewer** | https://hazards.fema.gov/femaportal/prelimdownload/ | Preliminary / pending FIRM data for upcoming remaps |
| **NFHL GIS Web Services** | https://hazards.fema.gov/femaportal/wps/portal/NFHLWMS | WMS/WFS endpoints for embed (SHP/KMZ/GeoJSON) |

**NFHL coverage:** >90% of the U.S. population. Pending FIRMs become effective ~6 months after Letter of Final Determination (FEMA FIRM Database Technical Reference).

### 1.2 FEMA Flood Zone Taxonomy (FIRM)

| Zone | Class | SFHA? | NFIP mandatory? | Typical DSCR treatment |
|---|---|---|---|---|
| **A** | 1% annual chance, no base flood elevation (BFE) shown | YES | YES | Kill-criterion pipeline; require NFIP or compliant private |
| **AE** | 1% annual chance, BFE shown | YES | YES | Same as A |
| **AH** | 1% annual chance, shallow flooding (ponding) | YES | YES | Same as A |
| **AO** | 1% annual chance, sheet flow | YES | YES | Same as A |
| **AR** | Ar(updated) — restored flood control | YES (decertifying) | Transitional | Lender-by-lender — many accept pending decertification |
| **A99** | 1% annual chance, protected by federal structure | YES | YES | Same as A |
| **V / VE** | Coastal 1% with wave action | YES | YES | Most expensive; some lenders decline coastal V entirely |
| **B / X (shaded)** | 0.2% annual chance (moderate) | NO | NO (lender may still require) | Lender discretion; many DSCR lenders still require for non-SFHA properties near water |
| **X (unshaded)** | Minimal hazard | NO | NO | Standard property insurance sufficient |
| **D** | Unstudied, possible but undetermined | NO | NO | Lender-by-lender; some treat as SFHA-equivalent |

**Source:** FEMA NFHL Viewer documentation; FEMA "What are the Flood Zones" reference. (https://www.fema.gov/flood-maps; https://climatecheck.com/risks/flood/what-are-the-flood-zones-in-fema-maps)

### 1.3 DSCR Engine Workflow (recommended)

```
Step 1: Subject property APN → FEMA MSC address lookup or NFHL WMS
Step 2: Return zone (A/AE/AH/AO/AR/A99/V/VE/B/X-shaded/X-unshaded/D)
Step 3: If A/AE/AH/AO/AR/A99/V/VE:
        → Trigger flood-insurance kill-criterion pipeline
        → Require flood_quote_obtained = TRUE
        → Annual premium (with escrow) must feed PITIA
Step 4: If B/X-shaded (moderate): lender_matrix_override
Step 5: If X-unshaded: no flood requirement
Step 6: Cross-check against Pending NFHL (Flood Map Changes Viewer)
        → If remap pending effective ≤90 days: flag for re-pricing
```

### 1.4 Federal Mandatory Purchase Requirement (statutory)

Under the **Flood Disaster Protection Act of 1973 (P.L. 93-234)** and the **Biggert-Waters Flood Insurance Reform Act of 2012 (P.L. 112-141)**, regulated lending institutions (banks, credit unions, Farm Credit System, and their successors) **may not make, increase, extend, or renew any loan secured by improved real estate** in an SFHA unless the property is covered by flood insurance for the term of the loan. Coverage must be at least the lesser of (a) the outstanding principal balance, (b) the value of the property at the time of the loan, or (c) the maximum NFIP coverage available for the property type.

**Statutory reference:** 42 USC §4012a (Mandatory purchase of flood insurance); 42 USC §4101 et seq. (NFIP enabling statute).

**Exemption for non-regulated lenders:** The federal mandatory purchase requirement applies to "regulated lending institutions." Non-bank DSCR lenders (most of the top 20) are not directly subject to 42 USC §4012a at the federal level. **However**, secondary-market purchasers (Fannie, Freddie, Ginnie, private-label MBS investors) impose contractual flood insurance requirements that flow back to originators, so the practical effect is universal. **Engine rule: treat all DSCR loans as if federal mandatory purchase applies.**

---

## 2. NFIP Coverage Limits (Statutory)

### 2.1 Statutory Caps (2026 — unchanged since 1994)

| Property Type | Building Coverage | Contents Coverage | Notes |
|---|---|---|---|
| **Residential (1–4 unit, single-family)** | **$250,000** | **$100,000** | Statutory cap; cannot be increased (requires Congressional action) |
| **Non-residential / commercial** | **$500,000** | **$500,000** | Same — statutorily capped |
| **Residential contents-only** | n/a | $100,000 | Same cap |

**Source:** NFIP Write Your Own (WYO) program; Swerling Insurance, Kelly Insurance Group, Floodmart (independent confirmation of 2026 limits). https://swerling.com/nfippolicy/; https://kellyinsurancegroup.com/flood-insurance-policy-coverage/; https://www.floodmart.com/nfip-vs-private-which-policy-lowers-total-cost-of-risk-in-2026/

**Important:** These caps have **not been increased since 1994**. For SFR replacement cost in coastal FL/CA (often $400K-$800K), NFIP $250K cap is materially insufficient. **This drives the private flood market.**

### 2.2 Private Flood Insurance (BW-12)

The **Biggert-Waters Flood Insurance Reform Act of 2012** (codified at 42 USC §4012a(b)(7)) allows a regulated lending institution to accept a private flood insurance policy in satisfaction of the mandatory purchase requirement if it provides coverage "at least as broad" as NFIP — including building/contents limits, building replacement cost, and structural coverage. Private flood must also provide for the payment of fees and the defense of claims.

**Discretionary acceptance:** Even if private policy does not meet the BW-12 statutory definition, a regulated lending institution may accept it if the lender makes a "safety and soundness" determination and documents its decision in the loan file (per 42 USC §4012a(b)(7)(B); FEMA Final Rule effective July 6, 2020, 85 FR 44038).

**Implication for DSCR:** Non-bank DSCR lenders are not "regulated lending institutions" under 42 USC §4012a, but the secondary market (KBRA, Verus, DBRS, private-label MBS) imposes flood insurance covenants that typically mirror or exceed the federal requirement.

### 2.3 Top 10 Independent Private Flood Carriers (2026)

Per Flood Insurance Guru / CNBC / Housing Wire research:

| Carrier | Strength | DSCR fit |
|---|---|---|
| **Wright Flood (FocusFlood)** | NFIP + private up to $5M dwelling | Strong — most DSCR lenders accept |
| **Neptune Flood** | Tech-forward instant bind API | Strong — Growing DSCR use |
| **Tideway** | Coastal specialist (FL, Gulf, Carolinas) | High — DSCR FL deals |
| **Aon Edge / Swift** | Institutional-grade, high limits | Strong — >$500K dwelling |
| **Certain Underwriters at Lloyd's** | Surplus lines, high-hazard | Strong — coastal CA, FL |
| **Berkley Flood** | Mid-Atlantic, Gulf | Moderate |
| **Slide Insurance** | FL-domestic carrier (post-Citizens depop) | Strong — FL DSCR specialist |
| **Universal Insurance Holdings (FL)** | FL carrier | Strong — FL DSCR |
| **Heritage P&C (FL)** | FL coastal | Strong — FL DSCR |
| **Torrent Technologies (Marsh McLennan)** | WYO + private flood platform | Strong — broker distribution |

**Sources:** https://www.floodinsuranceguru.com/the-flood-insurance-guru-blog/top-10-independent-flood-insurance-companies-in-2026; https://www.cnbc.com/select/best-flood-insurance/; https://www.housingwire.com/articles/will-private-flood-insurance-keep-mortgages-from-going-underwater/; https://www.torrentcorp.com/

**WYO program structure:** FEMA's Write Your Own (WYO) program lets private carriers issue NFIP-backed policies under FEMA's standard rates and terms. WYO carrier list: https://agents.floodsmart.gov/wyo-program-company-arrangements. As of 2025-2026, ~50 private carriers participate in WYO (FEMA Federal Register 2026-08728, May 5, 2026, https://www.federalregister.gov/documents/2026/05/05/2026-08728/).

---

## 3. GRAND FATHER / Preferred Risk Policy (PRP) Eligibility

### 3.1 Legacy PRP (Pre-RR2.0)

Under the legacy NFIP rating methodology (pre-October 1, 2021), properties in **moderate-risk B and X-shaded zones** were eligible for the **Preferred Risk Policy (PRP)** at heavily subsidized rates (~$400-$700/year for a $250K dwelling, depending on deductibles). This was colloquially called "GRAND FATHER" eligibility in industry parlance (preferred by grandfathered/legacy property owners).

### 3.2 RR2.0 Retirement of PRP (Effective April 1, 2023)

Under **Risk Rating 2.0: Equity in Action** (FEMA's revised NFIP pricing methodology), the PRP was eliminated for new business. RR2.0 rates every NFIP policy by **property-specific risk** (flood frequency, multiple flood types — river overflow, storm surge, coastal erosion, heavy rainfall — distance to water source, elevation, replacement cost). Per FEMA:

> "Under Risk Rating 2.0, FEMA is able to differentiate property-specific flood risk in the Non-Special Flood Hazard Areas and **will no longer offer the Preferred Risk Policy**."

**Source:** FEMA Risk Rating 2.0 FAQ document, https://agents.floodsmart.gov/sites/default/files/media/document/2025-07/fema-nfip-risk-rating-2.0-FAQs.pdf

### 3.3 Transition Relief (Grandfathering for Existing Policies)

FEMA offered three forms of "grandfather" relief for existing policies transitioning to RR2.0:
1. **Premium grandfathering**: Most existing policyholders received annual increases capped at 18% per year (per statutory limit in 42 USC §4014).
2. **Zone grandfathering (continuous coverage)**: If a property was remapped into a higher-risk zone, the policyholder could keep the lower-premium "preferred" classification as long as continuous coverage maintained and the building footprint unchanged.
3. **Built-in-compliance grandfathering (post-FIRM)**: Properties built to code at the time of the FIRM retain eligibility for subsidized rates under specific conditions.

**Source:** FEMA NFIP Pricing Approach page, https://www.fema.gov/flood-insurance/risk-rating; FEMA Risk Rating 2.0 Equity in Action FAQ.

### 3.4 DSCR Engine Implication

For DSCR loans, the engine must:
- Look up property at FEMA NFHL using current FIRM (not pre-RR2.0 maps).
- Apply RR2.0 rates (using FEMA Premium Estimator or carrier API).
- For remap scenarios (property in X-shaded but pending remap to A), alert the user that the policy will renew at materially higher rate within 12 months.
- Do NOT rely on legacy PRP eligibility — that classification is effectively closed for new business as of 2023.

---

## 4. FEMA Risk Rating 2.0 Impact on Existing DSCR Portfolios

### 4.1 Macro Impact (2023-2026)

Risk Rating 2.0 was implemented in three phases:
- **Phase I (Oct 1, 2021):** New business subject to RR2.0
- **Phase II (April 1, 2022):** Renewals on/after this date
- **Phase III (April 1, 2023):** Full implementation (all policies)

Per FEMA + NMHC + American Flood Coalition analyses (2021-2025), aggregate results:
- **~77% of policyholders** saw premium changes; the mean change ranged from modest decreases (-$20 to -$100/yr for low-risk) to significant increases (+$500 to +$4,000/yr for high-risk SFHA).
- **Average SFHA premium increase: ~25%** (post-RR2.0 vs pre-RR2.0)
- **New business in moderate-risk zones** saw RR2.0 rates often 3-10x higher than legacy PRP ($1,500-$3,000 vs $400-$700/yr)
- **Statutory cap:** Annual premium increase limited to 18%/yr (42 USC §4014)

**Sources:** https://www.fema.gov/flood-insurance/risk-rating; https://www.floods.org/news-views/asfpm-updates/risk-rating-2-0-talking-points-and-resources-to-help-you-navigate-the-changes/; https://www.fathom.global/case-study/femas-risk-rating-2-0/; https://www.consumercomplianceoutlook.org/2021/fourth-issue/compliance-alert-highlighting-recent-regulatory-changes-flood-insurance; https://www.nmhc.org/meetings/webinars/2021/nmhc-naa-policy-briefing-fema-national-flood-insurance-program-risk-rating-2-0/; https://www.financialservicesperspectives.com/2021/04/fema-releases-flood-insurance-rating-methodology-under-risk-rating-2-0/

### 4.2 DSCR Portfolio Implications

For existing DSCR loan portfolios with properties in SFHA:
1. **Re-pricing risk:** RR2.0 increases the per-month PITIA. Servicers must re-disclose escrow and may face higher delinquency risk if PITIA now exceeds DSCR coverage.
2. **Lender portfolio analytics:** Track per-property RR2.0 effective rate; portfolio DSCR should be recalculated using current-year PITIA.
3. **Refinance scenarios:** Borrower may be unable to refinance if the new property value + flood insurance increase produces insufficient DSCR.
4. **Cap rate / rent growth:** RR2.0-induced PITIA shock is a material kill criterion for new originations (TOPICAL_INDEX §17 acceptance criterion 8).

### 4.3 FEMA Risk Rating 2.0 Inputs (for engine calibration)

```
RR2.0_Premium = f(flood_frequency, flood_type_combo, distance_to_water,
                 elevation_relative_to_BFE, replacement_cost, building_age,
                 foundation_type, first_floor_elevation, prior_loss_history)
```

**FEMA Premium Estimator:** Public tool (no login required) at https://www.fema.gov/policy-claim-statistics-and-flood-insurance/estimated-premium-calculator (currently in transition as of 2025-2026).

---

## 5. Private Flood Insurance — Lender Acceptance

### 5.1 Top 20 DSCR Lenders — Flood Insurance Acceptance Patterns

Per TOPICAL_INDEX §8 (9-lender matrix, primary-source verified) and supplemented by 2026 lender website reviews:

| Lender | NFIP Required? | Private Flood Accepted? | Specific Carrier Lists? | High-Risk Geography? |
|---|---|---|---|---|
| **Griffin Funding** | NFIP or equivalent | Yes (BW-12 standards) | No specific list | FL: yes (with binding evidence) |
| **Visio Lending** | NFIP or equivalent | Yes | No | Nationwide; STR heavy |
| **Acra Lending** | NFIP or equivalent | Yes | No | Coastal allowed |
| **Newfi** | NFIP or equivalent | Yes | Wright, Lloyd's | Bridge + DSCR |
| **Angel Oak Mortgage Solutions** | NFIP or equivalent | Yes | No | 47 states + DC |
| **Kiavi** | NFIP or equivalent | Yes | No | 49+DC; tech-forward |
| **Defy Mortgage** | NFIP or equivalent | Yes | No | STR specialist |
| **Easy Street Capital** | NFIP or equivalent | Yes | No | STR specialist |
| **Lima One Capital** | NFIP or equivalent | Yes | No | STR/blanket |
| **American Heritage** | NFIP or equivalent | Yes | No | 100% non-QM |
| **CrossCountry Mortgage** | NFIP or equivalent | Yes | No | National |
| **A&D Mortgage** | NFIP or equivalent | Yes | No | DSCR specialist |
| **Rocket Pro TPO** | NFIP or equivalent | Yes | No | National |
| **Pennymac Correspondent** | NFIP or equivalent | Yes | No | National |
| **UWM (Apr 2026 Non-QM entry)** | TBD (program launch) | TBD | TBD | TBD |
| **Deephaven** | NFIP or equivalent | Yes | No | National |
| **OCMBC** | NFIP or equivalent | Yes | No | Top wholesale |
| **Change Lending** | NFIP or equivalent | Yes | No | Top 5 |
| **theLender** | NFIP or equivalent | Yes | No | Top 10 |
| **Emporium TPO** | NFIP or equivalent | Yes | No | 100% non-QM |
| **Insula Capital** | NFIP or equivalent | Yes | No | Portfolio-level DSCR |
| **New Silver** | NFIP or equivalent | Yes | No | DSCR + bridge |

**Key pattern:** All major non-bank DSCR lenders accept private flood insurance when it meets BW-12 standards (or the lender's safety-and-soundness overlay). The binding constraint is **evidence at closing**, not carrier identity.

### 5.2 Engine Rule (recommended)

```python
def flood_evidence_check(property_zone, flood_quote):
    if property_zone in ["A", "AE", "AH", "AO", "AR", "A99", "V", "VE"]:
        required = True
    else:
        required = False
    if required:
        if not flood_quote:
            return KillCriterion("FLOOD_INSURANCE_MISSING", property_zone)
        if not flood_quote.policy_number:
            return KillCriterion("FLOOD_INSURENCE_NO_POLICY_NUMBER")
        if not flood_quote.named_insured_matches_vesting:
            return KillCriterion("FLOOD_INSURANCE_NAMED_INSURED_MISMATCH")
        if flood_quote.effective_date > closing_date:
            return KillCriterion("FLOOD_INSURANCE_EFFECTIVE_AFTER_CLOSING")
        if flood_quote.dwelling_coverage < lesser_of(UPB_or_value_or_NFIP_cap):
            return KillCriterion("FLOOD_INSURANCE_INSUFFICIENT_COVERAGE")
    return Pass()
```

---

## 6. NFIP Timing Requirements

### 6.1 Pre-Closing Requirements

| Timing | Requirement | Source |
|---|---|---|
| **Loan application (intake)** | NFHL zone determination recommended | FEMA MSC public lookup; lender safe-harbor |
| **Pre-closing (5-10 days)** | Flood zone confirmation + binder or policy | Industry practice; per loan-level lender matrices |
| **At closing** | Flood insurance policy in force; declaration page in loan file | 42 USC §4012a; FNMA/FRE servicing guides |
| **Loan term** | Continuous coverage; force-placed insurance if lapsed | Servicing guides |
| **Per-policy renewal** | Annual coverage continuation | NFIP renewal process; force-placed if not renewed |

### 6.2 Statutory 45-Day Waiting Period (NFIP)

Standard NFIP policies have a **30-day waiting period** from binder date to effective date (no coverage for first 30 days). Exceptions:
- **Increased coverage for building**: 30-day wait
- **Increased coverage for contents**: 30-day wait
- **New purchase of building**: 30-day wait (no waiver)
- **Lender-required coverage** (mandatory purchase): **No waiting period** if purchased at loan closing or within 30 days of loan closing — this is a statutory exception under 42 USC §4012a(d) for loans closing on properties in SFHA
- **Map revision causing SFHA entry**: 30-day wait applies
- **Loss in progress**: No binding; FNOL required

**Source:** NFIP Flood Insurance Manual; FEMA WYO Company Arrangements, https://agents.floodsmart.gov/wyo-program-company-arrangements

**Implication for DSCR engine:** Closing-condition engine rule should require flood policy `effective_date ≤ closing_date` AND `policy in force on closing date`. The 30-day wait is NOT a kill criterion if the policy binds before closing — this is the typical DSCR closing flow.

### 6.3 Pending FIRM Data (Remap Risk)

If a property is in a Pending FIRM (per FEMA Flood Map Changes Viewer, https://hazards.fema.gov/femaportal/prelimdownload/), the new SFHA status is scheduled to take effect within ~6 months. Engine rule: flag for re-pricing at the policy renewal coincident with effective date.

---

## 7. State-Specific Flood Insurance Notes (DSCR-Relevant)

| State | Specific Issue | Source |
|---|---|---|
| **FL** | Citizens Property Insurance Corp. = state-backed insurer of last resort; depopulation to private carriers ongoing. Coastal insurance crisis 2024-2026 (1-in-3 affordable providers saw 25%+ premium increases; FL property insurance 75%↑ since 2021) | TOPICAL_INDEX §17; Insurify 2026 |
| **CA** | California FAIR Plan = state-backed fire insurer; companion "DIC" (Difference in Conditions) policy needed for flood in wildfire zones. CA SB-11 (2024) and FAIR Plan modernization pending | CA Department of Insurance; 网易 (2026 re Insurify) |
| **TX** | TX Windstorm Insurance Association (TWIA) for coastal wind/hail; flood usually NFIP or private. TX Gulf (Galveston, Corpus, Houston Ship Channel) is high-claim zone | TWIA |
| **LA** | LA Citizens Property Insurance Corp. (residual market); coastal LA = highest claim density in nation | LA CPCIC |
| **NC** | NC Floodplain Mapping Program; Beach Plan (wind); NFIP-standard flood | NCFMP |
| **NJ** | NJ FAIR Plan; SJ coastal = SFHA-heavy; DCA-licensed carriers | NJ DOBI |
| **SC** | SC Wind and Hail Underwriting Association; coastal surge | SC WHUA |
| **MS** | MS Windstorm Underwriting Association; coastal = SFHA V-zone | MS WUA |
| **AL, GA, VA, MD, DE, RI, MA, CT, NY, ME, NH** | Standard NFIP; some private market growth | Various |
| **OH, PA, MI, IL, IN, MO, KY, TN, AR, OK, KS, NE, IA, MN, WI, ND, SD** | Inland; flood risk concentrated near rivers (Mississippi, Missouri, Ohio); standard NFIP | Lower-risk zones |
| **NV, AZ, UT, CO, NM, ID, WY, MT** | Arid; flash-flood risk in specific washes; NFIP | Lower overall risk |
| **WA, OR, AK, HI** | AK + HI are excluded by some lenders (Visio); Pacific NW seismic + flood | Lender exclusions |

**2026 Insurance Crisis Update (Insurify June 2026 report):** National average annual home insurance $3,057 (up 4% YoY); 2026 increase forecast in 45 states + DC. Highest projected increases: CA (16%), NE (13%), NM (11%), GA (10%). States with decreases: HI, MA, ME, LA, RI (~-2%). FL remains highest absolute premium. Source: Insurify 2026 State of Home Insurance Report (cited by 网易 Chinese-language summary June 2026).

---

## 8. Engine Schema Recommendations (Slice 2 P0-4)

### 8.1 New Database Tables (recommended)

```sql
CREATE TABLE fema_nfhl_zone (
    apn VARCHAR(50) PRIMARY KEY,
    state CHAR(2) NOT NULL,
    county VARCHAR(100),
    fema_zone VARCHAR(10) NOT NULL,         -- A, AE, AH, AO, AR, A99, V, VE, B, X-shade, X, D
    is_sfha BOOLEAN NOT NULL,
    is_moderate BOOLEAN NOT NULL,
    firm_panel_id VARCHAR(50),
    firm_effective_date DATE,
    pending_firm_zone VARCHAR(10),
    pending_firm_effective_date DATE,
    bfe_feet NUMERIC,                      -- Base Flood Elevation
    last_checked_at TIMESTAMPTZ,
    source_url TEXT,
    confidence_score INT
);

CREATE TABLE flood_insurance_quote (
    quote_id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    carrier_name VARCHAR(200) NOT NULL,
    is_nfip BOOLEAN NOT NULL,
    is_private BOOLEAN NOT NULL,
    wyo_carrier BOOLEAN,
    policy_number VARCHAR(100),
    annual_premium NUMERIC(12,2) NOT NULL,
    dwelling_coverage NUMERIC(12,2) NOT NULL,
    contents_coverage NUMERIC(12,2),
    deductible NUMERIC(12,2),
    effective_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    named_insured VARCHAR(200) NOT NULL,
    vesting_match BOOLEAN NOT NULL,
    source_url TEXT,
    verified_date DATE NOT NULL,
    confidence_score INT,
    evidence_hash VARCHAR(64)              -- SHA-256 of binder/declaration page
);

CREATE TABLE flood_kill_criterion_log (
    log_id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    check_at TIMESTAMPTZ,
    fema_zone VARCHAR(10),
    kill_criterion_code VARCHAR(50),       -- FLOOD_INSURANCE_MISSING, etc.
    severity VARCHAR(20),                  -- BLOCKING, WARNING, INFO
    resolution TEXT,
    resolved_at TIMESTAMPTZ
);
```

### 8.2 Acceptance Criterion for Slice 2 P0-4

> **CR-1: FEMA NFHL Zone Verified.** Every DSCR file must have a FEMA NFHL zone determination recorded before lender matching. SFHA-zone properties without a flood insurance binder ≤ 5 business days before scheduled closing are blocked at the lender-ranking stage (kill criterion #3 per TOPIC 6).
>
> **CR-2: Flood Insurance PITIA Inclusion.** PITIA must include annual flood insurance premium / 12 when zone = SFHA, regardless of whether the lender requires escrow. This is the dual-track requirement per TOPICAL_INDEX §17 (insurance feeds both T1 PITIA and T2 OpEx).
>
> **CR-3: Private Flood BW-12 Compliance.** If private flood (non-NFIP), the carrier and policy must meet BW-12 (42 USC §4012a(b)(7)) standards OR the lender's safety-and-soundness determination must be documented in the loan file. Engine rule: log carrier + BW-12 attestation + lender approval flag.
>
> **CR-4: Pending FIRM Alert.** If FEMA Flood Map Changes Viewer shows a pending FIRM that will move the property into SFHA within 12 months, surface a WARNING (not kill) with estimated RR2.0 re-pricing impact.
>
> **CR-5: Vesting Match.** Flood insurance "Named Insured" must match the borrowing entity's legal name exactly (or include it as additional insured). Mismatch = BLOCKING.

---

## 9. Top 5 Primary Sources

1. **FEMA Map Service Center (MSC)** — https://msc.fema.gov — Public FIRM/FIRMette lookup, address search, NFHL data download; used as engine's primary API. The MSC is the authoritative public source for flood hazard determinations; an NFHL determination is a lender's "safe harbor" for federally-related mortgage loans.

2. **FEMA NFIP Pricing Approach (Risk Rating 2.0)** — https://www.fema.gov/flood-insurance/risk-rating — Authoritative current pricing methodology. Confirms PRP retirement and 18%/yr statutory cap. **Engine reads this as the canonical source for premium inputs.**

3. **FEMA Risk Rating 2.0 FAQ (Equity in Action)** — https://agents.floodsmart.gov/sites/default/files/media/document/2025-07/fema-nfip-risk-rating-2.0-FAQs.pdf — Confirms PRP elimination, transition relief, and statutory 18% premium cap. **Critical for portfolio analytics and refinance modeling.**

4. **42 USC §4012a — Mandatory Purchase of Flood Insurance** — Statutory authority for federally required flood insurance. https://www.law.cornell.edu/uscode/text/42/4012a — Codifies the 1973 Act + BW-12 + 2014 HFIAA amendments. **Engine rule: 42 USC §4012a(b)(7) is the statutory basis for accepting private flood insurance.**

5. **NFIP Flood Insurance Manual (current edition)** — Available via FEMA WYO Company Arrangements, https://agents.floodsmart.gov/wyo-program-company-arrangements — Industry-standard underwriting and rating reference; defines coverage limits ($250K residential, $500K non-residential), 30-day waiting period, and statutory exceptions. **Engine rule: NFIP coverage limits are HARD caps; recommend dwelling insurance in loan amount.**

---

## 10. Other Key Sources

- **FEMA National Flood Hazard Layer (NFHL) Viewer** — https://www.fema.gov/flood-maps/national-flood-hazard-layer
- **FEMA Flood Map Changes Viewer (preliminary/pending data)** — https://hazards.fema.gov/femaportal/prelimdownload/
- **FEMA Policy Standards for Flood Risk Analysis and Mapping** — Standards 147, 148, 149, 605, 606 (digital FIRM use policies)
- **FEMA Flood Insurance Advocate** — https://www.fema.gov/flood-insurance/flood-insurance-advocate
- **NFIP Write Your Own (WYO) Program** — https://agents.floodsmart.gov/wyo-program-company-arrangements
- **Top 10 Independent Flood Carriers 2026** — https://www.floodinsuranceguru.com/the-flood-insurance-guru-blog/top-10-independent-flood-insurance-companies-in-2026
- **CNBC Best Flood Insurance 2026** — https://www.cnbc.com/select/best-flood-insurance/
- **Housing Wire: Will private flood insurance keep mortgages from going underwater?** — https://www.housingwire.com/articles/will-private-flood-insurance-keep-mortgages-from-going-underwater/
- **Insurify 2026 State of Home Insurance Report** — Cited in 网易 June 2026 (national average $3,057, +4% YoY, 45 states + DC seeing increases)
- **NMHC NAA Policy Briefing FEMA RR2.0** — https://www.nmhc.org/meetings/webinars/2021/nmhc-naa-policy-briefing-fema-national-flood-insurance-program-risk-rating-2-0/
- **Federal Register 2026-08728 (NFIP WYO FY2026)** — https://www.federalregister.gov/documents/2026/05/05/2026-08728/
- **Aon Edge / Neptune Flood / Wright Flood / Lloyd's product pages** — Carrier-specific products (private flood)

---

## 11. Blockers / Gaps Identified

| Gap | Severity | Mitigation |
|---|---|---|
| **No public FEMA Premium Estimator API** (FEMA removed direct API in 2024-2025; current tool is web-only) | MEDIUM | Use 3rd-party FEMA Flood Map API (https://docs.nationalflooddata.com) OR FEMA-approved vendor (Neptune Flood, Tideway) APIs that return RR2.0 rate quotes directly. |
| **Per-lender private flood acceptance policy** not always publicly disclosed | LOW | Default to "accept private flood if BW-12 standards met" unless lender matrix says otherwise. |
| **Pending FIRM data** in machine-readable form | MEDIUM | Flood Map Changes Viewer (web UI) + GIS WMS; no clean REST API. |
| **CA DIC / FAIR Plan coordination** for combined fire + flood properties | MEDIUM | California Department of Insurance; FAIR Plan modernization under SB-11 (2024) pending. Engine should require combined fire+flood evidence for CA wildfire-zone DSCR. |
| **High-risk geography lender blacklist** (FL Keys, CA Malibu, etc.) | LOW | Per-lender matrix override; not standardized. |

---

*End of Domain 1 research document. Author: MiniMax Mavis (Agent 1, parallel dispatch). Verified_date: 2026-06-18.*
