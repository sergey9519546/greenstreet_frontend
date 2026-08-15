import React, { useState, useMemo, useEffect } from "react";
import { DcShell, dc, Mono, useRevealOnView, H1, Lead, Btn } from "../design/dc";
import { RiskFlame, riskFromDscr } from "../design/artifacts";
import {
  DEFAULT_ARM_PROGRAMS,
  buildARMSchedule,
} from "../engine/armResetEngine";
import { calculatePI } from "../engine/engine";
import { summarizeByYear } from "../engine/amortization";
import { computeRefiProceedsGap } from "../engine/refiProceeds";
import type { ARMTerms, ARMIndex } from "../engine/types";
import BottomCTA from "../design/BottomCTA";
import DataVintageLine from "../design/DataVintageLine";
import { risk } from "../theme";

// ── helpers ───────────────────────────────────────────────────────────────────

type ArmType = "5_6_ARM" | "7_6_ARM" | "10_6_ARM";

const INDEX_LABELS: Record<ARMIndex, string> = {
  SOFR_30D: "30-Day SOFR",
  SOFR_30D_AVG: "30-Day SOFR (avg)",
  TREASURY_5YR: "5yr Treasury",
  TREASURY_10YR: "10yr Treasury",
};

// Bearish and Crisis used to carry raw hex (#ff8c42, #c0392b) — a bright
// orange in the #f97316 family the palette exists to keep out, and an
// ungoverned dark red with no token behind it. The ramp only defines four
// tiers (positive/caution/warning/danger), so a 5-scenario escalation from
// Bullish to Crisis has to double up at the top: Stress and Crisis both read
// risk.danger — the label and SOFR% still tell them apart.
const SOFR_SCENARIOS: { label: string; sofr: number; color: string }[] = [
  { label: "Bullish",  sofr: 2.59, color: dc.emerald },
  { label: "Base",     sofr: 3.59, color: dc.lemon },
  { label: "Bearish",  sofr: 4.59, color: risk.warning },
  { label: "Stress",   sofr: 5.00, color: risk.danger },
  { label: "Crisis",   sofr: 7.00, color: risk.danger },
];

const fmt$ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const miniLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  color: "rgba(238,239,211,0.62)",
  marginBottom: 4,
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const miniInputStyle: React.CSSProperties = {
  width: "100%",
  background: dc.teal,
  border: `1px solid ${dc.faded}`,
  borderRadius: dc.r.sm,
  padding: "9px 10px",
  fontSize: 13,
};

const selStyle: React.CSSProperties = {
  width: "100%",
  background: dc.teal,
  border: `1px solid ${dc.faded}`,
  borderRadius: dc.r.sm,
  padding: "10px 10px",
  fontSize: 13,
  fontWeight: 600,
  color: dc.cream,
  fontFamily: dc.sans,
  cursor: "pointer",
};

function shockColor(pct: number): string {
  if (pct > 20) return risk.danger;
  if (pct > 8)  return dc.lemon;
  return dc.emerald;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ARMPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate?: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "What Happens When My ARM Resets? | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Payment-jump bars reveal on scroll-in (state-driven transition, never stuck)
  const [jumpRef, jumpShown] = useRevealOnView<HTMLDivElement>();

  // Inputs — ARM type picks sane defaults; every field below is independently
  // editable, because a preset program is not this borrower's actual note.
  const [armType, setArmType] = useState<ArmType>("5_6_ARM");
  const [index, setIndex] = useState<ARMIndex>(DEFAULT_ARM_PROGRAMS["5_6_ARM"].index);
  const [initialRate, setInitialRate] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].initialRate);
  const [marginPct, setMarginPct] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].marginPct);
  const [initialCapPct, setInitialCapPct] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].initialCapPct);
  const [periodicCapPct, setPeriodicCapPct] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].periodicCapPct);
  const [lifetimeCapPct, setLifetimeCapPct] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].lifetimeCapPct);
  const [floorRate, setFloorRate] = useState(DEFAULT_ARM_PROGRAMS["5_6_ARM"].floorRate);
  const [ioMonths, setIoMonths] = useState(0);
  const [originationDate, setOriginationDate] = useState("");
  const [loanAmount, setLoanAmount]     = useState(340000);
  const [monthlyRent, setMonthlyRent]   = useState(3000);
  const [pitiaNonDebt, setPitiaNonDebt] = useState(750);

  // Selecting a program prefills the note terms; the borrower's actual index,
  // margin, caps, floor and IO period stay editable afterward.
  const selectArmType = (t: ArmType) => {
    const cfg = DEFAULT_ARM_PROGRAMS[t];
    setArmType(t);
    setIndex(cfg.index);
    setInitialRate(cfg.initialRate);
    setMarginPct(cfg.marginPct);
    setInitialCapPct(cfg.initialCapPct);
    setPeriodicCapPct(cfg.periodicCapPct);
    setLifetimeCapPct(cfg.lifetimeCapPct);
    setFloorRate(cfg.floorRate);
  };

  // Hand-off from the DSCR Calculator's "Rate type" selector. Read once, then
  // cleared, so a later direct visit to this page gets the ordinary defaults
  // rather than a stale deal from a previous session. sessionStorage, not the
  // router: the router carries no query-string state (`goTo` takes only a
  // route name), and adding that plumbing for one handoff was worse than this.
  useEffect(() => {
    let raw: string | null = null;
    try { raw = sessionStorage.getItem('gs:arm-prefill'); } catch { /* storage may be blocked */ }
    if (!raw) return;
    try { sessionStorage.removeItem('gs:arm-prefill'); } catch { /* ignore */ }
    try {
      const p = JSON.parse(raw) as {
        loanAmount?: number; initialRate?: number; armType?: ArmType;
        monthlyRent?: number; pitiaNonDebt?: number;
      };
      if (p.armType && p.armType in DEFAULT_ARM_PROGRAMS) selectArmType(p.armType);
      if (Number.isFinite(p.loanAmount) && (p.loanAmount as number) > 0) setLoanAmount(p.loanAmount as number);
      if (Number.isFinite(p.initialRate) && (p.initialRate as number) > 0) setInitialRate(p.initialRate as number);
      if (Number.isFinite(p.monthlyRent) && (p.monthlyRent as number) >= 0) setMonthlyRent(p.monthlyRent as number);
      if (Number.isFinite(p.pitiaNonDebt) && (p.pitiaNonDebt as number) >= 0) setPitiaNonDebt(p.pitiaNonDebt as number);
    } catch { /* malformed payload — ignore, keep the ordinary defaults */ }
    // Mount-only: this is a one-shot hand-off, not a live sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TERM_MONTHS = 360;

  // Derived from engine — every number below comes from buildARMSchedule, the
  // shared kernel-backed schedule (IO -> amortizing transition + every capped
  // reset, re-amortized on the CURRENT balance). Fail closed: an unusable
  // input produces no result rather than a schedule built on a guessed default.
  const result = useMemo(() => {
    const fixedMonths = DEFAULT_ARM_PROGRAMS[armType].fixedPeriodMonths;
    const resetFrequencyMonths = DEFAULT_ARM_PROGRAMS[armType].resetFrequencyMonths;

    const inputsValid =
      Number.isFinite(loanAmount) && loanAmount > 0 &&
      Number.isFinite(monthlyRent) && monthlyRent >= 0 &&
      Number.isFinite(pitiaNonDebt) && pitiaNonDebt >= 0 &&
      Number.isFinite(initialRate) && initialRate > 0 &&
      Number.isFinite(marginPct) && marginPct >= 0 &&
      Number.isFinite(initialCapPct) && initialCapPct >= 0 &&
      Number.isFinite(periodicCapPct) && periodicCapPct >= 0 &&
      Number.isFinite(lifetimeCapPct) && lifetimeCapPct >= 0 &&
      Number.isFinite(floorRate) && floorRate > 0 &&
      Number.isFinite(ioMonths) && ioMonths >= 0 && ioMonths < TERM_MONTHS;

    if (!inputsValid) return null;

    try {
      const cfg: ARMTerms = {
        armType,
        index,
        marginPct,
        initialRate,
        initialCapPct,
        periodicCapPct,
        lifetimeCapPct,
        floorRate,
        fixedPeriodMonths: fixedMonths,
        resetFrequencyMonths,
      };
      const firstResetYear = fixedMonths / 12;
      const fixedYears = fixedMonths / 12;
      const originDate = originationDate || undefined;

      const scenarios = SOFR_SCENARIOS.map((sc) => {
        const armSchedule = buildARMSchedule({
          loanAmount,
          armTerms: cfg,
          termMonths: TERM_MONTHS,
          ioMonths,
          sustainedIndexPct: sc.sofr,
          originationDate: originDate,
        });
        const firstReset = armSchedule.resets[0] ?? null;
        const lastReset = armSchedule.resets[armSchedule.resets.length - 1] ?? null;

        const piAtFirst = firstReset ? firstReset.paymentAfter : armSchedule.schedule.rows[0].payment;
        const dscrAtFirst = piAtFirst > 0 ? monthlyRent / (piAtFirst + pitiaNonDebt) : 0;

        const piAtLast = lastReset ? lastReset.paymentAfter : piAtFirst;
        const dscrAtLast = piAtLast > 0 ? monthlyRent / (piAtLast + pitiaNonDebt) : 0;

        return {
          ...sc,
          armSchedule,
          ladder: armSchedule.ladder,
          firstReset: firstReset
            ? { rate: firstReset.ratePct, capBinding: firstReset.capBinding }
            : null,
          lastReset: lastReset
            ? { rate: lastReset.ratePct, capBinding: lastReset.capBinding }
            : null,
          piAtFirst,
          dscrAtFirst,
          piAtLast,
          dscrAtLast,
        };
      });

      const base = scenarios.find((s) => s.label === "Base")!;
      const bearish = scenarios.find((s) => s.label === "Bearish")!;
      const crisis = scenarios.find((s) => s.label === "Crisis")!;

      const piInitial = base.armSchedule.schedule.rows[0].payment;

      // Worst realistic first-reset payment/rate across the 5 scenarios — the
      // scenario whose index+margin pushes hardest against the first-reset cap.
      const worstFirstResetScenario = scenarios.reduce((worst, s) =>
        (s.piAtFirst > worst.piAtFirst ? s : worst), scenarios[0]);
      const piAtWorstFirstReset = worstFirstResetScenario.piAtFirst;
      const worstFirstResetRate = worstFirstResetScenario.firstReset?.rate ?? cfg.initialRate;
      const paymentShockPct =
        piInitial > 0 ? ((piAtWorstFirstReset - piInitial) / piInitial) * 100 : 0;

      // Structural ceiling — initial + lifetime cap — priced on the REAL balance
      // and remaining term at first reset (from the schedule, so it respects the
      // IO period), not a re-derived closed-form balance.
      const firstResetMonth = base.armSchedule.firstResetMonth;
      const firstResetBalance =
        base.armSchedule.resets[0]?.balanceAtReset ?? loanAmount;
      const remainingTermAtFirstReset = Math.max(1, TERM_MONTHS - firstResetMonth + 1);
      const lifetimeCapRate = cfg.initialRate + cfg.lifetimeCapPct;
      const piAtLifetimeCap = calculatePI(firstResetBalance, lifetimeCapRate, remainingTermAtFirstReset);

      const crisisHitsLifetimeCap =
        crisis.lastReset?.capBinding === "LIFETIME_CAP";

      return {
        cfg,
        fixedYears,
        firstResetYear,
        firstResetMonth,
        piInitial,
        firstResetBalance,
        remTerm: remainingTermAtFirstReset,
        piAtWorstFirstReset,
        worstFirstResetRate,
        paymentShockPct,
        lifetimeCapRate,
        piAtLifetimeCap,
        scenarios,
        base,
        bearish,
        crisis,
        crisisHitsLifetimeCap,
        ioMonths,
      };
    } catch (_e) {
      return null;
    }
  }, [armType, index, initialRate, marginPct, initialCapPct, periodicCapPct, lifetimeCapPct, floorRate, ioMonths, originationDate, loanAmount, monthlyRent, pitiaNonDebt]);

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#arm-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Programs",      view: "lender-intel" },
        { label: "Portfolio",     view: "portfolio" },
      ]}
      cta={{ label: "Model the reset →", onClick: scrollToTool }}
    >
      {/* hide number spinners */}
      <style>{`
        .arm-in::-webkit-outer-spin-button,.arm-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .arm-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .arm-in-mini{color:${dc.cream};font-family:${dc.sans};font-weight:600;letter-spacing:-0.01em;}
        .arm-in-mini::-webkit-outer-spin-button,.arm-in-mini::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        /* Option readability must hold regardless of OS color scheme — a native
           <option> rendered in a dark-teal <select> can go invisible against a
           light-OS system dropdown. Force it unconditionally, not just under
           prefers-color-scheme:light. */
        #arm-tool select option{background:${dc.teal};color:${dc.cream};}
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="ar-hero"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(64px,9vh,128px) clamp(1.5rem,4vw,3rem) clamp(56px,7vh,96px)",
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}
        >
          {/* Eyebrow pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(238,239,211,0.62)",
              background: "rgba(238,239,211,0.06)",
              border: "1px solid rgba(238,239,211,0.18)",
              borderRadius: 100,
              padding: "7px 14px",
              marginBottom: 24,
            }}
          >
            5/6 · 7/6 · 10/6 ARM · SOFR + margin · caps
          </div>

          <H1 style={{ margin: "0 0 20px" }}>
            What happens when
            <br />
            the fixed period ends?
          </H1>

          {/* Glossed definition upfront */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: dc.lemon,
              maxWidth: "56ch",
              margin: "0 auto 14px",
              lineHeight: 1.6,
              letterSpacing: "-0.01em",
            }}
          >
            An ARM (a loan whose rate is fixed for a few years, then can adjust)
            looks cheap at first — but your payment jumps when the fixed period
            ends. This tool shows exactly how big that jump is, and whether your
            DSCR (whether the property's rent can cover the loan payment; 1.00 =
            rent exactly covers it; higher is stronger) still holds up.
          </div>

          <Lead
            style={{
              color: "rgba(238,239,211,0.7)",
              maxWidth: "58ch",
              margin: "0 auto 44px",
            }}
          >
            Enter your loan and pick a program. See the payment at first reset,
            every subsequent adjustment, and the worst-case lifetime cap — caps
            applied exactly as written in the note.
          </Lead>

          {/* ── PAYMENT-SHOCK TIMELINE — hero signature ── */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              maxWidth: 960,
              margin: "0 auto 36px",
              borderRadius: dc.r.md,
              overflow: "hidden",
            }}
          >
            {/* Fixed */}
            <div
              style={{
                flex: 5,
                background: dc.emerald,
                color: dc.dark,
                padding: "22px 20px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                {result ? `Years 1–${result.fixedYears}` : "Years 1–5"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                Fixed
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 2 }}>
                {result ? `${result.cfg.initialRate.toFixed(2)}% locked` : "7.00% locked"}
              </div>
            </div>

            {/* First reset */}
            <div
              style={{
                flex: 2,
                background: dc.lemon,
                color: dc.dark,
                padding: "22px 16px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
                First reset
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                {result ? `+${result.cfg.initialCapPct.toFixed(1)}%` : "+2.0%"}
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75, marginTop: 2 }}>
                cap-limited
              </div>
            </div>

            {/* Adjusts. Was `dc.rain` (#006565) — a near-teal that barely reads as
                distinct from the page ground (#003738/#004041), defeating the point
                of a 3-segment legend: Fixed/First-reset/Adjusts should each read as
                a different phase at a glance. `dc.cream` on dark text reuses tokens
                already in the palette instead of adding a 4th hue, and gives the
                riskiest phase (the one with no more caps ahead) the strongest
                contrast on the strip rather than the weakest. */}
            <div
              style={{
                flex: 3,
                background: dc.cream,
                color: dc.dark,
                padding: "22px 18px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.65 }}>
                {result ? `Years ${result.fixedYears + 1}–30` : "Years 6–30"}
              </div>
              <Mono style={{ display: "block", fontSize: "clamp(20px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4, color: dc.dark }}>
                Adjusts
              </Mono>
              <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>
                {result ? `SOFR + ${result.cfg.marginPct.toFixed(2)}%` : "SOFR + 2.75%"}
              </div>
            </div>
          </div>

          {/* Payment trajectory step-chart — flat fixed period, the reset jump, then floating years */}
          {result && (() => {
            const pi0 = result.piInitial;
            const pi1 = result.piAtWorstFirstReset;
            const fy = result.fixedYears;
            const shock = result.paymentShockPct;
            const sc = shockColor(shock);
            const vMax = pi1 * 1.16, vMin = pi0 * 0.7;
            const xOf = (yr: number) => 50 + (yr / 30) * 414;
            const yOf = (v: number) => 150 - ((v - vMin) / (vMax - vMin)) * 114;
            const x0 = xOf(0), xR = xOf(fy), xE = xOf(30);
            const y0 = yOf(pi0), y1 = yOf(pi1);
            const fixedPath = `M${x0} ${y0} L${xR} ${y0}`;
            const jumpPath = `M${xR} ${y0} L${xR} ${y1} L${xE} ${y1}`;
            const area = `M${x0} ${y0} L${xR} ${y0} L${xR} ${y1} L${xE} ${y1} L${xE} 150 L${x0} 150 Z`;
            return (
              <div ref={jumpRef} style={{ margin: "8px 0 36px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", textAlign: "center", marginBottom: 16 }}>
                  Monthly P&amp;I — fixed period, the reset, then it floats
                </div>
                <svg viewBox="0 0 480 174" style={{ width: "100%", height: "auto", display: "block", maxWidth: 560, margin: "0 auto", overflow: "visible" }}>
                  {[150, 110, 70, 30].map((gy) => (
                    <line key={gy} x1={x0} y1={gy} x2={xE} y2={gy} stroke="rgba(238,239,211,0.08)" strokeWidth="1" />
                  ))}
                  <line x1={xR} y1={y1 - 6} x2={xR} y2={150} stroke="rgba(238,239,211,0.18)" strokeWidth="1" strokeDasharray="3 5" />
                  <path d={area} fill={`${sc}1f`} stroke="none" style={{ opacity: jumpShown ? 1 : 0, transition: "opacity .5s ease .35s" }} />
                  <path d={fixedPath} fill="none" stroke={dc.emerald} strokeWidth="3.5" strokeLinecap="round" pathLength={100} style={{ strokeDasharray: 100, strokeDashoffset: jumpShown ? 0 : 100, transition: "stroke-dashoffset .55s ease" }} />
                  <path d={jumpPath} fill="none" stroke={sc} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} style={{ strokeDasharray: 100, strokeDashoffset: jumpShown ? 0 : 100, transition: "stroke-dashoffset .7s ease .5s" }} />
                  <circle cx={xR} cy={y1} r="5.5" fill={sc} style={{ opacity: jumpShown ? 1 : 0, transition: "opacity .3s ease 1.1s" }} />
                  <text x={x0} y={y0 - 10} fontSize="13" fontWeight="700" fill={dc.emerald} fontFamily={dc.mono}>{fmt$(pi0)}</text>
                  <text x={xE} y={y1 - 12} fontSize="13" fontWeight="700" fill={sc} fontFamily={dc.mono} textAnchor="end">{fmt$(pi1)}</text>
                  <text x={xR + 9} y={(y0 + y1) / 2} fontSize="12" fontWeight="700" fill={sc} fontFamily={dc.mono}>+{shock.toFixed(1)}%</text>
                  <text x={x0} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.62)">Yr 1</text>
                  <text x={xR} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.6)" textAnchor="middle">Yr {fy} · reset</text>
                  <text x={xE} y={168} fontSize="10" fontWeight="600" fill="rgba(238,239,211,0.62)" textAnchor="end">Yr 30</text>
                </svg>
              </div>
            );
          })()}

          {/* CTA row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Btn label="Model the reset ↓" href="#arm-tool" onClick={scrollToTool} />
            <Btn
              label="DSCR Calculator"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("dscr-calculator");
              }}
            />
          </div>
        </div>
      </section>

      {/* ── TOOL ─────────────────────────────────────────────────────────── */}
      <section
        id="arm-tool"
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: 30 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 12,
              }}
            >
              Live ARM reset engine
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                margin: "0 0 12px",
                color: dc.cream,
              }}
            >
              First-reset payment shock:{" "}
              <span style={{ color: result ? shockColor(result.paymentShockPct) : dc.lemon }}>
                {result ? `+${result.paymentShockPct.toFixed(1)}%` : "—"}
              </span>
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(238,239,211,0.6)",
                margin: 0,
                maxWidth: "62ch",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Below 8% shock = manageable. 8–20% = watch carefully. Above 20% = red.
              If DSCR drops below 1.0 at reset, the property can no longer cover its own
              costs — a deal-breaker for most investors and underwriters. A prepayment
              penalty (a fee some loans charge if you refinance early) may also apply if
              you try to exit before the fixed period ends.
            </p>
          </div>

          {/* Tool grid */}
          <div
            className="dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ── */}
            <div
              style={{
                background: dc.dark,
                borderRadius: dc.r.lg,
                padding: 28,
                border: `1px solid ${dc.faded}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.emerald,
                  marginBottom: 18,
                }}
              >
                Loan &amp; ARM terms
              </div>

              {/* ARM type selector */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(238,239,211,0.62)",
                    marginBottom: 4,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  ARM Type
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 8, lineHeight: 1.4 }}>
                  5/6 = fixed 5 yrs, adjusts every 6 months after. 7/6 = fixed 7 yrs. 10/6 = fixed 10 yrs.
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["5_6_ARM", "7_6_ARM", "10_6_ARM"] as ArmType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => selectArmType(t)}
                      style={{
                        flex: 1,
                        padding: "9px 4px",
                        borderRadius: dc.r.sm,
                        border: `1px solid ${armType === t ? dc.lemon : dc.faded}`,
                        background: armType === t ? risk.cautionBg : "transparent",
                        color: armType === t ? dc.lemon : "rgba(238,239,211,0.62)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {t.replace("_ARM", "").replace("_", "/")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loan-specific index, margin, caps, floor, IO, reset date —
                  editable inputs, not decoration. The ARM Type buttons above
                  only prefill these; the borrower's actual note terms win. */}
              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 16px",
                  background: "rgba(238,239,211,0.05)",
                  borderRadius: dc.r.sm,
                  border: `1px solid ${dc.faded}`,
                }}
              >
                <label style={{ display: "block", marginBottom: 10 }}>
                  <span style={miniLabelStyle}>Index</span>
                  <select
                    value={index}
                    onChange={(e) => setIndex(e.target.value as ARMIndex)}
                    style={selStyle}
                  >
                    {(Object.keys(INDEX_LABELS) as ARMIndex[]).map((ix) => (
                      <option key={ix} value={ix}>{INDEX_LABELS[ix]}</option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                  {[
                    { label: "Initial rate %", value: initialRate, set: setInitialRate },
                    { label: "Margin %", value: marginPct, set: setMarginPct },
                    { label: "First-reset cap %", value: initialCapPct, set: setInitialCapPct },
                    { label: "Periodic cap %", value: periodicCapPct, set: setPeriodicCapPct },
                    { label: "Lifetime cap %", value: lifetimeCapPct, set: setLifetimeCapPct },
                    { label: "Floor rate %", value: floorRate, set: setFloorRate },
                  ].map((f) => (
                    <label key={f.label} style={{ flex: "1 1 120px", minWidth: 0 }}>
                      <span style={miniLabelStyle}>{f.label}</span>
                      <input
                        className="arm-in arm-in-mini"
                        type="number"
                        step={0.125}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value === "" ? NaN : +e.target.value)}
                        style={miniInputStyle}
                      />
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <label style={{ flex: "1 1 120px", minWidth: 0 }}>
                    <span style={miniLabelStyle}>IO period (months)</span>
                    <input
                      className="arm-in arm-in-mini"
                      type="number"
                      step={1}
                      value={ioMonths}
                      onChange={(e) => setIoMonths(e.target.value === "" ? NaN : +e.target.value)}
                      style={miniInputStyle}
                    />
                  </label>
                  <label style={{ flex: "1 1 140px", minWidth: 0 }}>
                    <span style={miniLabelStyle}>Origination date</span>
                    <input
                      className="arm-in arm-in-mini"
                      type="date"
                      value={originationDate}
                      onChange={(e) => setOriginationDate(e.target.value)}
                      style={miniInputStyle}
                    />
                  </label>
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.55)", marginTop: 8, lineHeight: 1.4 }}>
                  Reset cadence ({result ? `fixed ${result.fixedYears} yrs, then every ${result.cfg.resetFrequencyMonths} mo` : "—"}) follows the ARM Type selected above. IO period defers principal — the payment jumps when it ends, even before any rate reset.
                </div>
              </div>

              {/* Deal inputs */}
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(238,239,211,0.62)",
                  marginBottom: 10,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Deal inputs
              </div>

              {[
                { label: "Loan Amount", hint: "The total amount borrowed — not the purchase price.", value: loanAmount, set: setLoanAmount, step: 5000, prefix: "$" },
                { label: "Monthly Rent", hint: "Gross rent the property generates each month. Used to compute DSCR at each reset.", value: monthlyRent, set: setMonthlyRent, step: 100, prefix: "$" },
                { label: "Taxes + Insurance + HOA /mo", hint: "Monthly taxes, insurance, and HOA combined. Together with P&I this is your PITIA (the total monthly cost of the loan including principal, interest, taxes, insurance, and association fees).", value: pitiaNonDebt, set: setPitiaNonDebt, step: 25, prefix: "$" },
              ].map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: 14 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "rgba(238,239,211,0.62)",
                      marginBottom: 5,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.label}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: dc.teal,
                      borderRadius: dc.r.sm,
                      padding: "0 13px",
                      border: `1px solid ${dc.faded}`,
                    }}
                  >
                    <span style={{ color: "rgba(238,239,211,0.62)" }}>{f.prefix}</span>
                    <input
                      className="arm-in"
                      type="number"
                      step={f.step}
                      value={f.value}
                      onChange={(e) => f.set(+e.target.value)}
                      style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                    />
                  </div>
                  <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
                    {f.hint}
                  </span>
                </label>
              ))}
            </div>

            {/* ── RESULTS ── */}
            {result ? (
              <div className="dc-results-first" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Payment comparison tiles */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1px",
                    background: dc.faded,
                    borderRadius: dc.r.lg,
                    overflow: "hidden",
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ background: dc.dark, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.emerald, marginBottom: 10 }}>Fixed payment</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: dc.cream, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piInitial)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.cfg.initialRate.toFixed(3)}% — locked for {result.fixedYears} yrs
                    </div>
                  </div>
                  <div style={{ background: dc.dark, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: dc.lemon, marginBottom: 10 }}>First reset (worst case)</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: dc.lemon, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piAtWorstFirstReset)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.worstFirstResetRate.toFixed(3)}% — initial cap applied
                    </div>
                  </div>
                  <div style={{ background: dc.dark, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: risk.danger, marginBottom: 10 }}>Lifetime cap (absolute max)</div>
                    <Mono style={{ display: "block", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: risk.dangerOnDark, letterSpacing: "-0.02em" }}>
                      {fmt$(result.piAtLifetimeCap)}
                    </Mono>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                      at {result.lifetimeCapRate.toFixed(3)}% — rate can never exceed this
                    </div>
                  </div>
                </div>

                {/* 5-scenario table — with RiskFlame per row */}
                <div
                  style={{
                    background: dc.dark,
                    borderRadius: dc.r.lg,
                    padding: 26,
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                    5 rate scenarios — does the deal survive?
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 16, letterSpacing: "-0.01em" }}>
                    SOFR is the index your rate floats with after the fixed period. Each row shows a different SOFR future — from falling rates (Bullish) to a spike (Crisis). "Deal breaks" means DSCR (rent ÷ full payment including taxes + insurance) drops below 1.0 — the property can no longer cover its own costs. Caps are enforced exactly as in your loan note.
                  </div>
                  <DataVintageLine
                    datasetKey="sofrModel"
                    ground="dark"
                    style={{
                      background: "rgba(238,239,211,0.05)",
                      border: "1px solid rgba(238,239,211,0.16)",
                      borderRadius: dc.r.sm,
                      padding: "8px 12px",
                      marginBottom: 16,
                    }}
                  />
                  {result.scenarios.map((s) => {
                    const breaks = s.dscrAtFirst < 1.0 || s.dscrAtLast < 1.0;
                    // Use the worst DSCR between first reset and stabilized for the flame
                    const worstDscr = Math.min(s.dscrAtFirst, s.dscrAtLast);
                    const riskLevel = riskFromDscr(worstDscr);
                    return (
                      <div
                        key={s.label}
                        style={{
                          padding: "11px 0",
                          borderBottom: `1px solid ${dc.faded}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: dc.cream, letterSpacing: "-0.01em" }}>
                              {s.label}
                            </span>
                            {/* RiskFlame: rate-rise danger indicator for ARM scenarios */}
                            <RiskFlame level={riskLevel} size={18} />
                          </div>
                          <Mono style={{ fontSize: 12, fontWeight: 700, color: s.color }}>
                            SOFR {s.sofr.toFixed(2)}%
                          </Mono>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 10,
                            fontSize: 12,
                            color: "rgba(238,239,211,0.62)",
                          }}
                        >
                          <div>
                            First reset&nbsp;
                            <Mono style={{ color: dc.cream, fontWeight: 700 }}>
                              {s.firstReset ? `${s.firstReset.rate.toFixed(3)}%` : "—"}
                            </Mono>
                          </div>
                          <div>
                            P&I /mo&nbsp;
                            <Mono style={{ color: dc.cream, fontWeight: 700 }}>
                              {s.piAtFirst > 0 ? fmt$(s.piAtFirst) : "—"}
                            </Mono>
                          </div>
                          <div>
                            DSCR @ reset&nbsp;
                            <Mono style={{ color: s.dscrAtFirst < 1.0 ? risk.danger : dc.cream, fontWeight: 700 }}>
                              {s.dscrAtFirst.toFixed(2)}x
                            </Mono>
                          </div>
                          <div>
                            DSCR @ stable&nbsp;
                            <Mono style={{ color: s.dscrAtLast < 1.0 ? risk.danger : dc.cream, fontWeight: 700 }}>
                              {s.dscrAtLast.toFixed(2)}x
                            </Mono>
                          </div>
                        </div>
                        {breaks && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              color: risk.danger,
                            }}
                          >
                            Deal breaks at this SOFR — DSCR drops below 1.0
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bearish reset schedule — every event (IO expiry AND every
                    capped reset) pulled straight from the real schedule, in the
                    order the note actually applies them. */}
                <div
                  style={{
                    background: dc.dark,
                    borderRadius: dc.r.lg,
                    padding: 26,
                    border: `1px solid ${dc.faded}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.emerald, marginBottom: 6 }}>
                    Reset schedule
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 16, letterSpacing: "-0.01em" }}>
                    Shows the Bearish scenario (SOFR +4.59%). Each reset the rate moves by at most the periodic cap — it cannot jump all at once. "Cap binding" tells you which cap is holding the rate back.
                    {result.ioMonths > 0 && " The IO period ends before any rate reset can occur — that payment jump is shown too."}
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
                      <thead>
                        <tr>
                          {["Event", "Rate", "P&I /mo", "Detail"].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                padding: "8px 10px",
                                fontSize: 11,
                                color: "rgba(238,239,211,0.62)",
                                textAlign: i >= 1 && i <= 2 ? "right" : "left",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${dc.faded}`,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>
                            {result.ioMonths > 0 ? "IO period" : "Fixed period"}
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                            <Mono>{result.cfg.initialRate.toFixed(3)}%</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                            <Mono>{fmt$(result.piInitial)}</Mono>
                          </td>
                          <td style={{ padding: "9px 10px", fontSize: 12, color: "rgba(238,239,211,0.62)", borderBottom: `1px solid ${dc.faded}` }}>
                            {result.ioMonths > 0 ? `Interest-only, months 1–${result.ioMonths}` : `Years 1–${result.fixedYears}`}
                          </td>
                        </tr>
                        {(() => {
                          const sched = result.bearish.armSchedule;
                          type ScheduleEvent = {
                            key: string; label: string; month: number; date: string | null;
                            rate: number; payment: number; detail: string; danger: boolean; warn: boolean;
                          };
                          const events: ScheduleEvent[] = [];
                          if (sched.ioExpiryMonth !== null) {
                            const row = sched.schedule.rows[sched.ioExpiryMonth - 1];
                            events.push({
                              key: "io-expiry",
                              label: "IO expires",
                              month: sched.ioExpiryMonth,
                              date: sched.ioExpiryDate,
                              rate: row.annualRatePct,
                              payment: row.payment,
                              detail: `Amortizing begins${sched.doubleShock ? " · within 12mo of a reset" : ""}`,
                              danger: (sched.ioExpiryPaymentChangePct ?? 0) > 20,
                              warn: (sched.ioExpiryPaymentChangePct ?? 0) > 8,
                            });
                          }
                          for (const r of sched.resets) {
                            events.push({
                              key: `reset-${r.resetNumber}`,
                              label: `Reset ${r.resetNumber}`,
                              month: r.month,
                              date: r.date,
                              rate: r.ratePct,
                              payment: r.paymentAfter,
                              detail: `${r.capBinding.replace("_", " ")} · Yr ${Math.ceil(r.month / 12)}`,
                              danger: r.capBinding === "LIFETIME_CAP",
                              warn: r.capBinding === "INITIAL_CAP" || r.capBinding === "PERIODIC_CAP",
                            });
                          }
                          events.sort((a, b) => a.month - b.month);
                          return events.map((ev) => (
                            <tr key={ev.key}>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>
                                {ev.label}{ev.date ? <span style={{ color: "rgba(238,239,211,0.5)", fontWeight: 500 }}> · {ev.date}</span> : null}
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: ev.danger ? risk.dangerOnDark : dc.cream, fontWeight: 700, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{ev.rate.toFixed(3)}%</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 13, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                                <Mono>{fmt$(ev.payment)}</Mono>
                              </td>
                              <td style={{ padding: "9px 10px", fontSize: 12, color: ev.danger ? risk.dangerOnDark : ev.warn ? dc.lemon : "rgba(238,239,211,0.62)", borderBottom: `1px solid ${dc.faded}` }}>
                                {ev.detail}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Engine footnote */}
                <div
                  style={{
                    padding: "16px 20px",
                    background: "rgba(238,239,211,0.05)",
                    borderRadius: dc.r.sm,
                    border: `1px solid ${dc.faded}`,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.62)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: dc.emerald, fontWeight: 700 }}>Engine:</strong>{" "}
                  Fully-indexed rate = current SOFR + margin, bounded by the initial cap at first reset,
                  periodic cap each subsequent reset, and lifetime cap = start rate + life cap.
                  P&amp;I re-amortizes on the schedule's actual balance at every reset — and at IO expiry, if the loan has an IO period.
                  {result.crisisHitsLifetimeCap
                    ? " The CRISIS scenario (SOFR 7.00%) reaches the lifetime cap within the modeled reset ladder."
                    : " Even the CRISIS scenario (SOFR 7.00%) stabilizes below the lifetime cap on this margin — the structural ceiling shown above is a separate, more conservative reference point."}
                  {" "}Preliminary estimate — not a commitment to lend. Submit a scenario review for exact underwriting.
                </div>

                {/* Terminal CTA */}
                <div
                  style={{
                    background: dc.dark,
                    borderRadius: dc.r.lg,
                    padding: "clamp(24px,3vw,36px)",
                    border: `1px solid ${dc.faded}`,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap" as const,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                      Ready to lock a rate before the clock runs out?
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.6)", margin: 0, maxWidth: "46ch", lineHeight: 1.5 }}>
                      Greenstreet can refinance you into a fixed DSCR loan before your ARM resets — no income docs, qualify on rent alone.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                    {/* Dominant lemon CTA */}
                    <button
                      onClick={() => onNavigate?.("rate-quiz")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: dc.lemon,
                        color: dc.dark,
                        fontWeight: 700,
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer",
                        padding: "12px 22px",
                        borderRadius: dc.r.md,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Get a refi rate →
                    </button>
                    {/* Secondary */}
                    <button
                      onClick={() => onNavigate?.("dscr-calculator")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "transparent",
                        color: dc.cream,
                        fontWeight: 600,
                        fontSize: 14,
                        border: `1.5px solid ${dc.faded}`,
                        cursor: "pointer",
                        padding: "12px 20px",
                        borderRadius: dc.r.md,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      Run the DSCR Calc
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="dc-results-first"
                style={{
                  background: dc.dark,
                  borderRadius: dc.r.lg,
                  padding: 40,
                  textAlign: "center",
                  border: `1px solid ${dc.faded}`,
                }}
              >
                <p style={{ color: risk.dangerOnDark, margin: 0 }}>Engine returned no result — adjust inputs.</p>
              </div>
            )}

            {/* Refi Proceeds Gap — Can you refinance at maturity? */}
            {result && (
              <div style={{ marginTop: 40, background: dc.dark, borderRadius: dc.r.lg, padding: "clamp(24px,3vw,36px)", border: `1px solid ${dc.faded}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>
                  Maturity Risk Analysis
                </div>
                <h3 style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 12px", color: dc.cream }}>
                  Can you refinance at ARM reset?
                </h3>
                <p style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", margin: "0 0 20px", lineHeight: 1.55, maxWidth: "68ch" }}>
                  At reset, the new loan amount is capped by BOTH LTV AND DSCR. If the max new loan can't retire your existing balance, you'll need to bring cash to close (the "proceeds gap"). This calculator shows if you can refi at maturity.
                </p>
                {(() => {
                  // Estimate property value assuming 75% LTV at origination
                  const estimatedValue = loanAmount / 0.75;
                  const refiGap = computeRefiProceedsGap({
                    propertyValue: estimatedValue,
                    currentBalance: result.firstResetBalance,
                    qualifyingRent: monthlyRent,
                    escrowsMonthly: pitiaNonDebt,
                    newRate: result.worstFirstResetRate,
                    maxLtvPct: 75,
                    minDscr: 1.0,
                    termYears: 30,
                  });
                  const gapColor = refiGap.canRetireBalance ? dc.emerald : risk.danger;
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: dc.r.md, padding: "16px 18px", border: `1px solid ${dc.faded}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 6 }}>
                            Max new loan (LTV)
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream }}>
                            {fmt$(refiGap.maxLoanByLtv)}
                          </Mono>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: dc.r.md, padding: "16px 18px", border: `1px solid ${dc.faded}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 6 }}>
                            Max new loan (DSCR)
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: dc.cream }}>
                            {fmt$(refiGap.maxLoanByDscr)}
                          </Mono>
                        </div>
                        <div style={{ background: refiGap.canRetireBalance ? "rgba(77,189,151,0.1)" : risk.dangerBg, borderRadius: dc.r.md, padding: "16px 18px", border: `2px solid ${gapColor}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: gapColor, marginBottom: 6 }}>
                            {refiGap.bindingConstraint} binds
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: gapColor }}>
                            {fmt$(refiGap.maxNewLoan)}
                          </Mono>
                        </div>
                        <div style={{ background: refiGap.canRetireBalance ? "rgba(77,189,151,0.1)" : risk.dangerBg, borderRadius: dc.r.md, padding: "16px 18px", border: `2px solid ${gapColor}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: gapColor, marginBottom: 6 }}>
                            {refiGap.canRetireBalance ? "Cash out available" : "Proceeds gap"}
                          </div>
                          <Mono style={{ fontSize: 22, fontWeight: 700, color: gapColor }}>
                            {refiGap.canRetireBalance ? `+${fmt$(refiGap.cashOutAvailable)}` : fmt$(refiGap.proceedsGap)}
                          </Mono>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5 }}>
                        <strong style={{ color: "rgba(238,239,211,0.85)" }}>Verdict:</strong> {
                          refiGap.canRetireBalance
                            ? `You CAN refinance at maturity — max new loan (${fmt$(refiGap.maxNewLoan)}) exceeds your remaining balance (${fmt$(result.firstResetBalance)}). ${refiGap.cashOutAvailable > 0 ? `Cash-out available: ${fmt$(refiGap.cashOutAvailable)}.` : ''}`
                            : `You CANNOT refinance at maturity without bringing ${fmt$(refiGap.proceedsGap)} cash to close. The ${refiGap.bindingConstraint} constraint caps your new loan at ${fmt$(refiGap.maxNewLoan)}, but you owe ${fmt$(result.firstResetBalance)}. Plan to pay down principal or increase rent before reset.`
                        }
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Full amortization & IO transition schedule — the complete,
                month-by-month schedule (rolled up by year), Base scenario.
                This is the literal schedule gate item 2 requires: every year's
                phase, rate, and payment, sourced from the one shared kernel. */}
            {result && (() => {
              const years = summarizeByYear(result.base.armSchedule.schedule);
              return (
                <div style={{ marginTop: 40, background: dc.dark, borderRadius: dc.r.lg, padding: "clamp(24px,3vw,36px)", border: `1px solid ${dc.faded}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 8 }}>
                    Full amortization schedule
                  </div>
                  <h3 style={{ fontSize: "clamp(20px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 12px", color: dc.cream }}>
                    Every year, IO through payoff — Base scenario (SOFR {result.base.sofr.toFixed(2)}%)
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(238,239,211,0.65)", margin: "0 0 20px", lineHeight: 1.55, maxWidth: "68ch" }}>
                    Rolled up by loan year from the same month-by-month schedule the tool prices every payment from — interest-only years, the amortizing years, and every reset in between, on one continuous balance.
                  </p>
                  <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 420, borderRadius: dc.r.sm }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
                      <thead>
                        <tr>
                          {["Year", "Phase", "Rate range", "Payment (end of yr)", "Balance (end of yr)"].map((h, i) => (
                            <th
                              key={h}
                              style={{
                                position: "sticky",
                                top: 0,
                                background: dc.dark,
                                padding: "8px 10px",
                                fontSize: 11,
                                color: "rgba(238,239,211,0.62)",
                                textAlign: i >= 2 ? "right" : "left",
                                fontWeight: 700,
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${dc.faded}`,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {years.map((y) => (
                          <tr key={y.year}>
                            <td style={{ padding: "7px 10px", fontSize: 12.5, color: dc.cream, fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>
                              {y.year}
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: 11.5, color: y.hasIo ? dc.lemon : "rgba(238,239,211,0.62)", fontWeight: 600, borderBottom: `1px solid ${dc.faded}` }}>
                              {y.hasIo ? "IO" : "Amortizing"}{y.hasPaymentChange ? " · reset" : ""}
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: 12.5, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                              <Mono>{y.startRatePct.toFixed(3) === y.endRatePct.toFixed(3) ? `${y.startRatePct.toFixed(3)}%` : `${y.startRatePct.toFixed(3)}→${y.endRatePct.toFixed(3)}%`}</Mono>
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: 12.5, color: dc.cream, textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                              <Mono>{fmt$(y.payments / y.months)}/mo</Mono>
                            </td>
                            <td style={{ padding: "7px 10px", fontSize: 12.5, color: "rgba(238,239,211,0.72)", textAlign: "right", borderBottom: `1px solid ${dc.faded}` }}>
                              <Mono>{fmt$(y.closingBalance)}</Mono>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", margin: "16px 0 0", lineHeight: 1.5 }}>
                    <strong style={{ color: "rgba(238,239,211,0.85)" }}>Total over {years.length} years:</strong>{" "}
                    {fmt$(result.base.armSchedule.schedule.totalPaid)} paid, {fmt$(result.base.armSchedule.schedule.totalInterest)} interest, loan retired to {fmt$(result.base.armSchedule.schedule.finalBalance)}.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={(v) => onNavigate?.(v)} />
    </DcShell>
  );
}
