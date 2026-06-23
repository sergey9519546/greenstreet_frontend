// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";

// Blue "how it works" band — recreation of greenboard.com's step_tab scroll motion,
// rebuilt for Greenstreet's DSCR flow:
//   • a vertical progress line that FILLS continuously as you scroll (step_tab_line_highlighted)
//   • each step's dot lights up as the fill passes it
//   • cards stagger-reveal (fade + rise) the first time the band enters view
//   • the active step lifts and brightens
const NAVY = "#06283d";       // section bg (deep blue)
const NAVY_2 = "#0a3a55";     // raised panel
const CYAN = "#4dc4ff";       // active accent / progress line
const ICE = "#bfe6ff";        // light blue text
const LEMON = "#d8d958";      // brand CTA pop

const STEPS = [
  {
    icon: "📊",
    title: "Run the numbers",
    body: "Enter price, rent, FICO, and LTV once. The engine computes DSCR (Track 1 and Track 2), PITIA, break-even rate, and cash-on-cash in half a second.",
  },
  {
    icon: "🏦",
    title: "Match the lenders",
    body: "Your deal is priced against 11 verified DSCR lenders at once. See who fits on FICO, DSCR floor, LTV, and property type — ranked best to weak.",
  },
  {
    icon: "🗺️",
    title: "Check state rules",
    body: "50-state prepay and usury matrix flags the traps before they cost you — OH/PA thresholds, NJ LLC risk, TX APR ban, MN HF 3437.",
  },
  {
    icon: "🧩",
    title: "Structure the deal",
    body: "Pick the borrower lane — first-timer, STR operator, portfolio, ITIN, cash-out — and the structure and rate tier that actually fund it.",
  },
  {
    icon: "🔒",
    title: "Lock the rate",
    body: "Take the shortlist and the numbers to the broker. No surprises at underwriting — every figure is the one the lender will see.",
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
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(77,196,255,0.10), transparent 45%), radial-gradient(circle at 90% 100%, rgba(77,196,255,0.07), transparent 40%)",
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
          From a rental property to a fundable DSCR loan — in five steps.
        </h2>
        <p className="hiw-head" style={{ animationDelay: "0.16s", fontSize: "18px", color: ICE, opacity: 0.85, maxWidth: "640px", lineHeight: 1.6, marginBottom: "clamp(40px, 5vw, 64px)" }}>
          Scroll the flow — the line fills as you go. Same engine behind every tool on this page.
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
                      width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: on ? CYAN : NAVY_2,
                      border: `2px solid ${on ? CYAN : "rgba(191,230,255,0.3)"}`,
                      color: on ? NAVY : ICE, fontSize: "13px", fontWeight: 800,
                      boxShadow: on ? `0 0 16px ${CYAN}` : "none",
                      transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
                      animation: isActive ? "hiw-pulse 1.6s ease-out infinite" : "none",
                    }}
                  >
                    {on ? "✓".repeat(0) || i + 1 : i + 1}
                  </div>
                  {!last && (
                    <div style={{ width: "3px", flex: 1, minHeight: "28px", borderRadius: "3px", background: "rgba(191,230,255,0.16)", position: "relative", overflow: "hidden" }}>
                      <div
                        style={{
                          position: "absolute", top: 0, left: 0, right: 0,
                          height: `${segFill * 100}%`,
                          background: `linear-gradient(${CYAN}, ${LEMON})`,
                          boxShadow: segFill > 0 ? `0 0 12px ${CYAN}` : "none",
                          transition: "height 0.15s linear",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Card cell */}
                <div
                  style={{
                    background: on ? NAVY_2 : "rgba(10,58,85,0.4)",
                    border: `1px solid ${isActive ? CYAN : on ? "rgba(77,196,255,0.45)" : "rgba(191,230,255,0.12)"}`,
                    borderRadius: "14px", padding: "clamp(18px, 2.5vw, 28px)",
                    marginBottom: last ? 0 : "clamp(14px, 2vw, 22px)",
                    opacity: on ? 1 : 0.5,
                    transform: isActive ? "translateX(0) scale(1.015)" : on ? "translateX(0)" : "translateX(-8px)",
                    boxShadow: isActive ? `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${CYAN}` : on ? "0 8px 30px rgba(0,0,0,0.25)" : "none",
                    transition: "all 0.35s cubic-bezier(.2,.7,.2,1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "26px", display: "inline-block", transform: isActive ? "scale(1.12)" : "scale(1)", transition: "transform 0.35s ease" }}>{s.icon}</span>
                    <span style={{ fontSize: "clamp(18px, 2.2vw, 22px)", fontWeight: 700, color: "#fff" }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: "15px", lineHeight: 1.65, color: ICE, opacity: 0.9, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ marginTop: "clamp(40px, 5vw, 64px)", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <a
            href="/rate-quiz"
            onClick={(e) => { if (onCTA) { e.preventDefault(); onCTA(); } }}
            style={{
              background: LEMON, color: NAVY, padding: "14px 28px", borderRadius: "8px",
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              border: `0.094rem solid ${LEMON}`, transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = LEMON; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = LEMON; e.currentTarget.style.color = NAVY; }}
          >
            Get my rate in 4 questions →
          </a>
          <span style={{ fontSize: "14px", color: ICE, opacity: 0.7 }}>No email. No signup. No credit pull.</span>
        </div>
      </div>
    </section>
  );
}
