import { readFile } from "node:fs/promises";
import path from "node:path";

const sourceDefinitions = {
  ga4: { flag: "ga4", env: "SEO_GA4_EXPORT", label: "GA4" },
  searchConsole: {
    flag: "search-console",
    env: "SEO_SEARCH_CONSOLE_EXPORT",
    label: "Google Search Console",
  },
  rankings: { flag: "rankings", env: "SEO_RANKINGS_EXPORT", label: "Rank tracker" },
  geo: { flag: "geo", env: "SEO_GEO_EXPORT", label: "AI visibility monitor" },
  backlinks: { flag: "backlinks", env: "SEO_BACKLINKS_EXPORT", label: "Backlink export" },
  webVitals: { flag: "web-vitals", env: "SEO_WEB_VITALS_EXPORT", label: "Web Vitals" },
};

const metricDefinitions = [
  ["organic_sessions", "ga4"],
  ["organic_conversions", "ga4"],
  ["organic_conversion_rate", "ga4"],
  ["search_clicks", "searchConsole"],
  ["search_impressions", "searchConsole"],
  ["search_ctr", "searchConsole"],
  ["average_position", "searchConsole"],
  ["indexed_pages", "searchConsole"],
  ["keywords_top_3", "rankings"],
  ["keywords_top_10", "rankings"],
  ["ranking_visibility", "rankings"],
  ["ai_citations", "geo"],
  ["ai_brand_mentions", "geo"],
  ["referring_domains", "backlinks"],
  ["total_backlinks", "backlinks"],
  ["lcp_p75_ms", "webVitals"],
  ["cls_p75", "webVitals"],
  ["inp_p75_ms", "webVitals"],
];

const flags = Object.fromEntries(
  process.argv.slice(2).map((argument) => {
    const match = argument.match(/^--([^=]+)=(.+)$/);
    return match ? [match[1], match[2]] : [argument, ""];
  })
);

async function loadSource(definition) {
  const configuredPath = flags[definition.flag] || process.env[definition.env] || "";
  if (!configuredPath) {
    return {
      label: definition.label,
      status: "N/A",
      source: "N/A",
      reason: "No verified export was configured.",
      data: null,
    };
  }

  const absolutePath = path.resolve(configuredPath);
  try {
    const data = JSON.parse(await readFile(absolutePath, "utf8"));
    return {
      label: definition.label,
      status: "provided",
      source: absolutePath,
      reason: null,
      data,
    };
  } catch {
    return {
      label: definition.label,
      status: "N/A",
      source: absolutePath,
      reason: "The configured export could not be read as JSON.",
      data: null,
    };
  }
}

const entries = await Promise.all(
  Object.entries(sourceDefinitions).map(async ([key, definition]) => [
    key,
    await loadSource(definition),
  ])
);
const sources = Object.fromEntries(entries);

const metrics = Object.fromEntries(
  metricDefinitions.map(([metric, sourceKey]) => {
    const source = sources[sourceKey];
    const rawValue = source.data?.metrics?.[metric];
    const measured = typeof rawValue === "number" && Number.isFinite(rawValue);
    return [
      metric,
      {
        value: measured ? rawValue : "N/A",
        source: measured ? source.source : "N/A",
        evidence: measured ? "Measured from supplied export" : "N/A",
      },
    ];
  })
);

const report = {
  generated_at: new Date().toISOString(),
  policy:
    "N/A means no verified source value was supplied. This report never estimates missing metrics.",
  expected_export_shape: { metrics: { metric_name: 0 } },
  sources: Object.fromEntries(
    Object.entries(sources).map(([key, source]) => [
      key,
      {
        label: source.label,
        status: source.status,
        source: source.source,
        reason: source.reason,
      },
    ])
  ),
  metrics,
};

process.stdout.write(JSON.stringify(report, null, 2) + "\n");
