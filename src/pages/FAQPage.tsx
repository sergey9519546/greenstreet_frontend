import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import BottomCTA from "../design/BottomCTA";

const AS_OF = "Jun 25, 2026";

// Source attribution per answer — refreshed 2026-06-25.
// Each `src` is the primary source a curious reader (or AI search engine) can verify.
// Groups: Basics, Qualification, Income & Property, Refinance, Compliance & Regulatory
const FAQS: { q: string; a: string; src: string; group?: string; cta?: { label: string; action: "calculator" | "qualify" | "state-laws" | "lender-intel" } }[] = [
  // ── GROUP: The basics ─────────────────────────────────────────────────────────
  {
    group: "The basics",
    q: "Do I need to show my income or tax returns to qualify?",
    a: "No. A DSCR (Debt Service Coverage Ratio — whether the property's rent can cover the loan payment) loan qualifies on what the property earns, not what you earn. The lender divides the property's gross monthly rent by its total monthly PITIA (the full monthly payment — principal, interest, taxes, insurance, and any HOA dues). A DSCR at or above 1.0 means rent covers the payment. No W-2s, no pay stubs, no employment history required.",
    src: "12 CFR 1026.43 · TILA / Reg Z QM rules",
    cta: { label: "Estimate your DSCR →", action: "calculator" },
  },
  {
    group: "The basics",
    q: "How is DSCR calculated — what's the actual formula?",
    a: "DSCR = Gross Monthly Rent ÷ Total Monthly PITIA (1.00 = rent exactly covers the payment; higher is stronger). Worked example: rent = $2,500/month. PITIA = $1,420 P&I + $330 taxes + $110 insurance + $60 HOA = $1,920. DSCR = $2,500 ÷ $1,920 = 1.30x — the property generates 30% more income than it costs to carry. A result below 1.0 means the rent doesn't cover the payment. Lenders use the lower of the signed lease or the Form 1007 appraiser market-rent estimate — not the Zillow figure or the listing.",
    src: "Fannie Mae 1007 form · Greenstreet engine.ts DSCR calc",
    cta: { label: "Run the numbers on your deal →", action: "calculator" },
  },
  {
    group: "The basics",
    q: "What goes into the monthly payment lenders calculate (PITIA)?",
    a: "PITIA is the full monthly payment — Principal, Interest, Taxes, Insurance, and HOA dues. P = Principal. I = Interest at the note rate. T = Property taxes (actual annual bill ÷ 12 — use the post-sale assessed value, not the seller's homestead-exempt bill). I = Insurance (hazard + flood if required — get a real quote; coastal properties can run $300–600/month). A = HOA dues (full monthly amount). Taxes and insurance are the two PITIA components that most often surprise borrowers at underwriting.",
    src: "Greenstreet engine.ts · PITIA model · FEMA RR2.0 coastal data",
  },
  {
    group: "The basics",
    q: "Why is a DSCR loan called non-QM — and does that matter?",
    a: "DSCR loans are non-QM (non-Qualified Mortgage) — they fall outside the federal safe-harbor rules under 12 CFR 1026.43(e)(2). That's exactly what enables them: no income verification, no required signed lease, projected rent is allowed. The trade-off is that lenders bear more risk, which is why DSCR rates run roughly 50–125 basis points above conforming loan rates.",
    src: "12 CFR 1026.43 · TILA / Reg Z",
  },
  {
    group: "The basics",
    q: "What rate should I realistically expect?",
    a: `Rates change with market conditions — these are indicative as of ${AS_OF}. A strong file (740+ FICO, LTV (how the loan amount compares to the property value) at or below 75%, DSCR at or above 1.0, prepayment penalty accepted) runs approximately 6.50–7.00% on a 30-year fixed — roughly 50–125bps above conforming. Most files land 6.85–7.50%. Weaker files (sub-1.0 DSCR, short-term rental, FICO below 680) run 7.50–9.50%. ARM (adjustable-rate mortgage — the rate is fixed for a few years, then resets periodically) options start lower; check the reset cap structure carefully. Confirm current pricing with your Greenstreet rep before making any decisions.`,
    src: "Freddie Mac PMMS · wk of Jun 18, 2026 · Greenstreet rate-tier model",
  },
  {
    group: "The basics",
    q: "How quickly can I close?",
    a: "Faster than a conventional loan. Greenstreet targets 14–21 days on clean files and 21–30 days on complex ones. The process is streamlined because there is no income verification — just the appraisal (which includes the Form 1007 rent estimate), property documents, and a credit pull.",
    src: "Lender-published turn times · Apr 2026 sweep",
  },
  // ── GROUP: Qualification ──────────────────────────────────────────────────────
  {
    group: "Qualification",
    q: "My DSCR is below 1.0 — can I still get a loan?",
    a: "Sometimes. Most lenders require a DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) at or above 1.00. Some accept as low as 0.75 with compensating factors such as a strong credit score and more cash reserves. Sub-1.0 options exist, but lender choices narrow sharply and reserves jump to 9–12 months. If the DSCR is below 0.75, most institutional programs don't apply.",
    src: "Greenstreet lender matrix · Apr 2026 sweep",
    cta: { label: "Check your deal's DSCR →", action: "calculator" },
  },
  {
    group: "Qualification",
    q: "What credit score do I need?",
    a: "Greenstreet's Core program requires 660+. The Flex program goes to 640 with compensating factors. Going from 660 to 740+ can save 0.75–1.50% in rate and unlock the Premier tier. ITIN borrowers and non-US investors without a U.S. Social Security Number qualify on the Global program.",
    src: "Greenstreet program matrix · Q2 2026 sweep · 7 programs verified",
  },
  {
    group: "Qualification",
    q: "How much do I need to put down?",
    a: "The standard minimum is 20% down (80% LTV — how the loan amount compares to the property value). Greenstreet prices its best rates at 75% LTV (25% down). A strong file (740+ FICO, DSCR at or above 1.0, SFR purchase) accesses the Premier tier at that level. Going from 80% to 75% LTV typically saves 0.25–0.50% in rate.",
    src: "Greenstreet lender matrix · Apr 2026",
  },
  {
    group: "Qualification",
    q: "How much cash do I need to keep in the bank after closing?",
    a: "Lenders require reserves (months of mortgage payments kept in the bank after closing). At DSCR 1.25 or above: 3 months. At 1.00–1.24: 3–6 months. At 0.75–0.99: 9–12 months. Overlays add extra months for: short-term rentals (+3), condos (+3), credit score below 680 (+3), first-time investors (+3), loans above $1M (+6), non-US investors (+6). These stack. Retirement accounts count at 70% if you are 59½ or older. Cryptocurrency counts as zero.",
    src: "Greenstreet reserveEngine.ts · 5-overlay model",
  },
  {
    group: "Qualification",
    q: "Can I buy through an LLC?",
    a: "Yes — and most lenders prefer it for business-purpose compliance. LLC vesting is standard. You will sign a personal guaranty (full recourse). The entity can have at most 4 owners; the guarantor must own at least 51%. Layered LLCs (an LLC inside another LLC) are capped at 2 layers. Caution: New Jersey LLC vesting is high-risk — some lenders won't take NJ LLC deals due to prepayment-penalty ambiguity under N.J.S.A. 46:10B-2.",
    src: "NJ N.J.S.A. 46:10B-2 · Greenstreet NJ LLC caveat",
  },
  {
    group: "Qualification",
    q: "Can a non-US investor or ITIN borrower get a DSCR loan?",
    a: "Yes. DSCR qualification is property-based, not borrower-income-based, which makes it one of the most accessible U.S. loan products for international investors. ITIN borrowers access most standard DSCR programs with minor overlays. Non-US investors with no U.S. credit access the Greenstreet Global program. Additional requirements: international credit report or bank letter, 6–12 months foreign bank statements for reserves, LTV typically capped at 70–75%, and a +6-month reserves overlay. FIRPTA withholding applies on sale — coordinate with a cross-border CPA.",
    src: "Greenstreet Global program matrix · FIRPTA IRC §897 · Q2 2026",
    cta: { label: "See if your file qualifies →", action: "qualify" },
  },
  {
    group: "Qualification",
    q: "What happens after I prequalify — what are the steps to close?",
    a: "Six steps: (1) Soft file review (Day 1–2): Greenstreet confirms program fit — property type, DSCR range, FICO tier, entity structure, reserves. (2) Term sheet (Day 2–4): indicative rate range, fees, reserve requirement, prepay options — not a commitment. (3) Formal application + appraisal ordered (Day 3–5): you complete the application and pay the appraisal deposit; the 1007 rent schedule is part of the appraisal. (4) Document submission (Day 5–10): submit the full doc package in parallel with the appraisal. (5) Underwriting (Day 12–20 after appraisal returns): DSCR verified at the locked rate, title reviewed, conditions issued. (6) Clear to close → closing → funding: 3-business-day CD delivery period required by federal law. Total target: 21–30 business days on a clean file. The appraisal is the critical path — order it as early as possible.",
    src: "Greenstreet close-process SOP · TRID 3-day CD rule (12 CFR 1026.19)",
  },
  {
    group: "Qualification",
    q: "How can I improve my DSCR before applying?",
    a: "Four levers: (1) Buy down the rate: each 0.25% rate reduction saves ~$15–17/month per $100K of loan. On a $400K loan, buying down 0.50% saves ~$130/month in P&I. Points cost roughly 1% of loan per 0.25% of rate reduction. (2) Switch to interest-only (IO): IO eliminates the principal component, saving roughly $250–350/month on a $400K loan at current rates. Requires 720+ FICO, ≤75% LTV on most programs. (3) Raise the qualifying rent: provide the appraiser with comparable rental data before the inspection; sign a market-rate lease before closing (if vacant); or use documented 12-month STR history if the property is STR-eligible. (4) Increase the down payment: going from 80% to 75% LTV on a $400K deal reduces P&I by ~$85/month AND unlocks the better LTV rate tier, saving an additional 0.25–0.50%. Levers 2 and 4 combined can often take a 0.92x DSCR to 1.10x+ without touching the rent.",
    src: "Greenstreet engine.ts IO model · LTV pricing matrix · Q2 2026",
    cta: { label: "Model the impact on your deal →", action: "calculator" },
  },
  {
    group: "Qualification",
    q: "What is the deal-break rate?",
    a: "The deal-break rate is the interest rate at which DSCR falls to exactly 1.00x — the lender's hard floor. Below 1.00x, the deal won't qualify. The headroom between your offered rate and the deal-break rate (in basis points) tells you how much rate shock the deal can absorb before it fails — useful for ARM reset modeling and refinance planning. Greenstreet's Deal Analyzer surfaces both numbers on every solve.",
    src: "Greenstreet engine.ts · dealBreakRate + rateHeadroomBps",
  },
  // ── GROUP: Rental income & property ──────────────────────────────────────────
  {
    group: "Rental income & property",
    q: "Does the property need to have a tenant already?",
    a: "No. A significant share of DSCR loans close without a signed lease. Lenders use Form 1007 market rent from the appraisal — the appraiser's estimate of what the property would rent for — as the qualifying figure. If you do have a lease, the lender uses the lower of the lease rent and the 1007 rent. Vacant properties and new acquisitions are fine.",
    src: "Verus/S&P 2025 DSCR securitization data · Fannie Mae 1007",
  },
  {
    group: "Rental income & property",
    q: "Can I use a DSCR loan for an Airbnb or short-term rental?",
    a: "Yes, but short-term rental income is qualified more conservatively. Lenders use the lowest of: (1) Form 1007 long-term rental appraisal, (2) AirDNA projected income × 70–80%, or (3) documented 12-month platform payout history × 70–80%. If you don't have 12 months of STR history, the 1007 long-term rent controls — which can be significantly lower than your Airbnb projection. Short-term rental properties also require 3 extra months of reserves (mortgage payments kept in the bank after closing). Greenstreet pre-checks STR legality in all 50 states before matching you to a program.",
    src: "50-state STR matrix · Q2 2026 · Minut 2026 + state statutes",
  },
  {
    group: "Rental income & property",
    q: "What property types can I finance with a DSCR loan?",
    a: "Eligible: single-family homes (attached and detached), 2–4 unit residential, warrantable and non-warrantable condos, condotels (with conditions), manufactured/modular homes, ADUs. Not eligible: assisted living or group homes, agricultural properties over 20 acres, co-ops, fractional ownership or timeshares, mixed-use commercial, properties under 500 sq ft. Properties must be in C4 condition or better (no significant deferred maintenance).",
    src: "Fannie Mae Property Eligibility Guide · Greenstreet underwriter notes",
  },
  {
    group: "Rental income & property",
    q: "What documents do I need to close a DSCR loan?",
    a: "No W-2s or tax returns — but there is a document list. Property docs: executed purchase contract or mortgage statement, Form 1007 rent schedule (from the appraisal — not something you provide), signed lease if occupied, HOA dues statement. Insurance: hazard binder showing investment occupancy type, flood binder if the property is in a FEMA Special Flood Hazard Area, wind/hurricane coverage where required. Entity docs (if buying through an LLC): Operating Agreement, Articles of Organization, Certificate of Good Standing dated within 90 days, EIN letter, resolution to borrow. Borrower docs: photo ID, SSN or ITIN, credit authorization, 12 months bank statements for reserves. Funds to close: 60-day paper trail on down payment and closing cost funds. The three items that most commonly delay closings: insurance binder with the wrong occupancy type, LLC with lapsed good standing, and a reserves shortfall discovered late in the process.",
    src: "Greenstreet doc checklist · program underwriting guidelines Q2 2026",
  },
  {
    group: "Rental income & property",
    q: "How do lenders calculate qualifying income on a short-term rental?",
    a: "Lenders use the lowest of three figures: (1) Form 1007 long-term market rent — the appraiser's estimate for the property rented unfurnished on a standard lease. This is the floor and controls if you have no STR history. (2) AirDNA projected income × 70–80% — the market estimate, reduced for vacancy and seasonality. (3) Documented 12-month STR gross revenue × 70–80% — only available with full platform payout statements for all 12 months. If the property has never operated as a short-term rental, you qualify on the 1007 long-term rent regardless of what Airbnb projects. Short-term rental adds 3 extra months to the reserves requirement.",
    src: "50-state STR matrix · Q2 2026 · AirDNA methodology · Greenstreet STR program overlays",
  },
  {
    group: "Rental income & property",
    q: "Should I take the prepayment penalty option to get a lower rate?",
    a: "Usually yes, if you plan to hold the property for 3 or more years. A prepayment penalty (a fee some loans charge if you pay the loan off or refinance early — typically a declining schedule: 3/2/1% over three years or 5/4/3/2/1% over five) saves 0.50–0.80% in rate vs the no-penalty option. That monthly savings compounds over a multi-year hold and often more than offsets the penalty itself. The math favors accepting the penalty unless you expect to sell or refinance soon. Caution: some states restrict or ban prepayment penalties on investment property loans. Check the State Laws page before assuming the penalty option is available.",
    src: "Greenstreet statePppLaws.ts · 50-state matrix",
    cta: { label: "Check PPP rules in your state →", action: "state-laws" },
  },
  // ── GROUP: Refinance ─────────────────────────────────────────────────────────
  {
    group: "Refinance",
    q: "Can I refinance a DSCR loan after I close?",
    a: "Yes. Both a rate & term refinance (replace your current loan to change the rate or term, without taking cash out) and a cash-out refinance (replace your loan with a larger one and take the difference in cash) are available on DSCR investment properties. Both require the property to re-qualify on DSCR at the new rate and new loan amount.",
    src: "Greenstreet refi program matrix · Q2 2026",
  },
  {
    group: "Refinance",
    q: "How long do I have to wait before I can refinance?",
    a: "For a rate & term refinance: typically 6 months from your original closing date (some lenders allow 3 months). For a cash-out refinance: typically 12 months of ownership — this is the standard institutional floor for investment property cash-out. Exception: if you purchased with all cash (delayed financing), some lenders allow cash-out within 6 months, with the cash-out capped at your original acquisition costs.",
    src: "Greenstreet refi program matrix · Fannie Mae B2-1.3-04",
  },
  {
    group: "Refinance",
    q: "How much equity can I pull out on a cash-out refinance?",
    a: "Most DSCR programs cap cash-out refinances at 75% LTV (how the loan amount compares to the property value — lower means more equity). Some programs go to 70% on larger loans, short-term rental properties, or lower credit scores. Rate & term refinances are generally allowed up to 80% LTV. The DSCR must qualify at the new, higher loan balance — if rates have risen since purchase, the higher payment may push DSCR below the qualifying floor.",
    src: "Greenstreet refi program matrix · Q2 2026",
  },
  {
    group: "Refinance",
    q: "How do I know if refinancing actually saves money?",
    a: "Break-even months = Total closing costs ÷ Monthly payment reduction. Example: $8,000 in closing costs on a $300/month payment reduction = 26.7 months to break even. If you sell or refinance again before month 27, the refinance cost you money. Important: if you have a prepayment penalty (a fee some loans charge if you pay off or refinance early) on the existing loan, add the full penalty amount to the closing costs. A 3% penalty on a $400K loan is $12,000 — that adds 40 months to break-even, pushing it past 5.5 years. Run this before you pay the appraisal deposit.",
    src: "Greenstreet refiTracker.ts · break-even model",
    cta: { label: "See if a refi pencils on your deal →", action: "calculator" },
  },
  // ── GROUP: Compliance & regulatory ───────────────────────────────────────────
  {
    group: "Compliance & regulatory",
    q: "What changed in 2026 for DSCR loans?",
    a: "Three regulatory shifts: (1) §1071 small-business data collection threshold raised to 1,000 originations/year, effective May 1, 2026. (2) HOEPA thresholds refreshed for 2026. (3) MN HF 3437 effective Aug 1, 2026 makes business-purpose DSCR loans legal in Minnesota with full PPPs. None of these change the DSCR math — they change the paperwork.",
    src: "FR 2026-08494 · 91 FR 23530 · HOEPA 12 CFR 1026.32(a) · MN HF 3437 (2026)",
  },
  {
    group: "Compliance & regulatory",
    q: "How does OBBBA affect DSCR deal returns?",
    a: "OBBBA makes 100% bonus depreciation permanent (investors can shelter Year-1 taxable income via cost segregation) and raises §179 to $2.56M for 2026. The QBI deduction is raised to 23% and made permanent. For a $400K deal, expect roughly $12K–$20K of Year-1 depreciation shield depending on land/building split — actual outcome depends on your tax situation. Consult a CPA; Greenstreet's Tax Engine models this with OBBBA defaults.",
    src: "OBBBA 2025 · IRC §168(k) · IRC §179 · Greenstreet taxEngine.ts",
  },
];

// Resolve a CTA action to the correct navigation target
function useFaqCtaHandler(onNavigate: (v: string) => void) {
  return (action: "calculator" | "qualify" | "state-laws" | "lender-intel") => {
    if (action === "qualify") { (window as any).openQualify?.(); return; }
    if (action === "calculator") { onNavigate("dscr-calculator"); return; }
    if (action === "state-laws") { onNavigate("state-laws"); return; }
    if (action === "lender-intel") { onNavigate("lender-intel"); return; }
  };
}

export default function FAQPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const handleCtaAction = useFaqCtaHandler(onNavigate);

  useEffect(() => {
    document.title = "DSCR Loan FAQ | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.teal}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
        { label: "How It Works", view: "how-it-works" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Accordion transition CSS only — no glassmorphism, no blur, no float */}
      <style>{`
        .faq-answer{overflow:hidden;transition:max-height .32s ease,opacity .24s ease;}
        .faq-answer-open{max-height:1200px;opacity:1;}
        .faq-answer-closed{max-height:0;opacity:0;}
        .faq-btn:hover{background:${dc.mintBg} !important;}
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          background: dc.teal,
          color: dc.cream,
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(48px,6vh,72px)",
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          style={{ maxWidth: 1080, margin: "0 auto" }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(238,239,211,0.5)",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Frequently asked
          </div>
          <H1 style={{ margin: "0 0 20px", maxWidth: "18ch" }}>
            DSCR loan questions — answered in plain language.
          </H1>
          <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "50ch", margin: "0 0 20px" }}>
            A DSCR loan qualifies on the property's rent — not your income or tax returns. Every question below covers how that works, what you need to qualify, and what to watch out for.
          </Lead>
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.56)", margin: 0, letterSpacing: "-0.01em" }}>
            Last reviewed {AS_OF} · sources shown inline with each answer.
          </p>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding: "clamp(48px,6vw,80px) clamp(1.5rem,4vw,3rem) clamp(56px,8vw,96px)",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => {
            // Render a group heading before the first item in each group
            const prevGroup = i > 0 ? FAQS[i - 1].group : null;
            const showGroupHead = faq.group && faq.group !== prevGroup;
            return (
            <React.Fragment key={i}>
              {showGroupHead && (
                <div style={{ marginTop: i === 0 ? 0 : 20, marginBottom: 4, paddingLeft: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: dc.rain }}>
                    {faq.group}
                  </span>
                </div>
              )}
            <div
              style={{
                background: dc.cream,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${open === i ? dc.rain : dc.faded}`,
                transition: "border-color .15s",
              }}
            >
              {/* Question row */}
              <button
                className="faq-btn"
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: open === i ? dc.mintBg : dc.cream,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "26px 30px",
                  cursor: "pointer",
                  transition: "background .15s",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(16px,1.6vw,19px)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: dc.dark,
                    fontFamily: dc.sans,
                    lineHeight: 1.3,
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: dc.rain,
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: "transform .25s",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                    display: "inline-block",
                    fontFamily: dc.mono,
                  }}
                >
                  +
                </span>
              </button>

              {/* Answer panel */}
              <div
                className={open === i ? "faq-answer faq-answer-open" : "faq-answer faq-answer-closed"}
              >
                <div
                  style={{
                    padding: "0 30px 28px",
                    borderTop: `1px solid rgba(0,55,56,0.08)`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.65,
                      color: "rgba(0,55,56,0.7)",
                      margin: "20px 0 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {faq.a}
                  </p>
                  {faq.cta && (
                    <button
                      onClick={() => handleCtaAction(faq.cta!.action)}
                      style={{
                        marginTop: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: dc.dark,
                        color: dc.cream,
                        fontWeight: 600,
                        fontSize: 13,
                        border: "none",
                        cursor: "pointer",
                        padding: "9px 18px",
                        borderRadius: 6,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {faq.cta.label}
                    </button>
                  )}
                  {/* Source attribution — added in 2026-06-22 refresh for GEO + E-E-A-T */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px dashed rgba(0,55,56,0.15)",
                    }}
                  >
                    <Mono
                      style={{
                        fontSize: 12,
                        color: dc.rain,
                        letterSpacing: "0.01em",
                      }}
                    >
                      src · {faq.src}
                    </Mono>
                  </div>
                </div>
              </div>
            </div>
            </React.Fragment>
            );
          })}
        </div>

        {/* Qualifier CTA — wired to openQualify funnel */}
        <div
          className="gs-reveal"
          style={{ maxWidth: 880, margin: "36px auto 0", borderRadius: 12, background: dc.dark, padding: "clamp(24px,3vw,36px) clamp(24px,3vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 20 }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 8 }}>
              Ready to run your deal?
            </div>
            <p style={{ color: "rgba(238,239,211,0.75)", fontSize: 15, margin: 0, lineHeight: 1.5, maxWidth: "44ch" }}>
              Check whether your property qualifies and see your preliminary program match in minutes. No commitment required.
            </p>
          </div>
          <Btn label="See if your deal qualifies" onClick={() => (window as any).openQualify?.()} style={{ flexShrink: 0 }} />
        </div>

        {/* Freshness signal */}
        <div
          style={{
            maxWidth: 880,
            margin: "32px auto 0",
            padding: "14px 20px",
            background: dc.mintBg,
            borderRadius: 8,
            border: `1px solid ${dc.faded}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 999,
              background: dc.lemon,
              color: dc.dark,
            }}
          >
            Reviewed
          </span>
          <span style={{ fontSize: 13, color: dc.dark, fontWeight: 600 }}>
            All answers reviewed {AS_OF} · sources inline · next review Jul 22, 2026
          </span>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section
        className="gs-reveal"
        style={{
          background: dc.teal,
          padding: "clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: dc.lemon,
              marginBottom: 16,
            }}
          >
            Still have a question?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.5vw,48px)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: dc.cream,
              margin: "0 0 18px",
            }}
          >
            We didn't answer everything.
          </h2>
          <p
            style={{
              fontSize: "clamp(15px,1.3vw,18px)",
              fontWeight: 500,
              lineHeight: 1.6,
              color: "rgba(238,239,211,0.65)",
              margin: "0 0 32px",
              maxWidth: "44ch",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Check whether your deal qualifies — or talk to a DSCR specialist directly. Most questions answered the same business day.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
            <button
              onClick={() => (window as any).openQualify?.()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                padding: "15px 32px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              See if your deal qualifies →
            </button>
            <a
              href="/book-demo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                padding: "15px 32px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                border: `1px solid rgba(238,239,211,0.3)`,
              }}
            >
              Book a scenario review
            </a>
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
