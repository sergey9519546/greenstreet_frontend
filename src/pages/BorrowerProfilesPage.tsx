import React, { useEffect, useRef, useState } from "react";
import { DcShell, dc, Mono, H1, Lead, useRevealOnView } from "../design/dc";
import { RiskFlame, DscrGauge, riskFromDscr } from "../design/artifacts";

// ── Jump-nav config ───────────────────────────────────────────────────────────
const SEGMENTS = [
  { id: "buy-hold", label: "Buy-and-Hold" },
  { id: "foreign-nationals", label: "Foreign Nationals" },
  { id: "str-airbnb", label: "STR / Airbnb" },
  { id: "vacation", label: "Vacation Homes" },
  { id: "portfolio", label: "Portfolio Builders" },
] as const;

// ── Glossary (inline tooltips on first use) ───────────────────────────────────
// DSCR = Debt-Service Coverage Ratio · PITIA = Principal+Interest+Tax+Insurance+HOA
// LTV = Loan-to-Value · STR = Short-Term Rental · No-ratio = income undisclosed

// ── Shared primitives ─────────────────────────────────────────────────────────

const JUMP_NAV_CSS = `
.bp-jumpnav { display: flex; gap: 8px; flex-wrap: wrap; }
.bp-jumplink {
  padding: 7px 14px;
  border: 1px solid ${dc.faded};
  border-radius: 6px;
  background: transparent;
  color: ${dc.dark};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: ${dc.sans};
  letter-spacing: -0.01em;
  transition: background .18s, color .18s, border-color .18s;
  text-decoration: none;
  display: inline-block;
}
.bp-jumplink:hover, .bp-jumplink:focus-visible {
  background: ${dc.dark};
  color: ${dc.cream};
  border-color: ${dc.dark};
  outline: none;
}
@media (max-width: 767px) {
  .bp-jumpnav { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .bp-jumplink { font-size: 12px; padding: 10px 11px; min-height: 44px; display: flex; align-items: center; }
  .bp-spec-row { align-items: flex-start; gap: 8px; }
  .bp-spec-row > :last-child { text-align: right; }
  .bp-cta, .bp-cta-ghost { min-height: 44px; justify-content: center; }
}

/* Segment section anchor offset for sticky nav */
.bp-segment-anchor { scroll-margin-top: 72px; }

/* Spec table row */
.bp-spec-row { display: flex; justify-content: space-between; align-items: baseline; padding: 9px 0; border-bottom: 1px solid ${dc.faded}; font-size: 13px; }
.bp-spec-row:last-child { border-bottom: none; }

/* CTA button */
.bp-cta {
  display: inline-flex; align-items: center; gap: 8px;
  background: ${dc.lemon}; color: ${dc.dark};
  font-weight: 700; font-size: 14px;
  border: none; cursor: pointer;
  padding: 11px 22px; border-radius: 6px;
  font-family: ${dc.sans}; letter-spacing: -0.01em;
  transition: opacity .16s;
}
.bp-cta:hover { opacity: .88; }
.bp-cta-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: ${dc.rain};
  font-weight: 600; font-size: 13px;
  border: 1px solid ${dc.faded}; cursor: pointer;
  padding: 9px 18px; border-radius: 6px;
  font-family: ${dc.sans}; letter-spacing: -0.01em;
  transition: border-color .16s, color .16s;
}
.bp-cta-ghost:hover { border-color: ${dc.rain}; }

/* Watch-out badge */
.bp-watch {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px;
  background: rgba(0,55,56,0.055);
  border-radius: 7px;
  border-left: 3px solid ${dc.rain};
  margin-top: 10px;
}
.bp-watch-text { font-size: 13px; font-weight: 500; color: rgba(0,55,56,0.72); line-height: 1.55; }

/* Segment grid: 2-col content + visual */
.bp-seg-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  align-items: start;
}
@media (max-width: 991px) {
  .bp-seg-grid { grid-template-columns: 1fr; gap: 24px; }
}

/* Doc checklist */
.bp-doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 767px) { .bp-doc-grid { grid-template-columns: 1fr; } }

/* Mistakes strip */
.bp-mistake { padding: 16px 0; border-bottom: 1px solid ${dc.faded}; }
.bp-mistake:last-child { border-bottom: none; }
`;

// ── Spec table ────────────────────────────────────────────────────────────────
function SpecTable({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <div style={{ border: `1px solid ${dc.faded}`, borderRadius: 8, padding: "4px 16px" }}>
      {rows.map((r) => (
        <div key={r.k} className="bp-spec-row">
          <span style={{ color: "rgba(0,55,56,0.55)", fontWeight: 500 }}>{r.k}</span>
          <Mono style={{ fontSize: 13, fontWeight: 700, color: dc.dark }}>{r.v}</Mono>
        </div>
      ))}
    </div>
  );
}

// ── Watch-out item ────────────────────────────────────────────────────────────
function WatchOut({ text, flame }: { text: string; flame?: boolean }) {
  return (
    <div className="bp-watch">
      {flame && <RiskFlame level="med" size={18} />}
      {!flame && <span style={{ color: dc.rain, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>!</span>}
      <span className="bp-watch-text">{text}</span>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function SegSection({
  id,
  label,
  bg,
  children,
}: {
  id: string;
  label: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="bp-segment-anchor"
      style={{
        background: bg ?? dc.cream,
        padding: `clamp(52px,6vw,80px) ${dc.pad}`,
        borderTop: `1px solid ${dc.faded}`,
      }}
    >
      <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            color: dc.rain,
            marginBottom: 12,
          }}
        >
          {label}
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Pill qualifier ────────────────────────────────────────────────────────────
function IsThisYou({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        background: dc.mintBg,
        border: `1px solid ${dc.faded}`,
        borderRadius: 20,
        padding: "5px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: dc.dark,
        marginBottom: 16,
      }}
    >
      Is this you? {text}
    </div>
  );
}

// ── Shared checklist / mistakes data ─────────────────────────────────────────
const DOCS = [
  {
    doc: "Purchase contract (or refi authorization)",
    note: "Fully executed. Wholesaler assignments need the assignment addendum.",
  },
  {
    doc: "1007 / 1025 appraisal with rent schedule",
    note: "A Form 1007 is commonly used as a market-rent reference; the applicable provider decides what documentation it requires.",
  },
  {
    doc: "12 months bank statements (all pages)",
    note: "Reserve and asset-treatment requirements vary by provider; verify them independently.",
  },
  {
    doc: "Credit report (tri-merge, ≤90 days)",
    note: "Credit-report treatment varies by provider and must be confirmed with an appropriately licensed professional.",
  },
  {
    doc: "Entity docs (LLC / Corp / Trust)",
    note: "Ownership and entity requirements vary by provider and jurisdiction; obtain legal advice where appropriate.",
  },
  {
    doc: "Insurance binder (hazard + liability)",
    note: "Confirm insurance requirements and coverage directly with an insurer and the relevant provider.",
  },
];

const MISTAKES = [
  {
    mistake: "Not vesting in an LLC",
    fix: "Entity-vs.-individual ownership can affect legal, tax, insurance, and financing considerations. Verify them before acting.",
  },
  {
    mistake: "Rate-shopping over weeks instead of days",
    fix: "Rate-shopping treatment varies by scoring model and timing. Ask the credit provider how multiple inquiries may be treated before applying.",
  },
  {
    mistake: "Down payment from a gift",
    fix: "Source-of-funds requirements vary. Confirm documentation requirements with the relevant provider before relying on funds.",
  },
  {
    mistake: "Outdated LLC operating agreement",
    fix: "Have entity documents reviewed and kept current by qualified legal advisers.",
  },
  {
    mistake: "Closing mid-month",
    fix: "Closing costs and timing vary. Obtain a written, verified estimate from the relevant parties before scheduling.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BorrowerProfilesPage({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "Who We Serve | Greenstreet Finance";
    // Deep-linked from the nav/footer segment links (/borrower-profiles#str-airbnb
    // etc.) — scroll to that section after first paint; otherwise start at top.
    const id = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (id) {
      const t = setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 90);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, []);

  // Smooth-scroll jump handler — interaction only, no page-load animation
  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const qualify = () => (window as any).openQualify?.();
  const calc = () => onNavigate("dscr-calculator");

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Apply for a DSCR loan →", view: "book-demo" }}
    >
      <style>{JUMP_NAV_CSS}</style>

      {/* ── HERO ── */}
      <section
        style={{
          background: dc.mintBg,
          color: dc.dark,
          padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,72px)`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              color: dc.rain,
              marginBottom: 18,
            }}
          >
            Who Greenstreet serves
          </div>
          <H1 style={{ margin: "0 0 18px", maxWidth: "22ch" }}>
            Find your path from property math to a DSCR loan request.
          </H1>
          {/* DSCR glossed on first use */}
          <Lead
            style={{
              color: "rgba(0,55,56,0.65)",
              maxWidth: "58ch",
              margin: "0 0 28px",
            }}
          >
            DSCR (Debt-Service Coverage Ratio) compares estimated property income
            with estimated debt service. Choose the investor profile that fits,
            review the planning considerations, then start a preliminary loan request.
          </Lead>

          {/* ── Jump-nav ── */}
          <nav aria-label="Jump to investor segment" className="bp-jumpnav">
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                className="bp-jumplink"
                onClick={() => jumpTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SEGMENT 1 — Buy-and-Hold Investors
      ══════════════════════════════════════════════════════════════ */}
      <SegSection id="buy-hold" label="Segment 01 · Buy-and-Hold Investors" bg={dc.cream}>
        <div className="bp-seg-grid">
          <div>
            <IsThisYou text="You own (or are buying) 1–10 long-term rentals and want to close without tax returns." />
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Buy-and-Hold Investors
            </h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
              A buy-and-hold scenario compares estimated rent with PITIA (Principal + Interest + Taxes + Insurance + HOA). It is a planning exercise, not a qualification test or a statement of available financing.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>Illustrative planning inputs</h3>
            <SpecTable
              rows={[
                { k: "Scenario type", v: "Buy-and-hold example" },
                { k: "Rate", v: "Illustrative assumption" },
                { k: "DSCR", v: "Planning metric" },
                { k: "LTV", v: "Input to verify" },
                { k: "Credit", v: "Input to verify" },
                { k: "Loan size", v: "Input to verify" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="A narrow cash-flow cushion can disappear when rent, vacancy, taxes, insurance, or HOA dues change. Stress-test more than one assumption." />
            <WatchOut text="Actual terms, pricing, appraisal treatment, and eligibility are not published or verified here; confirm them independently before acting." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Start my loan request →</button>
              <button className="bp-cta-ghost" onClick={calc}>Run DSCR Calculator</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Educational scenario only — not a quote, application, approval, or commitment.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <DscrGauge value={1.18} size={200} label={true} />
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.5)" }}>
              Illustrative buy-and-hold DSCR
            </div>
            <div
              style={{
                marginTop: 8,
                padding: "14px 18px",
                background: dc.mintBg,
                border: `1px solid ${dc.faded}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: dc.dark,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ display: "block", marginBottom: 4, fontSize: 12, letterSpacing: "0.03em", textTransform: "uppercase" as const, color: dc.rain }}>Entity tip</strong>
              Entity, ownership, and legal requirements vary. Confirm them with qualified legal and financing advisers before submitting anything.
            </div>
          </div>
        </div>
      </SegSection>

      {/* ══════════════════════════════════════════════════════════════
          SEGMENT 2 — Foreign Nationals
      ══════════════════════════════════════════════════════════════ */}
      <SegSection id="foreign-nationals" label="Segment 02 · Foreign Nationals" bg={dc.mintBg}>
        <div className="bp-seg-grid">
          <div>
            <IsThisYou text="You live outside the US, have no US credit file, and want to buy US rental property through an LLC." />
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Foreign Nationals{" "}
              <RiskFlame level="high" size={28} />
            </h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
              International-investor scenarios can involve different documentation, tax, currency, and legal considerations. This page does not state whether any provider offers a foreign-national product or what its requirements may be.
              <br /><br />
              <em>Foreign national</em> = non-US-citizen / non-permanent-resident investor with no ITIN or US-bureau credit file.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>Illustrative planning inputs</h3>
            <SpecTable
              rows={[
                { k: "Scenario type", v: "International example" },
                { k: "Rate", v: "Illustrative assumption" },
                { k: "DSCR", v: "Planning metric" },
                { k: "Cash", v: "Input to verify" },
                { k: "Documentation", v: "Input to verify" },
                { k: "Entity", v: "Input to verify" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut
              text="International transactions can add documentation, currency, tax, and timing risk. Obtain advice appropriate to the jurisdictions involved before committing funds."
              flame
            />
            <WatchOut
              text="Verify the receiving institution, transfer process, documentation, and fees directly with the relevant provider and advisers; this page does not publish those requirements."
              flame
            />
            <WatchOut text="Do not infer a rate, eligibility, or product availability from this example. Use only verified terms from an appropriately licensed provider." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Start my loan request →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("products")}>Explore planning examples</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Educational scenario only — not a quote, application, approval, or commitment.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div
              style={{
                padding: "20px",
                background: dc.dark,
                borderRadius: 12,
                border: `1px solid rgba(238,239,211,0.12)`,
                width: "100%",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 12 }}>
                Risk profile
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <RiskFlame level="high" size={22} />
                <span style={{ color: dc.cream, fontSize: 14, fontWeight: 600 }}>Higher complexity</span>
              </div>
              <div style={{ fontSize: 13, color: "rgba(238,239,211,0.6)", lineHeight: 1.55 }}>
                Provider availability and roles are not verified on this page. Confirm them directly with an appropriately licensed provider.
              </div>
            </div>
            <div
              style={{
                padding: "14px 16px",
                background: dc.mintBg,
                borderRadius: 8,
                border: `1px solid ${dc.faded}`,
                width: "100%",
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ display: "block", marginBottom: 4, fontSize: 12, letterSpacing: "0.03em", textTransform: "uppercase" as const, color: dc.rain }}>What "no-ratio" means</strong>
              This term can be used differently by providers. Do not treat this educational label as a statement of documentation, underwriting, or eligibility requirements.
            </div>
          </div>
        </div>
      </SegSection>

      {/* ══════════════════════════════════════════════════════════════
          SEGMENT 3 — STR / Airbnb Hosts
      ══════════════════════════════════════════════════════════════ */}
      <SegSection id="str-airbnb" label="Segment 03 · STR & Airbnb Hosts" bg={dc.cream}>
        <div className="bp-seg-grid">
          <div>
            <IsThisYou text="You run (or plan to run) a short-term rental on Airbnb, VRBO, or a booking platform in a seasonal market." />
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              STR &amp; Airbnb Hosts{" "}
              <RiskFlame level="med" size={26} />
            </h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
              STR (Short-Term Rental) income can swing month-to-month. Use conservative rent, vacancy, operating-cost, and tax assumptions when planning; this page does not state any provider's qualifying method or available product.
              <br /><br />
              State and municipal STR licensing rules vary sharply — check <button onClick={() => onNavigate("state-laws")} style={{ background: "none", border: "none", color: dc.rain, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 15 }}>State Rules</button> before you contract.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>Illustrative planning inputs</h3>
            <SpecTable
              rows={[
                { k: "Scenario type", v: "STR example" },
                { k: "Rate", v: "Illustrative assumption" },
                { k: "Rent", v: "Input to verify" },
                { k: "Revenue", v: "Input to verify" },
                { k: "LTV", v: "Input to verify" },
                { k: "Credit", v: "Input to verify" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut
              text="Seasonality can materially change actual cash flow. Test several revenue and expense cases rather than relying on a single projection."
              flame
            />
            <WatchOut text="HOA restrictions and local STR rules can change. Confirm current requirements with the relevant authority and association." />
            <WatchOut text="Confirm insurance coverage and exclusions directly with an insurer before relying on any rental-income plan." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Start my loan request →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("state-laws")}>Check state STR rules</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Educational scenario only — not a quote, application, approval, or commitment.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                background: dc.mintBg,
                borderRadius: 10,
                border: `1px solid ${dc.faded}`,
                padding: "18px 20px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 10 }}>
                How rent is calculated
              </div>
              {[
                { label: "Gross STR revenue (12-mo)", val: "$42,000", dim: false },
                { label: "75% qualifying haircut", val: "× 0.75", dim: true },
                { label: "Qualifying annual income", val: "$31,500", dim: false },
                { label: "Monthly qualifying rent", val: "$2,625", dim: false },
                { label: "PITIA (example)", val: "$2,400", dim: true },
                { label: "DSCR", val: "1.09x", dim: false },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: `1px solid ${dc.faded}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: row.dim ? "rgba(0,55,56,0.45)" : dc.dark, fontWeight: 500 }}>{row.label}</span>
                  <Mono style={{ fontSize: 13, fontWeight: 700, color: row.label === "DSCR" ? dc.rain : dc.dark }}>
                    {row.val}
                  </Mono>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(0,55,56,0.4)" }}>
              Example only — actual income varies.
            </div>
          </div>
        </div>
      </SegSection>

      {/* ══════════════════════════════════════════════════════════════
          SEGMENT 4 — Vacation & Second Homes
      ══════════════════════════════════════════════════════════════ */}
      <SegSection id="vacation" label="Segment 04 · Vacation & Second Homes" bg={dc.mintBg}>
        <div className="bp-seg-grid">
          <div>
            <IsThisYou text="You want to buy a vacation property you'll use part-time but rent out the rest of the year." />
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Vacation &amp; Second Homes
            </h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
              Vacation and second-home use can create distinct tax, insurance, HOA, local-rule, and financing questions. This page provides planning ideas only; it does not state a provider's underwriting approach or available financing.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>Illustrative planning inputs</h3>
            <SpecTable
              rows={[
                { k: "Scenario type", v: "Mixed-use example" },
                { k: "Rate", v: "Illustrative assumption" },
                { k: "DSCR", v: "Planning metric" },
                { k: "LTV", v: "Input to verify" },
                { k: "Credit", v: "Input to verify" },
                { k: "Use", v: "Input to verify" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="Personal use can affect tax, insurance, HOA, and financing treatment. Confirm the applicable rules before submitting anything." />
            <WatchOut text="Seasonal rental markets require conservative revenue assumptions. Do not infer any provider's treatment from this example." />
            <WatchOut text="Homeowners / vacation rental insurance must cover short-term rental activity. Personal umbrella policies generally don't extend to paying guests." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Start my loan request →</button>
              <button className="bp-cta-ghost" onClick={calc}>Model the DSCR →</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Educational scenario only — not a quote, application, approval, or commitment.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                padding: "18px 20px",
                background: dc.dark,
                borderRadius: 10,
                border: `1px solid rgba(238,239,211,0.12)`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 12 }}>
                Personal-use thresholds
              </div>
              {[
                { label: "≤ 14 days/yr personal use", pass: true },
                { label: "≤ 10% of total rental days", pass: true },
                { label: "> 14 days personal use", pass: false },
                { label: "No rental income at all", pass: false },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: `1px solid rgba(238,239,211,0.1)`,
                    fontSize: 13,
                    color: dc.cream,
                  }}
                >
                  <span style={{ color: item.pass ? "#4dbd97" : "#ff6b6b", fontWeight: 800 }}>
                    {item.pass ? "✓" : "✗"}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
            <div
              style={{
                padding: "12px 16px",
                background: dc.mintBg,
                borderRadius: 8,
                border: `1px solid ${dc.faded}`,
                fontSize: 13,
                color: "rgba(0,55,56,0.65)",
                lineHeight: 1.55,
              }}
            >
              This page does not determine product fit or state whether any provider offers financing for a vacation property.
            </div>
          </div>
        </div>
      </SegSection>

      {/* ══════════════════════════════════════════════════════════════
          SEGMENT 5 — Portfolio Builders
      ══════════════════════════════════════════════════════════════ */}
      <SegSection id="portfolio" label="Segment 05 · Portfolio Builders" bg={dc.cream}>
        <div className="bp-seg-grid">
          <div>
            <IsThisYou text="You already own multiple properties and want to compare them in one planning view." />
            <h2
              style={{
                fontSize: "clamp(26px,3vw,40px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Portfolio Builders
            </h2>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(0,55,56,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
              A portfolio view can help you compare estimated income, debt, and cash flow across properties. It is not an application, approval, underwriting result, or statement that multi-property financing is available.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>Illustrative planning inputs</h3>
            <SpecTable
              rows={[
                { k: "Scenario type", v: "Portfolio example" },
                { k: "Rate", v: "Illustrative assumption" },
                { k: "Loan size", v: "Input to verify" },
                { k: "Portfolio DSCR", v: "Planning metric" },
                { k: "LTV", v: "Input to verify" },
                { k: "Properties", v: "Input to verify" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="A blended metric can conceal a weak property. Review each property's downside scenario as well as the total." />
            <WatchOut text="Cross-collateralization can have material consequences. Seek legal and financing advice before accepting any such structure." />
            <WatchOut text="Entity and ownership structures can create legal and tax issues. Obtain professional advice before submitting a portfolio for financing." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Start my loan request →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("products")}>Explore planning examples</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Educational scenario only — not a quote, application, approval, or commitment.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <DscrGauge value={1.32} size={200} label={true} />
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(0,55,56,0.4)" }}>
              Illustrative blended portfolio DSCR
            </div>
            <div
              style={{
                padding: "16px 18px",
                background: dc.mintBg,
                borderRadius: 8,
                border: `1px solid ${dc.faded}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 10 }}>
                Why portfolio beats per-property
              </div>
              {[
                "One planning view for multiple properties",
                "Compare individual and blended assumptions",
                "Test thin-margin properties separately",
                "Verify any financing structure independently",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: 13, color: dc.dark, alignItems: "flex-start" }}>
                  <span style={{ color: dc.rain, fontWeight: 800, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SegSection>

      {/* ── PRE-CLOSE CHECKLIST ── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Pre-close checklist
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Organize a scenario-review checklist.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(0,55,56,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
              A document checklist can help organize due diligence, but actual requirements vary and are not published or verified here.
            </p>
          </div>

          <div className="bp-doc-grid">
            {DOCS.map((d) => (
              <div
                key={d.doc}
                style={{
                  padding: "clamp(16px,2vw,22px) clamp(16px,2vw,20px)",
                  background: dc.cream,
                  borderRadius: 8,
                  border: `1px solid ${dc.faded}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: dc.rain, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                  <div style={{ color: dc.dark, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                    {d.doc}
                  </div>
                </div>
                <div style={{ color: "rgba(0,55,56,0.6)", fontSize: 12, marginTop: 4, lineHeight: 1.55, paddingLeft: 21 }}>
                  {d.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMON MISTAKES ── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
          borderTop: `1px solid ${dc.faded}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 12,
              }}
            >
              Watch-outs
            </div>
            <h2
              style={{
                fontSize: "clamp(26px,3.2vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                margin: "0 0 14px",
              }}
            >
              Five planning issues to review before a transaction.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(0,55,56,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
              These surface on almost every submission desk. Check your file against each one before you submit.
            </p>
          </div>

          <div
            style={{
              background: dc.mintBg,
              borderRadius: 12,
              border: `1px solid ${dc.faded}`,
              padding: "8px clamp(20px,2.4vw,28px) 12px",
            }}
          >
            {MISTAKES.map((m, i) => (
              <div key={i} className="bp-mistake">
                <div style={{ color: dc.dark, fontWeight: 700, fontSize: 14, marginBottom: 7, letterSpacing: "-0.015em", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: dc.rain, fontWeight: 800, flexShrink: 0 }}>✗</span>
                  {m.mistake}
                </div>
                <p style={{ color: "rgba(0,55,56,0.65)", fontSize: 13, margin: "0 0 0 22px", lineHeight: 1.6 }}>
                  <strong style={{ color: dc.rain }}>Fix: </strong>
                  {m.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section
        style={{
          background: dc.dark,
          padding: `clamp(56px,7vw,88px) ${dc.pad}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              color: dc.lemon,
              marginBottom: 16,
            }}
          >
            Ready to check your deal?
          </div>
          <h2
            style={{
              fontSize: "clamp(28px,3.8vw,52px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: dc.cream,
              margin: "0 0 16px",
            }}
          >
            Model your deal assumptions.
          </h2>
          <p
            style={{
              fontSize: "clamp(15px,1.3vw,18px)",
              fontWeight: 500,
              lineHeight: 1.55,
              color: "rgba(238,239,211,0.65)",
              maxWidth: "46ch",
              margin: "0 auto 36px",
              letterSpacing: "-0.01em",
            }}
          >
            Enter property assumptions to build an educational DSCR scenario. It does not provide market pricing, a program match, a quote, an approval, or a financing commitment.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={qualify}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                padding: "15px 30px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Start my loan request →
            </button>
            <button
              onClick={calc}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "transparent",
                color: dc.cream,
                fontWeight: 600,
                fontSize: 16,
                border: `1px solid rgba(238,239,211,0.3)`,
                cursor: "pointer",
                padding: "15px 26px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Run the DSCR Calculator
            </button>
          </div>
          <p style={{ fontSize: 12, color: "rgba(238,239,211,0.35)", marginTop: 16 }}>
            Educational scenario only — not a quote, application, approval, or commitment. Verify actual financing facts with an appropriately licensed provider.
          </p>
        </div>
      </section>
    </DcShell>
  );
}
