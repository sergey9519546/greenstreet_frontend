/**
 * The FTC render-lock's banned fabricated-content list.
 *
 * Single source: CLAIM_REPLACEMENTS (src/marketing/claimReplacements.ts) —
 * the same pairs the runtime homepage and the build-time sanitizer apply. The
 * `unsupported` side of every pair whose text is long enough to be a unique
 * claim (>= MIN_AUTO_BAN_LENGTH chars) is auto-banned, so a broken or removed
 * replacement can never silently re-publish a fabricated claim. Short but
 * high-signal strings (placeholder phone, fabricated persona/company names,
 * the fake-endorsement disclaimer) are banned explicitly.
 *
 * This module is side-effect free so both the CI gate (check-ftc-contract.ts)
 * and the vitest invariants (ftcLock.test.ts) can import it.
 */
import { CLAIM_REPLACEMENTS } from "../src/marketing/claimReplacements";

/** Auto-ban every unsupported claim at least this long (unique sentences). */
export const MIN_AUTO_BAN_LENGTH = 30;

/** Short fabricated strings that must never render even if a pair is missed. */
export const EXPLICIT_BANNED = [
  // Placeholder contact details (16 CFR 465-adjacent: never real, never render).
  "+1 (555) 010-0000",
  "tel:+15550100000",
  // Fabricated testimonial personas and "trusted by" logo companies.
  "Maya Reynolds",
  "David Chen",
  "Carlos Martinez",
  "Emma Wallace",
  "Layla Kabbani",
  "Nexus Financial",
  "Hadley Capital Partners",
  "Marlowe Asset Group",
  "Sterling Bridge Partners",
  "Cedar Funding",
  // Fabricated About-page executive personas (removed 2026-08; documented in
  // docs/REMOVED_MARKETING_CONTENT.md) — banned from rendered output so a
  // restore from git history fails CI.
  "Dave Feldman",
  "Priya Rao",
  "Marcus Chen",
  "Sara López",
  "Tobi Okafor",
  "Anita Mehta",
  "Jordan Brooks",
  "Hannah Park",
  // The 27 restored trust-logo images (public/img/logos/trust-*.png) — the
  // path pattern catches the whole block if it is ever re-introduced.
  "/img/logos/trust-",
] as const;

export const BANNED_FABRICATED_CONTENT: string[] = [
  ...new Set<string>([
    ...CLAIM_REPLACEMENTS.filter(([unsupported]) => unsupported.length >= MIN_AUTO_BAN_LENGTH).map(
      ([unsupported]) => unsupported,
    ),
    ...EXPLICIT_BANNED,
  ]),
];
