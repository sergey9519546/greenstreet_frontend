import React, { useEffect } from "react";
import { POSTS, type ArticleBlock } from "./BlogPage";
import { DcShell, dc, Mono } from "../design/dc";

const ARTICLE_CSS = `
  .bp-body p{font-size:clamp(17px,1.35vw,20px);font-weight:500;line-height:1.7;color:rgba(0,55,56,0.78);margin:0 0 22px;}
  .bp-body h2{font-size:clamp(24px,2.6vw,34px);font-weight:600;color:${dc.dark};margin:40px 0 16px;line-height:1.1;}
  .bp-body blockquote{margin:32px 0;padding:16px 0 16px 28px;border-left:3px solid ${dc.lemon};font-size:clamp(20px,2vw,26px);font-weight:600;line-height:1.35;color:${dc.dark};}
  .bp-body ul{margin:0 0 20px;padding-left:24px;}
  .bp-body li{color:#3f5252;font-size:17px;line-height:1.6;margin-bottom:12px;}
  .bp-card{transition:transform .14s;} .bp-card:hover{transform:translateY(-4px);}
  @media(max-width: 991px){.bp-related-grid{grid-template-columns:1fr !important;}.bp-byline{flex-wrap:wrap;}}
`;

function renderBlock(block: ArticleBlock, index: number) {
  if (block.h) return <h2 key={index}>{block.h}</h2>;
  if (block.quote) return <blockquote key={index}>{block.quote}</blockquote>;
  if (block.list) return <ul key={index}>{block.list.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
  return <p key={index}>{block.p}</p>;
}

export default function BlogPostPage({ onNavigate, path }: { onBack?: () => void; onNavigate: (view: any) => void; path?: string }) {
  const currentPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = currentPath.startsWith("/blog/") ? currentPath.replace("/blog/", "").replace(/\/$/, "") : null;
  const post = slug ? POSTS.find((candidate) => candidate.slug === slug) : null;

  useEffect(() => {
    document.title = post ? `${post.title} | Greenstreet Finance` : "Article not found | Greenstreet Finance";
    window.scrollTo(0, 0);
  }, [post]);

  const navLinks = [
    { label: "Guidance", view: "blog" },
    { label: "DSCR Calc", view: "dscr-calculator" },
    { label: "FAQ", view: "faq" },
    { label: "State Rules", view: "state-laws" },
  ];
  const cta = { label: "Model a scenario", view: "dscr-calculator" };

  if (!post) {
    return (
      <DcShell onNavigate={onNavigate} navLinks={navLinks} cta={cta}>
        <section aria-labelledby="blog-post-not-found-title" style={{ padding: "clamp(80px,12vh,140px) clamp(1.5rem,4vw,3rem)", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <Mono style={{ fontSize: 12, color: dc.rain }}>404 | ARTICLE NOT FOUND</Mono>
          <h1 id="blog-post-not-found-title" style={{ fontSize: "clamp(28px,3.6vw,44px)", color: dc.dark }}>That article does not exist.</h1>
          <a href="/blog" onClick={(event) => { event.preventDefault(); onNavigate("blog"); }} style={{ color: dc.rain, fontWeight: 700 }}>Back to all guidance</a>
        </section>
      </DcShell>
    );
  }

  const relatedPosts = POSTS.filter((candidate) => candidate.slug !== post.slug).slice(0, 3);
  const internalLinks = [
    { href: "/dscr-calculator", label: "Model a preliminary DSCR scenario", view: "dscr-calculator" },
    { href: "/faq", label: "Review DSCR requirements and limitations", view: "faq" },
    { href: "/state-laws", label: "Review state-law limitations", view: "state-laws" },
    { href: "/how-it-works", label: "See the scenario-analysis process", view: "how-it-works" },
    { href: "/borrower-profiles", label: "Compare borrower-profile questions", view: "borrower-profiles" },
  ];

  return (
    <DcShell onNavigate={onNavigate} navLinks={navLinks} cta={cta}>
      <style>{ARTICLE_CSS}</style>
      <header style={{ background: dc.dark, color: dc.cream, padding: "clamp(48px,6vh,80px) clamp(1.5rem,4vw,3rem)" }}>
        <div id="gs-hero-content" style={{ maxWidth: 820, margin: "0 auto" }}>
          <a href="/blog" onClick={(event) => { event.preventDefault(); onNavigate("blog"); }} style={{ color: dc.emerald, textDecoration: "none", fontWeight: 700 }}>&lt;- All guidance</a>
          <div style={{ margin: "24px 0 18px", color: dc.lemon, fontSize: 12, fontWeight: 700 }}>{post.tag} | Publication date: {post.date}</div>
          <h1 style={{ fontSize: "clamp(34px,4.6vw,64px)", fontWeight: 600, lineHeight: 1.02, margin: "0 0 24px", color: dc.cream }}>{post.title}</h1>
          <p style={{ fontSize: "clamp(17px,1.5vw,21px)", lineHeight: 1.6, color: "rgba(238,239,211,0.72)", maxWidth: 720 }}>{post.summary}</p>
          <div className="bp-byline" style={{ display: "flex", gap: 16, borderTop: "1px solid rgba(238,239,211,0.16)", paddingTop: 20, marginTop: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: dc.mintBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Mono style={{ color: dc.dark, fontWeight: 700 }}>GS</Mono></div>
            <div>
              <div style={{ color: dc.cream, fontWeight: 700 }}>{post.author}</div>
              <div style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>Last modified: not recorded</div>
              <div style={{ color: "rgba(238,239,211,0.62)", fontSize: 13 }}>Review status: {post.reviewStatus}</div>
            </div>
          </div>
        </div>
      </header>

      <article style={{ background: dc.cream, padding: "clamp(48px,6vw,72px) clamp(1.5rem,4vw,3rem) clamp(64px,8vw,96px)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <aside style={{ background: dc.mintBg, border: `1px solid ${dc.faded}`, borderRadius: 10, padding: 24, marginBottom: 40 }}>
            <Mono style={{ color: dc.rain, fontSize: 11, fontWeight: 700 }}>EDITORIAL METHOD</Mono>
            <p style={{ color: dc.dark, lineHeight: 1.6, marginBottom: 8 }}>This guide is educational. Figures are omitted or explicitly illustrative unless a directly linked primary source supports the claim.</p>
            <p style={{ color: "rgba(0,55,56,0.7)", lineHeight: 1.6, margin: 0 }}>Program terms vary. Results are preliminary scenarios, not approvals, commitments, rate locks, legal advice, or tax advice. Corrections can be reported through Support.</p>
          </aside>

          <article className="bp-body">{post.body.map(renderBlock)}</article>

          <section aria-labelledby="sources-heading" style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${dc.faded}` }}>
            <h2 id="sources-heading" style={{ color: dc.dark, fontSize: 28 }}>Sources and scope</h2>
            {post.sources.length ? post.sources.map((source) => (
              <div key={source.href} style={{ marginBottom: 22 }}>
                <a href={source.href} target="_blank" rel="noreferrer" style={{ color: dc.rain, fontWeight: 700 }}>{source.label}</a>
                <p style={{ color: "rgba(0,55,56,0.7)", lineHeight: 1.6, margin: "7px 0 0" }}>{source.note}</p>
              </div>
            )) : <p style={{ color: "rgba(0,55,56,0.7)", lineHeight: 1.6 }}>Primary-source verification is pending. The article therefore avoids a current rate, legal, tax, or program conclusion.</p>}
          </section>

          <nav aria-label="Related tools and guidance" style={{ marginTop: 40, padding: 24, borderRadius: 10, background: dc.mintBg, display: "grid", gap: 12 }}>
            <h2 style={{ color: dc.dark, fontSize: 24, margin: "0 0 4px" }}>Continue your review</h2>
            {internalLinks.map((link) => <a key={link.href} href={link.href} onClick={(event) => { event.preventDefault(); onNavigate(link.view); }} style={{ color: dc.rain, fontWeight: 700, textDecoration: "none" }}>{link.label} -&gt;</a>)}
          </nav>
        </div>
      </article>

      <section style={{ background: dc.dark, color: dc.cream, padding: "clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem)", textAlign: "center" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,3.6vw,48px)", color: dc.cream, marginBottom: 18 }}>Model the scenario before requesting a review.</h2>
          <p style={{ color: "rgba(238,239,211,0.72)", fontSize: 18, lineHeight: 1.6 }}>Enter property and financing assumptions to see preliminary coverage math. Replace estimates with verified inputs before relying on the result.</p>
          <a href="/dscr-calculator" onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }} style={{ display: "inline-flex", marginTop: 16, background: dc.lemon, color: dc.dark, fontWeight: 700, textDecoration: "none", padding: "14px 28px", borderRadius: 6 }}>Open the DSCR calculator</a>
        </div>
      </section>

      <section style={{ background: dc.cream, padding: "clamp(56px,7vw,96px) clamp(1.5rem,4vw,3rem)" }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 style={{ color: dc.dark, fontSize: 30 }}>Related guidance</h2>
          <div className="bp-related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {relatedPosts.map((related) => <a key={related.slug} className="bp-card" href={`/blog/${related.slug}`} style={{ background: dc.mintBg, border: `1px solid ${dc.faded}`, borderRadius: 10, padding: 24, color: dc.dark, textDecoration: "none", fontWeight: 700, lineHeight: 1.35 }}>{related.title}</a>)}
          </div>
        </div>
      </section>
    </DcShell>
  );
}
