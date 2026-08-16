import React, { useEffect, useState } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, font, risk } from "../theme";
import BottomCTA from "../design/BottomCTA";
import { CurrencyInput } from "../components/ui/CurrencyInput";

// ── Who-We-Serve: STR & Airbnb Hosts ──────────────────────────────────────────
// Signature: the 12-Month Revenue Ribbon — real seasonal income (ADR × occupancy),
// the worst-month DSCR a lender actually underwrites to. Not the peak-season fantasy.

const BLUE = "#7ec8d3";
const RED = risk.danger;
// The whole page sits on the dark ground, where base `danger` sinks into the
// surface instead of reading as an alert. `dangerOnDark` is the token's own
// dark-ground pair — see the note beside it in theme.ts.
const RED_ON_DARK = risk.dangerOnDark;
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTHS_FULL = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// seasonal multipliers — summer-peak vacation market
const SEASON = [0.62, 0.68, 0.84, 0.96, 1.12, 1.28, 1.34, 1.26, 1.04, 0.88, 0.70, 0.78];
const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** True on phone-width viewports. Re-evaluates on change, not just on mount. */
function useNarrowViewport(query = "(max-width: 760px)"): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches,
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return narrow;
}

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
  const peakIdx = monthly.indexOf(peak);
  const holds = worstDSCR >= 1.0;

  // ── Chart model ───────────────────────────────────────────────────────────
  // The question this picture answers is "which months don't cover the payment,
  // and by how much". So the payment IS the baseline and each month is drawn as
  // its deviation from it — surplus up, shortfall down.
  //
  // The previous version plotted raw revenue with the payment as a dashed line
  // floating through the middle, and it got the story wrong in three ways:
  //   - it filled the area from revenue down to $0, encoding a quantity nobody
  //     asked about, while the surplus/shortfall vs the payment — the whole
  //     point — had no visual weight at all;
  //   - it marked only `worstIdx` in red. At the default inputs THREE months
  //     fall short (Jan, Feb, Nov) and two of them were drawn the same teal as
  //     July, directly above copy reading "months under the lemon line don't
  //     cover the payment";
  //   - it scaled to `peak * 1.12`, so raising ADR moved the payment line down
  //     the frame and made a fixed shortfall look smaller.
  const shortfalls = monthly.map((v) => v - pay);
  const shortMonths = shortfalls.filter((d) => d < 0).length;
  const maxUp = Math.max(0, ...shortfalls);
  const maxDown = Math.max(0, ...shortfalls.map((d) => -d));
  // One scale for both directions, so a $500 surplus and a $500 shortfall are
  // the same number of pixels. Separate scales would flatter the good months.
  const span = Math.max(maxUp + maxDown, 1);

  // The viewBox narrows on small screens. An SVG scales its type with the
  // drawing, so a 560-wide box rendered into a 303px phone card puts 11px text
  // on screen at 6px — under any readable floor. A 320-wide box renders at
  // roughly 1:1 there, so the month letters stay the size they were authored at
  // instead of shrinking with the picture.
  const narrow = useNarrowViewport();
  const W = narrow ? 320 : 560;
  const H = narrow ? 190 : 240;
  const padL = 8, padR = 8, padT = 26, padB = 40;
  const plotH = H - padT - padB;
  const band = (W - padL - padR) / 12;
  const barW = Math.min(26, band * 0.56);
  const baseY = padT + (maxUp / span) * plotH;
  const X = (i: number) => padL + band * (i + 0.5);
  const Y = (delta: number) => baseY - (delta / span) * plotH;

  const numIn = (v: number, set: (n: number) => void, step: number, pre = "", suf = "") => (
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

  const navLinks = [
    { label: "STR Underwriting", view: "str-underwriting" },
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "Programs", view: "lender-intel" },
  ];

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal} navLinks={navLinks} cta={{ label: "Underwrite my STR →", view: "str-underwriting" }}>
      <style>{`@media(max-width:760px){.str-grid{grid-template-columns:1fr !important;}}`}</style>

      {/* HERO */}
      <section style={{ position: "relative", background: dc.dark, color: dc.cream, overflow: "hidden", padding: `clamp(56px,8vh,104px) ${dc.pad} clamp(48px,7vh,84px)` }}>
        <div className="gs-dot-grid" />
        <div id="gs-hero-content" className="dc-hero" style={{ position: "relative", maxWidth: dc.maxW, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 999, marginBottom: 24 }}>For STR &amp; Airbnb Hosts</div>
            <H1 style={{ margin: "0 0 18px", maxWidth: "16ch" }}>Airbnb DSCR loans that survive the slow months.</H1>
            <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "48ch", margin: "0 0 30px" }}>
              Short-term rental income swings with the season. We underwrite it the way it actually behaves — ADR × occupancy, month by month — not the peak-week screenshot. The number holds at closing.
            </Lead>
            <button onClick={() => onNavigate("str-underwriting")} style={{ background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "14px 26px", borderRadius: radius.sm, fontFamily: font.family }}>Underwrite my STR →</button>
          </div>
          <div style={{ background: dc.dark, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(18px,2.2vw,26px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: BLUE }}>Every month against the payment</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: shortMonths > 0 ? RED_ON_DARK : dc.emerald, fontFamily: dc.mono }}>
                {shortMonths === 0 ? "all 12 clear" : `${shortMonths} of 12 short`}
              </div>
            </div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ display: "block", overflow: "visible" }}
              role="img"
              aria-label={`Monthly short-term-rental revenue measured against a ${fmt$(pay)} payment. ${
                shortMonths === 0
                  ? "Every month covers the payment."
                  : `${shortMonths} of 12 months fall short: ${MONTHS_FULL.filter((_, i) => shortfalls[i] < 0).join(", ")}. Worst is ${MONTHS_FULL[worstIdx]} at ${fmt$(Math.abs(shortfalls[worstIdx]))} below.`
              }`}
            >
              {monthly.map((_, i) => {
                const d = shortfalls[i];
                const short = d < 0;
                const h = Math.max(1.5, Math.abs(Y(d) - baseY));
                return (
                  <g key={i}>
                    <rect
                      x={X(i) - barW / 2}
                      y={short ? baseY : baseY - h}
                      width={barW}
                      height={h}
                      rx={2}
                      fill={short ? RED_ON_DARK : BLUE}
                      fillOpacity={short ? 1 : i === peakIdx ? 1 : 0.55}
                    />
                    <text
                      x={X(i)}
                      y={H - 8}
                      textAnchor="middle"
                      fill={short ? RED_ON_DARK : "rgba(238,239,211,0.66)"}
                      fontSize="11"
                      fontWeight={short ? 700 : 500}
                      fontFamily={dc.mono}
                    >
                      {MONTHS[i]}
                    </text>
                  </g>
                );
              })}

              {/* The payment line is the axis, not a floating reference. Its label
                  sits at the left edge so it can never land on December's bar —
                  the old right-anchored label shared an x with the last point. */}
              <line x1={padL} x2={W - padR} y1={baseY} y2={baseY} stroke={dc.lemon} strokeWidth="1.5" />
              <text x={padL} y={baseY - 7} fill={dc.lemon} fontSize="10" fontWeight={700} fontFamily={dc.mono}>
                payment {fmt$(pay)}
              </text>

              {/* The worst month carries a number, so the depth of the trough is
                  readable rather than merely visible. */}
              {shortMonths > 0 && (
                <text
                  x={X(worstIdx)}
                  y={Y(shortfalls[worstIdx]) + 13}
                  textAnchor={worstIdx < 2 ? "start" : worstIdx > 9 ? "end" : "middle"}
                  fill={RED_ON_DARK}
                  fontSize="11"
                  fontWeight={700}
                  fontFamily={dc.mono}
                >
                  −{fmt$(Math.abs(shortfalls[worstIdx]))}
                </text>
              )}
              {maxUp > 0 && (
                <text
                  x={X(peakIdx)}
                  y={Y(shortfalls[peakIdx]) - 7}
                  textAnchor={peakIdx < 2 ? "start" : peakIdx > 9 ? "end" : "middle"}
                  fill={BLUE}
                  fontSize="11"
                  fontWeight={700}
                  fontFamily={dc.mono}
                >
                  +{fmt$(maxUp)}
                </text>
              )}
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
              <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 14px" }}><Mono style={{ fontSize: 20, fontWeight: 700, color: holds ? dc.emerald : RED_ON_DARK, display: "block" }}>{worstDSCR.toFixed(2)}x</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>worst-month DSCR</div></div>
              <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 14px" }}><Mono style={{ fontSize: 20, fontWeight: 700, color: shortMonths > 0 ? RED_ON_DARK : dc.emerald, display: "block" }}>{shortMonths}</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>months short</div></div>
              <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: radius.sm, padding: "12px 14px" }}><Mono style={{ fontSize: 20, fontWeight: 700, color: dc.cream, display: "block" }}>{avgDSCR.toFixed(2)}x</Mono><div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3 }}>year-round avg</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RIBBON */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,104px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>The revenue ribbon</div>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(22px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.04, margin: "0 0 10px", maxWidth: "20ch" }}>The deal has to survive February — not just July.</h2>
          <p className="gs-reveal" style={{ fontSize: 16, color: "rgba(238,239,211,0.6)", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.5 }}>Set your nightly rate and occupancy — scroll over the fields. Months under the lemon line don't cover the payment. We qualify on the trough, so there's no surprise at closing.</p>
          <div className="str-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 28, alignItems: "stretch" }}>
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: "1px solid rgba(238,239,211,0.16)", padding: "clamp(20px,2.4vw,28px)", display: "grid", gap: 16, alignContent: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: BLUE }}>The listing</div>
              {[{ l: "Average nightly rate (ADR)", n: numIn(adr, setAdr, 5, "$") }, { l: "Occupancy", n: numIn(occ, setOcc, 1, "", "%") }, { l: "Monthly payment (PITIA)", n: numIn(pay, setPay, 50, "$") }].map((f) => (
                <label key={f.l}><span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 6 }}>{f.l}</span>{f.n}</label>
              ))}
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>Seasonality models a summer-peak market. Real underwriting uses your market's AirDNA history.</div>
            </div>
            <div style={{ background: dc.teal, borderRadius: radius.lg, border: `1px solid ${holds ? "rgba(77,189,151,0.4)" : risk.dangerBorder}`, padding: "clamp(24px,3vw,40px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: holds ? dc.emerald : RED, marginBottom: 6 }}>{holds ? "Holds the slow months" : "Breaks in the off-season"}</div>
              <Mono style={{ fontSize: "clamp(30px,7vw,84px)", fontWeight: 700, color: holds ? dc.emerald : RED, lineHeight: 1 }}>{worstDSCR.toFixed(2)}x</Mono>
              <div style={{ fontSize: 15, color: "rgba(238,239,211,0.7)", marginTop: 14, lineHeight: 1.5, maxWidth: "46ch" }}>
                Worst month ({MONTHS_FULL[worstIdx]}) brings {fmt$(worst)} against a {fmt$(pay)} payment. {holds
                  ? "Even the trough covers the loan — that's a fundable STR."
                  : `${shortMonths === 1 ? "That month falls" : `${shortMonths} months fall`} short — lower the loan, or we underwrite to the months that do clear.`}
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
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 className="gs-reveal" style={{ fontSize: "clamp(21px,3.2vw,44px)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: dc.cream }}>STR income, underwritten honestly.</h2>
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
