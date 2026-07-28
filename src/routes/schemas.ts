import { z } from "zod";

export const US_STATE_CODES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
] as const;

const US_STATE_CODE_SET = new Set<string>(US_STATE_CODES);
const StateCodeSchema = z.string({ message: "state must be a string" })
  .trim()
  .transform((state) => state.toUpperCase())
  .refine(
    (state) => US_STATE_CODE_SET.has(state),
    "state must be a valid 2-letter US state or DC abbreviation",
  );

export const DealRequestSchema = z.object({
  // Core — always required
  purchasePrice: z.number({ message: "purchasePrice must be a number" })
    .positive("purchasePrice must be positive")
    .min(50_000, "purchasePrice must be at least $50,000")
    .max(50_000_000, "purchasePrice must not exceed $50,000,000"),
  monthlyRent: z.number({ message: "monthlyRent must be a number" })
    .min(0, "monthlyRent cannot be negative")
    .max(1_000_000, "monthlyRent seems unreasonably high"),
  state: StateCodeSchema,

  // Optional — with range guards
  loanAmount:  z.number().positive().max(50_000_000).optional(),
  ltv:         z.number().min(50).max(90).optional(),
  ficoScore:   z.number().min(300).max(850).optional(),
  unitCount:   z.number().int().min(1).max(4).optional(),
  annualTaxes: z.number().min(0).max(1_000_000).optional(),
  annualInsurance: z.number().min(0).max(500_000).optional(),
  hoa:         z.number().min(0).optional(),
  floodInsurance: z.number().min(0).optional(),
  sqft:        z.number().min(100).max(50_000).optional(),
  yearBuilt:   z.number().int().min(1800).max(new Date().getFullYear() + 2).optional(),
  expectedHoldYears: z.number().min(1).max(50).optional(),
  availableReserves: z.number().min(0).optional(),
  existingFinancedProperties: z.number().int().min(0).max(200).optional(),
  points:       z.number().min(0).max(10).optional(),
  lenderFees:  z.number().min(0).optional(),
  brokerFees:  z.number().min(0).optional(),
  rateLockCost: z.number().min(0).optional(),
  marketRent:  z.number().min(0).optional(),
  strProjectedRent: z.number().min(0).optional(),
  strDocumentedRent: z.number().min(0).optional(),

  // Enumerations must match the engine's supported domain values. Rejecting
  // unknown values prevents a malformed request from being silently modeled as
  // a different loan structure (especially an interest-only loan).
  propertyType: z.enum(["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "CONDOTEL", "RURAL", "5+_UNIT", "MIXED_USE"]).optional(),
  entityType:   z.enum(["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"]).optional(),
  experience:   z.enum(["FIRST_TIME", "EXPERIENCED", "VETERAN"]).optional(),
  term:         z.enum(["30_YR", "40_YR", "15_YR"]).optional(),
  ioPeriod:     z.enum(["NONE", "5_YR", "7_YR", "10_YR"]).optional(),
  armType:      z.enum(["FIXED", "5_6_ARM", "7_6_ARM", "10_6_ARM"]).optional(),
  prepayPreference: z.enum(["NONE", "54321", "4321", "321", "54333", "FLAT_5", "SIX_MONTHS_INTEREST", "SIX_MONTHS_80_PCT", "YIELD_MAINTENANCE", "SOFT_PREPAY"]).optional(),
  loanPurpose:  z.enum(["PURCHASE", "RATE_TERM", "CASH_OUT"]).optional(),
  strategy:     z.enum(["LTR", "STR", "MTR"]).optional(),
  hoaSTRPolicy: z.enum(["ALLOWS", "SILENT", "PROHIBITS", "UNKNOWN"]).optional(),
  isCondotel:   z.boolean().optional(),
  isNonWarrantable: z.boolean().optional(),
  isRural:      z.boolean().optional(),
  isForeignNational: z.boolean().optional(),
  isUSCitizenOrPR:   z.boolean().optional(),
  isFirstResponder:  z.boolean().optional(),
});

export const StateRequestSchema = z.object({
  state:       StateCodeSchema,
  entityType:  z.enum(["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"]).optional().default("LLC"),
  loanAmount:  z.number().positive().max(50_000_000).optional().default(400_000),
  unitCount:   z.number().int().min(1).max(4).optional().default(1),
  productType: z.enum(["FIXED", "ARM"]).optional().default("FIXED"),
});

export const StructureCompareRequestSchema = z.object({
  loanAmount: z.number({ message: "loanAmount must be a number" })
    .positive("loanAmount must be positive")
    .max(50_000_000, "loanAmount must not exceed $50,000,000"),
  annualRatePct: z.number({ message: "annualRatePct must be a number" })
    .min(0, "annualRatePct cannot be negative")
    .max(25, "annualRatePct must not exceed 25"),
  monthlyRent: z.number({ message: "monthlyRent must be a number" })
    .min(0, "monthlyRent cannot be negative")
    .max(1_000_000, "monthlyRent seems unreasonably high"),
  monthlyNonDebtCosts: z.number({ message: "monthlyNonDebtCosts must be a number" })
    .min(0, "monthlyNonDebtCosts cannot be negative")
    .max(1_000_000, "monthlyNonDebtCosts seems unreasonably high"),
});

export const NarrateRequestSchema = z.object({
  deal: z.object({
    dscr: z.number({ message: "dscr must be a number" }),
    solvedRate: z.number({ message: "solvedRate must be a number" }),
    dealBreakRate: z.number().optional().nullable(),
    rateHeadroomBps: z.number().optional().nullable(),
    dualTrackDSCR: z.object({
      track1: z.object({ passes: z.boolean() }).optional().nullable(),
      track2: z.object({ passes: z.boolean() }).optional().nullable(),
      verdict: z.object({ summary: z.string().max(1000, "summary must be at most 1000 characters").optional() }).optional().nullable(),
    }).optional().nullable(),
  }),
  context: z.string().max(1000, "context must be at most 1000 characters").optional().nullable(),
});
