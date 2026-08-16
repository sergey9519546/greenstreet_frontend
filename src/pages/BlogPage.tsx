import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";

// ── Pistachio editorial identity ───────────────────────────────────────────────
// Accent matches mockup: #eeefd3 nav + footer, dark-ink overrides on .dc-nav
const BL_ACCENT = "#eeefd3";
const BL_NAV_BORDER = "1px solid rgba(0,55,56,0.15)";

const BL_CSS = `
.bl-card { transition: transform .14s; }
.bl-card:hover { transform: translateY(-4px); }
/* Light-nav override: links + wordmark use dark ink on pistachio bg */
.dc-nav a { color: rgba(0,55,56,0.72) !important; }
.dc-nav a.dc-cta { background: #003738 !important; color: #eeefd3 !important; }
.dc-nav { border-bottom: ${BL_NAV_BORDER} !important; background: rgba(238,239,211,1) !important; }
/* footer ink on pistachio footer */
footer { color: rgba(0,55,56,0.55) !important; }
`;

// ── Post data (all existing posts preserved) ──────────────────────────────────
// RAW_POSTS is the authored source. The exported POSTS below applies the
// editorial revisions in EDITORIAL_REVISIONS on top of it, so provider-specific
// guidance is always rendered behind a current-qualified-review framing.
const RAW_POSTS = [
  // ── DSCR EDUCATION ARTICLES (added 2026-06-25) ──────────────────────────────
  {
    slug: "greenstreet-go-launch",
    date: "June 25, 2026", tag: "Product",
    title: "Greenstreet announces InvestGO, the unified DSCR loan platform",
    summary: "InvestGO brings DSCR pricing, program fit, state-rule checks, stress testing, and borrower qualification into one workflow for real estate investors.",
    body: [
      { p: "Greenstreet Finance is launching InvestGO: a unified operating layer for DSCR loan analysis. The goal is simple: let a broker or investor move from deal inputs to a defensible lending path without rebuilding the file across spreadsheets, portals, and disconnected calculators." },
      { h: "Why InvestGO exists" },
      { p: "DSCR lending looks simple until the file crosses real-world constraints. Rent has to cover PITIA. FICO and LTV change rate tiers. State prepayment rules can alter economics. Short-term rental income may qualify on a different figure than the owner expects. InvestGO puts those checks in one deterministic workflow." },
      { h: "What the platform does" },
      { list: [
        "Runs Track 1 DSCR for lender qualification and Track 2 DSCR for investor survival.",
        "Ranks Greenstreet programs and lender paths by fit instead of forcing manual portal checks.",
        "Surfaces 50-state prepayment and usury flags before rate lock.",
        "Adds stress testing, refi timing, ARM reset, returns, tax, and portfolio views around the same deal inputs.",
      ]},
      { h: "No black box in the numbers" },
      { p: "The numeric path stays deterministic: the same inputs return the same outputs. AI can help explain the result, but it does not decide the DSCR, rate tier, state rule, or underwriting output." },
      { quote: "InvestGO is built so every number can be traced back to the input, rule, and calculation that produced it." },
      { h: "Who it is for" },
      { p: "Investors can stress-test the acquisition before wiring earnest money, and review the logic behind program fit, state rules, and rate-path assumptions in one place." },
    ],
    glyph: "GO", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "what-is-dscr-how-it-works",
    date: "June 25, 2026", tag: "Lending",
    title: "What is DSCR? The complete guide to how the ratio works and why it matters",
    summary: "DSCR = rent ÷ PITIA. That single ratio determines whether you qualify — and by how much. Here's how lenders actually calculate it, what counts as income, and what the tiers mean for your rate.",
    body: [
      { p: "DSCR stands for Debt Service Coverage Ratio. It is the single number that determines whether a non-QM investment property loan qualifies. Unlike a conventional mortgage that weighs your W-2s and tax returns, a DSCR loan is underwritten on the property's ability to pay for itself — not yours." },
      { h: "The formula: rent ÷ PITIA" },
      { p: "DSCR = Gross Monthly Rent ÷ Total Monthly PITIA. That's it. Example: rent = $2,500/month. PITIA = $1,420 P&I + $330 taxes + $110 insurance + $60 HOA = $1,920/month. DSCR = $2,500 ÷ $1,920 = 1.30x. The property generates 30% more income than it costs to carry. A DSCR of exactly 1.0x means rent equals the payment — no surplus. Below 1.0x, the rent does not cover the payment." },
      { h: "What goes into PITIA" },
      { list: [
        "P — Principal reduction on the loan balance.",
        "I — Interest at the note rate.",
        "T — Property taxes. Lenders use the actual annual tax bill ÷ 12. If you're buying in a county with a high mill rate, this number moves the DSCR more than most borrowers expect.",
        "I — Hazard insurance (and flood insurance if required). Coastal properties in FEMA Special Flood Hazard Areas can see $300–600/month here — that alone can push an otherwise-qualifying deal below 1.0.",
        "A — HOA dues (if applicable). Full monthly HOA included at face value.",
      ]},
      { h: "What counts as gross rent" },
      { p: "For a standard long-term rental, lenders use the lower of: (1) the actual signed lease, or (2) the Form 1007 market rent from the appraisal. If there's no lease — vacant property, new acquisition — the 1007 rent stands on its own. That's why 63% of DSCR loans close without a signed lease: the appraisal rent is sufficient." },
      { p: "For short-term rentals (Airbnb, VRBO), lenders typically use the lower of: the 1007 long-term rent, AirDNA projected income × 70–80%, or documented 12-month STR gross revenue. See our STR underwriting article for the full logic." },
      { h: "DSCR tiers and what they mean for your deal" },
      { list: [
        "≥ 1.25x — Clean file. Best rate tier, 3 months reserves, max program availability.",
        "1.00–1.24x — Standard qualifying range. Solid access to programs but rate adds 0.125–0.375% vs the best tier.",
        "0.75–0.99x (sub-1.0) — Deal qualifies but lender options narrow sharply, reserves jump to 9–12 months, and the rate premium is meaningful. Compensating factors (740+ FICO, low LTV) are required.",
        "< 0.75x — Almost no institutional lender program covers this. Hard money or bridge are the realistic paths.",
      ]},
      { h: "Why DSCR ≠ cash flow" },
      { p: "DSCR uses gross rent, not net. It doesn't subtract vacancy, property management, repairs, or capital expenditures. A 1.15x DSCR property is not necessarily cash-flow-positive after accounting for those real operating costs. Run the net analysis separately — the DSCR gets you through underwriting, but your actual return depends on the full operating picture." },
      { quote: "DSCR is the lender's question: does the rent cover the payment? It's not the investor's question: does the property actually cash flow after expenses?" },
      { p: "→ Estimate the DSCR on your property using Greenstreet's Deal Analyzer: open the DSCR Calculator from any page." },
    ],
    glyph: "÷", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-pitia-breakdown-qualifying-income",
    date: "June 25, 2026", tag: "Lending",
    title: "PITIA breakdown: the five numbers that determine whether your DSCR deal qualifies",
    summary: "Principal, interest, taxes, insurance, and HOA. Each one can move the DSCR enough to make or break a deal. Here's how to model all five before you go to contract.",
    body: [
      { p: "Most DSCR deals that fail at underwriting don't fail because the rent was too low. They fail because the PITIA was larger than the borrower modeled. Property taxes and insurance are the two most common surprises. Here's how to calculate each component accurately before you put a deal under contract." },
      { h: "Principal and interest" },
      { p: "P&I is the straightforward part. Use the actual rate your lender is quoting — not the advertised floor rate, the real rate for your file (based on your FICO, LTV, and program). A 0.50% rate difference on a $400,000 loan is roughly $125/month. That's enough to swing a 1.08x DSCR to 1.01x. Get a real rate lock before you model." },
      { h: "Property taxes" },
      { p: "Use the actual annual tax bill divided by 12. Do not use the current owner's tax bill if the property is in a state with homestead exemptions (California, Florida, Texas) or assessment caps — after transfer, the exemption usually resets to the purchase price. In Texas, expect annual taxes of roughly 1.6–2.4% of the property's value — the statewide effective rate is about 1.6%, but metro counties (Harris, Dallas, Travis) run near 2.0% or higher. On a $350,000 Texas property, that's about $475–$700/month. Many borrowers model $200." },
      { h: "Insurance" },
      { p: "Get a real insurance quote before you model PITIA. Hazard insurance on a SFR runs $800–$2,000/year in most markets — $67–$167/month. But coastal markets with wind, hail, or flood exposure are different. Florida all-perils coverage on a property in a SFHA can run $4,000–$8,000+/year. A $500/month insurance line item on a deal with $2,200/month rent produces a DSCR that almost certainly fails." },
      { h: "HOA dues" },
      { p: "HOA is included at face value — the full monthly amount. If a condo has a $600/month HOA and you're counting on $1,800/month rent to qualify, the HOA alone consumes a third of your rent in PITIA before debt service. Higher-HOA properties require proportionally higher rents to hit the same DSCR." },
      { h: "The deal-break rate: model it before you close" },
      { p: "Once you have a realistic PITIA estimate, you can calculate a break-even rate: the interest rate at which DSCR would equal 1.00x. The gap between an illustrative offered rate and that break-even rate can help test rate sensitivity. Treat the result as scenario analysis, not a rate quote or underwriting decision." },
      { quote: "Tax and insurance are the two PITIA components that sink deals at underwriting. Model both from real sources — county records and an actual insurance quote — before you go to contract." },
    ],
    glyph: "Σ", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-ltv-down-payment-fico",
    date: "June 24, 2026", tag: "Lending",
    title: "LTV, down payment, and FICO tiers: how the three dials move your DSCR rate",
    summary: "LTV, credit profile, and prepayment terms can affect a DSCR offer. Learn the questions to ask when comparing lender-specific pricing.",
    body: [
      { p: "DSCR pricing is not one-size-fits-all. Lenders may consider LTV, credit profile, property characteristics, rate-lock period, and prepayment terms among other variables. Understand the assumptions behind a written quote rather than assuming a particular structure yields a particular rate." },
      { h: "LTV: the biggest single dial" },
      { list: [
        "Lower LTV may improve pricing or flexibility, but neither the thresholds nor the adjustment are universal.",
        "Compare each lender's LTV limits, down-payment requirement, and property-type overlays for the specific scenario.",
        "A larger down payment reduces the loan balance; whether it also changes pricing depends on the lender's current terms.",
        "Ask for written, dated assumptions instead of relying on a headline tier.",
      ]},
      { h: "FICO tiers" },
      { p: "Credit profile can affect both pricing and program access. The illustrative ranges below are not a provider matrix; confirm current score breakpoints, reserves, and property restrictions with the lender." },
      { list: [
        "Higher scores may support more favorable terms, subject to the lender's current matrix.",
        "Mid-range scores may have different pricing, leverage, or reserve conditions depending on the file.",
        "Lower-score scenarios may require additional compensating factors or may not fit a given lender's criteria.",
      ]},
      { h: "Prepayment penalty: the 0.50–0.80% you're trading away" },
      { p: "A prepayment penalty can affect a lender's offered pricing, but the cost, duration, enforceability, and economic trade-off are file- and jurisdiction-specific. Compare the written alternatives and consider your expected hold period before choosing one." },
      { p: "Caution: state and local law, loan purpose, entity structure, and loan documents can affect prepayment terms. Confirm current requirements with the lender and qualified legal counsel; this article is not a legal analysis." },
      { h: "How to combine the three dials" },
      { p: "When comparing offers, hold the loan amount, LTV, credit assumptions, property type, rate-lock period, points, fees, and prepayment terms constant. A published rate alone is not enough to compare two loan scenarios." },
      { quote: "A useful comparison starts with the same assumptions and a current written quote from each provider." },
    ],
    glyph: "LTV", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-refinance-rate-term-cashout-seasoning",
    date: "June 23, 2026", tag: "Lending",
    title: "DSCR refinance: rate-term vs cash-out, seasoning rules, and break-even math",
    summary: "Rate-term refi vs cash-out refi aren't just different loan types — they have different seasoning rules, LTV limits, and DSCR requirements. Here's how to decide and when the math actually works.",
    body: [
      { p: "Refinancing a DSCR property is not a simple rate-and-term swap. The type of refinance you're doing, how long you've owned the property, and what the property appraises at today all interact to determine what's possible, at what LTV, and whether the economics make sense. Here's the full picture." },
      { h: "Rate-term refinance: the cleaner path" },
      { p: "A rate-term (R/T) refi simply replaces your existing loan with a new one — different rate, different term, no cash out (or only enough cash to cover closing costs). Rate-term refis generally get better LTV limits and slightly lower rates than cash-out refis, because the lender is not increasing the loan balance relative to the property's value." },
      { list: [
        "LTV limits, seasoning, DSCR thresholds, and cash-back treatment vary by lender and transaction type.",
        "Ask for the lender's current definitions of rate-term, cash-out, delayed financing, and eligible closing-cost reimbursement.",
      ]},
      { h: "Cash-out refinance: the equity extraction play" },
      { p: "A cash-out refi pulls equity out of the property — funds you can redeploy into the next acquisition, capital improvements, or other uses. It comes with tighter restrictions than R/T." },
      { list: [
        "Cash-out limits, seasoning, documentation, appraisal, and DSCR treatment are lender-specific.",
        "A higher new balance or rate can reduce a scenario's DSCR, while a new valuation can affect LTV; neither result establishes eligibility.",
        "Confirm the lender's current ownership-history and documentation requirements before planning a refinance.",
      ]},
      { h: "Break-even math: the question that determines if the refi pencils" },
      { p: "Refinancing costs money — typically 1.5–3% of the loan amount in lender fees, title, appraisal, and closing costs. To know whether a rate-term refi makes financial sense, calculate the break-even month:" },
      { p: "Break-even months = Total closing costs ÷ Monthly payment reduction. If closing costs are $8,000 and the new payment is $300/month lower, break-even is month 27. If you sell or refinance again before month 27, the refi cost money net. After month 27, every month is savings." },
      { p: "Factor in prepayment penalty if you have one on the existing loan. A 3% PPP on a $400,000 loan is $12,000 — that's $12,000 added to your break-even calculation, which can push break-even past 5 years even on a 1.00% rate reduction." },
      { h: "When cash-out makes sense vs rate-term" },
      { list: [
        "Rate-term: rates dropped meaningfully (≥ 0.75%), you're past seasoning, deal-break rate gives you headroom. Focus: reduce carrying cost.",
        "Cash-out: equity has built up (appreciation + paydown), you have another acquisition that can deploy the capital efficiently, and you can extract equity at a rate that pencils against the new deal's projected return.",
        "Hybrid: if rates dropped AND you need capital, check if a rate-term to 80% LTV gets you the cash you need — it may carry a better rate than a cash-out at 75% LTV.",
      ]},
      { quote: "The break-even month is the number that makes the refinance decision rational instead of emotional. Run it before you pay the appraisal." },
    ],
    glyph: "↺", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-approval-issues-sub-10-fico-reserves",
    date: "June 23, 2026", tag: "Underwriting",
    title: "Six things that kill DSCR approvals — and how to fix each one before you submit",
    summary: "Sub-1.0 DSCR, FICO below 660, thin reserves, LLC issues, STR rent calculation errors, and prepay-penalty state surprises. Six problems underwriters see on every desk, with the fix for each.",
    body: [
      { p: "DSCR underwriting is simpler than conventional — no tax returns, no DTI, no employment history. But the problems that kill deals are predictable, and they recur on almost every submission desk. Here are the six most common, with what actually fixes them." },
      { h: "1. DSCR below 1.0" },
      { p: "The most common problem. Options when you're below 1.0:" },
      { list: [
        "Increase the down payment: a larger equity stake reduces the loan balance and payment in an illustrative model. Confirm the lender's current LTV and pricing treatment.",
        "Consider an ARM only after comparing its current written terms, caps, and reset assumptions with a fixed-rate alternative.",
        "Ask whether the lender considers sub-1.0 DSCR scenarios and which compensating factors, if any, apply. Do not infer an available program from a general range.",
        "Walk away: if the math doesn't pencil at 0.75x DSCR, no creative structuring fixes a fundamentally uneconomical deal.",
      ]},
      { h: "2. FICO below the program floor" },
      { p: "Credit-score minimums and compensating factors vary by lender and can change. Before applying, ask which score, credit-report date, reserves, and property restrictions are being used. Credit-improvement steps should be considered carefully and do not assure a particular score change or loan outcome." },
      { h: "3. Insufficient reserves" },
      { p: "Reserves = liquid assets held after closing. The floor at DSCR ≥ 1.25 is 3 months PITIA. Overlays add months for: STR (+3), condo (+3), FICO <680 (+3), first-time investor (+3), loan >$1M (+6), foreign national (+6). These stack. A first-time investor on an STR condo is looking at 3 + 3 + 3 + 3 = 12 months reserves before the lender adds their own overlay. Make sure the borrower is computing reserves on the PITIA including the new loan — not on the list price or an old payment estimate." },
      { h: "4. LLC structure issues" },
      { p: "LLC vesting, personal-guaranty requirements, ownership thresholds, and multi-entity structures vary by lender. State law can also affect the documents and terms. Confirm the proposed entity structure with the lender and qualified counsel before applying; this article does not determine legal compliance." },
      { h: "5. STR rent calculation errors" },
      { p: "Do not assume gross STR booking revenue is qualifying income. A lender may use a rent schedule, third-party projection, documented history, or another source, each with its own verification and adjustment. Confirm the controlling method before modeling DSCR." },
      { h: "6. Prepay-penalty state restrictions" },
      { p: "Prepayment terms can be affected by the property's jurisdiction, loan purpose, entity structure, and current law. Confirm that the proposed language and economics are permitted with the lender and qualified local counsel before signing. Do not rely on a general article as a current legal determination." },
      { quote: "The six problems above recur in roughly that order of frequency. Check your file against all six before submission, not after the underwriter calls." },
    ],
    glyph: "✕→✓", glyphColor: dc.emerald, bg: dc.teal,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-foreign-nationals-itin",
    date: "June 22, 2026", tag: "Lending",
    title: "Foreign nationals and ITIN borrowers: how DSCR qualification actually works",
    summary: "Foreign-national and ITIN scenarios can involve different documentation, reserves, and entity questions. Confirm eligibility with a lender and qualified advisers.",
    body: [
      { p: "Some investment-property lenders consider property income rather than the income documentation used in conventional lending. Foreign-national and ITIN borrowers may have additional documentation, residency, credit, reserve, tax, and entity considerations. Eligibility depends on the lender and the individual file." },
      { h: "Who qualifies as a foreign national vs ITIN borrower" },
      { list: [
        "ITIN borrower: holds a U.S. Individual Taxpayer Identification Number (ITIN) — typically a permanent resident, non-resident alien, or visa holder with U.S. tax filing history. May or may not have a Social Security Number.",
        "Foreign-national (no SSN): a non-U.S. citizen with no ITIN or SSN. A lender may request alternative credit, identity, reserve, and entity documentation.",
        "The distinction can affect available options, but there is no universal program path. Ask each lender what it accepts for the exact borrower and property scenario.",
      ]},
      { h: "How DSCR calculation works for foreign national files" },
      { p: "The DSCR formula is identical: gross monthly rent ÷ PITIA. Foreign national status doesn't change the math. What changes is the documentation, reserves requirement, and available programs:" },
      { list: [
        "DSCR: the calculation may be the same, but the required threshold and other conditions are lender-specific.",
        "Credit: a lender may accept particular international reports, bank references, or alternative evidence; verify acceptable sources first.",
        "Reserves and LTV: lenders may apply separate limits or additional reserves based on the borrower, property, and loan terms.",
        "Guaranty and entity: personal guaranties, co-signers, and entity requirements are provider-specific.",
        "Bank statements: ask which accounts, history, translations, and verification methods are acceptable.",
      ]},
      { h: "Entity vesting for foreign nationals" },
      { p: "A U.S. LLC may be one possible ownership structure, but tax, title, lender, and legal requirements are fact-specific. Confirm the proposed structure with the lender and qualified cross-border legal and tax advisers before using it." },
      { h: "Tax considerations" },
      { p: "Foreign nationals with U.S. real property income are subject to FIRPTA (Foreign Investment in Real Property Tax Act) withholding on sale. DSCR loan qualification does not depend on U.S. tax status, but the borrower should work with a CPA familiar with cross-border real estate tax before closing — the tax implications on exit can be significant." },
      { quote: "Treat every foreign-national scenario as lender- and borrower-specific, with tax and legal advice obtained before closing." },
    ],
    glyph: "FN", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
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
    // mockup glyph metadata
    glyph: "%", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026", tag: "Compliance",
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
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
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
    glyph: "⊕", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Greenstreet Research",
    featured: false,
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
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026", tag: "Rates",
    title: "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    summary: "A historical June 2026 scenario showing how FICO, LTV, DSCR, and prepayment terms can affect a written quote.",
    body: [
      { p: "Published teaser rates depend on dated assumptions. This historical June 2026 scenario shows how a quote can change with FICO, LTV, DSCR, property type, points, and prepayment terms; it is not current pricing or a commitment to lend." },
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
    glyph: "∿", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Greenstreet Research",
    featured: false,
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
    glyph: "☼", glyphColor: dc.emerald, bg: dc.teal,
    author: "Greenstreet Research",
    featured: false,
  },
  // Featured post (why-no-llm) drives the Featured block; listed separately below
  {
    slug: "why-no-llm-number-path",
    date: "May 12, 2026", tag: "Product",
    title: "Why we put no LLM in the number path — and never will",
    summary: "Determinism is a feature. Here's how Greenstreet keeps every figure auditable while still using AI where it actually helps.",
    body: [
      { p: "Every DSCR number Greenstreet produces is deterministic. That's a deliberate architectural decision — and one we get asked about often, especially after borrowers have used tools that produce slightly different answers depending on how you phrase the question." },
      { h: "The problem with LLMs in the number path" },
      { p: "Language models are probabilistic by design. Ask the same question twice and you may get slightly different numbers. For a borrower trying to model whether a deal qualifies at a 1.11x DSCR or a 1.08x, that variance is not a minor inconvenience — it's a trust problem. One number closes. The other doesn't. You can't have both be correct." },
      { h: "Where AI does belong" },
      { list: [
        "Summarizing state rule changes (the rules themselves are checked against source documents).",
        "Drafting plain-language explanations of underwriting decisions.",
        "Surfacing which programs are worth checking, based on file characteristics.",
      ]},
      { p: "In each of these cases, the AI is writing prose or ranking options — not producing the authoritative number. The number comes from the deterministic engine: rate × balance × amortization factor, plus explicit addlines for taxes, insurance, HOA. No token sampling." },
      { h: "The audit trail requirement" },
      { p: "DSCR lending involves compliance reviews. Every number on a submitted file needs to be explainable: where did PITIA come from, what rate was used, what rent figure was applied. A deterministic engine produces the same answer every time and can show its work. An LLM cannot." },
      { quote: "Determinism is a feature. Every figure Greenstreet produces is auditable — the same inputs produce the same output, every time." },
    ],
    glyph: "det()", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: true,
  },

  // ── NEW: STR/Airbnb qualifying income ────────────────────────────────────────
  {
    slug: "dscr-str-airbnb-qualifying-income",
    date: "June 25, 2026", tag: "STR",
    title: "Short-term rental (STR/Airbnb) income: how DSCR lenders actually qualify it",
    summary: "STR gross booking revenue is not your qualifying income. Here's the three-figure hierarchy lenders use — 1007 rent, AirDNA haircut, and 12-month history — and which Greenstreet program applies.",
    body: [
      { p: "Short-term rentals (Airbnb, VRBO, Furnished Finder) are legal across most of the country, and DSCR lenders will finance them. But the qualifying income number is almost never what an investor expects. Understanding the three-figure hierarchy before you model is the difference between a deal that closes and one that stalls at underwriting." },
      { h: "Why gross booking revenue doesn't qualify" },
      { p: "Gross STR revenue includes platform fees, cleaning fees, nights you blocked off, and revenue that never actually hits your bank account net of costs. Institutional lenders — the ones behind DSCR securitization programs — use conservative, verifiable income proxies. Gross Airbnb revenue is neither conservative nor verifiable at the point of origination." },
      { h: "The three-figure hierarchy" },
      { list: [
        "Figure 1 — Form 1007 long-term rent: The appraiser estimates what the property would rent for as a standard unfurnished long-term rental. This is the floor figure and the one that controls if you have no STR history.",
        "Figure 2 — AirDNA projected income × 70–80%: AirDNA's market revenue estimate for the property's STR category and location, haircut by 20–30% for occupancy variance, cancellations, and seasonality. Most lenders apply a 75% factor.",
        "Figure 3 — Documented 12-month STR gross history × 70–80%: If the property has been operating as an STR for 12+ months, bank statements or platform payout statements documenting gross revenue can be used, again with the 70–80% haircut applied.",
      ]},
      { p: "The lender uses the lowest of the applicable figures. If you're buying a property that has never been an STR, Figure 1 (1007 rent) is your qualifying income — period. If the property has 12 months of STR history, you may be able to use Figure 3, but only if it comes in higher than the 1007 after the haircut, and only with full documentation." },
      { h: "STR documentation required at underwriting" },
      { list: [
        "AirDNA market report for the subject property's zip code and property type — obtained at application.",
        "Form 1007 from the appraisal — ordered with the rest of the appraisal package.",
        "12 months platform payout statements (Airbnb, VRBO): if using documented history, you need all 12 months. A 10-month history uses 10 months annualized — which some lenders accept, and some don't.",
        "Short-term rental license or permit: Greenstreet pre-checks STR legality in all 50 states. If the municipality prohibits or restricts STR, the property may not qualify at all.",
        "Proof of business purpose: STR properties must be non-owner-occupied. The borrower certifies they will not use the property as a primary residence.",
      ]},
      { h: "Reserve overlay for STR" },
      { p: "STR adds 3 months to the baseline reserve requirement. At 1.20x DSCR on an STR, you need 6 months PITIA in reserves minimum (3 standard + 3 STR overlay). At sub-1.0 DSCR on an STR, you're looking at 12–15 months. Make sure the investor is holding these reserves before you take the application." },
      { h: "Which Greenstreet program applies" },
      { p: "The current seven-program matrix includes several STR paths, each with its own FICO, DSCR, leverage, property-type, and documentation rules. Use the program matcher for a preliminary fit, then confirm current eligibility and the controlling rent method with the responsible lender before ordering an appraisal." },
      { h: "The math on a real STR deal" },
      { p: "Example: 3BR SFR in a beach market. AirDNA projected gross: $72,000/year ($6,000/month). 1007 long-term rent: $2,400/month. PITIA: $2,200/month." },
      { p: "Qualifying income hierarchy: (1) 1007 = $2,400 → DSCR 1.09x. (2) AirDNA × 75% = $4,500 → DSCR 2.05x. (3) Documented 12-mo history × 75% — only applies if history exists." },
      { p: "If the property has no STR history, the deal qualifies at 1.09x on long-term rent — not at the 2.05x the investor modeled from Airbnb projections. The deal still closes, but reserve and rate expectations need to be set for 1.09x DSCR, not 2.05x." },
      { quote: "The 1007 long-term rent is the floor. Without 12 months of documented STR history, that's your qualifying income — regardless of what AirDNA says the property could earn." },
    ],
    glyph: "STR", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },

  // ── NEW: Document checklist ───────────────────────────────────────────────────
  {
    slug: "dscr-loan-document-checklist",
    date: "June 25, 2026", tag: "Process",
    title: "What documents do you need for a DSCR loan? The complete checklist",
    summary: "No W-2s, no tax returns — but DSCR loans do have a document list. Here's every item, why lenders ask for it, and where the surprises are.",
    body: [
      { p: "One of the most common first questions on a DSCR file: 'What do you need from me?' Unlike conventional loans, there's no two-year employment history, no signed tax returns, no debt-to-income worksheet. But there is a document list. Here's everything you'll need to close — organized by category, with notes on where delays typically happen." },
      { h: "Property documents" },
      { list: [
        "Executed purchase contract (purchase) or mortgage statement (refinance): required to confirm terms, property address, and vesting.",
        "Form 1007 rent schedule: completed by the appraiser. This is the market rent figure the DSCR calculation rests on. It's ordered as part of the appraisal package — not a separate document you provide.",
        "Signed lease (if occupied): if a tenant is in place, provide the full lease including all addenda. Lenders use the lower of lease rent and 1007 rent.",
        "HOA documents: if the property is in an HOA, provide the current monthly dues statement and, if available, the HOA budget/financials (some lenders require this for condos).",
        "Short-term rental license (STR only): if operating as Airbnb/VRBO, the local operating license or permit. If the municipality doesn't issue one, a statement to that effect.",
        "12-month STR payout statements (STR history only): if claiming documented STR income, full Airbnb/VRBO platform payout statements for all 12 months.",
      ]},
      { h: "Insurance" },
      { list: [
        "Hazard insurance binder: coverage must equal the lesser of 100% of replacement cost or the loan balance. Investment property — not owner-occupied. Lenders check the occupancy type on the policy.",
        "Flood insurance binder (SFHA properties): required for any property in a FEMA Special Flood Hazard Area (Zone A, AE, V, VE). Coverage must meet the maximum NFIP coverage amount or the loan balance, whichever is less.",
        "Wind/hurricane insurance (where required): Florida, coastal Carolinas, Gulf states — separate wind policy may be required by the lender's overlay.",
      ]},
      { h: "Entity and vesting documents" },
      { list: [
        "LLC Operating Agreement: showing ownership percentages and manager designation. Guarantor must own ≥51%.",
        "Articles of Organization: state-filed formation document.",
        "Certificate of Good Standing: issued by the state where the LLC is formed, dated within 90 days of closing.",
        "EIN letter (IRS CP 575): confirms the entity's tax identification number.",
        "Resolution to borrow: a simple corporate resolution authorizing the LLC to enter into the mortgage. Most lenders supply a template.",
      ]},
      { h: "Borrower / guarantor documents" },
      { list: [
        "Government-issued photo ID: driver's license or passport. Must be current (not expired).",
        "Social Security Number or ITIN, if required for the lender's credit process. Ask the lender what alternative documentation it accepts for a foreign-national scenario.",
        "Credit authorization: signed CRA authorization for the hard pull. Most lenders use their own form.",
        "12-month bank statements (reserves): the accounts you're using to demonstrate reserves — 12 months is the standard for DSCR. Lenders verify the average balance, look for large deposits (sourcing required), and confirm no NSFs.",
        "Gift letter (if using gift funds): if any portion of down payment or closing costs is gifted, a letter from the donor stating no repayment is required, plus documentation of the transfer.",
      ]},
      { h: "Funds to close" },
      { list: [
        "Down payment sourcing: 60-day paper trail on the funds used for down payment. Bank-to-bank wire records, brokerage account statements, or sale-of-asset documentation.",
        "Closing cost funds: same sourcing requirement. Confirm available funds including closing costs — typically 1.5–3% of loan amount on a DSCR deal.",
      ]},
      { h: "Where delays happen" },
      { list: [
        "Insurance surprises: the flood binder comes back with a premium that kills the DSCR. Get insurance quotes before the appraisal is ordered — not after.",
        "LLC good-standing gap: the certificate is expired or the LLC is administratively dissolved. Check status with the state before application.",
        "Reserves shortfall revealed at bank statement review: the investor included retirement accounts that don't fully count, or crypto that counts as zero. Verify liquid assets against the program reserve requirement before you submit.",
        "Lease vs 1007 conflict: the lease shows rent that's higher than the 1007 — lenders use the 1007. Investors who modeled on the lease rent discover the DSCR is lower than expected.",
      ]},
      { quote: "No W-2s, no tax returns — but the appraisal, the insurance, and the bank statements are where DSCR files actually get held up. Have all three ready before you submit." },
    ],
    glyph: "✓", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },

  // ── NEW: What happens after prequalify ───────────────────────────────────────
  {
    slug: "dscr-loan-process-after-prequalify",
    date: "June 24, 2026", tag: "Process",
    title: "What happens after you prequalify for a DSCR loan? The step-by-step",
    summary: "Prequalification is the first step, not the last. Here's what happens between your initial estimate and a clear-to-close: soft review, term sheet, appraisal, underwriting, and funding.",
    body: [
      { p: "A DSCR prequalification or calculator estimate is preliminary. It reflects stated assumptions and is not a loan approval, rate lock, legal conclusion, or commitment. A lender's process, required documents, and timing vary by provider and transaction." },
      { h: "Step 1: Soft file review (Day 1–2)" },
      { p: "After an estimate, some lenders offer an initial file review before an appraisal. The lender may review:" },
      { list: [
        "Property address and type (SFR, 2–4 unit, condo, STR) — program eligibility confirmed.",
        "Estimated DSCR range — based on your inputs, verified against program minimums.",
        "Borrower FICO range (soft pull) — identifies which rate tier applies.",
        "Entity structure — LLC vesting confirmed, ownership verified against eligibility rules.",
        "Reserve position — preliminary check against the program's reserve requirement.",
      ]},
      { p: "The outcome may be an initial discussion of possible fit and indicative terms. It is not an approval, and a lender may identify additional issues after receiving documents, an appraisal, title, insurance, or updated pricing." },
      { h: "Step 2: Term sheet (Day 2–4)" },
      { p: "If the soft review confirms fit, a term sheet (also called a scenario sheet or letter of interest) is issued. This is an indicative document — not a commitment — but it specifies:" },
      { list: [
        "Loan amount, LTV, and program name.",
        "Rate range and rate lock terms available.",
        "Estimated fees (origination, lender, title, appraisal).",
        "Reserve requirement.",
        "Prepayment penalty options and rate differential.",
        "Estimated close timeline.",
      ]},
      { p: "Review the term sheet carefully. Its rate, fees, lock mechanics, and binding effect depend on the document and the lender. Confirm what is indicative, what is locked, and what conditions remain before relying on it." },
      { h: "Step 3: Formal application and appraisal order (Day 3–5)" },
      { p: "Once you accept the term sheet, you complete a formal loan application (1003 or equivalent) and pay the appraisal deposit. The appraisal — which includes the Form 1007 rent schedule — is ordered. This is the longest step: appraisals for investment properties typically take 10–21 business days depending on the market, appraiser availability, and property access." },
      { p: "Two important notes on the appraisal: (1) The Form 1007 rent schedule is not optional — it's part of the DSCR calculation. Make sure the appraisal engagement letter specifies the 1007. (2) If you're buying in a market with limited comparable properties (rural, beach, unusual property type), the appraiser may need extra time. Build this into your contract timeline if you're purchasing." },
      { h: "Step 4: Document submission (Day 5–10)" },
      { p: "While the appraisal is in process, you submit the full document package. See the document checklist article for the full list. The key items that most often cause delay: insurance binder (get this first), LLC certificate of good standing (check LLC status before you apply), and bank statements for reserves (have 12 months ready before Day 1)." },
      { h: "Step 5: Underwriting review (Day 12–20 after docs)" },
      { p: "Once the appraisal returns and the document package is complete, the file goes to underwriting. The underwriter reviews:" },
      { list: [
        "DSCR calculation: 1007 rent vs PITIA at the locked rate.",
        "Property condition: C4 or better, no deferred maintenance flags.",
        "Title report: no undisclosed liens, clear chain of title.",
        "Insurance: coverage amounts, occupancy type (investment), no lapses.",
        "Reserves: verified liquid balance post-closing.",
        "LLC structure: entity docs, good standing, ownership.",
      ]},
      { p: "Underwriting issues a Conditional Approval (CA) — a list of any conditions that must be satisfied before clear-to-close. On a clean DSCR file, this list is short: a few insurance items, maybe a letter of explanation on a bank deposit. On a complex file, conditions can run to a page." },
      { h: "Step 6: Clear to close and funding (Day 3–5 after CA)" },
      { p: "After conditions are satisfied, a lender may issue clear-to-close and coordinate closing through the appropriate parties. Disclosure, closing, and funding requirements depend on the loan type, jurisdiction, and current law; confirm the timeline directly with the lender and closing professionals." },
      { h: "Timeline summary" },
      { list: [
        "Days 1–5: Soft review → term sheet → formal app → appraisal ordered.",
        "Days 5–25: Appraisal in process + document submission.",
        "Days 25–35: Underwriting review → conditional approval → conditions cleared.",
        "Days 35–40+: Clear to close → closing disclosure → closing → funding.",
        "Total target: 21–30 business days on a clean file; 30–45 on a complex one.",
      ]},
      { quote: "The appraisal is the critical path. Everything else can move in parallel — docs, insurance, LLC verification. Order the appraisal as early as possible." },
    ],
    glyph: "→", glyphColor: dc.dark, bg: dc.emerald,
    author: "Greenstreet Research",
    featured: false,
  },

  // ── NEW: How to improve DSCR before applying ─────────────────────────────────
  {
    slug: "how-to-improve-dscr-before-applying",
    date: "June 24, 2026", tag: "Lending",
    title: "How to improve your DSCR before you apply — the four levers with the math",
    summary: "A DSCR that doesn't qualify can often be fixed before you submit. Four concrete levers — rate buydown, interest-only, rent optimization, and down payment — with the numbers on each one.",
    body: [
      { p: "A preliminary DSCR of 0.92x doesn't mean the deal is dead. It often means you haven't pulled the available levers yet. DSCR is a ratio — you can improve it from either direction: raise the numerator (rent) or lower the denominator (PITIA). Here are the four most effective approaches, with the actual math on each." },
      { h: "Lever 1: Buy down the rate (lower PITIA)" },
      { p: "Every 0.25% reduction in interest rate reduces P&I by roughly $15–17 per $100,000 of loan amount on a 30-year fixed. On a $400,000 loan, a 0.50% rate buydown saves approximately $120–135/month in P&I." },
      { p: "Example: 0.92x DSCR at 7.50%, $2,200/month rent, $2,391/month PITIA. Buy down 0.50% to 7.00%: P&I drops ~$130/month → new PITIA ~$2,261 → new DSCR 0.97x. Still short of 1.00x, but now the gap is smaller and a second lever closes it." },
      { p: "Discount points cost roughly 1% of loan amount per 0.25% of rate reduction, though the exact cost varies by lender and market. On a $400K loan, buying down 0.50% costs approximately $8,000 at the table. The DSCR improvement is permanent; the cost is a one-time closing expense." },
      { h: "Lever 2: Switch to interest-only (IO)" },
      { p: "An interest-only loan eliminates the principal reduction component of P&I, which reduces the monthly payment materially. On a $400,000 loan at 7.50%: fully amortizing 30-yr payment = $2,797/month. IO payment at the same rate = $2,500/month. The IO option saves $297/month — almost 11% of the payment." },
      { p: "DSCR impact: that $297/month reduction directly raises DSCR. On the same $2,200/month rent example above (adding the non-P&I PITIA components back): a deal that fails at 0.92x on a fully amortizing structure may qualify at 1.05x IO." },
      { p: "Interest-only availability, credit and LTV conditions, pricing, caps, and jurisdictional treatment vary by lender. Model an IO scenario using the lender's current written terms, including the post-IO payment, before treating it as an option." },
      { h: "Lever 3: Raise the qualifying rent" },
      { p: "The qualifying income is the lower of the signed lease and the 1007 appraisal rent. Three approaches to improving this figure:" },
      { list: [
        "Market rent analysis before the appraisal: if you believe the market rent in your area is higher than a basic 1007 analysis would show, provide the appraiser with recent comparable rental data before they inspect. Appraisers are required to consider evidence — they're not required to solicit it.",
        "Lease at market rate before closing: if the property is vacant and you can attract a tenant at a lease rate above the expected 1007, sign the lease before the appraisal. The lender uses the lower of lease and 1007 — so a lease at or above market rent doesn't hurt, and helps if it's above the 1007 estimate.",
        "STR documentation (if eligible): if the property qualifies for STR underwriting and has 12 months of documented history, that documented income × 75% may exceed the 1007 long-term rent. See the STR qualifying income article for the full logic.",
      ]},
      { h: "Lever 4: Increase the down payment" },
      { p: "A larger down payment reduces the loan balance, which reduces P&I, which raises DSCR. The math: increasing down payment from 20% to 25% on a $500,000 purchase reduces the loan from $400,000 to $375,000 — a $25,000 reduction. At 7.50%, that saves approximately $174/month in P&I." },
      { p: "On a tight deal, this lever is often the cleanest: no rate negotiation required, no IO program qualification, no lease coordination. The tradeoff is liquidity — the investor needs the extra capital at closing, and it reduces the initial cash-on-cash return on the equity deployed." },
      { p: "Also note: moving from 80% to 75% LTV qualifies the file for the better LTV rate tier, which saves an additional 0.25–0.50% — a compounding benefit beyond just the P&I reduction from the smaller balance." },
      { h: "Combining levers" },
      { p: "Most deals that get from sub-1.0 to qualifying use a combination. Example: 0.92x deal on a $400K loan, $2,200 rent." },
      { list: [
        "Move to 75% LTV (put down an extra $20K): saves ~$87/month P&I + rate tier improvement ~0.375% ≈ $100/month additional → cumulative ~$187/month.",
        "Accept IO at 75% LTV: saves another ~$260/month.",
        "Combined: PITIA drops from the original $2,391 to roughly $1,944 → DSCR = $2,200 ÷ $1,944 = 1.13x. From 0.92x to 1.13x without touching the rent.",
      ]},
      { quote: "DSCR improvement is arithmetic. Identify which component of PITIA is largest, and decide which lever(s) move it most efficiently given the investor's capital and risk tolerance." },
    ],
    glyph: "↑", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  // ── INVESTOR DECISION GUIDES (added 2026-07-18) ────────────────────────────
  {
    slug: "interest-only-dscr-loan-payment-math",
    date: "July 18, 2026", tag: "Lending",
    title: "Interest-only DSCR loans: lower payment now, higher reset risk later",
    summary: "An interest-only period can improve qualifying DSCR and near-term cash flow, but the principal balance does not decline. Model the payment during interest-only, after recast, and at your planned exit before choosing it.",
    metaDescription: "See how an interest-only DSCR loan changes payment, qualifying ratio, equity buildup, and reset risk with a worked $300,000 loan example before choosing terms.",
    primaryKeyword: "interest-only DSCR loan",
    readTime: "7 min read",
    body: [
      { p: "An interest-only DSCR loan requires scheduled payments that cover interest, but not principal, for a defined period. That lower initial payment can raise the property's qualifying DSCR because the principal-and-interest portion of PITIA is smaller. The tradeoff is equally direct: the loan balance does not decline during the interest-only period, and the required payment may rise when amortization begins." },
      { h: "The 30-second answer" },
      { quote: "Use interest-only when the early payment relief has a specific job and the deal still works after the interest-only period ends. Do not underwrite the acquisition as if the introductory payment lasts forever." },
      { h: "How an interest-only DSCR loan changes the payment" },
      { p: "The monthly interest-only payment is loan balance × annual note rate ÷ 12. On a $300,000 loan at a fixed 7.50% note rate, that is $1,875 per month. The fully amortizing principal-and-interest payment on the same balance, rate, and 30-year schedule is about $2,098 per month. Interest-only reduces the initial payment by about $223 in this illustration." },
      { p: "Taxes, insurance, and association dues do not disappear. If those non-debt PITIA items total $500 per month and gross rent is $3,000, the illustrative DSCR is 1.26x with the $1,875 interest-only payment, versus 1.15x with the $2,098 amortizing payment. Run the calculation with the lender's actual qualifying payment; program rules can differ." },
      { h: "What happens when the interest-only period ends" },
      { p: "Suppose the same $300,000 loan allows interest-only payments for 10 years and then amortizes over the remaining 20 years at the same 7.50% rate. The principal-and-interest payment becomes about $2,417 per month. That is roughly $542, or 29%, above the interest-only payment. With the same $500 of taxes, insurance, and dues, the DSCR falls from 1.26x to about 1.03x if rent has not changed." },
      { p: "This is a recast risk, not a rate forecast. If the note is adjustable, a future index and margin may create an additional rate change. The Consumer Financial Protection Bureau also cautions borrowers not to assume a refinance or sale will be available when the payment rises." },
      { h: "The three-case test before choosing interest-only" },
      { list: [
        "Case 1 — Today: calculate DSCR using the lender's actual interest-only qualifying payment and current taxes, insurance, and HOA dues.",
        "Case 2 — Recast: calculate the payment over the remaining amortization term, even if you expect to refinance before then.",
        "Case 3 — Stress: repeat the recast case with lower rent, higher insurance, and a higher rate if the loan can adjust or must be refinanced.",
      ]},
      { h: "When the structure can fit" },
      { list: [
        "A renovation or lease-up plan has a defined timeline and the saved cash stays in the property reserve account.",
        "The investor values near-term liquidity and has a documented refinance, sale, or principal-paydown decision date.",
        "The deal qualifies on the future amortizing payment, not only on the introductory payment.",
        "The hold-period model shows enough equity from appreciation or planned paydown without relying on scheduled amortization.",
      ]},
      { h: "When an amortizing loan is usually the cleaner choice" },
      { list: [
        "The acquisition only works at the interest-only payment and has little room for rent or expense variance.",
        "The investment thesis depends on automatic principal reduction to build equity.",
        "The exit date is uncertain or a prepayment penalty could block the planned refinance.",
        "The payment after recast would push the property below the investor's minimum coverage target.",
      ]},
      { h: "Frequently asked questions" },
      { q: "Does interest-only mean the balance grows?" },
      { p: "Not when every required interest payment is made in full. The scheduled balance stays level because no principal is repaid. That differs from negative amortization, where unpaid interest can be added to the balance." },
      { q: "Does every lender calculate qualifying DSCR from the interest-only payment?" },
      { p: "No. Eligibility, qualifying-payment treatment, maximum leverage, and interest-only duration are program-specific. Ask for the exact payment the lender will use before treating the DSCR improvement as real." },
      { q: "Can you pay extra principal during the interest-only period?" },
      { p: "Often, but the note and servicing rules control how extra principal is applied and whether the scheduled payment changes. Confirm the process and check the loan's prepayment terms before making a large paydown." },
      { h: "Model the payment path, not just month one" },
      { p: "An interest-only DSCR loan is a cash-flow structure, not free savings. Compare the initial payment, future amortizing payment, stressed payment, remaining balance, and exit costs side by side. If the deal survives all five, the lower early payment can be useful rather than merely comfortable." },
      { links: [
        { label: "Model your rent and PITIA in the DSCR calculator", href: "/dscr-calculator" },
        { label: "Stress-test the acquisition before committing", href: "/tools/decision-support" },
        { label: "CFPB: What is an interest-only loan?", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-an-interest-only-loan-en-101/" },
        { label: "CFPB Regulation Z: interest-only definition and disclosures", href: "https://www.consumerfinance.gov/rules-policy/regulations/1026/18/" },
      ]},
    ],
    glyph: "IO", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loan-closing-costs-cash-to-close",
    date: "July 18, 2026", tag: "Process",
    title: "DSCR loan closing costs: build a complete cash-to-close budget",
    summary: "Closing costs are more than lender points. Budget lender charges, appraisal and title work, government fees, prepaid expenses, escrow deposits, and reserves separately from the down payment.",
    metaDescription: "Build a DSCR loan closing-cost budget covering points, appraisal, title, prepaids, escrow, reserves, and the difference between costs and cash to close.",
    primaryKeyword: "DSCR loan closing costs",
    readTime: "8 min read",
    body: [
      { p: "DSCR loan closing costs are the lender, third-party, government, and prepaid charges needed to close an investment-property mortgage. Cash to close is broader: it starts with the down payment, adds closing costs and required reserves, then subtracts deposits, credits, and other adjustments. Keeping those buckets separate prevents a deal from qualifying on paper while running short of liquidity at settlement." },
      { h: "The 30-second answer" },
      { quote: "Budget four separate cash buckets: equity, transaction costs, prepaid ownership costs, and post-close reserves. A lender quote that shows only rate and points is not a complete cash-to-close estimate." },
      { h: "Bucket 1: lender charges and points" },
      { list: [
        "Origination or lender points: each point equals 1% of the loan amount. Confirm whether a charge buys a lower rate or is an origination fee.",
        "Underwriting, processing, administration, document, and rate-lock charges: labels vary, so compare the total lender charges across offers.",
        "Broker compensation, when applicable: confirm whether it is paid by the borrower, lender, or through the offered rate.",
      ]},
      { p: "Do not compare two quotes by note rate alone. Put loan amount, note rate, total points, all lender charges, prepayment terms, and monthly payment on one line for each option." },
      { h: "Bucket 2: third-party and government charges" },
      { list: [
        "Appraisal and appraisal-management charges, plus any rent schedule or property-specific report required by the lender.",
        "Title search, lender's title policy, settlement or escrow services, and attorney charges where local practice requires them.",
        "Credit, flood, tax-service, entity-document, and recording charges.",
        "Transfer, mortgage, documentary, or similar taxes that apply in the property jurisdiction.",
      ]},
      { p: "Some settlement services may be shoppable and others may be selected by the lender. The Consumer Financial Protection Bureau recommends comparing the bottom-line title-services total, not one attractive line item surrounded by higher ancillary fees." },
      { h: "Bucket 3: prepaids and escrow funding" },
      { list: [
        "Daily interest from the closing date through the end of that month.",
        "The first hazard, wind, or flood insurance premium when it is collected before or at closing.",
        "Property-tax and insurance deposits used to establish an escrow account, when the loan escrows those items.",
        "Association dues, tax prorations, or other ownership charges allocated between buyer and seller at settlement.",
      ]},
      { p: "These amounts are not the same as lender fees. They are timing costs associated with owning the property or starting the escrow account, and they can change with the closing date, insurance quote, tax calendar, and local settlement practice." },
      { h: "Bucket 4: reserves that must remain after closing" },
      { p: "A reserve requirement is not necessarily paid to the lender, but it still affects how much verified liquidity the borrower needs. Ask whether the lender measures reserves in months of principal, interest, taxes, insurance, and association dues; whether other financed properties add reserve requirements; and which accounts or asset types are eligible." },
      { h: "A worked cash-to-close worksheet" },
      { p: "Consider a purely illustrative $500,000 purchase with a $375,000 loan and $125,000 down payment. Assume $5,625 of lender points and charges, $1,000 of appraisal and verification charges, $3,600 of title and settlement charges, $1,100 of recording and transfer charges, and $5,200 of prepaids and escrow funding. Closing costs total $16,525 before credits. If the buyer already deposited $10,000 of earnest money and receives no credits, estimated cash due at settlement is $131,525: $125,000 down payment + $16,525 costs − $10,000 deposit." },
      { p: "Required post-close reserves are then added to the liquidity plan, not silently mixed into the settlement number. For example, six months of $2,800 PITIA would require $16,800 of eligible assets remaining after closing if that were the applicable lender rule. All figures in this example are assumptions, not market averages or a quote." },
      { h: "Five questions to ask before paying for the appraisal" },
      { list: [
        "What is the total lender charge in dollars and points, and which portion changes the rate?",
        "Which third-party services can I shop, and which provider list must I use?",
        "What tax, insurance, association, and escrow assumptions are in the estimate?",
        "What assets must remain after closing, and how will they be documented?",
        "Which terms or costs can change if the appraisal, DSCR, loan amount, entity, or closing date changes?",
      ]},
      { h: "Frequently asked questions" },
      { q: "Are closing costs included in the down payment?" },
      { p: "No. The down payment is the buyer's equity contribution. Closing costs are separate charges and prepaids. Both affect cash to close, along with deposits, seller or lender credits, prorations, and any financed costs permitted by the program." },
      { q: "Can a lender credit make closing free?" },
      { p: "No. A lender credit reduces upfront cash but is generally exchanged for a higher interest rate. Compare total cost over the expected hold period, not only the amount due on closing day." },
      { q: "Why can cash to close change before settlement?" },
      { p: "Loan terms, prorations, prepaid interest, insurance, tax and escrow figures, credits, and the closing date can all change the final amount. Ask for a line-by-line explanation of every revision and verify wiring instructions through a trusted contact." },
      { h: "Build the liquidity plan before the file is submitted" },
      { p: "A reliable DSCR loan closing-cost budget uses real lender, title, tax, and insurance inputs as soon as they are available. Keep a contingency outside the required reserves, update the worksheet after every material loan change, and compare the final settlement figures with the last accepted estimate before wiring funds." },
      { links: [
        { label: "Review the DSCR loan document checklist", href: "/blog/dscr-loan-document-checklist" },
        { label: "Calculate the property's PITIA and DSCR", href: "/dscr-calculator" },
        { label: "CFPB: Costs that come with a mortgage", href: "https://www.consumerfinance.gov/ask-cfpb/what-costs-come-with-taking-out-a-mortgage-en-153/" },
        { label: "CFPB: Shop for title insurance and closing services", href: "https://www.consumerfinance.gov/owning-a-home/close/shop-for-title-insurance-and-other-closing-services/" },
      ]},
    ],
    glyph: "$", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loan-points-break-even",
    date: "July 18, 2026", tag: "Rates",
    title: "DSCR loan points: calculate the break-even before buying down the rate",
    summary: "One point costs 1% of the loan amount, but it does not buy a fixed rate reduction. Compare same-day offers and divide the extra upfront cost by monthly savings to find the simple break-even month.",
    metaDescription: "Learn how DSCR loan points work, compare rate-buydown options, and calculate a simple break-even month with a worked $400,000 loan example before you lock.",
    primaryKeyword: "DSCR loan points",
    readTime: "7 min read",
    body: [
      { p: "DSCR loan points are upfront charges expressed as a percentage of the loan amount. One point equals 1% of the loan: $4,000 on a $400,000 balance. A discount point may buy a lower note rate, while an origination point may compensate the lender or broker. The label and economic purpose matter, so ask for the dollar amount and rate effect of every point." },
      { h: "The 30-second answer" },
      { quote: "Break-even months = extra upfront cost ÷ monthly payment savings. Pay points only when the expected time to sale, refinance, or payoff extends comfortably beyond that break-even date." },
      { h: "A point has a fixed cost, not a fixed rate reduction" },
      { p: "The Consumer Financial Protection Bureau defines one point as 1% of the loan amount and notes that the rate reduction depends on the lender, loan type, and market. That means rules of thumb such as 'one point always lowers the rate by 0.25%' are not dependable. Compare written options from the same lender at the same time, with the same loan structure and prepayment terms." },
      { h: "Worked example: one point for a 0.25% lower rate" },
      { p: "Assume two illustrative 30-year fixed options on a $400,000 loan. Option A is 7.50% with zero discount points and has a principal-and-interest payment of about $2,797. Option B is 7.25% with one discount point, costs $4,000 upfront, and has a payment of about $2,729. Monthly savings are about $68." },
      { p: "The simple break-even is $4,000 ÷ $68, or about 59 months. Keeping the loan past month 59 allows the cumulative nominal payment savings to exceed the point cost. Selling, refinancing, or paying off earlier means the rate buy-down has not recovered its upfront cost in this simplified comparison." },
      { h: "How points change DSCR" },
      { p: "Suppose gross monthly rent is $3,200 and taxes, insurance, and HOA dues total $500. Option A produces illustrative PITIA of about $3,297 and DSCR of 0.97x. Option B produces PITIA of about $3,229 and DSCR of 0.99x. The point improves coverage, but not enough to cross 1.00x in this example. Never assume a rate buy-down solves a qualification gap until the full PITIA is recalculated." },
      { h: "Use a hold-period comparison, not one break-even number" },
      { list: [
        "Short case: planned sale or refinance before the simple break-even. The lower upfront-cost option usually preserves more flexibility.",
        "Base case: expected hold extends beyond break-even. Compare cumulative savings, remaining balance, and any prepayment charge through that month.",
        "Long case: hold to maturity or a long-term payoff date. Compare total interest and the opportunity cost of the cash used for points.",
        "Stress case: the planned refinance is delayed. Confirm the current loan remains affordable and does not create an exit problem.",
      ]},
      { h: "Points, lender credits, and origination charges are different levers" },
      { list: [
        "Discount points: more cash at closing in exchange for a lower rate on the compared loan option.",
        "Lender credits: less cash at closing in exchange for a higher rate.",
        "Origination charges: the cost of making or arranging the loan; they do not necessarily reduce the rate.",
      ]},
      { p: "Ask the loan officer to show at least three same-day structures: a lower-rate option with points, a zero-discount-point option, and a lender-credit option. Compare cash to close, monthly payment, DSCR, prepayment terms, and total cost at your likely exit month." },
      { h: "Tax treatment needs its own review" },
      { p: "For rental property, the Internal Revenue Service says points that are prepaid interest generally are not fully deducted in the year paid and may need to be deducted over the loan term under original-issue-discount rules. Other mortgage-obtaining costs and settlement charges can receive different treatment. Keep the final settlement statement and ask a qualified tax professional how the specific charges apply to your entity and transaction." },
      { h: "Frequently asked questions" },
      { q: "Do points count in DSCR?" },
      { p: "Points do not enter the monthly rent ÷ PITIA formula directly. They affect DSCR only if they change the note rate and monthly qualifying payment. They still affect cash to close and the investment's return on cash." },
      { q: "Should I pay points if I expect to refinance?" },
      { p: "Only after comparing the expected refinance date with the point break-even and any prepayment penalty. A lower rate today can still be the expensive option if the loan is replaced before the upfront cost is recovered." },
      { q: "Does one point always lower the rate by 0.25%?" },
      { p: "No. One point always describes a cost equal to 1% of the loan amount, but the rate reduction is not fixed. It depends on the lender, loan structure, and market when the options are quoted." },
      { h: "Make the point decision with an exit date" },
      { p: "DSCR loan points are a timing tradeoff. Convert points to dollars, measure the exact payment difference, calculate break-even, then test that result against the earliest, most likely, and latest payoff dates. The best option is the one that matches the deal's realistic hold period and liquidity plan." },
      { links: [
        { label: "Compare PITIA scenarios in the DSCR calculator", href: "/dscr-calculator" },
        { label: "Check refinance timing and break-even", href: "/tools/refi-tracker" },
        { label: "CFPB: How points and lender credits work", href: "https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/" },
        { label: "IRS Publication 527: rental-property expenses and points", href: "https://www.irs.gov/publications/p527" },
      ]},
    ],
    glyph: "1%", glyphColor: dc.cream, bg: dc.rain,
    author: "Greenstreet Research",
    featured: false,
  },
  // ── EVERGREEN DSCR FIELD GUIDES (added 2026-07-18) ──────────────────────
  {
    slug: "dscr-vs-rental-property-cash-flow",
    date: "July 18, 2026", tag: "Analysis",
    title: "DSCR vs rental-property cash flow: calculate both before you buy",
    summary: "DSCR tests rent against PITIA; cash flow subtracts the rest of the property's operating costs too. A deal can pass one test and fail the other, so investors should model both.",
    metaDescription: "Compare DSCR vs rental-property cash flow with formulas, a worked example, and a practical expense checklist so you can judge qualification and returns.",
    primaryKeyword: "DSCR vs cash flow",
    readTime: "7 min read",
    body: [
      { p: "DSCR and rental-property cash flow answer different questions. DSCR measures the property's gross eligible rent against PITIA—the qualifying principal, interest, taxes, insurance, and association dues. Cash flow measures what remains after debt service and the operating costs the DSCR formula may not include. Calculate both before treating a lender approval as an investment decision." },
      { h: "The 30-second answer" },
      { quote: "DSCR is a financing coverage ratio. Cash flow is an ownership result. A property can show acceptable DSCR while losing money after vacancy, management, repairs, utilities, and capital spending." },
      { h: "The two formulas" },
      { p: "A common screening formula is DSCR = eligible monthly rent ÷ monthly PITIA. Investor cash flow is gross collected rent minus vacancy and credit loss, operating expenses, and full debt service. Exact lender definitions vary, especially for eligible rent and association dues, so use the program's formula for qualification and a separate operating model for the investment." },
      { h: "Worked example: a passing ratio with negative cash flow" },
      { p: "Assume monthly rent of $3,000 and PITIA of $2,400. The illustrative DSCR is 1.25x. Now add $240 for management, $150 for vacancy, $250 for repairs and capital reserves, and $100 for owner-paid utilities. Those additional costs total $740, producing estimated cash flow of negative $140 per month: $3,000 − $2,400 − $740." },
      { p: "This does not mean the lender's DSCR is wrong. It means the ratio and the investor model have different purposes. The ratio screens debt coverage under the lender's rules; the cash-flow model decides whether the property meets your return and risk targets." },
      { h: "Build the operating budget line by line" },
      { list: [
        "Vacancy and nonpayment: use a property- and market-specific assumption rather than treating every scheduled dollar as collected.",
        "Repairs and maintenance: include recurring service, turnover work, and smaller replacements.",
        "Capital expenditures: reserve separately for roofs, HVAC, appliances, paving, and other long-lived items.",
        "Management and leasing: include the economic cost even if you plan to self-manage.",
        "Owner-paid utilities, landscaping, pest control, licenses, bookkeeping, and local compliance costs.",
      ]},
      { h: "Three versions of the deal to model" },
      { list: [
        "Lender case: eligible rent and PITIA exactly as the loan program defines them.",
        "Base case: realistic collected rent and a complete operating budget based on current evidence.",
        "Stress case: lower rent or occupancy plus higher insurance, taxes, repairs, and financing costs.",
      ]},
      { p: "The Internal Revenue Service lists common rental expenses such as maintenance, insurance, taxes, and interest, but a tax return and a cash-flow forecast are not the same calculation. Principal payments, depreciation, capital improvements, and entity-specific tax treatment require separate handling. Keep the operating model focused on cash and ask a qualified tax adviser about reporting." },
      { h: "Frequently asked questions" },
      { q: "Is a higher DSCR always a better investment?" },
      { p: "No. A higher ratio generally indicates more rent coverage relative to PITIA, but it does not measure purchase price, renovation risk, operating expenses, appreciation assumptions, or return on invested cash." },
      { q: "Should reserves count as an expense?" },
      { p: "Reserve contributions are useful in an investor cash plan even when the cash has not yet been spent. Keeping them visible prevents a smooth month from hiding future roof, HVAC, or turnover costs." },
      { q: "Which number determines loan approval?" },
      { p: "The lender applies its own DSCR and program rules. Your broader cash-flow model is still essential because approval does not guarantee the property will produce positive cash flow." },
      { h: "Use both numbers as decision gates" },
      { p: "First confirm that the property fits the lender's coverage test. Then require the base and stress cash-flow cases to meet your own minimum return and liquidity standards. Passing both gates is stronger than optimizing either number alone." },
      { links: [
        { label: "Calculate rent, PITIA, and DSCR", href: "/dscr-calculator" },
        { label: "Model returns and operating cash flow", href: "/tools/returns" },
        { label: "Read the complete DSCR formula guide", href: "/blog/what-is-dscr-how-it-works" },
        { label: "IRS Publication 527: Residential Rental Property", href: "https://www.irs.gov/publications/p527" },
      ]},
    ],
    glyph: "CF", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-appraisal-form-1007-market-rent",
    date: "July 18, 2026", tag: "Appraisal",
    title: "DSCR appraisal and Form 1007: how market rent affects the loan",
    summary: "The appraisal supports property value, while a rent schedule can support market rent. Learn what Form 1007 does, how rent evidence can change DSCR, and how to prepare a clean file.",
    metaDescription: "Learn how a DSCR appraisal and Form 1007 support value and market rent, how rent changes affect the ratio, and what evidence to prepare for review today.",
    primaryKeyword: "DSCR appraisal",
    readTime: "7 min read",
    body: [
      { p: "A DSCR appraisal can affect both sides of the loan decision: the property value may influence maximum loan amount, and the supported market rent may influence the qualifying DSCR. For a one-unit rental, an appraiser may complete the Single-Family Comparable Rent Schedule, commonly called Fannie Mae Form 1007. The lender then applies its own program rules to determine eligible rent." },
      { h: "The 30-second answer" },
      { quote: "Your advertised rent is not automatically the qualifying rent. Underwrite the deal with a conservative rent case, document the actual lease, and understand which appraisal or rent report the lender will require." },
      { h: "What the appraisal and rent schedule do" },
      { p: "The property appraisal develops an opinion of market value based on the assignment and comparable evidence. Form 1007 is a separate rent schedule for a one-unit property that helps support monthly market rent. For two- to four-unit properties, Fannie Mae's conventional framework uses Form 1025, the Small Residential Income Property Appraisal Report. DSCR programs may use these forms or other rent reports under their own guidelines." },
      { h: "Worked example: when supported rent is lower" },
      { p: "Suppose an investor models $2,700 monthly rent and $2,100 PITIA, producing a 1.29x DSCR. If the lender's eligible rent after appraisal review is $2,450, the ratio becomes about 1.17x. A $250 rent difference reduces coverage by roughly 0.12x in this example and may affect leverage, pricing, reserves, or eligibility under the selected program." },
      { p: "Do not assume every lender automatically uses the lower of the lease and market rent, or that all programs apply the same vacancy factor. Ask which documents establish eligible rent and how the lender treats a vacant property, a new lease, below-market rent, or above-market rent." },
      { h: "Prepare useful rent evidence" },
      { list: [
        "Provide the complete, signed lease and any amendments rather than a rent screenshot or unsigned draft.",
        "Create a factual list of nearby rental comparables with address, unit type, lease date, rent, concessions, and source.",
        "Document material property features such as parking, bedroom count, utilities, recent renovation, and accessory units.",
        "Explain current vacancy or lease-up status with dates and supporting records.",
        "Keep short-term-rental projections separate from long-term monthly market-rent evidence.",
      ]},
      { h: "Short-term rentals need special care" },
      { p: "Fannie Mae has explained that Form 1007 is designed to estimate monthly market rent and is not designed to estimate nightly short-term-rental income. A DSCR lender offering an STR program may request operating statements, platform history, third-party market data, or a specialized report. Confirm the exact evidence before paying for the appraisal." },
      { h: "If the rent conclusion looks unsupported" },
      { p: "Review the report for objective errors: wrong unit count, bedroom count, square footage, lease terms, utilities, condition, or incomparable rent data. Submit a concise reconsideration request through the lender with verifiable evidence. Do not contact or pressure the appraiser to reach a target value or rent." },
      { h: "Frequently asked questions" },
      { q: "Is Form 1007 required for every DSCR loan?" },
      { p: "No. Requirements vary by lender, property, occupancy status, and loan program. Ask whether the order includes a rent schedule and what alternatives, if any, the program permits." },
      { q: "Can a signed lease replace market rent?" },
      { p: "Sometimes the lease is part of the eligible-rent analysis, but the lender may also require appraiser-supported market rent and may limit how much of either figure is used. Obtain the rule in writing for the selected program." },
      { q: "Does a higher appraisal automatically raise the loan amount?" },
      { p: "Not necessarily. Loan amount can also be constrained by purchase price, maximum leverage, DSCR, credit, reserves, program caps, and property eligibility." },
      { h: "Order the report only after confirming the scope" },
      { p: "Before the appraisal fee is charged, confirm the property type, required appraisal form, rent-report scope, STR or long-term-rental treatment, and reconsideration process. That five-minute check can prevent the wrong report from becoming an expensive delay." },
      { links: [
        { label: "Calculate the ratio at several rent levels", href: "/dscr-calculator" },
        { label: "Read the STR qualifying-income guide", href: "/blog/dscr-str-airbnb-qualifying-income" },
        { label: "Fannie Mae: Rental Income", href: "https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income" },
        { label: "Fannie Mae: Form 1007 and short-term rentals", href: "https://singlefamily.fanniemae.com/originating-underwriting/appraisers/appraiser-update-june-2024" },
      ]},
    ],
    glyph: "1007", glyphColor: dc.cream, bg: dc.rain,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loan-reserves-liquidity",
    date: "July 18, 2026", tag: "Planning",
    title: "DSCR loan reserves: calculate the liquidity you need after closing",
    summary: "Reserves are verified assets left after closing, not another settlement fee. Learn the months-of-PITIA formula, portfolio questions, and how to build a separate operating cushion.",
    metaDescription: "Calculate DSCR loan reserves with a months-of-PITIA example, separate reserves from cash to close, and build a stronger post-closing liquidity plan today.",
    primaryKeyword: "DSCR loan reserves",
    readTime: "7 min read",
    body: [
      { p: "DSCR loan reserves are eligible assets a lender requires the borrower to retain after closing. They are usually expressed as a number of months of the property's qualifying payment, often PITIA. Reserve rules vary by DSCR program, borrower, property, loan structure, and financed-property count, so the correct amount comes from the selected lender's written guidelines." },
      { h: "The 30-second answer" },
      { quote: "Reserve requirement = required months × qualifying monthly PITIA. Add that figure to the liquidity plan after calculating down payment and closing costs, because the assets generally must remain available after settlement." },
      { h: "Worked example: six months of PITIA" },
      { p: "Assume a qualifying PITIA of $2,650 and an illustrative six-month requirement. Required reserves would be $15,900. If cash to close is $122,000, the borrower would need at least $137,900 of verified eligible assets to cover both figures, before adding a personal contingency. Six months is only an example, not a universal DSCR standard." },
      { h: "Reserves are different from cash to close" },
      { list: [
        "Cash to close is delivered at settlement for equity, fees, prepaids, prorations, and other adjustments.",
        "Required reserves generally remain in eligible accounts after closing and must be documented.",
        "An operating reserve is the investor's own cushion for vacancy, repairs, insurance deductibles, and capital work.",
        "A tax reserve covers future obligations and should not be double-counted as general liquidity.",
      ]},
      { h: "Ask what assets are actually eligible" },
      { p: "Cash in checking or savings is straightforward, but treatment of retirement accounts, securities, business funds, gifts, borrowed funds, cash-out proceeds, and assets held by an entity can vary. Also ask whether the lender applies a percentage reduction to volatile assets and whether funds must be seasoned or transferred before closing." },
      { h: "Portfolio ownership can change the requirement" },
      { p: "Provide a complete schedule of real estate owned early. Some programs add reserves for other financed properties or apply a portfolio formula. For comparison, Fannie Mae's conventional Selling Guide defines reserves as liquid assets available after closing and includes additional requirements tied to the number of financed second homes and investment properties. Those Fannie Mae percentages are conventional rules, not DSCR-program standards." },
      { h: "Build a cushion above the lender minimum" },
      { p: "A lender minimum is an eligibility test, not a complete risk plan. Stress the property for a deductible, one major repair, a turnover, and several months of lower occupancy. Keep enough accessible liquidity to handle the combined event without depending on a future refinance, sale, or credit-line approval." },
      { list: [
        "Confirm the exact PITIA amount used for the reserve calculation.",
        "Separate settlement funds, lender-required reserves, renovation funds, and emergency cash.",
        "Avoid moving large sums between accounts without preserving the statements and source trail.",
        "Recalculate after rate, loan amount, taxes, insurance, HOA dues, or closing costs change.",
      ]},
      { h: "Frequently asked questions" },
      { q: "Are reserves paid to the lender?" },
      { p: "Usually reserves are verified assets retained by the borrower, not a fee paid at closing. Escrow deposits for taxes and insurance are different: those funds may be collected at settlement and held by the servicer." },
      { q: "Can the same dollars cover closing and reserves?" },
      { p: "Only the assets remaining after the transaction can satisfy a post-closing reserve test. The lender's asset analysis subtracts the required funds to close before measuring what remains." },
      { q: "Do more rental properties always require more reserves?" },
      { p: "Not always, but portfolio size and financed-property exposure can affect the calculation. Disclose every property and mortgage so the requirement is known before underwriting." },
      { h: "Treat liquidity as part of the deal structure" },
      { p: "Calculate required reserves before making the offer, then set a separate investor cushion based on the property's actual risks. If closing drains the accounts to the lender minimum, lower leverage, negotiate credits, delay nonessential work, or reconsider the acquisition rather than assuming a perfect first year." },
      { links: [
        { label: "Build the complete cash-to-close budget", href: "/blog/dscr-loan-closing-costs-cash-to-close" },
        { label: "Stress-test the property", href: "/tools/stress-matrix" },
        { label: "Review the approval-issue guide", href: "/blog/dscr-approval-issues-sub-10-fico-reserves" },
        { label: "Fannie Mae: Minimum Reserve Requirements", href: "https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements" },
      ]},
    ],
    glyph: "6M", glyphColor: dc.dark, bg: dc.mintBg,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loan-vs-conventional-investment-property-loan",
    date: "July 18, 2026", tag: "Strategy",
    title: "DSCR loan vs conventional investment-property loan: how to choose",
    summary: "A DSCR program focuses on property rent coverage; a conventional loan typically evaluates borrower income, debts, assets, and agency rules. Compare both paths on qualification and total cost.",
    metaDescription: "Compare a DSCR loan vs conventional investment-property loan by qualification, rental-income treatment, documents, costs, and the investor each path fits.",
    primaryKeyword: "DSCR loan vs conventional loan",
    readTime: "8 min read",
    body: [
      { p: "The practical difference between a DSCR loan and a conventional investment-property loan is the underwriting path. A DSCR program generally centers qualification on eligible property rent divided by PITIA. Conventional underwriting generally evaluates the borrower's verified income, assets, credit, debts, and qualifying rental income within agency or lender rules. Neither path is automatically cheaper or easier for every investor." },
      { h: "The 30-second answer" },
      { quote: "Price both options when you may qualify for both. Choose the loan with the better total fit across approval certainty, cash to close, monthly payment, reserves, prepayment terms, documentation, and expected hold period." },
      { h: "How qualification differs" },
      { p: "Many business-purpose DSCR programs use the property's rental coverage as the central income test and may not require personal employment income to support the mortgage payment. Exact rules still consider credit, leverage, reserves, property eligibility, entity structure, and transaction purpose." },
      { p: "For consumer mortgages covered by the ability-to-repay rule, the Consumer Financial Protection Bureau says lenders generally must find out, consider, and document income, assets, employment, credit history, and monthly expenses. Conventional loans are not government-insured; conforming conventional loans also follow Fannie Mae or Freddie Mac eligibility standards." },
      { h: "Rental-income treatment is not interchangeable" },
      { p: "Under Fannie Mae's current conventional guidance, qualifying rent supported by a lease or Forms 1007 or 1025 is generally multiplied by 75%, with the remaining 25% absorbing vacancy and maintenance. A DSCR lender may use a different eligible-rent percentage, valuation source, and ratio threshold. Never move a rent figure from one program worksheet into the other without applying that program's rules." },
      { h: "Compare the complete economics" },
      { list: [
        "Rate and points: use written, same-day quotes for the same loan amount and lock period.",
        "Equity and reserves: compare maximum leverage, post-closing liquidity, and portfolio requirements.",
        "Payment: include principal, interest, taxes, insurance, HOA dues, and any interest-only reset.",
        "Exit flexibility: review prepayment penalties, refinance assumptions, and sale timing.",
        "Documentation cost: consider the time and uncertainty of income, tax-return, lease, appraisal, and entity review.",
      ]},
      { h: "When a DSCR path may fit better" },
      { list: [
        "The property has strong rent coverage but the investor's taxable income does not reflect current cash-generating capacity.",
        "The borrower is self-employed or building a portfolio and values property-level underwriting.",
        "The transaction is a legitimate non-owner-occupied, business-purpose investment under the program.",
      ]},
      { h: "When a conventional path may fit better" },
      { list: [
        "The borrower has straightforward qualifying income and can satisfy conventional debt-to-income requirements.",
        "The available conventional quote has materially better total cost or exit flexibility.",
        "The property, occupancy, loan size, and documentation fit conforming rules without forcing the deal into a niche program.",
      ]},
      { h: "A clean comparison process" },
      { p: "Give both loan professionals the same purchase price, loan amount, property details, rent evidence, credit assumptions, desired lock period, and closing date. Request the official Loan Estimate when applicable and a complete written term summary for any business-purpose loan. Compare cash at closing and total cost at the expected exit month—not promotional rate alone." },
      { h: "Frequently asked questions" },
      { q: "Is a DSCR loan always a no-income loan?" },
      { p: "It generally uses property cash flow rather than employment income as the central repayment measure, but documentation and eligibility still apply. The lender may verify assets, credit, entity records, experience, rent, and transaction purpose." },
      { q: "Are DSCR rates always higher than conventional rates?" },
      { p: "No universal spread applies. Pricing changes with market conditions and deal characteristics. Compare same-day quotes including points, fees, prepayment terms, and required equity." },
      { q: "Can an owner-occupied home use a DSCR investment loan?" },
      { p: "A business-purpose DSCR program is designed for non-owner-occupied investment property. Intended occupancy must be accurate; owner-occupied financing follows different consumer and program rules." },
      { h: "Select the underwriting path that matches the facts" },
      { p: "Start with the property's rent coverage and the borrower's conventional qualification profile. If both work, compare total economics. If only one works, verify that the transaction genuinely fits that program instead of changing occupancy, income, or lease facts to force an approval." },
      { links: [
        { label: "Calculate property-level DSCR", href: "/dscr-calculator" },
        { label: "Prepare the DSCR document file", href: "/blog/dscr-loan-document-checklist" },
        { label: "CFPB: Conventional loans", href: "https://www.consumerfinance.gov/owning-a-home/conventional-loans/" },
        { label: "CFPB: Ability-to-repay rule", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-the-ability-to-repay-rule-en-1787/" },
        { label: "Fannie Mae: Rental Income", href: "https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income" },
      ]},
    ],
    glyph: "VS", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "first-dscr-loan-first-time-investor-guide",
    date: "July 18, 2026", tag: "Process",
    title: "Your first DSCR loan: a step-by-step guide for new investors",
    summary: "A first DSCR loan is easier to manage when qualification, cash to close, appraisal, insurance, entity records, and reserves are planned before the purchase contract.",
    metaDescription: "Follow the first DSCR loan process from deal screening and prequalification through appraisal, underwriting, reserves, closing, and post-close setup today.",
    primaryKeyword: "first DSCR loan",
    readTime: "8 min read",
    body: [
      { p: "For a first DSCR loan, begin with the property—not a rate advertisement. Estimate supportable rent, calculate full PITIA, test cash flow, build cash to close, and confirm that the transaction is a non-owner-occupied investment. Then obtain a program-specific prequalification before the appraisal and closing clock begin." },
      { h: "The 30-second roadmap" },
      { quote: "Screen the deal, verify the program, document the borrower and property, complete appraisal and rent review, clear underwriting conditions, verify final cash and reserves, then close and protect the post-close liquidity plan." },
      { h: "Step 1: screen the property" },
      { p: "Use conservative market rent and include principal, interest, property taxes, hazard insurance, flood or wind coverage where relevant, and association dues. Then model vacancy, management, repairs, capital expenditures, and owner-paid utilities separately. This produces both lender-style DSCR and investor cash flow." },
      { h: "Step 2: define the cash plan" },
      { p: "Separate the down payment, lender and third-party closing costs, prepaid taxes and insurance, escrow deposits, renovation funds, required post-close reserves, and your own emergency cushion. Do not use the same dollars twice. Leave room for an appraisal-based loan reduction or a higher insurance premium." },
      { h: "Step 3: request a specific prequalification" },
      { list: [
        "Provide the property address, price, expected rent, lease status, taxes, insurance estimate, HOA dues, and requested loan amount.",
        "Disclose credit, real-estate ownership, liquidity, entity structure, citizenship or residency facts, and investment experience accurately.",
        "Ask for the assumed rate, points, DSCR method, maximum leverage, reserve rule, appraisal scope, prepayment terms, and closing timeline.",
      ]},
      { h: "Step 4: control the contract and appraisal window" },
      { p: "A prequalification is not final approval. Use appropriate financing, appraisal, title, inspection, and insurance protections with advice from qualified local professionals. Confirm whether the appraisal order includes Form 1007, Form 1025, or another rent report before authorizing the fee." },
      { h: "Step 5: submit a clean underwriting file" },
      { p: "Typical requests can include identification, entity formation and good-standing records, operating agreement, asset statements, real-estate schedule, purchase contract, leases, insurance quote, title information, and letters explaining unusual deposits or credit events. Requirements vary, but complete and consistent documents reduce avoidable follow-up." },
      { h: "Step 6: clear conditions without changing the deal" },
      { p: "Avoid new debt, unexplained transfers, entity changes, new leases, or renovation work during underwriting unless the lender reviews the change first. Track every condition with owner, due date, and status. Recalculate DSCR and cash to close whenever rate, rent, value, taxes, insurance, HOA dues, or loan amount changes." },
      { h: "Step 7: verify the closing package" },
      { list: [
        "Match the note rate, payment structure, loan amount, points, fees, prepayment terms, and maturity to the accepted quote.",
        "Confirm final cash to close and assets remaining afterward.",
        "Verify wiring instructions through a trusted, independently sourced phone number.",
        "Save the signed loan, title, insurance, lease, appraisal, entity, and settlement records in one secure file.",
      ]},
      { h: "Frequently asked questions" },
      { q: "Can a first-time investor qualify for a DSCR loan?" },
      { p: "Some programs accept first-time investors and others add leverage, reserve, credit, property, or experience limits. Disclose the lack of experience early and obtain the exact program rule." },
      { q: "Is an LLC required?" },
      { p: "Not universally. Vesting and personal-guaranty rules vary by lender, state, and transaction. Coordinate lender requirements with legal and tax advice before forming or changing an entity." },
      { q: "How long does a first DSCR loan take?" },
      { p: "There is no universal timeline. Appraisal complexity, title, insurance, borrower response time, entity records, and underwriting conditions all matter. Set the contract date from the lender's realistic file-specific schedule." },
      { h: "Make the first closing repeatable" },
      { p: "The best result is not only a closed loan. It is a reusable process: one deal model, one document checklist, one condition tracker, and one post-close operating system. That discipline makes the next acquisition easier to evaluate and finance." },
      { links: [
        { label: "Start with the DSCR calculator", href: "/dscr-calculator" },
        { label: "Use the complete document checklist", href: "/blog/dscr-loan-document-checklist" },
        { label: "See what happens after prequalification", href: "/blog/dscr-loan-process-after-prequalify" },
        { label: "Build a cash-to-close budget", href: "/blog/dscr-loan-closing-costs-cash-to-close" },
      ]},
    ],
    glyph: "01", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loans-duplex-triplex-fourplex",
    date: "July 18, 2026", tag: "Property Types",
    title: "DSCR loans for duplexes, triplexes, and fourplexes: what changes",
    summary: "Small multifamily DSCR analysis combines unit-level rent evidence with one property-level payment. Learn the appraisal, vacancy, utility, and lease questions to resolve early.",
    metaDescription: "Learn how DSCR loans for duplexes, triplexes, and fourplexes handle unit rents, appraisal, vacancy, PITIA, utilities, and small-multifamily risk for buyers.",
    primaryKeyword: "DSCR loans for duplexes",
    readTime: "8 min read",
    body: [
      { p: "DSCR loans for duplexes, triplexes, and fourplexes generally compare eligible rent from the property against one qualifying PITIA payment. The arithmetic is familiar, but each unit adds rent evidence, lease status, condition, utility responsibility, and vacancy risk. Confirm that the DSCR program accepts the property type before ordering the appraisal." },
      { h: "The 30-second answer" },
      { quote: "Calculate property-level DSCR from lender-eligible unit rents, then run a separate cash-flow stress test with one unit vacant. Small multifamily income is diversified, but a single vacancy can still remove 25% to 50% of scheduled rent." },
      { h: "Worked duplex example" },
      { p: "Assume Unit A rents for $1,400 and Unit B for $1,300, for $2,700 total monthly rent. With PITIA of $2,250, the illustrative DSCR is 1.20x. If Unit B becomes vacant and only $1,400 is collected, the investor's rent-to-PITIA coverage falls to 0.62x before repairs, utilities, or management. The lender's qualifying method may still use supported market rent, but the investor must plan for actual vacancy." },
      { h: "Document every unit separately" },
      { list: [
        "Current lease, amendments, start and end dates, monthly rent, concessions, deposits, and payment history.",
        "Occupancy status and the date any vacant unit became available.",
        "Bedroom and bathroom count, condition, square footage, parking, storage, and included appliances.",
        "Which utilities are separately metered and which costs remain with the owner.",
        "Any legal-unit, permit, zoning, or certificate-of-occupancy documentation requested by the lender or appraiser.",
      ]},
      { h: "Understand the appraisal and rent report" },
      { p: "In Fannie Mae's conventional framework, Form 1025 is the Small Residential Income Property Appraisal Report for two- to four-unit properties. It includes unit information and income analysis. A DSCR lender may use Form 1025 or another appraisal scope, and its eligible-rent calculation may differ from Fannie Mae's conventional 75% treatment. Ask what will be ordered and how vacant, owner-used, or below-market units are handled." },
      { h: "Expenses can differ from a single-family rental" },
      { list: [
        "Common-area electricity, water, sewer, trash, landscaping, snow removal, and pest control may remain owner obligations.",
        "Insurance and replacement cost can change with unit count, property configuration, and local risk.",
        "Turnover may occur more frequently because each unit has a separate lease cycle.",
        "Shared roofs, foundations, mechanical systems, driveways, and utility lines create concentrated capital needs.",
      ]},
      { h: "Do not confuse investment occupancy with house hacking" },
      { p: "A business-purpose DSCR loan is intended for non-owner-occupied investment property. Living in one unit changes the occupancy facts and may require a different consumer mortgage program. State intended occupancy accurately and compare owner-occupied small-multifamily options when house hacking is the plan." },
      { h: "Frequently asked questions" },
      { q: "Does each unit need a tenant before closing?" },
      { p: "Not under every program. The lender may use leases, supported market rents, or a combination, subject to vacancy and property-condition rules. Confirm the treatment of every vacant unit before relying on its projected rent." },
      { q: "Is DSCR calculated per unit?" },
      { p: "Qualification is commonly based on total eligible property rent divided by the property's qualifying PITIA, but unit-level evidence supports the total. Use the selected lender's exact formula." },
      { q: "Are five-unit properties handled the same way?" },
      { p: "Usually no. Five or more units are generally treated as commercial multifamily rather than one-to-four-unit residential property, with different appraisal, underwriting, and loan structures." },
      { h: "Underwrite the building and each unit" },
      { p: "The property-level ratio determines coverage, while unit-level facts determine whether the rent is durable. Verify every lease, meter, unit condition, and owner-paid expense; then stress one vacancy and one major repair before deciding the building can support the debt." },
      { links: [
        { label: "Calculate combined rent and PITIA", href: "/dscr-calculator" },
        { label: "Run a vacancy stress test", href: "/tools/stress-matrix" },
        { label: "Fannie Mae: Rental Income", href: "https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income" },
        { label: "Fannie Mae Form 1025", href: "https://singlefamily.fanniemae.com/media/document/pdf/form-1025" },
        { label: "IRS Publication 527: Residential Rental Property", href: "https://www.irs.gov/publications/p527" },
      ]},
    ],
    glyph: "2–4", glyphColor: dc.cream, bg: dc.rain,
    author: "Greenstreet Research",
    featured: false,
  },
  // ── DEAL-STRUCTURE LAB (added 2026-07-18) ───────────────────────────────
  {
    slug: "dscr-loan-prepayment-penalty-exit-cost",
    date: "July 18, 2026", tag: "Strategy",
    title: "DSCR prepayment penalties: put a price on your exit before closing",
    summary: "A prepayment penalty can turn a good refinance or sale into an expensive exit. Translate the clause into dollars at each possible payoff date before choosing the loan.",
    metaDescription: "Calculate a DSCR prepayment penalty, compare step-down structures, and map sale, refinance, and principal-paydown costs before signing your loan documents.",
    primaryKeyword: "DSCR prepayment penalty",
    readTime: "8 min read",
    body: [
      { p: "A DSCR prepayment penalty is a contractual charge that may apply when an investor pays off all or part of a loan before a stated date. The trigger may be a sale, refinance, large principal reduction, or another payoff event. Because business-purpose loan terms and state rules vary, the note and any rider—not a marketing summary—control the actual cost." },
      { h: "The 30-second answer" },
      { quote: "Build an exit-cost calendar before closing. For every likely sale or refinance month, estimate the remaining balance, contractual penalty, ordinary payoff fees, and lost upfront points. A low rate can be expensive if the exit clause conflicts with the business plan." },
      { h: "How a step-down penalty works" },
      { p: "A step-down structure applies a declining percentage during stated years. Consider an illustrative 3%–2%–1% schedule on a $400,000 initial loan. If the balance at payoff is $392,000 during the first penalty year, a 3% charge would be $11,760. At a $386,000 balance during the second year, a 2% charge would be $7,720. These are examples only; the contract may calculate from the original balance, outstanding balance, or another defined amount." },
      { h: "Read six parts of the clause" },
      { list: [
        "Penalty period: exact start and end dates, not just a label such as three-year prepay.",
        "Trigger: full payoff, partial payoff, sale, refinance, transfer, casualty proceeds, or acceleration.",
        "Calculation base: original principal, outstanding principal, amount prepaid, or an interest-based formula.",
        "Allowed curtailment: how much extra principal can be paid without a charge and over what measurement period.",
        "Exceptions: whether death, condemnation, casualty, or lender-approved transfer receives different treatment.",
        "Notice and quote process: how to request a binding payoff and how long it remains valid.",
      ]},
      { h: "Create a four-date exit map" },
      { p: "Choose the earliest plausible sale, the base-case sale, the earliest plausible refinance, and the end of the penalty period. At each date, total the estimated penalty, remaining unamortized points, closing costs on the replacement loan, and any rate-lock or extension charge. Compare that amount with the benefit of exiting." },
      { p: "For example, a refinance that saves $350 per month but requires an $8,400 penalty needs 24 months of payment savings just to recover the penalty, before new closing costs. If the property may be sold 12 months later, the refinance does not pass this simplified test." },
      { h: "Consumer rules are not a universal DSCR rulebook" },
      { p: "The Consumer Financial Protection Bureau defines a prepayment penalty as a fee charged when some mortgages are paid early and advises borrowers to compare an offer without the penalty. Consumer-mortgage restrictions may not apply the same way to a non-owner-occupied business-purpose DSCR transaction. State law, borrower type, property, purpose, and loan documents can change the result; obtain legal advice for the specific clause." },
      { h: "Frequently asked questions" },
      { q: "Does selling the property trigger the penalty?" },
      { p: "Often a sale causes a full payoff, which may trigger the clause, but only the signed loan documents provide the answer. Review transfer and due-on-sale language as well as the prepayment rider." },
      { q: "Can small extra principal payments trigger a charge?" },
      { p: "Some loans permit limited annual curtailments while others define partial prepayment differently. Confirm the dollar or percentage allowance and whether the measurement uses a calendar year, loan year, or rolling period." },
      { q: "Is a no-prepay loan always better?" },
      { p: "No. It may carry different rate, points, leverage, or other terms. Compare the cost of flexibility with the probability and value of an early exit." },
      { h: "Make flexibility a priced loan feature" },
      { p: "Do not treat a DSCR prepayment penalty as remote legal text. Convert it into a monthly exit calendar and compare it with the investment timeline. The right structure is the one whose flexibility and total cost match the plan you are most likely to execute." },
      { links: [
        { label: "Track refinance savings and break-even", href: "/tools/refi-tracker" },
        { label: "Compare points and break-even", href: "/blog/dscr-loan-points-break-even" },
        { label: "CFPB: What is a prepayment penalty?", href: "https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/" },
        { label: "CFPB: Mortgage key terms", href: "https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/" },
      ]},
    ],
    glyph: "EXIT", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-rate-lock-extension-closing-plan",
    date: "July 18, 2026", tag: "Rates",
    title: "DSCR rate locks: protect the closing date, not just the interest rate",
    summary: "A rate lock only helps if the loan closes inside its window. Use a reverse closing calendar to compare lock length, extension exposure, payment changes, and appraisal risk.",
    metaDescription: "Build a DSCR rate-lock plan that covers appraisal, underwriting, closing delays, extension costs, and the effect of a higher rate on payment and qualification.",
    primaryKeyword: "DSCR rate lock",
    readTime: "7 min read",
    body: [
      { p: "A DSCR rate lock is a lender agreement to hold specified pricing for a defined period, subject to its written conditions. It may lock the note rate, points, or both. A lock does not guarantee loan approval, property eligibility, appraisal value, qualifying rent, or an on-time closing, so the lock period should be built around the file's actual risk—not the shortest advertised option." },
      { h: "The 30-second answer" },
      { quote: "Start with the contractual closing date and work backward through final approval, condition review, appraisal, title, insurance, and borrower documents. Add a delay buffer, then compare the cost of that lock with the cost of an extension or a higher rate." },
      { h: "What to confirm in writing" },
      { list: [
        "Exact note rate, points, lender credits, lock date, expiration date, and time zone.",
        "Whether the property address, loan amount, leverage, prepayment structure, and interest-only option are locked assumptions.",
        "Extension price, minimum extension period, who pays, and what happens if the lender causes the delay.",
        "Whether a float-down is available if market pricing improves and what conditions or fees apply.",
        "What changes permit repricing: appraisal, DSCR, credit, entity, property type, occupancy, loan amount, or closing date.",
      ]},
      { h: "Worked example: the cost of one rate change" },
      { p: "Assume a $400,000, 30-year fully amortizing loan moves from 7.25% to 7.50% before lock. Principal and interest rises from about $2,729 to $2,797, an increase of about $68 per month. With $500 of taxes, insurance, and HOA dues and $3,600 of eligible rent, illustrative DSCR falls from 1.11x to 1.09x." },
      { p: "The movement may look small, but a borderline file can cross a program threshold or move into different pricing. Recalculate the payment, DSCR, cash to close, and hold-period cost at every offered rate rather than focusing only on the rate difference." },
      { h: "Build a reverse closing calendar" },
      { list: [
        "Closing day: final documents signed, funds verified, title ready, insurance active.",
        "Three to five business days earlier: final conditions and settlement figures resolved.",
        "One to two weeks earlier: appraisal and rent review complete; title and insurance cleared.",
        "Two to four weeks earlier: complete borrower and entity file submitted; appraisal ordered.",
        "Buffer: add time for appraisal revision, condo or insurance questions, holidays, and document corrections.",
      ]},
      { h: "Compare extension cost with lock cost" },
      { p: "Suppose a longer initial lock costs $1,200 more, while a possible extension costs $150 per day with a five-day minimum. The extension would cost at least $750 and ten days would cost $1,500. The longer lock is not automatically better, but the comparison makes the timing risk visible. Use the lender's actual written prices; these figures are illustrative." },
      { h: "Frequently asked questions" },
      { q: "Does a rate lock mean the loan is approved?" },
      { p: "No. Approval still depends on the borrower, property, appraisal, rent, title, insurance, and all program conditions. A material change can also affect locked pricing under the agreement." },
      { q: "Who pays if the lender misses the lock date?" },
      { p: "Policies differ. Ask before locking how lender-caused, borrower-caused, seller-caused, appraisal-caused, and third-party delays are treated, then preserve the answer in writing." },
      { q: "Should I lock immediately?" },
      { p: "That depends on closing certainty, market risk, lock cost, extension policy, and your tolerance for payment change. Confirm the file is ready enough to finish within the proposed window." },
      { h: "Treat time as part of loan pricing" },
      { p: "The cheapest DSCR rate lock is not always the one with the lowest upfront cost. Price the expected delay exposure, protect the contract date, and give every critical task an owner and deadline. A realistic lock is a project schedule with financial consequences." },
      { links: [
        { label: "Recalculate DSCR at several rates", href: "/dscr-calculator" },
        { label: "Follow the post-prequalification process", href: "/blog/dscr-loan-process-after-prequalify" },
        { label: "CFPB: Choose a loan offer and understand locks", href: "https://www.consumerfinance.gov/owning-a-home/compare/choose-loan-offer/" },
        { label: "CFPB: Compare official loan offers", href: "https://www.consumerfinance.gov/owning-a-home/compare/" },
      ]},
    ],
    glyph: "LOCK", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-property-insurance-pitia-coverage",
    date: "July 18, 2026", tag: "Risk",
    title: "DSCR property insurance: the premium, coverage, and deductible test",
    summary: "Insurance can change qualification and investment risk at the same time. Check premium, replacement-cost terms, exclusions, deductibles, flood exposure, and lender requirements before the appraisal.",
    metaDescription: "Use this DSCR property-insurance checklist to test premiums, replacement-cost coverage, deductibles, flood risk, lender requirements, and PITIA impact.",
    primaryKeyword: "DSCR property insurance",
    readTime: "8 min read",
    body: [
      { p: "DSCR property insurance affects the loan in two ways. The annual premium enters PITIA and can lower the qualifying ratio, while the policy's coverage, deductibles, exclusions, and insurer eligibility determine whether the collateral meets lender requirements. A cheap quote is not useful if the lender cannot accept it or the investor cannot absorb the deductible." },
      { h: "The 30-second answer" },
      { quote: "Obtain a property-specific insurance indication before the appraisal. Confirm annual premium, replacement-cost settlement, coverage limits, deductibles by peril, flood and wind treatment, vacancy or renovation restrictions, loss-of-rents coverage, and the lender's mortgagee clause." },
      { h: "Worked example: a premium shock" },
      { p: "Assume eligible rent of $3,200 and PITIA of $2,500 based on a $2,400 annual insurance estimate. DSCR is 1.28x. If the bindable premium is $6,000 per year, insurance rises by $300 per month and PITIA becomes $2,800. DSCR falls to 1.14x. The $3,600 annual premium difference also reduces investor cash flow dollar for dollar." },
      { h: "Read the quote beyond the premium" },
      { list: [
        "Coverage basis: replacement cost versus actual cash value and any roof or cosmetic-damage schedule.",
        "Coverage amount: how the insurer and lender establish replacement cost for the improvements.",
        "Deductibles: flat dollar, percentage, named-storm, wind, hail, hurricane, flood, and water-damage provisions.",
        "Exclusions and sublimits: water backup, ordinance or law, mold, theft, equipment, sewer, and vacancy limitations.",
        "Income protection: whether loss-of-rents or business-income coverage is included and for how long.",
        "Liability: premises and landlord exposures, including any entity named-insured requirements.",
      ]},
      { h: "Replacement cost and deductible are different questions" },
      { p: "Replacement-cost coverage describes how a covered loss is valued, subject to the policy. The deductible is the investor's share before insurance pays. Fannie Mae's conventional guide, for example, requires replacement-cost settlement for one- to four-unit property and sets its own coverage and deductible limits. A DSCR lender may apply different investor guidelines, so use Fannie Mae only as a comparison—not as the rule for every DSCR loan." },
      { h: "Flood zones need an official check" },
      { p: "The Federal Emergency Management Agency's Flood Map Service Center is the official public source for FEMA flood-hazard information. Special Flood Hazard Areas appear on Flood Insurance Rate Maps. A lender may require flood coverage based on its determination and program rules, and an investor may choose coverage outside a mandatory zone because a map boundary does not eliminate flood risk." },
      { h: "Stress the deductible, not only the premium" },
      { p: "If a policy has a 2% named-storm deductible on $500,000 of covered property, the deductible may be $10,000 under the policy's definition. Keep that exposure separate from routine reserves. Ask the agent to explain exactly what the percentage applies to and request a specimen policy or endorsement when the quote is unclear." },
      { h: "Frequently asked questions" },
      { q: "Can insurance change after prequalification?" },
      { p: "Yes. A preliminary estimate can change after underwriting the address, roof, age, claims history, occupancy, protection class, flood or wind exposure, and requested coverage. Use a bindable quote as early as practical." },
      { q: "Does the lowest premium produce the best DSCR?" },
      { p: "It produces lower PITIA if all else is equal, but inadequate or unacceptable coverage can stop the loan and leave the investor exposed. Compare premium and policy quality together." },
      { q: "Should an LLC be named on the policy?" },
      { p: "The insured names should match the ownership and lender requirements. Coordinate the insurer, lender, title company, and legal adviser before closing rather than assuming an individual policy covers entity-owned property." },
      { h: "Underwrite insurance like a major operating contract" },
      { p: "Insurance is not a last-day closing condition. It is a recurring expense, a qualification input, and the recovery plan after a loss. Verify the policy early, model premium increases, and keep accessible cash for the largest realistic deductible." },
      { links: [
        { label: "Recalculate PITIA and DSCR", href: "/dscr-calculator" },
        { label: "Review coastal-property DSCR risk", href: "/blog/fema-rr2-coastal-dscr" },
        { label: "FEMA Flood Map Service Center", href: "https://msc.fema.gov/portal/home" },
        { label: "Fannie Mae: Property insurance for one- to four-unit properties", href: "https://guide-selling.fanniemae.com/sel/b7-3-02/property-insurance-requirements-one-four-unit-properties" },
      ]},
    ],
    glyph: "RISK", glyphColor: dc.cream, bg: dc.rain,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-loan-llc-entity-vesting-guide",
    date: "July 18, 2026", tag: "Ownership",
    title: "DSCR loans in an LLC: align the borrower, title, bank account, and lease",
    summary: "An LLC can organize rental ownership, but it does not erase documentation or guarantees. Keep entity records, vesting, insurance, leases, and funds consistent from application through closing.",
    metaDescription: "Prepare a DSCR loan in an LLC by aligning entity records, title, insurance, leases, bank funds, tax classification, signatures, and guarantor documents.",
    primaryKeyword: "DSCR loan in an LLC",
    readTime: "8 min read",
    body: [
      { p: "A DSCR loan in an LLC can place the investment property and loan in a business entity, subject to the lender's program and local law. That does not make the transaction anonymous, nonrecourse, or document-free. Lenders commonly review the entity, its owners, authorized signers, guarantors, assets, title vesting, leases, and insurance for consistency." },
      { h: "The 30-second answer" },
      { quote: "Choose the ownership structure before the contract and application whenever possible. Make the buyer name, borrowing entity, title commitment, insurance, leases, bank account, operating agreement, and closing signatures tell the same story." },
      { h: "The six-document alignment test" },
      { list: [
        "Formation record: articles or certificate showing the exact legal name and jurisdiction.",
        "Good standing: current evidence when required by the lender or title company.",
        "Operating agreement: ownership percentages, management authority, borrowing power, and signing authority.",
        "Tax identification: the correct taxpayer identification number and any requested Internal Revenue Service confirmation.",
        "Property records: purchase contract, title vesting, leases, management agreement, and insurance names.",
        "Funds: statements showing the account owner and a clear source trail for closing and reserves.",
      ]},
      { h: "Single-member does not mean one universal tax result" },
      { p: "The Internal Revenue Service says a domestic single-member LLC is generally disregarded for federal income-tax purposes unless it elects corporate treatment. A domestic LLC with at least two members is generally classified as a partnership unless it elects corporate treatment. State taxes, local filings, employment taxes, investor agreements, and individual circumstances can produce additional obligations, so entity formation needs legal and tax advice." },
      { h: "A personal guaranty can still apply" },
      { p: "Entity borrowing does not automatically make a loan nonrecourse. Review the guaranty, environmental indemnity, bad-act provisions, completion obligations, and any carve-outs with counsel. Identify who is liable, under what events, and whether ownership changes require lender consent." },
      { h: "Avoid mid-file entity changes" },
      { p: "Changing the buyer or borrower after appraisal, title, insurance, or underwriting begins can create new conditions and closing risk. If a change is necessary, tell the lender, title company, insurer, and legal adviser before signing an assignment or deed. A transfer after closing may also interact with the loan's transfer and due-on-sale provisions." },
      { h: "Use clean money movement" },
      { list: [
        "Open the entity account early enough to produce the statements the lender requests.",
        "Keep formation deposits and large transfers documented with statements and transaction records.",
        "Do not assume personal funds, business funds, gifts, or borrowed funds receive identical treatment.",
        "Confirm whether closing funds must come from the borrowing entity, a guarantor, or another approved source.",
      ]},
      { h: "Frequently asked questions" },
      { q: "Is an LLC required for every DSCR loan?" },
      { p: "No. Vesting rules differ by lender, state, borrower, and program. Some programs allow individual or entity borrowing; others have specific entity requirements. Confirm before writing the purchase contract." },
      { q: "Does an LLC protect every personal asset?" },
      { p: "No structure provides automatic protection in every circumstance. Liability depends on state law, entity maintenance, conduct, contracts, guarantees, insurance, and the facts of a claim. Obtain qualified legal advice." },
      { q: "Can I transfer the property into an LLC after closing?" },
      { p: "Do not assume so. Review the note, mortgage or deed of trust, due-on-sale language, title consequences, insurance, taxes, and lender consent requirements before any transfer." },
      { h: "Consistency closes entity loans" },
      { p: "The LLC itself is rarely the hardest part. Misaligned names, authority, vesting, insurance, leases, and funds create the friction. Build one entity checklist and resolve discrepancies before the appraisal and title deadlines." },
      { links: [
        { label: "Use the DSCR document checklist", href: "/blog/dscr-loan-document-checklist" },
        { label: "Plan required post-close liquidity", href: "/blog/dscr-loan-reserves-liquidity" },
        { label: "IRS: Single-member limited liability companies", href: "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies" },
        { label: "IRS Publication 3402: Taxation of LLCs", href: "https://www.irs.gov/pub/irs-pdf/p3402.pdf" },
      ]},
    ],
    glyph: "LLC", glyphColor: dc.dark, bg: dc.mintBg,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "property-tax-reassessment-dscr-pitia",
    date: "July 18, 2026", tag: "Taxes",
    title: "Property-tax reassessment: the hidden PITIA reset in a DSCR purchase",
    summary: "The seller's tax bill may reflect an old assessment, exemption, or ownership cap that does not transfer. Estimate the buyer's post-sale tax before treating quoted DSCR as durable.",
    metaDescription: "Estimate property-tax reassessment before a DSCR purchase, replace the seller's bill in PITIA, and stress supplemental taxes, exemptions, and local timing risk.",
    primaryKeyword: "property tax reassessment DSCR",
    readTime: "8 min read",
    body: [
      { p: "Property-tax reassessment can reset PITIA after a DSCR purchase. The seller's current bill may be based on an older assessed value, a homestead benefit, a capped annual increase, or an exemption the investor will not receive. Qualification and cash flow should use an evidence-based estimate of the buyer's tax obligation, not a copied listing figure." },
      { h: "The 30-second answer" },
      { quote: "Estimate taxes from the post-transfer assessment rules, current local rates, special assessments, and investor eligibility. Then run DSCR with the projected stabilized tax and hold a separate reserve for timing differences or supplemental bills." },
      { h: "Worked example: replacing the seller's bill" },
      { p: "Assume $3,300 monthly rent, $2,250 of principal, interest, insurance, and HOA dues, and a seller tax bill of $3,600 per year, or $300 per month. Quoted PITIA is $2,550 and DSCR is 1.29x. If the buyer's estimated tax is $8,400 per year, or $700 per month, PITIA becomes $2,950 and DSCR falls to 1.12x." },
      { p: "The $4,800 annual difference also reduces cash flow. Even if the first escrow analysis begins with the lower bill, the investor may later face a payment increase or shortage when the new assessment reaches the servicer." },
      { h: "Why the prior bill can mislead" },
      { list: [
        "The assessed value may lag current market value or purchase price.",
        "A homestead, senior, veteran, agricultural, or other exemption may not apply to an investment buyer.",
        "Annual assessment caps may reset or operate differently after a transfer.",
        "Special districts, bond charges, or parcel assessments may sit outside a simple tax-rate estimate.",
        "The reassessment may create a supplemental bill before the regular tax cycle catches up.",
      ]},
      { h: "Two official examples show why local rules matter" },
      { p: "The California State Board of Equalization explains that when a county assessor determines a change in ownership occurred, Proposition 13 generally requires reassessment to current fair market value as of the ownership change, subject to exclusions. Florida's Department of Revenue explains that homestead exemption and Save Our Homes benefits concern permanent residences and that exemptions are administered by county property appraisers. Neither example should be applied to another state." },
      { h: "Build a buyer-tax worksheet" },
      { list: [
        "Confirm the parcel, current assessed value, taxable value, exemptions, and full tax bill with the local assessor or collector.",
        "Ask what event triggers reassessment and which value date and tax year apply.",
        "Identify every millage rate, special assessment, district charge, and non-ad-valorem item.",
        "Confirm whether any current exemption or cap transfers to this investor and ownership structure.",
        "Estimate regular and supplemental bills, then verify the lender's qualifying and escrow figures.",
      ]},
      { h: "Frequently asked questions" },
      { q: "Will taxes always equal purchase price times the tax rate?" },
      { p: "No. Assessment ratios, value dates, exemptions, caps, classifications, local rates, and special assessments vary. That multiplication can be a screening estimate, not a final tax bill." },
      { q: "Does the lender guarantee the tax estimate?" },
      { p: "No. Escrow and underwriting figures can change when official bills or assessments update. Verify the local rule independently and keep liquidity for a shortage or supplemental bill." },
      { q: "Can an LLC change the reassessment result?" },
      { p: "Entity ownership and later transfers can matter under local change-in-ownership rules. Obtain jurisdiction-specific legal and tax advice before choosing or changing vesting." },
      { h: "Underwrite the tax after the transfer" },
      { p: "Treat the seller's bill as historical evidence, not the final buyer budget. The durable DSCR is the ratio after the expected reassessment, exemptions, special charges, and escrow adjustment have all reached the monthly payment." },
      { links: [
        { label: "Recalculate PITIA with buyer taxes", href: "/dscr-calculator" },
        { label: "Read the complete PITIA breakdown", href: "/blog/dscr-pitia-breakdown-qualifying-income" },
        { label: "California BOE: Change in Ownership FAQ", href: "https://www.boe.ca.gov/proptaxes/faqs/changeinownership.htm" },
        { label: "Florida Department of Revenue: Property-tax exemptions", href: "https://floridarevenue.com/property/pages/Taxpayers_Exemptions.aspx" },
      ]},
    ],
    glyph: "TAX", glyphColor: dc.cream, bg: dc.rain,
    author: "Greenstreet Research",
    featured: false,
  },
  {
    slug: "dscr-sensitivity-analysis-rent-pitia",
    date: "July 18, 2026", tag: "Analysis",
    title: "The $100 DSCR stress test: see which assumption can break the deal",
    summary: "Move rent and each PITIA input by $100 to reveal the property's fragile assumptions. The resulting sensitivity map is faster and more useful than trusting one base-case ratio.",
    metaDescription: "Run a DSCR sensitivity analysis with $100 rent and PITIA shocks, calculate break-even rent, and identify insurance, tax, HOA, or rate risk that matters most.",
    primaryKeyword: "DSCR sensitivity analysis",
    readTime: "7 min read",
    body: [
      { p: "A DSCR sensitivity analysis shows how the ratio changes when rent or PITIA assumptions move. Instead of treating one base-case ratio as truth, shift each major input by the same dollar amount, calculate a break-even rent, and identify which unverified assumption has enough power to change the financing decision." },
      { h: "The 30-second answer" },
      { quote: "Start with eligible rent ÷ PITIA. Reduce rent by $100, then restore it and add $100 separately to debt payment, taxes, insurance, and HOA dues. Rank the resulting ratios beside the evidence quality of each input." },
      { h: "Worked example: six versions of one property" },
      { p: "Assume eligible monthly rent of $3,000 and PITIA of $2,400. Base DSCR is 1.25x. A $100 rent reduction produces 1.21x. A $100 PITIA increase produces 1.20x. Applying both changes produces 1.16x. A $200 rent reduction plus a $200 PITIA increase produces 1.08x." },
      { p: "The same $100 expense increase has the same mathematical effect regardless of whether it comes from insurance, taxes, HOA dues, or the loan payment. The practical risk differs because each input has a different probability, evidence source, and ability to be controlled." },
      { h: "Calculate break-even rent and maximum PITIA" },
      { p: "Break-even rent at 1.00x DSCR equals PITIA, so this property needs $2,400 of eligible rent. For a chosen 1.20x planning target, required rent equals $2,400 × 1.20, or $2,880. The maximum PITIA at that target equals $3,000 ÷ 1.20, or $2,500. The base case therefore has only $100 of monthly PITIA headroom before falling below the planning target." },
      { h: "Add an evidence score to every assumption" },
      { list: [
        "High confidence: executed lease with verified payment history, current tax authority data, bindable insurance quote, final HOA statement, locked loan terms.",
        "Medium confidence: appraiser-supported market rent, preliminary title or tax estimate, insurer indication, lender quote not yet locked.",
        "Low confidence: listing rent, seller estimate, old tax bill, online insurance average, hoped-for refinance rate, or unverified HOA amount.",
      ]},
      { p: "A small low-confidence input deserves more attention than a larger verified one. For example, a $75 uncertain insurance assumption near the program boundary may matter more than a $300 tax figure confirmed by the assessor." },
      { h: "Turn the map into actions" },
      { list: [
        "If rent is the weak point, obtain better comparables, inspect competing units, and test a longer lease-up period.",
        "If taxes are weak, model post-sale reassessment and supplemental billing.",
        "If insurance is weak, obtain a property-specific bindable quote and review deductible exposure.",
        "If debt payment is weak, compare loan amount, points, amortization, and interest-only reset without assuming a future refinance.",
        "If HOA dues are weak, review the current budget, special assessments, insurance, reserves, and pending litigation with qualified professionals.",
      ]},
      { h: "DSCR stress is not cash-flow stress" },
      { p: "Repeat the exercise in the full operating model with vacancy, management, utilities, repairs, and capital expenditures. A lender-style ratio can remain above a target while investor cash flow becomes negative. Use the DSCR map for financing durability and the cash-flow map for investment durability." },
      { h: "Frequently asked questions" },
      { q: "What DSCR should I use as the target?" },
      { p: "Use the lender's threshold for eligibility and a separate investor target for risk planning. Both are program- and strategy-specific; the investor target should reflect input uncertainty, property volatility, and liquidity." },
      { q: "Why use $100 increments?" },
      { p: "$100 is easy to understand and compare across inputs. Use smaller increments for a tight file or larger percentages for an expensive property. Consistency matters more than the chosen step." },
      { q: "Can a sensitivity analysis predict the future?" },
      { p: "No. It exposes how assumptions affect the result. Scenario probabilities, correlations, and rare events require deeper analysis, but the simple map quickly reveals fragile deals." },
      { h: "Replace one ratio with a decision surface" },
      { p: "A single DSCR tells you where the deal sits today. A sensitivity map shows how far it can move before the financing or investment thesis changes. Verify the inputs with the steepest consequences first, then price, restructure, or pass with a clearer view of risk." },
      { links: [
        { label: "Run the base DSCR calculation", href: "/dscr-calculator" },
        { label: "Build a full stress matrix", href: "/tools/stress-matrix" },
        { label: "Compare DSCR with operating cash flow", href: "/blog/dscr-vs-rental-property-cash-flow" },
        { label: "IRS Publication 527: Rental-property expenses", href: "https://www.irs.gov/publications/p527" },
      ]},
    ],
    glyph: "±100", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Research",
    featured: false,
  },
];

type BlogBodyBlock = {
  p?: string;
  h?: string;
  q?: string;
  quote?: string;
  list?: string[];
  links?: { label: string; href: string }[];
};

type BlogPost = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  summary: string;
  body: BlogBodyBlock[];
  glyph: string;
  glyphColor: string;
  bg: string;
  author: string;
  featured: boolean;
  metaDescription?: string;
  primaryKeyword?: string;
  readTime?: string;
};

// ── Editorial reliability layer ───────────────────────────────────────────────
// Articles that would otherwise read as provider-specific eligibility, pricing,
// legal, or tax guidance are published as a review checklist instead. The
// authored body stays in RAW_POSTS; the reader sees the reviewed version.
const EDUCATIONAL_REVIEW_BODY = [
  {
    p: "This topic can materially affect a rental-property financing scenario, but provider requirements, pricing, documentation, and applicable law vary by transaction and change over time.",
  },
  {
    h: "What this article can do",
  },
  {
    p: "Use the questions below to organize assumptions and identify facts to verify. Do not treat examples, thresholds, ranges, or terminology on this site as a current provider rule, quote, approval standard, legal conclusion, or tax conclusion.",
  },
  {
    h: "What to verify",
  },
  {
    list: [
      "The responsible provider and its current, dated eligibility and pricing materials.",
      "The property, borrower, entity, insurance, appraisal, title, and reserve facts for the specific transaction.",
      "Any jurisdiction-specific or tax conclusion with qualified counsel or a tax professional using current primary sources.",
    ],
  },
  {
    quote: "A transparent scenario is a list of assumptions to verify, not a financing decision.",
  },
] satisfies BlogPost["body"];

// `body` is optional: some slugs only need the headline claim softened, so they
// override title/summary and keep the authored body. Titles here are the single
// source of truth for what the reader sees AND for src/seo/routeMetadata.ts
// ARTICLE_TITLES — the two are pinned together by src/seo/articleTitles.test.ts.
const EDITORIAL_REVISIONS: Record<
  string,
  { title: string; summary: string; body?: BlogPost["body"] }
> = {
  "greenstreet-go-launch": {
    title: "InvestGO: an educational DSCR workflow concept",
    summary: "InvestGO is an educational workflow concept for organizing DSCR pricing, program-fit, state-rule, and stress-test questions. It is not a pricing, eligibility, or approval system.",
  },
  "dscr-pitia-breakdown-qualifying-income": {
    title: "PITIA breakdown: five inputs to verify in a DSCR scenario",
    summary: "Learn how principal, interest, taxes, insurance, and HOA assumptions affect payment coverage, then verify the transaction facts with the responsible provider.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "dscr-ltv-down-payment-fico": {
    title: "LTV, down payment, and credit profile: questions to verify",
    summary: "These inputs can affect a provider's review, but this site does not publish current pricing tiers or eligibility matrices.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "dscr-refinance-rate-term-cashout-seasoning": {
    title: "DSCR refinance scenarios: questions to verify",
    summary: "Rate-term, cash-out, seasoning, leverage, and payment-coverage requirements depend on current provider rules and transaction facts.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "dscr-approval-issues-sub-10-fico-reserves": {
    title: "DSCR scenario constraints to discuss before applying",
    summary: "Organize payment coverage, credit, reserves, entity, rent, and state-rule questions without treating them as universal approval standards.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "dscr-foreign-nationals-itin": {
    title: "Foreign-national and ITIN DSCR scenarios: questions to verify",
    summary: "Documentation, entity, reserve, sanctions, tax, and eligibility questions require provider-specific and professional review.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "obbba-2025-real-estate-tax-changes": {
    title: "Tax-law changes and real estate models: questions to verify",
    summary: "Tax-law changes can affect after-tax modeling assumptions. Confirm current provisions, thresholds, and effective dates with a tax professional using primary sources.",
  },
  "mn-hf3437-business-purpose": {
    title: "Minnesota DSCR loans: questions to verify before structuring",
    summary: "State treatment of business-purpose lending depends on current statutes, effective dates, and the facts of the transaction. Verify jurisdiction questions with qualified counsel.",
  },
  "qoz-qrof-permanent-obbba": {
    title: "Opportunity Zone investing: questions to verify before modeling",
    summary: "Opportunity Zone tiers, deadlines, and basis treatment change over time. Confirm every provision and date with a tax professional before modeling an investment.",
  },
  "section-1071-final-rule-dscr": {
    title: "Section 1071 and DSCR lending: questions to verify",
    summary: "Small-business lending data-collection obligations depend on the entity, its volume, and current regulatory guidance. Confirm applicability and timing with qualified counsel.",
  },
  "june-2026-rate-sheet": {
    title: "How to read a DSCR rate quote",
    summary: "Learn which components make up a quoted DSCR rate. This site does not publish current pricing, rate sheets, program tiers, or specials.",
  },
  "fema-rr2-coastal-dscr": {
    title: "Flood insurance and coastal DSCR scenarios: what to verify",
    summary: "Flood-zone determinations, premiums, and lender requirements are property-specific. Verify coverage, cost, and program details with the insurer and the responsible provider.",
  },
  "why-no-llm-number-path": {
    title: "Why deterministic models matter for numerical estimates",
    summary: "Deterministic calculations make an estimate reproducible and auditable. Every figure on this site remains an educational estimate, not a quote or approval.",
  },
  "dscr-str-airbnb-qualifying-income": {
    title: "Short-term rental (STR) income in a DSCR scenario",
    summary: "Short-term-rental income treatment varies by provider, data source, and jurisdiction. Confirm which income evidence and program rules apply with the responsible provider.",
  },
  "dscr-loan-document-checklist": {
    title: "DSCR documentation: a provider-confirmation checklist",
    summary: "Use a preliminary checklist to prepare questions, then obtain the exact current document request from the responsible provider.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "dscr-loan-process-after-prequalify": {
    title: "After a preliminary DSCR estimate: process questions to ask",
    summary: "A calculator estimate is not a prequalification or timeline. Ask the responsible provider what review, appraisal, documentation, and decision steps apply.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
  "how-to-improve-dscr-before-applying": {
    title: "How scenario inputs change modeled DSCR",
    summary: "Compare rate, payment structure, rent, and down-payment assumptions without treating the result as advice, eligibility, pricing, or approval.",
    body: EDUCATIONAL_REVIEW_BODY,
  },
};

export const POSTS: BlogPost[] = RAW_POSTS.map((post) => ({
  ...post,
  ...EDITORIAL_REVISIONS[post.slug],
}));

// The grid posts (all except the featured one), newest first.
const GRID_POSTS = POSTS
  .filter((p) => !p.featured)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
const FEATURED_POST = POSTS.find((p) => p.featured)!;

// ── Tag filter list ───────────────────────────────────────────────────────────
const ALL_TAGS = ["All", "Lending", "Tax", "Compliance", "Rates", "Underwriting", "STR", "Process", "Product"];

// ── Reusable article body renderer ───────────────────────────────────────────
function ArticleBody({ blocks }: { blocks: { p?: string; h?: string; q?: string; quote?: string; list?: string[]; links?: { label: string; href: string }[] }[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.h) return (
          <h2 key={i} style={{ color: dc.dark, fontSize: "clamp(18px,2vw,26px)", fontWeight: 600, margin: "36px 0 14px", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
            {b.h}
          </h2>
        );
        if (b.q) return (
          <h3 key={i} style={{ color: dc.dark, fontSize: "clamp(17px,1.5vw,20px)", fontWeight: 600, margin: "24px 0 8px", lineHeight: 1.25 }}>
            {b.q}
          </h3>
        );
        if (b.quote) return (
          <blockquote key={i} style={{ borderLeft: `3px solid ${dc.lemon}`, padding: "14px 24px", margin: "32px 0", color: dc.dark, fontSize: "clamp(17px,1.6vw,22px)", lineHeight: 1.35, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {b.quote}
          </blockquote>
        );
        if (b.list) return (
          <ul key={i} style={{ margin: "0 0 22px", padding: 0, listStyle: "none" }}>
            {b.list.map((li, j) => (
              <li key={j} style={{ color: "rgba(0,55,56,0.75)", fontSize: "clamp(15px,1.25vw,17px)", lineHeight: 1.65, marginBottom: "14px", paddingLeft: "26px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: dc.rain, fontWeight: 700 }}>→</span>
                {li}
              </li>
            ))}
          </ul>
        );
        if (b.links) return (
          <ul key={i} style={{ margin: "28px 0 0", padding: 0, listStyle: "none" }}>
            {b.links.map((link) => (
              <li key={link.href} style={{ marginBottom: 12 }}>
                <a href={link.href} style={{ color: dc.rain, fontSize: 15, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {link.label} →
                </a>
              </li>
            ))}
          </ul>
        );
        return <p key={i} style={{ color: "rgba(0,55,56,0.75)", fontSize: "clamp(16px,1.35vw,18px)", lineHeight: 1.75, marginBottom: "20px", fontWeight: 500 }}>{b.p}</p>;
      })}
    </>
  );
}

// ── Post detail view ──────────────────────────────────────────────────────────
function PostDetail({ post, onNavigate }: { post: typeof POSTS[0]; onNavigate: (v: string) => void }) {
  useEffect(() => {
    document.title = `${post.title} | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [post.slug]);

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Article hero */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,64px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 16 }}>
              {post.tag} · {post.date}
            </div>
            <H1 style={{ margin: "0 0 20px", maxWidth: "24ch" }}>
              {post.title}
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "52ch", margin: "0 0 28px" }}>
              {post.summary}
            </Lead>
            <button
              onClick={() => onNavigate("blog")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "rgba(238,239,211,0.65)", letterSpacing: "-0.01em", fontFamily: dc.sans, padding: 0 }}
            >
              ← Back to Notes from the DSCR desk
            </button>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="gs-reveal" style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* TL;DR summary — progressive disclosure: quick answer first */}
          <div style={{ background: dc.mintBg, borderRadius: 10, border: `1px solid ${dc.faded}`, padding: "clamp(18px,2vw,26px) clamp(18px,2vw,28px)", marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 8 }}>
              TL;DR — 30-second version
            </div>
            <p style={{ color: dc.dark, fontSize: "clamp(15px,1.3vw,17px)", fontWeight: 600, margin: 0, lineHeight: 1.5, letterSpacing: "-0.01em" }}>
              {post.summary}
            </p>
          </div>

          <ArticleBody blocks={post.body} />

          {/* End CTA — concrete next step */}
          <div
            className="gs-reveal"
            style={{ marginTop: 48, borderRadius: 12, border: `1px solid rgba(0,55,56,0.12)`, background: dc.mintBg, padding: "clamp(24px,3vw,36px) clamp(24px,3vw,40px)" }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 12 }}>
              See if your deal qualifies
            </div>
            <p style={{ color: "rgba(0,55,56,0.72)", fontSize: 15, marginBottom: 22, lineHeight: 1.6, fontWeight: 500 }}>
              Enter your property's rent and loan details — get a DSCR estimate, a rate range, and a program match in under a minute. No commitment, no account required.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <button
                onClick={() => (window as any).openQualify?.()}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "12px 24px", borderRadius: 8, fontFamily: dc.sans, letterSpacing: "-0.01em", minHeight: 44 }}
              >
                See if your deal qualifies →
              </button>
              <button
                onClick={() => onNavigate("dscr-calculator")}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: dc.dark, color: dc.cream, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", padding: "12px 24px", borderRadius: 8, fontFamily: dc.sans, letterSpacing: "-0.01em", minHeight: 44 }}
              >
                Open the Deal Analyzer →
              </button>
            </div>
          </div>

          {/* Keep reading */}
          <div className="gs-reveal" style={{ marginTop: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 16 }}>
              Keep reading
            </div>
            <div className="dc-band-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {related.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => (window.history.pushState({},'',`/blog/${r.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
                  style={{ background: dc.mintBg, borderRadius: 8, border: `1px solid rgba(0,55,56,0.10)`, padding: "20px 22px", textAlign: "left" as const, cursor: "pointer", fontFamily: dc.sans }}
                >
                  <div style={{ color: dc.rain, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{r.date}</div>
                  <div style={{ color: dc.dark, fontWeight: 700, fontSize: 15, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{r.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Blog index ────────────────────────────────────────────────────────────────
function BlogIndex({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [tag, setTag] = useState("All");

  useEffect(() => {
    document.title = "Notes from the DSCR desk | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const filtered = tag === "All" ? GRID_POSTS : GRID_POSTS.filter((p) => p.tag === tag);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={BL_ACCENT}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      <style>{BL_CSS}</style>

      {/* ── HERO ── solid cream, no metric panel (content page) ── */}
      <section style={{ background: dc.cream, padding: `clamp(56px,7vh,88px) ${dc.pad} clamp(32px,4vh,48px)`, overflow: "hidden" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginBottom: 18, letterSpacing: "-0.01em" }}>
              Greenstreet Guidance
            </div>
            <H1 style={{ margin: "0 0 16px", maxWidth: "20ch" }}>
              Practical guides for DSCR investors.
            </H1>
            <Lead style={{ color: "rgba(0,55,56,0.6)", maxWidth: "52ch", margin: 0, fontSize: "clamp(16px,1.3vw,19px)" }}>
              Plain-language articles on qualifying, structuring, and closing investment property loans — with the math and sources included.
            </Lead>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── solid dark fill, no blur, no radial glow ── */}
      <section className="gs-reveal" style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(40px,5vw,64px)` }}>
        <button
          className="bl-card dc-hero"
          onClick={() => (window.history.pushState({},'',`/blog/${FEATURED_POST.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            maxWidth: dc.maxW,
            margin: "0 auto",
            background: dc.dark,
            borderRadius: 12,
            overflow: "hidden",
            border: "none",
            cursor: "pointer",
            textAlign: "left" as const,
            fontFamily: dc.sans,
            width: "100%",
          }}
        >
          <div style={{ padding: "clamp(36px,4vw,60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 16 }}>
              Featured · {FEATURED_POST.date}
            </div>
            <h2 style={{ fontSize: "clamp(20px,2.8vw,38px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: dc.cream, margin: "0 0 16px" }}>
              {FEATURED_POST.title}
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: "0 0 24px", letterSpacing: "-0.01em", maxWidth: "48ch" }}>
              {FEATURED_POST.summary}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: dc.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: dc.dark, flexShrink: 0 }}>
                GS
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.7)", letterSpacing: "-0.01em" }}>
                Greenstreet Research
              </span>
            </div>
          </div>
          {/* Right panel — solid fill, flat 1px border, no glow */}
          <div style={{ background: dc.teal, border: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <Mono style={{ fontSize: "clamp(26px,5vw,72px)", fontWeight: 600, color: "rgba(216,217,88,0.9)", letterSpacing: "-0.03em" }}>
              det()
            </Mono>
          </div>
        </button>
      </section>

      {/* ── TAG FILTER ── */}
      <section style={{ background: dc.cream, padding: `0 ${dc.pad} 20px` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: `1.5px solid ${tag === t ? dc.rain : dc.faded}`,
                background: tag === t ? dc.mintBg : "transparent",
                color: tag === t ? dc.rain : dc.dark,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                minHeight: 36,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── GRID ── 3 columns desktop, 1 mobile ── */}
      <section style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(72px,10vh,120px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-band-3 gs-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((p) => (
              <button
                key={p.slug}
                className="bl-card"
                onClick={() => (window.history.pushState({},'',`/blog/${p.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
                style={{
                  background: dc.mintBg,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${dc.faded}`,
                  textAlign: "left" as const,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: dc.sans,
                  padding: 0,
                }}
              >
                {/* Glyph header — solid fill, aspect-ratio locked */}
                <div style={{ aspectRatio: "16/7", minHeight: 120, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mono style={{ fontSize: "clamp(22px,4vw,42px)", fontWeight: 600, color: p.glyphColor, letterSpacing: "-0.03em" }}>
                    {p.glyph}
                  </Mono>
                </div>
                <div style={{ padding: "clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Tag pill + date on same row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: dc.rain, background: "rgba(0,101,101,0.10)", padding: "3px 8px", borderRadius: 4 }}>
                      {p.tag}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.45)", letterSpacing: "-0.01em" }}>{p.date}</span>
                  </div>
                  <div style={{ fontSize: "clamp(16px,1.5vw,20px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.2, color: dc.dark, marginBottom: 10 }}>
                    {p.title}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.58)", margin: "0 0 18px", letterSpacing: "-0.01em", flex: 1 }}>
                    {p.summary}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: dc.rain, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: dc.cream, letterSpacing: "-0.01em" }}>
                        {p.author === "Greenstreet" ? "GS" : p.author.split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: dc.rain, letterSpacing: "-0.01em" }}>
                      {p.author} →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Page root — onNavigate crash fixed by threading it to every sub-component ─
export default function BlogPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack?: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  // Determine active slug from the path prop (App.tsx passes key={pathname})
  const resolvedPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = resolvedPath && resolvedPath.startsWith("/blog/")
    ? resolvedPath.replace("/blog/", "").replace(/\/$/, "")
    : null;
  const post = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

  if (post) {
    return <PostDetail post={post} onNavigate={onNavigate} />;
  }

  return <BlogIndex onNavigate={onNavigate} />;
}
