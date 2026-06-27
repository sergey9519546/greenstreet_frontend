import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { DcShell, dc, Mono, CountUp, H1, Lead } from "../design/dc";
import { swatch, radius } from "../theme";
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF, lookupMaxLTV } from "../data/dscrPrograms";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

// Format a dollar amount compactly.
const fmtLoan = (n: number) =>
  n >= 1_000_000
    ? "$" + (n % 1_000_000 === 0 ? n / 1_000_000 + "M" : (n / 1_000_000).toFixed(1) + "M")
    : "$" + Math.round(n).toLocaleString("en-US");

// High-risk PPP states (material rate/box impact).
const HIGH_RISK_STATES = ["NJ", "MD", "KS", "MN"];

// ─── Program scoring ───────────────────────────────────────────────────────────
// Mirrors the design mockup's 4-check scoring approach but uses REAL program
// data from dscrPrograms.ts instead of hard-coded competitor numbers.
// Every label shown is a Greenstreet program name — zero outside lender names.

type ScoredProgram = {
  id: string;
  name: string;
  tagline: string;
  minFICO: number;
  dscrFloor: number;
  noRatio: boolean;
  maxLTV: number;
  maxLoan: number;
  isSTR: boolean;
  multiFamily: boolean;
  nonUsInvestor: boolean;
  features: string[];
  checks: { ok: boolean; label: string }[];
  passed: number;
  fits: boolean;
  score: number;
  effectiveLTV: number | null;
};

function scorePrograms(
  fico: number,
  ltv: number,
  dscr: number,
  loanAmount: number,
  stateCode: string,
  needsSTR: boolean,
  needsMF: boolean
): ScoredProgram[] {
  const hr = HIGH_RISK_STATES.includes((stateCode || "").toUpperCase());

  return DSCR_PROGRAMS.map((p) => {
    // FICO check
    const ficoOk = fico >= p.minFICO;
    // DSCR check (no-ratio programs always pass)
    const dscrOk = p.noRatio || dscr >= p.dscrFloor;
    // Loan amount check (use maxLoan as ceiling; 75k floor assumed)
    const loanOk = loanAmount >= 75_000 && loanAmount <= p.maxLoan;
    // LTV check — look up actual max LTV from grid
    const effectiveLTV = lookupMaxLTV(p, fico, loanAmount, p.noRatio ? null : dscr, "purchase");
    const ltvOk = effectiveLTV !== null && ltv <= effectiveLTV;
    // Property-type filters (informational, not deal-breakers in scoring)
    const strOk = !needsSTR || p.isSTR;
    const mfOk = !needsMF || p.multiFamily;

    const checks = [
      { ok: ficoOk, label: `FICO ≥ ${p.minFICO}` },
      { ok: ltvOk, label: `LTV ≤ ${effectiveLTV ?? p.maxLTV}%` },
      { ok: dscrOk, label: p.noRatio ? "No-ratio OK" : `DSCR ≥ ${p.dscrFloor.toFixed(2)}` },
      { ok: loanOk, label: `${fmtLoan(75_000)}–${fmtLoan(p.maxLoan)}` },
    ];

    const passed = checks.filter((c) => c.ok).length;
    const fits = passed === 4 && strOk && mfOk;

    // Score: base from checks + DSCR cushion + bonus for wider LTV
    let score = passed * 22 + Math.max(0, dscr - p.dscrFloor) * 8;
    if (effectiveLTV !== null) score += Math.max(0, effectiveLTV - ltv) * 0.5;
    if (hr) score -= 4; // PPP-state penalty affects all programs equally

    return {
      ...p,
      checks,
      passed,
      fits,
      score,
      effectiveLTV,
    };
  }).sort((a, b) => (b.fits ? 1 : 0) - (a.fits ? 1 : 0) || b.score - a.score) as ScoredProgram[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LenderIntelPage({ onBack, onNavigate }: { onBack?: () => void; onNavigate?: (v: any) => void }) {
  useEffect(() => {
    document.title = "Our DSCR Programs | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // FLIP re-rank: cards slide to their new positions when the deal box re-sorts
  // them. Interaction-driven only (records prev positions; animates on change —
  // never on mount), reduced-motion safe.
  const listRef = useRef<HTMLDivElement>(null);
  const flipPos = useRef<Map<string, number>>(new Map());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    list.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((card) => {
      const id = card.getAttribute("data-flip-id")!;
      const top = card.getBoundingClientRect().top;
      const old = flipPos.current.get(id);
      if (old !== undefined && Math.abs(old - top) > 1 && !reduced) {
        gsap.fromTo(card, { y: old - top }, { y: 0, duration: 0.45, ease: "power3.out", overwrite: true });
      }
      flipPos.current.set(id, top);
    });
  });

  const [fico, setFico] = useState(720);
  const [ltv, setLtv] = useState(75);
  const [dscr, setDscr] = useState(1.15);
  const [loanAmount, setLoanAmount] = useState(425_000);
  const [stateCode, setStateCode] = useState("TX");
  const [needsSTR, setNeedsSTR] = useState(false);
  const [needsMF, setNeedsMF] = useState(false);

  const scored = scorePrograms(fico, ltv, dscr, loanAmount, stateCode, needsSTR, needsMF);
  const matchCount = scored.filter((p) => p.fits).length;
  const total = scored.length;

  const scrollToTool = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#li-tool");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: "smooth" });
  };

  const hr = HIGH_RISK_STATES.includes((stateCode || "").toUpperCase());

  return (
    <DcShell
      onNavigate={onNavigate}
      accent="#004041"
      navLinks={[
        { label: "Calculator", view: "dscr-calculator" },
        { label: "Buy-or-Pass", view: "decision-support" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Match my deal →", onClick: scrollToTool }}
    >
      {/* CSS: input spinner hide; unified dark-panel input style + focus ring */}
      <style>{`
        .li-in::-webkit-outer-spin-button,.li-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .li-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
        .li-field{display:flex;align-items:center;background:${swatch.midnight};border:1.5px solid rgba(238,239,211,0.18);border-radius:${radius.sm};padding:0 13px;transition:border-color .15s;}
        .li-field:focus-within{border-color:${swatch.lemon};outline:2px solid ${swatch.lemon};outline-offset:1px;}
        .li-field:hover:not(:focus-within){border-color:rgba(238,239,211,0.5);}
        /* Toggle buttons — 44px min touch target */
        .li-toggle{min-height:44px;display:inline-flex;align-items:center;justify-content:center;}
        @media(max-width:991px){.li-hero-grid{grid-template-columns:1fr !important;} .li-tool-grid{grid-template-columns:1fr !important;}}
        @media(max-width:767px){.li-summary-row{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:479px){.li-summary-row{grid-template-columns:1fr !important;}}
      `}</style>

      {/* ── HERO — dark-teal, two-col: copy left / live deal summary right ── */}
      <section
        style={{
          background: dc.teal,
          color: dc.cream,
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(56px,7vh,88px)",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content" className="li-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
            {/* Left: copy + chips */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 20, letterSpacing: "-0.01em" }}>
                Product / Our DSCR Programs
              </div>
              <H1 style={{ margin: "0 0 24px", maxWidth: "15ch" }}>
                Which programs fit your deal?
              </H1>
              <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "52ch", margin: "0 0 16px" }}>
                Enter your FICO score, LTV (how the loan amount compares to the property value — lower means more equity and better terms), DSCR (whether the property's rent can cover the loan payment — 1.00 = rent exactly covers it; higher is stronger), and loan amount. Every Greenstreet program is scored against your numbers instantly — green cards fit, red cards don't and show you why.
              </Lead>
              <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 14, fontWeight: 500, margin: "0 0 28px", lineHeight: 1.5 }}>
                How to use: adjust the deal box on the left. Cards re-rank live. Match count updates at the top. Aim for at least one FITS card before submitting.
              </p>
              {/* Program name chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 600 }}>
                {scored.map((p) => (
                  <span
                    key={p.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: p.fits ? "rgba(238,239,211,0.15)" : "rgba(238,239,211,0.06)",
                      border: `1px solid ${p.fits ? "rgba(238,239,211,0.3)" : "rgba(238,239,211,0.12)"}`,
                      borderRadius: radius.sm,
                      padding: "7px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: p.fits ? dc.cream : "rgba(238,239,211,0.62)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: live deal summary card with DscrGauge + match count */}
            <div style={{ background: "rgba(238,239,211,0.06)", borderRadius: 16, border: "1px solid rgba(238,239,211,0.12)", padding: "clamp(20px,2.4vw,32px)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginBottom: 16 }}>Live deal summary</div>

              {/* DscrGauge centered */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <DscrGauge value={dscr} size={160} />
              </div>

              {/* Risk level */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                <RiskFlame level={riskFromDscr(dscr)} size={18} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dscrColor(dscr) }}>
                  {dscr >= 1.25 ? "strong" : dscr >= 1.0 ? "qualifies" : dscr >= 0.75 ? "sub-1.0 only" : "below floor"}
                </span>
              </div>

              {/* Key deal metrics strip */}
              <div className="li-summary-row" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "FICO",    val: String(fico),              note: fico >= 740 ? "best pricing" : fico >= 680 ? "standard" : "limited" },
                  { label: "LTV",     val: ltv + "%",                  note: ltv <= 75 ? "within limits" : "elevated" },
                  { label: "DSCR",    val: dscr.toFixed(2) + "x",     note: "" },
                ].map((m) => (
                  <div key={m.label} style={{ background: "rgba(238,239,211,0.07)", borderRadius: radius.sm, padding: "10px 8px", textAlign: "center" }}>
                    <Mono style={{ display: "block", fontSize: 18, fontWeight: 700, color: dc.cream, lineHeight: 1 }}>{m.val}</Mono>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{m.label}</div>
                    {m.note && <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 1 }}>{m.note}</div>}
                  </div>
                ))}
              </div>

              {/* Match count headline */}
              <div style={{ background: matchCount > 0 ? "rgba(77,189,151,0.12)" : "rgba(255,107,107,0.1)", border: `1px solid ${matchCount > 0 ? dc.emerald : "#ff6b6b"}`, borderRadius: radius.sm, padding: "12px 16px", textAlign: "center" }}>
                <Mono style={{ fontSize: 32, fontWeight: 700, color: matchCount > 0 ? dc.emerald : "#ff6b6b", lineHeight: 1 }}>{matchCount}</Mono>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>
                  of {total} programs fit this deal
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
                  {matchCount === 0 ? "Raise FICO, lower LTV, or increase DSCR below." : "Scroll down to see ranked programs."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── TOOL ── */}
      <section
        id="li-tool"
        style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 12 }}>
              Live program matcher
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,48px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.05, color: dc.cream }}>
              <Mono style={{ fontWeight: 600, color: dc.lemon }}>{matchCount}</Mono> of {total} programs fit this deal
            </h2>
            <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(238,239,211,0.65)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {matchCount === 0
                ? "No programs match your current deal box. Try raising FICO, lowering LTV, or increasing DSCR to open more options."
                : matchCount === 1
                ? "One program fits. Check its check chips below — green chips are gates you clear; red chips show what's holding you back."
                : `${matchCount} programs fit. They're sorted best-fit first. The fit score shows how much room you have above each program's minimums.`}
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: 0 }}>
              Adjust the deal box on the left — programs re-rank instantly.
            </p>
          </div>

          <div
            className="gs-reveal dc-split li-tool-grid"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── DEAL BOX INPUTS ── */}
            <div
              style={{
                background: dc.teal,
                borderRadius: radius.md,
                padding: "clamp(20px,2.4vw,28px)",
                position: "sticky",
                top: 96,
                border: "1px solid rgba(238,239,211,0.1)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                Your Deal Box
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Enter your deal details. Programs re-rank as you type — no submit needed.
              </p>

              {/* FICO */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  FICO Score
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Your credit score. 620 minimum; 740+ unlocks best pricing.</span>
                <div className="li-field" style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={5}
                    value={fico}
                    onChange={(e) => setFico(+e.target.value)}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* LTV */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  LTV Needed
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Loan-to-value — loan ÷ property value. E.g. 25% down = 75% LTV. Lower is better.</span>
                <div className="li-field" style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={1}
                    min={50}
                    max={90}
                    value={ltv}
                    onChange={(e) => setLtv(+e.target.value)}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>%</span>
                </div>
              </label>

              {/* DSCR */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Deal DSCR
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Rent ÷ monthly payment. 1.25x is the typical strong-approval threshold. Don't know it? Use the DSCR Calculator first.</span>
                <div className="li-field" style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={0.01}
                    min={0}
                    max={3}
                    value={dscr}
                    onChange={(e) => setDscr(+e.target.value)}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>x</span>
                </div>
              </label>

              {/* Loan Amount */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Loan Amount
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Purchase price minus your down payment. Minimum $75,000 for DSCR programs.</span>
                <div className="li-field" style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>$</span>
                  <input
                    className="li-in"
                    type="number"
                    step={5000}
                    min={75000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(+e.target.value)}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </label>

              {/* State — proper label field, consistent with other inputs */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  State (2-letter)
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Where the property is located. Affects prepayment penalty (a fee some loans charge if you pay off or refinance early) risk and state-specific program availability.</span>
                <div className="li-field" style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="text"
                    maxLength={2}
                    value={stateCode}
                    onChange={(e) => setStateCode((e.target.value || "").toUpperCase().slice(0, 2))}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 700, textTransform: "uppercase", width: "100%" }}
                  />
                </div>
              </label>

              {/* Property type toggles */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setNeedsSTR(!needsSTR)}
                  className="li-toggle"
                  style={{
                    padding: "8px 16px",
                    borderRadius: radius.sm,
                    border: `1.5px solid ${needsSTR ? dc.lemon : swatch.midnightFaded}`,
                    background: needsSTR ? dc.lemon : "transparent",
                    color: needsSTR ? dc.dark : "rgba(238,239,211,0.7)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: dc.sans,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {needsSTR ? "✓ STR" : "STR / Airbnb"}
                </button>
                <button
                  onClick={() => setNeedsMF(!needsMF)}
                  className="li-toggle"
                  style={{
                    padding: "8px 16px",
                    borderRadius: radius.sm,
                    border: `1.5px solid ${needsMF ? dc.emerald : swatch.midnightFaded}`,
                    background: needsMF ? dc.emerald : "transparent",
                    color: needsMF ? dc.dark : "rgba(238,239,211,0.7)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: dc.sans,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {needsMF ? "✓ 5+ Units" : "5+ Units"}
                </button>
              </div>

              {/* PPP state warning */}
              {hr && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 13px",
                    background: "rgba(255,107,107,0.1)",
                    borderRadius: radius.sm,
                    border: "1px solid rgba(255,107,107,0.3)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#ff6b6b",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Prepayment-penalty risk state.</strong> {stateCode} has laws that make prepayment penalties (a fee some loans charge if you pay the loan off or refinance early) more restrictive, which reprices some programs. Fit scores adjusted accordingly. Ask your Greenstreet contact for details before locking a rate.
                </div>
              )}
            </div>

            {/* ── PROGRAM LIST ── */}
            <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scored.map((p, i) => {
                const statusColor = p.fits ? dc.emerald : p.passed >= 3 ? swatch.lemon : "#ff6b6b";
                const statusLabel = p.fits ? "FITS" : p.passed >= 3 ? `${4 - p.passed} miss` : "NO FIT";
                const cardBg = p.fits ? dc.teal : "rgba(238,239,211,0.04)";
                const cardBorder = p.fits ? "rgba(77,189,151,0.4)" : "rgba(238,239,211,0.1)";

                return (
                  <div
                    key={p.id}
                    data-flip-id={p.id}
                    className="ix-card"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 18,
                      alignItems: "center",
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: radius.md,
                      padding: "clamp(16px,2vw,24px) 24px",
                    }}
                  >
                    {/* Rank */}
                    <Mono
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(238,239,211,0.62)",
                        width: 24,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Mono>

                    {/* Program info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: dc.cream }}>
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: statusColor,
                            background: p.fits ? "rgba(77,189,151,0.16)" : p.passed >= 3 ? "rgba(216,217,88,0.12)" : "rgba(255,107,107,0.1)",
                            borderRadius: radius.sm,
                            padding: "3px 9px",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.6)", marginBottom: 10, letterSpacing: "-0.01em" }}>
                        {p.tagline}
                        {p.effectiveLTV !== null && (
                          <span style={{ marginLeft: 8, color: "rgba(238,239,211,0.62)", fontSize: 13 }}>
                            · up to {p.effectiveLTV}% LTV for this deal
                          </span>
                        )}
                      </div>
                      {/* Check chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.checks.map((c) => (
                          <span
                            key={c.label}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: dc.mono,
                              color: c.ok ? dc.emerald : "#ff6b6b",
                              background: c.ok ? "rgba(77,189,151,0.12)" : "rgba(255,107,107,0.1)",
                              borderRadius: 5,
                              padding: "4px 8px",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {c.ok ? "✓" : "✕"} {c.label}
                          </span>
                        ))}
                        {/* Specialty flags */}
                        {p.noRatio && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: swatch.lemon, background: "rgba(216,217,88,0.12)", borderRadius: radius.sm, padding: "4px 8px" }}>
                            ★ no-ratio
                          </span>
                        )}
                        {p.isSTR && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: dc.emerald, background: "rgba(77,189,151,0.12)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ STR
                          </span>
                        )}
                        {p.multiFamily && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: dc.emerald, background: "rgba(77,189,151,0.12)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ 5+ units
                          </span>
                        )}
                        {p.nonUsInvestor && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: "rgba(238,239,211,0.62)", background: "rgba(238,239,211,0.08)", borderRadius: radius.sm, padding: "4px 8px" }}>
                            ★ FN
                          </span>
                        )}
                      </div>
                      {/* animated fit meter — re-fills live as you change the deal box */}
                      <div style={{ marginTop: 12, height: 6, maxWidth: 340, background: "rgba(238,239,211,0.1)", borderRadius: 999, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, Math.max(4, Math.round(p.score)))}%`,
                            background: statusColor,
                            borderRadius: 999,
                            transition: "width .5s cubic-bezier(.16,.84,.44,1), background-color .3s",
                          }}
                        />
                      </div>
                    </div>

                    {/* Fit score */}
                    <div style={{ textAlign: "right", minWidth: 56 }}>
                      <CountUp
                        value={Math.max(0, Math.round(p.score))}
                        style={{
                          display: "block",
                          fontSize: 26,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: statusColor,
                          lineHeight: 1,
                        }}
                      />
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 4 }}>
                        fit score (higher = more room above minimums)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 12, marginTop: 24, letterSpacing: "-0.01em", lineHeight: 1.6 }}>
            Program parameters effective {DSCR_PROGRAMS_AS_OF} and subject to full underwriting. Fit scores are
            indicative only; FICO &times; LTV pricing grids determine final terms. Not a rate lock or credit
            approval.
          </p>
        </div>
      </section>

      {/* ── APPLY CTA ── */}
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
                One application. All programs.
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px,3.5vw,48px)",
                  fontWeight: 600,
                  letterSpacing: "-0.035em",
                  margin: "0 0 16px",
                  color: dc.cream,
                  lineHeight: 1.05,
                }}
              >
                Ready to move this deal forward?
              </h2>
              <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, maxWidth: "52ch", letterSpacing: "-0.01em" }}>
                Submit once. We place your file in the best-fit program and fund it ourselves — no portal-hopping, no re-keying the same numbers five times.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 200 }}>
              <a
                href="/rate-quiz"
                onClick={(e) => { e.preventDefault(); onNavigate?.("rate-quiz"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  padding: "14px 28px",
                  borderRadius: radius.sm,
                  whiteSpace: "nowrap",
                  minHeight: 44,
                }}
              >
                Get my rate →
              </a>
              <a
                href="/dscr-calculator"
                onClick={(e) => { e.preventDefault(); onNavigate?.("dscr-calculator"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  padding: "14px 28px",
                  borderRadius: radius.sm,
                  border: `1.5px solid ${swatch.midnightFaded}`,
                  whiteSpace: "nowrap",
                  minHeight: 44,
                }}
              >
                Run the DSCR calculator
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
