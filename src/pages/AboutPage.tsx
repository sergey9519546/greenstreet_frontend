import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, ScenePhoto } from "../design/dc";

// ── Static data ───────────────────────────────────────────────────────────────

// Role-only — no invented names. We don't publish fabricated bios/headshots
// for real people (especially compliance roles) on a regulated lending site.
const TEAM = [
  { id: "team-1", mark: "CE", role: "Cofounder & CEO" },
  { id: "team-2", mark: "HQ", role: "Cofounder & Head of Quant" },
  { id: "team-3", mark: "HL", role: "Head of Lending" },
  { id: "team-4", mark: "HC", role: "Head of Compliance" },
  { id: "team-5", mark: "SE", role: "Staff Engineer, Engine" },
  { id: "team-6", mark: "PD", role: "Product Designer" },
  { id: "team-7", mark: "AE", role: "Account Executive" },
  { id: "team-8", mark: "CC", role: "Compliance Counsel" },
];

const JOBS = [
  { title: "Senior Quant Engineer" },
  { title: "Full-Stack Engineer, Tools" },
  { title: "Compliance Counsel — State Rules" },
  { title: "Account Executive, Investor Relations" },
];

const VALUES = [
  { heading: "Speed is the product",                    body: "A deal that stalls at pricing costs your borrower real money. We built the engine to give you a defensible number in seconds — not a spreadsheet round-trip or a call to the lender." },
  { heading: "No black boxes",                          body: "Every figure Greenstreet produces is computed by versioned code with a statutory citation behind every rule — never an AI-generated estimate. When a regulator asks where a number came from, we hand them the source." },
  { heading: "Your borrower stays yours",               body: "We are a software platform, not a lender, not a referral marketplace. We never touch your client relationship, share your pipeline data, or take a cut of your deal. Your business is yours." },
  { heading: "Compliance is a feature, not a footnote", body: "State prepayment-penalty rules, DSCR floors, seasoning requirements — baked into every output from the start, not an afterthought appended to a printout after the fact." },
];

// ── Scoped styles ─────────────────────────────────────────────────────────────
// Light-nav (lemon) override mirrors DealAnalyzerPage's pistachio pattern.
// Job-row hover + CTA card lift are the only motion permitted (per design rules).
const ABOUT_CSS = `
  /* Lemon nav: swap all text to dark ink */
  .dc-nav a { color: rgba(0,55,56,0.72) !important; }
  .dc-nav a.dc-cta { background: #003738 !important; color: #eeefd3 !important; }
  .dc-nav { border-bottom: 1px solid rgba(0,55,56,0.15) !important; background: rgba(216,217,88,1) !important; }
  /* Lemon footer: dark wordmark */
  footer { color: rgba(0,55,56,0.55) !important; }
  footer .gs-footer-word { color: #003738 !important; }
  /* Job-row hover */
  .ab-job { transition: transform .14s, background .15s; }
  .ab-job:hover { transform: translateX(6px); background: #003738 !important; }
  .ab-job:hover .ab-jt { color: #eeefd3 !important; }
  .ab-job:hover .ab-ja { color: #d8d958 !important; }
  /* CTA card lift */
  .cta-card { transition: transform .15s; }
  .cta-card:hover { transform: translateY(-4px); }
  /* Team grid: 4-col desktop → 2-col mobile */
  .ab-team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
  @media (max-width: 767px) { .ab-team-grid { grid-template-columns: repeat(2, 1fr); } }
  /* Values, Jobs, CTA 2-col grids → single col on mobile */
  .ab-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .ab-jobs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px,5vw,72px); align-items: start; }
  .ab-cta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 991px) {
    .ab-2col { grid-template-columns: 1fr !important; }
    .ab-jobs-grid { grid-template-columns: 1fr !important; }
    .ab-cta-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage({
  onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate: (v: any) => void;
}) {
  useEffect(() => {
    document.title = "About | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.lemon}
      navLinks={[
        { label: "Product",  view: "products" },
        { label: "Careers",  view: "careers" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      <style>{ABOUT_CSS}</style>

      {/* ── HERO — solid lemon, dark ink ──────────────────────────────────── */}
      <section
        style={{
          background: dc.lemon,
          color: dc.dark,
          padding: `clamp(64px,9vh,128px) ${dc.pad}`,
          overflow: "hidden",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: 1080, margin: "0 auto" }}>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              color: "rgba(0,55,56,0.55)",
              marginBottom: 24,
            }}
          >
            About Greenstreet
          </div>

          {/* H1 */}
          <H1 style={{ margin: "0 0 28px", maxWidth: "24ch" }}>
            The DSCR underwriting platform real estate investors trust.
          </H1>

          {/* Subtitle */}
          <Lead
            style={{
              color: "rgba(0,55,56,0.72)",
              maxWidth: "54ch",
              margin: "0 0 36px",
            }}
          >
            DSCR loans let rental-property owners qualify on the property's rent —
            not their personal income. Greenstreet is the software platform that
            makes that process fast, accurate, and defensible. Founded by a broker
            and a quant who watched good deals die at the lender because the math
            was wrong. We built the engine we wished existed: deterministic,
            provenance-tracked, every line citable.
          </Lead>

          {/* Hero meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: "rgba(0,55,56,0.5)",
                  marginBottom: 4,
                }}
              >
                Founded in
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
                2026
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: "rgba(0,55,56,0.5)",
                  marginBottom: 4,
                }}
              >
                Headquartered in
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
                Austin, Texas
              </div>
            </div>
          </div>

          {/* Hero CTA row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.dark,
                color: dc.cream,
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                padding: "13px 26px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Check my deal's DSCR →
            </button>
            <button
              onClick={() => onNavigate("rate-quiz")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: "rgba(0,55,56,0.75)",
                fontWeight: 600,
                fontSize: 15,
                border: "1px solid rgba(0,55,56,0.25)",
                cursor: "pointer",
                padding: "13px 22px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              Book a 15-min demo
            </button>
          </div>
        </div>
      </section>

      <ScenePhoto
        src="/img/generated/scenes/office-window-team.png"
        alt="The Greenstreet underwriting team reviewing deals at a desk"
        eyebrow="One desk, every deal"
        caption="A broker and a quant — and the team that prices, structures, and funds each file."
        style={{ background: dc.cream }}
      />

      {/* ── VISION — two stacked 2-col blocks ────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
        }}
      >
        <div
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(48px,6vw,80px)",
          }}
        >
          {/* Row 1: Our Vision */}
          <div
            className="gs-reveal dc-band-2"
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.2fr",
              gap: "clamp(28px,4vw,72px)",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: dc.rain,
                  marginBottom: 14,
                }}
              >
                Our Vision
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px,3.4vw,46px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.04,
                  margin: 0,
                }}
              >
                Materially better real-estate lending.
              </h2>
            </div>
            <p
              style={{
                fontSize: "clamp(17px,1.4vw,21px)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "rgba(0,55,56,0.72)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              In 2026 we founded Greenstreet after watching, first-hand, how hard
              it had become for investors to price DSCR deals that actually held at
              the lender — and how often investors signed on deals where the
              numbers hadn't been run correctly. We went back to the drawing board
              on rental-loan software and built the engine we wished existed:
              deterministic, provenance-tracked, defensible to a regulator on every
              line.
            </p>
          </div>

          {/* Row 2: Our Commitment */}
          <div
            className="gs-reveal dc-band-2"
            style={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.2fr",
              gap: "clamp(28px,4vw,72px)",
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: dc.rain,
                  marginBottom: 14,
                }}
              >
                Our Commitment
              </div>
              <h2
                style={{
                  fontSize: "clamp(22px,3.4vw,46px)",
                  fontWeight: 600,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.04,
                  margin: 0,
                }}
              >
                To the{" "}
                <span style={{ color: dc.rain }}>people</span>{" "}
                who close the deal.
              </h2>
            </div>
            <p
              style={{
                fontSize: "clamp(17px,1.4vw,21px)",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "rgba(0,55,56,0.72)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Investors and the borrowers behind every deal deserve the same math
              an institution runs. Every figure Greenstreet produces is computed by
              versioned code with a statutory citation behind every rule — never an
              AI-generated estimate. When a regulator, a lender, or a borrower asks
              where a number came from, we hand them the source.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES — 4 principles, 2-col card grid ────────────────────────── */}
      <section
        style={{
          background: dc.mintBg,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="gs-reveal" style={{ marginBottom: "clamp(36px,5vw,56px)" }}>
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
              What we believe
            </div>
            <h2
              style={{
                fontSize: "clamp(22px,3.5vw,48px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                margin: 0,
                maxWidth: "22ch",
              }}
            >
              Four principles that drive every product decision.
            </h2>
          </div>

          <div className="gs-reveal ab-2col">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="ix-card"
                style={{
                  background: dc.cream,
                  borderRadius: dc.r.md,
                  border: `1px solid ${dc.faded}`,
                  padding: "clamp(24px,3vw,36px)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(17px,1.6vw,21px)",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    color: dc.dark,
                    marginBottom: 10,
                    lineHeight: 1.15,
                  }}
                >
                  {v.heading}
                </div>
                <p
                  style={{
                    fontSize: "clamp(14px,1.1vw,16px)",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color: "rgba(0,55,56,0.65)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM — dark band, 4-col card grid ───────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(56px,7vw,96px) ${dc.pad}`,
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div
            className="gs-reveal"
            style={{
              textAlign: "center",
              marginBottom: "clamp(40px,5vw,64px)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                marginBottom: 16,
              }}
            >
              Our team
            </div>
            <h2
              style={{
                fontSize: "clamp(24px,5vw,76px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                margin: "0 auto",
                maxWidth: "18ch",
              }}
            >
              The disciplines behind the engine.
            </h2>
          </div>

          <div className="gs-reveal ab-team-grid">
            {TEAM.map((m) => (
              <div key={m.id}>
                {/* Monogram — a functional mark for the discipline, not a person's initials */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    aspectRatio: "1",
                    marginBottom: 14,
                    borderRadius: 9,
                    background: dc.teal,
                    border: "1px solid rgba(238,239,211,0.10)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: dc.sans,
                      fontSize: "clamp(22px,3.5vw,42px)",
                      fontWeight: 600,
                      letterSpacing: "-0.03em",
                      color: dc.lemon,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {m.mark}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: dc.cream,
                  }}
                >
                  {m.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOBS — 2-col: list left / blurb right ───────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(64px,8vw,112px) ${dc.pad}`,
        }}
      >
        <div
          className="gs-reveal ab-jobs-grid"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
          }}
        >
          {/* Left: job list */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                color: dc.rain,
                marginBottom: 14,
              }}
            >
              Open roles
            </div>
            <h2
              style={{
                fontSize: "clamp(24px,4vw,56px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                margin: "0 0 28px",
              }}
            >
              Come build the engine with us.
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {JOBS.map((j, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate("careers")}
                  className="ab-job"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "center",
                    background: dc.mintBg,
                    borderRadius: 9,
                    padding: "18px 22px",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    fontFamily: dc.sans,
                    width: "100%",
                  }}
                >
                  <span
                    className="ab-jt"
                    style={{
                      fontSize: "clamp(16px,1.7vw,19px)",
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      color: dc.dark,
                    }}
                  >
                    {j.title}
                  </span>
                  <span
                    className="ab-ja"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: dc.rain,
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    Apply →
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate("careers")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.dark,
                color: dc.mintBg,
                fontWeight: 600,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                padding: "13px 26px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              All jobs →
            </button>
          </div>

          {/* Right: blurb + visual placeholder */}
          <div>
            <p
              style={{
                fontSize: "clamp(18px,1.7vw,26px)",
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: "-0.03em",
                color: dc.dark,
                margin: "0 0 24px",
              }}
            >
              We're building a generational company in DSCR lending — and always
              looking for talent to propel the mission.
            </p>
            {/* Branded wordmark panel — intentional, no unfinished placeholder */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                width: "100%",
                aspectRatio: "1.67",
                borderRadius: 12,
                background: dc.dark,
                border: "1px solid rgba(0,55,56,0.10)",
              }}
            >
              <span
                style={{
                  fontFamily: dc.sans,
                  fontSize: "clamp(22px,3.5vw,48px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  color: dc.lemon,
                  lineHeight: 1,
                }}
              >
                Greenstreet
              </span>
              <span
                style={{
                  fontFamily: dc.sans,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "rgba(238,239,211,0.62)",
                }}
              >
                Austin, Texas · Est. 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA — two cards ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: `clamp(48px,6vw,80px) ${dc.pad} clamp(64px,8vw,104px)`,
        }}
      >
        <div
          className="gs-reveal ab-cta-grid"
          style={{
            maxWidth: dc.maxW,
            margin: "0 auto",
          }}
        >
          {/* Card 1: Demo */}
          <button
            onClick={() => onNavigate("rate-quiz")}
            className="cta-card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 40,
              background: dc.dark,
              color: dc.cream,
              borderRadius: dc.r.lg,
              padding: "clamp(32px,4vw,52px)",
              border: "none",
              cursor: "pointer",
              textAlign: "left" as const,
              minHeight: 240,
              fontFamily: dc.sans,
            }}
          >
            <div
              style={{
                fontSize: "clamp(20px,2.6vw,34px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
                color: dc.cream,
              }}
            >
              See Greenstreet run a real deal — live, 15 minutes.
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 600,
                fontSize: 15,
                padding: "13px 24px",
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              Book a walkthrough →
            </span>
          </button>

          {/* Card 2: Contact — anchor makes the phone number a real tap target */}
          <a
            href="/book-demo"
            className="cta-card"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 40,
              background: dc.rain,
              color: dc.cream,
              borderRadius: dc.r.lg,
              padding: "clamp(32px,4vw,52px)",
              minHeight: 240,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: "clamp(20px,2.6vw,34px)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
                color: dc.cream,
              }}
            >
              Talk to a specialist — not a form.
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: dc.lemon,
                fontWeight: 700,
                fontSize: "clamp(19px,2.6vw,32px)",
                fontFamily: dc.mono,
                letterSpacing: "-0.03em",
                alignSelf: "flex-start",
              }}
            >
              Book a scenario review
            </span>
          </a>
        </div>
      </section>
    </DcShell>
  );
}
