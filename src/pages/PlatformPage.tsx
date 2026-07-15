import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };

const CAPABILITIES = [
  { title: "Property coverage", body: "Model rent against principal, interest, taxes, insurance, association dues, and other entered payment assumptions." },
  { title: "Investor cash flow", body: "Layer vacancy, management, maintenance, and capital-expenditure assumptions beside the coverage view instead of blending the two." },
  { title: "Sensitivity analysis", body: "Change rent, rate, occupancy, and structure assumptions to see where the modeled scenario weakens. Outputs are not forecasts." },
  { title: "Profile questions", body: "Organize borrower, entity, property-use, reserve, and documentation questions that may affect a provider review." },
  { title: "State research", body: "Use educational state references as a starting point, then verify current law and loan-document applicability with qualified counsel." },
  { title: "Saved assumptions", body: "Keep scenario inputs and model outputs together so collaborators can see what was entered and what still needs verification." },
];

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let tag = document.head.querySelector("meta[" + attr + "='" + key + "']") as HTMLMetaElement | null;
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, key); document.head.appendChild(tag); }
      tag.content = value;
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

function Link({ href, view, onNavigate, children, secondary = false }: { href: string; view: string; onNavigate: (view: any) => void; children: React.ReactNode; secondary?: boolean }) {
  return <a className={"pl-link" + (secondary ? " secondary" : "")} href={href} onClick={(event) => { event.preventDefault(); onNavigate(view); }}>{children}</a>;
}

export default function PlatformPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "DSCR Scenario Analysis Platform | Greenstreet Finance",
    "Explore Greenstreet's rental-property scenario workspace for DSCR coverage, investor cash flow, sensitivity analysis, profile questions, and saved assumptions.",
    "/platform",
  );

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark} navLinks={[{ label: "Products", view: "products" }, { label: "Solutions", view: "solutions" }, { label: "DSCR Calc", view: "dscr-calculator" }]} cta={{ label: "Start a scenario", view: "dscr-calculator" }}>
      <style>{`
        .pl-page{background:#eeefd3;color:#003738}.pl-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.pl-hero{background:#003738;color:#eeefd3;padding:clamp(68px,10vw,126px) 0}
        .pl-hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(32px,6vw,86px);align-items:center}.pl-kicker{color:#d8d958;font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
        .pl-hero h1{font-size:clamp(2.7rem,7vw,6rem);line-height:.92;letter-spacing:-.05em;margin:18px 0 24px;max-width:11ch}.pl-lead{font-size:clamp(1.05rem,1.8vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.75);max-width:60ch}
        .pl-map{background:#0b4d4d;border:1px solid rgba(238,239,211,.16);border-radius:14px;padding:24px}.pl-map-row{display:grid;grid-template-columns:38px 1fr;gap:14px;padding:16px 0;border-bottom:1px solid rgba(238,239,211,.13)}.pl-map-row:last-child{border-bottom:0}.pl-map-row strong{display:block}.pl-map-row span{display:block;color:rgba(238,239,211,.65);font-size:.9rem;margin-top:4px}
        .pl-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.pl-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;background:#d8d958;color:#003738;border-radius:7px;font-weight:800;text-decoration:none}.pl-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .pl-capabilities,.pl-limits{padding:clamp(66px,8vw,112px) 0}.pl-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.04em;margin:12px 0 18px}.pl-intro{font-size:1.05rem;line-height:1.65;color:rgba(0,55,56,.7);max-width:70ch}
        .pl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:38px}.pl-card{background:#fffef0;border:1px solid rgba(0,55,56,.17);padding:26px;border-radius:10px}.pl-card h3{margin:0 0 12px;font-size:1.25rem}.pl-card p{margin:0;line-height:1.6;color:rgba(0,55,56,.7)}
        .pl-limits{background:#dfe7c5}.pl-limit-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:32px}.pl-limit{border-top:4px solid #287a84;background:#eeefd3;padding:24px}.pl-limit h3{margin:0 0 10px}.pl-limit p{margin:0;line-height:1.6;color:rgba(0,55,56,.7)}
        .pl-close{background:#003738;color:#eeefd3;padding:clamp(60px,8vw,96px) 0}.pl-close-grid{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end}.pl-close p{color:rgba(238,239,211,.7);line-height:1.6;max-width:60ch}.pl-page a:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:760px){.pl-wrap{width:min(100% - 28px,1160px)}.pl-hero-grid,.pl-grid,.pl-limit-grid,.pl-close-grid{grid-template-columns:1fr}.pl-actions .pl-link{width:100%}.pl-hero h1{overflow-wrap:anywhere}}
      `}</style>
      <div className="pl-page">
        <header className="pl-hero">
          <div className="pl-wrap pl-hero-grid">
            <div>
              <div className="pl-kicker">Greenstreet scenario workspace</div>
              <h1>See the DSCR model and its limits in one place.</h1>
              <p className="pl-lead">Greenstreet organizes rental-property financing assumptions, calculations, sensitivities, and open questions. It supports analysis and collaboration; it is not a lender, underwriting system, rate quote, approval, or commitment to lend.</p>
              <div className="pl-actions">
                <Link href="/tools/dscr-calculator" view="dscr-calculator" onNavigate={onNavigate}>Start a property scenario</Link>
                <a className="pl-link secondary" href="#platform-capabilities">Review platform capabilities</a>
              </div>
            </div>
            <aside className="pl-map" aria-label="Scenario workflow">
              {[
                ["01", "Enter facts", "Property, rent, payment, borrower, and structure inputs"],
                ["02", "Compare assumptions", "Coverage, cash flow, and sensitivity outputs"],
                ["03", "Flag unknowns", "Eligibility, documents, state rules, and provider questions"],
                ["04", "Request review", "Current terms and decisions from the applicable provider"],
              ].map((row) => <div className="pl-map-row" key={row[0]}><Mono style={{ color: dc.lemon, fontWeight: 800 }}>{row[0]}</Mono><div><strong>{row[1]}</strong><span>{row[2]}</span></div></div>)}
            </aside>
          </div>
        </header>

        <section id="platform-capabilities" className="pl-capabilities" aria-labelledby="pl-cap-heading">
          <div className="pl-wrap">
            <div className="pl-kicker" style={{ color: dc.rain }}>What the platform organizes</div>
            <h2 id="pl-cap-heading">A visible path from inputs to questions.</h2>
            <p className="pl-intro">Each capability is designed to make assumptions inspectable. Results remain educational until the property, borrower, documents, jurisdiction, and current provider terms are reviewed.</p>
            <div className="pl-grid">{CAPABILITIES.map((item) => <article className="pl-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>
          </div>
        </section>

        <section className="pl-limits" aria-labelledby="pl-limits-heading">
          <div className="pl-wrap">
            <div className="pl-kicker" style={{ color: dc.rain }}>Decision boundaries</div>
            <h2 id="pl-limits-heading">What still requires outside verification.</h2>
            <div className="pl-limit-grid">
              <article className="pl-limit"><h3>Current financing terms</h3><p>Rates, points, leverage, DSCR requirements, reserves, credit, property types, states, loan sizes, and documents vary and can change.</p></article>
              <article className="pl-limit"><h3>Professional conclusions</h3><p>Legal, tax, appraisal, insurance, title, licensing, compliance, and investment conclusions require the appropriate qualified professional.</p></article>
            </div>
          </div>
        </section>

        <section className="pl-close" aria-labelledby="pl-close-heading">
          <div className="pl-wrap pl-close-grid">
            <div><div className="pl-kicker">Choose a starting point</div><h2 id="pl-close-heading">Begin with the decision you need to examine.</h2><p>Use the calculator for property coverage, the product catalog for a specialized model, or solutions for an audience-specific workflow.</p></div>
            <div className="pl-actions">
              <Link href="/products" view="products" onNavigate={onNavigate}>Browse analysis tools</Link>
              <Link secondary href="/solutions" view="solutions" onNavigate={onNavigate}>Find an investor workflow</Link>
            </div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

