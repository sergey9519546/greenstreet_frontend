import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "vite";

type ExternalReference = {
  tag: "link" | "script";
  url: string;
  attributes: Record<string, string | true>;
};

const APPROVED_EXTERNAL_REFERENCES: readonly ExternalReference[] = [
  {
    tag: "link",
    url: "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/css/greenboard-00.shared.57c976e80.css",
    attributes: { rel: "stylesheet", type: "text/css" },
  },
  {
    tag: "link",
    url: "https://fonts.googleapis.com",
    attributes: { rel: "preconnect" },
  },
  {
    tag: "link",
    url: "https://fonts.gstatic.com",
    attributes: { crossorigin: "", rel: "preconnect" },
  },
  {
    tag: "link",
    url: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap",
    attributes: { rel: "stylesheet" },
  },
  {
    tag: "link",
    url: "https://cdn.prod.website-files.com",
    attributes: { crossorigin: "anonymous", rel: "preconnect" },
  },
  {
    tag: "link",
    url: "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/css/greenboard-00.shared.57c976e80.css",
    attributes: {
      crossorigin: "anonymous",
      integrity: "sha384-V8l26AWsq7po2+QnyQbr/k5OR9/wpEXYLAlJX25NoXqMnlYq3WdjjChIJWvBWY3B",
      rel: "stylesheet",
      type: "text/css",
    },
  },
  // The <link rel="canonical"> that used to sit here has been removed from
  // index.html. It hardcoded the homepage URL, and vercel.json rewrites all 72
  // routes to that one file, so every tool page and blog post shipped a
  // canonical claiming to be a duplicate of "/" until the bundle booted and
  // applyRouteMetadata replaced it. Crawlers that do not execute JS — including
  // the AI crawlers robots.txt explicitly allows — only ever saw the wrong one.
  // Canonicals are now written per route at runtime from SITE_ORIGIN.
  {
    tag: "script",
    url: "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=67d0a8a9156b7b7bd46ffdfd",
    attributes: { crossorigin: "anonymous" },
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/js/greenboard-00.schunk.57706da51b32327c.js",
    attributes: {},
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/js/greenboard-00.0d162371.8614de198f9d7870.js",
    attributes: {},
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/gsap/3.15.0/gsap.min.js",
    attributes: {},
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/gsap/3.15.0/ScrollTrigger.min.js",
    attributes: {},
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/gsap/3.15.0/Observer.min.js",
    attributes: {},
  },
  {
    tag: "script",
    url: "https://cdn.prod.website-files.com/gsap/3.15.0/Flip.min.js",
    attributes: {},
  },
  // Swiper 8 removed from index.html. The homepage carousels were deleted in an
  // earlier cleanup (swiper-slide 9 -> 0), leaving the ~150KB render-blocking
  // bundle loading on every page view with no .swiper-container or
  // .swiper-slide element to drive. Its init code iterates swiper elements, so
  // it never constructed anything either. cdn.jsdelivr.net stays in the CSP —
  // the two Finsweet attribute scripts still come from it.
  {
    tag: "script",
    url: "https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsfilter@1/cmsfilter.js",
    attributes: { async: true },
  },
  {
    tag: "script",
    url: "https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsload@1/cmsload.js",
    attributes: { async: true },
  },
];

const MANIFEST_ATTRIBUTES = ["async", "crossorigin", "integrity", "rel", "type"] as const;

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

function extractExternalReferences(html: string): ExternalReference[] {
  const references: ExternalReference[] = [];

  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[1].toLowerCase() as ExternalReference["tag"];
    const attributes = parseAttributes(match[0]);
    const locationAttribute = tag === "script" ? "src" : "href";
    const rawUrl = attributes[locationAttribute];

    if (typeof rawUrl !== "string" || !/^https?:\/\//i.test(rawUrl)) {
      continue;
    }

    const manifestAttributes = Object.fromEntries(
      MANIFEST_ATTRIBUTES.flatMap((name) => (
        name in attributes
          ? [[name, name === "async" ? true : attributes[name]]]
          : []
      )),
    ) as Record<string, string | true>;

    references.push({ tag, url: rawUrl, attributes: manifestAttributes });
  }

  return references;
}

describe("built third-party reference manifest", () => {
  let outputDirectory: string | undefined;
  let builtHtml = "";

  beforeAll(async () => {
    outputDirectory = await mkdtemp(join(tmpdir(), "greenstreet-third-party-reference-"));
    await build({
      configFile: resolve(process.cwd(), "vite.config.ts"),
      logLevel: "error",
      build: {
        emptyOutDir: true,
        outDir: outputDirectory,
      },
    });
    builtHtml = await readFile(join(outputDirectory, "index.html"), "utf8");
  }, 120_000);

  afterAll(async () => {
    if (outputDirectory) {
      await rm(outputDirectory, { force: true, recursive: true });
    }
  });

  it("ships exactly the audited external script and link inventory", () => {
    expect(extractExternalReferences(builtHtml)).toEqual(APPROVED_EXTERNAL_REFERENCES);
  });
});
