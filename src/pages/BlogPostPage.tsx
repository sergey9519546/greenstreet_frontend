import React, { useEffect } from "react";
import { POSTS } from "./BlogPage";
import { DcShell, dc, Mono } from "../design/dc";

// ── Article-body prose styles (typography only; no shell/nav/glass) ───────────
const ARTICLE_CSS = `
  .bp-body p{font-size:clamp(17px,1.35vw,20px);font-weight:500;line-height:1.7;color:rgba(0,55,56,0.78);margin:0 0 22px;letter-spacing:-0.01em;}
  .bp-body h2{font-size:clamp(24px,2.6vw,34px);font-weight:600;letter-spacing:-0.03em;color:${dc.dark};margin:40px 0 16px;line-height:1.1;}
  .bp-body blockquote{margin:32px 0;padding:4px 0 4px 26px;border-left:3px solid ${dc.lemon};font-size:clamp(20px,2vw,26px);font-weight:600;letter-spacing:-0.02em;line-height:1.3;color:${dc.dark};}
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

  // Nav links wired to the shell
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

  return (
    <DcShell onNavigate={onNavigate} navLinks={navLinks} cta={cta}>
      <style>{ARTICLE_CSS}</style>

      {/* ── ARTICLE HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.dark,
          color: dc.cream,
          padding: "clamp(48px,6vh,80px) clamp(1.5rem,4vw,3rem) clamp(48px,6vh,72px)",
          overflow: "hidden",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* Back link */}
          <a
            href="/blog"
            onClick={(e) => { e.preventDefault(); onNavigate("blog"); }}
            style={{ fontSize: 13, fontWeight: 600, color: dc.emerald, textDecoration: "none", letterSpacing: "-0.01em" }}
          >
            ← All articles
          </a>

          {/* Date + read time */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(238,239,211,0.5)",
              margin: "24px 0 16px",
              letterSpacing: "-0.01em",
            }}
          >
            {post.date} · 6 min read
          </div>

          {/* H1 — clamp matches design spec */}
          <h1
            style={{
              fontSize: "clamp(34px,4.6vw,64px)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              margin: "0 0 32px",
              color: dc.cream,
            }}
          >
            {post.title}
          </h1>

          {/* Byline row */}
          <div
            className="bp-byline"
            style={{ display: "flex", alignItems: "center", gap: 14 }}
          >
            {/* Author avatar — solid branded circle (no image drop zone) */}
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: "50%",
                background: dc.mintBg,
                border: `1px solid rgba(238,239,211,0.18)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mono style={{ fontSize: 18, fontWeight: 700, color: dc.dark }}>PR</Mono>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: dc.cream }}>
                Priya Rao
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(238,239,211,0.55)", letterSpacing: "-0.01em" }}>
                Cofounder &amp; Head of Quant
              </div>
            </div>

            {/* Share badges — flat, no glass */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {["in", "𝕏"].map((label) => (
                <span
                  key={label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: "rgba(238,239,211,0.1)",
                    border: "1px solid rgba(238,239,211,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(238,239,211,0.7)",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEAD IMAGE (solid branded panel) ────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: "clamp(32px,4vw,56px) clamp(1.5rem,4vw,3rem) 0",
        }}
      >
        <div className="gs-reveal" style={{ maxWidth: 980, margin: "0 auto" }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: 12,
              background: dc.teal,
              border: `1px solid rgba(238,239,211,0.1)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "clamp(24px,3vw,48px)",
            }}
          >
            {/* Branded "engine" visual — monospaced stack, no animation, no blur */}
            <Mono
              style={{
                fontSize: "clamp(13px,1.1vw,15px)",
                fontWeight: 600,
                color: "rgba(238,239,211,0.4)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              The Greenstreet engine
            </Mono>
            <Mono
              style={{
                fontSize: "clamp(48px,7vw,96px)",
                fontWeight: 700,
                color: dc.cream,
                lineHeight: 0.9,
              }}
            >
              1.11x
            </Mono>
            <div
              style={{
                fontSize: "clamp(12px,1vw,14px)",
                fontWeight: 500,
                color: "rgba(238,239,211,0.5)",
                letterSpacing: "-0.01em",
              }}
            >
              Deterministic · Traceable · Same inputs → same outputs
            </div>
            {/* Lemon rule accent — flat 1px, no glow */}
            <div
              style={{
                width: "clamp(40px,6vw,80px)",
                height: 2,
                background: dc.lemon,
                borderRadius: 1,
                marginTop: 8,
              }}
            />
          </div>
        </div>
      </section>

      {/* ── ARTICLE BODY ─────────────────────────────────────────────── */}
      <section
        style={{
          background: dc.cream,
          padding: "clamp(40px,5vw,64px) clamp(1.5rem,4vw,3rem) clamp(56px,7vw,88px)",
        }}
      >
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
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────── */}
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
            See the deterministic engine for yourself.
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
            Price a real DSCR deal in under a minute — every figure traceable.
          </p>
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
              padding: "16px 32px",
              borderRadius: 6,
            }}
          >
            Open the calculator →
          </a>
        </div>
      </section>

      {/* ── RELATED ARTICLES ─────────────────────────────────────────── */}
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
                onClick={(e) => { e.preventDefault(); onNavigate(`blog/${r.slug}`); }}
                className="bp-card"
                style={{
                  background: "#fff",
                  borderRadius: 9,
                  border: `1px solid rgba(0,55,56,0.08)`,
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
                      textTransform: "uppercase",
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
