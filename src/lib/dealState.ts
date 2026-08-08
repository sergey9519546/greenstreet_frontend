/**
 * Shared deal snapshot — single source of truth for calculator inputs
 * across tools (URL query + localStorage). Makes the product feel like
 * one continuous desk instead of disconnected pages.
 */

import { calculatePaymentFactor } from "../engine";
import { rescueTrack1 } from "../engine/loanOptimizer";

export type CalcTab = "dscr" | "maxprice";

export interface DealSnapshot {
  price: number;
  down: number;
  rent: number;
  rate: number;
  tax: number;
  ins: number;
  hoa: number;
  stateCode: string;
  taxAuto: boolean;
  tab: CalcTab;
  mRent: number;
  mRate: number;
  mDown: number;
  target: number;
}

export const DEFAULT_DEAL: DealSnapshot = {
  price: 425_000,
  down: 25,
  rent: 3_000,
  rate: 7.0,
  tax: 5_000,
  ins: 2_000,
  hoa: 0,
  stateCode: "TX",
  taxAuto: true,
  tab: "dscr",
  mRent: 3_000,
  mRate: 7.0,
  mDown: 25,
  target: 1.1,
};

const STORAGE_KEY = "gs_deal_v1";

const Q = {
  price: "p",
  down: "d",
  rent: "r",
  rate: "rt",
  tax: "tx",
  ins: "in",
  hoa: "h",
  stateCode: "st",
  taxAuto: "ta",
  tab: "tab",
  mRent: "mr",
  mRate: "mrt",
  mDown: "md",
  target: "tg",
} as const;

function clamp(n: number, lo: number, hi: number) {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function num(raw: string | null, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const v = Number(raw);
  return Number.isFinite(v) ? v : fallback;
}

function bool(raw: string | null, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback;
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return fallback;
}

/** Sanitize + clamp a partial deal into a full snapshot. */
export function normalizeDeal(partial: Partial<DealSnapshot> | null | undefined): DealSnapshot {
  const base = { ...DEFAULT_DEAL, ...(partial ?? {}) };
  const rawState = String(base.stateCode || "TX").toUpperCase().trim();
  // Accept only real USPS 2-letter codes; full names / garbage fall back to TX.
  const stateCode = /^[A-Z]{2}$/.test(rawState) ? rawState : "TX";
  const tab: CalcTab = base.tab === "maxprice" ? "maxprice" : "dscr";
  return {
    price: clamp(Math.round(base.price), 50_000, 20_000_000),
    down: clamp(Math.round(base.down), 15, 60),
    rent: clamp(Math.round(base.rent), 0, 500_000),
    rate: clamp(Math.round(base.rate * 1000) / 1000, 3, 15),
    tax: clamp(Math.round(base.tax), 0, 2_000_000),
    ins: clamp(Math.round(base.ins), 0, 500_000),
    hoa: clamp(Math.round(base.hoa), 0, 50_000),
    stateCode,
    taxAuto: Boolean(base.taxAuto),
    tab,
    mRent: clamp(Math.round(base.mRent), 0, 500_000),
    mRate: clamp(Math.round(base.mRate * 1000) / 1000, 3, 15),
    mDown: clamp(Math.round(base.mDown), 15, 60),
    target: clamp(Math.round(base.target * 100) / 100, 0.75, 1.5),
  };
}

/** Read deal from the current URL query string (if any keys present). */
export function loadDealFromUrl(search?: string): Partial<DealSnapshot> | null {
  if (typeof window === "undefined" && search == null) return null;
  const qs = new URLSearchParams(search ?? window.location.search);
  if (![...qs.keys()].some((k) => Object.values(Q).includes(k as (typeof Q)[keyof typeof Q]))) {
    return null;
  }
  const tabRaw = qs.get(Q.tab);
  return {
    price: num(qs.get(Q.price), DEFAULT_DEAL.price),
    down: num(qs.get(Q.down), DEFAULT_DEAL.down),
    rent: num(qs.get(Q.rent), DEFAULT_DEAL.rent),
    rate: num(qs.get(Q.rate), DEFAULT_DEAL.rate),
    tax: num(qs.get(Q.tax), DEFAULT_DEAL.tax),
    ins: num(qs.get(Q.ins), DEFAULT_DEAL.ins),
    hoa: num(qs.get(Q.hoa), DEFAULT_DEAL.hoa),
    stateCode: (qs.get(Q.stateCode) || DEFAULT_DEAL.stateCode).toUpperCase(),
    taxAuto: bool(qs.get(Q.taxAuto), DEFAULT_DEAL.taxAuto),
    tab: tabRaw === "maxprice" ? "maxprice" : "dscr",
    mRent: num(qs.get(Q.mRent), DEFAULT_DEAL.mRent),
    mRate: num(qs.get(Q.mRate), DEFAULT_DEAL.mRate),
    mDown: num(qs.get(Q.mDown), DEFAULT_DEAL.mDown),
    target: num(qs.get(Q.target), DEFAULT_DEAL.target),
  };
}

export function loadDealFromStorage(): Partial<DealSnapshot> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<DealSnapshot>;
  } catch {
    return null;
  }
}

/** URL wins, then storage, then defaults. */
export function resolveInitialDeal(): DealSnapshot {
  const fromUrl = loadDealFromUrl();
  const fromStore = loadDealFromStorage();
  return normalizeDeal({ ...DEFAULT_DEAL, ...(fromStore ?? {}), ...(fromUrl ?? {}) });
}

export function saveDealToStorage(deal: DealSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDeal(deal)));
  } catch {
    // private mode / quota — ignore
  }
}

export function dealToSearchParams(deal: DealSnapshot): URLSearchParams {
  const d = normalizeDeal(deal);
  const qs = new URLSearchParams();
  qs.set(Q.price, String(d.price));
  qs.set(Q.down, String(d.down));
  qs.set(Q.rent, String(d.rent));
  qs.set(Q.rate, String(d.rate));
  qs.set(Q.tax, String(d.tax));
  qs.set(Q.ins, String(d.ins));
  qs.set(Q.hoa, String(d.hoa));
  qs.set(Q.stateCode, d.stateCode);
  qs.set(Q.taxAuto, d.taxAuto ? "1" : "0");
  qs.set(Q.tab, d.tab);
  qs.set(Q.mRent, String(d.mRent));
  qs.set(Q.mRate, String(d.mRate));
  qs.set(Q.mDown, String(d.mDown));
  qs.set(Q.target, String(d.target));
  return qs;
}

/** Absolute share URL for the calculator (or any path) with deal encoded. */
export function buildShareUrl(deal: DealSnapshot, path = "/dscr-calculator"): string {
  if (typeof window === "undefined") {
    return `${path}?${dealToSearchParams(deal).toString()}`;
  }
  const url = new URL(path, window.location.origin);
  url.search = dealToSearchParams(deal).toString();
  return url.toString();
}

/** Quietly mirror deal into the address bar (no history spam). */
export function writeDealToUrl(deal: DealSnapshot, path?: string): void {
  if (typeof window === "undefined") return;
  const url = new URL(path ?? window.location.pathname, window.location.origin);
  url.search = dealToSearchParams(deal).toString();
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export async function copyShareLink(deal: DealSnapshot, path = "/dscr-calculator"): Promise<boolean> {
  const link = buildShareUrl(deal, path);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = link;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Lightweight Fix-My-Deal suggestions from the live calculator inputs. */
export interface DealFix {
  id: string;
  label: string;
  description: string;
  impact: string;
  risk: "LOW" | "MODERATE" | "HIGH";
  apply: Partial<DealSnapshot>;
}

// 30-yr amortising payment factor. The math is the golden-tested engine
// primitive (`calculatePaymentFactor`, pinned at 8.25%/30yr = 0.0075127) — this
// wrapper only pins the term to 360 and keeps the calculator's display
// convention that a 0% rate means "no payment" (the engine returns 1/n there).
// NOTE: takes the rate as a PERCENT (7.25), matching the engine.
const pf = (ratePct: number) => (ratePct === 0 ? 0 : calculatePaymentFactor(ratePct, 360));

function breakEvenRate(loan: number, targetPI: number): number {
  if (loan <= 0 || targetPI <= 0) return 0;
  const pfTarget = targetPI / loan;
  let lo = 0;
  let hi = 30; // percent space — pf() takes a percent rate
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (pf(mid) < pfTarget) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function computeDealFixes(
  deal: DealSnapshot,
  opts: { taxYr: number; targetDscr?: number },
): DealFix[] {
  const targetDscr = opts.targetDscr ?? 1.0;
  const { price, down, rent, rate, ins, hoa } = deal;
  const taxYr = opts.taxYr;
  const loan = price * (1 - down / 100);
  const pAndI = loan * pf(rate);
  const pitia = pAndI + taxYr / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  if (dscr >= targetDscr) return [];

  const fixes: DealFix[] = [];
  const targetRent = Math.ceil(targetDscr * pitia);
  const rentLift = Math.max(0, targetRent - rent);
  if (rentLift > 0) {
    fixes.push({
      id: "rent",
      label: "Raise rent",
      description: `Lift rent by $${rentLift.toLocaleString()}/mo to $${targetRent.toLocaleString()}.`,
      impact: `→ ${targetDscr.toFixed(2)}x DSCR`,
      risk: "MODERATE",
      apply: { rent: targetRent, mRent: targetRent },
    });
  }

  // Max price at current rent + target DSCR (tax/ins scale with price via fixed $ bills for a simple apply)
  const fixed = taxYr / 12 + ins / 12 + hoa;
  const maxPI = rent / targetDscr - fixed;
  if (maxPI > 0) {
    const maxLoan = maxPI / pf(rate);
    const maxPrice = Math.floor(maxLoan / (1 - down / 100));
    const cut = price - maxPrice;
    if (cut > 500) {
      fixes.push({
        id: "price",
        label: "Cut purchase price",
        description: `Negotiate $${Math.round(cut).toLocaleString()} off → $${maxPrice.toLocaleString()}.`,
        impact: `→ ${targetDscr.toFixed(2)}x DSCR`,
        risk: "LOW",
        apply: { price: maxPrice },
      });
    }
  }

  // Extra down payment holding price constant
  const targetPITIA = rent / targetDscr;
  const targetPI = targetPITIA - fixed;
  if (targetPI > 0) {
    const targetLoan = targetPI / pf(rate);
    const targetDownPct = Math.ceil((1 - targetLoan / price) * 100);
    if (targetDownPct > down && targetDownPct <= 60) {
      fixes.push({
        id: "down",
        label: "Increase down payment",
        description: `Bring ${(targetDownPct - down)} more points of equity → ${targetDownPct}% down.`,
        impact: `→ ${targetDscr.toFixed(2)}x DSCR`,
        risk: "LOW",
        apply: { down: targetDownPct, mDown: targetDownPct },
      });
    }
  }

  // Rate needed
  const targetPIForRate = rent / targetDscr - fixed;
  const be = breakEvenRate(loan, targetPIForRate);
  if (be > 0 && be < rate - 0.05) {
    const bps = Math.round((rate - be) * 100);
    fixes.push({
      id: "rate",
      label: "Buy down the rate",
      description: `Need ~${be.toFixed(2)}% (about ${bps} bps lower) to clear ${targetDscr.toFixed(2)}x at this leverage.`,
      impact: `→ ${targetDscr.toFixed(2)}x DSCR`,
      risk: "MODERATE",
      apply: { rate: Math.round(be * 1000) / 1000, mRate: Math.round(be * 1000) / 1000 },
    });
  }

  return fixes.slice(0, 4);
}

/**
 * Full rescue analysis via the production rescueTrack1 engine (8 levers,
 * ranked fastest/cheapest/lowest-risk/best-ROI). Returns null when the deal
 * already clears the target or inputs are degenerate.
 */
export interface RescueAnalysis {
  currentTrack1DSCR: number;
  targetTrack1DSCR: number;
  currentTrack2DSCR: number;
  warning: string;
  fixes: {
    action: string;
    description: string;
    track1Impact: number;
    risk: "LOW" | "MODERATE" | "HIGH";
    cost: number;
    lenderConfirmation: boolean;
  }[];
  best: {
    fastest: string;
    cheapest: string;
    lowestRisk: string;
    bestROI: string;
  };
}

export function computeRescueAnalysis(
  deal: DealSnapshot,
  opts: { taxYr: number; targetDscr?: number },
): RescueAnalysis | null {
  const targetDscr = opts.targetDscr ?? 1.0;
  const { price, down, rent, rate, ins, hoa } = deal;
  const taxYr = opts.taxYr;
  const loanAmount = price * (1 - down / 100);
  const pAndI = loanAmount * pf(rate);
  const pitia = pAndI + taxYr / 12 + ins / 12 + hoa;
  const dscr = pitia > 0 ? rent / pitia : 0;
  if (dscr >= targetDscr || pitia <= 0) return null;

  try {
    const property = {
      purchasePrice: price,
      leaseRent: rent,
      marketRent: rent,
      strProjectedRent: 0,
      strDocumentedRent: 0,
      hoa,
      annualTaxes: taxYr,
      annualInsurance: ins,
      floodInsurance: 0,
      propertyType: "SFR" as const,
      state: deal.stateCode,
      unitCount: 1,
      sqft: 0,
      yearBuilt: 2000,
      isCondotel: false,
      isNonWarrantable: false,
      isRural: false,
      isDecliningMarket: false,
      hoaSTRPolicy: "UNKNOWN" as const,
    };
    const loan = {
      ltv: 100 - down,
      term: "30_YR" as const,
      ioPeriod: "NONE" as const,
      armType: "FIXED" as const,
      prepayPreference: "NONE" as const,
      purpose: "PURCHASE" as const,
      expectedHoldYears: 5,
      points: 0,
      lenderFees: 0,
      brokerFees: 0,
      rateLockCost: 0,
    };
    const borrower = {
      ficoScore: 740,
      experience: "EXPERIENCED" as const,
      existingFinancedProperties: 1,
      entityType: "LLC" as const,
      isUSCitizenOrPR: true,
      availableReserves: 50_000,
      reserveAssets: [],
      isFirstResponder: false,
      isNonUsInvestor: false,
    };
    const res = rescueTrack1(
      property as any,
      borrower as any,
      loan as any,
      dscr,
      targetDscr,
      pitia,
      loanAmount,
      rate,
      30,
    );
    return {
      currentTrack1DSCR: res.currentTrack1DSCR,
      targetTrack1DSCR: res.targetTrack1DSCR,
      currentTrack2DSCR: res.currentTrack2DSCR,
      warning: res.warning,
      fixes: res.fixes.map((f: any) => ({
        action: f.action,
        description: f.description,
        track1Impact: f.track1Impact,
        risk: f.risk,
        cost: f.cost,
        lenderConfirmation: f.lenderConfirmation,
      })),
      best: {
        fastest: res.fastestFix?.action ?? "",
        cheapest: res.cheapestFix?.action ?? "",
        lowestRisk: res.lowestRiskFix?.action ?? "",
        bestROI: res.bestROIFix?.action ?? "",
      },
    };
  } catch {
    return null;
  }
}
