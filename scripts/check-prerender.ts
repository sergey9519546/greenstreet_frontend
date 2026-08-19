/**
 * CI gate for the prerender pipeline: asserts every URL in public/sitemap.xml
 * has a static twin in dist/ containing real rendered content — not the empty
 * SPA shell. Runs after `npm run build` in CI (ci.yml, verify.yml); fails the
 * build if any sitemap URL would serve a shell to a non-JS crawler.
 *
 * The checks come from scripts/prerenderCore.ts — the same module the
 * generator writes from — so the gate can never drift from the generator.
 *
 * Run: npm run test:prerender
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { checkTwinHtml, readSitemapPaths, twinPathFor, twinStats } from "./prerenderCore";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITEMAP = path.join(ROOT, "public", "sitemap.xml");

const paths = readSitemapPaths(SITEMAP);
if (paths.length === 0) {
  console.error(`check-prerender: no <loc> entries in ${SITEMAP}`);
  process.exit(1);
}

const failures: Array<{ path: string; reasons: string[] }> = [];
let passed = 0;

for (const pathname of paths) {
  const twin = twinPathFor(pathname, DIST);
  if (!existsSync(twin)) {
    failures.push({ path: pathname, reasons: [`missing static twin (expected ${path.relative(ROOT, twin)})`] });
    continue;
  }
  const report = checkTwinHtml(pathname, readFileSync(twin, "utf8"));
  if (report.ok) {
    passed += 1;
  } else {
    failures.push({ path: pathname, reasons: report.reasons });
  }
}

const stats = twinStats(DIST, paths);
console.log(
  `check-prerender: ${passed}/${paths.length} sitemap URLs have a rendered static twin`,
  `(${(stats.bytes / 1024 / 1024).toFixed(1)} MB across ${stats.count} files)`,
);

if (failures.length > 0) {
  console.error(`check-prerender: ${failures.length} URL(s) would serve an empty shell to non-JS crawlers:`);
  for (const failure of failures) {
    console.error(`  - ${failure.path}`);
    for (const reason of failure.reasons) console.error(`      ${reason}`);
  }
  process.exit(1);
}
