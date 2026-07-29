import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "vite";

type CspDirective = "font-src" | "script-src" | "style-src";

type HtmlReference = {
  tag: "link" | "script";
  url: string;
  attributes: Record<string, string | true>;
};

type CspRequirement = {
  directive: CspDirective;
  origin: string;
};

type VercelConfig = {
  headers?: Array<{
    source?: unknown;
    headers?: Array<{
      key?: unknown;
      value?: unknown;
    }>;
  }>;
};

function decodeHtmlAttribute(value: string): string {
  return value.replaceAll("&amp;", "&");
}

function parseAttributes(tag: string): Record<string, string | true> {
  const attributes: Record<string, string | true> = {};
  const attributePattern = /\s+([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of tag.matchAll(attributePattern)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];
    attributes[name] = value === undefined ? true : decodeHtmlAttribute(value);
  }

  return attributes;
}

function extractHttpReferences(html: string): HtmlReference[] {
  const references: HtmlReference[] = [];

  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[1].toLowerCase() as HtmlReference["tag"];
    const attributes = parseAttributes(match[0]);
    const locationAttribute = tag === "script" ? "src" : "href";
    const rawUrl = attributes[locationAttribute];

    // Root-relative and other non-HTTP paths remain same-origin paths. They do
    // not add a host requirement to Vercel's static CSP configuration.
    if (typeof rawUrl !== "string" || !/^https?:\/\//i.test(rawUrl)) {
      continue;
    }

    references.push({ tag, url: rawUrl, attributes });
  }

  return references;
}

function relationTokens(attributes: Record<string, string | true>): string[] {
  const relation = attributes.rel;
  return typeof relation === "string"
    ? relation.toLowerCase().split(/\s+/).filter(Boolean)
    : [];
}

function canonicalOrigin(references: readonly HtmlReference[]): string {
  const canonicalUrls = references
    .filter((reference) => reference.tag === "link" && relationTokens(reference.attributes).includes("canonical"))
    .map((reference) => reference.url);

  expect(canonicalUrls).toHaveLength(1);
  return new URL(canonicalUrls[0]).origin;
}

function currentCspRequirements(html: string): CspRequirement[] {
  const references = extractHttpReferences(html);
  const pageOrigin = canonicalOrigin(references);
  const requirements = new Map<string, CspRequirement>();

  const addRequirement = (directive: CspDirective, origin: string) => {
    requirements.set(`${directive} ${origin}`, { directive, origin });
  };

  for (const reference of references) {
    const origin = new URL(reference.url).origin;
    const relations = relationTokens(reference.attributes);

    // The canonical URL identifies the current page origin. Canonical URLs,
    // and any absolute URLs for that same origin, are not third-party fetches.
    if (relations.includes("canonical") || origin === pageOrigin) {
      continue;
    }

    if (reference.tag === "script") {
      addRequirement("script-src", origin);
      continue;
    }

    if (relations.includes("stylesheet")) {
      addRequirement("style-src", origin);
    }

    const resourceType = reference.attributes.as;
    if (
      relations.includes("modulepreload") ||
      (relations.includes("preload") && resourceType === "script")
    ) {
      addRequirement("script-src", origin);
    }

    if (relations.includes("preload") && resourceType === "style") {
      addRequirement("style-src", origin);
    }

    if (relations.includes("preload") && resourceType === "font") {
      addRequirement("font-src", origin);
    }

    // Google Fonts declares its font-file origin through this preconnect hint;
    // assert the corresponding static font-src permission without fetching
    // the stylesheet or making any claim about live Vercel behavior.
    if (relations.includes("preconnect") && origin === "https://fonts.gstatic.com") {
      addRequirement("font-src", origin);
    }
  }

  return [...requirements.values()].sort((left, right) => (
    left.directive.localeCompare(right.directive) || left.origin.localeCompare(right.origin)
  ));
}

function staticVercelCspSources(config: VercelConfig): Map<string, string[]> {
  const headerRule = config.headers?.find((rule) => rule.source === "/(.*)");
  expect(headerRule).toBeDefined();

  const cspHeaders = headerRule?.headers?.filter((header) => (
    typeof header.key === "string" && header.key.toLowerCase() === "content-security-policy"
  )) ?? [];

  expect(cspHeaders).toHaveLength(1);
  const cspValue = cspHeaders[0]?.value;
  expect(typeof cspValue).toBe("string");

  const directives = new Map<string, string[]>();
  for (const entry of (cspValue as string).split(";")) {
    const [name, ...sources] = entry.trim().split(/\s+/);
    if (name) {
      directives.set(name, sources);
    }
  }

  return directives;
}

describe("checked-in Vercel CSP homepage reference contract", () => {
  let outputDirectory: string | undefined;
  let builtHtml = "";
  let vercelConfig: VercelConfig;

  beforeAll(async () => {
    outputDirectory = await mkdtemp(join(tmpdir(), "greenstreet-vercel-csp-reference-"));
    await build({
      configFile: resolve(process.cwd(), "vite.config.ts"),
      logLevel: "error",
      build: {
        emptyOutDir: true,
        outDir: outputDirectory,
      },
    });
    builtHtml = await readFile(join(outputDirectory, "index.html"), "utf8");
    vercelConfig = JSON.parse(await readFile(resolve(process.cwd(), "vercel.json"), "utf8")) as VercelConfig;
  }, 120_000);

  afterAll(async () => {
    if (outputDirectory) {
      await rm(outputDirectory, { force: true, recursive: true });
    }
  });

  it("covers every current external script, stylesheet, and declared font host", () => {
    const requirements = currentCspRequirements(builtHtml);
    const cspSources = staticVercelCspSources(vercelConfig);
    const uncovered = requirements.filter((requirement) => (
      !cspSources.get(requirement.directive)?.includes(requirement.origin)
    ));

    expect(requirements).toEqual([
      { directive: "font-src", origin: "https://fonts.gstatic.com" },
      { directive: "script-src", origin: "https://cdn.jsdelivr.net" },
      { directive: "script-src", origin: "https://cdn.prod.website-files.com" },
      { directive: "script-src", origin: "https://d3e54v103j8qbb.cloudfront.net" },
      { directive: "style-src", origin: "https://cdn.prod.website-files.com" },
      { directive: "style-src", origin: "https://fonts.googleapis.com" },
    ]);
    expect(uncovered).toEqual([]);
  });
});
