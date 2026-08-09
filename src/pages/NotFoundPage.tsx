import React, { useEffect } from "react";
import { DcShell, Mono } from "../design/dc";
import { radius, swatch, type } from "../theme";

export default function NotFoundPage({
  onNavigate,
}: {
  onNavigate: (view: any) => void;
}) {
  useEffect(() => {
    document.title = "Page Not Found | Greenstreet Finance";
    window.scrollTo(0, 0);

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousContent = robots?.content;
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";

    return () => {
      if (created) robots?.remove();
      else if (robots && previousContent !== undefined) robots.content = previousContent;
    };
  }, []);

  return (
    <DcShell onNavigate={onNavigate}>
      <div
        style={{
          minHeight: "68vh",
          display: "grid",
          placeItems: "center",
          padding: "clamp(56px, 9vw, 120px) clamp(1.5rem, 4vw, 4rem)",
          background: swatch.pistachio,
        }}
      >
        <section aria-labelledby="not-found-heading" style={{ width: "100%", maxWidth: 920 }}>
          <Mono
            style={{
              display: "block",
              color: swatch.rainforest,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 22,
            }}
          >
            404 / Route not found
          </Mono>
          <h1
            id="not-found-heading"
            style={{
              maxWidth: "12ch",
              margin: 0,
              color: swatch.midnight,
              fontSize: type.h1,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
            }}
          >
            This page is not part of Greenstreet.
          </h1>
          <p
            style={{
              maxWidth: "48ch",
              margin: "26px 0 0",
              color: "rgba(0,55,56,.68)",
              fontSize: 18,
              lineHeight: 1.55,
            }}
          >
            The address may be outdated or mistyped. Return to the homepage or
            open the DSCR calculator.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("marketing");
              }}
              style={{
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: radius.sm,
                color: swatch.midnight,
                background: swatch.lemon,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Return home →
            </a>
            <a
              href="/dscr-calculator"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("dscr-calculator");
              }}
              style={{
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 22px",
                borderRadius: radius.sm,
                border: `1px solid ${swatch.midnightFaded}`,
                color: swatch.midnight,
                background: "transparent",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Open calculator
            </a>
          </div>
        </section>
      </div>
    </DcShell>
  );
}
