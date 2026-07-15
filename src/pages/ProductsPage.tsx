import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

type PageProps = { onBack?: () => void; onNavigate: (view: any) => void };
type Tool = { title: string; view: string; href: string; body: string; limit: string };
type Group = { id: string; eyebrow: string; title: string; intro: string; tools: Tool[] };

const GROUPS: Group[] = [
  {
    id: "property",
    eyebrow: "Start with the property",
    title: "Coverage and operating assumptions",
    intro: "Build the property and payment picture before comparing a financing structure.",
    tools: [
      { title: "Deal Analyzer", view: "deal-analyzer", href: "/tools/deal-analyzer", body: "Compare rent coverage with an investor cash-flow view that includes editable vacancy, management, maintenance, and capital-expenditure assumptions.", limit: "A scenario summary, not underwriting or investment advice." },
      { title: "DSCR Calculator", view: "dscr-calculator", href: "/tools/dscr-calculator", body: "Enter rent, price, leverage, rate, taxes, insurance, and association dues to review modeled payment coverage.", limit: "Entered assumptions do not establish eligibility or pricing." },
      { title: "STR Underwriting", view: "str-underwriting", href: "/tools/str-underwriting", body: "Model average daily rate, occupancy, seasonality, and slow-period coverage for a short-term rental scenario.", limit: "Confirm permitted income evidence, local use, and provider rules." },
      { title: "Portfolio View", view: "portfolio", href: "/tools/portfolio", body: "Organize property-level debt, rent, value, and coverage before reviewing a blended portfolio summary.", limit: "Provider treatment of multiple properties and collateral varies." },
    ],
  },
  {
    id: "stress",
    eyebrow: "Stress the structure",
    title: "Rate, rent, return, and refinance models",
    intro: "Use transparent sensitivities to see which assumptions matter. None of these outputs predicts markets or future financing.",
    tools: [
      { title: "Stress Matrix", view: "stress-matrix", href: "/tools/stress-matrix", body: "Compare combinations of lower rent and higher rate assumptions to locate modeled coverage breakpoints.", limit: "Sensitivity cells are illustrations, not forecasts." },
      { title: "Monte Carlo Explorer", view: "monte-carlo", href: "/tools/monte-carlo", body: "Generate seeded, mean-reverting rate paths and summarize the share of modeled paths below selected coverage levels.", limit: "Modeled path shares are not probabilities of actual outcomes." },
      { title: "ARM Reset Analyzer", view: "arm-reset", href: "/tools/arm-reset", body: "Enter index, margin, caps, and payment inputs from the note to compare possible reset scenarios.", limit: "The note controls; modeled rates are not forecasts." },
      { title: "Returns Model", view: "returns", href: "/tools/returns", body: "Explore cash-on-cash, IRR, and equity outcomes using editable acquisition, financing, operating, and exit assumptions.", limit: "Returns can be negative and require independent investment review." },
      { title: "Tax Engine", view: "tax-engine", href: "/tools/tax-engine", body: "Review an educational rental-property tax scenario with visible depreciation and disposition assumptions.", limit: "Not tax advice; current law and individual treatment require a qualified professional." },
      { title: "Refi Tracker", view: "refi-tracker", href: "/tools/refi-tracker", body: "Compare entered closing costs, payment changes, hold period, and discount assumptions to estimate a modeled break-even point.", limit: "No savings are promised; actual costs, rates, and timing vary." },
    ],
  },
  {
    id: "research",
    eyebrow: "Research before relying",
    title: "Program and state-rule references",
    intro: "Use these references to form better questions, then confirm the current answer with the applicable provider or qualified professional.",
    tools: [
      { title: "Program Intelligence", view: "lender-intel", href: "/tools/lender-intel", body: "Compare a file with illustrative credit, leverage, DSCR, property, transaction, and borrower-profile parameters.", limit: "Reference scenarios are not a provider marketplace or eligibility decision." },
      { title: "State Rules", view: "state-laws", href: "/tools/state-laws", body: "Review educational prepayment, usury, licensing, and short-term-rental research organized by state.", limit: "Verify current law, applicability, sources, and final documents with counsel." },
    ],
  },
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

function ToolLink({ tool, onNavigate }: { tool: Tool; onNavigate: (view: any) => void }) {
  return <a className="pr-tool-link" href={tool.href} onClick={(event) => { event.preventDefault(); onNavigate(tool.view); }}>Open {tool.title}</a>;
}

export default function ProductsPage({ onBack, onNavigate }: PageProps) {
  usePageMetadata(
    "DSCR and Rental Property Analysis Tools | Greenstreet Finance",
    "Browse Greenstreet tools for DSCR coverage, STR and portfolio scenarios, rate stress, returns, refinance modeling, program comparisons, and state research.",
    "/products",
  );

  return (
    <DcShell onNavigate={onNavigate} accent={dc.dark} navLinks={[{ label: "Products", view: "products" }, { label: "Solutions", view: "solutions" }, { label: "Platform", view: "platform" }]} cta={{ label: "Start with DSCR", view: "dscr-calculator" }}>
      <style>{`
        .pr-page{background:#eeefd3;color:#003738}.pr-wrap{width:min(1180px,calc(100% - 40px));margin:auto}.pr-hero{background:#003738;color:#eeefd3;padding:clamp(70px,10vw,128px) 0}
        .pr-kicker{color:#d8d958;font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.pr-hero h1{font-size:clamp(2.8rem,7vw,6.2rem);line-height:.92;letter-spacing:-.05em;margin:18px 0 24px;max-width:12ch}
        .pr-lead{font-size:clamp(1.05rem,1.9vw,1.3rem);line-height:1.6;color:rgba(238,239,211,.75);max-width:68ch}.pr-jumps{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.pr-jumps a{color:#003738;background:#d8d958;padding:12px 16px;border-radius:7px;font-weight:800;text-decoration:none}
        .pr-group{padding:clamp(64px,8vw,110px) 0}.pr-group:nth-child(even){background:#dfe7c5}.pr-page h2{font-size:clamp(2rem,4vw,3.9rem);line-height:1;letter-spacing:-.04em;margin:12px 0 16px}.pr-intro{font-size:1.05rem;line-height:1.65;color:rgba(0,55,56,.7);max-width:68ch}
        .pr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:38px}.pr-card{display:flex;flex-direction:column;min-width:0;background:#fffef0;border:1px solid rgba(0,55,56,.17);border-radius:12px;padding:clamp(22px,3vw,32px)}
        .pr-card h3{font-size:clamp(1.35rem,2.4vw,2rem);margin:0 0 12px}.pr-card p{line-height:1.6;color:rgba(0,55,56,.72);margin:0}.pr-limit{margin:18px 0!important;padding-top:16px;border-top:1px solid rgba(0,55,56,.16);font-size:.92rem}
        .pr-tool-link{display:inline-flex;align-items:center;align-self:flex-start;margin-top:auto;min-height:44px;color:#155e68;font-weight:800;text-underline-offset:4px}.pr-close{background:#003738;color:#eeefd3;padding:clamp(60px,8vw,98px) 0}
        .pr-close-grid{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end}.pr-close p{color:rgba(238,239,211,.7);line-height:1.6;max-width:60ch}.pr-actions{display:flex;flex-wrap:wrap;gap:10px}.pr-action{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}.pr-action.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.34)}
        .pr-page a:focus-visible,.pr-page button:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}.pr-card:target{outline:3px solid #287a84;outline-offset:4px}
        @media(max-width:700px){.pr-wrap{width:min(100% - 28px,1180px)}.pr-grid,.pr-close-grid{grid-template-columns:1fr}.pr-actions .pr-action{width:100%}.pr-hero h1{overflow-wrap:anywhere}}
      `}</style>
      <div className="pr-page">
        <header className="pr-hero">
          <div className="pr-wrap">
            <div className="pr-kicker">Greenstreet product catalog</div>
            <h1>Choose the tool for the question in front of you.</h1>
            <p className="pr-lead">Greenstreet provides educational scenario-analysis tools for rental-property financing and investment questions. Each tool exposes its inputs and limitations; none provides a quote, approval, commitment to lend, legal advice, tax advice, or guaranteed outcome.</p>
            <nav className="pr-jumps" aria-label="Product categories">{GROUPS.map((group) => <a key={group.id} href={"#" + group.id}>{group.eyebrow}</a>)}</nav>
          </div>
        </header>

        {GROUPS.map((group) => (
          <section className="pr-group" id={group.id} aria-labelledby={group.id + "-heading"} key={group.id}>
            <div className="pr-wrap">
              <div className="pr-kicker" style={{ color: dc.rain }}>{group.eyebrow}</div>
              <h2 id={group.id + "-heading"}>{group.title}</h2>
              <p className="pr-intro">{group.intro}</p>
              <div className="pr-grid">
                {group.tools.map((tool) => (
                  <article className="pr-card" id={tool.view} key={tool.view}>
                    <h3>{tool.title}</h3>
                    <p>{tool.body}</p>
                    <p className="pr-limit"><strong>Limit:</strong> {tool.limit}</p>
                    <ToolLink tool={tool} onNavigate={onNavigate} />
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="pr-close" aria-labelledby="pr-close-heading">
          <div className="pr-wrap pr-close-grid">
            <div><div className="pr-kicker">Not sure where to begin?</div><h2 id="pr-close-heading">Start with rent and the full payment.</h2><p>The DSCR calculator is the clearest first step for a single rental property. If the question is audience-specific, use the solutions guide to find the relevant evidence and limitations.</p></div>
            <div className="pr-actions">
              <a className="pr-action" href="/tools/dscr-calculator" onClick={(event) => { event.preventDefault(); onNavigate("dscr-calculator"); }}>Open the DSCR calculator</a>
              <a className="pr-action secondary" href="/solutions" onClick={(event) => { event.preventDefault(); onNavigate("solutions"); }}>Explore investor solutions</a>
              {onBack && <button className="pr-action secondary" type="button" onClick={onBack}>Return to previous page</button>}
            </div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

