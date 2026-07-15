import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead } from "../design/dc";
import { radius } from "../theme";

const SUPPORT_PATHS = [
  { title: "Getting started", body: "See what the scenario tools estimate, which inputs are required, and where provider review begins.", label: "Read how scenario analysis works", href: "/how-it-works", view: "how-it-works" },
  { title: "DSCR concepts", body: "Review plain-language explanations of DSCR, PITIA, LTV, rent inputs, and common assumptions.", label: "Browse DSCR questions and answers", href: "/faq", view: "faq" },
  { title: "Rates and programs", body: "Learn why pricing and eligibility vary and why transaction-specific terms require provider confirmation.", label: "Review rate and program limitations", href: "/faq", view: "faq" },
  { title: "State-rule summaries", body: "Use state content as an educational starting point, then verify current law with qualified counsel.", label: "Browse state-rule summaries", href: "/state-laws", view: "state-laws" },
  { title: "Results and limitations", body: "Model your own inputs while keeping estimates separate from underwriting, approval, and commitments.", label: "Open the educational DSCR calculator", href: "/dscr-calculator", view: "dscr-calculator" },
  { title: "Privacy and disclosures", body: "Review the site's current terms, privacy information, and boundaries before submitting information.", label: "Read privacy and legal disclosures", href: "/legal", view: "legal" },
];

const SUPPORT_CSS = `
  .support-page { overflow-wrap: anywhere; }
  .support-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .support-shortcuts { display: flex; flex-wrap: wrap; gap: 12px; }
  .support-link:focus-visible { outline: 3px solid #00a878; outline-offset: 4px; }
  @media (max-width: 900px) { .support-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) {
    .support-grid { grid-template-columns: 1fr; }
    .support-shortcuts { flex-direction: column; align-items: stretch; }
    .support-shortcuts .support-link { text-align: center; }
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

export default function SupportPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (v: any) => void;
}) {
  usePageMetadata(
    "DSCR Calculator Help & Support | Greenstreet Finance",
    "Find Greenstreet Finance help for DSCR concepts, calculator inputs, state summaries, result limitations, privacy, and transaction-specific review.",
    "/support",
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const navigate = (event: React.MouseEvent<HTMLAnchorElement>, view: string) => {
    event.preventDefault();
    onNavigate(view);
  };

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[{ label: "FAQ", view: "faq" }, { label: "DSCR Calc", view: "dscr-calculator" }, { label: "Disclosures", view: "legal" }]}
      cta={{ label: "Browse the FAQ →", view: "faq" }}
    >
      <style>{SUPPORT_CSS}</style>
      <div className="support-page">
        <section aria-labelledby="support-title" style={{ background: dc.mintBg, padding: `clamp(56px,8vw,104px) ${dc.pad}` }}>
          <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
            <p style={{ color: dc.rain, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 18px" }}>Help &amp; Support</p>
            <H1 id="support-title" style={{ maxWidth: "20ch", margin: "0 0 20px" }}>Understand a DSCR scenario and its limits.</H1>
            <Lead style={{ color: "rgba(0,55,56,0.68)", maxWidth: "58ch", margin: "0 0 30px" }}>Use these self-service resources to understand inputs, review an estimate, and identify questions that still require a financing provider or qualified professional.</Lead>
            <nav className="support-shortcuts" aria-label="Primary support resources">
              <a className="support-link" href="/faq" onClick={(event) => navigate(event, "faq")} style={{ background: dc.dark, color: dc.cream, borderRadius: radius.sm, padding: "13px 22px", fontWeight: 700, textDecoration: "none" }}>Browse DSCR questions and answers</a>
              <a className="support-link" href="/dscr-calculator" onClick={(event) => navigate(event, "dscr-calculator")} style={{ color: dc.dark, border: `1px solid ${dc.faded}`, borderRadius: radius.sm, padding: "13px 22px", fontWeight: 700, textDecoration: "none" }}>Open the educational calculator</a>
            </nav>
          </div>
        </section>

        <section aria-labelledby="support-paths-title" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
          <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
            <h2 id="support-paths-title" style={{ color: dc.dark, fontSize: "clamp(28px,3.5vw,46px)", letterSpacing: "-0.03em", margin: "0 0 14px" }}>Choose the guidance that matches your question.</h2>
            <p style={{ color: "rgba(0,55,56,0.66)", lineHeight: 1.65, maxWidth: "68ch", margin: "0 0 34px" }}>These pages provide educational context, not transaction-specific underwriting, legal advice, tax advice, approval, pricing, or a commitment to lend.</p>
            <div className="support-grid">
              {SUPPORT_PATHS.map((path) => (
                <article key={path.title} style={{ background: dc.white, border: `1px solid ${dc.faded}`, borderRadius: radius.md, padding: "clamp(22px,3vw,30px)", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ color: dc.dark, fontSize: 20, margin: "0 0 10px" }}>{path.title}</h3>
                  <p style={{ color: "rgba(0,55,56,0.66)", lineHeight: 1.6, margin: "0 0 22px", flex: 1 }}>{path.body}</p>
                  <a className="support-link" href={path.href} onClick={(event) => navigate(event, path.view)} style={{ color: dc.rain, fontWeight: 700, lineHeight: 1.4 }}>{path.label} →</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="support-check-title" style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px,6vw,76px) ${dc.pad}` }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 id="support-check-title" style={{ fontSize: "clamp(27px,3.4vw,42px)", margin: "0 0 18px" }}>Before relying on a result</h2>
            <ul style={{ color: "rgba(238,239,211,0.74)", lineHeight: 1.7, paddingLeft: 22, margin: "0 0 26px" }}>
              <li>Replace placeholders with property-specific, current inputs.</li>
              <li>Confirm the provider's definitions, program terms, fees, and required documents.</li>
              <li>Use qualified legal, tax, insurance, or other professional guidance where the question requires it.</li>
            </ul>
            <a className="support-link" href="/legal" onClick={(event) => navigate(event, "legal")} style={{ color: dc.lemon, fontWeight: 700 }}>Read Greenstreet Finance disclosures and privacy information →</a>
          </div>
        </section>
      </div>
    </DcShell>
  );
}
