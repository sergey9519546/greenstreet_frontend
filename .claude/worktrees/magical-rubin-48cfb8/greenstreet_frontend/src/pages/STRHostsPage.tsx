import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font } from "../theme";
import BottomCTA from "../design/BottomCTA";

// ── Who-We-Serve: STR & Airbnb Hosts ──────────────────────────────────────────
// Signature: the 12-Month Revenue Ribbon — real seasonal income (ADR × occupancy),
// the worst-month DSCR a lender actually underwrites to. Not the peak-season fantasy.

const BLUE = "#7ec8d3";
const RED = "#e06363";
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
// seasonal multipliers — summer-peak vacation market
const SEASON = [0.62, 0.68, 0.84, 0.96, 1.12, 1.28, 1.34, 1.26, 1.04, 0.88, 0.70, 0.78];
const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function STRHostsPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Airbnb DSCR Loans: Qualify with Short-Term Rental Income | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [adr, setAdr] = useState(185);
  const [occ, setOcc] = useState(64);
  const [pay, setPay] = useState(2750);

  const base = adr * 30 * (occ / 100); // avg monthly gross
  const monthly = SEASON.map((s) => base * s);
  const worst = Math.min(...monthly);
  const peak = Math.max(...monthly);
  const annualAvg = monthly.reduce((a, b) => a + b, 0) / 12;
  const worstDSCR = pay > 0 ? worst / pay : 0;
  const avgDSCR = pay > 0 ? annualAvg / pay : 0;
  const worstIdx = monthly.indexOf(worst);
  const holds = worstDSCR >= 1.0;

  // chart geometry
  const W = 560, H = 230, padL = 8, padR = 8, padT = 16, padB = 26;
  const yMax = peak * 1.12;
  const X = (i: number) => padL + (i / 11) * (W - padL - padR);
  const Y = (v: number) => padT + (1 - v / yMax) * (H - padT - padB);
  const area = `M ${X(0)},${Y(0)} ` + monthly.map((v, i) => `L ${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ") + ` L ${X(11)},${Y(0)} Z`;
  const line = monthly.map((v, i) => `${i === 0 ? "M" : "L"} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");

  const numIn = (v: number, set: (n: number) => void, step: number, pre = "", suf = "") => (
    <div style={{ display: "flex", alignItems: "center", background: dc.dark, border: "1.5px solid rgba(238,239,211,0.18)", borderRadius: radius.sm, padding: "0 12px" }}>
      {pre && <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>{pre}</span>}
      <input type="number" step={step} value={v} onChange={(e) => set(+e.target.value)} style={{ width: "100%", border: "none", background: "none", outline: "none", color: dc.cream, fontFamily: font.family, fontWeight: 600, fontSize: 15, padding: "11px 6px" }} />
      {suf && <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>{suf}</span>}
    </div>
  );

  const navLinks = [
    { label: "STR Underwriting", view: "str-underwriting" },
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Underwrite my STR →", view: "str-underwriting" }}>
      <style>{`@media(max-width:760px){.str-grid{grid-template-columns:1fr !important;}}`}</style>

      {/* HERO */}
      <section style={{ position: "relative", background: dc.teal, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24 }}>For STR &amp; Airbnb Hosts</div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>Airbnb DSCR loans that survive the slow months.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              Short-term rental income swings with the season. We underwrite it the way it actually behaves — ADR × occupancy, month by month — not the peak-week screenshot. The number holds at closing.
            </Lead>
            <button onClick={() => onNavigate("str-underwriting")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Underwrite my STR →</button>
          </div>
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(18px,2.2vw,26px)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE, marginBottom: 6 }}>Your year, month by month</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }} role="img" aria-label="Seasonal STR revenue vs the payment">
              <path d={area} fill={BLUE} fillOpacity="0.16" />
              <path d={line} fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <line x1={padL} x2={W - padR} y1={Y(pay)} y2={Y(pay)} stroke={dc.lemon} strokeWidth="1.4" strokeDasharray="5 5" />
              <text x={W - padR} y={Y(pay) - 5} textAnchor="end" fill={dc.lemon} fontSize="10" fontWeight={700} fontFamily={dc.mono}>payment {fmt$(pay)}</text>
              {monthly.map((v, i) => (
                <g key={i}>
                  <circle cx={X(i)} cy={Y(v)} r={i === worstIdx ? 5 : 3} fill={i === worstIdx ? RED : BLUE} stroke={dc.dark} strokeWidth="1.5" />
                  <text x={X(i)} y={H - 8} textAnchor="middle" fill="rgba(238,239,211,0.5)" fontSize="9" fontFamily={dc.mono}>{MONTHS[i]}</text>
                </g>
              ))}
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 14px" }}><Mono style={{ fontSize: 22, fontWeight: 700, color: holds ? dc.emerald : RED, display: "block" }}>{worstDSCR.toFixed(2)}x</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>worst-month DSCR</div></div>
              <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 14px" }}><Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream, display: "block" }}>{avgDSCR.toFixed(2)}x</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>year-round avg</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RIBBON */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>The revenue ribbon</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, margin: "0 0 10px", maxWidth: "20ch" }}>The deal has to survive February — not just July.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(238,239,211,0.6)", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.5 }}>Set your nightly rate and occupancy — scroll over the fields. Months under the lemon line don't cover the payment. We qualify on the trough, so there's no surprise at closing.</p>
          <div className="str-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28, alignItems: "stretch" }}>
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.4vw,28px)", display: "grid", gap: 16, alignContent: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE }}>The listing</div>
              {[{ l: "Average nightly rate (ADR)", n: numIn(adr, setAdr, 5, "$") }, { l: "Occupancy", n: numIn(occ, setOcc, 1, "", "%") }, { l: "Monthly payment (PITIA)", n: numIn(pay, setPay, 50, "$") }].map((f) => (
                <label key={f.l}><span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 6 }}>{f.l}</span>{f.n}</label>
              ))}
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>Seasonality models a summer-peak market. Real underwriting uses your market's AirDNA history.</div>
            </div>
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: `1px solid ${holds ? "rgba(77,189,151,0.4)" : "rgba(224,99,99,0.4)"}`, padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: holds ? dc.emerald : RED, marginBottom: 6 }}>{holds ? "Holds the slow months" : "Breaks in the off-season"}</div>
              <Mono style={{ fontSize: "clamp(48px,7vw,84px)", fontWeight: 700, color: holds ? dc.emerald : RED, lineHeight: 0.9 }}>{worstDSCR.toFixed(2)}x</Mono>
              <div style={{ fontSize: 15, color: "rgba(238,239,211,0.7)", marginTop: 14, lineHeight: 1.5, maxWidth: "46ch" }}>
                Worst month ({["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][worstIdx]}) brings {fmt$(worst)} against a {fmt$(pay)} payment. {holds ? "Even the trough covers the loan — that's a fundable STR." : "The trough falls short — lower the loan, or we underwrite to the months that do clear."}
              </div>
              <div style={{ display: "flex", gap: 22, marginTop: 22, flexWrap: "wrap" }}>
                <div><Mono style={{ fontSize: 20, fontWeight: 700, color: BLUE, display: "block" }}>{fmt$(annualAvg)}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>avg month</div></div>
                <div><Mono style={{ fontSize: 20, fontWeight: 700, color: dc.cream, display: "block" }}>{fmt$(peak)}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>peak month</div></div>
                <div><Mono style={{ fontSize: 20, fontWeight: 700, color: dc.lemon, display: "block" }}>{avgDSCR.toFixed(2)}x</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>annual DSCR</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section style={{ background: dc.teal, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(26px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 28px", color: dc.cream }}>STR income, underwritten honestly.</h2>
          <div className="gs-reveal dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {[
              { t: "Real ADR × occupancy", s: "Market data, not a host's best week. The number is the one a lender will actually fund." },
              { t: "Seasonally stress-tested", s: "We check the trough month and a rate rise before you commit — no off-season surprise." },
              { t: "Long-term fallback", s: "If the STR number is thin, we can qualify on the long-term lease instead — whichever is stronger." },
            ].map((v) => (
              <div key={v.t} style={{ background: dc.dark, border: "1px solid rgba(238,239,211,0.16)", borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: dc.cream, letterSpacing: "-0.02em", marginBottom: 8 }}>{v.t}</div>
                <div style={{ fontSize: 14, color: "rgba(238,239,211,0.6)", lineHeight: 1.5 }}>{v.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} cards={[
        { bg: dc.lemon, fg: dc.dark, blurb: "Run your nightly rate and occupancy through the STR engine — month by month.", title: "Underwrite my STR", view: "str-underwriting" },
        { bg: dc.mintBg, fg: dc.dark, blurb: "See which Greenstreet program fits a short-term-rental file.", title: "Find your program", view: "lender-intel" },
      ]} />
    </DcShell>
  );
}
