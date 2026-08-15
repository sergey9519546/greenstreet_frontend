import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { resolveInitialDeal } from "../lib/dealState";
import { gsap } from "gsap";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import {
  buildStressBaseScenario,
  computeStressMatrixFromBase,
  computeStressCell,
  classifyRiskZone,
  computeBreakEvenVacancy,
  computeShockWaterfall,
} from "../engine/stressMatrix";
import type { StressBaseScenario, WaterfallShock } from "../engine/stressMatrix";
import type { PropertyInputs, LoanStructure, StressRiskZone } from "../engine/types";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";
import BottomCTA from "../design/BottomCTA";
import { assessDscrCovenant } from "../engine/covenantCheck";
import type { CovenantStatus } from "../engine/covenantCheck";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import { PremiumSlider } from "../components/ui/PremiumSlider";
import { risk } from "../theme";

// ── Design tokens ────────────────────────────────────────────────────────────
const MINT      = dc.mintBg;
const DARK_INK  = dc.dark;
const LEMON     = dc.lemon;
const CREAM     = dc.cream;
const EMERALD   = dc.emerald;
const RAIN      = dc.rain;

// ── Risk zone palette ────────────────────────────────────────────────────────
const ZONE_COLORS: Record<StressRiskZone, { bg: string; ink: string }> = {
  SAFE:        { bg: RAIN,                        ink: CREAM   },
  COMFORTABLE: { bg: EMERALD,                     ink: DARK_INK},
  MARGINAL:    { bg: "rgba(216,217,88,0.85)",     ink: DARK_INK},
  FRAGILE:     { bg: "rgba(230,184,77,0.85)",     ink: "#fff"  },
  DEAL_BREAK:  { bg: "rgba(224,99,99,0.90)",    ink: "#fff"  },
};

const ZONE_ACCENT: Record<StressRiskZone, string> = {
  SAFE:        RAIN,
  COMFORTABLE: EMERALD,
  MARGINAL:    risk.caution,
  FRAGILE:     risk.warning,
  DEAL_BREAK:  risk.danger,
};

// ── Plain-English verdict copy ────────────────────────────────────────────────
function verdictCopy(dscr: number, zone: StressRiskZone): { headline: string; sub: string } {
  if (zone === "SAFE")        return { headline: "Strong — rent easily covers all costs",        sub: "This scenario leaves a comfortable buffer above the lender's minimum." };
  if (zone === "COMFORTABLE") return { headline: "Solid — deal still covers costs with margin",  sub: "Rent exceeds the full payment. Lenders typically require DSCR ≥ 1.25." };
  if (zone === "MARGINAL")    return { headline: "Tight — rent just barely covers costs",        sub: `At ${dscr.toFixed(2)}x the deal clears 1.00, but there's little cushion.` };
  if (zone === "FRAGILE")     return { headline: "Cash-flow shortfall — stress this deal hard",  sub: `Rent falls short of the full monthly payment by about ${Math.round((1 - dscr) * 100)}%.` };
  return { headline: "Deal breaks — rent cannot cover costs in this scenario",                  sub: `DSCR of ${dscr.toFixed(2)}x means the property is cash-flow negative. Lenders won't approve below 1.00.` };
}

// NOTE: there used to be a page-local `calcDSCR` here — its own PI formula,
// its own vacancy math, hardcoded to a 360-month term regardless of the base
// deal's actual term, with no flood insurance line. It had no connection to
// the engine's computeStressMatrix() below, which built the SAME kind of
// numbers a second way. That was the "recomputes the base per stress" defect
// the Stress Matrix release gate exists to catch: the live slider readout and
// the 120-cell grid could — and, on term/flood-insurance edge cases, did —
// disagree about the unshocked deal. Both now read a single
// StressBaseScenario (see `base` below) through the engine's
// computeStressCell(), so there is exactly one place a shock is applied.

// ── Pinned cell shape ────────────────────────────────────────────────────────
interface PinnedCell {
  rateBps: number;
  rentPct: number;
  dscr: number;
  zone: StressRiskZone;
}

// ── Guided "what-if" presets ──────────────────────────────────────────────────
// One-click stress stories: each names a real investor fear and snaps the four
// sliders (rate / rent / vacancy / tax) to that scenario. Clicking animates the
// sliders there so the gauge + verdict visibly react — the "guided" half of the
// simulation (the sliders alone are the free-form sandbox).
interface StressPreset {
  id: string;
  label: string;
  sub: string;
  rate: number;   // rate offset, bps
  rent: number;   // rent change, %
  vac: number;    // vacancy, %
  tax: number;    // tax & insurance bump, %
}
const PRESETS: StressPreset[] = [
  { id: "calm",      label: "Calm baseline",    sub: "No shock — your deal as underwritten",       rate: 0,   rent: 0,   vac: 5,  tax: 0  },
  { id: "rate",      label: "Rate spike",       sub: "Fed hikes — your rate jumps +200 bps",       rate: 200, rent: 0,   vac: 5,  tax: 0  },
  { id: "soft",      label: "Soft rental market", sub: "Rents dip 10% · vacancy doubles to 10%",   rate: 0,   rent: -10, vac: 10, tax: 0  },
  { id: "recession", label: "2008-style shock", sub: "Rent −15% · rate +150 bps · vacancy 15%",    rate: 150, rent: -15, vac: 15, tax: 0  },
  { id: "tax",       label: "Tax reassessment", sub: "County re-bills — taxes & insurance +25%",    rate: 0,   rent: 0,   vac: 5,  tax: 25 },
  { id: "covid",    label: "COVID-style shock", sub: "STR/LTR vacancy surge — rent −12% · vacancy 20%", rate: 0, rent: -12, vac: 20, tax: 5  },
  { id: "fl_ins",   label: "FL insurance crisis", sub: "Insurance spike +50% · rent −5% pressure",   rate: 50,  rent: -5,  vac: 8,  tax: 50 },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function StressMatrixPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Stress Matrix | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // ── Base deal inputs ─────────────────────────────────────────────────────
  const seed = useMemo(() => resolveInitialDeal(), []);
  const [purchasePrice, setPurchasePrice] = useState(seed.price);
  const [downPct,       setDownPct]       = useState(seed.down);
  const [baseRate,      setBaseRate]      = useState(seed.rate);
  const [monthlyRent,   setMonthlyRent]   = useState(seed.rent);
  const [annualTaxes,   setAnnualTaxes]   = useState(seed.tax);
  const [annualInsurance,setAnnualInsurance] = useState(seed.ins);
  const [hoa,           setHoa]           = useState(seed.hoa);

  // ── Covenant threshold (typical maintenance covenant for DSCR loans) ──────
  const [covenantThreshold, setCovenantThreshold] = useState(1.25);

  // ── Interactive stress sliders (the "guided simulation") ──────────────────
  // These layer a RELATIVE shock on top of the base deal.
  const [rateOffsetBps, setRateOffsetBps] = useState(0);    // −150 … +300 bps
  const [rentChangePct, setRentChangePct] = useState(0);    // −25 … +20 %
  const [vacancyPct,    setVacancyPct]    = useState(5);    // 0 … 30 % vacancy loss
  const [taxBumpPct,    setTaxBumpPct]    = useState(0);    // 0 … 40 % tax/ins increase

  // ── Guided preset state ───────────────────────────────────────────────────
  const [activePreset, setActivePreset] = useState<string>("calm");
  const presetTween = useRef<gsap.core.Tween | null>(null);

  // Animate the four sliders to a preset so the gauge + verdict visibly react.
  // Reduced-motion: snap straight to the values. Manual slider moves clear the
  // active preset (handled by the wrapped setters below).
  const applyPreset = useCallback((p: StressPreset) => {
    setActivePreset(p.id);
    presetTween.current?.kill();
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRateOffsetBps(p.rate); setRentChangePct(p.rent); setVacancyPct(p.vac); setTaxBumpPct(p.tax);
      return;
    }
    const obj = { rate: rateOffsetBps, rent: rentChangePct, vac: vacancyPct, tax: taxBumpPct };
    presetTween.current = gsap.to(obj, {
      rate: p.rate, rent: p.rent, vac: p.vac, tax: p.tax,
      duration: 0.7, ease: "power2.out",
      onUpdate: () => {
        setRateOffsetBps(Math.round(obj.rate));
        setRentChangePct(Math.round(obj.rent));
        setVacancyPct(Math.round(obj.vac));
        setTaxBumpPct(Math.round(obj.tax));
      },
      onComplete: () => {
        setRateOffsetBps(p.rate); setRentChangePct(p.rent); setVacancyPct(p.vac); setTaxBumpPct(p.tax);
      },
    });
  }, [rateOffsetBps, rentChangePct, vacancyPct, taxBumpPct]);

  // Wrapped setters for the manual sliders — any hand-move drops the preset chip
  // highlight (you're now off-script) and cancels an in-flight preset animation.
  const manual = (setter: (v: number) => void) => (v: number) => {
    presetTween.current?.kill();
    setActivePreset("");
    setter(v);
  };

  // ── Matrix state ──────────────────────────────────────────────────────────
  const [showFullMatrix, setShowFullMatrix] = useState(false);
  const [hoverCell, setHoverCell] = useState<{
    rateBps: number; rentPct: number; dscr: number; zone: StressRiskZone;
    x: number; y: number;
  } | null>(null);
  const [pinned, setPinned] = useState<PinnedCell | null>(null);

  const matrixRef = useRef<HTMLDivElement>(null);

  // ── ONE canonical base scenario (gate item 1) ─────────────────────────────
  // Every stress below — the full 120-cell grid, the live slider readout, and
  // the hero preview heatmap — is derived from THIS object via
  // computeStressCell(). Nothing downstream re-enters purchasePrice / rate /
  // rent / taxes on its own.
  const base: StressBaseScenario | null = useMemo(() => {
    try {
      const property: PropertyInputs = {
        purchasePrice, leaseRent: monthlyRent, marketRent: monthlyRent,
        strProjectedRent: 0, strDocumentedRent: 0,
        hoa, annualTaxes, annualInsurance, floodInsurance: 0,
        propertyType: "SFR", state: "TX", unitCount: 1, sqft: 1500, yearBuilt: 2000,
        isCondotel: false, isNonWarrantable: false, isRural: false,
        isDecliningMarket: false, hoaSTRPolicy: "UNKNOWN",
      };
      const loan: LoanStructure = {
        ltv: 100 - downPct, term: "30_YR", ioPeriod: "NONE",
        armType: "FIXED", prepayPreference: "NONE", purpose: "PURCHASE",
        expectedHoldYears: 5, points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0,
      };
      return buildStressBaseScenario(property, loan, "LTR", baseRate, monthlyRent);
    } catch { return null; }
  }, [purchasePrice, downPct, baseRate, monthlyRent, annualTaxes, annualInsurance, hoa]);

  // ── Engine result (full matrix) — same `base`, no second derivation ──────
  const result = useMemo(() => {
    if (!base) return null;
    try { return computeStressMatrixFromBase(base); } catch { return null; }
  }, [base]);

  // ── Live stressed cell (slider-driven, instant) — same `base`, same
  // computeStressCell() the grid above uses for every one of its 120 cells.
  const stressedCell = useMemo(() => {
    if (!base) return null;
    return computeStressCell(base, {
      rateOffsetBps,
      rentOffsetPct: rentChangePct,
      vacancyOverridePct: vacancyPct,
      expenseShockPct: taxBumpPct,
    });
  }, [base, rateOffsetBps, rentChangePct, vacancyPct, taxBumpPct]);

  // Track 1 (lender-qualification) is the basis for both gauges — the same
  // basis result.baseTrack1DSCR already uses — so "base" and "stressed" are
  // always the same metric under different shocks, never two different ones.
  const baseDSCR    = base?.baseTrack1DSCR ?? 0;
  const stressedDSCR = stressedCell?.track1DSCR ?? 0;
  const baseZone    = classifyRiskZone(baseDSCR);
  const stressZone  = stressedCell?.riskZone ?? classifyRiskZone(stressedDSCR);
  const stressRisk  = riskFromDscr(stressedDSCR);
  const verdict     = verdictCopy(stressedDSCR, stressZone);
  const dscrDelta   = stressedDSCR - baseDSCR;

  const safeCount   = (result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0);
  const breakCount  = result?.zoneCounts.DEAL_BREAK ?? 0;
  const passCount   = (result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0) + (result?.zoneCounts.MARGINAL ?? 0);
  const totalCells  = result?.totalCells ?? 1;
  const passRate    = Math.round((passCount / totalCells) * 100) + "%";

  // PITIA for display — read off the base scenario / stressed cell, never
  // recomputed with a page-local PI formula.
  const basePITIA       = base?.basePITIA ?? 0;
  const stressedPITIA   = stressedCell?.pitiaMonthly ?? 0;
  const stressedRatePct = stressedCell?.ratePct ?? baseRate;
  // Display-only: rent after both the rent shock AND the vacancy slider, so
  // the reader can see what vacancy costs in dollars. Sourced from the
  // canonical adjustedRent, not a second rent computation — the DSCR math
  // itself (Track 1/2 above) never nets vacancy out of gross rent; only the
  // TCO opex rate (Track 2) does, per the engine's own Track 1/2 split.
  const effectiveRent   = (stressedCell?.adjustedRent ?? 0) * (1 - vacancyPct / 100);
  // Break-even vacancy at the CURRENT stressed rate + rent (the occupancy loss
  // the deal can absorb before its DSCR drops below 1.00). Uses the same lender
  // basis as the gauge: rent-after-rent-shock (pre-vacancy) ÷ stressed PITIA.
  const breakEvenVac    = computeBreakEvenVacancy(stressedCell?.adjustedRent ?? 0, stressedPITIA);
  // Dual-track at the current stressed state — read directly off the same
  // stressedCell the headline gauge uses (it already carries both tracks
  // under the vacancy slider's TCO override), not a second, separately-called
  // computeDualTrackDSCR with its own copy of rent/PITIA/vacancy.
  const dualTrack = useMemo(() => {
    const track1 = stressedCell?.track1DSCR ?? 0;
    const track2 = stressedCell?.track2DSCR ?? 0;
    const delta = Math.round((track1 - track2) * 1000) / 1000;
    return { track1, track2, delta, qualifiesButDangerous: track1 >= 1.0 && track2 < 1.0 && delta > 0.2 };
  }, [stressedCell]);
  // Multi-shock waterfall — decompose the active sliders into each shock's
  // marginal DSCR bite (Edge §7), so the user sees which lever breaks the
  // deal. Deltas are read off `base` / `stressedCell`, the same fields
  // computeStressCell() itself used to build the stressed PITIA — so the
  // waterfall's steps cannot disagree with the headline number they explain.
  const shockWaterfall  = useMemo(() => {
    if (!base || !stressedCell) return computeShockWaterfall(0, 0, []);
    const shocks: WaterfallShock[] = [];
    const rateDelta = stressedCell.piMonthly - base.basePI;
    if (Math.abs(rateDelta) > 0.5) shocks.push({ label: `Rate ${rateOffsetBps >= 0 ? "+" : ""}${(rateOffsetBps / 100).toFixed(2)}%`, pitiaDelta: rateDelta });
    const stressedTaxesInsurance = base.monthlyTaxesInsurance * (1 + taxBumpPct / 100);
    const taxDelta = stressedTaxesInsurance - base.monthlyTaxesInsurance;
    if (Math.abs(taxDelta) > 0.5) shocks.push({ label: `Tax & insurance +${taxBumpPct}%`, pitiaDelta: taxDelta });
    if (rentChangePct !== 0) shocks.push({ label: `Rent ${rentChangePct > 0 ? "+" : ""}${rentChangePct}%`, rentMultiplier: 1 + rentChangePct / 100 });
    if (vacancyPct !== 0) shocks.push({ label: `Vacancy ${vacancyPct}%`, rentMultiplier: 1 - vacancyPct / 100 });
    return computeShockWaterfall(base.qualifyingRent, base.basePITIA, shocks);
  }, [base, stressedCell, rateOffsetBps, taxBumpPct, rentChangePct, vacancyPct]);

  // Cell styles
  function cellStyle(zone: StressRiskZone, isBase: boolean, isHovered: boolean): React.CSSProperties {
    const { bg, ink } = ZONE_COLORS[zone];
    return {
      borderRadius: 4,
      background: bg,
      color: ink,
      fontSize: 11,
      fontWeight: 700,
      fontFamily: dc.mono,
      textAlign: "center",
      padding: "6px 3px",
      outline: isBase ? `2px solid ${LEMON}` : isHovered ? "2px solid rgba(255,255,255,0.7)" : "none",
      outlineOffset: isBase || isHovered ? 1 : 0,
      filter: isHovered ? "brightness(1.18)" : "none",
      transform: isHovered ? "scale(1.08)" : "scale(1)",
      transition: "filter 0.12s, transform 0.12s, outline-color 0.12s",
      cursor: "pointer",
      position: "relative",
      zIndex: isHovered ? 2 : 1,
    };
  }

  // Preview mini-heatmap (4×10) — same `base` + computeStressCell() as the
  // full matrix and the live slider readout. Previously this recomputed PI
  // itself with its own `fixed` total that silently DROPPED HOA (the full
  // matrix's monthlyFixed always included it) — a fourth independent
  // derivation of the base deal, and the most wrong of the four.
  const previewCells = useMemo(() => {
    const RENT_OFFSETS = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20];
    const BPS_ROWS     = [-50, 0, 50, 100];
    const cells: { bg: string; ink: string; v: string }[] = [];
    if (!base) return cells;
    BPS_ROWS.forEach((bps) => {
      RENT_OFFSETS.forEach((rp) => {
        const cell = computeStressCell(base, { rateOffsetBps: bps, rentOffsetPct: rp });
        cells.push({ ...ZONE_COLORS[cell.riskZone], v: cell.track1DSCR.toFixed(1) });
      });
    });
    return cells;
  }, [base]);

  const scrollToTool = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#sm-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }, []);

  // ── Legend ───────────────────────────────────────────────────────────────
  const legend: { zone: StressRiskZone; label: string }[] = [
    { zone: "SAFE",        label: "SAFE ≥1.50"       },
    { zone: "COMFORTABLE", label: "COMFORTABLE ≥1.25" },
    { zone: "MARGINAL",    label: "MARGINAL ≥1.00"   },
    { zone: "FRAGILE",     label: "FRAGILE ≥0.85"    },
    { zone: "DEAL_BREAK",  label: "DEAL BREAK <0.85" },
  ];

  function zoneLabel(z: StressRiskZone) { return z.replace("_", " "); }

  // ── DSCR change arrow color
  const deltaColor = dscrDelta > 0.05 ? EMERALD : dscrDelta < -0.05 ? risk.danger : LEMON;
  const deltaArrow = dscrDelta > 0.01 ? "↑" : dscrDelta < -0.01 ? "↓" : "→";


  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc",     view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer"   },
      ]}
      cta={{ label: "Run stress test →", onClick: scrollToTool }}
    >
      {/* ── Global styles ──────────────────────────────────────────────── */}
      <style>{`
        /* The break-even and waterfall pair drops to one column before its
           numeric rows start wrapping. */
        @media (max-width: 860px){ .sm-verdict-pair{grid-template-columns:minmax(0,1fr) !important;} }
        .sm-num::-webkit-outer-spin-button,.sm-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .sm-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};letter-spacing:-0.02em;}
        .sm-cell-mini{aspect-ratio:1;border-radius:3px;display:flex;align-items:center;justify-content:center;
          font-family:${dc.mono};font-size:9px;font-weight:700;}
        .sm-cell{display:block;width:100%;}
        /* Guided preset chips */
        .sm-preset:hover{border-color:rgba(216,217,88,0.5) !important;}
        .sm-preset[aria-pressed="true"]:hover{filter:brightness(1.05);}
        /* Accordion */
        .sm-accord-btn{background:none;border:none;cursor:pointer;padding:0;text-align:left;width:100%;
          display:flex;align-items:center;justify-content:space-between;}
        /* Mobile layout */
        @media(max-width:991px){
          .sm-tool-grid{grid-template-columns:1fr !important;}
          .sm-sidebar{position:static !important;top:unset !important;}
        }
        @media(max-width:767px){
          .sm-hero-grid{grid-template-columns:1fr !important;}
          .sm-steps-grid{grid-template-columns:1fr !important;}
          .sm-compare-row{flex-direction:column !important;gap:12px !important;}
          .sm-gauge-row{flex-direction:column !important;align-items:flex-start !important;gap:16px !important;}
        }
        @media(max-width:479px){
          .sm-slider-grid{grid-template-columns:1fr !important;}
        }
        @media(prefers-reduced-motion:reduce){
          .gs-slider::-webkit-slider-thumb{transition:none !important;}
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          HERO — mint bg, dot grid, preview heatmap
      ════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          background: MINT,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }} />
        <div
          className="sm-hero-grid"
          style={{
            position: "relative", width: "100%", maxWidth: dc.maxW,
            margin: "0 auto", padding: `clamp(48px,7vh,88px) ${dc.pad}`,
            display: "grid", gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(32px,5vw,72px)", alignItems: "center",
          }}
        >
          {/* Left: hero copy */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 999, marginBottom: 24,
            }}>
              Stress Matrix · 12×10 grid · 5 zones
            </div>
            <H1 style={{ margin: "0 0 20px" }}>
              See every stress scenario in one view.
            </H1>
            <div style={{
              fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.82)", background: "rgba(0,55,56,0.04)", border: "1px solid rgba(0,55,56,0.12)",
              borderRadius: 8, padding: "10px 14px", maxWidth: "48ch",
              margin: "0 0 14px", lineHeight: 1.6, letterSpacing: "-0.01em", display: "inline-block",
            }}>
              A <strong>stress test</strong> checks whether the deal still works if rates rise or rent
              falls — across 120 combinations at once. Set your base deal below and read
              the color-coded <strong>DSCR</strong>{" "}
              <span style={{ fontWeight: 400 }}>
                (whether the property's rent can cover the loan payment; 1.00 = rent exactly
                covers it; higher is stronger)
              </span>{" "}
              grid.
            </div>
            <Lead style={{ color: "rgba(0,55,56,0.65)", maxWidth: "48ch", margin: "0 0 36px" }}>
              Then use the interactive sliders to simulate your specific fear — a rate
              spike, a vacancy hit, a tax re-assessment — and read the verdict instantly.
            </Lead>
            <Btn label="Open the simulator →" href="#sm-tool" onClick={scrollToTool} />
          </div>

          {/* Right: ONE cohesive live-stress card (was MotionWorkbench + heatmap) */}
          <div style={{
            background: DARK_INK, borderRadius: dc.r.lg, padding: "clamp(18px,2vw,26px)",
            border: "1px solid rgba(0,55,56,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)" }}>
                Live stressed DSCR
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RiskFlame level={stressRisk} size={16} />
                <Mono style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: ZONE_ACCENT[stressZone], lineHeight: 1 }}>
                  {stressedDSCR.toFixed(2)}x
                </Mono>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
              {previewCells.map((c, i) => (
                <div key={i} className="sm-cell-mini" style={{ background: c.bg, color: c.ink }}>
                  {c.v}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 13, textAlign: "center", lineHeight: 1.5 }}>
              4 rate shocks × 10 rent changes — a live preview of the full 120-cell matrix below.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          TOOL SECTION — dark bg, sidebar + interactive panel + matrix
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="sm-tool"
        style={{
          background: DARK_INK, color: CREAM,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: LEMON, marginBottom: 12 }}>
              Guided stress simulator · preliminary estimate
            </div>
            <h2 style={{ fontSize: "clamp(23px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.0, margin: "0 0 10px", color: CREAM }}>
              Base{" "}
              <Mono style={{ color: CREAM }}>{baseDSCR.toFixed(2)}x</Mono>
              {" · "}
              <span style={{ color: EMERALD }}>{passRate}</span>
              {" of scenarios still cover costs"}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(238,239,211,0.62)", margin: 0, maxWidth: "60ch", lineHeight: 1.6, fontWeight: 500 }}>
              <strong style={{ color: "rgba(238,239,211,0.8)" }}>PITIA</strong>{" "}
              <span style={{ fontWeight: 400 }}>(the full monthly payment — principal, interest, taxes, insurance, and any HOA dues)</span>{" "}
              at base: <Mono style={{ color: LEMON }}>${Math.round(basePITIA).toLocaleString()}/mo</Mono>.
              Adjust sliders below to model stress. All results are preliminary estimates — not a guaranteed rate or approval.
            </p>
          </div>

          {/* Main two-column grid */}
          <div
            className="sm-tool-grid"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, alignItems: "start" }}
          >
            {/* ── LEFT SIDEBAR: base deal inputs ─────────────────────── */}
            <div
              className="sm-sidebar"
              style={{ background: dc.teal, borderRadius: dc.r.md, padding: 24, position: "sticky", top: 96 }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: LEMON, marginBottom: 4 }}>
                Your base deal
              </div>
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", margin: "0 0 14px", lineHeight: 1.5 }}>
                These numbers anchor the center cell. Change any value and all 120 cells update instantly.
              </p>

              <div style={{ display: 'grid', gap: 12 }}>
                <InputField label="Purchase Price">
                  <CurrencyInput prefix="$" value={purchasePrice} onChange={setPurchasePrice} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Down payment">
                  <CurrencyInput suffix="%" decimals={0} value={downPct} onChange={setDownPct} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Base interest rate">
                  <CurrencyInput suffix="%" decimals={3} value={baseRate} onChange={setBaseRate} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Monthly Rent">
                  <CurrencyInput prefix="$" value={monthlyRent} onChange={setMonthlyRent} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Annual Taxes">
                  <CurrencyInput prefix="$" value={annualTaxes} onChange={setAnnualTaxes} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Annual Insurance">
                  <CurrencyInput prefix="$" value={annualInsurance} onChange={setAnnualInsurance} style={{ width: '100%' }} />
                </InputField>
                <InputField label="Monthly HOA">
                  <CurrencyInput prefix="$" value={hoa} onChange={setHoa} style={{ width: '100%' }} />
                </InputField>
              </div>

              {/* Zone counts */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(238,239,211,0.10)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>SAFE</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: EMERALD }}>{safeCount}</Mono>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>DEAL BREAK</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: risk.danger }}>{breakCount}</Mono>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>TOTAL</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: "rgba(238,239,211,0.7)" }}>{totalCells}</Mono>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Interactive stress panel + matrix ─────────────── */}
            <div>

              {/* ╔══════════════════════════════════════════════════╗
                  ║  INTERACTIVE STRESS SLIDERS                      ║
                  ╚══════════════════════════════════════════════════╝ */}
              <div style={{
                background: dc.dark, borderRadius: dc.r.md, padding: "24px 28px",
                border: "1px solid rgba(238,239,211,0.08)", marginBottom: 24,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: LEMON, marginBottom: 2 }}>
                      Stress Simulator
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: 0, lineHeight: 1.5 }}>
                      Adjust sliders to layer stress on your base deal. The DSCR gauge reacts instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => applyPreset(PRESETS[0])}
                    style={{
                      background: risk.cautionBg, border: "1px solid rgba(216,217,88,0.25)",
                      borderRadius: 6, color: LEMON, fontSize: 11, fontWeight: 600,
                      padding: "6px 14px", cursor: "pointer", letterSpacing: "0.03em",
                      transition: "background 0.15s",
                    }}
                  >
                    Reset
                  </button>
                </div>

                {/* ── Guided preset chips — one-click "what-if" stories ──── */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 9 }}>
                    Try a scenario
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {PRESETS.map((p) => {
                      const on = activePreset === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => applyPreset(p)}
                          aria-pressed={on}
                          className="sm-preset"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: on ? LEMON : "rgba(238,239,211,0.05)",
                            color: on ? DARK_INK : "rgba(238,239,211,0.82)",
                            border: `1px solid ${on ? LEMON : "rgba(238,239,211,0.14)"}`,
                            borderRadius: 999, padding: "8px 15px", cursor: "pointer",
                            fontSize: 12.5, fontWeight: 600, letterSpacing: "-0.01em",
                            transition: "background 0.18s, color 0.18s, border-color 0.18s",
                          }}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(238,239,211,0.6)", marginTop: 9, minHeight: 16, lineHeight: 1.5 }}>
                    {PRESETS.find((p) => p.id === activePreset)?.sub || "Custom scenario — sliders set by hand."}
                  </div>
                </div>

                {/* Sliders grid */}
                <div
                  className="sm-slider-grid"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 32px", marginBottom: 24 }}
                >
                  <SliderField
                    label="Rate shock"
                    glossLabel="bps = hundredths of a percent; +100 bps = rate goes up 1%"
                    value={rateOffsetBps}
                    min={-150} max={300} step={25}
                    displayValue={`${rateOffsetBps >= 0 ? "+" : ""}${rateOffsetBps} bps`}
                    displaySub={`→ ${stressedRatePct.toFixed(3)}%`}
                    onChange={manual(setRateOffsetBps)}
                    accentColor={rateOffsetBps > 100 ? risk.warning : rateOffsetBps > 0 ? LEMON : EMERALD}
                    fillPct={(rateOffsetBps - (-150)) / (300 - (-150)) * 100}
                  />
                  <SliderField
                    label="Rent change"
                    glossLabel="How much rents fall or rise from your base"
                    value={rentChangePct}
                    min={-25} max={20} step={5}
                    displayValue={`${rentChangePct >= 0 ? "+" : ""}${rentChangePct}%`}
                    displaySub={`→ $${Math.round(monthlyRent * (1 + rentChangePct / 100)).toLocaleString()}/mo`}
                    onChange={manual(setRentChangePct)}
                    accentColor={rentChangePct < -10 ? risk.warning : rentChangePct < 0 ? LEMON : EMERALD}
                    fillPct={(rentChangePct - (-25)) / (20 - (-25)) * 100}
                  />
                  <SliderField
                    label="Vacancy rate"
                    glossLabel="% of the year the property sits empty — reduces effective rent"
                    value={vacancyPct}
                    min={0} max={30} step={5}
                    displayValue={`${vacancyPct}%`}
                    displaySub={`−$${Math.round(monthlyRent * (1 + rentChangePct / 100) * vacancyPct / 100).toLocaleString()}/mo lost`}
                    onChange={manual(setVacancyPct)}
                    accentColor={vacancyPct > 15 ? risk.warning : vacancyPct > 5 ? LEMON : EMERALD}
                    fillPct={vacancyPct / 30 * 100}
                  />
                  <SliderField
                    label="Tax & insurance bump"
                    glossLabel="% increase applied to your annual taxes and insurance together"
                    value={taxBumpPct}
                    min={0} max={40} step={5}
                    displayValue={`+${taxBumpPct}%`}
                    displaySub={`→ $${Math.round((annualTaxes + annualInsurance) * (1 + taxBumpPct / 100) / 12).toLocaleString()}/mo`}
                    onChange={manual(setTaxBumpPct)}
                    accentColor={taxBumpPct > 20 ? risk.warning : taxBumpPct > 0 ? LEMON : EMERALD}
                    fillPct={taxBumpPct / 40 * 100}
                  />
                </div>

                {/* ── BEFORE / AFTER comparison ──────────────────── */}
                <div
                  className="sm-compare-row"
                  style={{
                    display: "flex", gap: 16, alignItems: "stretch",
                    padding: "18px 0 0", borderTop: "1px solid rgba(238,239,211,0.08)",
                  }}
                >
                  {/* Base case */}
                  <div style={{
                    flex: 1, background: "rgba(238,239,211,0.04)", borderRadius: dc.r.sm,
                    padding: "16px 18px", border: "1px solid rgba(238,239,211,0.10)",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 8 }}>
                      Base case (no stress)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <DscrGauge value={baseDSCR} size={88} label />
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>Zone</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: ZONE_ACCENT[baseZone] }}>{zoneLabel(baseZone)}</div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                          PITIA <Mono style={{ color: "rgba(238,239,211,0.6)" }}>${Math.round(basePITIA).toLocaleString()}/mo</Mono>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>
                          Rent <Mono style={{ color: "rgba(238,239,211,0.6)" }}>${monthlyRent.toLocaleString()}/mo</Mono>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow / delta */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    <Mono style={{ fontSize: 22, color: deltaColor, fontWeight: 700 }}>{deltaArrow}</Mono>
                    <Mono style={{ fontSize: 12, color: deltaColor, fontWeight: 600, marginTop: 2 }}>
                      {dscrDelta >= 0 ? "+" : ""}{dscrDelta.toFixed(2)}x
                    </Mono>
                  </div>

                  {/* Stressed case */}
                  <div style={{
                    flex: 1,
                    background: stressZone === "DEAL_BREAK" ? risk.dangerBg :
                                stressZone === "FRAGILE"    ? "rgba(230,184,77,0.07)"  :
                                                             "rgba(238,239,211,0.04)",
                    borderRadius: dc.r.sm, padding: "16px 18px",
                    border: `1px solid ${stressZone === "DEAL_BREAK" ? risk.dangerBorder :
                                         stressZone === "FRAGILE"    ? "rgba(230,184,77,0.25)" :
                                                                      "rgba(238,239,211,0.10)"}`,
                    transition: "background 0.3s, border-color 0.3s",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
                      Stressed scenario
                      <RiskFlame level={stressRisk} size={14} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <DscrGauge value={stressedDSCR} size={88} label />
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>Zone</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: ZONE_ACCENT[stressZone], transition: "color 0.3s" }}>{zoneLabel(stressZone)}</div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                          PITIA <Mono style={{ color: "rgba(238,239,211,0.6)" }}>${Math.round(stressedPITIA).toLocaleString()}/mo</Mono>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>
                          Eff. rent <Mono style={{ color: "rgba(238,239,211,0.6)" }}>${Math.round(effectiveRent).toLocaleString()}/mo</Mono>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dual-track and the covenant test are one thought — "does it
                    clear underwriting, and does it clear the note's covenant" —
                    so they read as a row rather than as two stacked verdicts. */}
                <div className="sm-verdict-pair" style={{
                  marginTop: 16, display: "grid", gap: 16,
                  gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
                  alignItems: "stretch",
                }}>
                {/* ── Dual-track: lender (Track 1) vs investor survival (Track 2),
                       with the "Qualifies but Dangerous" flag (DSCR spec) ── */}
                <div style={{
                  background: dualTrack.qualifiesButDangerous ? "rgba(224,99,99,0.10)" : "rgba(238,239,211,0.04)",
                  border: `1px solid ${dualTrack.qualifiesButDangerous ? "rgba(224,99,99,0.42)" : "rgba(238,239,211,0.10)"}`,
                  borderRadius: dc.r.sm, padding: "14px 18px",
                  transition: "background .3s, border-color .3s",
                }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Lender · Track 1</div>
                      <Mono style={{ fontSize: 20, fontWeight: 700, color: dualTrack.track1 >= 1.0 ? EMERALD : ZONE_ACCENT.DEAL_BREAK }}>{dualTrack.track1.toFixed(2)}x</Mono>
                    </div>
                    <span style={{ color: "rgba(238,239,211,0.3)", fontSize: 18, lineHeight: 1 }}>→</span>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Investor net · Track 2</div>
                      <Mono style={{ fontSize: 20, fontWeight: 700, color: dualTrack.track2 >= 1.0 ? EMERALD : ZONE_ACCENT.DEAL_BREAK }}>{dualTrack.track2.toFixed(2)}x</Mono>
                    </div>
                    {dualTrack.qualifiesButDangerous && (
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 800, color: ZONE_ACCENT.DEAL_BREAK, letterSpacing: "-0.01em" }}>
                        <RiskFlame level="high" size={16} /> Qualifies but dangerous
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "9px 0 0", lineHeight: 1.5 }}>
                    {dualTrack.qualifiesButDangerous ? (
                      <>The lender approves on gross rent (<strong style={{ color: dc.cream }}>{dualTrack.track1.toFixed(2)}x</strong>), but after vacancy, management, and maintenance the deal nets <strong style={{ color: ZONE_ACCENT.DEAL_BREAK }}>{dualTrack.track2.toFixed(2)}x</strong> — below 1.00. It clears underwriting and still loses money every month. This is the gap Track 2 exists to catch.</>
                    ) : (
                      <>Track 1 is what the lender qualifies on; Track 2 is what you actually net after vacancy, management, and maintenance. {dualTrack.track2 >= 1.0 ? "Both clear — the deal survives in reality, not just on paper." : "Track 2 below 1.0 means thin real-world cash flow even where the lender is comfortable."}</>
                    )}
                  </p>
                </div>

                {/* ── Covenant Check — maintenance covenant test ── */}
                {(() => {
                  const covenantCheck = assessDscrCovenant(stressedDSCR, covenantThreshold);
                  const statusColor: Record<CovenantStatus, string> = {
                    OK: EMERALD,
                    TIGHT: LEMON,
                    BREACH: ZONE_ACCENT.DEAL_BREAK,
                  };
                  return (
                    <div style={{
                      background: covenantCheck.breach ? "rgba(224,99,99,0.10)" : covenantCheck.status === 'TIGHT' ? "rgba(216,217,88,0.08)" : "rgba(77,189,151,0.08)",
                      border: `1px solid ${covenantCheck.breach ? "rgba(224,99,99,0.42)" : covenantCheck.status === 'TIGHT' ? "rgba(216,217,88,0.25)" : "rgba(77,189,151,0.25)"}`,
                      borderRadius: dc.r.sm, padding: "14px 18px",
                      transition: "background .3s, border-color .3s",
                    }}>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Covenant Check</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Mono style={{ fontSize: 20, fontWeight: 700, color: statusColor[covenantCheck.status] }}>{covenantCheck.status}</Mono>
                            {covenantCheck.breach && <RiskFlame level="high" size={16} />}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Required</div>
                          <Mono style={{ fontSize: 20, fontWeight: 700, color: "rgba(238,239,211,0.7)" }}>{covenantCheck.covenantDscr.toFixed(2)}x</Mono>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Actual</div>
                          <Mono style={{ fontSize: 20, fontWeight: 700, color: statusColor[covenantCheck.status] }}>{covenantCheck.actualDscr.toFixed(2)}x</Mono>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.55)", marginBottom: 3 }}>Cushion</div>
                          <Mono style={{ fontSize: 20, fontWeight: 700, color: covenantCheck.cushion >= 0 ? statusColor[covenantCheck.status] : ZONE_ACCENT.DEAL_BREAK }}>
                            {covenantCheck.cushion >= 0 ? '+' : ''}{covenantCheck.cushion.toFixed(2)}x
                          </Mono>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "9px 0 0", lineHeight: 1.5 }}>
                        {covenantCheck.note}
                      </p>
                    </div>
                  );
                })()}
                </div>

                {/* Break-even vacancy and the shock waterfall sit side by side
                    rather than stacked. Both are narrow — a single number with a
                    sentence, and a short list of rows — so stacking them spent a
                    full extra row of vertical space to show two things that fit
                    on one. The verdict stack above the matrix ran ~547px, over a
                    full screen, which is why the matrix itself needed scrolling
                    to reach. Collapses to one column under 860px, where two
                    columns would squeeze the waterfall's numeric rows. */}
                <div className="sm-verdict-pair" style={{
                  marginTop: 16, display: "grid", gap: 16,
                  gridTemplateColumns: shockWaterfall.steps.length > 0 ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)",
                  alignItems: "start",
                }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
                  background: "rgba(238,239,211,0.04)", border: "1px solid rgba(238,239,211,0.10)",
                  borderRadius: dc.r.sm, padding: "14px 18px", height: "100%",
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>
                      Break-even vacancy
                    </div>
                    <Mono style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color:
                      breakEvenVac.structurallyNegative ? ZONE_ACCENT.DEAL_BREAK
                      : breakEvenVac.vacancyPct >= 20 ? EMERALD
                      : breakEvenVac.vacancyPct >= 10 ? LEMON
                      : ZONE_ACCENT.FRAGILE }}>
                      {breakEvenVac.structurallyNegative ? "—" : `${breakEvenVac.vacancyPct.toFixed(0)}%`}
                    </Mono>
                  </div>
                  <p style={{ fontSize: 12.5, color: "rgba(238,239,211,0.66)", margin: 0, lineHeight: 1.5, flex: 1, minWidth: 220 }}>
                    {breakEvenVac.structurallyNegative ? (
                      <>Structurally cash-negative — at this rate and rent the property doesn&apos;t cover its payment even at 100% occupancy. Occupancy alone can&apos;t save it.</>
                    ) : (
                      <>Keeps covering the payment up to <strong style={{ color: dc.cream }}>{breakEvenVac.vacancyPct.toFixed(0)}% vacancy</strong> before DSCR drops below 1.00. You&apos;re modeling <strong style={{ color: dc.cream }}>{vacancyPct}%</strong>{vacancyPct < breakEvenVac.vacancyPct ? ` — a ${(breakEvenVac.vacancyPct - vacancyPct).toFixed(0)}-point cushion.` : " — at or past the break-even point."}</>
                    )}
                  </p>
                </div>

                {/* ── Multi-shock waterfall — each active lever's marginal DSCR bite ── */}
                {shockWaterfall.steps.length > 0 && (
                  <div style={{ background: "rgba(238,239,211,0.04)", border: "1px solid rgba(238,239,211,0.10)", borderRadius: dc.r.sm, padding: "14px 18px", height: "100%" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 10 }}>Where the damage comes from</div>
                    <div style={{ display: "grid", gap: 7 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 12.5 }}>
                        <span style={{ color: "rgba(238,239,211,0.7)", fontWeight: 600, minWidth: 130 }}>Base (no stress)</span>
                        <span style={{ minWidth: 48 }} />
                        <Mono style={{ color: dc.cream, fontWeight: 700, minWidth: 52, textAlign: "right" as const }}>{shockWaterfall.baseDSCR.toFixed(2)}x</Mono>
                      </div>
                      {shockWaterfall.steps.map((st, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 12.5 }}>
                          <span style={{ color: "rgba(238,239,211,0.72)", minWidth: 130 }}>{st.label}</span>
                          <Mono style={{ color: st.marginalDelta < 0 ? ZONE_ACCENT.DEAL_BREAK : EMERALD, fontWeight: 600, fontSize: 11.5, minWidth: 48, textAlign: "right" as const }}>{st.marginalDelta >= 0 ? "+" : ""}{st.marginalDelta.toFixed(2)}</Mono>
                          <Mono style={{ color: st.dscrAfter >= 1.0 ? EMERALD : ZONE_ACCENT.DEAL_BREAK, fontWeight: 700, minWidth: 52, textAlign: "right" as const }}>{st.dscrAfter.toFixed(2)}x</Mono>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>

                {/* ── Plain-language verdict ─────────────────────── */}
                <div style={{
                  marginTop: 16,
                  background: stressZone === "DEAL_BREAK" ? risk.dangerBg :
                              stressZone === "FRAGILE"    ? risk.warningBg  :
                              stressZone === "MARGINAL"   ? "rgba(216,217,88,0.08)"  :
                                                           "rgba(77,189,151,0.08)",
                  border: `1px solid ${ZONE_ACCENT[stressZone]}33`,
                  borderRadius: dc.r.sm, padding: "14px 16px",
                  transition: "background 0.3s, border-color 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <RiskFlame level={stressRisk} size={18} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: ZONE_ACCENT[stressZone], transition: "color 0.3s" }}>
                      {verdict.headline}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(238,239,211,0.65)", margin: 0, lineHeight: 1.55 }}>
                    {verdict.sub}
                    {stressZone === "DEAL_BREAK" || stressZone === "FRAGILE" ? (
                      <span style={{ display: "block", marginTop: 6, color: "rgba(238,239,211,0.62)", fontStyle: "italic", fontSize: 11 }}>
                        This is a preliminary estimate only — not a guaranteed rate or approval. For exact underwriting, submit a scenario review.
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              {/* ╔══════════════════════════════════════════════════╗
                  ║  FULL MATRIX — progressive disclosure            ║
                  ╚══════════════════════════════════════════════════╝ */}
              <div style={{
                background: dc.dark, borderRadius: dc.r.md, padding: "20px 24px",
                border: "1px solid rgba(238,239,211,0.07)",
              }}>
                {/* Accordion trigger */}
                <button
                  className="sm-accord-btn"
                  onClick={() => setShowFullMatrix((v) => !v)}
                  aria-expanded={showFullMatrix}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: LEMON }}>
                      {showFullMatrix ? "▾ Hide full matrix" : "▸ Show full matrix — 120 combinations"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", marginTop: 3, lineHeight: 1.4 }}>
                      12 rate shocks × 10 rent changes · hover any cell for exact DSCR · click to pin
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: EMERALD }}>{passRate} pass</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: risk.danger }}>{breakCount} breaks</span>
                  </div>
                </button>

                {showFullMatrix && (
                  <div style={{ marginTop: 20 }}>
                    {!result ? (
                      <div style={{ padding: 32, textAlign: "center", color: risk.danger, background: risk.dangerBg, borderRadius: 9, border: `1px solid ${risk.dangerBorder}` }}>
                        Engine returned no result. Check inputs.
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(238,239,211,0.62)", marginBottom: 10, fontFamily: dc.mono, letterSpacing: "0.03em" }}>
                          Rows (down) = rate shock in bps (100 bps = 1% change) · Columns (across) = rent change %
                        </div>

                        {/* Heatmap table */}
                        <div
                          ref={matrixRef}
                          style={{ overflowX: "auto", position: "relative" }}
                          onMouseLeave={() => setHoverCell(null)}
                        >
                          <table style={{ borderCollapse: "separate", borderSpacing: 2, minWidth: 580 }}>
                            <thead>
                              <tr>
                                <th style={{ padding: "4px 8px", fontSize: 11, color: "rgba(238,239,211,0.62)", textAlign: "left", fontFamily: dc.mono, fontWeight: 500 }}>bps</th>
                                {result.rentAxis.map((rp) => (
                                  <th key={rp} style={{ padding: "4px 3px", fontSize: 11, color: "rgba(238,239,211,0.62)", textAlign: "center", fontFamily: dc.mono, fontWeight: 500 }}>
                                    {rp > 0 ? "+" : ""}{rp}%
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {result.cells.map((row, ri) => {
                                const ratePct   = result.rateAxis[ri];
                                const offsetBps = Math.round((ratePct - result.baseRate) * 100);
                                const isBaseRow = Math.abs(ratePct - result.baseRate) < 0.001;
                                return (
                                  <tr key={ri}>
                                    <td style={{
                                      padding: "2px 8px", fontSize: 11,
                                      color: isBaseRow ? LEMON : "rgba(238,239,211,0.5)",
                                      fontFamily: dc.mono, fontWeight: isBaseRow ? 700 : 500, whiteSpace: "nowrap",
                                    }}>
                                      {offsetBps > 0 ? "+" : offsetBps === 0 ? "±" : ""}{offsetBps}bps
                                    </td>
                                    {row.map((cell, ci) => {
                                      const isBaseCell = isBaseRow && Math.abs(cell.rentOffsetPct) < 0.001;
                                      const isHovered  = hoverCell !== null &&
                                        hoverCell.rateBps === offsetBps &&
                                        Math.abs(hoverCell.rentPct - cell.rentOffsetPct) < 0.001;
                                      // danger zone: show flame indicator on high-risk cells
                                      const isDanger = cell.riskZone === "DEAL_BREAK" || cell.riskZone === "FRAGILE";
                                      return (
                                        <td
                                          key={ci}
                                          style={{ padding: 2 }}
                                          onMouseEnter={(e) => {
                                            const rect = (e.currentTarget.closest("[style*='overflow']") as HTMLElement)?.getBoundingClientRect();
                                            const tdRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                            setHoverCell({
                                              rateBps: offsetBps, rentPct: cell.rentOffsetPct,
                                              dscr: cell.track1DSCR, zone: cell.riskZone,
                                              x: rect ? tdRect.left - rect.left + tdRect.width / 2 : 0,
                                              y: rect ? tdRect.top  - rect.top  : 0,
                                            });
                                          }}
                                          onClick={() => setPinned({
                                            rateBps: offsetBps, rentPct: cell.rentOffsetPct,
                                            dscr: cell.track1DSCR, zone: cell.riskZone,
                                          })}
                                        >
                                          <div className="sm-cell" style={cellStyle(cell.riskZone, isBaseCell, isHovered)}>
                                            {cell.track1DSCR.toFixed(2)}
                                            {isDanger && !isBaseCell && !isHovered && (
                                              <span style={{ position: "absolute", top: 1, right: 2, lineHeight: 0, display: "inline-flex" }}>
                                                <RiskFlame level={riskFromDscr(cell.track1DSCR)} size={9} />
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Floating hover tooltip */}
                          {hoverCell && (
                            <div style={{
                              position: "absolute", left: hoverCell.x + 10, top: hoverCell.y - 8,
                              pointerEvents: "none", background: dc.dark,
                              border: `1px solid ${ZONE_ACCENT[hoverCell.zone]}44`,
                              borderRadius: 8, padding: "10px 13px", minWidth: 176,
                              zIndex: 20,
                            }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 7, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: dc.mono, color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.07)", borderRadius: 4, padding: "2px 6px" }}>
                                  {hoverCell.rateBps >= 0 ? "+" : ""}{hoverCell.rateBps} bps
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: dc.mono, color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.07)", borderRadius: 4, padding: "2px 6px" }}>
                                  {hoverCell.rentPct >= 0 ? "+" : ""}{hoverCell.rentPct.toFixed(0)}% rent
                                </span>
                                <RiskFlame level={riskFromDscr(hoverCell.dscr)} size={14} />
                              </div>
                              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: dc.mono, color: dscrColor(hoverCell.dscr), letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 5, transition: "color 0.2s" }}>
                                {hoverCell.dscr.toFixed(2)}x
                              </div>
                              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: ZONE_ACCENT[hoverCell.zone], padding: "2px 0" }}>
                                {zoneLabel(hoverCell.zone)}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 5, lineHeight: 1.4 }}>
                                {verdictCopy(hoverCell.dscr, hoverCell.zone).headline}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Click-to-pin readout */}
                        {pinned && (
                          <div style={{
                            marginTop: 16, background: dc.dark,
                            border: `1.5px solid ${ZONE_ACCENT[pinned.zone]}55`,
                            borderRadius: 10, padding: "18px 22px",
                            display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                            position: "relative",
                          }}>
                            <button
                              onClick={() => setPinned(null)}
                              aria-label="Dismiss pinned scenario"
                              style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "rgba(238,239,211,0.62)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
                            >×</button>

                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Rate shock</div>
                              <Mono style={{ fontSize: 20, fontWeight: 700, color: CREAM }}>{pinned.rateBps >= 0 ? "+" : ""}{pinned.rateBps} bps</Mono>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Rent shock</div>
                              <Mono style={{ fontSize: 20, fontWeight: 700, color: CREAM }}>{pinned.rentPct >= 0 ? "+" : ""}{pinned.rentPct.toFixed(0)}%</Mono>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Stressed DSCR</div>
                              <Mono style={{ fontSize: 28, fontWeight: 700, color: LEMON, letterSpacing: "-0.03em" }}>{pinned.dscr.toFixed(2)}x</Mono>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>vs. Base DSCR</div>
                              <Mono style={{ fontSize: 20, fontWeight: 700, color: dscrColor(baseDSCR) }}>{baseDSCR.toFixed(2)}x</Mono>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Risk zone</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: ZONE_ACCENT[pinned.zone] }}>{zoneLabel(pinned.zone)}</div>
                              <div style={{ marginTop: 4 }}><RiskFlame level={riskFromDscr(pinned.dscr)} size={16} /></div>
                            </div>
                            <div style={{ flex: 1, minWidth: 180 }}>
                              <div style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", lineHeight: 1.5 }}>
                                {verdictCopy(pinned.dscr, pinned.zone).sub}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Legend */}
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
                          {legend.map(({ zone, label }) => (
                            <div key={zone} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 500, color: "rgba(238,239,211,0.62)" }}>
                              <span style={{ width: 11, height: 11, borderRadius: 3, background: ZONE_COLORS[zone].bg, display: "inline-block", flexShrink: 0 }} />
                              {label}
                            </div>
                          ))}
                        </div>

                        {/* Engine summary */}
                        <div style={{
                          marginTop: 14, padding: "12px 16px",
                          background: "rgba(238,239,211,0.04)",
                          borderRadius: 8, border: "1px solid rgba(238,239,211,0.10)",
                          fontSize: 12, color: "rgba(238,239,211,0.62)", lineHeight: 1.6, fontFamily: dc.mono,
                        }}>
                          {result.summary}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── Compliance footnote ───────────────────────────────── */}
              <p style={{ fontSize: 11, color: "rgba(238,239,211,0.5)", marginTop: 18, lineHeight: 1.55, maxWidth: "60ch" }}>
                All results are <strong style={{ fontWeight: 600, color: "rgba(238,239,211,0.62)" }}>preliminary estimates</strong> for analytical purposes only — not a guaranteed rate, loan approval, or investment advice. For exact underwriting and rates, submit a scenario review.
              </p>
            </div>
          </div>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  LOCAL HELPER COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

const inputStyle: React.CSSProperties = {
  padding: "10px 6px",
  fontSize: 15,
  fontWeight: 600,
  color: "#eeefd3",
};

function InputField({
  label, children,
}: {
  label: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

// ── Slider field with gloss label, live value + sub-label ────────────────────
function SliderField({
  label, glossLabel, value, min, max, step,
  displayValue, displaySub, onChange, accentColor, fillPct,
}: {
  label: string; glossLabel: string; value: number;
  min: number; max: number; step: number;
  displayValue: string; displaySub: string;
  onChange: (v: number) => void;
  accentColor: string; fillPct: number;
}) {
  const trackStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${fillPct}%, rgba(238,239,211,0.12) ${fillPct}%, rgba(238,239,211,0.12) 100%)`,
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)" }}>
          {label}
        </span>
        <Mono style={{ fontSize: 14, fontWeight: 700, color: accentColor, transition: "color 0.2s", fontVariantNumeric: "tabular-nums" }}>
          {displayValue}
        </Mono>
      </div>
      <PremiumSlider
        min={min} max={max} step={step} value={value}
        onChange={onChange}
        accentColor={accentColor}
        trackColor="rgba(238,239,211,0.12)"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", lineHeight: 1.4 }} title={glossLabel}>
          {glossLabel.length > 42 ? glossLabel.slice(0, 42) + "…" : glossLabel}
        </span>
        <Mono style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", fontVariantNumeric: "tabular-nums", flexShrink: 0, marginLeft: 6 }}>
          {displaySub}
        </Mono>
      </div>
    </div>
  );
}
