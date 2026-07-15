import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };

const WORKFLOW = [
  { num: "01", title: "Collect the property facts", body: "Start with transaction type, occupancy, rent evidence, property costs, requested leverage, entity, and borrower profile. Missing facts should remain visible rather than replaced with optimistic defaults." },
  { num: "02", title: "Model coverage and investor cash flow", body: "Keep qualifying-style rent coverage separate from vacancy, management, maintenance, and capital-expenditure assumptions. Neither track is an underwriting decision." },
  { num: "03", title: "Stress the assumptions", body: "Test lower rent and higher rate inputs to identify where modeled coverage falls below 1.00x. The result is a sensitivity view, not a market forecast." },
  { num: "04", title: "Flag rules and documents", body: "Use state references and profile checklists as research prompts. Verify current law, licensing, prepayment language, provider requirements, and final documents with qualified parties." },
  { num: "05", title: "Request current provider review", body: "Share the entered assumptions and supporting evidence. Only the applicable provider can confirm eligibility, pricing, conditions, approval, and closing requirements." },
];

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const upsert = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let node = document.head.querySelector("meta[" + attr + "='" + key + "']") as HTMLMetaElement | null;
      if (!node) { node = document.createElement("meta"); node.setAttribute(attr, key); document.head.appendChild(node); }
      node.content = value;
    };
    upsert("description", description);
    upsert("og:title", title, true);
    upsert("og:description", description, true);
    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = new URL(path, window.location.origin).href;
    window.scrollTo(0, 0);
  }, [description, path, title]);
}

function RouteLink({ href, view, onNavigate, children, secondary = false }: { href: string; view: string; onNavigate: (view: any) => void; children: React.ReactNode; secondary?: boolean }) {
  return <a className={"br-link" + (secondary ? " secondary" : "")} href={href} onClick={(event) => { event.preventDefault(); onNavigate(view); }}>{children}</a>;
}

export default function BrokersPage({ onBack, onNavigate }: PageProps) {
  usePageMetadata(
    "DSCR Scenario Tools for Mortgage Brokers | Greenstreet Finance",
    "A broker workflow for organizing DSCR property assumptions, stress tests, borrower-profile questions, and current provider review without implying approval.",
    "/brokers",
  );

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark} navLinks={[{ label: "DSCR Calc", view: "dscr-calculator" }, { label: "Programs", view: "lender-intel" }, { label: "State Rules", view: "state-laws" }]} cta={{ label: "Model a deal", view: "dscr-calculator" }}>
      <style>{`
        .br-page{background:#eeefd3;color:#003738}.br-wrap{width:min(1160px,calc(100% - 40px));margin:auto}.br-hero{background:#003738;color:#eeefd3;padding:clamp(64px,9vw,118px) 0}
        .br-kicker{font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#d8d958}.br-hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(32px,6vw,88px);align-items:center}
        .br-hero h1{font-size:clamp(2.6rem,6.5vw,5.6rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:12ch}.br-lead{font-size:clamp(1.05rem,1.8vw,1.28rem);line-height:1.6;color:rgba(238,239,211,.75);max-width:58ch}
        .br-panel{background:#0b4d4d;border:1px solid rgba(238,239,211,.16);border-radius:12px;padding:clamp(22px,3vw,34px)}.br-panel h2{font-size:1.4rem;margin:0 0 18px}.br-panel ul{padding-left:20px;margin:0}.br-panel li{margin:12px 0;line-height:1.5;color:rgba(238,239,211,.76)}
        .br-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.br-link{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}
        .br-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}.br-workflow,.br-boundaries{padding:clamp(64px,8vw,110px) 0}.br-heading{max-width:760px;margin-bottom:40px}
        .br-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.035em;margin:12px 0 18px}.br-heading p,.br-boundaries p{font-size:1.05rem;line-height:1.65;color:rgba(0,55,56,.7)}
        .br-steps{position:relative}.br-step{display:grid;grid-template-columns:64px 1fr;gap:22px;padding:26px 0;border-top:1px solid rgba(0,55,56,.2)}.br-step:last-child{border-bottom:1px solid rgba(0,55,56,.2)}
        .br-step h3{font-size:clamp(1.25rem,2.3vw,1.8rem);margin:0 0 8px}.br-step p{line-height:1.6;color:rgba(0,55,56,.7);margin:0;max-width:68ch}.br-boundaries{background:#dfe7c5}
        .br-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:34px}.br-card{background:#eeefd3;border:1px solid rgba(0,55,56,.18);padding:24px;border-radius:10px}.br-card h3{margin:0 0 10px}.br-card p{font-size:.98rem;margin:0}
        .br-close{background:#003738;color:#eeefd3;padding:clamp(60px,8vw,96px) 0}.br-close-grid{display:grid;grid-template-columns:1fr auto;gap:28px;align-items:end}.br-close p{color:rgba(238,239,211,.7);line-height:1.6;max-width:60ch}
        .br-page a:focus-visible,.br-page button:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}
        @media(max-width:760px){.br-wrap{width:min(100% - 28px,1160px)}.br-hero-grid,.br-cards,.br-close-grid{grid-template-columns:1fr}.br-step{grid-template-columns:46px 1fr}.br-actions .br-link{width:100%}.br-hero h1{overflow-wrap:anywhere}}
      `}</style>
      <div className="br-page">
        <header className="br-hero">
          <div className="br-wrap br-hero-grid">
            <div>
              <div className="br-kicker">For mortgage brokers</div>
              <h1>Turn a DSCR lead into a review-ready scenario.</h1>
              <p className="br-lead">Greenstreet is a scenario-analysis workspace for rental-property financing. It helps brokers organize property math, stress assumptions, and profile questions before requesting current terms from an applicable provider.</p>
              <div className="br-actions">
                <RouteLink href="/tools/dscr-calculator" view="dscr-calculator" onNavigate={onNavigate}>Model property coverage</RouteLink>
                <a className="br-link secondary" href="#broker-workflow">Review the workflow</a>
              </div>
            </div>
            <aside className="br-panel" aria-labelledby="br-panel-heading">
              <h2 id="br-panel-heading">What the workspace does not do</h2>
              <ul>
                <li>It does not quote, lock, approve, or fund a loan.</li>
                <li>It does not confirm provider availability or current program terms.</li>
                <li>It does not replace compliance, legal, tax, appraisal, insurance, or underwriting review.</li>
              </ul>
            </aside>
          </div>
        </header>

        <section id="broker-workflow" className="br-workflow" aria-labelledby="br-workflow-heading">
          <div className="br-wrap">
            <div className="br-heading">
              <div className="br-kicker" style={{ color: dc.rain }}>A defensible first pass</div>
              <h2 id="br-workflow-heading">Five steps from intake to provider review.</h2>
              <p>The workflow keeps entered facts, assumptions, and unresolved questions visible so a preliminary model is not mistaken for a loan decision.</p>
            </div>
            <div className="br-steps">
              {WORKFLOW.map((step) => (
                <article className="br-step" key={step.num}>
                  <Mono style={{ color: dc.rain, fontSize: 24, fontWeight: 800 }}>{step.num}</Mono>
                  <div><h3>{step.title}</h3><p>{step.body}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="br-boundaries" aria-labelledby="br-boundaries-heading">
          <div className="br-wrap">
            <div className="br-kicker" style={{ color: dc.rain }}>Eligibility boundaries</div>
            <h2 id="br-boundaries-heading">Property coverage is only one part of the file.</h2>
            <div className="br-cards">
              <article className="br-card"><h3>Borrower and entity</h3><p>Credit, assets, reserves, identity, guarantees, ownership, vesting, and signing authority may apply.</p></article>
              <article className="br-card"><h3>Property and income</h3><p>Appraisal, rent evidence, condition, occupancy, permits, insurance, HOA rules, and provider income methods may apply.</p></article>
              <article className="br-card"><h3>Transaction and jurisdiction</h3><p>State law, business purpose, licensing, prepayment terms, loan size, and current market conditions can change the available structure.</p></article>
            </div>
          </div>
        </section>

        <section className="br-close" aria-labelledby="br-next-heading">
          <div className="br-wrap br-close-grid">
            <div>
              <div className="br-kicker">Choose the next review</div>
              <h2 id="br-next-heading">Start with the property, then verify the program.</h2>
              <p>Use the calculator for visible payment and coverage assumptions. Use program intelligence only as an illustrative comparison, then request current provider guidance for the complete file.</p>
            </div>
            <div className="br-actions">
              <RouteLink href="/tools/dscr-calculator" view="dscr-calculator" onNavigate={onNavigate}>Open the DSCR calculator</RouteLink>
              <RouteLink secondary href="/tools/lender-intel" view="lender-intel" onNavigate={onNavigate}>Compare reference scenarios</RouteLink>
              {onBack && <button type="button" className="br-link secondary" onClick={onBack}>Return to tools</button>}
            </div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

