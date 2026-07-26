import React, { useEffect } from "react";
import { DcShell, dc, H1, Lead } from "../design/dc";

export default function CareersPage({
  onNavigate,
}: {
  onBack?: () => void;
  onNavigate: (view: any) => void;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <DcShell
      onNavigate={onNavigate}
      accent={dc.dark}
      navLinks={[
        { label: "About", view: "about" },
        { label: "Products", view: "products" },
      ]}
      cta={{ label: "Check a deal →", view: "dscr-calculator" }}
    >
      <section
        style={{
          minHeight: "65vh",
          background: dc.dark,
          color: dc.cream,
          padding: `clamp(72px,10vh,136px) ${dc.pad}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, width: "100%", margin: "0 auto" }}>
          <div
            style={{
              color: dc.lemon,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Careers
          </div>
          <H1 style={{ maxWidth: "18ch", margin: "0 0 26px" }}>
            No verified openings are published right now.
          </H1>
          <Lead style={{ color: "rgba(238,239,211,.68)", maxWidth: "55ch", margin: "0 0 34px" }}>
            The previous page listed roles that were not backed by an approved
            recruiting source. They have been removed. Future openings should
            name the legal employer, location, employment type, compensation
            information where required, and a monitored application channel.
          </Lead>
          <button
            onClick={() => onNavigate("about")}
            style={{
              background: dc.lemon,
              color: dc.dark,
              border: 0,
              borderRadius: 6,
              padding: "13px 24px",
              font: "inherit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            About Greenstreet →
          </button>
        </div>
      </section>
    </DcShell>
  );
}
