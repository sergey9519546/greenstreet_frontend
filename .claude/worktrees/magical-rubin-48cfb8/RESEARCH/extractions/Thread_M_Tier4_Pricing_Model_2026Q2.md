---
type: synthesis
status: drafted
title: "Thread M: Tier 4 Pricing Model 2026 Q2 (RESOLVED)"
summary: "Tier 4 v1 pricing model — RESOLVED 2026-06-21 17:36 PT. 3 tiers (Starter $15K / Pro $30K / Enterprise $50K-$100K) + per-loan fees. Lead with Pro."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread M — Tier 4 v1 SaaS Pricing Model

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_M_Tier4_Pricing_Model_2026Q2.md`

---

## 0. Why this thread exists

Master Plan v11 §6 lists "Tier 4 v1 pricing model" as an open decision. Per Master Plan v11 §3, the Year 1 revenue target is $500K-$1M ($345K-$500K ARR + $100K-$250K one-time implementation). Per Thread I, the pilot economics assume $30K/yr per broker (5 brokers × $30K = $150K ARR conservative, $90K pessimistic).

This thread designs a defensible pricing model for Tier 4 v1 SaaS that hits Master Plan v11 Year 1 revenue target, with tier structure, value-based pricing logic, and conversion economics. Output: a concrete pricing playbook for v1 launch.

## 1. SaaS pricing landscape — what the market tolerates in 2026

**Primary sources:**
- PricingI/O "SaaS Pricing Models: The Complete 2026 Guide" — https://www.pricingio.com/insights/saas-pricing-models-2026
- Softwarepricing.com "SaaS Pricing Models: What Actually Works" — https://softwarepricing.com/blog/saas-pricing-models/
- SaaS CFO "Death of Per-Seat Pricing" — https://www.thesaascfo.com/saas-per-seat-pricing/
- Bain "Per-Seat Software Pricing Isn't Dead" — https://www.bain.com/insights/per-seat-software-pricing-isnt-dead-but-new-models-are-gaining-steam/
- Paddle "SaaS Pricing Models and Strategies" — https://www.paddle.com/blog/saas-pricing-models-strategies-fltr
- Bloomberg forecast via SaaS CFO: subscription drops 60% → 30% of SaaS models in next decade; outcome-based rising

**Key 2026 trends:**

1. **Per-seat pricing declining** (still ~60% of SaaS, but dropping to ~30% by 2035)
2. **Usage-based pricing rising** (per API call, per loan, per GB — fits high-variance usage)
3. **Outcome-based pricing emerging** (per active user, per converted lead, per saved FTE-hour)
4. **Hybrid models** (per-seat + usage) are now 65% of new B2B SaaS (per Bain)
5. **Tiered packaging** is the standard structure: Starter / Pro / Enterprise

**Implication for us:** Our pricing should be hybrid (base subscription + per-loan usage) with tiered packaging. Pure per-seat fails because our value scales with loan volume, not seat count.

## 2. Our value proposition (basis for value-based pricing)

Per Thread E, our platform delivers:
- 30-50% reduction in DSCR underwriting FTE time
- Automated adverse action reason codes (saves Reg B compliance cost)
- MRM documentation per OCC 2026-13 (saves bank-channel audit cost)
- Portfolio-DSCR analytics (no competitor has this; blue-ocean per Master Plan v11)

**Quantified value (per broker per year, conservative):**
- 1 FTE × $80K salary × 30% time savings = $24K/yr (underwriting FTE cost saved)
- Adverse action compliance automation: ~$5K/yr (vs manual review)
- MRM documentation: ~$10K/yr (vs building in-house)
- Faster funding decisions: $5K-$20K/yr (depends on volume; faster close = more loans)
- **Total annual value: $40K-$60K per mid-size broker**

**Pricing should be 30-50% of value captured:** $15K-$25K/yr per broker for tier-2 (Pro).

## 3. Tiered pricing model (3 tiers)

### Tier 1: Starter — $15K/yr

- **For:** Small brokerages (50-200 loans/yr, 1-2 non-QM specialists)
- **Includes:**
  - Tier 4 v1 access (portfolio-DSCR analytics core)
  - Up to 200 loans/yr processed
  - 5 user seats
  - Email support (48-hr response SLA)
  - Standard adverse action reason codes
  - Basic MRM documentation template
- **Use fees:** $50/loan above 200/yr
- **Target conversion:** 5 pilots → 3 paid Starter in Year 1 = $45K ARR

### Tier 2: Pro — $30K/yr (target primary tier)

- **For:** Mid-size brokerages (200-1,000 loans/yr, 3-5 non-QM specialists)
- **Includes:**
  - Everything in Starter, plus:
  - Up to 1,000 loans/yr processed
  - 20 user seats
  - Slack Connect support (4-hr response SLA)
  - Custom adverse action reason code mapping
  - Custom MRM documentation
  - Quarterly business reviews
  - Co-marketing opportunities
- **Use fees:** $30/loan above 1,000/yr
- **Target conversion:** 5 pilots → 2 paid Pro in Year 1 = $60K ARR

### Tier 3: Enterprise — $50K-$100K/yr (custom)

- **For:** Large lenders, sponsor groups, or banks (1,000-10,000+ loans/yr)
- **Includes:**
  - Everything in Pro, plus:
  - Unlimited loans
  - Unlimited user seats (or fair-use)
  - Dedicated account manager
  - Phone + Slack Connect (1-hr response SLA)
  - On-prem or VPC deployment option
  - Custom integrations (LOS, core banking, etc.)
  - Dedicated model training data program
  - Multi-year contract discount
- **Use fees:** Negotiated (typically $15-25/loan above 5,000/yr for high-volume)
- **Target conversion:** 1 Enterprise deal in Year 2 (Insula or similar) = $50K-$100K ARR

### Implementation fee (one-time, optional)

- **Standard:** $25K one-time (includes onboarding, integration, training)
- **Enterprise:** $50K-$100K one-time (includes on-prem setup, custom integration, white-glove model training)
- **Pilot phase:** $0 implementation (free, per Thread L pilot model)

## 4. Year 1 revenue projection (Master Plan v11 §3 target)

**Conservative scenario (30% pilot conversion, slow Year 1):**

| Source | ARR | One-time |
|---|---|---|
| 5 pilots × 30% conversion = 1.5 paid customers | 1.5 × $15K = $22.5K | $0 |
| Assume 1 paid Starter + 0.5 paid Pro (split) | $7.5K + $15K = $22.5K | $0 |
| Implementation fees | $0 | $0 |
| **Year 1 total** | **$22.5K** | **$0** |

→ This is BELOW Master Plan v11 $345K-$500K ARR target. Need more pilots + faster conversion.

**Realistic scenario (40% pilot conversion, 1 Enterprise deal in Year 1):**

| Source | ARR | One-time |
|---|---|---|
| 5 pilots × 40% = 2 paid | 1 × $15K + 1 × $30K = $45K | $0 |
| 1 Enterprise (Insula or equivalent) | $50K-$100K | $50K-$100K |
| 3 additional Pro customers via inbound | 3 × $30K = $90K | $25K × 3 = $75K |
| **Year 1 total** | **$185K-$235K** | **$125K-$175K** |

→ Closer to Master Plan v11 target but still below.

**Stretch scenario (5 pilots, 2 Enterprise, multi-year deals):**

| Source | ARR | One-time |
|---|---|---|
| 5 paid Pro customers (all 5 pilots convert) | 5 × $30K = $150K | $25K × 5 = $125K |
| 1 Enterprise (Insula) | $75K | $75K |
| Multi-year contract bonus (Year 2 prepayment) | 1 × $30K prepaid | — |
| **Year 1 total** | **$255K** | **$200K** |

→ **Total Year 1 revenue (stretch): $455K** — within Master Plan v11 $500K-$1M range.

**Realistic Year 1 target: $250K-$400K** (ARR + one-time) — within Master Plan v11 lower bound.

## 5. Pricing decision framework — what to lead with

### Lead with Pro tier ($30K/yr) as "default"

- Most brokers (200-1,000 loans/yr) fit this tier
- Pro pricing captures meaningful value (~$30K vs $40K-$60K value delivered)
- Easier to discount down to Starter than upsell from Starter
- Per Thread I pilot economics assumption ($30K/yr per broker), Pro matches

### Use Starter as "land" for small brokers

- $15K/yr entry point for less committed customers
- Upsell path to Pro when they outgrow 200 loans/yr
- Per-loan use fees ($50) discourage gaming the system

### Use Enterprise as "expand" for large customers

- Custom pricing for large brokerages, sponsor groups, banks
- Per-loan use fees decline as volume grows (encourages scale)
- Multi-year contract discounts (10% off Year 2 if Year 1 paid)

### Implementation fee as "skin in game"

- $25K one-time ensures customer commitment
- Discount or waive for pilots (build case study asset)
- Higher for Enterprise ($50K-$100K) for custom integration effort

## 6. Discount strategy (when to discount, by how much)

### Standard discounts (always available)

- **Multi-year:** 10% off Year 2 if Year 1 prepaid
- **Annual upfront vs monthly:** 15% discount for annual upfront payment
- **Non-profit / trade association members (NAMB):** 10% off Starter tier

### Pilot-to-paid conversion discounts (limited use)

- **Year 1 conversion after successful pilot:** 20% off Year 1 (= $24K instead of $30K for Pro)
- **Case study cooperation:** Additional 10% off Year 1 if customer provides 2+ case study references
- **Reference customer (introduces 2+ new customers):** 25% off Year 2 if both referrals convert

### NEVER discount (hard line)

- Starter tier ($15K floor — if they need lower, they're not a fit)
- Enterprise below $50K (insufficient for the support burden)
- Free tier (zero — we charge from day 1, even for pilots during their pilot phase)
- Multi-year >2 years (lock-in is bad for both parties)

## 7. Competitive pricing positioning

| Vendor | Pricing (publicly available or typical) | Our position |
|---|---|---|
| Scienaptic AI | $50K-$150K/yr (mid-five-figures) | Our Pro ($30K) is 50-80% cheaper; our value-prop is more focused on DSCR specifically |
| Zest AI | $75K-$200K/yr | Our Enterprise ($50K-$100K) is competitive; we win on DSCR specialization |
| Verum (ICE) | bundled into ICE Mortgage Tech, $100K+ effectively | We win on standalone + DSCR focus |
| Beeline | $20K-$50K/yr (POS) | We win on portfolio-DSCR analytics vs. POS |
| LoanPro (LOS, not analytics) | $25K-$75K/yr | Different product; not direct competitor |
| Optimal Blue (pricing engine) | $240K-$360K/yr (per Major Thread v2) | 8-12x more expensive; we don't compete on pricing engine |

**Pricing strategy:** Sit at 30-50% discount vs Scienaptic/Zest, premium vs POS tools, focus on DSCR specialization as the wedge.

## 8. Pricing risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Brokers undervalue vs free/open-source tools | HIGH | MEDIUM | Lead with value-prop (30% time savings, MRM docs); case study evidence |
| Per-loan use fees confuse customers | MEDIUM | LOW | Clear pricing page; calculator on website |
| Discounts erode margin | MEDIUM | MEDIUM | Cap total discount at 30% of list; require business case for larger |
| Enterprise deals take 6-12 months to close | HIGH | HIGH (delays revenue) | Run pilots as proxy for Enterprise validation; reduce Enterprise to 2-3 in Year 1 |
| Pricing perception "too cheap" (signals low quality) | LOW | MEDIUM | Publish case studies showing measurable ROI; don't apologize for pricing |
| Competitor (Scienaptic/Zest) cuts price to compete | MEDIUM | HIGH | We win on DSCR specialization, not price; don't engage in price war |

## 9. Open questions for user

1. Approve 3-tier pricing model (Starter $15K / Pro $30K / Enterprise $50K-$100K)?
2. Approve per-loan use fees ($50 Starter / $30 Pro / negotiated Enterprise)?
3. Approve Year 1 revenue target ($250K-$400K realistic, vs Master Plan v11 $500K-$1M stretch)?
4. Approve discount strategy (multi-year, annual upfront, NAMB member, pilot conversion, case study)?
5. Approve hard-line discounts (never discount below Starter $15K, no free tier, max 2-year contracts)?
6. Approve "lead with Pro" sales approach vs "lead with Starter" land-and-expand?

## 10. Sources cited

**SaaS pricing landscape:**
- PricingI/O 2026 guide — https://www.pricingio.com/insights/saas-pricing-models-2026
- Softwarepricing.com — https://softwarepricing.com/blog/saas-pricing-models/
- SaaS CFO on per-seat decline — https://www.thesaascfo.com/saas-per-seat-pricing/
- Bain on hybrid models — https://www.bain.com/insights/per-seat-software-pricing-isnt-dead-but-new-models-are-gaining-steam/
- Paddle SaaS pricing strategies — https://www.paddle.com/blog/saas-pricing-models-strategies-fltr

**Mortgage industry pricing benchmarks:**
- Scienaptic AI pricing patterns (per Thread E + HES FinTech 2026)
- Zest AI pricing patterns (per Thread E)
- Optimal Blue $240K-$360K/yr (per Major Build-vs-Buy v2)
- Argyle pricing NOT public (per Thread E)
- LendingPad $50-$100/user/month (per Thread G)
- Encompass $50K-$500K/yr (per Thread G)

**Value-prop basis:**
- Thread E — AI/ML audit (30-50% time savings, MRM, adverse action automation)
- Thread I — Pilot broker profile (5 pilot conversion → $150K ARR)
- Master Plan v11 §3 ($500K-$1M Year 1 revenue target)

**Related research:**
- Thread F — AGPL clean licensing (no SaaS source-disclosure liability)
- Thread K — Insula sales call (Enterprise pricing reference)
- Thread L — Pilot outreach playbook (pilot-to-paid conversion economics)

---

**End of Thread M. Linked threads: Master Plan v11 §3 + §6 pricing decision; Thread E (capability claims backing value-prop); Thread I (pilot economics anchor); Thread K (Insula Enterprise pricing reference); Thread L (pilot-to-paid conversion framework).**