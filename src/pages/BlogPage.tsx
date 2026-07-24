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
export const POSTS = [
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
    author: "Greenstreet",
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
      { p: "For a standard long-term rental, lenders use the lower of: (1) the actual signed lease, or (2) the Form 1007 market rent from the appraisal. If there's no lease — vacant property, new acquisition — the 1007 rent stands on its own. That's why a significant share of DSCR loans close without a signed lease: the appraisal rent is sufficient." },
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
    author: "Priya Rao",
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
      { p: "Use the actual annual tax bill divided by 12. Do not use the current owner's tax bill if the property is in a state with homestead exemptions (California, Florida, Texas) or assessment caps — after transfer, the exemption usually resets to the purchase price. In Texas, expect annual taxes of 1.8–2.8% of assessed value. On a $350,000 Texas property, that's $525–$817/month. Many borrowers model $200." },
      { h: "Insurance" },
      { p: "Get a real insurance quote before you model PITIA. Hazard insurance on a SFR runs $800–$2,000/year in most markets — $67–$167/month. But coastal markets with wind, hail, or flood exposure are different. Florida all-perils coverage on a property in a SFHA can run $4,000–$8,000+/year. A $500/month insurance line item on a deal with $2,200/month rent produces a DSCR that almost certainly fails." },
      { h: "HOA dues" },
      { p: "HOA is included at face value — the full monthly amount. If a condo has a $600/month HOA and you're counting on $1,800/month rent to qualify, the HOA alone consumes a third of your rent in PITIA before debt service. Higher-HOA properties require proportionally higher rents to hit the same DSCR." },
      { h: "The deal-break rate: model it before you close" },
      { p: "Once you have accurate PITIA, calculate your deal-break rate: the interest rate at which DSCR would fall exactly to 1.00x. The gap between your offered rate and the deal-break rate (in basis points) tells you how much rate shock the deal can absorb — on a refinance, an ARM reset, or a future sale situation. Greenstreet's Deal Analyzer surfaces this number on every calculation." },
      { quote: "Tax and insurance are the two PITIA components that sink deals at underwriting. Model both from real sources — county records and an actual insurance quote — before you go to contract." },
    ],
    glyph: "Σ", glyphColor: dc.dark, bg: dc.lemon,
    author: "Marcus Chen",
    featured: false,
  },
  {
    slug: "dscr-ltv-down-payment-fico",
    date: "June 24, 2026", tag: "Lending",
    title: "LTV, down payment, and FICO tiers: how the three dials move your DSCR rate",
    summary: "Three variables move a DSCR rate more than any other: LTV, FICO, and whether you accept a prepayment penalty. Here's the pricing matrix and what each lever costs.",
    body: [
      { p: "DSCR rates are not one-size-fits-all. Every lender prices DSCR loans through a matrix of adjustments stacked on top of a base rate. The three biggest dials are loan-to-value (LTV), FICO score, and prepayment penalty election. Understanding how they interact tells you how to structure a deal for the best rate — and where there's no shortcut." },
      { h: "LTV: the biggest single dial" },
      { list: [
        "≤ 65% LTV — Best pricing, usually ≥ 0.25% below the 75% tier. Rarely possible on a typical acquisition without a large down payment.",
        "≤ 75% LTV (25% down) — The Greenstreet Premier tier's sweet spot. Most programs publish their headline rate here.",
        "≤ 80% LTV (20% down) — Standard minimum down payment. Add 0.25–0.50% vs 75% depending on program.",
        "75.01–80% LTV is the most common bracket for first-time DSCR investors and the one where rate expectations typically need calibration.",
      ]},
      { h: "FICO tiers" },
      { p: "FICO drives both rate and program access. The breakpoints vary by lender, but a representative tiering for the Greenstreet Core program is:" },
      { list: [
        "740+ — Best rate tier. Full program access including 5/1 ARM and interest-only.",
        "720–739 — 0.125–0.25% above best tier.",
        "700–719 — 0.25–0.50% above. Some programs add an LTV restriction.",
        "680–699 — 0.375–0.75% above. Reserve requirements increase.",
        "660–679 — Core floor. Narrower program selection; STR and some condo types excluded.",
        "640–659 — Flex program only. Compensating factors (DSCR ≥ 1.20, 12 months reserves) required.",
      ]},
      { h: "Prepayment penalty: the 0.50–0.80% you're trading away" },
      { p: "A 3-year or 5-year prepayment penalty (step-down: 5/4/3/2/1% or 3/2/1%) saves 0.50–0.80% in rate compared to the no-PPP option on most lenders' sheets. That's a meaningful difference. If you plan to hold the property for more than three years and won't need to sell or refinance, the PPP rate is almost always the better economic choice — the rate savings compound monthly." },
      { p: "Caution: some states restrict or prohibit PPPs on investment-property loans. New Jersey is the most notable high-risk state. Check the State Rules page before assuming a PPP is available in your target market." },
      { h: "How to combine the three dials" },
      { p: "The best DSCR rate available requires all three: ≤ 75% LTV + 740+ FICO + PPP accepted. Drop one dial and you lose 0.25–0.50%. Drop two and you can easily be 0.75–1.25% above the headline. A borrower with a 680 FICO who puts 20% down and waives the PPP is realistically looking at 1.00–1.50% above the advertised rate — which should set expectations before the first term sheet comes in." },
      { quote: "The headline rate requires the headline file. Stack LTV ≤ 75%, FICO ≥ 740, and a PPP, or expect to land somewhere between that rate and the market mid-range." },
    ],
    glyph: "LTV", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Sara López",
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
        "LTV limit: 80% on most programs for a standard R/T refi; 75% for the best rate tier.",
        "Seasoning: typically 6 months from the original closing date before a rate-term refi is available. Some lenders require only 3 months.",
        "DSCR requirement: same as purchase — generally ≥ 1.00x at the new rate and new payment.",
        "No-cash-out rule: any cash back at closing above closing cost reimbursement converts the loan to a cash-out refi and changes the terms.",
      ]},
      { h: "Cash-out refinance: the equity extraction play" },
      { p: "A cash-out refi pulls equity out of the property — funds you can redeploy into the next acquisition, capital improvements, or other uses. It comes with tighter restrictions than R/T." },
      { list: [
        "LTV limit: 75% maximum on most DSCR programs. Some programs go to 70% on higher-balance loans or STR properties.",
        "Seasoning: 12 months from the original closing date is the standard floor for investment property cash-out refis. Some lenders allow 6 months with a delayed-financing exception (if you purchased cash).",
        "DSCR: must qualify at the new, higher loan balance and the new payment. If the property has appreciated, the higher value increases your LTV headroom. If rates have risen since purchase, the higher payment may compress the DSCR.",
        "6-month bank statement: most lenders want to see 6 months of property ownership documented and verified.",
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
    author: "Priya Rao",
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
        "Increase the down payment: a larger equity stake reduces the loan balance, which reduces P&I, which raises DSCR. Going from 80% to 75% LTV on a $400K loan saves roughly $110/month in P&I at current rates — often enough to cross 1.0.",
        "Accept an ARM instead of a 30-year fixed: a 5/1 ARM typically starts 0.50–1.00% below a fixed rate, which directly lowers the monthly payment. Model the DSCR at both the initial rate and the worst-case reset cap to confirm the deal survives a rate reset.",
        "Find a sub-1.0 program: some lenders accept DSCR down to 0.75–0.80 with strong compensating factors (740+ FICO, 12 months reserves). Options are narrower, rates are higher, but the deal can close.",
        "Walk away: if the math doesn't pencil at 0.75x DSCR, no creative structuring fixes a fundamentally uneconomical deal.",
      ]},
      { h: "2. FICO below the program floor" },
      { p: "Most Greenstreet programs require 660+. If the borrower is at 640–659, the Flex program may apply. Below 640, DSCR loan options largely disappear. Fix options: pay down revolving balances before application (utilization below 30% often moves scores 20–40 points over 30–60 days), dispute legitimate errors, or wait for a seasoning cycle on a derogatory." },
      { h: "3. Insufficient reserves" },
      { p: "Reserves = liquid assets held after closing. The floor at DSCR ≥ 1.25 is 3 months PITIA. Overlays add months for: STR (+3), condo (+3), FICO <680 (+3), first-time investor (+3), loan >$1M (+6), foreign national (+6). These stack. A first-time investor on an STR condo is looking at 3 + 3 + 3 + 3 = 12 months reserves before the lender adds their own overlay. Make sure the borrower is computing reserves on the PITIA including the new loan — not on the list price or an old payment estimate." },
      { h: "4. LLC structure issues" },
      { p: "Most DSCR lenders require personal guaranty on LLC-vested deals. Layered LLCs (LLC inside LLC) are limited to 2 layers. The guarantor must own ≥ 51% of the entity. More than 4 members often triggers a decline. And New Jersey LLC vesting is a specific high-risk: some lenders will not do NJ LLC deals due to prepay-penalty ambiguity under N.J.S.A. 46:10B-2. If your deal is in NJ, verify LLC treatment with the lender before you take the application." },
      { h: "5. STR rent calculation errors" },
      { p: "Short-term rental income cannot be plugged in at the gross booking number. Lenders use the lower of: Form 1007 long-term market rent, AirDNA projected revenue × 70–80%, or documented 12-month STR gross history. If the 1007 market rent for long-term use is $1,800/month but AirDNA projects $4,200/month gross, the lender qualifies on $1,800 — or on 75% of $4,200 = $3,150 if you have 12 months of documented STR history. Understand which figure controls before you model the DSCR." },
      { h: "6. Prepay-penalty state restrictions" },
      { p: "Some states restrict or ban prepayment penalties on certain loan types. Key ones to check: New Jersey (ambiguous on investment-property PPPs at the LLC level), Minnesota (changed August 1, 2026 — business-purpose DSCR loans now allowed full PPPs), and several others with civil penalty provisions for non-compliant PPP language. If you're accepting a PPP rate for the better pricing, confirm the penalty is enforceable in the property's state before the borrower signs. A PPP that's void under state law doesn't give the lender the risk protection they priced — which can trigger a repurchase." },
      { quote: "The six problems above recur in roughly that order of frequency. Check your file against all six before submission, not after the underwriter calls." },
    ],
    glyph: "✕→✓", glyphColor: dc.emerald, bg: dc.teal,
    author: "Sara López",
    featured: false,
  },
  {
    slug: "dscr-foreign-nationals-itin",
    date: "June 22, 2026", tag: "Lending",
    title: "Foreign nationals and ITIN borrowers: how DSCR qualification actually works",
    summary: "No SSN? No problem — if you know which program applies. Foreign nationals and ITIN borrowers qualify on DSCR just like domestic investors, with a few additional requirements and a narrower program set.",
    body: [
      { p: "One of the overlooked strengths of DSCR lending is that it doesn't depend on U.S.-source income verification, W-2 history, or Social Security Numbers the way conventional lending does. Because qualification is property-based rather than borrower-income-based, foreign nationals and ITIN borrowers can access DSCR programs — with the right program and the right documentation." },
      { h: "Who qualifies as a foreign national vs ITIN borrower" },
      { list: [
        "ITIN borrower: holds a U.S. Individual Taxpayer Identification Number (ITIN) — typically a permanent resident, non-resident alien, or visa holder with U.S. tax filing history. May or may not have a Social Security Number.",
        "Foreign national (no SSN): a non-U.S. citizen with no ITIN and no SSN. Qualifies solely on the property cash flow and a non-U.S. credit profile.",
        "The distinction matters because program availability differs: ITIN borrowers access most standard DSCR programs with minor overlays; foreign nationals with no U.S. credit require the Global program or equivalent.",
      ]},
      { h: "How DSCR calculation works for foreign national files" },
      { p: "The DSCR formula is identical: gross monthly rent ÷ PITIA. Foreign national status doesn't change the math. What changes is the documentation, reserves requirement, and available programs:" },
      { list: [
        "Minimum DSCR: 1.0x (same as domestic). No DSCR penalty for foreign national status alone.",
        "FICO / credit: lenders accept international credit reports (Equifax, Experian international divisions) or a letter from a foreign bank. Some programs require a minimum 24-month international credit history.",
        "Reserves: typically +6 months overlay on top of the standard reserve requirement. A foreign national on a standard deal at 1.20x DSCR may need 9–12 months total reserves.",
        "LTV: typically capped at 70–75% vs 80% for domestic. Best pricing at 65–70% LTV.",
        "Guaranty: personal guaranty required; some programs require a U.S.-based co-signer or entity structure.",
        "Bank statements: 6–12 months of foreign bank statements for reserves verification; SWIFT-verified.",
      ]},
      { h: "Entity vesting for foreign nationals" },
      { p: "Many foreign national investors prefer to hold U.S. investment property in a U.S. LLC. This is generally allowed — verify with the lender that the LLC structure meets their requirements (see the LLC section in our DSCR Approval Issues article). A U.S. LLC held by a foreign national can vest title while the lender still requires a personal guaranty from the foreign national owner." },
      { h: "Tax considerations" },
      { p: "Foreign nationals with U.S. real property income are subject to FIRPTA (Foreign Investment in Real Property Tax Act) withholding on sale. DSCR loan qualification does not depend on U.S. tax status, but the borrower should work with a CPA familiar with cross-border real estate tax before closing — the tax implications on exit can be significant." },
      { quote: "DSCR is one of the most accessible U.S. lending products for foreign investors, because the loan doesn't depend on where you earned your money — only on what the property earns." },
    ],
    glyph: "FN", glyphColor: dc.lemon, bg: dc.dark,
    author: "Marcus Chen",
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
    author: "Priya Rao",
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
    author: "Sara López",
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
    author: "Priya Rao",
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
    author: "Sara López",
    featured: false,
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
    glyph: "∿", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Marcus Chen",
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
    author: "Marcus Chen",
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
        "Surfacing which lender programs are worth checking, based on file characteristics.",
      ]},
      { p: "In each of these cases, the AI is writing prose or ranking options — not producing the authoritative number. The number comes from the deterministic engine: rate × balance × amortization factor, plus explicit addlines for taxes, insurance, HOA. No token sampling." },
      { h: "The audit trail requirement" },
      { p: "DSCR lending involves compliance reviews. Every number on a submitted file needs to be explainable: where did PITIA come from, what rate was used, what rent figure was applied. A deterministic engine produces the same answer every time and can show its work. An LLM cannot." },
      { quote: "Determinism is a feature. Every figure Greenstreet produces is auditable — the same inputs produce the same output, every time." },
    ],
    glyph: "det()", glyphColor: dc.lemon, bg: dc.dark,
    author: "Priya Rao",
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
      { p: "Greenstreet's Core program covers STR 1–4 unit with 12 months history. InvestGO covers STR properties where 1007 long-term rent is used as the qualifying figure (no history required). The Premier tier is available on STR if DSCR ≥ 1.20x using documented history at 740+ FICO, ≤75% LTV. STR condotels and short-term rental condos have additional program restrictions — confirm property type eligibility before the appraisal is ordered." },
      { h: "The math on a real STR deal" },
      { p: "Example: 3BR SFR in a beach market. AirDNA projected gross: $72,000/year ($6,000/month). 1007 long-term rent: $2,400/month. PITIA: $2,200/month." },
      { p: "Qualifying income hierarchy: (1) 1007 = $2,400 → DSCR 1.09x. (2) AirDNA × 75% = $4,500 → DSCR 2.05x. (3) Documented 12-mo history × 75% — only applies if history exists." },
      { p: "If the property has no STR history, the deal qualifies at 1.09x on long-term rent — not at the 2.05x the investor modeled from Airbnb projections. The deal still closes, but reserve and rate expectations need to be set for 1.09x DSCR, not 2.05x." },
      { quote: "The 1007 long-term rent is the floor. Without 12 months of documented STR history, that's your qualifying income — regardless of what AirDNA says the property could earn." },
    ],
    glyph: "STR", glyphColor: dc.dark, bg: dc.lemon,
    author: "Sara López",
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
        "Social Security Number (or ITIN): for credit pull authorization. Foreign nationals with no SSN or ITIN use the Global program — see the Foreign Nationals article.",
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
    author: "Marcus Chen",
    featured: false,
  },

  // ── NEW: What happens after prequalify ───────────────────────────────────────
  {
    slug: "dscr-loan-process-after-prequalify",
    date: "June 24, 2026", tag: "Process",
    title: "What happens after you prequalify for a DSCR loan? The step-by-step",
    summary: "Prequalification is the first step, not the last. Here's what happens between your initial estimate and a clear-to-close: soft review, term sheet, appraisal, underwriting, and funding.",
    body: [
      { p: "A DSCR prequalification — or a deal estimate from Greenstreet's Deal Analyzer — is preliminary. It tells you whether the deal looks viable on a given set of assumptions. Getting from that estimate to a funded loan involves a defined set of steps. Knowing what each step requires, how long it takes, and where deals get delayed lets you move faster and set your borrower's expectations accurately." },
      { h: "Step 1: Soft file review (Day 1–2)" },
      { p: "After a deal estimate, the next step is a soft file review — not a full application, but a confirmation of the key inputs before you invest in an appraisal. Greenstreet's team reviews:" },
      { list: [
        "Property address and type (SFR, 2–4 unit, condo, STR) — program eligibility confirmed.",
        "Estimated DSCR range — based on your inputs, verified against program minimums.",
        "Borrower FICO range (soft pull) — identifies which rate tier applies.",
        "Entity structure — LLC vesting confirmed, ownership verified against eligibility rules.",
        "Reserve position — preliminary check against the program's reserve requirement.",
      ]},
      { p: "Output: a go/no-go on program fit and a preliminary rate range. If there's a structural issue (LLC problem, property type ineligible, FICO below program floor), it surfaces here — before the appraisal. This step is where deals that would never close are identified cleanly, saving the investor several hundred dollars in appraisal fees." },
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
      { p: "Review the term sheet carefully. The rate on the term sheet is indicative — it locks only when you formally lock the rate after the appraisal returns. The fee schedule on the term sheet is binding only to the extent stated. Greenstreet uses the InvestGO term sheet format for most files." },
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
      { p: "Once all CA conditions are satisfied, the file moves to clear-to-close (CTC). Closing disclosure (CD) is issued — federal law requires 3 business days between CD delivery and closing. Closing happens with a title company or attorney (depending on state). Funding follows closing by 1–3 business days." },
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
    author: "Priya Rao",
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
      { p: "Qualification requirement: most lenders require IO at FICO 720+ and LTV ≤ 75%. The rate on an IO loan is typically 0.125–0.25% above the equivalent fully amortizing rate. Model the IO DSCR at the IO rate, not the amortizing rate, and confirm IO is available in your target state." },
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
    author: "Marcus Chen",
    featured: false,
  },
];

// The grid posts (all except the featured one), in reverse-chron order
const GRID_POSTS = POSTS.filter((p) => !p.featured);
const FEATURED_POST = POSTS.find((p) => p.featured)!;

// ── Tag filter list ───────────────────────────────────────────────────────────
const ALL_TAGS = ["All", "Lending", "Tax", "Compliance", "Rates", "Underwriting", "STR", "Process", "Product"];

// ── Reusable article body renderer ───────────────────────────────────────────
function ArticleBody({ blocks }: { blocks: { p?: string; h?: string; quote?: string; list?: string[] }[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.h) return (
          <h2 key={i} style={{ color: dc.dark, fontSize: "clamp(20px,2vw,26px)", fontWeight: 600, margin: "36px 0 14px", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
            {b.h}
          </h2>
        );
        if (b.quote) return (
          <blockquote key={i} style={{ borderLeft: `3px solid ${dc.lemon}`, padding: "14px 24px", margin: "32px 0", color: dc.dark, fontSize: "clamp(18px,1.6vw,22px)", lineHeight: 1.35, fontWeight: 600, letterSpacing: "-0.02em" }}>
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
        { label: "Loan Programs", view: "products" },
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
        { label: "Loan Programs", view: "products" },
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
            <h2 style={{ fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: dc.cream, margin: "0 0 16px" }}>
              {FEATURED_POST.title}
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: "0 0 24px", letterSpacing: "-0.01em", maxWidth: "48ch" }}>
              {FEATURED_POST.summary}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: dc.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: dc.dark, flexShrink: 0 }}>
                PR
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.7)", letterSpacing: "-0.01em" }}>
                Priya Rao · Head of Quant
              </span>
            </div>
          </div>
          {/* Right panel — solid fill, flat 1px border, no glow */}
          <div style={{ background: dc.teal, border: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <Mono style={{ fontSize: "clamp(40px,5vw,72px)", fontWeight: 600, color: "rgba(216,217,88,0.9)", letterSpacing: "-0.03em" }}>
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
                  <Mono style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: p.glyphColor, letterSpacing: "-0.03em" }}>
                    {p.glyph}
                  </Mono>
                </div>
                <div style={{ padding: "clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Tag pill + date on same row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: dc.rain, background: "rgba(0,101,101,0.10)", padding: "3px 8px", borderRadius: 4 }}>
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
                      <span style={{ fontSize: 10, fontWeight: 700, color: dc.cream, letterSpacing: "-0.01em" }}>
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
