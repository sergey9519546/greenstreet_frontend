import { z } from "zod";

export const STATE_REGEX = /^[A-Z]{2}$/;

export const DealRequestSchema = z.object({
  // Core — always required
  purchasePrice: z.number({ message: "purchasePrice must be a number" })
    .positive("purchasePrice must be positive")
    .min(50_000, "purchasePrice must be at least $50,000")
    .max(50_000_000, "purchasePrice must not exceed $50,000,000"),
  monthlyRent: z.number({ message: "monthlyRent must be a number" })
    .min(0, "monthlyRent cannot be negative")
    .max(1_000_000, "monthlyRent seems unreasonably high"),
  state: z.string({ message: "state must be a string" })
    .transform((s) => s.trim().toUpperCase().slice(0, 2))
    .refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),

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

  // Enums / booleans — permissive (engine applies defaults for unknown values)
  propertyType: z.string().optional(),
  entityType:   z.enum(["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"]).optional(),
  experience:   z.string().optional(),
  term:         z.string().optional(),
  ioPeriod:     z.string().optional(),
  armType:      z.string().optional(),
  prepayPreference: z.string().optional(),
  loanPurpose:  z.string().optional(),
  strategy:     z.string().optional(),
  hoaSTRPolicy: z.string().optional(),
  isCondotel:   z.boolean().optional(),
  isNonWarrantable: z.boolean().optional(),
  isRural:      z.boolean().optional(),
  isForeignNational: z.boolean().optional(),
  isUSCitizenOrPR:   z.boolean().optional(),
  isFirstResponder:  z.boolean().optional(),
});

export const StateRequestSchema = z.object({
  state:       z.string().transform((s) => s.trim().toUpperCase().slice(0, 2))
               .refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),
  entityType:  z.enum(["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"]).optional().default("LLC"),
  loanAmount:  z.number().positive().max(50_000_000).optional().default(400_000),
  unitCount:   z.number().int().min(1).max(4).optional().default(1),
  productType: z.enum(["FIXED", "ARM"]).optional().default("FIXED"),
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
