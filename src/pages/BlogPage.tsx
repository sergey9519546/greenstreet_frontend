import React, { useState, useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

// ── Pistachio editorial identity ───────────────────────────────────────────────
// Accent matches mockup: #eeefd3 nav + footer, dark-ink overrides on .dc-nav
const BL_ACCENT = "#eeefd3";
const BL_NAV_BORDER = "1px solid rgba(0,55,56,0.15)";

const BL_CSS = `
.bl-card { transition: transform .14s; }
.bl-card:hover { transform: translateY(-4px); }
/* Light-nav override: links + wordmark use dark ink on pistachio bg */
.dc-nav a { color: rgba(0,55,56,0.72) !important; }
.dc-nav a.dc-cta { background: #003738 !important; color: #eeefd3 !important; }
.dc-nav { border-bottom: ${BL_NAV_BORDER} !important; background: rgba(238,239,211,0.92) !important; backdrop-filter: blur(12px); }
/* footer ink on pistachio footer */
footer { color: rgba(0,55,56,0.55) !important; }
footer div[style] { color: #003738 !important; }
`;

// ── Post data (all existing posts preserved) ──────────────────────────────────
export const POSTS = [
  {
    slug: "obbba-2025-real-estate-tax-changes",
    date: "June 23, 2026", tag: "Tax",
    title: "OBBBA 2025: Three tax changes every real estate investor needs to know",
    summary: "QBI deduction bumped to 23%, §179 locked at $2,560,000, and 100% bonus depreciation made permanent. Three numbers that change how DSCR deals pencil after-tax.",
    body: [
      { p: "The One Big Beautiful Bill Act (P.L. 119-21, signed July 4, 2025) rewrote several key tax provisions that directly affect real estate investors. Three changes stand out for anyone buying, financing, or modeling DSCR deals in 2026." },
      { h: "QBI deduction goes from 20% to 23%" },
      { p: "Under TCJA, qualifying business income from a pass-through entity — including rental income structured through an LLC — received a 20% deduction under §199A. OBBBA §70411 raised that to 23% for tax years beginning after December 31, 2025. It also made the deduction permanent and inflation-indexed under §199A(i), eliminating the TCJA sunset that was scheduled to expire at year-end 2025." },
      { p: "On a real deal: if you're netting $60,000 in rental income through an LLC and you qualify under the income thresholds, the QBI deduction went from $12,000 to $13,800. Stacked with depreciation on a new acquisition, the after-tax cash-on-cash number shifts meaningfully. Run your file before you quote a client an after-tax IRR — the number changed in 2026." },
      { h: "§179 expensing: exactly $2,560,000 in 2026" },
      { p: "IRS Rev. Proc. 2025-32 §4.24 sets the §179 expensing limit at exactly $2,560,000 for 2026, with a phaseout beginning at $4,090,000 and an SUV cap of $32,000. §179 lets you expense depreciable personal property — fixtures, appliances, HVAC, certain building components — in the year of acquisition rather than depreciating over 27.5 years. For a large acquisition or value-add play, §179 is the first lever to pull before bonus depreciation." },
      { h: "100% bonus depreciation is permanent" },
      { p: "TCJA's 100% bonus depreciation was phasing down — 80% in 2023, 60% in 2024, 40% in 2025. OBBBA reversed the phasedown and restored 100% permanently. Combined with a cost segregation study — which reclassifies building components from 27.5-year residential property into 5-, 7-, and 15-year personal or land-improvement property — this means a DSCR investor can accelerate a substantial portion of the building's cost basis into year-one deductions." },
      { h: "What it means on a DSCR acquisition" },
      { list: [
        "QBI at 23%: model the higher deduction in your after-tax IRR. The difference between 20% and 23% is not enormous on a single deal, but it's persistent across a portfolio.",
        "Use §179 before bonus depreciation: §179 is capped at your business income and doesn't create a net operating loss by itself. Apply it first on tangible personal property to get the guaranteed deduction, then let bonus depreciation handle the rest.",
        "Bonus dep + cost segregation: a cost segregation study on a $500K acquisition might reclassify $75–$100K into accelerated categories. At 100% bonus dep, that's a $75–$100K year-one deduction that directly offsets rental income — if you qualify under the passive activity loss rules.",
      ]},
      { p: "These provisions interact with §469 passive activity loss rules and the 3.8% net investment income tax. Not every investor can use them all in the acquisition year. Real estate professionals, short-term rental operators with material participation, and high-income investors who hit the PAL exception each face a different outcome. Confirm with a CPA before booking the benefit into your model." },
      { quote: "The tax code stopped shrinking. 23% QBI, $2.56M §179, 100% bonus dep — all permanent. The after-tax math on DSCR acquisitions changed in 2026." },
    ],
    // mockup glyph metadata
    glyph: "%", glyphColor: dc.dark, bg: dc.lemon,
    author: "Priya Rao",
    featured: false,
  },
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026", tag: "Compliance",
    title: "MN HF 3437 enacted: DSCR loans now business-purpose in Minnesota",
    summary: "After a long fight, business-purpose DSCR loans are legal in MN as of August 1, 2026. Consumer loans still prohibited under §58.137.",
    body: [
      { p: "Minnesota spent years as one of the hardest states to close a DSCR loan in. HF 3437, signed April 23, 2026 and effective August 1, 2026, finally draws a clean line: business-purpose DSCR loans are explicitly allowed; consumer-purpose loans remain prohibited under Minn. Stat. §58.137." },
      { h: "What changed" },
      { list: [
        "Business-purpose investment-property loans can now carry prepayment penalties in MN, ending the entity-only workaround most lenders relied on.",
        "Consumer-purpose loans are still banned from PPPs — the business-purpose affidavit on every file matters more than ever.",
        "Effective date is August 1, 2026. Deals locking before then should still be structured under the old entity rules.",
      ]},
      { h: "What to do on a MN file" },
      { p: "Document business purpose tightly: LLC vesting, a signed business-purpose certification, and a property that is clearly non-owner-occupied. Get that right and MN is now a normal-rate state instead of a structuring headache." },
      { quote: "The affidavit is the deal. In MN it always was — now it's in statute." },
    ],
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Sara López",
    featured: false,
  },
  {
    slug: "qoz-qrof-permanent-obbba",
    date: "June 21, 2026", tag: "Tax",
    title: "QOZ and QROF: what the OBBBA did to Opportunity Zone investing",
    summary: "OBBBA §70431 made Opportunity Zones permanent and created a QROF rural tier with a 30% basis step-up. The December 31, 2026 clock still matters for pre-2027 investors.",
    body: [
      { p: "Qualified Opportunity Zones were set to expire under TCJA. OBBBA §70431 (Public Law 119-21, signed July 4, 2025) made them permanent — with restructured incentives and a new rural tier. Here's what changed and what didn't." },
      { h: "What OBBBA §70431 changed" },
      { list: [
        "QOZ designation is now permanent. The decennial redesignation cycle begins July 1, 2026, with tighter criteria: 70% AMI vs the old 80% threshold, and no contiguous tract workaround.",
        "Post-2026 investments get a simplified structure: 5-year deferral from investment date + 10% basis step-up at year 5. The 7-year/15% tier is gone.",
        "QROF (Qualified Rural Opportunity Fund) is a new rural tier: rural QOZs offer a 30% step-up at year 5 instead of 10% — a substantial incentive differential for rural markets.",
        "30-year FMV basis freeze: if you hold an OZ investment for 30 years, basis adjusts to fair market value, eliminating the tax liability on very long holds.",
      ]},
      { h: "The December 31, 2026 cliff for pre-2027 investors" },
      { p: "If you invested before OBBBA — pre-2027 vintage — the old rules still govern your deferral. The deferred gain is included in income on the earlier of (a) a qualifying inclusion event, or (b) December 31, 2026. That cliff is now less than six months away. Pre-2027 investors need to be in a conversation with their CPA now about year-end planning." },
      { h: "QROF: the rural arbitrage" },
      { p: "A 30% step-up vs 10% is a meaningful incentive differential. Rural QOZ deals with SFR or small multifamily cash flow are a natural fit for DSCR financing — the property income-qualifies on DSCR while the equity structure captures the OZ tax benefit. Greenstreet's programs are available in rural markets; the limiting factor is usually the appraisal comparables pool, not program availability." },
      { h: "The 1031 vs QOZ comparison" },
      { p: "For high-bracket investors: depending on your gain type and holding period, QROF's 30% step-up and elimination of tax on future appreciation can outperform a 1031 exchange. The OBBBA made the QOZ math permanent and more predictable, which makes the comparison worth running on every large exit. This requires a CPA-level analysis — the outcome is fact-specific." },
      { quote: "Rural Opportunity Zones now carry a 30% step-up. For the right DSCR deal in a rural market, the tax structure is as important as the rate." },
    ],
    glyph: "⊕", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Priya Rao",
    featured: false,
  },
  {
    slug: "section-1071-final-rule-dscr",
    date: "June 19, 2026", tag: "Compliance",
    title: "Section 1071 is live: what DSCR lenders actually need to do",
    summary: "The CFPB's small-business lending data collection rule took effect June 30, 2026. The 1,000-loan threshold exempts most DSCR lenders from direct compliance — but indirect hooks through bank warehouse facilities are real.",
    body: [
      { p: "Section 1071 of Dodd-Frank — the CFPB's small-business lending data collection rule — became effective June 30, 2026, with a compliance start date of January 1, 2028. Published in the Federal Register on May 1, 2026 (91 FR), the final rule requires covered lenders to collect and report demographic and pricing data on small-business loan applications." },
      { h: "The threshold that matters: 1,000 originations" },
      { p: "The CFPB's final rule raised the loan-volume threshold substantially from early proposals. A lender is only subject to Section 1071 if it originated at least 1,000 covered small-business loans in each of the two preceding calendar years. That threshold covers approximately 92-93% of small-business loan volume by dollar amount — but exempts the vast majority of lenders by institution count. Most non-bank DSCR lenders fall well below 1,000 originations annually." },
      { h: "What else narrowed the rule" },
      { list: [
        "Borrower size cap: the rule applies to businesses with ≤$1M gross annual revenue (raised from the proposed ≤$5M). Most DSCR borrowers are individual investors or small LLCs, not mid-market businesses.",
        "Data points collected: 15 (reduced from 20 originally proposed). LGBTQI+ data point removed. Application method data point removed.",
        "Small-dollar exclusion: loans of $1,000 or less are excluded from data collection.",
        "Filing: annual (not quarterly).",
      ]},
      { h: "Indirect exposure through warehouse facilities" },
      { p: "Here's where it gets nuanced: lenders that source capital through bank warehouse lines may find that the bank counterparty imposes Section 1071 data collection requirements on the pipeline — even if the originating DSCR lender is under the threshold. Banks above the threshold that use warehouse facilities to fund non-bank DSCR production may require the originator to pass through compliant data. Verify with your warehouse lender." },
      { h: "Compliance calendar" },
      { list: [
        "June 30, 2026: rule effective.",
        "January 1, 2028: compliance begins for in-scope lenders.",
        "Annual monitoring: the threshold looks at the two preceding calendar years — track your trailing origination count starting now.",
        "Re-verify annually in Q1 using the prior two calendar years' volume.",
      ]},
      { quote: "1071 data collection doesn't start until 2028. If you're under 1,000 originations, the clock isn't running yet — but you should know exactly when it starts." },
    ],
    glyph: "§", glyphColor: dc.lemon, bg: dc.dark,
    author: "Sara López",
    featured: false,
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026", tag: "Rates",
    title: "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    summary: "The '740 FICO, ≤75% LTV' tier is real on Greenstreet's Premier program — our lowest rate sheet. Here's exactly what it takes to hit it.",
    body: [
      { p: "Everyone advertises a teaser rate. We broke down Greenstreet's June 2026 DSCR 1-4 rate tiers — from the 740-FICO best pricing down to sub-1.0 DSCR — to show who actually hits the headline number, and under what conditions." },
      { h: "The best-tier reality" },
      { list: [
        "The sub-6.5% tier is real, but only at 740+ FICO, ≤75% LTV, DSCR ≥ 1.0, SFR, with a full prepay penalty.",
        "Drop to 80% LTV and most sheets add 0.25–0.40%.",
        "Waive the prepay penalty and you give back 0.50–0.80% — often more than the rate you were chasing.",
      ]},
      { h: "Where the typical broker lands" },
      { p: "The honest center of the market in June 2026 is 6.5–7.5% for a clean-but-not-perfect file. Below that you're in special territory; above 7.75% you're pricing a thin file. Set borrower expectations there, not at the teaser." },
      { quote: "A 6.125% you can't qualify for isn't a rate. It's bait." },
    ],
    glyph: "∿", glyphColor: dc.rain, bg: dc.mintBg,
    author: "Marcus Chen",
    featured: false,
  },
  {
    slug: "fema-rr2-coastal-dscr",
    date: "June 17, 2026", tag: "Underwriting",
    title: "FEMA Risk Rating 2.0: why coastal DSCR deals are failing at the insurance step",
    summary: "FEMA's shift to property-specific flood pricing caused new NFIP policy applications to decline 11-39% by premium tier. For DSCR deals in coastal markets, flood insurance is now the underwriting variable that determines whether a deal closes.",
    body: [
      { p: "FEMA's Risk Rating 2.0 overhauled how National Flood Insurance Program policies are priced. Implemented fully on April 1, 2023, RR 2.0 replaced the decades-old zone-based pricing system with property-specific risk analysis — factoring in distance to water, structure elevation, building type, replacement cost value, and historical flood frequency. The result: some properties became cheaper to insure, and some became dramatically more expensive." },
      { h: "The empirical data on what happened" },
      { p: "Research published in the Journal of Coastal Risk Research and confirmed by the Environmental Defense Fund found that new NFIP policy applications declined 11-39% depending on the magnitude of the premium increase. For existing policies at renewal, the decline rate was 5-13%. FEMA's data shows 77% of policyholders saw increases averaging $88 per year — but the distribution is wide, and high-risk properties saw multiples of that figure." },
      { h: "Where it kills DSCR deals" },
      { list: [
        "Coastal Florida Special Flood Hazard Areas (SFHA): properties pricing flood insurance at $300–$600/month push PITIA above qualifying rent. The DSCR fails not from weak rent but from elevated carrying costs that a borrower didn't model before contract.",
        "The kill threshold: flood insurance above 8% of gross monthly rent is a deal-break signal in institutional underwriting frameworks. At $3,000/month gross rent, that's $240/month. Many coastal properties now exceed this.",
        "Private flood options: private flood insurance is accepted by most DSCR lenders and sometimes prices below NFIP in lower-hazard zones. Get quotes from both before modeling PITIA.",
      ]},
      { h: "What to check before underwriting a coastal deal" },
      { p: "Run the FEMA FIRM panel for the property before you quote. Use the FEMA Flood Map Service Center to confirm the flood zone designation and whether the property falls in an SFHA. Then get actual flood insurance quotes — both NFIP and private — before you build your PITIA model. A deal that looks like 1.20x DSCR can fall to 0.95x after adding a $450/month flood premium." },
      { p: "FEMA remaps flood zones on a rolling basis. A property that was in Zone X (minimal flood risk) three years ago may now be in Zone AE. Always pull the current FIRM panel, not the one on the seller's disclosure." },
      { quote: "Flood insurance is no longer a closing-day line item. In coastal markets, it's often the underwriting variable that kills the deal — or the one that saves it if you price it right." },
    ],
    glyph: "☼", glyphColor: dc.emerald, bg: dc.teal,
    author: "Marcus Chen",
    featured: false,
  },
  // Featured post (why-no-llm) drives the Featured block; listed separately below
  {
    slug: "why-no-llm-number-path",
    date: "May 12, 2026", tag: "Product",
    title: "Why we put no LLM in the number path — and never will",
    summary: "Determinism is a feature. Here's how Greenstreet keeps every figure auditable while still using AI where it actually helps.",
    body: [
      { p: "Every DSCR number Greenstreet produces is deterministic. That's a deliberate architectural decision — and one we get asked about often, especially after borrowers have used tools that produce slightly different answers depending on how you phrase the question." },
      { h: "The problem with LLMs in the number path" },
      { p: "Language models are probabilistic by design. Ask the same question twice and you may get slightly different numbers. For a borrower trying to model whether a deal qualifies at a 1.11x DSCR or a 1.08x, that variance is not a minor inconvenience — it's a trust problem. One number closes. The other doesn't. You can't have both be correct." },
      { h: "Where AI does belong" },
      { list: [
        "Summarizing state rule changes (the rules themselves are checked against source documents).",
        "Drafting plain-language explanations of underwriting decisions.",
        "Surfacing which lender programs are worth checking, based on file characteristics.",
      ]},
      { p: "In each of these cases, the AI is writing prose or ranking options — not producing the authoritative number. The number comes from the deterministic engine: rate × balance × amortization factor, plus explicit addlines for taxes, insurance, HOA. No token sampling." },
      { h: "The audit trail requirement" },
      { p: "Wholesale lending involves compliance reviews. Every number on a submitted file needs to be explainable: where did PITIA come from, what rate was used, what rent figure was applied. A deterministic engine produces the same answer every time and can show its work. An LLM cannot." },
      { quote: "Determinism is a feature. Every figure Greenstreet produces is auditable — the same inputs produce the same output, every time." },
    ],
    glyph: "det()", glyphColor: dc.lemon, bg: dc.dark,
    author: "Priya Rao",
    featured: true,
  },
];

// The 6 grid posts (all except the featured one), in reverse-chron order
const GRID_POSTS = POSTS.filter((p) => !p.featured);
const FEATURED_POST = POSTS.find((p) => p.featured)!;

// ── Tag filter list ───────────────────────────────────────────────────────────
const ALL_TAGS = ["All", "Tax", "Compliance", "Rates", "Underwriting", "Lending", "STR", "Process", "Product"];

// ── Reusable article body renderer ───────────────────────────────────────────
function ArticleBody({ blocks }: { blocks: { p?: string; h?: string; quote?: string; list?: string[] }[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.h) return (
          <h2 key={i} style={{ color: dc.rain, fontSize: "22px", fontWeight: 700, margin: "32px 0 12px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {b.h}
          </h2>
        );
        if (b.quote) return (
          <blockquote key={i} style={{ borderLeft: `3px solid ${dc.lemon}`, padding: "10px 22px", margin: "28px 0", color: dc.dark, fontSize: "20px", fontStyle: "italic", lineHeight: 1.4, fontWeight: 500 }}>
            {b.quote}
          </blockquote>
        );
        if (b.list) return (
          <ul key={i} style={{ margin: "0 0 20px", padding: 0, listStyle: "none" }}>
            {b.list.map((li, j) => (
              <li key={j} style={{ color: "#3f5252", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px", paddingLeft: "26px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: dc.rain, fontWeight: 800 }}>→</span>
                {li}
              </li>
            ))}
          </ul>
        );
        return <p key={i} style={{ color: "#3f5252", fontSize: "17px", lineHeight: 1.75, marginBottom: "18px" }}>{b.p}</p>;
      })}
    </>
  );
}

// ── Post detail view ──────────────────────────────────────────────────────────
function PostDetail({ post, onNavigate }: { post: typeof POSTS[0]; onNavigate: (v: string) => void }) {
  useEffect(() => {
    document.title = `${post.title} | Greenstreet Finance`;
    window.scrollTo(0, 0);
  }, [post.slug]);

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      {/* Article hero */}
      <section style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,64px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 16 }}>
              {post.tag} · {post.date}
            </div>
            <h1 style={{ fontSize: "clamp(32px,4.5vw,64px)", fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.035em", margin: "0 0 20px", maxWidth: "24ch", color: dc.cream }}>
              {post.title}
            </h1>
            <p style={{ fontSize: "clamp(16px,1.4vw,20px)", fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.7)", maxWidth: "52ch", margin: "0 0 28px", letterSpacing: "-0.01em" }}>
              {post.summary}
            </p>
            <button
              onClick={() => onNavigate("blog")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "rgba(238,239,211,0.65)", letterSpacing: "-0.01em", fontFamily: dc.sans, padding: 0 }}
            >
              ← Back to Notes from the DSCR desk
            </button>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="gs-reveal" style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ArticleBody blocks={post.body} />

          {/* CTA card */}
          <div
            className="gs-reveal"
            style={{ marginTop: 44, borderRadius: 9, border: `1px solid ${dc.rain}`, background: "rgba(0,101,101,0.07)", padding: "28px 32px" }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 10 }}>
              Run the numbers
            </div>
            <p style={{ color: "#4a5d5d", fontSize: 15, marginBottom: 18, lineHeight: 1.6 }}>
              Model a live deal — DSCR, break-even rate, and your Greenstreet program match in minutes.
            </p>
            <button
              onClick={() => onNavigate("dscr-calculator")}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, background: dc.dark, color: dc.cream, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", padding: "11px 22px", borderRadius: 6, fontFamily: dc.sans, letterSpacing: "-0.01em" }}
            >
              Open the Deal Analyzer →
            </button>
          </div>

          {/* Keep reading */}
          <div className="gs-reveal" style={{ marginTop: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 16 }}>
              Keep reading
            </div>
            <div className="dc-band-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {related.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => (window.history.pushState({},'',`/blog/${r.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
                  style={{ background: dc.white, borderRadius: 8, border: `1px solid rgba(0,55,56,0.10)`, padding: "20px 22px", textAlign: "left" as const, cursor: "pointer", fontFamily: dc.sans }}
                >
                  <div style={{ color: "#647474", fontSize: 12, marginBottom: 6 }}>{r.date}</div>
                  <div style={{ color: dc.dark, fontWeight: 700, fontSize: 15, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{r.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Blog index ────────────────────────────────────────────────────────────────
function BlogIndex({ onNavigate }: { onNavigate: (v: string) => void }) {
  const [tag, setTag] = useState("All");

  useEffect(() => {
    document.title = "Notes from the DSCR desk | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, []);

  const filtered = tag === "All" ? GRID_POSTS : GRID_POSTS.filter((p) => p.tag === tag);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={BL_ACCENT}
      navLinks={[
        { label: "DSCR Calc", view: "dscr-calculator" },
        { label: "Lender Intel", view: "lender-intel" },
        { label: "State Rules", view: "state-laws" },
      ]}
      cta={{ label: "Price a deal →", view: "dscr-calculator" }}
    >
      <style>{BL_CSS}</style>

      {/* ── HERO ── solid cream, no metric panel (content page) ── */}
      <section style={{ background: dc.cream, padding: `clamp(56px,7vh,88px) ${dc.pad} clamp(32px,4vh,48px)`, overflow: "hidden" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div id="gs-hero-content">
            <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.5)", marginBottom: 18, letterSpacing: "-0.01em" }}>
              Greenstreet Guidance
            </div>
            <h1 style={{ fontSize: "clamp(42px,5.6vw,84px)", fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.035em", margin: 0, maxWidth: "16ch", color: dc.dark }}>
              Notes from the DSCR desk.
            </h1>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── solid dark fill, no blur, no radial glow ── */}
      <section className="gs-reveal" style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(40px,5vw,64px)` }}>
        <button
          className="bl-card dc-hero"
          onClick={() => (window.history.pushState({},'',`/blog/${FEATURED_POST.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            maxWidth: dc.maxW,
            margin: "0 auto",
            background: dc.dark,
            borderRadius: 9,
            overflow: "hidden",
            border: "none",
            cursor: "pointer",
            textAlign: "left" as const,
            fontFamily: dc.sans,
            width: "100%",
          }}
        >
          <div style={{ padding: "clamp(36px,4vw,60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: dc.lemon, marginBottom: 16 }}>
              Featured · {FEATURED_POST.date}
            </div>
            <h2 style={{ fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: dc.cream, margin: "0 0 16px" }}>
              {FEATURED_POST.title}
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: "rgba(238,239,211,0.65)", margin: "0 0 24px", letterSpacing: "-0.01em", maxWidth: "48ch" }}>
              {FEATURED_POST.summary}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: dc.emerald, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: dc.dark, flexShrink: 0 }}>
                PR
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(238,239,211,0.7)", letterSpacing: "-0.01em" }}>
                Priya Rao · Head of Quant
              </span>
            </div>
          </div>
          {/* Right panel — solid fill, flat 1px border, no glow */}
          <div style={{ background: dc.teal, border: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
            <Mono style={{ fontSize: "clamp(40px,5vw,72px)", fontWeight: 600, color: "rgba(216,217,88,0.9)", letterSpacing: "-0.03em" }}>
              det()
            </Mono>
          </div>
        </button>
      </section>

      {/* ── TAG FILTER ── */}
      <section style={{ background: dc.cream, padding: `0 ${dc.pad} 20px` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1px solid ${tag === t ? dc.rain : "rgba(0,55,56,0.22)"}`,
                background: tag === t ? "rgba(0,101,101,0.10)" : "transparent",
                color: tag === t ? dc.rain : "#4a5d5d",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── GRID ── 3 columns desktop, 1 mobile ── */}
      <section style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(72px,10vh,120px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div className="dc-band-3 gs-reveal" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filtered.map((p) => (
              <button
                key={p.slug}
                className="bl-card"
                onClick={() => (window.history.pushState({},'',`/blog/${p.slug}`),window.dispatchEvent(new PopStateEvent('popstate')))}
                style={{
                  background: dc.white,
                  borderRadius: 9,
                  overflow: "hidden",
                  border: "1px solid rgba(0,55,56,0.08)",
                  textAlign: "left" as const,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: dc.sans,
                  padding: 0,
                }}
              >
                {/* Glyph header — solid fill */}
                <div style={{ height: 160, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mono style={{ fontSize: 34, fontWeight: 600, color: p.glyphColor, letterSpacing: "-0.03em" }}>
                    {p.glyph}
                  </Mono>
                </div>
                <div style={{ padding: 26, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" as const, color: dc.rain, marginBottom: 10 }}>
                    {p.tag} · {p.date}
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2, color: dc.dark, marginBottom: 10 }}>
                    {p.title}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: "rgba(0,55,56,0.6)", margin: "0 0 18px", letterSpacing: "-0.01em", flex: 1 }}>
                    {p.summary}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: dc.rain, letterSpacing: "-0.01em" }}>
                    {p.author} →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </DcShell>
  );
}

// ── Page root — onNavigate crash fixed by threading it to every sub-component ─
export default function BlogPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack?: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  // Determine active slug from the path prop (App.tsx passes key={pathname})
  const resolvedPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = resolvedPath && resolvedPath.startsWith("/blog/")
    ? resolvedPath.replace("/blog/", "").replace(/\/$/, "")
    : null;
  const post = slug ? POSTS.find((p) => p.slug === slug) ?? null : null;

  if (post) {
    return <PostDetail post={post} onNavigate={onNavigate} />;
  }

  return <BlogIndex onNavigate={onNavigate} />;
}
