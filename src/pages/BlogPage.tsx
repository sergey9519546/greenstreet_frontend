// @ts-nocheck
import React, { useState } from "react";
import { PageShell, card, sectionTitle } from "./PageShell";

const MINT = "#006565";
const CREAM = "#003738";
const YELLOW = "#8a6d00";

const POSTS = [
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026", tag: "Lending",
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
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026", tag: "Rates",
    title: "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    summary: "We pulled rate sheets from 11 wholesale lenders. The '740 FICO, ≤75% LTV' tier is real at Griffin Funding, and almost nowhere else.",
    body: [
      { p: "Everyone advertises a teaser rate. We pulled live June 2026 sheets from nine wholesale DSCR lenders to see who actually delivers the headline number — and under what conditions." },
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
  },
  {
    slug: "track-2-dscr",
    date: "June 14, 2026", tag: "Underwriting",
    title: "Why your DSCR lender cares about Track 2 (and you should too)",
    summary: "Track 1 is what gets you qualified. Track 2 is what keeps you from bleeding cash when vacancy hits. Most brokers only quote Track 1.",
    body: [
      { p: "There are two DSCR calculations, and brokers who only know one keep getting surprised. Track 1 is gross rent ÷ PITIA — the number that qualifies the loan. Track 2 is NOI ÷ debt service — the number that tells you whether the deal actually cash-flows." },
      { h: "The two tracks" },
      { list: [
        "Track 1 (qualifying): gross monthly rent ÷ PITIA. Ignores vacancy, management, and CapEx. This is what the lender uses to approve.",
        "Track 2 (reality): NOI ÷ debt service, where NOI subtracts vacancy, management, and CapEx from effective rent. This is what the investor actually lives with.",
      ]},
      { h: "Why the gap matters" },
      { p: "A deal at 1.13x Track 1 can fall below 1.0x on Track 2 once you bake in 5% vacancy, 8% management, and 5% CapEx. The loan still closes — but the borrower bleeds cash the first time a tenant turns over. Quote both, and you keep the borrower out of a deal that qualifies on paper and loses money in life." },
      { quote: "Track 1 gets the loan approved. Track 2 keeps the investor solvent." },
    ],
  },
  {
    slug: "brrrr-seasoning-easy-street",
    date: "June 9, 2026", tag: "Process",
    title: "BRRRR seasoning: how to cash out at 6 months (Easy Street Capital)",
    summary: "Easy Street Capital waives the 6-month DSCR seasoning rule for STR cash-outs. Here is what they require instead.",
    body: [
      { p: "The classic BRRRR bottleneck is seasoning: most lenders make you wait 6–12 months before they'll cash out at the new appraised value instead of your cost basis. For STR operators, Easy Street Capital is the exception worth knowing." },
      { h: "What they waive — and what they want instead" },
      { list: [
        "No 6-month title seasoning requirement on qualifying STR cash-outs.",
        "In exchange: documented rehab scope, a clean appraisal at the new value, and AirDNA or trailing STR income supporting the DSCR.",
        "Expect tighter LTV on the cash-out leg — plan around 70–75%, not 80%.",
      ]},
      { h: "The play" },
      { p: "Line up the appraisal and the income documentation before you apply. The seasoning waiver only helps if the value and the rent are both defensible on day one." },
    ],
  },
  {
    slug: "texas-hb2239-apr-ban",
    date: "June 4, 2026", tag: "Compliance",
    title: "Texas H.B. 2239: the 12% APR ban and most DSCR rates",
    summary: "Texas bans business-purpose loans at APR ≥ 12% under Finance Code §302.101. Most DSCR deals qualify fine. Watch the edges.",
    body: [
      { p: "Texas caps business-purpose loans below a 12% APR. For standard DSCR deals that's a non-issue — but on thin files with points and a high note rate, APR creeps toward the line faster than brokers expect." },
      { h: "Where it bites" },
      { list: [
        "Note rate is not APR. Points, fees, and a short prepay window push APR above the coupon.",
        "A 10.5% note with 3 points on a short term can cross 12% APR — and become uncloseable in TX.",
        "Run the APR, not the rate, on every Texas file in the 9%+ range.",
      ]},
      { quote: "In Texas, the rate is fine. It's the APR that fails the deal." },
    ],
  },
  {
    slug: "airdna-haircut",
    date: "May 30, 2026", tag: "STR",
    title: "AirDNA 80% vs 100% haircut: when to push for the higher number",
    summary: "Easy Street and Visio both accept 100% AirDNA on stabilized STRs. Most lenders cap at 80%. We break down when each makes sense.",
    body: [
      { p: "Short-term-rental income gets discounted before it qualifies a DSCR loan. The size of that haircut — 80% vs 100% of AirDNA projection — can be the difference between a deal that qualifies and one that doesn't." },
      { h: "The two haircuts" },
      { list: [
        "80% (most lenders): AirDNA projected annual revenue × 0.80 ÷ 12 becomes qualifying monthly income.",
        "100% (Easy Street, Visio on stabilized STRs): full AirDNA projection, but only with a documented 12-month operating history.",
      ]},
      { h: "When to push" },
      { p: "If the property has a real trailing 12-month STR record, push for the 100% lender — the extra 20% of income can lift DSCR over the qualifying line. For a brand-new STR with no history, the 80% haircut is what you'll get, so structure the deal around it." },
    ],
  },
];

function ArticleBody({ blocks }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.h) return <h2 key={i} style={{ color: MINT, fontSize: "24px", fontWeight: 800, margin: "36px 0 14px", lineHeight: 1.2 }}>{b.h}</h2>;
        if (b.quote) return <blockquote key={i} style={{ borderLeft: `3px solid ${YELLOW}`, padding: "8px 22px", margin: "28px 0", color: CREAM, fontSize: "21px", fontStyle: "italic", lineHeight: 1.4, fontWeight: 500 }}>{b.quote}</blockquote>;
        if (b.list) return (
          <ul key={i} style={{ margin: "0 0 20px", padding: 0, listStyle: "none" }}>
            {b.list.map((li, j) => (
              <li key={j} style={{ color: "#3f5252", fontSize: "16px", lineHeight: 1.6, marginBottom: "12px", paddingLeft: "26px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: MINT, fontWeight: 800 }}>→</span>{li}
              </li>
            ))}
          </ul>
        );
        return <p key={i} style={{ color: "#3f5252", fontSize: "17px", lineHeight: 1.75, marginBottom: "18px" }}>{b.p}</p>;
      })}
    </>
  );
}

export default function BlogPage({ onBack, onNavigate, path }: { onBack: () => void; onNavigate: (v: any) => void; path?: string }) {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = p && p.startsWith("/blog/") ? p.replace("/blog/", "").replace(/\/$/, "") : null;
  const post = slug ? POSTS.find((p) => p.slug === slug) : null;

  // ---- Article detail ----
  if (post) {
    return (
      <PageShell title={post.title} subtitle={`${post.tag} · ${post.date}`} onBack={onBack} onNavigate={onNavigate}>
        <article style={{ maxWidth: "720px" }}>
          <ArticleBody blocks={post.body} />
          <div style={{ ...card, marginTop: "44px", borderColor: MINT, background: "rgba(0,101,101,0.07)" }}>
            <div style={sectionTitle}>Run the numbers</div>
            <p style={{ color: "#4a5d5d", fontSize: "15px", marginBottom: "18px", lineHeight: 1.6 }}>Model a live deal — DSCR, break-even rate, and lender matches in minutes.</p>
            <a href="/deal-analyzer" style={{ display: "inline-block", padding: "13px 26px", background: MINT, color: "#002D2E", borderRadius: "10px", fontWeight: 700, fontSize: "15px", textDecoration: "none" }}>Open the Deal Analyzer →</a>
          </div>
          <div style={{ marginTop: "52px" }}>
            <div style={sectionTitle}>Keep reading</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {POSTS.filter((p) => p.slug !== post.slug).slice(0, 2).map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ ...card, cursor: "pointer" }}>
                    <div style={{ color: "#647474", fontSize: "12px", marginBottom: "6px" }}>{p.date}</div>
                    <div style={{ color: CREAM, fontWeight: 700, fontSize: "16px", lineHeight: 1.3 }}>{p.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </article>
      </PageShell>
    );
  }

  // ---- Index ----
  return <BlogIndex onBack={onBack} onNavigate={onNavigate} />;
}

function BlogIndex({ onBack, onNavigate }) {
  const [tag, setTag] = useState("All");
  const tags = ["All", "Lending", "Rates", "Underwriting", "Process", "Compliance", "STR"];
  const filtered = tag === "All" ? POSTS : POSTS.filter((p) => p.tag === tag);

  return (
    <PageShell
      title="Greenstreet Finance Blog"
      subtitle="Notes from the underwriting desk. State rule changes, lender behavior shifts, and what the math actually says."
      onBack={onBack} onNavigate={onNavigate}
    >
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} style={{
            padding: "8px 16px", borderRadius: "20px",
            border: `1px solid ${tag === t ? MINT : "rgba(0,55,56,0.22)"}`,
            background: tag === t ? "rgba(0,101,101,0.12)" : "transparent",
            color: tag === t ? MINT : "#4a5d5d", cursor: "pointer", fontSize: "13px", fontWeight: 600,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {filtered.map((p) => (
          <a key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: "none" }}>
            <div style={{ ...card, height: "100%", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = MINT)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,55,56,0.15)")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: "rgba(0,101,101,0.12)", color: MINT, border: `1px solid ${MINT}` }}>{p.tag}</span>
                <span style={{ fontSize: "11px", color: "#5a6b6b" }}>{p.date}</span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: CREAM, marginBottom: "8px", lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ fontSize: "14px", color: "#4a5d5d", lineHeight: 1.6 }}>{p.summary}</p>
              <p style={{ fontSize: "12px", color: MINT, marginTop: "12px", fontWeight: 600 }}>Read more →</p>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: "40px", padding: "24px", background: "#e8e9bf", borderRadius: "14px", border: "1px solid rgba(0,55,56,0.12)", textAlign: "center" }}>
        <p style={{ fontSize: "15px", color: CREAM, marginBottom: "12px" }}>Want these in your inbox?</p>
        <p style={{ fontSize: "13px", color: "#4a5d5d", marginBottom: "20px" }}>One short note a month. State rule changes, lender behavior shifts, and one rate sheet pull. No drip campaigns, no upsells.</p>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "8px", maxWidth: "500px", margin: "0 auto" }}>
          <input type="email" placeholder="broker@yourfirm.com" required style={{ flex: 1, background: "#ffffff", border: "1px solid rgba(0,55,56,0.22)", color: CREAM, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none" }} />
          <button type="submit" style={{ background: MINT, color: "#002D2E", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Subscribe</button>
        </form>
      </div>
    </PageShell>
  );
}
