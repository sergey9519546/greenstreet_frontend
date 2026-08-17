import React, { useState, useMemo } from "react";
import { DcShell, dc, Mono, CountUp, H1, H2, Lead, Eyebrow, Card } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
import { computeCommercialDscr } from "../engine/commercialDscr";
import { PremiumSlider } from "../components/PremiumUI";

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ── Shared tool-page chrome ───────────────────────────────────────────────────
// This page and ConstructionBridgePage are siblings: SAME hero treatment, SAME
// card system, SAME spacing scale. Any change here must be mirrored there.
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

// The underwriting chain, in the order the engine computes it. Every figure
// quoted here is the engine's own (30-yr amortization, 1.25x floor, the 35–45%
// commercial OpEx band from computeCommercialDscr's sanity warning).
const METHOD = [
  { n: "01", label: "Effective Gross Income", body: "Gross scheduled rent, less vacancy and collection loss." },
  { n: "02", label: "Net Operating Income", body: "EGI less operating expenses — taxes, insurance, management, maintenance, reserves." },
  { n: "03", label: "Debt service coverage", body: "Annual NOI divided by annual debt service on a 30-year amortization." },
  { n: "04", label: "Expense-ratio sanity", body: "OpEx as a share of EGI, checked against the 35–45% commercial norm." },
];

export default function CommercialDSCRPage({
  onBack,
  onNavigate = () => {},
}: {
  onBack: () => void;
  onNavigate?: (view: any) => void;
}) {
  React.useEffect(() => {
    document.title = "Commercial DSCR | Greenstreet Finance";
  }, []);

  // ── Inputs ──
  const [unitCount, setUnitCount] = useState(8);
  const [grossRent, setGrossRent] = useState(12000);
  const [vacancy, setVacancy] = useState(5);
  const [opex, setOpex] = useState(4000);
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [rate, setRate] = useState(7.5);

  // ── Engine ── (unchanged — same inputs, same fixed assumptions)
  const result = useMemo(() => {
    try {
      return computeCommercialDscr({
        unitCount,
        grossScheduledRentMonthly: grossRent,
        vacancyRatePct: vacancy,
        operatingExpensesMonthly: opex,
        loanAmount,
        interestRate: rate,
        amortizationYears: 30,
        minDscrFloor: 1.25,
      });
    } catch {
      return null;
    }
  }, [unitCount, grossRent, vacancy, opex, loanAmount, rate]);

  // ONE risk ramp: emerald (pass) → lemon (marginal) → risk.danger (fail).
  const verdictColor =
    result?.disposition === "FAIL" ? dc.risk.danger : result?.disposition === "MARGINAL" ? dc.lemon : dc.emerald;
  // Label-sized twin of verdictColor (lemon/emerald already clear AA at 11px).
  const verdictInk = result?.disposition === "FAIL" ? DANGER_TEXT : verdictColor;

  const verdictSentence = !result
    ? "Adjust the inputs — this combination can't be underwritten."
    : result.disposition === "PASS"
    ? "This deal clears the 1.25x commercial floor."
    : result.disposition === "MARGINAL"
    ? "This deal covers its debt service but sits under the 1.25x floor."
    : "This deal does not cover its debt service.";

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
      <section style={{ background: dc.dark, color: dc.cream, padding: PAD_HERO }}>
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
                Tools · Commercial 5+ unit
              </Eyebrow>
              <H1 style={{ margin: "0 0 22px", maxWidth: "16ch" }}>Commercial 5+ Unit DSCR</H1>
              <Lead style={{ color: dc.ink.dim, maxWidth: "52ch", margin: "0 0 16px" }}>
                Analyze multifamily underwriting economics. Calculates Effective Gross Income (EGI), Net Operating
                Income (NOI), and verifies expense-ratio minimums.
              </Lead>
              <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.55, color: dc.ink.secondary, margin: 0, maxWidth: "52ch" }}>
                How to use: set the rent roll, vacancy and operating expenses on the left, then size the loan. The
                coverage verdict and the income statement update as you type.
              </p>
            </div>

            {/* Right — the METHOD, not a second copy of the result. The live
                figures live in one place only (the tool band below). */}
            <Card tone="raised" pad="clamp(24px,2.6vw,34px)">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 18,
                  borderRadius: dc.r.md,
                  overflow: "hidden",
                }}
              >
                <div style={{ background: "#f7f6f0", borderRadius: dc.r.sm, overflow: "hidden", border: "1px solid rgba(238,239,211,0.12)" }}>
                  <img src="/img/properties/multifamily_brownstone.jpg" alt="Commercial Multi-Family Line Art" style={{ width: "100%", height: 110, objectFit: "cover" }} />
                  <div style={{ fontSize: 10, fontWeight: 700, textAlign: "center", padding: "4px 0", color: "#003738", background: "#f7f6f0" }}>5+ Unit Multi-Family</div>
                </div>
                <div style={{ background: "#f7f6f0", borderRadius: dc.r.sm, overflow: "hidden", border: "1px solid rgba(238,239,211,0.12)" }}>
                  <img src="/img/properties/mixed_use_storefront.jpg" alt="Mixed-Use Retail Storefront Line Art" style={{ width: "100%", height: 110, objectFit: "cover" }} />
                  <div style={{ fontSize: 10, fontWeight: 700, textAlign: "center", padding: "4px 0", color: "#003738", background: "#f7f6f0" }}>Mixed-Use Commercial</div>
                </div>
              </div>
              <Eyebrow style={{ marginBottom: 14 }}>How the number is built</Eyebrow>
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
            <div aria-live="polite" aria-atomic="true">
              <H2 style={{ margin: "0 0 10px", color: dc.cream }}>{verdictSentence}</H2>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: dc.ink.secondary, margin: 0, letterSpacing: dc.tracking.snug }}>
              {unitCount} units · {fmt$(grossRent)}/mo gross scheduled rent · {fmt$(loanAmount)} at {rate}%.
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

                <ControlGroupLabel>Income &amp; operations</ControlGroupLabel>
                <div className="tp-sliders">
                  <PremiumSlider label="Unit Count" value={unitCount} min={5} max={50} step={1} onChange={setUnitCount} />
                  <PremiumSlider label="Gross Scheduled Rent /mo" value={grossRent} min={4000} max={50000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setGrossRent} />
                  <PremiumSlider label="Vacancy & Collection Loss %" value={vacancy} min={3} max={15} step={0.5} formatValue={(v) => `${v}%`} onChange={setVacancy} />
                  <PremiumSlider label="Operating Expenses /mo" value={opex} min={1000} max={20000} step={100} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setOpex} />
                </div>

                <div style={{ height: 1, background: dc.border, margin: "26px 0" }} />

                <ControlGroupLabel>Debt</ControlGroupLabel>
                <div className="tp-sliders">
                  <PremiumSlider label="Target Loan Amount" value={loanAmount} min={500000} max={5000000} step={50000} formatValue={(v) => `$${v.toLocaleString()}`} onChange={setLoanAmount} />
                  <PremiumSlider label="Interest Rate" value={rate} min={5.0} max={10.0} step={0.125} formatValue={(v) => `${v}%`} onChange={setRate} />
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 26,
                    background: "transparent",
                  }}
                >
                  <div style={{ background: dc.panel, borderRadius: dc.r.md, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: dc.tracking.caps, textTransform: "uppercase", color: dc.rain, marginBottom: 5 }}>
                      Held fixed
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: dc.light }}>
                      30-year amortization · 1.25x minimum DSCR floor
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RESULTS — dark cards on the dark band ── */}
            <div className="dc-results-first" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {result ? (
                <>
                  <Card tone="raised" pad="clamp(24px,2.6vw,32px)">
                    <Eyebrow style={{ marginBottom: 14 }}>Underwriting conclusion</Eyebrow>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
                      <CountUp
                        value={result.dscr}
                        decimals={2}
                        suffix="x"
                        style={{ fontSize: "clamp(26px,4.4vw,54px)", fontWeight: 800, color: verdictColor, lineHeight: 1, letterSpacing: dc.tracking.tight }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, color: dc.ink.secondary }}>DSCR</span>
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
                        {result.disposition}
                      </span>
                    </div>

                    <Meter
                      fillPct={(result.dscr / 2) * 100}
                      color={verdictColor}
                      markerPct={62.5}
                      scaleLabel="0.00x"
                      markerLabel="1.25x floor"
                    />

                    {result.noiSanity.isUnderstatedOpEx && (
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
                          OpEx sanity warning
                        </div>
                        <div style={{ fontSize: 13, color: dc.ink.dim, lineHeight: 1.55 }}>{result.noiSanity.warningMessage}</div>
                      </div>
                    )}
                  </Card>

                  <Card tone="subtle" pad="clamp(22px,2.4vw,30px)" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Eyebrow style={{ marginBottom: 16 }}>Monthly income statement</Eyebrow>

                    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                      <Row
                        label="Effective Gross Income (EGI)"
                        value={<Mono style={{ color: dc.cream }}>{fmt$(result.effectiveGrossIncomeMonthly)}/mo</Mono>}
                      />
                      <Row label="Operating Expenses" value={<Mono style={{ color: dc.cream }}>{fmt$(opex)}/mo</Mono>} />
                      <div style={{ height: 1, background: CREAM_RULE, margin: "3px 0" }} />
                      <Row
                        label="Net Operating Income (NOI)"
                        strong
                        value={<Mono style={{ color: dc.lemon, fontWeight: 700 }}>{fmt$(result.noiMonthly)}/mo</Mono>}
                      />
                      <Row label="Annual Debt Service" value={<Mono style={{ color: dc.cream }}>{fmt$(result.debtServiceAnnual)}/yr</Mono>} />
                    </div>

                    {/* Expense ratio — a DIFFERENT metric from the coverage meter
                        above, so no visualization is repeated on this page. */}
                    <div style={{ marginTop: "auto", paddingTop: 26 }}>
                      <Row
                        label="Expense ratio"
                        value={
                          <Mono style={{ color: result.noiSanity.isUnderstatedOpEx ? DANGER_TEXT : dc.cream, fontWeight: 700 }}>
                            {result.noiSanity.expenseRatioPct.toFixed(1)}%
                          </Mono>
                        }
                      />
                      <div style={{ marginTop: 12 }}>
                        <Meter
                          fillPct={(result.noiSanity.expenseRatioPct / 60) * 100}
                          color={result.noiSanity.isUnderstatedOpEx ? dc.risk.danger : dc.emerald}
                          markerPct={(35 / 60) * 100}
                          scaleLabel="0%"
                          markerLabel="35–45% commercial norm"
                        />
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <Card tone="raised" pad="clamp(24px,2.6vw,32px)" style={{ flex: 1 }}>
                  <Eyebrow style={{ marginBottom: 12 }}>Underwriting conclusion</Eyebrow>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: dc.ink.dim, margin: 0 }}>
                    This combination of inputs can&apos;t be underwritten. Adjust the rent roll, expenses or loan amount
                    on the left.
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
                body: "Debt service is sized on a 30-year amortization and measured against a 1.25x minimum DSCR floor. Vacancy, expenses and rate are yours to set.",
              },
              {
                title: "Expense-ratio check",
                body: "Commercial 5+ unit properties typically require 35–45% OpEx. Below 30% the tool flags the file so tax, insurance, management and reserve line items get verified.",
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
