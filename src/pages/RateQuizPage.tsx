import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DcShell, dc, Mono } from "../design/dc";

interface Props {
  onBack?: () => void;
  onNavigate?: (view: any) => void;
}

// ── Quiz data — five questions, preserved verbatim ──────────────────────────
const qs = [
  {
    q: "What are you financing?",
    opts: [
      { label: "Single-family rental", hint: "SFR", v: "sfr" },
      { label: "2–4 unit", hint: "small multi", v: "small" },
      { label: "5+ unit / mixed-use", hint: "multifamily", v: "multi" },
      { label: "Short-term rental", hint: "STR", v: "str" },
    ],
  },
  {
    q: "Where does your credit land?",
    opts: [
      { label: "740+", hint: "best tier", v: "a" },
      { label: "700–739", hint: "strong", v: "b" },
      { label: "660–699", hint: "standard", v: "c" },
      { label: "620–659", hint: "flexible", v: "d" },
    ],
  },
  {
    q: "How much are you putting down?",
    education:
      "LTV = loan ÷ value. A 25% down payment = 75% LTV. Most DSCR programs cap at 80% LTV (20% down). Better LTV tiers unlock lower rates.",
    opts: [
      { label: "35%+", hint: "≤65% LTV", v: "a" },
      { label: "25–34%", hint: "66–75% LTV", v: "b" },
      { label: "20–24%", hint: "76–80% LTV", v: "c" },
      { label: "Under 20%", hint: ">80% LTV", v: "d" },
    ],
  },
  {
    q: "How does the rent cover the payment?",
    opts: [
      { label: "Comfortably — 1.25x+", hint: "strong DSCR", v: "a" },
      { label: "It qualifies — ~1.0–1.25x", hint: "standard", v: "b" },
      { label: "It's tight — below 1.0x", hint: "sub-1.0", v: "c" },
      { label: "Not sure yet", hint: "estimate", v: "b" },
    ],
  },
  {
    q: "Who is the borrower?",
    opts: [
      { label: "US citizen / PR via LLC", hint: "standard", v: "a" },
      { label: "Experienced investor (5+)", hint: "portfolio", v: "b" },
      { label: "Foreign national / ITIN", hint: "global", v: "g" },
      { label: "First DSCR loan", hint: "new", v: "c" },
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

  // Hero entrance — fires on mount (DcShell already runs useDcGsap for
  // .gs-reveal, but the quiz hero uses a centred single-column layout so
  // we target #rq-hero-content directly here)
  useGSAP(() => {
    const hc = document.querySelector("#rq-hero-content");
    if (hc) {
      gsap.from(hc.children, {
        y: 42,
        opacity: 0,
        duration: 0.9,
        stagger: 0.13,
        ease: "power3.out",
        clearProps: "all",
      });
    }
  });

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

  const tierColor =
    result?.tier === "BEST"
      ? dc.emerald
      : result?.tier === "GOOD"
      ? dc.lemon
      : "#a78bfa"; // soft purple for WEAK — still solid, no glow

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
    >
      {/* Extra CSS — input resets + option hover only; no glass/float/blur */}
      <style>{`
        .rq-opt{cursor:pointer;transition:transform .12s,background .15s,border-color .15s;}
        .rq-opt:hover{transform:translateY(-2px);border-color:${dc.emerald} !important;}
        .rq-opt:focus-visible{outline:2px solid ${dc.lemon};outline-offset:2px;border-radius:8px;}
      `}</style>

      {/* ── HERO — solid dark, centred, quiz layout ────────────────────────── */}
      <section
        style={{
          position: "relative",
          background: dc.dark,
          color: dc.cream,
          overflow: "hidden",
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(32px,4vh,56px)",
        }}
      >
        {/* Dot grid — flat texture, no blur/glow */}
        <div className="gs-dot-grid" />

        <div
          id="rq-hero-content"
          style={{
            position: "relative",
            maxWidth: 820,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
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
            Find your program · 60-second quiz
          </div>

          {/* H1 — clamp required by spec */}
          <h1
            style={{
              fontSize: "clamp(48px,7.5vw,116px)",
              fontWeight: 600,
              lineHeight: 0.93,
              letterSpacing: "-0.04em",
              margin: "0 0 28px",
              color: dc.cream,
            }}
          >
            Which DSCR loan<br />fits you?
          </h1>

          {/* Sub — compliance-safe, "five questions" preserved */}
          <p
            style={{
              fontSize: "clamp(17px,1.5vw,22px)",
              fontWeight: 500,
              lineHeight: 1.5,
              letterSpacing: "-0.02em",
              color: "rgba(238,239,211,0.7)",
              maxWidth: "52ch",
              margin: "0 auto 36px",
            }}
          >
            Five questions. One real rate tier. Greenstreet programs matched to your
            deal profile.{" "}
            <span style={{ color: "rgba(238,239,211,0.5)" }}>
              No email, no account, no credit pull.
            </span>
          </p>

          {/* Live progress dots — show current position even before quiz */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              maxWidth: 320,
              margin: "0 auto 40px",
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
                      ? dc.emerald
                      : i === step && inQuiz
                      ? dc.rain
                      : "rgba(238,239,211,0.18)",
                  transition: "background .3s",
                }}
              />
            ))}
          </div>

          {/* Hero CTA */}
          <a
            href="#rq-tool"
            onClick={scrollToQuiz}
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
              border: "none",
            }}
          >
            Start the quiz ↓
          </a>
        </div>
      </section>

      {/* ── QUIZ BAND ──────────────────────────────────────────────────────── */}
      <section
        id="rq-tool"
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding:
            "clamp(40px,5vh,72px) clamp(1.5rem,4vw,3rem) clamp(72px,10vh,128px)",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Progress bar strip */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 40,
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
                      ? dc.emerald
                      : i === step && inQuiz
                      ? dc.rain
                      : "rgba(0,55,56,0.12)",
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
                  background: dc.white,
                  borderRadius: 9,
                  padding: "clamp(32px,4vw,56px)",
                  border: "1px solid rgba(0,55,56,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: dc.rain,
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

                {/* Q3 LTV education copy */}
                {step === 2 && (
                  <div
                    style={{
                      background: dc.cream,
                      borderRadius: 6,
                      padding: "14px 18px",
                      marginBottom: 24,
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.55,
                      color: "rgba(0,55,56,0.65)",
                      letterSpacing: "-0.01em",
                      border: "1px solid rgba(0,55,56,0.1)",
                    }}
                  >
                    {qs[step].education}
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

                {/* Back button */}
                {step > 0 && (
                  <button
                    onClick={back}
                    style={{
                      marginTop: 28,
                      background: "none",
                      border: "none",
                      color: "rgba(0,55,56,0.55)",
                      fontFamily: dc.sans,
                      fontWeight: 600,
                      fontSize: 14,
                      letterSpacing: "-0.01em",
                      cursor: "pointer",
                      padding: 0,
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
                  borderRadius: 9,
                  padding: "clamp(36px,4.5vw,60px)",
                  color: dc.cream,
                  border: "1px solid rgba(238,239,211,0.12)",
                }}
              >
                {/* Tier pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: dc.dark,
                      background: tierColor,
                      padding: "4px 12px",
                      borderRadius: 4,
                    }}
                  >
                    {result.tier}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(238,239,211,0.5)",
                    }}
                  >
                    Your match
                  </div>
                </div>

                {/* Program name */}
                <h2
                  style={{
                    fontSize: "clamp(30px,3.8vw,48px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.02,
                    margin: "0 0 10px",
                    color: dc.cream,
                  }}
                >
                  {result.program}
                </h2>

                {/* Rate band */}
                <Mono
                  style={{
                    display: "block",
                    fontSize: "clamp(36px,5vw,60px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    color: dc.lemon,
                    marginBottom: 18,
                    lineHeight: 1,
                  }}
                >
                  {result.rate}
                </Mono>

                {/* Program description */}
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    lineHeight: 1.55,
                    color: "rgba(238,239,211,0.72)",
                    margin: "0 0 28px",
                    letterSpacing: "-0.01em",
                    maxWidth: "52ch",
                  }}
                >
                  {result.note}
                </p>

                {/* Stats grid — solid fills, flat 1px borders */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    background: "rgba(238,239,211,0.12)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 28,
                  }}
                >
                  {result.resultStats.map((r, i) => (
                    <div
                      key={i}
                      style={{ background: dc.teal, padding: "20px 22px" }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "rgba(238,239,211,0.5)",
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

                {/* Compliance note */}
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: "rgba(238,239,211,0.4)",
                    margin: "0 0 24px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Indicative rate band only — not a commitment to lend. Actual rate
                  depends on final underwrite, property type, reserves, and market
                  conditions. Contact +1 (555) 010-0000 for a full program quote.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a
                    href="#"
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
                      borderRadius: 6,
                      border: "none",
                    }}
                  >
                    Price it exactly →
                  </a>
                  <button
                    onClick={restart}
                    style={{
                      background: "none",
                      border: "1px solid rgba(238,239,211,0.3)",
                      color: dc.cream,
                      fontFamily: dc.sans,
                      fontWeight: 600,
                      fontSize: 16,
                      letterSpacing: "-0.01em",
                      padding: "15px 24px",
                      borderRadius: 6,
                      cursor: "pointer",
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

      {/* ── HOW IT WORKS BAND ─────────────────────────────────────────────── */}
      <section
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding: `clamp(0px,1px,1px) ${dc.pad} clamp(56px,7vw,96px)`,
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            className="dc-band-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1,
              background: "rgba(0,55,56,0.12)",
              borderRadius: 9,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: dc.cream,
                padding: "clamp(24px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(28px,3.5vw,44px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.lemon,
                  marginBottom: 12,
                  lineHeight: 1,
                }}
              >
                01
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(18px,2vw,24px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 8px",
                  lineHeight: 1.1,
                  color: dc.dark,
                }}
              >
                Five questions
              </h3>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.6)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Property type, credit, down payment, DSCR coverage, borrower
                profile. Sixty seconds.
              </p>
            </div>

            <div
              style={{
                background: dc.dark,
                color: dc.cream,
                padding: "clamp(24px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(28px,3.5vw,44px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: dc.emerald,
                  marginBottom: 12,
                  lineHeight: 1,
                }}
              >
                02
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(18px,2vw,24px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 8px",
                  lineHeight: 1.1,
                  color: dc.cream,
                }}
              >
                Tier match
              </h3>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(238,239,211,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Answers map to BEST / GOOD / WEAK tier logic. Rate band and
                matched Greenstreet program surface instantly.
              </p>
            </div>

            <div
              style={{
                background: dc.lemon,
                padding: "clamp(24px,3vw,36px)",
              }}
            >
              <Mono
                style={{
                  display: "block",
                  fontSize: "clamp(28px,3.5vw,44px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  color: "rgba(0,55,56,0.5)",
                  marginBottom: 12,
                  lineHeight: 1,
                }}
              >
                03
              </Mono>
              <h3
                style={{
                  fontSize: "clamp(18px,2vw,24px)",
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  margin: "0 0 8px",
                  lineHeight: 1.1,
                  color: dc.dark,
                }}
              >
                Price exactly
              </h3>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.55,
                  color: "rgba(0,55,56,0.65)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Take your matched program to the DSCR Calculator for a
                live PITIA and full deal underwrite. No calls needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
