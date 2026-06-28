import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import ComplianceNote from "../design/ComplianceNote";

const AS_OF = "Jun 25, 2026";
const PRODUCT_VERIFY = "[VERIFY: current Greenstreet product sheet]";
const LEGAL_REVIEW = "[LEGAL REVIEW]";

// Source attribution per answer — refreshed 2026-06-25.
// Each `src` is the primary source a curious reader (or AI search engine) can verify.
// Groups: Basics, Qualification, Income & Property, Refinance, Compliance & Regulatory
const FAQS: { q: string; a: string; src: string; group?: string; cta?: { label: string; action: "calculator" | "qualify" | "state-laws" | "lender-intel" } }[] = [
  // ── GROUP: The basics ─────────────────────────────────────────────────────────
  {
    group: "The basics",
    q: "Do I need to show my income or tax returns to qualify?",
    a: `DSCR loans focus on the property's rent coverage instead of the borrower's W-2 income, but documentation requirements still vary by program, entity, state, credit, property type, and underwriting overlay. Publish exact income-documentation rules only from the current product sheet. ${PRODUCT_VERIFY}`,
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
    a: `Pricing changes with market conditions and file attributes. Credit band, leverage, DSCR, property type, state, prepayment-penalty option, reserves, loan size, and lender overlays can all move pricing. Do not rely on an online estimate as a quote. Current rates, fees, points, APR/payment assumptions, and program availability must be verified against Greenstreet's active rate sheet as of ${AS_OF}. ${PRODUCT_VERIFY}`,
    src: "Current Greenstreet rate sheet required before publication · Freddie Mac PMMS may be used only as market context",
  },
  {
    group: "The basics",
    q: "How quickly can I close?",
    a: `Closing speed depends on the appraisal, title, insurance, entity documents, borrower documentation, state requirements, and underwriting conditions. Greenstreet should publish only verified turn-time targets from the current operations/product sheet. Until then, treat any timeline as an estimate, not a promise. ${PRODUCT_VERIFY}`,
    src: "Greenstreet operations/product sheet required",
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
    a: `Minimum credit bands and alternative-credit paths vary by program, property type, leverage, DSCR, borrower profile, and lender overlay. Do not publish a FICO floor, tier name, or rate savings claim until it is tied to the active product sheet. Non-US investor and ITIN paths require separate documentation, KYC/AML, OFAC, eligible-country, and lender-overlay review. ${PRODUCT_VERIFY} ${LEGAL_REVIEW}`,
    src: "Current Greenstreet product sheet required",
  },
  {
    group: "Qualification",
    q: "How much do I need to put down?",
    a: `Down payment and maximum LTV are program-specific. Property type, occupancy/rental model, borrower profile, country/ITIN status, state, DSCR, loan size, and reserves can all change the required equity. Publish exact down-payment or LTV statements only from the active product sheet. ${PRODUCT_VERIFY}`,
    src: "Current Greenstreet product sheet required",
  },
  {
    group: "Qualification",
    q: "How much cash do I need to keep in the bank after closing?",
    a: `Reserve requirements are months of mortgage payments kept in the bank after closing. The exact requirement depends on DSCR, leverage, credit band, experience, property type, loan size, state, borrower residency/country status, and lender overlays. Retirement, business, foreign, and crypto assets may be treated differently by program. Publish exact reserve months only from the current product sheet. ${PRODUCT_VERIFY}`,
    src: "Current Greenstreet reserve/product sheet required",
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
    a: `Sometimes. DSCR qualification is property-cash-flow based, which can make it a viable path for some ITIN and foreign-national investors, but it is not universal. Eligibility depends on eligible country, sanctions/OFAC screening, KYC/AML and funds-source review, documentation, state scope, entity structure, reserves, property type, and lender overlays. FIRPTA and cross-border tax issues should be reviewed with a qualified CPA or attorney. ${PRODUCT_VERIFY} ${LEGAL_REVIEW}`,
    src: "Current Greenstreet foreign-national product sheet required · FIRPTA IRC §897 legal/CPA review required",
    cta: { label: "Request file review →", action: "qualify" },
  },
  {
    group: "Qualification",
    q: "What happens after I prequalify — what are the steps to close?",
    a: `The path is generally: preliminary scenario review, product-fit check, term-sheet or scenario discussion if available, application, appraisal, document collection, underwriting, conditions, closing disclosure, closing, and funding. Timing depends on appraisal, title, insurance, entity documents, reserves, state rules, and underwriting conditions. Publish exact cycle-time claims only from current operations data. ${PRODUCT_VERIFY}`,
    src: "Greenstreet close-process SOP · TRID 3-day CD rule (12 CFR 1026.19)",
  },
  {
    group: "Qualification",
    q: "How can I improve my DSCR before applying?",
    a: `Four general levers can improve DSCR: lower the loan amount, lower the rate/payment structure if an eligible program allows it, document stronger qualifying rent, or reduce expenses that are included in the payment. Exact payment changes, point costs, IO eligibility, FICO bands, LTV tiers, and DSCR outcomes must be modeled from verified program assumptions, not generic examples. ${PRODUCT_VERIFY}`,
    src: "Current Greenstreet product sheet and engine assumptions required",
    cta: { label: "Model the impact on your deal →", action: "calculator" },
  },
  {
    group: "Qualification",
    q: "What is the deal-break rate?",
    a: `The deal-break rate is a modeling input: the rate at which the scenario DSCR reaches a selected coverage target. It helps show sensitivity, but it is not a lender floor, approval threshold, or rate quote unless verified against the current product sheet. ${PRODUCT_VERIFY}`,
    src: "Greenstreet engine.ts · dealBreakRate + rateHeadroomBps",
  },
  // ── GROUP: Rental income & property ──────────────────────────────────────────
  {
    group: "Rental income & property",
    q: "Does the property need to have a tenant already?",
    a: `Sometimes. Some DSCR programs may use appraiser market rent when there is no signed lease, but the controlling rent figure, documentation, vacancy treatment, and property-type limits are product-specific. Verify before relying on vacant-property or new-acquisition assumptions. ${PRODUCT_VERIFY}`,
    src: "Verus/S&P 2025 DSCR securitization data · Fannie Mae 1007",
  },
  {
    group: "Rental income & property",
    q: "Can I use a DSCR loan for an Airbnb or short-term rental?",
    a: `Some DSCR programs consider short-term rental income, but qualifying income is program-specific and more conservative than host dashboards. Lenders may require long-term market rent, lender-approved STR market data, documented platform history, local STR legality review, and additional reserves. Exact haircuts, data sources, and eligibility rules require current STR product-sheet verification. ${PRODUCT_VERIFY} ${LEGAL_REVIEW}`,
    src: "Current STR product sheet and state/local STR legality review required",
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
    a: `Qualifying STR income depends on the specific lender program. Common inputs can include appraiser market rent, lender-approved STR market data, and documented platform history, but the controlling figure, haircut, reserve overlay, and documentation rules must come from the active STR product sheet. Do not rely on Airbnb screenshots or generic revenue estimates as qualifying income. ${PRODUCT_VERIFY}`,
    src: "Current STR product sheet and approved STR data-source methodology required",
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
    a: `Sometimes. Rate-term and cash-out refinances are product-specific and depend on property type, state, seasoning, DSCR, credit, leverage, occupancy, title, reserves, and current guidelines. The property must be reviewed at the new loan amount and payment. ${PRODUCT_VERIFY}`,
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
    a: `Cash-out and rate-term refinance leverage caps vary by program, property type, loan size, DSCR, credit band, state, seasoning, and lender overlay. The property must re-qualify at the new loan amount and payment. Publish exact cash-out or rate-term LTV caps only from the active refinance product sheet. ${PRODUCT_VERIFY}`,
    src: "Current Greenstreet refinance product sheet required",
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
    a: `Regulatory content changes quickly and should be treated as a legal-review item before publication. Any Section 1071, HOEPA, state prepayment-penalty, or Minnesota DSCR statement needs a current citation, effective date, and licensing/compliance review. These items may affect paperwork, state availability, pricing structure, or disclosures depending on the file. ${LEGAL_REVIEW}`,
    src: "Current legal/compliance citation pack required",
  },
  {
    group: "Compliance & regulatory",
    q: "How does OBBBA affect DSCR deal returns?",
    a: `Tax-law content should not be presented as personalized tax advice. Any OBBBA, depreciation, Section 179, QBI, or cost-segregation claim needs current legal/tax citation review. Actual tax outcome depends on ownership structure, use, basis allocation, income, passive-activity rules, and the investor's broader tax situation. Consult a qualified CPA or tax attorney. ${LEGAL_REVIEW}`,
    src: "Current tax/legal citation pack required",
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
              color: "rgba(238,239,211,0.62)",
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
            A DSCR loan is primarily reviewed around the property's rent coverage, but product terms, documentation, state rules, credit, reserves, and underwriting overlays still matter. Items below are educational until verified.
          </Lead>
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: 0, letterSpacing: "-0.01em" }}>
            Verification status shown inline · product terms require the current Greenstreet product sheet.
          </p>
          <div style={{ marginTop: 22, maxWidth: 620 }}>
            <ComplianceNote tone="verify">
              Rate, LTV, down-payment, reserves, STR, foreign-national, tax, and legal answers are not quotes, approvals, or legal/tax advice. Items marked `[VERIFY]` or `[LEGAL REVIEW]` must be checked before publication or borrower reliance.
            </ComplianceNote>
          </div>
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
              Check whether your property appears to fit a DSCR program and request a specialist review. No commitment required.
            </p>
          </div>
          <Btn label="Request scenario review" onClick={() => (window as any).openQualify?.()} style={{ flexShrink: 0 }} />
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(238,239,211,0.06)",
              border: "1px solid rgba(238,239,211,0.18)",
              color: "rgba(238,239,211,0.62)",
            }}
          >
            Verification status
          </span>
          <span style={{ fontSize: 13, color: dc.dark, fontWeight: 600 }}>
            Educational answers refreshed {AS_OF}; current product terms and legal/tax claims still require source verification before borrower reliance.
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
            Check whether your deal appears to fit a DSCR path, or talk to a specialist directly. Product terms require verification before borrower reliance.
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
              Request scenario review →
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
