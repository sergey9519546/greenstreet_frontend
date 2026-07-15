import React, { useEffect } from "react";
import { DcShell, dc } from "../design/dc";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };
type Audience = { id: string; title: string; question: string; answer: string; limits: string; href: string; view: string; link: string };

const AUDIENCES: Audience[] = [
  { id: "buy-and-hold", title: "Buy-and-hold investors", question: "Will the rent cover the proposed payment?", answer: "Model lease or market rent against the full entered PITIA payment, then stress rent, rate, taxes, insurance, and association dues.", limits: "Credit, assets, reserves, entity, appraisal, property, state, and provider rules may still apply.", href: "/tools/dscr-calculator", view: "dscr-calculator", link: "Model a long-term rental" },
  { id: "short-term", title: "Short-term rental hosts", question: "How does seasonality change the coverage picture?", answer: "Compare average daily rate, occupancy, seasonal variation, and slow-period cash flow using clearly labeled assumptions.", limits: "Local permission, insurance, source data, and the provider's permitted income method must be verified.", href: "/str-hosts", view: "str-hosts", link: "Review the STR workflow" },
  { id: "non-us", title: "Non-US investors", question: "What changes when the borrower profile is cross-border?", answer: "Organize identity, residency, country, credit-alternative, entity, reserves, funds-source, and closing questions beside the property model.", limits: "Availability varies; legal, tax, estate, sanctions, and foreign-exchange questions require qualified review.", href: "/non-us-investors", view: "non-us-investors", link: "Review cross-border questions" },
  { id: "vacation", title: "Vacation-rental owners", question: "Does planned personal use change the financing path?", answer: "Separate occupancy intent from gross rental-income assumptions before choosing between investment-property and second-home financing categories.", limits: "Business-purpose DSCR financing is generally for non-owner-occupied investment property; personal use may change eligibility.", href: "/vacation-homes", view: "vacation-homes", link: "Compare use and rental income" },
  { id: "portfolio", title: "Portfolio builders", question: "What does the portfolio look like property by property?", answer: "Review property-level rent, debt, value, equity, and coverage before using a blended portfolio summary.", limits: "Blanket structures, cross-collateralization, releases, concentration, and provider review methods vary.", href: "/tools/portfolio", view: "portfolio", link: "Build a portfolio view" },
  { id: "brokers", title: "Mortgage brokers", question: "How can a preliminary file become review-ready?", answer: "Keep intake facts, model assumptions, stress results, profile questions, and supporting evidence organized for provider review.", limits: "Greenstreet does not quote, lock, approve, place, or fund loans.", href: "/brokers", view: "brokers", link: "See the broker workflow" },
];

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let node = document.head.querySelector("meta[" + attr + "='" + key + "']") as HTMLMetaElement | null;
      if (!node) { node = document.createElement("meta"); node.setAttribute(attr, key); document.head.appendChild(node); }
      node.content = value;
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = new URL(path, window.location.origin).href;
    window.scrollTo(0, 0);
  }, [description, path, title]);
}

export default function SolutionsPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "DSCR Solutions by Investor and Property Type | Greenstreet Finance",
    "Find the Greenstreet workflow for buy-and-hold, STR, non-US, vacation-rental, portfolio, and mortgage-broker DSCR scenario questions.",
    "/solutions",
  );

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark} navLinks={[{ label: "Solutions", view: "solutions" }, { label: "Products", view: "products" }, { label: "Profiles", view: "borrower-profiles" }]} cta={{ label: "Model a rental", view: "dscr-calculator" }}>
      <style>{`
        .so-page{background:#eeefd3;color:#003738}.so-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.so-hero{background:#003738;color:#eeefd3;padding:clamp(68px,10vw,126px) 0}
        .so-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,6vw,82px);align-items:center}.so-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}
        .so-hero h1{font-size:clamp(2.7rem,7vw,6rem);line-height:.92;letter-spacing:-.05em;margin:18px 0 24px;max-width:11ch}.so-lead{font-size:clamp(1.05rem,1.9vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.75);max-width:60ch}
        .so-directory{background:#0b4d4d;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:12px}.so-directory a{display:flex;justify-content:space-between;gap:16px;color:#eeefd3;padding:15px 12px;border-bottom:1px solid rgba(238,239,211,.13);font-weight:750;text-decoration:none}.so-directory a:last-child{border-bottom:0}.so-directory span{color:#d8d958}
        .so-audiences{padding:clamp(66px,8vw,112px) 0}.so-heading{max-width:760px;margin-bottom:38px}.so-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.so-intro{font-size:1.05rem;line-height:1.65;color:rgba(0,55,56,.7)}
        .so-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.so-card{background:#fffef0;border:1px solid rgba(0,55,56,.17);border-radius:12px;padding:clamp(22px,3vw,32px);min-width:0}.so-card h3{font-size:clamp(1.4rem,2.4vw,2rem);margin:0 0 14px}.so-question{font-weight:800;color:#155e68;margin:0 0 10px}.so-answer,.so-limit{line-height:1.6;color:rgba(0,55,56,.72)}.so-limit{padding-top:16px;border-top:1px solid rgba(0,55,56,.15);font-size:.93rem}
        .so-card a{display:inline-flex;min-height:44px;align-items:center;color:#155e68;font-weight:800;text-underline-offset:4px}.so-explain{background:#dfe7c5;padding:clamp(64px,8vw,104px) 0}.so-explain-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.so-explain article{background:#eeefd3;padding:26px;border-left:4px solid #287a84}.so-explain h3{margin:0 0 10px}.so-explain p{margin:0;line-height:1.6;color:rgba(0,55,56,.7)}
        .so-close{background:#003738;color:#eeefd3;padding:clamp(60px,8vw,96px) 0}.so-close-grid{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end}.so-close p{color:rgba(238,239,211,.7);line-height:1.6;max-width:60ch}.so-action{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;background:#d8d958;color:#003738;border-radius:7px;font-weight:800;text-decoration:none}
        .so-page a:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}.so-card:target{outline:3px solid #287a84;outline-offset:4px}
        @media(max-width:760px){.so-wrap{width:min(100% - 28px,1160px)}.so-hero-grid,.so-grid,.so-explain-grid,.so-close-grid{grid-template-columns:1fr}.so-hero h1{overflow-wrap:anywhere}.so-action{width:100%}}
      `}</style>
      <div className="so-page">
        <header className="so-hero">
          <div className="so-wrap so-hero-grid">
            <div>
              <div className="so-kicker">Solutions by audience</div>
              <h1>Start with who owns the property and how it will be used.</h1>
              <p className="so-lead">Greenstreet helps rental-property investors and brokers examine DSCR scenarios with visible assumptions. The right workflow depends on occupancy, income source, ownership, borrower profile, and the decision that still needs verification.</p>
            </div>
            <nav className="so-directory" aria-label="Investor solution sections">
              {AUDIENCES.map((audience) => <a key={audience.id} href={"#" + audience.id}>{audience.title}<span aria-hidden="true">+</span></a>)}
            </nav>
          </div>
        </header>

        <section className="so-audiences" aria-labelledby="so-audiences-heading">
          <div className="so-wrap">
            <div className="so-heading"><div className="so-kicker" style={{ color: dc.rain }}>Find your path</div><h2 id="so-audiences-heading">Audience-specific questions, not one-size-fits-all claims.</h2><p className="so-intro">Each path states what can be modeled and what remains dependent on current provider terms, documents, property facts, or professional review.</p></div>
            <div className="so-grid">
              {AUDIENCES.map((audience) => (
                <article className="so-card" id={audience.id} key={audience.id}>
                  <h3>{audience.title}</h3>
                  <p className="so-question">{audience.question}</p>
                  <p className="so-answer">{audience.answer}</p>
                  <p className="so-limit"><strong>Eligibility limit:</strong> {audience.limits}</p>
                  <a href={audience.href} onClick={(event) => { event.preventDefault(); onNavigate(audience.view); }}>{audience.link}</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="so-explain" aria-labelledby="so-explain-heading">
          <div className="so-wrap">
            <div className="so-kicker" style={{ color: dc.rain }}>How to use these solutions</div>
            <h2 id="so-explain-heading">Model first. Verify before relying.</h2>
            <div className="so-explain-grid">
              <article><h3>Illustrative scenario</h3><p>A calculation based on entered assumptions. It helps compare possibilities but does not represent current provider terms or a likely outcome.</p></article>
              <article><h3>Current program terms</h3><p>Eligibility, pricing, leverage, DSCR, credit, reserves, documents, property types, states, and conditions confirmed for a complete file by the applicable provider.</p></article>
            </div>
          </div>
        </section>

        <section className="so-close" aria-labelledby="so-close-heading">
          <div className="so-wrap so-close-grid">
            <div><div className="so-kicker">A practical first step</div><h2 id="so-close-heading">Enter the rent and full payment assumptions.</h2><p>Use the DSCR calculator to establish the property math, then return to the relevant audience path for profile, occupancy, and evidence questions.</p></div>
            <a className="so-action" href="/tools/dscr-calculator" onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}>Open the DSCR calculator</a>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

