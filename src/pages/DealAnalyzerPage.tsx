import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// Deal Analyzer uses a pistachio/cream nav — distinct from the midnight default
// used by the DSCR Calculator and the rainforest used by State Laws.
const DA_ACCENT = "#eeefd3"; // pistachio cream (matches mockup body + nav)
const DA_NAV_BORDER = "1px solid rgba(0,55,56,0.15)";

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

  // --- Verdict ---
  let vLabel = "DEAL BREAK";
  let verdictColor = "#ff6b6b";
  let verdictBg = "rgba(74,21,21,0.07)";
  let verdictNote =
    "Below 0.75x DSCR. Most lenders decline without strong compensating factors.";

  if (dscr >= 1.25) {
    vLabel = "STRONG";
    verdictColor = dc.rain;
    verdictBg = "rgba(0,101,101,0.06)";
    verdictNote =
      "Strong coverage. Qualifies at best pricing tiers with most programs.";
  } else if (dscr >= 1.0) {
    vLabel = "QUALIFIES";
    verdictColor = dc.lemon;
    verdictBg = "rgba(216,217,88,0.10)";
    verdictNote =
      "Meets the 1.0 minimum. Check lender-specific floors and reserves.";
  } else if (dscr >= 0.75) {
    vLabel = "SUB-1.0";
    verdictColor = "#018582";
    verdictBg = "rgba(1,133,130,0.08)";
    verdictNote =
      "Some lenders accept 0.75+ with strong FICO, low LTV, or reserves.";
  }

  // --- State PPP rule ---
  const adjMap: Record<string, { adj: number; ppp: string; extra: string }> = {
    NJ: {
      adj: 0.25,
      ppp: "PPP HIGH-RISK for LLC; C-Corp/S-Corp only.",
      extra: "Some lenders decline or reprice.",
    },
    MD: {
      adj: 0.5,
      ppp: "PPP de facto prohibited.",
      extra: "Most DSCR lenders decline.",
    },
    KS: {
      adj: 0.5,
      ppp: "PPP de facto prohibited.",
      extra: "Most DSCR lenders decline.",
    },
    MN: {
      adj: 0.1,
      ppp: "Business-purpose ALLOWED (HF 3437 eff. 8/1/2026).",
      extra: "Consumer still prohibited.",
    },
    NY: {
      adj: 0.25,
      ppp: "Business-purpose ALLOWED; criminal usury cap 25%.",
      extra: "Banking Law 6-l.",
    },
    TX: {
      adj: 0,
      ppp: "No state PPP restrictions for business-purpose DSCR.",
      extra: "Standard pricing applies.",
    },
  };
  const sa =
    adjMap[stateCode.toUpperCase()] || {
      adj: 0,
      ppp: "No state PPP restrictions for business-purpose DSCR.",
      extra: "Standard pricing applies.",
    };

  // --- Greenstreet programs (no competitor names) ---
  const programs = [
    {
      name: "Greenstreet DSCR — Best tier",
      rateStr: (rate + sa.adj - 0.875).toFixed(3) + "%",
    },
    {
      name: "Greenstreet DSCR — Standard",
      rateStr: (rate + sa.adj - 0.5).toFixed(3) + "%",
    },
    {
      name: "Greenstreet DSCR — Sub-1.0",
      rateStr: (rate + sa.adj - 0.1).toFixed(3) + "%",
    },
    {
      name: "Greenstreet DSCR — Multi-Family",
      rateStr: (rate + sa.adj).toFixed(3) + "%",
    },
    {
      name: "Greenstreet DSCR — Global",
      rateStr: (rate + sa.adj + 0.1).toFixed(3) + "%",
    },
  ];

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#da-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
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
      {/* Extra CSS: hide spinners; override nav link ink for light nav */}
      <style>{`
        .da-num::-webkit-outer-spin-button,.da-num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .da-num{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.dark};letter-spacing:-0.02em;}
        /* Light-nav override: links + wordmark use dark ink on pistachio bg */
        .dc-nav a{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a[style*="background"]{color:${dc.cream} !important;}
        .dc-nav a.dc-cta{background:${dc.dark} !important;color:${dc.cream} !important;}
        /* nav border */
        .dc-nav{border-bottom:${DA_NAV_BORDER} !important;background:rgba(238,239,211,1) !important;}
        /* footer ink on pistachio footer */
        footer{color:rgba(0,55,56,0.55) !important;}
        footer div[style]{color:${dc.dark} !important;}
      `}</style>

      {/* ── HERO — dark midnight band, two-col: copy left / live verdict badge right ── */}
      <section
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          minHeight: "clamp(480px,60vh,760px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* dot grid */}
        <div className="gs-dot-grid" />

        <div
          className="dc-hero"
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
          {/* Left — hero copy stagger fires on #gs-hero-content */}
          <div id="gs-hero-content">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.dark,
                background: dc.lemon,
                padding: "7px 14px",
                borderRadius: 100,
                marginBottom: 24,
              }}
            >
              Deal Analyzer &middot; Full underwrite
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              Plug in 7 numbers.
              <br />
              Get the verdict.
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 36px" }}>
              DSCR, cash flow, cap rate, debt yield, state PPP rule and your
              live Greenstreet program shortlist &mdash; from one screen.
            </Lead>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn label="Run the analyzer" href="#da-tool" onClick={scrollToTool} />
              <Btn
                label="State rules"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.("state-laws");
                }}
              />
            </div>
          </div>

          {/* Right — mockup's live "Deal verdict" badge floating over a product surface.
              This is the DA signature: NOT the HeroProof device-panel used by the
              DSCR Calculator. The badge reads the live computed DSCR + verdict. */}
          <div style={{ position: "relative" }}>
            {/* Product surface placeholder (replaces image-slot in the mockup) */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1.1",
                borderRadius: 16,
                background: dc.teal,
                border: "1px solid rgba(238,239,211,0.12)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                padding: "clamp(24px,3vw,40px)",
              }}
            >
              {/* Mini underwrite grid — shows the tool is computing, not static */}
              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "PITIA / mo", val: fmt(pitia) },
                  { label: "Monthly rent", val: fmt(rent) },
                  { label: "Cap rate", val: capRate.toFixed(2) + "%" },
                  { label: "Debt yield", val: debtYield.toFixed(2) + "%" },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{
                      background: "rgba(238,239,211,0.06)",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.45)", marginBottom: 4 }}>
                      {cell.label}
                    </div>
                    <Mono style={{ fontSize: 18, fontWeight: 600, color: dc.cream, lineHeight: 1 }}>
                      {cell.val}
                    </Mono>
                  </div>
                ))}
              </div>
              <div style={{ width: "100%", height: 1, background: "rgba(238,239,211,0.1)", margin: "4px 0" }} />
              <div style={{ width: "100%", background: "rgba(238,239,211,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.45)", marginBottom: 4 }}>Cash flow / mo</div>
                <Mono style={{ fontSize: 22, fontWeight: 600, color: cashFlow >= 0 ? dc.emerald : "#ff6b6b", lineHeight: 1 }}>
                  {(cashFlow >= 0 ? "+" : "") + fmt(cashFlow)}
                </Mono>
              </div>
            </div>

            {/* THE SIGNATURE: floating Deal verdict badge — mockup line 53-57 */}
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: -12,
                background: dc.lemon,
                borderRadius: 10,
                padding: "16px 20px",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "rgba(0,55,56,0.6)",
                  marginBottom: 3,
                }}
              >
                Deal verdict
              </div>
              <Mono
                style={{
                  display: "block",
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.dark,
                  lineHeight: 1,
                }}
              >
                {dscr.toFixed(2)}x
              </Mono>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: verdictColor,
                  marginTop: 3,
                }}
              >
                {vLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── 3-STEP BAND (mockup lines 63-71 — verified present in the mockup) ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="gs-reveal dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            {/* Step 01 — pistachio tile */}
            <div
              style={{
                background: dc.cream,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.lemon,
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                01
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                }}
              >
                Property
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.6)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Seven fields: price, rent, rate, taxes, insurance, HOA, state.
                Thirty seconds.
              </p>
            </div>

            {/* Step 02 — dark tile */}
            <div
              style={{
                background: dc.dark,
                color: dc.cream,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.emerald,
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                02
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                  color: dc.cream,
                }}
              >
                Underwrite
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(238,239,211,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                DSCR, PITIA, cash flow, cap rate, debt yield. State PPP rule
                checked.
              </p>
            </div>

            {/* Step 03 — lemon tile */}
            <div
              style={{
                background: dc.lemon,
                padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "rgba(0,55,56,0.5)",
                  marginBottom: 14,
                  lineHeight: 1,
                }}
              >
                03
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(20px,2.2vw,28px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 10px",
                  lineHeight: 1.1,
                }}
              >
                Programs
              </h3>
              <p
                style={{
                  fontSize: "clamp(15px,1.2vw,17px)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                5 matched Greenstreet programs ranked by fit. Rates shift live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section
        id="da-tool"
        style={{
          background: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 48 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Live deal analyzer
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,3.8vw,52px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.0,
                margin: 0,
              }}
            >
              Seven fields in. Full underwrite out.
            </h2>
          </div>

          {/* Grid: inputs + results */}
          <div
            className="gs-reveal dc-split"
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(280px,30vw,400px) 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* ── INPUTS ── */}
            <div
              style={{
                background: dc.white,
                borderRadius: 9,
                padding: 30,
                border: "1px solid rgba(0,55,56,0.1)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: dc.rain,
                  marginBottom: 20,
                }}
              >
                Property
              </div>

              {/* Purchase Price */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Purchase Price
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>$</span>
                  <input
                    className="da-num"
                    type="number"
                    step={5000}
                    value={price}
                    onChange={(e) => setPrice(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* Down Payment */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Down Payment
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <input
                    className="da-num"
                    type="number"
                    step={1}
                    value={down}
                    onChange={(e) => setDown(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>%</span>
                </div>
              </label>

              {/* Monthly Rent */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Monthly Rent
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>$</span>
                  <input
                    className="da-num"
                    type="number"
                    step={100}
                    value={rent}
                    onChange={(e) => setRent(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* Note Rate */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Note Rate
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <input
                    className="da-num"
                    type="number"
                    step={0.125}
                    value={rate}
                    onChange={(e) => setRate(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>%</span>
                </div>
              </label>

              {/* Annual Taxes */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Annual Taxes
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>$</span>
                  <input
                    className="da-num"
                    type="number"
                    step={250}
                    value={tax}
                    onChange={(e) => setTax(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* Annual Insurance */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  Annual Insurance
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>$</span>
                  <input
                    className="da-num"
                    type="number"
                    step={100}
                    value={ins}
                    onChange={(e) => setIns(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* HOA */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  HOA / mo
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <span style={{ color: "rgba(0,55,56,0.4)" }}>$</span>
                  <input
                    className="da-num"
                    type="number"
                    step={50}
                    value={hoa}
                    onChange={(e) => setHoa(+e.target.value)}
                    style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* State */}
              <label style={{ display: "block", marginBottom: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "rgba(0,55,56,0.5)",
                    marginBottom: 7,
                  }}
                >
                  State (2-letter)
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: dc.cream,
                    borderRadius: 6,
                    padding: "0 12px",
                  }}
                >
                  <input
                    className="da-num"
                    type="text"
                    maxLength={2}
                    value={stateCode}
                    onChange={(e) =>
                      setStateCode(e.target.value.toUpperCase().slice(0, 2))
                    }
                    style={{
                      padding: "11px 7px",
                      fontSize: 16,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  />
                </div>
              </label>
            </div>

            {/* ── RESULTS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* BIG VERDICT */}
              <div
                style={{
                  background: verdictBg,
                  border: `2px solid ${verdictColor}`,
                  borderRadius: 12,
                  padding: "clamp(28px,3.5vw,44px)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <Mono
                    style={{
                      display: "block",
                      fontSize: "clamp(64px,8vw,108px)",
                      fontWeight: 600,
                      letterSpacing: "-0.04em",
                      color: dc.dark,
                      lineHeight: 0.9,
                    }}
                  >
                    {dscr.toFixed(2)}x
                  </Mono>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: verdictColor,
                      marginTop: 10,
                    }}
                  >
                    {vLabel}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(0,55,56,0.7)",
                      marginBottom: 20,
                      lineHeight: 1.5,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {verdictNote}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(0,55,56,0.05)",
                        borderRadius: 8,
                        padding: 14,
                        textAlign: "center",
                      }}
                    >
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(18px,2vw,24px)",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: dc.dark,
                        }}
                      >
                        {(cashFlow >= 0 ? "+" : "") + fmt(cashFlow)}
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 4,
                        }}
                      >
                        cash flow
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(0,55,56,0.05)",
                        borderRadius: 8,
                        padding: 14,
                        textAlign: "center",
                      }}
                    >
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(18px,2vw,24px)",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: dc.dark,
                        }}
                      >
                        {capRate.toFixed(2)}%
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 4,
                        }}
                      >
                        cap rate
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(0,55,56,0.05)",
                        borderRadius: 8,
                        padding: 14,
                        textAlign: "center",
                      }}
                    >
                      <Mono
                        style={{
                          display: "block",
                          fontSize: "clamp(18px,2vw,24px)",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: dc.dark,
                        }}
                      >
                        {debtYield.toFixed(2)}%
                      </Mono>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          marginTop: 4,
                        }}
                      >
                        debt yield
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATE RULE */}
              <div
                style={{
                  background: dc.dark,
                  borderRadius: 9,
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: dc.lemon,
                    marginBottom: 10,
                  }}
                >
                  State rule ({stateCode || "—"})
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.75)",
                    margin: "0 0 6px",
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {sa.ppp}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.5)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {sa.extra}
                </p>
              </div>

              {/* MATCHED PROGRAMS */}
              <div
                style={{
                  background: dc.white,
                  borderRadius: 9,
                  padding: 24,
                  border: "1px solid rgba(0,55,56,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: dc.rain,
                    marginBottom: 14,
                  }}
                >
                  Matched programs
                </div>
                {programs.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(0,55,56,0.07)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: dc.dark,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.name}
                    </span>
                    <Mono
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: dc.rain,
                      }}
                    >
                      {p.rateStr}
                    </Mono>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Disclaimer */}
          <p style={{ color: "rgba(0,55,56,0.45)", fontSize: 12, marginTop: 24, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Preliminary estimate — not a commitment to lend. All outputs are indicative; final terms subject to full underwriting, appraisal and credit approval. Rates shown are illustrative offsets only. Contact Greenstreet at +1 (555) 010-0000 for a formal quote.
          </p>
        </div>
      </section>

      {/* ── FUNNEL CTA ── */}
      <section
        className="gs-reveal"
        style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-split"
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>
                Next step
              </div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>
                Deal looks viable? Get your rate.
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                One application. We place your file in the best-fit Greenstreet program and fund it — no portal-hopping.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <a
                href="/rate-quiz"
                onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: dc.lemon, color: dc.dark, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: 6, whiteSpace: "nowrap" }}
              >
                Get my rate →
              </a>
              <a
                href="/lender-intel"
                onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: dc.cream, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: 6, border: `1px solid rgba(238,239,211,0.25)`, whiteSpace: "nowrap" }}
              >
                Browse programs
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
