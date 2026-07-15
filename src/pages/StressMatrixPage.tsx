import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { computeStressMatrix, classifyRiskZone, computeBreakEvenVacancy, computeDualTrackDSCR, computeShockWaterfall } from "../engine/stressMatrix";
import type { WaterfallShock } from "../engine/stressMatrix";
import type { PropertyInputs, LoanStructure, StressRiskZone } from "../engine/types";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";
import BottomCTA from "../design/BottomCTA";

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
  MARGINAL:    "#d8d958",
  FRAGILE:     "#e6b84d",
  DEAL_BREAK:  "#e06363",
};

// ── Plain-English verdict copy ────────────────────────────────────────────────
function verdictCopy(dscr: number, zone: StressRiskZone): { headline: string; sub: string } {
  if (zone === "SAFE")        return { headline: "Higher modeled coverage",                       sub: "Entered rent leaves a larger buffer above modeled costs." };
  if (zone === "COMFORTABLE") return { headline: "Solid — deal still covers costs with margin",  sub: "Rent exceeds the full payment. Lenders typically require DSCR ≥ 1.25." };
  if (zone === "MARGINAL")    return { headline: "Tight — rent just barely covers costs",        sub: `At ${dscr.toFixed(2)}x the deal clears 1.00, but there's little cushion.` };
  if (zone === "FRAGILE")     return { headline: "Cash-flow shortfall — stress this deal hard",  sub: `Rent falls short of the full monthly payment by about ${Math.round((1 - dscr) * 100)}%.` };
  return { headline: "Modeled coverage below the entered costs",                                sub: `DSCR of ${dscr.toFixed(2)}x is below 1.00 under this scenario. This does not determine lender approval or actual cash flow.` };
}

// ── Mini P&I calculator (used for live stress panel) ─────────────────────────
function finiteSum(...values: Array<number | null>): number | null {
  if (values.some((value) => value === null || !Number.isFinite(value))) return null;
  const total = (values as number[]).reduce((sum, value) => sum + value, 0);
  return Number.isFinite(total) ? total : null;
}

function finiteProduct(...values: number[]): number | null {
  if (values.some((value) => !Number.isFinite(value))) return null;
  const product = values.reduce((result, value) => result * value, 1);
  return Number.isFinite(product) ? product : null;
}

function calcPI(loanAmt: number, annualRate: number, months = 360): number | null {
  if (![loanAmt, annualRate, months].every(Number.isFinite) || loanAmt < 0 || annualRate < 0 || months <= 0) return null;
  const r = annualRate / 100 / 12;
  const payment = r === 0
    ? loanAmt / months
    : loanAmt * r / (1 - Math.pow(1 + r, -months));
  return Number.isFinite(payment) && payment >= 0 ? payment : null;
}

function calcDSCR(
  purchasePrice: number,
  downPct: number,
  rate: number,
  rent: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number
): number | null {
  if (![purchasePrice, downPct, rate, rent, annualTaxes, annualInsurance, hoa].every(Number.isFinite) ||
      purchasePrice < 0 || downPct < 0 || downPct > 100 || rate < 0 || rent < 0 ||
      annualTaxes < 0 || annualInsurance < 0 || hoa < 0) return null;
  const loanAmt = finiteProduct(purchasePrice, 1 - downPct / 100);
  if (loanAmt === null) return null;
  const pi = calcPI(loanAmt, rate);
  const fixed = finiteSum(annualTaxes / 12, annualInsurance / 12, hoa);
  const pitia = finiteSum(pi, fixed);
  if (pitia === null || pitia <= 0) return null;
  const dscr = rent / pitia;
  return Number.isFinite(dscr) && dscr >= 0 ? dscr : null;
}

function formatMonthly(value: number | null): string {
  return value !== null && Number.isFinite(value)
    ? `$${Math.round(value).toLocaleString()}/mo`
    : "Unavailable";
}

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
  { id: "calm",      label: "Illustrative baseline", sub: "Base inputs with the displayed vacancy assumption", rate: 0, rent: 0, vac: 5, tax: 0 },
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
  const [purchasePrice, setPurchasePrice] = useState(425000);
  const [downPct,       setDownPct]       = useState(25);
  const [baseRate,      setBaseRate]      = useState(7.0);
  const [monthlyRent,   setMonthlyRent]   = useState(3000);
  const [annualTaxes,   setAnnualTaxes]   = useState(5000);
  const [annualInsurance,setAnnualInsurance] = useState(2000);
  const [hoa,           setHoa]           = useState(0);

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

  // ── Engine result (full matrix) ───────────────────────────────────────────
  const result = useMemo(() => {
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
      return computeStressMatrix(property, loan, "LTR", baseRate, monthlyRent);
    } catch { return null; }
  }, [purchasePrice, downPct, baseRate, monthlyRent, annualTaxes, annualInsurance, hoa]);

  // ── Live stressed DSCR (slider-driven, instant) ───────────────────────────
  const stressedDSCRValue = useMemo(() => {
    const stressedRate = baseRate + rateOffsetBps / 100;
    const effectiveRent =
      monthlyRent * (1 + rentChangePct / 100) * (1 - vacancyPct / 100);
    const stressedTaxes = annualTaxes * (1 + taxBumpPct / 100);
    const stressedInsurance = annualInsurance * (1 + taxBumpPct / 100);
    return calcDSCR(purchasePrice, downPct, stressedRate, effectiveRent, stressedTaxes, stressedInsurance, hoa);
  }, [purchasePrice, downPct, baseRate, rateOffsetBps, monthlyRent, rentChangePct, vacancyPct, annualTaxes, annualInsurance, taxBumpPct, hoa]);

  const baseDSCRValue = result && Number.isFinite(result.baseTrack1DSCR) ? result.baseTrack1DSCR : null;
  const baseDSCR    = baseDSCRValue ?? 0;
  const stressedDSCR = stressedDSCRValue ?? 0;
  const baseZone    = classifyRiskZone(baseDSCR);
  const stressZone  = classifyRiskZone(stressedDSCR);
  const stressRisk  = riskFromDscr(stressedDSCR);
  const verdict     = verdictCopy(stressedDSCR, stressZone);
  const dscrDelta   = stressedDSCR - baseDSCR;

  const safeCount   = (result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0);
  const breakCount  = result?.zoneCounts.DEAL_BREAK ?? 0;
  const passCount   = (result?.zoneCounts.SAFE ?? 0) + (result?.zoneCounts.COMFORTABLE ?? 0) + (result?.zoneCounts.MARGINAL ?? 0);
  const totalCells  = result?.totalCells ?? 1;
  const passRate    = Math.round((passCount / totalCells) * 100) + "%";

  // PITIA for display
  const loanAmt         = finiteProduct(purchasePrice, 1 - downPct / 100);
  const basePIAmt       = loanAmt === null ? null : calcPI(loanAmt, baseRate);
  const baseFixed       = finiteSum(annualTaxes / 12, annualInsurance / 12, hoa);
  const basePITIA       = finiteSum(basePIAmt, baseFixed);
  const stressedRate    = baseRate + rateOffsetBps / 100;
  const stressedPIAmt   = loanAmt === null ? null : calcPI(loanAmt, stressedRate);
  const stressedTaxes   = finiteProduct(annualTaxes, 1 + taxBumpPct / 100);
  const stressedInsurance = finiteProduct(annualInsurance, 1 + taxBumpPct / 100);
  const stressedTaxInsMo= finiteSum(stressedTaxes === null ? null : stressedTaxes / 12, stressedInsurance === null ? null : stressedInsurance / 12);
  const stressedPITIA   = finiteSum(stressedPIAmt, stressedTaxInsMo, hoa);
  const grossStressedRent = finiteProduct(monthlyRent, 1 + rentChangePct / 100);
  const effectiveRent   = grossStressedRent === null ? null : finiteProduct(grossStressedRent, 1 - vacancyPct / 100);
  const analysisAvailable = result !== null && baseDSCRValue !== null && stressedDSCRValue !== null &&
    basePIAmt !== null && baseFixed !== null && basePITIA !== null && stressedPIAmt !== null &&
    stressedTaxInsMo !== null && stressedPITIA !== null && grossStressedRent !== null && effectiveRent !== null;
  // Break-even vacancy at the CURRENT stressed rate + rent (the occupancy loss
  // the deal can absorb before its DSCR drops below 1.00). Uses the same lender
  // basis as the gauge: rent-after-rent-shock (pre-vacancy) ÷ stressed PITIA.
  const breakEvenVac    = computeBreakEvenVacancy(grossStressedRent ?? 0, stressedPITIA ?? 0);
  // Dual-track at the current stressed state: lender (gross rent ÷ PITIA) vs
  // investor survival (modeled NOI after vacancy, management, maintenance,
  // and CapEx reserves, divided by the same full PITIA).
  const dualTrack       = computeDualTrackDSCR(grossStressedRent ?? 0, stressedPITIA ?? 0, { vacancyPct });
  // Multi-shock waterfall — decompose the active sliders into each shock's
  // marginal DSCR bite (Edge §7), so the user sees which lever breaks the deal.
  const shockWaterfall  = (() => {
    if (!analysisAvailable) return computeShockWaterfall(0, 0, []);
    const shocks: WaterfallShock[] = [];
    const rateDelta = stressedPIAmt! - basePIAmt!;
    if (Math.abs(rateDelta) > 0.5) shocks.push({ label: `Rate ${rateOffsetBps >= 0 ? "+" : ""}${(rateOffsetBps / 100).toFixed(2)}%`, pitiaDelta: rateDelta });
    const taxDelta = stressedTaxInsMo! - (baseFixed! - hoa);
    if (Math.abs(taxDelta) > 0.5) shocks.push({ label: `Tax & insurance +${taxBumpPct}%`, pitiaDelta: taxDelta });
    if (rentChangePct !== 0) shocks.push({ label: `Rent ${rentChangePct > 0 ? "+" : ""}${rentChangePct}%`, rentMultiplier: 1 + rentChangePct / 100 });
    if (vacancyPct !== 0) shocks.push({ label: `Vacancy ${vacancyPct}%`, rentMultiplier: 1 - vacancyPct / 100 });
    return computeShockWaterfall(monthlyRent, basePITIA!, shocks);
  })();

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

  // Preview mini-heatmap (4×10)
  const previewCells = useMemo(() => {
    const RENT_OFFSETS = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20];
    const BPS_ROWS     = [-50, 0, 50, 100];
    const loan = finiteProduct(purchasePrice, 1 - downPct / 100);
    const fixed = finiteSum(annualTaxes / 12, annualInsurance / 12);
    const cells: { bg: string; ink: string; v: string }[] = [];
    BPS_ROWS.forEach((bps) => {
      RENT_OFFSETS.forEach((rp) => {
        const rate = Math.max(0.5, baseRate + bps / 100);
        const pi   = loan === null ? null : calcPI(loan, rate);
        const pitia = finiteSum(pi, fixed);
        const adjustedRent = finiteProduct(monthlyRent, 1 + rp / 100);
        const d = pitia !== null && pitia > 0 && adjustedRent !== null ? adjustedRent / pitia : null;
        if (d === null || !Number.isFinite(d)) {
          cells.push({ bg: "rgba(238,239,211,0.08)", ink: "rgba(238,239,211,0.55)", v: "—" });
          return;
        }
        const zone = classifyRiskZone(d);
        cells.push({ ...ZONE_COLORS[zone], v: d.toFixed(1) });
      });
    });
    return cells;
  }, [purchasePrice, downPct, baseRate, monthlyRent, annualTaxes, annualInsurance]);

  const scrollToTool = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#sm-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  }, []);

  // ── Legend ───────────────────────────────────────────────────────────────
  const legend: { zone: StressRiskZone; label: string }[] = [
    { zone: "SAFE",        label: "HIGHER CUSHION ≥1.50" },
    { zone: "COMFORTABLE", label: "COMFORTABLE ≥1.25" },
    { zone: "MARGINAL",    label: "MARGINAL ≥1.00"   },
    { zone: "FRAGILE",     label: "FRAGILE ≥0.85"    },
    { zone: "DEAL_BREAK",  label: "LOW COVERAGE <0.85" },
  ];

  function zoneLabel(z: StressRiskZone) { return z.replace("_", " "); }

  // ── DSCR change arrow color
  const deltaColor = dscrDelta > 0.05 ? EMERALD : dscrDelta < -0.05 ? "#e06363" : LEMON;
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
        .sm-num::-webkit-outer-spin-button,.sm-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .sm-num{width:100%;min-width:0;max-width:100%;box-sizing:border-box;flex:1 1 auto;
          border:none;background:none;outline:none;font-family:${dc.sans};letter-spacing:-0.02em;}
        .sm-cell-mini{aspect-ratio:1;border-radius:3px;display:flex;align-items:center;justify-content:center;
          font-family:${dc.mono};font-size:9px;font-weight:700;}
        .sm-cell{display:block;width:100%;}
        /* Slider resets */
        .gs-slider{-webkit-appearance:none;appearance:none;width:100%;height:6px;
          border-radius:3px;outline:none;cursor:pointer;background:#003738;}
        .gs-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;
          border-radius:50%;background:#4dbd97;border:2px solid #003738;cursor:pointer;
          transition:transform .12s,box-shadow .12s;}
        .gs-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;
          background:#4dbd97;border:2px solid #003738;cursor:pointer;}
        .gs-slider:hover::-webkit-slider-thumb{transform:scale(1.2);box-shadow:0 0 0 4px rgba(216,217,88,.22);}
        /* Guided preset chips */
        .sm-preset:hover{border-color:rgba(216,217,88,0.5) !important;}
        .sm-preset[aria-pressed="true"]:hover{filter:brightness(1.05);}
        /* Accordion */
        .sm-accord-btn{background:none;border:none;cursor:pointer;padding:0;text-align:left;width:100%;
          display:flex;align-items:center;justify-content:space-between;}
        /* Intrinsic-size containment: only the matrix viewport may scroll horizontally. */
        .sm-tool-grid,.sm-tool-grid > *,.sm-main > *,.sm-slider-grid > *,.sm-compare-row > *{min-width:0;}
        .sm-sidebar,.sm-main,.sm-card{width:100%;max-width:100%;min-width:0;box-sizing:border-box;}
        .sm-input-box{width:100%;max-width:100%;min-width:0;box-sizing:border-box;}
        .sm-input-box > *{min-width:0;}
        .sm-matrix-scroll{width:100%;max-width:100%;min-width:0;overflow-x:auto;
          overscroll-behavior-inline:contain;-webkit-overflow-scrolling:touch;}
        /* Mobile layout */
        @media(max-width:991px){
          .sm-tool-grid{grid-template-columns:minmax(0,1fr) !important;width:100%;max-width:100%;}
          .sm-sidebar{position:static !important;top:unset !important;width:100%;
            max-width:calc(100vw - ${dc.pad} - ${dc.pad});}
        }
        @media(max-width:767px){
          .sm-hero-grid{grid-template-columns:1fr !important;}
          .sm-steps-grid{grid-template-columns:1fr !important;}
          .sm-compare-row{flex-direction:column !important;gap:12px !important;}
          .sm-gauge-row{flex-direction:column !important;align-items:flex-start !important;gap:16px !important;}
        }
        @media(max-width:479px){
          .sm-slider-grid{grid-template-columns:1fr !important;}
          .sm-sidebar{padding:20px !important;}
          .sm-card{padding:18px 16px !important;}
          .sm-accord-btn{flex-direction:column;align-items:flex-start;gap:10px;}
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
              color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24,
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
            border: "1px solid rgba(0,55,56,0.2)", boxShadow: "0 18px 44px -26px rgba(0,55,56,0.55)",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.6)" }}>
                Live stressed DSCR
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {analysisAvailable ? <RiskFlame level={stressRisk} size={16} /> : null}
                <Mono style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: analysisAvailable ? ZONE_ACCENT[stressZone] : "rgba(238,239,211,0.62)", lineHeight: 1 }}>
                  {analysisAvailable ? `${stressedDSCR.toFixed(2)}x` : "Unavailable"}
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
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 10px", color: CREAM }}>
              {analysisAvailable ? <>
                Base <Mono style={{ color: CREAM }}>{baseDSCR.toFixed(2)}x</Mono>{" · "}
                <span style={{ color: EMERALD }}>{passRate}</span>{" of scenarios still cover costs"}
              </> : "Analysis unavailable"}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(238,239,211,0.62)", margin: 0, maxWidth: "60ch", lineHeight: 1.6, fontWeight: 500 }}>
              <strong style={{ color: "rgba(238,239,211,0.8)" }}>PITIA</strong>{" "}
              <span style={{ fontWeight: 400 }}>(the full monthly payment — principal, interest, taxes, insurance, and any HOA dues)</span>{" "}
              at base: <Mono style={{ color: LEMON }}>{formatMonthly(basePITIA)}</Mono>.
              Adjust the assumptions below to compare stress scenarios. Results are illustrative model outputs, not forecasts, rates, approvals, or investment recommendations.
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

              <InputField label="Purchase Price" prefix="$">
                <input className="sm-num" type="number" step={5000} value={purchasePrice} onChange={(e) => setPurchasePrice(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Down payment" suffix="%">
                <input className="sm-num" type="number" step={1} min={20} max={50} value={downPct} onChange={(e) => setDownPct(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Base interest rate" suffix="%">
                <input className="sm-num" type="number" step={0.125} value={baseRate} onChange={(e) => setBaseRate(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Monthly Rent" prefix="$">
                <input className="sm-num" type="number" step={100} value={monthlyRent} onChange={(e) => setMonthlyRent(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Annual Taxes" prefix="$">
                <input className="sm-num" type="number" step={250} value={annualTaxes} onChange={(e) => setAnnualTaxes(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Annual Insurance" prefix="$">
                <input className="sm-num" type="number" step={100} value={annualInsurance} onChange={(e) => setAnnualInsurance(+e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Monthly HOA" prefix="$">
                <input className="sm-num" type="number" step={25} value={hoa} onChange={(e) => setHoa(+e.target.value)} style={inputStyle} />
              </InputField>

              {/* Zone counts */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(238,239,211,0.10)" }}>
                <div>
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>HIGHER CUSHION</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: EMERALD }}>{safeCount}</Mono>
                </div>
                <div>
              <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>LOW COVERAGE</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: "#e06363" }}>{breakCount}</Mono>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>TOTAL</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: "rgba(238,239,211,0.7)" }}>{totalCells}</Mono>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Interactive stress panel + matrix ─────────────── */}
            <div className="sm-main">

              {/* ╔══════════════════════════════════════════════════╗
                  ║  INTERACTIVE STRESS SLIDERS                      ║
                  ╚══════════════════════════════════════════════════╝ */}
              <div className="sm-card" style={{
                background: "#001f20", borderRadius: dc.r.md, padding: "24px 28px",
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
                      background: "rgba(216,217,88,0.12)", border: "1px solid rgba(216,217,88,0.25)",
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
                            borderRadius: 100, padding: "8px 15px", cursor: "pointer",
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
                    displaySub={`→ ${(baseRate + rateOffsetBps / 100).toFixed(3)}%`}
                    onChange={manual(setRateOffsetBps)}
                    accentColor={rateOffsetBps > 100 ? "#e6b84d" : rateOffsetBps > 0 ? LEMON : EMERALD}
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
                    accentColor={rentChangePct < -10 ? "#e6b84d" : rentChangePct < 0 ? LEMON : EMERALD}
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
                    accentColor={vacancyPct > 15 ? "#e6b84d" : vacancyPct > 5 ? LEMON : EMERALD}
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
                    accentColor={taxBumpPct > 20 ? "#e6b84d" : taxBumpPct > 0 ? LEMON : EMERALD}
                    fillPct={taxBumpPct / 40 * 100}
                  />
                </div>

                {!analysisAvailable ? (
                  <div role="status" style={{ background: "rgba(230,184,77,0.09)", border: "1px solid rgba(230,184,77,0.34)", borderRadius: dc.r.sm, padding: "18px 20px", color: CREAM }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: LEMON, marginBottom: 6 }}>Analysis unavailable</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(238,239,211,0.68)" }}>
                      One or more entered values is incomplete, outside the supported range, or too large to calculate safely. PITIA and stress metrics are withheld until the inputs produce finite results.
                    </div>
                  </div>
                ) : <>
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
                          PITIA <Mono style={{ color: "rgba(238,239,211,0.6)" }}>{formatMonthly(basePITIA)}</Mono>
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
                    background: stressZone === "DEAL_BREAK" ? "rgba(224,99,99,0.08)" :
                                stressZone === "FRAGILE"    ? "rgba(230,184,77,0.07)"  :
                                                             "rgba(238,239,211,0.04)",
                    borderRadius: dc.r.sm, padding: "16px 18px",
                    border: `1px solid ${stressZone === "DEAL_BREAK" ? "rgba(224,99,99,0.3)" :
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
                          PITIA <Mono style={{ color: "rgba(238,239,211,0.6)" }}>{formatMonthly(stressedPITIA)}</Mono>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)" }}>
                          Eff. rent <Mono style={{ color: "rgba(238,239,211,0.6)" }}>${Math.round(effectiveRent).toLocaleString()}/mo</Mono>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Dual-track: lender (Track 1) vs investor survival (Track 2),
                       with the "Qualifies but Dangerous" flag (DSCR spec) ── */}
                <div style={{
                  marginTop: 16,
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
                    <>The gross-rent track is <strong style={{ color: dc.cream }}>{dualTrack.track1.toFixed(2)}x</strong>, while the expense-adjusted track is <strong style={{ color: ZONE_ACCENT.DEAL_BREAK }}>{dualTrack.track2.toFixed(2)}x</strong>. This difference illustrates why a coverage ratio alone does not establish approval, profitability, or actual monthly cash flow.</>
                    ) : (
                      <>Track 1 is gross rent divided by PITIA; Track 2 is modeled NOI after vacancy, management, maintenance, and CapEx reserves divided by the same PITIA. {dualTrack.track2 >= 1.0 ? "Both modeled coverage tracks are at or above 1.00." : "Track 2 below 1.00 indicates the modeled NOI does not cover full PITIA."}</>
                    )}
                  </p>
                </div>

                {/* ── Break-even vacancy — how much occupancy loss the deal
                       absorbs before DSCR < 1.00 (hardened per DSCR spec) ── */}
                <div style={{
                  marginTop: 16, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
                  background: "rgba(238,239,211,0.04)", border: "1px solid rgba(238,239,211,0.10)",
                  borderRadius: dc.r.sm, padding: "14px 18px",
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
                  <div style={{ marginTop: 16, background: "rgba(238,239,211,0.04)", border: "1px solid rgba(238,239,211,0.10)", borderRadius: dc.r.sm, padding: "14px 18px" }}>
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

                {/* ── Plain-language verdict ─────────────────────── */}
                <div style={{
                  marginTop: 16,
                  background: stressZone === "DEAL_BREAK" ? "rgba(224,99,99,0.09)" :
                              stressZone === "FRAGILE"    ? "rgba(230,184,77,0.08)"  :
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
            Illustrative stress output only. Verify rent, vacancy, expenses, taxes, insurance, financing terms, and program rules; this model does not forecast performance or determine approval.
                      </span>
                    ) : null}
                  </p>
                </div>
                </>}
              </div>

              {/* ╔══════════════════════════════════════════════════╗
                  ║  FULL MATRIX — progressive disclosure            ║
                  ╚══════════════════════════════════════════════════╝ */}
              <div className="sm-card" style={{
                background: "#001a1b", borderRadius: dc.r.md, padding: "20px 24px",
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
              12 rate assumptions × 10 rent assumptions · hover for modeled DSCR · click to pin
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: EMERALD }}>{passRate} pass</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#e06363" }}>{breakCount} breaks</span>
                  </div>
                </button>

                {showFullMatrix && (
                  <div style={{ marginTop: 20 }}>
                    {!result ? (
                      <div style={{ padding: 32, textAlign: "center", color: "#e06363", background: "rgba(224,99,99,0.08)", borderRadius: 9, border: "1px solid rgba(224,99,99,0.3)" }}>
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
                          className="sm-matrix-scroll"
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
                              pointerEvents: "none", background: "#001f20",
                              border: `1px solid ${ZONE_ACCENT[hoverCell.zone]}44`,
                              borderRadius: 8, padding: "10px 13px", minWidth: 176,
                              boxShadow: "0 14px 32px -8px rgba(0,0,0,0.7)", zIndex: 20,
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
                            marginTop: 16, background: "#001f20",
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
            All results are <strong style={{ fontWeight: 600, color: "rgba(238,239,211,0.62)" }}>illustrative scenario outputs</strong> based on entered assumptions and fixed model bands. They are not forecasts, guaranteed rates, approval findings, or investment advice.
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
  label, prefix, suffix, children,
}: {
  label: string; prefix?: string; suffix?: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>
        {label}
      </span>
      <div className="sm-input-box" style={{ display: "flex", alignItems: "center", background: "#003738", borderRadius: 6, padding: "0 11px", border: "1px solid rgba(238,239,211,0.10)" }}>
        {prefix && <span style={{ color: "rgba(238,239,211,0.62)", flexShrink: 0 }}>{prefix}</span>}
        {children}
        {suffix && <span style={{ color: "rgba(238,239,211,0.62)", flexShrink: 0 }}>{suffix}</span>}
      </div>
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
      <input
        className="gs-slider"
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={trackStyle}
        aria-label={label}
        title={glossLabel}
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
