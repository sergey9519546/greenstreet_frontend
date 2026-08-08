import React, { useEffect, useId } from "react";
import { DcShell, Mono } from "../design/dc";
import { font, radius, space, swatch, type } from "../theme";
import type { ToolReliabilityHoldContent } from "./toolReliabilityHolds";

export interface ToolReliabilityHoldPageProps extends ToolReliabilityHoldContent {
  onNavigate?: (view: string) => void;
}

const ACTIONS = [
  {
    label: "Open DSCR calculator",
    detail: "Run a preliminary coverage estimate.",
    view: "dscr-calculator",
    href: "/dscr-calculator",
    primary: true,
  },
  {
    label: "Browse all products",
    detail: "Review available tools and their scope.",
    view: "products",
    href: "/products",
    primary: false,
  },
  {
    label: "Request a file review",
    detail: "Ask a specialist to review the scenario.",
    view: "book-demo",
    href: "/book-demo",
    primary: false,
  },
] as const;

export default function ToolReliabilityHoldPage({
  title,
  reason,
  whatIsNeeded,
  onNavigate,
}: ToolReliabilityHoldPageProps) {
  const headingId = useId();
  const requirementsId = useId();

  useEffect(() => {
    document.title = `${title} | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [title]);

  const handleNavigation =
    (view: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!onNavigate) return;
      event.preventDefault();
      onNavigate(view);
    };

  return (
    <DcShell onNavigate={onNavigate}>
      <style>{`
        .trh-action {
          transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
        }
        .trh-action:hover {
          background: ${swatch.lemon} !important;
          color: ${swatch.midnight} !important;
          border-color: ${swatch.lemon} !important;
        }
        .trh-action:focus-visible {
          outline: 3px solid ${swatch.lemon};
          outline-offset: 4px;
        }
        @media (max-width: 760px) {
          .trh-layout, .trh-actions {
            grid-template-columns: 1fr !important;
          }
          .trh-layout { border-radius: ${radius.md}; }
          .trh-action { min-height: 64px; }
        }
      `}</style>

      <section
        aria-labelledby={headingId}
        style={{
          background: swatch.pistachio,
          padding: `${space.section} ${space.gutter}`,
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            className="trh-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
              background: swatch.midnight,
              color: swatch.pistachio,
              borderRadius: radius.lg,
              overflow: "hidden",
              border: `1px solid ${swatch.midnightFaded}`,
            }}
          >
            <div
              style={{
                padding: "clamp(32px, 6vw, 76px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Mono
                style={{
                  color: swatch.lemon,
                  fontSize: 12,
                  fontWeight: font.bold,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 22,
                }}
              >
                Tool reliability review
              </Mono>

              <h1
                id={headingId}
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize: type.h1,
                  lineHeight: 0.98,
                  letterSpacing: "-0.055em",
                  fontWeight: font.semibold,
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  margin: "28px 0 0",
                  maxWidth: 720,
                  fontSize: type.large,
                  lineHeight: 1.55,
                  color: "rgba(238,239,211,0.76)",
                }}
              >
                {reason}
              </p>

              <p
                role="status"
                style={{
                  margin: "28px 0 0",
                  maxWidth: 720,
                  borderLeft: `4px solid ${swatch.lemon}`,
                  padding: "14px 0 14px 20px",
                  fontSize: 18,
                  lineHeight: 1.5,
                  fontWeight: font.semibold,
                  color: swatch.pistachio,
                }}
              >
                No decision output is available from this tool right now.
              </p>
            </div>

            <aside
              aria-labelledby={requirementsId}
              style={{
                background: swatch.mint,
                color: swatch.midnight,
                padding: "clamp(30px, 5vw, 58px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h2
                id={requirementsId}
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                }}
              >
                What is needed
              </h2>
              <ul
                style={{
                  margin: "24px 0 0",
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: 18,
                }}
              >
                {whatIsNeeded.map((item, index) => (
                  <li
                    key={item}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "32px 1fr",
                      gap: 12,
                      alignItems: "start",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: radius.pill,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: swatch.lemon,
                        color: swatch.midnight,
                        fontFamily: font.mono,
                        fontSize: 12,
                        fontWeight: font.bold,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span style={{ paddingTop: 4, fontWeight: font.medium }}>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <nav
            aria-label="Available next steps"
            className="trh-actions"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
              marginTop: 18,
            }}
          >
            {ACTIONS.map((action) => (
              <a
                key={action.view}
                className="trh-action"
                href={action.href}
                onClick={handleNavigation(action.view)}
                style={{
                  minHeight: 96,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  borderRadius: radius.md,
                  border: `1px solid ${action.primary ? swatch.midnight : swatch.midnightFaded}`,
                  background: action.primary ? swatch.midnight : swatch.pistachio,
                  color: action.primary ? swatch.pistachio : swatch.midnight,
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 17, fontWeight: font.bold }}>{action.label} →</span>
                <span style={{ marginTop: 5, fontSize: 14, lineHeight: 1.4, opacity: 0.72 }}>
                  {action.detail}
                </span>
              </a>
            ))}
          </nav>

          <p
            style={{
              margin: "24px auto 0",
              maxWidth: 820,
              textAlign: "center",
              color: swatch.rainforest,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Preliminary calculators are educational estimates and are not an approval,
            rate quote, tax opinion, or commitment to lend.
          </p>
        </div>
      </section>
    </DcShell>
  );
}
