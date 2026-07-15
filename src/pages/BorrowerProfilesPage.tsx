import React, { useEffect } from "react";
import { DcShell, dc, Mono } from "../design/dc";

type PageProps = {
  onBack?: () => void;
  onNavigate: (view: any) => void;
};

type Profile = {
  id: string;
  audience: string;
  title: string;
  answer: string;
  evidence: string[];
  limitations: string[];
};

const PROFILES: Profile[] = [
  {
    id: "buy-and-hold",
    audience: "Stabilized long-term rentals",
    title: "Buy-and-hold investor",
    answer: "A long-term rental scenario usually starts with documented lease income or a market-rent opinion and the full proposed PITIA payment.",
    evidence: ["Lease or rent schedule", "Purchase contract or mortgage statement", "Entity and ownership documents", "Insurance and reserve evidence"],
    limitations: ["Credit, assets, appraisal, property condition, and provider rules may still apply.", "A modeled DSCR above 1.00x only means rent exceeds the entered payment; it is not an eligibility threshold."],
  },
  {
    id: "non-us",
    audience: "Cross-border rental ownership",
    title: "Non-US investor",
    answer: "A foreign-national or ITIN scenario adds identity, country, sanctions, credit-alternative, funds-source, entity, and remote-closing questions to the property analysis.",
    evidence: ["Government-issued identity documents", "Traceable funds and reserves", "Permitted vesting documents", "Property and closing records"],
    limitations: ["Provider availability varies by country, residency, property, and transaction.", "Tax, estate, entity, and foreign-exchange questions require qualified third-party advice."],
  },
  {
    id: "short-term-rental",
    audience: "Nightly and seasonal income",
    title: "Short-term rental host",
    answer: "An STR scenario should separate documented historical revenue, market assumptions, seasonality, operating costs, and the income method a provider permits.",
    evidence: ["Platform or management statements", "Permit and local-use evidence", "HOA and insurance terms", "Seasonal revenue assumptions"],
    limitations: ["Gross platform revenue is not automatically qualifying income.", "Local rules, permits, insurance, and provider income methods can change the result."],
  },
  {
    id: "vacation-rental",
    audience: "Mixed personal and rental use",
    title: "Vacation rental owner",
    answer: "Intended occupancy comes first: business-purpose DSCR financing is generally designed for non-owner-occupied investment property, so personal use may change the available path.",
    evidence: ["Accurate occupancy disclosure", "Rental plan and income support", "Appropriate insurance", "Property-use and HOA records"],
    limitations: ["A gross rental-income offset does not establish DSCR eligibility.", "Seasonal and personal-use assumptions should be reviewed before choosing a financing category."],
  },
  {
    id: "portfolio",
    audience: "Multiple rental properties",
    title: "Portfolio builder",
    answer: "A portfolio review should show property-level inputs before any blended summary so one strong asset does not hide a weak or restricted property.",
    evidence: ["Property schedule and rent roll", "Current debt statements", "Entity ownership chart", "Property-level insurance and taxes"],
    limitations: ["Blanket, cross-collateral, and release structures vary by provider.", "A blended model is a planning view, not a substitute for property-level underwriting."],
  },
];

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    const setMeta = (key: string, value: string, property = false) => {
      const attribute = property ? "property" : "name";
      let tag = document.head.querySelector("meta[" + attribute + "='" + key + "']") as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.content = value;
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(path, window.location.origin).href;
    window.scrollTo(0, 0);
  }, [description, path, title]);
}

function RouteLink({ href, view, onNavigate, children, className = "" }: {
  href: string;
  view: string;
  onNavigate: (view: any) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); onNavigate(view); }}>{children}</a>;
}

export default function BorrowerProfilesPage({ onNavigate }: PageProps) {
  usePageMetadata(
    "DSCR Borrower Profiles and Eligibility Questions | Greenstreet Finance",
    "Compare the evidence, eligibility questions, and limitations that differ for buy-and-hold, STR, non-US, vacation-rental, and portfolio scenarios.",
    "/borrower-profiles",
  );

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[{ label: "Solutions", view: "solutions" }, { label: "Products", view: "products" }, { label: "DSCR Calc", view: "dscr-calculator" }]}
      cta={{ label: "Model a scenario", view: "dscr-calculator" }}
    >
      <style>{`
        .bp-page{background:#eeefd3;color:#003738}.bp-wrap{width:min(1180px,calc(100% - 40px));margin:auto}
        .bp-hero{background:#003738;color:#eeefd3;padding:clamp(64px,9vw,120px) 0}.bp-kicker{color:#d8d958;font-size:.75rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
        .bp-hero h1{font-size:clamp(2.6rem,7vw,5.8rem);line-height:.94;letter-spacing:-.045em;max-width:12ch;margin:18px 0 24px}
        .bp-lead{font-size:clamp(1.05rem,2vw,1.3rem);line-height:1.55;max-width:65ch;color:rgba(238,239,211,.76)}
        .bp-actions,.bp-jumps{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.bp-link{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:7px;background:#d8d958;color:#003738;font-weight:800;text-decoration:none}
        .bp-link.secondary{background:transparent;color:#eeefd3;border:1px solid rgba(238,239,211,.35)}.bp-jumps a{color:#003738;font-weight:750;text-decoration-thickness:1px;text-underline-offset:4px}
        .bp-intro,.bp-profiles,.bp-next{padding:clamp(64px,8vw,108px) 0}.bp-intro-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(28px,6vw,88px)}
        .bp-page h2{font-size:clamp(2rem,4vw,3.8rem);line-height:1;letter-spacing:-.035em;margin:0 0 18px}.bp-page h3{font-size:clamp(1.35rem,2.4vw,2rem);margin:0}
        .bp-copy{font-size:1.05rem;line-height:1.65;color:rgba(0,55,56,.72);margin:0}.bp-profiles{background:#dfe7c5}.bp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:38px}
        .bp-card{background:#eeefd3;border:1px solid rgba(0,55,56,.18);border-radius:12px;padding:clamp(22px,3vw,34px);min-width:0}.bp-card:first-child{grid-column:1/-1}
        .bp-audience{color:#287a84;font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}.bp-answer{line-height:1.6;margin:16px 0 24px;color:rgba(0,55,56,.78)}
        .bp-columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.bp-columns h4{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;margin:0 0 10px}.bp-columns ul{padding-left:20px;margin:0}.bp-columns li{line-height:1.5;margin:8px 0}
        .bp-note{border-left:4px solid #d8d958;padding:18px 20px;background:rgba(216,217,88,.18);line-height:1.6;margin-top:28px}
        .bp-next{background:#003738;color:#eeefd3}.bp-next-grid{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end}.bp-next p{color:rgba(238,239,211,.7);max-width:60ch;line-height:1.6}
        .bp-page a:focus-visible{outline:3px solid #7ec8d3;outline-offset:4px}.bp-card:target{outline:3px solid #287a84;outline-offset:4px}
        @media(max-width:760px){.bp-wrap{width:min(100% - 28px,1180px)}.bp-intro-grid,.bp-grid,.bp-columns,.bp-next-grid{grid-template-columns:1fr}.bp-card:first-child{grid-column:auto}.bp-actions .bp-link{width:100%;justify-content:center}.bp-hero h1{overflow-wrap:anywhere}}
        @media(prefers-reduced-motion:reduce){.bp-page *{scroll-behavior:auto!important}}
      `}</style>
      <div className="bp-page">
        <header className="bp-hero">
          <div className="bp-wrap">
            <div className="bp-kicker">DSCR borrower profile guide</div>
            <h1>Match the property scenario to the borrower profile.</h1>
            <p className="bp-lead">A borrower profile is the set of identity, ownership, credit, asset, property-use, and documentation questions that sits beside the rent-coverage calculation. It helps organize a review; it does not establish program eligibility.</p>
            <div className="bp-actions">
              <RouteLink className="bp-link" href="/tools/dscr-calculator" view="dscr-calculator" onNavigate={onNavigate}>Model property coverage</RouteLink>
              <a className="bp-link secondary" href="#profiles">Compare borrower profiles</a>
            </div>
          </div>
        </header>

        <section className="bp-intro" aria-labelledby="bp-definition">
          <div className="bp-wrap bp-intro-grid">
            <div>
              <div className="bp-kicker" style={{ color: dc.rain }}>What this page does</div>
              <h2 id="bp-definition">Separate the model from the terms.</h2>
            </div>
            <div>
              <p className="bp-copy">The scenarios below describe common review questions, not current rate-sheet requirements. Actual DSCR minimums, leverage, credit, reserves, property types, states, pricing, and documents vary by provider and can change.</p>
              <nav className="bp-jumps" aria-label="Borrower profile sections">
                {PROFILES.map((profile) => <a key={profile.id} href={"#" + profile.id}>{profile.title}</a>)}
              </nav>
              <div className="bp-note"><strong>Start with use and ownership.</strong> Confirm whether the property is non-owner-occupied, how title will be held, where funds come from, and which income evidence is available before comparing any program terms.</div>
            </div>
          </div>
        </section>

        <section id="profiles" className="bp-profiles" aria-labelledby="bp-profiles-heading">
          <div className="bp-wrap">
            <div className="bp-kicker" style={{ color: dc.rain }}>Audience profiles</div>
            <h2 id="bp-profiles-heading">Questions that change with the file.</h2>
            <div className="bp-grid">
              {PROFILES.map((profile) => (
                <article className="bp-card" id={profile.id} key={profile.id}>
                  <div className="bp-audience">{profile.audience}</div>
                  <h3>{profile.title}</h3>
                  <p className="bp-answer">{profile.answer}</p>
                  <div className="bp-columns">
                    <div><h4>Evidence to organize</h4><ul>{profile.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div><h4>Limits to verify</h4><ul>{profile.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bp-next" aria-labelledby="bp-next-heading">
          <div className="bp-wrap bp-next-grid">
            <div>
              <div className="bp-kicker">Next useful step</div>
              <h2 id="bp-next-heading">Build a scenario, then request current terms.</h2>
              <p>Enter property and payment assumptions first. If the model is worth pursuing, gather the profile-specific evidence and ask the applicable provider to confirm eligibility, pricing, documents, and jurisdictional limits.</p>
            </div>
            <div className="bp-actions">
              <RouteLink className="bp-link" href="/tools/dscr-calculator" view="dscr-calculator" onNavigate={onNavigate}>Open the DSCR calculator</RouteLink>
              <RouteLink className="bp-link secondary" href="/solutions" view="solutions" onNavigate={onNavigate}>Explore investor solutions</RouteLink>
            </div>
          </div>
        </section>
      </div>
    </DcShell>
  );
}

