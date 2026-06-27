import React, { useEffect, useRef, useState } from "react";
import { AnimatedCard, AnimatedButton } from "./PageShell";
import { swatch, radius } from "../theme";

// Blue "how it works" band — recreation of greenboard.com's step_tab scroll motion,
// rebuilt for Greenstreet's DSCR flow:
//   • a vertical progress line that FILLS continuously as you scroll (step_tab_line_highlighted)
//   • each step's dot lights up as the fill passes it
//   • cards stagger-reveal (fade + rise) the first time the band enters view
//   • the active step lifts and brightens
const NAVY = swatch.midnight;       // section bg (deep green/midnight)
const NAVY_2 = swatch.darkTeal;     // raised panel (dark teal)
const CYAN = swatch.emerald;        // active accent / progress line (emerald)
const ICE = swatch.pistachio;       // warm light text (pistachio)
const LEMON = swatch.lemon;         // brand CTA pop (lemon)

const STEPS = [
  {
    icon: "÷",
    title: "Run the numbers in half a second",
    body: "Enter price, rent, and your loan details once. The engine instantly returns your DSCR (whether the property's rent can cover the loan payment — 1.00 means rent exactly covers it; higher is stronger), your full PITIA (the full monthly payment — principal, interest, taxes, insurance, and any HOA dues), break-even rate, and cash-on-cash return.",
  },
  {
    icon: "§",
    title: "Let the right program find you",
    body: "Seven Greenstreet programs — from high-LTV (how the loan compares to property value) DSCR to no-ratio, multi-family, and non-US investor — are ranked by fit the moment the file lands. No portal-hopping or re-keying.",
  },
  {
    icon: "⊕",
    title: "Catch state-rule traps before they cost you",
    body: "The 50-state prepayment penalty (a fee some loans charge if you pay the loan off or refinance early) and usury map is built in, not bolted on. Ohio/PA loan-amount thresholds, NJ LLC risk, TX APR triggers, and MN's 2026 law change are all flagged before they affect your quote.",
  },
  {
    icon: "∿",
    title: "Structure for the actual borrower",
    body: "First-timer, short-term rental operator, portfolio builder, ITIN borrower, BRRRR cash-out — each profile has a different rate tier and qualifying lane. The engine reads your file and routes you to the right one, including noting when an ARM (a loan whose rate is fixed for a few years, then can adjust) or IO period improves the deal.",
  },
  {
    icon: "✓",
    title: "Lock with confidence",
    body: "Every number you bring to the rate-lock conversation is the number Greenstreet will see at underwriting. No surprises. No last-minute conditions you didn't already model.",
  },
];

const N = STEPS.length;

export function HowItWorks({ onCTA }: { onCTA?: () => void }) {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 across the whole rail
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;

    // Continuous scroll progress over the steps block (mirrors a ScrollTrigger scrub).
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.75;                 // begin filling when block top hits 75% vh
      const total = rect.height + vh * 0.3;    // finish as it scrolls past
      const passed = start - rect.top;
      setProgress(Math.max(0, Math.min(1, passed / total)));
    };

    // IntersectionObserver: drives the one-time entrance reveal AND re-fires compute on
    // any scroll (it ticks even when scroll events are throttled in some renderers).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setRevealed(true);
        compute();
      },
      { rootMargin: "0px 0px -20% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(el);
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    // Fail-safe: never leave content hidden if IO/scroll never fire (offscreen renderers).
    const failsafe = setTimeout(() => setRevealed(true), 1200);
    return () => {
      io.disconnect();
      clearTimeout(failsafe);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // progress mapped across N-1 segments → per-dot "reached" + per-segment fill fraction
  const spanned = progress * (N - 1);
  const active = Math.min(N - 1, Math.floor(spanned + 0.001));

  return (
    <section
      style={{
        background: NAVY,
        color: ICE,
        padding: "clamp(56px, 7vw, 96px) clamp(1.5rem, 4vw, 4rem)",
        marginTop: "40px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes hiw-rise {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hiw-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes hiw-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(77,196,255,0.55); }
          50%     { box-shadow: 0 0 0 8px rgba(77,196,255,0); }
        }
        .hiw-head { opacity: 0; }
        .hiw-revealed .hiw-head { animation: hiw-rise 0.7s cubic-bezier(.2,.7,.2,1) both; }
        .hiw-row { opacity: 0; }
        .hiw-revealed .hiw-row { animation: hiw-rise 0.7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hiw-head, .hiw-row { opacity: 1 !important; animation: none !important; }
        }
      `}</style>

      <div className={revealed ? "hiw-revealed" : ""} style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="hiw-head" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN, marginBottom: "14px" }}>
          How it works
        </div>
        <h2 className="hiw-head" style={{ animationDelay: "0.08s", fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.08, marginBottom: "14px", maxWidth: "760px" }}>
          Five steps. One application. Your deal — funded.
        </h2>
        <p className="hiw-head" style={{ animationDelay: "0.16s", fontSize: "18px", color: ICE, opacity: 0.85, maxWidth: "640px", lineHeight: 1.6, marginBottom: "clamp(40px, 5vw, 64px)" }}>
          Scroll through to see how a DSCR deal moves from first number to funded. Every step runs on the same engine — the one that underwrites and funds your file.
        </p>

        {/* Steps — each row owns its dot + connector so heights resolve naturally */}
        <div ref={stepsRef} style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((s, i) => {
            const on = i <= active;
            const isActive = i === active;
            const last = i === N - 1;
            // smooth fill fraction for the connector below dot i
            const segFill = Math.max(0, Math.min(1, spanned - i));
            return (
              <div
                key={s.title}
                className="hiw-row"
                style={{ animationDelay: `${0.12 * i + 0.2}s`, display: "grid", gridTemplateColumns: "30px 1fr", columnGap: "clamp(18px, 3vw, 36px)" }}
              >
                {/* Rail cell: dot on top, connector fills the rest */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "30px", height: "30px", borderRadius: radius.pill, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: on ? CYAN : NAVY_2,
                      border: `1.5px solid ${on ? CYAN : `${CYAN}50`}`,
                      color: on ? NAVY : ICE, fontSize: "13px", fontWeight: 800,
                      boxShadow: "none",
                      transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                      animation: "none",
                    }}
                  >
                    {on ? "✓".repeat(0) || i + 1 : i + 1}
                  </div>
                  {!last && (
                    <div style={{ width: "3px", flex: 1, minHeight: "28px", borderRadius: radius.sm, background: `${CYAN}20`, position: "relative", overflow: "hidden" }}>
                      <div
                        style={{
                          position: "absolute", top: 0, left: 0, right: 0,
                          height: `${segFill * 100}%`,
                          background: `linear-gradient(${CYAN}, ${LEMON})`,
                          boxShadow: "none",
                          transition: "height 0.15s linear",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Card cell */}
                <AnimatedCard
                  themeName="dark"
                  hoverScale={false}
                  style={{
                    background: on ? NAVY_2 : `${NAVY_2}60`,
                    border: `1.5px solid ${isActive ? CYAN : on ? `${CYAN}70` : `${CYAN}20`}`,
                    borderRadius: radius.lg, padding: "clamp(18px, 2.5vw, 28px)",
                    marginBottom: last ? 0 : "clamp(14px, 2vw, 22px)",
                    opacity: on ? 1 : 0.5,
                    transform: isActive ? "translateX(0) scale(1.015)" : on ? "translateX(0)" : "translateX(-8px)",
                    boxShadow: isActive ? `0 0 0 1px ${CYAN}` : "none",
                    transition: "all 0.35s cubic-bezier(.2,.7,.2,1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "22px", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: LEMON, display: "inline-block", lineHeight: 1, width: 28, flexShrink: 0, transform: isActive ? "scale(1.12)" : "scale(1)", transition: "transform 0.35s ease" }}>{s.icon}</span>
                    <span style={{ fontSize: "clamp(18px, 2.2vw, 22px)", fontWeight: 700, color: "#fff" }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: "15px", lineHeight: 1.65, color: ICE, opacity: 0.9, margin: 0 }}>{s.body}</p>
                </AnimatedCard>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "clamp(40px, 5vw, 64px)", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <AnimatedButton
            themeName="dark"
            onClick={onCTA}
          >
            See my rate in 5 questions
          </AnimatedButton>
          <span style={{ fontSize: "14px", color: ICE, opacity: 0.7 }}>No email. No signup. No credit check. Just the number.</span>
        </div>
      </div>
    </section>
  );
}
