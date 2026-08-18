/**
 * FTC render-lock (CI gate, P0-2): fails the build if any banned fabricated
 * testimonial / logo / rate string appears in the shipped static HTML.
 *
 * Scans every .html file under dist/ — the SPA shell AND all prerendered
 * twins — for the banned list in ftcBanned.ts (derived from the same
 * CLAIM_REPLACEMENTS the runtime homepage and build-time sanitizer apply, so
 * the lock can never drift from the render path).
 *
 * Why this exists: 16 CFR 465 (fake reviews/endorsements) is live-enforced
 * with per-violation penalties. The site's governed posture is that
 * fabricated rates, lender stats, in-house funding claims, fake testimonials,
 * and placeholder contact details never render. This gate makes that
 * non-rendering permanent: if a replacement is removed, a claim is
 * re-introduced into the markup, or the shell drifts, CI fails here with the
 * exact file and string.
 *
 * Run: npm run test:ftc   (after `npm run build`; both CI workflows do)
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { BANNED_FABRICATED_CONTENT } from "./ftcBanned";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

if (!existsSync(DIST)) {
  console.error("check-ftc-contract: dist/ not found — run `npm run build` first.");
  process.exit(1);
}

function htmlFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

const files = htmlFiles(DIST);
if (files.length === 0) {
  console.error("check-ftc-contract: no .html files under dist/ — run `npm run build` first.");
  process.exit(1);
}

interface Violation {
  file: string;
  banned: string;
  context: string;
}

const violations: Violation[] = [];
for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const banned of BANNED_FABRICATED_CONTENT) {
    const index = html.indexOf(banned);
    if (index === -1) continue;
    const context = html.slice(Math.max(0, index - 60), index + banned.length + 60).replace(/\s+/g, " ");
    violations.push({ file: relative(ROOT, file), banned, context });
  }
}

console.log(
  `check-ftc-contract: ${BANNED_FABRICATED_CONTENT.length} banned fabricated strings scanned across ${files.length} shipped HTML files`,
);
if (violations.length === 0) {
  console.log("check-ftc-contract: PASS — no fabricated testimonials, logos, or rate claims render.");
  process.exit(0);
}

console.error(`check-ftc-contract: FAIL — ${violations.length} banned fabricated string(s) render in shipped HTML:`);
for (const violation of violations) {
  console.error(`  - ${violation.file}`);
  console.error(`      banned: ${violation.banned.slice(0, 120)}`);
  console.error(`      context: …${violation.context}…`);
}
process.exit(1);
