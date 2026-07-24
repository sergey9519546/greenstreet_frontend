/**
 * RateQuizPage — Greenstreet Finance rate-intelligence quiz.
 *
 * Design contract:
 *   • Solid flat cards, radius.md/lg, 1px FADED border, NO shadow/glow/glass
 *   • ONE dominant lemon primary CTA per screen
 *   • GSAP/CSS only on interaction (step transitions, select, result reveal)
 *   • NEVER page-load gsap.from() / scroll-reveal (route-drop bug)
 *   • Reduced-motion safe — default fully visible
 *   • DscrGauge on result when DSCR value available
 *   • RiskFlame for WEAK tier results
 *   • 44px+ tap targets, mobile-first, breakpoints 991/767/479
 *   • Mono+tabular numerics
 *   • Compliance: "preliminary estimate, not a commitment to lend"
 */
import React, { useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { DcShell, dc, Mono } from "../design/dc";
import { DscrGauge, RiskFlame, MotionWorkbench } from "../design/artifacts";
import { swatch, radius, font } from "../theme";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz data — five questions, verbatim labels + education copy
// ─────────────────────────────────────────────────────────────────────────────
interface QuizOption {
  label: string;
  hint: string;
  v: string;
}

interface QuizQuestion {
  id: string;
  step: number;
  group: string;
  q: string;
  education: string;
  opts: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "type",
    step: 1,
    group: "Property",
    q: "What type of property are you financing?",
    education:
      "DSCR loans work for most rental property types. Short-term rentals (Airbnb-style) and larger multifamily buildings have specialty programs with slightly different requirements.",
    opts: [
      { label: "Single-family rental", hint: "1 unit — most common", v: "sfr" },
      { label: "2–4 unit rental", hint: "small multifamily", v: "small" },
      { label: "5+ unit / mixed-use", hint: "multifamily", v: "multi" },
      { label: "Short-term rental (STR)", hint: "Airbnb / VRBO", v: "str" },
    ],
  },
  {
    id: "credit",
    step: 2,
    group: "Credit",
    q: "What's your approximate credit score?",
    education:
      "We don't pull your credit here — a range is enough. Your score affects your rate tier and the minimum down payment required. Higher score = lower rate.",
    opts: [
      { label: "740 or above", hint: "best rate tier", v: "a" },
      { label: "700–739", hint: "strong — near-best pricing", v: "b" },
      { label: "660–699", hint: "standard programs available", v: "c" },
      { label: "620–659", hint: "flexible — more down needed", v: "d" },
    ],
  },
  {
    id: "down",
    step: 3,
    group: "Down payment",
    q: "How much are you putting down?",
    education:
      "LTV (loan-to-value — lower means more equity and better terms) = 100% minus your down payment. A 25% down payment = 75% LTV. Most DSCR programs require at least 20% down (80% LTV). Putting more down lowers your rate and opens more programs.",
    opts: [
      { label: "35% or more", hint: "≤65% LTV — best rate tier", v: "a" },
      { label: "25–34%", hint: "66–75% LTV — strong", v: "b" },
      { label: "20–24%", hint: "76–80% LTV — standard floor", v: "c" },
      { label: "Less than 20%", hint: ">80% LTV — limited programs", v: "d" },
    ],
  },
  {
    id: "coverage",
    step: 4,
    group: "Cash flow",
    q: "How does the monthly rent compare to the full payment?",
    education:
      "DSCR (Debt Service Coverage Ratio) = monthly rent ÷ PITIA (the full monthly payment — principal, interest, taxes, insurance, and HOA). 1.00x means rent exactly covers the payment. Most programs require at least 1.00x; some accept below 1.0x with compensating factors like reserves or low LTV.",
    opts: [
      {
        label: "Comfortably — 1.25x or higher",
        hint: "strong DSCR — best programs",
        v: "a",
      },
      {
        label: "It qualifies — roughly 1.0–1.25x",
        hint: "standard DSCR",
        v: "b",
      },
      {
        label: "It's tight — below 1.0x",
        hint: "sub-1.0 programs available",
        v: "c",
      },
      {
        label: "Not sure yet",
        hint: "estimate ok — use calculator",
        v: "b",
      },
    ],
  },
  {
    id: "who",
    step: 5,
    group: "Borrower",
    q: "Who is the borrower?",
    education:
      "This affects which program tiers and structures are available. First-time investors qualify — DSCR loans don't require prior rental experience.",
    opts: [
      {
        label: "US citizen or permanent resident",
        hint: "LLC or personal — standard",
        v: "a",
      },
      {
        label: "Experienced investor — 5+ rentals",
        hint: "portfolio programs available",
        v: "b",
      },
      {
        label: "Foreign national or ITIN borrower",
        hint: "global program",
        v: "g",
      },
      {
        label: "First DSCR loan — new to rentals",
        hint: "new investor programs",
        v: "c",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Scoring — preserved verbatim from original logic
// ─────────────────────────────────────────────────────────────────────────────
interface ResultData {
  program: string;
  rate: string;
  note: string;
  resultStats: { label: string; val: string }[];
  tier: "BEST" | "GOOD" | "WEAK";
  dscrValue: number | null; // numeric DSCR for the gauge
  verdictLines: { driven: string; why: string }[];
}

function deriveResult(answers: string[]): ResultData {
  let program = "Greenstreet DSCR 1-4 — Standard";
  let rate = "6.75% – 7.25%";
  let note =
    "The everyday DSCR loan. 620+ FICO, up to 80% LTV, loans to $4M, 30-year fixed.";
  let ltv = "Up to 80%";
  let fico = "620+";
  let dscrMin = "1.00x";
  let term = "30-yr fixed";
  let tier: "BEST" | "GOOD" | "WEAK" = "GOOD";

  const [type, credit, down, cov, who] = answers;

  if (who === "g") {
    program = "Greenstreet DSCR Global";
    rate = "7.50% – 8.25%";
    note =
      "Foreign national / ITIN program. Passport plus alternative credit, 30% down minimum, loans to $3M.";
    ltv = "Up to 70%";
    fico = "Alt credit";
    dscrMin = "1.00x";
    tier = "WEAK";
  } else if (cov === "c") {
    program = "Greenstreet DSCR Sub-1.0";
    rate = "7.25% – 8.00%";
    note =
      "For deals below 1.0x DSCR with compensating factors — reserves, low LTV, or strong credit.";
    ltv = "Up to 70%";
    fico = "680+";
    dscrMin = "0.75x";
    tier = "WEAK";
  } else if (type === "multi") {
    program = "Greenstreet DSCR Multi-Family";
    rate = "6.99% – 7.50%";
    note =
      "5+ unit and mixed-use. Blanket and portfolio structures available.";
    ltv = "Up to 75%";
    fico = "660+";
    dscrMin = "1.10x";
    tier = "GOOD";
  } else if (type === "str") {
    program = "Greenstreet DSCR — STR";
    rate = "7.10% – 7.75%";
    note =
      "Short-term rental program. Underwrites documented or projected ADR×occupancy with a haircut.";
    ltv = "Up to 75%";
    fico = "680+";
    dscrMin = "1.00x";
    tier = "GOOD";
  } else if (credit === "a" && (down === "a" || down === "b")) {
    program = "Greenstreet DSCR 1-4 — Best Tier";
    rate = "6.25% – 6.75%";
    note = "Lowest rate tier. 740+ FICO, ≤75% LTV, three months reserves.";
    ltv = "Up to 75%";
    fico = "740+";
    dscrMin = "1.25x";
    tier = "BEST";
  }

  const resultStats = [
    { label: "Max LTV", val: ltv },
    { label: "FICO floor", val: fico },
    { label: "Min DSCR", val: dscrMin },
    { label: "Term", val: term },
  ];

  // Derive a numeric DSCR estimate for the gauge (based on coverage answer)
  const dscrEstimate: number | null =
    cov === "a" ? 1.35 : cov === "b" ? 1.12 : cov === "c" ? 0.88 : 1.12;

  // What drove the result — plain language
  const verdictLines: { driven: string; why: string }[] = [];
  if (who === "g") {
    verdictLines.push({ driven: "Borrower type", why: "Foreign national / ITIN — dedicated global program applies." });
  }
  if (cov === "c") {
    verdictLines.push({ driven: "Cash flow (DSCR)", why: "Sub-1.0 coverage requires compensating factors." });
  }
  if (type === "multi") {
    verdictLines.push({ driven: "Property type", why: "5+ unit / mixed-use triggers the multifamily program." });
  }
  if (type === "str") {
    verdictLines.push({ driven: "Property type", why: "STR income is underwritten with a documented ADR haircut." });
  }
  if (tier === "BEST") {
    verdictLines.push({ driven: "Credit + down payment", why: "740+ FICO and ≤75% LTV put you in the best-rate tier." });
  }
  if (verdictLines.length === 0) {
    verdictLines.push({ driven: "Overall profile", why: "Solid across credit, LTV, and cash flow — standard program." });
  }

  return { program, rate, note, resultStats, tier, dscrValue: dscrEstimate, verdictLines };
}

// ─────────────────────────────────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────────────────────────────────

// Progress dots — 5 steps, filled/active/empty states
function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Question ${step} of ${total}`}
      style={{ display: "flex", gap: 8, alignItems: "center" }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < step;
        const active = i === step;
        return (
          <div
            key={i}
            style={{
              width: active ? 28 : 8,
              height: 8,
              borderRadius: 99,
              background: filled
                ? swatch.emerald
                : active
                ? swatch.lemon
                : swatch.midnightFaded,
              transition: "width .25s ease, background .25s ease",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

// Education/helper callout
function HelperBox({ text }: { text: string }) {
  return (
    <div
      style={{
        background: swatch.mint,
        borderRadius: radius.sm,
        padding: "12px 16px",
        marginBottom: 28,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.65,
        color: "rgba(0,55,56,0.68)",
        letterSpacing: "-0.01em",
        border: `1px solid ${swatch.midnightFaded}`,
      }}
    >
      {text}
    </div>
  );
}

// Option chip/row — the tappable card for each answer
function OptionRow({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={selected}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        background: selected ? swatch.lemon : swatch.pistachio,
        border: selected
          ? `2px solid ${swatch.midnight}`
          : `1px solid ${swatch.midnightFaded}`,
        borderRadius: radius.sm,
        padding: "18px 22px",
        cursor: "pointer",
        minHeight: 56,
        transition: "background .13s, border-color .13s, transform .1s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLElement).style.background = swatch.mint;
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLElement).style.background = swatch.pistachio;
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Selection dot */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: selected
              ? `5px solid ${swatch.midnight}`
              : `2px solid ${swatch.midnightFaded}`,
            background: selected ? swatch.lemon : "transparent",
            flexShrink: 0,
            transition: "border .13s",
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: swatch.midnight,
            lineHeight: 1.25,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: selected ? "rgba(0,55,56,0.6)" : "rgba(0,55,56,0.45)",
          letterSpacing: "-0.005em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {hint}
      </span>
    </div>
  );
}

// Stat tile for the result grid
function StatTile({ label, val }: { label: string; val: string }) {
  return (
    <div
      style={{
        background: swatch.darkTeal,
        borderRadius: radius.sm,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          color: "rgba(238,239,211,0.45)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <Mono
        style={{
          display: "block",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: swatch.pistachio,
        }}
      >
        {val}
      </Mono>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────
export default function RateQuizPage({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const total = QUESTIONS.length;
  const inQuiz = step < total;
  const done = step === total;
  const result = done ? deriveResult(answers) : null;

  // GSAP transition on step change — interaction-driven only, never on mount
  const animateCard = useCallback((dir: 1 | -1 = 1) => {
    const el = cardRef.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(
      el,
      { x: dir * 32, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.32, ease: "power2.out" }
    );
  }, []);

  const animateResult = useCallback(() => {
    const el = resultRef.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setRevealed(true); return; }
    gsap.fromTo(
      el,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.48,
        ease: "power3.out",
        onComplete: () => setRevealed(true),
      }
    );
  }, []);

  // Pick an answer and advance
  const pick = useCallback(
    (v: string) => {
      if (pendingAnswer !== null) return;
      setPendingAnswer(v);
      const newAns = [...answers];
      newAns[step] = v;

      // Brief selection flash, then advance
      requestAnimationFrame(() => {
        setTimeout(() => {
          setPendingAnswer(null);
          setAnswers(newAns);
          const nextStep = step + 1;
          setStep(nextStep);
          if (nextStep < total) {
            requestAnimationFrame(() => animateCard(1));
          } else {
            requestAnimationFrame(() => animateResult());
          }
        }, 160);
      });
    },
    [answers, step, total, animateCard, animateResult, pendingAnswer]
  );

  const back = useCallback(() => {
    if (step <= 0) return;
    const prev = step - 1;
    setStep(prev);
    setRevealed(false);
    requestAnimationFrame(() => animateCard(-1));
  }, [step, animateCard]);

  const restart = useCallback(() => {
    setStep(0);
    setAnswers([]);
    setPendingAnswer(null);
    setRevealed(false);
    requestAnimationFrame(() => animateCard(1));
  }, [animateCard]);

  // Tier config
  const tierColor =
    result?.tier === "BEST"
      ? swatch.emerald
      : result?.tier === "GOOD"
      ? swatch.lemon
      : "#f97316";

  const tierLabel =
    result?.tier === "BEST"
      ? "Best rate tier"
      : result?.tier === "GOOD"
      ? "Standard program"
      : "Specialty program";

  // Risk level for RiskFlame
  const riskLevel =
    result?.tier === "WEAK" ? ("high" as const) : ("none" as const);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calculator", view: "dscr-calculator" },
        { label: "State Laws", view: "state-laws" },
      ]}
      cta={{ label: "Speak to a specialist", onClick: () => (window as any).openQualify?.() }}
    >
      {/* Inline style overrides scoped to this page */}
      <style>{`
        .rq-opt:focus-visible {
          outline: 2px solid ${swatch.lemon};
          outline-offset: 2px;
          border-radius: ${radius.sm};
        }
        @media (max-width: 479px) {
          .rq-opt-hint { display: none !important; }
          .rq-result-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 767px) {
          .rq-cta-row { flex-direction: column !important; }
          .rq-cta-row a, .rq-cta-row button { width: 100% !important; text-align: center !important; justify-content: center !important; }
          .rq-result-cols { flex-direction: column !important; }
          .rq-gauge-col { align-self: flex-start !important; }
          .rq-hero-grid { grid-template-columns: 1fr !important; }
          .rq-hero-copy { text-align: left !important; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: swatch.pistachio,
          padding:
            "clamp(52px,7vh,88px) clamp(1.5rem,5vw,4rem) clamp(28px,4vh,44px)",
        }}
      >
        <div
          id="gs-hero-content"
          className="rq-hero-grid"
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.75fr)",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div className="rq-hero-copy">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: swatch.mint,
                border: `1px solid ${swatch.midnightFaded}`,
                borderRadius: 99,
                padding: "6px 14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: swatch.emerald,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(0,55,56,0.65)",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase" as const,
                }}
              >
                Rate intelligence · 5 questions · 60 seconds
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(38px,5.8vw,74px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 0.98,
                color: swatch.midnight,
                margin: "0 0 20px",
                fontFamily: font.family,
              }}
            >
              Find the right DSCR program for your deal.
            </h1>

            <p
              style={{
                fontSize: "clamp(15px,1.8vw,18px)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "rgba(0,55,56,0.6)",
                margin: 0,
                maxWidth: "54ch",
                letterSpacing: "-0.01em",
                fontFamily: font.family,
              }}
            >
              Five quick questions about your property, credit, and cash flow. No credit pull — we map your answers to a Greenstreet program and an indicative rate range. Estimate-ok on every field.
            </p>
          </div>
          <MotionWorkbench mode="quiz" value={`${step + 1}/${total}`} label="Questions answered" />
        </div>
      </section>

      {/* ── QUIZ / RESULT BAND ───────────────────────────────────────────── */}
      <section
        style={{
          background: swatch.pistachio,
          padding:
            "clamp(8px,1.5vh,20px) clamp(1.5rem,5vw,4rem) clamp(64px,10vh,120px)",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* ── QUIZ ── */}
          {inQuiz && (
            <div ref={cardRef}>
              {/* Progress strip + meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                  gap: 12,
                  flexWrap: "wrap" as const,
                }}
              >
                <ProgressDots step={step} total={total} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(0,55,56,0.45)",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {QUESTIONS[step].group} · {step + 1} of {total}
                </span>
              </div>

              {/* Question card */}
              <div
                style={{
                  background: swatch.white,
                  borderRadius: radius.lg,
                  padding: "clamp(28px,4vw,48px)",
                  border: `1px solid ${swatch.midnightFaded}`,
                }}
              >
                {/* Question heading */}
                <h2
                  style={{
                    fontSize: "clamp(22px,3vw,34px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    color: swatch.midnight,
                    margin: "0 0 20px",
                    fontFamily: font.family,
                  }}
                >
                  {QUESTIONS[step].q}
                </h2>

                {/* Education / helper text */}
                <HelperBox text={QUESTIONS[step].education} />

                {/* Answer options */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {QUESTIONS[step].opts.map((o, idx) => (
                    <OptionRow
                      key={idx}
                      label={o.label}
                      hint={o.hint}
                      selected={
                        pendingAnswer === o.v ||
                        (pendingAnswer === null && answers[step] === o.v)
                      }
                      onClick={() => pick(o.v)}
                    />
                  ))}
                </div>

                {/* Back button */}
                {step > 0 && (
                  <button
                    onClick={back}
                    aria-label="Go back to previous question"
                    style={{
                      marginTop: 24,
                      background: "none",
                      border: "none",
                      color: "rgba(0,55,56,0.45)",
                      fontFamily: font.family,
                      fontWeight: 600,
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                      cursor: "pointer",
                      minHeight: 44,
                      padding: "0 4px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── RESULT ── */}
          {done && result && (
            <div
              ref={resultRef}
              style={{ opacity: revealed ? 1 : 0, transition: "opacity .2s" }}
            >
              {/* Tier badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 20,
                  flexWrap: "wrap" as const,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: swatch.mint,
                    border: `1px solid ${swatch.midnightFaded}`,
                    borderRadius: 99,
                    padding: "6px 14px",
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: tierColor,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(0,55,56,0.65)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {tierLabel}
                  </span>
                </div>
                {result.tier === "WEAK" && (
                  <RiskFlame level={riskLevel} size={22} />
                )}
              </div>

              {/* Main result card — dark */}
              <div
                style={{
                  background: swatch.midnight,
                  borderRadius: radius.lg,
                  padding: "clamp(28px,4.5vw,52px)",
                  border: "1px solid rgba(238,239,211,0.1)",
                  marginBottom: 16,
                }}
              >
                {/* Program name */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    color: swatch.lemon,
                    marginBottom: 8,
                  }}
                >
                  Best-match program
                </div>

                <h2
                  style={{
                    fontSize: "clamp(22px,3.2vw,36px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    margin: "0 0 10px",
                    color: swatch.pistachio,
                    fontFamily: font.family,
                  }}
                >
                  {result.program}
                </h2>

                {/* Plain verdict */}
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: "rgba(238,239,211,0.65)",
                    margin: "0 0 28px",
                    maxWidth: "54ch",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {result.tier === "BEST"
                    ? "Your profile — strong credit and lower LTV — places you in the best-rate tier with the widest program selection."
                    : result.tier === "GOOD"
                    ? "Your scenario fits standard DSCR programs. A specialist can confirm the best program match and lock your terms."
                    : "This program has tighter requirements, but it's built for your situation. Reserves, lower LTV, or stronger credit can help you qualify — a specialist can structure the deal."}
                </p>

                {/* Rate + gauge columns */}
                <div
                  className="rq-result-cols"
                  style={{
                    display: "flex",
                    gap: 28,
                    alignItems: "flex-start",
                    marginBottom: 28,
                    flexWrap: "wrap" as const,
                  }}
                >
                  {/* Rate */}
                  <div style={{ flex: "1 1 220px" }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                        color: "rgba(238,239,211,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      Indicative rate range
                    </div>
                    <Mono
                      style={{
                        display: "block",
                        fontSize: "clamp(30px,4.5vw,52px)",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        color: swatch.lemon,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {result.rate}
                    </Mono>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: 1.55,
                        color: "rgba(238,239,211,0.55)",
                        margin: 0,
                        maxWidth: "42ch",
                      }}
                    >
                      {result.note}
                    </p>
                  </div>

                  {/* DSCR Gauge — only when we have a coverage estimate */}
                  {result.dscrValue !== null && (
                    <div
                      className="rq-gauge-col"
                      style={{ flex: "0 0 auto", textAlign: "center" }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          color: "rgba(238,239,211,0.4)",
                          marginBottom: 8,
                        }}
                      >
                        DSCR estimate
                      </div>
                      <DscrGauge value={result.dscrValue} size={140} label />
                    </div>
                  )}
                </div>

                {/* What drove this result */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    color: "rgba(238,239,211,0.35)",
                    marginBottom: 10,
                  }}
                >
                  What drove this result
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {result.verdictLines.map((vl, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          marginTop: 3,
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: tierColor,
                        }}
                      />
                      <div>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: swatch.pistachio,
                          }}
                        >
                          {vl.driven}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "rgba(238,239,211,0.55)",
                          }}
                        >
                          {" "}
                          — {vl.why}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Program stat grid */}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    color: "rgba(238,239,211,0.35)",
                    marginBottom: 10,
                  }}
                >
                  Program requirements
                </div>
                <div
                  className="rq-result-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >
                  {result.resultStats.map((r, i) => (
                    <StatTile key={i} label={r.label} val={r.val} />
                  ))}
                </div>

                {/* WEAK — strengthen the deal */}
                {result.tier === "WEAK" && (
                  <div
                    style={{
                      background: "rgba(249,115,22,0.08)",
                      border: "1px solid rgba(249,115,22,0.28)",
                      borderRadius: radius.sm,
                      padding: "14px 18px",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase" as const,
                        color: "#f97316",
                        marginBottom: 6,
                      }}
                    >
                      How to strengthen this deal
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "rgba(238,239,211,0.62)",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      Increasing your down payment (lower LTV), building 6+ months of reserves kept in the bank after closing, or raising your credit score each improve your position. A Greenstreet specialist can structure the deal to qualify.
                    </p>
                  </div>
                )}

                {/* Next step box */}
                <div
                  style={{
                    background: "rgba(238,239,211,0.06)",
                    border: "1px solid rgba(238,239,211,0.13)",
                    borderRadius: radius.sm,
                    padding: "14px 18px",
                    marginBottom: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "rgba(238,239,211,0.6)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong
                    style={{
                      color: swatch.lemon,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    What happens next
                  </strong>
                  Run your exact numbers in the DSCR Calculator (rent ÷ PITIA) to confirm the ratio, then speak with a Greenstreet specialist for a full scenario review and program lock. No credit pull. No commitment.
                </div>

                {/* Compliance disclaimer */}
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(238,239,211,0.32)",
                    margin: "8px 0 28px",
                    lineHeight: 1.5,
                  }}
                >
                  Preliminary estimate only — not a commitment to lend. Final terms subject to full underwriting, appraisal, and credit review. Self-reported credit is indicative only; no credit pull is performed.
                </p>

                {/* CTAs */}
                <div
                  className="rq-cta-row"
                  style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, alignItems: "center" }}
                >
                  <a
                    href="/dscr-calculator"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate?.("dscr-calculator");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: swatch.lemon,
                      color: swatch.midnight,
                      fontFamily: font.family,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      padding: "15px 28px",
                      borderRadius: radius.sm,
                      minHeight: 48,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Run the numbers →
                  </a>
                  <button
                    onClick={() => (window as any).openQualify?.()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "transparent",
                      border: `1.5px solid rgba(238,239,211,0.28)`,
                      color: swatch.pistachio,
                      fontFamily: font.family,
                      fontWeight: 600,
                      fontSize: 15,
                      padding: "14px 24px",
                      borderRadius: radius.sm,
                      cursor: "pointer",
                      minHeight: 48,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Speak to a specialist →
                  </button>
                  <button
                    onClick={restart}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(238,239,211,0.38)",
                      fontFamily: font.family,
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: "pointer",
                      padding: "14px 0",
                      textDecoration: "underline",
                      letterSpacing: "-0.01em",
                      minHeight: 44,
                    }}
                  >
                    Retake quiz
                  </button>
                </div>
              </div>

              {/* Trust strip */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap" as const,
                  padding: "14px 4px 0",
                }}
              >
                {[
                  "No credit pull",
                  "No email required",
                  "Estimate only — not a commitment",
                ].map((item) => (
                  <span
                    key={item}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(0,55,56,0.42)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ flexShrink: 0 }}
                    >
                      <path
                        d="M2 6.5l2.5 2.5L10 3"
                        stroke={swatch.emerald}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trust strip on quiz steps */}
          {inQuiz && (
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap" as const,
                padding: "18px 4px 0",
              }}
            >
              {[
                "No credit pull",
                "No email required",
                "Estimate-ok on every field",
              ].map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(0,55,56,0.42)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M2 6.5l2.5 2.5L10 3"
                      stroke={swatch.emerald}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM INFO BAND ─────────────────────────────────────────────── */}
      <section
        style={{
          background: swatch.mint,
          borderTop: `1px solid ${swatch.midnightFaded}`,
          padding:
            "clamp(36px,5vh,56px) clamp(1.5rem,5vw,4rem)",
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {[
            {
              label: "What is DSCR?",
              body: "Debt Service Coverage Ratio — whether the property's monthly rent can cover the full loan payment (PITIA: principal, interest, taxes, insurance, and HOA). 1.00x = rent exactly covers the payment.",
            },
            {
              label: "No income docs needed",
              body: "DSCR loans qualify on the property's income, not your tax returns or pay stubs. Ideal for self-employed investors and those with complex income structures.",
            },
            {
              label: "Rates are illustrative",
              body: "Rate ranges shown are indicative only and based on current Greenstreet program tiers. Final pricing depends on full underwriting. Call +1 (555) 010-0000 for a live scenario review.",
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: swatch.pistachio,
                borderRadius: radius.md,
                padding: "22px 24px",
                border: `1px solid ${swatch.midnightFaded}`,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: swatch.midnight,
                  marginBottom: 8,
                  letterSpacing: "-0.01em",
                }}
              >
                {card.label}
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  color: "rgba(0,55,56,0.58)",
                  margin: 0,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </DcShell>
  );
}
