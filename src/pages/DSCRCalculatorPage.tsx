import React, { useState, useEffect } from "react";
import { DcShell, dc, H1, H2, H3, Lead, Btn, HeroProof, Mono } from "../design/dc";
import { PISTACHIO, MIDNIGHT, LEMON, FADED, font, swatch, radius } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";

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

export default function DscrCalculatorPage({ onBack, onNavigate }: Props) {
  useEffect(() => {
    document.title = "DSCR Calculator | Greenstreet Finance";
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

  const [mRent, setMRent] = useState(3000);
  const [mRate, setMRate] = useState(7.0);
  const [mDown, setMDown] = useState(25);
  const [mTax, setMTax] = useState(5000);
  const [mIns, setMIns] = useState(2000);
  const [target, setTarget] = useState(1.10);

  // ── Core calculations ───────────────────────────────────────────────────────
  const loan = price * (1 - down / 100);
  const pAndI = loan * pf(rate / 100);
  const pitia = pAndI + tax / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  const cashFlow = rent - pitia;
  const noi = (rent * 0.92 * 12) - tax - ins;
  const capRate = noi / price * 100;

  // ── Verdict ─────────────────────────────────────────────────────────────────
  let verdictLabel = 'BELOW FLOOR';
  let zoneColor    = '#e06363';
  let zoneChipBg   = 'rgba(224,99,99,0.12)';
  let verdictText  = 'Most lenders require DSCR ≥ 0.75. Restructure the deal or decline.';
  let verdictHeadline = 'Rent doesn\'t cover the payment — restructure or decline.';

  if (dscr >= 1.20) {
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
    const rt = o.rate ?? rate, t = o.tax ?? tax, i = o.ins ?? ins;
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
    { label: 'Taxes /mo',     val: fmt(tax / 12),   color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, (tax / 12) / pitia * 100).toFixed(0) + '%',     barColor: '#9ab87b' },
    { label: 'Insurance /mo', val: fmt(ins / 12),   color: 'rgba(238,239,211,0.6)', weight: 500, pct: Math.min(100, (ins / 12) / pitia * 100).toFixed(0) + '%',     barColor: '#9ab87b' },
    { label: 'Total PITIA',   val: fmt(pitia),      color: '#eeefd3',               weight: 700, pct: '100%',                                                         barColor: zoneColor },
  ];

  // ── Lender rows ──────────────────────────────────────────────────────────────
  const lenderRows = [
    { name: 'Best tier',        rate: Math.max(4, rate - 0.875).toFixed(3) + '%' },
    { name: 'Standard',         rate: Math.max(4, rate - 0.50).toFixed(3) + '%' },
    { name: 'Sub-1.0 program',  rate: Math.max(4, rate - 0.125).toFixed(3) + '%' },
  ];

  // ── Max Purchase ─────────────────────────────────────────────────────────────
  const maxPITIA = mRent / target;
  const maxPI    = maxPITIA - mTax / 12 - mIns / 12;
  const maxLoan  = maxPI > 0 ? maxPI / pf(mRate / 100) : 0;
  const maxPrice = maxLoan / (1 - mDown / 100);

  const mRows = [
    { label: 'Max loan amount', val: fmt(maxLoan) },
    { label: 'Down payment',    val: fmt(maxPrice - maxLoan) },
    { label: 'Max P&I /mo',     val: fmt(maxPI) },
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
        .calc-field:hover:not(:focus-within) { border-color: rgba(238,239,211,0.4); }
        .gsr { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; background: rgba(238,239,211,0.16); outline: none; cursor: pointer; }
        .gsr::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${LEMON}; border: 3px solid ${swatch.darkTeal}; cursor: pointer; transition: transform .15s; }
        .gsr::-webkit-slider-thumb:hover { transform: scale(1.16); }
        .gsr::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: ${LEMON}; border: 3px solid ${swatch.darkTeal}; cursor: pointer; }
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: MIDNIGHT, background: LEMON, padding: '7px 14px', borderRadius: 100, marginBottom: 24 }}>
              DSCR Engine · Deterministic core
            </div>
            <H1 style={{ fontSize: 'clamp(46px,7vw,108px)', lineHeight: 0.93, letterSpacing: '-0.045em', marginBottom: 26, color: PISTACHIO }}>
              Know if your<br/>rental covers<br/>the loan.
            </H1>
            <Lead style={{ color: 'rgba(238,239,211,0.68)', maxWidth: '46ch', marginBottom: 34 }}>
              Enter price, rent, rate, taxes and insurance. Get your DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger) and full PITIA breakdown instantly. No black box.
            </Lead>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
              <a href="#gs-calc" onClick={scrollToCalc} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: LEMON, color: MIDNIGHT, fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: '15px 30px', borderRadius: radius.sm, minHeight: 44 }}>
                Open the calculator ↓
              </a>
              <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.('rate-quiz'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'transparent', color: PISTACHIO, fontWeight: 600, fontSize: 16, textDecoration: 'none', padding: '15px 26px', borderRadius: radius.sm, border: '1.5px solid rgba(238,239,211,0.28)', minHeight: 44 }}>
                Find my program →
              </a>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(24px,4vw,52px)', flexWrap: 'wrap' }}>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: '#4dbd97', lineHeight: 1 }}>19</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 4 }}>verified lenders</div></div>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: '#4dbd97', lineHeight: 1 }}>50</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 4 }}>state rule sets</div></div>
              <div><Mono style={{ fontSize: 'clamp(34px,4vw,50px)', fontWeight: 600, color: LEMON, lineHeight: 1 }}>&lt;2s</Mono><div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 4 }}>to a priced deal</div></div>
            </div>
          </div>
          <HeroProof
            eyebrow="Live preview"
            value={`${dscr.toFixed(2)}x`}
            sub={`${fmt(rent)} rent ÷ ${fmt(pitia)} PITIA`}
            chip={{ label: verdictLabel, color: zoneColor }}
          />
        </div>
      </section>

      {/* ── 3-STEP EXPLAINER BAND ── */}
      <section id="gs-steps" style={{ background: PISTACHIO, padding: 'clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem)' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div className="gs-reveal dc-band-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: `${MIDNIGHT}33`, borderRadius: 9, overflow: 'hidden' }}>
            <div style={{ background: PISTACHIO, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <Mono style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, color: LEMON, marginBottom: 14, lineHeight: 1 }}>01</Mono>
              <H3 style={{ marginBottom: 10, lineHeight: 1.1 }}>Enter</H3>
              <Lead style={{ color: FADED, margin: 0 }}>Purchase price, rent, rate, taxes, insurance. Seven fields — about thirty seconds.</Lead>
            </div>
            <div style={{ background: MIDNIGHT, color: PISTACHIO, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <Mono style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, color: '#4dbd97', marginBottom: 14, lineHeight: 1 }}>02</Mono>
              <H3 style={{ marginBottom: 10, lineHeight: 1.1, color: PISTACHIO }}>Compute</H3>
              <Lead style={{ color: 'rgba(238,239,211,0.65)', margin: 0 }}>Live DSCR ratio, PITIA breakdown (the full monthly payment — principal, interest, taxes, insurance, and HOA), cash flow, cap rate. Updates as you type.</Lead>
            </div>
            <div style={{ background: LEMON, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <Mono style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, color: FADED, marginBottom: 14, lineHeight: 1 }}>03</Mono>
              <H3 style={{ marginBottom: 10, lineHeight: 1.1 }}>Match</H3>
              <Lead style={{ color: MIDNIGHT, margin: 0 }}>19 lenders ranked by fit. State PPP rule checked. Rate band. No calls needed.</Lead>
            </div>
          </div>
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
            <div style={{ display: 'inline-flex', gap: 4, background: CARD, padding: 5, borderRadius: radius.sm }}>
              <button onClick={() => setTab('dscr')} style={{ padding: '11px 22px', background: tab === 'dscr' ? LEMON : 'transparent', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', color: tab === 'dscr' ? MIDNIGHT : 'rgba(238,239,211,0.6)', transition: 'all .2s', minHeight: 44 }}>
                DSCR Gauge
              </button>
              <button onClick={() => setTab('maxprice')} style={{ padding: '11px 22px', background: tab === 'maxprice' ? LEMON : 'transparent', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', color: tab === 'maxprice' ? MIDNIGHT : 'rgba(238,239,211,0.6)', transition: 'all .2s', minHeight: 44 }}>
                Max Purchase
              </button>
            </div>
          </div>

          {/* ── DSCR TAB ── */}
          {tab === 'dscr' && (
            <div className="gs-reveal calc-panel" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>

              {/* INPUT RAIL */}
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 30, border: '1px solid rgba(238,239,211,0.1)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 6 }}>Property inputs</div>
                <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.5)', marginBottom: 20, lineHeight: 1.5 }}>Estimates are fine — adjust any number and results update instantly.</p>
                <div style={{ display: 'grid', gap: 24 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)' }}>Down payment — sets your LTV (loan ÷ value)</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{down}% · {fmt(price * down / 100)}</Mono>
                    </div>
                    <input className="gsr" type="range" step="5" min="20" max="50" value={down} onChange={e => setDown(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 4 }}><span>20%</span><span>50%</span></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)' }}>Interest rate — drives P&amp;I payment</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{rate.toFixed(3)}%</Mono>
                    </div>
                    <input className="gsr" type="range" step="0.125" min="4" max="12" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 4 }}><span>4%</span><span>12%</span></div>
                  </div>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)', marginBottom: 8 }}>Purchase price</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.4)' }}>$</span>
                      <input className="gs-num" type="number" step="5000" value={price} onChange={e => setPrice(+e.target.value)} style={{ padding: '12px 7px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)', marginBottom: 8 }}>Monthly rent</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.4)' }}>$</span>
                      <input className="gs-num" type="number" step="100" value={rent} onChange={e => setRent(+e.target.value)} style={{ padding: '12px 7px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)', marginBottom: 8 }}>Taxes /yr</span>
                      <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(238,239,211,0.4)', fontSize: 13 }}>$</span>
                        <input className="gs-num" type="number" step="250" value={tax} onChange={e => setTax(+e.target.value)} style={{ padding: '11px 5px', fontSize: 14, fontWeight: 600 }} />
                      </div>
                    </label>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)', marginBottom: 8 }}>Ins. /yr</span>
                      <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(238,239,211,0.4)', fontSize: 13 }}>$</span>
                        <input className="gs-num" type="number" step="100" value={ins} onChange={e => setIns(+e.target.value)} style={{ padding: '11px 5px', fontSize: 14, fontWeight: 600 }} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* GAUGE + VERDICT + BREAKDOWN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Big verdict card — DscrGauge + BalanceScale + verdict copy */}
                <div className="gs-reveal" style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(28px,3vw,40px)', border: '1px solid rgba(238,239,211,0.1)' }}>
                  {/* Headline answer first */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: zoneChipBg, border: `1px solid ${zoneColor}`, borderRadius: 100, padding: '6px 14px', marginBottom: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: zoneColor, display: 'inline-block' }}></span>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: zoneColor }}>{verdictLabel}</span>
                    </div>
                    <div style={{ fontSize: 'clamp(18px,1.8vw,22px)', fontWeight: 600, color: zoneColor, letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.2 }}>
                      {verdictHeadline}
                    </div>
                    <p style={{ fontSize: 'clamp(14px,1.2vw,16px)', fontWeight: 500, lineHeight: 1.55, color: 'rgba(238,239,211,0.72)', margin: 0 }}>{verdictText}</p>
                  </div>

                  {/* Artifacts row: DscrGauge + BalanceScale side by side */}
                  <div className="dscr-verdict-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(16px,3vw,36px)', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <DscrGauge value={dscr} size={180} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <RiskFlame level={riskLevel} size={20} />
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.45)' }}>
                          {riskLevel === 'none' ? 'comfortable cushion' : riskLevel === 'low' ? 'low risk' : riskLevel === 'med' ? 'watch closely' : 'high risk'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.4)', marginBottom: 4 }}>Rent vs PITIA</div>
                      <BalanceScale rent={rent} payment={pitia} size={200} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%' }}>
                        <span style={{ fontSize: 11, color: 'rgba(238,239,211,0.5)' }}>{fmt(rent)} rent</span>
                        <span style={{ fontSize: 11, color: 'rgba(238,239,211,0.5)' }}>{fmt(pitia)} PITIA</span>
                      </div>
                    </div>
                  </div>

                  {/* Next step CTA */}
                  <div style={{ background: 'rgba(238,239,211,0.06)', border: '1px solid rgba(238,239,211,0.18)', borderRadius: radius.sm, padding: '14px 18px', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 6 }}>
                      {dscr >= 1.0 ? 'Ready to move forward?' : 'Want to explore your options?'}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(238,239,211,0.65)', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {dscr >= 1.20
                        ? 'Your DSCR is strong. Check which programs you qualify for and get a rate quote.'
                        : dscr >= 1.0
                        ? 'Your DSCR meets the floor. A specialist can confirm program fit and lock your rate.'
                        : 'A Greenstreet specialist can look at sub-1.0 programs and structuring options — this is not a dead end.'}
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <a
                        href="/rate-quiz"
                        onClick={(e) => { e.preventDefault(); onNavigate?.('rate-quiz'); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: LEMON, color: MIDNIGHT, fontWeight: 700, fontSize: 13, textDecoration: 'none', padding: '10px 18px', borderRadius: radius.sm, minHeight: 44 }}
                      >
                        Find my program →
                      </a>
                      <button
                        onClick={() => (window as any).openQualify?.()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1.5px solid rgba(238,239,211,0.28)', color: 'rgba(238,239,211,0.8)', fontWeight: 600, fontSize: 13, fontFamily: font.family, padding: '10px 16px', borderRadius: radius.sm, cursor: 'pointer', minHeight: 44 }}
                      >
                        Check if I qualify →
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.38)', margin: '10px 0 0', lineHeight: 1.4 }}>
                      Preliminary estimate — not a commitment to lend. Subject to full underwriting review.
                    </p>
                  </div>

                  {/* Sensitivity — what moves the needle */}
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.4)', marginBottom: 6 }}>What moves the needle</div>
                  <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.38)', marginBottom: 12, lineHeight: 1.4 }}>Each card shows how much your DSCR would change with that adjustment — green means improvement, red means it gets worse.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {sens.map((x, i) => (
                      <div key={i} style={{ background: PANEL, borderRadius: radius.sm, padding: '13px 14px', border: '1px solid rgba(238,239,211,0.1)' }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginBottom: 5, lineHeight: 1.25 }}>{x.label}</div>
                        <Mono style={{ fontSize: 18, fontWeight: 700, color: x.color }}>{x.delta}</Mono>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom trio: PITIA bars | metrics | lenders */}
                <div className="bottom-trio" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 1fr', gap: 24, alignItems: 'start' }}>

                  {/* PITIA breakdown */}
                  <div style={{ background: CARD, borderRadius: radius.lg, padding: 24, border: '1px solid rgba(238,239,211,0.1)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 4 }}>PITIA breakdown</div>
                    <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.4)', marginBottom: 14, lineHeight: 1.4 }}>The full monthly payment — principal, interest, taxes, insurance, and any HOA dues. DSCR = monthly rent ÷ this total.</p>
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

                  {/* Metrics stack */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(238,239,211,0.1)', borderRadius: radius.lg, overflow: 'hidden', border: '1px solid rgba(238,239,211,0.1)' }}>
                    <div style={{ background: CARD, padding: '18px 20px' }}>
                      <Mono style={{ fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 600, color: cashFlow >= 0 ? '#4dbd97' : '#e88a8a' }}>{(cashFlow >= 0 ? '+' : '') + fmt(cashFlow)}</Mono>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 3 }}>monthly cash flow</div>
                      <div style={{ fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 2 }}>{cashFlow >= 0 ? 'Rent exceeds PITIA' : 'Rent falls short of PITIA'}</div>
                    </div>
                    <div style={{ background: CARD, padding: '18px 20px' }}>
                      <Mono style={{ fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 600, color: LEMON }}>{capRate.toFixed(2)}%</Mono>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 3 }}>cap rate</div>
                      <div style={{ fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 2 }}>6%+ is generally healthy</div>
                    </div>
                    <div style={{ background: CARD, padding: '18px 20px' }}>
                      <Mono style={{ fontSize: 'clamp(22px,2.4vw,30px)', fontWeight: 600, color: '#4dbd97' }}>{100 - down}%</Mono>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: 3 }}>LTV — loan ÷ value</div>
                      <div style={{ fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 2 }}>lower is better; 75% is standard</div>
                    </div>
                  </div>

                  {/* Lender matches */}
                  <div style={{ background: CARD, borderRadius: radius.lg, padding: 24, border: '1px solid rgba(238,239,211,0.1)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 4 }}>Matched programs</div>
                    <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.4)', marginBottom: 10, lineHeight: 1.4 }}>Indicative rate offsets from today's note rate. Best-tier pricing requires DSCR ≥ 1.25 and FICO ≥ 740.</p>
                    {lenderRows.map((lr, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(238,239,211,0.07)' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#eeefd3', lineHeight: 1.2 }}>{lr.name}</span>
                        <Mono style={{ fontSize: 14, fontWeight: 700, color: LEMON }}>{lr.rate}</Mono>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
                      <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.('lender-intel'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#4dbd97', textDecoration: 'none' }}>
                        See all 19 programs →
                      </a>
                      <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.('rate-quiz'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: LEMON, textDecoration: 'none', opacity: 0.85 }}>
                        Which program fits me? →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MAX PURCHASE TAB ── */}
          {tab === 'maxprice' && (
            <div className="gs-reveal calc-panel" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'start' }}>
              <div style={{ background: CARD, borderRadius: radius.lg, padding: 30, border: '1px solid rgba(238,239,211,0.1)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: '#4dbd97', marginBottom: 6 }}>Work backwards from rent</div>
                <p style={{ fontSize: 12, color: 'rgba(238,239,211,0.45)', marginBottom: 18, lineHeight: 1.5 }}>Enter your expected rent and target DSCR (the ratio you want to hit — 1.25x is a strong approval threshold). We'll calculate the maximum price you can pay and still hit that ratio.</p>
                <div style={{ display: 'grid', gap: 22 }}>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)', marginBottom: 8 }}>Monthly rent</span>
                    <div className="calc-field" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(238,239,211,0.4)' }}>$</span>
                      <input className="gs-num" type="number" step="100" value={mRent} onChange={e => setMRent(+e.target.value)} style={{ padding: '12px 6px', fontSize: 16, fontWeight: 600 }} />
                    </div>
                  </label>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)' }}>Note rate</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{mRate.toFixed(3)}%</Mono>
                    </div>
                    <input className="gsr" type="range" step="0.125" min="4" max="12" value={mRate} onChange={e => setMRate(+e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' as const, color: 'rgba(238,239,211,0.5)' }}>Target DSCR — the ratio you want to hit</span>
                      <Mono style={{ fontSize: 14, fontWeight: 600, color: LEMON }}>{target.toFixed(2)}x</Mono>
                    </div>
                    <input className="gsr" type="range" step="0.05" min="0.75" max="1.50" value={target} onChange={e => setTarget(+e.target.value)} style={{ width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(238,239,211,0.35)', marginTop: 4 }}><span>0.75x</span><span>1.50x</span></div>
                  </div>
                </div>
              </div>
              <div>
                {/* Headline answer: DscrGauge for target */}
                <div style={{ background: CARD, borderRadius: radius.lg, padding: 'clamp(32px,4vw,52px)', marginBottom: 20, border: '1px solid rgba(238,239,211,0.1)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: LEMON, marginBottom: 8 }}>Max purchase price at {target.toFixed(2)}x DSCR</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                    <div>
                      <Mono style={{ fontSize: 'clamp(42px,6vw,80px)', fontWeight: 600, color: PISTACHIO, lineHeight: 0.95, display: 'block' }}>{fmt(maxPrice)}</Mono>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginTop: 14 }}>at {target.toFixed(2)}x target · {mRate.toFixed(3)}% · {mDown}% down</div>
                      <p style={{ fontSize: 13, color: 'rgba(238,239,211,0.45)', margin: '10px 0 0', lineHeight: 1.5 }}>
                        Pay more than this and the rent won't cover the full monthly payment at the target ratio. Use this as your bid ceiling.
                      </p>
                    </div>
                    <DscrGauge value={target} size={140} />
                  </div>
                </div>
                <div style={{ background: CARD, borderRadius: radius.lg, padding: '24px 28px', border: '1px solid rgba(238,239,211,0.1)' }}>
                  {mRows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(238,239,211,0.07)', fontSize: 14 }}>
                      <span style={{ color: 'rgba(238,239,211,0.6)', fontWeight: 500 }}>{r.label}</span>
                      <Mono style={{ fontWeight: 700, color: PISTACHIO }}>{r.val}</Mono>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: 'rgba(238,239,211,0.38)', marginTop: 14, lineHeight: 1.4 }}>
                    Preliminary estimate — not a commitment to lend. Subject to full underwriting, appraisal and credit approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </DcShell>
  );
}
