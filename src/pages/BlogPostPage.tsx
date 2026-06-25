import React, { useEffect } from "react";
import { POSTS } from "./BlogPage";
import { DcShell, dc, Mono } from "../design/dc";

// ── Author registry ───────────────────────────────────────────────────────────
const AUTHOR_META: Record<string, { initials: string; role: string }> = {
  "Priya Rao":    { initials: "PR", role: "Cofounder & Head of Quant" },
  "Sara López":   { initials: "SL", role: "Compliance & State Law" },
  "Marcus Chen":  { initials: "MC", role: "Lending Programs" },
  "Greenstreet":  { initials: "GS", role: "Greenstreet Finance" },
};

// ── Article-body prose styles (typography only; no shell/nav/glass) ───────────
const ARTICLE_CSS = `
  .bp-body p{font-size:clamp(17px,1.35vw,20px);font-weight:500;line-height:1.7;color:rgba(0,55,56,0.78);margin:0 0 22px;letter-spacing:-0.01em;}
  .bp-body h2{font-size:clamp(24px,2.6vw,34px);font-weight:600;letter-spacing:-0.03em;color:${dc.dark};margin:40px 0 16px;line-height:1.1;}
  .bp-body blockquote{margin:32px 0;padding:16px 0 16px 28px;border-left:3px solid ${dc.lemon};font-size:clamp(20px,2vw,26px);font-weight:600;letter-spacing:-0.02em;line-height:1.3;color:${dc.dark};}
  .bp-body strong{font-weight:700;color:${dc.dark};}
  .bp-body ul{margin:0 0 20px;padding:0;list-style:none;}
  .bp-body li{color:#3f5252;font-size:17px;line-height:1.6;margin-bottom:12px;padding-left:26px;position:relative;}
  .bp-body li::before{content:"→";position:absolute;left:0;color:${dc.rain};font-weight:800;}
  .bp-card{transition:transform .14s;} .bp-card:hover{transform:translateY(-4px);}
  @media(max-width:900px){
    .bp-related-grid{grid-template-columns:1fr !important;}
    .bp-byline{flex-wrap:wrap;}
  }
`;

// Related post colour palettes (solid fills, no glass)
const RELATED_PALETTES = [
  { bg: dc.mintBg, glyphColor: dc.rain, glyph: "∿" },
  { bg: dc.dark,   glyphColor: dc.lemon, glyph: "§" },
  { bg: dc.rain,   glyphColor: dc.cream, glyph: "1.0" },
];

export default function BlogPostPage({
  onBack,
  onNavigate,
  path,
}: {
  onBack?: () => void;
  onNavigate: (v: any) => void;
  path?: string;
}) {
  const p = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug =
    p && p.startsWith("/blog/") ? p.replace("/blog/", "").replace(/\/$/, "") : null;
  const post = slug ? POSTS.find((x) => x.slug === slug) : null;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Greenstreet Finance`;
    }
    window.scrollTo(0, 0);
  }, [post]);

  const navLinks = [
    { label: "Guidance",     view: "blog" },
    { label: "Case Studies", view: "case-studies" },
  ];
  const cta = { label: "Price a deal →", view: "dscr-calculator" };

  if (!post) {
    return (
      <DcShell onNavigate={onNavigate} navLinks={navLinks} cta={cta}>
        <div style={{ padding: "100px clamp(1.5rem,4vw,3rem)", textAlign: "center", color: dc.dark }}>
          Post not found.
        </div>
      </DcShell>
    );
  }

  const relatedPosts = POSTS.filter((x) => x.slug !== post.slug)
    .slice(0, 3)
    .map((r, i) => ({ ...r, ...RELATED_PALETTES[i % 3] }));

  const authorName = (post as any).author ?? "Greenstreet";
  const authorMeta = AUTHOR_META[authorName] ?? AUTHOR_META["Greenstreet"];

  return (
    <DcShell onNavigate={onNavigate} navLinks={navLinks} cta={cta}>
      <style>{ARTICLE_CSS}</style>

      {/* ── ARTICLE HERO — narrow column, editorial masthead feel ────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(48px,6vh,80px) clamp(1.5rem,4vw,3rem) 0",
          overflow: "hidden",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Breadcrumb back link */}
          <a
            href="/blog"
            onClick={(e) => { e.preventDefault(); onNavigate("blog"); }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: dc.emerald,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            ← All articles
          </a>

          {/* Category tag + read time */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              margin: "24px 0 18px",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase" as const,
                color: dc.lemon,
                background: "rgba(216,217,88,0.12)",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              {post.tag ?? "Insight"}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(238,239,211,0.45)",
                letterSpacing: "-0.01em",
              }}
            >
              {post.date} · 6 min read
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontSize: "clamp(34px,4.6vw,64px)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              margin: "0 0 28px",
              color: dc.cream,
            }}
          >
            {post.title}
          </h1>

          {/* Byline + share — pinned to bottom of hero */}
          <div
            className="bp-byline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderTop: "1px solid rgba(238,239,211,0.1)",
              paddingTop: 20,
              paddingBottom: "clamp(28px,4vh,48px)",
            }}
          >
            {/* Author avatar — solid branded circle */}
            <div
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: "50%",
                background: dc.mintBg,
                border: "1px solid rgba(238,239,211,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mono style={{ fontSize: 14, fontWeight: 700, color: dc.dark }}>{authorMeta.initials}</Mono>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", color: dc.cream }}>
                {authorName}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(238,239,211,0.5)", letterSpacing: "-0.01em" }}>
                {authorMeta.role}
              </div>
            </div>

            {/* Share badges — flat, no glass */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {(["in", "𝕏"] as const).map((label) => {
                const shareUrl = encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : ""
                );
                const shareTitle = encodeURIComponent(post.title);
                const href =
                  label === "in"
                    ? `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
                    : `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
                return (
                  <span
                    key={label}
                    role="button"
                    tabIndex={0}
                    onClick={() => window.open(href, "_blank", "noopener")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        window.open(href, "_blank", "noopener");
                    }}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      background: "rgba(238,239,211,0.08)",
                      border: "1px solid rgba(238,239,211,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(238,239,211,0.6)",
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEAD IMAGE — full-bleed editorial panel, branded glyph ────────── */}
      <section
        style={{
          background: (post as any).bg ?? dc.teal,
          padding: 0,
        }}
      >
        <div className="gs-reveal" style={{ maxWidth: 980, margin: "0 auto", padding: `0 ${dc.pad}` }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              background: (post as any).bg ?? dc.teal,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              padding: "clamp(24px,3vw,48px)",
              position: "relative",
            }}
          >
            {/* Monospaced engine label */}
            <Mono
              style={{
                fontSize: "clamp(11px,0.9vw,13px)",
                fontWeight: 600,
                color: "rgba(238,239,211,0.35)",
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
              }}
            >
              The Greenstreet engine
            </Mono>

            {/* Post-specific glyph */}
            <Mono
              style={{
                fontSize: "clamp(56px,9vw,112px)",
                fontWeight: 700,
                color: (post as any).glyphColor ?? dc.cream,
                lineHeight: 0.88,
              }}
            >
              {(post as any).glyph ?? "÷"}
            </Mono>

            <div
              style={{
                fontSize: "clamp(12px,0.95vw,14px)",
                fontWeight: 500,
                color: "rgba(238,239,211,0.45)",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              Deterministic · Traceable · Same inputs → same outputs
            </div>

            {/* Lemon rule accent */}
            <div
              style={{
                width: "clamp(40px,5vw,72px)",
                height: 2,
                background: dc.lemon,
                borderRadius: 1,
                marginTop: 4,
              }}
            />
          </div>
        </div>

        {/* Caption strip — editorial metadata below the lead image */}
        <div
          style={{
            background: dc.dark,
            borderTop: "1px solid rgba(238,239,211,0.08)",
            padding: "10px clamp(1.5rem,4vw,3rem)",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <Mono
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(238,239,211,0.35)",
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              Fig. 1
            </Mono>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(238,239,211,0.4)",
                letterSpacing: "-0.01em",
              }}
            >
              DSCR at 1.11× — the threshold where both coverage and cash flow hold under a 10% vacancy shock.
            </span>
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY — prose column, max ~70ch, editorial margins ───────── */}
      <section
        style={{
          background: dc.cream,
          padding: "clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem) clamp(64px,8vw,96px)",
        }}
      >
        {/* Reading-progress eyebrow — thin lemon rule + section label */}
        <div
          className="gs-reveal"
          style={{
            maxWidth: 680,
            margin: "0 auto 36px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(0,55,56,0.12)",
            }}
          />
          <Mono
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase" as const,
              color: "rgba(0,55,56,0.35)",
            }}
          >
            Article
          </Mono>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(0,55,56,0.12)",
            }}
          />
        </div>

        <article className="bp-body gs-reveal" style={{ maxWidth: 680, margin: "0 auto" }}>
          {post.body.map((b: any, i: number) => {
            if (b.h)     return <h2 key={i}>{b.h}</h2>;
            if (b.quote) return <blockquote key={i}>{b.quote}</blockquote>;
            if (b.list)  return (
              <ul key={i}>
                {b.list.map((li: string, j: number) => <li key={j}>{li}</li>)}
              </ul>
            );
            return <p key={i}>{b.p}</p>;
          })}
        </article>

        {/* End-of-article rule + share nudge */}
        <div
          className="gs-reveal"
          style={{
            maxWidth: 680,
            margin: "48px auto 0",
            paddingTop: 28,
            borderTop: "1px solid rgba(0,55,56,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(0,55,56,0.45)",
              letterSpacing: "-0.01em",
            }}
          >
            Share this article
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["LinkedIn", "𝕏 / Twitter"] as const).map((label) => {
              const shareUrl = encodeURIComponent(
                typeof window !== "undefined" ? window.location.href : ""
              );
              const shareTitle = encodeURIComponent(post.title);
              const href =
                label === "LinkedIn"
                  ? `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
                  : `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
              return (
                <span
                  key={label}
                  role="button"
                  tabIndex={0}
                  onClick={() => window.open(href, "_blank", "noopener")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      window.open(href, "_blank", "noopener");
                  }}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: dc.rain,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    borderBottom: `1px solid ${dc.rain}`,
                    paddingBottom: 1,
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem)",
        }}
      >
        <div className="gs-reveal" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(28px,3.6vw,48px)",
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              margin: "0 0 20px",
              color: dc.cream,
            }}
          >
            Ready to run your deal?
          </h2>
          <p
            style={{
              fontSize: "clamp(17px,1.5vw,21px)",
              fontWeight: 500,
              color: "rgba(238,239,211,0.7)",
              margin: "0 0 32px",
              letterSpacing: "-0.02em",
            }}
          >
            Price a DSCR deal in under a minute, or get a preliminary program
            match — no commitment required.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a
              href="/dscr-calculator"
              onClick={(e) => { e.preventDefault(); onNavigate("dscr-calculator"); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: dc.lemon,
                color: dc.dark,
                fontWeight: 600,
                fontSize: 16,
                textDecoration: "none",
                padding: "15px 30px",
                borderRadius: 6,
              }}
            >
              Open the calculator →
            </a>
            <button
              onClick={() => (window as any).openQualify?.()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                color: dc.cream,
                fontWeight: 600,
                fontSize: 16,
                border: "1px solid rgba(238,239,211,0.3)",
                cursor: "pointer",
                padding: "15px 28px",
                borderRadius: 6,
                fontFamily: dc.sans,
                letterSpacing: "-0.01em",
              }}
            >
              See if your deal qualifies
            </button>
          </div>
        </div>
      </section>

      {/* ── RELATED ARTICLES ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: "clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem) clamp(72px,10vh,120px)",
        }}
      >
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2
            className="gs-reveal"
            style={{
              fontSize: "clamp(22px,2.4vw,32px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              margin: "0 0 32px",
              color: dc.dark,
            }}
          >
            Related articles
          </h2>

          <div
            className="gs-reveal bp-related-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}
          >
            {relatedPosts.map((r) => (
              <a
                key={r.slug}
                href={`/blog/${r.slug}`}
                onClick={(e) => { e.preventDefault(); (window.history.pushState({},'',`/blog/${r.slug}`),window.dispatchEvent(new PopStateEvent('popstate'))); }}
                className="bp-card"
                style={{
                  background: "#fff",
                  borderRadius: 9,
                  border: "1px solid rgba(0,55,56,0.08)",
                  overflow: "hidden",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Card thumbnail — solid fill, no blur */}
                <div
                  style={{
                    height: 150,
                    background: r.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mono
                    style={{
                      fontSize: 30,
                      fontWeight: 600,
                      color: r.glyphColor,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {r.glyph}
                  </Mono>
                </div>
                <div style={{ padding: 24 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase" as const,
                      color: dc.rain,
                      marginBottom: 10,
                    }}
                  >
                    {r.tag} · {r.date}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      color: dc.dark,
                    }}
                  >
                    {r.title}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* View all link */}
          <div className="gs-reveal" style={{ marginTop: 40, textAlign: "center" }}>
            <a
              href="/blog"
              onClick={(e) => { e.preventDefault(); onNavigate("blog"); }}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: dc.rain,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                borderBottom: `1px solid ${dc.rain}`,
                paddingBottom: 2,
              }}
            >
              View all articles →
            </a>
          </div>
        </div>
      </section>
    </DcShell>
  );
}
