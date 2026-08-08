import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ddqhewwswlgogzziamku.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcWhld3dzd2xnb2d6emlhbWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTUwNjQsImV4cCI6MjA5ODk5MTA2NH0.RvmTGcqwq7suswRBT6yi1O-uqS7ytU5wVlEYppUTdaw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface LiveDealParcel {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  living_sqft: number | null;
  year_built: number | null;
  beds: number | null;
  baths: number | null;
  estimated_value: number | null;
  tax_assessed_value: number | null;
  distress_reason: string | null;
  created_at: string;
}

/**
 * Fetch enriched off-market deals with active distress triggers from perfectproperty backend.
 */
export async function fetchLiveDistressedDeals(limit = 12): Promise<LiveDealParcel[]> {
  try {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .not("living_sqft", "is", null)
      .limit(limit);

    if (error) {
      console.warn("[Supabase] Error fetching live deals, falling back to cached deals:", error.message);
      return FALLBACK_DEALS;
    }

    if (!data || data.length === 0) {
      return FALLBACK_DEALS;
    }

    return data as LiveDealParcel[];
  } catch (err) {
    console.warn("[Supabase] Exception fetching live deals:", err);
    return FALLBACK_DEALS;
  }
}

export const FALLBACK_DEALS: LiveDealParcel[] = [
  {
    id: "p-fl-101",
    address: "1420 N Bayshore Dr",
    city: "Tampa",
    state: "FL",
    zip: "33602",
    lat: 27.9506,
    lng: -82.4572,
    living_sqft: 2200,
    year_built: 1998,
    beds: 4,
    baths: 3,
    estimated_value: 485000,
    tax_assessed_value: 410000,
    distress_reason: "Pre-Foreclosure / Tax Lien",
    created_at: new Date().toISOString(),
  },
  {
    id: "p-fl-102",
    address: "8840 Southland Blvd",
    city: "Orlando",
    state: "FL",
    zip: "32809",
    lat: 28.4501,
    lng: -81.3912,
    living_sqft: 3100,
    year_built: 2004,
    beds: 5,
    baths: 4,
    estimated_value: 620000,
    tax_assessed_value: 530000,
    distress_reason: "Probate Estate Sale",
    created_at: new Date().toISOString(),
  },
  {
    id: "p-tx-103",
    address: "4102 Oakmont Blvd",
    city: "Austin",
    state: "TX",
    zip: "78731",
    lat: 30.3201,
    lng: -97.7512,
    living_sqft: 1850,
    year_built: 1985,
    beds: 3,
    baths: 2,
    estimated_value: 540000,
    tax_assessed_value: 460000,
    distress_reason: "Code Violation / Value-Add",
    created_at: new Date().toISOString(),
  },
];
