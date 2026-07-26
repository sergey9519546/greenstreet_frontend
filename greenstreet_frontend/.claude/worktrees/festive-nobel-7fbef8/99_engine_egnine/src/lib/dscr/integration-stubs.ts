// ============================================================================
// INTEGRATION STUBS — Live Rate Data, Rent Comps, AVM
// ============================================================================
// Stub services for third-party data integration. Production implementations
// would call real APIs (FRED, RentCast, Zillow). Stubs return reasonable
// estimates so the engine can be tested without API keys.
// ============================================================================

// ---------------------------------------------------------------------------
// Live Rate Data (FRED API stub)
// ---------------------------------------------------------------------------

export interface LiveRateData {
  treasury_10yr: number;
  treasury_5yr: number;
  treasury_2yr: number;
  sofr_30d: number;
  fed_funds: number;
  prime_rate: number;
  fetched_at: string;  // ISO timestamp
  source: 'live' | 'cache' | 'fallback';
}

// Cached rates — 1 hour TTL
let cachedRates: LiveRateData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;  // 1 hour

/**
 * Get current market rates.
 *
 * If FRED_API_KEY env var is set, fetches live data from FRED API:
 *   GET https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=...
 *   GET https://api.stlouisfed.org/fred/series/observations?series_id=DGS5&api_key=...
 *   GET https://api.stlouisfed.org/fred/series/observations?series_id=SOFR30DAYAVG&api_key=...
 *   GET https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=...
 *
 * Otherwise returns realistic stub values for development.
 */
export async function fetchLiveRates(): Promise<LiveRateData> {
  // Return cache if fresh
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return { ...cachedRates, source: 'cache' };
  }

  const apiKey = process.env.FRED_API_KEY;

  // No API key — return stub
  if (!apiKey) {
    const stub: LiveRateData = {
      treasury_10yr: 4.25,
      treasury_5yr: 4.10,
      treasury_2yr: 3.95,
      sofr_30d: 4.32,
      fed_funds: 4.50,
      prime_rate: 7.50,
      fetched_at: new Date().toISOString(),
      source: 'fallback',
    };
    cachedRates = stub;
    cacheTimestamp = Date.now();
    return stub;
  }

  try {
    // Fetch each series in parallel
    const seriesMap: Record<string, string> = {
      treasury_10yr: 'DGS10',
      treasury_5yr: 'DGS5',
      treasury_2yr: 'DGS2',
      sofr_30d: 'SOFR30DAYAVG',
      fed_funds: 'FEDFUNDS',
      prime_rate: 'DPRIME',
    };

    const entries = Object.entries(seriesMap) as [keyof LiveRateData, string][];
    const results = await Promise.all(
      entries.map(async ([key, seriesId]) => {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) throw new Error(`FRED API error for ${seriesId}: ${response.status}`);
        const data = await response.json();
        const value = parseFloat(data.observations?.[0]?.value ?? '0');
        if (!Number.isFinite(value)) throw new Error(`Invalid value for ${seriesId}`);
        return [key, value] as const;
      })
    );

    const liveData: LiveRateData = {
      ...(Object.fromEntries(results) as Omit<LiveRateData, 'fetched_at' | 'source'>),
      fetched_at: new Date().toISOString(),
      source: 'live',
    };

    cachedRates = liveData;
    cacheTimestamp = Date.now();
    return liveData;
  } catch (e) {
    // On error: return cached if available, else throw
    if (cachedRates) return { ...cachedRates, source: 'cache' };
    throw new Error('Failed to fetch live rates');
  }
}

/**
 * Synchronous getter — returns cached rates or fallback.
 */
export function getRatesSync(): LiveRateData {
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }
  return {
    treasury_10yr: 4.25,
    treasury_5yr: 4.10,
    treasury_2yr: 3.95,
    sofr_30d: 4.32,
    fed_funds: 4.50,
    prime_rate: 7.50,
    fetched_at: new Date().toISOString(),
    source: 'fallback',
  };
}

// ---------------------------------------------------------------------------
// Rent Comps (RentCast / Rentometer stub)
// ---------------------------------------------------------------------------

export interface RentComp {
  address: string;
  rent: number;
  beds: number;
  baths: number;
  sqft: number;
  distance_miles: number;
  source: 'rentcast' | 'rentometer' | 'zillow' | 'stub';
}

export interface RentCompEstimate {
  estimated_rent_low: number;
  estimated_rent_mid: number;
  estimated_rent_high: number;
  confidence: 'low' | 'medium' | 'high';
  comps: RentComp[];
}

/**
 * Get rent estimate and comps for a property.
 *
 * Production:
 *   GET https://api.rentcast.io/v1/avm/rent?address=...&propertyType=...&bedrooms=...&bathrooms=...
 */
export async function fetchRentComps(
  address: string,
  propertyType: string,
  beds: number,
  baths: number,
  sqft: number
): Promise<RentCompEstimate> {
  // STUB: return estimate based on property characteristics
  // Typical SFR rent: $1-1.5/sqft, scaled by bed/bath
  const baseRent = sqft * 1.25;
  const bedAdjust = (beds - 3) * 150;
  const bathAdjust = (baths - 2) * 100;
  const mid = baseRent + bedAdjust + bathAdjust;
  const low = Math.round(mid * 0.9);
  const high = Math.round(mid * 1.1);

  return {
    estimated_rent_low: low,
    estimated_rent_mid: Math.round(mid),
    estimated_rent_high: high,
    confidence: 'medium',
    comps: [
      { address: '123 Main St', rent: Math.round(mid * 0.95), beds, baths, sqft: sqft - 100, distance_miles: 0.2, source: 'stub' },
      { address: '456 Oak Ave', rent: Math.round(mid * 1.02), beds, baths, sqft: sqft + 50, distance_miles: 0.4, source: 'stub' },
      { address: '789 Elm Dr', rent: Math.round(mid * 0.98), beds, baths, sqft: sqft - 50, distance_miles: 0.6, source: 'stub' },
      { address: '321 Pine Ln', rent: Math.round(mid * 1.05), beds, baths, sqft: sqft + 100, distance_miles: 0.8, source: 'stub' },
      { address: '654 Maple Way', rent: Math.round(mid * 0.93), beds, baths, sqft: sqft - 200, distance_miles: 1.0, source: 'stub' },
    ],
  };
}

// ---------------------------------------------------------------------------
// AVM — Automated Valuation Model (Zillow/Redfin stub)
// ---------------------------------------------------------------------------

export interface AvmEstimate {
  estimated_value_low: number;
  estimated_value_mid: number;
  estimated_value_high: number;
  confidence: 'low' | 'medium' | 'high';
  comparable_sales: Array<{ address: string; sale_price: number; sale_date: string; sqft: number; price_per_sqft: number }>;
}

/**
 * Get AVM estimate for a property.
 *
 * Production:
 *   GET https://api.bridgedataoutput.com/api/v2/zestimates?...
 *   or https://api.redfin.com/...
 */
export async function fetchAvm(
  address: string,
  sqft: number,
  beds: number,
  baths: number
): Promise<AvmEstimate> {
  // STUB: use price/sqft estimate
  const pricePerSqft = 200;  // typical SFR
  const mid = sqft * pricePerSqft;
  return {
    estimated_value_low: Math.round(mid * 0.92),
    estimated_value_mid: mid,
    estimated_value_high: Math.round(mid * 1.08),
    confidence: 'medium',
    comparable_sales: [
      { address: '123 Main St', sale_price: Math.round(mid * 0.98), sale_date: '2024-08-15', sqft: sqft - 100, price_per_sqft: 205 },
      { address: '456 Oak Ave', sale_price: Math.round(mid * 1.02), sale_date: '2024-07-22', sqft: sqft + 50, price_per_sqft: 198 },
      { address: '789 Elm Dr', sale_price: Math.round(mid * 0.96), sale_date: '2024-09-01', sqft: sqft - 50, price_per_sqft: 202 },
    ],
  };
}
