import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";
import { swatch, radius } from "../theme";
import { DscrGauge, BalanceScale, RiskFlame, riskFromDscr } from "../design/artifacts";
import { computeDualTrackDSCR } from "../engine/stressMatrix";
import { computeTcoRate } from "../engine/tcoDscr";
import { assessLeverage } from "../engine/leverageCheck";
import { assessRentIntegrity } from "../engine/rentIntegrity";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

const fmt = (n: number) => Number.isFinite(n) ? "$" + Math.round(n).toLocaleString("en-US") : "—";

export function getConservativeEligibleRent(statedRent: number, marketRent: number | null): number {
  if (!Number.isFinite(statedRent) || statedRent <= 0) return 0;
  return marketRent !== null && Number.isFinite(marketRent) && marketRent > 0
    ? Math.min(statedRent, marketRent)
    : statedRent;
}

const DEAL_STATE_KEY = "greenstreet:deal-analyzer:v2";
type SavedDealState = { priceInput: string; downInput: string; rentInput: string; marketRentInput: string; rateInput: string; taxInput: string; insInput: string; hoaInput: string; stateCode: string };

function loadDealState(): Partial<SavedDealState> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(DEAL_STATE_KEY) || "{}") as Partial<SavedDealState>; }
  catch { return {}; }
}

function parseDealInput(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

const DA_ACCENT = swatch.pistachio;
const DA_NAV_BORDER = `1px solid ${swatch.midnightFaded}`;

export default function DealAnalyzerPage({ onBack, onNavigate }: Props) {
  useEffect(() => {
    document.title = "Deal Analyzer | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // --- Inputs ---
  const [saved] = useState(loadDealState);
  const [priceInput, setPriceInput] = useState(saved.priceInput ?? "425000");
  const [downInput, setDownInput] = useState(saved.downInput ?? "25");
  const [rentInput, setRentInput] = useState(saved.rentInput ?? "3000");
  const [marketRentInput, setMarketRentInput] = useState(saved.marketRentInput ?? "3000");
  const [rateInput, setRateInput] = useState(saved.rateInput ?? "7.0");
  const [taxInput, setTaxInput] = useState(saved.taxInput ?? "5000");
  const [insInput, setInsInput] = useState(saved.insInput ?? "2000");
  const [hoaInput, setHoaInput] = useState(saved.hoaInput ?? "0");
  const [stateCode, setStateCode] = useState(saved.stateCode ?? "TX");

  useEffect(() => {
    const snapshot: SavedDealState = { priceInput, downInput, rentInput, marketRentInput, rateInput, taxInput, insInput, hoaInput, stateCode };
    window.sessionStorage.setItem(DEAL_STATE_KEY, JSON.stringify(snapshot));
  }, [priceInput, downInput, rentInput, marketRentInput, rateInput, taxInput, insInput, hoaInput, stateCode]);

  const parsed = {
    price: parseDealInput(priceInput), down: parseDealInput(downInput), rent: parseDealInput(rentInput),
    marketRent: parseDealInput(marketRentInput), rate: parseDealInput(rateInput), tax: parseDealInput(taxInput),
    ins: parseDealInput(insInput), hoa: parseDealInput(hoaInput),
  };
  const errors = {
    price: parsed.price === null || parsed.price <= 0 ? "Enter a finite purchase price greater than zero." : "",
    down: parsed.down === null || parsed.down <= 0 || parsed.down >= 100 ? "Enter a down payment between 0% and 100%." : "",
    rent: parsed.rent === null || parsed.rent <= 0 ? "Enter a finite monthly rent greater than zero." : "",
    marketRent: marketRentInput.trim() !== "" && (parsed.marketRent === null || parsed.marketRent <= 0) ? "Enter a market rent greater than zero, or leave it blank." : "",
    rate: parsed.rate === null || parsed.rate <= 0 ? "Enter a finite interest rate greater than zero." : "",
    tax: parsed.tax === null || parsed.tax <= 0 ? "Enter annual taxes greater than zero." : "",
    ins: parsed.ins === null || parsed.ins <= 0 ? "Enter annual insurance greater than zero." : "",
    hoa: parsed.hoa === null || parsed.hoa < 0 ? "Enter HOA dues of zero or greater." : "",
    state: /^[A-Z]{2}$/.test(stateCode) ? "" : "Enter a two-letter state code.",
  };
  const dealReady = !Object.values(errors).some(Boolean);
  const price = errors.price ? 0 : parsed.price!;
  const down = errors.down ? 0 : parsed.down!;
  const rent = errors.rent ? 0 : parsed.rent!;
  const marketRent = marketRentInput.trim() === "" || errors.marketRent ? null : parsed.marketRent;
  const rate = errors.rate ? 0 : parsed.rate!;
  const tax = errors.tax ? 0 : parsed.tax!;
  const ins = errors.ins ? 0 : parsed.ins!;
  const hoa = errors.hoa ? 0 : parsed.hoa!;
  const eligibleRent = dealReady ? getConservativeEligibleRent(rent, marketRent) : 0;

  // --- Engine computation ---
  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const piMo = r > 0 ? (loan * r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1) : 0;
  const pitia = piMo + tax / 12 + ins / 12 + hoa;
  const dscr = dealReady && pitia > 0 ? eligibleRent / pitia : 0;
  const cashFlow = dealReady ? eligibleRent - pitia : 0;
  // NOI = EGI − full OpEx (CRE underwriting standard). The prior `rent×0.92`
  // only haircut 8% vacancy — it omitted management, maintenance, and CapEx,
  // overstating NOI (and thus cap rate + debt yield) by ~21% of rent. Use the
  // TCO opex (vacancy + mgmt + maint + capex), then taxes + insurance.
  const tcoTotal = computeTcoRate().total; // SFR/avg/normal default
  const noi = dealReady ? eligibleRent * 12 * (1 - tcoTotal) - tax - ins : 0;
  const capRate = dealReady && price > 0 ? (noi / price) * 100 : 0;
  const debtYield = loan > 0 ? (noi / loan) * 100 : 0;
  // Positive vs negative leverage (RIDGE debt-tool): does the asset out-yield
  // the debt? Loan constant = annual P&I ÷ loan, vs the going-in cap rate.
  const lev = dealReady ? assessLeverage(piMo * 12, loan, noi, price) : { state: "NEUTRAL" as const, loanConstantPct: 0, capRatePct: 0, note: "" };
  // Cash-on-cash (real-assets): annual pre-tax cash flow (NOI − debt service)
  // ÷ cash invested (down + ~3% closing). The return on the actual cash in —
  // negative here when the deal is in negative leverage.
  const cashInvested = price * (down / 100) + price * 0.03;
  const coc = cashInvested > 0 ? ((noi - piMo * 12) / cashInvested) * 100 : 0;
  const ltv = 100 - down;
  // Dual-track: the dscr above is Track 1 (lender). Track 2 nets out typical
  // vacancy + management + maintenance — flags deals that qualify yet lose money.
  const dual = dealReady ? computeDualTrackDSCR(eligibleRent, pitia) : { track1: 0, track2: 0, qualifiesButDangerous: false };
  // Rent integrity (behavioral honesty): if the stated/lease rent runs above
  // the appraiser's 1007 market rent, lenders underwrite to the LOWER figure —
  // the qualifying DSCR will likely use market rent, not the stated number.
  const rentCheck = dealReady && marketRent !== null ? assessRentIntegrity({ leaseRent: rent, marketRent }) : { disposition: "CLEAR" as const, leaseVsMarketPct: 0, flags: [] as string[] };

  // --- Verdict ---
  let vLabel = "BELOW MODELED COVERAGE";
  let verdictColor = "#e06363";
  let verdictBg = "rgba(74,21,21,0.07)";
  let verdictBorder = "#e06363";
  let verdictHeadline = "Modeled rent falls well short of the entered payment.";
  let verdictNote =
    "Coverage below 0.75x in this model calls for different assumptions or a current scenario review. It does not determine a lender decision.";
  let nextStep = "Test supportable rent, down payment, and rate assumptions before requesting a review.";

  if (dscr >= 1.25) {
    vLabel = "STRONG MODELED COVERAGE";
    verdictColor = dc.rain;
    verdictBg = "rgba(0,101,101,0.06)";
    verdictBorder = dc.rain;
    verdictHeadline = "Modeled rent has a stronger cushion over the entered payment.";
    verdictNote = "The scenario clears the tool's 1.25x checkpoint. Pricing, eligibility, and approval are not calculated here.";
    nextStep = "Verify the inputs against current approved program documents.";
  } else if (dscr >= 1.0) {
    vLabel = "RENT COVERS PITIA";
    verdictColor = dc.lemon;
    verdictBg = "rgba(216,217,88,0.10)";
    verdictBorder = dc.lemon;
    verdictHeadline = "Modeled rent meets or exceeds the entered monthly payment.";
    verdictNote = "The scenario clears the tool's 1.00x checkpoint. A current review may use different rent or payment definitions.";
    nextStep = "Confirm rent evidence, expenses, borrower profile, and current program assumptions.";
  } else if (dscr >= 0.75) {
    vLabel = "BELOW 1.00X";
    verdictColor = "#e6b84d";
    verdictBg = "rgba(230,184,77,0.08)";
    verdictBorder = "#e6b84d";
    verdictHeadline = "Modeled rent does not fully cover the entered payment.";
    verdictNote = "This tool shows a below-1.0 scenario for sensitivity analysis. It cannot determine whether any current program is available.";
    nextStep = "Review supportable rent, leverage, reserves, property, and borrower documentation against current rules.";
  }

  const riskLevel = riskFromDscr(dscr);

  // State flags prompt legal and program review; they are not legal conclusions.
  const sa = {
    ppp: "State-specific prepayment review required.",
    extra: "Availability depends on current law, borrower/entity scope, program rules, and final loan documents.",
  };

  // Coverage scenarios derived only from the entered DSCR.
  const programs = [
    { name: "Stronger coverage checkpoint", rateStr: dscr >= 1.25 ? "passes model" : "review" },
    { name: "Rent-covers-PITIA checkpoint", rateStr: dscr >= 1.0 ? "passes model" : "review" },
    { name: "Below-1.0 sensitivity lane", rateStr: dscr >= 0.75 ? "shown for review" : "below model lane" },
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
        .da-field.is-invalid{border-color:#c94f4f;}
        .da-error{display:block;color:#a83232;font-size:11px;line-height:1.4;margin-top:6px;}
        .da-invalid{background:rgba(230,184,77,.1);border:1px solid rgba(184,132,25,.5);border-radius:${radius.md};padding:clamp(20px,3vw,30px);color:${dc.dark};}
        .da-results-invalid > :not(.da-invalid){display:none !important;}
        #da-tool button:focus-visible,#da-tool a:focus-visible,.da-hero-grid a:focus-visible,.da-page-cta a:focus-visible{outline:2px solid ${swatch.lemon};outline-offset:3px;}
        .dc-nav a{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a[style*="background"]{color:${dc.cream} !important;}
        .dc-nav a.dc-cta{background:${dc.dark} !important;color:${dc.cream} !important;}
        .dc-nav{border-bottom:${DA_NAV_BORDER} !important;background:${swatch.pistachio} !important;}
        footer{color:rgba(0,55,56,0.55) !important;}
        footer div[style]{color:${dc.dark} !important;}
        @media (max-width: 991px) { .da-tool-grid { grid-template-columns: 1fr !important; } .da-hero-grid { grid-template-columns: 1fr !important; } .da-verdict-grid { grid-template-columns: 1fr !important; } .da-metrics-3 { grid-template-columns: 1fr 1fr !important; } .da-verdict-badge { display: none !important; } }
        @media (max-width: 767px) { .da-metrics-3 { grid-template-columns: 1fr !important; } }
        @media (max-width: 479px) { .da-band-3,.da-live-grid { grid-template-columns: 1fr !important; } #da-tool { padding-left:16px !important; padding-right:16px !important; } .da-field { min-width:0; } }
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
          className="da-hero-grid dc-hero"
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
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.06)", border: "1px solid rgba(238,239,211,0.18)", padding: "6px 13px", borderRadius: 100, marginBottom: 24 }}>
              Deal Analyzer &middot; Preliminary scenario analysis
            </div>
            <H1 style={{ margin: "0 0 28px" }}>
              Enter a supportable scenario.<br />See what drives it.
            </H1>
            <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "46ch", margin: "0 0 36px" }}>
              DSCR equals entered monthly rent divided by modeled PITIA: principal, interest, taxes, insurance, and HOA. This page also estimates cash flow, cap rate, debt yield, and sensitivity flags. It is preliminary scenario analysis, not underwriting, legal advice, a quote, or an approval.
            </Lead>
            <div style={{ margin: "18px 0 30px", padding: "16px 18px", border: "1px solid rgba(238,239,211,0.18)", borderRadius: 10, background: "rgba(238,239,211,0.06)", maxWidth: "58ch" }}>
              <div style={{ color: dc.lemon, fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 7 }}>Methodology · updated July 14, 2026</div>
              <p style={{ color: "rgba(238,239,211,0.72)", fontSize: 14, lineHeight: 1.55, margin: "0 0 8px" }}>
                Formula: DSCR = monthly rent ÷ monthly PITIA. Included costs are modeled principal and interest, annual taxes ÷ 12, annual insurance ÷ 12, and monthly HOA.
              </p>
              <p style={{ color: "rgba(238,239,211,0.72)", fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                Worked example: $2,500 rent ÷ $1,920 PITIA = 1.30x. Program definitions may differ, so this explains the math rather than eligibility.
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Btn label="Run the analyzer" href="#da-tool" onClick={scrollToTool} />
              <Btn label="State rules" variant="secondary" onClick={(e) => { e.preventDefault(); onNavigate?.("state-laws"); }} />
            </div>
          </div>

          {/* Right: live mini-underwrite card with live badge */}
          <div style={{ position: "relative" }}>
            <div style={{ width: "100%", aspectRatio: "1.05", borderRadius: 16, background: dc.teal, border: "1px solid rgba(238,239,211,0.12)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, padding: "clamp(24px,3vw,40px)" }}>
              <div className="da-live-grid" style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "PITIA / mo", val: dealReady ? fmt(pitia) : "—" },
                  { label: "Eligible rent", val: dealReady ? fmt(eligibleRent) : "—" },
                  { label: "Cap rate", val: dealReady ? capRate.toFixed(2) + "%" : "—" },
                  { label: "Debt yield", val: dealReady ? debtYield.toFixed(2) + "%" : "—" },
                ].map((cell) => (
                  <div key={cell.label} style={{ background: "rgba(238,239,211,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>{cell.label}</div>
                    <Mono style={{ fontSize: 18, fontWeight: 600, color: dc.cream, lineHeight: 1 }}>{cell.val}</Mono>
                  </div>
                ))}
              </div>
              <div style={{ width: "100%", height: 1, background: "rgba(238,239,211,0.1)", margin: "4px 0" }} />
              <div style={{ width: "100%", background: "rgba(238,239,211,0.06)", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 4 }}>Cash flow / mo</div>
                <Mono style={{ fontSize: 22, fontWeight: 600, color: cashFlow >= 0 ? dc.emerald : "#e06363", lineHeight: 1 }}>
                  {dealReady ? (cashFlow >= 0 ? "+" : "") + fmt(cashFlow) : "—"}
                </Mono>
              </div>
            </div>
            {/* floating verdict badge */}
            <div className="da-verdict-badge" style={{ position: "absolute", bottom: -16, left: -12, background: dc.lemon, borderRadius: 10, padding: "16px 20px", zIndex: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.6)", marginBottom: 3 }}>Deal verdict</div>
              <Mono style={{ display: "block", fontSize: dealReady ? 34 : 18, fontWeight: 600, letterSpacing: "-0.03em", color: dc.dark, lineHeight: 1 }}>{dealReady ? `${dscr.toFixed(2)}x` : "Incomplete"}</Mono>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: verdictColor, marginTop: 3 }}>{dealReady ? vLabel : "Check inputs"}</div>
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
            <h2 style={{ fontSize: "clamp(30px,3.8vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.0, margin: "0 0 14px" }}>Verified assumptions in. Preliminary scenario analysis out.</h2>
            <p style={{ fontSize: 15, color: "rgba(0,55,56,0.6)", margin: 0, lineHeight: 1.6, maxWidth: "60ch" }}>
              Adjust any number and the DSCR, cash flow, and modeled coverage scenarios update instantly. Verify every input before relying on the result.
            </p>
          </div>

          {/* Grid: inputs + results */}
          <div className="da-tool-grid gs-reveal dc-split" style={{ display: "grid", gridTemplateColumns: "clamp(280px,30vw,400px) 1fr", gap: 36, alignItems: "start" }}>

            {/* ── INPUTS ── */}
            <div style={{ background: swatch.white, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid ${swatch.midnightFaded}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 6 }}>Property inputs</div>
              <p style={{ fontSize: 12, color: "rgba(0,55,56,0.5)", marginBottom: 18, lineHeight: 1.5 }}>
                Estimates are fine — results update as you type. Annual taxes and insurance are split into monthly amounts and added to your PITIA (the full monthly payment — principal, interest, taxes, insurance, and any HOA dues).
              </p>

              {([
                { id: "price", label: "Purchase Price ($)", value: priceInput, set: setPriceInput, error: errors.price, step: 5000, prefix: "$", suffix: "", mb: 16 },
                { id: "down", label: "Down Payment (%)", value: downInput, set: setDownInput, error: errors.down, step: 1, prefix: "", suffix: "%", mb: 16 },
                { id: "rent", label: "Stated Monthly Rent ($)", value: rentInput, set: setRentInput, error: errors.rent, step: 100, prefix: "$", suffix: "", mb: 16 },
                { id: "rate", label: "Interest Rate (%)", value: rateInput, set: setRateInput, error: errors.rate, step: 0.125, prefix: "", suffix: "%", mb: 16 },
                { id: "tax", label: "Annual Property Taxes ($)", value: taxInput, set: setTaxInput, error: errors.tax, step: 250, prefix: "$", suffix: "", mb: 16 },
                { id: "ins", label: "Annual Insurance ($)", value: insInput, set: setInsInput, error: errors.ins, step: 100, prefix: "$", suffix: "", mb: 16 },
                { id: "hoa", label: "HOA / mo", value: hoaInput, set: setHoaInput, error: errors.hoa, step: 50, prefix: "$", suffix: "", mb: 16 },
              ]).map((f) => (
                <label key={f.label} style={{ display: "block", marginBottom: f.mb }}>
                  <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 7 }}>{f.label}</span>
                  <div className={`da-field ${f.error ? "is-invalid" : ""}`}>
                    {f.prefix && <span style={{ color: "rgba(0,55,56,0.4)", flexShrink: 0 }}>{f.prefix}</span>}
                    <input className="da-num" type="number" step={f.step} value={f.value} onChange={(e) => f.set(e.target.value)} aria-invalid={Boolean(f.error)} aria-describedby={f.error ? `deal-${f.id}-error` : undefined} style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }} />
                    {f.suffix && <span style={{ color: "rgba(0,55,56,0.4)", flexShrink: 0 }}>{f.suffix}</span>}
                  </div>
                  {f.error && <span id={`deal-${f.id}-error`} className="da-error">{f.error}</span>}
                </label>
              ))}

              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 7 }}>Market Rent — 1007 (optional)</span>
                <div className={`da-field ${errors.marketRent ? "is-invalid" : ""}`}>
                  <span style={{ color: "rgba(0,55,56,0.4)", flexShrink: 0 }}>$</span>
                  <input className="da-num" type="number" step={100} value={marketRentInput} onChange={(e) => setMarketRentInput(e.target.value)} aria-invalid={Boolean(errors.marketRent)} aria-describedby={errors.marketRent ? "deal-market-error" : undefined} style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600 }} />
                </div>
                {errors.marketRent && <span id="deal-market-error" className="da-error">{errors.marketRent}</span>}
                <span style={{ display: "block", fontSize: 11, color: "rgba(0,55,56,0.4)", marginTop: 6, lineHeight: 1.4 }}>When provided, every result uses the lower of stated rent and market rent. Leave blank only when no supportable market-rent estimate is available.</span>
              </label>

              <label style={{ display: "block", marginBottom: 0 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.5)", marginBottom: 7 }}>State (2-letter)</span>
                <div className={`da-field ${errors.state ? "is-invalid" : ""}`}>
                  <input className="da-num" type="text" maxLength={2} value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase().slice(0, 2))} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? "deal-state-error" : undefined} style={{ padding: "11px 7px", fontSize: 16, fontWeight: 600, textTransform: "uppercase" }} />
                </div>
                {errors.state && <span id="deal-state-error" className="da-error">{errors.state}</span>}
              </label>
            </div>

            {/* ── RESULTS ── */}
            <div className={dealReady ? undefined : "da-results-invalid"} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {!dealReady && (
                <div className="da-invalid" role="alert" aria-live="polite">
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Incomplete scenario</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>Derived rent, loan, payment, DSCR, cash-flow, cap-rate, and debt-yield outputs are withheld until every highlighted required field is valid.</p>
                </div>
              )}

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

                  {/* Dual-track "Qualifies but Dangerous": clears the lender (Track 1)
                      but loses money after operating costs (Track 2 < 1.0). */}
                  {dual.qualifiesButDangerous && (
                    <div style={{ marginTop: 12, background: "rgba(224,99,99,0.07)", border: "1px solid rgba(224,99,99,0.3)", borderLeft: "3px solid #e06363", borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "11px 15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <RiskFlame level="high" size={15} />
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#e06363" }}>Operating-cost coverage gap</span>
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(0,55,56,0.7)", margin: 0, lineHeight: 1.5 }}>
                        Gross eligible rent divided by PITIA is <strong style={{ color: dc.dark }}>{dual.track1.toFixed(2)}x</strong>, but after the separately modeled vacancy, management, and maintenance assumptions, coverage is <strong style={{ color: "#e06363" }}>{dual.track2.toFixed(2)}x</strong>. This is a cash-flow warning, not an eligibility or approval result.
                      </p>
                    </div>
                  )}

                  {/* Positive vs negative leverage (RIDGE debt-tool) — does the
                      asset out-yield the debt? */}
                  {lev.state !== "NEUTRAL" && (
                    <div style={{ marginTop: 12, background: lev.state === "NEGATIVE" ? "rgba(230,184,77,0.1)" : "rgba(77,189,151,0.1)", border: `1px solid ${lev.state === "NEGATIVE" ? "rgba(230,184,77,0.4)" : "rgba(77,189,151,0.4)"}`, borderLeft: `3px solid ${lev.state === "NEGATIVE" ? "#e6b84d" : dc.emerald}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "11px 15px" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: lev.state === "NEGATIVE" ? "#b8901f" : "#1f7a5a", marginBottom: 4 }}>
                        {lev.state === "NEGATIVE" ? "Negative leverage" : "Positive leverage"} · {lev.loanConstantPct.toFixed(1)}% debt vs {lev.capRatePct.toFixed(1)}% cap
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(0,55,56,0.7)", margin: 0, lineHeight: 1.5 }}>{lev.note}</p>
                    </div>
                  )}

                  {/* Rent integrity (behavioral honesty) — stated rent well above
                      the appraiser's 1007 market rent; lenders use the lower figure. */}
                  {marketRent !== null && rentCheck.disposition !== "CLEAR" && (
                    <div style={{ marginTop: 12, background: rentCheck.disposition === "ELEVATED" ? "rgba(224,99,99,0.07)" : "rgba(230,184,77,0.1)", border: `1px solid ${rentCheck.disposition === "ELEVATED" ? "rgba(224,99,99,0.3)" : "rgba(230,184,77,0.4)"}`, borderLeft: `3px solid ${rentCheck.disposition === "ELEVATED" ? "#e06363" : "#e6b84d"}`, borderRadius: `0 ${radius.sm} ${radius.sm} 0`, padding: "11px 15px" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: rentCheck.disposition === "ELEVATED" ? "#e06363" : "#b8901f", marginBottom: 4 }}>
                        Rent above market · stated {fmt(rent)} vs {fmt(marketRent)} market (+{rentCheck.leaseVsMarketPct.toFixed(0)}%)
                      </div>
                      {rentCheck.flags.map((fl, i) => (
                        <p key={i} style={{ fontSize: 13, color: "rgba(0,55,56,0.7)", margin: i === 0 ? 0 : "6px 0 0", lineHeight: 1.5 }}>{fl}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visual artifacts row */}
                <div className="da-verdict-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20, padding: "18px 0", borderTop: `1px solid ${verdictBorder}33`, borderBottom: `1px solid ${verdictBorder}33` }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 4 }}>DSCR — rent ÷ payment</div>
                    <DscrGauge value={dscr} size={160} />
                    <div style={{ fontSize: 11, color: "rgba(0,55,56,0.45)", textAlign: "center" }}>
                      {dscr >= 1.25 ? "≥ 1.25x = stronger model checkpoint" : dscr >= 1.0 ? "1.0–1.25x = rent covers modeled payment" : dscr >= 0.75 ? "0.75–1.0x = below-payment review lane" : "< 0.75x = below modeled review lane"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 4 }}>Rent vs PITIA (full monthly payment)</div>
                    <BalanceScale rent={eligibleRent} payment={pitia} size={210} />
                    <div style={{ display: "flex", justifyContent: "space-between", width: "90%", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "rgba(0,55,56,0.5)", fontWeight: 500 }}>{fmt(eligibleRent)} eligible rent</span>
                      <span style={{ fontSize: 11, color: "rgba(0,55,56,0.5)", fontWeight: 500 }}>{fmt(pitia)} PITIA</span>
                    </div>
                  </div>
                </div>

                {/* 3-metric row */}
                <div className="da-metrics-3" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                  {[
                    { val: (cashFlow >= 0 ? "+" : "") + fmt(cashFlow), label: "eligible rent − PITIA", sub: "before operating costs", color: cashFlow >= 0 ? dc.emerald : "#e06363" },
                    { val: (coc >= 0 ? "+" : "") + coc.toFixed(1) + "%", label: "cash-on-cash",  sub: coc >= 6 ? "strong" : coc >= 0 ? "thin" : "negative", color: coc >= 6 ? dc.emerald : coc >= 0 ? "#e6b84d" : "#e06363" },
                    { val: capRate.toFixed(2) + "%",                    label: "cap rate",       sub: capRate >= 6 ? "healthy" : "thin",         color: capRate >= 6 ? dc.rain : "#e6b84d" },
                    { val: debtYield.toFixed(2) + "%",                  label: "debt yield",     sub: debtYield >= 10 ? "strong" : "marginal",   color: debtYield >= 10 ? dc.rain : "rgba(0,55,56,0.7)" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: `${verdictBorder}14`, borderRadius: radius.sm, padding: "clamp(10px,1.2vw,14px)", textAlign: "center", border: `1px solid ${verdictBorder}22` }}>
                      <Mono style={{ display: "block", fontSize: "clamp(16px,2vw,22px)", fontWeight: 600, letterSpacing: "-0.02em", color: m.color }}>{m.val}</Mono>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginTop: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(0,55,56,0.4)", marginTop: 1 }}>{m.sub}</div>
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
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(0,55,56,0.45)", marginBottom: 2 }}>{item.label}</div>
                    <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.dark }}>{item.val}</Mono>
                    {item.note && <div style={{ fontSize: 11, color: "rgba(0,55,56,0.4)", marginTop: 1 }}>{item.note}</div>}
                  </div>
                ))}
              </div>

              {/* STATE RULE */}
              <div className="gs-reveal" style={{ background: dc.dark, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid rgba(238,239,211,0.16)` }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 4 }}>
                  State prepayment penalty rule — {stateCode || "—"}
                </div>
                <p style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", margin: "0 0 10px", lineHeight: 1.4 }}>
                  A prepayment penalty is a fee some loans charge if you pay off or refinance early. Some states restrict or ban them, which affects lender participation and pricing.
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.75)", margin: "0 0 6px", lineHeight: 1.5 }}>{sa.ppp}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: 0 }}>{sa.extra}</p>
              </div>

              {/* MODELED COVERAGE SCENARIOS */}
              <div className="gs-reveal" style={{ background: swatch.white, borderRadius: radius.md, padding: "clamp(20px,2.4vw,28px)", border: `1px solid ${swatch.midnightFaded}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 4 }}>Modeled coverage scenarios</div>
                <p style={{ fontSize: 12, color: "rgba(0,55,56,0.45)", margin: "0 0 12px", lineHeight: 1.4 }}>These rows interpret entered DSCR only. They are not program quotes, current eligibility rules, or an independent ranking.</p>
                {programs.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,55,56,0.07)" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: dc.dark }}>{p.name}</span>
                    <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.rain }}>{p.rateStr}</Mono>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <a href="/lender-intel" onClick={(e) => { e.preventDefault(); onNavigate?.("lender-intel"); }} style={{ fontSize: 13, fontWeight: 600, color: dc.rain, textDecoration: "none" }}>
                    Open the internal scenario matcher →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(0,55,56,0.45)", fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
            Preliminary estimate only. This page does not underwrite, interpret state law, rank lenders, calculate a quote, or determine approval. Verify rent, expenses, credit, assets, property, entity, and current program documents.
          </p>
        </div>
      </section>

      {/* ── FUNNEL CTA ── */}
      <section className="gs-reveal da-page-cta" style={{ background: dc.dark, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-split" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 16 }}>Next step</div>
              <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 16px", color: dc.cream, lineHeight: 1.05 }}>Numbers look useful? Verify the scenario.</h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch" }}>
                Use the result to identify assumptions needing verification. A separate current review is required before discussing availability or pricing.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <a href="/rate-quiz" onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: dc.emerald, color: dc.dark, fontWeight: 600, fontSize: 15, textDecoration: "none", padding: "14px 28px", borderRadius: radius.sm, whiteSpace: "nowrap", minHeight: 44 }}>
                Request scenario review →
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
