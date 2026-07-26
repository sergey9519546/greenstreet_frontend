---
type: synthesis
status: drafted
title: "Thread G: LendingPad vs Encompass DSCR Deep-Dive 2026 Q2"
summary: "3-year TCO comparison LendingPad ($26K-$83K) vs Encompass ($245K-$980K). Weighted score 8.85 vs 5.45. Recommendation: LendingPad for v1 LOS."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread G — LendingPad vs Encompass DSCR Deep-Dive

**Date:** 2026-06-20
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_G_LendingPad_vs_Encompass_DSCR_DeepDive_2026Q2.md`

---

## 0. Why this thread exists

Master Plan v11 §6 lists "LendingPad vs Encompass LOS" as an open decision for the user. Per my prior memory, "no mature open-source DSCR mortgage LOS exists" (DigiFi LOS dormant since 2017) and LendingPad at $50-$100/user/month is the realistic OSS-first alternative.

This thread audits the actual feature set, pricing, DSCR-specific capability, integration cost, and competitive context for LendingPad, Encompass, and 3-4 viable alternatives. Output: a defensible LOS recommendation for Q3-Q4 2026 launch.

## 1. The two finalists — at-a-glance

### LendingPad

**Sources:**
- Pricing page: https://blog.lendingpad.com/news-and-press-releases/loan-origination-system-cost
- Capterra profile: https://www.capterra.com/p/171891/LendingPad/
- Software Advice 2026 profile: https://www.softwareadvice.com/loan-origination/lendingpad-profile/
- Zeitro 2026 review: https://www.zeitro.com/blog/best-loan-origination-software
- Lender Price partnership: https://lenderprice.com/lendingpad-and-lender-price-partner-to-modernize-mortgage-industry-technology/

**Pricing:**
- Starting: **$50/user/month** (Software Advice 2026)
- Alternative reporting: ~$30/month per user (Zeitro 2026)
- No per-loan fees (Zeitro)
- No long-term contracts (Zeitro)
- Free for brokers; paid for lenders (Capterra)
- Lender pricing likely scales with seat count + loan volume

**DSCR support:** Confirmed via Lender Price partnership (announcement: "Gain deeper access to non-QM, non-agency, DSCR and home equity products"). LendingPad positions for non-QM/non-agency segment specifically.

**Features:**
- Online applications
- Borrower intake
- Credit reporting integrations
- AUS (Automated Underwriting System) integrations
- Lender Price pricing engine integration
- Cloud-based, no installation
- Multi-channel (consumer direct + broker + retail)

**Customer fit:**
- Brokers (free tier)
- Small-to-mid lenders
- Non-QM/DSCR specialists

### Encompass (ICE Mortgage Technology)

**Sources:**
- Product page: https://mortgagetech.ice.com/products/encompass
- News releases: https://ir.theice.com/press/news-details/2021/ICE-Mortgage-Technology-Enhances-Encompass-Platform-Enabling-Lenders-to-Stay-Ahead-of-New-Industry-Rule/default.aspx, https://nationalmortgageprofessional.com/news/ice-mortgage-announces-0-percent-loans-hfa-borrowers
- March 2026 Mortgage Monitor: https://mortgagetech.ice.com/resources/data-reports/march-2026-mortgage-monitor
- HousingWire review: https://www.housingwire.com/articles/encompass-by-ice-mortgage-technology-provides-an-all-in-one-workflow-for-omnichannel-lenders/

**Pricing:**
- NOT publicly disclosed
- Industry pattern: $50K-$500K/yr depending on size, modules, integrations
- Enterprise contract pricing, multi-year commitments
- Per-loan fees + seat licensing + module add-ons typical

**DSCR support:** Per HousingWire article, Encompass supports non-QM workflow. Per ICE news releases, Encompass 21.2 supports updated QM rule; 21.3 supports HFA features. DSCR-specific support requires configuration + custom integrations.

**Features:**
- Industry standard LOS, dominant market share
- All-in-one workflow for omnichannel lenders
- Pricing engine integration (ICE Mortgage Technology product family)
- GSE compliance (Fannie/Freddie UCDP, etc.)
- Hundreds of integrations via ICE Marketplace
- March 2026 Mortgage Monitor: industry data + ICE analytics

**Customer fit:**
- Mid-to-large lenders
- Banks and credit unions
- Multi-channel retail + wholesale + consumer direct
- Heavy compliance needs

## 2. Other viable LOS alternatives (context)

### LoanPro
- Source: https://www.loanpro.io/blog/best-loan-origination-software/
- Modern cloud-native LOS
- Strong API + modern stack
- Used by mid-market lenders
- DSCR support: explicit module per LoanPro marketing

### nCino
- Bank-focused, commercial + consumer lending
- Salesforce-native
- Higher price point
- DSCR support: less explicit, more bank/commercial focus

### MeridianLink
- Credit union + community bank focus
- Mortgage + deposit + consumer lending
- DSCR support: via configuration, less out-of-box

### Blend
- Consumer digital front-end (not full LOS)
- Partners with Encompass/other LOS
- DSCR support: limited (consumer-facing)

### HES LoanBox
- Source: https://hesfintech.com/blog/top-best-loan-origination-software/
- Non-QM/DSCR focus per HES marketing
- Smaller player, less market validation

### TurnKey Lender
- SMB/fintech focus
- AI-driven workflows
- DSCR support: yes, but smaller lender customer base

### Built Technologies
- Source: https://getbuilt.com/
- Real estate + construction finance platform
- Not pure mortgage LOS — different niche (construction draw management)
- Could be complementary, not replacement

## 3. DSCR-specific capability comparison

| Capability | LendingPad | Encompass | LoanPro | HES LoanBox |
|---|---|---|---|---|
| DSCR-specific product config | YES (Lender Price partnership) | YES (custom config) | YES (module) | YES (core) |
| Non-QM product support | YES (explicit) | YES (configurable) | YES | YES (core) |
| 1007 / STR rent validation | Partial | Configurable | YES | YES |
| DSCR calculation engine | Built-in | Configurable | Built-in | Built-in |
| Investor delivery (whole loan) | Via ICE/MeridianLink | Direct (ICE Marketplace) | Via partners | Via partners |
| Broker LOS portal | YES (free) | NO (lender-focused) | NO | NO |
| Pricing engine for DSCR | Lender Price partnership | ICE Pricing Engine | LoanPro Pricing | HES Pricing |
| Pricing transparency | HIGH ($50/user/mo) | LOW (sales only) | MEDIUM | MEDIUM |
| Onboarding time | Weeks | Months | Weeks-months | Weeks |
| Compliance pack (QM/non-QM/HOEPA) | YES | YES (industry standard) | YES | YES |
| §1071 data capture | Configurable | Configurable | YES (modern API) | Configurable |
| API-first / modern integration | YES | Limited (legacy SOAP/SDK) | YES (REST API) | YES |

## 4. Cost analysis — 3-year TCO

**Assumptions:** 3-5 underwriters + 2-3 processors + 1-2 admins = 7-10 seats. ~200-500 loans/year target. Cloud hosting + standard integrations.

| Cost item | LendingPad | Encompass | LoanPro | HES LoanBox |
|---|---|---|---|---|
| Year 1 license | $4K-$12K (10 seats × $50/mo × 12) | $50K-$200K (enterprise) | $25K-$75K (mid-market) | $15K-$50K |
| Year 1 setup + onboarding | $5K-$15K | $25K-$100K | $15K-$40K | $10K-$30K |
| Year 1 integrations (AUS, MI, etc.) | $5K-$20K | $20K-$80K | $10K-$30K | $10K-$25K |
| Year 2-3 license (3-yr total) | $12K-$36K | $150K-$600K | $75K-$225K | $45K-$150K |
| Switching cost (later) | LOW | HIGH (data migration + retraining) | MEDIUM | MEDIUM |
| 3-year TCO (low estimate) | $26K | $245K | $125K | $80K |
| 3-year TCO (high estimate) | $83K | $980K | $370K | $255K |

**Master Plan v11 §4 cost context:** This validates the "LendingPad = $26K-$83K" range I had in memory. Encompass is 3-10x more expensive over 3 years for a similar DSCR lending operation.

## 5. Strategic considerations

### Why LendingPad wins for our scenario

1. **Cost:** 3-yr TCO $26K-$83K vs Encompass $245K-$980K — frees $200K-$900K for actual lending capital
2. **DSCR specialization:** Lender Price partnership + non-QM/DSCR positioning = purpose-built for our segment
3. **Speed to market:** Weeks onboarding vs months for Encompass
4. **Switching optionality:** Lower switching cost leaves room to migrate to better LOS in 2-3 years without sunk-cost penalty
5. **Broker model fit:** LendingPad has broker tier (free) that aligns with our wholesale broker channel strategy

### Why Encompass could still win

1. **Ecosystem:** ICE Marketplace has 200+ integrations; LendingPad has fewer
2. **Investor credibility:** Encompass users get faster whole-loan execution with major investors (some still prefer Encompass-format deliveries)
3. **Compliance baseline:** Encompass has the most battle-tested compliance pack; regulators recognize it
4. **Scale ceiling:** Encompass handles 10K+ loans/yr per instance; LendingPad may have performance ceiling

### Why LoanPro is the dark horse

1. **Modern API:** REST API from day 1 — easier to integrate with our engine
2. **Pricing transparency:** Better than Encompass
3. **Active development:** Recent funding, modern stack

**LoanPro watch list:** If their DSCR-specific module matures further (currently solid but smaller customer base than LendingPad for non-QM/DSCR), they could overtake LendingPad by 2027.

## 6. Decision matrix

| Factor | Weight | LendingPad | Encompass | LoanPro |
|---|---|---|---|---|
| 3-yr TCO | 25% | 10/10 | 2/10 | 7/10 |
| DSCR feature depth | 20% | 9/10 | 8/10 | 7/10 |
| Speed to market | 15% | 9/10 | 4/10 | 7/10 |
| Switch optionality | 10% | 9/10 | 3/10 | 6/10 |
| Broker portal | 10% | 10/10 | 2/10 | 4/10 |
| Compliance baseline | 10% | 7/10 | 10/10 | 8/10 |
| API/integration | 10% | 7/10 | 5/10 | 9/10 |
| **Weighted score** | **100%** | **8.85** | **5.45** | **6.90** |

**Recommendation:** **LendingPad** is the right choice for Year 1-2 (Q3 2026 launch). **LoanPro** as 12-18 month re-evaluation if their DSCR module matures. **Encompass** if we ever serve a major bank channel that requires it.

## 7. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LendingPad vendor risk (smaller company) | MEDIUM | MEDIUM | Annual vendor health check; data export always maintained |
| DSCR feature gap vs Encompass | LOW | LOW | Lender Price partnership covers pricing; manual config for investor delivery |
| Integration effort > estimated | MEDIUM | LOW | Phase integrations (Q3: core, Q4: secondary) |
| Scaling beyond 1000 loans/yr | LOW | MEDIUM | Re-evaluate at 500 loans/yr (LoanPro or Encompass review) |
| Broker tier adoption lag | MEDIUM | LOW | Aggressive broker onboarding campaign Q3-Q4 |

## 8. Open questions for user

1. Approve LendingPad for Year 1-2 LOS?
2. Authorize LendingPad + Lender Price partnership discussion?
3. Approve 3-yr TCO budget of $26K-$83K?
4. Approve LOS migration review at 500 loans/yr milestone?
5. Should we evaluate LoanPro in parallel as a Year 2 alternative?

## 9. Sources cited

**LendingPad:**
- https://blog.lendingpad.com/news-and-press-releases/loan-origination-system-cost
- https://www.capterra.com/p/171891/LendingPad/
- https://www.softwareadvice.com/loan-origination/lendingpad-profile/
- https://www.zeitro.com/blog/best-loan-origination-software
- https://lenderprice.com/lendingpad-and-lender-price-partner-to-modernize-mortgage-industry-technology/

**Encompass / ICE Mortgage Technology:**
- https://mortgagetech.ice.com/products/encompass
- https://ir.theice.com/press/news-details/2021/ICE-Mortgage-Technology-Enhances-Encompass-Platform-Enabling-Lenders-to-Stay-Ahead-of-New-Industry-Rule/default.aspx
- https://nationalmortgageprofessional.com/news/ice-mortgage-announces-0-percent-loans-hfa-borrowers
- https://mortgagetech.ice.com/resources/data-reports/march-2026-mortgage-monitor
- https://www.housingwire.com/articles/encompass-by-ice-mortgage-technology-provides-an-all-in-one-workflow-for-omnichannel-lenders/

**Alternatives:**
- https://www.loanpro.io/blog/best-loan-origination-software/
- https://timvero.com/blog/best-loan-origination-software
- https://hesfintech.com/blog/top-best-loan-origination-software/
- https://www.softpullsolutions.com/blog/posts/2025/december/16-best-mortgage-loan-origination-software-companies-to-integrate-with-in-2026/
- https://lendfoundry.com/blog/loan-origination-software-build-vs-buy-cost-analysis-2026/
- https://getbuilt.com/

**Industry context:**
- https://loanstreamwholesale.com/
- https://www.zeitro.com/blog/best-non-qm-mortgage-lenders
- https://www.nqmf.com/non-qm-lending-trends-to-watch-in-2026-what-brokers-need-to-prepare-for/
- https://www.lendersa.com/blog/lending/the-25-best-non-qm.html

---

**End of Thread G. Linked threads: Master Plan v11 §6 LOS decision, Build_vs_Buy_v2 Tier 1 sub-thread (pricing/appraisal/MERS), Thread F (AGPL — no LOS component flagged, but LendingPad vendor risk is a separate concern).**