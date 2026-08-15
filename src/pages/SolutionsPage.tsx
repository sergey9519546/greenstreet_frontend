import React, { useEffect } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import { DscrGauge, RiskFlame, riskFromDscr, dscrColor } from "../design/artifacts";

// ── Audience segments ─────────────────────────────────────────────────────────
// Audience: real estate investors, non-US investors, STR/Airbnb, portfolio
// builders. We ARE the lender AND the broker — direct to investors.
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
    title: "Qualify on rent, not your W-2",
    desc:
      "DSCR loans (whether the property's rent can cover the loan payment — 1.00 = break-even; higher is stronger) let you qualify purely on the rental income your property generates. No tax returns, no employment history, no income docs. Greenstreet underwrites the deal — one file, one decision, one lender relationship.",
    cta: "Price my rental deal →",
    view: "dscr-calculator",
    panelBg: dc.mintBg,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.55)",
    gridline: "rgba(0,55,56,0.10)",
    statBg: dc.cream,
    dscrPreview: 1.32,
    stats: [
      { v: "<60s", k: "to a priced deal" },
      { v: "0", k: "income docs required" },
      { v: "50", k: "state rule sets" },
      { v: "1", k: "lender relationship" },
    ],
  },
  {
    tag: "Short-term & vacation rental investors",
    title: "Model STR and non-US scenarios",
    desc:
      "Short-term-rental income and non-US borrower documentation can be considered under some published programs, but the evidence and overlays vary. Use Dual-Track DSCR to compare a lender-style rent-coverage scenario with investor cash-flow survival, then verify the current program rules for the specific file.",
    cta: "Explore STR & non-US scenarios →",
    view: "borrower-profiles",
    panelBg: dc.dark,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.62)",
    gridline: "rgba(238,239,211,0.12)",
    statBg: dc.teal,
    dscrPreview: 1.18,
    stats: [
      { v: "STR", k: "income accepted" },
      { v: "Cross-border", k: "provider-specific review" },
      { v: "Dual-Track", k: "DSCR analysis" },
      { v: "Current", k: "ITIN evidence required" },
    ],
  },
  {
    tag: "Portfolio builders",
    title: "One blended view of all your doors",
    desc:
      "When you own 10+ properties, lenders look at blended DSCR — the rent-to-payment ratio across every property combined. The portfolio builder shows aggregate equity, weighted average rate, and blended DSCR in one screen, the way a blanket underwriter actually evaluates your book. Blanket and multi-property lines to $25M, single application.",
    cta: "Build my portfolio view →",
    view: "portfolio",
    panelBg: dc.rain,
    panelAccent: dc.lemon,
    panelBody: "rgba(238,239,211,0.60)",
    gridline: "rgba(238,239,211,0.14)",
    statBg: dc.teal,
    dscrPreview: 1.49,
    stats: [
      { v: "$25M", k: "blanket line capacity" },
      { v: "1.49×", k: "blended DSCR example" },
      { v: "40+", k: "doors modeled" },
      { v: "1", k: "application" },
    ],
  },
  {
    tag: "Investors with ARM exposure",
    title: "See exactly how big the payment jump is",
    desc:
      "An ARM (a loan whose rate is fixed for a few years, then can adjust) looks cheap at origination — but your DSCR can collapse at the first reset. The ARM Reset tool runs five SOFR scenarios (Bullish → Crisis), applies initial, periodic, and lifetime caps exactly as written in the note, and shows whether the deal still qualifies at each adjustment. Know the floor before the clock runs out.",
    cta: "Model my ARM reset →",
    view: "arm-reset",
    panelBg: dc.lemon,
    panelAccent: dc.rain,
    panelBody: "rgba(0,55,56,0.60)",
    gridline: "rgba(0,55,56,0.12)",
    statBg: dc.mintBg,
    dscrPreview: 0.92,
    stats: [
      { v: "5", k: "rate scenarios" },
      { v: "3", k: "cap types enforced" },
      { v: "DSCR", k: "checked at every reset" },
      { v: "0", k: "black-box math" },
    ],
  },
];

// ── Stat panel ────────────────────────────────────────────────────────────────
function StatPanel({ seg }: { seg: Segment }) {
  return (
    <div
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
                fontSize: "clamp(18px,2.2vw,30px)",
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
            fontSize: "clamp(22px,3.4vw,46px)",
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
          .so-close-grid { grid-template-columns: 1fr !important; }
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
          className="dc-hero"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "clamp(36px,5vw,72px)",
            alignItems: "center",
          }}
        >
          <div id="gs-hero-content" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(18px,2.4vw,28px)" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
              }}
            >
              Who we serve
            </div>
            <H1 style={{ margin: 0, maxWidth: "16ch" }}>
              Built for real estate investors.
            </H1>
            <Lead
              style={{
                color: "rgba(238,239,211,0.72)",
                maxWidth: "44ch",
                margin: 0,
              }}
            >
              Greenstreet is the lender — no middlemen, no broker portals. Every
              product runs off the same deterministic underwriting math. Qualify
              on rent, not your income.
            </Lead>
          </div>

          {/* Audience selector — fills the hero and links to each dedicated page */}
          <div style={{ background: dc.teal, border: "1px solid rgba(238,239,211,0.12)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { label: "Buy-and-hold investors", tag: "DSCR", view: "investors" },
              { label: "STR & Airbnb hosts", tag: "Nightly income", view: "str-hosts" },
              { label: "Non-US investors", tag: "No US credit", view: "non-us-investors" },
              { label: "Vacation & second homes", tag: "Use + rent", view: "vacation-homes" },
              { label: "Portfolio builders", tag: "Blended DSCR", view: "portfolio" },
            ].map((a, i, arr) => (
              <button
                key={a.view}
                onClick={() => onNavigate(a.view)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, width: "100%",
                  background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: dc.sans,
                  padding: "clamp(16px,2vw,22px) clamp(18px,2.4vw,26px)",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(238,239,211,0.16)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: "clamp(16px,1.5vw,19px)", fontWeight: 600, letterSpacing: "-0.02em", color: dc.cream }}>{a.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(238,239,211,0.62)", marginTop: 3 }}>{a.tag}</div>
                </div>
                <span style={{ fontSize: 18, color: dc.lemon, flexShrink: 0 }}>→</span>
              </button>
            ))}
          </div>
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
          className="so-close-grid"
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
              Rate estimate
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,3.4vw,46px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                margin: "0 0 20px",
                color: dc.cream,
              }}
            >
              Five questions. Real rate tier.
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
              DSCR, FICO, and state. Get a preliminary rate tier and your matched
              Greenstreet program in under a minute. No email, no credit pull, no
              commitment.
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
              Get my rate in 5 questions →
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
                color: "rgba(238,239,211,0.62)",
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
