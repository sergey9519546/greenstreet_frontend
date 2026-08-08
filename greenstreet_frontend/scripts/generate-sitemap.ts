/**
 * Generates public/sitemap.xml from the registries that already define the site,
 * so the sitemap can never drift from the routes again.
 *
 * The contract asserted by src/site/seo.test.ts and src/seo/sitemap.test.ts is:
 *
 *     sitemap === (CANONICAL_PUBLIC_PATHS − TOOL_RELIABILITY_HOLDS paths) + every blog slug
 *
 * A canonical path is a route the site intends to publish; a reliability hold is a
 * governance decision that it must not be published yet. Submitting a held route to
 * Google is the SEO equivalent of shipping it, so held paths are excluded here and
 * return automatically the moment their hold record is deleted.
 *
 * Run: npx tsx scripts/generate-sitemap.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { CANONICAL_PUBLIC_PATHS, absoluteUrl } from "../src/site/seo";
import { TOOL_RELIABILITY_HOLDS } from "../src/components/toolReliabilityHolds";

const ROOT = resolve(import.meta.dirname, "..");

/** Priority/frequency by path shape. Homepage first, tools above prose. */
function rank(path: string): { changefreq: string; priority: string } {
  if (path === "/") return { changefreq: "weekly", priority: "1.0" };
  if (path.startsWith("/blog/")) return { changefreq: "monthly", priority: "0.7" };
  if (path === "/dscr-calculator") return { changefreq: "monthly", priority: "0.9" };
  if (path === "/products" || path === "/solutions") return { changefreq: "monthly", priority: "0.9" };
  if (path.startsWith("/tools/")) return { changefreq: "monthly", priority: "0.8" };
  return { changefreq: "monthly", priority: "0.7" };
}

const heldPaths = new Set<string>(
  Object.values(TOOL_RELIABILITY_HOLDS).map((definition) => definition.path),
);

// Blog slugs are authored in BlogPage.tsx rather than a registry, so read them the
// same way src/site/seo.test.ts does — one source of truth, one parse.
const blogSource = readFileSync(resolve(ROOT, "src/pages/BlogPage.tsx"), "utf8");
const blogPaths = [...blogSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => `/blog/${m[1]}`);

const paths: string[] = [];
const seen = new Set<string>();
for (const path of [...CANONICAL_PUBLIC_PATHS, ...blogPaths]) {
  if (heldPaths.has(path) || seen.has(path)) continue;
  seen.add(path);
  paths.push(path);
}

const body = paths
  .map((path) => {
    const { changefreq, priority } = rank(path);
    return `  <url><loc>${absoluteUrl(path)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");

const held = [...heldPaths].filter((p) => CANONICAL_PUBLIC_PATHS.includes(p as never));
console.log(`sitemap.xml: ${paths.length} urls written`);
console.log(`excluded ${held.length} path(s) under an active reliability hold:`);
for (const p of held.sort()) console.log(`  - ${p}`);
