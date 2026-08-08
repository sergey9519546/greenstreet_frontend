import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { swatch, radius } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr } from "../design/artifacts";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const DA_ACCENT = swatch.pistachio;
const DA_NAV_BORDER = `1px solid ${swatch.midnightFaded}`;

export default function DealAnalyzerPage({ onBack, onNavigate }: Props) {
  useEffect(() => {
    document.title = "Deal Analyzer | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // --- Inputs ---
  const [price, setPrice] = useState(425000);
  const [down, setDown] = useState(25);
  const [rent, setRent] = useState(3000);
  const [rate, setRate] = useState(7.0);
  const [tax, setTax] = useState(5000);
  const [ins, setIns] = useState(2000);
  const [hoa, setHoa] = useState(0);
  const [stateCode, setStateCode] = useState("TX");

  // --- Engine computation ---
  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const piMo = r > 0 ? (loan * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1) : 0;
  const pitia = piMo + tax / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  const cashFlow = rent - pitia;
  const noi = rent * 0.92 * 12 - tax - ins;
  const capRate = (noi / price) * 100;
  const debtYield = loan > 0 ? (noi / loan) * 100 : 0;
  const ltv = 100 - down;

  // --- Verdict ---
  let vLabel = "DEAL BREAK";
  let verdictColor = "#ff6b6b";
  let verdictBg = "rgba(74,21,21,0.07)";
  let verdictBorder = "#ff6b6b";
  let verdictHeadline = "Rent doesn't cover the payment — most lenders decline at this level.";
  let verdictNote =
    "DSCR below 0.75x — the rent doesn't come close to covering the payment. Consider a higher-rent property, more down payment, or a lower rate.";
  let nextStep = "A Greenstreet specialist can review sub-0.75 situations and explore structuring options — don't assume it's a dead end.";

  if (dscr >= 1.25) {
    vLabel = "STRONG";
    verdictColor = dc.rain;
    verdictBg = "rgba(0,101,101,0.06)";
    verdictBorder = dc.rain;
    verdictHeadline = "Strong deal — rent comfortably covers the full monthly payment.";
    verdictNote = "DSCR ≥ 1.25x qualifies at best-tier pricing with most DSCR programs. Good cap rate and debt yield are a bonus.";
    nextStep = "Get a rate quote — this deal should move quickly.";
  } else if (dscr >= 1.0) {
    vLabel = "QUALIFIES";
    verdictColor = dc.lemon;
    verdictBg = "rgba(216,217,88,0.10)";
    verdictBorder = dc.lemon;
    verdictHeadline = "Qualifies — rent meets or exceeds the full monthly payment.";
    verdictNote = "Meets the 1.0x floor. Check lender-specific minimums, reserve requirements, and compensating factors (higher FICO, lower LTV) before locking.";
    nextStep = "Run the program matcher to confirm which lenders accept your deal at these numbers.";
  } else if (dscr >= 0.75) {
    vLabel = "SUB-1.0";
    verdictColor = "#e6b84d";
    verdictBg = "rgba(230,184,77,0.08)";
    verdictBorder = "#e6b84d";
    verdictHeadline = "Below 1.0 — rent falls short, but sub-1.0 programs may apply.";
    verdictNote = "Some lenders accept 0.75–1.0x with strong credit (680+), lower LTV, or extra reserves. Not a dead end — but you'll need to bring compensating factors.";
    nextStep = "Ask your Greenstreet contact about sub-1.0 programs and what compensating factors they require.";
  }

  const riskLevel = riskFromDscr(dscr);

  // --- State PPP rule ---
  const adjMap: Record<string, { adj: number; ppp: string; extra: string }> = {
    NJ: { adj: 0.25, ppp: "PPP HIGH-RISK for LLC; C-Corp/S-Corp only.", extra: "Some lenders decline or reprice." },
    MD: { adj: 0.5,  ppp: "PPP de facto prohibited.", extra: "Most DSCR lenders decline." },
    KS: { adj: 0.5,  ppp: "PPP de facto prohibited.", extra: "Most DSCR lenders decline." },
    MN: { adj: 0.1,  ppp: "Business-purpose ALLOWED (HF 3437 eff. 8/1/2026).", extra: "Consumer still prohibited." },
    NY: { adj: 0.25, ppp: "Business-purpose ALLOWED; criminal usury cap 25%.", extra: "Banking Law 6-l." },
    TX: { adj: 0,    ppp: "No state PPP restrictions for business-purpose DSCR.", extra: "Standard pricing applies." },
  };
  const sa = adjMap[stateCode.toUpperCase()] || { adj: 0, ppp: "No state PPP restrictions for business-purpose DSCR.", extra: "Standard pricing applies." };

  // --- Greenstreet programs ---
  const programs = [
    { name: "Greenstreet DSCR — Best tier",    rateStr: (rate + sa.adj - 0.875).toFixed(3) + "%" },
    { name: "Greenstreet DSCR — Standard",     rateStr: (rate + sa.adj - 0.5).toFixed(3) + "%" },
    { name: "Greenstreet DSCR — Sub-1.0",      rateStr: (rate + sa.adj - 0.1).toFixed(3) + "%" },
    { name: "Greenstreet DSCR — Multi-Family", rateStr: (rate + sa.adj).toFixed(3) + "%" },
    { name: "Greenstreet DSCR — Global",       rateStr: (rate + sa.adj + 0.1).toFixed(3) + "%" },
  ];

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#da-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={DA_ACCENT}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lenders", view: "lender-intel" },
      ]}
      cta={{ label: "Analyze a deal →", onClick: scrollToTool }}
    >
      <style>{`
        .da-num::-webkit-outer-spin-button,.da-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .da-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.dark};letter-spacing:-0.02em;}
        .da-field{display:flex;align-items:center;background:${swatch.pistachio};border:1.5px solid ${swatch.midnightFaded};border-radius:${radius.sm};padding:0 12px;transition:border-color .15s;}
        .da-field:focus-within{border-color:${swatch.lemon};outline:2px solid ${swatch.lemon};outline-offset:1px;border-radius:${radius.sm};}
        .da-field:hover:not(:focus-within){border-color:rgba(0,55,56,0.35);}
        .dc-nav a{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a[style*="background"]{color:${dc.cream} !important;}
        .dc-nav a.dc-cta{background:${dc.dark} !important;color:${dc.cream} !important;}
        .dc-nav{border-bottom:${DA_NAV_BORDER} !important;background:${swatch.pistachio} !important;}
        footer{color:rgba(0,55,56,0.55) !important;}
        footer div[style]{color:${dc.dark} !important;}
        @media (max-width: 991px) { .da-tool-grid { grid-template-columns: 1fr !important; } .da-hero-grid { grid-template-columns: 1fr !important; } .da-verdict-grid { grid-template-columns: 1fr !important; } .da-metrics-3 { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 767px) { .da-metrics-3 { grid-template-columns: 1fr !important; } }
        @media (max-width: 479px) { .da-band-3 { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          minHeight: "clamp(460px,58vh,740px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="gs-dot-grid" />
        <div
          className="da-hero-grid"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: dc.maxW,
            margin: "0 auto",
            padding: `clamp(48px,7vh,88px) ${dc.pad}`,
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div id="gs-hero-content">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.dark, background: dc.lemon, padding: "7px 14px", borderRadius: 100, marginBottom: 24 }}>
              Deal Analyzer &middot; Full underwrite
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              Plug in 7 numbers.<br />Get the full verdict.
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 36px" }}>
              DSCR (whether the property's rent can cover the loan payment — 1.00 = break-even; higher is stronger), PITIA (the full monthly payment — principal, interest, taxes, insurance, and HOA), cash flow, cap rate, debt yield, state prepayment penalty rule, and your live Greenstreet program shortlist — from one screen.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn label="Run the analyzer" href="#da-tool" onClick={scrollToTool} />
              <Btn label="State rules" variant="secondary" onClick={(e) => { e.preventDefault(); onNavigate?.("state-laws"); }} />
            </div>
          </div>

          {/* Right: live mini-underwrite card with live badge */}
          <div style={{ position: "relative" }}>
            <div style={{ width: "100%", aspectRatio: "1.05", borderRadius: 16, background: dc.teal, border: "1px solid rgba(238,239,211,0.12)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, padding: "clamp(24px,3vw,40px)" }}>
              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "PITIA / mo", val: fmt(pitia) },
                  { label: "Monthly rent", val: fmt(rent) },
                  { label: "Cap rate", val: capRate.toFixed(2) + "%" },
                  { label: "Debt yield", val: debtYield.toFixed(2) + "%" },
                ].map((cell) => (
                  <div key={cell.label} style={{ background: "rgba(238,239,211,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.56)", marginBottom: 4 }}>{cell.label}</div>
                    <Mono style={{ fontSize: 18, fontWeight: 600, color: dc.cream, lineHeight: 1 }}>{cell.val}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ width: "100%", height: 1, background: "rgba(238,239,211,0.1)", margin: "4px 0" }} />
              <div style={{ width: "100%", background: "rgba(238,239,211,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.56)", marginBottom: 4 }}>Cash flow / mo</div>
                <Mono style={{ fontSize: 22, fontWeight: 600, color: cashFlow >= 0 ? dc.emerald : "#ff6b6b", lineHeight: 1 }}>
                  {(cashFlow >= 0 ? "+" : "") + fmt(cashFlow)}
                </Mono>
              </div>
            </div>
            {/* floating verdict badge */}
            <div style={{ position: "absolute", bottom: -16, left: -12, background: dc.lemon, borderRadius: 10, padding: "16px 20px", zIndex: 2 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.6)", marginBottom: 3 }}>Deal verdict</div>
              <Mono style={{ display: "block", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: dc.dark, lineHeight: 1 }}>{dscr.toFixed(2)}x</Mono>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: verdictColor, marginTop: 3 }}>{vLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section id="da-tool" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 12 }}>Live deal analyzer</div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 14px" }}>Seven fields in. Full underwrite out.</h2>
            <p style={{ fontSize: 15, color: "rgba(0,55,56,0.6)", margin: 0, lineHeight: 1.6, maxWidth: "60ch" }}>
              Adjust any number and the DSCR, cash flow, and matched programs update instantly. Estimates are fine.
            </p>
          </div>

          {/* Grid: inputs + results */}
          <div className="da-tool-grid gs-reveal" style={{ display: "grid", gridTemplateColumns: "clamp(280px,30vw,400px) 1fr", gap: 36, alignItems: "start" }}>

            {/* ── INPUTS ── */}
            <div style={{ background: swatch.white, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid ${swatch.midnightFaded}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 6 }}>Property inputs</div>
              <p style={{ fontSize: 12, color: "rgba(0,55,56,0.5)", marginBottom: 18, lineHeight: 1.5 }}>
                Estimates are fine — results update as you type. Annual taxes and insurance are split into monthly amounts and added to your PITIA (the full monthly payment — principal, interest, taxes, insurance, and any HOA dues).
              </p>

              {([
                { label: "Purchase Price ($)", value: price, set: setPrice, step: 5000, prefix: "$", suffix: "", mb: 16 },
                { label: "Down Payment (%)", value: down, set: setDown, step: 1, prefix: "", suffix: "%", mb: 16 },
                { label: "Monthly Rent ($)", value: rent, set: setRent, step: 100, prefix: "$", suffix: "", mb: 16 },
                { label: "Interest Rate (%)", value: rate, set: setRate, step: 0.125, prefix: "", suffix: "%", mb: 16 },
                { label: "Annual Property Taxes ($)", value: tax, set: setTax, step: 250, prefix: "$", suffix: "", mb: 16 },
                { label: "Annual Insurance ($)", value: ins, set: setIns, step: 100, prefix: "$", suffix: "", mb: 16 },
                { label: "HOA / mo", value: hoa, set: setHoa, step: 50, prefix: "$", suffix: "", mb: 16 },
              ] as const).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: f.mb }}>
                  <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 7 }}>{f.label}</span>
                  <div className="da-field">
                    {f.prefix && <span style={{ color: "rgba(0,55,56,0.4)", flexShrink: 0 }}>{f.prefix}</span>}
                    <input className="da-num" type="number" step={f.step} value={f.value} onChange={(e) => (f.set as (n: number) => void)(+e.target.value)} style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }} />
                    {f.suffix && <span style={{ color: "rgba(0,55,56,0.4)", flexShrink: 0 }}>{f.suffix}</span>}
                  </div>
                </label>
              ))}

              <label style={{ display: "block", marginBottom: 0 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 7 }}>State (2-letter)</span>
                <div className="da-field">
                  <input className="da-num" type="text" maxLength={2} value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 2))} style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600, textTransform: "uppercase" }} />
                </div>
              </label>
            </div>

            {/* ── RESULTS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* BIG VERDICT — with DscrGauge + BalanceScale + RiskFlame */}
              <div className="gs-reveal" style={{ background: verdictBg, border: `2px solid ${verdictBorder}`, borderRadius: radius.md, padding: "clamp(24px,3vw,36px)" }}>
                {/* Headline answer row */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <RiskFlame level={riskLevel} size={22} />
                    <Mono style={{ fontSize: "clamp(48px,6vw,80px)", fontWeight: 600, letterSpacing: "-0.04em", color: dc.dark, lineHeight: 0.9 }}>
                      {dscr.toFixed(2)}x
                    </Mono>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: verdictColor, alignSelf: "flex-end", paddingBottom: 4 }}>
                      {vLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 600, color: "rgba(0,55,56,0.85)", marginBottom: 8, lineHeight: 1.25 }}>
                    {verdictHeadline}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,55,56,0.65)", marginBottom: 12, lineHeight: 1.5, letterSpacing: "-0.01em" }}>{verdictNote}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.5)", margin: 0, lineHeight: 1.5, padding: "10px 14px", background: `${verdictBorder}18`, borderRadius: radius.sm, border: `1px solid ${verdictBorder}44` }}>
                    <strong style={{ color: "rgba(0,55,56,0.75)" }}>Next step: </strong>{nextStep}
                  </p>
                </div>

                {/* Visual artifacts row */}
                <div className="da-verdict-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20, padding: "18px 0", borderTop: `1px solid ${verdictBorder}33`, borderBottom: `1px solid ${verdictBorder}33` }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 4 }}>DSCR — rent ÷ payment</div>
                    <DscrGauge value={dscr} size={160} />
                    <div style={{ fontSize: 11, color: "rgba(0,55,56,0.45)", textAlign: "center" }}>
                      {dscr >= 1.25 ? "≥ 1.25x = strong approval tier" : dscr >= 1.0 ? "1.0–1.25x = qualifies, limited" : dscr >= 0.75 ? "0.75–1.0x = sub-1.0 programs only" : "< 0.75x = most lenders decline"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 4 }}>Rent vs PITIA (full monthly payment)</div>
                    <BalanceScale rent={rent} payment={pitia} size={210} />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "rgba(0,55,56,0.5)", fontWeight: 500 }}>{fmt(rent)} rent</span>
                      <span style={{ fontSize: 11, color: "rgba(0,55,56,0.5)", fontWeight: 500 }}>{fmt(pitia)} PITIA</span>
                    </div>
                  </div>
                </div>

                {/* 3-metric row */}
                <div className="da-metrics-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {[
                    { val: (cashFlow >= 0 ? "+" : "") + fmt(cashFlow), label: "cash flow / mo", sub: cashFlow >= 0 ? "positive" : "shortfall", color: cashFlow >= 0 ? dc.emerald : "#e06363" },
                    { val: capRate.toFixed(2) + "%",                    label: "cap rate",       sub: capRate >= 6 ? "healthy" : "thin",         color: capRate >= 6 ? dc.rain : "#e6b84d" },
                    { val: debtYield.toFixed(2) + "%",                  label: "debt yield",     sub: debtYield >= 10 ? "strong" : "marginal",   color: debtYield >= 10 ? dc.rain : "rgba(0,55,56,0.7)" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: `${verdictBorder}14`, borderRadius: radius.sm, padding: "clamp(10px,1.2vw,14px)", textAlign: "center", border: `1px solid ${verdictBorder}22` }}>
                      <Mono style={{ display: "block", fontSize: "clamp(16px,2vw,22px)", fontWeight: 600, letterSpacing: "-0.02em", color: m.color }}>{m.val}</Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginTop: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(0,55,56,0.4)", marginTop: 1 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LTV + loan summary strip */}
              <div className="gs-reveal" style={{ background: swatch.white, borderRadius: radius.md, border: `1px solid ${swatch.midnightFaded}`, padding: "clamp(14px,1.6vw,20px) clamp(16px,2vw,24px)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                {[
                  { label: "LTV (loan ÷ value)", val: ltv + "%", note: ltv <= 75 ? "within standard limits" : "elevated — affects pricing" },
                  { label: "Loan amount",         val: fmt(loan), note: "" },
                  { label: "P&I / mo",            val: fmt(piMo), note: "" },
                ].map((item) => (
                  <div key={item.label} style={{ flex: "1 1 120px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 2 }}>{item.label}</div>
                    <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.dark }}>{item.val}</Mono>
                    {item.note && <div style={{ fontSize: 11, color: "rgba(0,55,56,0.4)", marginTop: 1 }}>{item.note}</div>}
                  </div>
                ))}
              </div>

              {/* STATE RULE */}
              <div className="gs-reveal" style={{ background: dc.dark, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid rgba(238,239,211,0.1)` }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>
                  State prepayment penalty rule — {stateCode || "—"}
                </div>
                <p style={{ fontSize: 11, color: "rgba(238,239,211,0.56)", margin: "0 0 10px", lineHeight: 1.4 }}>
                  A prepayment penalty is a fee some loans charge if you pay off or refinance early. Some states restrict or ban them, which affects lender participation and pricing.
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.75)", margin: "0 0 6px", lineHeight: 1.5 }}>{sa.ppp}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.5)", margin: 0 }}>{sa.extra}</p>
              </div>

              {/* MATCHED PROGRAMS */}
              <div className="gs-reveal" style={{ background: swatch.white, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid ${swatch.midnightFaded}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 4 }}>Matched programs</div>
                <p style={{ fontSize: 12, color: "rgba(0,55,56,0.45)", margin: "0 0 12px", lineHeight: 1.4 }}>Indicative rate offsets from the input rate. Best-tier pricing requires DSCR ≥ 1.25 and FICO ≥ 740.</p>
                {programs.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.07)" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: dc.dark }}>{p.name}</span>
                    <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.rain }}>{p.rateStr}</Mono>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} style={{ fontSize: 13, fontWeight: 600, color: dc.rain, textDecoration: "none" }}>
                    Full program matcher with FICO + LTV filters →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(0,55,56,0.45)", fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
            Preliminary estimate — not a commitment to lend. All outputs are indicative; final terms subject to full underwriting, appraisal and credit approval. Rates shown are illustrative offsets only. Submit a scenario review for a formal quote.
          </p>
        </div>
      </section>

      {/* ── FUNNEL CTA ── */}
      <section className="gs-reveal" style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>Next step</div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>Numbers look good? Get your rate.</h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch" }}>
                One application. We match your file to the best-fit Greenstreet program and take it to funding — no portal-hopping, no repeated paperwork.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: dc.lemon, color: dc.dark, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: radius.sm, whiteSpace: "nowrap", minHeight: 44 }}>
                Get my rate →
              </a>
              <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: radius.sm, border: `1.5px solid ${swatch.midnightFaded}`, whiteSpace: "nowrap", minHeight: 44 }}>
                Browse programs
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
