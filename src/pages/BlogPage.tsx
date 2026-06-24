import React, { useState } from "react";
import { swatch } from "../theme";

import { PageShell, AnimatedCard, AnimatedButton, PremiumInput, sectionTitle } from "./PageShell";

const MINT = swatch.rainforest;
const CREAM = swatch.midnight;
const YELLOW = swatch.lemon;

const POSTS = [
  {
    slug: "obbba-2025-real-estate-tax-changes",
    date: "June 23, 2026", tag: "Tax",
    title: "OBBBA 2025: Three tax changes every real estate investor needs to know",
    summary: "QBI deduction bumped to 23%, §179 locked at $2,560,000, and 100% bonus depreciation made permanent. Three numbers that change how DSCR deals pencil after-tax.",
    body: [
      { p: "The One Big Beautiful Bill Act (P.L. 119-21, signed July 4, 2025) rewrote several key tax provisions that directly affect real estate investors. Three changes stand out for anyone buying, financing, or modeling DSCR deals in 2026." },
      { h: "QBI deduction goes from 20% to 23%" },
      { p: "Under TCJA, qualifying business income from a pass-through entity — including rental income structured through an LLC — received a 20% deduction under §199A. OBBBA §70411 raised that to 23% for tax years beginning after December 31, 2025. It also made the deduction permanent and inflation-indexed under §199A(i), eliminating the TCJA sunset that was scheduled to expire at year-end 2025." },
      { p: "On a real deal: if you're netting $60,000 in rental income through an LLC and you qualify under the income thresholds, the QBI deduction went from $12,000 to $13,800. Stacked with depreciation on a new acquisition, the after-tax cash-on-cash number shifts meaningfully. Run your file before you quote a client an after-tax IRR — the number changed in 2026." },
      { h: "§179 expensing: exactly $2,560,000 in 2026" },
      { p: "IRS Rev. Proc. 2025-32 §4.24 sets the §179 expensing limit at exactly $2,560,000 for 2026, with a phaseout beginning at $4,090,000 and an SUV cap of $32,000. §179 lets you expense depreciable personal property — fixtures, appliances, HVAC, certain building components — in the year of acquisition rather than depreciating over 27.5 years. For a large acquisition or value-add play, §179 is the first lever to pull before bonus depreciation." },
      { h: "100% bonus depreciation is permanent" },
      { p: "TCJA's 100% bonus depreciation was phasing down — 80% in 2023, 60% in 2024, 40% in 2025. OBBBA reversed the phasedown and restored 100% permanently. Combined with a cost segregation study — which reclassifies building components from 27.5-year residential property into 5-, 7-, and 15-year personal or land-improvement property — this means a DSCR investor can accelerate a substantial portion of the building's cost basis into year-one deductions." },
      { h: "What it means on a DSCR acquisition" },
      { list: [
        "QBI at 23%: model the higher deduction in your after-tax IRR. The difference between 20% and 23% is not enormous on a single deal, but it's persistent across a portfolio.",
        "Use §179 before bonus depreciation: §179 is capped at your business income and doesn't create a net operating loss by itself. Apply it first on tangible personal property to get the guaranteed deduction, then let bonus depreciation handle the rest.",
        "Bonus dep + cost segregation: a cost segregation study on a $500K acquisition might reclassify $75–$100K into accelerated categories. At 100% bonus dep, that's a $75–$100K year-one deduction that directly offsets rental income — if you qualify under the passive activity loss rules.",
      ]},
      { p: "These provisions interact with §469 passive activity loss rules and the 3.8% net investment income tax. Not every investor can use them all in the acquisition year. Real estate professionals, short-term rental operators with material participation, and high-income investors who hit the PAL exception each face a different outcome. Confirm with a CPA before booking the benefit into your model." },
      { quote: "The tax code stopped shrinking. 23% QBI, $2.56M §179, 100% bonus dep — all permanent. The after-tax math on DSCR acquisitions changed in 2026." },
    ],
  },
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026", tag: "Lending",
    title: "MN HF 3437 enacted: DSCR loans now business-purpose in Minnesota",
    summary: "After a long fight, business-purpose DSCR loans are legal in MN as of August 1, 2026. Consumer loans still prohibited under §58.137.",
    body: [
      { p: "Minnesota spent years as one of the hardest states to close a DSCR loan in. HF 3437, signed April 23, 2026 and effective August 1, 2026, finally draws a clean line: business-purpose DSCR loans are explicitly allowed; consumer-purpose loans remain prohibited under Minn. Stat. §58.137." },
      { h: "What changed" },
      { list: [
        "Business-purpose investment-property loans can now carry prepayment penalties in MN, ending the entity-only workaround most lenders relied on.",
        "Consumer-purpose loans are still banned from PPPs — the business-purpose affidavit on every file matters more than ever.",
        "Effective date is August 1, 2026. Deals locking before then should still be structured under the old entity rules.",
      ]},
      { h: "What to do on a MN file" },
      { p: "Document business purpose tightly: LLC vesting, a signed business-purpose certification, and a property that is clearly non-owner-occupied. Get that right and MN is now a normal-rate state instead of a structuring headache." },
      { quote: "The affidavit is the deal. In MN it always was — now it's in statute." },
    ],
  },
  {
    slug: "qoz-qrof-permanent-obbba",
    date: "June 21, 2026", tag: "Tax",
    title: "QOZ and QROF: what the OBBBA did to Opportunity Zone investing",
    summary: "OBBBA §70431 made Opportunity Zones permanent and created a QROF rural tier with a 30% basis step-up. The December 31, 2026 clock still matters for pre-2027 investors.",
    body: [
      { p: "Qualified Opportunity Zones were set to expire under TCJA. OBBBA §70431 (Public Law 119-21, signed July 4, 2025) made them permanent — with restructured incentives and a new rural tier. Here's what changed and what didn't." },
      { h: "What OBBBA §70431 changed" },
      { list: [
        "QOZ designation is now permanent. The decennial redesignation cycle begins July 1, 2026, with tighter criteria: 70% AMI vs the old 80% threshold, and no contiguous tract workaround.",
        "Post-2026 investments get a simplified structure: 5-year deferral from investment date + 10% basis step-up at year 5. The 7-year/15% tier is gone.",
        "QROF (Qualified Rural Opportunity Fund) is a new rural tier: rural QOZs offer a 30% step-up at year 5 instead of 10% — a substantial incentive differential for rural markets.",
        "30-year FMV basis freeze: if you hold an OZ investment for 30 years, basis adjusts to fair market value, eliminating the tax liability on very long holds.",
      ]},
      { h: "The December 31, 2026 cliff for pre-2027 investors" },
      { p: "If you invested before OBBBA — pre-2027 vintage — the old rules still govern your deferral. The deferred gain is included in income on the earlier of (a) a qualifying inclusion event, or (b) December 31, 2026. That cliff is now less than six months away. Pre-2027 investors need to be in a conversation with their CPA now about year-end planning." },
      { h: "QROF: the rural arbitrage" },
      { p: "A 30% step-up vs 10% is a meaningful incentive differential. Rural QOZ deals with SFR or small multifamily cash flow are a natural fit for DSCR financing — the property income-qualifies on DSCR while the equity structure captures the OZ tax benefit. Greenstreet's programs are available in rural markets; the limiting factor is usually the appraisal comparables pool, not program availability." },
      { h: "The 1031 vs QOZ comparison" },
      { p: "For high-bracket investors: depending on your gain type and holding period, QROF's 30% step-up and elimination of tax on future appreciation can outperform a 1031 exchange. The OBBBA made the QOZ math permanent and more predictable, which makes the comparison worth running on every large exit. This requires a CPA-level analysis — the outcome is fact-specific." },
      { quote: "Rural Opportunity Zones now carry a 30% step-up. For the right DSCR deal in a rural market, the tax structure is as important as the rate." },
    ],
  },
  {
    slug: "section-1071-final-rule-dscr",
    date: "June 19, 2026", tag: "Compliance",
    title: "Section 1071 is live: what DSCR lenders actually need to do",
    summary: "The CFPB's small-business lending data collection rule took effect June 30, 2026. The 1,000-loan threshold exempts most DSCR lenders from direct compliance — but indirect hooks through bank warehouse facilities are real.",
    body: [
      { p: "Section 1071 of Dodd-Frank — the CFPB's small-business lending data collection rule — became effective June 30, 2026, with a compliance start date of January 1, 2028. Published in the Federal Register on May 1, 2026 (91 FR), the final rule requires covered lenders to collect and report demographic and pricing data on small-business loan applications." },
      { h: "The threshold that matters: 1,000 originations" },
      { p: "The CFPB's final rule raised the loan-volume threshold substantially from early proposals. A lender is only subject to Section 1071 if it originated at least 1,000 covered small-business loans in each of the two preceding calendar years. That threshold covers approximately 92-93% of small-business loan volume by dollar amount — but exempts the vast majority of lenders by institution count. Most non-bank DSCR lenders fall well below 1,000 originations annually." },
      { h: "What else narrowed the rule" },
      { list: [
        "Borrower size cap: the rule applies to businesses with ≤$1M gross annual revenue (raised from the proposed ≤$5M). Most DSCR borrowers are individual investors or small LLCs, not mid-market businesses.",
        "Data points collected: 15 (reduced from 20 originally proposed). LGBTQI+ data point removed. Application method data point removed.",
        "Small-dollar exclusion: loans of $1,000 or less are excluded from data collection.",
        "Filing: annual (not quarterly).",
      ]},
      { h: "Indirect exposure through warehouse facilities" },
      { p: "Here's where it gets nuanced: lenders that source capital through bank warehouse lines may find that the bank counterparty imposes Section 1071 data collection requirements on the pipeline — even if the originating DSCR lender is under the threshold. Banks above the threshold that use warehouse facilities to fund non-bank DSCR production may require the originator to pass through compliant data. Verify with your warehouse lender." },
      { h: "Compliance calendar" },
      { list: [
        "June 30, 2026: rule effective.",
        "January 1, 2028: compliance begins for in-scope lenders.",
        "Annual monitoring: the threshold looks at the two preceding calendar years — track your trailing origination count starting now.",
        "Re-verify annually in Q1 using the prior two calendar years' volume.",
      ]},
      { quote: "1071 data collection doesn't start until 2028. If you're under 1,000 originations, the clock isn't running yet — but you should know exactly when it starts." },
    ],
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026", tag: "Rates",
    title: "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    summary: "The '740 FICO, ≤75% LTV' tier is real on Greenstreet's Premier program — our lowest rate sheet. Here's exactly what it takes to hit it.",
    body: [
      { p: "Everyone advertises a teaser rate. We broke down Greenstreet's June 2026 DSCR 1-4 rate tiers — from the 740-FICO best pricing down to sub-1.0 DSCR — to show who actually hits the headline number, and under what conditions." },
      { h: "The best-tier reality" },
      { list: [
        "The sub-6.5% tier is real, but only at 740+ FICO, ≤75% LTV, DSCR ≥ 1.0, SFR, with a full prepay penalty.",
        "Drop to 80% LTV and most sheets add 0.25–0.40%.",
        "Waive the prepay penalty and you give back 0.50–0.80% — often more than the rate you were chasing.",
      ]},
      { h: "Where the typical broker lands" },
      { p: "The honest center of the market in June 2026 is 6.5–7.5% for a clean-but-not-perfect file. Below that you're in special territory; above 7.75% you're pricing a thin file. Set borrower expectations there, not at the teaser." },
      { quote: "A 6.125% you can't qualify for isn't a rate. It's bait." },
    ],
  },
  {
    slug: "fema-rr2-coastal-dscr",
    date: "June 17, 2026", tag: "Underwriting",
    title: "FEMA Risk Rating 2.0: why coastal DSCR deals are failing at the insurance step",
    summary: "FEMA's shift to property-specific flood pricing caused new NFIP policy applications to decline 11-39% by premium tier. For DSCR deals in coastal markets, flood insurance is now the underwriting variable that determines whether a deal closes.",
    body: [
      { p: "FEMA's Risk Rating 2.0 overhauled how National Flood Insurance Program policies are priced. Implemented fully on April 1, 2023, RR 2.0 replaced the decades-old zone-based pricing system with property-specific risk analysis — factoring in distance to water, structure elevation, building type, replacement cost value, and historical flood frequency. The result: some properties became cheaper to insure, and some became dramatically more expensive." },
      { h: "The empirical data on what happened" },
      { p: "Research published in the Journal of Coastal Risk Research and confirmed by the Environmental Defense Fund found that new NFIP policy applications declined 11-39% depending on the magnitude of the premium increase. For existing policies at renewal, the decline rate was 5-13%. FEMA's data shows 77% of policyholders saw increases averaging $88 per year — but the distribution is wide, and high-risk properties saw multiples of that figure." },
      { h: "Where it kills DSCR deals" },
      { list: [
        "Coastal Florida Special Flood Hazard Areas (SFHA): properties pricing flood insurance at $300–$600/month push PITIA above qualifying rent. The DSCR fails not from weak rent but from elevated carrying costs that a borrower didn't model before contract.",
        "The kill threshold: flood insurance above 8% of gross monthly rent is a deal-break signal in institutional underwriting frameworks. At $3,000/month gross rent, that's $240/month. Many coastal properties now exceed this.",
        "Private flood options: private flood insurance is accepted by most DSCR lenders and sometimes prices below NFIP in lower-hazard zones. Get quotes from both before modeling PITIA.",
      ]},
      { h: "What to check before underwriting a coastal deal" },
      { p: "Run the FEMA FIRM panel for the property before you quote. Use the FEMA Flood Map Service Center to confirm the flood zone designation and whether the property falls in an SFHA. Then get actual flood insurance quotes — both NFIP and private — before you build your PITIA model. A deal that looks like 1.20x DSCR can fall to 0.95x after adding a $450/month flood premium." },
      { p: "FEMA remaps flood zones on a rolling basis. A property that was in Zone X (minimal flood risk) three years ago may now be in Zone AE. Always pull the current FIRM panel, not the one on the seller's disclosure." },
      { quote: "Flood insurance is no longer a closing-day line item. In coastal markets, it's often the underwriting variable that kills the deal — or the one that saves it if you price it right." },
    ],
  },
  {
    slug: "dscr-pool-data-2026",
    date: "June 16, 2026", tag: "Underwriting",
    title: "What 2026 DSCR securitization pools actually show about qualifying borrowers",
    summary: "Published S&P and KBRA presale reports on 2025-2026 non-QM securitizations show a pool center of ~746 FICO, ~72% LTV, ~1.19x DSCR. The typical DSCR borrower in institutional pools is not who most brokers assume.",
    body: [
      { p: "Every DSCR loan eventually lives in a pool — either on a lender's balance sheet or inside a rated non-QM securitization. The presale reports that S&P and KBRA publish before each deal contain the best publicly available data on what qualifying DSCR borrowers look like in aggregate. The 2025-2026 vintage tells a specific story." },
      { h: "The pool center: ~746 FICO, ~72% LTV, ~1.19x DSCR" },
      { p: "Based on published 2025-2026 non-QM securitization presale reports, the weighted-average profile for DSCR loans in institutional pools runs approximately: WA FICO around 746, WA CLTV around 72%, and WA DSCR around 1.19x for the DSCR-specific loan subset. About 42% of pool balance in a typical non-QM deal is DSCR product. Fixed-rate structures dominate — roughly 99% of DSCR loans in recent pools — with interest-only accounting for about 12% of the DSCR tranche." },
      { h: "The sub-1.0 DSCR tail: ~4.2% of pools" },
      { p: "Sub-1.0 DSCR loans exist in securitized form — about 4.2% of pool balance in recent non-QM securitizations based on S&P presale data. They're not disqualifying at the pool level because the other 95.8% provides coverage. But from a borrower perspective, sub-1.0 DSCR means the property does not cover its debt service from rent alone. The investor is making up the difference from other income. These deals close, but they carry negative-carry risk that most brokers don't model." },
      { h: "How rating agencies stress DSCR pools" },
      { p: "S&P applies a DSCR adjustment factor of 1.50x–2.50x when evaluating pools for rating purposes. A 1.20x DSCR at origination looks like 0.48x–0.80x under S&P's stress model. The institutional stress test is designed to survive a scenario where rents fall, vacancies spike, and expenses rise simultaneously. The further above 1.20x the actual DSCR is at origination, the more cushion the deal has against that scenario." },
      { h: "What the pool data means for pricing and eligibility" },
      { list: [
        "The pool center is not the approval floor — it's the average of qualifying deals. Your file at 680 FICO and 79% LTV qualifies, but it sits at the distribution tail, not the center. Pricing reflects that.",
        "Rate premiums are cumulative: sub-700 FICO + high LTV + low DSCR each add to the spread. Two or three risk factors together push a deal out of the competitive pricing tier.",
        "IO concentration is constrained: rating agencies apply additional stress to IO-heavy pools, which is why lenders limit IO concentration. IO deals are available, but competition for IO slots within pools affects pricing.",
      ]},
      { quote: "The institutional pool center is ~746 FICO, ~72% LTV, ~1.19x DSCR. Every step below that center costs basis points. Quantify it before you quote." },
    ],
  },
  {
    slug: "track-2-dscr",
    date: "June 14, 2026", tag: "Underwriting",
    title: "Why your DSCR lender cares about Track 2 (and you should too)",
    summary: "Track 1 is what gets you qualified. Track 2 is what keeps you from bleeding cash when vacancy hits. Most brokers only quote Track 1.",
    body: [
      { p: "There are two DSCR calculations, and brokers who only know one keep getting surprised. Track 1 is gross rent ÷ PITIA — the number that qualifies the loan. Track 2 is NOI ÷ debt service — the number that tells you whether the deal actually cash-flows." },
      { h: "The two tracks" },
      { list: [
        "Track 1 (qualifying): gross monthly rent ÷ PITIA. Ignores vacancy, management, and CapEx. This is what the lender uses to approve.",
        "Track 2 (reality): NOI ÷ debt service, where NOI subtracts vacancy, management, and CapEx from effective rent. This is what the investor actually lives with.",
      ]},
      { h: "Why the gap matters" },
      { p: "A deal at 1.13x Track 1 can fall below 1.0x on Track 2 once you bake in 5% vacancy, 8% management, and 5% CapEx. The loan still closes — but the borrower bleeds cash the first time a tenant turns over. Quote both, and you keep the borrower out of a deal that qualifies on paper and loses money in life." },
      { quote: "Track 1 gets the loan approved. Track 2 keeps the investor solvent." },
    ],
  },
  {
    slug: "str-legality-city-guide-2026",
    date: "June 13, 2026", tag: "STR",
    title: "STR legality in 2026: where investors are allowed in — and where cities shut the door",
    summary: "NYC's Local Law 18 effectively ended investor-owned whole-home STR in September 2023. LA and SF followed. Florida's state preemption and Texas's permissive stance make the South the clearest market for STR DSCR deals.",
    body: [
      { p: "Short-term rental income can transform a DSCR deal. An Airbnb in a strong market can generate 60-80% more income than a comparable long-term lease, pushing a borderline DSCR across the qualifying line. But that income only counts if the rental is legal. In 2026, the geography of STR legality has become one of the most important underwriting variables for any STR deal." },
      { h: "Markets where investment-property STR is prohibited" },
      { list: [
        "New York City: Local Law 18 (effective September 2023) requires hosts to register and be present during any STR. Whole-home investor rentals are effectively banned. Listings fell from approximately 22,000 to under 7,000 after LL18 took effect. No lender will underwrite STR income on a New York City investment property.",
        "San Francisco: The home-sharing ordinance limits STR to primary residences where the owner lives at least 275 nights per year, with a maximum of 90 unhosted nights annually. Investment-property STR is prohibited.",
        "Los Angeles: Home-sharing is limited to primary residences, capped at 120 nights per year. Non-primary investment properties cannot legally operate as STRs.",
        "New Orleans (French Quarter): Full STR ban in the French Quarter. The rest of the city imposes a one-permit-per-operator limit and prohibits corporate entities from holding permits.",
      ]},
      { h: "Markets where STR is permitted — with conditions" },
      { list: [
        "San Diego: Tier 3 whole-home permits are available for non-primary residences, but subject to waitlists and caps. Confirm permit availability before underwriting STR income — permits may not transfer with the sale.",
        "Miami: Permitted in eligible zoning districts. Not citywide — verify the specific neighborhood's zoning classification before underwriting.",
        "Austin: Type 2 (non-owner-occupied) permits are capped and waitlisted. Operators with existing permits are at a significant advantage.",
        "Nashville: Sweeping regulatory changes from 2020-2024 left some previously STR-eligible properties now prohibited. Verify current permit type per property, not just by neighborhood.",
        "Houston, Dallas, Raleigh: Generally operator-friendly with no primary residence requirement.",
      ]},
      { h: "Florida: state preemption changes the math" },
      { p: "Florida SB 280 (effective 2024) preempts local STR restrictions in many circumstances — municipalities generally cannot ban STR outright if the activity was legal when the ordinance was passed. This makes Florida one of the most operator-friendly states in the country. Miami's neighborhood-level zoning restrictions are real, but the statewide default is permissive compared to California or New York." },
      { h: "California SB 346: platform data sharing started January 2026" },
      { p: "Effective January 1, 2026, California SB 346 requires Airbnb, VRBO, and similar platforms to share host data — name, address, nights booked, registration status — with local governments. For any California STR deal: confirm active permits before underwriting. Enforcement is now platform-assisted, not purely complaint-driven. Operating without a required permit in California carries substantially higher enforcement risk than it did in 2024." },
      { h: "The AirDNA top-10 markets in 2026" },
      { p: "AirDNA's 2026 best-places-to-invest report puts all 10 top markets in small and mid-tier cities averaging approximately $296,000 median home price. Jackson, MS leads at 15.95% cap rate, followed by Abilene, TX at 14.01% and Akron, OH at 11.66%. None are coastal trophy markets — which is consistent with the regulatory picture. The high-yield STR deals are in the markets that haven't banned the product." },
      { quote: "STR income is only real if the rental is legal. In NYC, SF, and LA, investor-owned whole-home STRs are banned. In Florida and Texas, they're business as usual." },
    ],
  },
  {
    slug: "40-year-amortization-dscr",
    date: "June 10, 2026", tag: "Underwriting",
    title: "The 40-year amortization DSCR loan: when the extra decade is worth it",
    summary: "A 40-year term reduces monthly P&I by about 5-6% compared to 30 years, adding 0.05–0.08 DSCR points on a borderline deal. Here's when to pull this lever — and what it costs over the hold period.",
    body: [
      { p: "When a DSCR deal comes in at 1.08x and the floor is 1.15x, the structuring conversation begins. Rate buydown is one option — expensive. More down payment is another — sometimes the borrower doesn't have it. A 40-year amortization is a third lever that brokers often overlook." },
      { h: "The math on a real deal" },
      { p: "On a $400,000 loan at 7.25%, the 30-year P&I payment is $2,728 per month. The 40-year P&I payment is $2,576 per month — about $152 less, or a 5.6% reduction. If qualifying rent is $3,000 per month, that difference takes DSCR from 1.100 to 1.165. The difference between a deal that needs restructuring and one that passes." },
      { h: "The 40-year with interest-only option" },
      { p: "Several DSCR lenders offer 40-year IO structures: interest-only for the first 10 years, then 30 years of amortizing P&I. In the IO period, the monthly payment drops to just interest on the outstanding balance. At 7.25% on $400,000, IO payment = $2,417 per month vs $2,728 on standard 30-year P&I. This maximizes DSCR for the qualifying period at the cost of zero equity paydown in the first decade." },
      { h: "The full comparison at $400K / 7.25%" },
      { list: [
        "30-year fixed: $2,728 P&I → 1.100x DSCR at $3,000/month rent",
        "40-year fixed: $2,576 P&I → 1.165x DSCR (crosses the 1.15x floor)",
        "30-year IO (10yr IO period): $2,417/month → 1.242x DSCR during IO period; resets to 20-year amortizing P&I at month 121",
        "40-year IO (10yr IO period): $2,417/month → 1.242x DSCR during IO period; resets to 30-year amortizing P&I at month 121 (lower payment shock than the 30yr IO version)",
      ]},
      { h: "What you give up" },
      { p: "The extra cost on a 40-year term is real. On a $400,000 loan at 7.25%, a 40-year fully amortizing schedule pays approximately $210,000 more in total interest than the 30-year schedule — if you hold to maturity. Most DSCR investors don't hold 40 years. For a 5-7 year hold, the interest cost differential is much smaller, and the monthly cash flow improvement may more than compensate." },
      { h: "When to reach for it" },
      { list: [
        "DSCR in the 0.90–1.15 range: model the 40-year alongside rate buydown and additional equity to compare restructuring paths.",
        "Borrower has a 5+ year hold plan: the monthly savings compound over the hold period into real cash flow improvement, not just a qualifying metric.",
        "IO with payment reset risk: only use the IO option where the borrower explicitly understands month-121 payment reset and has a plan — rate improvement, refi, sale, or adequate reserves.",
      ]},
      { quote: "A 40-year term is not a better loan — it's a structuring tool. Use it to cross the DSCR floor on a deal that otherwise qualifies. The extra decade costs real money if you hold it that long." },
    ],
  },
  {
    slug: "brrrr-seasoning-6-months",
    date: "June 9, 2026", tag: "Process",
    title: "BRRRR seasoning: how to cash out at 6 months",
    summary: "Greenstreet's STR program seasons cash-out at six months. Here's what it takes instead of the usual year-long wait.",
    body: [
      { p: "The classic BRRRR bottleneck is seasoning: most lenders make you wait 6–12 months before they'll cash out at the new appraised value instead of your cost basis. For STR operators, Greenstreet's STR program is built to recycle that capital faster." },
      { h: "What Greenstreet waives — and what it wants instead" },
      { list: [
        "No 6-month title seasoning requirement on qualifying STR cash-outs.",
        "In exchange: documented rehab scope, a clean appraisal at the new value, and AirDNA or trailing STR income supporting the DSCR.",
        "Expect tighter LTV on the cash-out leg — plan around 70–75%, not 80%.",
      ]},
      { h: "The play" },
      { p: "Line up the appraisal and the income documentation before you apply. The seasoning waiver only helps if the value and the rent are both defensible on day one." },
    ],
  },
  {
    slug: "dscr-second-mortgage-legacy-rate",
    date: "June 7, 2026", tag: "Lending",
    title: "Protecting a legacy rate: when a DSCR second mortgage beats a cash-out refi",
    summary: "If your client locked a 3.75% first mortgage in 2021, a cash-out refi today destroys 300+ basis points permanently. A DSCR second lien on an investment property lets them extract equity without touching the first.",
    body: [
      { p: "The rate lock-in problem is real. Millions of rental investors who closed DSCR loans in 2020–2022 are sitting on 30-year rates in the 3%–5% range. A cash-out refinance today means trading that rate for something above 7% — on a balance they've been paying down for three or four years. The arithmetic usually doesn't work. But they still need the equity." },
      { h: "The structure that doesn't touch the first" },
      { p: "A DSCR second mortgage is a second-lien loan on an investment property, underwritten on the property's income — not the borrower's personal income. The first mortgage stays in place, unchanged. The second provides the liquidity. The blended cost of capital (first at 3.75% plus second at 8.5–9.5%) typically runs 200–350 basis points below a full cash-out refi at current market rates." },
      { h: "How DSCR seconds are underwritten" },
      { list: [
        "Combined DSCR: qualifying metric is gross rent ÷ (first PITIA + second P&I). Both loans must be covered together — the floor is typically 1.00x combined.",
        "CLTV cap: first balance + second loan amount cannot exceed 80% of current appraised value. On a $400K property with a $250K first balance, maximum second = $70K at 80% CLTV.",
        "No income docs, no reserves required on DSCR second products. Qualification is property-income-only.",
        "AVM appraisal available for smaller loan amounts — no full appraisal required on deals under the AVM threshold.",
      ]},
      { h: "The use cases" },
      { p: "Use case one: pull equity from Property A to fund the down payment on Property B. First mortgage on A stays at 3.75%. DSCR second on A provides the capital. Combined DSCR on A stays at or above 1.0x. New purchase on B is financed separately with full leverage." },
      { p: "Use case two: renovation capital without refinancing. Pull $100–$150K to renovate a rental, raise rents, and later refinance both liens once market rates improve. No rate risk on the existing first — it stays locked while you put the equity to work." },
      { h: "What to watch" },
      { list: [
        "Second lien rate: expect 8%–10% in the current environment. Price this honestly in your hold-period model — the blended cost savings are real but not unlimited.",
        "CLTV constraint: if the first is already at 75%+ LTV, a second may not be possible at meaningful amounts. Run the math on current value before promising a number.",
        "Exit planning: if rates drop and the investor wants to refi in 2027-2028, they'll need to address both liens. Build the exit into the conversation now.",
      ]},
      { quote: "A 3.75% first mortgage is an asset. A DSCR second lets you extract equity from that asset without surrendering the rate you locked three years ago." },
    ],
  },
  {
    slug: "texas-hb2239-apr-ban",
    date: "June 4, 2026", tag: "Compliance",
    title: "Texas H.B. 2239: the 12% APR ban and most DSCR rates",
    summary: "Texas bans business-purpose loans at APR ≥ 12% under Finance Code §302.101. Most DSCR deals qualify fine. Watch the edges.",
    body: [
      { p: "Texas caps business-purpose loans below a 12% APR. For standard DSCR deals that's a non-issue — but on thin files with points and a high note rate, APR creeps toward the line faster than brokers expect." },
      { h: "Where it bites" },
      { list: [
        "Note rate is not APR. Points, fees, and a short prepay window push APR above the coupon.",
        "A 10.5% note with 3 points on a short term can cross 12% APR — and become uncloseable in TX.",
        "Run the APR, not the rate, on every Texas file in the 9%+ range.",
      ]},
      { quote: "In Texas, the rate is fine. It's the APR that fails the deal." },
    ],
  },
  {
    slug: "airdna-haircut",
    date: "May 30, 2026", tag: "STR",
    title: "AirDNA 80% vs 100% haircut: when to push for the higher number",
    summary: "Greenstreet's STR program accepts up to 100% AirDNA on stabilized STRs, where most cap at 80%. We break down when each tier applies.",
    body: [
      { p: "Short-term-rental income gets discounted before it qualifies a DSCR loan. The size of that haircut — 80% vs 100% of AirDNA projection — can be the difference between a deal that qualifies and one that doesn't." },
      { h: "The two haircuts" },
      { list: [
        "80% (most lenders): AirDNA projected annual revenue × 0.80 ÷ 12 becomes qualifying monthly income.",
        "100% (Greenstreet DSCR 1-4 with STR income, stabilized): full AirDNA projection, but only with a documented 12-month operating history.",
      ]},
      { h: "When to push" },
      { p: "If the property has a real trailing 12-month STR record, push for the 100% lender — the extra 20% of income can lift DSCR over the qualifying line. For a brand-new STR with no history, the 80% haircut is what you'll get, so structure the deal around it." },
    ],
  },
];

function ArticleBody({ blocks }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.h) return <h2 key={i} style={{ color: MINT, fontSize: "24px", fontWeight: 800, margin: "36px 0 14px", lineHeight: 1.2 }}>{b.h}</h2>;
        if (b.quote) return <blockquote key={i} style={{ borderLeft: `3px solid ${YELLOW}`, padding: "8px 22px", margin: "28px 0", color: CREAM, fontSize: "21px", fontStyle: "italic", lineHeight: 1.4, fontWeight: 500 }}>{b.quote}</blockquote>;
        if (b.list) return (
          <ul key={i} style={{ margin: "0 0 20px", padding: 0, listStyle: "none" }}>
            {b.list.map((li, j) => (
              <li key={j} style={{ color: "#3f5252", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px", paddingLeft: "26px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: MINT, fontWeight: 800 }}>→</span>{li}
              </li>
            ))}
          </ul>
        );
        return <p key={i} style={{ color: "#3f5252", fontSize: "17px", lineHeight: 1.75, marginBottom: "18px" }}>{b.p}</p>;
      })}
    </>
  );
}

export default function BlogPage({ onBack, onNavigate, path }: { onBack: () => void; onNavigate: (v: any) => void; path?: string }) {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = p && p.startsWith("/blog/") ? p.replace("/blog/", "").replace(/\/$/, "") : null;
  const post = slug ? POSTS.find((p) => p.slug === slug) : null;

  // ---- Article detail ----
  if (post) {
    return (
      <PageShell title={post.title} subtitle={`${post.tag} · ${post.date}`} onBack={onBack} onNavigate={onNavigate}>
        <article style={{ maxWidth: "720px" }}>
          <ArticleBody blocks={post.body} />
          <AnimatedCard hoverScale={false} style={{ marginTop: "44px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
            <div style={sectionTitle}>Run the numbers</div>
            <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6 }}>Model a live deal — DSCR, break-even rate, and your Greenstreet program match in minutes.</p>
            <AnimatedButton onClick={() => onNavigate("deal-analyzer")} showArrow={true}>
              Open the Deal Analyzer
            </AnimatedButton>
          </AnimatedCard>
          <div style={{ marginTop: "52px" }}>
            <div style={sectionTitle}>Keep reading</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onNavigate(`blog/${p.slug}`); }}>
                  <AnimatedCard hoverScale={true} style={{ height: "100%" }}>
                    <div style={{ color: "#647474", fontSize: "12px", marginBottom: "6px" }}>{p.date}</div>
                    <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", lineHeight: 1.3 }}>{p.title}</div>
                  </AnimatedCard>
                </a>
              ))}
            </div>
          </div>
        </article>
      </PageShell>
    );
  }

  // ---- Index ----
  return <BlogIndex onBack={onBack} onNavigate={onNavigate} />;
}

function BlogIndex({ onBack, onNavigate }) {
  const [tag, setTag] = useState("All");
  const [email, setEmail] = useState("");
  const tags = ["All", "Lending", "Rates", "Underwriting", "Process", "Compliance", "STR", "Tax"];
  const filtered = tag === "All" ? POSTS : POSTS.filter((p) => p.tag === tag);

  return (
    <PageShell
      title="Greenstreet Finance Blog"
      subtitle="Notes from the underwriting desk. State rule changes, lender behavior shifts, and what the math actually says."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} style={{
            padding: "8px 16px", borderRadius: "20px",
            border: `1px solid ${tag === t ? MINT : "rgba(0,55,56,0.22)"}`,
            background: tag === t ? "rgba(0,101,101,0.12)" : "transparent",
            color: tag === t ? MINT : "#4a5d5d", cursor: "pointer", fontSize: "13px", fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {filtered.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onNavigate(`blog/${p.slug}`); }}>
            <AnimatedCard hoverScale={true} style={{ height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: "rgba(0,101,101,0.12)", color: MINT, border: `1px solid ${MINT}` }}>{p.tag}</span>
                <span style={{ fontSize: "11px", color: "#5a6b6b" }}>{p.date}</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: CREAM, marginBottom: "8px", lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ fontSize: "14px", color: "#4a5d5d", lineHeight: 1.6 }}>{p.summary}</p>
              <p style={{ fontSize: "12px", color: MINT, marginTop: "12px", fontWeight: 600 }}>Read more →</p>
            </AnimatedCard>
          </a>
        ))}
      </div>

      <div style={{ marginTop: "40px", padding: "32px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <p style={{ fontSize: "15px", color: CREAM, marginBottom: "12px" }}>Want these in your inbox?</p>
        <p style={{ fontSize: "13px", color: "#4a5d5d", marginBottom: "20px" }}>One short note a month. State rule changes, lender behavior shifts, and one rate sheet pull. No drip campaigns, no upsells.</p>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "12px", maxWidth: "500px", margin: "0 auto", alignItems: "flex-end" }}>
          <PremiumInput
            type="email"
            label="Email Address"
            placeholder="broker@yourfirm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: 1, marginBottom: 0 }}
          />
          <AnimatedButton type="submit" showArrow={false} style={{ height: "46px", padding: "0 24px" }}>
            Subscribe
          </AnimatedButton>
        </form>
      </div>
    </PageShell>
  );
}
