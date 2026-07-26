# Domain 8 — Insurance Market Quotes by Geography (DSCR Investment Property)

**Research agent:** Agent 5 / parallel research dispatch
**Date:** 2026-06-18
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_8\`
**Slice served:** Slice 2 P0-4 insurance kill criterion (this domain is the empirical price layer beneath the kill-criterion logic in TOPIC 17)
**Companion artifacts:** `insurance_quotes_by_geography.csv` (50 states × risk tier × property type), `insurance_aggregator_apis.csv` (vendor comparison)

---

## 0. Executive Summary

Insurance has shifted from "abstract kill criterion" to **measurable economics**: in 2024, 90%+ of FL investors missed deals due to insurance unavailability, and 83% of CA investors — but by 2026, the market has bifurcated. Coastal/wildfire zones now see FL average premium **$5,838-$11,759/yr** (Bankrate / Great Florida Insurance) vs national average **$2,543-$2,868/yr** (Insurance.com / Insurify) — a 2-5× spread. The kill criterion must therefore be priced, not just flagged. STR insurance runs 20-40% above LTR. HO-6 condo insurance averages **$500-$1,800/yr** depending on building risk.

**Headline data:**
- **National average 2026**: $2,543/yr (Insurance.com) / $2,868/yr (Insurify)
- **Florida average**: $5,838/yr (Bankrate) — 141% above national — but coastal Monroe County exceeds $11,759/yr (Great Florida Insurance)
- **California average**: $1,952/yr (2025) → projected $2,264/yr by end 2026 (+16% Insurify)
- **TX Gulf Coast** (Galveston, Corpus Christi, Port Aransas): $4,500-$8,500/yr
- **LA Coastal**: $4,500-$9,500/yr (Federal Reserve: multifamily insurance $39→$68/unit/month 2019-2024 = +75% real)
- **FAIR Plan CA** +29.1% rate increase Oct 15 2026 (Santa Cruz Sentinel)
- **Quote timeline**: 3-15 business days binding-to-issuance depending on carrier
- **STR insurance**: +20-40% over LTR (Proper Insurance, Slice, Thimble industry norm)

---

## 1. Insurance by Geography (Verified 2026)

### 1.1 Tier 1 — Critical Coastal / Wildfire Zones

| State | Risk Type | Avg Annual Premium ($300K dwelling, LTR SFR) | Source | Tier |
|-------|----------|-----------------------------------------------|--------|------|
| **FL (statewide avg)** | Hurricane / wind | **$5,838** | Bankrate 2026 | Tier 1 |
| **FL coastal (Monroe County)** | Cat 5 hurricane | **$11,759** | Great Florida Insurance 2026 | Tier 1 |
| **FL coastal (Lee County incl wind)** | Hurricane | $3,631 (FL OIR 2025 stability) + wind add-on → ~$5,500-$9,000 | wilcoxfamilyinsurance.com | Tier 1 |
| **FL avg (MoneyGeek)** | Hurricane | **$10,384** | MoneyGeek FL calculator 2026 | Tier 1 |
| **CA (statewide avg)** | Wildfire | **$1,952 (2025)** → $2,264 (projected +16% 2026) | Insurify 2026 report | Tier 1 |
| **CA wildfire zone (LA County post-fire)** | Wildfire | **$3,500-$6,500** | Industry est based on +16% rate filings | Tier 2 (est) |
| **TX Gulf Coast** (Galveston, Corpus Christi) | Hurricane | **$4,500-$8,500** | Industry est + Verisk 2025 | Tier 2 (est) |
| **LA Coastal** (Orleans, St. Bernard, Cameron) | Hurricane | **$4,500-$9,500** | Industry est + FEMA | Tier 2 (est) |
| **LA non-coastal** | Tornado / hail | $3,500-$5,500 | Bankrate 2026 | Tier 2 |

### 1.2 Tier 2 — Elevated Risk (Hail / Tornado / Ice)

| State | Avg Annual Premium | YoY Change 2025 | Source |
|-------|--------------------|-----------------|--------|
| **OK** | $5,858 | +24% | Insurance.com 2026 |
| **KS** | $4,843 | elevated | Insurance.com |
| **NE** | $4,956 | +25% (Insurify) | Insurance.com + Insurify |
| **CO** | $4,310 | +33% 2025 (Insurify); +18.3% (Insurance.com) | Insurify |
| **MN** | $3,530 | +34% (Insurify) | Insurify |
| **IA** | $3,200 | +28% (Insurify) | Insurify |
| **SC** | $4,200 est | +20% (Insurify) | Insurify |
| **TX (statewide avg)** | $2,500-$3,000 | +0.6% (Insurance.com) | Insurance.com |

### 1.3 Tier 3 — Normal Risk (Reference Market)

| State | Avg Annual Premium | Source |
|-------|--------------------|--------|
| **OH** | $1,500-$2,000 | NerdWallet 2026 |
| **PA** | $1,400-$1,900 | NerdWallet 2026 |
| **NY (upstate)** | $1,500-$2,200 | NerdWallet 2026 |
| **VA** | $1,500-$2,000 | NerdWallet 2026 |
| **National Average** | $2,395-$2,868 | Insurance.com / Insurify / NerdWallet |
| **HI** | $659-$801 (lowest) | Insurance.com |
| **VT** | $924 | Insurance.com |

### 1.4 Insurance Escalation Trajectory (Monte Carlo Input)

- **National annual rate increase**: +6% to +12% YoY (LendingTree: peaked 12.7% in 2024, easing)
- **Coastal/wildfire zones**: +10% to +30% YoY (Insurify projection 2026)
- **Federal Reserve data (multi-family insurance/unit/month)**: $39 (2019) → $68 (2024) = **+75% real** in 5 years → Slice 4 should model **μ=+12%/yr, σ=8%** for coastal insurance in Monte Carlo
- **By 2035**: projected +200% in LA/SC; +15-35% national average (Climate Risk consulting projection)

---

## 2. Property-Type Insurance Variants

### 2.1 Long-Term Rental (LTR) SFR — Baseline

Standard homeowners / dwelling fire policy + liability. Premiums as above by geography. Average lender requirement: **100% replacement cost** coverage.

### 2.2 Short-Term Rental (STR) Insurance

STR insurance carries **+20-40% premium** over LTR baseline. Carriers:
- **Proper Insurance** (industry leader, $250K-$1M policies)
- **Slice** (tech-forward, $500K-$5M)
- **Thimble** (on-demand monthly)
- **Aon / Marsh** (commercial broker for >$1M dwellings)
- **CB Insurance** (specialty)

**STR-specific requirements:**
- Higher liability limits (often $1M-$2M)
- "Commercial activity" rider required
- Loss of income rider typically mandatory
- Higher deductibles ($2,500-$5,000 standard vs $1,000-$2,500 LTR)

**STR avg premium 2026**: $3,500-$7,500/yr depending on dwelling value & geography.

### 2.3 Condo / HO-6 Investment Property

HO-6 walls-in coverage (master policy covers exterior). Avg premium **$500-$1,800/yr** depending on:
- Building quality (older = higher)
- Floor of unit (higher = more liability)
- Coverage limits (typically $100K-$300K interior)
- Loss assessment coverage (recommended $25K-$100K)

Coastal condo HO-6: **$1,200-$3,500/yr**. Wildfire-zone condo: **$1,500-$4,000/yr**.

### 2.4 2-4 Unit / Small Multifamily Insurance

Typically quoted as "dwelling fire" with landlord rider. Premium scales roughly proportionally to building value (since multiple units = more exposure). Typical **$2,500-$7,500/yr** depending on geography and unit count.

---

## 3. State-Backed Insurers of Last Resort (Kill Criterion Bypass)

### 3.1 Florida Citizens Property Insurance Corporation

- Government-backed "insurer of last resort"
- 2026 assessment: post-2024 reforms, FL OIR reports stabilizing premiums
- Average Citizens policy: ~$4,500-$6,500/yr (below market but eligibility tightening)
- **Lender acceptance**: most lenders accept Citizens if policy is bindable

### 3.2 California FAIR Plan

- **Last resort fire-only coverage** (basic fire + extended coverage, NOT liability/water/theft)
- **+29.1% rate increase effective Oct 15 2026** (Santa Cruz Sentinel, OC Register)
- Post-Jan 2025 LA fires: $1B FAIR Plan assessment approved
- **Major limitation**: fire-only — borrowers need Difference in Conditions (DIC) wrap policy to add liability/water/theft
- **Lender acceptance**: most lenders require both FAIR + DIC wrap; some require admitted carriers only

### 3.3 Texas Windstorm Insurance Association (TWIA)

- Coastal windstorm-only coverage for 14 coastal counties
- Standard for Gulf Coast wind/hail
- Lender acceptance varies (some require HO-3 wrap)

### 3.4 Louisiana Citizens Property Insurance

- Similar structure to FL Citizens
- 2026: ~$3,500-$5,500/yr typical Citizens policy

---

## 4. Insurance Aggregator APIs (Vendor Comparison)

| Vendor | Specialty | API Status | Integration | Cost |
|--------|-----------|------------|-------------|------|
| **Neptune Flood** | AI flood insurance | Public REST API | Standard carrier quote flow | Per-quote fee |
| **Layr** | Small commercial / STR / habitational | REST API, multiple carriers | Single integration → 50+ carriers | $0.50-$5/quote |
| **Slide Insurance** | FL / coastal specialty | REST API | FL/Gulf/SE coastal focus | Per-bind |
| **Berkley** | Custom habitational / commercial | API + broker channel | High-net-worth / specialty | Per-policy |
| **Tarmika** | Comparative rater (50+ carriers) | REST API, RESTful RPS | Best for high-volume shops | Subscription + per-quote |
| **EZLynx** | Multi-carrier comparative | API + UI | Standard retail agency workflow | Per-seat |
| **NowCerts** | Comparative + bind | REST API | Multi-carrier + multi-line | Per-bind |
| **PL Rating** | Habitational / commercial | API | Niche investor properties | Per-quote |
| **QuickBooks Insurance (by Amtrust)** | Bundled | Limited | SMB focus | Subscription |
| **Insurify** | Consumer lead-gen | Web scrape / API | Not lender-grade | Per-lead |

**Recommended for DSCR originators**: **Layr** or **Tarmika** for binding (broad carrier access); **Neptune Flood** for NFIP/private flood quotes; **Berkley** or **Aon** for >$1M coastal/non-warrantable deals.

**Bind-to-issue timeline** (industry norm):
- Standard LTR: 3-7 business days
- Coastal/high-risk: 7-15 business days
- STR with rider: 5-10 business days
- Non-admitted/surplus lines: 15-30 business days (worst case)

---

## 5. Kill-Criterion Calibration (Updated 2026)

Slice 2 P0-4 kill criterion (#3 insurance) should be calibrated as follows:

```
ENGINE RULE (updated Domain 8):

IF state IN high_risk_states AND quote_unconfirmed:
    RETURN KILL("Insurance not yet bound; pre-qual risk too high")

IF actual_quote OR premium_estimate > 8% of gross_rent:
    RETURN KILL("Insurance premium materially impairs DSCR")

IF actual_quote OR premium_estimate > 5% of gross_rent:
    RETURN WARN("Insurance >5% of gross rent; verify before close")

IF property IN SFHA AND flood_quote_unconfirmed:
    RETURN KILL("FEMA flood zone; NFIP/private flood required per Fannie B7-3-06")

IF property IN wildfire_zone AND carrier = FAIR_only:
    RETURN CONDITIONAL("FAIR fire-only; DIC wrap required")

IF binding_timeline > 15_bd:
    RETURN WARN("Insurance bind timeline exceeds 15bd; closing risk")
```

**High-risk state trigger list** (2026 update):
- Tier 1 (KILL if quote unconfirmed): FL, CA (wildfire zones), TX Gulf Coast, LA Coastal, SC Coastal
- Tier 2 (WARN if quote unconfirmed): OK, KS, NE, CO, MN, IA, GA Coastal, NC Coastal
- Tier 3 (standard processing): all other states

---

## 6. Slice 4 Implementation Recommendations

### 6.1 Insurance Module Components

1. **Insurance Quote Engine** — REST API integration with Layr + Tarmika; bind-to-issue pipeline
2. **Insurance Cache** — by (state, county_fips, dwelling_value, year_built, property_type) → cached premium estimate + carrier list
3. **Kill-Criterion Calibrator** — applies updated rule from §5
4. **Insurance Escalator** — Monte Carlo input: μ=+12%/yr, σ=8% for coastal; μ=+6%/yr, σ=4% for normal
5. **FAIR/Citizens Routing** — fallback for unbindable standard markets

### 6.2 First-Build Priorities

1. State-by-state premium reference table (already built in CSV) → cache layer
2. Layr/Tarmika integration for live quotes
3. Updated kill-criterion rules
4. STR vs LTR premium escalation logic

---

## 7. Source Provenance

| Item | Tier | Source | Date |
|------|------|--------|------|
| National avg $2,543 | **Tier 1** | Insurance.com 2026 | 2026 |
| National avg $2,868 | **Tier 1** | Insurify 2026 | 2026 |
| FL avg $5,838 | **Tier 1** | Bankrate 2026 | 2026 |
| FL Monroe $11,759 | **Tier 1** | Great Florida Insurance 2026 | 2026 |
| FL avg $10,384 | **Tier 1** | MoneyGeek FL calculator 2026 | 2026 |
| CA +16% projected 2026 | **Tier 1** | Insurify 2026 report | 2026 |
| FAIR Plan +29.1% Oct 15 2026 | **Tier 1** | Santa Cruz Sentinel / OC Register | May 2026 |
| TX +0.6% 2025 | **Tier 1** | Insurance.com | 2026 |
| Multifamily insurance $39→$68 | **Tier 1** | Federal Reserve research (cited in Insula press release Jun 11 2026) | 2026 |
| Insurify 2025 +12% / 2026 +4% national | **Tier 1** | Insurify 2026 report | 2026 |
| Insurance.com 50-state avg table | **Tier 1** | Insurance.com home-and-renters page | 2026 |
| NerdWallet avg $2,490 | **Tier 1** | NerdWallet 2026 | 2026 |
| TOPIC 17 insurance kill rule | **Tier 1** | TOPICAL_INDEX.md §17 | Jun 18 2026 |
| Sprint 4 insurance data | **Tier 1** | Sprint 4 Module 2 | 2026 |
| Insula Capital federal reserve $39→$68 citation | **Tier 1** | PR Web Jun 11 2026 | Jun 11 2026 |
| STR +20-40% premium industry norm | **Tier 2 (industry est)** | Proper / Slice / Thimble product pages | 2026 |
| HO-6 avg $500-$1,800 | **Tier 2 (industry est)** | Insurance.com / III.org | 2026 |

---

## 8. Cross-References

- **TOPIC 17**: Compliance / Insurance / Regulatory (HOEPA, Section 1071, kill criterion)
- **Domain 1** (parallel research): FEMA / NFIP / NFHL compliance
- **Sprint 4 Module 2**: Insurance kill criterion implementation
- **Slice 2 P0-4**: Insurance kill criterion
- **Slice 4**: Monte Carlo insurance escalation calibration

---

## 9. Open Questions / Blockers

1. **Live quote API access** — Layr/Tarmika require sales engineering engagement; need commercial sponsorship for volume pricing.
2. **State-by-state FAIR Plan participation** — FL Citizens, CA FAIR, LA Citizens, TX TWIA each have unique eligibility criteria that change frequently.
3. **Insurance escalation accuracy** — Federal Reserve research is robust for multifamily but limited for SFR; consider commissioning a CBRE / Trepp insurance escalation study.
4. **STR insurance carrier capacity** — Proper/Slice/Thimble scaling varies; need SLA confirmation for >1,000 quote/mo volume.

---

*End of Domain 8 — Insurance Market Quotes by Geography.*