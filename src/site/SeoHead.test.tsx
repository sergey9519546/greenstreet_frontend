// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./seo", () => ({
  SITE_NAME: "Greenstreet",
  absoluteUrl: (path: string) => `https://greenstreet.example${path}`,
  getPageSeo: (pathname: string) => ({
    title: pathname === "/private" ? "Private" : "Public",
    description: pathname === "/private" ? "Private description" : "Public description",
    canonicalPath: pathname === "/private" ? null : pathname,
    indexable: pathname !== "/private",
  }),
  buildStructuredData: (seo: { title: string }) => seo.title === "Private" ? null : ({
    "@context": "https://schema.org",
    name: seo.title,
    nonFinite: Number.POSITIVE_INFINITY,
    markup: "</script><script>alert(1)</script>",
  }),
}));

import SeoHead from "./SeoHead";

afterEach(() => {
  document.head.innerHTML = "";
  document.documentElement.removeAttribute("lang");
});

describe("SeoHead", () => {
  it("deduplicates stable core tags and removes stale data on navigation", async () => {
    document.head.innerHTML = `
      <title>Old</title><title>Duplicate</title>
      <meta name="description" content="old"><meta name="description" content="duplicate">
      <meta name="robots" content="old"><meta name="robots" content="duplicate">
      <link rel="canonical" href="https://stale.example"><link rel="canonical" href="https://duplicate.example">
      <script id="greenstreet-structured-data" type="application/ld+json">{"stale":true}</script>
    `;
    const host = document.createElement("div");
    const root = createRoot(host);

    act(() => root.render(<SeoHead pathname="/public" view={{} as never} />));
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.title).toBe("Public");

    await act(async () => {
      document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", "/relative");
      await Promise.resolve();
    });
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://greenstreet.example/public"
    );

    const script = document.getElementById("greenstreet-structured-data");
    expect(script?.textContent).not.toContain("nonFinite");
    expect(script?.textContent).not.toContain("</script>");

    act(() => root.render(<SeoHead pathname="/private" view={{} as never} />));
    expect(document.title).toBe("Private");
    expect(document.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe(
      "noindex, nofollow, noarchive"
    );
    expect(document.head.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(0);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);
    expect(document.head.querySelectorAll('meta[property="og:url"]')).toHaveLength(0);

    await act(async () => {
      const staleCanonical = document.createElement("link");
      staleCanonical.rel = "canonical";
      staleCanonical.href = "/private";
      document.head.appendChild(staleCanonical);
      await Promise.resolve();
    });
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(0);

    act(() => root.unmount());
    expect(document.head.querySelectorAll('[data-greenstreet-seo="managed"]')).toHaveLength(0);
  });
});
