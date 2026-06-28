import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font } from "../theme";
import BottomCTA from "../design/BottomCTA";
import ComplianceNote from "../design/ComplianceNote";

// ── Who-We-Serve: Non-US Investor Investors ──────────────────────────────────
// Bespoke dark page. Conversion core = the "Yes, you can" fear-grid. Positioning:
// broker CHOICE (one application → best of many DSCR lenders) + human concierge.
// [PARTNER] rows are tagged "via partner" so nothing overpromises a capability we
// can't deliver without a formation/banking/FX partner lined up.

const BLUE = "#7ec8d3"; // sky — cross-border / data accent
const RED = "#ff6b6b";
// Hero flight-path arc — shared by the SVG paths AND the CSS offset-path packet,
// so the comet always rides the exact curve the arc draws.
const ARC = "M40 132 C 120 30, 240 30, 320 132";

const pf = (r: number) => {
  if (r === 0) return 0;
  const m = r / 12;
  return (m * Math.pow(1 + m, 360)) / (Math.pow(1 + m, 360) - 1);
};
const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// The fear-grid — mirror what they Google. `partner` rows need a real partner.
const FEARS: { worry: string; answer: string; partner?: boolean }[] = [
  { worry: "I have no U.S. credit score.", answer: "Some DSCR programs can review alternative credit or home-country financial history, subject to lender overlays and product-sheet verification." },
  { worry: "No SSN or U.S. passport.", answer: "Some programs may review passport-based identity and alternative documentation. KYC/AML, OFAC, eligible-country, and lender review still apply." },
  { worry: "No U.S. job or W-2 income.", answer: "DSCR underwriting focuses on the property's rental cash flow, but borrower documentation, reserves, funds source, and sanctions screening still matter." },
  { worry: "I don't have a U.S. LLC.", answer: "LLC and EIN setup may be available through a formation partner; entity eligibility must match the loan program and state.", partner: true },
  { worry: "No U.S. bank account.", answer: "A U.S. business account may be available through banking partners, subject to their onboarding and compliance review.", partner: true },
  { worry: "Moving money across borders scares me.", answer: "FX/wiring support may be available through partners, subject to funds-source, AML, and banking rules.", partner: true },
  { worry: "I can't fly here to close.", answer: "Remote closing availability depends on state, title/settlement process, document requirements, and lender rules." },
  { worry: "Will any lender work with my country?", answer: "Country eligibility is not universal. Sanctioned countries/persons cannot be served, and some lenders restrict jurisdictions." },
];

const STEPS: { t: string; s: string; partner?: boolean }[] = [
  { t: "Check preliminary program fit", s: "No hard credit pull at this step. Current loan terms require product-sheet and underwriting verification." },
  { t: "Confirm country and compliance eligibility", s: "KYC/AML, OFAC, eligible country, funds source, entity, and state-scope review come before terms are relied on." },
  { t: "Upload documents digitally", s: "Expect identity, property, reserves, entity, and source-of-funds documentation. Exact list varies by program." },
  { t: "Close if the file clears underwriting", s: "Remote closing may be available depending on state, title, settlement, and lender requirements." },
];

const QUALIFY = [
  { v: "[VERIFY]", l: "down payment", s: "current product sheet" },
  { v: "[VERIFY]", l: "DSCR floor", s: "program-specific" },
  { v: "[VERIFY]", l: "loan size", s: "lender-specific" },
  { v: "[VERIFY]", l: "reserves", s: "country/file dependent" },
];

const FAQS = [
  { q: "Can a non-U.S. citizen really get a U.S. mortgage?", a: "Sometimes. Some business-purpose DSCR programs support foreign-national or ITIN borrowers, but eligibility depends on country, documentation, sanctions screening, state scope, and lender overlays." },
  { q: "Do I need a U.S. credit score?", a: "Not always. Some programs may review alternative credit or home-country financial history, subject to product-sheet verification." },
  { q: "How much down payment?", a: "Do not rely on a generic number. Down payment and LTV are program-specific and must be verified against the current product sheet." },
  { q: "What documents do I actually need?", a: "Expect passport/identity, property/rent information, reserves, funds-source evidence, entity documents if applicable, and any lender-specific KYC/AML requirements." },
  { q: "Can I hold the property in an LLC?", a: "Often, but entity eligibility depends on program, state, ownership, guarantor, and formation documents. Formation support may be available through a partner.", partner: true },
  { q: "Why might pricing differ from a U.S. citizen's file?", a: "Foreign-national files can carry different documentation, reserves, credit, country, and lender-overlay requirements. Current pricing must come from the active product sheet." },
  { q: "Can I close without coming to the U.S.?", a: "Remote closing depends on state, settlement process, title requirements, notarization, and lender rules." },
  { q: "Long-term and short-term (Airbnb) rentals — both?", a: "Possibly. STR eligibility depends on property, local legality, approved income documentation, and lender overlay review." },
];

export default function NonUsInvestorsPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Non-US Investor DSCR Loans | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // ── live "check your buying power" — never asks for income ──
  const [rent, setRent] = useState(4000);
  const [price, setPrice] = useState(560000);
  const [downPct, setDownPct] = useState(25);
  const [rate, setRate] = useState(7.5);
  const loan = price * (1 - downPct / 100);
  const pAndI = loan * pf(rate / 100);
  const pitia = pAndI + (price * 0.011) / 12 + (price * 0.005) / 12; // est. taxes + insurance
  const dscr = pitia > 0 ? rent / pitia : 0;
  const ltv = 100 - downPct;
  const ltvOk = ltv <= 75;
  const go = dscr >= 1.0 && ltvOk;
  const verdict = go ? "REVIEW FIT" : dscr >= 1.0 ? "CHECK LTV" : "CHECK DSCR";
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
            <H1 style={{ margin: "0 0 16px", maxWidth: "13ch" }}>Own U.S. property from anywhere.</H1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="fn-chip"><b>✓</b> Alternative documentation may apply</span>
              <span className="fn-chip"><b>✓</b> Property-cash-flow focus</span>
              <span className="fn-chip"><b>✓</b> Compliance review required</span>
            </div>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "50ch", margin: "0 0 30px" }}>
              DSCR loans can be a path for some international investors because underwriting centers on the property's rental cash flow. Eligibility still depends on documentation, country, KYC/AML, OFAC, state scope, lender overlays, and final underwriting.
            </Lead>
            <div style={{ marginBottom: 22, maxWidth: 620 }}>
              <ComplianceNote tone="legal">
                Sanctioned countries or sanctioned persons cannot be served. Foreign-national eligibility, remote closing, entity setup, banking, FX/wiring, and FIRPTA/tax implications require product, compliance, and professional review.
              </ComplianceNote>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => onNavigate("dscr-calculator")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "15px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Check preliminary program fit →</button>
            </div>
            <button onClick={() => onNavigate("book-demo")} style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", fontFamily: font.family, color: BLUE, fontWeight: 600, fontSize: 14, padding: 0 }}>
              Prefer to talk? Request a DSCR specialist review →
            </button>
            <div style={{ marginTop: 22, fontSize: 12, color: "rgba(238,239,211,0.62)", letterSpacing: "0.01em" }}>
              Preliminary only · No hard credit pull at this step · Eligibility subject to KYC/AML, OFAC, state scope, and underwriting
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
              {[{ v: dscr.toFixed(2) + "x", l: "scenario DSCR" }, { v: "[VERIFY]", l: "current LTV cap" }, { v: verdict, l: "review status" }].map((t, i) => (
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
              Check property cash flow before a specialist reviews the file.
            </h2>
          </div>
          <div className="dc-split gs-reveal" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 28, alignItems: "stretch" }}>
            <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.4vw,28px)", display: "grid", gap: 16, alignContent: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon }}>The property</div>
              {[
                { l: "Monthly rent", n: num(rent, setRent, 50, "$") },
                { l: "Purchase price", n: num(price, setPrice, 5000, "$") },
                { l: "Down payment %", n: num(downPct, setDownPct, 1, "", "%") },
                { l: "Illustrative note rate %", n: num(rate, setRate, 0.125, "", "%") },
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
                {fmt$(rent)} rent ÷ {fmt$(pitia)} estimated full payment. {go ? "The scenario appears strong enough for specialist review, but this is not an approval, term sheet, or offer of credit." : dscr >= 1.0 ? "The rent appears to cover the estimated payment; current LTV caps and foreign-national overlays still require product-sheet review." : "The scenario needs review because rent does not cover the estimated payment under these assumptions."}
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 22, flexWrap: "wrap" }}>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: ltvOk ? dc.emerald : dc.lemon, display: "block" }}>{ltv}%</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>scenario LTV</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream, display: "block" }}>{fmt$(loan)}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>loan amount</div></div>
                <div><Mono style={{ fontSize: 22, fontWeight: 700, color: BLUE, display: "block" }}>[VERIFY]</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 2 }}>required docs</div></div>
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
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>Verify expectations before you rely on them.</h2>
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
            Single-family, 2–4 units, condos, long-term rentals, and STR scenarios may be eligible depending on program, state, property, documentation, and lender overlays. Verify before relying on any number.
          </p>
        </div>
      </section>

      {/* ── WHY US, NOT A PLATFORM ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div className="gs-reveal" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>Why us, not a faceless platform</div>
          <p style={{ fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.3, margin: 0, color: dc.cream }}>
            A platform shows one path. Greenstreet reviews the file against eligible DSCR options and the compliance boundaries that matter for country, entity, documentation, funds source, and state scope.
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
        { bg: dc.lemon, fg: dc.dark, blurb: "Run a preliminary scenario before a specialist reviews product fit, country eligibility, documentation, and state scope.", title: "Check preliminary fit", view: "dscr-calculator" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "Need hand-holding? Request a DSCR specialist review for entity, banking, funds-source, and closing requirements.", title: "Talk to a specialist", view: "book-demo" },
      ]} />

      {/* ── COMPLIANCE FOOTER ── */}
      <section style={{ background: dc.dark, color: "rgba(238,239,211,0.62)", padding: `28px ${dc.pad} 40px`, borderTop: "1px solid rgba(238,239,211,0.08)" }}>
        <p style={{ maxWidth: dc.maxW, margin: "0 auto", fontSize: 12, lineHeight: 1.6 }}>
          Estimates only — not a loan commitment, approval, term sheet, or offer of credit. For business-purpose, non-owner-occupied investment property. DSCR loan terms, rates, documentation, eligible countries, sanctions screening, state scope, and eligibility vary by lender and change without notice. Tax and legal issues require qualified professional review.
        </p>
      </section>
    </DcShell>
  );
}
