import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";

// ── Audience segments ─────────────────────────────────────────────────────────
// Audience: real estate investors, foreign nationals, STR/Airbnb, portfolio
// builders. This page presents educational scenario tools only; it does not
// state Greenstreet's lending role, licensing, terms, or counterparty.
interface Segment {
  tag: string;
  title: string;
  desc: string;
  cta: string;
  view: string;
  panelBg: string;
  panelAccent: string;
  panelBody: string;
  gridline: string;
  statBg: string;
  stats: { v: string; k: string }[];
  /** Optional DSCR value to show a gauge + flame in the stat panel */
  dscrPreview?: number;
}

const SEGMENTS: Segment[] = [
  {
    tag: "Buy-and-hold investors",
    title: "Model rent alongside your costs",
    desc:
      "Use an educational DSCR scenario to compare estimated rent with estimated payment and operating costs. It is not a qualification test, financing application, or underwriting decision.",
    cta: "Price my rental deal →",
    view: "dscr-calculator",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    gridline: "rgba(0,55,56,0.10)",
    statBg: dc.cream,
    dscrPreview: 1.32,
    stats: [
      { v: "Scenario", k: "planning input" },
      { v: "Estimate", k: "not a quote" },
      { v: "Verify", k: "local requirements" },
      { v: "Independent", k: "provider review" },
    ],
  },
  {
    tag: "Short-term & vacation rental investors",
    title: "Stress-test STR income assumptions",
    desc:
      "Compare short-term-rental revenue assumptions with costs and downside cases. Local rules, insurance, documentation, and financing treatment vary and require independent verification.",
    cta: "Explore STR planning →",
    view: "borrower-profiles",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.55)",
    gridline: "rgba(238,239,211,0.12)",
    statBg: dc.teal,
    dscrPreview: 1.18,
    stats: [
      { v: "STR", k: "planning scenario" },
      { v: "Local", k: "rules to verify" },
      { v: "Dual-Track", k: "cash-flow views" },
      { v: "No", k: "availability claim" },
    ],
  },
  {
    tag: "Portfolio builders",
    title: "One blended view of all your doors",
    desc:
      "Use a portfolio view to organize estimated rent, debt, equity, and cash-flow assumptions across properties. It does not determine whether any multi-property financing is available.",
    cta: "Build my portfolio view →",
    view: "portfolio",
    panelBg: dc.rain,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.60)",
    gridline: "rgba(238,239,211,0.14)",
    statBg: dc.teal,
    dscrPreview: 1.49,
    stats: [
      { v: "Portfolio", k: "planning view" },
      { v: "1.49×", k: "illustrative DSCR" },
      { v: "Multiple", k: "properties modeled" },
      { v: "No", k: "application claim" },
    ],
  },
  {
    tag: "Investors with ARM exposure",
    title: "See exactly how big the payment jump is",
    desc:
      "Explore how assumed rate changes can affect an estimated payment and DSCR. Tool outputs are illustrative and do not interpret a note, predict a benchmark, or determine eligibility.",
    cta: "Model my ARM reset →",
    view: "arm-reset",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.60)",
    gridline: "rgba(0,55,56,0.12)",
    statBg: dc.mintBg,
    dscrPreview: 0.92,
    stats: [
      { v: "5", k: "illustrative scenarios" },
      { v: "Rate", k: "assumptions" },
      { v: "DSCR", k: "planning metric" },
      { v: "Verify", k: "note terms" },
    ],
  },
];

// ── Stat panel ────────────────────────────────────────────────────────────────
function StatPanel({ seg }: { seg: Segment }) {
  return (
    <div
      className="so-stat-panel"
      style={{
        borderRadius: dc.r.lg,
        overflow: "hidden",
        background: seg.panelBg,
        border: `1px solid ${dc.faded}`,
        padding: "clamp(20px,2.2vw,30px)",
        aspectRatio: "1.4",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Tag + optional artifacts row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            color: seg.panelAccent,
          }}
        >
          {seg.tag}
        </div>
        {/* RiskFlame for ARM segment (high DSCR-risk scenario); DscrGauge badge inline for others */}
        {seg.dscrPreview !== undefined && seg.dscrPreview < 1.0 && (
          <RiskFlame level={riskFromDscr(seg.dscrPreview)} size={20} />
        )}
        {seg.dscrPreview !== undefined && seg.dscrPreview >= 1.0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <DscrGauge value={seg.dscrPreview} size={56} label={false} />
            <Mono style={{ fontSize: 14, fontWeight: 700, color: dscrColor(seg.dscrPreview) }}>
              {seg.dscrPreview.toFixed(2)}x
            </Mono>
          </div>
        )}
      </div>

      {/* Stat grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: seg.gridline,
          borderRadius: dc.r.sm,
          overflow: "hidden",
          flex: 1,
        }}
      >
        {seg.stats.map((st) => (
          <div key={st.k} style={{ background: seg.statBg, padding: "16px 14px" }}>
            <Mono
              style={{
                display: "block",
                fontSize: "clamp(20px,2.2vw,30px)",
                fontWeight: 700,
                color: seg.panelAccent,
                lineHeight: 1,
              }}
            >
              {st.v}
            </Mono>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: seg.panelBody,
                marginTop: 3,
                letterSpacing: "-0.01em",
              }}
            >
              {st.k}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SegmentRow ────────────────────────────────────────────────────────────────
function SegmentRow({
  seg,
  index,
  onNavigate,
}: {
  seg: Segment;
  index: number;
  onNavigate: (v: string) => void;
}) {
  const contentFirst = index % 2 === 0;
  return (
    <div
      className="so-feat"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(32px,5vw,80px)",
        alignItems: "center",
      }}
    >
      {/* Content column */}
      <div
        style={{
          order: contentFirst ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            color: dc.rain,
            marginBottom: 14,
          }}
        >
          {seg.tag}
        </div>
        <h2
          style={{
            fontSize: "clamp(28px,3.4vw,46px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.04,
            margin: "0 0 18px",
            color: dc.dark,
          }}
        >
          {seg.title}
        </h2>
        <p
          style={{
            fontSize: "clamp(16px,1.3vw,20px)",
            fontWeight: 500,
            lineHeight: 1.58,
            color: "rgba(0,55,56,0.68)",
            margin: "0 0 28px",
            letterSpacing: "-0.01em",
          }}
        >
          {seg.desc}
        </p>
        {/* Primary lemon CTA */}
        <button
          onClick={() => onNavigate(seg.view)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: dc.lemon,
            color: dc.dark,
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            padding: "14px 26px",
            borderRadius: dc.r.md,
            fontFamily: dc.sans,
            letterSpacing: "-0.01em",
            minHeight: 44,
          }}
        >
          {seg.cta}
        </button>
      </div>

      {/* Visual panel column */}
      <div style={{ order: contentFirst ? 2 : 1 }}>
        <StatPanel seg={seg} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SolutionsPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Who We Serve | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Tools", view: "portfolio" },
        { label: "Case Studies", view: "case-studies" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      <style>{`
        @media (max-width: 991px) {
          .so-feat { grid-template-columns: 1fr !important; }
          .so-feat > * { order: unset !important; }
        }
        @media (max-width: 600px) {
          .so-feat { gap: 24px !important; }
          .so-stat-panel { aspect-ratio: auto !important; min-height: 260px; }
          .so-feat button { min-height: 44px; width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,9vh,128px) ${dc.pad}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "flex-start",
            gap: "clamp(28px,4vw,48px)",
            minHeight: "clamp(280px,38vh,420px)",
            justifyContent: "space-between",
          }}
        >
          <div id="gs-hero-content">
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 18,
              }}
            >
              Who we serve
            </div>
            <H1 style={{ margin: 0, maxWidth: "18ch" }}>
              Built for real estate investors.
            </H1>
          </div>
          <Lead
            style={{
              color: "rgba(238,239,211,0.72)",
              maxWidth: "46ch",
              margin: 0,
            }}
          >
            Greenstreet provides educational tools for comparing rental-property assumptions. Whether
            you're considering a first rental, a short-term rental, a portfolio, or an ARM
            reset, verify actual provider role, licensing, terms, availability, and requirements
            before making a decision.
          </Lead>
        </div>
      </section>

      {/* ── ALTERNATING SEGMENT ROWS ─────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad} clamp(40px,5vw,64px)`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column" as const,
            gap: "clamp(56px,8vw,120px)",
          }}
        >
          {SEGMENTS.map((seg, i) => (
            <SegmentRow key={seg.tag} seg={seg} index={i} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* ── RATE QUIZ + CLOSE ────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(40px,6vw,96px)",
            alignItems: "center",
          }}
        >
          {/* Left: rate quiz */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              Scenario estimate
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 20px",
                color: dc.cream,
              }}
            >
              Five questions. Illustrative scenario.
            </h2>
            <p
              style={{
                fontSize: "clamp(15px,1.2vw,18px)",
                fontWeight: 500,
                lineHeight: 1.55,
                color: "rgba(238,239,211,0.65)",
                margin: "0 0 28px",
                letterSpacing: "-0.01em",
                maxWidth: "42ch",
              }}
            >
              Property type, LTV (how the loan compares to the property value),
              DSCR, FICO, and state can inform an educational scenario. The result is
              not market pricing, a program match, a quote, a credit decision, or a commitment.
            </p>
            {/* Dominant lemon CTA */}
            <button
              onClick={() => onNavigate("rate-quiz")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                padding: "16px 28px",
                borderRadius: dc.r.md,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
                minHeight: 44,
              }}
            >
              Explore assumptions →
            </button>
          </div>

          {/* Right: explore nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: "rgba(238,239,211,0.45)",
                marginBottom: 4,
              }}
            >
              Explore further
            </div>
            {[
              { label: "Run a deal in the DSCR Calculator →", view: "dscr-calculator" },
              { label: "See the full product catalog →", view: "products" },
              { label: "Read investor case studies →", view: "case-studies" },
            ].map(({ label, view }) => (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "transparent",
                  border: `1.5px solid ${dc.faded}`,
                  borderRadius: dc.r.md,
                  padding: "14px 24px",
                  cursor: "pointer",
                  fontFamily: dc.sans,
                  minHeight: 44,
                  alignSelf: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: dc.cream,
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
