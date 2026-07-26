import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead } from "../design/dc";

const PRINCIPLES = [
  {
    heading: "One definition for every number",
    body: "The public calculators use shared deterministic arithmetic so the same inputs do not produce competing DSCR or payment results on different pages.",
  },
  {
    heading: "Qualification and ownership are different views",
    body: "Lender DSCR answers whether rent covers the full monthly payment. Investor cash flow adds operating assumptions such as vacancy, management, and capital reserves.",
  },
  {
    heading: "Estimates stay estimates",
    body: "Results explain their inputs and limitations. They are educational scenario outputs, not approvals, rate locks, legal advice, tax advice, or commitments to lend.",
  },
  {
    heading: "Unverified tools fail closed",
    body: "A tool whose model or source data has not passed review is held out of service instead of presenting a polished but unreliable answer.",
  },
];

const LIVE_CAPABILITIES = [
  {
    eyebrow: "Calculate",
    title: "DSCR and payment",
    body: "Estimate principal and interest, full monthly payment, lender DSCR, and an expense-aware investor view from one reconciled scenario.",
    action: "Open the calculator",
    view: "dscr-calculator",
  },
  {
    eyebrow: "Understand",
    title: "Assumptions and state context",
    body: "Review the inputs that move a scenario and see state-rule references with explicit unknown and manual-review states.",
    action: "Review state references",
    view: "state-laws",
  },
  {
    eyebrow: "Continue",
    title: "Preliminary scenario review",
    body: "Share a business-purpose rental scenario for follow-up. Final eligibility, pricing, disclosures, and availability require confirmation outside the calculator.",
    action: "Request a review",
    view: "book-demo",
  },
];

const ABOUT_CSS = `
  .dc-nav a { color: rgba(0,55,56,0.72) !important; }
  .dc-nav a.dc-cta { background: #003738 !important; color: #eeefd3 !important; }
  .dc-nav { border-bottom: 1px solid rgba(0,55,56,0.15) !important; background: #d8d958 !important; }
  footer { color: rgba(0,55,56,0.55) !important; }
  footer .gs-footer-word { color: #003738 !important; }
  .about-principles, .about-capabilities { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .about-capabilities { grid-template-columns: repeat(3, 1fr); }
  .about-card { transition: transform .16s ease, border-color .16s ease; }
  .about-card:hover { transform: translateY(-3px); border-color: rgba(0,55,56,.3) !important; }
  @media (max-width: 900px) {
    .about-principles, .about-capabilities { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .about-principles, .about-capabilities { gap: 12px; }
    .about-card { padding: 24px !important; }
    .about-capabilities article { min-height: 0 !important; }
    .about-capabilities button { min-height: 44px; }
  }
`;

export default function AboutPage({
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate: (view: any) => void;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.lemon}
      navLinks={[
        { label: "Products", view: "products" },
        { label: "FAQ", view: "faq" },
      ]}
      cta={{ label: "Check a deal →", view: "dscr-calculator" }}
    >
      <style>{ABOUT_CSS}</style>

      <section
        style={{
          background: dc.lemon,
          color: dc.dark,
          padding: `clamp(72px,10vh,136px) ${dc.pad}`,
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              color: "rgba(0,55,56,.58)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            About Greenstreet Finance
          </div>
          <H1 style={{ maxWidth: "18ch", margin: "0 0 28px" }}>
            Clearer DSCR decisions start with consistent math.
          </H1>
          <Lead style={{ color: "rgba(0,55,56,.72)", maxWidth: "58ch", margin: "0 0 34px" }}>
            Greenstreet Finance provides educational tools for evaluating
            business-purpose rental-property financing scenarios. The public
            experience is built to show the math, separate lender qualification
            from investor economics, and make uncertainty visible.
          </Lead>
          <button
            onClick={() => onNavigate("dscr-calculator")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: dc.dark,
              color: dc.cream,
              border: 0,
              borderRadius: 6,
              padding: "13px 24px",
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Check a deal →
          </button>
        </div>
      </section>

      <section style={{ background: dc.cream, padding: `clamp(64px,8vw,112px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ maxWidth: 760, marginBottom: "clamp(34px,5vw,58px)" }}>
            <div
              style={{
                color: dc.rain,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Product principles
            </div>
            <h2
              style={{
                color: dc.dark,
                fontSize: "clamp(30px,4vw,54px)",
                lineHeight: 1,
                letterSpacing: "-.04em",
                margin: 0,
                maxWidth: "19ch",
              }}
            >
              Useful enough to act on. Honest enough to question.
            </h2>
          </div>
          <div className="about-principles">
            {PRINCIPLES.map((principle) => (
              <article
                className="about-card"
                key={principle.heading}
                style={{
                  background: dc.mintBg,
                  border: `1px solid ${dc.faded}`,
                  borderRadius: dc.r.md,
                  padding: "clamp(24px,3vw,38px)",
                }}
              >
                <h3
                  style={{
                    color: dc.dark,
                    fontSize: "clamp(19px,2vw,25px)",
                    lineHeight: 1.15,
                    letterSpacing: "-.025em",
                    margin: "0 0 12px",
                  }}
                >
                  {principle.heading}
                </h3>
                <p style={{ color: "rgba(0,55,56,.68)", lineHeight: 1.65, margin: 0 }}>
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(64px,8vw,108px) ${dc.pad}` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              color: dc.lemon,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            What is available today
          </div>
          <h2
            style={{
              fontSize: "clamp(30px,4vw,54px)",
              lineHeight: 1,
              letterSpacing: "-.04em",
              margin: "0 0 clamp(34px,5vw,58px)",
              maxWidth: "18ch",
            }}
          >
            A focused path from scenario to review.
          </h2>
          <div className="about-capabilities">
            {LIVE_CAPABILITIES.map((capability) => (
              <article
                key={capability.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 280,
                  background: dc.teal,
                  border: "1px solid rgba(238,239,211,.12)",
                  borderRadius: dc.r.md,
                  padding: "clamp(24px,2.6vw,34px)",
                }}
              >
                <div
                  style={{
                    color: dc.lemon,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: 18,
                  }}
                >
                  {capability.eyebrow}
                </div>
                <h3 style={{ fontSize: 25, letterSpacing: "-.03em", margin: "0 0 12px" }}>
                  {capability.title}
                </h3>
                <p style={{ color: "rgba(238,239,211,.66)", lineHeight: 1.6, margin: "0 0 28px" }}>
                  {capability.body}
                </p>
                <button
                  onClick={() => onNavigate(capability.view)}
                  style={{
                    marginTop: "auto",
                    alignSelf: "flex-start",
                    background: "transparent",
                    color: dc.lemon,
                    border: 0,
                    padding: 0,
                    font: "inherit",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {capability.action} →
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: dc.mintBg, padding: `clamp(58px,7vw,92px) ${dc.pad}` }}>
        <div
          style={{
            maxWidth: 920,
            margin: "0 auto",
            borderLeft: `5px solid ${dc.rain}`,
            padding: "clamp(24px,3vw,38px)",
            background: dc.cream,
          }}
        >
          <div
            style={{
              color: dc.rain,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Business and licensing disclosure
          </div>
          <h2 style={{ color: dc.dark, fontSize: "clamp(24px,3vw,36px)", margin: "0 0 14px", letterSpacing: "-.03em" }}>
            Verify the responsible party before relying on a financing offer.
          </h2>
          <p style={{ color: "rgba(0,55,56,.7)", lineHeight: 1.65, margin: "0 0 12px" }}>
            This website does not currently publish a legal business name,
            NMLS identifier, state-license list, business address, or a complete
            description of the role of any lending or funding partner.
          </p>
          <p style={{ color: "rgba(0,55,56,.7)", lineHeight: 1.65, margin: 0 }}>
            Until an approved identity block is published, do not treat the
            site as proof that Greenstreet Finance is licensed, is the lender,
            or can offer a product in a particular jurisdiction. Calculator and
            intake output remains preliminary and is not a commitment to lend.
          </p>
        </div>
      </section>
    </DcShell>
  );
}
