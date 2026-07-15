import path from "path";
import dns from "node:dns";
import { readFile } from "node:fs/promises";
import express from "express";
import { createServer as createViteServer } from "vite";
import { logger } from "./src/logger";
import { app } from "./src/serverApp";
import { canonicalRedirectFor, resolveRoute } from "./src/router/resolve";
import { absoluteUrl, buildStructuredData, getPageSeo, SITE_NAME, type PageSeo } from "./src/site/seo";

dns.setDefaultResultOrder("ipv4first");

const REQUIRED_ENV: Record<string, string> = {
  ANTHROPIC_AUTH_TOKEN: "AI narration (/api/narrate) will be disabled",
};
for (const [key, impact] of Object.entries(REQUIRED_ENV)) {
  if (!process.env[key] || process.env[key]?.startsWith("MY_")) {
    logger.warn({ key, impact }, "[startup] WARNING: env var not set");
  }
}

const PORT = Number(process.env.PORT) || 3000;
const MANAGED_META = new Set([
  "description",
  "robots",
  "og:type",
  "og:url",
  "og:title",
  "og:description",
  "og:site_name",
  "og:locale",
  "og:image",
  "og:image:alt",
  "twitter:card",
  "twitter:site",
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:image:alt",
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSeoTags(seo: PageSeo): string {
  const canonicalUrl = seo.canonicalPath ? absoluteUrl(seo.canonicalPath) : null;
  const robots = seo.indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow, noarchive";
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}">`,
    `<meta name="robots" content="${robots}">`,
    canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">` : "",
    `<meta property="og:type" content="website">`,
    canonicalUrl ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}">` : "",
    `<meta property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}">`,
  ].filter(Boolean);

  const schema = buildStructuredData(seo);
  if (schema) {
    tags.push(`<script id="greenstreet-structured-data" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`);
  }
  return tags.join("\n    ");
}

function applyRouteSeo(shell: string, seo: PageSeo): string {
  const stripped = shell
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, (tag) => {
      const match = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i);
      return match && MANAGED_META.has(match[1]) ? "" : tag;
    })
    .replace(/<script\b(?=[^>]*\bid=["']greenstreet-structured-data["'])[^>]*>[\s\S]*?<\/script>/gi, "");

  return stripped.replace(/<\/head>/i, `    ${renderSeoTags(seo)}\n  </head>`);
}

function stripStaticHomepage(shell: string): string {
  const bodyMatch = shell.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return shell;

  // Keep only Vite's module entry points. Homepage markup, media, Webflow
  // scripts, duplicate landmarks, and their resource requests never reach an
  // inner-route browser document.
  const moduleScripts = bodyMatch[1].match(
    /<script\b(?=[^>]*\btype\s*=\s*["']module["'])[^>]*>[\s\S]*?<\/script>/gi,
  ) ?? [];
  const spaBody = `<body>\n    <div id="root"></div>\n    ${moduleScripts.join("\n    ")}\n  </body>`;
  return shell.replace(/<body\b[^>]*>[\s\S]*?<\/body>/i, spaBody);
}

function renderRouteDocument(shell: string, pathname: string) {
  const view = resolveRoute(pathname);
  const routeShell = view === "marketing" ? shell : stripStaticHomepage(shell);
  return {
    view,
    html: applyRouteSeo(routeShell, getPageSeo(pathname, view)),
  };
}

async function startServer() {
  // Redirect aliases before Vite or the production SPA shell handles them.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const destination = canonicalRedirectFor(req.path);
    if (destination) return res.redirect(301, destination);
    return next();
  });

  if (process.env.NODE_ENV !== "production") {
    const shellPath = path.join(process.cwd(), "index.html");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      if (!req.accepts("html")) return next();
      try {
        const shell = await readFile(shellPath, "utf8");
        const document = renderRouteDocument(shell, req.path);
        const html = await vite.transformIndexHtml(req.originalUrl, document.html);
        if (document.view === "not-found") {
          res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
        }
        return res.status(document.view === "not-found" ? 404 : 200).type("html").send(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        return next(error);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const shellPath = path.join(distPath, "index.html");
    const shell = await readFile(shellPath, "utf8");

    // Route documents pass through the metadata renderer; static assets do not.
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      const document = renderRouteDocument(shell, req.path);
      if (document.view === "not-found") {
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      res.status(document.view === "not-found" ? 404 : 200).type("html").send(document.html);
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "Greenstreet DSCR Engine started");
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "Shutdown signal received. Closing server gracefully...");
    server.close(() => {
      logger.info("All connections closed. Exiting.");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced exit after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer();
