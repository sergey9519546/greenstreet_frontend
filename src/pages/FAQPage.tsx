import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead, Btn } from "../design/dc";

// This public FAQ intentionally stays educational. Greenstreet's role,
// licensing, counterparty, terms, availability, and timelines have not been
// verified for publication, so readers must confirm them with an appropriate
// licensed professional or provider.
const FAQS: { q: string; a: string; src: string; group?: string; cta?: { label: string; action: "calculator" | "qualify" | "state-laws" } }[] = [
  {
    group: "The basics",
    q: "What does DSCR mean?",
    a: "Debt-service coverage ratio (DSCR) is a cash-flow measure. A common educational calculation divides a property's estimated monthly rent by estimated principal, interest, taxes, insurance, and HOA dues. It is not a credit decision, quote, or approval standard.",
    src: "Educational calculation; verify assumptions independently.",
    cta: { label: "Estimate a DSCR scenario →", action: "calculator" },
  },
  {
    group: "The basics",
    q: "What should I include in a rental-property scenario?",
    a: "Use documented or carefully estimated rent, loan amount, interest rate assumption, taxes, insurance, HOA dues, vacancy, maintenance, and management costs. Small changes can materially change a result.",
    src: "Educational planning guidance; not lender requirements.",
  },
  {
    group: "Planning questions",
    q: "Can this site tell me whether I qualify or which loan is available?",
    a: "No. The public tools provide educational scenario calculations only. Greenstreet does not publish verified program availability, pricing, eligibility, licensing, or a lending role here. A qualified, appropriately licensed provider must evaluate any actual request.",
    src: "Publication status: verification required.",
  },
  {
    group: "Planning questions",
    q: "Are displayed rates, terms, or payment examples live offers?",
    a: "No. Any rate, payment, or financing input used in a public tool is an illustrative assumption for planning. Do not rely on it as market pricing, a quote, a rate lock, or a commitment.",
    src: "Illustrative scenario disclosure.",
  },
  {
    group: "Property and risk",
    q: "How should I evaluate short-term-rental income?",
    a: "Treat projections as uncertain. Compare a conservative revenue assumption with operating costs, local rules, insurance, seasonality, and vacancy. Confirm applicable restrictions with the relevant local authority and qualified advisers.",
    src: "Educational risk checklist; local verification required.",
  },
  {
    group: "Property and risk",
    q: "What should I check before committing to a property?",
    a: "Review the contract, title, insurance, property condition, taxes, HOA rules, local rental rules, and your downside scenario. Seek legal, tax, insurance, and financing advice appropriate to your circumstances.",
    src: "Educational checklist; not legal, tax, or financing advice.",
  },
  {
    group: "Next steps",
    q: "What happens if I submit a scenario?",
    a: "A scenario is a planning request, not an application or approval. Submission does not establish a provider relationship, reserve a rate or program, or guarantee a response, underwriting, funding, or closing.",
    src: "Scenario-intake disclosure.",
  },
];

// Resolve a CTA action to the correct navigation target
function useFaqCtaHandler(onNavigate: (v: string) => void) {
  return (action: "calculator" | "qualify" | "state-laws") => {
    if (action === "qualify") { (window as any).openQualify?.(); return; }
    if (action === "calculator") { onNavigate("dscr-calculator"); return; }
    if (action === "state-laws") { onNavigate("state-laws"); return; }
  };
}

export default function FAQPage({ onBack, onNavigate }: { onBack: () => void; onNavigate: (v: any) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const handleCtaAction = useFaqCtaHandler(onNavigate);

  useEffect(() => {
    document.title = "DSCR Loan FAQ | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.teal}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
        { label: "How It Works", view: "how-it-works" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Accordion transition CSS only — no glassmorphism, no blur, no float */}
      <style>{`
        .faq-answer{overflow:hidden;transition:max-height .32s ease,opacity .24s ease;}
        .faq-answer-open{max-height:1200px;opacity:1;}
        .faq-answer-closed{max-height:0;opacity:0;}
        .faq-btn:hover{background:${dc.mintBg} !important;}
        @media (max-width:600px){
          .faq-btn{padding:18px 18px !important;min-height:64px;gap:14px !important;}
          .faq-answer > div{padding:0 18px 22px !important;}
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        style={{
          background: dc.teal,
          color: dc.cream,
          padding: "clamp(56px,7vh,96px) clamp(1.5rem,4vw,3rem) clamp(48px,6vh,72px)",
          overflow: "hidden",
        }}
      >
        <div
          id="gs-hero-content"
          style={{ maxWidth: 1080, margin: "0 auto" }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(238,239,211,0.5)",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            Frequently asked
          </div>
          <H1 style={{ margin: "0 0 20px", maxWidth: "18ch" }}>
            DSCR loan questions — answered in plain language.
          </H1>
          <Lead style={{ color: "rgba(238,239,211,0.7)", maxWidth: "50ch", margin: "0 0 20px" }}>
            Educational questions about rental-property cash-flow scenarios. This page does not state Greenstreet's lending role, licensing, terms, availability, or approval standards.
          </Lead>
          <p style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.45)", margin: 0, letterSpacing: "-0.01em" }}>
            Educational content · verify provider, legal, tax, and market facts independently.
          </p>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section
        className="gs-reveal"
        style={{
          background: dc.cream,
          padding: "clamp(48px,6vw,80px) clamp(1.5rem,4vw,3rem) clamp(56px,8vw,96px)",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => {
            // Render a group heading before the first item in each group
            const prevGroup = i > 0 ? FAQS[i - 1].group : null;
            const showGroupHead = faq.group && faq.group !== prevGroup;
            const questionId = `faq-question-${i}`;
            const panelId = `faq-answer-${i}`;
            return (
            <React.Fragment key={i}>
              {showGroupHead && (
                <div style={{ marginTop: i === 0 ? 0 : 20, marginBottom: 4, paddingLeft: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: dc.rain }}>
                    {faq.group}
                  </span>
                </div>
              )}
            <div
              style={{
                background: dc.cream,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${open === i ? dc.rain : dc.faded}`,
                transition: "border-color .15s",
              }}
            >
              {/* Question row */}
              <button
                id={questionId}
                className="faq-btn"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={panelId}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: open === i ? dc.mintBg : dc.cream,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "26px 30px",
                  cursor: "pointer",
                  transition: "background .15s",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(16px,1.6vw,19px)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: dc.dark,
                    fontFamily: dc.sans,
                    lineHeight: 1.3,
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: dc.rain,
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: "transform .25s",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                    display: "inline-block",
                    fontFamily: dc.mono,
                  }}
                >
                  +
                </span>
              </button>

              {/* Answer panel */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={questionId}
                aria-hidden={open !== i}
                inert={open !== i}
                className={open === i ? "faq-answer faq-answer-open" : "faq-answer faq-answer-closed"}
              >
                <div
                  style={{
                    padding: "0 30px 28px",
                    borderTop: `1px solid rgba(0,55,56,0.08)`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.65,
                      color: "rgba(0,55,56,0.7)",
                      margin: "20px 0 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {faq.a}
                  </p>
                  {faq.cta && (
                    <button
                      onClick={() => handleCtaAction(faq.cta!.action)}
                      style={{
                        marginTop: 14,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: dc.dark,
                        color: dc.cream,
                        fontWeight: 600,
                        fontSize: 13,
                        border: "none",
                        cursor: "pointer",
                        padding: "9px 18px",
                        borderRadius: 6,
                        fontFamily: dc.sans,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {faq.cta.label}
                    </button>
                  )}
                  {/* Source attribution — added in 2026-06-22 refresh for GEO + E-E-A-T */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1px dashed rgba(0,55,56,0.15)",
                    }}
                  >
                    <Mono
                      style={{
                        fontSize: 12,
                        color: dc.rain,
                        letterSpacing: "0.01em",
                      }}
                    >
                      src · {faq.src}
                    </Mono>
                  </div>
                </div>
              </div>
            </div>
            </React.Fragment>
            );
          })}
        </div>

        {/* Qualifier CTA — wired to openQualify funnel */}
        <div
          className="gs-reveal"
          style={{ maxWidth: 880, margin: "36px auto 0", borderRadius: 12, background: dc.dark, padding: "clamp(24px,3vw,36px) clamp(24px,3vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 20 }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 8 }}>
              Ready to run your deal?
            </div>
            <p style={{ color: "rgba(238,239,211,0.75)", fontSize: 15, margin: 0, lineHeight: 1.5, maxWidth: "44ch" }}>
              Build an educational cash-flow scenario. It is not a program match, quote, approval, or commitment.
            </p>
          </div>
          <button
            onClick={() => (window as any).openQualify?.()}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: dc.lemon, color: dc.dark, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", padding: "13px 26px", borderRadius: 6, fontFamily: dc.sans, letterSpacing: "-0.01em", flexShrink: 0 }}
          >
            Build a scenario →
          </button>
        </div>

        {/* Freshness signal */}
        <div
          style={{
            maxWidth: 880,
            margin: "32px auto 0",
            padding: "14px 20px",
            background: dc.mintBg,
            borderRadius: 8,
            border: `1px solid ${dc.faded}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 999,
              background: dc.lemon,
              color: dc.dark,
            }}
          >
            Verification required
          </span>
          <span style={{ fontSize: 13, color: dc.dark, fontWeight: 600 }}>
            Provider terms, availability, licensing, and legal requirements are not verified on this page.
          </span>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section
        className="gs-reveal"
        style={{
          background: dc.teal,
          padding: "clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: dc.lemon,
              marginBottom: 16,
            }}
          >
            Still have a question?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.5vw,48px)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              color: dc.cream,
              margin: "0 0 18px",
            }}
          >
            We didn't answer everything.
          </h2>
          <p
            style={{
              fontSize: "clamp(15px,1.3vw,18px)",
              fontWeight: 500,
              lineHeight: 1.6,
              color: "rgba(238,239,211,0.65)",
              margin: "0 0 32px",
              maxWidth: "44ch",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Model a cash-flow scenario, then confirm any financing, legal, tax, or property questions with qualified professionals.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
            <button
              onClick={() => (window as any).openQualify?.()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                padding: "15px 32px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Build a scenario →
            </button>
            <a
              href="/book-demo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                padding: "15px 32px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                border: `1px solid rgba(238,239,211,0.3)`,
              }}
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
