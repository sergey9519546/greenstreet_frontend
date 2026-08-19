import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, Mono } from "../design/dc";
import { radius, swatch } from "../theme";

/**
 * All-tools hub — the missing index for the five orphan tool pages
 * (str-underwriting, commercial-dscr, construction-bridge, tco-threshold,
 * perfect-property) and a single discoverable doorway into every calculator.
 *
 * Every card is a real <a href="/tools/...">: the app's global click
 * interceptor (App.tsx) turns the click into SPA navigation, but crawlers that
 * do not execute JS (GPTBot, ClaudeBot, PerplexityBot — all invited by
 * robots.txt) still see a crawlable link, which is the point of the page.
 */
const TOOLS: ReadonlyArray<{ name: string; path: string; blurb: string; tag?: string }> = [
  {
    name: "DSCR Calculator",
    path: "/dscr-calculator",
    blurb: "Quick DSCR check, full PITIA breakdown, and program fit in under a minute.",
    tag: "Most used",
  },
  {
    name: "Deal Analyzer",
    path: "/deal-analyzer",
    blurb: "Full dual-track underwrite — lender qualification plus investor cash flow, break-even rate, and cash-on-cash.",
  },
  {
    name: "Lender Intelligence",
    path: "/lender-intel",
    blurb: "Screen a scenario against published DSCR program profiles by FICO, DSCR, LTV, and property type.",
  },
  {
    name: "State Rules Reference",
    path: "/state-laws",
    blurb: "50-state prepayment-penalty, usury, and short-term-rental matrix with statutory citations.",
  },
  {
    name: "STR Underwriting",
    path: "/tools/str-underwriting",
    blurb: "Short-term-rental underwriting across three income worlds with month-by-month seasonality.",
  },
  {
    name: "Perfect Property Engine",
    path: "/tools/perfect-property",
    blurb: "Regime-aware property prediction and loss-calibrated underwriting copilot.",
  },
  {
    name: "Commercial DSCR",
    path: "/tools/commercial-dscr",
    blurb: "DSCR for 5+ unit properties — vacancy, operating expenses, and debt-service coverage.",
  },
  {
    name: "Construction & Bridge",
    path: "/tools/construction-bridge",
    blurb: "Model construction and bridge carry, carry costs, exit refinance, and permanent takeout.",
  },
  {
    name: "TCO Threshold",
    path: "/tools/tco-threshold",
    blurb: "Convert DSCR targets to True Cost of Ownership thresholds with reserve-loaded debt.",
  },
  {
    name: "Refi Tracker",
    path: "/tools/refi-tracker",
    blurb: "Model whether refinancing clears its break-even cost from your actual amortization schedule.",
  },
  {
    name: "ARM Reset",
    path: "/tools/arm-reset",
    blurb: "See how payment and coverage change when an adjustable-rate mortgage resets across SOFR scenarios.",
  },
  {
    name: "Monte Carlo Simulator",
    path: "/tools/monte-carlo",
    blurb: "Simulate DSCR outcomes over a holding period under stated rate paths and volatility.",
  },
  {
    name: "Returns & IRR",
    path: "/tools/returns",
    blurb: "Cash-on-cash return, IRR, and equity multiple from day one through the sale.",
  },
  {
    name: "Tax Engine",
    path: "/tools/tax-engine",
    blurb: "After-tax IRR with depreciation, interest deduction, and recapture assumptions.",
  },
  {
    name: "Stress Matrix",
    path: "/tools/stress-matrix",
    blurb: "Shock rate, rent, vacancy, and tax to see exactly where coverage breaks.",
  },
  {
    name: "Structure Optimizer",
    path: "/tools/structure-optimizer",
    blurb: "Compare interest-only, amortization, rate, and cost structures against qualifying DSCR and cash flow.",
  },
  {
    name: "Decision Support",
    path: "/tools/decision-support",
    blurb: "Solved rate, program eligibility, and after-tax IRR together in one view.",
  },
  {
    name: "Portfolio Builder",
    path: "/tools/portfolio",
    blurb: "Track DSCR and equity across a manually entered property portfolio.",
  },
];

export default function ToolsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "All DSCR Tools | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell onNavigate={onNavigate} cta={{ label: "Price a deal →", view: "dscr-calculator" }}>
      {/* ── HERO — dark band ── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(56px,8vh,108px) clamp(1.5rem,4vw,3rem) clamp(44px,6vh,76px)",
        }}
      >
        <div className="dc-hero" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: dc.lemon, marginBottom: 14 }}>
            All DSCR tools
          </div>
          <H1 style={{ margin: "0 0 18px" }}>Every calculator, one door.</H1>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "56ch", margin: 0, lineHeight: 1.5 }}>
            Structure the deal, check the state rules, stress-test the coverage, and
            model the exit — no re-keying between steps. Every tool is educational:
            results are estimates, not loan commitments or advice.
          </Lead>
        </div>
      </section>

      {/* ── TOOL GRID — cream surface ── */}
      <section style={{ background: swatch.pistachio, padding: "clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem)" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {TOOLS.map((tool) => (
              <a
                key={tool.path}
                href={tool.path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  background: swatch.white,
                  border: `1.5px solid ${swatch.midnightFaded}`,
                  borderRadius: radius.md,
                  padding: "22px 24px",
                  color: dc.dark,
                  textDecoration: "none",
                  minHeight: 150,
                  transition: "border-color 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = dc.rain;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = swatch.midnightFaded;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: dc.dark }}>
                    {tool.name}
                  </span>
                  {tool.tag && (
                    <span
                      style={{
                        background: dc.lemon,
                        color: dc.dark,
                        borderRadius: radius.pill,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase" as const,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tool.tag}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "rgba(0,55,56,0.72)", flex: 1 }}>
                  {tool.blurb}
                </p>
                <Mono style={{ fontSize: 12, fontWeight: 700, color: dc.rain }}>
                  Open tool →
                </Mono>
              </a>
            ))}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
