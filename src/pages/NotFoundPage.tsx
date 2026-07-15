import { useEffect } from "react";

const NOT_FOUND_CSS = `
  .not-found-page { overflow-wrap: anywhere; }
  .not-found-link:focus-visible { outline: 3px solid #d8d958; outline-offset: 4px; }
  @media (max-width: 420px) {
    .not-found-links { flex-direction: column; align-items: stretch; }
    .not-found-link { text-align: center; }
  }
`;

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found | Greenstreet Finance";
    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = "This Greenstreet Finance page could not be found. Use the recovery links to return home, open the DSCR calculator, or browse support resources.";
    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.name = "robots";
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = "noindex, follow";
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(window.location.pathname, window.location.origin).href;
  }, []);

  return (
    <main className="not-found-page" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "clamp(20px,6vw,48px)", background: "radial-gradient(circle at 20% 10%, #164f4c 0, #062f31 36%, #001f22 100%)", color: "#f5f2da" }}>
      <style>{NOT_FOUND_CSS}</style>
      <section style={{ width: "100%", maxWidth: 720, textAlign: "center" }} aria-labelledby="not-found-title">
        <p style={{ margin: 0, color: "#d8d958", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Error 404</p>
        <h1 id="not-found-title" style={{ margin: "14px 0 16px", fontSize: "clamp(2.3rem,8vw,5.5rem)", lineHeight: 0.98 }}>This page could not be found.</h1>
        <p style={{ margin: "0 auto 28px", maxWidth: 580, color: "#c4d8d3", fontSize: "clamp(1rem,3vw,1.1rem)", lineHeight: 1.7 }}>The address may be outdated, incomplete, or unavailable. Choose a verified destination below to continue.</p>
        <nav className="not-found-links" aria-label="Page recovery links" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <a className="not-found-link" href="/" style={{ padding: "12px 20px", borderRadius: 999, background: "#d8d958", color: "#003738", fontWeight: 800, textDecoration: "none" }}>Return to the Greenstreet Finance home page</a>
          <a className="not-found-link" href="/dscr-calculator" style={{ padding: "12px 20px", border: "1px solid #6f9690", borderRadius: 999, color: "#f5f2da", fontWeight: 700, textDecoration: "none" }}>Open the DSCR calculator</a>
          <a className="not-found-link" href="/blog" style={{ padding: "12px 20px", border: "1px solid #6f9690", borderRadius: 999, color: "#f5f2da", fontWeight: 700, textDecoration: "none" }}>Browse published DSCR guidance</a>
          <a className="not-found-link" href="/support" style={{ padding: "12px 20px", color: "#d8d958", fontWeight: 700 }}>Open help and support</a>
        </nav>
      </section>
    </main>
  );
}
