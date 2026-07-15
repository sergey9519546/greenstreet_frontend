import React, { useEffect, useRef, useState } from "react";
import { AnimatedCard, AnimatedButton } from "../components/PremiumUI";
import { swatch, radius } from "../theme";

const NAVY = swatch.midnight;
const NAVY_2 = swatch.darkTeal;
const CYAN = swatch.emerald;
const ICE = swatch.pistachio;
const LEMON = swatch.lemon;

const STEPS = [
  {
    icon: "1",
    title: "Enter a preliminary scenario",
    body: "Add the property, rent, loan, tax, insurance, and association assumptions you currently have. Label estimates clearly so they can be replaced with verified information later.",
  },
  {
    icon: "2",
    title: "Review the coverage math",
    body: "See how the selected qualifying-rent assumption compares with the monthly obligation used by the scenario. The result explains arithmetic only; it is not a provider's eligibility decision.",
  },
  {
    icon: "3",
    title: "Compare assumptions and constraints",
    body: "Test changes to loan amount, rate assumption, rent evidence, taxes, insurance, and structure. Program availability, pricing, and requirements must still be confirmed with the specific financing provider.",
  },
  {
    icon: "4",
    title: "Review borrower, property, and state questions",
    body: "Identify documentation, property-use, entity, short-term-rental, non-U.S. investor, and state-law questions that need qualified review. The tool does not provide legal or tax advice.",
  },
  {
    icon: "5",
    title: "Prepare for a professional review",
    body: "Use the visible inputs, assumptions, and open questions to request current terms from a qualified provider. Only that provider can issue an approval, commitment, rate lock, or final loan terms.",
  },
];

const N = STEPS.length;

export function HowItWorks({ onCTA }: { onCTA?: () => void }) {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = stepsRef.current;
    if (!element) return;

    const compute = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.75;
      const total = rect.height + viewportHeight * 0.3;
      setProgress(Math.max(0, Math.min(1, (start - rect.top) / total)));
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setRevealed(true);
      compute();
    }, { rootMargin: "0px 0px -20% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });

    observer.observe(element);
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    const failsafe = window.setTimeout(() => setRevealed(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const spanned = progress * (N - 1);
  const active = Math.min(N - 1, Math.floor(spanned + 0.001));

  return (
    <>
      <section aria-labelledby="how-it-works-heading" style={{ background: NAVY, color: ICE, padding: "clamp(56px, 7vw, 96px) clamp(1.5rem, 4vw, 4rem)", marginTop: 40, overflow: "hidden" }}>
      <style>{`
        @keyframes hiw-rise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        .hiw-head, .hiw-row { opacity: 0; }
        .hiw-revealed .hiw-head, .hiw-revealed .hiw-row { animation: hiw-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .hiw-head, .hiw-row { opacity: 1 !important; animation: none !important; } }
      `}</style>

          <div className={revealed ? "hiw-revealed" : ""} style={{ maxWidth: 1100, margin: "0 auto" }}>
            <header>
              <div className="hiw-head" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: CYAN, marginBottom: 14 }}>How it works</div>
              <h1 id="how-it-works-heading" style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, marginBottom: 14, maxWidth: 820 }}>Model a preliminary DSCR scenario in five steps.</h1>
              <p className="hiw-head" style={{ animationDelay: ".16s", fontSize: 18, color: ICE, opacity: .88, maxWidth: 760, lineHeight: 1.6, marginBottom: "clamp(40px, 5vw, 64px)" }}>Greenstreet Finance organizes user-entered assumptions and coverage math so you can identify what to verify next. It does not replace underwriting or issue approvals, commitments, rate locks, legal advice, or tax advice.</p>
            </header>

        <div ref={stepsRef} style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((step, index) => {
            const reached = index <= active;
            const isActive = index === active;
            const isLast = index === N - 1;
            const segmentFill = Math.max(0, Math.min(1, spanned - index));
            return (
              <div key={step.title} className="hiw-row" style={{ animationDelay: `${0.12 * index + 0.2}s`, display: "grid", gridTemplateColumns: "30px 1fr", columnGap: "clamp(18px, 3vw, 36px)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 30, height: 30, borderRadius: radius.pill, display: "flex", alignItems: "center", justifyContent: "center", background: reached ? CYAN : NAVY_2, border: `1.5px solid ${reached ? CYAN : `${CYAN}50`}`, color: reached ? NAVY : ICE, fontSize: 13, fontWeight: 800 }}>{index + 1}</div>
                  {!isLast && <div style={{ width: 3, flex: 1, minHeight: 28, borderRadius: radius.sm, background: `${CYAN}20`, position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", inset: "0 0 auto", height: `${segmentFill * 100}%`, background: `linear-gradient(${CYAN}, ${LEMON})`, transition: "height .15s linear" }} /></div>}
                </div>
                <AnimatedCard themeName="dark" hoverScale={false} style={{ background: reached ? NAVY_2 : `${NAVY_2}60`, border: `1.5px solid ${isActive ? CYAN : reached ? `${CYAN}70` : `${CYAN}20`}`, borderRadius: radius.lg, padding: "clamp(18px, 2.5vw, 28px)", marginBottom: isLast ? 0 : "clamp(14px, 2vw, 22px)", opacity: reached ? 1 : .5, transform: isActive ? "scale(1.015)" : reached ? "none" : "translateX(-8px)", boxShadow: isActive ? `0 0 0 1px ${CYAN}` : "none", transition: "all .35s cubic-bezier(.2,.7,.2,1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><span aria-hidden="true" style={{ width: 28, color: LEMON, fontWeight: 800 }}>{step.icon}</span><span style={{ fontSize: "clamp(18px, 2.2vw, 22px)", fontWeight: 700, color: "#fff" }}>{" "}{step.title}</span></div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: ICE, opacity: .9, margin: 0 }}>{step.body}</p>
                </AnimatedCard>
              </div>
            );
          })}
        </div>

        <aside style={{ marginTop: "clamp(40px, 5vw, 64px)", padding: "clamp(22px,3vw,32px)", border: `1px solid ${CYAN}55`, borderRadius: radius.lg, background: NAVY_2 }}>
          <h3 style={{ color: "#fff", fontSize: 22, margin: "0 0 14px" }}>Sources and scope</h3>
          <p style={{ lineHeight: 1.65, margin: "0 0 14px" }}><a href="https://www.consumerfinance.gov/rules-policy/regulations/1026/2023-01-01/interp-3/" target="_blank" rel="noreferrer" style={{ color: LEMON, fontWeight: 700 }}>CFPB Regulation Z official interpretation</a>: explains the business-purpose exemption, including non-owner-occupied rental-property examples. It does not establish any provider's DSCR terms or a state-law conclusion.</p>
          <p style={{ lineHeight: 1.65, margin: 0 }}><a href="https://singlefamily.fanniemae.com/media/document/pdf/form-1007" target="_blank" rel="noreferrer" style={{ color: LEMON, fontWeight: 700 }}>Fannie Mae Form 1007</a>: a conventional market-rent schedule that may inform rent evidence. It is not a universal DSCR underwriting rule.</p>
        </aside>
          </div>
      </section>

      <footer style={{ background: NAVY, color: ICE, padding: "0 clamp(1.5rem, 4vw, 4rem) clamp(56px, 7vw, 96px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <nav aria-label="Related guidance" style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href="/dscr-calculator" style={{ color: CYAN, fontWeight: 700 }}>DSCR calculator</a>
          <a href="/faq" style={{ color: CYAN, fontWeight: 700 }}>Requirements and FAQ</a>
          <a href="/state-laws" style={{ color: CYAN, fontWeight: 700 }}>State-rule limitations</a>
          <a href="/blog" style={{ color: CYAN, fontWeight: 700 }}>DSCR guidance</a>
          </nav>

          <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <AnimatedButton themeName="dark" onClick={onCTA}>Model a preliminary scenario</AnimatedButton>
            <span style={{ fontSize: 14, color: ICE, opacity: .75 }}>Educational estimate only. Verify every input and provider requirement.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
