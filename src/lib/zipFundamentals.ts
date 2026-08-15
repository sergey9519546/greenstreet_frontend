/**
 * ZIP-level market fundamentals, fetched on demand.
 *
 * These are SEEDS, not facts. Every tool in this product asks the visitor to
 * type a rent and an insurance premium they usually have to guess; this gives
 * them a defensible starting number and a citation, and then gets out of the
 * way. It must never present these as the rent for a specific property:
 *
 *   - ZORI cross-checks against HUD SAFMR at r = 0.539 across the 656 ZIPs both
 *     cover. The ratio (1.23 median) is the right direction and magnitude, so
 *     there is no scaling error — but individual ZIPs diverge materially.
 *   - Rent and price are as-of 2026-05. Insurance is as-of 2022.
 *   - ZORI is an index across all bedroom counts, not a 3/2 comp.
 *
 * So the UI applies a value only when the visitor asks for it, always shows the
 * source and date, and always leaves the field editable.
 *
 * Data is sharded by the first three ZIP digits (public/data/zip/NNN.json). A
 * single blob would be 3.5 MB / 430 KB gzipped and would have to be downloaded
 * in full to answer one lookup; the median shard is 1.1 KB.
 */

/** Compact wire format. Keys are short because this ships to the browser. */
interface ZipRow {
  r?: number; // monthly rent — Zillow ZORI
  i?: number; // annual insurance premium — US Treasury FIO (CA/FL only)
  p?: number; // median list price — realtor.com
  d?: number; // median days on market — realtor.com
  y?: number; // gross yield %
  s?: string; // state
  c?: string; // city
}

export interface ZipFundamentals {
  zip: string;
  city?: string;
  state?: string;
  /** Monthly rent. Zillow ZORI, 2026-05. */
  rent?: number;
  /** Annual homeowners premium. US Treasury FIO, 2022. CA and FL only. */
  insuranceAnnual?: number;
  /** Median list price. realtor.com, 2026-05. */
  listPrice?: number;
  /** Median days on market. realtor.com, 2026-05. */
  daysOnMarket?: number;
  /** rent x 12 / value, as a percentage. */
  grossYieldPct?: number;
}

/** Rendered wherever a seeded value is shown. Both sources require attribution. */
export const ZIP_DATA_SOURCES = {
  rent: "Zillow ZORI · May 2026",
  insurance: "U.S. Treasury FIO · 2022",
  listing: "realtor.com · May 2026",
} as const;

export const ZIP_ATTRIBUTION =
  "Market data: Zillow (ZORI, ZHVI), realtor.com Real Estate Data Library, " +
  "U.S. Treasury Federal Insurance Office, HUD, FEMA NFIP.";

const shardCache = new Map<string, Promise<Record<string, ZipRow> | null>>();

export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

function loadShard(prefix: string): Promise<Record<string, ZipRow> | null> {
  const cached = shardCache.get(prefix);
  if (cached) return cached;

  const pending = fetch(`/data/zip/${prefix}.json`)
    .then((response) => (response.ok ? (response.json() as Promise<Record<string, ZipRow>>) : null))
    .catch(() => null);

  shardCache.set(prefix, pending);
  return pending;
}

/**
 * Resolves a ZIP to its fundamentals, or null when the ZIP is malformed, not
 * covered, or the shard cannot be fetched. Never throws: a missing seed is a
 * normal outcome, not an error state, and must not disturb the tool.
 */
export async function lookupZip(zip: string): Promise<ZipFundamentals | null> {
  const trimmed = zip.trim();
  if (!isValidZip(trimmed)) return null;

  const shard = await loadShard(trimmed.slice(0, 3));
  const row = shard?.[trimmed];
  if (!row) return null;

  return {
    zip: trimmed,
    city: row.c,
    state: row.s,
    rent: row.r,
    insuranceAnnual: row.i,
    listPrice: row.p,
    daysOnMarket: row.d,
    grossYieldPct: row.y,
  };
}
