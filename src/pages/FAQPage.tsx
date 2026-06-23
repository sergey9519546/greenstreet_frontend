// @ts-nocheck
import React, { useState } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const FADED = "rgba(0,55,56,0.15)";
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
    a: "Most DSCR lenders want 660+. A few (Griffin Funding, Defy) go to 640 or even 620. Higher FICO = lower rate: going from 660 to 740+ can save 0.75–1.50% on your rate. ITIN borrowers are accepted by most lenders; foreign nationals (no SSN) face more restrictions.",
    src: "Greenstreet lender matrix · Apr 2026 sweep · 11 lenders verified",
  },
  {
    q: "Do I need a signed lease to qualify?",
    a: "No. 63% of 2025 DSCR loans closed without a signed lease. Lenders use Form 1007 market rent from the appraisal to qualify the deal. If you have a lease that's within 20% of the 1007 rent, the lender uses the lower of the two. Vacant properties are fine.",
    src: "Verus/S&P 2025 DSCR securitization data",
  },
  {
    q: "How much down payment do I need?",
    a: "The standard minimum is 20% down (80% LTV). Most lenders price their best rates at 75% LTV (25% down). Some lenders (Defy) go to 85% LTV for strong files (740+ FICO, DSCR ≥ 1.0, SFR purchase only). Lower down payment = higher rate via LTV pricing adjustments.",
    src: "Greenstreet lender matrix · Apr 2026",
  },
  {
    q: "Can I use a DSCR loan for a short-term rental (Airbnb)?",
    a: "Yes, but it's more complex. Lenders use the lower of: (1) 1007 long-term rental appraisal, (2) AirDNA projected income × 70–80%, or (3) documented 12-month STR history. Easy Street Capital and Visio Lending are the most STR-friendly. NYC's Local Law 18 (September 2023) bans most STR use in primary residences — check local regulations first.",
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
    a: "Faster than conventional. Most lenders target 21–30 days. Kiavi and New Silver advertise 14–21 days. Rocket Pro TPO typically takes 21–30 days. The process is streamlined because there's no income verification — just the appraisal (1007 rent schedule), property docs, and credit.",
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

  return (
    <PageShell
      title="DSCR Loan FAQ"
      subtitle={`The most important questions about qualifying, structuring, and closing DSCR investment property loans. Last reviewed ${AS_OF}.`}
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ maxWidth: "800px" }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: "100%", textAlign: "left", background: "#e8e9bf",
                border: `1px solid ${open === i ? MINT : FADED}`,
                borderRadius: open === i ? "12px 12px 0 0" : "12px",
                color: open === i ? MINT : CREAM,
                padding: "18px 24px", cursor: "pointer", fontSize: "16px", fontWeight: 600,
                fontFamily: "Outfit, sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.15s",
              }}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: "20px", color: MINT, flexShrink: 0, marginLeft: "16px" }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{
                background: "rgba(0,101,101,0.07)", border: `1px solid ${MINT}`, borderTop: "none",
                borderRadius: "0 0 12px 12px", padding: "20px 24px",
                color: "#3f5252", fontSize: "15px", lineHeight: 1.7,
              }}>
                {faq.a}
                {/* Source attribution — added in 2026-06-22 refresh for GEO + E-E-A-T */}
                <div style={{
                  marginTop: "16px", paddingTop: "12px",
                  borderTop: `1px dashed ${FADED}`,
                  fontSize: "11px", color: MINT, fontFamily: "JetBrains Mono, monospace",
                }}>
                  src · {faq.src}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Freshness signal — added 2026-06-22 */}
      <div style={{
        marginTop: "32px", padding: "16px 20px",
        background: "rgba(216,217,88,0.12)", borderRadius: "10px",
        border: `1px solid rgba(216,217,88,0.3)`,
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        maxWidth: "800px",
      }}>
        <span style={{
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "4px 10px", borderRadius: "999px",
          background: "#d8d958", color: "#003738",
        }}>
          Reviewed
        </span>
        <span style={{ fontSize: "13px", color: CREAM, fontWeight: 600 }}>
          All answers reviewed {AS_OF} · sources inline · next review Jul 22, 2026
        </span>
      </div>

      <div style={{ marginTop: "32px", ...card, maxWidth: "600px" }}>
        <div style={sectionTitle}>Still have questions?</div>
        <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
          Call a DSCR specialist. Most questions get answered the same business day.
        </p>
        <a href="tel:+13324551462" style={{
          display: "inline-block", padding: "14px 28px", background: MINT,
          color: "#002D2E", borderRadius: "10px", fontWeight: 700, fontSize: "15px",
          textDecoration: "none",
        }}>
          Call +1 (332) 455-1462
        </a>
      </div>
    </PageShell>
  );
}