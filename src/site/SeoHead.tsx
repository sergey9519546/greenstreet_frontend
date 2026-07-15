import { useEffect } from "react";
import type { PageView } from "../router/resolve";
import { absoluteUrl, buildStructuredData, getPageSeo, SITE_NAME } from "./seo";

const SCHEMA_ID = "greenstreet-structured-data";
const MANAGED_ATTRIBUTE = "data-greenstreet-seo";
const MANAGED_VALUE = "managed";
const MAX_JSON_LD_NODES = 5_000;
const MAX_JSON_LD_CHARS = 100_000;
const MAX_JSON_LD_DEPTH = 20;
const UNSAFE_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);

type SafeJsonPrimitive = null | boolean | number | string;
type SafeJson = SafeJsonPrimitive | SafeJson[] | { [key: string]: SafeJson };

function isSafeJsonPrimitive(value: unknown): value is SafeJsonPrimitive {
  return (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function markManaged(node: Element): void {
  node.setAttribute(MANAGED_ATTRIBUTE, MANAGED_VALUE);
}

function removeManagedHead(): void {
  document.head
    .querySelectorAll(`[${MANAGED_ATTRIBUTE}="${MANAGED_VALUE}"]`)
    .forEach((node) => node.remove());
}

function upsertTitle(value: string): void {
  const nodes = Array.from(document.head.querySelectorAll<HTMLTitleElement>("title"));
  const node = nodes.shift() ?? document.createElement("title");
  node.textContent = value;
  markManaged(node);
  if (!node.parentNode) document.head.appendChild(node);
  nodes.forEach((duplicate) => duplicate.remove());
}

function upsertMeta(attribute: "name" | "property", key: string, value?: string): void {
  const nodes = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  );
  if (!value) {
    nodes.forEach((node) => node.remove());
    return;
  }

  const node = nodes.shift() ?? document.createElement("meta");
  node.setAttribute(attribute, key);
  node.content = value;
  markManaged(node);
  if (!node.parentNode) document.head.appendChild(node);
  nodes.forEach((duplicate) => duplicate.remove());
}

function setCanonical(url: string | null): void {
  const links = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
  );
  if (!url) {
    links.forEach((link) => link.remove());
    return;
  }

  const link = links.shift() ?? document.createElement("link");
  link.rel = "canonical";
  if (link.getAttribute("href") !== url) link.setAttribute("href", url);
  markManaged(link);
  if (!link.parentNode) document.head.appendChild(link);
  links.forEach((duplicate) => duplicate.remove());
}

function safeCanonicalUrl(pathname: string, canonicalPath?: string | null): string | null {
  if (canonicalPath === null) return null;

  try {
    const parsed = new URL(absoluteUrl(canonicalPath || pathname || "/"));
    if (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      !parsed.username &&
      !parsed.password
    ) {
      parsed.hash = "";
      return parsed.toString();
    }
  } catch {
    // Fall through to the stable site root.
  }
  return absoluteUrl("/");
}

function safeJsonLd(value: unknown): SafeJson | undefined {
  const ancestors = new Set<object>();
  const budget = { nodes: 0, chars: 0 };
  const reserveChars = (length: number): boolean => {
    if (length > MAX_JSON_LD_CHARS - budget.chars) return false;
    budget.chars += length;
    return true;
  };

  const visit = (candidate: unknown, depth: number): SafeJson | undefined => {
    budget.nodes += 1;
    if (budget.nodes > MAX_JSON_LD_NODES || depth > MAX_JSON_LD_DEPTH) return undefined;
    if (isSafeJsonPrimitive(candidate)) {
      if (typeof candidate === "string" && !reserveChars(candidate.length)) return undefined;
      return candidate;
    }
    if (typeof candidate !== "object" || ancestors.has(candidate)) return undefined;

    ancestors.add(candidate);
    try {
      const descriptors = Object.getOwnPropertyDescriptors(candidate);
      if (Array.isArray(candidate)) {
        const result: SafeJson[] = [];
        for (const [key, descriptor] of Object.entries(descriptors)) {
          if (!/^\d+$/.test(key) || !("value" in descriptor)) continue;
          const safeItem = visit(descriptor.value, depth + 1);
          if (safeItem !== undefined) result.push(safeItem);
        }
        return result;
      }

      const prototype = Object.getPrototypeOf(candidate);
      if (prototype !== Object.prototype && prototype !== null) return undefined;

      const result: { [key: string]: SafeJson } = Object.create(null);
      for (const [key, descriptor] of Object.entries(descriptors)) {
        if (!descriptor.enumerable || !("value" in descriptor) || UNSAFE_OBJECT_KEYS.has(key)) {
          continue;
        }
        const safeValue = visit(descriptor.value, depth + 1);
        if (safeValue !== undefined && reserveChars(key.length)) result[key] = safeValue;
      }
      return result;
    } catch {
      return undefined;
    } finally {
      ancestors.delete(candidate);
    }
  };

  return visit(value, 0);
}

function replaceStructuredData(schema: unknown): void {
  document.head
    .querySelectorAll(
      `script#${SCHEMA_ID}, script[type="application/ld+json"][${MANAGED_ATTRIBUTE}="${MANAGED_VALUE}"]`
    )
    .forEach((node) => node.remove());

  const safeSchema = safeJsonLd(schema);
  if (safeSchema === undefined || safeSchema === null || typeof safeSchema !== "object") return;

  const script = document.createElement("script");
  script.id = SCHEMA_ID;
  script.type = "application/ld+json";
  markManaged(script);
  script.textContent = JSON.stringify(safeSchema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  document.head.appendChild(script);
}

export default function SeoHead({ pathname, view }: { pathname: string; view: PageView }) {
  useEffect(() => {
    const seo = getPageSeo(pathname, view);
    const title = seo.title.trim() || SITE_NAME;
    const description = seo.description.trim() || SITE_NAME;
    const canonicalUrl = safeCanonicalUrl(pathname, seo.canonicalPath);

    document.documentElement.lang = "en";
    upsertTitle(title);
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      seo.indexable
        ? "index, follow, max-image-preview:large"
        : "noindex, nofollow, noarchive"
    );
    setCanonical(canonicalUrl);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonicalUrl ?? undefined);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_US");

    // Remove unverified or stale social declarations rather than publishing them.
    upsertMeta("property", "og:image");
    upsertMeta("property", "og:image:alt");
    upsertMeta("name", "twitter:site");
    upsertMeta("name", "twitter:image");
    upsertMeta("name", "twitter:image:alt");
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    replaceStructuredData(buildStructuredData(seo));

    // Some legacy page effects still write relative canonicals after this shared
    // effect runs. Keep the route contract authoritative, including removing
    // canonicals that are added late to private/noindex SPA views.
    const canonicalObserver = new MutationObserver(() => setCanonical(canonicalUrl));
    canonicalObserver.observe(document.head, {
      attributes: true,
      attributeFilter: ["href"],
      childList: true,
      subtree: true,
    });

    return () => {
      canonicalObserver.disconnect();
      removeManagedHead();
    };
  }, [pathname, view]);

  return null;
}
