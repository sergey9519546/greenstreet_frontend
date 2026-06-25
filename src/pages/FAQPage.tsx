import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

const AS_OF = "Jun 22, 2026";

// Source attribution per answer — added 2026-06-22 refresh.
// Each `src` is the primary source a curious reader (or AI search engine) can verify.
const FAQS = [
  {
    q: "What is a DSCR loan?",
    a: "A DSCR (Debt Service Coverage Ratio) loan qualifies based on rental income, not your personal income or tax returns. The lender divides the property's gross monthly rent by its total monthly payment (PITIA: principal, interest, taxes, insurance, and HOA). A DSCR ≥ 1.0 means rent covers the payment. No W-2s, no pay stubs, no employment history required.",
    src: "12 CFR 1026.43 · TILA / Reg Z QM rules",
  },
  {
    q: "What DSCR do I need to qualify?",
    a: "Most lenders require DSCR ≥ 1.00. Some accept as low as 0.75 with compensating factors (strong FICO, more reserves). The sweet spot is 1.20+ where you get the best rates and only 3 months reserves. Sub-1.0 deals exist but your lender options narrow significantly.",
    src: "Greenstreet lender matrix · Apr 2026 sweep",
  },
  {
    q: "What credit score do I need?",
    a: "Greenstreet wants 660+ for the Core program; Flex goes to 640 with compensating factors. Higher FICO = lower rate — going from 660 to 740+ can save 0.75–1.50% and move you toward our Premier tier. ITIN borrowers and foreign nationals (no SSN) qualify on the Global program.",
    src: "Greenstreet program matrix · Q2 2026 sweep · 7 programs verified",
  },
  {
    q: "Do I need a signed lease to qualify?",
    a: "No. 63% of 2025 DSCR loans closed without a signed lease. Lenders use Form 1007 market rent from the appraisal to qualify the deal. If you have a lease that's within 20% of the 1007 rent, the lender uses the lower of the two. Vacant properties are fine.",
    src: "Verus/S&P 2025 DSCR securitization data",
  },
  {
    q: "How much down payment do I need?",
    a: "The standard minimum is 20% down (80% LTV). Greenstreet prices its best rates at 75% LTV (25% down). Strong files (740+ FICO, DSCR ≥ 1.0, SFR purchase) can push higher LTV. Lower down payment = higher rate via LTV pricing adjustments.",
    src: "Greenstreet lender matrix · Apr 2026",
  },
  {
    q: "Can I use a DSCR loan for a short-term rental (Airbnb)?",
    a: "Yes, but it's more complex. Lenders use the lower of: (1) 1007 long-term rental appraisal, (2) AirDNA projected income × 70–80%, or (3) documented 12-month STR history. Greenstreet's STR program accepts AirDNA projections or a documented 12-month history, with legality pre-checked in all 50 states. NYC's Local Law 18 (September 2023) bans most STR use in primary residences — check local regulations first.",
    src: "50-state STR matrix · Q2 2026 · Minut 2026 + state statutes",
  },
  {
    q: "What properties qualify for DSCR loans?",
    a: "Eligible: SFR (attached and detached), 2–4 unit residential, warrantable and non-warrantable condos, condotels (with conditions), manufactured/modular, ADUs. Ineligible: assisted living/group homes, agricultural (>20 acres), co-ops, fractional/timeshares, mixed-use commercial, <500 sqft. Properties must be C4 condition or better.",
    src: "Fannie Mae Property Eligibility Guide · Greenstreet underwriter notes",
  },
  {
    q: "What is a prepayment penalty (PPP) and do I need one?",
    a: "A PPP is a fee for paying off the loan early (via sale or refinance), typically structured as a declining schedule — 5/4/3/2/1% over 5 years or 3/2/1% over 3 years. Lenders often give a better rate if you accept a PPP (usually 0.50–0.80% lower). Without a PPP, expect to pay more in rate. Some states restrict or ban PPPs — check our State Laws page.",
    src: "Greenstreet statePppLaws.ts · 50-state matrix",
  },
  {
    q: "How fast can I close a DSCR loan?",
    a: "Faster than conventional. Greenstreet targets 14–21 days on clean files and 21–30 on complex ones. The process is streamlined because there's no income verification — just the appraisal (1007 rent schedule), property docs, and credit.",
    src: "Lender-published turn times · Apr 2026 sweep",
  },
  {
    q: "What reserves do I need?",
    a: "Reserves = liquid assets you must hold after closing (in months of PITIA). At DSCR ≥ 1.25: 3 months. At 1.00–1.24: 3–6 months. At 0.75–0.99: 9–12 months. Overlays add months for: STR, condos, FICO <680, first-time investor, loans >$1M, foreign nationals. Retirement accounts count at 70% if you're 59½+. Crypto counts as zero.",
    src: "Greenstreet reserveEngine.ts · 5-overlay model",
  },
  {
    q: "Can I hold the property in an LLC?",
    a: "Yes — and most lenders prefer it for business-purpose compliance. LLC vesting is the standard. You'll sign a personal guaranty (full recourse). Max 4 owners in the entity; the guarantor must own ≥51%. Layered LLCs (LLC inside LLC) max 2 layers. Exception: New Jersey LLC is HIGH-RISK — some lenders won't do NJ LLC deals due to PPP ambiguity.",
    src: "NJ N.J.S.A. 46:10B-2 · Greenstreet NJ LLC caveat",
  },
  {
    q: "What rate can I expect?",
    a: `As of ${AS_OF}: 30-yr PMMS 6.47% (Freddie Mac). DSCR best-rate tier (740+ FICO, ≤75% LTV, DSCR ≥1.0) runs 6.50–7.00%, ~50–125bps above conforming. Typical files 6.85–7.50%. Weaker files (low DSCR, STR, low FICO) 7.50–9.50%. ARM options start from ~5.50% but check reset cap structures carefully.`,
    src: "Freddie Mac PMMS · wk of Jun 18, 2026 · Greenstreet rate-tier model",
  },
  // ── NEW Q's added in 2026-06-22 refresh — GEO-optimized, primary-sourced ──
  {
    q: "Is a DSCR loan QM (Qualified Mortgage) or non-QM?",
    a: "DSCR loans are non-QM — they fall outside the safe-harbor QM rules under 12 CFR 1026.43(e)(2). That's exactly why they can use projected rent (no signed lease required) and skip borrower income verification. The trade-off: non-QM status means the lender bears more repurchase risk, which is why rates run 50–125bps above conforming.",
    src: "12 CFR 1026.43 · TILA / Reg Z",
  },
  {
    q: "What changed in 2026 for DSCR loans?",
    a: "Three regulatory shifts: (1) §1071 small-business data collection threshold raised from 100 to 1,000 originations/year, effective May 1, 2026. (2) HOEPA thresholds refreshed for 2026 ($27,592 loan amount / $1,380 P&F floor for higher-priced mortgage test). (3) MN HF 3437 effective Aug 1, 2026 makes business-purpose DSCR loans legal in Minnesota with full PPPs. None of these change the math — they change the paperwork.",
    src: "FR 2026-08494 · 91 FR 23530 · HOEPA 12 CFR 1026.32(a) · MN HF 3437 (2026)",
  },
  {
    q: "How does OBBBA affect DSCR deal returns?",
    a: "OBBBA makes 100% bonus depreciation permanent (DSCR-relevant because investors can shelter Year-1 taxable income) and raises §179 to $2.5M (relevant for cost-segregation studies on $5M+ deals). The QBI 23% deduction is also permanent. For a $400K deal, expect $12K–$20K of Year-1 depreciation shield depending on land/building split — Greenstreet's Tax Engine models this with OBBBA defaults.",
    src: "OBBBA 2025 · IRC §168(k) · IRC §179 · Greenstreet taxEngine.ts",
  },
  {
    q: "What is the deal-break rate?",
    a: "The deal-break rate is the interest rate at which the DSCR falls to exactly 1.00x — the lender's hard floor. Below 1.00x the deal won't qualify. The headroom between the offered rate and the deal-break rate (in basis points) is the rate shock the borrower can absorb before the loan fails. Greenstreet's Deal Analyzer surfaces both numbers on every solve.",
    src: "Greenstreet engine · engine.ts · dealBreakRate + rateHeadroomBps",
  },
];

export default function FAQPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    document.title = "DSCR Loan FAQ | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent="#004041"
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Accordion transition CSS only — no glassmorphism, no blur, no float */}
      <style>{`
        .faq-answer{overflow:hidden;transition:max-height .28s ease,opacity .22s ease;}
        .faq-answer-open{max-height:600px;opacity:1;}
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
          <h1
            style={{
              fontSize: "clamp(48px,7.5vw,116px)",
              fontWeight: 600,
              lineHeight: 0.93,
              letterSpacing: "-0.04em",
              margin: "0 0 24px",
              maxWidth: "16ch",
            }}
          >
            Questions, answered straight.
          </h1>
          <p
            style={{
              fontSize: "clamp(17px,1.5vw,22px)",
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: "-0.02em",
              color: "rgba(238,239,211,0.7)",
              maxWidth: "50ch",
              margin: 0,
            }}
          >
            Every question that matters about qualifying, structuring, and closing a DSCR investment property loan — answered precisely, with sources. Last reviewed {AS_OF}.
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
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: dc.white,
                borderRadius: 9,
                overflow: "hidden",
                border: `1px solid ${open === i ? dc.rain : "rgba(0,55,56,0.10)"}`,
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
                  background: open === i ? dc.mintBg : dc.white,
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
                        fontSize: 11,
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
          ))}
        </div>

        {/* Freshness signal — added 2026-06-22 */}
        <div
          style={{
            maxWidth: 880,
            margin: "32px auto 0",
            padding: "16px 20px",
            background: "rgba(216,217,88,0.12)",
            borderRadius: 10,
            border: "1px solid rgba(216,217,88,0.3)",
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
            Talk to a DSCR specialist directly. Most questions get answered the same business day — no pitch, no runaround.
          </p>
          <a
            href="tel:+15550100000"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              background: dc.lemon,
              color: dc.dark,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: "none",
              padding: "15px 32px",
              borderRadius: 6,
              fontFamily: dc.sans,
              letterSpacing: "-0.01em",
            }}
          >
            Call +1 (555) 010-0000
          </a>
        </div>
      </section>
    </DcShell>
  );
}
