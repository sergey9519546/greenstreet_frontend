import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { computeStressMatrix, classifyRiskZone } from "../engine/stressMatrix";
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
  FRAGILE:     { bg: "rgba(249,115,22,0.85)",     ink: "#fff"  },
  DEAL_BREAK:  { bg: "rgba(255,107,107,0.90)",    ink: "#fff"  },
};

const ZONE_ACCENT: Record<StressRiskZone, string> = {
  SAFE:        RAIN,
  COMFORTABLE: EMERALD,
  MARGINAL:    "#d8d958",
  FRAGILE:     "#f97316",
  DEAL_BREAK:  "#ff6b6b",
};

// ── Plain-English verdict copy ────────────────────────────────────────────────
function verdictCopy(dscr: number, zone: StressRiskZone): { headline: string; sub: string } {
  if (zone === "SAFE")        return { headline: "Strong — rent easily covers all costs",        sub: "This scenario leaves a comfortable buffer above the lender's minimum." };
  if (zone === "COMFORTABLE") return { headline: "Solid — deal still covers costs with margin",  sub: "Rent exceeds the full payment. Lenders typically require DSCR ≥ 1.25." };
  if (zone === "MARGINAL")    return { headline: "Tight — rent just barely covers costs",        sub: `At ${dscr.toFixed(2)}x the deal clears 1.00, but there's little cushion.` };
  if (zone === "FRAGILE")     return { headline: "Cash-flow shortfall — stress this deal hard",  sub: `Rent falls short of the full monthly payment by about ${Math.round((1 - dscr) * 100)}%.` };
  return { headline: "Deal breaks — rent cannot cover costs in this scenario",                  sub: `DSCR of ${dscr.toFixed(2)}x means the property is cash-flow negative. Lenders won't approve below 1.00.` };
}

// ── Mini P&I calculator (used for live stress panel) ─────────────────────────
function calcPI(loanAmt: number, annualRate: number, months = 360): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return loanAmt / months;
  return (loanAmt * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calcDSCR(
  purchasePrice: number,
  downPct: number,
  rate: number,
  rent: number,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number
): number {
  const loanAmt = purchasePrice * (1 - downPct / 100);
  const pi = calcPI(loanAmt, rate);
  const fixed = annualTaxes / 12 + annualInsurance / 12 + hoa;
  const pitia = pi + fixed;
  return pitia > 0 ? rent / pitia : 0;
}

// ── Pinned cell shape ────────────────────────────────────────────────────────
interface PinnedCell {
  rateBps: number;
  rentPct: number;
  dscr: number;
  zone: StressRiskZone;
}

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
  const stressedDSCR = useMemo(() => {
    const stressedRate = baseRate + rateOffsetBps / 100;
    const effectiveRent =
      monthlyRent * (1 + rentChangePct / 100) * (1 - vacancyPct / 100);
    const stressedTaxes = annualTaxes * (1 + taxBumpPct / 100);
    const stressedInsurance = annualInsurance * (1 + taxBumpPct / 100);
    return calcDSCR(purchasePrice, downPct, stressedRate, effectiveRent, stressedTaxes, stressedInsurance, hoa);
  }, [purchasePrice, downPct, baseRate, rateOffsetBps, monthlyRent, rentChangePct, vacancyPct, annualTaxes, annualInsurance, taxBumpPct, hoa]);

  const baseDSCR    = result?.baseTrack1DSCR ?? 0;
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
  const loanAmt         = purchasePrice * (1 - downPct / 100);
  const basePIAmt       = calcPI(loanAmt, baseRate);
  const baseFixed       = annualTaxes / 12 + annualInsurance / 12 + hoa;
  const basePITIA       = basePIAmt + baseFixed;
  const stressedRate    = baseRate + rateOffsetBps / 100;
  const stressedPIAmt   = calcPI(loanAmt, stressedRate);
  const stressedTaxInsMo= (annualTaxes * (1 + taxBumpPct / 100) + annualInsurance * (1 + taxBumpPct / 100)) / 12;
  const stressedPITIA   = stressedPIAmt + stressedTaxInsMo + hoa;
  const effectiveRent   = monthlyRent * (1 + rentChangePct / 100) * (1 - vacancyPct / 100);

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
    const loan = purchasePrice * (1 - downPct / 100);
    const fixed = annualTaxes / 12 + annualInsurance / 12;
    const cells: { bg: string; ink: string; v: string }[] = [];
    BPS_ROWS.forEach((bps) => {
      RENT_OFFSETS.forEach((rp) => {
        const rate = Math.max(0.5, baseRate + bps / 100);
        const pi   = calcPI(loan, rate);
        const d    = pi + fixed > 0 ? (monthlyRent * (1 + rp / 100)) / (pi + fixed) : 0;
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
    { zone: "SAFE",        label: "SAFE ≥1.50"       },
    { zone: "COMFORTABLE", label: "COMFORTABLE ≥1.25" },
    { zone: "MARGINAL",    label: "MARGINAL ≥1.00"   },
    { zone: "FRAGILE",     label: "FRAGILE ≥0.85"    },
    { zone: "DEAL_BREAK",  label: "DEAL BREAK <0.85" },
  ];

  function zoneLabel(z: StressRiskZone) { return z.replace("_", " "); }

  // ── DSCR change arrow color
  const deltaColor = dscrDelta > 0.05 ? EMERALD : dscrDelta < -0.05 ? "#ff6b6b" : LEMON;
  const deltaArrow = dscrDelta > 0.01 ? "↑" : dscrDelta < -0.01 ? "↓" : "→";

  // ── Slider reset
  const resetSliders = () => {
    setRateOffsetBps(0);
    setRentChangePct(0);
    setVacancyPct(5);
    setTaxBumpPct(0);
  };

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
        .sm-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};letter-spacing:-0.02em;}
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
              color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24,
            }}>
              Stress Matrix · 12×10 grid · 5 zones
            </div>
            <H1 style={{ margin: "0 0 20px" }}>
              See every stress scenario in one view.
            </H1>
            <div style={{
              fontSize: 15, fontWeight: 500, color: "rgba(238,239,211,0.82)", background: "rgba(238,239,211,0.05)", border: "1px solid rgba(238,239,211,0.16)",
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
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 10px", color: CREAM }}>
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
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>SAFE</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: EMERALD }}>{safeCount}</Mono>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 2 }}>DEAL BREAK</div>
                  <Mono style={{ fontSize: 18, fontWeight: 600, color: "#ff6b6b" }}>{breakCount}</Mono>
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
                    onClick={resetSliders}
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
                    onChange={setRateOffsetBps}
                    accentColor={rateOffsetBps > 100 ? "#f97316" : rateOffsetBps > 0 ? LEMON : EMERALD}
                    fillPct={(rateOffsetBps - (-150)) / (300 - (-150)) * 100}
                  />
                  <SliderField
                    label="Rent change"
                    glossLabel="How much rents fall or rise from your base"
                    value={rentChangePct}
                    min={-25} max={20} step={5}
                    displayValue={`${rentChangePct >= 0 ? "+" : ""}${rentChangePct}%`}
                    displaySub={`→ $${Math.round(monthlyRent * (1 + rentChangePct / 100)).toLocaleString()}/mo`}
                    onChange={setRentChangePct}
                    accentColor={rentChangePct < -10 ? "#f97316" : rentChangePct < 0 ? LEMON : EMERALD}
                    fillPct={(rentChangePct - (-25)) / (20 - (-25)) * 100}
                  />
                  <SliderField
                    label="Vacancy rate"
                    glossLabel="% of the year the property sits empty — reduces effective rent"
                    value={vacancyPct}
                    min={0} max={30} step={5}
                    displayValue={`${vacancyPct}%`}
                    displaySub={`−$${Math.round(monthlyRent * (1 + rentChangePct / 100) * vacancyPct / 100).toLocaleString()}/mo lost`}
                    onChange={setVacancyPct}
                    accentColor={vacancyPct > 15 ? "#f97316" : vacancyPct > 5 ? LEMON : EMERALD}
                    fillPct={vacancyPct / 30 * 100}
                  />
                  <SliderField
                    label="Tax & insurance bump"
                    glossLabel="% increase applied to your annual taxes and insurance together"
                    value={taxBumpPct}
                    min={0} max={40} step={5}
                    displayValue={`+${taxBumpPct}%`}
                    displaySub={`→ $${Math.round((annualTaxes + annualInsurance) * (1 + taxBumpPct / 100) / 12).toLocaleString()}/mo`}
                    onChange={setTaxBumpPct}
                    accentColor={taxBumpPct > 20 ? "#f97316" : taxBumpPct > 0 ? LEMON : EMERALD}
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
                    background: stressZone === "DEAL_BREAK" ? "rgba(255,107,107,0.08)" :
                                stressZone === "FRAGILE"    ? "rgba(249,115,22,0.07)"  :
                                                             "rgba(238,239,211,0.04)",
                    borderRadius: dc.r.sm, padding: "16px 18px",
                    border: `1px solid ${stressZone === "DEAL_BREAK" ? "rgba(255,107,107,0.3)" :
                                         stressZone === "FRAGILE"    ? "rgba(249,115,22,0.25)" :
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

                {/* ── Plain-language verdict ─────────────────────── */}
                <div style={{
                  marginTop: 16,
                  background: stressZone === "DEAL_BREAK" ? "rgba(255,107,107,0.09)" :
                              stressZone === "FRAGILE"    ? "rgba(249,115,22,0.08)"  :
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
                      12 rate shocks × 10 rent changes · hover any cell for exact DSCR · click to pin
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: EMERALD }}>{passRate} pass</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#ff6b6b" }}>{breakCount} breaks</span>
                  </div>
                </button>

                {showFullMatrix && (
                  <div style={{ marginTop: 20 }}>
                    {!result ? (
                      <div style={{ padding: 32, textAlign: "center", color: "#ff6b6b", background: "rgba(255,107,107,0.08)", borderRadius: 9, border: "1px solid rgba(255,107,107,0.3)" }}>
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
                                              <span style={{ position: "absolute", top: 1, right: 2, fontSize: 7, lineHeight: 1 }}>🔥</span>
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
  label, prefix, suffix, children,
}: {
  label: string; prefix?: string; suffix?: string; children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", background: "#003738", borderRadius: 6, padding: "0 11px", border: "1px solid rgba(238,239,211,0.10)" }}>
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
