# INNOVATION: Refinance Timing Optimizer for DSCR Intelligence Platform

**Date:** June 2026
**Classification:** Next-Gen Innovation Research — Comprehensive Deep Dive
**Status:** Synthesized from domain expertise, lender data, and prior research findings
**Document Version:** 2.0 (Expanded from 185-line v1 to full specification)
**Target:** Product, Engineering, and Strategy teams

---

## 1. The Innovation Opportunity

No DSCR tool on the market tells investors **when** to refinance. Every existing platform — from simple calculators to sophisticated pricing engines — answers one question: "Can I get this loan?" Nobody answers the far more valuable question: "Should I refinance the loan I already have, and if so, exactly when?"

This is a critical gap. DSCR loan investors hold properties for 5 to 30 years. The origination moment is a single point in time. The life of the loan is measured in hundreds of months. Every single month after close, the borrower faces a dynamic decision: refinance or hold? Today, that decision is made with spreadsheets, gut instinct, and whatever a loan officer tells them on the phone. There is no systematic, data-driven tool.

### Why Current Tools Fail Post-Close

- **Acquisition-focused architecture**: Every DSCR calculator is built around the origination workflow — input property details, get a rate quote, close. Once the loan funds, the platform has no further engagement.
- **No lifecycle tracking**: Current tools don't store the original loan terms, don't monitor changes in rent or expenses, and don't alert borrowers when conditions shift in their favor.
- **Prepay penalty blindness**: DSCR loans carry step-down prepay penalties (5/4/3/2/1 or 3/2/1) that make refinancing timing-critical. No tool visualizes when the penalty drops to the next level and whether waiting saves money.
- **Seasoning ignorance**: Lenders have different seasoning requirements for cash-out refinances. No tool tells you "Griffin lets you cash out tomorrow, but most lenders require 6 months."
- **DSCR tier drift**: Rent growth pushes borrowers into better DSCR tiers with lower rates. No tool monitors this drift and alerts when a tier threshold is crossed.
- **Rate environment shifts**: A 7.5% loan originated in 2024 could be refinanced to 6.5% in 2026 as rates cycle. No tool watches the rate environment relative to your existing loan.

### The Strategic Transformation

Building a Refinance Timing Optimizer transforms the platform from a **one-time calculator** into a **lifelong investment companion**. This is the difference between a mortgage calculator and a wealth management platform. Consider the engagement model:

| Dimension | Calculator Model | Lifelong Companion Model |
|---|---|---|
| Usage frequency | Once (at acquisition) | Monthly or ongoing |
| User relationship | Transactional | Advisory |
| Switching cost | Zero (any calculator works) | High (platform knows your loans) |
| Revenue per user | Single transaction | Recurring (alerts, referrals, refi pipelines) |
| Data moat | None (no stored data) | Deep (loan terms, rent history, refi outcomes) |

### Why Nobody Has Built This Yet

1. **Origination incentives**: Loan officers and brokers earn on new originations. Refinancing an existing loan at another lender earns them nothing. The incentive is to originate, not to optimize.
2. **Data fragmentation**: Monitoring when to refi requires knowing the borrower's current loan terms, current property rent, current expenses, current rate environment, and each lender's seasoning requirements. No single platform has all this.
3. **Complexity**: The break-even analysis for a DSCR refi is significantly more complex than for an agency refi because of prepay penalties, DSCR tier pricing, seasoning rules, and reserve requirements.
4. **Perceived low urgency**: Borrowers don't wake up thinking "I should check if I can refinance today." They need to be prodded. No tool does the prodding.

5. **Fragmented lender knowledge**: Each lender's seasoning rules, prepay structures, and DSCR tier pricing are buried in rate sheets and guidelines that investors rarely read. No tool consolidates this into an actionable refi timeline.
6. **No financial incentive to build it**: Origination platforms make money when you get a new loan. A refi timing tool that says "wait 4 months" doesn't generate immediate revenue. The business model for ongoing loan monitoring is unproven — until now.

**The Refinance Timing Optimizer fills this gap and, by doing so, becomes the single most sticky feature in the DSCR platform ecosystem. Once a borrower trusts the platform to monitor their loans and alert them to savings opportunities, they will never leave. This is the "wealth management" of DSCR — ongoing optimization, not just transactional support.**

---

## 2. Break-Even Analysis Framework

### The Core Formula

The fundamental question every borrower asks is: "How long until the refinance pays for itself?" The answer is the break-even point, measured in months.

```
Monthly Savings = (Old PITIA) - (New PITIA)
Total Refi Cost = Closing Costs + Prepay Penalty (if applicable)
Break-Even Months = Total Refi Cost / Monthly Savings
```

Where:
- **PITIA** = Principal + Interest + Taxes + Insurance + Assessments (HOA)
- **Closing Costs** typically include: origination fee (0.5-2 points), appraisal ($550-850), title insurance ($1,500-3,000), recording fees ($50-200), flood cert ($15-25), credit report ($50-100), processing/underwriting ($500-1,500)
- **Prepay Penalty** varies by prepay structure and time elapsed (see Section 7)

### Why DSCR Break-Even Is More Complex Than Agency

A conventional refinance break-even is straightforward: compare old payment vs. new payment, divide by closing costs. DSCR break-even is fundamentally more complex for five reasons:

1. **Prepay penalties add thousands to the cost side**: A 5/4/3/2/1 prepay on a $300,000 loan adds $15,000 in Year 1, $12,000 in Year 2, $9,000 in Year 3, $6,000 in Year 4, $3,000 in Year 5. This dwarfs typical closing costs and makes the break-even timeline much longer.

2. **DSCR tier improvements reduce rates**: If the borrower's DSCR has improved since origination (e.g., from 1.05 to 1.25), they may qualify for a rate that's 37.5-50 bps lower than they could have gotten at origination. This isn't just "rates went down" — it's "you became a better borrower." The platform must calculate both effects.

3. **Reserve requirements may change**: A new lender may require 6 months of reserves vs. the original lender's 3 months, or vice versa. This is a hidden cost or benefit that affects the true break-even.

4. **Cash-out changes the balance**: If the borrower takes cash out, the new loan balance is higher, the payment is higher, and the monthly savings may be smaller or even negative. The break-even must be calculated on the NET benefit — comparing the total economic position, not just the payment.

5. **Interest-only periods may be ending**: Many DSCR loans have 3-year or 5-year interest-only periods. Refinancing before the IO period ends can extend the lower payment, which is a benefit not captured by simple payment comparison.

### Enhanced Break-Even Formula for DSCR

```
Net Monthly Benefit = (Old PITIA - New PITIA) + Reserve Release + IO Extension Benefit
Total Refi Cost = Closing Costs + Prepay Penalty + Reserve Increase (if any)
Adjusted Break-Even = Total Refi Cost / Net Monthly Benefit
```

If Net Monthly Benefit includes the value of extending interest-only, the formula becomes:

```
IO Extension Benefit = (P&I Payment - IO Payment) for months during IO extension period
```

### Worked Example: $300K DSCR Loan at 7.5% with 5/4/3/2/1 Prepay

**Original Loan Terms:**
- Loan amount: $300,000
- Rate: 7.5% (30-year amortizing)
- Monthly P&I: $2,097.64
- Taxes + Insurance + HOA: $450/month
- Original PITIA: $2,547.64
- DSCR at origination: 1.08 (rent = $2,751)
- Prepay structure: 5/4/3/2/1

**Assumed New Loan Terms (after 2 years):**
- New rate: 6.75% (DSCR improved to 1.25, qualifying for better tier)
- Monthly P&I at 6.75%: $1,945.40
- New PITIA: $2,395.40
- Monthly savings: $2,547.64 - $2,395.40 = **$152.24/month**

**Break-Even at Each Prepay Step-Down Level:**

| Refi Timing | Prepay % | Prepay Amount | Closing Costs | Total Cost | Monthly Savings | Break-Even (Months) |
|---|---|---|---|---|---|---|
| Year 1 (5%) | 5% | $15,000 | $6,000 | $21,000 | $152.24 | **138 months** |
| Year 2 (4%) | 4% | $12,000 | $6,000 | $18,000 | $152.24 | **118 months** |
| Year 3 (3%) | 3% | $9,000 | $6,000 | $15,000 | $152.24 | **99 months** |
| Year 4 (2%) | 2% | $6,000 | $6,000 | $12,000 | $152.24 | **79 months** |
| Year 5 (1%) | 1% | $3,000 | $6,000 | $9,000 | $152.24 | **59 months** |
| Year 6+ (0%) | 0% | $0 | $6,000 | $6,000 | $152.24 | **39 months** |

**Key Insight**: Refinancing in Year 1 or 2 with this loan makes almost no sense — the break-even exceeds 10 years. But by Year 4, the break-even drops to ~6.5 years, and by Year 6 (no prepay), it's just over 3 years. The platform must surface these dynamics visually.

### Variable Rate Environment Break-Evens

If rates drop to 6.25% instead of 6.75%, monthly savings jump to $231/month:
- Year 3 break-even: $15,000 / $231 = **65 months** (5.4 years) — starts to make sense
- Year 5 break-even: $9,000 / $231 = **39 months** (3.3 years) — clearly worth it
- Year 6+ break-even: $6,000 / $231 = **26 months** (2.2 years) — no-brainer

The platform should model break-even across a range of rate scenarios and present a sensitivity table.

### Break-Even with DSCR Tier Improvement

If the same borrower's DSCR improved from 1.08 to 1.40 (not just 1.25):
- New rate: 6.50% (top-tier pricing)
- Monthly P&I: $1,896.20
- New PITIA: $2,346.20
- Monthly savings: $2,547.64 - $2,346.20 = **$201.44/month**

Year 3 break-even: $15,000 / $201.44 = **74 months** (6.2 years)
Year 5 break-even: $9,000 / $201.44 = **45 months** (3.7 years)

**The platform must capture the dual benefit of falling rates AND improving DSCR to give the borrower an accurate break-even.**

---

## 3. Seasoning-Based Refi Windows

### The Problem

After purchasing a property, investors are often locked out of cash-out refinances by lender seasoning requirements. These requirements vary dramatically by lender, from zero to 12 months, and they directly impact when a borrower can access equity. No current tool tracks this or alerts investors when their window opens.

### Full Lender Seasoning Requirements Table

| Lender | Cash-Out Seasoning | Rate/Term Seasoning | Max LTV at Cash-Out | Key Notes |
|---|---|---|---|---|
| **Griffin Funding** | None | None | 75% LTV | No seasoning required for cash-out — key differentiator. Can refinance immediately after purchase. |
| **Easy Street Capital** | 3-6 months (tiered) | None | 3-6 mo: 70% LTV (700+ FICO); 6+ mo: no restrictions | Tiered system rewards longer seasoning with higher LTV. Under 3 months: no cash-out. |
| **Lima One Capital** | 90 days | None | 75% LTV | 90-day seasoning for leverage on full market value. Popular for BRRRR strategy. |
| **LendingOne** | 6 months | None | 75% LTV | Standard 6-month seasoning. No exceptions documented. |
| **Visio Lending** | 6 months | None | 80% LTV | 6-month standard. Higher LTV than most at 80%. |
| **Kiavi** | 6 months | None | 75% LTV | 6-month standard. Strong tech-forward process. |
| **Ridge Lending** | 6 months | None | 75% LTV | 6-month standard. |
| **Anchor Loans** | 6 months | None | 75% LTV | 6-month standard for cash-out. |
| **Most DSCR Lenders** | 6 months | None | 70-75% LTV | Industry standard is 6 months for cash-out. |
| **Conventional (Agency)** | 12 months | None | 80% LTV | Fannie/Freddie require 12 months for cash-out. Limited to 75-80% LTV. |
| **FHA** | 12 months | None | 85% LTV | 12-month standard. Not applicable for investment properties. |
| **Hard Money** | None | None | 65-70% ARV | No seasoning but much higher rates (10-14%). Bridge product only. |

### Griffin: The Zero-Seasoning Differentiator

Griffin Funding's no-seasoning cash-out policy is the single most important seasoning exception in the DSCR market. Here's why it matters:

- **BRRRR investors** can refinance out of hard money immediately, rather than waiting 6 months and paying 10-14% on the bridge loan.
- **Equity extraction** can happen as soon as the purchase closes, enabling rapid portfolio scaling.
- **Rate reduction** can be locked in immediately if rates have fallen since the original loan.
- **Prepay penalty avoidance**: If the original loan has no prepay (e.g., hard money), refinancing to DSCR immediately saves significant interest.

**Example**: Investor buys a property with hard money at 12% interest-only. Monthly payment on $280,000: $2,800/month. Griffin refinances to DSCR at 7.25% with no seasoning. New payment: $1,912/month. Savings: $888/month. Over the 6 months they'd otherwise wait: $5,328 saved.

### Easy Street: The Tiered Seasoning Model

Easy Street's tiered approach offers a nuanced middle ground:

| Time Since Purchase | Cash-Out Allowed | Max LTV | FICO Requirement |
|---|---|---|---|
| 0-3 months | No | N/A | N/A |
| 3-6 months | Yes | 70% LTV | 700+ |
| 6+ months | Yes | No restrictions | Standard |

This creates two decision points for the borrower:
1. **At 3 months**: Is 70% LTV enough to extract the needed equity? If yes, refinance now. If no, wait.
2. **At 6 months**: Full LTV access. But 3 more months of the current loan payment.

The platform should model both decision points and recommend the optimal timing.

### "Seasoning Countdown" Feature Design

The Seasoning Countdown is a visual feature that shows the borrower exactly when each lender's cash-out window opens and what terms are available at each milestone.

**Feature Specification:**

```
┌─────────────────────────────────────────────────────────┐
│  PROPERTY: 123 Main St — Purchased Jan 15, 2026        │
│                                                          │
│  SEASONING COUNTDOWN                                     │
│  ═════════════════════                                    │
│                                                          │
│  ✅ Griffin Funding    — Available NOW (0 days)          │
│     Cash-out up to 75% LTV at 7.25%                     │
│                                                          │
│  ⏳ Lima One Capital   — 47 days remaining (Apr 15)     │
│     Cash-out up to 75% LTV at 7.00%                     │
│                                                          │
│  ⏳ Easy Street (70%)  — 47 days remaining (Apr 15)     │
│     Cash-out up to 70% LTV at 6.875%                    │
│                                                          │
│  ⏳ Most DSCR Lenders  — 137 days remaining (Jul 15)    │
│     Cash-out up to 75% LTV at 6.75-7.25%                │
│                                                          │
│  ⏳ Easy Street (full) — 137 days remaining (Jul 15)    │
│     Cash-out up to 75% LTV at 6.75%                     │
│                                                          │
│  ⏳ Conventional       — 322 days remaining (Jan 15)    │
│     Cash-out up to 80% LTV at 6.25%                     │
│                                                          │
│  [View Full Refi Comparison] [Set Alerts]                │
└─────────────────────────────────────────────────────────┘
```

**Alert Configurations:**
- Push notification / email when a new lender window opens
- Pre-alert 7 days before a milestone (e.g., "Lima One cash-out window opens in 7 days")
- Rate change alerts within open windows (e.g., "Griffin just dropped their rate to 7.00%")
- Seasoning milestone summary: weekly digest of upcoming window openings

### Seasoning + Prepay Interaction

Seasoning requirements must be overlaid with the prepay penalty calendar. A 6-month seasoning requirement coincides with the end of Year 1 on a 5/4/3/2/1 prepay, but not exactly. The platform must show both timelines simultaneously:

```
Month:     0    3    6    9    12   15   18   21   24
           |    |    |    |    |    |    |    |    |
Seasoning: ████ ░░░░ ✓ Most lenders
Prepay 5%: ████████████████████████████
Prepay 4%:                            ████████████████████
                                    ↑ Year 2 starts
```

The "sweet spot" is when seasoning is met AND the prepay penalty has stepped down. For a loan originated in Month 0 with 6-month seasoning and a 5/4/3/2/1 prepay:
- **Month 6**: Seasoning met, but still in 5% prepay year. Break-even is long.
- **Month 12**: Still 5% prepay. Seasoning long met. Break-even still long.
- **Month 13+**: Prepay drops to 4%. Better but still significant.
- **Month 24+**: Prepay drops to 3%. Combined with seasoning being 2 years old, this may be viable.
- **Month 60+**: No prepay. Optimal window if rates are favorable.

---

## 4. DSCR Drift Tracker

### How Rent Growth Drives DSCR Improvement

DSCR is calculated as: `DSCR = Rent / PITIA`. When rent grows, DSCR improves. When expenses grow (insurance, taxes), DSCR deteriorates. Both directions matter, but the opportunity is in improvement.

DSCR drift is the gradual change in a property's DSCR over time due to:
- **Rent increases** (market-driven or lease escalations)
- **Expense changes** (insurance spikes, tax reassessment, HOA increases)
- **Loan paydown** (amortizing loans reduce principal over time, slightly reducing P&I)

For DSCR loans specifically, rent growth is the dominant driver because:
1. DSCR loans qualify based on rent, not borrower income
2. Small rent increases have outsized DSCR impact at the margin
3. DSCR tier thresholds create nonlinear pricing jumps

### DSCR Tier Pricing Impact

DSCR lenders typically price in tiers. When a borrower crosses from one tier to the next, the rate improvement is immediate and significant:

| DSCR Tier | Rate Adjustment vs. Baseline | Monthly Payment Impact ($300K Loan) |
|---|---|---|
| < 1.00 | Decline (insufficient DSCR) | N/A |
| 1.00 - 1.09 | +50 to +100 bps (surcharge) | +$100 to +$200/month |
| 1.10 - 1.24 | Baseline rate | $0 |
| 1.25 - 1.39 | -37.5 to -50 bps (discount) | -$75 to -$100/month |
| 1.40+ | -50 to -75 bps (best pricing) | -$100 to -$150/month |

**The key insight**: A borrower who originated at DSCR 1.05 (paying a surcharge) and whose DSCR has drifted to 1.25 (earning a discount) is looking at a total rate swing of 87.5 to 150 bps. On a $300,000 loan, that's $175 to $300/month in savings — just from DSCR improvement alone, before any rate environment changes.

### Worked Example: DSCR 1.05 → 1.25

**Original Terms:**
- Property rent: $2,200/month
- PITIA: $2,095/month
- DSCR: 2,200 / 2,095 = **1.05** (lowest qualifying tier, paying surcharge)
- Original rate: 7.75% (baseline 7.25% + 50 bps surcharge for DSCR < 1.10)
- Monthly P&I: $2,138.71

**After 18 Months of Rent Growth:**
- Property rent: $2,400/month (rent grew ~$200, or ~9% over 18 months — reasonable in many markets)
- PITIA: $2,095/month (unchanged, assuming no expense changes)
- New DSCR: 2,400 / 2,095 = **1.145** (mid-tier, no longer paying surcharge)
- But if rent reaches $2,620/month: DSCR = 2,620 / 2,095 = **1.25** (top-tier discount)

**Refinance Impact at DSCR 1.25:**
- New rate: 6.75% (baseline 7.25% - 50 bps discount for DSCR ≥ 1.25)
- Rate improvement: 7.75% → 6.75% = **100 bps total** (50 bps surcharge removed + 50 bps discount earned)
- New monthly P&I: $1,945.40
- Monthly savings: $2,138.71 - $1,945.40 = **$193.31/month**
- Annual savings: **$2,319.72/year**

### Alert Design: DSCR Drift Notifications

The platform should proactively monitor rent changes and alert borrowers when they cross tier thresholds:

```
┌─────────────────────────────────────────────────────────┐
│  🚨 DSCR TIER IMPROVEMENT ALERT                         │
│                                                          │
│  Property: 123 Main St, Anytown USA                     │
│  Original DSCR: 1.05 (Tier: 1.00-1.09 — Surcharge)     │
│  Current DSCR:  1.27 (Tier: 1.25+ — Discount)           │
│                                                          │
│  You've crossed into the best DSCR pricing tier!         │
│                                                          │
│  Estimated Refinance Savings:                            │
│  • Rate improvement: 7.75% → 6.75% (100 bps)           │
│  • Monthly savings: $193/month                          │
│  • Annual savings: $2,320/year                          │
│                                                          │
│  Your Prepay Penalty Status:                             │
│  • 5/4/3/2/1 structure, currently in Year 2             │
│  • Current prepay: 4% = $12,000                         │
│  • Drops to 3% ($9,000) in 4 months                    │
│                                                          │
│  Break-Even Analysis:                                    │
│  • Refi now (4% prepay): 93 months                      │
│  • Wait for 3% step-down: 78 months                     │
│  • Wait for 0% (Year 6): 39 months                      │
│                                                          │
│  [Refinance Now] [Wait for Step-Down] [Dismiss]          │
└─────────────────────────────────────────────────────────┘
```

### Monitoring Rent Changes Across a Portfolio

For investors with multiple properties, the DSCR Drift Tracker must work at the portfolio level:

1. **Rent feed integration**: Connect to rent roll data (manual entry, property management software API, or market rent estimates from RentCast/Rentometer).
2. **Lease expiration calendar**: Track when leases expire and model potential rent increases upon renewal.
3. **Market rent benchmarking**: Compare actual rent to market rent for the property. If market rent is significantly above actual rent, flag as "rent capture opportunity" — the borrower may be able to increase rent at renewal, improving DSCR.
4. **Expense monitoring**: Track insurance and tax changes that could erode DSCR. Alert when DSCR drifts downward toward a tier boundary.
5. **Portfolio DSCR heatmap**: Visual dashboard showing all properties color-coded by DSCR tier, with arrows indicating drift direction (↑ improving, ↓ deteriorating, → stable).

**Downside DSCR Drift — Equally Important:**

Just as rent growth improves DSCR, expense shocks can erode it. The tracker must also alert when DSCR is deteriorating:

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ DSCR DETERIORATION WARNING                          │
│                                                          │
│  Property: 456 Oak Ave, Othertown USA                   │
│  Previous DSCR: 1.18 (Tier: 1.10-1.24 — Baseline)      │
│  Current DSCR:  1.07 (Tier: 1.00-1.09 — Surcharge)     │
│                                                          │
│  Cause: Insurance premium increased from $1,800/yr      │
│  to $3,200/yr (+$117/month PITIA increase)              │
│                                                          │
│  If you refinance now, you'll face a surcharge.          │
│  Consider:                                               │
│  1. Shopping for lower insurance before refinancing      │
│  2. Increasing rent to offset the insurance spike        │
│  3. Refinancing to a lower rate to offset the surcharge  │
│                                                          │
│  [Shop Insurance] [Model Rent Increase] [View Refi]     │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Cash-Out Refi vs Second Lien Decision

### The Decision Framework

When a borrower needs to extract equity from a property, they have two options:
1. **Cash-out refinance**: Pay off the existing first lien and replace it with a larger loan, pocketing the difference.
2. **Second lien**: Keep the existing first lien in place and add a new, smaller loan behind it.

The right choice depends on the interplay of rates, prepay penalties, closing costs, and loan amounts. Currently, no DSCR tool models both options simultaneously and recommends the cheaper path.

### Side-by-Side Comparison

| Factor | Cash-Out Refinance | Second Lien (Closed-End) | Second Lien (HELOC) |
|---|---|---|---|
| **Rate on existing balance** | New rate (may be higher or lower than current) | Unchanged (keeps existing rate) | Unchanged (keeps existing rate) |
| **Rate on new money** | Same as entire new loan rate | Higher than 1st lien (typically +150-300 bps) | Variable, typically Prime + margin |
| **Closing costs** | 2-3% of total new loan amount | 2-3% of 2nd lien amount only | 1-2% of HELOC amount (often lower) |
| **Prepay penalty** | On full existing balance (if applicable) | None (new loan, no prepay) | None |
| **Monthly payment impact** | May increase or decrease depending on rate | Always increases (new payment added) | Increases by draw amount interest |
| **DSCR impact** | Re-underwritten entirely at new terms | Additional PITIA reduces DSCR | Interest-only may preserve DSCR better |
| **Maximum cash available** | Up to 75% LTV minus existing balance | Up to CLTV limits (varies by lender) | Up to CLTV limits (varies by lender) |
| **Combined LTV (CLTV)** | N/A (single loan) | Typically 70-80% CLTV | Typically 70-75% CLTV |
| **Flexibility** | Fixed amount, one-time draw | Fixed amount, one-time draw | Revolving, draw as needed |
| **Amortization** | 30-year fixed | 15-20 year typically | Interest-only during draw period |
| **Foreclosure risk** | Standard first-lien position | Second-lien position (higher risk for lender) | Second-lien position |

### Second Lien DSCR Products Available

| Lender | Product | Max Amount | Max CLTV | Rate Range | Prepay | Notes |
|---|---|---|---|---|---|---|
| **Angel Oak** | Closed-end 2nd lien | Up to $350,000 | 75% CLTV | 9.5-11.5% | None | Fixed rate, 15-20 year amortization. DSCR qualified. |
| **Sun West** | DSCR HELOC | Up to $3,000,000 | 70% CLTV | Prime + 1-3% | None | Variable rate, 10-year draw + 20-year repayment. DSCR qualified. |
| **Various credit unions** | HELOC | Varies | 70-80% CLTV | Prime + 0-2% | None | May not be DSCR-qualified (personal income based) |

### Worked Example: $400K Property, Need $40K Cash

**Current Loan:**
- Property value: $400,000
- Current first lien: $280,000 at 6.5%
- Current monthly P&I: $1,769.25
- Current PITIA: $2,219.25 (P&I + $450 T&I)
- Current DSCR: 1.22 (rent = $2,708)
- Prepay penalty: 3% (Year 3 of 5/4/3/2/1) = $8,400
- No prepay penalty on second lien

**Option A: Cash-Out Refinance**
- New loan amount: $320,000 ($280K payoff + $40K cash-out)
- New rate: 7.00% (slightly higher than current 6.5% because cash-out rates are higher)
- New monthly P&I: $2,128.97
- New PITIA: $2,578.97
- Closing costs: $6,400 (2% of $320,000)
- Prepay penalty: $8,400 (3% of $280,000)
- Total cost: $14,800
- Monthly payment change: $2,578.97 - $2,219.25 = **+$359.72/month** (PAYMENT INCREASES)
- Net cash after costs: $40,000 - $14,800 = **$25,200**
- Effective cost of $40K: $14,800 in fees + $359.72/month higher payment
- New DSCR: $2,708 / $2,578.97 = **1.05** (barely qualifying — tier drop!)

**Option B: Second Lien (Angel Oak Closed-End)**
- Second lien amount: $40,000
- Second lien rate: 10.5%
- Second lien monthly P&I: $443.53 (20-year amortization)
- Closing costs: $1,200 (3% of $40,000)
- Prepay penalty: $0
- Total cost: $1,200
- Monthly payment change: +$443.53/month
- Net cash after costs: $40,000 - $1,200 = **$38,800**
- Combined PITIA: $2,219.25 + $443.53 = $2,662.78
- Combined DSCR: $2,708 / $2,662.78 = **1.017** (tight, but qualifying)
- Blended rate: (280K × 6.5% + 40K × 10.5%) / 320K = (18,200 + 4,200) / 320K = **7.03%**

**Option C: Second Lien (Sun West DSCR HELOC)**
- HELOC amount: $40,000
- HELOC rate: Prime + 2% = ~9.5% (current Prime 7.5%)
- HELOC monthly interest-only: $316.67/month
- Closing costs: $800 (2% of $40K)
- Prepay penalty: $0
- Total cost: $800
- Monthly payment change: +$316.67/month (interest-only during draw)
- Net cash after costs: $40,000 - $800 = **$39,200**
- Combined PITIA: $2,219.25 + $316.67 = $2,535.92
- Combined DSCR: $2,708 / $2,535.92 = **1.068** (better than cash-out refi)
- Blended rate (interest-only on 2nd): ~7.16% equivalent

### Comparison Summary

| Metric | Cash-Out Refi | Angel Oak 2nd Lien | Sun West HELOC |
|---|---|---|---|
| Net cash received | $25,200 | $38,800 | $39,200 |
| Monthly payment increase | $359.72 | $443.53 | $316.67 |
| Total upfront cost | $14,800 | $1,200 | $800 |
| Resulting DSCR | 1.05 ⚠️ | 1.017 ⚠️ | 1.068 |
| Blended rate | 7.00% | 7.03% | ~7.16% |
| Prepay penalty hit | $8,400 | $0 | $0 |

### When Cash-Out Refi Wins

1. **Current rate is above market**: If the existing 6.5% loan were at 8.5% instead, a cash-out refi at 7.0% would save money on the existing balance AND provide cash. Monthly savings on the $280K at 8.5% → 7.0% would be $286/month, partially offsetting the payment increase from cash-out.

2. **Prepay penalty has expired**: If the $8,400 prepay penalty is gone (Year 6+), the total cost drops to $6,400, making the cash-out refi more competitive.

3. **DSCR improvement qualifies for lower rate**: If DSCR has improved to 1.40+, the cash-out rate might be 6.50% instead of 7.00%, making the monthly payment on the full $320K just $2,023.65 — actually LOWER than the current $2,219.25. This is the rare win-win where cash-out refi simultaneously lowers the payment AND provides cash.

4. **Large cash-out amount needed**: If the borrower needs $100K instead of $40K, the second lien becomes impractical (exceeds Angel Oak's $350K max, and the CLTV may exceed limits). Cash-out refi is the only viable option.

### When Second Lien Wins

1. **Current first lien rate is below market**: The borrower has a 6.5% rate and market rates are 7.0%+. Keeping the low-rate first lien and adding a second lien preserves the favorable rate on 87.5% of the debt ($280K of $320K total).

2. **Prepay penalty is still active**: The $8,400 prepay penalty on the cash-out refi is a deal-killer for small cash-out amounts. For $40K cash, paying $8,400 in prepay alone means 21% of the cash goes to penalty.

3. **Small cash-out amount**: For amounts under $50-75K, the closing costs and prepay penalty of a cash-out refi are disproportionately high. A second lien's costs are proportional to the smaller loan amount.

4. **Flexibility needed**: A HELOC allows the borrower to draw only what's needed, when it's needed, and repay early without penalty. This is ideal for investors who need a revolving reserve.

5. **DSCR preservation**: A HELOC with interest-only payments preserves DSCR better than a cash-out refi with a fully amortizing payment on a larger balance.

**The platform must auto-calculate all three options and recommend the optimal path based on the borrower's specific situation.**

---

## 6. Rate Lock Timing for Refinance

### Best Days to Lock

Historical mortgage-backed securities (MBS) data reveals consistent intraweek patterns:

| Day | Lock Quality | Rationale |
|---|---|---|
| **Monday** | Moderate | Markets open after weekend; repricing from Friday's close. Lenders may be conservative. |
| **Tuesday** | **Best** | MBS markets have settled from weekend. Economic data typically released Tue-Thu, so Tuesday often has the least volatility. Studies show Tuesday locks average 3-8 bps better than other weekdays. |
| **Wednesday** | Moderate | Often the first major economic data day of the week (ADP employment, sometimes CPI). Can be good or bad depending on data. |
| **Thursday** | Variable | Weekly jobless claims released. If data is bond-friendly, rates improve by end of day. |
| **Friday** | Worst | MBS traders close positions before weekend (selling = rates up). Commitment desks are less aggressive. Avoid Friday locks. |

### Economic Calendar Impact

The single biggest driver of rate lock timing is the economic calendar. Key events that move MBS markets:

| Event | Frequency | Impact | Lock Recommendation |
|---|---|---|---|
| **CPI (Consumer Price Index)** | Monthly | High — directly influences Fed rate expectations | Do NOT lock the day before CPI. Wait for data release. |
| **FOMC Meeting / Rate Decision** | 8x/year | Very High — sets monetary policy | Do NOT lock before FOMC. Wait for statement and press conference. |
| **Employment Situation (NFP)** | Monthly | High — strong jobs = bad for rates | Avoid locking day before NFP. |
| **PCE Price Index** | Monthly | Moderate-High — Fed's preferred inflation measure | Be cautious around PCE release. |
| **GDP (Advance)** | Quarterly | Moderate — signals economic strength | Less impactful for short-term lock timing. |
| **Treasury Auctions** | Weekly/Monthly | Moderate — supply impacts yields | 10-year and 30-year auction days can be volatile. |

### Lock vs Float Decision Framework for Refinance

The lock vs. float decision for a refinance differs from a purchase because:
- **No closing deadline**: Purchases have a hard closing date. Refinances can be delayed weeks without consequence (beyond extended lock fees).
- **Current loan still in place**: The borrower isn't homeless if the refi closes late. The cost of waiting is the difference between current and new monthly payment.
- **Rate improvement threshold is known**: The borrower can calculate exactly how much rate improvement they need to justify the refi. If current rates are at the threshold, lock. If they're improving, float.

**Decision Matrix:**

| Scenario | Current Rate vs. Threshold | Recommendation |
|---|---|---|
| Rates at or below threshold | At/below | **Lock immediately** — no upside to waiting |
| Rates falling toward threshold | Above, declining | **Float with a trigger** — set a lock trigger at your threshold rate |
| Rates volatile around threshold | Near, fluctuating | **Lock on a down day** — Tuesday or Wednesday after good data |
| Rates rising above threshold | Above, rising | **Wait** — don't lock a rate that doesn't make the refi worthwhile |

**Innovation: Rate Lock Optimizer**
1. Integrate with MBS pricing data (from the Dynamic MBS Pricing module)
2. Calculate the borrower's "threshold rate" — the rate at which the refi breaks even in their desired timeframe
3. Monitor rates daily and alert when the threshold is breached
4. Rate the current lock environment on a Green/Yellow/Red scale:
   - **Green**: Rates below threshold, no major economic events in next 5 days → Lock now
   - **Yellow**: Rates near threshold, economic events upcoming → Consider locking
   - **Red**: Rates above threshold or major volatility expected → Float and wait

---

## 7. Prepay Penalty Optimization

### Full Timeline Visualization

DSCR loans typically carry one of three prepay penalty structures. Understanding the step-down schedule is critical for refinance timing.

#### Structure 1: 5/4/3/2/1 (Most Common)

```
Year:     0    1    2    3    4    5    6+
          |    |    |    |    |    |    |
Penalty:  5%   4%   3%   2%   1%   0%   0%
          ████████████████████████████
          |         |         |         |
     Yr1: 5%       Yr3: 3%   Yr5: 1%  Yr6+: FREE
     ($15K on $300K) ($9K)    ($3K)    ($0)
```

| Year | Prepay % | On $300K Loan | Monthly Savings to Justify (at 12-mo BE) |
|---|---|---|---|
| 1 | 5% | $15,000 | $1,250/month |
| 2 | 4% | $12,000 | $1,000/month |
| 3 | 3% | $9,000 | $750/month |
| 4 | 2% | $6,000 | $500/month |
| 5 | 1% | $3,000 | $250/month |
| 6+ | 0% | $0 | $0 (only closing costs) |

**Key Step-Down Moments:**
- **Year 1 → Year 2**: Penalty drops from $15,000 to $12,000. Savings of $3,000 for waiting. If monthly savings are $200/month, it takes 15 months of waiting to recoup the $3,000 savings from waiting. But you're also paying $200/month more during those 3 months you wait. Net: wait only if the break-even at 4% is materially better.
- **Year 4 → Year 5**: Penalty drops from $6,000 to $3,000. Savings of $3,000 for waiting. At $200/month savings, this is a 15-month payback for a 12-month wait. **Often worth waiting.**
- **Year 5 → Year 6**: Penalty drops from $3,000 to $0. Savings of $3,000 for waiting. At $200/month savings, this is a 15-month payback for a 12-month wait. **Almost always worth waiting.**

#### Structure 2: 3/2/1 (Faster Step-Down)

```
Year:     0    1    2    3    4+
          |    |    |    |    |
Penalty:  3%   2%   1%   0%   0%
          ████████████████████
          |         |         |
     Yr1: 3%       Yr3: 1%  Yr4+: FREE
     ($9K on $300K) ($3K)    ($0)
```

| Year | Prepay % | On $300K Loan | Monthly Savings to Justify (at 12-mo BE) |
|---|---|---|---|
| 1 | 3% | $9,000 | $750/month |
| 2 | 2% | $6,000 | $500/month |
| 3 | 1% | $3,000 | $250/month |
| 4+ | 0% | $0 | $0 (only closing costs) |

**The 3/2/1 is significantly more refinancing-friendly than 5/4/3/2/1.** At Year 3, the penalty is already $3,000 vs. $9,000 on 5/4/3/2/1. The platform should factor prepay structure into lender recommendations — a 3/2/1 lender may be preferable even with a slightly higher origination rate if the borrower expects to refinance within 3-5 years.

#### Structure 3: Flat 5% (Worst for Early Refi)

```
Year:     0    1    2    3    4    5    6+
          |    |    |    |    |    |    |
Penalty:  5%   5%   5%   5%   5%   5%   0%
          ████████████████████████████████
          |                             |
     Yrs1-5: 5% ($15K on $300K)       Yr6+: FREE
```

| Year | Prepay % | On $300K Loan | Monthly Savings to Justify (at 12-mo BE) |
|---|---|---|---|
| 1-5 | 5% | $15,000 | $1,250/month |
| 6+ | 0% | $0 | $0 |

**A flat 5% prepay is a refinancing trap.** For 5 full years, the penalty is $15,000 on a $300K loan. This effectively prevents any refinancing during the prepay period unless rates drop by 150+ bps. The platform should flag flat 5% prepay structures as "high refinancing risk" at origination.

### Decision Matrix: Refi Now with Penalty vs. Wait for Step-Down

The platform should present a clear decision matrix that accounts for:
- Current prepay penalty amount
- Monthly savings from refinancing
- Months until next step-down
- Savings from waiting for step-down
- Cost of waiting (paying higher rate during wait period)

**Formula: Wait Decision**

```
Cost of Waiting = Monthly Savings × Months Until Step-Down
Benefit of Waiting = Current Penalty - Next Step-Down Penalty
Net Benefit of Waiting = Benefit of Waiting - Cost of Waiting

If Net Benefit > 0: WAIT for step-down
If Net Benefit < 0: REFINANCE NOW (don't wait)
```

**Example:**
- Current penalty (Year 2, 5/4/3/2/1): 4% = $12,000
- Next step-down (Year 3): 3% = $9,000
- Months until step-down: 8
- Monthly savings from refi: $200/month
- Cost of waiting: $200 × 8 = $1,600
- Benefit of waiting: $12,000 - $9,000 = $3,000
- Net benefit of waiting: $3,000 - $1,600 = **+$1,400 → WAIT**

**Example 2:**
- Current penalty (Year 1, 5/4/3/2/1): 5% = $15,000
- Next step-down (Year 2): 4% = $12,000
- Months until step-down: 10
- Monthly savings from refi: $350/month
- Cost of waiting: $350 × 10 = $3,500
- Benefit of waiting: $15,000 - $12,000 = $3,000
- Net benefit of waiting: $3,000 - $3,500 = **-$500 → REFINANCE NOW**

### Prepay Penalty as Origination Decision Factor

The platform should also help borrowers at origination choose the right prepay structure:

| Prepay Structure | Origination Rate Benefit | Refi Flexibility | Best For |
|---|---|---|---|
| **5/4/3/2/1** | Baseline (most common) | Moderate — step-down provides increasing flexibility | Long-term holders (7+ years) |
| **3/2/1** | +25-50 bps higher rate | Good — penalty clears by Year 4 | Medium-term holders (4-6 years) |
| **Flat 5%** | +25-50 bps lower rate | Terrible — no step-down for 5 years | Very long-term holders (10+ years) who want lowest rate |
| **No prepay (yield maintenance)** | +50-100 bps higher rate | Excellent — can refinance anytime | Short-term holders or rate speculators |

**The origination recommendation should factor in the borrower's expected hold period and rate outlook.**

---

## 8. Tax Implications of Refinancing

### Cash-Out Proceeds Are Not Taxable

This is the most important tax concept for DSCR investors considering a cash-out refinance: **debt proceeds are not income**. When you refinance and take $50,000 cash out, that $50,000 is not reported on your tax return. There is no capital gains tax, no ordinary income tax, and no depreciation recapture triggered by the refinance itself.

This creates a powerful tax arbitrage: investors can access equity without selling, avoiding the 15-25% capital gains tax and potential depreciation recapture (25%) that would be triggered by a sale. For a property with $100,000 in unrealized gains and $30,000 in accumulated depreciation, the tax savings from cash-out refi vs. sale could be $20,000-$35,000.

### Interest Deductibility on Schedule E

All interest paid on a DSCR loan used for rental property is deductible against rental income on Schedule E. This includes:
- Interest on the original loan amount
- Interest on cash-out proceeds (as long as the proceeds are used for the rental property or another investment property)
- Interest on a second lien or HELOC (same rule — must be used for investment purposes)

**Important nuance**: If cash-out proceeds are used for personal purposes (home renovation on primary residence, personal expenses), the interest on that portion is NOT deductible on Schedule E. It may be deductible as home equity interest (subject to TCJA limitations) or not deductible at all. The platform should track the use of cash-out proceeds and allocate interest deductibility accordingly.

### Points and Origination Fee Amortization

Points and origination fees paid on a refinance must be amortized (deducted ratably) over the life of the new loan. They are NOT deductible all at once in the year paid.

**Example**: $300,000 loan with 1 point ($3,000 origination fee) on a 30-year DSCR refi.
- Annual deduction: $3,000 / 30 = $100/year
- Monthly deduction: $8.33/month

**If the previous loan had unamortized points**, those remaining unamortized points become fully deductible in the year of refinance. This is a "catch-up" deduction that can offset the refinance year's tax burden.

**Example**: Original loan had $2,400 in unamortized points at time of refinance. That $2,400 is fully deductible in the refinance year, plus the new loan's points begin their 30-year amortization.

### 1031 Exchange + DSCR Refi Combo Strategy

The 1031 exchange and DSCR refinance can be combined for powerful tax optimization, but the sequence matters enormously:

**Correct Sequence: 1031 Exchange → Bridge/Delayed Financing → DSCR Refi**

1. **Sell relinquished property** via 1031 exchange (defer capital gains)
2. **Identify and acquire replacement property** using exchange proceeds + bridge/hard money
3. **Season the property** for 6+ months (required by most DSCR lenders for cash-out)
4. **Refinance the replacement property** with a DSCR cash-out refi to extract equity

This sequence is valid because the refinance occurs after the exchange is complete and the property is seasoned. The IRS views the refinance as a separate transaction from the exchange.

**Incorrect Sequence (Potential Audit Risk):**
- Refinancing the relinquished property immediately before the 1031 exchange to extract equity, then using that equity to acquire the replacement property. The IRS may argue this is a "clawback" that partially invalidates the exchange.

**The platform should include a 1031-aware refi timeline that models the correct sequence and warns against problematic structures.**

### Depreciation After Refinance

Refinancing does NOT restart the depreciation clock. The property's adjusted basis continues from where it was before the refinance. However, if the borrower takes cash out and uses it for property improvements, those improvements are depreciable (over 27.5 years for residential rental property).

**Example**: Cash-out refi produces $50,000, of which $30,000 is used for a new roof (improvement, depreciable over 27.5 years) and $20,000 is used for next property's down payment (not depreciable against this property). Annual depreciation increase: $30,000 / 27.5 = $1,091/year additional deduction.

### After-Tax Refi Calculator

The platform should include an after-tax refinance calculator that shows:
1. **Pre-tax monthly savings** (simple payment comparison)
2. **Tax impact of refi** (change in interest deduction, points amortization, catch-up deduction)
3. **After-tax monthly savings** (pre-tax savings minus tax impact)
4. **After-tax break-even** (total refi cost divided by after-tax monthly savings)

For investors in the 32% marginal bracket, after-tax savings are approximately 68% of pre-tax savings (since interest deduction loss offsets some of the payment reduction). This can extend the break-even period by 30-50%.

---

## 9. Portfolio Refinance Strategy

### Staggered vs. Simultaneous Refi

Investors with multiple DSCR loans face a strategic question: refinance all properties at once (simultaneous) or spread them out over time (staggered)?

**Simultaneous Refi — Pros and Cons:**

| Pro | Con |
|---|---|
| Lock in favorable rates for all properties at once | Multiple prepay penalties in same year (cash flow hit) |
| One round of closing costs (possible volume discount?) | Maximum reserve requirement hit simultaneously |
| Simplified process (one set of applications) | Lender may limit number of simultaneous loans |
| All properties benefit from rate reduction immediately | If rates continue falling, you've locked too early on all |

**Staggered Refi — Pros and Cons:**

| Pro | Con |
|---|---|
| Spread prepay penalties across tax years | Some properties pay higher rate longer |
| Use cash-out from first refi to fund reserves for next | Rate environment may change between refis |
| Test one refi before committing to portfolio-wide strategy | Administrative burden of multiple refi processes |
| Can adjust strategy based on rate movement | Lender relationships may be harder to leverage |

### Bulk Refinance Discounts

Currently, no DSCR lender offers formal bulk refinance discounts. However, several strategies can achieve similar economics:

1. **Single-lender volume**: Refinancing 3-5 properties with the same lender in a 60-day window may qualify for a 10-25 bps rate reduction or fee waiver. This is not advertised but is negotiable with regional sales managers.

2. **Correspondent channel**: For investors with 10+ properties, working through a correspondent lender who can aggregate the volume may produce better pricing than retail channels.

3. **Servicing release premiums**: Some lenders offer better pricing when they retain servicing. For a portfolio refi, the servicing release premium can be 25-50 bps, which may be partially passed to the borrower.

**The platform should aggregate the borrower's portfolio refi volume and present it to lenders as a package, extracting volume pricing that individual borrowers cannot achieve alone.**

### Using Cash-Out from One Property to Improve Reserves for Another

This is one of the most powerful portfolio optimization strategies, and no tool currently models it:

**Example Portfolio:**

| Property | Loan Balance | Rate | DSCR | Prepay Status | Cash-Out Available |
|---|---|---|---|---|---|
| 123 Main St | $280,000 | 7.50% | 1.28 | Year 6 (no prepay) | $40,000 |
| 456 Oak Ave | $220,000 | 7.25% | 1.12 | Year 3 (3% prepay) | $0 (prepay too high) |
| 789 Elm Dr | $350,000 | 8.00% | 1.05 | Year 5 (1% prepay) | $20,000 |

**Strategy:**
1. **Refinance 123 Main St first** (no prepay, best DSCR). Cash out $40,000.
2. **Hold $20,000 as additional reserves** for the 789 Elm Dr refinance application. This improves the DSCR calculation (reserves reduce perceived risk) and may qualify 789 Elm Dr for a better rate tier.
3. **Refinance 789 Elm Dr** (1% prepay = $3,500, acceptable). Use the improved DSCR tier to get a rate of 7.00% instead of 7.50%. Cash out $20,000.
4. **Wait for 456 Oak Ave's prepay to step down** from 3% to 2% (Year 4). Then refinance.
5. **Use remaining cash-out from properties 1 and 3** to fund reserves for property 2's refinance.

**The platform must model cash flows across the portfolio, showing how equity extraction from one property enables better terms on another.**

### Optimal Refi Sequence Algorithm

The platform should implement a refinance sequencing algorithm that optimizes across the entire portfolio:

**Algorithm Inputs:**
- Current loan terms for each property (balance, rate, PITIA, prepay schedule)
- Current DSCR for each property
- Available cash-out at each property
- Reserve requirements for each potential new loan
- Rate environment and lender pricing
- Borrower's target total monthly savings

**Algorithm Outputs:**
1. **Refi priority ranking**: Which property to refinance first, second, third
2. **Optimal timing for each**: Based on prepay step-down schedule and seasoning
3. **Lender recommendation for each**: Based on DSCR tier, cash-out needs, and seasoning
4. **Cash flow projection**: Month-by-month portfolio cash flow impact
5. **Total portfolio savings**: Net present value of all refinancings

**Priority Scoring Formula:**

```
Priority Score = (Monthly Savings × Rate Environment Multiplier) /
                 (Prepay Penalty + Closing Costs + Months Until Optimal Window)

Rate Environment Multiplier:
  - Rates falling: 0.8 (don't rush — may get better)
  - Rates stable:  1.0 (neutral)
  - Rates rising:  1.3 (act sooner rather than later)
```

Properties with the highest Priority Score should be refinanced first. The algorithm recomputes scores after each refinance, since portfolio cash flow changes may affect subsequent decisions.

---

## 10. Implementation Priority

### Feature Priority Table

| Feature | Complexity | Impact | User Demand | Priority | Estimated Dev Time | Dependencies |
|---|---|---|---|---|---|---|
| **Break-even calculator with prepay penalty** | Low | High | Very High | **P0** | 2 weeks | None |
| **Seasoning countdown tracker** | Low | Medium | High | **P0** | 1.5 weeks | Lender seasoning data |
| **Prepay penalty timeline visualization** | Low | High | High | **P0** | 1 week | None |
| **DSCR tier improvement alerts** | Medium | High | Very High | **P1** | 3 weeks | Rent data feed, DSCR tier pricing |
| **Cash-out vs. 2nd lien comparison** | Medium | High | High | **P1** | 3 weeks | 2nd lien product data |
| **Rate lock timing advisor** | Medium | Medium | Medium | **P2** | 4 weeks | MBS pricing data, economic calendar |
| **After-tax refi calculator** | Medium | Medium | Medium | **P2** | 2 weeks | Tax logic, Schedule E modeling |
| **Portfolio refi optimizer** | High | Very High | Very High | **P3** | 8 weeks | All P0-P2 features, portfolio data model |
| **1031 + DSCR refi combo tool** | Medium | Medium | Low | **P3** | 3 weeks | 1031 exchange data, legal review |
| **Bulk refi discount negotiation** | High | Medium | Low | **P4** | 6 weeks | Lender API integrations, volume data |

### Phase 1: Foundation (P0 — Weeks 1-4)
- Break-even calculator with prepay penalty integration
- Seasoning countdown tracker with all lender requirements
- Prepay penalty timeline visualization

These are table-stakes features that require no external data feeds and deliver immediate value. A borrower can manually input their loan terms and get a refinance timing recommendation.

### Phase 2: Intelligence (P1 — Weeks 5-10)
- DSCR tier improvement alerts with rent monitoring
- Cash-out vs. 2nd lien comparison tool

These features require rent data and 2nd lien product data but are still self-contained. They transform the tool from a calculator into an advisory platform.

### Phase 3: Optimization (P2 — Weeks 11-16)
- Rate lock timing advisor with MBS integration
- After-tax refi calculator with Schedule E modeling

These features add sophistication and attract tax-aware and rate-sensitive investors. They require external data feeds (MBS, economic calendar).

### Phase 4: Portfolio (P3 — Weeks 17-24)
- Portfolio refinance optimizer with sequencing algorithm
- 1031 + DSCR refi combo tool

The portfolio optimizer is the crown jewel. It requires all previous features to be operational and a robust portfolio data model. Once complete, it becomes the primary engagement driver for multi-property investors.

### Phase 5: Platform (P4 — Weeks 25-30)
- Bulk refi discount negotiation engine
- Lender API integrations for real-time pricing

This phase transforms the platform from advisory to transactional — not just recommending refinances but facilitating them at scale.

### Success Metrics

| Metric | Target (Year 1) | Measurement Method |
|---|---|---|
| Active loan monitoring | 10,000+ loans tracked | Platform analytics |
| Refi alerts triggered | 2,000+ per month | Alert delivery system |
| Refi applications initiated | 500+ per month | Conversion tracking |
| Revenue per refi referral | $500-1,500 per closed loan | Lender partnership agreements |
| User retention (loan holders) | 85%+ annual retention | Cohort analysis |
| Break-even accuracy | Within 1 month of actual | Post-closing validation |

### Competitive Moat

The Refinance Timing Optimizer creates a defensible competitive moat through:

1. **Data network effects**: Each borrower who enters their loan terms and receives alerts generates data that improves the platform's refinance timing recommendations for all users (anonymized, aggregate patterns).
2. **Switching costs**: Once a borrower has 5+ loans monitored on the platform, migrating to a competitor requires re-entering all loan terms, losing alert history, and abandoning the portfolio optimization.
3. **Lender relationship moat**: As the platform generates refinance volume, lenders offer better pricing to platform users, creating a virtuous cycle.
4. **Timing intelligence**: The break-even formulas, prepay optimization algorithms, and seasoning window tracking represent proprietary analytical capabilities that cannot be replicated by simple calculators.

---

## Appendix: Key Formulas Reference

```
DSCR = Gross Rent / PITIA

PITIA = Principal + Interest + Taxes + Insurance + Assessments (HOA)

Monthly P&I = L × [r(1+r)^n] / [(1+r)^n - 1]
  where L = loan amount, r = monthly rate, n = total months

Break-Even Months = (Closing Costs + Prepay Penalty) / Monthly Savings

Blended Rate = (L1 × R1 + L2 × R2) / (L1 + L2)
  where L1/L2 = loan amounts, R1/R2 = annual rates

DSCR Tier Rate Adjustment:
  < 1.10: +50 to +100 bps
  1.10-1.24: baseline
  1.25-1.39: -37.5 to -50 bps
  1.40+: -50 to -75 bps

Wait Decision:
  Net Benefit = (Current Penalty - Next Penalty) - (Monthly Savings × Months to Step-Down)
  If > 0: Wait. If < 0: Refi now.

Priority Score = (Monthly Savings × Rate Env Multiplier) /
                 (Prepay + Closing Costs + Months to Optimal Window)
```

---

*End of document. This specification defines the full Refinance Timing Optimizer feature set for the DSCR Intelligence Platform. Implementation should follow the phased priority model outlined in Section 10, with P0 features shipping within 4 weeks and the complete portfolio optimizer available within 30 weeks.*
