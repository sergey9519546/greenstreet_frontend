import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { DcShell, dc, Mono, CountUp, H1, Lead } from "../design/dc";
import { swatch, radius } from "../theme";
import { DSCR_PROGRAMS, DSCR_PROGRAMS_AS_OF, lookupMaxLTV } from "../data/dscrPrograms";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";
import TrueCostComparator from "../components/TrueCostComparator";
import { explainNoProgramMatches, meetsInclusiveMaximum, meetsInclusiveMinimum, nudgeExactLowerBoundary, parseMatcherNumber, type ProgramGateCheck } from "../engine/dscrPrograms";

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
const LENDER_STATE_KEY = "greenstreet:lender-intel:v2";
type SavedMatcherState = { ficoInput: string; ltvInput: string; dscrInput: string; loanInput: string; stateCode: string; needsSTR: boolean; needsMF: boolean };

function loadMatcherState(): Partial<SavedMatcherState> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(LENDER_STATE_KEY) || "{}") as Partial<SavedMatcherState>; }
  catch { return {}; }
}

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
  checks: ProgramGateCheck[];
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
    const ficoOk = meetsInclusiveMinimum(fico, p.minFICO, 6);
    // DSCR check (no-ratio programs always pass)
    const dscrOk = p.noRatio || meetsInclusiveMinimum(dscr, p.dscrFloor, 2);
    // Loan amount check (use maxLoan as ceiling; 75k floor assumed)
    const loanOk = meetsInclusiveMinimum(loanAmount, 75_000, 2) && meetsInclusiveMaximum(loanAmount, p.maxLoan, 2);
    // LTV check — look up actual max LTV from grid
    const effectiveLTV = lookupMaxLTV(
      p,
      nudgeExactLowerBoundary(fico, p.minFICO),
      nudgeExactLowerBoundary(loanAmount, 75_000),
      p.noRatio ? null : nudgeExactLowerBoundary(dscr, p.dscrFloor),
      "purchase"
    );
    const ltvOk = effectiveLTV !== null && meetsInclusiveMaximum(ltv, effectiveLTV, 2);
    // Property-type filters (informational, not deal-breakers in scoring)
    const strOk = !needsSTR || p.isSTR;
    const mfOk = !needsMF || p.multiFamily;

    const checks: ProgramGateCheck[] = [
      { key: "fico", ok: ficoOk, label: `FICO ≥ ${p.minFICO}` },
      { key: "ltv", ok: ltvOk, label: `LTV ≤ ${effectiveLTV ?? p.maxLTV}%` },
      { key: "dscr", ok: dscrOk, label: p.noRatio ? "No-ratio OK" : `DSCR ≥ ${p.dscrFloor.toFixed(2)}` },
      { key: "loan", ok: loanOk, label: `${fmtLoan(75_000)}–${fmtLoan(p.maxLoan)}` },
      ...(needsSTR ? [{ key: "str" as const, ok: strOk, label: "STR supported" }] : []),
      ...(needsMF ? [{ key: "multifamily" as const, ok: mfOk, label: "5+ units supported" }] : []),
    ];

    const passed = checks.filter((c) => c.ok).length;
    const fits = passed === checks.length;

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

  const [saved] = useState(loadMatcherState);
  const [ficoInput, setFicoInput] = useState(saved.ficoInput ?? "720");
  const [ltvInput, setLtvInput] = useState(saved.ltvInput ?? "75");
  const [dscrInput, setDscrInput] = useState(saved.dscrInput ?? "1.15");
  const [loanInput, setLoanInput] = useState(saved.loanInput ?? "425000");
  const [stateCode, setStateCode] = useState(saved.stateCode ?? "TX");
  const [needsSTR, setNeedsSTR] = useState(saved.needsSTR ?? false);
  const [needsMF, setNeedsMF] = useState(saved.needsMF ?? false);

  useEffect(() => {
    const snapshot: SavedMatcherState = { ficoInput, ltvInput, dscrInput, loanInput, stateCode, needsSTR, needsMF };
    window.sessionStorage.setItem(LENDER_STATE_KEY, JSON.stringify(snapshot));
  }, [ficoInput, ltvInput, dscrInput, loanInput, stateCode, needsSTR, needsMF]);

  const ficoParsed = parseMatcherNumber(ficoInput);
  const ltvParsed = parseMatcherNumber(ltvInput);
  const dscrParsed = parseMatcherNumber(dscrInput);
  const loanParsed = parseMatcherNumber(loanInput);
  const inputErrors = {
    fico: ficoParsed === null || !Number.isInteger(ficoParsed) || ficoParsed < 300 || ficoParsed > 850 ? "Enter a whole-number FICO from 300 to 850." : "",
    ltv: ltvParsed === null || ltvParsed <= 0 || ltvParsed > 100 ? "Enter an LTV greater than 0% and no more than 100%." : "",
    dscr: dscrParsed === null || dscrParsed < 0 ? "Enter a finite DSCR of zero or greater." : "",
    loan: loanParsed === null || loanParsed < 75_000 ? "Enter at least $75,000; the boundary is inclusive." : "",
    state: /^[A-Z]{2}$/.test(stateCode) ? "" : "Enter a two-letter state code.",
  };
  const matcherReady = !Object.values(inputErrors).some(Boolean);
  const fico = inputErrors.fico ? 0 : ficoParsed!;
  const ltv = inputErrors.ltv ? 0 : ltvParsed!;
  const dscr = inputErrors.dscr ? 0 : dscrParsed!;
  const loanAmount = inputErrors.loan ? 0 : loanParsed!;

  const scored = matcherReady ? scorePrograms(fico, ltv, dscr, loanAmount, stateCode, needsSTR, needsMF) : [];
  const matchCount = scored.filter((p) => p.fits).length;
  const total = DSCR_PROGRAMS.length;
  const noMatchExplanation = matcherReady && matchCount === 0 ? explainNoProgramMatches(scored, loanAmount) : "";

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
        .li-field.is-invalid{border-color:#e06363;}
        .li-error{display:block;color:#ff9b9b;font-size:11px;line-height:1.4;margin-top:6px;}
        .li-invalid{background:rgba(230,184,77,.09);border:1px solid rgba(230,184,77,.45);border-radius:${radius.md};padding:22px;color:${dc.cream};}
        #li-tool button:focus-visible,#li-tool a:focus-visible,.li-toggle:focus-visible{outline:2px solid ${swatch.lemon};outline-offset:3px;}
        /* Toggle buttons — 44px min touch target */
        .li-toggle{min-height:44px;display:inline-flex;align-items:center;justify-content:center;}
        @media(max-width:991px){.li-hero-grid{grid-template-columns:1fr !important;} .li-tool-grid{grid-template-columns:1fr !important;}}
        @media(max-width:767px){.li-summary-row{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:479px){.li-summary-row{grid-template-columns:1fr !important;} #li-tool{padding-left:16px !important;padding-right:16px !important;} .ix-card{grid-template-columns:1fr !important;padding:16px !important;min-width:0;} .ix-card>div{min-width:0;text-align:left !important;} .li-deal-box{position:static !important;} .li-field{min-width:0;} }
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
          <div id="gs-hero-content" className="li-hero-grid dc-hero" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
            {/* Left: copy + chips */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.62)", marginBottom: 20, letterSpacing: "-0.01em" }}>
                Product / Our DSCR Programs
              </div>
              <H1 style={{ margin: "0 0 24px", maxWidth: "15ch" }}>
                Which modeled program scenarios fit your inputs?
              </H1>
              <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "52ch", margin: "0 0 16px" }}>
                Enter FICO, LTV, DSCR, loan amount, property type, and state. This page compares those inputs with the internal scenario dataset dated below; it does not independently rank lenders or confirm current availability.
              </Lead>
              <p style={{ color: "rgba(238,239,211,0.62)", fontSize: 14, fontWeight: 500, margin: "0 0 28px", lineHeight: 1.5 }}>
                How to use: adjust the deal box on the left. Cards reorder by internal gate count and cushion. The order is a model explanation, not an endorsement or independent lender ranking.
              </p>
              {/* Program name chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 600 }}>
                {(matcherReady ? scored : DSCR_PROGRAMS).map((p) => (
                  <span
                    key={p.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: matcherReady && "fits" in p && p.fits ? "rgba(238,239,211,0.15)" : "rgba(238,239,211,0.06)",
                      border: `1px solid ${matcherReady && "fits" in p && p.fits ? "rgba(238,239,211,0.3)" : "rgba(238,239,211,0.12)"}`,
                      borderRadius: radius.sm,
                      padding: "7px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: matcherReady && "fits" in p && p.fits ? dc.cream : "rgba(238,239,211,0.62)",
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
                <DscrGauge value={matcherReady ? dscr : 0} size={160} />
              </div>

              {/* Risk level */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                <RiskFlame level={riskFromDscr(dscr)} size={18} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dscrColor(dscr) }}>
                  {matcherReady ? (dscr >= 1.25 ? "stronger modeled cushion" : dscr >= 1.0 ? "rent covers modeled payment" : dscr >= 0.75 ? "below-1.0 review" : "below modeled lane") : "complete the highlighted inputs"}
                </span>
              </div>

              {/* Key deal metrics strip */}
              <div className="li-summary-row" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                {[
                  { label: "FICO",    val: matcherReady ? String(fico) : "—", note: matcherReady ? (fico >= 740 ? "stronger input" : fico >= 680 ? "general input" : "review") : "" },
                  { label: "LTV",     val: matcherReady ? ltv + "%" : "—", note: matcherReady ? (ltv <= 75 ? "within limits" : "elevated") : "" },
                  { label: "DSCR",    val: matcherReady ? dscr.toFixed(2) + "x" : "—", note: "" },
                ].map((m) => (
                  <div key={m.label} style={{ background: "rgba(238,239,211,0.07)", borderRadius: radius.sm, padding: "10px 8px", textAlign: "center" }}>
                    <Mono style={{ display: "block", fontSize: 18, fontWeight: 700, color: dc.cream, lineHeight: 1 }}>{m.val}</Mono>
                    <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{m.label}</div>
                    {m.note && <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 1 }}>{m.note}</div>}
                  </div>
                ))}
              </div>

              {/* Match count headline */}
              <div style={{ background: matchCount > 0 ? "rgba(77,189,151,0.12)" : "rgba(224,99,99,0.1)", border: `1px solid ${matchCount > 0 ? dc.emerald : "#e06363"}`, borderRadius: radius.sm, padding: "12px 16px", textAlign: "center" }}>
                <Mono style={{ fontSize: 32, fontWeight: 700, color: matchCount > 0 ? dc.emerald : "#e06363", lineHeight: 1 }}>{matchCount}</Mono>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(238,239,211,0.6)", marginTop: 4 }}>
                  {matcherReady ? `of ${total} modeled scenarios pass current gates` : "Complete valid inputs to compare scenarios"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(238,239,211,0.62)", marginTop: 4, lineHeight: 1.4 }}>
                  {!matcherReady ? "No match result is shown for incomplete or invalid entries." : matchCount === 0 ? "Review the exact failed gates below." : "Scroll down to review ordered model scenarios."}
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
              Internal scenario matcher
            </div>
            <h2 style={{ fontSize: "clamp(30px,3.8vw,48px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 10px", lineHeight: 1.05, color: dc.cream }}>
              <Mono style={{ fontWeight: 600, color: dc.lemon }}>{matchCount}</Mono> of {total} programs fit this deal
            </h2>
            <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(238,239,211,0.65)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {!matcherReady
                ? "Complete every highlighted field before the matcher evaluates any program."
                : matchCount === 0
                ? noMatchExplanation
                : matchCount === 1
                ? "One program fits. Check its check chips below — green chips are gates you clear; red chips show what's holding you back."
                : `${matchCount} programs fit. They're sorted best-fit first. The fit score shows how much room you have above each program's minimums.`}
            </p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: 0 }}>
              Adjust the deal box on the left. Scenarios reorder by the internal method, not lender quality or expected approval.
            </p>
          </div>

          <div
            className="gs-reveal dc-split li-tool-grid"
            style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}
          >
            {/* ── DEAL BOX INPUTS ── */}
            <div
              className="li-deal-box"
              style={{
                background: dc.teal,
                borderRadius: radius.md,
                padding: "clamp(20px,2.4vw,28px)",
                position: "sticky",
                top: 96,
                border: "1px solid rgba(238,239,211,0.16)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: dc.lemon, marginBottom: 6 }}>
                Your Deal Box
              </div>
              <p style={{ fontSize: 12, color: "rgba(238,239,211,0.62)", margin: "0 0 16px", lineHeight: 1.5 }}>
                Enter scenario details. Internal records reorder as you type; no credit decision or lender ranking is performed.
              </p>

              {/* FICO */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  FICO Score
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Self-reported credit used by this matcher. Current program floors and pricing must be confirmed from approved documents.</span>
                <div className={`li-field ${inputErrors.fico ? "is-invalid" : ""}`} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={5}
                    value={ficoInput}
                    onChange={(e) => setFicoInput(e.target.value)}
                    aria-invalid={Boolean(inputErrors.fico)}
                    aria-describedby={inputErrors.fico ? "li-fico-error" : undefined}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
                {inputErrors.fico && <span id="li-fico-error" className="li-error">{inputErrors.fico}</span>}
              </label>

              {/* LTV */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  LTV Needed
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Loan-to-value — loan ÷ property value. E.g. 25% down = 75% LTV. Lower is better.</span>
                <div className={`li-field ${inputErrors.ltv ? "is-invalid" : ""}`} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={1}
                    min={50}
                    max={90}
                    value={ltvInput}
                    onChange={(e) => setLtvInput(e.target.value)}
                    aria-invalid={Boolean(inputErrors.ltv)}
                    aria-describedby={inputErrors.ltv ? "li-ltv-error" : undefined}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>%</span>
                </div>
                {inputErrors.ltv && <span id="li-ltv-error" className="li-error">{inputErrors.ltv}</span>}
              </label>

              {/* DSCR */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Deal DSCR
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Modeled rent divided by monthly payment. Displayed checkpoints explain this tool and are not universal approval thresholds.</span>
                <div className={`li-field ${inputErrors.dscr ? "is-invalid" : ""}`} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="number"
                    step={0.01}
                    min={0}
                    max={3}
                    value={dscrInput}
                    onChange={(e) => setDscrInput(e.target.value)}
                    aria-invalid={Boolean(inputErrors.dscr)}
                    aria-describedby={inputErrors.dscr ? "li-dscr-error" : undefined}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>x</span>
                </div>
                {inputErrors.dscr && <span id="li-dscr-error" className="li-error">{inputErrors.dscr}</span>}
              </label>

              {/* Loan Amount */}
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Loan Amount
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Purchase price minus down payment. This matcher models amounts from $75,000; that is a tool boundary, not a universal minimum.</span>
                <div className={`li-field ${inputErrors.loan ? "is-invalid" : ""}`} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "rgba(238,239,211,0.62)", fontSize: 14 }}>$</span>
                  <input
                    className="li-in"
                    type="number"
                    step={5000}
                    min={75000}
                    value={loanInput}
                    onChange={(e) => setLoanInput(e.target.value)}
                    aria-invalid={Boolean(inputErrors.loan)}
                    aria-describedby={inputErrors.loan ? "li-loan-error" : undefined}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 600 }}
                  />
                </div>
                {inputErrors.loan && <span id="li-loan-error" className="li-error">{inputErrors.loan}</span>}
              </label>

              {/* State — proper label field, consistent with other inputs */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  State (2-letter)
                </span>
                <span style={{ display: "block", fontSize: 11, color: "rgba(238,239,211,0.62)", marginBottom: 5, lineHeight: 1.4 }}>Where the property is located. Affects prepayment penalty (a fee some loans charge if you pay off or refinance early) risk and state-specific program availability.</span>
                <div className={`li-field ${inputErrors.state ? "is-invalid" : ""}`} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    className="li-in"
                    type="text"
                    maxLength={2}
                    value={stateCode}
                    onChange={(e) => setStateCode((e.target.value || "").toUpperCase().slice(0, 2))}
                    aria-invalid={Boolean(inputErrors.state)}
                    aria-describedby={inputErrors.state ? "li-state-error" : undefined}
                    style={{ padding: "12px 7px", fontSize: 16, fontWeight: 700, textTransform: "uppercase", width: "100%" }}
                  />
                </div>
                {inputErrors.state && <span id="li-state-error" className="li-error">{inputErrors.state}</span>}
              </label>

              {/* Property type toggles */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setNeedsSTR(!needsSTR)}
                  className="li-toggle"
                  aria-pressed={needsSTR}
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
                  aria-pressed={needsMF}
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
                    background: "rgba(224,99,99,0.1)",
                    borderRadius: radius.sm,
                    border: "1px solid rgba(224,99,99,0.3)",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#e06363",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>State-specific review flag.</strong> The internal dataset flags {stateCode} for additional prepayment-structure review. Confirm current law, borrower/entity scope, and final documents with qualified counsel.
                </div>
              )}
            </div>

            {/* ── PROGRAM LIST ── */}
            <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!matcherReady && (
                <div className="li-invalid" role="alert" aria-live="polite">
                  <strong style={{ display: "block", color: dc.lemon, marginBottom: 6 }}>Incomplete scenario</strong>
                  No program result or fit score is calculated until every highlighted field is valid.
                </div>
              )}
              {matcherReady && scored.map((p, i) => {
                const statusColor = p.fits ? dc.emerald : p.passed >= 3 ? swatch.lemon : "#e06363";
                const misses = p.checks.length - p.passed;
                const statusLabel = p.fits ? "FITS" : p.passed >= Math.max(3, p.checks.length - 1) ? `${misses} miss${misses === 1 ? "" : "es"}` : "NO FIT";
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
                            background: p.fits ? "rgba(77,189,151,0.16)" : p.passed >= 3 ? "rgba(216,217,88,0.12)" : "rgba(224,99,99,0.1)",
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
                              color: c.ok ? dc.emerald : "#e06363",
                              background: c.ok ? "rgba(77,189,151,0.12)" : "rgba(224,99,99,0.1)",
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
            Internal scenario parameters dated {DSCR_PROGRAMS_AS_OF}. Fit scores are an explanatory ordering
            based on modeled gates and cushion. They are not an independent lender ranking, availability check, quote, or credit
            approval.
          </p>
        </div>
      </section>

      {/* ── TRUE COST OF CAPITAL COMPARATOR ── */}
      <section className="gs-reveal" style={{ background: dc.cream, padding: `clamp(56px,7vw,88px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 28, maxWidth: "62ch" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.rain, marginBottom: 12 }}>Beyond the rate</div>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 600, letterSpacing: "-0.035em", margin: 0, color: dc.dark, lineHeight: 1.05 }}>Two hypothetical structures — which modeled cost is lower?</h2>
          </div>
          <TrueCostComparator accent={dc.rain} />
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
                One scenario. Current review.
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
                Request a scenario review to compare verified inputs with current approved program documents. This page does not identify a lender, make a placement decision, or promise funding.
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
                Request scenario review →
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
