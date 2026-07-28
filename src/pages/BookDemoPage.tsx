import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, swatch } from "../theme";

const REVIEW_STEPS = [
  {
    number: "01",
    title: "Build the property profile",
    body: "Enter the value, requested loan, expected rent, loan purpose, and property state.",
  },
  {
    number: "02",
    title: "See the preliminary DSCR",
    body: "Review the estimated payment coverage before you decide whether to share contact details.",
  },
  {
    number: "03",
    title: "Submit the loan request",
    body: "Choose how Greenstreet may follow up and send the property information to the team.",
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
    document.title = "Apply for a DSCR Loan | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const openReview = () => {
    if (window.openQualify) {
      window.openQualify();
      return;
    }
    onNavigate("dscr-calculator");
  };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{BOOK_DEMO_CSS}</style>
      <section className="bd-hero" aria-labelledby="book-demo-heading">
        <div className="bd-layout">
          <div className="bd-copy">
            <div className="bd-kicker">Preliminary loan request</div>
            <H1 id="book-demo-heading" style={{ maxWidth: "12ch", marginBottom: 24 }}>
              Start your DSCR loan request.
            </H1>
            <Lead
              style={{
                maxWidth: "47ch",
                color: "rgba(0,55,56,.7)",
                lineHeight: 1.45,
              }}
            >
              Share the core property and requested-loan details once. You will
              see a preliminary DSCR estimate, then choose whether and how the
              Greenstreet team may follow up.
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
              No credit pull to start. A preliminary request is not an approval,
              rate quote, rate lock, or commitment to lend.
            </p>
          </div>

          <div className="bd-review-card">
            <div className="bd-card-head">
              <span className="bd-status">
                <span className="bd-status-dot" aria-hidden="true" />
                Loan-request intake available
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
                Apply for DSCR financing
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
                Give the team the deal—not a blank callback request.
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
                Start my loan request →
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
                Contact details are optional until the final step. Do not submit
                SSNs, bank information, or identity documents here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
