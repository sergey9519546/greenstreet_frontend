import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PISTACHIO, MINT_BG, MIDNIGHT, RAINFOREST, LEMON, FADED, font, swatch, radius } from "../theme";
import { HeroProof } from "../design/dc";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

gsap.registerPlugin(ScrollTrigger);

const pf = (r: number) => {
  if (r === 0) return 0;
  const m = r / 12;
  return (m * Math.pow(1 + m, 360)) / (Math.pow(1 + m, 360) - 1);
};

const fmt = (n: number) => {
  return '$' + Math.round(n).toLocaleString('en-US');
};

export default function DscrCalculatorPage({ onBack, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  useGSAP(() => {
    const hc = document.querySelector('#gs-hero-content');
    if (hc) {
      gsap.from(hc.children, { y: 44, opacity: 0, duration: 0.9, stagger: 0.13, ease: 'power3.out', clearProps: 'all' });
      hc.querySelectorAll('[data-count]').forEach((el) => {
        const end = +(el.getAttribute('data-count') || 0);
        const obj = { n: 0 };
        gsap.to(obj, {
          n: end,
          duration: 1.6,
          delay: 1.0,
          ease: 'power2.out',
          onUpdate: function() {
            if (el) el.textContent = Math.round(obj.n).toString();
          }
        });
      });
    }

    document.querySelectorAll('.gs-reveal').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    
    setTimeout(() => { ScrollTrigger.refresh(); }, 200);
  }, { scope: containerRef });

  const loan = price * (1 - down / 100);
  const pAndI = loan * pf(rate / 100);
  const pitia = pAndI + tax / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  const cashFlow = rent - pitia;
  const noi = (rent * 0.92 * 12) - tax - ins;
  const capRate = noi / price * 100;

  let verdictLabel = 'BELOW FLOOR';
  let verdictBg = 'rgba(211,47,47,0.08)';
  let verdictBorder = '#d32f2f';
  let verdictText = 'Most lenders require DSCR >= 0.75. Restructure or decline.';
  
  if (dscr >= 1.20) {
    verdictLabel = 'GREEN DEAL';
    verdictBg = 'rgba(0,101,101,0.06)';
    verdictBorder = RAINFOREST;
    verdictText = 'Strong cushion. Qualifies with most DSCR lenders at standard pricing.';
  } else if (dscr >= 1.00) {
    verdictLabel = 'QUALIFIES';
    verdictBg = 'rgba(161,98,7,0.10)';
    verdictBorder = '#a16207';
    verdictText = 'Meets the 1.00 floor. Verify lender minimums and compensating factors.';
  } else if (dscr >= 0.75) {
    verdictLabel = 'SUB-1.0';
    verdictBg = 'rgba(1,133,130,0.08)';
    verdictBorder = '#018582';
    verdictText = 'Some lenders accept 0.75+ with strong FICO, reserves, or lower LTV.';
  }

  const rows = [
    { label: 'Loan amount', val: fmt(loan), color: FADED, weight: 500, pct: Math.min(100, loan / price * 100).toFixed(0) + '%', barColor: swatch.emerald },
    { label: 'P&I monthly', val: fmt(pAndI), color: FADED, weight: 500, pct: Math.min(100, pAndI / pitia * 100).toFixed(0) + '%', barColor: RAINFOREST },
    { label: 'Taxes /mo', val: fmt(tax / 12), color: FADED, weight: 500, pct: Math.min(100, (tax / 12) / pitia * 100).toFixed(0) + '%', barColor: '#9ab87b' },
    { label: 'Insurance /mo', val: fmt(ins / 12), color: FADED, weight: 500, pct: Math.min(100, (ins / 12) / pitia * 100).toFixed(0) + '%', barColor: '#9ab87b' },
    { label: 'Total PITIA', val: fmt(pitia), color: MIDNIGHT, weight: 700, pct: '100%', barColor: verdictBorder },
  ];

  const lenderRows = [
    { name: 'Greenstreet DSCR - Best tier', rate: Math.max(4, rate - 0.875).toFixed(3) + '%' },
    { name: 'Greenstreet DSCR - Standard', rate: Math.max(4, rate - 0.50).toFixed(3) + '%' },
    { name: 'Greenstreet DSCR - Sub-1.0', rate: Math.max(4, rate - 0.125).toFixed(3) + '%' },
  ];

  const maxPITIA = mRent / target;
  const maxPI = maxPITIA - mTax / 12 - mIns / 12;
  const maxLoan = maxPI > 0 ? maxPI / pf(mRate / 100) : 0;
  const maxPrice = maxLoan / (1 - mDown / 100);

  const mRows = [
    { label: 'Max loan amount', val: fmt(maxLoan) },
    { label: 'Down payment', val: fmt(maxPrice - maxLoan) },
    { label: 'Max P&I /mo', val: fmt(maxPI) },
    { label: 'Max PITIA /mo', val: fmt(maxPITIA) },
  ];

  const scrollToCalc = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector('#gs-calc');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} style={{ background: PISTACHIO, color: MIDNIGHT, fontFamily: font.family, minHeight: '100vh', overflowX: 'hidden', letterSpacing: '-0.02em' }}>
      <style>{`
        .gs-num::-webkit-outer-spin-button, .gs-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .gs-num { width: 100%; border: none; background: none; outline: none; font-family: ${font.family}; color: ${MIDNIGHT}; letter-spacing: -0.02em; }
        .gs-range { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 999px; background: ${FADED}33; outline: none; cursor: pointer; }
        .gs-range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: ${MIDNIGHT}; border: 3px solid ${LEMON}; cursor: pointer; transition: transform .15s; }
        .gs-range::-webkit-slider-thumb:hover { transform: scale(1.18); }
        .gs-dot-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px); background-size: 34px 34px; pointer-events: none; }
        @keyframes gsFloat { from, to { transform: none; } }
        @keyframes gsPulse { from, to { opacity: 1; } }
        @keyframes gsBar { from { width: 0; } }
        .gs-mono { font-variant-numeric: tabular-nums; }
        nav a:focus-visible, nav button:focus-visible { outline: 2px solid ${LEMON}; outline-offset: 3px; border-radius: 6px; }
        @media (max-width: 900px) { #gs-hero-inner { grid-template-columns: 1fr !important; gap: 40px !important; } .dc-band-3, .dc-split { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .nav-sec { display: none !important; } }
        @media (prefers-reduced-motion: reduce) { *{ animation: none !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: MIDNIGHT, borderBottom: '1px solid rgba(238,239,211,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(1.5rem,4vw,3rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.04em', color: PISTACHIO, textDecoration: 'none' }}>Greenstreet</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <a className="nav-sec" href="/lender-intel" style={{ color: 'rgba(238,239,211,0.78)', fontWeight: 500, textDecoration: 'none', fontSize: '15px', letterSpacing: '-0.01em' }}>Lender Intel</a>
            <a className="nav-sec" href="/state-laws" style={{ color: 'rgba(238,239,211,0.78)', fontWeight: 500, textDecoration: 'none', fontSize: '15px', letterSpacing: '-0.01em' }}>State Rules</a>
            <a href="#gs-calc" onClick={scrollToCalc} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: LEMON, color: MIDNIGHT, fontWeight: 600, fontSize: '14px', textDecoration: 'none', padding: '11px 22px', borderRadius: '6px' }}>Run a deal →</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="gs-hero" style={{ position: 'relative', background: MIDNIGHT, color: PISTACHIO, overflow: 'hidden', minHeight: 'clamp(480px,60vh,760px)', display: 'flex', alignItems: 'center' }}>
        <div className="gs-dot-grid"></div>
        <div id="gs-hero-inner" className="dc-hero" style={{ position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,7vh,88px) clamp(1.5rem,4vw,3rem)', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
          <div id="gs-hero-content">
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: LEMON, marginBottom: '22px' }}>DSCR Engine · Track 1 · Deterministic</div>
            <h1 style={{ fontSize: 'clamp(48px,7.5vw,116px)', fontWeight: 600, lineHeight: 0.93, letterSpacing: '-0.04em', margin: '0 0 28px' }}>Run the DSCR<br/>before you<br/>run the deal.</h1>
            <p style={{ fontSize: 'clamp(17px,1.5vw,22px)', fontWeight: 500, lineHeight: 1.5, letterSpacing: '-0.02em', color: 'rgba(238,239,211,0.7)', maxWidth: '48ch', margin: '0 0 36px' }}>The exact math lenders qualify against. Purchase price, rent, rate, taxes &mdash; to a live DSCR and PITIA breakdown. No black box.</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <a href="#gs-calc" onClick={scrollToCalc} style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: LEMON, color: MIDNIGHT, fontWeight: 600, fontSize: '16px', textDecoration: 'none', padding: '15px 30px', borderRadius: '6px' }}>Open the calculator ↓</a>
              <a href="/lender-intel" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'transparent', color: PISTACHIO, fontWeight: 600, fontSize: '16px', textDecoration: 'none', padding: '15px 26px', borderRadius: '6px', border: '1px solid rgba(238,239,211,0.3)' }}>See lenders</a>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(24px,4vw,52px)', flexWrap: 'wrap' }}>
              <div><div data-count="19" style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: swatch.emerald, fontFamily: font.mono, lineHeight: 1 }}>0</div><div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginTop: '4px' }}>verified lenders</div></div>
              <div><div data-count="50" style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: swatch.emerald, fontFamily: font.mono, lineHeight: 1 }}>0</div><div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginTop: '4px' }}>state rule sets</div></div>
              <div><div style={{ fontSize: 'clamp(36px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: LEMON, fontFamily: font.mono, lineHeight: 1 }}>&lt;2s</div><div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginTop: '4px' }}>to a priced deal</div></div>
            </div>
          </div>
          <HeroProof
            eyebrow="Live preview"
            value={`${dscr.toFixed(2)}x`}
            sub={`${fmt(rent)} rent ÷ ${fmt(pitia)} PITIA`}
            chip={{ label: verdictLabel, color: verdictBorder }}
          />
        </div>
      </section>

      {/* EXPLAINER — rendered HyperFrames loop introducing the DSCR calculator */}
      <section style={{ background: MIDNIGHT, padding: `0 clamp(1.5rem,4vw,3rem) clamp(40px,5vw,64px)` }}>
        <div className="gs-reveal" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <video
            src="/video/dscr-explainer.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', display: 'block', borderRadius: 16, border: '1px solid rgba(238,239,211,0.18)', aspectRatio: '16 / 9', objectFit: 'cover', background: MIDNIGHT }}
          />
        </div>
      </section>

      {/* 3-STEP EXPLAINER BAND */}
      <section id="gs-steps" style={{ background: PISTACHIO, padding: 'clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="gs-reveal dc-band-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: `${FADED}33`, borderRadius: '9px', overflow: 'hidden' }}>
            <div style={{ background: PISTACHIO, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <div style={{ fontFamily: font.mono, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: LEMON, marginBottom: '14px', lineHeight: 1 }}>01</div>
              <h3 style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1.1 }}>Enter</h3>
              <p style={{ fontSize: 'clamp(15px,1.2vw,17px)', fontWeight: 500, lineHeight: 1.55, color: FADED, margin: 0, letterSpacing: '-0.01em' }}>Purchase price, rent, rate, taxes, insurance. Seven fields &mdash; thirty seconds.</p>
            </div>
            <div style={{ background: MIDNIGHT, color: PISTACHIO, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <div style={{ fontFamily: font.mono, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: swatch.emerald, marginBottom: '14px', lineHeight: 1 }}>02</div>
              <h3 style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1.1, color: PISTACHIO }}>Compute</h3>
              <p style={{ fontSize: 'clamp(15px,1.2vw,17px)', fontWeight: 500, lineHeight: 1.55, color: 'rgba(238,239,211,0.65)', margin: 0, letterSpacing: '-0.01em' }}>Live DSCR ratio, PITIA breakdown, cash flow, cap rate. Updates as you type.</p>
            </div>
            <div style={{ background: LEMON, padding: 'clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)' }}>
              <div style={{ fontFamily: font.mono, fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, letterSpacing: '-0.03em', color: FADED, marginBottom: '14px', lineHeight: 1 }}>03</div>
              <h3 style={{ fontSize: 'clamp(20px,2.2vw,28px)', fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 10px', lineHeight: 1.1 }}>Match</h3>
              <p style={{ fontSize: 'clamp(15px,1.2vw,17px)', fontWeight: 500, lineHeight: 1.55, color: MIDNIGHT, margin: 0, letterSpacing: '-0.01em' }}>19 lenders ranked by fit. State PPP rule checked. Rate band. No calls needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="gs-calc" style={{ background: PISTACHIO, padding: 'clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem) clamp(72px,10vh,128px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="gs-reveal" style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: RAINFOREST, marginBottom: '12px' }}>Live calculator</div>
            <h2 style={{ fontSize: 'clamp(30px,3.8vw,52px)', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.0, margin: 0, maxWidth: '20ch' }}>Price the deal in real time.</h2>
          </div>

          {/* TABS */}
          <div className="gs-reveal" style={{ display: 'flex', gap: '6px', marginBottom: '36px', borderBottom: `2px solid ${FADED}33` }}>
            <button onClick={() => setTab('dscr')} style={{ padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', marginBottom: '-2px', borderBottom: `2px solid ${tab === 'dscr' ? RAINFOREST : 'transparent'}`, color: tab === 'dscr' ? RAINFOREST : FADED }}>DSCR Calculator</button>
            <button onClick={() => setTab('maxprice')} style={{ padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, fontFamily: font.family, letterSpacing: '-0.01em', marginBottom: '-2px', borderBottom: `2px solid ${tab === 'maxprice' ? RAINFOREST : 'transparent'}`, color: tab === 'maxprice' ? RAINFOREST : FADED }}>Max Purchase</button>
          </div>

          {/* DSCR TAB */}
          {tab === 'dscr' && (
            <div className="gs-reveal dc-split" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '36px', alignItems: 'start' }}>
              {/* INPUTS */}
              <div style={{ background: '#fff', borderRadius: radius.sm, padding: '32px', border: `1px solid ${FADED}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: RAINFOREST, marginBottom: '22px' }}>Property inputs</div>
                <div style={{ display: 'grid', gap: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Down Payment ({down}% -&gt; {fmt(price * down / 100)})</label>
                    <input className="gs-num gs-range" type="range" step="5" min="20" max="50" value={down} onChange={e => setDown(+e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: FADED, marginTop: '4px' }}><span>20%</span><span>50%</span></div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Note Rate ({rate.toFixed(3)}%)</label>
                    <input className="gs-num gs-range" type="range" step="0.125" min="4" max="12" value={rate} onChange={e => setRate(+e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: FADED, marginTop: '4px' }}><span>4%</span><span>12%</span></div>
                  </div>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Purchase Price</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: PISTACHIO, borderRadius: '6px', padding: '0 13px' }}>
                      <span style={{ color: FADED }}>$</span>
                      <input className="gs-num" type="number" step="5000" value={price} onChange={e => setPrice(+e.target.value)} style={{ padding: '11px 7px', fontSize: '16px', fontWeight: 600 }} />
                    </div>
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Monthly Rent</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: PISTACHIO, borderRadius: '6px', padding: '0 13px' }}>
                      <span style={{ color: FADED }}>$</span>
                      <input className="gs-num" type="number" step="100" value={rent} onChange={e => setRent(+e.target.value)} style={{ padding: '11px 7px', fontSize: '16px', fontWeight: 600 }} />
                    </div>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Annual Taxes</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: PISTACHIO, borderRadius: '6px', padding: '0 10px' }}>
                        <span style={{ color: FADED, fontSize: '13px' }}>$</span>
                        <input className="gs-num" type="number" step="250" value={tax} onChange={e => setTax(+e.target.value)} style={{ padding: '10px 5px', fontSize: '14px', fontWeight: 600 }} />
                      </div>
                    </label>
                    <label style={{ display: 'block' }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '8px' }}>Annual Ins.</span>
                      <div style={{ display: 'flex', alignItems: 'center', background: PISTACHIO, borderRadius: '6px', padding: '0 10px' }}>
                        <span style={{ color: FADED, fontSize: '13px' }}>$</span>
                        <input className="gs-num" type="number" step="100" value={ins} onChange={e => setIns(+e.target.value)} style={{ padding: '10px 5px', fontSize: '14px', fontWeight: 600 }} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* RESULTS: big DSCR + breakdown + lenders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ background: verdictBg, border: `2px solid ${verdictBorder}`, borderRadius: '12px', padding: 'clamp(28px,3.5vw,44px)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div id="gs-dscr-big" style={{ fontFamily: font.mono, fontSize: 'clamp(72px,9vw,128px)', fontWeight: 600, letterSpacing: '-0.04em', color: MIDNIGHT, lineHeight: 0.9 }}>{dscr.toFixed(2)}x</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: verdictBorder, marginTop: '10px' }}>{verdictLabel}</div>
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.55, color: MIDNIGHT, margin: '0 0 18px', letterSpacing: '-0.01em' }}>{verdictText}</p>
                    {rows.map((r, i) => (
                      <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ color: r.color, fontWeight: r.weight }}>{r.label}</span>
                          <span style={{ fontWeight: 700, color: MIDNIGHT, fontFamily: font.mono }}>{r.val}</span>
                        </div>
                        <div style={{ height: '4px', borderRadius: '2px', background: `${FADED}22`, overflow: 'hidden' }}>
                          <div className="gs-bar" style={{ height: '100%', width: r.pct, background: r.barColor, borderRadius: '2px', animation: 'gsBar .8s ease-out both' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* METRICS ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: `${FADED}33`, borderRadius: '9px', overflow: 'hidden' }}>
                  <div style={{ background: PISTACHIO, padding: '22px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 600, letterSpacing: '-0.03em', color: cashFlow >= 0 ? RAINFOREST : '#d32f2f', fontFamily: font.mono }}>{(cashFlow >= 0 ? '+' : '') + fmt(cashFlow)}</div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: FADED, marginTop: '5px', letterSpacing: '-0.01em' }}>monthly cash flow</div>
                  </div>
                  <div style={{ background: MIDNIGHT, padding: '22px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 600, letterSpacing: '-0.03em', color: LEMON, fontFamily: font.mono }}>{capRate.toFixed(2)}%</div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(238,239,211,0.5)', marginTop: '5px', letterSpacing: '-0.01em' }}>cap rate</div>
                  </div>
                  <div style={{ background: PISTACHIO, padding: '22px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 600, letterSpacing: '-0.03em', color: RAINFOREST, fontFamily: font.mono }}>{(100 - down)}%</div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: FADED, marginTop: '5px', letterSpacing: '-0.01em' }}>LTV</div>
                  </div>
                </div>
                {/* LENDER MATCHES */}
                <div style={{ background: '#fff', borderRadius: radius.sm, padding: '24px 28px', border: `1px solid ${FADED}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: RAINFOREST, marginBottom: '14px' }}>Matched programs</div>
                  {lenderRows.map((lr, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${FADED}1f` }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: MIDNIGHT, letterSpacing: '-0.01em' }}>{lr.name}</span>
                      <span style={{ fontFamily: font.mono, fontSize: '14px', fontWeight: 700, color: RAINFOREST }}>{lr.rate}</span>
                    </div>
                  ))}
                  <a href="/lender-intel" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: RAINFOREST, textDecoration: 'none', marginTop: '14px', letterSpacing: '-0.01em' }}>See all 19 programs →</a>
                </div>
              </div>
            </div>
          )}

          {/* MAX PURCHASE TAB */}
          {tab === 'maxprice' && (
            <div className="gs-reveal" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '36px', alignItems: 'start' }}>
              <div style={{ background: '#fff', borderRadius: radius.sm, padding: '28px', border: `1px solid ${FADED}` }}>
                <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: RAINFOREST, marginBottom: '20px' }}>Target parameters</div>
                <div style={{ display: 'grid', gap: '18px' }}>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '7px' }}>Monthly Rent</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: PISTACHIO, borderRadius: '6px', padding: '0 12px' }}>
                      <span style={{ color: FADED }}>$</span>
                      <input className="gs-num" type="number" step="100" value={mRent} onChange={e => setMRent(+e.target.value)} style={{ padding: '11px 6px', fontSize: '16px', fontWeight: 600 }} />
                    </div>
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '7px' }}>Note Rate ({mRate.toFixed(3)}%)</span>
                    <input className="gs-range" type="range" step="0.125" min="4" max="12" value={mRate} onChange={e => setMRate(+e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: FADED, marginBottom: '7px' }}>Target DSCR ({target.toFixed(2)}x)</span>
                    <input className="gs-range" type="range" step="0.05" min="0.75" max="1.50" value={target} onChange={e => setTarget(+e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
                  </label>
                </div>
              </div>
              <div>
                <div style={{ background: MIDNIGHT, borderRadius: '12px', padding: 'clamp(28px,3.5vw,44px)', textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: LEMON, marginBottom: '14px' }}>Max purchase price</div>
                  <div style={{ fontFamily: font.mono, fontSize: 'clamp(56px,8vw,108px)', fontWeight: 600, letterSpacing: '-0.04em', color: PISTACHIO, lineHeight: 0.95 }}>{fmt(maxPrice)}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(238,239,211,0.55)', marginTop: '16px', letterSpacing: '-0.01em' }}>at {target.toFixed(2)}x target . {mRate.toFixed(3)}% . {mDown}% down</div>
                </div>
                <div style={{ background: '#fff', borderRadius: radius.sm, padding: '22px 26px', border: `1px solid ${FADED}` }}>
                  {mRows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${FADED}1f`, fontSize: '14px' }}>
                      <span style={{ color: FADED, fontWeight: 500 }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: MIDNIGHT, fontFamily: font.mono }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer style={{ background: MIDNIGHT, color: 'rgba(238,239,211,0.55)', padding: '48px clamp(1.5rem,4vw,3rem)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.04em', color: PISTACHIO }}>Greenstreet</div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>© 2026 Greenstreet Finance</div>
        </div>
      </footer>
    </div>
  );
}
