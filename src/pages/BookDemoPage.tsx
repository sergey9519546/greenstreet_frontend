import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, swatch } from "../theme";

const REVIEW_STEPS = [
  {
    number: "01",
    title: "Share the scenario",
    body: "Property value, requested loan, expected rent, state, and the contact details you want us to use.",
  },
  {
    number: "02",
    title: "Receive a file review",
    body: "The request is delivered through the same secure intake used across Greenstreet's deal tools.",
  },
  {
    number: "03",
    title: "Choose the next step",
    body: "A conversation can be arranged after the team confirms that the scenario and contact channel are usable.",
  },
] as const;

const BOOK_DEMO_CSS = `
  .bd-hero {
    max-width: ${dc.maxW}px;
    margin: 0 auto;
    padding: clamp(48px, 7vw, 104px) ${dc.pad} clamp(64px, 8vw, 120px);
  }
  .bd-layout {
    display: grid;
    grid-template-columns: minmax(0, .86fr) minmax(500px, 1.14fr);
    gap: clamp(36px, 6vw, 88px);
    align-items: start;
  }
  .bd-copy {
    position: sticky;
    top: 118px;
    padding-top: clamp(8px, 2vw, 30px);
  }
  .bd-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    color: ${dc.rain};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .bd-kicker::before {
    content: "";
    width: 28px;
    height: 2px;
    background: ${dc.lemon};
  }
  .bd-review-card {
    overflow: hidden;
    border-radius: ${radius.lg};
    color: ${dc.cream};
    background: ${dc.dark};
    border: 1px solid rgba(238, 239, 211, .16);
    box-shadow: 0 28px 72px rgba(0, 55, 56, .16);
  }
  .bd-card-head {
    padding: clamp(28px, 5vw, 52px);
    border-bottom: 1px solid rgba(238, 239, 211, .14);
  }
  .bd-status {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 24px;
    color: rgba(238, 239, 211, .68);
    font-size: 12px;
    font-weight: 650;
  }
  .bd-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${dc.lemon};
  }
  .bd-steps {
    display: grid;
  }
  .bd-step {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 16px;
    padding: 24px clamp(28px, 5vw, 52px);
    border-bottom: 1px solid rgba(238, 239, 211, .12);
  }
  .bd-step:last-child {
    border-bottom: 0;
  }
  .bd-step-number {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: ${dc.dark};
    background: ${dc.lemon};
    font-family: ${dc.mono};
    font-size: 11px;
    font-weight: 700;
  }
  .bd-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: clamp(28px, 5vw, 52px);
    background: rgba(238, 239, 211, .055);
  }
  .bd-action {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 22px;
    border-radius: ${radius.sm};
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }
  .bd-action-primary {
    border: 1px solid ${dc.lemon};
    color: ${dc.dark};
    background: ${dc.lemon};
  }
  .bd-action-secondary {
    border: 1px solid rgba(238, 239, 211, .28);
    color: ${dc.cream};
    background: transparent;
  }
  .bd-action:hover {
    filter: brightness(.96);
  }
  .bd-action:focus-visible {
    outline: 3px solid ${dc.lemon};
    outline-offset: 4px;
  }
  .bd-note {
    width: 100%;
    margin: 6px 0 0;
    color: rgba(238, 239, 211, .5);
    font-size: 12px;
    line-height: 1.55;
  }
  @media (max-width: 900px) {
    .bd-layout {
      grid-template-columns: 1fr;
    }
    .bd-copy {
      position: static;
      max-width: 720px;
      padding-top: 0;
    }
  }
  @media (max-width: 560px) {
    .bd-hero {
      padding: 44px 16px 56px;
    }
    .bd-card-head,
    .bd-step,
    .bd-actions {
      padding-left: 20px;
      padding-right: 20px;
    }
    .bd-step {
      grid-template-columns: 36px 1fr;
      gap: 12px;
    }
    .bd-action {
      width: 100%;
    }
    .bd-status {
      align-items: flex-start;
      line-height: 1.4;
    }
    .bd-status-dot {
      margin-top: 4px;
      flex: 0 0 auto;
    }
  }
`;

export default function BookDemoPage({
  onNavigate,
}: {
  onNavigate: (view: any) => void;
}) {
  useEffect(() => {
    document.title = "Request a DSCR Scenario Review | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const openReview = () => {
    if (window.openQualify) {
      window.openQualify();
      return;
    }
    onNavigate("rate-quiz");
  };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{BOOK_DEMO_CSS}</style>
      <section className="bd-hero" aria-labelledby="book-demo-heading">
        <div className="bd-layout">
          <div className="bd-copy">
            <div className="bd-kicker">Scenario review</div>
            <H1 id="book-demo-heading" style={{ maxWidth: "12ch", marginBottom: 24 }}>
              Start with the deal. Then arrange the call.
            </H1>
            <Lead
              style={{
                maxWidth: "47ch",
                color: "rgba(0,55,56,.7)",
                lineHeight: 1.45,
              }}
            >
              Greenstreet does not currently publish a working self-scheduling
              calendar. Send the scenario through the secure intake so the team
              can review the facts and follow up using your selected consent.
            </Lead>
            <p
              style={{
                maxWidth: "50ch",
                margin: "28px 0 0",
                color: "rgba(0,55,56,.56)",
                fontSize: 13,
                lineHeight: 1.65,
              }}
            >
              Preliminary review only. Submitting a scenario is not an
              application, approval, rate lock, tax opinion, or commitment to
              lend.
            </p>
          </div>

          <div className="bd-review-card">
            <div className="bd-card-head">
              <span className="bd-status">
                <span className="bd-status-dot" aria-hidden="true" />
                Secure scenario intake available
              </span>
              <Mono
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: dc.lemon,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                Request a live review
              </Mono>
              <h2
                style={{
                  maxWidth: "16ch",
                  margin: 0,
                  color: swatch.pistachio,
                  fontSize: "clamp(30px, 4vw, 48px)",
                  lineHeight: 1,
                  letterSpacing: "-.05em",
                }}
              >
                Give the team enough context to be useful.
              </h2>
            </div>

            <div className="bd-steps" aria-label="Review process">
              {REVIEW_STEPS.map((step) => (
                <div className="bd-step" key={step.number}>
                  <span className="bd-step-number" aria-hidden="true">
                    {step.number}
                  </span>
                  <div>
                    <h3
                      style={{
                        margin: "2px 0 6px",
                        color: swatch.pistachio,
                        fontSize: 17,
                        letterSpacing: "-.02em",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "rgba(238,239,211,.62)",
                        fontSize: 14,
                        lineHeight: 1.55,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bd-actions">
              <button
                className="bd-action bd-action-primary"
                type="button"
                onClick={openReview}
              >
                Send my scenario →
              </button>
              <a
                className="bd-action bd-action-secondary"
                href="/dscr-calculator"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("dscr-calculator");
                }}
              >
                Run the calculator
              </a>
              <p className="bd-note">
                Contact is optional until you choose to request a review. The
                intake records the consent options you select.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
