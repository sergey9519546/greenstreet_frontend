import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead, ScenePhoto } from "../design/dc";
import { radius } from "../theme";

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

const CAREERS_CSS = `
  .careers-link:focus-visible { outline: 3px solid #00a878; outline-offset: 4px; }
  @media (max-width: 420px) { .careers-standards { grid-template-columns: 1fr !important; } }
`;

const STANDARDS = [
  {
    title: "Verified openings only",
    desc: "A role should appear here only after its title, status, location, engagement type, application route, and owner are confirmed.",
  },
  {
    title: "No speculative benefits",
    desc: "Compensation, equity, work model, start date, and benefits should be stated only in an approved posting or offer document.",
  },
  {
    title: "Clear application handling",
    desc: "A future posting should explain how applicant information is used, who receives it, and how candidates can exercise applicable privacy rights.",
  },
  {
    title: "Accessible opportunity",
    desc: "Approved postings should include the applicable equal-opportunity and accommodation information for the hiring entity and jurisdiction.",
  },
];

export default function CareersPage({
  onBack: _onBack,
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate?: (v: any) => void;
}) {
  usePageMetadata(
    "Careers at Greenstreet Finance | Hiring Status",
    "See Greenstreet Finance's current hiring status and the verification, privacy, and accessibility standards required before an opening is published.",
    "/careers",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      navLinks={[
        { label: "About", view: "about" },
        { label: "Support", view: "support" },
        { label: "Disclosures", view: "legal" },
      ]}
      cta={{ label: "About Greenstreet →", view: "about" }}
    >
      <style>{CAREERS_CSS}</style>
      <section
        aria-labelledby="careers-title"
        style={{
          background: dc.mintBg,
          padding: `clamp(64px,9vh,128px) ${dc.pad} clamp(56px,7vh,88px)`,
          overflow: "hidden",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,55,56,0.55)", marginBottom: 22 }}>
            Careers
          </div>
          <H1 id="careers-title" style={{ margin: "0 0 20px", maxWidth: "17ch" }}>
            No verified openings are currently published.
          </H1>
          <Lead style={{ color: "rgba(0,55,56,0.68)", maxWidth: "52ch", margin: 0 }}>
            Greenstreet Finance does not currently present any role, team, location,
            compensation, equity, benefit, or hiring-timeline claim on this page.
            Future openings will be listed only after the hiring entity and
            application process are verified.
          </Lead>
        </div>
      </section>

      <section aria-labelledby="careers-standards-title" style={{ background: dc.cream, padding: `clamp(56px,7vw,96px) ${dc.pad}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div
            style={{
              background: dc.white,
              border: `1px solid ${dc.dark}20`,
              borderRadius: radius.md,
              padding: "clamp(28px,4vw,48px)",
              marginBottom: 48,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: dc.rain, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Current status
            </div>
            <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 14px", color: dc.dark }}>
              No application channel is being advertised.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(0,55,56,0.65)", margin: 0, maxWidth: "68ch" }}>
              Do not send sensitive personal information in response to an
              unverified job listing or address. An approved opening should appear
              on this page with a role-specific application path and privacy notice.
            </p>
          </div>

          <h2 id="careers-standards-title" style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 32px", color: dc.dark }}>
            Publication standards for future roles
          </h2>
          <div className="careers-standards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: `${dc.dark}20`, borderRadius: radius.md, overflow: "hidden" }}>
            {STANDARDS.map((item) => (
              <div key={item.title} style={{ background: dc.white, padding: "30px 26px" }}>
                <h3 style={{ fontSize: 19, fontWeight: 600, color: dc.dark, margin: "0 0 10px" }}>{item.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(0,55,56,0.62)", margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ScenePhoto
        src="/img/generated/scenes/two-person-meeting.png"
        alt="Illustrative workspace meeting scene"
        eyebrow="Illustrative image"
        caption="This image does not depict verified Greenstreet Finance employees or an active hiring process."
      />

      <section aria-labelledby="careers-next-step-title" style={{ background: dc.dark, color: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 id="careers-next-step-title" style={{ fontSize: "clamp(28px,3.6vw,48px)", fontWeight: 600, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
            Learn what the product is designed to do.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(238,239,211,0.65)", margin: "0 auto 24px", maxWidth: "52ch" }}>
            The About page explains the current product purpose, limitations, and
            facts that still require verification.
          </p>
          <a
            className="careers-link"
            href="/about"
            onClick={(event) => { event.preventDefault(); onNavigate?.("about"); }}
            style={{ display: "inline-block", background: dc.lemon, color: dc.dark, borderRadius: radius.sm, padding: "14px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: dc.sans, textDecoration: "none" }}
          >
            Read about Greenstreet →
          </a>
        </div>
      </section>
    </DcShell>
  );
}
