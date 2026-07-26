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
@media (max-width: 700px) {
  .dc-band-2, .dc-band-3 { grid-template-columns: 1fr !important; }
  .bl-card { min-height: 0 !important; }
}
`;

// ── Post data (all existing posts preserved) ──────────────────────────────────
export const POSTS = [
  // ── DSCR EDUCATION ARTICLES (added 2026-06-25) ──────────────────────────────
  {
    slug: "greenstreet-go-launch",
    date: "June 25, 2026", tag: "Product",
    title: "InvestGO: an educational DSCR workflow concept",
    summary: "An educational way to organize DSCR assumptions, stress tests, and questions for a lender or adviser to confirm.",
    body: [
      { p: "InvestGO is an educational workflow concept for organizing a DSCR scenario. It can help an investor or broker assemble assumptions before discussing a potential loan with a lender; it is not a lending decision, rate quote, legal determination, or commitment." },
      { h: "Why InvestGO exists" },
      { p: "DSCR lending looks simple until a file crosses real-world constraints. Rent, PITIA, credit, LTV, property type, and prepayment terms can all affect an offer. Short-term-rental income may be assessed differently from an owner's projection. A workflow can make those assumptions easier to review, but the lender's current criteria control." },
      { h: "What the platform does" },
      { list: [
        "Separates a lender-style DSCR estimate from an investor's own cash-flow analysis.",
        "Organizes lender and program variables for comparison; availability and fit require direct provider confirmation.",
        "Prompts a review of prepayment and usury questions with current, jurisdiction-specific sources or qualified counsel; it is not a 50-state legal check.",
        "Supports scenario testing for refinance timing, ARM resets, returns, tax assumptions, and portfolio views.",
      ]},
      { h: "No black box in the numbers" },
      { p: "A calculator can apply the same stated inputs consistently. Its result remains an estimate: pricing, state-law treatment, and underwriting outcomes must be confirmed with the relevant lender and, where appropriate, a qualified professional." },
      { quote: "Trace each estimate to its inputs and assumptions, then confirm the current terms and rules with the appropriate provider or adviser." },
      { h: "Who it is for" },
      { p: "Investors can stress-test an acquisition and review the assumptions behind a potential financing path before making a decision." },
    ],
    glyph: "GO", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "what-is-dscr-how-it-works",
    date: "June 25, 2026", tag: "Lending",
    title: "What is DSCR? The complete guide to how the ratio works and why it matters",
    summary: "DSCR is commonly calculated as rent ÷ PITIA. Learn the basic ratio and the lender-specific inputs to verify before applying.",
    body: [
      { p: "DSCR stands for Debt Service Coverage Ratio. It is a common measure in investment-property lending, but it is not the only consideration in every loan decision. Some lenders may focus on property cash flow rather than employment income; confirm the applicable underwriting approach and documentation requirements directly with the lender." },
      { h: "The formula: rent ÷ PITIA" },
      { p: "DSCR = Gross Monthly Rent ÷ Total Monthly PITIA. That's it. Example: rent = $2,500/month. PITIA = $1,420 P&I + $330 taxes + $110 insurance + $60 HOA = $1,920/month. DSCR = $2,500 ÷ $1,920 = 1.30x. The property generates 30% more income than it costs to carry. A DSCR of exactly 1.0x means rent equals the payment — no surplus. Below 1.0x, the rent does not cover the payment." },
      { h: "What goes into PITIA" },
      { list: [
        "P — Principal reduction on the loan balance.",
        "I — Interest at the note rate.",
        "T — Property taxes. A lender may use a current tax estimate or bill divided by 12; confirm its method and account for reassessment or exemption changes.",
        "I — Hazard insurance (and flood insurance if required). Coastal properties in FEMA Special Flood Hazard Areas can see $300–600/month here — that alone can push an otherwise-qualifying deal below 1.0.",
        "A — HOA dues (if applicable). Full monthly HOA included at face value.",
      ]},
      { h: "What counts as gross rent" },
      { p: "For a standard long-term rental, a lender may consider a signed lease, an appraisal rent schedule such as Form 1007, or another documented market-rent source. The figure used and whether a lease is required vary by lender and property." },
      { p: "For short-term rentals, lenders may use a long-term-rent schedule, a third-party projection, documented operating history, or another method. Ask the lender which source, haircut, documentation, and local-use restrictions apply before relying on a projection." },
      { h: "DSCR tiers and what they mean for your deal" },
      { list: [
        "Higher DSCR can improve a file's resilience, but it does not guarantee a particular rate, reserve requirement, or approval.",
        "A DSCR near or above 1.0 may be relevant to many programs, yet lenders set their own minimums and may apply other conditions.",
        "Sub-1.0 scenarios sometimes receive different treatment, such as lower leverage or additional reserves; availability and pricing vary widely.",
        "Use the ratio to identify questions for a lender rather than to infer that a specific financing option is available.",
      ]},
      { h: "Why DSCR ≠ cash flow" },
      { p: "DSCR uses gross rent, not net. It doesn't subtract vacancy, property management, repairs, or capital expenditures. A 1.15x DSCR property is not necessarily cash-flow-positive after accounting for those real operating costs. Run the net analysis separately — the DSCR gets you through underwriting, but your actual return depends on the full operating picture." },
      { quote: "DSCR is the lender's question: does the rent cover the payment? It's not the investor's question: does the property actually cash flow after expenses?" },
      { p: "→ Use a DSCR calculator to explore assumptions, then confirm the resulting terms and eligibility with a lender." },
    ],
    glyph: "÷", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Editorial",
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
      { p: "Once you have a realistic PITIA estimate, you can calculate a break-even rate: the interest rate at which DSCR would equal 1.00x. The gap between an illustrative offered rate and that break-even rate can help test rate sensitivity. Treat the result as scenario analysis, not a rate quote or underwriting decision." },
      { quote: "Tax and insurance are the two PITIA components that sink deals at underwriting. Model both from real sources — county records and an actual insurance quote — before you go to contract." },
    ],
    glyph: "Σ", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "obbba-2025-real-estate-tax-changes",
    date: "June 23, 2026", tag: "Tax",
    title: "Tax-law changes and real estate models: questions to verify",
    summary: "Tax provisions can materially affect an after-tax model, but rates, eligibility, and effective dates require current CPA and IRS confirmation.",
    body: [
      { p: "Tax legislation, IRS guidance, and taxpayer circumstances can change an investment property's after-tax model. This is a planning checklist, not a statement of current law or tax advice. Confirm every provision, effective date, and eligibility condition with a CPA and the relevant primary source before using it in a decision." },
      { h: "Qualified business income" },
      { p: "If a model includes a qualified-business-income deduction, verify whether rental activity qualifies, which limitations apply, and the percentage available for the applicable tax year. Do not assume an LLC alone establishes eligibility." },
      { h: "§179 expensing" },
      { p: "If a model includes §179, verify the current annual limits, phaseouts, property eligibility, business-income limitation, and interaction with other deductions. A tax professional can determine whether a particular improvement or asset qualifies." },
      { h: "Bonus depreciation" },
      { p: "If a model includes bonus depreciation or cost segregation, verify the applicable percentage, placed-in-service rules, asset classification, passive-activity limitations, and state treatment. A cost-segregation study does not itself guarantee the resulting tax treatment." },
      { h: "What it means on a DSCR acquisition" },
      { list: [
        "Keep tax assumptions separate from the loan qualification model and label each assumption with its source and tax year.",
        "Ask a CPA to evaluate the ordering and interaction of §179, bonus depreciation, passive-activity rules, and entity treatment.",
        "Run conservative and alternative after-tax scenarios rather than booking a deduction before its eligibility is confirmed.",
      ]},
      { p: "These provisions interact with §469 passive activity loss rules and the 3.8% net investment income tax. Not every investor can use them all in the acquisition year. Real estate professionals, short-term rental operators with material participation, and high-income investors who hit the PAL exception each face a different outcome. Confirm with a CPA before booking the benefit into your model." },
      { quote: "Use current primary tax guidance and a qualified CPA before relying on an after-tax return projection." },
    ],
    // mockup glyph metadata
    glyph: "%", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026", tag: "Compliance",
    title: "Minnesota DSCR loans: questions to verify before structuring",
    summary: "Minnesota loan-purpose and prepayment rules require current, transaction-specific confirmation from the lender and qualified local counsel.",
    body: [
      { p: "Minnesota rules can affect investment-property financing, loan purpose, entity documentation, and prepayment terms. Laws, regulations, guidance, and lender overlays can change. This article is an educational checklist, not a current legal interpretation." },
      { h: "What to verify" },
      { list: [
        "Whether the proposed loan is business-purpose or consumer-purpose under current Minnesota law and the lender's policies.",
        "Whether any prepayment provision, fee, disclosure, or affidavit is permitted for the proposed borrower and property.",
        "Which statutes, regulations, effective dates, and lender requirements apply on the date of the transaction.",
      ]},
      { h: "What to do on a MN file" },
      { p: "Before applying, ask the lender for its current Minnesota requirements and have qualified local counsel review the proposed structure and documents. Do not infer eligibility or enforceability from a generic checklist." },
      { quote: "For state-specific questions, current primary sources and qualified local counsel are essential." },
    ],
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "qoz-qrof-permanent-obbba",
    date: "June 21, 2026", tag: "Tax",
    title: "Opportunity Zone investing: questions to verify before modeling",
    summary: "Opportunity Zone treatment can depend on current federal and state rules, fund structure, timing, and taxpayer facts. Verify the assumptions with a CPA.",
    body: [
      { p: "Opportunity Zone rules are complex and may change through legislation, regulations, and IRS guidance. This educational overview identifies topics to investigate; it does not establish the availability, amount, or timing of any tax benefit." },
      { h: "Questions for a current review" },
      { list: [
        "Whether the census tract, fund, investor, and property satisfy the current qualification tests.",
        "How current deferral, basis, holding-period, and inclusion-event rules apply to the investor's contribution date.",
        "Whether a rural or other special designation exists and what requirements or benefits, if any, it carries.",
        "How federal rules interact with state tax treatment, financing, operating covenants, and exit plans.",
      ]},
      { h: "Timing and documentation" },
      { p: "Contribution dates, fund documents, operating milestones, and inclusion events can drive the outcome. Have a CPA review the current rules and the fund's documentation before treating a timing assumption as settled." },
      { h: "Financing and rural properties" },
      { p: "A rural property's financing may depend on appraisal support, property type, lender appetite, and the sponsor's plan. Separately verify the financing terms and the tax structure; one does not establish the other." },
      { h: "The 1031 vs QOZ comparison" },
      { p: "A 1031 exchange and an Opportunity Zone investment can produce materially different tax, liquidity, control, and financing outcomes. A CPA should compare current-law scenarios using the investor's actual facts." },
      { quote: "Tax incentives and financing assumptions should each be verified before they are included in an investment decision." },
    ],
    glyph: "⊕", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "section-1071-final-rule-dscr",
    date: "June 19, 2026", tag: "Compliance",
    title: "Section 1071 and DSCR lending: questions to verify",
    summary: "Coverage, thresholds, effective dates, and contractual reporting obligations should be verified from current CFPB guidance and counsel.",
    body: [
      { p: "Section 1071 obligations can depend on the current rule, legal developments, the institution's activity, and the characteristics of a credit transaction. This article is a compliance discussion prompt, not legal advice or a statement of current regulatory status." },
      { h: "Coverage and timing" },
      { p: "Confirm the current coverage test, applicable thresholds, reporting dates, and any exemptions from the CFPB's latest primary materials and qualified counsel. Do not apply a threshold or effective date from a general article to a live file." },
      { h: "Operational questions" },
      { list: [
        "Which applications, borrowers, and credit products are covered under the current rule.",
        "Which data points, collection procedures, firewall requirements, and reporting format apply.",
        "Whether exclusions, transition rules, or court developments affect the institution's obligations.",
        "Which governance, monitoring, and record-retention controls are required.",
      ]},
      { h: "Indirect exposure through warehouse facilities" },
      { p: "Warehouse, correspondent, and other counterparties may impose contractual data or reporting requirements separate from a lender's direct regulatory obligation. Review current agreements and confirm expectations with the counterparty and compliance counsel." },
      { h: "Compliance calendar" },
      { list: [
        "Maintain a calendar from current official sources rather than relying on article dates.",
        "Document the institution's coverage analysis and assumptions.",
        "Reassess when the rule, litigation, volume, products, or counterparties change.",
      ]},
      { quote: "Regulatory timing and coverage should be verified from current primary sources and qualified counsel." },
    ],
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026", tag: "Rates",
    title: "How to read a DSCR rate quote",
    summary: "A rate is meaningful only alongside its dated assumptions, fees, lock period, prepayment terms, and lender-specific eligibility criteria.",
    body: [
      { p: "Published DSCR rates can be illustrative or limited to a particular file profile. Treat any rate as a starting point for questions, not an offer. Obtain a dated written quote with the assumptions, fees, lock period, and eligibility criteria stated clearly." },
      { h: "The best-tier reality" },
      { list: [
        "Confirm the credit, LTV, DSCR, property-type, occupancy, and reserve assumptions behind the quote.",
        "Compare rate, points, lender fees, third-party costs, and lock period together.",
        "Review the prepayment provision and its legal and economic implications before selecting an option.",
      ]},
      { h: "Where the typical broker lands" },
      { p: "Market conditions and lender pricing change frequently. Avoid using a generalized range to set borrower expectations; compare current written quotes that use the same assumptions." },
      { quote: "A useful rate comparison is current, written, and matched to the same assumptions." },
    ],
    glyph: "∿", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Greenstreet Editorial",
    featured: false,
  },
  {
    slug: "fema-rr2-coastal-dscr",
    date: "June 17, 2026", tag: "Underwriting",
    title: "Flood insurance and coastal DSCR scenarios: what to verify",
    summary: "Flood coverage and cost can materially affect a coastal DSCR scenario. Confirm current maps, requirements, and quotes before relying on a model.",
    body: [
      { p: "Flood maps, coverage requirements, policy pricing, and lender standards can change and can vary by property. A model should use current, property-specific information rather than a prior policy, a seller disclosure, or a general market statistic." },
      { h: "Where flood cost affects a scenario" },
      { list: [
        "A flood-insurance premium increases PITIA and can materially change a DSCR estimate.",
        "There is no universal insurance-to-rent threshold or lender treatment; assess the property's own payment and reserve requirements.",
        "Ask the lender which coverage sources and policy terms it accepts, then compare current quotes before modeling.",
      ]},
      { h: "What to check before underwriting a coastal deal" },
      { p: "Before relying on a coastal model, check the current map and property information from the appropriate official source, obtain current insurance quotes, and confirm the lender's coverage requirements. Replace each estimate with the actual quote when available." },
      { p: "Flood zones and insurance inputs should be treated as time-sensitive. Use current official property information rather than relying on historical descriptions or prior-owner disclosures." },
      { quote: "A DSCR model is only as reliable as its current, property-specific insurance inputs." },
    ],
    glyph: "☼", glyphColor: dc.emerald, bg: dc.teal,
    author: "Greenstreet Editorial",
    featured: false,
  },
  // Featured post (why-no-llm) drives the Featured block; listed separately below
  {
    slug: "why-no-llm-number-path",
    date: "May 12, 2026", tag: "Product",
    title: "Why deterministic models matter for numerical estimates",
    summary: "A transparent calculator can make stated assumptions easier to review; estimates still require lender and professional confirmation.",
    body: [
      { p: "For a calculator, applying the same stated inputs consistently can make an estimate easier to audit. That does not make the estimate a rate quote, legal conclusion, or underwriting decision; the lender's current criteria and source documents still control." },
      { h: "The problem with LLMs in the number path" },
      { p: "Language models are probabilistic by design. Ask the same question twice and you may get slightly different numbers. For a borrower trying to model whether a deal qualifies at a 1.11x DSCR or a 1.08x, that variance is not a minor inconvenience — it's a trust problem. One number closes. The other doesn't. You can't have both be correct." },
      { h: "Where AI does belong" },
      { list: [
        "Drafting plain-language explanations of assumptions for human review.",
        "Identifying questions to take to a lender or qualified adviser.",
        "Organizing potential lender criteria to verify against current source documents.",
      ]},
      { p: "AI-generated prose should not be treated as an authoritative calculation or legal interpretation. For a numerical estimate, show the stated formula and inputs, then confirm the figures, terms, and eligibility with the appropriate provider." },
      { h: "The audit trail requirement" },
      { p: "A well-documented scenario should identify where PITIA, rent, rates, and other assumptions came from. Retain the source and date for each input so a lender or adviser can review the model." },
      { quote: "Transparent assumptions make an estimate easier to review; they do not replace lender underwriting or professional advice." },
    ],
    glyph: "det()", glyphColor: dc.lemon, bg: dc.dark,
    author: "Greenstreet Editorial",
    featured: true,
  },

  // ── NEW: STR/Airbnb qualifying income ────────────────────────────────────────
  {
    slug: "dscr-str-airbnb-qualifying-income",
    date: "June 25, 2026", tag: "STR",
    title: "Short-term rental (STR) income in a DSCR scenario",
    summary: "STR income treatment varies by lender, property, and local rules. Learn the documentation and questions to verify before modeling a scenario.",
    body: [
      { p: "Short-term-rental rules and financing treatment vary by jurisdiction, property, and lender. Before modeling revenue, confirm that the use is permitted locally and ask the lender which income source and documentation it will consider." },
      { h: "Why gross booking revenue doesn't qualify" },
      { p: "Gross booking revenue can differ materially from an owner's usable cash flow. A lender may apply its own method, documentation standard, and adjustment to rental projections or operating history; do not assume a platform total is qualifying income." },
      { h: "The three-figure hierarchy" },
      { list: [
        "A long-term-rent opinion, such as an appraisal rent schedule, may be one source a lender considers.",
        "A third-party STR projection may be considered, but the provider, adjustment, and documentation requirements are lender-specific.",
        "Documented operating history may be considered, subject to the lender's required history, verification method, and adjustment.",
      ]},
      { p: "The income source that controls is lender-specific. A property without operating history may be evaluated differently from an established STR. Obtain the lender's current written methodology before relying on a projection." },
      { h: "STR documentation required at underwriting" },
      { list: [
        "Any third-party report, appraisal item, operating history, and verification method the lender specifies.",
        "Current municipal and HOA rules, licenses, permits, or restrictions applicable to the property; confirm them with the appropriate local source.",
        "Evidence of loan purpose and occupancy as required by the lender and applicable law.",
      ]},
      { h: "Reserve overlay for STR" },
      { p: "Reserve requirements can change for an STR based on the lender, DSCR, credit profile, property type, and other file factors. Request the current written requirement before assuming the funds needed to close." },
      { h: "Confirming program fit" },
      { p: "Ask each lender whether it accepts the property's STR use, income source, unit count, condo or condotel classification, and local restrictions. Program availability, pricing, and eligibility are provider-specific and can change." },
      { h: "The math on a real STR deal" },
      { p: "Example: 3BR SFR in a beach market. AirDNA projected gross: $72,000/year ($6,000/month). 1007 long-term rent: $2,400/month. PITIA: $2,200/month." },
      { p: "Illustrative scenario: a $2,400 monthly rent input and $2,200 PITIA produce 1.09x DSCR. A different income input produces a different estimate; it does not establish what a lender will accept." },
      { p: "Compare the lender's documented income method with the investor's own operating forecast. A stronger projection does not by itself establish eligibility, pricing, or a closing outcome." },
      { quote: "Confirm local STR permissibility and the lender's current income method before relying on a DSCR estimate." },
    ],
    glyph: "STR", glyphColor: dc.dark, bg: dc.lemon,
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
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
    author: "Greenstreet Editorial",
    featured: false,
  },
];

// The grid posts (all except the featured one), in reverse-chron order
const GRID_POSTS = POSTS.filter((p) => !p.featured);
// Fall back to the first post instead of asserting: a future content edit
// that unmarks the featured post (or forgets to mark a replacement) should
// degrade to "show the first post," not crash the /blog route.
const FEATURED_POST = POSTS.find((p) => p.featured) ?? POSTS[0];

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

          <p style={{ color: "rgba(0,55,56,0.58)", fontSize: 13, lineHeight: 1.55, margin: "-18px 0 30px", fontWeight: 500 }}>
            Editorial note: This article is educational and may use illustrative assumptions. It is not a loan offer, approval, rate quote, legal advice, or tax advice. Confirm current terms, eligibility, and applicable rules with the relevant lender and qualified professionals.
          </p>

          <ArticleBody blocks={post.body} />

          {/* End CTA — concrete next step */}
          <div
            className="gs-reveal"
            style={{ marginTop: 48, borderRadius: 12, border: `1px solid rgba(0,55,56,0.12)`, background: dc.mintBg, padding: "clamp(24px,3vw,36px) clamp(24px,3vw,40px)" }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 12 }}>
              Model a DSCR scenario
            </div>
            <p style={{ color: "rgba(0,55,56,0.72)", fontSize: 15, marginBottom: 22, lineHeight: 1.6, fontWeight: 500 }}>
              Explore a DSCR estimate from your stated rent and loan assumptions. It is educational only; confirm current pricing, program availability, and eligibility directly with a lender.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <button
                onClick={() => (window as any).openQualify?.()}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", padding: "12px 24px", borderRadius: 8, fontFamily: dc.sans, letterSpacing: "-0.01em", minHeight: 44 }}
              >
                Model a DSCR scenario →
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
              Plain-language articles on DSCR concepts, scenario modeling, and questions to verify before pursuing investment-property financing.
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
                Greenstreet Editorial
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
                        {p.author === "Greenstreet Editorial" ? "GE" : p.author.split(" ").map((n: string) => n[0]).join("")}
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
