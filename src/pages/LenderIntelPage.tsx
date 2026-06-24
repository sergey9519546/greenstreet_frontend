import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, HeroProof } from "../design/dc";
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF, lookupMaxLTV } from "../data/dscrPrograms";

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
  foreignNational: boolean;
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
    document.title = "Lender Intelligence | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

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

  // Hero chip: best-fit program name or "No match"
  const bestFit = scored[0];
  const heroChipLabel = bestFit?.fits ? `${matchCount} of ${total} fit` : `${matchCount} of ${total} fit`;
  const heroChipColor = matchCount > 0 ? dc.rain : "#b04545";

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Deal Analyzer", view: "deal-analyzer" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Match my deal →", onClick: scrollToTool }}
    >
      {/* Tiny CSS: input spinner hide only */}
      <style>{`
        .li-in::-webkit-outer-spin-button,.li-in::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        .li-in{width:100%;border:none;background:none;outline:none;font-family:${dc.sans};color:${dc.cream};letter-spacing:-0.02em;}
      `}</style>

      {/* ── HERO ── */}
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
          {/* Left — hero stagger */}
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: dc.lemon,
                marginBottom: 22,
              }}
            >
              Lender Intelligence &middot; {total} Programs &middot; Live scoring
            </div>
            <h1
              style={{
                fontSize: "clamp(48px,7.5vw,116px)",
                fontWeight: 600,
                lineHeight: 0.93,
                letterSpacing: "-0.04em",
                margin: "0 0 28px",
              }}
            >
              {total} Greenstreet
              <br />
              programs,
              <br />
              ranked live.
            </h1>
            <p
              style={{
                fontSize: "clamp(17px,1.5vw,22px)",
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: "-0.02em",
                color: "rgba(238,239,211,0.7)",
                maxWidth: "46ch",
                margin: "0 0 36px",
              }}
            >
              Real DSCR program boxes — FICO floors, LTV caps, DSCR minimums, state
              coverage. Dial in your deal; every program scores and re-ranks instantly.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44 }}>
              <a
                href="#li-tool"
                onClick={scrollToTool}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: dc.lemon,
                  color: dc.dark,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 30px",
                  borderRadius: 6,
                }}
              >
                Match my deal ↓
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate?.("deal-analyzer"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  color: dc.cream,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  padding: "15px 26px",
                  borderRadius: 6,
                  border: "1px solid rgba(238,239,211,0.3)",
                }}
              >
                Full deal analyzer
              </a>
            </div>
            {/* Count-up stats */}
            <div style={{ display: "flex", gap: "clamp(24px,4vw,52px)", flexWrap: "wrap" }}>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.emerald,
                    lineHeight: 1,
                  }}
                >
                  <span data-count={total}>0</span>
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  DSCR programs
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.emerald,
                    lineHeight: 1,
                  }}
                >
                  <span data-count={50}>0</span>
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  states covered
                </div>
              </div>
              <div>
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,4vw,52px)",
                    fontWeight: 600,
                    color: dc.lemon,
                    lineHeight: 1,
                  }}
                >
                  85%
                </Mono>
                <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", marginTop: 4 }}>
                  max LTV available
                </div>
              </div>
            </div>
          </div>

          {/* Right — live product surface */}
          <HeroProof
            eyebrow="Live program match"
            value={
              <span>
                <span data-count={matchCount} style={{ display: "inline" }}>{matchCount}</span>
                <span style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 500, opacity: 0.55 }}>/{total}</span>
              </span>
            }
            sub={
              bestFit?.fits
                ? `Best fit: ${bestFit.name}`
                : matchCount === 0
                ? "Adjust the deal box below"
                : `${matchCount} program${matchCount !== 1 ? "s" : ""} qualify`
            }
            chip={{ label: heroChipLabel, color: heroChipColor }}
          />
        </div>
      </section>

      {/* ── 3-STEP BAND ── */}
      <section
        className="gs-reveal"
        style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            <div style={{ background: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.lemon, marginBottom: 14, lineHeight: 1 }}>01</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Enter your deal</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.6)", margin: 0, letterSpacing: "-0.01em" }}>
                FICO, LTV, DSCR, loan amount, state. Five inputs — fifteen seconds.
              </p>
            </div>
            <div style={{ background: dc.dark, color: dc.cream, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: dc.emerald, marginBottom: 14, lineHeight: 1 }}>02</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1, color: dc.cream }}>Score & rank</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                Every program checks four criteria. Fit score updates live as you change any input.
              </p>
            </div>
            <div style={{ background: dc.lemon, padding: "clamp(28px,3.5vw,44px) clamp(22px,3vw,36px)" }}>
              <Mono style={{ display: "block", fontSize: "clamp(32px,4vw,52px)", fontWeight: 600, color: "rgba(0,55,56,0.5)", marginBottom: 14, lineHeight: 1 }}>03</Mono>
              <h3 style={{ fontSize: "clamp(20px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 10px", lineHeight: 1.1 }}>Apply once</h3>
              <p style={{ fontSize: "clamp(15px,1.2vw,17px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(0,55,56,0.65)", margin: 0, letterSpacing: "-0.01em" }}>
                One application covers all Greenstreet programs. We place your file into the best fit and fund it in-house.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section
        id="li-tool"
        style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad} clamp(72px,10vh,128px)` }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          {/* Section header */}
          <div className="gs-reveal" style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.rain, marginBottom: 12 }}>
              Live program matcher
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,48px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.05 }}>
              <Mono style={{ fontWeight: 600 }}>{matchCount}</Mono> of {total} programs fit this deal
            </h2>
            <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(0,55,56,0.6)", margin: 0, letterSpacing: "-0.02em" }}>
              Adjust the deal box — programs re-rank instantly by fit score.
            </p>
          </div>

          <div
            className="gs-reveal dc-split"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── DEAL BOX INPUTS ── */}
            <div
              style={{
                background: dc.teal,
                borderRadius: 9,
                padding: 30,
                position: "sticky",
                top: 96,
                border: "1px solid rgba(238,239,211,0.08)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 20 }}>
                Your Deal Box
              </div>

              {/* FICO */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  FICO Score
                </span>
                <div style={{ display: "flex", alignItems: "center", background: dc.dark, borderRadius: 6, padding: "0 13px" }}>
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
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  LTV Needed
                </span>
                <div style={{ display: "flex", alignItems: "center", background: dc.dark, borderRadius: 6, padding: "0 13px" }}>
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
                  <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 14 }}>%</span>
                </div>
              </label>

              {/* DSCR */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Deal DSCR
                </span>
                <div style={{ display: "flex", alignItems: "center", background: dc.dark, borderRadius: 6, padding: "0 13px" }}>
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
                  <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 14 }}>x</span>
                </div>
              </label>

              {/* Loan Amount */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.55)", marginBottom: 5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Loan Amount
                </span>
                <div style={{ display: "flex", alignItems: "center", background: dc.dark, borderRadius: 6, padding: "0 13px" }}>
                  <span style={{ color: "rgba(238,239,211,0.4)", fontSize: 14 }}>$</span>
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

              {/* State */}
              <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.5)", lineHeight: 1.5 }}>
                State:{" "}
                <input
                  className="li-in"
                  type="text"
                  maxLength={2}
                  value={stateCode}
                  onChange={(e) => setStateCode((e.target.value || "").toUpperCase().slice(0, 2))}
                  style={{
                    width: 42,
                    display: "inline-block",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    background: dc.dark,
                    borderRadius: 5,
                    padding: "4px 6px",
                    textAlign: "center",
                    fontSize: 14,
                    color: dc.cream,
                  }}
                />
              </div>

              {/* Property type toggles */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setNeedsSTR(!needsSTR)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: `1px solid ${needsSTR ? dc.lemon : "rgba(238,239,211,0.2)"}`,
                    background: needsSTR ? dc.lemon : "transparent",
                    color: needsSTR ? dc.dark : "rgba(238,239,211,0.7)",
                    fontSize: 12,
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
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: `1px solid ${needsMF ? dc.emerald : "rgba(238,239,211,0.2)"}`,
                    background: needsMF ? dc.emerald : "transparent",
                    color: needsMF ? dc.dark : "rgba(238,239,211,0.7)",
                    fontSize: 12,
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
                    background: "rgba(176,69,69,0.15)",
                    borderRadius: 6,
                    border: "1px solid rgba(176,69,69,0.3)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#f5a0a0",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>PPP-risk state.</strong> {stateCode} imposes prepayment restrictions that reprice some programs. Scores adjusted.
                </div>
              )}
            </div>

            {/* ── PROGRAM LIST ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scored.map((p, i) => {
                const statusColor = p.fits ? dc.rain : p.passed >= 3 ? "#9a7b00" : "#b04545";
                const statusLabel = p.fits ? "FITS" : p.passed >= 3 ? `${4 - p.passed} miss` : "NO FIT";
                const cardBg = p.fits ? dc.white : "rgba(0,55,56,0.03)";
                const cardBorder = p.fits ? "rgba(0,101,101,0.18)" : "rgba(0,55,56,0.1)";

                return (
                  <div
                    key={p.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 18,
                      alignItems: "center",
                      background: cardBg,
                      border: `1px solid ${cardBorder}`,
                      borderRadius: 9,
                      padding: "20px 24px",
                    }}
                  >
                    {/* Rank */}
                    <Mono
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(0,55,56,0.35)",
                        width: 24,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Mono>

                    {/* Program info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: dc.dark }}>
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: statusColor,
                            background: p.fits ? "rgba(0,101,101,0.1)" : "rgba(0,55,56,0.06)",
                            borderRadius: 5,
                            padding: "3px 9px",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(0,55,56,0.6)", marginBottom: 10, letterSpacing: "-0.01em" }}>
                        {p.tagline}
                        {p.effectiveLTV !== null && (
                          <span style={{ marginLeft: 8, color: "rgba(0,55,56,0.4)", fontSize: 13 }}>
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
                              color: c.ok ? dc.rain : "#b04545",
                              background: c.ok ? "rgba(0,101,101,0.08)" : "rgba(176,69,69,0.08)",
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
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: "#9a7b00", background: "rgba(154,123,0,0.08)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ no-ratio
                          </span>
                        )}
                        {p.isSTR && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: dc.rain, background: "rgba(0,101,101,0.08)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ STR
                          </span>
                        )}
                        {p.multiFamily && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: dc.rain, background: "rgba(0,101,101,0.08)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ 5+ units
                          </span>
                        )}
                        {p.foreignNational && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, fontFamily: dc.mono, color: "rgba(0,55,56,0.5)", background: "rgba(0,55,56,0.06)", borderRadius: 5, padding: "4px 8px" }}>
                            ★ FN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fit score */}
                    <div style={{ textAlign: "right", minWidth: 56 }}>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: 26,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: statusColor,
                          lineHeight: 1,
                        }}
                      >
                        {Math.max(0, Math.round(p.score))}
                      </Mono>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(0,55,56,0.4)", marginTop: 4 }}>
                        fit score
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ color: "rgba(0,55,56,0.45)", fontSize: 12, marginTop: 24, letterSpacing: "-0.01em", lineHeight: 1.6 }}>
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
                href="#"
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
                  borderRadius: 6,
                  whiteSpace: "nowrap",
                }}
              >
                Get my rate →
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate?.("deal-analyzer"); }}
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
                  borderRadius: 6,
                  border: "1px solid rgba(238,239,211,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                Full deal analyzer
              </a>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
