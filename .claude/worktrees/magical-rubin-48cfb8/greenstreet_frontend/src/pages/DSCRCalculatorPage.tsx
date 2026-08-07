import React, { useState, useEffect } from "react";
import { DcShell, dc, H1, H2, Lead, Btn, HeroProof, Mono } from "../design/dc";
import { PISTACHIO, MIDNIGHT, LEMON, font, swatch, radius } from "../theme";
import { ClaudeDscrGauge, BalanceScale, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";
import { computeDualTrackDSCR } from "../engine/stressMatrix";
import { computeLossScenarios } from "../engine/lossFraming";
import { computeTcoDscr } from "../engine/tcoDscr";
import { estimateAnnualInsurance } from "../engine/insuranceEstimate";
import BottomCTA from "../design/BottomCTA";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

const pf = (r: number) => {
  if (r === 0) return 0;
  const m = r / 12;
  return (m * Math.pow(1 + m, 360)) / (Math.pow(1 + m, 360) - 1);
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

const PANEL = swatch.darkTeal;
const CARD  = swatch.midnight;

// Effective property-tax rate (annual % of value) by state. Used to estimate the
// PURCHASE-YEAR reset bill — what the buyer actually pays after a CA Prop-13 / TX
// / FL reassessment to the new basis — instead of the seller's stale bill that
// silently overstates DSCR. National fallback below.
const EFF_TAX_RATE: Record<string, number> = {
  AL:0.0041,AK:0.0118,AZ:0.0063,AR:0.0064,CA:0.0075,CO:0.0051,CT:0.0179,DE:0.0058,DC:0.0057,FL:0.0091,
  GA:0.0092,HI:0.0029,ID:0.0067,IL:0.0208,IN:0.0085,IA:0.0152,KS:0.0141,KY:0.0086,LA:0.0055,ME:0.0124,
  MD:0.0105,MA:0.0114,MI:0.0148,MN:0.0112,MS:0.0079,MO:0.0097,MT:0.0074,NE:0.0163,NV:0.0055,NH:0.0186,
  NJ:0.0223,NM:0.0073,NY:0.0162,NC:0.0078,ND:0.0098,OH:0.0152,OK:0.0090,OR:0.0093,PA:0.0149,RI:0.0140,
  SC:0.0057,SD:0.0124,TN:0.0066,TX:0.0163,UT:0.0058,VT:0.0190,VA:0.0082,WA:0.0094,WV:0.0059,WI:0.0161,WY:0.0061,
};
const DEFAULT_EFF_TAX = 0.011;
const US_STATES = Object.keys(EFF_TAX_RATE).sort();
// Hurricane / wildfire markets where an UNCONFIRMED insurance quote is a stop,
// not a footnote — bind coverage before committing scenario time.
const HIGH_RISK_INS = new Set(['FL','LA','CA','TX','MS','AL','SC','NC']);

// Rate (%) at which loan * pf(rate) === the P&I that puts DSCR exactly at 1.0.
// pf() is monotincreasing in rate, so a bisection converges fast.
function breakEvenRate(loan: number, targetPI: number): number {
  if (loan <= 0) return 0;
  const pfTarget = targetPI / loan;
  if (pfTarget <= 0) return 0;
  let lo = 0, hi = 0.30;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (pf(mid) < pfTarget) lo = mid; else hi = mid; }
  return ((lo + hi) / 2) * 100;
}

export default function DscrCalculatorPage({ onBack, onNavigate }: Props) {
  useEffect(() => {
    document.title = "DSCR Calculator: See if Rent Covers the Loan | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const [tab, setTab] = useState<'dscr'|'maxprice'>('dscr');
  const [price, setPrice] = useState(425000);
  const [down, setDown] = useState(25);
  const [rent, setRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [tax, setTax] = useState(5000);
  const [ins, setIns] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [stateCode, setStateCode] = useState('TX');
  const [taxAuto, setTaxAuto] = useState(true);

  const [mRent, setMRent] = useState(3000);
  const [mRate, setMRate] = useState(7.0);
  const [mDown, setMDown] = useState(25);
  const [target, setTarget] = useState(1.10);

  // ── Core calculations ───────────────────────────────────────────────────────
  // Property tax: estimate from the PURCHASE-YEAR reset (price × state rate) by
  // default — quoting off the seller's stale bill silently overstates DSCR.
  const effTaxRate = EFF_TAX_RATE[stateCode] ?? DEFAULT_EFF_TAX;
  const estTax = Math.round(price * effTaxRate);
  // Insurance auto-estimate by state risk (investor property) — investors
  // systematically underestimate this, the other silent DSCR killer.
  const estIns = estimateAnnualInsurance(stateCode, price, { isInvestor: true });
  const taxYr = taxAuto ? estTax : tax;
  const loan = price * (1 - down / 100);
  const pAndI = loan * pf(rate / 100);
  const pitia = pAndI + taxYr / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  // Dual-track check: the lender DSCR above is Track 1. Track 2 nets out typical
  // vacancy + management + maintenance — when a deal clears the lender but Track 2
  // is below 1.0, it qualifies yet loses money (the product's core warning).
  const dual = computeDualTrackDSCR(rent, pitia);
  // Loss-framed downside scenarios — concrete $ out-of-pocket, not abstract ratios.
  const lossScenarios = computeLossScenarios({ monthlyRent: rent, monthlyPITIA: pitia, monthlyTax: taxYr / 12, monthlyInsurance: ins / 12 });
  // Total cost of ownership — show-the-math: where the real operating costs go.
  const tco = computeTcoDscr({ grossRent: rent, principalAndInterest: pAndI, propertyTax: taxYr / 12, insurance: ins / 12, hoa, depreciableBasis: price * 0.8 });
  const cashFlow = rent - pitia;
  // NOI = EGI − full OpEx (CRE standard) — net the TCO opex (vacancy + mgmt +
  // maint + capex), not just 8% vacancy, before taxes + insurance. Otherwise
  // cap rate is overstated (~21% of rent).
  const noi = rent * 12 * (1 - tco.rate.total) - taxYr - ins;
  const capRate = noi / price * 100;

  // ── After-tax wedge — year-one depreciation shelter (cost-seg + 100% bonus) ──
  // ~20% land, ~25% of the building reclassified to 5/7/15-yr property that takes
  // 100% bonus depreciation under OBBBA. Illustrative — a CPA confirms the study.
  const yr1Shelter = Math.round(price * 0.8 * 0.25);

  // ── Insurance gate ──
  const insHighRisk = HIGH_RISK_INS.has(stateCode);

  // ── Binding constraint — rate headroom to the 1.0 floor ──
  const targetPI = rent - taxYr / 12 - ins / 12 - hoa; // P&I that lands DSCR at 1.0
  const beRate = targetPI > 0 ? breakEvenRate(loan, targetPI) : 0;
  const headroomBps = Math.round((beRate - rate) * 100);

  // ── Verdict ─────────────────────────────────────────────────────────────────
  let verdictLabel = 'BELOW FLOOR';
  let zoneColor    = '#e06363';
  let zoneChipBg   = 'rgba(224,99,99,0.12)';
  let verdictText  = 'Most lenders require DSCR ≥ 0.75. Restructure the deal or decline.';
  let verdictHeadline = 'Rent doesn\'t cover the payment — restructure or decline.';

  // 1.25 aligns with the engine's COMFORTABLE zone and the best-tier pricing gate
  // (a 1.22x "GREEN DEAL" that can't get best-tier pricing reads as a bait).
  if (dscr >= 1.25) {
    verdictLabel = 'GREEN DEAL';
    zoneColor    = '#4dbd97';
    zoneChipBg   = 'rgba(77,189,151,0.12)';
    verdictText  = 'Strong cushion. Qualifies with most DSCR lenders at standard pricing.';
    verdictHeadline = 'Strong coverage — qualifies at standard pricing.';
  } else if (dscr >= 1.00) {
    verdictLabel = 'QUALIFIES';
    zoneColor    = '#d8d958';
    zoneChipBg   = 'rgba(216,217,88,0.12)';
    verdictText  = 'Meets the 1.00 floor. Verify lender minimums and compensating factors.';
    verdictHeadline = 'Meets the qualifying floor — check program minimums.';
  } else if (dscr >= 0.75) {
    verdictLabel = 'SUB-1.0';
    zoneColor    = '#e6b84d';
    zoneChipBg   = 'rgba(230,184,77,0.12)';
    verdictText  = 'Some lenders accept 0.75+ with strong FICO, reserves, or a lower LTV.';
    verdictHeadline = 'Below 1.0 — sub-1.0 programs may still apply.';
  }

  const riskLevel = riskFromDscr(dscr);

  // ── Sensitivity ─────────────────────────────────────────────────────────────
  const dscrWith = (o: { price?: number; down?: number; rent?: number; rate?: number; tax?: number; ins?: number }) => {
    const p = o.price ?? price, d = o.down ?? down, r = o.rent ?? rent;
    const rt = o.rate ?? rate, t = o.tax ?? taxYr, i = o.ins ?? ins;
    const l = p * (1 - d / 100);
    const pit = l * pf(rt / 100) + t / 12 + i / 12 + hoa;
    return pit > 0 ? r / pit : 0;
  };
  const sd = (v: number) => { const x = v - dscr; return (x >= 0 ? '+' : '') + x.toFixed(2); };
  const sc = (v: number) => v >= dscr ? '#4dbd97' : '#e88a8a';
  const sens = [
    { label: 'Rate −0.50%', delta: sd(dscrWith({ rate: rate - 0.5 })), color: sc(dscrWith({ rate: rate - 0.5 })) },
    { label: 'Rent +$250',        delta: sd(dscrWith({ rent: rent + 250 })),  color: sc(dscrWith({ rent: rent + 250 })) },
    { label: 'Down +5%',          delta: sd(dscrWith({ down: Math.min(50, down + 5) })), color: sc(dscrWith({ down: Math.min(50, down + 5) })) },
  ];

  // ── PITIA breakdown rows ────────────────────────────────────────────────────
  const rows = [
    { label: 'Loan amount',   val: fmt(loan),       color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, loan / price * 100).toFixed(0) + '%',          barColor: swatch.emerald },
    { label: 'P&I monthly',   val: fmt(pAndI),      color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, pAndI / pitia * 100).toFixed(0) + '%',          barColor: '#4dbd97' },
    { label: 'Taxes /mo',     val: fmt(taxYr / 12), color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, (taxYr / 12) / pitia * 100).toFixed(0) + '%',   barColor: '#9ab87b' },
    { label: 'Insurance /mo', val: fmt(ins / 12),   color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, (ins / 12) / pitia * 100).toFixed(0) + '%',     barColor: '#9ab87b' },
    ...(hoa > 0 ? [{ label: 'HOA /mo', val: fmt(hoa), color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, hoa / pitia * 100).toFixed(0) + '%', barColor: '#9ab87b' }] : []),
    { label: 'Total PITIA',   val: fmt(pitia),      color: '#eeefd3',               weight: 700, pct: '100%',                                                         barColor: zoneColor },
  ];

  // ── Lender rows — gated by the deal's ACTUAL DSCR so we never imply best-tier
  // pricing on a 1.05x file (the caption's own rule: best tier needs ≥ 1.25).
  const lenderRows = [
    { name: 'Best tier',        req: 'needs ≥ 1.25x', ok: dscr >= 1.25, rate: Math.max(4, rate - 0.875).toFixed(3) + '%' },
    { name: 'Standard',         req: 'needs ≥ 1.00x', ok: dscr >= 1.00, rate: Math.max(4, rate - 0.50).toFixed(3) + '%' },
    { name: 'Sub-1.0 program',  req: 'needs ≥ 0.75x', ok: dscr >= 0.75, rate: Math.max(4, rate - 0.125).toFixed(3) + '%' },
  ];
  const yourTierIdx = lenderRows.findIndex(r => r.ok);

  // ── Max Purchase ─────────────────────────────────────────────────────────────
  // Self-consistent closed-form solve. Taxes and insurance SCALE with the price
  // being solved for (purchase-year tax reset × state rate + state-risk insurance)
  // instead of a fixed guess — a fixed $5k tax bill on a $700k TX answer would
  // silently overstate the max price and contradict the DSCR tab's reset logic.
  //   PITIA(price) = price·(1−d)·pf + price·taxRate/12 + price·insRate/12
  //   price = (rent / target) ÷ [ (1−d)·pf + taxRate/12 + insRate/12 ]
  const insPerDollar = estimateAnnualInsurance(stateCode, 1_000_000, { isInvestor: true }) / 1_000_000;
  const mDenom   = (1 - mDown / 100) * pf(mRate / 100) + effTaxRate / 12 + insPerDollar / 12;
  const maxPITIA = mRent / target;
  const maxPrice = mDenom > 0 ? maxPITIA / mDenom : 0;
  const maxLoan  = maxPrice * (1 - mDown / 100);
  const maxPI    = maxLoan * pf(mRate / 100);
  const mTaxYr   = maxPrice * effTaxRate;
  const mInsYr   = maxPrice * insPerDollar;

  const mRows = [
    { label: 'Max loan amount', val: fmt(maxLoan) },
    { label: 'Down payment',    val: fmt(maxPrice - maxLoan) },
    { label: 'Max P&I /mo',     val: fmt(maxPI) },
    { label: `Est. taxes /yr — ${stateCode} reset`, val: fmt(mTaxYr) },
    { label: `Est. insurance /yr — ${stateCode} risk`, val: fmt(mInsYr) },
    { label: 'Max PITIA /mo',   val: fmt(maxPITIA) },
  ];

  const scrollToCalc = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector('#gs-calc');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'smooth' });
  };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{`
        .gs-num::-webkit-outer-spin-button, .gs-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .gs-num { width: 100%; border: none; background: none; outline: none; font-family: ${font.family}; color: ${PISTACHIO}; letter-spacing: -0.02em; }
        .calc-field { display:flex; align-items:center; border: 1.5px solid rgba(238,239,211,0.2); border-radius: ${radius.sm}; padding: 0 13px; background: ${PANEL}; transition: border-color .15s; }
        .calc-field:focus-within { border-color: ${LEMON}; outline: 2px solid ${LEMON}; outline-offset: 1px; border-radius: ${radius.sm}; }
        .calc-field:hover:not(:focus-within) { border-color: rgba(238,239,211,0.5); }
        .gsr { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; background: rgba(238,239,211,0.16); outline: none; cursor: pointer; }
        .gsr::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${swatch.emerald}; border: 3px solid ${swatch.darkTeal}; cursor: pointer; transition: transform .15s; }
        .gsr::-webkit-slider-thumb:hover { transform: scale(1.16); }
        .gsr::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: ${swatch.emerald}; border: 3px solid ${swatch.darkTeal}; cursor: pointer; }
        .gsr:focus-visible { outline: 2px solid ${LEMON}; outline-offset: 4px; }
        .gs-dot-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 34px 34px; pointer-events: none; }
        @keyframes gsBar { from { width: 0; } }
        .gs-bar { animation: gsBar .8s ease-out both; }
        @media (max-width: 991px) { #gs-hero-inner { grid-template-columns: 1fr !important; gap: 40px !important; } .dc-band-3, .dc-split { grid-template-columns: 1fr !important; } .calc-panel { grid-template-columns: 1fr !important; } .bottom-trio { grid-template-columns: 1fr !important; } }
        @media (max-width: 767px) { .bottom-trio { grid-template-columns: 1fr !important; } }
        @media (max-width: 479px) { .dscr-verdict-inner { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      `}</style>

      {/* ── HERO — dark bg, dot grid ── */}
      <section id="gs-hero" style={{ position: 'relative', background: MIDNIGHT, color: PISTACHIO, overflow: 'hidden', padding: 'clamp(48px,7vh,92px) clamp(1.5rem,4vw,3rem) clamp(40px,6vh,72px)' }}>
        <div className="gs-dot-grid"></div>
        <div id="gs-hero-inner" className="dc-hero" style={{ position: 'relative', width: '100%', maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
          <div id="gs-hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', background: 'rgba(238,239,211,0.06)', border: '1px solid rgba(238,239,211,0.18)', padding: '6px 13px', borderRadius: 100, marginBottom: 24 }}>
              DSCR Engine · Deterministic core
            </div>
            <H1 style={{ fontSize: 'clamp(46px,7vw,108px)', lineHeight: 0.93, letterSpacing: '-0.045em', marginBottom: 26, color: PISTACHIO }}>
              DSCR Calculator:<br/>see if rent<br/>covers the loan.
            </H1>
            <Lead style={{ color: 'rgba(238,239,211,0.68)', maxWidth: '46ch', marginBottom: 34 }}>
              Enter price, rent, rate, taxes and insurance. Get your DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) and full PITIA breakdown instantly. No black box.
            </Lead>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
              <a href="#gs-calc" onClick={scrollToCalc} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: LEMON, color: MIDNIGHT, fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: '15px 30px', borderRadius: radius.sm, minHeight: 44 }}>
                Open the calculator ↓
              </a>
              <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.('rate-quiz'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'transparent', color: PISTACHIO, fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: '15px 26px', borderRadius: radius.sm, border: '1.5px solid rgba(238,239,211,0.5)', minHeight: 44 }}>
                Find my program →
              </a>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(24px,4vw,52px)', flexWrap: 'wrap' }}>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: '#4dbd97', lineHeight: 1 }}>7</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}>Greenstreet programs</div></div>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: '#4dbd97', lineHeight: 1 }}>50</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}>state rule sets</div></div>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: LEMON, lineHeight: 1 }}>&lt;2s</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}>to a priced deal</div></div>
            </div>
          </div>
          <HeroProof
            eyebrow="Live preview"
            value={`${dscr.toFixed(2)}x`}
            valueNum={dscr}
            track2Num={dual.track2}
            sub={`${fmt(rent)} rent ÷ ${fmt(pitia)} payment`}
            chip={{ label: dual.qualifiesButDangerous ? "QUALIFIES — BUT" : verdictLabel, color: dual.qualifiesButDangerous ? "#e0635f" : zoneColor }}
          />
        </div>
      </section>

      {/* ── CALCULATOR — dark instrument panel ── */}
      <section id="gs-calc" style={{ background: PANEL, padding: 'clamp(52px,7vw,92px) clamp(1.5rem,4vw,3rem) clamp(64px,9vh,116px)', borderTop: '1px solid rgba(238,239,211,0.07)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>

          {/* Section header + tab switcher */}
          <div className="gs-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 34 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 12 }}>Live deal desk</div>
              <H2 style={{ fontSize: 'clamp(30px,3.8vw,54px)', letterSpacing: '-0.04em', lineHeight: 1.0, maxWidth: '18ch', color: PISTACHIO }}>Price the deal in real time.</H2>
            </div>
            <div role="tablist" aria-label="Calculator mode" style={{ display: 'inline-flex', gap: 4, background: CARD, padding: 5, borderRadius: radius.sm }}>
              <button role="tab" aria-selected={tab === 'dscr'} onClick={() => setTab('dscr')} style={{ padding: '11px 22px', background: tab === 'dscr' ? LEMON : 'transparent', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', color: tab === 'dscr' ? MIDNIGHT : 'rgba(238,239,211,0.6)', transition: 'all .2s', minHeight: 44 }}>
                DSCR Gauge
              </button>
              <button role="tab" aria-selected={tab === 'maxprice'} onClick={() => setTab('maxprice')} style={{ padding: '11px 22px', background: tab === 'maxprice' ? LEMON : 'transparent', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', color: tab === 'maxprice' ? MIDNIGHT : 'rgba(238,239,211,0.6)', transition: 'all .2s', minHeight: 44 }}>
                Max Purchase
              </button>
            </div>
          </div>

          {/* ── DSCR TAB ── */}
          {tab === 'dscr' && (
            <div className="gs-reveal calc-panel" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>

              {/* LEFT COLUMN — inputs → PITIA breakdown → matched programs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* INPUT RAIL */}
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 30, border: '1px solid rgba(238,239,211,0.16)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 6 }}>Property inputs</div>
                <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.62)', marginBottom: 20, lineHeight: 1.5 }}>Estimates are fine — adjust any number and results update instantly.</p>
                <div style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Down payment — sets your LTV (loan ÷ value)</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{down}% · {fmt(price * down / 100)}</Mono>
                    </div>
                    <input className="gsr" aria-label="Down payment percent" type="range" step="5" min="20" max="50" value={down} onChange={e => setDown(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}><span>20%</span><span>50%</span></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Interest rate — drives P&amp;I payment</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{rate.toFixed(3)}%</Mono>
                    </div>
                    <input className="gsr" aria-label="Interest rate" type="range" step="0.125" min="4" max="12" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}><span>4%</span><span>12%</span></div>
                  </div>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>Purchase price</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.62)' }}>$</span>
                      <input className="gs-num" type="number" step="5000" value={price} onChange={e => setPrice(+e.target.value)} style={{ padding: '12px 7px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>Monthly rent</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.62)' }}>$</span>
                      <input className="gs-num" type="number" step="100" value={rent} onChange={e => setRent(+e.target.value)} style={{ padding: '12px 7px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>State — sets the tax reset &amp; insurance rules</span>
                    <div className="calc-field" style={{ padding: '0 6px 0 13px' }}>
                      <select value={stateCode} onChange={e => setStateCode(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: PISTACHIO, fontFamily: font.family, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', padding: '12px 4px', cursor: 'pointer' }}>
                        {US_STATES.map(s => <option key={s} value={s} style={{ color: '#003738' }}>{s}</option>)}
                      </select>
                    </div>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'block' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Taxes /yr</span>
                        <button type="button" onClick={() => { if (taxAuto) { setTax(estTax); setTaxAuto(false); } else { setTaxAuto(true); } }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: font.family, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: taxAuto ? '#4dbd97' : 'rgba(238,239,211,0.45)' }}>
                          {taxAuto ? '● Auto reset' : 'Manual'}
                        </button>
                      </div>
                      <div className="calc-field" style={{ display: 'flex', alignItems: 'center', opacity: taxAuto ? 0.85 : 1 }}>
                        <span style={{ color: 'rgba(238,239,211,0.62)', fontSize: 13 }}>$</span>
                        <input className="gs-num" type="number" step="250" value={taxAuto ? estTax : tax} disabled={taxAuto} onChange={e => setTax(+e.target.value)} style={{ padding: '11px 5px', fontSize: 14, fontWeight: 600 }} />
                      </div>
                    </label>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>Ins. /yr</span>
                      <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(238,239,211,0.62)', fontSize: 13 }}>$</span>
                        <input className="gs-num" type="number" step="100" value={ins} onChange={e => setIns(+e.target.value)} style={{ padding: '11px 5px', fontSize: 14, fontWeight: 600 }} />
                      </div>
                      {Math.abs(ins - estIns) > 50 && (
                        <button type="button" onClick={() => setIns(estIns)} style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: font.family, fontSize: 11, fontWeight: 600, color: LEMON, textAlign: 'left' as const }}>
                          Use est. ${estIns.toLocaleString()}/yr · {stateCode} risk
                        </button>
                      )}
                    </label>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>HOA /mo</span>
                      <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(238,239,211,0.62)', fontSize: 13 }}>$</span>
                        <input className="gs-num" type="number" step="25" min="0" value={hoa} onChange={e => setHoa(Math.max(0, +e.target.value))} style={{ padding: '11px 5px', fontSize: 14, fontWeight: 600 }} />
                      </div>
                    </label>
                  </div>
                  {taxAuto && (
                    <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', margin: '-12px 0 0', lineHeight: 1.45 }}>
                      Estimated at the <strong style={{ color: 'rgba(238,239,211,0.7)' }}>purchase-year reset</strong> — {(effTaxRate * 100).toFixed(2)}% of price in {stateCode}, not the seller&apos;s current bill. Tap Manual to override.
                    </p>
                  )}
                </div>
              </div>

              {/* PITIA breakdown — relocated beneath the input rail, always visible */}
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 24, border: '1px solid rgba(238,239,211,0.16)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 4 }}>PITIA breakdown</div>
                <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', marginBottom: 14, lineHeight: 1.4 }}>The full monthly payment — principal, interest, taxes, insurance, and any HOA dues. DSCR = monthly rent ÷ this total.</p>
                {rows.map((r, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: r.color, fontWeight: r.weight }}>{r.label}</span>
                      <Mono style={{ fontWeight: 700, color: '#eeefd3' }}>{r.val}</Mono>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(238,239,211,0.1)', overflow: 'hidden' }}>
                      <div className="gs-bar" style={{ height: '100%', width: r.pct, background: r.barColor, borderRadius: 3 }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Matched programs — relocated beneath the input rail, always visible */}
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 24, border: '1px solid rgba(238,239,211,0.16)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 4 }}>Matched programs</div>
                <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', marginBottom: 10, lineHeight: 1.4 }}>Indicative rate offsets from today's note rate. Best-tier pricing requires DSCR ≥ 1.25 and FICO ≥ 740.</p>
                {lenderRows.map((lr, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderBottom: '1px solid rgba(238,239,211,0.07)', opacity: lr.ok ? 1 : 0.45 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#eeefd3', lineHeight: 1.2 }}>
                      {lr.name}
                      {i === yourTierIdx && (
                        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: MIDNIGHT, background: '#4dbd97', borderRadius: 100, padding: '2px 8px' }}>your tier</span>
                      )}
                    </span>
                    <Mono style={{ fontSize: lr.ok ? 14 : 12, fontWeight: 700, color: lr.ok ? LEMON : 'rgba(238,239,211,0.5)' }}>{lr.ok ? lr.rate : lr.req}</Mono>
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                  <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.('lender-intel'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#4dbd97', textDecoration: 'none' }}>
                    See all programs ranked by fit →
                  </a>
                </div>
              </div>

              </div>

              {/* RESULTS — eyes guided top→down: verdict → the edge → supporting */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* ── TIER 1 · VERDICT (dominant) ── */}
                <div className="gs-reveal" style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(28px,3vw,40px)', border: `1px solid ${zoneColor}55` }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: zoneChipBg, border: `1px solid ${zoneColor}`, borderRadius: 100, padding: '6px 14px', marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: zoneColor, display: 'inline-block' }}></span>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: zoneColor }}>{verdictLabel}</span>
                  </div>
                  <div style={{ fontSize: 'clamp(20px,2vw,26px)', fontWeight: 600, color: zoneColor, letterSpacing: '-0.025em', marginBottom: 6, lineHeight: 1.15 }}>
                    {verdictHeadline}
                  </div>
                  <p style={{ fontSize: 'clamp(14px,1.2vw,16px)', fontWeight: 500, lineHeight: 1.55, color: 'rgba(238,239,211,0.72)', margin: '0 0 22px' }}>{verdictText}</p>

                  {/* Gauge + the binding constraint, side by side */}
                  <div className="dscr-verdict-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,3vw,36px)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <ClaudeDscrGauge value={dscr} size={300} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RiskFlame level={riskLevel} size={18} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>
                          {riskLevel === 'none' ? 'comfortable cushion' : riskLevel === 'low' ? 'low risk' : riskLevel === 'med' ? 'watch closely' : 'high risk'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 8 }}>Binding constraint</div>
                      {dscr >= 1.0 ? (
                        <>
                          <Mono style={{ fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, color: '#4dbd97', lineHeight: 1, display: 'block', marginBottom: 8 }}>+{headroomBps} bps</Mono>
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,239,211,0.7)', margin: 0, lineHeight: 1.5 }}>
                            Rate headroom before DSCR breaks 1.00x — the deal holds until the rate reaches ~{beRate.toFixed(2)}%. That's the number that governs this file, not the rate on the sheet.
                          </p>
                        </>
                      ) : (
                        <>
                          <Mono style={{ fontSize: 'clamp(24px,2.8vw,34px)', fontWeight: 600, color: '#e88a8a', lineHeight: 1.05, display: 'block', marginBottom: 8 }}>rent ≥ {fmt(pitia)}</Mono>
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,239,211,0.7)', margin: 0, lineHeight: 1.5 }}>
                            To clear the 1.00x floor: rent must reach {fmt(pitia)}/mo{beRate > 0 ? `, or the rate drop to ~${beRate.toFixed(2)}%` : ''}. Today rent covers {dscr.toFixed(2)}x.
                          </p>
                        </>
                      )}
                      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', fontSize: 12, color: 'rgba(238,239,211,0.62)' }}>
                        <span>{fmt(rent)} rent</span><span>·</span><span>{fmt(pitia)} PITIA</span><span>·</span>
                        <span style={{ color: cashFlow >= 0 ? '#4dbd97' : '#e88a8a', fontWeight: 600 }}>{(cashFlow >= 0 ? '+' : '') + fmt(cashFlow)}/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Niche / risk-discipline flag — honest about the hardest profile */}
                  {dscr < 1.0 && down < 25 && (
                    <div style={{ marginTop: 20, background: 'rgba(230,184,77,0.08)', border: '1px solid rgba(230,184,77,0.3)', borderLeft: '3px solid #e6b84d', borderRadius: '0 8px 8px 0', padding: '13px 16px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#e6b84d', marginBottom: 4 }}>Hardest profile to place</div>
                      <p style={{ fontSize: 13, color: 'rgba(238,239,211,0.72)', margin: 0, lineHeight: 1.5 }}>
                        Sub-1.0 coverage at {100 - down}% LTV is the file that burns lender relationships. We&apos;ll be straight with you: lift the down payment or rent until it clears, or look at a sub-1.0 program with reserves — we don&apos;t chase deals that don&apos;t pencil.
                      </p>
                    </div>
                  )}

                  {/* Dual-track "Qualifies but Dangerous" — clears the lender (Track 1)
                      but loses money after operating costs (Track 2 < 1.0). The
                      product's core warning, surfaced on the flagship tool. */}
                  {dual.qualifiesButDangerous && (
                    <div style={{ marginTop: 20, background: 'rgba(224,99,99,0.09)', border: '1px solid rgba(224,99,99,0.4)', borderLeft: '3px solid #e06363', borderRadius: '0 8px 8px 0', padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <RiskFlame level="high" size={16} />
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#e06363' }}>Qualifies but dangerous</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(238,239,211,0.72)', margin: 0, lineHeight: 1.55 }}>
                        This clears the lender at <strong style={{ color: '#eeefd3' }}>{dual.track1.toFixed(2)}x</strong>, but after typical vacancy, management, and maintenance it nets <strong style={{ color: '#e06363' }}>{dual.track2.toFixed(2)}x</strong> — below 1.00. The lender approves; the deal still loses money each month.{' '}
                        <a href="/tools/stress-matrix" onClick={(e) => { e.preventDefault(); onNavigate?.('stress-matrix'); }} style={{ color: '#4dbd97', fontWeight: 600, textDecoration: 'none' }}>Pressure-test it in the Stress Matrix →</a>
                      </p>
                    </div>
                  )}

                  {/* Loss-framed downside — concrete $ out of pocket, not abstract ratios */}
                  <div style={{ marginTop: 20, background: 'rgba(238,239,211,0.04)', border: '1px solid rgba(238,239,211,0.1)', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.6)', marginBottom: 10 }}>If things go wrong — what it costs you</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {lossScenarios.map((s) => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                          <span style={{ color: 'rgba(238,239,211,0.8)', fontWeight: 600, minWidth: 120 }}>{s.label}</span>
                          <Mono style={{ color: s.newDSCR >= 1.0 ? '#4dbd97' : '#e06363', fontWeight: 700 }}>{s.newDSCR.toFixed(2)}x</Mono>
                          <span style={{ flex: 1, textAlign: 'right' as const, color: s.monthlyShortfall > 0 ? '#e06363' : 'rgba(238,239,211,0.55)' }}>
                            {s.monthlyShortfall > 0
                              ? `−${fmt(s.monthlyShortfall)}/mo · ${fmt(s.annualOutOfPocket)}/yr from savings`
                              : `+${fmt(s.monthlyCashFlow)}/mo cushion`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── TCO show-the-math — where the real operating costs go (Behavioral §9) ── */}
                <div className="gs-reveal" style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(20px,2.4vw,28px)', border: '1px solid rgba(238,239,211,0.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON }}>Real-cost coverage — total cost of ownership</span>
                    <span style={{ fontSize: 12, color: 'rgba(238,239,211,0.55)' }}>break-even rent {fmt(tco.breakEvenRent)}/mo</span>
                  </div>
                  <div className="dc-band-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                    {[
                      { l: 'Lender (standard)', v: tco.standardDSCR },
                      { l: 'After real costs', v: tco.tcoDSCR },
                      { l: 'After tax shield', v: tco.afterTaxTcoDSCR },
                    ].map((m) => (
                      <div key={m.l}>
                        <div style={{ fontSize: 10.5, color: 'rgba(238,239,211,0.5)', marginBottom: 3, letterSpacing: '0.02em' }}>{m.l}</div>
                        <Mono style={{ fontSize: 'clamp(18px,2vw,22px)', fontWeight: 700, color: m.v >= 1.0 ? '#4dbd97' : '#e06363' }}>{m.v.toFixed(2)}x</Mono>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12.5, color: 'rgba(238,239,211,0.62)', lineHeight: 1.5 }}>
                    <span>Vacancy {fmt(tco.components.vacancy)}</span><span style={{ opacity: 0.4 }}>·</span>
                    <span>Mgmt {fmt(tco.components.management)}</span><span style={{ opacity: 0.4 }}>·</span>
                    <span>Maint {fmt(tco.components.maintenance)}</span><span style={{ opacity: 0.4 }}>·</span>
                    <span>CapEx {fmt(tco.components.capex)}</span><span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ color: 'rgba(238,239,211,0.85)', fontWeight: 600 }}>−{fmt(tco.components.total)}/mo real operating costs the lender ignores</span>
                  </div>
                </div>

                {/* ── THE AFTER-TAX EDGE — led-with differentiator ── */}
                <div className="gs-reveal" style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(22px,2.5vw,30px)', border: `1px solid ${LEMON}66` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 10 }}>The after-tax edge — what other brokers don&apos;t quote</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <Mono style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: 600, color: LEMON, lineHeight: 1 }}>≈{fmt(yr1Shelter)}</Mono>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(238,239,211,0.8)' }}>sheltered in year one</span>
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(238,239,211,0.65)', margin: '0 0 14px', lineHeight: 1.55, maxWidth: '62ch' }}>
                    Most DSCR shops quote a rate. A cost-segregation study reclassifies ~25% of the building into 5/7/15-year property that takes 100% bonus depreciation under OBBBA — roughly {fmt(yr1Shelter)} of first-year deductions on this deal. After-tax return is where serious investors actually decide.
                  </p>
                  <a href="/tools/tax-engine" onClick={(e) => { e.preventDefault(); onNavigate?.('tax-engine'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: swatch.emerald, color: MIDNIGHT, fontWeight: 700, fontSize: 13, textDecoration: 'none', padding: '10px 18px', borderRadius: radius.sm, minHeight: 44 }}>
                    See your after-tax IRR →
                  </a>
                  <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', margin: '12px 0 0', lineHeight: 1.45 }}>
                    Illustrative — depreciation depends on your basis, income, and a cost-seg study; recapture (§1250, up to 25%) and NIIT apply at sale. Confirm with a CPA.
                  </p>
                </div>

                {/* ── INSURANCE GATE (high-risk markets only) ── */}
                {insHighRisk && (
                  <div style={{ background: 'rgba(224,99,99,0.08)', border: '1px solid rgba(224,99,99,0.3)', borderLeft: '3px solid #e06363', borderRadius: '0 12px 12px 0', padding: '15px 20px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#ff8a8a', marginBottom: 5 }}>Insurance gate · {stateCode}</div>
                    <p style={{ fontSize: 13.5, color: 'rgba(238,239,211,0.78)', margin: 0, lineHeight: 1.55 }}>
                      {stateCode} is a high-risk insurance market. Get a <strong style={{ color: '#eeefd3' }}>bindable quote before you commit</strong> to this deal — an unconfirmed premium here is a stop, not a footnote. It&apos;s the other silent DSCR killer, and the number above assumes coverage you can actually buy.
                    </p>
                  </div>
                )}

                {/* ── TIER 2 · SUPPORTING — metrics + sensitivity + next step ── */}
                <div className="gs-reveal" style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(24px,2.5vw,32px)', border: '1px solid rgba(238,239,211,0.16)', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="dc-band-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                    {[
                      { v: (cashFlow >= 0 ? '+' : '') + fmt(cashFlow), c: cashFlow >= 0 ? '#4dbd97' : '#e88a8a', l: 'monthly cash flow', s: cashFlow >= 0 ? 'rent exceeds PITIA' : 'rent falls short' },
                      { v: capRate.toFixed(2) + '%', c: capRate >= 4.5 ? '#4dbd97' : capRate >= 3.5 ? LEMON : '#e6b84d', l: 'cap rate — after full costs', s: 'NOI nets all opex; 4.5%+ is healthy' },
                      { v: (100 - down) + '%', c: '#4dbd97', l: 'LTV — loan ÷ value', s: 'lower is better; 75% standard' },
                    ].map((m, i) => (
                      <div key={i} style={{ background: PANEL, borderRadius: radius.sm, padding: '16px 18px', border: '1px solid rgba(238,239,211,0.08)' }}>
                        <Mono style={{ fontSize: 'clamp(22px,2.2vw,28px)', fontWeight: 600, color: m.c, lineHeight: 1 }}>{m.v}</Mono>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginTop: 6 }}>{m.l}</div>
                        <div style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 2 }}>{m.s}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 6 }}>What moves the needle</div>
                    <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.62)', marginBottom: 12, lineHeight: 1.4 }}>How much each change shifts your DSCR — green improves it, red hurts it.</p>
                    <div className="dc-band-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {sens.map((x, i) => (
                        <div key={i} style={{ background: PANEL, borderRadius: radius.sm, padding: '13px 14px', border: '1px solid rgba(238,239,211,0.16)' }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginBottom: 5, lineHeight: 1.25 }}>{x.label}</div>
                          <Mono style={{ fontSize: 18, fontWeight: 700, color: x.color }}>{x.delta}</Mono>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderTop: '1px solid rgba(238,239,211,0.16)', paddingTop: 20 }}>
                    <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.('rate-quiz'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: swatch.emerald, color: MIDNIGHT, fontWeight: 700, fontSize: 14, textDecoration: 'none', padding: '12px 22px', borderRadius: radius.sm, minHeight: 44 }}>
                      Find my program →
                    </a>
                    <button onClick={() => (window as any).openQualify?.()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1.5px solid rgba(238,239,211,0.5)', color: 'rgba(238,239,211,0.8)', fontWeight: 600, fontSize: 14, fontFamily: font.family, padding: '12px 20px', borderRadius: radius.sm, cursor: 'pointer', minHeight: 44 }}>
                      Check if I qualify →
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', lineHeight: 1.4 }}>Preliminary estimate — not a commitment to lend.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MAX PURCHASE TAB ── */}
          {tab === 'maxprice' && (
            <div className="gs-reveal calc-panel" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 30, border: '1px solid rgba(238,239,211,0.16)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 6 }}>Work backwards from rent</div>
                <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.62)', marginBottom: 18, lineHeight: 1.5 }}>Enter your expected rent and target DSCR (the ratio you want to hit — 1.25x is a strong approval threshold). We'll calculate the maximum price you can pay and still hit that ratio.</p>
                <div style={{ display: 'grid', gap: 22 }}>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>Monthly rent</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.62)' }}>$</span>
                      <input className="gs-num" type="number" step="100" value={mRent} onChange={e => setMRent(+e.target.value)} style={{ padding: '12px 6px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Note rate</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{mRate.toFixed(3)}%</Mono>
                    </div>
                    <input className="gsr" aria-label="Note rate" type="range" step="0.125" min="4" max="12" value={mRate} onChange={e => setMRate(+e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Down payment</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{mDown}%</Mono>
                    </div>
                    <input className="gsr" aria-label="Down payment percent" type="range" step="5" min="20" max="50" value={mDown} onChange={e => setMDown(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}><span>20%</span><span>50%</span></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)' }}>Target DSCR — the ratio you want to hit</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{target.toFixed(2)}x</Mono>
                    </div>
                    <input className="gsr" aria-label="Target DSCR" type="range" step="0.05" min="0.75" max="1.50" value={target} onChange={e => setTarget(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 4 }}><span>0.75x</span><span>1.50x</span></div>
                  </div>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.62)', marginBottom: 8 }}>State — sets tax reset &amp; insurance risk</span>
                    <div className="calc-field" style={{ padding: '0 6px 0 13px' }}>
                      <select value={stateCode} onChange={e => setStateCode(e.target.value)} style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: PISTACHIO, fontFamily: font.family, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', padding: '12px 4px', cursor: 'pointer' }}>
                        {US_STATES.map(s => <option key={s} value={s} style={{ color: '#003738' }}>{s}</option>)}
                      </select>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', margin: '8px 0 0', lineHeight: 1.45 }}>
                      Taxes ({(effTaxRate * 100).toFixed(2)}%/yr reset) and insurance scale with the answer — a fixed guess would overstate your ceiling.
                    </p>
                  </label>
                </div>
              </div>
              <div>
                {/* Headline answer: scrub-able Claude gauge for target */}
                <div style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(32px,4vw,52px)', marginBottom: 20, border: '1px solid rgba(238,239,211,0.16)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 8 }}>Max purchase price at {target.toFixed(2)}x DSCR</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                    <div>
                      <Mono style={{ fontSize: 'clamp(42px,6vw,80px)', fontWeight: 600, color: PISTACHIO, lineHeight: 0.95, display: 'block' }}>{fmt(maxPrice)}</Mono>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,239,211,0.62)', marginTop: 14 }}>at {target.toFixed(2)}x target · {mRate.toFixed(3)}% · {mDown}% down</div>
                      <p style={{ fontSize: 13, color: 'rgba(238,239,211,0.62)', margin: '10px 0 0', lineHeight: 1.5 }}>
                        Pay more than this and the rent won't cover the full monthly payment at the target ratio. Use this as your bid ceiling.
                      </p>
                    </div>
                    <ClaudeDscrGauge value={target} size={170} min={0.75} max={1.5} label="Target" onValueChange={setTarget} />
                  </div>
                </div>
                <div style={{ background: CARD, borderRadius: radius.lg, padding: '24px 28px', border: '1px solid rgba(238,239,211,0.16)' }}>
                  {mRows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(238,239,211,0.07)', fontSize: 14 }}>
                      <span style={{ color: 'rgba(238,239,211,0.6)', fontWeight: 500 }}>{r.label}</span>
                      <Mono style={{ fontWeight: 700, color: PISTACHIO }}>{r.val}</Mono>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.62)', marginTop: 14, lineHeight: 1.4 }}>
                    Preliminary estimate — not a commitment to lend. Subject to full underwriting, appraisal and credit approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <BottomCTA onNavigate={(v) => onNavigate?.(v)} />
    </DcShell>
  );
}
