import React, { useEffect, useRef, useState } from "react";
import { DcShell, dc, Mono, H1, Lead, useRevealOnView } from "../design/dc";
import BottomCTA from "../design/BottomCTA";
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
  .bp-jumplink { font-size: 12px; padding: 6px 11px; }
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
    note: "The Form 1007 establishes the market rent Greenstreet uses to compute DSCR — a lease alone isn't enough.",
  },
  {
    doc: "12 months bank statements (all pages)",
    note: "Liquid reserves post-closing. Retirement accounts count at 70% if age 59½+; crypto is $0.",
  },
  {
    doc: "Credit report (tri-merge, ≤90 days)",
    note: "Medical collections usually ignored; recent 30-day lates flag underwriting.",
  },
  {
    doc: "Entity docs (LLC / Corp / Trust)",
    note: "All owners ≥51% on the loan. Max 4 owners in the borrowing entity.",
  },
  {
    doc: "Insurance binder (hazard + liability)",
    note: "Lender = loss payee on hazard. STRs require commercial liability, not personal homeowners.",
  },
];

const MISTAKES = [
  {
    mistake: "Not vesting in an LLC",
    fix: "Most DSCR programs require entity vesting. Going individual adds 25–50 bps and can disqualify business-purpose loans.",
  },
  {
    mistake: "Rate-shopping over weeks instead of days",
    fix: "Multiple mortgage inquiries within a 14-day window count as one pull under FICO. Compress all requests into that window.",
  },
  {
    mistake: "Down payment from a gift",
    fix: "Some programs accept gift funds with a 2-year donor letter; cash-out proceeds from another property are cleaner.",
  },
  {
    mistake: "Outdated LLC operating agreement",
    fix: "Add a 'real estate investment' purpose clause. Stale OAs slow underwriting by days.",
  },
  {
    mistake: "Closing mid-month",
    fix: "Per-diem interest from the 25th to month-end can cost $300–500. Aim for the 1st–5th.",
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
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Get a preliminary estimate →", view: "dscr-calculator" }}
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
            Direct DSCR lending for every type of real estate investor.
          </H1>
          {/* DSCR glossed on first use */}
          <Lead
            style={{
              color: "rgba(0,55,56,0.65)",
              maxWidth: "58ch",
              margin: "0 0 28px",
            }}
          >
            DSCR (Debt-Service Coverage Ratio) loans qualify on what the property earns — not your W-2. Greenstreet is the direct lender: no broker markup, no middleman, one underwriting desk. Pick your investor segment below.
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
              The workhorse of DSCR lending. You hold the property, a tenant covers PITIA (Principal + Interest + Taxes + Insurance + HOA), and we qualify on that monthly ratio — zero income docs. Standard 30-year fixed or 5/1 ARM (adjustable-rate mortgage — fixed for 5 years, then resets).
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>What you qualify on</h3>
            <SpecTable
              rows={[
                { k: "Program", v: "DSCR 1-4 Standard" },
                { k: "Rate range", v: "6.75 – 7.25%" },
                { k: "DSCR minimum", v: "≥ 1.00x" },
                { k: "LTV", v: "≤ 80%" },
                { k: "FICO", v: "660+" },
                { k: "Loan size", v: "$75K – $3.5M" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="DSCR of exactly 1.00x sits at the threshold — a vacancy month or HOA increase flips you sub-1.0. We have a sub-1.0 program, but pricing steps up ~50 bps. Know your cushion before you lock." />
            <WatchOut text="LTV pricing bands are firm at 75% and 80%. A deal at 81% costs 25–50 bps more; appraisals that come in light can move you across a band." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Get a preliminary estimate →</button>
              <button className="bp-cta-ghost" onClick={calc}>Run DSCR Calculator</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Preliminary estimate only — not a commitment to lend.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <DscrGauge value={1.18} size={200} label={true} />
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 500, color: "rgba(0,55,56,0.5)" }}>
              Typical buy-and-hold DSCR
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
              Vest in an LLC before submitting. Individual vesting adds 25–50 bps and removes business-purpose protections.
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
              Greenstreet's DSCR Global program is a no-ratio DSCR product — meaning income is not documented or used in underwriting at all. Qualification rests entirely on the property's rent-to-PITIA ratio, your passport ID, and a larger down payment.
              <br /><br />
              <em>Foreign national</em> = non-US-citizen / non-permanent-resident investor with no ITIN or US-bureau credit file.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>What you qualify on</h3>
            <SpecTable
              rows={[
                { k: "Program", v: "DSCR Global (no-ratio)" },
                { k: "Rate range", v: "7.50 – 8.25%" },
                { k: "DSCR minimum", v: "≥ 1.00x" },
                { k: "Down payment", v: "30% minimum" },
                { k: "Credit", v: "Passport + alt reference" },
                { k: "LLC required", v: "Yes" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut
              text="30% down is the floor — some loan sizes and markets push to 35%. Have reserves verified before you engage an attorney or wire an earnest-money deposit."
              flame
            />
            <WatchOut
              text="Wire transfer of the down payment from a foreign account triggers Bank Secrecy Act sourcing requirements. Allow 10–15 business days for funds verification; budget wire fees of $50–200 per transfer."
              flame
            />
            <WatchOut text="Rate premium vs. a US-citizen buyer is typically 75–100 bps. Factor that into your DSCR math before contracting." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Get a preliminary estimate →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("lender-intel")}>See rate intel</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Preliminary estimate only — not a commitment to lend.
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
                Fewer lenders offer this program. Greenstreet underwrites it directly — no broker layering, no referral to a third-party correspondent.
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
              No-ratio DSCR = your personal income is never entered into underwriting. The property's gross rent ÷ PITIA is the only income metric. Your passport replaces a US credit report.
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
              STR (Short-Term Rental) income swings month-to-month. Greenstreet's DSCR — STR program uses the <em>Form 1007 rent schedule</em> as a qualifying floor, then applies a 75% haircut to the trailing 12-month revenue history. The lower of the two sets your DSCR.
              <br /><br />
              State and municipal STR licensing rules vary sharply — check <button onClick={() => onNavigate("state-laws")} style={{ background: "none", border: "none", color: dc.rain, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 15 }}>State Rules</button> before you contract.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>What you qualify on</h3>
            <SpecTable
              rows={[
                { k: "Program", v: "DSCR — STR" },
                { k: "Rate range", v: "7.10 – 7.75%" },
                { k: "Qualifying rent", v: "1007 schedule floor" },
                { k: "Revenue haircut", v: "75% of 12-mo history" },
                { k: "LTV", v: "≤ 75%" },
                { k: "FICO", v: "660+" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut
              text="Seasonality risk: a beach cottage in the off-season might carry a DSCR of 0.6x — well below 1.00. Underwriting uses the annual average, but your cash flow doesn't. Build 3–4 months of reserves."
              flame
            />
            <WatchOut text="HOA restrictions and local STR permit bans can void your income model mid-loan. Confirm permit status and HOA bylaws before appraisal." />
            <WatchOut text="Insurance: standard homeowners policies exclude STR commercial activity. You need a hybrid or commercial landlord policy — and it must be in place before close." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Get a preliminary estimate →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("state-laws")}>Check state STR rules</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Preliminary estimate only — not a commitment to lend.
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
              Vacation and second-home properties straddle two underwriting worlds: if you plan to rent it out, we structure it as an investment/DSCR loan rather than a second-home conventional loan — which means no personal income docs, but rental income must cover PITIA. Mixed personal-use/rental is allowed; occupancy averaging applies.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>What you qualify on</h3>
            <SpecTable
              rows={[
                { k: "Program", v: "DSCR 1-4 / DSCR STR" },
                { k: "Rate range", v: "7.00 – 7.75%" },
                { k: "DSCR minimum", v: "≥ 1.00x (rental days)" },
                { k: "LTV", v: "≤ 75%" },
                { k: "FICO", v: "660+" },
                { k: "Personal-use days", v: "Up to 14 days/yr or 10%" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="Personal-use exceeding 14 days or 10% of rental days may reclassify the loan to a second-home or primary product — which re-introduces income documentation. Confirm occupancy intent before submitting." />
            <WatchOut text="Seasonal rental markets (ski, beach) carry the same revenue-haircut rules as STR. If the property is listed on Airbnb/VRBO, the STR program applies." />
            <WatchOut text="Homeowners / vacation rental insurance must cover short-term rental activity. Personal umbrella policies generally don't extend to paying guests." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Get a preliminary estimate →</button>
              <button className="bp-cta-ghost" onClick={calc}>Model the DSCR →</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Preliminary estimate only — not a commitment to lend.
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
              Greenstreet underwrites both DSCR-standard and DSCR-STR programs for vacation properties — we pick the fit at intake, no second desk.
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
            <IsThisYou text="You already own 10+ doors and need one underwriting desk, bulk terms, or a blanket cross-collateral structure." />
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
              Once you cross 10 doors, conventional financing stops scaling. Greenstreet's DSCR Portfolio / Blanket program underwrites 2–20 properties in a single loan — one approval, one close, one monthly payment. DSCR is assessed at the portfolio level: a strong property offsets a thin-margin one.
            </p>

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, marginBottom: 8 }}>What you qualify on</h3>
            <SpecTable
              rows={[
                { k: "Program", v: "DSCR Portfolio / Blanket" },
                { k: "Rate range", v: "6.99 – 7.50%" },
                { k: "Loan size", v: "Up to $25M" },
                { k: "Portfolio DSCR", v: "≥ 1.25x (blended)" },
                { k: "LTV", v: "≤ 75%" },
                { k: "Doors", v: "2 – 20 in one note" },
              ]}
            />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: dc.dark, margin: "20px 0 8px" }}>What to watch</h3>
            <WatchOut text="Blended DSCR of 1.25x is the portfolio floor. One under-performing property drags the blended figure. Bring rent rolls for every address before the pre-qual call." />
            <WatchOut text="Cross-collateralization means all properties secure the loan jointly. Selling one door mid-term requires a release price (typically 110–115% of that property's allocated loan balance)." />
            <WatchOut text="Entity structure matters at scale. Multi-member LLCs with side partners can stall underwriting. Consolidate ownership structure before submitting a portfolio package." />

            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="bp-cta" onClick={qualify}>Get a preliminary estimate →</button>
              <button className="bp-cta-ghost" onClick={() => onNavigate("lender-intel")}>Portfolio rate intel</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(0,55,56,0.4)", marginTop: 8 }}>
              Preliminary estimate only — not a commitment to lend.
            </p>
          </div>

          {/* Visual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <DscrGauge value={1.32} size={200} label={true} />
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(0,55,56,0.4)" }}>
              Target blended portfolio DSCR
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
                "One credit pull, one approval",
                "One closing — not 10",
                "Blended DSCR absorbs thin-margin doors",
                "Up to $25M in a single note",
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
              What Greenstreet needs from you.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(0,55,56,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
              No W-2s or tax returns — but DSCR loans do have a document list. Have these ready before you submit.
            </p>
          </div>

          <div className="bp-doc-grid">
            {DOCS.map((d) => (
              <div
                key={d.doc}
                style={{
                  padding: "clamp(16px,2vw,22px) clamp(16px,2vw,20px)",
                  background: "rgba(238,239,211,0.06)",
                  borderRadius: 8,
                  border: `1px solid rgba(238,239,211,0.12)`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: dc.emerald, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                  <div style={{ color: dc.cream, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                    {d.doc}
                  </div>
                </div>
                <div style={{ color: "rgba(238,239,211,0.6)", fontSize: 12, marginTop: 4, lineHeight: 1.55, paddingLeft: 21 }}>
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
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(48px,6vw,72px) ${dc.pad}`,
          borderTop: `1px solid rgba(238,239,211,0.08)`,
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
                color: dc.lemon,
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
                color: dc.cream,
              }}
            >
              Five mistakes that slow or kill a DSCR closing.
            </h2>
            <p style={{ fontSize: "clamp(15px,1.25vw,17px)", fontWeight: 500, color: "rgba(238,239,211,0.62)", margin: 0, lineHeight: 1.6, maxWidth: "56ch" }}>
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
            See if your deal qualifies.
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
            Enter your property details and get a preliminary DSCR estimate, rate range, and program match — no income docs, no commitment, result in under two minutes.
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
              Get a preliminary estimate →
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
          <p style={{ fontSize: 12, color: "rgba(238,239,211,0.56)", marginTop: 16 }}>
            Preliminary estimate only — not a commitment to lend. Submit a scenario review for full pre-qualification.
          </p>
        </div>
      </section>
      <BottomCTA onNavigate={onNavigate} />
    </DcShell>
  );
}
