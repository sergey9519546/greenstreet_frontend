import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, CountUp, H1, H2, Lead, Eyebrow, Card } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { computeConstructionBridge } from "../engine/constructionBridge";
import { PremiumSlider } from "../components/PremiumUI";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── Shared tool-page chrome ───────────────────────────────────────────────────
// This page and CommercialDSCRPage are siblings: SAME hero treatment, SAME card
// system, SAME spacing scale. Any change here must be mirrored there.
//
// Band rhythm follows the shipping house pattern (LenderIntelPage):
//   hero (teal) → tool (midnight) → notes (mint, light) → BottomCTA (midnight)
// so no two adjacent bands share a ground colour.
const PAD_HERO = `clamp(48px,6.5vh,88px) ${dc.pad}`;
const PAD_TOOL = `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,120px)`;
const PAD_NOTES = `clamp(48px,6vw,80px) ${dc.pad}`;
const SPLIT_GAP = "clamp(20px,2.4vw,32px)";

// On-dark tints. These are dc.cream (#eeefd3) carried at low alpha — the exact
// track/rule values the shipping house pages already use on the dark ground.
// No new colour enters the system.
const CREAM_TRACK = "rgba(238,239,211,0.10)";
const CREAM_RULE = "rgba(238,239,211,0.16)";

// SAME risk ramp, on-dark pair. dc.risk.danger (#e06363) is correct for large
// figures, meter fills and borders — all clear the 3:1 UI/large-text bar on the
// dark ground. At label sizes it only measures ~3.4:1, and AA wants 4.5:1 under
// 18.66px, so small danger TEXT uses the ramp's designated dark-ground tint.
const DANGER_TEXT = dc.risk.dangerOnDark;

/** Ledger row on the dark ground. Label uses the on-dark ink ladder (dc.ink.*),
 *  never dc.muted/dc.light — those are the ON-LIGHT values and would vanish. */
function Row({ label, value, strong = false }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, fontSize: 14 }}>
      <span style={{ color: strong ? dc.ink.primary : dc.ink.secondary, fontWeight: strong ? 600 : 500, letterSpacing: dc.tracking.snug }}>
        {label}
      </span>
      {value}
    </div>
  );
}

/** Horizontal ratio meter: track + fill + a threshold tick. Width transitions on
 *  input change only — finite, interaction-driven, no infinite animation. */
function Meter({
  fillPct,
  color,
  markerPct,
  scaleLabel,
  markerLabel,
}: {
  fillPct: number;
  color: string;
  markerPct: number;
  scaleLabel: string;
  markerLabel: string;
}) {
  const w = Math.max(0, Math.min(100, fillPct));
  return (
    <div>
      <div style={{ position: "relative", height: 8, borderRadius: dc.r.pill, background: CREAM_TRACK }}>
        <div
          style={{
            height: "100%",
            width: `${w}%`,
            background: color,
            borderRadius: dc.r.pill,
            transition: "width .45s cubic-bezier(.16,.84,.44,1), background-color .3s",
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            left: `${Math.max(0, Math.min(100, markerPct))}%`,
            width: 2,
            borderRadius: 1,
            background: dc.cream,
            opacity: 0.6,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 8,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: dc.tracking.wide,
          color: dc.ink.secondary,
        }}
      >
        <span>{scaleLabel}</span>
        <span>{markerLabel}</span>
      </div>
    </div>
  );
}

/** Section label inside the light controls card. On a light surface the on-LIGHT
 *  ink ladder applies: dc.rain for the label, dc.light for body. */
function ControlGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: dc.tracking.caps,
        textTransform: "uppercase",
        color: dc.rain,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

// The carry/exit chain, in the order the engine computes it. Every figure quoted
// here is the engine's own (50% average draw, 30-year takeout, 1.00x exit floor).
const METHOD = [
  { n: "01", label: "Loan to Cost", body: "Bridge loan amount over total project cost — land, hard costs and soft costs." },
  { n: "02", label: "Interest reserve", body: "Interest-only on the average 50% draw, carried across the construction term." },
  { n: "03", label: "Exit DSCR", body: "Projected stabilized rent over the takeout payment plus escrows, on a 30-year amortization." },
  { n: "04", label: "Takeout test", body: "The permanent loan must retire the bridge note at a 1.00x DSCR floor." },
];

export default function ConstructionBridgePage({
  onBack,
  onNavigate = () => {},
}: {
  onBack: () => void;
  onNavigate?: (view: any) => void;
}) {
  React.useEffect(() => {
    document.title = "Construction & Bridge Carry | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [projectCost, setProjectCost] = useState(1000000);
  const [loanAmount, setLoanAmount] = useState(750000);
  const [bridgeRate, setBridgeRate] = useState(10.5);
  const [months, setMonths] = useState(12);
  const [stabilizedRent, setStabilizedRent] = useState(9000);
  const [stabilizedEscrows, setStabilizedEscrows] = useState(1200);
  const [exitRate, setExitRate] = useState(7.0);

  // ── Engine ── (unchanged — same inputs, same fixed assumptions)
  const result = useMemo(() => {
    try {
      return computeConstructionBridge({
        totalProjectCost: projectCost,
        loanAmount,
        bridgeRate,
        constructionMonths: months,
        avgDrawFraction: 0.5,
        stabilizedRentMonthly: stabilizedRent,
        stabilizedEscrowsMonthly: stabilizedEscrows,
        exitRate,
      });
    } catch {
      return null;
    }
  }, [projectCost, loanAmount, bridgeRate, months, stabilizedRent, stabilizedEscrows, exitRate]);

  // ONE risk ramp: emerald (viable) → lemon (tight) → risk.danger (shortfall).
  const verdictColor =
    result?.viability === "SHORTFALL" ? dc.risk.danger : result?.viability === "TIGHT" ? dc.lemon : dc.emerald;
  // Label-sized twin of verdictColor (lemon/emerald already clear AA at 11px).
  const verdictInk = result?.viability === "SHORTFALL" ? DANGER_TEXT : verdictColor;

  const verdictSentence = !result
    ? "Adjust the inputs — this combination can't be underwritten."
    : result.viability === "VIABLE"
    ? "The permanent takeout retires the bridge note."
    : result.viability === "TIGHT"
    ? "The takeout works, but there is almost no cushion."
    : "The takeout falls short of retiring the bridge note.";

  return (
    <DcShell onNavigate={onNavigate} accent={dc.teal}>
      <style>{`
        /* PremiumSlider bakes in a 24px bottom margin — drop it on the last
           control of each group so the light card keeps an even rhythm. */
        .tp-sliders > div:last-child{margin-bottom:0 !important;}
        .tp-back{background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;gap:8px;
                 font-family:${dc.sans};font-size:13px;font-weight:600;letter-spacing:-0.01em;
                 color:${dc.ink.secondary};min-height:44px;transition:color .15s;}
        .tp-back:hover{color:${dc.ink.primary};}
        .tp-back:focus-visible{outline:2px solid ${dc.lemon};outline-offset:3px;border-radius:6px;}
        @media (max-width:991px){.tp-hero,.tp-split,.tp-notes{grid-template-columns:1fr !important;}}
      `}</style>

      {/* ── HERO — dark teal band. The page ships its OWN dark ground; it no
             longer leans on DcShell's pistachio shell. ── */}
      <section style={{ background: dc.teal, color: dc.cream, padding: PAD_HERO }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Real back affordance, wired to the onBack prop (was dead). */}
          <button type="button" className="tp-back" onClick={onBack} style={{ marginBottom: 24 }}>
            <span aria-hidden="true">←</span> Back to home
          </button>

          <div
            id="gs-hero-content"
            className="tp-hero dc-hero"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}
          >
            {/* Left — identity + copy */}
            <div>
              <Eyebrow color={dc.lemon} style={{ marginBottom: 18 }}>
                Tools · Construction &amp; bridge
              </Eyebrow>
              <H1 style={{ margin: "0 0 22px", maxWidth: "16ch" }}>Construction &amp; Bridge Carry</H1>
              <Lead style={{ color: dc.ink.dim, maxWidth: "52ch", margin: "0 0 16px" }}>
                Analyze short-term carry costs and exit viability. Calculates progressive-draw interest reserves and
                ensures the permanent takeout loan can retire the bridge note.
              </Lead>
              <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, color: dc.ink.secondary, margin: 0, maxWidth: "52ch" }}>
                How to use: size the build and the bridge note on the left, then project the stabilized rent and the
                takeout rate. The exit verdict and the carry ledger update as you type.
              </p>
            </div>

            {/* Right — the METHOD, not a second copy of the result. The live
                figures live in one place only (the tool band below). */}
            <Card tone="raised" pad="clamp(24px,2.6vw,34px)">
              <Eyebrow style={{ marginBottom: 18 }}>How the number is built</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {METHOD.map((m) => (
                  <div key={m.n} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 14, alignItems: "start" }}>
                    <Mono style={{ fontSize: 12, fontWeight: 700, color: dc.emerald, lineHeight: 1.6 }}>{m.n}</Mono>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: dc.cream, letterSpacing: dc.tracking.snug }}>{m.label}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: dc.ink.secondary, marginTop: 3 }}>{m.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── TOOL — midnight band, symmetric 1fr 1fr split ── */}
      <section style={{ background: dc.dark, color: dc.cream, padding: PAD_TOOL }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 36, maxWidth: "62ch" }}>
            <Eyebrow color={dc.lemon} style={{ marginBottom: 12 }}>
              Live underwriting
            </Eyebrow>
            <H2 style={{ margin: "0 0 10px", color: dc.cream }}>{verdictSentence}</H2>
            <p style={{ fontSize: 15, fontWeight: 500, color: dc.ink.secondary, margin: 0, letterSpacing: dc.tracking.snug }}>
              {fmt$(loanAmount)} bridge at {bridgeRate}% over {months} months · {fmt$(projectCost)} total project cost.
            </p>
          </div>

          {/* Equal columns. Both are flex stacks whose LAST card grows, so the
              two columns always finish flush — no ragged short column. */}
          <div
            className="tp-split dc-split gs-reveal"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPLIT_GAP, alignItems: "stretch" }}
          >
            {/* ── CONTROLS — deliberately a LIGHT card on the dark band. ──
                PremiumSlider hardcodes dark ink (swatch.rainforest label,
                swatch.midnight value) and cannot be recoloured from here, so it
                is only legible on a light surface. Rather than fight it, the
                controls read as the worksheet: white card, on-light ink ladder,
                dc.border hairlines. Measured: label 6.9:1, value 13.1:1. */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  flex: 1,
                  background: dc.card,
                  border: `1px solid ${dc.border}`,
                  borderRadius: dc.r.lg,
                  padding: "clamp(24px,2.6vw,34px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: 26 }}>
                  <Eyebrow color={dc.rain} style={{ marginBottom: 8 }}>
                    Deal inputs
                  </Eyebrow>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: dc.muted, margin: 0 }}>
                    Everything recalculates as you drag — nothing to submit.
                  </p>
                </div>

                <ControlGroupLabel>Construction phase</ControlGroupLabel>
                <div className="tp-sliders">
                  <PremiumSlider label="Total Project Cost (LTC Basis)" value={projectCost} min={200000} max={5000000} step={10000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setProjectCost} />
                  <PremiumSlider label="Bridge Loan Amount" value={loanAmount} min={100000} max={4000000} step={10000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setLoanAmount} />
                  <PremiumSlider label="Bridge Note Rate (IO)" value={bridgeRate} min={8.0} max={15.0} step={0.25} formatValue={(v) => `${v}%`} onChange={setBridgeRate} />
                  <PremiumSlider label="Construction Term (Months)" value={months} min={6} max={24} step={1} onChange={setMonths} />
                </div>

                <div style={{ height: 1, background: dc.border, margin: "26px 0" }} />

                <ControlGroupLabel>Stabilized exit</ControlGroupLabel>
                <div className="tp-sliders">
                  <PremiumSlider label="Projected Stabilized Rent" value={stabilizedRent} min={1000} max={30000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setStabilizedRent} />
                  <PremiumSlider label="Stabilized Escrows (Tax/Ins/HOA)" value={stabilizedEscrows} min={100} max={5000} step={50} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setStabilizedEscrows} />
                  <PremiumSlider label="Exit Takeout Rate" value={exitRate} min={5.0} max={9.0} step={0.125} formatValue={(v) => `${v}%`} onChange={setExitRate} />
                </div>

                <div style={{ marginTop: "auto", paddingTop: 26 }}>
                  <div style={{ background: dc.panel, borderRadius: dc.r.md, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: dc.tracking.caps, textTransform: "uppercase", color: dc.rain, marginBottom: 5 }}>
                      Held fixed
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: dc.light }}>
                      50% average draw · 30-year takeout amortization · 1.00x exit DSCR floor
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RESULTS — dark cards on the dark band ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {result ? (
                <>
                  <Card tone="raised" pad="clamp(24px,2.6vw,32px)">
                    <Eyebrow style={{ marginBottom: 14 }}>Exit takeout viability</Eyebrow>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
                      <CountUp
                        value={result.exitDscr}
                        decimals={2}
                        suffix="x"
                        style={{ fontSize: "clamp(40px,4.4vw,54px)", fontWeight: 800, color: verdictColor, lineHeight: 1, letterSpacing: dc.tracking.tight }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: dc.ink.secondary }}>Stabilized DSCR</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: dc.tracking.caps,
                          textTransform: "uppercase",
                          color: verdictInk,
                          border: `1px solid ${verdictInk}`,
                          borderRadius: dc.r.pill,
                          padding: "5px 12px",
                        }}
                      >
                        {result.viability}
                      </span>
                    </div>

                    <Meter
                      fillPct={(result.exitDscr / 2) * 100}
                      color={verdictColor}
                      markerPct={50}
                      scaleLabel="0.00x"
                      markerLabel="1.00x floor"
                    />

                    <div style={{ height: 1, background: CREAM_RULE, margin: "20px 0 16px" }} />

                    <Row
                      label="Takeout retires bridge?"
                      strong
                      value={
                        <Mono style={{ color: result.takeoutRetiresBridge ? dc.emerald : DANGER_TEXT, fontWeight: 700 }}>
                          {result.takeoutRetiresBridge ? "YES" : "NO"}
                        </Mono>
                      }
                    />

                    {result.viability === "SHORTFALL" && (
                      <div
                        style={{
                          marginTop: 22,
                          // No tint fill: over dangerBg the label tint lands at
                          // 4.3:1, under AA. Bordered callout on the card ground
                          // reads just as clearly and measures 4.7:1.
                          borderWidth: "1px 1px 1px 3px",
                          borderStyle: "solid",
                          borderColor: dc.risk.dangerBorder,
                          borderLeftColor: dc.risk.danger,
                          borderRadius: `0 ${dc.r.sm} ${dc.r.sm} 0`,
                          padding: 16,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: dc.tracking.caps, color: DANGER_TEXT, textTransform: "uppercase", marginBottom: 6 }}>
                          Exit shortfall
                        </div>
                        <div style={{ fontSize: 13, color: dc.ink.dim, lineHeight: 1.55 }}>
                          The projected stabilized rent cannot support a takeout loan large enough to retire the bridge
                          note at a 1.00x DSCR floor. Cash-in will be required at refinance.
                        </div>
                      </div>
                    )}
                  </Card>

                  <Card tone="subtle" pad="clamp(22px,2.4vw,30px)" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Eyebrow style={{ marginBottom: 16 }}>Bridge carry &amp; LTC</Eyebrow>

                    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                      <Row
                        label="Peak IO payment (100% drawn)"
                        value={<Mono style={{ color: dc.cream }}>{fmt$(result.monthlyIOPaymentFull)}/mo</Mono>}
                      />
                      <Row label="Takeout payment + escrows" value={<Mono style={{ color: dc.cream }}>{fmt$(result.exitPitia)}/mo</Mono>} />
                      <div style={{ height: 1, background: CREAM_RULE, margin: "3px 0" }} />
                      <Row
                        label="Required interest reserve"
                        strong
                        value={<Mono style={{ color: dc.lemon, fontWeight: 700 }}>{fmt$(result.interestReserveNeeded)}</Mono>}
                      />
                      <div style={{ fontSize: 12, color: dc.ink.secondary, textAlign: "right", lineHeight: 1.5 }}>
                        Assumes 50% avg draw over {months} months
                      </div>
                    </div>

                    {/* Loan to Cost — a DIFFERENT metric from the coverage meter
                        above, so no visualization is repeated on this page. */}
                    <div style={{ marginTop: "auto", paddingTop: 26 }}>
                      <Row
                        label="Loan to Cost (LTC)"
                        value={
                          <Mono style={{ color: result.ltcPct > 85 ? DANGER_TEXT : dc.cream, fontWeight: 700 }}>
                            {result.ltcPct.toFixed(1)}%
                          </Mono>
                        }
                      />
                      <div style={{ marginTop: 12 }}>
                        <Meter
                          fillPct={result.ltcPct}
                          color={result.ltcPct > 85 ? dc.risk.danger : dc.emerald}
                          markerPct={85}
                          scaleLabel="0%"
                          markerLabel="85% ceiling"
                        />
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <Card tone="raised" pad="clamp(24px,2.6vw,32px)" style={{ flex: 1 }}>
                  <Eyebrow style={{ marginBottom: 12 }}>Exit takeout viability</Eyebrow>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: dc.ink.dim, margin: 0 }}>
                    This combination of inputs can&apos;t be underwritten. Adjust the project cost, bridge note or
                    stabilized rent on the left.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── NOTES — light band. Breaks the dark run before BottomCTA and gives
             the fixed assumptions and the disclaimer a home. ── */}
      <section style={{ background: dc.mintBg, color: dc.light, padding: PAD_NOTES }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <Eyebrow color={dc.rain} style={{ marginBottom: 22 }}>
            Assumptions &amp; limits
          </Eyebrow>
          <div className="tp-notes dc-band-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: SPLIT_GAP }}>
            {[
              {
                title: "Held fixed",
                body: "The interest reserve assumes a 50% average draw across the term. The takeout is sized to the bridge amount on a 30-year amortization and measured against a 1.00x exit DSCR floor.",
              },
              {
                title: "Carry, not cash flow",
                body: "Construction and bridge debt carries no day-one rent. The reserve is what the note costs before the property earns anything.",
              },
              {
                title: "Not a commitment",
                body: "Indicative only, and subject to full underwriting. Not a rate lock or credit approval.",
              },
            ].map((n) => (
              <div key={n.title}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dc.light, marginBottom: 8, letterSpacing: dc.tracking.snug }}>{n.title}</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: dc.light, margin: 0, opacity: 0.86 }}>{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
