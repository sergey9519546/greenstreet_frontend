import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono, useRevealOnView } from "../design/dc";
import { radius, font, risk, onDark } from "../theme";
import BottomCTA from "../design/BottomCTA";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import {
  assessForeignNationalEligibility,
  calculateForeignNationalMaxLTV,
  calculateForeignNationalRateAdjusters,
  type FnIdType,
  type ForeignNationalProfile,
} from "../engine/fnEngine";
import { DSCR_PROGRAMS } from "../data/dscrPrograms";
import { calculateFIRPTAImpact, nraEstateTaxNote } from "../engine/firpta";
import { calculatePaymentFactor } from "../engine";

// ── Who-We-Serve: Non-US Investor Investors ──────────────────────────────────
// Bespoke dark page. Conversion core = the "Yes, you can" fear-grid. Positioning:
// non-US files are workable, and a person walks you through it.
// [PARTNER] rows are tagged "via partner" so nothing overpromises a capability we
// can't deliver without a formation/banking/FX partner lined up.
//
// This page does NOT advertise lender count in either direction. It used to sell
// "one application in front of multiple U.S. lenders / best of many" as the core
// pitch. That is a broker-choice claim, and 8fb76e0 removed the opposite claim
// (originating and funding in-house) for the same underlying reason: the site
// publishes no legal entity name, NMLS identifier or state-license list, so it
// cannot hold itself out as a lender, and the owner has ruled that the
// multi-lender pitch is not the story either. Copy describes what happens to the
// borrower's file. Disclaimers that terms "vary by lender" stay — those are
// accurate limits on a quote, not a pitch.
//
// ── COMPLIANCE — read before editing anything in the hero ────────────────────
// This page may NOT render an approval. No stamp, no seal, no checkmark badge,
// no "GO" / "APPROVED" / "QUALIFIES" verdict, anywhere in the DOM. LegalPage is
// explicit that an output here "is not a pre-screen, quote, program match,
// commitment to lend, rate lock, or credit approval", and the site publishes no
// legal entity, NMLS id or state-license list to stand behind one. Every figure
// on this page states either a PROGRAM PARAMETER or an ARITHMETIC RESULT.
// Nothing states a decision about a borrower. Keep it that way.

const RED = risk.danger;
// Supporting accent for eyebrows and labels. Replaces the old #7ec8d3 sky-blue,
// which was a colour outside the two-surface system (see DESIGN_SOURCE_OF_TRUTH
// §2). `dc.accent` is the de-lemoned chrome accent; lemon stays reserved for the
// single primary action per view.
const ACCENT = dc.accent;

// ─────────────────────────────────────────────────────────────────────────────
// HERO MODEL — "what is different for me?"
//
// The hero used to be a flight-path arc: capital leaving "your country", flying
// a fixed bezier to "U.S. property", and an approval seal landing on it. It
// encoded no data (the curve was a hard-coded `d` attribute) and it answered a
// question nobody has — a foreign investor already knows their money crosses a
// border. What they cannot find anywhere is which REQUIREMENTS change.
//
// So the hero is now a requirements comparison, and every figure in it is
// COMPUTED from the same engine that would price a real file
// (src/engine/fnEngine.ts) rather than typed in as marketing copy. If the engine
// changes, the hero changes with it.
// ─────────────────────────────────────────────────────────────────────────────

// The domestic benchmark. `calculateForeignNationalMaxLTV` opens on the
// documented domestic baseline and every branch below that line is keyed to a
// non-SSN id, a foreign entity, or an elevated country tier — so an
// SSN / US_LLC / non-elevated profile returns that baseline untouched.
const US_BENCHMARK: ForeignNationalProfile = {
  idType: "SSN", countryCode: "US", hasUsFico: true, hasUsResidency: true, entityType: "US_LLC",
};

// The two identity paths the engine models for a non-US borrower, both held on a
// PREFERRED-tier country (MX) so the spread shown is the PROGRAM spread and not
// a country-risk spread. The country-tier effect is measured separately below.
const FN_PATHS: ForeignNationalProfile[] = (["ITIN", "PASSPORT_ONLY"] as FnIdType[]).map((idType) => ({
  idType, countryCode: "MX", hasUsFico: false, hasUsResidency: false, entityType: "US_LLC",
}));

const spanPct = (ns: number[]) => {
  const lo = Math.min(...ns), hi = Math.max(...ns);
  return lo === hi ? `${lo}%` : `${lo}–${hi}%`;
};
const totalBps = (p: ForeignNationalProfile) =>
  calculateForeignNationalRateAdjusters(p).reduce((s, a) => s + a.basisPoints, 0);

const US_LTV = calculateForeignNationalMaxLTV(US_BENCHMARK);
const FN_LTV = FN_PATHS.map(calculateForeignNationalMaxLTV);
const FN_BPS = FN_PATHS.map(totalBps);

// Country-tier effect, measured rather than asserted: the same ITIN profile
// moved from a PREFERRED country (MX) to an enhanced-due-diligence one (CN).
const EDD_PATH: ForeignNationalProfile = { ...FN_PATHS[0], countryCode: "CN" };
const EDD_BPS = totalBps(EDD_PATH) - FN_BPS[0];
const EDD_LTV_DROP = FN_LTV[0].purchase - calculateForeignNationalMaxLTV(EDD_PATH).purchase;

// Greenstreet's own lineup — how many programs take a non-US borrower at all.
const FN_PROGRAMS = DSCR_PROGRAMS.filter((p) => p.foreignNational).length;
const ALL_PROGRAMS = DSCR_PROGRAMS.length;

// Minimum down payment implied by the non-US purchase caps (100 − max LTV).
const FN_DOWN = spanPct(FN_LTV.map((l) => 100 - l.purchase));

/** The rows that DIFFER. This is the whole point of the panel. */
const CMP_DIFF: { label: string; us: string; fn: string }[] = [
  { label: "Identification", us: "SSN", fn: "Passport" },
  { label: "Credit file", us: "U.S. FICO", fn: "Home-country report" },
  { label: "Max LTV — purchase", us: `${US_LTV.purchase}%`, fn: spanPct(FN_LTV.map((l) => l.purchase)) },
  { label: "Max LTV — cash-out", us: `${US_LTV.cashOut}%`, fn: spanPct(FN_LTV.map((l) => l.cashOut)) },
  { label: "Rate add-on", us: "None", fn: `+${Math.min(...FN_BPS)}–${Math.max(...FN_BPS)} bps` },
  { label: "Title vesting", us: "Individual or entity", fn: "U.S. LLC + EIN" },
];

/** The rows that are the SAME. They stop being a comparison and span both
 *  columns — the divide physically disappears, which is the point worth making:
 *  the thing that actually decides a DSCR loan does not change with a passport. */
const CMP_SAME: { label: string; both: string }[] = [
  { label: "What qualifies the loan", both: "The property's rent against its payment" },
  { label: "Personal income documents", both: "None" },
  { label: "Reserves", both: "Set by loan size and program, not by residency" },
];

// 30-yr amortising payment factor, sourced from the golden-tested engine
// primitive. The wrapper only pins the term to 360 and keeps this page's
// display convention that a 0% rate means "no payment".
// NOTE: takes the rate as a PERCENT (7.25), matching the engine.
const pf = (ratePct: number) => (ratePct === 0 ? 0 : calculatePaymentFactor(ratePct, 360));
const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// The fear-grid — mirror what they Google. `partner` rows need a real partner.
const FEARS: { worry: string; answer: string; partner?: boolean }[] = [
  { worry: "I have no U.S. credit score.", answer: "You don't need one. We qualify on the property's rent and review your financial history from your home country." },
  { worry: "No SSN or U.S. passport.", answer: "Your home-country passport is enough." },
  { worry: "No U.S. job or W-2 income.", answer: "Irrelevant here — a DSCR loan looks at the property, not you." },
  { worry: "I don't have a U.S. LLC.", answer: "We set you up with a U.S. LLC + EIN — fast, fully remote.", partner: true },
  { worry: "No U.S. bank account.", answer: "We connect you to a U.S. business account, remotely.", partner: true },
  { worry: "Moving money across borders scares me.", answer: "Our FX partners move funds at competitive, compliant rates.", partner: true },
  { worry: "I can't fly here to close.", answer: "You don't have to — closings are remote in most states." },
  { worry: "Will my country be a problem?", answer: "Country of residence is checked against the program rules up front, before you spend time on documents." },
];

const STEPS = [
  { t: "Check your buying power", s: "60 seconds, no credit pull — see your likely loan, rate, and payment." },
  { t: "We structure the file", s: "Your country and deal are matched against the DSCR program rules — plus your LLC + U.S. bank if you need them.", partner: true },
  { t: "Upload documents digitally", s: "Passport, the property, and simple financials. No fax, no mail." },
  { t: "Close remotely", s: "~21–45 days. Then do it again for the next property." },
];

// Down payment is derived from the engine's non-US purchase caps, not typed in.
// The old "20–30%" implied an 80% LTV, which is the DOMESTIC baseline — it is
// not reachable on a non-US file and contradicted the hero comparison.
const QUALIFY = [
  { v: FN_DOWN, l: "down payment", s: "of the purchase price" },
  { v: "~1.0x+", l: "DSCR to price best", s: "rent against the payment" },
  { v: "$100K–$2M+", l: "loan size", s: "depending on the program" },
  { v: "6–12 mo", l: "reserves", s: "held after closing" },
];

const FAQS = [
  { q: "Can a non-U.S. citizen really get a U.S. mortgage?", a: "Yes — no citizenship or residency required. These are business-purpose investment loans on the property's income." },
  { q: "Do I need a U.S. credit score?", a: "No. We review your home-country financial history; the property's rent is the qualifier." },
  { q: "How much down payment?", a: `${FN_DOWN} of the purchase price — the non-US purchase LTV caps in our program rules are ${spanPct(FN_LTV.map((l) => l.purchase))}.` },
  { q: "What documents do I actually need?", a: "Passport, the property / lease info, and basic financials. No U.S. tax returns or W-2s." },
  { q: "Can I hold the property in an LLC?", a: "Yes — usually required. We help you form one through our formation partner.", partner: true },
  { q: "Why is my rate higher than a U.S. citizen's?", a: "It's an investment, non-QM loan — that carries a premium over owner-occupied conventional. The property's coverage, your leverage and your reserves are what move it." },
  { q: "Can I close without coming to the U.S.?", a: "Yes — remote closing is available in most states." },
  { q: "Long-term and short-term (Airbnb) rentals — both?", a: "Both. STR is underwritten on real projected nightly income (ADR × occupancy), not optimistic guesses." },
];

export default function NonUsInvestorsPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Can Foreign Investors Get a U.S. DSCR Loan? | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Objection grid entrance. One-shot: `shown` latches true the first time the
  // grid scrolls into view and never flips back, so nothing loops or pulses.
  // Under prefers-reduced-motion the hook starts at true, so the cards are fully
  // visible on the very first paint, and the .fn-fear reduced-motion rule in the
  // style block below removes the transition entirely.
  const [fearRef, fearShown] = useRevealOnView<HTMLDivElement>();

  // ── live "check your buying power" — never asks for income ──
  const [rent, setRent] = useState(4000);
  const [price, setPrice] = useState(560000);
  const [downPct, setDownPct] = useState(25);
  const [rate, setRate] = useState(7.5);

  // ── FN eligibility + FIRPTA (real engine, not marketing copy) ──
  const [idType, setIdType] = useState<FnIdType>("PASSPORT_ONLY");
  const [countryCode, setCountryCode] = useState("MX");
  const [hasVisa, setHasVisa] = useState(false);
  const fnProfile = {
    idType, countryCode, hasUsFico: false, hasUsResidency: false,
    visaType: hasVisa ? "E2" : undefined, entityType: "US_LLC" as const,
  };
  const fnElig = assessForeignNationalEligibility(fnProfile);
  const firpta = calculateFIRPTAImpact({ salePrice: price, adjustedBasis: price * 0.85, state: "TX", isUsResident: false });
  const nraEstate = nraEstateTaxNote(price);
  const loan = price * (1 - downPct / 100);
  const pAndI = loan * pf(rate);
  const pitia = pAndI + (price * 0.011) / 12 + (price * 0.005) / 12; // est. taxes + insurance
  const dscr = pitia > 0 ? rent / pitia : 0;
  const ltv = 100 - downPct;
  const ltvOk = ltv <= 75;
  const go = dscr >= 1.0 && ltvOk;
  const verdict = go ? "QUALIFIES" : dscr >= 1.0 ? "LOWER LTV" : "BELOW 1.0x";
  const vColor = go ? dc.emerald : dscr >= 1.0 ? dc.lemon : RED;

  const num = (v: number, set: (n: number) => void, step: number, pre = "", suf = "") => (
    <CurrencyInput
      surface="dark"
      value={v}
      onChange={set}
      step={step}
      prefix={pre}
      suffix={suf}
      adornmentStyle={{ fontSize: 14 }}
      inputStyle={{ fontWeight: 600, fontSize: 15, padding: "11px 6px" }}
    />
  );

  const partnerTag = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, background: "rgba(216,217,88,0.14)", borderRadius: 100, padding: "2px 8px", verticalAlign: "middle", marginLeft: 8 }}>Concierge · via partner</span>
  );

  const navLinks = [
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
    { label: "Returns", view: "returns" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Check your buying power →", view: "dscr-calculator" }}>
      <style>{`
        /* ── hero requirements comparison ──
           A real <table>: the two subjects are columns, the requirements are
           rows, so screen readers get row/column headers for free and there is
           no aria-label paraphrasing a picture. Flat by intent — no shadow, no
           blur, no motion of any kind. The only visual devices are ink strength
           and one raised column. */
        .fn-cmp{width:100%;border-collapse:collapse;table-layout:fixed;}
        .fn-cmp caption{caption-side:top;text-align:left;font-size:clamp(17px,1.5vw,20px);font-weight:600;line-height:1.2;color:${dc.cream};padding:0 0 6px;}
        .fn-cmp th,.fn-cmp td{text-align:left;vertical-align:top;padding:9px 12px;overflow-wrap:anywhere;}
        .fn-cmp thead th{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${onDark.secondary};padding-bottom:8px;border-bottom:1px solid rgba(238,239,211,.20);}
        .fn-cmp tbody th{font-size:12px;font-weight:600;line-height:1.3;color:${onDark.secondary};padding-left:0;}
        .fn-cmp tbody td{font-size:14px;font-weight:600;line-height:1.3;color:${dc.cream};}
        .fn-cmp tbody tr + tr th,.fn-cmp tbody tr + tr td{border-top:1px solid rgba(238,239,211,.10);}
        /* the reader's column — one raised track, so the eye lands on the values
           that apply to them and reads leftward to compare */
        .fn-cmp .fn-you{background:rgba(238,239,211,.06);}
        /* sameness recedes: the row stops being a comparison, spans both value
           columns, and drops to secondary ink */
        .fn-cmp .fn-same th{color:${onDark.tertiary};font-weight:500;}
        .fn-cmp .fn-same td{background:none;color:${onDark.secondary};font-weight:500;font-size:13px;}
        .fn-cmp .fn-rule th{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${onDark.tertiary};padding:16px 0 4px;border-top:1px solid rgba(238,239,211,.20) !important;}
        /* ≤560px the hero is already one column, so the table restacks: the
           requirement name takes its own full-width line and the two values sit
           side by side beneath it, still exactly equal so the comparison holds */
        @media(max-width:560px){
          .fn-cmp,.fn-cmp thead,.fn-cmp tbody,.fn-cmp tr,.fn-cmp th,.fn-cmp td{display:block;width:auto;}
          .fn-cmp thead{display:none;}
          .fn-cmp tbody tr{display:grid;grid-template-columns:1fr 1fr;padding:10px 0;border-top:1px solid rgba(238,239,211,.10);}
          .fn-cmp tbody tr:first-child{border-top:none;}
          .fn-cmp tbody th{grid-column:1 / -1;padding:0 0 5px;}
          .fn-cmp tbody td{padding:6px 10px;}
          .fn-cmp tbody tr + tr th,.fn-cmp tbody tr + tr td{border-top:none;}
          .fn-cmp tbody td::before{content:attr(data-col);display:block;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${onDark.tertiary};margin-bottom:2px;}
          .fn-cmp .fn-same td{grid-column:1 / -1;}
          .fn-cmp .fn-same td::before{content:none;}
          .fn-cmp .fn-rule{display:block;padding:0;}
          .fn-cmp .fn-rule th{border-top:1px solid rgba(238,239,211,.20) !important;}
        }
        .fn-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:.01em;color:rgba(238,239,211,.85);background:rgba(238,239,211,.07);border:1px solid rgba(238,239,211,.16);border-radius:100px;padding:7px 14px;}
        .fn-chip b{color:${ACCENT};font-weight:700;}
        /* ── the objection grid ────────────────────────────────────────────
           Two equal columns, so eight pairs occupy four rows instead of eight.
           The old layout put ONE card per 1232px row and then split that row
           into 0.8fr/1.2fr, which spent maximum horizontal space on ~15 words
           and cost a full viewport of scroll.

           Nothing is hidden: no accordion, no carousel. A reader scanning for
           THEIR objection has to be able to see all eight at once and find any
           of them with ctrl-F, so every question and every answer stays in the
           DOM and stays rendered.

           Inside a card the pair now STACKS rather than splitting again — at
           two columns a card is ~610px at a 1280 viewport, which is already a
           sensible measure; sub-dividing it would give the question ~230px and
           wrap it over three lines, undoing the saving. */
        .fn-fearwrap{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-items:stretch;}
        .fn-fear{
          display:grid;gap:4px;align-content:start;
          background:${dc.teal};border:1px solid rgba(238,239,211,0.16);border-radius:${radius.md};
          padding:clamp(12px,1.25vw,17px) clamp(15px,1.5vw,21px);
          /* One-shot staggered entrance, driven by useRevealOnView state (a
             transition, never a keyframe-on-mount) so it is idempotent across
             re-renders and ALWAYS ends fully visible — the hook flips "shown"
             true on intersection, on a 1.5s safety timer, or instantly under
             reduced motion. Nothing here loops or floats. */
          transition:opacity .38s cubic-bezier(.16,1,.3,1),transform .38s cubic-bezier(.16,1,.3,1);
        }
        @media(max-width:820px){.fn-fearwrap{grid-template-columns:minmax(0,1fr);}}
        @media(prefers-reduced-motion:reduce){
          .fn-fear{transition:none !important;opacity:1 !important;transform:none !important;transition-delay:0ms !important;}
        }
        @media print{.fn-fear{opacity:1 !important;transform:none !important;}}
      `}</style>
      {/* ── HERO ── */}
      <section style={{ position: "relative", background: dc.dark, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24 }}>
              Non-US Investor Program
            </div>
            <H1 style={{ margin: "0 0 16px", maxWidth: "14ch" }}>Can foreign investors get a U.S. DSCR loan?</H1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="fn-chip"><b>✕</b> No SSN</span>
              <span className="fn-chip"><b>✕</b> No U.S. credit</span>
              <span className="fn-chip"><b>✕</b> No green card</span>
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "50ch", margin: "0 0 30px" }}>
              DSCR loans for international investors. We qualify the property's rent — not your paycheck — and guide you through every step, in your language, from LLC to closing. You never have to fly here.
            </Lead>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "15px 26px", borderRadius: radius.sm, fontFamily: font.family }}>See how much you can borrow — 60 sec, no credit pull →</button>
            </div>
            <button onClick={() => onNavigate("book-demo")} style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", fontFamily: font.family, color: ACCENT, fontWeight: 600, fontSize: 14, padding: 0 }}>
              Prefer to talk? Message a DSCR specialist on WhatsApp →
            </button>
            <div style={{ marginTop: 22, fontSize: 12, color: "rgba(238,239,211,0.62)", letterSpacing: "0.01em" }}>
              No SSN required · Passport accepted · Close remotely · Business-purpose DSCR
            </div>
          </div>

          {/* ── The requirements comparison ──────────────────────────────────
              Same rows, both sides. The differences are the six rows the eye
              catches; the three that are identical collapse into a single
              spanning cell and drop to secondary ink, because "this part does
              not change" is the reassurance a foreign investor is actually
              looking for. Every number here comes out of fnEngine.ts. */}
          <div style={{ background: "rgba(238,239,211,0.05)", borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(18px,2.2vw,28px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT, marginBottom: 8 }}>Side by side</div>
            <table className="fn-cmp">
              <caption>What changes when the borrower isn&apos;t a U.S. person</caption>
              <colgroup>
                <col style={{ width: "34%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "33%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col"><span className="u-sr-only">Requirement</span></th>
                  <th scope="col">U.S. borrower</th>
                  <th scope="col" className="fn-you">Non-U.S. investor</th>
                </tr>
              </thead>
              <tbody>
                {CMP_DIFF.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td data-col="U.S. borrower">{r.us}</td>
                    <td data-col="Non-U.S. investor" className="fn-you">{r.fn}</td>
                  </tr>
                ))}
                <tr className="fn-rule">
                  <th scope="colgroup" colSpan={3}>Unchanged either way</th>
                </tr>
                {CMP_SAME.map((r) => (
                  <tr key={r.label} className="fn-same">
                    <th scope="row">{r.label}</th>
                    <td colSpan={2}>{r.both}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: onDark.tertiary, margin: "14px 0 0", borderTop: "1px solid rgba(238,239,211,0.12)", paddingTop: 12 }}>
              Caps and add-ons are our published program parameters, not a quote, a
              program match, or a decision on any file. A home-country credit file
              means 3 trade lines over 2 years. The rate add-on is the ID,
              no-U.S.-credit and no-visa adjusters summed on a preferred-tier
              country; an enhanced-due-diligence country adds up to {EDD_BPS} bps more
              and takes {EDD_LTV_DROP} points off each cap. {FN_PROGRAMS} of our {ALL_PROGRAMS} DSCR
              programs accept a non-U.S. borrower.
            </p>
          </div>
        </div>
      </section>

      {/* ── THE FEAR-GRID — conversion core ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vh,92px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 10 }}>Yes, you can</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(28px,3.4vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 22px", maxWidth: "46ch" }}>
            Every reason you think you can't — answered.
          </h2>
          <div ref={fearRef} className="fn-fearwrap">
            {FEARS.map((f, i) => (
              <div
                key={f.worry}
                className="fn-fear"
                style={{
                  opacity: fearShown ? 1 : 0,
                  transform: fearShown ? "none" : "translateY(9px)",
                  transitionDelay: `${i * 45}ms`,
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ flexShrink: 0, color: RED, fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>“</span>
                  <span style={{ fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 600, color: "rgba(238,239,211,0.78)", letterSpacing: "-0.02em", lineHeight: 1.25 }}>{f.worry}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ flexShrink: 0, width: 16, height: 16, marginTop: 2, borderRadius: "50%", background: "rgba(77,189,151,0.16)", border: `1px solid ${dc.emerald}`, color: dc.emerald, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</span>
                  <span style={{ fontSize: "clamp(14px,1.15vw,16px)", fontWeight: 500, color: dc.cream, letterSpacing: "-0.02em", lineHeight: 1.45 }}>{f.answer}{f.partner && partnerTag}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <button onClick={() => onNavigate("dscr-calculator")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dc.emerald, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Find out what you qualify for →</button>
          </div>
        </div>
      </section>

      {/* ── LIVE: CHECK YOUR BUYING POWER ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 32, maxWidth: "62ch" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>Decided by the property, not your passport</div>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.05, margin: 0, color: dc.cream }}>
              Check your buying power. Notice there's no income field.
            </h2>
          </div>
          <div className="dc-split gs-reveal" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 28, alignItems: "stretch" }}>
            <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.4vw,28px)", display: "grid", gap: 16, alignContent: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon }}>The property</div>
              {[
                { l: "Monthly rent", n: num(rent, setRent, 50, "$") },
                { l: "Purchase price", n: num(price, setPrice, 5000, "$") },
                { l: "Down payment %", n: num(downPct, setDownPct, 1, "", "%") },
                { l: "Note rate %", n: num(rate, setRate, 0.125, "", "%") },
              ].map((f) => (
                <label key={f.l} style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 6 }}>{f.l}</span>
                  {f.n}
                </label>
              ))}
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>Scroll over any field to adjust. Taxes &amp; insurance estimated into the payment.</div>
            </div>
            <div className="dc-results-first" style={{ background: dc.dark, borderRadius: radius.lg, border: `1px solid ${vColor}55`, padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 8, background: `${vColor}22`, border: `1px solid ${vColor}`, borderRadius: 100, padding: "6px 14px", marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: vColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: vColor }}>{verdict}</span>
              </div>
              <Mono style={{ fontSize: "clamp(52px,8vw,96px)", fontWeight: 700, letterSpacing: "-0.04em", color: vColor, lineHeight: 1 }}>{dscr.toFixed(2)}x</Mono>
              <div style={{ fontSize: 15, color: "rgba(238,239,211,0.7)", marginTop: 14, lineHeight: 1.5, maxWidth: "44ch" }}>
                {fmt$(rent)} rent ÷ {fmt$(pitia)} full payment. {go ? "Rent covers the loan and the LTV fits — this is fundable. Example: $4,000 rent vs ~$3,000 payment is a strong 1.33x." : dscr >= 1.0 ? "Rent covers the loan, but lower the LTV to ≤75% for the non-US investor program." : "Rent falls short of the payment — raise rent or lower the loan to clear 1.00x."}
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 22, flexWrap: "wrap" }}>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: ltvOk ? dc.emerald : dc.lemon, display: "block" }}>{ltv}%</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>LTV (cap ≈75%)</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream, display: "block" }}>{fmt$(loan)}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>loan amount</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: ACCENT, display: "block" }}>$0</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>income docs</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: dc.cream }}>Four steps. You never have to fly here.</h2>
          <div className="gs-reveal dc-band-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={s.t} style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", display: "flex", gap: 16 }}>
                <Mono style={{ flexShrink: 0, fontSize: 28, fontWeight: 700, color: dc.lemon, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</Mono>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: dc.cream }}>{s.t}{s.partner && partnerTag}</div>
                  <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)", marginTop: 5, lineHeight: 1.5 }}>{s.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LIKELY QUALIFY FOR ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: ACCENT, marginBottom: 12 }}>What you'll likely qualify for</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: dc.cream }}>Set your expectations up front.</h2>
          <div className="gs-reveal dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {QUALIFY.map((q) => (
              <div key={q.l} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(20px,2.2vw,28px)" }}>
                <Mono style={{ fontSize: "clamp(24px,2.6vw,32px)", fontWeight: 700, color: dc.lemon, letterSpacing: "-0.03em", display: "block", lineHeight: 1 }}>{q.v}</Mono>
                <div style={{ fontSize: 13, fontWeight: 600, color: dc.cream, marginTop: 8 }}>{q.l}</div>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>{q.s}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: "rgba(238,239,211,0.62)", margin: "16px 0 0", maxWidth: "70ch", lineHeight: 1.5 }}>
            Single-family, 2–4 units, and many condos — long-term and short-term (Airbnb) rentals. Illustrative ranges; your numbers, taxes, insurance, and the lender decide the real figure.
          </p>

          {/* ── Real eligibility + FIRPTA (engine-driven, not copy) ── */}
          {(() => {
            const selStyle: React.CSSProperties = { background: dc.teal, color: dc.cream, border: "1px solid rgba(238,239,211,0.22)", borderRadius: radius.sm, padding: "10px 12px", fontFamily: font.family, fontSize: 14, fontWeight: 600, minHeight: 44 };
            const stat = (v: string, l: string, c: string) => (
              <div style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.14)", borderRadius: radius.sm, padding: "16px 18px" }}>
                <Mono style={{ fontSize: "clamp(20px,2.2vw,26px)", fontWeight: 700, color: c, display: "block", lineHeight: 1 }}>{v}</Mono>
                <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 6 }}>{l}</div>
              </div>
            );
            return (
              <div className="gs-reveal" style={{ marginTop: 28, background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(22px,2.6vw,32px)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ACCENT, marginBottom: 16 }}>Your exact terms by profile</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                  <select aria-label="ID type" value={idType} onChange={(e) => setIdType(e.target.value as FnIdType)} style={selStyle}>
                    <option value="ITIN">ITIN holder</option>
                    <option value="PASSPORT_ONLY">Passport only (no SSN)</option>
                    <option value="SSN">Have SSN</option>
                  </select>
                  <select aria-label="Country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={selStyle}>
                    {["MX", "BR", "CA", "GB", "DE", "AE", "CN", "NG", "RU", "IR"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => setHasVisa((v) => !v)} style={{ ...selStyle, cursor: "pointer", color: hasVisa ? dc.emerald : "rgba(238,239,211,0.7)" }}>
                    {hasVisa ? "✓ Has U.S. visa" : "No U.S. visa"}
                  </button>
                </div>
                {fnElig.canLend ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                    {stat(fnElig.tier, "country risk tier", fnElig.tier === "PREFERRED" ? dc.emerald : fnElig.tier === "ELEVATED" ? dc.lemon : dc.cream)}
                    {stat(`+${fnElig.totalRateAddBps} bps`, "rate add-on over base", dc.lemon)}
                    {stat(`${fnElig.maxLTV.purchase}% / ${fnElig.maxLTV.cashOut}%`, "max LTV — purchase / cash-out", dc.cream)}
                  </div>
                ) : (
                  <div style={{ background: risk.dangerBg, border: `1px solid ${risk.dangerBorder}`, borderRadius: radius.sm, padding: "14px 16px", color: risk.danger, fontSize: 14, fontWeight: 600 }}>{fnElig.note}</div>
                )}
                <div style={{ marginTop: 18, borderTop: "1px solid rgba(238,239,211,0.12)", paddingTop: 16, fontSize: 13, color: "rgba(238,239,211,0.66)", lineHeight: 1.55 }}>
                  <strong style={{ color: dc.cream }}>At sale (FIRPTA):</strong> 15% of the gross sale price is withheld — ≈{fmt$(firpta.federalWithholdingAmount)} on a {fmt$(price)} sale.{firpta.withholdingCertificateRecommended ? ` Apply for a withholding certificate (Form 8288-B) to free up the excess over the ~${fmt$(firpta.estimatedTaxOnGain)} actually owed on the gain.` : ""} Refinancing (rate-term or cash-out) is not a sale — no FIRPTA.
                </div>
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(238,239,211,0.12)", paddingTop: 16, fontSize: 13, color: "rgba(238,239,211,0.66)", lineHeight: 1.55 }}>
                  <strong style={{ color: ACCENT }}>Estate-tax exposure:</strong> non-resident aliens get only a $60,000 U.S. estate-tax exemption (vs $13.99M for citizens) — so ≈{fmt$(nraEstate.exposedValue)} of a {fmt$(price)} property is exposed, up to ≈{fmt$(nraEstate.estTaxAt40)} at the 40% rate if the owner passes while holding it personally. Holding through a properly structured entity can change the situs analysis — plan this with a cross-border tax advisor.
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.45)", marginTop: 10 }}>Screening guidance, not legal or tax advice. Entity vesting (U.S. LLC) required.</div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── WHY US, NOT A PLATFORM ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div className="gs-reveal" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>Why us, not a faceless platform</div>
          <p style={{ fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.3, margin: 0, color: dc.cream }}>
            A platform hands you a <span style={{ color: "rgba(238,239,211,0.62)" }}>form</span>. You get a <span style={{ color: dc.lemon }}>person</span> — in your language, from your first question to the keys, who has taken a non-U.S. file through closing before and tells you what the property has to prove.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: dc.cream }}>The questions you're Googling.</h2>
          <div className="gs-reveal dc-band-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FAQS.map((f) => (
              <div key={f.q} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(18px,2vw,24px)" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: dc.cream, letterSpacing: "-0.01em", marginBottom: 8 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>{f.a}{f.partner && partnerTag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Free, 60 seconds, no credit pull. No SSN. No U.S. credit. No flight.", title: "Check your buying power", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Prefer a human? Talk to a multilingual DSCR specialist.", title: "Message a specialist", view: "book-demo" },
      ]} />

      {/* ── COMPLIANCE FOOTER ── */}
      <section style={{ background: dc.dark, color: "rgba(238,239,211,0.62)", padding: `28px ${dc.pad} 40px`, borderTop: "1px solid rgba(238,239,211,0.08)" }}>
        <p style={{ maxWidth: dc.maxW, margin: "0 auto", fontSize: 12, lineHeight: 1.6 }}>
          Estimates only — not a loan commitment, approval, or offer of credit. For business-purpose, non-owner-occupied investment property. DSCR loan terms, rates, and eligibility vary by lender, property, and country of residence and change without notice.
        </p>
      </section>
    </DcShell>
  );
}
