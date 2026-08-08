import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font, risk } from "../theme";
import BottomCTA from "../design/BottomCTA";
import { assessForeignNationalEligibility, type FnIdType } from "../engine/fnEngine";
import { calculateFIRPTAImpact, nraEstateTaxNote } from "../engine/firpta";
import { calculatePaymentFactor } from "../engine";

// ── Who-We-Serve: Non-US Investor Investors ──────────────────────────────────
// Bespoke dark page. Conversion core = the "Yes, you can" fear-grid. Positioning:
// broker CHOICE (one application → best of many DSCR lenders) + human concierge.
// [PARTNER] rows are tagged "via partner" so nothing overpromises a capability we
// can't deliver without a formation/banking/FX partner lined up.

const BLUE = "#7ec8d3"; // sky — cross-border / data accent
const RED = risk.danger;
// Hero flight-path arc — shared by the SVG paths AND the CSS offset-path packet,
// so the comet always rides the exact curve the arc draws.
const ARC = "M40 132 C 120 30, 240 30, 320 132";

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
  { worry: "Will any lender work with my country?", answer: "We shop multiple lenders to find the one comfortable with where you live." },
];

const STEPS = [
  { t: "Check your buying power", s: "60 seconds, no credit pull — see your likely loan, rate, and payment." },
  { t: "We match you to the lender", s: "Best-fit DSCR lender for your country and deal — plus your LLC + U.S. bank if you need them.", partner: true },
  { t: "Upload documents digitally", s: "Passport, the property, and simple financials. No fax, no mail." },
  { t: "Close remotely", s: "~21–45 days. Then do it again for the next property." },
];

const QUALIFY = [
  { v: "20–30%", l: "down payment", s: "of the purchase price" },
  { v: "~1.0x+", l: "DSCR to qualify", s: "rent covers the payment" },
  { v: "$100K–$2M+", l: "loan size", s: "depending on lender" },
  { v: "6–12 mo", l: "reserves", s: "held after closing" },
];

const FAQS = [
  { q: "Can a non-U.S. citizen really get a U.S. mortgage?", a: "Yes — no citizenship or residency required. These are business-purpose investment loans on the property's income." },
  { q: "Do I need a U.S. credit score?", a: "No. We review your home-country financial history; the property's rent is the qualifier." },
  { q: "How much down payment?", a: "Typically 20–30% of the purchase price." },
  { q: "What documents do I actually need?", a: "Passport, the property / lease info, and basic financials. No U.S. tax returns or W-2s." },
  { q: "Can I hold the property in an LLC?", a: "Yes — usually required. We help you form one through our formation partner.", partner: true },
  { q: "Why is my rate higher than a U.S. citizen's?", a: "It's an investment, non-QM loan — that carries a premium over owner-occupied conventional. We shop lenders to keep it tight." },
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
    <div style={{ display: "flex", alignItems: "center", background: dc.dark, border: "1.5px solid rgba(238,239,211,0.18)", borderRadius: radius.sm, padding: "0 12px" }}>
      {pre && <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>{pre}</span>}
      <input type="number" step={step} value={v} onChange={(e) => set(+e.target.value)}
        style={{ width: "100%", border: "none", background: "none", outline: "none", color: dc.cream, fontFamily: font.family, fontWeight: 600, fontSize: 15, padding: "11px 6px", letterSpacing: "-0.02em" }} />
      {suf && <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>{suf}</span>}
    </div>
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
        /* ── hero "global capital flight path" (loops ~3.6s) ──
           Capital launches from your country, flies the arc to a U.S. property,
           and an approval seal thuds in on arrival. Pure CSS; the base arc is
           always solid so the composition still reads when paused / reduced. */
        @keyframes fnFlow   { to { stroke-dashoffset:-32; } }
        @keyframes fnFly    { 0%{offset-distance:0%;opacity:0} 5%{opacity:1} 52%{offset-distance:100%;opacity:1} 60%{offset-distance:100%;opacity:0} 100%{offset-distance:100%;opacity:0} }
        @keyframes fnLaunch { 0%{transform:scale(.5);opacity:.6} 26%{transform:scale(2.6);opacity:0} 100%{opacity:0} }
        @keyframes fnLand   { 0%,50%{transform:scale(.4);opacity:0} 56%{opacity:.6} 82%{transform:scale(2.7);opacity:0} 100%{opacity:0} }
        @keyframes fnStampIn{ 0%,50%{transform:scale(0) rotate(-20deg);opacity:0} 58%{transform:scale(1.2) rotate(5deg);opacity:1} 66%{transform:scale(.94) rotate(-1deg)} 74%,92%{transform:scale(1) rotate(0);opacity:1} 100%{transform:scale(1) rotate(0);opacity:0} }
        @keyframes fnPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.16)} }
        .fn-svg   { display:block; overflow:visible; margin:6px 0 4px; }
        .fn-flow  { stroke-dasharray:5 11; opacity:.85; animation:fnFlow 1.05s linear infinite; }
        .fn-packet{ offset-path:path('${ARC}'); offset-rotate:auto; offset-distance:0%; animation:fnFly 3.6s cubic-bezier(.5,0,.5,1) .3s infinite; }
        .fn-stampG{ transform-box:fill-box; transform-origin:center; animation:fnStampIn 3.6s ease-out .3s infinite; }
        .fn-dot   { transform-box:fill-box; transform-origin:center; }
        .fn-dot.b { animation:fnPulse 3.6s ease-in-out .3s infinite; }
        .fn-launch{ transform-box:fill-box; transform-origin:center; animation:fnLaunch 3.6s ease-out .3s infinite; }
        .fn-land  { transform-box:fill-box; transform-origin:center; animation:fnLand 3.6s ease-out .3s infinite; }
        .fn-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;letter-spacing:.01em;color:rgba(238,239,211,.85);background:rgba(238,239,211,.07);border:1px solid rgba(238,239,211,.16);border-radius:100px;padding:7px 14px;}
        .fn-chip b{color:#7ec8d3;}
        .fn-fearwrap{display:grid;gap:12px;}
        .fn-fear{display:grid;grid-template-columns:minmax(0,0.8fr) minmax(0,1.2fr);gap:20px;align-items:center;}
        @media(max-width:760px){.fn-fear{grid-template-columns:1fr !important;gap:10px;}}
        @media(prefers-reduced-motion:reduce){
          .fn-flow,.fn-packet,.fn-stampG,.fn-dot,.fn-launch,.fn-land{animation:none !important;}
          .fn-packet,.fn-launch,.fn-land{display:none !important;}
          .fn-stampG{opacity:1 !important;transform:none !important;}
        }
      `}</style>
      {/* ── HERO ── */}
      <section style={{ position: "relative", background: dc.teal, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
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
            <button onClick={() => onNavigate("book-demo")} style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", fontFamily: font.family, color: BLUE, fontWeight: 600, fontSize: 14, padding: 0 }}>
              Prefer to talk? Message a DSCR specialist on WhatsApp →
            </button>
            <div style={{ marginTop: 22, fontSize: 12, color: "rgba(238,239,211,0.62)", letterSpacing: "0.01em" }}>
              No SSN required · Passport accepted · Close remotely · Powered by multiple U.S. DSCR lenders
            </div>
          </div>

          {/* home → US arc */}
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.5vw,30px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE, marginBottom: 4 }}>One application · many lenders</div>
            <svg className="fn-svg" viewBox="0 0 360 178" width="100%" role="img" aria-label="Your capital travels from your country to a U.S. property and is approved">
              <defs>
                <linearGradient id="fnTail" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={dc.lemon} stopOpacity="0" />
                  <stop offset="1" stopColor={dc.lemon} stopOpacity="0.95" />
                </linearGradient>
              </defs>
              {/* arc — solid base + animated flowing dashes (live route) */}
              <path d={ARC} fill="none" stroke="rgba(126,200,211,0.22)" strokeWidth="2.6" strokeLinecap="round" />
              <path className="fn-flow" d={ARC} fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" />
              {/* endpoints + launch / landing ripples */}
              <circle className="fn-launch" cx="40" cy="132" r="8" fill="none" stroke={dc.lemon} strokeWidth="2" />
              <circle className="fn-land" cx="320" cy="132" r="8" fill="none" stroke={dc.emerald} strokeWidth="2" />
              <circle className="fn-dot a" cx="40" cy="132" r="8" fill={dc.lemon} />
              <circle className="fn-dot b" cx="320" cy="132" r="8" fill={dc.emerald} />
              <text x="40" y="158" textAnchor="middle" fill="rgba(238,239,211,0.6)" fontSize="11" fontFamily={font.family} fontWeight={600}>Your country</text>
              <text x="320" y="158" textAnchor="middle" fill="rgba(238,239,211,0.6)" fontSize="11" fontFamily={font.family} fontWeight={600}>U.S. property</text>
              {/* flying capital comet (head + tapered tail, rides the arc) */}
              <g className="fn-packet">
                <line x1="0" y1="0" x2="-24" y2="0" stroke="url(#fnTail)" strokeWidth="3.6" strokeLinecap="round" />
                <circle r="4.6" fill={dc.lemon} />
                <circle r="1.8" fill="#fff" fillOpacity="0.9" />
              </g>
              {/* approval seal — thuds in when the capital lands */}
              <g transform="translate(180,52)">
                <g className="fn-stampG">
                  <circle r="21" fill="rgba(77,189,151,0.14)" stroke={dc.emerald} strokeWidth="2" strokeDasharray="3 4" />
                  <circle r="15" fill="none" stroke={dc.emerald} strokeWidth="1" strokeOpacity="0.5" />
                  <path d="M-8 0 L-2.5 6.5 L9 -7.5" fill="none" stroke={dc.emerald} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
              {[{ v: dscr.toFixed(2) + "x", l: "DSCR" }, { v: "75%", l: "max LTV" }, { v: go ? "GO" : "—", l: "verdict" }].map((t, i) => (
                <div key={i} style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 8px", textAlign: "center" }}>
                  <Mono style={{ fontSize: 20, fontWeight: 700, color: i === 2 ? vColor : dc.cream, display: "block", lineHeight: 1 }}>{t.v}</Mono>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 5 }}>{t.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THE FEAR-GRID — conversion core ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>Yes, you can</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, margin: "0 0 36px", maxWidth: "20ch" }}>
            Every reason you think you can't — answered.
          </h2>
          <div className="gs-reveal fn-fearwrap">
            {FEARS.map((f) => (
              <div key={f.worry} className="fn-fear" style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(18px,2.2vw,26px) clamp(20px,2.4vw,32px)" }}>
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, color: RED, fontWeight: 700, fontSize: 26, lineHeight: 1, marginTop: -2 }}>“</span>
                  <span style={{ fontSize: "clamp(16px,1.7vw,20px)", fontWeight: 600, color: "rgba(238,239,211,0.78)", letterSpacing: "-0.015em", lineHeight: 1.3 }}>{f.worry}</span>
                </div>
                <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(77,189,151,0.16)", border: `1px solid ${dc.emerald}`, color: dc.emerald, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: "clamp(15px,1.5vw,17px)", fontWeight: 500, color: dc.cream, lineHeight: 1.5 }}>{f.answer}{f.partner && partnerTag}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <button onClick={() => onNavigate("dscr-calculator")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dc.emerald, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Find out what you qualify for →</button>
          </div>
        </div>
      </section>

      {/* ── LIVE: CHECK YOUR BUYING POWER ── */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: 32, maxWidth: "62ch" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, marginBottom: 12 }}>Decided by the property, not your passport</div>
            <h2 style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, margin: 0, color: dc.cream }}>
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
            <div style={{ background: dc.dark, borderRadius: radius.lg, border: `1px solid ${vColor}55`, padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 8, background: `${vColor}22`, border: `1px solid ${vColor}`, borderRadius: 100, padding: "6px 14px", marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: vColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: vColor }}>{verdict}</span>
              </div>
              <Mono style={{ fontSize: "clamp(52px,8vw,96px)", fontWeight: 700, letterSpacing: "-0.04em", color: vColor, lineHeight: 0.9 }}>{dscr.toFixed(2)}x</Mono>
              <div style={{ fontSize: 15, color: "rgba(238,239,211,0.7)", marginTop: 14, lineHeight: 1.5, maxWidth: "44ch" }}>
                {fmt$(rent)} rent ÷ {fmt$(pitia)} full payment. {go ? "Rent covers the loan and the LTV fits — this is fundable. Example: $4,000 rent vs ~$3,000 payment is a strong 1.33x." : dscr >= 1.0 ? "Rent covers the loan, but lower the LTV to ≤75% for the non-US investor program." : "Rent falls short of the payment — raise rent or lower the loan to clear 1.00x."}
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 22, flexWrap: "wrap" }}>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: ltvOk ? dc.emerald : dc.lemon, display: "block" }}>{ltv}%</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>LTV (cap ≈75%)</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream, display: "block" }}>{fmt$(loan)}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>loan amount</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: BLUE, display: "block" }}>$0</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>income docs</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>Four steps. You never have to fly here.</h2>
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
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, marginBottom: 12 }}>What you'll likely qualify for</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>Set your expectations up front.</h2>
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
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: BLUE, marginBottom: 16 }}>Your exact terms by profile</div>
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
                  <strong style={{ color: BLUE }}>Estate-tax exposure:</strong> non-resident aliens get only a $60,000 U.S. estate-tax exemption (vs $13.99M for citizens) — so ≈{fmt$(nraEstate.exposedValue)} of a {fmt$(price)} property is exposed, up to ≈{fmt$(nraEstate.estTaxAt40)} at the 40% rate if the owner passes while holding it personally. Holding through a properly structured entity can change the situs analysis — plan this with a cross-border tax advisor.
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
            A platform gives you <span style={{ color: "rgba(238,239,211,0.62)" }}>their</span> loan. We give you the <span style={{ color: dc.lemon }}>best</span> loan — one application in front of multiple U.S. lenders, including the ones most comfortable with where you live. A real person, in your language, from your first question to the keys.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>The questions you're Googling.</h2>
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
