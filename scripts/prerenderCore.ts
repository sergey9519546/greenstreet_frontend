/**
 * Shared logic for the prerender pipeline (scripts/prerender.ts) and its CI
 * gate (scripts/check-prerender.ts), kept in one module so the two can never
 * drift: the gate asserts exactly what the generator writes.
 *
 * The contract (asserted by scripts/prerenderCore.test.ts):
 *
 *     for every <loc> in public/sitemap.xml →
 *         dist/<path>/index.html exists and contains rendered content
 *
 * "Rendered content" means the React app actually mounted and route metadata
 * was applied during capture. The empty SPA shell has an empty #root and no
 * route metadata, so every check below is designed to fail on the shell:
 * non-JS crawlers (GPTBot/ClaudeBot/PerplexityBot, all invited by robots.txt)
 * must never receive the shell for a sitemap URL.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The <title> the shell ships with. The generator's wait condition and the
 * gate both require route metadata to have been applied, which replaces this
 * title — so a twin that still carries it (plus no route schema) is a shell.
 */
export const SHELL_TITLE = "DSCR Loans for Rental Property Investors | Greenstreet Finance";

/** Extracts deduplicated pathnames from a sitemap document's <loc> entries. */
export function parseSitemapPaths(xml: string): string[] {
  const paths: string[] = [];
  const seen = new Set<string>();
  for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let pathname: string;
    try {
      pathname = new URL(loc[1]).pathname;
    } catch {
      continue; // unparseable <loc> — never a route we can twin
    }
    if (!pathname) pathname = "/";
    if (seen.has(pathname)) continue;
    seen.add(pathname);
    paths.push(pathname);
  }
  return paths;
}

/** Reads a sitemap file and returns its deduplicated route pathnames. */
export function readSitemapPaths(sitemapFile: string): string[] {
  return parseSitemapPaths(readFileSync(sitemapFile, "utf8"));
}

/**
 * Maps a route pathname to its static twin in the build output:
 * `/` → `<outDir>/index.html`, `/tools/foo` → `<outDir>/tools/foo/index.html`.
 * Vercel serves the directory index for the clean URL (static files win over
 * the SPA rewrite), so a crawler fetch of `/tools/foo` returns the twin.
 */
export function twinPathFor(pathname: string, outDir: string): string {
  const raw = pathname.split(/[?#]/)[0] || "/";
  const segments = raw.split("/").filter((segment) => segment.length > 0);
  for (const segment of segments) {
    if (segment === "." || segment === ".." || segment.includes("\\") || segment.includes("%")) {
      throw new Error(`Refusing to map unsafe sitemap path segment "${segment}" to a static twin`);
    }
  }
  return segments.length === 0 ? join(outDir, "index.html") : join(outDir, ...segments, "index.html");
}

export interface TwinCheck {
  ok: boolean;
  reasons: string[];
}

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;

// The empty shell is <div id="root"></div>; a mounted app puts a child element
// right after the opening tag, so the character immediately after `<` must not
// be the `/` of a closing tag. (A plain `(?!\/)` — not a scan-ahead — so child
// attributes containing `/`, like Tailwind's `h-1/2`, can't false-negative.)
const ROOT_HAS_CHILDREN_RE = /id="root"[^>]*>\s*<(?!\/)/;

const BREADCRUMB_RE = /"@type"\s*:\s*"BreadcrumbList"/;
const WEBSITE_RE = /"@type"\s*:\s*"WebSite"/;

/**
 * Asserts a twin file contains real rendered content for its route. Every
 * non-home route must carry the BreadcrumbList schema (applyRouteMetadata
 * emits it for all canonical public pages except the homepage); the homepage
 * must carry the WebSite route schema instead. Both are client-injected, so
 * their presence proves the app mounted during capture.
 */
export function checkTwinHtml(pathname: string, html: string): TwinCheck {
  const reasons: string[] = [];

  const titleMatch = TITLE_RE.exec(html);
  const title = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
  if (!title) reasons.push("twin has no <title> text");

  if (pathname === "/") {
    if (!WEBSITE_RE.test(html)) reasons.push("home twin lacks the WebSite route schema (metadata never applied)");
  } else {
    if (!ROOT_HAS_CHILDREN_RE.test(html)) reasons.push("#root is empty (SPA never mounted)");
    if (!BREADCRUMB_RE.test(html)) reasons.push("twin lacks BreadcrumbList schema (route metadata never applied)");
  }

  return { ok: reasons.length === 0, reasons };
}

/** Bytes and file count of the twins that exist for the given paths. */
export function twinStats(outDir: string, paths: string[]): { bytes: number; count: number } {
  let bytes = 0;
  let count = 0;
  for (const pathname of paths) {
    const twin = twinPathFor(pathname, outDir);
    if (!existsSync(twin)) continue;
    bytes += statSync(twin).size;
    count += 1;
  }
  return { bytes, count };
}