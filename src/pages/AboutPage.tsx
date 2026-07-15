import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, ScenePhoto } from "../design/dc";

const PRINCIPLES = [
  { title: "Preliminary by default", body: "A scenario is an educational estimate, not an approval, commitment, rate lock, legal conclusion, or instruction to proceed." },
  { title: "Visible assumptions", body: "Users should be able to identify the rent, payment, leverage, expense, and program assumptions that shape an output." },
  { title: "Transaction documents control", body: "Provider identity, role, licensing, pricing, credit decisions, and final terms must come from transaction-specific disclosures." },
  { title: "High-stakes claims need review", body: "Program, legal, tax, and eligibility information should be checked against current sources and qualified professional guidance." },
];

const ACCOUNTABILITY = [
  { title: "Inputs", body: "Results depend on the property and financing assumptions entered." },
  { title: "Method", body: "Scenario outputs should expose the formulas and assumptions used." },
  { title: "Sources", body: "Material program and legal claims require dated, reviewable sources." },
  { title: "Review", body: "A qualified transaction party must verify results before reliance." },
];

const PUBLIC_FACTS = [
  "Legal entity and business role",
  "Licensing and jurisdictions served",
  "Leadership and professional credentials",
  "Capital, lender, and service-provider relationships",
];

const ABOUT_CSS = `
  .about-page { overflow-wrap: anywhere; }
  .about-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .about-accountability { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
  .about-actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .about-link:focus-visible { outline: 3px solid #00a878; outline-offset: 4px; }
  @media (max-width: 850px) { .about-accountability { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) {
    .about-grid, .about-accountability { grid-template-columns: 1fr; }
    .about-actions { flex-direction: column; align-items: stretch; }
    .about-actions .about-link { text-align: center; }
  }
`;

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.name = "robots";
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = "index, follow";

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(path, window.location.origin).href;
  }, [description, path, title]);
}

export default function AboutPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate: (view: any) => void;
}) {
  usePageMetadata(
    "About Greenstreet Finance | DSCR Scenario Tools",
    "Learn how Greenstreet Finance structures preliminary DSCR scenarios, identifies assumptions, and separates educational estimates from provider decisions.",
    "/about",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    event.preventDefault();
    onNavigate(view);
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.lemon}
      navLinks={[
        { label: "Product", view: "products" },
        { label: "Careers", view: "careers" },
        { label: "Support", view: "support" },
      ]}
      cta={{ label: "Model a scenario →", view: "dscr-calculator" }}
    >
      <style>{ABOUT_CSS}</style>
      <div className="about-page">
        <section aria-labelledby="about-title" style={{ background: dc.lemon, color: dc.dark, padding: `clamp(60px,9vw,120px) ${dc.pad}` }}>
          <div id="gs-hero-content" style={{ maxWidth: 1080, margin: "0 auto" }}>
            <p style={{ margin: "0 0 20px", color: "rgba(0,55,56,0.58)", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>About Greenstreet Finance</p>
            <H1 id="about-title" style={{ margin: "0 0 24px", maxWidth: "24ch" }}>DSCR scenario analysis for rental-property decisions.</H1>
            <Lead style={{ color: "rgba(0,55,56,0.72)", maxWidth: "58ch", margin: "0 0 30px" }}>Greenstreet Finance provides educational tools for exploring how rental income, proposed debt payments, leverage, expenses, and selected assumptions may affect a DSCR scenario. Outputs are preliminary estimates, not approvals or commitments to lend.</Lead>
            <nav className="about-actions" aria-label="About page next steps">
              <a className="about-link" href="/dscr-calculator" onClick={(event) => navigate(event, "dscr-calculator")} style={{ background: dc.dark, color: dc.cream, borderRadius: 6, padding: "13px 24px", fontWeight: 700, textDecoration: "none" }}>Model a preliminary DSCR scenario</a>
              <a className="about-link" href="/how-it-works" onClick={(event) => navigate(event, "how-it-works")} style={{ color: dc.dark, border: "1px solid rgba(0,55,56,0.3)", borderRadius: 6, padding: "13px 24px", fontWeight: 700, textDecoration: "none" }}>See how scenario analysis works</a>
            </nav>
          </div>
        </section>

        <ScenePhoto
          src="/img/generated/scenes/office-window-team.png"
          alt="Illustrative workspace for reviewing rental-property scenario inputs"
          eyebrow="Illustrative image"
          caption="This image does not depict verified Greenstreet Finance employees. Final eligibility, pricing, and terms come from the provider identified in transaction disclosures."
          style={{ background: dc.cream }}
        />

        <section aria-labelledby="about-purpose-title" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
          <div className="about-grid" style={{ maxWidth: dc.maxW, margin: "0 auto", alignItems: "start" }}>
            <div>
              <p style={{ color: dc.rain, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Purpose and boundary</p>
              <h2 id="about-purpose-title" style={{ color: dc.dark, fontSize: "clamp(28px,3.7vw,48px)", lineHeight: 1.05, margin: 0 }}>Clearer inputs, assumptions, and questions.</h2>
            </div>
            <div style={{ color: "rgba(0,55,56,0.7)", fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.65 }}>
              <p style={{ margin: "0 0 18px" }}>Greenstreet Finance is designed to organize a rental property's income, proposed debt payment, leverage, and operating assumptions in one scenario.</p>
              <p style={{ margin: 0 }}>The result is a starting point for comparison and discussion. It does not replace underwriting, legal, tax, insurance, or financial review.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="about-principles-title" style={{ background: dc.mintBg, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
            <h2 id="about-principles-title" style={{ color: dc.dark, fontSize: "clamp(28px,3.5vw,46px)", margin: "0 0 32px" }}>Principles for Greenstreet scenario tools</h2>
            <div className="about-grid">
              {PRINCIPLES.map((principle) => (
                <article key={principle.title} style={{ background: dc.cream, border: `1px solid ${dc.faded}`, borderRadius: dc.r.md, padding: "clamp(24px,3vw,34px)" }}>
                  <h3 style={{ color: dc.dark, fontSize: 20, margin: "0 0 10px" }}>{principle.title}</h3>
                  <p style={{ color: "rgba(0,55,56,0.66)", lineHeight: 1.65, margin: 0 }}>{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="about-accountability-title" style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
            <h2 id="about-accountability-title" style={{ fontSize: "clamp(30px,4vw,52px)", margin: "0 0 32px" }}>How to read a Greenstreet scenario</h2>
            <ol className="about-accountability" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {ACCOUNTABILITY.map((item, index) => (
                <li key={item.title} style={{ background: dc.teal, borderRadius: dc.r.md, padding: 24 }}>
                  <p aria-hidden="true" style={{ color: dc.lemon, fontWeight: 800, margin: "0 0 18px" }}>0{index + 1}</p>
                  <h3 style={{ fontSize: 20, margin: "0 0 8px" }}>{item.title}</h3>
                  <p style={{ color: "rgba(238,239,211,0.7)", lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="about-public-title" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
          <div className="about-grid" style={{ maxWidth: dc.maxW, margin: "0 auto", alignItems: "start" }}>
            <div>
              <h2 id="about-public-title" style={{ color: dc.dark, fontSize: "clamp(28px,3.5vw,46px)", margin: "0 0 16px" }}>Public facts require support.</h2>
              <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.65, margin: "0 0 24px" }}>Greenstreet Finance does not present company credentials, relationships, or performance claims here unless the responsible owner has verified them.</p>
              <a className="about-link" href="/legal" onClick={(event) => navigate(event, "legal")} style={{ color: dc.rain, fontWeight: 700 }}>Read current disclosures and limitations →</a>
            </div>
            <ul style={{ background: dc.mintBg, borderRadius: dc.r.md, padding: "24px 24px 24px 44px", margin: 0 }}>
              {PUBLIC_FACTS.map((fact) => <li key={fact} style={{ color: dc.dark, lineHeight: 1.55, marginBottom: 12 }}>{fact}</li>)}
            </ul>
          </div>
        </section>

        <section aria-labelledby="about-next-title" style={{ background: dc.rain, color: dc.cream, padding: `clamp(48px,6vw,76px) ${dc.pad}` }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 id="about-next-title" style={{ fontSize: "clamp(28px,3.6vw,46px)", margin: "0 0 16px" }}>Choose a useful next step.</h2>
            <p style={{ color: "rgba(238,239,211,0.76)", lineHeight: 1.65, maxWidth: "60ch", margin: "0 0 24px" }}>Model your own assumptions or review the support hub before relying on a scenario.</p>
            <nav className="about-actions" aria-label="About Greenstreet next steps">
              <a className="about-link" href="/dscr-calculator" onClick={(event) => navigate(event, "dscr-calculator")} style={{ background: dc.lemon, color: dc.dark, borderRadius: 6, padding: "13px 22px", fontWeight: 700, textDecoration: "none" }}>Open the educational calculator</a>
              <a className="about-link" href="/support" onClick={(event) => navigate(event, "support")} style={{ color: dc.cream, border: "1px solid rgba(238,239,211,0.5)", borderRadius: 6, padding: "13px 22px", fontWeight: 700, textDecoration: "none" }}>Browse help and support</a>
            </nav>
          </div>
        </section>
      </div>
    </DcShell>
  );
}
