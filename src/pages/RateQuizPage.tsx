import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { swatch, radius } from "../theme";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

// Pistachio accent — matches the Rate Quiz mockup exactly.
// Nav + footer: pistachio background, dark-ink text (light identity).
const RQ_ACCENT = dc.cream; // #eeefd3

// ── Quiz data — five questions, preserved verbatim ──────────────────────────
const qs = [
  {
    q: "What type of property are you financing?",
    education: "DSCR loans work for most rental property types. Short-term rentals (Airbnb-style) and larger multifamily buildings have specialty programs with slightly different requirements.",
    opts: [
      { label: "Single-family rental (1 unit)", hint: "most common", v: "sfr" },
      { label: "2–4 unit rental", hint: "small multi", v: "small" },
      { label: "5+ unit / mixed-use", hint: "multifamily", v: "multi" },
      { label: "Short-term rental (STR)", hint: "Airbnb / VRBO", v: "str" },
    ],
  },
  {
    q: "What's your approximate credit score?",
    education: "We don't pull your credit here — a range is enough. Your score affects your rate tier and the minimum down payment required. Higher score = lower rate.",
    opts: [
      { label: "740 or above", hint: "best rate tier", v: "a" },
      { label: "700–739", hint: "strong — near-best pricing", v: "b" },
      { label: "660–699", hint: "standard programs available", v: "c" },
      { label: "620–659", hint: "flexible — more down needed", v: "d" },
    ],
  },
  {
    q: "How much are you putting down?",
    education:
      "LTV (how the loan amount compares to the property value — lower = more equity = better terms) = 100% minus your down payment. A 25% down payment means 75% LTV. Most DSCR programs cap at 80% LTV (20% down minimum). Putting more down lowers your rate and opens more programs.",
    opts: [
      { label: "35% or more", hint: "≤65% LTV — best rate tier", v: "a" },
      { label: "25–34%", hint: "66–75% LTV — strong", v: "b" },
      { label: "20–24%", hint: "76–80% LTV — standard floor", v: "c" },
      { label: "Less than 20%", hint: ">80% LTV — limited programs", v: "d" },
    ],
  },
  {
    q: "How does the monthly rent compare to the full payment?",
    education: "DSCR = monthly rent ÷ PITIA (the full monthly payment — principal, interest, taxes, insurance, and HOA). 1.00x means rent exactly covers the payment. Most programs require at least 1.00x; some accept below 1.0x with compensating factors.",
    opts: [
      { label: "Comfortably — 1.25x or higher", hint: "strong DSCR — best programs", v: "a" },
      { label: "It qualifies — roughly 1.0–1.25x", hint: "standard DSCR", v: "b" },
      { label: "It's tight — below 1.0x", hint: "sub-1.0 programs available", v: "c" },
      { label: "Not sure yet", hint: "use the DSCR calculator", v: "b" },
    ],
  },
  {
    q: "Who is the borrower?",
    education: "This affects which program tiers and structures are available. First-time investors qualify — DSCR loans don't require prior rental experience.",
    opts: [
      { label: "US citizen or permanent resident (LLC or personal)", hint: "standard", v: "a" },
      { label: "Experienced investor — 5+ rentals owned", hint: "portfolio programs", v: "b" },
      { label: "Foreign national or ITIN borrower", hint: "global program", v: "g" },
      { label: "First DSCR loan — new to rentals", hint: "new investor", v: "c" },
    ],
  },
];

// ── Rate tier logic — preserved verbatim from original ───────────────────────
function deriveResult(answers: string[]) {
  let program = "Greenstreet DSCR 1-4 — Standard";
  let rate = "6.75% – 7.25%";
  let note =
    "The everyday DSCR loan. 620+ FICO, up to 80% LTV, loans to $4M, 30-year fixed.";
  let ltv = "Up to 80%";
  let fico = "620+";
  let dscrMin = "1.00x";
  let term = "30-yr fixed";
  let tier: "BEST" | "GOOD" | "WEAK" = "GOOD";

  const credit = answers[1];
  const down = answers[2];
  const cov = answers[3];
  const who = answers[4];
  const type = answers[0];

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
    note =
      "Lowest rate tier. 740+ FICO, ≤75% LTV, three months reserves.";
    ltv = "Up to 75%";
    fico = "740+";
    dscrMin = "1.25x";
    term = "30-yr fixed";
    tier = "BEST";
  }

  const resultStats = [
    { label: "Max LTV", val: ltv },
    { label: "FICO floor", val: fico },
    { label: "Min DSCR", val: dscrMin },
    { label: "Term", val: term },
  ];

  return { program, rate, note, resultStats, tier };
}

export default function RateQuizPage({ onBack, onNavigate }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Rate Quiz | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  // Card transition — animate in after each answer or step change
  const flash = () => {
    requestAnimationFrame(() => {
      const c = cardRef.current;
      if (c) {
        gsap.fromTo(
          c,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
        );
      }
    });
  };

  const pick = (v: string) => {
    const newAns = [...answers];
    newAns[step] = v;
    setAnswers(newAns);
    setStep(step + 1);
    flash();
  };

  const back = () => {
    if (step > 0) {
      setStep(step - 1);
      flash();
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    flash();
  };

  const inQuiz = step < qs.length;
  const done = !inQuiz;

  const result = done ? deriveResult(answers) : null;

  // WEAK tier uses orange-risk color (#f97316 per design contract for high-risk)
  const tierColor =
    result?.tier === "BEST"
      ? dc.emerald
      : result?.tier === "GOOD"
      ? dc.lemon
      : "#f97316";

  const scrollToQuiz = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector("#rq-tool");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 30,
        behavior: "smooth",
      });
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "Calculator", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
      ]}
      cta={{ label: "Take the quiz →", onClick: scrollToQuiz }}
      accent={RQ_ACCENT}
    >
      {/* Extra CSS — option hover/focus; no glass/float/blur */}
      <style>{`
        .rq-opt{cursor:pointer;transition:transform .12s,background .15s,border-color .15s;}
        .rq-opt:hover{transform:translateY(-2px);border-color:${swatch.lemon} !important;background:${swatch.mint} !important;}
        .rq-opt:focus-visible{outline:2px solid ${swatch.lemon};outline-offset:2px;border-radius:${radius.sm};}
        /* Back button — ensure 44px touch target */
        .rq-back{min-height:44px;display:inline-flex;align-items:center;padding:0 4px;}
        /* Nav is pistachio — override text colour to dark ink */
        .dc-nav a,.dc-nav button{color:rgba(0,55,56,0.72) !important;}
        .dc-nav a.dc-cta{color:${dc.cream} !important;background:${dc.dark} !important;}
        .dc-nav a:first-child{color:${dc.dark} !important;}
      `}</style>

      {/* ── HERO — pistachio, centred, light identity ─────────────────────── */}
      <section
        style={{
          background: dc.cream,
          color: dc.dark,
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(32px,4vh,48px)",
          overflow: "hidden",
        }}
      >
        <div
          id="rq-hero-content"
          style={{
            maxWidth: 820,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,55,56,0.5)",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Find your program / 60-second quiz
          </div>

          {/* H1 — matches mockup sizing exactly */}
          <H1 style={{ margin: "0 0 22px" }}>
            Find the right DSCR program for your deal.
          </H1>

          {/* Sub — five questions, compliance-safe, no email/credit pull */}
          <Lead style={{ color: "rgba(0,55,56,0.62)", maxWidth: "50ch", margin: "0 auto" }}>
            Five quick questions about your property, credit, and down payment. No credit pull, no email required. We map your answers to a Greenstreet program and an indicative rate range — takes about 60 seconds.
          </Lead>
        </div>
      </section>

      {/* ── QUIZ BAND — the centerpiece ────────────────────────────────────── */}
      <section
        id="rq-tool"
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding:
            "clamp(16px,2vh,32px) clamp(1.5rem,4vw,3rem) clamp(72px,10vh,128px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Progress bar strip — 5 segments, one per question */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 36,
            }}
          >
            {qs.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 5,
                  borderRadius: 3,
                  background:
                    i < step
                      ? swatch.emerald
                      : i === step && inQuiz
                      ? swatch.rainforest
                      : swatch.midnightFaded,
                  transition: "background .3s",
                }}
              />
            ))}
          </div>

          {/* Card container — GSAP targets this ref */}
          <div ref={cardRef}>
            {/* ── QUESTION CARD ── */}
            {inQuiz && (
              <div
                id="rq-card"
                style={{
                  background: swatch.white,
                  borderRadius: radius.md,
                  padding: "clamp(32px,4vw,56px)",
                  border: `1px solid ${swatch.midnightFaded}`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                    color: "#006565",
                    marginBottom: 14,
                  }}
                >
                  Question {step + 1} of 5
                </div>

                <h2
                  style={{
                    fontSize: "clamp(26px,3.2vw,40px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    margin: "0 0 32px",
                    color: dc.dark,
                  }}
                >
                  {qs[step].q}
                </h2>

                {/* Education copy — shown for every question that has it */}
                {(qs[step] as any).education && (
                  <div
                    style={{
                      background: dc.cream,
                      borderRadius: 6,
                      padding: "12px 16px",
                      marginBottom: 24,
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.6,
                      color: "rgba(0,55,56,0.62)",
                      letterSpacing: "-0.01em",
                      border: "1px solid rgba(0,55,56,0.1)",
                    }}
                  >
                    {(qs[step] as any).education}
                  </div>
                )}

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {qs[step].opts.map((o, idx) => (
                    <div
                      key={idx}
                      className="rq-opt"
                      role="button"
                      tabIndex={0}
                      onClick={() => pick(o.v)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") pick(o.v);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        background: dc.cream,
                        border: "1.5px solid rgba(0,55,56,0.14)",
                        borderRadius: 8,
                        padding: "20px 24px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: dc.dark,
                        }}
                      >
                        {o.label}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "rgba(0,55,56,0.5)",
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {o.hint}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Back button — 44px touch target */}
                {step > 0 && (
                  <button
                    onClick={back}
                    className="rq-back"
                    style={{
                      marginTop: 20,
                      background: "none",
                      border: "none",
                      color: "rgba(0,55,56,0.55)",
                      fontFamily: dc.sans,
                      fontWeight: 600,
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                )}
              </div>
            )}

            {/* ── RESULT CARD ── */}
            {done && result && (
              <div
                id="rq-result"
                style={{
                  background: dc.dark,
                  borderRadius: radius.lg,
                  padding: "clamp(36px,4.5vw,60px)",
                  color: dc.cream,
                  border: "1px solid rgba(238,239,211,0.1)",
                }}
              >
                {/* (a) Plain verdict — label + program name */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                    color: dc.lemon,
                    marginBottom: 10,
                  }}
                >
                  Your best-match program
                </div>

                <h2
                  style={{
                    fontSize: "clamp(26px,3.2vw,40px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    margin: "0 0 6px",
                    color: dc.cream,
                  }}
                >
                  {result.program}
                </h2>

                {/* Plain verdict sentence */}
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: "rgba(238,239,211,0.65)",
                    margin: "0 0 18px",
                    letterSpacing: "-0.01em",
                    maxWidth: "52ch",
                  }}
                >
                  {result.tier === "BEST"
                    ? "Your profile — strong credit and lower LTV — places you in the best-rate tier with the widest lender selection."
                    : result.tier === "GOOD"
                    ? "Your scenario fits standard DSCR programs. A specialist can confirm the best lender match and lock your terms."
                    : "This program has tighter requirements, but it's designed for your situation. Reserves, lower LTV, or stronger credit can help you qualify. A specialist can structure the deal."}
                </p>

                {/* Rate band — mono, lemon */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "rgba(238,239,211,0.45)", marginBottom: 4 }}>
                    Indicative rate range
                  </div>
                  <Mono
                    style={{
                      display: "block",
                      fontSize: "clamp(32px,4.5vw,56px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: dc.lemon,
                      lineHeight: 1,
                    }}
                  >
                    {result.rate}
                  </Mono>
                </div>

                {/* Program description */}
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: "rgba(238,239,211,0.6)",
                    margin: "0 0 24px",
                    letterSpacing: "-0.01em",
                    maxWidth: "52ch",
                  }}
                >
                  {result.note}
                </p>

                {/* (b) Which numbers mattered — stats grid */}
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "rgba(238,239,211,0.4)", marginBottom: 10 }}>
                  Program requirements at a glance
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    background: "rgba(238,239,211,0.12)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 24,
                  }}
                >
                  {result.resultStats.map((r, i) => (
                    <div
                      key={i}
                      style={{ background: dc.teal, padding: "18px 20px" }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase" as const,
                          color: "rgba(238,239,211,0.45)",
                          marginBottom: 6,
                        }}
                      >
                        {r.label}
                      </div>
                      <Mono
                        style={{
                          display: "block",
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: dc.cream,
                        }}
                      >
                        {r.val}
                      </Mono>
                    </div>
                  ))}
                </div>

                {/* (c) How to improve — only shown for WEAK tier */}
                {result.tier === "WEAK" && (
                  <div
                    style={{
                      background: "rgba(249,115,22,0.08)",
                      border: "1px solid rgba(249,115,22,0.3)",
                      borderRadius: 8,
                      padding: "14px 18px",
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: "#f97316", marginBottom: 6 }}>
                      How to strengthen this deal
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(238,239,211,0.65)", margin: 0, lineHeight: 1.55 }}>
                      This program tier requires compensating factors. Increasing your down payment (lower LTV), building 6+ months of reserves (mortgage payments kept in the bank after closing), or raising your credit score each improve your position. A specialist can structure the deal to qualify.
                    </p>
                  </div>
                )}

                {/* (d) What happens next */}
                <div
                  style={{
                    background: "rgba(238,239,211,0.07)",
                    border: "1px solid rgba(238,239,211,0.15)",
                    borderRadius: 8,
                    padding: "16px 20px",
                    marginBottom: 10,
                    fontSize: 13,
                    color: "rgba(238,239,211,0.65)",
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: dc.lemon, display: "block", marginBottom: 4 }}>
                    What happens next
                  </strong>
                  Run your exact numbers in the DSCR Calculator to confirm the ratio, then speak with a Greenstreet specialist for a full scenario review and program lock.
                </div>

                {/* (e) Preliminary disclaimer */}
                <p style={{ fontSize: 11, color: "rgba(238,239,211,0.38)", margin: "0 0 24px", lineHeight: 1.4 }}>
                  Indicative rate range only — not a commitment to lend. Final terms subject to full underwriting, appraisal and credit review.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a
                    href="/dscr-calculator"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate?.("dscr-calculator");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: dc.lemon,
                      color: dc.dark,
                      fontWeight: 600,
                      fontSize: 16,
                      textDecoration: "none",
                      padding: "15px 28px",
                      borderRadius: radius.sm,
                      minHeight: 44,
                    }}
                  >
                    Run the numbers →
                  </a>
                  <button
                    onClick={() => (window as any).openQualify?.()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: `1.5px solid ${swatch.midnightFaded}`,
                      color: dc.cream,
                      fontFamily: dc.sans,
                      fontWeight: 600,
                      fontSize: 16,
                      padding: "15px 24px",
                      borderRadius: radius.sm,
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                  >
                    Check if I qualify →
                  </button>
                  <button
                    onClick={restart}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(238,239,211,0.45)",
                      fontFamily: dc.sans,
                      fontWeight: 500,
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                      padding: "15px 0",
                      borderRadius: 6,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Retake quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
