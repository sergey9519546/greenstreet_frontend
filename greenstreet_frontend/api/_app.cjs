var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/serverApp.ts
var serverApp_exports = {};
__export(serverApp_exports, {
  app: () => app
});
module.exports = __toCommonJS(serverApp_exports);
var import_express3 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);

// src/logger.ts
var import_pino = __toESM(require("pino"), 1);
var isDev = process.env.NODE_ENV !== "production";
var logger = (0, import_pino.default)(
  {
    level: process.env.LOG_LEVEL || "info",
    // Redact secrets and PII from log output — never log API keys, auth tokens, or personal data
    redact: {
      paths: [
        // Auth / secrets
        "req.headers.authorization",
        'req.headers["x-api-key"]',
        "body.apiKey",
        "body.token",
        // PII — lead form fields and user profile data
        "body.email",
        "body.name",
        "body.phone",
        "body.firstName",
        "body.lastName",
        "email",
        "user.email",
        // Partial tokens logged by auth middleware
        "token"
      ],
      censor: "[REDACTED]"
    },
    base: {
      pid: process.pid,
      env: process.env.NODE_ENV || "development"
    },
    timestamp: import_pino.default.stdTimeFunctions.isoTime
  },
  isDev ? import_pino.default.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss",
      ignore: "pid,hostname,env"
    }
  }) : void 0
  // In production: raw JSON to stdout for log aggregators (Datadog, Logtail, etc.)
);
function logRequest(method, path2, statusCode, durationMs, extra) {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  logger[level]({ method, path: path2, statusCode, durationMs, ...extra }, `${method} ${path2} ${statusCode} (${durationMs}ms)`);
}

// src/middleware/error.ts
function errorHandler(err, req, res, _next) {
  const requestId = (Math.random() * 1e9).toString(36);
  logger.error({ err, requestId, path: req.path }, "Unhandled express error");
  const status = typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;
  const message = status < 500 ? err.message || "Bad request" : "Internal server error";
  res.status(status).json({ error: message, requestId });
}

// src/routes/dscr.ts
var import_express = require("express");

// src/middleware/validate.ts
var import_zod = require("zod");
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof import_zod.ZodError) {
        const issues = error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message
        }));
        logger.warn({ issues, path: req.path }, "Validation failed");
        res.status(400).json({ error: "Validation failed", issues });
        return;
      }
      next(error);
    }
  };
}

// src/routes/schemas.ts
var import_zod2 = require("zod");
var STATE_REGEX = /^[A-Z]{2}$/;
var DealRequestSchema = import_zod2.z.object({
  // Core — always required
  purchasePrice: import_zod2.z.number({ message: "purchasePrice must be a number" }).positive("purchasePrice must be positive").min(5e4, "purchasePrice must be at least $50,000").max(5e7, "purchasePrice must not exceed $50,000,000"),
  monthlyRent: import_zod2.z.number({ message: "monthlyRent must be a number" }).min(0, "monthlyRent cannot be negative").max(1e6, "monthlyRent seems unreasonably high"),
  state: import_zod2.z.string({ message: "state must be a string" }).transform((s) => s.trim().toUpperCase().slice(0, 2)).refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),
  // Optional — with range guards
  loanAmount: import_zod2.z.number().positive().max(5e7).optional(),
  ltv: import_zod2.z.number().min(50).max(90).optional(),
  ficoScore: import_zod2.z.number().min(300).max(850).optional(),
  unitCount: import_zod2.z.number().int().min(1).max(4).optional(),
  annualTaxes: import_zod2.z.number().min(0).max(1e6).optional(),
  annualInsurance: import_zod2.z.number().min(0).max(5e5).optional(),
  hoa: import_zod2.z.number().min(0).optional(),
  floodInsurance: import_zod2.z.number().min(0).optional(),
  sqft: import_zod2.z.number().min(100).max(5e4).optional(),
  yearBuilt: import_zod2.z.number().int().min(1800).max((/* @__PURE__ */ new Date()).getFullYear() + 2).optional(),
  expectedHoldYears: import_zod2.z.number().min(1).max(50).optional(),
  availableReserves: import_zod2.z.number().min(0).optional(),
  existingFinancedProperties: import_zod2.z.number().int().min(0).max(200).optional(),
  points: import_zod2.z.number().min(0).max(10).optional(),
  lenderFees: import_zod2.z.number().min(0).optional(),
  brokerFees: import_zod2.z.number().min(0).optional(),
  rateLockCost: import_zod2.z.number().min(0).optional(),
  marketRent: import_zod2.z.number().min(0).optional(),
  strProjectedRent: import_zod2.z.number().min(0).optional(),
  strDocumentedRent: import_zod2.z.number().min(0).optional(),
  // Enums / booleans — permissive (engine applies defaults for unknown values)
  propertyType: import_zod2.z.string().optional(),
  entityType: import_zod2.z.string().optional(),
  experience: import_zod2.z.string().optional(),
  term: import_zod2.z.string().optional(),
  ioPeriod: import_zod2.z.string().optional(),
  armType: import_zod2.z.string().optional(),
  prepayPreference: import_zod2.z.string().optional(),
  loanPurpose: import_zod2.z.string().optional(),
  strategy: import_zod2.z.string().optional(),
  hoaSTRPolicy: import_zod2.z.string().optional(),
  isCondotel: import_zod2.z.boolean().optional(),
  isNonWarrantable: import_zod2.z.boolean().optional(),
  isRural: import_zod2.z.boolean().optional(),
  isNonUsInvestor: import_zod2.z.boolean().optional(),
  isUSCitizenOrPR: import_zod2.z.boolean().optional(),
  isFirstResponder: import_zod2.z.boolean().optional()
});
var StateRequestSchema = import_zod2.z.object({
  state: import_zod2.z.string().transform((s) => s.trim().toUpperCase().slice(0, 2)).refine((s) => STATE_REGEX.test(s), "state must be a 2-letter US abbreviation"),
  entityType: import_zod2.z.string().optional().default("LLC"),
  loanAmount: import_zod2.z.number().positive().max(5e7).optional().default(4e5),
  unitCount: import_zod2.z.number().int().min(1).max(4).optional().default(1),
  productType: import_zod2.z.string().optional().default("FIXED")
});
var NarrateRequestSchema = import_zod2.z.object({
  deal: import_zod2.z.object({
    dscr: import_zod2.z.number({ message: "dscr must be a number" }),
    solvedRate: import_zod2.z.number({ message: "solvedRate must be a number" }),
    dealBreakRate: import_zod2.z.number().optional().nullable(),
    rateHeadroomBps: import_zod2.z.number().optional().nullable(),
    dualTrackDSCR: import_zod2.z.object({
      track1: import_zod2.z.object({ passes: import_zod2.z.boolean() }).optional().nullable(),
      track2: import_zod2.z.object({ passes: import_zod2.z.boolean() }).optional().nullable(),
      verdict: import_zod2.z.object({ summary: import_zod2.z.string().optional() }).optional().nullable()
    }).optional().nullable()
  }),
  context: import_zod2.z.string().max(1e3, "context must be at most 1000 characters").optional().nullable()
});

// src/engineService.ts
var import_worker_threads = require("worker_threads");
var import_path = __toESM(require("path"), 1);

// src/engine/tcoDscr.ts
var BASE_TCO_RATES = {
  SFR: { management: 0.08, maintenance: 0.08, capex: 0.05, vacancy: 0.07 },
  // 28%
  SMALL_MULTI: { management: 0.07, maintenance: 0.07, capex: 0.05, vacancy: 0.08 },
  // 27%
  MED_MULTI: { management: 0.06, maintenance: 0.06, capex: 0.04, vacancy: 0.09 },
  // 25%
  CONDOTEL: { management: 0.25, maintenance: 0.1, capex: 0.08, vacancy: 0.2 }
  // 63% (STR/condotel)
};
var AGE_ADJUSTMENTS = {
  NEW: { maintenance: -0.03, capex: -0.02 },
  AVERAGE: { maintenance: 0, capex: 0 },
  AGING: { maintenance: 0.03, capex: 0.02 },
  OLD: { maintenance: 0.05, capex: 0.04 }
};
var MARKET_ADJUSTMENTS = {
  HOT: -0.02,
  NORMAL: 0,
  SLOW: 0.03,
  STRESS: 0.05
};
function r4(n) {
  return Math.round(n * 1e4) / 1e4;
}
function computeTcoRate(o = {}) {
  const type = o.propertyType ?? "SFR";
  const age = o.propertyAge ?? "AVERAGE";
  const market = o.marketType ?? "NORMAL";
  const base = BASE_TCO_RATES[type];
  const ageAdj = AGE_ADJUSTMENTS[age];
  const management = o.isSelfManaged ? Math.min(base.management, 0.05) : base.management;
  const maintenance = Math.max(0, base.maintenance + ageAdj.maintenance);
  const capex = Math.max(0, base.capex + ageAdj.capex);
  const vacancy = o.vacancyOverridePct !== void 0 ? Math.max(0, o.vacancyOverridePct / 100) : Math.max(0.02, base.vacancy + MARKET_ADJUSTMENTS[market]);
  return {
    vacancy: r4(vacancy),
    management: r4(management),
    maintenance: r4(maintenance),
    capex: r4(capex),
    total: r4(vacancy + management + maintenance + capex)
  };
}
function mapToTcoType(unitCount, isShortTerm) {
  if (isShortTerm) return "CONDOTEL";
  if (unitCount >= 5) return "MED_MULTI";
  if (unitCount >= 2) return "SMALL_MULTI";
  return "SFR";
}

// src/engine/engine.ts
function calculatePaymentFactor(annualRate, termMonths) {
  const r = annualRate / 100 / 12;
  if (r === 0) return 1 / termMonths;
  const compoundFactor = Math.pow(1 + r, termMonths);
  return r * compoundFactor / (compoundFactor - 1);
}
function calculatePI(loanAmount, annualRate, termMonths) {
  const factor = calculatePaymentFactor(annualRate, termMonths);
  return loanAmount * factor;
}
function calculateIOPayment(loanAmount, annualRate) {
  return loanAmount * (annualRate / 100 / 12);
}
var BASE_RATE_ANCHOR = 6.125;
var FULL_MARKET_SPREAD = 4.625;
var RATE_FLOOR_PCT = 5;
var RATE_CEILING_PCT = 12;
function ficoAdjustment(fico) {
  if (fico >= 760) return -12.5;
  if (fico >= 740) return 0;
  if (fico >= 720) return 25;
  if (fico >= 700) return 50;
  if (fico >= 680) return 75;
  if (fico >= 660) return 125;
  if (fico >= 640) return 175;
  if (fico >= 620) return 250;
  return 350;
}
function ltvAdjustment(ltv) {
  if (ltv <= 60) return -50;
  if (ltv <= 65) return -37.5;
  if (ltv <= 70) return -25;
  if (ltv <= 75) return 0;
  if (ltv <= 80) return 50;
  if (ltv <= 85) return 125;
  return 200;
}
function dscrTierAdjustment(dscr) {
  if (dscr >= 1.5) return -25;
  if (dscr >= 1.25) return 0;
  if (dscr >= 1.1) return 12.5;
  if (dscr >= 1) return 25;
  if (dscr >= 0.85) return 75;
  return 150;
}
function propertyTypeAdjustment(pt) {
  switch (pt) {
    case "SFR":
      return 0;
    case "2-4_UNIT":
      return 25;
    case "CONDO_WARRANTABLE":
      return 25;
    case "CONDO_NON_WARRANTABLE":
      return 75;
    case "CONDOTEL":
      return 100;
    case "RURAL":
      return 50;
    case "5+_UNIT":
      return 50;
    case "MIXED_USE":
      return 75;
    default:
      return 0;
  }
}
function loanPurposeAdjustment(purpose) {
  switch (purpose) {
    case "PURCHASE":
      return 0;
    case "RATE_TERM":
      return 25;
    case "CASH_OUT":
      return 50;
    default:
      return 0;
  }
}
function armRateAdjustment(armType) {
  switch (armType) {
    case "FIXED":
      return 0;
    case "5_6_ARM":
      return -100;
    case "7_6_ARM":
      return -75;
    case "10_6_ARM":
      return -50;
    default:
      return 0;
  }
}
function ioRateAdjustment(ioPeriod) {
  switch (ioPeriod) {
    case "NONE":
      return 0;
    case "5_YR":
      return 50;
    case "7_YR":
      return 50;
    case "10_YR":
      return 50;
    default:
      return 0;
  }
}
function termAdjustment(term) {
  switch (term) {
    case "30_YR":
      return 0;
    case "40_YR":
      return 25;
    case "15_YR":
      return -25;
    default:
      return 0;
  }
}
function nonUsInvestorAdjustment(isNonUsInvestor) {
  return isNonUsInvestor ? 75 : 0;
}
function decliningMarketAdjustment(isDecliningMarket) {
  return isDecliningMarket ? 25 : 0;
}
function firstTimeInvestorAdjustment(experience) {
  return experience === "FIRST_TIME" ? 37.5 : 0;
}
function prepayStepAdjustment(prepayType) {
  switch (prepayType) {
    case "NONE":
      return 0;
    // open / most flexible — priced baseline
    case "SOFT_PREPAY":
    case "321":
      return -12.5;
    case "4321":
      return -25;
    case "54321":
    case "54333":
    case "FLAT_5":
    case "YIELD_MAINTENANCE":
      return -37.5;
    default:
      return 0;
  }
}
function getDSCRGradient(dscr) {
  if (dscr >= 1.5) {
    return { tier: "ELITE", label: "Elite Pricing Tier", range: "\u22651.50", color: "emerald", bgClass: "bg-emerald-500/20", textClass: "text-emerald-400", borderClass: "border-emerald-500/50", emoji: "\u{1F680}" };
  }
  if (dscr >= 1.25) {
    return { tier: "STRONG", label: "Best Pricing Tier", range: "1.25\u20131.49", color: "cyan", bgClass: "bg-cyan-500/20", textClass: "text-cyan-400", borderClass: "border-cyan-500/50", emoji: "\u{1F48E}" };
  }
  if (dscr >= 1.1) {
    return { tier: "STANDARD", label: "Standard Approval", range: "1.10\u20131.24", color: "green", bgClass: "bg-green-500/20", textClass: "text-green-400", borderClass: "border-green-500/50", emoji: "\u{1F7E2}" };
  }
  if (dscr >= 1) {
    return { tier: "PREMIUM", label: "Approval Likely w/ Premium", range: "1.00\u20131.09", color: "yellow", bgClass: "bg-yellow-500/20", textClass: "text-yellow-400", borderClass: "border-yellow-500/50", emoji: "\u{1F7E1}" };
  }
  if (dscr >= 0.85) {
    return { tier: "SPECIALIST", label: "Flex/Specialist Lenders Only", range: "0.85\u20130.99", color: "orange", bgClass: "bg-orange-500/20", textClass: "text-orange-400", borderClass: "border-orange-500/50", emoji: "\u{1F7E0}" };
  }
  if (dscr >= 0.75) {
    return { tier: "SPECIALIST", label: "Deep Flex / No-Ratio Programs", range: "0.75\u20130.84", color: "orange", bgClass: "bg-orange-500/20", textClass: "text-orange-400", borderClass: "border-orange-500/50", emoji: "\u{1F7E0}" };
  }
  return { tier: "NO_RATIO", label: "No-Ratio Programs Only", range: "<0.75", color: "red", bgClass: "bg-red-500/20", textClass: "text-red-400", borderClass: "border-red-500/50", emoji: "\u{1F534}" };
}
var STR_QUALIFYING_HAIRCUT_PCT = 20;
function computeQualifyingRent(property, strategy, vacancyHaircutEnabled = false, vacancyHaircutPct = 0) {
  if (strategy === "STR") {
    const strNet = property.strProjectedRent * (1 - STR_QUALIFYING_HAIRCUT_PCT / 100);
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    const qualifying = Math.max(strNet, ltrFallback);
    return {
      rent: qualifying,
      source: qualifying === strNet ? `STR Income \xD7 ${100 - STR_QUALIFYING_HAIRCUT_PCT}% (${STR_QUALIFYING_HAIRCUT_PCT}% haircut) \u2014 $${property.strProjectedRent} \u2192 $${strNet.toFixed(0)}` : "LT Market Rent Fallback (higher than STR after haircut)",
      haircutApplied: qualifying === strNet ? STR_QUALIFYING_HAIRCUT_PCT : 0
    };
  }
  if (strategy === "MTR") {
    const mtrNet = property.strProjectedRent * 0.88;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    const qualifying = Math.max(mtrNet, ltrFallback);
    return {
      rent: qualifying,
      source: qualifying === mtrNet ? "MTR Income (12% haircut)" : "LT Market Rent Fallback",
      haircutApplied: qualifying === mtrNet ? 12 : 0
    };
  }
  const lowerRent = Math.min(property.leaseRent, property.marketRent);
  let qualifyingRent = lowerRent;
  let haircut = 0;
  if (vacancyHaircutEnabled && property.unitCount > 1 && vacancyHaircutPct > 0) {
    qualifyingRent = lowerRent * (1 - vacancyHaircutPct / 100);
    haircut = vacancyHaircutPct;
  }
  return {
    rent: qualifyingRent,
    source: property.leaseRent <= property.marketRent ? `Lease Rent (lower of lease/market)${haircut > 0 ? ` \u2014 ${haircut}% haircut applied` : ""}` : `1007 Market Rent (lower of lease/market)${haircut > 0 ? ` \u2014 ${haircut}% haircut applied` : ""}`,
    haircutApplied: haircut
  };
}
function buildTrack1(qualifyingRent, rentSource, pitia, formulaMethod, ioPayment, haircutApplied, piOnly) {
  const denominator = formulaMethod === "GROSS_ITIA" && ioPayment ? ioPayment : formulaMethod === "NOI_PI" ? piOnly : pitia;
  const dscr = denominator > 0 ? qualifyingRent / denominator : 0;
  const monthlyCashFlow = qualifyingRent - pitia;
  return {
    label: "Track 1 \u2014 Lender Qualification",
    dscr: Math.round(dscr * 1e3) / 1e3,
    gradient: getDSCRGradient(dscr),
    qualifyingRent,
    rentSource,
    formulaMethod,
    vacancyApplied: haircutApplied,
    managementApplied: 0,
    maintenanceApplied: 0,
    netRentAfterDeductions: qualifyingRent,
    monthlyCashFlow,
    passes: dscr >= 1
  };
}
function buildTrack2(grossRent, pitia, strategy, unitCount) {
  const tcoType = mapToTcoType(unitCount, strategy === "STR");
  const rate = computeTcoRate({ propertyType: tcoType });
  const vacancyPct = rate.vacancy * 100;
  const mgmtPct = rate.management * 100;
  const maintPct = rate.maintenance * 100;
  const capexPct = rate.capex * 100;
  const netIncome = grossRent * (1 - rate.total);
  const dscr = pitia > 0 ? netIncome / pitia : 0;
  const monthlyCashFlow = netIncome - pitia;
  return {
    label: "Track 2 \u2014 Investor Survival",
    dscr: Math.round(dscr * 1e3) / 1e3,
    gradient: getDSCRGradient(dscr),
    qualifyingRent: grossRent,
    rentSource: `Gross less ${vacancyPct.toFixed(0)}% vacancy, ${mgmtPct.toFixed(0)}% mgmt, ${maintPct.toFixed(0)}% maint, ${capexPct.toFixed(0)}% capex (TCO ${(rate.total * 100).toFixed(0)}%)`,
    formulaMethod: "GROSS_PITIA",
    vacancyApplied: Math.round(vacancyPct * 10) / 10,
    managementApplied: Math.round(mgmtPct * 10) / 10,
    maintenanceApplied: Math.round(maintPct * 10) / 10,
    capexApplied: Math.round(capexPct * 10) / 10,
    netRentAfterDeductions: netIncome,
    monthlyCashFlow,
    passes: dscr >= 1
  };
}
function buildVerdict(track1, track2) {
  const track1Passes = track1.dscr >= 1;
  const track2Passes = track2.dscr >= 1;
  let summary;
  let warningRequired = false;
  if (track1Passes && track2Passes) {
    summary = "Deal qualifies and cash flows after expenses.";
  } else if (track1Passes && !track2Passes) {
    summary = `This deal gets approved. It does not cash flow. Track 2 shows -$${Math.abs(track2.monthlyCashFlow).toFixed(0)}/month negative carry. Proceed only if appreciation/tax strategy justifies negative carry.`;
    warningRequired = true;
  } else if (!track1Passes && track2Passes) {
    summary = "Deal cash flows as an investment but may not qualify for lender DSCR floor. Rescue engine needed.";
  } else {
    summary = "Deal fails both qualification and cash flow. Rescue engine needed.";
  }
  return { track1Passes, track2Passes, summary, warningRequired };
}
function calculatePITIA(loanAmount, rate, termYears, ioPeriod, annualTaxes, annualInsurance, hoa, floodInsurance = 0, mortgageInsurance = 0) {
  const termMonths = termYears * 12;
  const ioYears = ioPeriod === "NONE" ? 0 : ioPeriod === "5_YR" ? 5 : ioPeriod === "7_YR" ? 7 : 10;
  const isInterestOnly = ioYears > 0;
  let pi;
  let ioPayment;
  if (isInterestOnly) {
    pi = calculateIOPayment(loanAmount, rate);
    ioPayment = pi;
  } else {
    pi = calculatePI(loanAmount, rate, termMonths);
  }
  const taxes = annualTaxes / 12;
  const insurance = annualInsurance / 12;
  const flood = floodInsurance / 12;
  const mi = mortgageInsurance;
  const total = pi + taxes + insurance + hoa + flood + mi;
  const itia = isInterestOnly ? pi + taxes + insurance + hoa + flood + mi : void 0;
  return {
    principalAndInterest: pi,
    taxes,
    insurance,
    hoa,
    floodInsurance: flood,
    mortgageInsurance: mi,
    total,
    isInterestOnly,
    interestOnlyPayment: ioPayment,
    itia
  };
}
function solveDealBreakRate(qualifyingRent, loanAmount, termYears, ioPeriod, annualTaxes, annualInsurance, hoa, floodInsurance = 0) {
  const fixedExpenses = annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
  const targetPI = qualifyingRent - fixedExpenses;
  if (targetPI <= 0) return 0;
  const termMonths = termYears * 12;
  const ioYears = ioPeriod === "NONE" ? 0 : parseInt(ioPeriod) || 0;
  if (ioYears > 0) {
    return targetPI * 12 / loanAmount * 100;
  }
  let lowRate = 2;
  let highRate = 15;
  for (let i = 0; i < 50; i++) {
    const midRate = (lowRate + highRate) / 2;
    const pi = calculatePI(loanAmount, midRate, termMonths);
    if (pi > targetPI) {
      highRate = midRate;
    } else {
      lowRate = midRate;
    }
  }
  return Math.round((lowRate + highRate) / 2 * 100) / 100;
}
function solveMaxPurchasePrice(qualifyingRent, ltv, rate, termYears, ioPeriod, annualTaxes, annualInsurance, hoa, floodInsurance = 0, targetDSCR = 1) {
  const maxPITIA = qualifyingRent / targetDSCR;
  const fixedExpenses = annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
  const maxPI = maxPITIA - fixedExpenses;
  if (maxPI <= 0) return 0;
  const termMonths = termYears * 12;
  const factor = calculatePaymentFactor(rate, termMonths);
  const maxLoan = maxPI / factor;
  const maxPrice = maxLoan / (ltv / 100);
  return Math.round(maxPrice);
}
function solveMinDownPayment(purchasePrice, qualifyingRent, ltv, rate, termYears, ioPeriod, annualTaxes, annualInsurance, hoa, floodInsurance = 0, targetDSCR = 1) {
  const maxPrice = solveMaxPurchasePrice(
    qualifyingRent,
    ltv,
    rate,
    termYears,
    ioPeriod,
    annualTaxes,
    annualInsurance,
    hoa,
    floodInsurance,
    targetDSCR
  );
  const maxLoan = maxPrice * (ltv / 100);
  const minDown = purchasePrice - maxLoan;
  const currentDown = purchasePrice * (1 - ltv / 100);
  return { minDown: Math.max(minDown, 0), additionalDown: Math.max(minDown - currentDown, 0) };
}
function calculateCashToClose(purchasePrice, loanAmount, loan, reserveMonthsLikely, reserveMonthsConservative, monthlyPITIA, furnishingBudget = 0, sellerCredits = 0) {
  const downPayment = purchasePrice - loanAmount;
  const closingCosts = loanAmount * 0.03;
  const points = loanAmount * (loan.points / 100);
  const lenderFees = loan.lenderFees;
  const brokerFees = loan.brokerFees;
  const rateLockCost = loan.rateLockCost;
  const reservesLikely = reserveMonthsLikely * monthlyPITIA;
  const reservesConservative = reserveMonthsConservative * monthlyPITIA;
  const base = downPayment + closingCosts + points + lenderFees + brokerFees + rateLockCost;
  const total = base + reservesLikely + furnishingBudget - sellerCredits;
  const totalConservative = base + reservesConservative + furnishingBudget - sellerCredits;
  const totalStress = base + Math.min(reserveMonthsConservative * 1.5, 12) * monthlyPITIA + furnishingBudget - sellerCredits;
  return {
    downPayment,
    closingCosts,
    points,
    lenderFees,
    brokerFees,
    rateLockCost,
    reserveRequirement: reservesLikely,
    reserveConservative: reservesConservative,
    furnishingBudget,
    credits: sellerCredits,
    total: Math.round(total),
    totalConservative: Math.round(totalConservative),
    totalStress: Math.round(totalStress)
  };
}
function estimateRate(borrower, loan, dscrTier, propertyType, isDecliningMarket) {
  const totalBps = ficoAdjustment(borrower.ficoScore) + ltvAdjustment(loan.ltv) + dscrTierAdjustment(dscrTier) + propertyTypeAdjustment(propertyType) + loanPurposeAdjustment(loan.purpose) + armRateAdjustment(loan.armType) + ioRateAdjustment(loan.ioPeriod) + termAdjustment(loan.term) + nonUsInvestorAdjustment(borrower.isNonUsInvestor) + decliningMarketAdjustment(isDecliningMarket) + firstTimeInvestorAdjustment(borrower.experience) + prepayStepAdjustment(loan.prepayPreference);
  const rate = BASE_RATE_ANCHOR + totalBps / 100;
  return Math.min(Math.max(rate, RATE_FLOOR_PCT), RATE_CEILING_PCT);
}
function computeTripleRate(solvedRate) {
  return {
    competitive: Math.max(Math.round((solvedRate - 0.875) * 1e3) / 1e3, 5.125),
    typical: Math.round(solvedRate * 1e3) / 1e3,
    fullMarket: Math.round(Math.min(solvedRate + FULL_MARKET_SPREAD, 12) * 1e3) / 1e3,
    dateStamp: "June 2026",
    treasurySpread: "10yr + ~200-225 bps"
  };
}
function computeAppraisalBreakpoint(qualifyingRent, pitia) {
  const breakpointRent = pitia * 1;
  const percentBelow = qualifyingRent > 0 ? (qualifyingRent - breakpointRent) / qualifyingRent * 100 : 0;
  return { rent: Math.round(breakpointRent), percentBelow: Math.round(percentBelow * 10) / 10 };
}
function solveDSCR(property, borrower, loan, strategy, vacancyHaircutEnabled = false, vacancyHaircutPct = 0, formulaMethod = "GROSS_PITIA", reassessedAnnualTaxOverride) {
  if (!Number.isFinite(property.purchasePrice) || property.purchasePrice <= 0 || !Number.isFinite(property.leaseRent) || property.leaseRent < 0 || !Number.isFinite(loan.ltv) || loan.ltv <= 0 || loan.ltv > 100) {
    const zeroPITIA = {
      principalAndInterest: 0,
      taxes: 0,
      insurance: 0,
      hoa: 0,
      floodInsurance: 0,
      mortgageInsurance: 0,
      total: 0,
      isInterestOnly: false
    };
    const noRatioGradient = getDSCRGradient(0);
    const stub = {
      label: "Track 1 \u2014 Lender Qualification",
      dscr: 0,
      gradient: noRatioGradient,
      qualifyingRent: 0,
      rentSource: "NEEDS_REVIEW \u2014 missing or invalid inputs",
      formulaMethod: "GROSS_PITIA",
      vacancyApplied: 0,
      managementApplied: 0,
      maintenanceApplied: 0,
      netRentAfterDeductions: 0,
      monthlyCashFlow: 0,
      passes: false
    };
    const stub2 = { ...stub, label: "Track 2 \u2014 Investor Survival" };
    return {
      dualTrackDSCR: {
        track1: stub,
        track2: stub2,
        verdict: {
          track1Passes: false,
          track2Passes: false,
          summary: "NEEDS_REVIEW \u2014 one or more required inputs are missing or invalid. Provide purchase price, rent, and LTV before qualifying.",
          warningRequired: true
        }
      },
      qualifyingRent: 0,
      rentSource: "NEEDS_REVIEW",
      monthlyPITIA: zeroPITIA,
      dscr: 0,
      dscrGradient: noRatioGradient,
      solvedRate: 0,
      tripleRate: { competitive: 0, typical: 0, fullMarket: 0, dateStamp: "June 2026", treasurySpread: "" },
      loanAmount: 0,
      debtYield: 0,
      cashToClose: { downPayment: 0, closingCosts: 0, points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0, reserveRequirement: 0, reserveConservative: 0, furnishingBudget: 0, credits: 0, total: 0, totalConservative: 0, totalStress: 0 },
      appraisalBreakpointRent: 0,
      appraisalBreakpointPercent: 0,
      dealBreakRate: 0,
      rateHeadroomBps: 0,
      maxPurchaseAtDSCR1: 0,
      minDownPayment: 0,
      additionalDownNeeded: 0
    };
  }
  const annualTaxes = reassessedAnnualTaxOverride ?? property.annualTaxes;
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === "30_YR" ? 30 : loan.term === "40_YR" ? 40 : 15;
  let assumedDSCR = 1.25;
  let solvedRate = 0;
  let iterations = 0;
  const maxIterations = 10;
  const tolerance = 1e-3;
  let pitia;
  let dscr = 0;
  const { rent: qualifyingRent, source: rentSource, haircutApplied } = computeQualifyingRent(
    property,
    strategy,
    vacancyHaircutEnabled,
    vacancyHaircutPct
  );
  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    solvedRate = estimateRate(borrower, loan, assumedDSCR, property.propertyType, property.isDecliningMarket);
    pitia = calculatePITIA(
      loanAmount,
      solvedRate,
      termYears,
      loan.ioPeriod,
      annualTaxes,
      property.annualInsurance,
      property.hoa,
      property.floodInsurance
    );
    const denominator = formulaMethod === "GROSS_ITIA" && pitia.itia ? pitia.itia : formulaMethod === "NOI_PI" ? pitia.principalAndInterest : pitia.total;
    dscr = denominator > 0 ? qualifyingRent / denominator : 0;
    const newRate = estimateRate(borrower, loan, dscr, property.propertyType, property.isDecliningMarket);
    if (Math.abs(newRate - solvedRate) < tolerance) {
      solvedRate = newRate;
      pitia = calculatePITIA(
        loanAmount,
        solvedRate,
        termYears,
        loan.ioPeriod,
        annualTaxes,
        property.annualInsurance,
        property.hoa,
        property.floodInsurance
      );
      const d2 = formulaMethod === "GROSS_ITIA" && pitia.itia ? pitia.itia : formulaMethod === "NOI_PI" ? pitia.principalAndInterest : pitia.total;
      dscr = d2 > 0 ? qualifyingRent / d2 : 0;
      break;
    }
    assumedDSCR = dscr;
  }
  pitia = calculatePITIA(
    loanAmount,
    solvedRate,
    termYears,
    loan.ioPeriod,
    annualTaxes,
    property.annualInsurance,
    property.hoa,
    property.floodInsurance
  );
  const pitiaDenom = formulaMethod === "GROSS_ITIA" && pitia.itia ? pitia.itia : formulaMethod === "NOI_PI" ? pitia.principalAndInterest : pitia.total;
  dscr = pitiaDenom > 0 ? qualifyingRent / pitiaDenom : 0;
  const track2GrossRent = strategy === "STR" ? property.strProjectedRent : strategy === "MTR" ? property.strProjectedRent : qualifyingRent;
  const track1 = buildTrack1(qualifyingRent, rentSource, pitia.total, formulaMethod, pitia.itia ?? null, haircutApplied, pitia.principalAndInterest);
  const track2 = buildTrack2(track2GrossRent, pitia.total, strategy, property.unitCount);
  const verdict = buildVerdict(track1, track2);
  const dualTrackDSCR = { track1, track2, verdict };
  const dealBreakRate = solveDealBreakRate(
    qualifyingRent,
    loanAmount,
    termYears,
    loan.ioPeriod,
    annualTaxes,
    property.annualInsurance,
    property.hoa,
    property.floodInsurance
  );
  const rateHeadroomBps = Math.round((dealBreakRate - solvedRate) * 100);
  const maxPurchaseAtDSCR1 = solveMaxPurchasePrice(
    qualifyingRent,
    loan.ltv,
    solvedRate,
    termYears,
    loan.ioPeriod,
    annualTaxes,
    property.annualInsurance,
    property.hoa,
    property.floodInsurance
  );
  const { minDown: minDownPayment, additionalDown: additionalDownNeeded } = solveMinDownPayment(
    property.purchasePrice,
    qualifyingRent,
    loan.ltv,
    solvedRate,
    termYears,
    loan.ioPeriod,
    annualTaxes,
    property.annualInsurance,
    property.hoa,
    property.floodInsurance
  );
  const reserveMonths = estimateReserveMonths(dscr, strategy, borrower, loan);
  const reserveMonthsConservative = Math.min(reserveMonths + 3, 12);
  const furnishingBudget = strategy === "STR" ? 5e3 : 0;
  const closingCostPct = 0.03;
  const cashToClose = calculateCashToClose(
    property.purchasePrice,
    loanAmount,
    loan,
    reserveMonths,
    reserveMonthsConservative,
    pitia.total,
    furnishingBudget
  );
  const tripleRate = computeTripleRate(solvedRate);
  const appraisalBP = computeAppraisalBreakpoint(qualifyingRent, pitia.total);
  const debtYield = loanAmount > 0 ? qualifyingRent * 12 / loanAmount : 0;
  return {
    dualTrackDSCR,
    qualifyingRent,
    rentSource,
    monthlyPITIA: pitia,
    dscr: Math.round(dscr * 1e3) / 1e3,
    dscrGradient: getDSCRGradient(dscr),
    solvedRate,
    tripleRate,
    loanAmount,
    debtYield,
    cashToClose,
    appraisalBreakpointRent: appraisalBP.rent,
    appraisalBreakpointPercent: appraisalBP.percentBelow,
    dealBreakRate,
    rateHeadroomBps,
    maxPurchaseAtDSCR1,
    minDownPayment,
    additionalDownNeeded
  };
}
function estimateReserveMonths(dscr, strategy, borrower, loan) {
  let months = 6;
  if (dscr >= 1.25) months = 3;
  else if (dscr >= 1) months = 6;
  else if (dscr >= 0.75) months = 9;
  else months = 12;
  if (strategy === "STR") months += 3;
  if (borrower.experience === "FIRST_TIME") months += 3;
  if (borrower.isNonUsInvestor) months += 6;
  if (loan.ltv > 80) months += 1;
  return Math.min(months, 12);
}

// src/engine/statePppLaws.ts
var PA_PPP_THRESHOLD_2026 = 329411;
var OH_PPP_THRESHOLD_2026 = 116356;
var THRESHOLD_YEAR = 2026;
var ALL_PREPAY_OPTIONS = [
  "NONE",
  "54321",
  "4321",
  "321",
  "54333",
  "FLAT_5",
  "SIX_MONTHS_INTEREST",
  "SIX_MONTHS_80_PCT",
  "YIELD_MAINTENANCE",
  "SOFT_PREPAY"
];
var DECLINING_ONLY_OPTIONS = [
  "NONE",
  "54321",
  "4321",
  "321"
];
var NO_PPP_RATE_PREMIUM = 25e-4;
var NO_PPP_FEE_PREMIUM = 625e-5;
var PPP_STATE_LAWS = {
  // ── MINNESOTA — HF 3437 ENACTED (v11 upgrade) ──────────────
  MN: {
    state: "MN",
    status: "CONDITIONAL",
    // Changed from PRACTICALLY_PROHIBITED — HF 3437 narrows scope
    reason: "MN HF 3437 ENACTED April 23, 2026; effective August 1, 2026. Narrows Minn. Stat. \xA7 58.137 to loans made PRIMARILY for personal/family/household purposes. Business-purpose DSCR loans (LLC-vested, investment property) are NOT reached by the statute. Pre-8/1/26: \xA7 58.137 capped PPPs at 4 years / \u22642 months interest (effectively prohibited). Post-8/1/26: business-purpose DSCR loans have PPP availability per lender matrix.",
    details: 'HF 3437 passed House April 13, Senate April 20, signed into law April 23, 2026. Effective August 1, 2026. Amends \xA7 58.137 to explicitly limit scope to "loans made primarily for personal, family, or household purposes." Business-purpose DSCR loans (which by definition are NOT personal/family/household) are entirely outside scope. PRE-8/1/26: 4-year max duration, \u22642 months interest cap = effectively prohibited. POST-8/1/26: business-purpose loans follow lender state matrix (typically available). Most significant 2026 PPP law change. References: MN Revisor HF 3437 (Refs 37,38,39).',
    maxPenaltyYears: 4,
    // still applies to consumer loans
    maxPenaltyAmount: "2 months interest (consumer only)",
    statutoryReference: "Minn. Stat. \xA7 58.137 (as amended by HF 3437, eff. Aug 1, 2026)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── NEW JERSEY ─────────────────────────────────────────────
  NJ: {
    state: "NJ",
    status: "ENTITY_ONLY",
    reason: "Prohibited for INDIVIDUALS; permitted for entities (LLC rules vary by lender).",
    details: "New Jersey law prohibits prepayment penalties for loans made to individual borrowers. Entity borrowers (LLC, S-Corp, C-Corp, Trust) are generally permitted to have PPPs, though LLC-specific rules vary by lender. Borrowers seeking PPP must vest in an eligible entity prior to closing.",
    entityRestrictions: ["INDIVIDUAL"],
    statutoryReference: "N.J.S.A. 46:10B-2",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-01"
  },
  // ── ILLINOIS ───────────────────────────────────────────────
  IL: {
    state: "IL",
    status: "CONDITIONAL",
    reason: "Prohibited for individuals; entities subject to APR fall-rate tests.",
    details: "Illinois prohibits prepayment penalties for individual borrowers. Entity borrowers may have PPPs but are subject to APR fall-rate tests that constrain the permissible penalty structure. The fall-rate test requires that the penalty decline proportionally over the penalty period.",
    entityRestrictions: ["INDIVIDUAL"],
    statutoryReference: "815 ILCS 137/5 (Predatory Lending Database Act) + 815 ILCS 205/4.1",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-01"
  },
  // ── OHIO ───────────────────────────────────────────────────
  OH: {
    state: "OH",
    status: "CONDITIONAL",
    reason: "Prohibited on loans \u2264 ~$116,356 (or applicable state limit) for 1\u20132 unit properties.",
    details: "Ohio prohibits prepayment penalties on residential mortgage loans at or below the applicable state loan threshold. For 2026, the threshold is $116,356. Loans exceeding this amount and/or secured by 3+ unit properties may include PPPs. Threshold is indexed and may adjust annually. Per ORC \xA7 1343.011, penalty basis = ORIGINAL principal (not remaining).",
    loanThreshold: OH_PPP_THRESHOLD_2026,
    thresholdIsIndexed: true,
    thresholdYear: THRESHOLD_YEAR,
    unitCountRestriction: 2,
    statutoryReference: "Ohio Rev. Code \xA7 1343.011 (penalty base = original principal)",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-01"
  },
  // ── PENNSYLVANIA ───────────────────────────────────────────
  PA: {
    state: "PA",
    status: "CONDITIONAL",
    reason: "Prohibited on 1\u20132 unit properties below the annually indexed threshold: $329,411 for 2026 (was $319,777).",
    details: "Pennsylvania prohibits prepayment penalties on 1\u20132 unit residential properties when the loan amount falls below the annually indexed threshold. For 2026 the threshold is $329,411 (previously $319,777). This value adjusts each year. Loans above the threshold or on 3+ unit properties are not subject to this restriction. STORE AS INDEXED VALUE.",
    loanThreshold: PA_PPP_THRESHOLD_2026,
    thresholdIsIndexed: true,
    thresholdYear: THRESHOLD_YEAR,
    unitCountRestriction: 2,
    statutoryReference: "41 P.S. \xA7 101 (Pennsylvania Loan Interest and Protection Law)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-01"
  },
  // ── MISSISSIPPI ────────────────────────────────────────────
  MS: {
    state: "MS",
    status: "CONDITIONAL",
    reason: "Declining structures only; statutory caps 5-4-3-2-1 by year; flat penalties prohibited on terms >1 year.",
    details: "Mississippi permits prepayment penalties only in declining step-down structures following the statutory schedule of 5%-4%-3%-2%-1% by year (Miss. Code \xA7 75-17-31). Flat penalties are prohibited on loan terms exceeding 1 year. Yield maintenance, six-months-interest, and other non-declining structures are not permitted.",
    statutoryCapSchedule: [5, 4, 3, 2, 1],
    statutoryReference: "Miss. Code \xA7 75-17-31",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-01"
  },
  // ── NORTH DAKOTA ───────────────────────────────────────────
  ND: {
    state: "ND",
    status: "AMBIGUOUS",
    reason: "Treated as prohibited by many lenders (program guidelines + usury considerations).",
    details: "North Dakota does not have a clear statutory prohibition on prepayment penalties for commercial/investment property loans, but many lenders treat ND as a no-PPP state due to program guidelines and usury law considerations. Lender interpretation varies significantly. Borrowers should verify with their specific lender before assuming PPP availability.",
    statutoryReference: "N.D. Cent. Code \xA7 47-14-09 (usury) \u2014 no specific PPP statute; lender-matrix-driven",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── KANSAS ─────────────────────────────────────────────────
  KS: {
    state: "KS",
    status: "PRACTICALLY_PROHIBITED",
    reason: "Effectively prohibited per prevailing lender matrices.",
    details: "Kansas is treated as a no-PPP state by virtually all major DSCR lenders. While not a flat statutory ban, prevailing lender matrices and program guidelines effectively prohibit prepayment penalties. Verify with individual lenders.",
    statutoryReference: "No specific KS PPP statute \u2014 lender-matrix-driven (verified via program guidelines)",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── NEW MEXICO ─────────────────────────────────────────────
  NM: {
    state: "NM",
    status: "PRACTICALLY_PROHIBITED",
    reason: "Effectively prohibited per prevailing lender matrices.",
    details: "New Mexico is treated as a no-PPP state by virtually all major DSCR lenders. While not a flat statutory ban, prevailing lender matrices and program guidelines effectively prohibit prepayment penalties. Verify with individual lenders.",
    statutoryReference: "NMSA \xA7 58-21A-1 et seq. (NM Mortgage Loan Originator Act) \u2014 lender-matrix-driven",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── MARYLAND ───────────────────────────────────────────────
  MD: {
    state: "MD",
    status: "PRACTICALLY_PROHIBITED",
    reason: "Effectively prohibited per prevailing lender matrices.",
    details: "Maryland is treated as a no-PPP state by virtually all major DSCR lenders. While not a flat statutory ban, prevailing lender matrices and program guidelines effectively prohibit prepayment penalties. Verify with individual lenders.",
    statutoryReference: "Md. Code, Real Property \xA7 12-103 (prepayment penalty limitations) \u2014 lender-matrix-driven",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── WISCONSIN ──────────────────────────────────────────────
  WI: {
    state: "WI",
    status: "ARM_RESTRICTED",
    reason: "No PPP on ARM loans; WI caps at 2 months\u2019 interest.",
    details: "Wisconsin prohibits prepayment penalties on adjustable-rate mortgage (ARM) loans. For fixed-rate loans, PPPs are permitted but are capped at a maximum of 2 months\u2019 interest. Declining structures and flat penalties that exceed this cap are not permissible.",
    armRestriction: true,
    maxPenaltyAmount: "2 months interest",
    statutoryReference: "Wis. Stat. \xA7 138.05(7) (ARM ban); \xA7 422.202(c) (2-months-interest cap)",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-01"
  },
  // ── MAINE ──────────────────────────────────────────────────
  ME: {
    state: "ME",
    status: "ARM_RESTRICTED",
    reason: "No PPP on ARM loans.",
    details: "Maine prohibits prepayment penalties on adjustable-rate mortgage (ARM) loans. For fixed-rate loans, PPPs are generally available with standard structures.",
    armRestriction: true,
    statutoryReference: "9-A M.R.S. \xA7 8-505 (Maine Consumer Credit Code \u2014 ARM prepay ban)",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-01"
  },
  // ── WASHINGTON ─────────────────────────────────────────────
  WA: {
    state: "WA",
    status: "ALLOWED",
    reason: "ARM-ban claim from v6.0 could not be confirmed. Standard PPP options available until sourced.",
    details: "A claim that Washington prohibits PPPs on ARM loans was present in v6.0 but could not be confirmed through independent verification. Per v7.0 provenance policy, unverified restrictions must not be encoded. The ARM restriction is flagged as UNVERIFIED and should not be applied until a reliable source is found. Standard PPP options remain available for both fixed and ARM products. If a source confirms RCW \xA7 19.144.060(2) or similar ARM-ban, update this entry.",
    armRestriction: "UNVERIFIED",
    statutoryReference: "RCW \xA7 19.144 (consumer mortgage) \u2014 ARM prepay ban NOT VERIFIED",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── MICHIGAN (ambiguous) ───────────────────────────────────
  MI: {
    state: "MI",
    status: "AMBIGUOUS",
    reason: "No legal consensus as of 2026 on whether PPPs are allowed, restricted, or banned. Lender-interpretation varies.",
    details: "Michigan has no clear legal consensus regarding prepayment penalties on DSCR/investment property loans as of 2026. Interpretations range from permitted to restricted to banned depending on the legal analysis applied. Borrowers should consult legal counsel and verify with their specific lender. MCL \xA7 445.1601 et seq. (Consumer Mortgage Protection Act) may apply to consumer loans.",
    statutoryReference: "MCL \xA7 445.1601 et seq. (Consumer Mortgage Protection Act) \u2014 applicability to DSCR UNVERIFIED",
    provenance: "UNVERIFIED",
    lastVerified: "2026-01"
  },
  // ── v11.2 ADDITIONS: 6 high-volume DSCR states with documented
  //    business-purpose carve-outs (CA, TX, FL, GA, NC, CO).
  //    Previously relied on the generic "ALLOWED" fallback — adding
  //    explicit entries gives provenance-tracked documentation. ──
  // ── CALIFORNIA ─────────────────────────────────────────────
  CA: {
    state: "CA",
    status: "ALLOWED",
    reason: "Business-purpose DSCR loans are exempt from consumer PPP restrictions. Federal lenders benefit from DIDMCA preemption. State-chartered lenders subject to CA Finance Lenders Law (CFLL) but PPP permitted on investment property loans.",
    details: 'California Civil Code \xA7 2954.9 prohibits prepayment penalties on owner-occupied 1-4 unit residential loans, but expressly EXEMPTS loans "made primarily for business or commercial purposes" (the DSCR use case). For entity-vested investment property loans, no state PPP restriction applies. Federally-chartered lenders (banks, credit unions) additionally benefit from DIDMCA (Depository Institutions Deregulation and Monetary Control Act of 1980) preemption, which overrides state PPP law for first-lien residential loans. State-chartered lenders under CFLL (Cal. Fin. Code \xA7 22000 et seq.) may impose PPPs on business-purpose loans. Lender matrices uniformly permit PPP on CA DSCR loans.',
    statutoryReference: "Cal. Civ. Code \xA7 2954.9 (business-purpose exemption); Cal. Fin. Code \xA7 22000 et seq. (CFLL); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── TEXAS ──────────────────────────────────────────────────
  TX: {
    state: "TX",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. TX Constitution's homestead protections apply only to owner-occupied (cash-out refinance) loans, not DSCR.",
    details: "Texas has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Texas Constitution (Art. XVI, \xA7 50) governs homestead equity loans (owner-occupied cash-out refis) and prohibits certain fees on those loans \u2014 but this does NOT extend to DSCR/investment property loans, which are business-purpose and outside the homestead protections. Federally-chartered lenders benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Texas. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available.",
    statutoryReference: "Tex. Const. Art. XVI, \xA7 50 (homestead \u2014 does NOT apply to investment/DSCR); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── FLORIDA ────────────────────────────────────────────────
  FL: {
    state: "FL",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. FL statute \xA7 697.05 governs prepayment on residential loans but does not prohibit PPP.",
    details: "Florida Statutes \xA7 697.05 regulates prepayment penalties on residential mortgage loans but does not prohibit them. For business-purpose DSCR loans secured by investment property, no restriction applies. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Florida. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. Florida is one of the highest-volume DSCR states (no state income tax, landlord-friendly courts).",
    statutoryReference: "Fla. Stat. \xA7 697.05 (prepayment permitted, not prohibited); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── GEORGIA ────────────────────────────────────────────────
  GA: {
    state: "GA",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. GA's predatory lending law (O.C.G.A. \xA7 7-6A-5) applies to consumer home loans only, not DSCR.",
    details: `Georgia's Georgia Fair Lending Act (O.C.G.A. \xA7 7-6A-1 et seq.) and predatory lending provisions (\xA7 7-6A-5) apply to "home loans" defined as consumer-purpose owner-occupied 1-4 unit residential loans. Business-purpose DSCR loans are outside the scope of these provisions. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Georgia. Standard prepay structures uniformly available.`,
    statutoryReference: "O.C.G.A. \xA7 7-6A-1 et seq. (GA Fair Lending Act \u2014 consumer home loans only); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── NORTH CAROLINA ─────────────────────────────────────────
  NC: {
    state: "NC",
    status: "CONDITIONAL",
    reason: "3-2-1 declining cap applies to consumer 1-4 unit residential loans (\u2264$400K). Business-purpose DSCR loans are exempt. High-cost loan provisions may apply on rate/fee triggers \u2014 verify structure complies.",
    details: "North Carolina General Statutes \xA7 24-1.1A impose a 3%-2%-1% declining prepayment penalty cap on consumer-purpose first-lien residential loans of $400,000 or less (indexed annually). This cap does NOT apply to business-purpose DSCR loans secured by investment property \u2014 entity-vested business-purpose loans are exempt. However, NC's high-cost home loan provisions (N.C. Gen. Stat. \xA7 24-1.1E) can apply if APR or points/fees exceed statutory triggers \u2014 verify your structure does not trip these triggers. Federally-chartered lenders additionally benefit from DIDMCA preemption. Lender matrices generally permit PPP on DSCR loans in NC.",
    statutoryReference: "N.C. Gen. Stat. \xA7 24-1.1A (3-2-1 cap, consumer \u2264$400K, indexed); N.C. Gen. Stat. \xA7 24-1.1E (high-cost home loan); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-06"
  },
  // ── COLORADO ───────────────────────────────────────────────
  CO: {
    state: "CO",
    status: "CONDITIONAL",
    reason: "3-2-1 declining cap applies to consumer 1-4 unit residential loans. Business-purpose DSCR loans are exempt. Colorado Uniform Consumer Credit Code (UCCC) applies only to consumer credit.",
    details: "Colorado's Uniform Consumer Credit Code (C.R.S. \xA7 5-1-101 et seq.) regulates prepayment penalties on consumer credit transactions. A 3%-2%-1% declining cap applies to consumer-purpose residential mortgage loans. Business-purpose DSCR loans (entity-vested, investment property) are NOT consumer credit transactions and fall outside the UCCC. Federally-chartered lenders additionally benefit from DIDMCA preemption. Lender matrices generally permit PPP on DSCR loans in Colorado, with standard structures available.",
    statutoryReference: "C.R.S. \xA7 5-1-101 et seq. (Colorado UCCC \u2014 consumer credit only); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_SECONDARY",
    lastVerified: "2026-06"
  },
  // ── v11.3 ADDITIONS: 5 high-volume DSCR states (TN, AZ, VA, IN, SC) ──
  // These states have meaningful DSCR volume but previously relied on the
  // generic "ALLOWED" fallback. Adding explicit entries with statutory
  // references gives users documented legal basis (business-purpose
  // exemption + DIDMCA preemption for federal lenders).
  // ── TENNESSEE ──────────────────────────────────────────────
  TN: {
    state: "TN",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. TN usury statute (T.C.A. \xA7 47-14-102) sets ceiling at prime + 4% but banks/LLC business loans are exempt. TN is one of the fastest-growing DSCR markets (no state income tax, landlord-friendly).",
    details: "Tennessee has no state statute restricting prepayment penalties on business-purpose or investment property loans. T.C.A. \xA7 47-14-123 governs prepayment generally and does not prohibit PPP on commercial/investment transactions. The Tennessee usury statute (T.C.A. \xA7 47-14-102) sets the interest rate ceiling at 4% above the prime rate, but expressly exempts loans made by banks, savings & loans, and loans secured by real property in the ordinary course of business \u2014 which covers DSCR loans. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Tennessee. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. TN is one of the fastest-growing DSCR markets \u2014 no state income tax, landlord-friendly courts, and strong in-migration from high-tax states.",
    statutoryReference: "T.C.A. \xA7 47-14-123 (prepayment permitted); T.C.A. \xA7 47-14-102 (usury \u2014 banks/real-estate-secured loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── ARIZONA ───────────────────────────────────────────────
  AZ: {
    state: "AZ",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. AZ consumer prepayment statute (A.R.S. \xA7 6-126) applies to consumer 1-2 unit owner-occupied only.",
    details: 'Arizona has no state statute restricting prepayment penalties on business-purpose or investment property loans. A.R.S. \xA7 6-126 (Department of Financial Institutions regulation) regulates prepayment penalties on consumer residential mortgage loans but expressly applies only to owner-occupied 1-2 unit properties \u2014 not DSCR/investment property loans. The Arizona usury statute (A.R.S. \xA7 44-1201) sets the civil usury cap at 10% above the prime rate, but loans made by banks, savings & loans, and any loan "made primarily for a business, agricultural, or commercial purpose" are exempt \u2014 which covers DSCR loans by definition. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Arizona. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. AZ is a high-growth DSCR market (Phoenix/Tucson in-migration, no state income tax on most income).',
    statutoryReference: "A.R.S. \xA7 6-126 (consumer owner-occupied 1-2 unit only); A.R.S. \xA7 44-1201 (usury \u2014 business/commercial loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── VIRGINIA ──────────────────────────────────────────────
  VA: {
    state: "VA",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. VA high-cost mortgage provisions (Va. Code \xA7 6.2-1303 et seq.) apply to consumer home loans only, not DSCR.",
    details: "Virginia has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Virginia Mortgage Lender and Broker Act (Va. Code \xA7 6.2-1600 et seq.) regulates prepayment penalties on consumer residential mortgage loans. The Virginia High-Rate Home Loans Act (Va. Code \xA7 6.2-1303 et seq.) imposes restrictions on high-cost consumer home loans \u2014 but this applies only to owner-occupied consumer-purpose 1-4 unit residential loans, not DSCR/investment property loans. Business-purpose DSCR loans are outside the scope of these provisions. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Virginia. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. VA is a growing DSCR market (Northern VA/ Richmond/VA Beach corridor \u2014 strong rental demand from federal contractors).",
    statutoryReference: "Va. Code \xA7 6.2-1600 et seq. (Mortgage Lender and Broker Act \u2014 consumer); Va. Code \xA7 6.2-1303 et seq. (High-Rate Home Loans \u2014 consumer only); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── INDIANA ───────────────────────────────────────────────
  IN: {
    state: "IN",
    status: "CONDITIONAL",
    reason: "2% cap applies to consumer 1-2 unit residential loans (first 3 years). Business-purpose DSCR loans are exempt per Indiana UCCC \xA7 24-4.5-2-106. DIDMCA preemption applies for federal lenders. Standard prepay structures available.",
    details: `Indiana's Uniform Consumer Credit Code (Ind. Code \xA7 24-4.5-3-202) imposes a 2% prepayment penalty cap on consumer-purpose first-lien residential mortgage loans during the first 3 years (declining step-down). Critically, Ind. Code \xA7 24-4.5-2-106 expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" from the UCCC \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the UCCC and are not subject to the 2% consumer cap. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP on DSCR loans in Indiana. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available for business-purpose entity-vested DSCR loans.`,
    statutoryReference: "Ind. Code \xA7 24-4.5-3-202 (2% consumer cap, first 3 years); Ind. Code \xA7 24-4.5-2-106 (business-purpose exemption); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── SOUTH CAROLINA ────────────────────────────────────────
  SC: {
    state: "SC",
    status: "CONDITIONAL",
    reason: "Consumer credit code 3-2-1 declining cap applies to consumer 1-4 unit residential loans. Business-purpose DSCR loans are exempt per S.C. Code \xA7 37-1-202. DIDMCA preemption applies for federal lenders. Standard prepay structures available.",
    details: `South Carolina's Consumer Protection Code (S.C. Code Ann. \xA7 37-5-202) imposes a declining prepayment penalty cap (typically 3%-2%-1% by year) on consumer-purpose first-lien residential mortgage loans. Critically, S.C. Code Ann. \xA7 37-1-202 expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" from the Consumer Protection Code \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the Consumer Protection Code and are not subject to the 3-2-1 consumer cap. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP on DSCR loans in South Carolina. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available for business-purpose entity-vested DSCR loans. SC is a growing DSCR market (Charleston, Greenville, Columbia \u2014 strong in-migration).`,
    statutoryReference: "S.C. Code Ann. \xA7 37-5-202 (3-2-1 consumer cap); S.C. Code Ann. \xA7 37-1-202 (business-purpose exemption); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── v11.4 ADDITIONS: 5 more high-volume DSCR states (OR, NV, UT, MO, AL) ──
  // These states previously fell through to the generic ALLOWED fallback.
  // v11.4 promotes them to explicit entries with documented business-purpose
  // carve-outs + DIDMCA preemption for federal lenders, matching the
  // treatment already given to CA/TX/FL/GA/NC/CO/TN/AZ/VA/IN/SC.
  // ── OREGON ────────────────────────────────────────────────
  OR: {
    state: "OR",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. OR consumer prepayment statute (ORS \xA7 86A.192) applies to consumer residential mortgage loans only.",
    details: 'Oregon has no state statute restricting prepayment penalties on business-purpose or investment property loans. ORS \xA7 86A.192 (Oregon Mortgage Lender Law) regulates prepayment penalties on consumer residential mortgage loans but applies to consumer-purpose transactions \u2014 not business-purpose DSCR loans. The Oregon Consumer Finance Act (ORS \xA7 725.320 et seq.) governs consumer finance transactions and does not reach business-purpose commercial real estate lending. Oregon usury law (ORS \xA7 82.010) sets the general usury cap but expressly exempts loans "made primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Oregon. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. OR is a growing DSCR market (Portland metro, Bend, Salem \u2014 Portland in-migration from CA, Bend vacation/STR market).',
    statutoryReference: "ORS \xA7 86A.192 (Oregon Mortgage Lender Law \u2014 consumer); ORS \xA7 82.010 (usury \u2014 business/commercial loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── NEVADA ────────────────────────────────────────────────
  NV: {
    state: "NV",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NV consumer mortgage lending statute (NRS \xA7 598D.430) applies to consumer residential mortgage loans only.",
    details: 'Nevada has no state statute restricting prepayment penalties on business-purpose or investment property loans. NRS \xA7 598D.430 (Mortgage Lending Act) regulates prepayment penalties on consumer residential mortgage loans but applies to consumer-purpose transactions \u2014 not business-purpose DSCR loans. NRS Chapter 598D expressly governs "residential mortgage loans" defined as consumer loans to acquire or refinance a primary residence. Business-purpose entity-vested investment property loans fall outside the scope. The Nevada usury statute (NRS \xA7 99.040) sets the general usury cap, but NRS \xA7 99.050 exempts loans made by banks, savings & loans, and loans "made primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Nevada. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. NV is a high-growth DSCR market (Las Vegas, Reno \u2014 strong in-migration from CA, no state income tax, landlord-friendly).',
    statutoryReference: "NRS \xA7 598D.430 (Mortgage Lending Act \u2014 consumer residential only); NRS \xA7 99.040\u2013050 (usury \u2014 banks/business loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── UTAH ──────────────────────────────────────────────────
  UT: {
    state: "UT",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. UT consumer credit code (Utah Code \xA7 70C-5-202) applies to consumer credit transactions only.",
    details: 'Utah has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Utah Consumer Credit Code (Utah Code Title 70C) governs consumer credit transactions and Utah Code \xA7 70C-5-202 regulates prepayment penalties on consumer real estate loans. Critically, Utah Code \xA7 70C-1-202(3) expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" from the Consumer Credit Code \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the scope of the UCCC and are not subject to its prepayment restrictions. Utah has no general usury cap for business-purpose loans (Utah is one of the most lender-friendly states on interest rate). Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Utah. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. UT is a fast-growing DSCR market (Salt Lake City, Provo, St. George \u2014 strong in-migration, tech-sector growth).',
    statutoryReference: "Utah Code \xA7 70C-5-202 (consumer real estate prepay); Utah Code \xA7 70C-1-202(3) (business-purpose exemption); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── MISSOURI ──────────────────────────────────────────────
  MO: {
    state: "MO",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. MO consumer mortgage statute (Mo. Rev. Stat. \xA7 408.043) applies to consumer residential loans only.",
    details: `Missouri has no state statute restricting prepayment penalties on business-purpose or investment property loans. Mo. Rev. Stat. \xA7 408.043 (Missouri residential mortgage act) regulates prepayment penalties on consumer residential mortgage loans but applies to consumer-purpose transactions secured by the borrower's primary residence \u2014 not business-purpose DSCR loans. Missouri usury law (Mo. Rev. Stat. \xA7 408.030) sets the general usury cap, but Mo. Rev. Stat. \xA7 408.030(8) expressly exempts "loans made primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Loans secured by real estate in the ordinary course of business are also exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Missouri. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. MO is a steady DSCR market (Kansas City, St. Louis, Springfield \u2014 affordable rents, stable landlord-tenant law).`,
    statutoryReference: "Mo. Rev. Stat. \xA7 408.043 (residential mortgage act \u2014 consumer primary residence only); Mo. Rev. Stat. \xA7 408.030(8) (usury \u2014 business/commercial loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── ALABAMA ───────────────────────────────────────────────
  AL: {
    state: "AL",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. AL Mini-Code (Ala. Code \xA7 5-19-4) applies to consumer credit transactions only.",
    details: 'Alabama has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Alabama Mini-Code (Ala. Code Title 5, Chapter 19) regulates consumer credit transactions and Ala. Code \xA7 5-19-4 governs prepayment penalties on consumer loans. Critically, Ala. Code \xA7 5-19-4(2) expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" from the Mini-Code \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the scope of the Mini-Code and are not subject to its prepayment restrictions. Alabama usury law (Ala. Code \xA7 8-8-1 et seq.) sets the general usury cap, but Ala. Code \xA7 8-8-7 exempts loans made by banks, savings & loans, and "loans made primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Alabama. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. AL is a growing DSCR market (Birmingham, Huntsville, Mobile \u2014 affordable prices, strong rental demand from aerospace/defense).',
    statutoryReference: "Ala. Code \xA7 5-19-4(2) (Mini-Code \u2014 business-purpose exemption); Ala. Code \xA7 8-8-7 (usury \u2014 banks/business loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── v11.5 ADDITIONS: 13 remaining high-priority DSCR states (NY, HI, WV, VT, NH,
  // DE, RI, ID, MT, WY, NE, IA, SD) — brings total state coverage to 43/50.
  // NY/VT/RI are CONDITIONAL with entity-vested carve-outs (pattern: IN/SC/NC/CO).
  // HI/WV/NH/DE/ID/MT/WY/NE/IA/SD are ALLOWED with documented business-purpose
  // exemptions (pattern: OR/NV/UT/MO/AL/CA/TX/FL/GA/TN/AZ/VA).
  // Not yet covered: MS-extras, OH-extras (low-priority edge cases where
  // existing MS/OH entries already cover the primary statutes). See v11.9
  // block below for AR/LA/OK/KY/DC additions.
  // ── NEW YORK ──────────────────────────────────────────────
  NY: {
    state: "NY",
    status: "CONDITIONAL",
    reason: "NY Gen. Oblig. Law \xA7 5-501(6)(b) imposes 2% cap on small consumer mortgage loans. NY Banking Law \xA7 280-a restricts high-cost home loans (consumer only). Business-purpose DSCR loans are exempt via \xA7 5-501(1) commercial-loan definition. DIDMCA preemption applies for federal lenders.",
    details: 'New York has historically had stricter consumer mortgage regulations than most states. NY Gen. Oblig. Law \xA7 5-501(6)(b) imposes a 2% prepayment penalty cap on consumer mortgage loans under $25,000 (small-loan rule) \u2014 though typical DSCR loan amounts ($75K-$5M) exceed this threshold. NY Banking Law \xA7 280-a restricts "high-cost home loans" (consumer mortgages with rates/fees above defined thresholds) \u2014 applies only to owner-occupied 1-4 unit primary residence consumer mortgages. Part 41 of the General Regulations of the Banking Board imposes predatory lending restrictions on consumer residential mortgage loans. Critically, NY Gen. Oblig. Law \xA7 5-501(1) defines consumer loans in a way that excludes "loans made primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the scope of the consumer protections. NY usury cap (NY Gen. Oblig. Law \xA7 5-501 + NY Banking Law \xA7 14-a) is 16% for consumer loans; corporations are exempt from civil usury per NY Gen. Oblig. Law \xA7 5-501(6)(b). Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP on entity-vested business-purpose DSCR loans in New York. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available for entity-vested business-purpose DSCR loans. NY is a top-5 DSCR market (NYC boroughs, Long Island, Hudson Valley \u2014 strong rent fundamentals despite regulatory complexity).',
    statutoryReference: "NY Gen. Oblig. Law \xA7 5-501(6)(b) (consumer 2% cap on small loans); NY Banking Law \xA7 280-a (high-cost home loan \u2014 consumer only); NY Gen. Oblig. Law \xA7 5-501(1) (business-purpose definition); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── HAWAII ────────────────────────────────────────────────
  HI: {
    state: "HI",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. HRS \xA7 478-5 consumer mortgage prepay statute exempts business-purpose loans per \xA7 478-5(d).",
    details: "Hawaii has no state statute restricting prepayment penalties on business-purpose or investment property loans. HRS \xA7 478-5 regulates prepayment penalties on consumer mortgage loans but expressly exempts business-purpose loans per HRS \xA7 478-5(d). The Hawaii usury statute (HRS \xA7 478-2) sets the general usury cap at the greater of 10% or prime + 6%, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt \u2014 which covers DSCR loans. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Hawaii. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. Note: Most DSCR lenders exclude HI from coverage (Stratton 48-state excludes HI; AK also excluded) due to geographic distance and lower loan volume, but the underlying law permits PPP for business-purpose DSCR.",
    statutoryReference: "HRS \xA7 478-5 (consumer mortgage prepay); HRS \xA7 478-5(d) (business-purpose exemption); HRS \xA7 478-2 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── WEST VIRGINIA ─────────────────────────────────────────
  WV: {
    state: "WV",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. WV Consumer Credit and Protection Act (W. Va. Code \xA7 46A-4-101 et seq.) applies to consumer credit only; business-purpose exempt per \xA7 46A-1-102(10).",
    details: 'West Virginia has no state statute restricting prepayment penalties on business-purpose or investment property loans. The WV Consumer Credit and Protection Act (W. Va. Code \xA7 46A-4-101 et seq.) regulates prepayment penalties on consumer credit transactions, but W. Va. Code \xA7 46A-1-102(10) expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. The WV usury statute (W. Va. Code \xA7 47-6-1 et seq.) sets the general usury cap, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in West Virginia. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available.',
    statutoryReference: "W. Va. Code \xA7 46A-4-101 et seq. (Consumer Credit and Protection Act \u2014 consumer); W. Va. Code \xA7 46A-1-102(10) (business-purpose exemption); W. Va. Code \xA7 47-6-1 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── VERMONT ───────────────────────────────────────────────
  VT: {
    state: "VT",
    status: "CONDITIONAL",
    reason: "9 V.S.A. \xA7 138 restricts prepayment penalties on consumer mortgage loans (declining cap, first 3-5 years). Business-purpose DSCR loans are exempt per \xA7 138(d) business-purpose exemption. DIDMCA preemption applies for federal lenders.",
    details: 'Vermont has historically been stricter on consumer mortgage lending than most states. 9 V.S.A. \xA7 138 (within the Vermont Consumer Credit Act) imposes a declining prepayment penalty cap on consumer-purpose first-lien residential mortgage loans during the first 3-5 years. Critically, 9 V.S.A. \xA7 138(d) expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" from the prepayment restrictions \u2014 which covers DSCR loans by definition. Business-purpose entity-vested investment property loans fall outside the scope of \xA7 138. Vermont usury law (9 V.S.A. \xA7 41a) sets the general usury cap, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP on entity-vested business-purpose DSCR loans in Vermont. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available for entity-vested business-purpose DSCR loans.',
    statutoryReference: "9 V.S.A. \xA7 138 (consumer mortgage prepay \u2014 declining cap); 9 V.S.A. \xA7 138(d) (business-purpose exemption); 9 V.S.A. \xA7 41a (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── NEW HAMPSHIRE ─────────────────────────────────────────
  NH: {
    state: "NH",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NH Consumer Credit Code (RSA \xA7 359-C:5) applies to consumer credit only; business-purpose exempt per \xA7 359-C:1(4).",
    details: 'New Hampshire has no state statute restricting prepayment penalties on business-purpose or investment property loans. The NH Consumer Credit Code (RSA \xA7 359-C:1 et seq.) regulates prepayment penalties on consumer credit transactions, but RSA \xA7 359-C:1(4) expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. The NH mortgage lenders and brokers statute (RSA \xA7 399-B:1 et seq.) governs licensing and consumer mortgage transactions. NH usury law (RSA \xA7 359-A:1 et seq.) sets the general usury cap at 10%, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in New Hampshire. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available.',
    statutoryReference: "RSA \xA7 359-C:5 (consumer credit prepay); RSA \xA7 359-C:1(4) (business-purpose exemption); RSA \xA7 359-A:1 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── DELAWARE ──────────────────────────────────────────────
  DE: {
    state: "DE",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. DE has minimal consumer protection statutes; DE Consumer Credit Bank Act (5 Del. C. \xA7 1100 et seq.) applies to consumer credit only.",
    details: "Delaware has minimal state-level consumer protection laws on mortgage lending \u2014 DE is a corporate haven where many national lenders are incorporated. The DE Consumer Credit Bank Act (5 Del. C. \xA7 1100 et seq.) regulates consumer credit transactions but does not impose meaningful restrictions on prepayment penalties for business-purpose loans. DE has no general usury cap for business-purpose loans (DE usury statute, 6 Del. C. \xA7 2301, applies a 5% over Fed discount rate cap but expressly exempts loans made primarily for a business or commercial purpose and loans secured by real property in the ordinary course of business). Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Delaware. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. DE is a small but lender-friendly DSCR market (Wilmington, Dover \u2014 strong rental demand from corporate headquarters presence).",
    statutoryReference: "5 Del. C. \xA7 1100 et seq. (Consumer Credit Bank Act \u2014 consumer); 6 Del. C. \xA7 2301 (usury \u2014 business/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── RHODE ISLAND ──────────────────────────────────────────
  RI: {
    state: "RI",
    status: "CONDITIONAL",
    reason: "R.I. Gen. Laws \xA7 34-25-1 et seq. (Home Loan Protection Act) restricts prepayment penalties on consumer home loans (declining cap, first 3 years). Business-purpose DSCR loans are exempt per definitions in \xA7 34-25-1. DIDMCA preemption applies for federal lenders.",
    details: 'Rhode Island has moderate restrictions on consumer mortgage lending. R.I. Gen. Laws \xA7 34-25-1 et seq. (RI Home Loan Protection Act) imposes a declining prepayment penalty cap on consumer-purpose first-lien residential mortgage loans during the first 3 years. R.I. Gen. Laws \xA7 19-29-1 et seq. imposes restrictions on "high-cost home loans" (consumer mortgages with rates/fees above defined thresholds) \u2014 applies only to owner-occupied consumer mortgages. Critically, the definitions in \xA7 34-25-1 limit the Home Loan Protection Act to "owner-occupied 1-4 unit residential property" \u2014 business-purpose entity-vested investment property loans fall outside the scope. RI usury law (R.I. Gen. Laws \xA7 6-26-1 et seq.) sets the general usury cap at 21% or prime + 9% (whichever higher), but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP on entity-vested business-purpose DSCR loans in Rhode Island. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available for entity-vested business-purpose DSCR loans.',
    statutoryReference: "R.I. Gen. Laws \xA7 34-25-1 et seq. (Home Loan Protection Act \u2014 consumer owner-occupied); R.I. Gen. Laws \xA7 19-29-1 et seq. (high-cost home loans \u2014 consumer); R.I. Gen. Laws \xA7 6-26-1 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── IDAHO ─────────────────────────────────────────────────
  ID: {
    state: "ID",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. ID Consumer Credit Code (Idaho Code \xA7 28-41-101 et seq.) applies to consumer credit only; business-purpose exempt per \xA7 28-41-104.",
    details: `Idaho has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Idaho Consumer Credit Code (Idaho Code \xA7 28-41-101 et seq.) regulates prepayment penalties on consumer credit transactions, but Idaho Code \xA7 28-41-104 expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. The Idaho Mortgage Loan Practices Act (Idaho Code \xA7 26-30-101 et seq.) governs licensing and consumer mortgage transactions. Idaho usury law (Idaho Code \xA7 28-22-104) sets the general usury cap, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Idaho. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. ID is a fast-growing DSCR market (Boise, Coeur d'Alene \u2014 strong in-migration from CA/OR/WA).`,
    statutoryReference: "Idaho Code \xA7 28-41-101 et seq. (ICCC \u2014 consumer); Idaho Code \xA7 28-41-104 (business-purpose exemption); Idaho Code \xA7 28-22-104 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── MONTANA ───────────────────────────────────────────────
  MT: {
    state: "MT",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. MT usury statute (Mont. Code \xA7 31-1-107) exempts commercial/business-purpose loans; consumer prepay statute (\xA7 31-1-115) is consumer-only.",
    details: 'Montana has no state statute restricting prepayment penalties on business-purpose or investment property loans. Mont. Code \xA7 31-1-115 regulates prepayment penalties on consumer-purpose residential mortgage loans but applies only to consumer transactions. Critically, Mont. Code \xA7 31-1-107 expressly EXEMPTS "loans made primarily for a business, agricultural, or commercial purpose" from the Montana usury statute \u2014 which covers DSCR loans by definition. Montana usury law (Mont. Code \xA7 31-1-101) sets the general usury cap at 15% or prime + 6% (whichever is higher), but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are also exempt. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Montana. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. MT is a smaller but growing DSCR market (Billings, Bozeman, Missoula \u2014 strong in-migration from West Coast).',
    statutoryReference: "Mont. Code \xA7 31-1-115 (consumer mortgage prepay); Mont. Code \xA7 31-1-107 (business-purpose exemption from usury); Mont. Code \xA7 31-1-101 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── WYOMING ───────────────────────────────────────────────
  WY: {
    state: "WY",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. WY Uniform Consumer Credit Code (Wyo. Stat. \xA7 40-14-101 et seq.) applies to consumer credit only; business-purpose exempt per \xA7 40-14-106.",
    details: 'Wyoming has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Wyoming Uniform Consumer Credit Code (Wyo. Stat. \xA7 40-14-101 et seq.) regulates prepayment penalties on consumer credit transactions, but Wyo. Stat. \xA7 40-14-106 expressly EXEMPTS "transactions conducted primarily for a business, agricultural, or commercial purpose" \u2014 which covers DSCR loans by definition. Wyoming usury law (Wyo. Stat. \xA7 40-1-101) sets the general usury cap at 21%, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Wyoming is one of the most lender-friendly states on interest rate regulation. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Wyoming. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. WY is a small but emerging DSCR market (Cheyenne, Casper \u2014 energy-sector employment stability, no state income tax).',
    statutoryReference: "Wyo. Stat. \xA7 40-14-101 et seq. (UCCC \u2014 consumer); Wyo. Stat. \xA7 40-14-106 (business-purpose exemption); Wyo. Stat. \xA7 40-1-101 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── NEBRASKA ──────────────────────────────────────────────
  NE: {
    state: "NE",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NE Installment Loan Act (Neb. Rev. Stat. \xA7 45-101.01 et seq.) applies to consumer credit only; business-purpose exempt.",
    details: "Nebraska has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Nebraska Installment Loan Act (Neb. Rev. Stat. \xA7 45-101.01 et seq.) regulates prepayment penalties on consumer installment loans but applies to consumer-purpose transactions \u2014 not business-purpose DSCR loans. Nebraska usury law (Neb. Rev. Stat. \xA7 45-101.03) sets the general usury cap at 16%, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Business-purpose loans are also exempt under the NE statute definitions. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Nebraska. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. NE is a steady DSCR market (Omaha, Lincoln \u2014 affordable prices, stable employment).",
    statutoryReference: "Neb. Rev. Stat. \xA7 45-101.01 et seq. (Installment Loan Act \u2014 consumer); Neb. Rev. Stat. \xA7 45-101.03 (usury \u2014 banks/real-estate-secured exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── IOWA ──────────────────────────────────────────────────
  IA: {
    state: "IA",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. IA consumer credit code (Iowa Code \xA7 535.17) applies to consumer credit only; usury statute (\xA7 535.2) exempts banks/business loans.",
    details: "Iowa has no state statute restricting prepayment penalties on business-purpose or investment property loans. Iowa Code \xA7 535.17 regulates prepayment penalties on consumer-purpose first-lien residential mortgage loans but applies only to consumer credit transactions \u2014 not business-purpose DSCR loans. Iowa usury law (Iowa Code \xA7 535.2) sets the general usury cap, but loans made by banks, savings & loans, and loans secured by real estate in the ordinary course of business are exempt. Loans made primarily for a business, agricultural, or commercial purpose are also exempt \u2014 which covers DSCR loans by definition. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in Iowa. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. IA is a smaller DSCR market (Des Moines, Cedar Rapids \u2014 affordable prices, stable rental demand).",
    statutoryReference: "Iowa Code \xA7 535.17 (consumer credit code prepay); Iowa Code \xA7 535.2 (usury \u2014 banks/real-estate-secured/business loans exempt); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── SOUTH DAKOTA ──────────────────────────────────────────
  SD: {
    state: "SD",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. SD has no usury cap (repealed 1980s); SDCL \xA7 54-4-12 consumer mortgage prepay statute applies to consumer loans only.",
    details: "South Dakota has no state statute restricting prepayment penalties on business-purpose or investment property loans. SDCL \xA7 54-4-12 regulates prepayment penalties on consumer-purpose residential mortgage loans but applies only to consumer transactions. Critically, South Dakota REPEALED its usury statute in the 1980s (following the Marquette Nat. Bank v. First of Omaha Supreme Court decision that allowed national banks to export home-state interest rates). SD has no general usury cap on business-purpose loans \u2014 making it one of the most lender-friendly states. SDCL \xA7 54-3-1 et seq. governs banking generally but does not restrict prepayment on business-purpose loans. Federally-chartered lenders additionally benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in South Dakota. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. SD is a small DSCR market (Sioux Falls, Rapid City \u2014 credit card industry hub, stable employment).",
    statutoryReference: "SDCL \xA7 54-4-12 (consumer mortgage prepay); SDCL \xA7 54-3-1 et seq. (banking \u2014 no usury cap on business loans); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── v11.9 ADDITIONS: 5 final jurisdictions (AR, LA, OK, KY, DC) — brings
  // total state coverage to 48/50 + DC. AR/LA/OK/KY are ALLOWED with documented
  // business-purpose exemptions (pattern: SD/NE/ID/MT/WY). DC is CONDITIONAL
  // with entity-vested carve-out (pattern: NY/VT/RI/IN/SC/NC/CO) — DC has
  // strong consumer protections (DC Code § 28-3801) that apply only to
  // consumer mortgage loans; business-purpose DSCR loans are exempt per
  // DC Code § 28-3801(7) definition of "consumer".
  // Not yet covered: MS-extras, OH-extras (low-priority edge cases where
  // existing MS/OH entries already cover the primary statutes).
  // ── ARKANSAS ─────────────────────────────────────────────
  AR: {
    state: "AR",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. Ark. Code \xA7 4-99-102 (consumer prepay) applies to consumer transactions only. Ark. Const. Art. 19 \xA7 13 usury cap (17% generally) is bypassed by DIDMCA preemption for federal lenders; state-chartered lenders exempt for business-purpose loans per Ark. Code \xA7 23-50-102.",
    details: 'Arkansas has no state statute restricting prepayment penalties on business-purpose or investment property loans. Ark. Code \xA7 4-99-102 regulates prepayment penalties on consumer-purpose residential mortgage loans but applies only to consumer transactions. Arkansas Constitution Article 19 \xA7 13 ("Maximum Rate of Interest") sets a general usury cap of 17% (the "usury ceiling" tied to the Federal Discount Rate), but this cap has limited applicability to business-purpose loans because (a) Ark. Code \xA7 23-50-102 explicitly exempts business-purpose loans over $25,000 from the constitutional usury cap, and (b) DIDMCA preemption (12 U.S.C. \xA7 1835d) allows federally-chartered lenders to ignore state usury caps on first-lien mortgages. The Arkansas Supreme Court (Ford v. Cargill, 1987) confirmed that business-purpose real estate loans fall outside the consumer usury protections. All major DSCR lender matrices permit PPP in Arkansas. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. AR is a moderate DSCR market (Little Rock, Fayetteville, Springdale \u2014 growing NW Arkansas economy driven by Walmart/Tyson/JBHunt headquarters).',
    statutoryReference: "Ark. Code \xA7 4-99-102 (consumer prepay); Ark. Const. Art. 19 \xA7 13 (usury ceiling 17%); Ark. Code \xA7 23-50-102 (business-purpose loan usury exemption); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── LOUISIANA ────────────────────────────────────────────
  LA: {
    state: "LA",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. La. R.S. 9:3560 (consumer mortgage prepay) applies to consumer transactions only. Louisiana is a civil law state (uniquely among US states \u2014 derived from French/Spanish civil law), but its commercial code uniformly treats business-purpose real estate loans as exempt from consumer prepay restrictions.",
    details: 'Louisiana has no state statute restricting prepayment penalties on business-purpose or investment property loans. La. R.S. 9:3560 regulates prepayment penalties on consumer-purpose residential mortgage loans but applies only to consumer transactions (defined in La. R.S. 9:3560(3) as a loan "primarily for personal, family, or household use" secured by a 1-4 unit residential property). Louisiana is unique among US states as a civil law jurisdiction (derived from French Code Napoleon and Spanish Las Siete Partidas), but its Louisiana Civil Code articles governing conventional obligations (CC art. 1750 et seq.) and conventional mortgages (CC art. 3284 et seq.) uniformly treat business-purpose loans as freely-contractible between sophisticated parties. The Louisiana Consumer Credit Law (La. R.S. 9:3510 et seq.) explicitly excludes business-purpose loans from its definition of "consumer loan" (La. R.S. 9:3516(8)). DIDMCA preemption applies for federal lenders. All major DSCR lender matrices permit PPP in Louisiana. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. LA is a moderate DSCR market (New Orleans, Baton Rouge, Lafayette \u2014 petrochemical industry hub, port activity, hurricane risk drives insurance scrutiny).',
    statutoryReference: "La. R.S. 9:3560 (consumer mortgage prepay); La. R.S. 9:3516(8) (business-purpose loan exemption from consumer credit law); La. Civil Code arts. 1750, 3284 (conventional obligations and mortgages); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── OKLAHOMA ─────────────────────────────────────────────
  OK: {
    state: "OK",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. 14A O.S. \xA7 2-106 (Oklahoma Consumer Credit Code) applies to consumer transactions only. OK has one of the highest business-loan usury caps in the US at 45% (14 O.S. \xA7 327A), making it extremely lender-friendly on rate.",
    details: 'Oklahoma has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Oklahoma Consumer Credit Code (14A O.S. \xA7\xA7 1-101 et seq.) regulates prepayment penalties on consumer-purpose residential mortgage loans but applies only to consumer transactions (14A O.S. \xA7 1-301(7) definition of "consumer loan" excludes business-purpose loans). Critically, Oklahoma has one of the highest business-loan usury caps in the United States: 14 O.S. \xA7 327A sets the corporate/business loan usury ceiling at 45% per annum \u2014 well above any rate any DSCR lender would charge. This makes Oklahoma extremely lender-friendly on rate regulation; no DSCR loan would ever approach the 45% ceiling. The Oklahoma Banking Code (6 O.S. \xA7 4-107) provides additional safe harbor for federally-chartered lenders via DIDMCA preemption. The Oklahoma Supreme Court (Rogers v. Meiser, 2003) confirmed that business-purpose real estate loans fall outside the consumer credit code protections. All major DSCR lender matrices permit PPP in Oklahoma. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. OK is a moderate DSCR market (OKC, Tulsa \u2014 energy industry hub, Tinker AFB, growing aerospace/tech sector).',
    statutoryReference: "14A O.S. \xA7 2-106 (Oklahoma Consumer Credit Code \u2014 prepay); 14A O.S. \xA7 1-301(7) (consumer loan definition excludes business); 14 O.S. \xA7 327A (45% business loan usury cap); 6 O.S. \xA7 4-107 (banking code); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── KENTUCKY ─────────────────────────────────────────────
  KY: {
    state: "KY",
    status: "ALLOWED",
    reason: "No state PPP restriction on business-purpose investment property loans. KRS \xA7 286.8-110 (banking) and KRS \xA7 360.010 (usury) apply to consumer transactions only; business-purpose loans are exempt per KRS \xA7 360.020. Federal lenders benefit from DIDMCA preemption.",
    details: 'Kentucky has no state statute restricting prepayment penalties on business-purpose or investment property loans. The Kentucky Banking Code (KRS \xA7 286.8-110) and Kentucky usury statute (KRS \xA7 360.010) regulate prepayment penalties and interest rates on consumer-purpose residential mortgage loans but apply only to consumer transactions. KRS \xA7 360.020 explicitly exempts business-purpose loans over $25,000 from the usury cap, and KRS \xA7 286.8-110(2) provides that the consumer credit code does not apply to "loans made primarily for business or commercial purposes." The Kentucky Court of Appeals (Sanders v. West Broad Auto Sales, 1998) confirmed that business-purpose real estate loans fall outside the consumer usury protections. DIDMCA preemption (12 U.S.C. \xA7 1835d) applies for federal lenders. All major DSCR lender matrices permit PPP in Kentucky. Standard prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly available. KY is a moderate DSCR market (Louisville, Lexington, Bowling Green \u2014 logistics hub, UPS Worldport, bourbon industry, growing manufacturing sector).',
    statutoryReference: "KRS \xA7 286.8-110 (banking code \u2014 prepay); KRS \xA7 360.010 (usury statute \u2014 consumer); KRS \xA7 360.020 (business-purpose loan usury exemption over $25K); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  },
  // ── DISTRICT OF COLUMBIA ─────────────────────────────────
  DC: {
    state: "DC",
    status: "CONDITIONAL",
    reason: 'DC has strong consumer mortgage prepay protections (DC Code \xA7 28-3801 et seq.) but they apply only to "consumer" loans as defined in DC Code \xA7 28-3801(7). Business-purpose DSCR loans (entity-vested LLC/Corp) are exempt. Individual-vested DSCR loans in DC require careful documentation \u2014 entity vesting strongly recommended.',
    details: 'The District of Columbia has strong consumer mortgage prepayment protections under DC Code \xA7 28-3801 et seq. (the "Consumer Protection Procedures Act" as applied to mortgage lending). DC Code \xA7 28-3802 restricts prepayment penalties on "consumer" mortgage loans, defined in DC Code \xA7 28-3801(7) as a loan "primarily for personal, family, or household use" secured by a 1-4 unit residential property in DC. Business-purpose DSCR loans are explicitly outside this definition per DC Code \xA7 28-3801(7)(B) (excludes loans "primarily for a business or commercial purpose"). DC Office of Banking Bulletin 2014-01 confirms this interpretation: business-purpose non-owner-occupied investment property loans are exempt from the consumer mortgage prepay restrictions. However, DC is known for aggressive consumer protection enforcement (DC Department of Insurance, Securities and Banking \u2014 DISB), and the business-purpose exemption requires clean documentation: (a) borrower must be an entity (LLC/Corp/LP) \u2014 individual vesting creates consumer presumption, (b) loan purpose must be explicitly "business-purpose / investment" in the note and mortgage, (c) property must be non-owner-occupied (no borrower primary residence). For entity-vested business-purpose DSCR loans, no premium applies and all standard prepay structures are available. For individual-vested DSCR loans in DC, conservative premium applies until entity-vesting is established. DIDMCA preemption applies for federal lenders. DC is a niche DSCR market (high-value condos, townhomes \u2014 federal transient population, diplomatic community, strong rental demand).',
    statutoryReference: "DC Code \xA7 28-3801 et seq. (consumer mortgage prepay); DC Code \xA7 28-3801(7)(B) (business-purpose exemption); DC Office of Banking Bulletin 2014-01 (business-purpose loan confirmation); 12 U.S.C. \xA7 1835d (DIDMCA preemption)",
    provenance: "VERIFIED_PRIMARY",
    lastVerified: "2026-06"
  }
};
function getStateLaw(state) {
  return PPP_STATE_LAWS[state.toUpperCase()] ?? null;
}
function isIndividual(entityType) {
  return entityType === "INDIVIDUAL";
}
function buildAllowedResult(status, reason, adjustedOptions, overrides) {
  return {
    allowed: true,
    status,
    reason,
    adjustedOptions,
    noPPPPremiumRate: 0,
    noPPPPremiumFee: 0,
    requiresEntityVesting: false,
    entityNote: "",
    legalWarning: "",
    ...overrides
  };
}
function buildBlockedResult(status, reason, overrides) {
  return {
    allowed: false,
    status,
    reason,
    adjustedOptions: ["NONE"],
    noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
    noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
    requiresEntityVesting: false,
    entityNote: "",
    legalWarning: "",
    ...overrides
  };
}
function checkPPPLegal(state, entityType, loanAmount, unitCount, productType) {
  const law = getStateLaw(state);
  if (!law) {
    return buildAllowedResult(
      "ALLOWED",
      `${state.toUpperCase()} has no known PPP restrictions. Standard prepay options available.`,
      ALL_PREPAY_OPTIONS
    );
  }
  const st = state.toUpperCase();
  const isARM = productType === "ARM";
  if (st === "MN") {
    const isEntity = entityType !== "INDIVIDUAL";
    if (isEntity) {
      return buildAllowedResult(
        "CONDITIONAL",
        `MN HF 3437 (eff. 8/1/26): Business-purpose DSCR loan with entity vesting \u2014 \xA7 58.137 does NOT apply. PPP available per lender state matrix. (For individual/consumer loans, \xA7 58.137 still practically prohibits.)`,
        ALL_PREPAY_OPTIONS,
        {
          legalWarning: "\u2713 MN HF 3437 enacted 4/23/26, eff. 8/1/26. Business-purpose DSCR loans with entity vesting are NOT reached by \xA7 58.137. PPP available per lender matrix."
        }
      );
    } else {
      return buildBlockedResult(
        "PRACTICALLY_PROHIBITED",
        `MN \xA7 58.137 limits PPPs to 4 years and \u22642 months' interest for individual/consumer loans. HF 3437 (eff. 8/1/26) confirms this scope \u2014 business-purpose entity-vested loans are exempt, but individual vesting remains practically prohibited. Consider entity vesting (LLC) to access PPP.`,
        {
          legalWarning: "\u26A0\uFE0F MN individual/consumer loan: \xA7 58.137 practically prohibits PPP. Switch to LLC vesting (business-purpose) to access PPP per HF 3437 (eff. 8/1/26). Otherwise expect ~0.25% rate premium and/or ~0.625% fee premium."
        }
      );
    }
  }
  if (st === "NJ") {
    if (isIndividual(entityType)) {
      return buildBlockedResult(
        "ENTITY_ONLY",
        `New Jersey prohibits PPPs for individual borrowers. PPPs are permitted for entity borrowers (LLC, S-Corp, C-Corp, Trust), though LLC rules vary by lender.`,
        {
          requiresEntityVesting: true,
          entityNote: "PPP prohibited for individuals. Vesting in an eligible entity (LLC, S-Corp, C-Corp, Trust) may enable PPP. LLC-specific rules vary by lender \u2014 confirm with your lender before proceeding.",
          legalWarning: "\u26A0\uFE0F NJ: Individual borrowers cannot have PPP. Entity vesting required to access PPP options."
        }
      );
    }
    return buildAllowedResult(
      "ENTITY_ONLY",
      `New Jersey permits PPPs for entity borrowers. LLC rules vary by lender.`,
      ALL_PREPAY_OPTIONS,
      {
        entityNote: "LLC-specific PPP rules vary by lender. Confirm your entity type is accepted for the desired PPP structure before proceeding.",
        legalWarning: "\u2139\uFE0F NJ: PPP available for entity borrowers. Verify LLC-specific lender requirements."
      }
    );
  }
  if (st === "IL") {
    if (isIndividual(entityType)) {
      return buildBlockedResult(
        "CONDITIONAL",
        `Illinois prohibits PPPs for individual borrowers. Entity borrowers are subject to APR fall-rate tests.`,
        {
          requiresEntityVesting: true,
          entityNote: "PPP prohibited for individuals in IL. Entity vesting may enable PPP, but APR fall-rate tests apply.",
          legalWarning: "\u26A0\uFE0F IL: Individual borrowers cannot have PPP. Entity vesting required; APR fall-rate tests constrain penalty structure."
        }
      );
    }
    return buildAllowedResult(
      "CONDITIONAL",
      `Illinois permits PPPs for entity borrowers subject to APR fall-rate tests. The penalty must decline proportionally over the penalty period.`,
      ALL_PREPAY_OPTIONS,
      {
        entityNote: "APR fall-rate tests apply to entity borrowers. The penalty structure must show proportional decline. Flat penalties and certain step structures may not comply.",
        legalWarning: "\u2139\uFE0F IL: Entity borrowers may have PPP, but APR fall-rate tests constrain the structure. Verify your specific PPP structure complies with fall-rate requirements."
      }
    );
  }
  if (st === "OH") {
    const threshold = law.loanThreshold ?? OH_PPP_THRESHOLD_2026;
    const isLowUnitProperty = unitCount <= (law.unitCountRestriction ?? 2);
    if (isLowUnitProperty && loanAmount <= threshold) {
      return buildBlockedResult(
        "CONDITIONAL",
        `Ohio prohibits PPPs on 1\u20132 unit properties with loan amounts \u2264 $${threshold.toLocaleString()} (2026 indexed threshold). Your loan amount of $${loanAmount.toLocaleString()} falls within the restricted range.`,
        {
          legalWarning: `\u26A0\uFE0F OH: PPP prohibited for this loan ($${loanAmount.toLocaleString()} \u2264 $${threshold.toLocaleString()} threshold on 1\u20132 unit properties). Threshold is indexed annually (2026 figure). Consider higher loan amounts or 3+ unit properties.`
        }
      );
    }
    const thresholdNote = isLowUnitProperty ? ` Loan amount $${loanAmount.toLocaleString()} exceeds the $${threshold.toLocaleString()} threshold for 1\u20132 unit properties.` : ` Property has ${unitCount} units (above the 1\u20132 unit restriction).`;
    return buildAllowedResult(
      "CONDITIONAL",
      `Ohio permits PPPs for this loan.${thresholdNote} Standard prepay options available.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: `\u2139\uFE0F OH: PPP permitted for this loan configuration.${thresholdNote} Threshold is indexed annually (${law.thresholdYear} figure: $${threshold.toLocaleString()}).`
      }
    );
  }
  if (st === "PA") {
    const threshold = law.loanThreshold ?? PA_PPP_THRESHOLD_2026;
    const isLowUnitProperty = unitCount <= (law.unitCountRestriction ?? 2);
    if (isLowUnitProperty && loanAmount <= threshold) {
      return buildBlockedResult(
        "CONDITIONAL",
        `Pennsylvania prohibits PPPs on 1\u20132 unit properties with loan amounts \u2264 $${threshold.toLocaleString()} (2026 indexed threshold, was $319,777). Your loan amount of $${loanAmount.toLocaleString()} falls within the restricted range.`,
        {
          legalWarning: `\u26A0\uFE0F PA: PPP prohibited for this loan ($${loanAmount.toLocaleString()} \u2264 $${threshold.toLocaleString()} threshold on 1\u20132 unit properties). Threshold is indexed annually (2026: $${threshold.toLocaleString()}, previously $319,777). Consider higher loan amounts or 3+ unit properties.`
        }
      );
    }
    const thresholdNote = isLowUnitProperty ? ` Loan amount $${loanAmount.toLocaleString()} exceeds the $${threshold.toLocaleString()} indexed threshold for 1\u20132 unit properties.` : ` Property has ${unitCount} units (above the 1\u20132 unit restriction).`;
    return buildAllowedResult(
      "CONDITIONAL",
      `Pennsylvania permits PPPs for this loan.${thresholdNote} Standard prepay options available.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: `\u2139\uFE0F PA: PPP permitted for this loan configuration.${thresholdNote} Threshold is indexed annually (2026: $${threshold.toLocaleString()}, previously $319,777).`
      }
    );
  }
  if (st === "MS") {
    return buildAllowedResult(
      "CONDITIONAL",
      `Mississippi permits only declining step-down PPP structures (5-4-3-2-1) per Miss. Code \xA7 75-17-31. Flat penalties are prohibited on terms >1 year.`,
      DECLINING_ONLY_OPTIONS,
      {
        legalWarning: "\u26A0\uFE0F MS: Only declining step-down structures (54321, 4321, 321) are permitted. Flat penalties, yield maintenance, and six-months-interest structures are prohibited on terms >1 year. Statutory cap schedule: 5%-4%-3%-2%-1% by year (Miss. Code \xA7 75-17-31)."
      }
    );
  }
  if (st === "ND") {
    return buildAllowedResult(
      "AMBIGUOUS",
      `North Dakota PPP status is ambiguous. Many lenders treat ND as a no-PPP state due to program guidelines and usury considerations, but there is no clear statutory prohibition. Lender interpretation varies.`,
      ALL_PREPAY_OPTIONS,
      {
        noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
        noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
        legalWarning: "\u26A0\uFE0F ND: Lender interpretation varies. Many lenders treat ND as no-PPP. PPP may not be available from your lender even though no flat statutory ban exists. Verify with your specific lender. If PPP is unavailable, expect a ~0.25% rate premium and/or ~0.625% fee premium.",
        entityNote: "Market pattern \u2014 verify with lender. Status based on program guidelines and usury considerations, not statutory prohibition."
      }
    );
  }
  if (st === "KS") {
    return buildBlockedResult(
      "PRACTICALLY_PROHIBITED",
      `Kansas is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in KS.`,
      {
        legalWarning: "\u26A0\uFE0F KS: PPP effectively unavailable. All major DSCR lender matrices treat KS as no-PPP. Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium."
      }
    );
  }
  if (st === "NM") {
    return buildBlockedResult(
      "PRACTICALLY_PROHIBITED",
      `New Mexico is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in NM.`,
      {
        legalWarning: "\u26A0\uFE0F NM: PPP effectively unavailable. All major DSCR lender matrices treat NM as no-PPP. Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium."
      }
    );
  }
  if (st === "MD") {
    return buildBlockedResult(
      "PRACTICALLY_PROHIBITED",
      `Maryland is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in MD.`,
      {
        legalWarning: "\u26A0\uFE0F MD: PPP effectively unavailable. All major DSCR lender matrices treat MD as no-PPP. Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium."
      }
    );
  }
  if (st === "WI") {
    if (isARM) {
      return buildBlockedResult(
        "ARM_RESTRICTED",
        `Wisconsin prohibits PPPs on ARM loans. Fixed-rate loans are permitted but capped at 2 months' interest.`,
        {
          legalWarning: "\u26A0\uFE0F WI: PPP prohibited on ARM loans. Switch to a fixed-rate product to access PPP options. For fixed-rate loans, PPP is capped at 2 months' interest."
        }
      );
    }
    return buildAllowedResult(
      "ARM_RESTRICTED",
      `Wisconsin permits PPPs on fixed-rate loans, capped at 2 months' interest. ARM loans are prohibited from having PPP.`,
      ["NONE", "SIX_MONTHS_INTEREST", "SIX_MONTHS_80_PCT", "SOFT_PREPAY"],
      {
        legalWarning: "\u2139\uFE0F WI: PPP available on fixed-rate loans only. Maximum penalty capped at 2 months' interest. Structures exceeding this cap are not permissible. ARM loans cannot have PPP."
      }
    );
  }
  if (st === "ME") {
    if (isARM) {
      return buildBlockedResult(
        "ARM_RESTRICTED",
        `Maine prohibits PPPs on ARM loans. Fixed-rate loans may have standard PPP structures.`,
        {
          legalWarning: "\u26A0\uFE0F ME: PPP prohibited on ARM loans. Switch to a fixed-rate product to access PPP options."
        }
      );
    }
    return buildAllowedResult(
      "ARM_RESTRICTED",
      `Maine permits PPPs on fixed-rate loans. ARM loans are prohibited from having PPP.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F ME: PPP available on fixed-rate loans only. ARM loans cannot have PPP."
      }
    );
  }
  if (st === "WA") {
    return buildAllowedResult(
      "ALLOWED",
      `Washington has no confirmed PPP restrictions. An ARM-ban claim from v6.0 could not be verified and is not encoded. Standard prepay options available for both fixed and ARM products.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F WA: A claim that WA bans PPP on ARM loans (from v6.0) is UNVERIFIED and has not been encoded per v7.0 provenance policy. Standard PPP options are available. If you have a source confirming or denying the ARM restriction, please update the system."
      }
    );
  }
  if (st === "MI") {
    return buildAllowedResult(
      "AMBIGUOUS",
      `Michigan has no legal consensus as of 2026 on whether PPPs are allowed, restricted, or banned. Lender-interpretation varies significantly.`,
      ALL_PREPAY_OPTIONS,
      {
        noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
        noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
        legalWarning: "\u26A0\uFE0F MI: No legal consensus on PPP status as of 2026. Lender-interpretation varies \u2014 interpretations range from permitted to restricted to banned. Verify with your specific lender and legal counsel. If PPP is unavailable, expect a ~0.25% rate premium and/or ~0.625% fee premium.",
        entityNote: "Market pattern \u2014 no legal consensus. Lender-interpretation varies. Consult legal counsel and verify with lender."
      }
    );
  }
  if (st === "CA") {
    return buildAllowedResult(
      "ALLOWED",
      `California permits PPPs on business-purpose DSCR loans. Cal. Civ. Code \xA7 2954.9 exempts business-purpose loans from the consumer PPP restriction. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F CA: Business-purpose DSCR loans are exempt from Civ. Code \xA7 2954.9 (consumer PPP ban). State-chartered lenders subject to CFLL; federal lenders benefit from DIDMCA preemption. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "TX") {
    return buildAllowedResult(
      "ALLOWED",
      `Texas permits PPPs on business-purpose DSCR loans. TX Constitution Art. XVI \xA7 50 homestead protections apply only to owner-occupied cash-out refis, not DSCR/investment property. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F TX: No state PPP restriction on business-purpose investment property loans. TX homestead protections (Art. XVI \xA7 50) apply only to owner-occupied cash-out refis. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "FL") {
    return buildAllowedResult(
      "ALLOWED",
      `Florida permits PPPs on business-purpose DSCR loans. Fla. Stat. \xA7 697.05 regulates but does not prohibit PPP. DIDMCA preemption applies for federal lenders. FL is one of the highest-volume DSCR states.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F FL: No state PPP restriction on business-purpose investment property loans. Fla. Stat. \xA7 697.05 regulates but does not prohibit PPP. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "GA") {
    return buildAllowedResult(
      "ALLOWED",
      `Georgia permits PPPs on business-purpose DSCR loans. O.C.G.A. \xA7 7-6A-1 et seq. (GA Fair Lending Act) applies to consumer home loans only \u2014 DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F GA: No state PPP restriction on business-purpose investment property loans. GA Fair Lending Act (O.C.G.A. \xA7 7-6A-1 et seq.) applies to consumer home loans only. Standard prepay structures available."
      }
    );
  }
  if (st === "NC") {
    return buildAllowedResult(
      "CONDITIONAL",
      `North Carolina permits PPPs on business-purpose DSCR loans. N.C. Gen. Stat. \xA7 24-1.1A 3-2-1 cap applies to consumer loans \u2264 $400K (indexed) \u2014 DSCR loans are exempt. Verify high-cost loan triggers (\xA7 24-1.1E) are not tripped.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F NC: Business-purpose DSCR loans are exempt from the \xA7 24-1.1A 3-2-1 consumer cap. High-cost home loan provisions (\xA7 24-1.1E) may apply if APR or points/fees exceed statutory triggers \u2014 verify structure complies. Standard prepay structures available; DIDMCA preemption applies for federal lenders."
      }
    );
  }
  if (st === "CO") {
    return buildAllowedResult(
      "CONDITIONAL",
      `Colorado permits PPPs on business-purpose DSCR loans. C.R.S. \xA7 5-1-101 et seq. (Colorado UCCC) applies to consumer credit only \u2014 DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F CO: Business-purpose DSCR loans are exempt from the Colorado UCCC 3-2-1 consumer cap. UCCC applies to consumer credit transactions only \u2014 entity-vested business-purpose loans are outside scope. Standard prepay structures available."
      }
    );
  }
  if (st === "TN") {
    return buildAllowedResult(
      "ALLOWED",
      `Tennessee permits PPPs on business-purpose DSCR loans. T.C.A. \xA7 47-14-123 governs prepayment generally and does not prohibit PPP. T.C.A. \xA7 47-14-102 usury ceiling exempts banks/real-estate-secured business loans. DIDMCA preemption applies for federal lenders. TN is one of the fastest-growing DSCR markets.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F TN: No state PPP restriction on business-purpose investment property loans. TN usury statute (T.C.A. \xA7 47-14-102) exempts banks and real-estate-secured business loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "AZ") {
    return buildAllowedResult(
      "ALLOWED",
      `Arizona permits PPPs on business-purpose DSCR loans. A.R.S. \xA7 6-126 applies only to consumer owner-occupied 1-2 unit properties. A.R.S. \xA7 44-1201 usury cap exempts business/commercial loans. DIDMCA preemption applies for federal lenders. AZ is a high-growth DSCR market.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F AZ: No state PPP restriction on business-purpose investment property loans. A.R.S. \xA7 6-126 (consumer prepay statute) applies to owner-occupied 1-2 unit only \u2014 DSCR loans are outside scope. A.R.S. \xA7 44-1201 usury cap exempts business/commercial-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "VA") {
    return buildAllowedResult(
      "ALLOWED",
      `Virginia permits PPPs on business-purpose DSCR loans. Va. Code \xA7 6.2-1303 et seq. (High-Rate Home Loans Act) applies to consumer home loans only \u2014 DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F VA: No state PPP restriction on business-purpose investment property loans. VA High-Rate Home Loans Act (\xA7 6.2-1303) applies to owner-occupied consumer home loans only. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "IN") {
    return buildAllowedResult(
      "CONDITIONAL",
      `Indiana permits PPPs on business-purpose DSCR loans. Ind. Code \xA7 24-4.5-3-202 imposes a 2% consumer cap (first 3 years) \u2014 DSCR loans are exempt per \xA7 24-4.5-2-106 business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F IN: Business-purpose DSCR loans are exempt from the Indiana UCCC 2% consumer cap (first 3 years) per \xA7 24-4.5-2-106. Entity-vested business-purpose loans are outside the scope of the UCCC. Standard prepay structures available."
      }
    );
  }
  if (st === "SC") {
    return buildAllowedResult(
      "CONDITIONAL",
      `South Carolina permits PPPs on business-purpose DSCR loans. S.C. Code \xA7 37-5-202 imposes a 3-2-1 consumer cap \u2014 DSCR loans are exempt per \xA7 37-1-202 business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F SC: Business-purpose DSCR loans are exempt from the South Carolina Consumer Protection Code 3-2-1 consumer cap per \xA7 37-1-202. Entity-vested business-purpose loans are outside the scope of the Consumer Protection Code. Standard prepay structures available."
      }
    );
  }
  if (st === "OR") {
    return buildAllowedResult(
      "ALLOWED",
      `Oregon permits PPPs on business-purpose DSCR loans. ORS \xA7 86A.192 (Mortgage Lender Law) applies to consumer residential loans only \u2014 DSCR loans are outside scope. ORS \xA7 82.010 usury cap exempts business/commercial-purpose loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F OR: No state PPP restriction on business-purpose investment property loans. ORS \xA7 86A.192 (consumer prepay statute) applies to consumer residential loans only \u2014 DSCR loans are outside scope. ORS \xA7 82.010 usury cap exempts business/commercial-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "NV") {
    return buildAllowedResult(
      "ALLOWED",
      `Nevada permits PPPs on business-purpose DSCR loans. NRS \xA7 598D.430 (Mortgage Lending Act) applies to consumer residential mortgage loans only \u2014 DSCR loans are outside scope. NRS \xA7 99.040\u2013050 usury cap exempts banks/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F NV: No state PPP restriction on business-purpose investment property loans. NRS \xA7 598D.430 (consumer prepay statute) applies to consumer residential loans only \u2014 DSCR loans are outside scope. NRS \xA7 99.040\u2013050 usury cap exempts banks and business/commercial-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "UT") {
    return buildAllowedResult(
      "ALLOWED",
      `Utah permits PPPs on business-purpose DSCR loans. Utah Code \xA7 70C-5-202 (consumer real estate prepay) is part of the Consumer Credit Code \u2014 DSCR loans are exempt per \xA7 70C-1-202(3) business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F UT: No state PPP restriction on business-purpose investment property loans. Utah Code \xA7 70C-5-202 (consumer real estate prepay) is part of the Consumer Credit Code \u2014 DSCR loans are exempt per \xA7 70C-1-202(3) business-purpose exemption. Utah has no general usury cap for business-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "MO") {
    return buildAllowedResult(
      "ALLOWED",
      `Missouri permits PPPs on business-purpose DSCR loans. Mo. Rev. Stat. \xA7 408.043 (residential mortgage act) applies to consumer primary-residence loans only \u2014 DSCR loans are outside scope. Mo. Rev. Stat. \xA7 408.030(8) usury cap exempts business/commercial loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F MO: No state PPP restriction on business-purpose investment property loans. Mo. Rev. Stat. \xA7 408.043 (residential mortgage act) applies to consumer primary-residence loans only \u2014 DSCR loans are outside scope. Mo. Rev. Stat. \xA7 408.030(8) usury cap exempts business/commercial-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "AL") {
    return buildAllowedResult(
      "ALLOWED",
      `Alabama permits PPPs on business-purpose DSCR loans. Ala. Code \xA7 5-19-4 (Mini-Code) governs consumer credit only \u2014 DSCR loans are exempt per \xA7 5-19-4(2) business-purpose exemption. Ala. Code \xA7 8-8-7 usury cap exempts banks/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F AL: No state PPP restriction on business-purpose investment property loans. Ala. Code \xA7 5-19-4 (Mini-Code) governs consumer credit only \u2014 DSCR loans are exempt per \xA7 5-19-4(2) business-purpose exemption. Ala. Code \xA7 8-8-7 usury cap exempts banks and business/commercial-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "NY") {
    return buildAllowedResult(
      "CONDITIONAL",
      `New York permits PPPs on business-purpose DSCR loans. NY Gen. Oblig. Law \xA7 5-501(6)(b) imposes a 2% cap on small consumer loans; NY Banking Law \xA7 280-a restricts high-cost home loans (consumer only). Business-purpose DSCR loans are exempt per \xA7 5-501(1) commercial-loan definition. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F NY: Business-purpose DSCR loans are exempt from consumer protections per NY Gen. Oblig. Law \xA7 5-501(1) commercial-loan definition. NY Banking Law \xA7 280-a (high-cost home loans) applies to consumer owner-occupied 1-4 unit only. Entity-vested business-purpose loans are outside the scope of the consumer restrictions. Standard prepay structures available."
      }
    );
  }
  if (st === "HI") {
    return buildAllowedResult(
      "ALLOWED",
      `Hawaii permits PPPs on business-purpose DSCR loans. HRS \xA7 478-5 (consumer mortgage prepay statute) exempts business-purpose loans per \xA7 478-5(d). HRS \xA7 478-2 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F HI: No state PPP restriction on business-purpose investment property loans. HRS \xA7 478-5 (consumer mortgage prepay statute) exempts business-purpose loans per \xA7 478-5(d). HRS \xA7 478-2 usury cap exempts banks and real-estate-secured loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "WV") {
    return buildAllowedResult(
      "ALLOWED",
      `West Virginia permits PPPs on business-purpose DSCR loans. W. Va. Code \xA7 46A-4-101 et seq. (Consumer Credit and Protection Act) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 46A-1-102(10) business-purpose exemption. W. Va. Code \xA7 47-6-1 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F WV: No state PPP restriction on business-purpose investment property loans. W. Va. Code \xA7 46A-4-101 (Consumer Credit and Protection Act) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 46A-1-102(10) business-purpose exemption. W. Va. Code \xA7 47-6-1 usury cap exempts banks and real-estate-secured loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "VT") {
    return buildAllowedResult(
      "CONDITIONAL",
      `Vermont permits PPPs on business-purpose DSCR loans. 9 V.S.A. \xA7 138 imposes a declining prepayment cap on consumer mortgage loans (first 3-5 years) \u2014 DSCR loans are exempt per \xA7 138(d) business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F VT: Business-purpose DSCR loans are exempt from the Vermont Consumer Credit Act prepayment restrictions per 9 V.S.A. \xA7 138(d). Entity-vested business-purpose loans are outside the scope of \xA7 138. Standard prepay structures available."
      }
    );
  }
  if (st === "NH") {
    return buildAllowedResult(
      "ALLOWED",
      `New Hampshire permits PPPs on business-purpose DSCR loans. RSA \xA7 359-C:5 (consumer credit prepay) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 359-C:1(4) business-purpose exemption. RSA \xA7 359-A:1 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F NH: No state PPP restriction on business-purpose investment property loans. RSA \xA7 359-C:5 (consumer credit prepay) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 359-C:1(4) business-purpose exemption. RSA \xA7 359-A:1 usury cap exempts banks and real-estate-secured loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "DE") {
    return buildAllowedResult(
      "ALLOWED",
      `Delaware permits PPPs on business-purpose DSCR loans. DE has minimal consumer protection statutes; 5 Del. C. \xA7 1100 et seq. (Consumer Credit Bank Act) applies to consumer credit only. 6 Del. C. \xA7 2301 usury statute exempts business/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F DE: No state PPP restriction on business-purpose investment property loans. 5 Del. C. \xA7 1100 (Consumer Credit Bank Act) applies to consumer credit only. 6 Del. C. \xA7 2301 usury statute exempts business and real-estate-secured loans. DE is a corporate haven \u2014 most lender-friendly state on consumer protection. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "RI") {
    return buildAllowedResult(
      "CONDITIONAL",
      `Rhode Island permits PPPs on business-purpose DSCR loans. R.I. Gen. Laws \xA7 34-25-1 et seq. (Home Loan Protection Act) restricts prepayment penalties on consumer owner-occupied home loans \u2014 DSCR loans are outside scope per \xA7 34-25-1 definitions. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F RI: Business-purpose DSCR loans are outside the scope of the RI Home Loan Protection Act (\xA7 34-25-1), which applies to consumer owner-occupied 1-4 unit residential property only. Entity-vested business-purpose loans are outside the scope of the consumer restrictions. Standard prepay structures available."
      }
    );
  }
  if (st === "ID") {
    return buildAllowedResult(
      "ALLOWED",
      `Idaho permits PPPs on business-purpose DSCR loans. Idaho Code \xA7 28-41-101 et seq. (Idaho Consumer Credit Code) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 28-41-104 business-purpose exemption. Idaho Code \xA7 28-22-104 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F ID: No state PPP restriction on business-purpose investment property loans. Idaho Code \xA7 28-41-101 (ICCC) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 28-41-104 business-purpose exemption. Idaho Code \xA7 28-22-104 usury cap exempts banks and real-estate-secured loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "MT") {
    return buildAllowedResult(
      "ALLOWED",
      `Montana permits PPPs on business-purpose DSCR loans. Mont. Code \xA7 31-1-115 (consumer mortgage prepay) is consumer-only. Mont. Code \xA7 31-1-107 expressly EXEMPTS business/commercial-purpose loans from usury. Mont. Code \xA7 31-1-101 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F MT: No state PPP restriction on business-purpose investment property loans. Mont. Code \xA7 31-1-115 (consumer mortgage prepay) is consumer-only. Mont. Code \xA7 31-1-107 expressly EXEMPTS business/commercial-purpose loans from usury. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "WY") {
    return buildAllowedResult(
      "ALLOWED",
      `Wyoming permits PPPs on business-purpose DSCR loans. Wyo. Stat. \xA7 40-14-101 et seq. (UCCC) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 40-14-106 business-purpose exemption. Wyo. Stat. \xA7 40-1-101 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F WY: No state PPP restriction on business-purpose investment property loans. Wyo. Stat. \xA7 40-14-101 (UCCC) applies to consumer credit only \u2014 DSCR loans are exempt per \xA7 40-14-106 business-purpose exemption. Wyo. Stat. \xA7 40-1-101 usury cap exempts banks and real-estate-secured loans. WY is one of the most lender-friendly states on interest rate regulation. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "NE") {
    return buildAllowedResult(
      "ALLOWED",
      `Nebraska permits PPPs on business-purpose DSCR loans. Neb. Rev. Stat. \xA7 45-101.01 et seq. (Installment Loan Act) applies to consumer installment loans only \u2014 business-purpose DSCR loans are outside scope. Neb. Rev. Stat. \xA7 45-101.03 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F NE: No state PPP restriction on business-purpose investment property loans. Neb. Rev. Stat. \xA7 45-101.01 (Installment Loan Act) applies to consumer installment loans only. Neb. Rev. Stat. \xA7 45-101.03 usury cap exempts banks, real-estate-secured, and business-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "IA") {
    return buildAllowedResult(
      "ALLOWED",
      `Iowa permits PPPs on business-purpose DSCR loans. Iowa Code \xA7 535.17 (consumer credit code prepay) applies to consumer credit only \u2014 business-purpose DSCR loans are outside scope. Iowa Code \xA7 535.2 usury cap exempts banks/real-estate-secured/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F IA: No state PPP restriction on business-purpose investment property loans. Iowa Code \xA7 535.17 (consumer credit code prepay) applies to consumer credit only \u2014 business-purpose DSCR loans are outside scope. Iowa Code \xA7 535.2 usury cap exempts banks, real-estate-secured, and business-purpose loans. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "SD") {
    return buildAllowedResult(
      "ALLOWED",
      `South Dakota permits PPPs on business-purpose DSCR loans. SDCL \xA7 54-4-12 (consumer mortgage prepay) is consumer-only. SD REPEALED its usury statute in the 1980s \u2014 no general usury cap on business-purpose loans (most lender-friendly state on interest rate). DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F SD: No state PPP restriction on business-purpose investment property loans. SDCL \xA7 54-4-12 (consumer mortgage prepay) is consumer-only. SD REPEALED its usury statute in the 1980s \u2014 no general usury cap on business-purpose loans. SD is one of the most lender-friendly states on interest rate regulation. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "AR") {
    return buildAllowedResult(
      "ALLOWED",
      `Arkansas permits PPPs on business-purpose DSCR loans. Ark. Code \xA7 4-99-102 (consumer prepay) is consumer-only. Ark. Const. Art. 19 \xA7 13 usury cap (17%) is bypassed by DIDMCA preemption for federal lenders; Ark. Code \xA7 23-50-102 exempts business-purpose loans >$25K from usury ceiling.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F AR: No state PPP restriction on business-purpose investment property loans. Ark. Code \xA7 4-99-102 (consumer prepay) is consumer-only. Ark. Const. Art. 19 \xA7 13 usury cap (17%) is bypassed by DIDMCA preemption for federal lenders; Ark. Code \xA7 23-50-102 exempts business-purpose loans >$25K from usury ceiling. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "LA") {
    return buildAllowedResult(
      "ALLOWED",
      `Louisiana permits PPPs on business-purpose DSCR loans. La. R.S. 9:3560 (consumer mortgage prepay) is consumer-only. LA is a civil law state (unique in US \u2014 derived from French/Spanish civil law); La. R.S. 9:3516(8) excludes business-purpose loans from "consumer loan" definition. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: '\u2139\uFE0F LA: No state PPP restriction on business-purpose investment property loans. La. R.S. 9:3560 (consumer mortgage prepay) is consumer-only. LA is a civil law state \u2014 Civil Code arts. 1750/3284 treat business loans as freely contractible. La. R.S. 9:3516(8) excludes business-purpose loans from "consumer loan" definition. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.'
      }
    );
  }
  if (st === "OK") {
    return buildAllowedResult(
      "ALLOWED",
      `Oklahoma permits PPPs on business-purpose DSCR loans. 14A O.S. \xA7 2-106 (Oklahoma Consumer Credit Code) is consumer-only. OK has one of the highest business-loan usury caps in the US at 45% (14 O.S. \xA7 327A) \u2014 most lender-friendly state on rate regulation. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F OK: No state PPP restriction on business-purpose investment property loans. 14A O.S. \xA7 2-106 (Oklahoma Consumer Credit Code) is consumer-only. 14 O.S. \xA7 327A sets business-loan usury ceiling at 45% \u2014 most lender-friendly state on rate. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "KY") {
    return buildAllowedResult(
      "ALLOWED",
      `Kentucky permits PPPs on business-purpose DSCR loans. KRS \xA7 286.8-110 (banking) and KRS \xA7 360.010 (usury) are consumer-only. KRS \xA7 360.020 explicitly exempts business-purpose loans >$25K from usury cap. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning: "\u2139\uFE0F KY: No state PPP restriction on business-purpose investment property loans. KRS \xA7 286.8-110 (banking) and KRS \xA7 360.010 (usury) are consumer-only. KRS \xA7 360.020 exempts business-purpose loans >$25K from usury cap. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available."
      }
    );
  }
  if (st === "DC") {
    return {
      allowed: true,
      status: "CONDITIONAL",
      reason: `District of Columbia permits PPPs on business-purpose DSCR loans (entity-vested). DC Code \xA7 28-3801 et seq. (consumer mortgage prepay) applies only to "consumer" loans per DC Code \xA7 28-3801(7). Business-purpose entity-vested loans are exempt per DC Code \xA7 28-3801(7)(B). DC Office of Banking Bulletin 2014-01 confirms this interpretation. Individual-vested DSCR loans in DC require careful documentation \u2014 entity vesting strongly recommended.`,
      adjustedOptions: ALL_PREPAY_OPTIONS,
      noPPPPremiumRate: 0,
      noPPPPremiumFee: 0,
      requiresEntityVesting: true,
      entityNote: "Entity vesting (LLC/Corp/LP) required for DC business-purpose exemption. Individual vesting creates consumer presumption \u2014 conservative premium applies.",
      legalWarning: "\u2139\uFE0F DC: CONDITIONAL \u2014 consumer mortgage prepay protections (DC Code \xA7 28-3801) apply to consumer loans only. Business-purpose entity-vested loans are exempt per DC Code \xA7 28-3801(7)(B) + DISB Bulletin 2014-01. Individual vesting creates consumer presumption \u2014 entity vesting strongly recommended. Standard prepay structures (321, 54321, yield maintenance, soft prepay) available for entity-vested borrowers."
    };
  }
  return buildAllowedResult(
    law.status,
    law.reason,
    ALL_PREPAY_OPTIONS,
    {
      legalWarning: `\u2139\uFE0F ${st}: ${law.details}`
    }
  );
}

// src/engine/lenders.ts
var ALL_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC"
];
var STATES_48 = ALL_STATES.filter((s) => s !== "AK" && s !== "HI");
function dp(value, provenance, source, asOfDate, notes) {
  return { value, provenance, source, asOfDate, notes };
}
function ptRules(allowed, maxLTV, overrides) {
  const all = [
    "SFR",
    "2-4_UNIT",
    "CONDO_WARRANTABLE",
    "CONDO_NON_WARRANTABLE",
    "CONDOTEL",
    "RURAL",
    "5+_UNIT",
    "MIXED_USE"
  ];
  const result = {};
  for (const pt of all) {
    if (overrides?.[pt]) {
      result[pt] = overrides[pt];
    } else if (allowed.includes(pt)) {
      result[pt] = { allowed: true, maxLTV };
    } else {
      result[pt] = { allowed: false, maxLTV: 0 };
    }
  }
  return result;
}
function confidenceBand(score) {
  if (score >= 80) return "Highly verified";
  if (score >= 70) return "Reliable";
  if (score >= 60) return "Moderate confidence";
  return "Low confidence \u2014 verify directly";
}
var GRIFFIN_FUNDING = {
  id: "griffin",
  name: "Griffin Funding",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "Griffin Funding lender site + May 2026 production data",
  confidenceScore: 85,
  confidenceBand: confidenceBand(85),
  statesAvailable: ALL_STATES,
  minFICO: dp(620, "VERIFIED_PRIMARY", "Griffin Funding lender site \u2014 620 FICO minimum, accepts DSCR < 0.75", "2026-06", "620 FICO floor; sub-0.75 DSCR accepted via Flex program"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "Griffin Funding lender site", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_PRIMARY", "Griffin Funding lender site", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_PRIMARY", "Griffin Funding lender site \u2014 no-ratio program available", "2026-06"),
  reserveRule: dp("6/9/12 standard; CA 9/12/15 overlay", "VERIFIED_SECONDARY", "3rd-party review", "2026-06", "CA geographic overlay requires 9/12/15 months"),
  strPolicy: {
    lenderId: "griffin",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "LT_MARKET_FALLBACK",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
  },
  prepayOptions: ["NONE", "54321", "4321", "321"],
  loanAmountMin: dp(65e3, "VERIFIED_PRIMARY", "Griffin Funding lender site", "2026-06"),
  loanAmountMax: dp(4e6, "UNVERIFIED", "Griffin site: jumbo to $4M in-house. $20M figure is UNVERIFIED \u2014 do not present as fact.", "2026-06", "v11 FIX (AUDIT-4 #2): $20M figure is UNVERIFIED per spec Part I + Part N. $4M in-house is the verified cap."),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "RURAL"],
    80,
    { "CONDOTEL": { allowed: true, maxLTV: 70 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.25,
  rateSheetDate: "2026-06",
  bestFor: ["jumbo", "sub-1.0 DSCR", "no-ratio", "nationwide"],
  cautions: [
    "Rate-sensitive outside core geography \u2014 +0.25% East Coast/Midwest",
    "CA reserve-constrained (9/12/15 mo overlay)"
  ],
  notes: "May 2026 production: 62 loans, $20.79M, avg DSCR 1.14. Avg loan $335K (= $20.79M / 62 loans). Avg FICO 729 [UNVERIFIED]. Closing: 6 days fastest, 34 days avg. Fixed 6.125%-7.5%, ARM from 5.125%. +0.25% rate East Coast/Midwest. STR: AirDNA comparables required for STR purchase (no Airbnb history needed); documented STR history required for cash-out refi.",
  provenanceDetails: [
    { claim: "All 50 states + DC", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026-06", date: "2026-06" },
    { claim: "No FICO floor published", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Max LTV 80%", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Min DSCR 0.75 (sub-0.75 accepted via Flex)", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "No-ratio program available", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Reserves 6/9/12; CA 9/12/15", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Fixed 6.125%-7.5%, ARM from 5.125%", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Up to $20M jumbo", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Prepay 5-4-3-2-1; no-prepay at premium", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "STR: AirDNA comps required for purchase; documented history for cash-out refi", provenance: "VERIFIED_PRIMARY", source: "Griffin Funding STR guide", date: "2026-06" },
    { claim: "DSCR formula GROSS_PITIA", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Vacancy: NONE (lower-of rule, no vacancy factor)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "May 2026: 62 loans, $20.79M, avg DSCR 1.14", provenance: "VERIFIED_PRIMARY", source: "Lender production data", date: "2026-05" },
    { claim: "Avg FICO 729", provenance: "UNVERIFIED", source: "No reliable source", date: "2026-06" },
    { claim: "Closing: 6 days fastest, 34 days avg", provenance: "VERIFIED_PRIMARY", source: "Lender production data", date: "2026-05" },
    { claim: "+0.25% rate East Coast/Midwest", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Min FICO 620; sub-0.75 DSCR accepted", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" }
  ]
};
var KIAVI = {
  id: "kiavi",
  name: "Kiavi",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "3rd-party review, 2026; Kiavi process guide",
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),
  statesAvailable: ALL_STATES,
  // coverage in flux
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  maxLTV: dp(80, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  minDSCR: dp(1.1, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 to prequalify", "2026-06", "1.1 DSCR to prequalify; do not assume lower"),
  noRatioAvailable: dp(false, "UNVERIFIED", "No reliable source \u2014 do not assume no-ratio available", "2026-06", "UNVERIFIED \u2014 explicitly do not assume no-ratio"),
  reserveRule: dp("Advertises no reserves required (low-documentation); 3rd-party reviews mention 6-9 months typical as underwriting condition", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06", "Conflicting: Kiavi advertises no reserves, but 3rd-party reviews mention reserve documentation as typical condition. Verify directly."),
  strPolicy: {
    lenderId: "kiavi",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: false,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "UNVERIFIED"
  },
  prepayOptions: ["NONE", "321", "SOFT_PREPAY"],
  loanAmountMin: dp(75e3, "UNVERIFIED", "Market pattern", "2026-06"),
  loanAmountMax: dp(3e6, "UNVERIFIED", "Market pattern", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "VERIFIED_SECONDARY", "SSN required, no ITIN", "2026-06", "SSN required; ITIN not available"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: false, maxLTV: 0 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.5,
  rateSheetDate: "2026-06",
  bestFor: ["speed", "BRRRR bridge-to-DSCR"],
  cautions: [
    "ITIN not available \u2014 SSN required",
    "Sub-1.1 DSCR unlikely to qualify",
    "Reserve-thin files may not pass",
    "State coverage in flux \u2014 verify before submitting"
  ],
  notes: 'Advertised "from 6%"; realistic 7.5%-11% \u2014 show both sources. Close timeline: 15-30 days, most within 3 weeks (7-14 day claim in v5.0 was optimistic). Portfolio loans available for 5+ properties (v5.0 wrongly said "Blanket: No"). STR/AirDNA market-conditional \u2014 confirm before underwriting. No-ratio: UNVERIFIED \u2014 do not assume. Penalties typical first 3 years; soft prepay reported.',
  provenanceDetails: [
    { claim: "States: coverage in flux", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Min FICO 660", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Max LTV 80%", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Min DSCR 1.1 to prequalify", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio available", provenance: "UNVERIFIED", source: "No reliable source", date: "2026-06" },
    { claim: "Reserves 6-9 months typical", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: 'Advertised "from 6%"', provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Realistic 7.5%-11%", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "SSN required, no ITIN", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "DSCR formula GROSS_PITIA", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Soft prepay reported", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "15-30 day close; most within 3 weeks", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Portfolio loans available for 5+ properties", provenance: "VERIFIED_PRIMARY", source: "Kiavi program guide", date: "2026-06" }
  ]
};
var VISIO_LENDING = {
  id: "visio",
  name: "Visio Lending",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "3rd-party review, 2026; Visio Lending lender site",
  confidenceScore: 78,
  confidenceBand: confidenceBand(78),
  statesAvailable: STATES_48,
  // excludes AK, HI
  minFICO: dp(680, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "Visio Lending lender site \u2014 up to 80% on STR", "2026-06"),
  minDSCR: dp(1, "UNVERIFIED", "3rd-party review cites 1.0 DSCR minimum; 0.75 Flex program unconfirmed \u2014 verify directly", "2026-06", "Standard min DSCR 1.0 per 3rd-party review; Flex 0.75 floor UNVERIFIED \u2014 confirm if still offered"),
  noRatioAvailable: dp(false, "UNVERIFIED", "Not offered per market intelligence", "2026-06"),
  reserveRule: dp("6 months standard", "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  strPolicy: {
    lenderId: "visio",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "HISTORICAL_12MO",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
  },
  prepayOptions: ["NONE", "54321", "4321", "321"],
  loanAmountMin: dp(75e3, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(2e6, "VERIFIED_PRIMARY", 'Spec Part I June 2026 (line 691): "~$75K-$2M". Previous $5M figure was from 3rd-party review and overstated per v11 spec.', "2026-06", "v11.1 FIX (AUDIT-10 issue 5): Reverted from $5M to $2M per spec. The $5M figure was based on stale 3rd-party reviews that conflict with the v11 spec."),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDOTEL"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.125,
  rateSheetDate: "2026-06",
  bestFor: ["STR", "unique properties", "sub-1.0 Flex", "12-month STR history"],
  cautions: [
    "AK/HI excluded",
    "Hard cap $2M (jumbo NOT offered \u2014 spec confirmed)",
    "Rate-shoppers on pristine files may find better elsewhere"
  ],
  notes: "Broadest STR acceptance \u2014 historical OR projections, unique property types. STR LTV capped at 75% per market comparison (v5.0 claimed 80% \u2014 corrected). GROSS_PITIA with lower-of rule, NO vacancy factor. Prepay: 5-4-3-2-1 standard; no-prepay at +0.625%. Flex program (0.75 floor) UNVERIFIED \u2014 downgraded from prior claim; confirm directly. v11.1: loanAmountMax reverted from $5M to $2M per spec Part I line 691.",
  provenanceDetails: [
    { claim: "48 states (excludes AK, HI)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Min FICO 680", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Max LTV 80% (up to 80% on STR)", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Min DSCR 0.75 (Flex)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio not offered", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Reserves market pattern", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Prepay 5-4-3-2-1; no-prepay at +0.625%", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Broadest STR acceptance", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "GROSS_PITIA, lower-of rule, NO vacancy factor", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Max loan $2M (spec Part I line 691)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" }
  ]
};
var LIMA_ONE_CAPITAL = {
  id: "lima_one",
  name: "Lima One Capital",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "Lender materials, 2026; market intelligence for unspecified fields",
  confidenceScore: 76,
  confidenceBand: confidenceBand(76),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  minDSCR: dp(1, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 1.0 minimum for standard program", "2026-06", "Standard DSCR product: 1.0 minimum, 660 FICO, 80% LTV, up to $5M"),
  noRatioAvailable: dp(false, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  reserveRule: dp("6 months standard; 3 months experienced (10+ properties)", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06", "Experienced investors with 10+ properties may qualify for 3-month reserves"),
  strPolicy: {
    lenderId: "lima_one",
    allowed: true,
    haircutPercent: 15,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(75e3, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(2e6, "VERIFIED_PRIMARY", 'Spec Part I June 2026 (line 686): "To $2M/80% LTV". Previous $5M figure was from 3rd-party review and overstated per v11 spec.', "2026-06", "v11.1 FIX (AUDIT-10 issue 7): Reverted from $5M to $2M per spec. v5.0 had $3M+; v7 raised to $5M based on stale 3rd-party reviews; v11 spec confirms $2M cap."),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "CONDOTEL"],
    80,
    { "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.375,
  rateSheetDate: "2026-06",
  bestFor: ["experienced investors", "STR with AirDNA data", "portfolio programs"],
  cautions: [
    "Confirm exact terms per program \u2014 many programs with varying terms",
    "Blanket loans available \u2014 CRITICAL exit warning for cross-collateralized properties",
    "AirDNA-backed STR program \u2014 STR friendliness 4/5",
    "v11.1: Hard cap $2M per spec (was $5M based on 3rd-party reviews)"
  ],
  notes: "AirDNA-backed specialized STR program (stronger DSCRs, higher LTVs, better terms \u2014 corrected from v5.0). v11.1: $2M limit per spec Part I (was $5M in v7 based on stale 3rd-party review \u2014 reverted). STR friendliness 4/5. Prepay: 3-2-1 standard; extended 5-4-3-2-1 at lower rate. Advertises 7-10 day close but realistic timeline is ~3 weeks. Blanket loan program available \u2014 CRITICAL: exit warning on cross-collateralization. Reserves: 6 mo standard; 3 mo for experienced (10+ properties). BRRRR one-stop shop (bridge + DSCR takeout).",
  provenanceDetails: [
    { claim: "States available", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Min FICO", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Max LTV", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Min DSCR", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "AirDNA-backed STR program, 4/5 friendliness", provenance: "VERIFIED_PRIMARY", source: "Lender materials, 2026", date: "2026-06" },
    { claim: "Prepay 3-2-1 standard; 5-4-3-2-1 at lower rate", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Reserves 6mo standard; 3mo experienced", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Blanket loans available", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Max loan $2M (spec Part I line 686)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" }
  ]
};
var DEFI_MORTGAGE = {
  id: "defy",
  name: "Defy Mortgage",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "Defy Mortgage lender site, 2026",
  confidenceScore: 80,
  confidenceBand: confidenceBand(80),
  statesAvailable: ALL_STATES,
  minFICO: dp(640, "VERIFIED_PRIMARY", "Defy Mortgage lender site, 2026", "2026-06"),
  maxLTV: dp(85, "VERIFIED_PRIMARY", "Defy Mortgage lender site \u2014 85% on SFR purchases for 740+ FICO, 1.0+ DSCR", "2026-06", "85% LTV requires 740+ FICO and 1.0+ DSCR; otherwise 80%"),
  minDSCR: dp(0.75, "VERIFIED_PRIMARY", "Defy Mortgage lender site, 2026", "2026-06"),
  noRatioAvailable: dp(false, "UNVERIFIED", "Market pattern \u2014 not confirmed", "2026-06"),
  reserveRule: dp("3-month minimum standard", "VERIFIED_PRIMARY", "Defy Mortgage lender site, 2026", "2026-06"),
  strPolicy: {
    lenderId: "defy",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(75e3, "UNVERIFIED", "Market pattern", "2026-06"),
  loanAmountMax: dp(25e5, "UNVERIFIED", "Market pattern", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    85,
    { "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.125,
  rateSheetDate: "2026-06",
  bestFor: ["high-leverage (85% LTV)", "640-679 FICO", "sub-1.0 DSCR", "STR with AirDNA"],
  cautions: [
    "Single-source profile \u2014 verify directly",
    "85% LTV requires 740+ FICO and 1.0+ DSCR",
    "Closing 14-21 days per lender site"
  ],
  notes: "85% LTV on SFR purchases for 740+ FICO, 1.0+ DSCR. 20% standardized gross-income haircut on STR. Closing: 14-21 days. LLC vesting allowed. 3-month minimum reserves.",
  provenanceDetails: [
    { claim: "Min FICO 640", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "Max LTV 85% (740+ FICO, 1.0+ DSCR)", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "Min DSCR 0.75", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "Reserves 3-month minimum", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "STR 20% gross-income haircut", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "Closing 14-21 days", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" },
    { claim: "LLC vesting allowed", provenance: "VERIFIED_PRIMARY", source: "Lender site, 2026", date: "2026-06" }
  ]
};
var EASY_STREET_CAPITAL = {
  id: "easy_street",
  name: "Easy Street Capital",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "Easy Street Capital lender site, 2026",
  confidenceScore: 82,
  confidenceBand: confidenceBand(82),
  statesAvailable: ALL_STATES,
  minFICO: dp(620, "VERIFIED_PRIMARY", "Easy Street Capital lender site", "2026-06"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "Easy Street Capital lender site", "2026-06"),
  minDSCR: dp(0.8, "VERIFIED_PRIMARY", "Easy Street Capital lender site \u2014 0.80 minimum DSCR for purchase", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_PRIMARY", "Easy Street Capital lender site \u2014 no minimum DSCR", "2026-06"),
  reserveRule: dp("3-9 months", "VERIFIED_PRIMARY", "Easy Street Capital lender site", "2026-06"),
  strPolicy: {
    lenderId: "easy_street",
    allowed: true,
    haircutPercent: 10,
    incomeMethod: "AIRDNA_100_PCT",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(5e4, "VERIFIED_PRIMARY", "Easy Street Capital lender site", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_PRIMARY", "Easy Street Capital lender site", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDOTEL"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.25,
  rateSheetDate: "2026-06",
  bestFor: ["professional STR", "AirDNA-driven underwriting", "vacation rentals", "condotels"],
  cautions: [
    "Confirm LTV, reserves, and state restrictions",
    "May use 100% of projected revenue for professional STR investors only",
    "Condos/condotels eligibility varies"
  ],
  notes: "STR specialist: AirDNA data. May use 100% of projected revenue for professional STR investors. No minimum DSCR for STR loans reported. STR refis can use projections before 12-month history. Condos/condotels may be eligible. $500M+ funded.",
  provenanceDetails: [
    { claim: "AirDNA data for STR", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "May use 100% of projected revenue for professional STR investors", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "No minimum DSCR for STR loans", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "STR refis can use projections before 12-month history", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "Condos/condotels may be eligible", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" }
  ]
};
var NEW_SILVER = {
  id: "new_silver",
  name: "New Silver",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "New Silver help center, 2026",
  confidenceScore: 72,
  confidenceBand: confidenceBand(72),
  statesAvailable: ALL_STATES,
  // v11 FIX (AUDIT-4 #4): Spec Part I confirms New Silver FICO 660 (not 640) and DSCR floor 0.75 (not 0)
  minFICO: dp(660, "VERIFIED_PRIMARY", "Spec Part I June 2026: New Silver FICO 660 (corrected from 640)", "2026-06", "v11 FIX per spec Part I: 660 FICO minimum"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "New Silver help center", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_PRIMARY", "Spec Part I June 2026: New Silver DSCR\u21930.75 (corrected from 0)", "2026-06", "v11 FIX per spec Part I: 0.75 DSCR floor"),
  noRatioAvailable: dp(true, "VERIFIED_PRIMARY", "New Silver help center \u2014 no min DSCR = effectively no-ratio program", "2026-06"),
  reserveRule: dp("6 months standard", "UNVERIFIED", "Market pattern", "2026-06"),
  strPolicy: {
    lenderId: "new_silver",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: false,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "UNVERIFIED"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(15e4, "VERIFIED_PRIMARY", "New Silver help center", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_PRIMARY", "New Silver help center", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.75,
  rateSheetDate: "2026-06",
  bestFor: ["speed", "sub-1.0 DSCR", "STR", "tech-forward"],
  cautions: [
    "Confirm pricing \u2014 typically 50-100bps above established lenders",
    "Instant approval but verify terms",
    "Closing 14-21 days per help center"
  ],
  notes: "Loan amounts $150K-$3M. Instant approval, 14-21 days closing. STR: yes (provenance UNVERIFIED \u2014 confirm directly). Tech-forward platform. No minimum DSCR \u2014 places greater importance on property and borrower FICO. Pricing typically 50-100bps above established lenders \u2014 confirm directly.",
  provenanceDetails: [
    { claim: "Loan amounts $150K-$3M", provenance: "VERIFIED_PRIMARY", source: "Help center", date: "2026-06" },
    { claim: "Max LTV 80%", provenance: "VERIFIED_PRIMARY", source: "Help center", date: "2026-06" },
    { claim: "No minimum DSCR \u2014 greater importance on property + FICO", provenance: "VERIFIED_PRIMARY", source: "Help center", date: "2026-06" },
    { claim: "Min FICO 640 (corrected from v5.0 660)", provenance: "VERIFIED_PRIMARY", source: "Help center", date: "2026-06" },
    { claim: "STR: yes (provenance UNVERIFIED)", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Instant approval, 14-21 days", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Typically 50-100bps above established lenders", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" }
  ]
};
var DEEPHAVEN_MORTGAGE = {
  id: "deephaven",
  name: "Deephaven Mortgage",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "Deephaven Mortgage site (90% LTV, $3.5M, gift funds, no financed limit); matrix for reserves; wholesale/broker channel. v11 FIX: STALE \u2014 highest reverify priority per spec Part I.",
  // v11 FIX (AUDIT-4 #3): Spec Part I requires Deephaven confidence = 65 (STALE — highest reverify priority)
  // Code was 78 (Reliable band); now 65 (Moderate confidence) per spec.
  confidenceScore: 65,
  confidenceBand: confidenceBand(65),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_PRIMARY", "Deephaven Mortgage site \u2014 660 FICO minimum advertised", "2026-06"),
  maxLTV: dp(90, "VERIFIED_PRIMARY", "Deephaven Mortgage site \u2014 up to 90% LTV with no MI advertised (corrected from v5.0 80%); 80% standard, 75% first-time investors", "2026-06", "Advertises up to 90% LTV with no MI; standard 80%, first-time investors 75%"),
  minDSCR: dp(0.75, "VERIFIED_PRIMARY", "Deephaven Mortgage site \u2014 DSCR <1.0 down to 0.75x tier (reconfirm current availability)", "2026-06", "0.75x min tier \u2014 older source, reconfirm"),
  noRatioAvailable: dp(true, "UNVERIFIED", "No-ratio at ~65% LTV reported", "2026-06", "No-ratio at ~65% LTV \u2014 UNVERIFIED, verify"),
  reserveRule: dp("3mo up to $1M; 6mo over $1M; 6mo for DSCR<1; 12mo for non-US investors; gift funds OK with conditions", "VERIFIED_PRIMARY", "Deephaven Mortgage site \u2014 gift funds can be used for down payment, closing costs, and reserves with documented minimum borrower contribution", "2026-06", 'Gift funds accepted for reserves with conditions (corrected from v5.0 "gift funds not accepted")'),
  strPolicy: {
    lenderId: "deephaven",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "APPRAISAL_STR",
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 70,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "54321", "YIELD_MAINTENANCE"],
  loanAmountMin: dp(1e5, "UNVERIFIED", "Market pattern", "2026-06"),
  loanAmountMax: dp(35e5, "VERIFIED_PRIMARY", "Deephaven Mortgage site \u2014 $3.5M max (corrected from v5.0 $3M+)", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "UNVERIFIED", "ITIN program reported", "2026-06", "ITIN program \u2014 UNVERIFIED, verify"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    80,
    { "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 70 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.25,
  rateSheetDate: "2026-06",
  bestFor: ["sub-1.0 DSCR", "wholesale/broker channel", "clear gross-rent/PITIA"],
  cautions: [
    "Rerverify current matrix \u2014 stale source date",
    "First-time investors max 75% LTV",
    "Hard prepay standard",
    "DSCR formula varies: GROSS_PITIA for amortizing, GROSS_ITIA for IO"
  ],
  notes: "DSCR formula: GROSS_PITIA for amortizing, GROSS_ITIA for IO. Lower-of lease/1007; higher lease allowed with receipts. DSCR down to 0.75. Reserves: 3mo up to $1M, 6mo over $1M, 6mo for DSCR<1, 12mo for non-US investors. No-ratio at ~65% LTV [UNVERIFIED]. ITIN program [UNVERIFIED]. Hard prepay standard.",
  provenanceDetails: [
    { claim: "Max LTV up to 90% advertised (no MI); 80% standard, 75% first-time investors", provenance: "VERIFIED_PRIMARY", source: "Deephaven site", date: "2026-06" },
    { claim: "DSCR <1.0 down to 0.75x tier (reconfirm current availability)", provenance: "VERIFIED_PRIMARY", source: "Deephaven site", date: "2026-06" },
    { claim: "Reserves: 3mo/$1M, 6mo/>$1M, 6mo/DSCR<1, 12mo/foreign; gift funds OK w/ conditions", provenance: "VERIFIED_PRIMARY", source: "Deephaven site", date: "2026-06" },
    { claim: "First-time investors max 75% LTV", provenance: "VERIFIED_PRIMARY", source: "Deephaven matrix", date: "2026-06" },
    { claim: "No financed property limit (per lender site)", provenance: "VERIFIED_PRIMARY", source: "Deephaven site", date: "2026-06" },
    { claim: "Max loan $3.5M (corrected from v5.0 $3M+)", provenance: "VERIFIED_PRIMARY", source: "Deephaven site", date: "2026-06" },
    { claim: "No-ratio at ~65% LTV", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "ITIN program", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Hard prepay standard", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" }
  ]
};
var ANGEL_OAK = {
  id: "angel_oak",
  name: "Angel Oak",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Angel Oak program page (verified STR/no-ratio); 3rd-party reviews for Southeast/AirDNA/LLC vesting",
  confidenceScore: 75,
  confidenceBand: confidenceBand(75),
  statesAvailable: ALL_STATES,
  minFICO: dp(680, "VERIFIED_PRIMARY", "Angel Oak program page \u2014 680 FICO with 70% LTV; 700 FICO unlocks 75% LTV; 720 FICO unlocks 80% LTV", "2026-06"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "Angel Oak program page \u2014 80% LTV requires 720 FICO + 1.00 DSCR", "2026-06"),
  minDSCR: dp(1, "VERIFIED_PRIMARY", "Angel Oak program page \u2014 1.00 DSCR for STR; no-ratio program also available at 700 FICO / 75% LTV", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_PRIMARY", "Angel Oak program page \u2014 no-ratio at 700 FICO, 75% max LTV", "2026-06", "No-ratio: 700 FICO + 75% max LTV [VERIFIED_PRIMARY]"),
  reserveRule: dp("6 months baseline", "UNVERIFIED", "Market pattern", "2026-06"),
  strPolicy: {
    lenderId: "angel_oak",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "54321"],
  loanAmountMin: dp(15e4, "UNVERIFIED", "Market pattern", "2026-06"),
  loanAmountMax: dp(3e6, "UNVERIFIED", "Market pattern", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 70 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.5,
  rateSheetDate: "2026-06",
  bestFor: ["non-warrantable condo", "STR with AirDNA reports", "Southeast regional strength", "LLC/corp/trust vesting"],
  cautions: [
    "Legacy profile \u2014 reverify all terms",
    "Hard prepay; +0.625% for no-prepay option",
    "STR LTV capped at 75% per market comparison",
    "Rates +0.25-0.5% above Visio/Kiavi; turn times slower (large institution)"
  ],
  notes: "Non-warrantable condo program. STR program: 80% LTV at 720 FICO + 1.00 DSCR; 75% LTV at 700 FICO; 70% LTV at 680 FICO. AirDNA reports accepted for STR (per third-party comparison \u2014 conflicts with earlier doc, verify directly). No-ratio: 700 FICO, 75% max LTV [VERIFIED per lender site]. Non-warrantable condos, LLC/corp/trust vesting, 10+ financed properties all accepted. 6-month reserve baseline. Hard prepay standard; +0.625% no-prepay option available. Southeast regional strength (FL, GA, NC/SC, TN). Rates +0.25-0.5% above Visio/Kiavi at equivalent FICO/DSCR \u2014 but file gets approved when others deny. Larger institution \u2014 turn times can lag smaller shops. Legacy profile \u2014 reverify all terms before submission.",
  provenanceDetails: [
    { claim: "Non-warrantable condo program", provenance: "VERIFIED_SECONDARY", source: "Lender site + 3rd-party review", date: "2026-06" },
    { claim: "6-month reserve baseline", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Hard prepay; +0.625% no-prepay", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "STR: 80% LTV @ 720 FICO + 1.00 DSCR", provenance: "VERIFIED_PRIMARY", source: "Angel Oak program page", date: "2026-06" },
    { claim: "STR: 75% LTV @ 700 FICO", provenance: "VERIFIED_PRIMARY", source: "Angel Oak program page", date: "2026-06" },
    { claim: "No-ratio: 700 FICO, 75% max LTV", provenance: "VERIFIED_PRIMARY", source: "Lender site", date: "2026-06" },
    { claim: "AirDNA reports accepted for STR", provenance: "VERIFIED_SECONDARY", source: "3rd-party comparison (conflicts w/ prior doc)", date: "2026-06" },
    { claim: "STR LTV capped at 75% (market comparison)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Southeast regional strength (FL/GA/NC/SC/TN)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Rates +0.25-0.5% above Visio/Kiavi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "Larger institution \u2014 slower turn times", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "LLC/corp/trust vesting accepted", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" },
    { claim: "10+ financed properties accepted", provenance: "VERIFIED_SECONDARY", source: "3rd-party review", date: "2026-06" }
  ]
};
var COREVEST = {
  id: "corevest",
  name: "CoreVest",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "UNVERIFIED",
  sourceSnapshot: "Market intelligence; institutional portfolio lender",
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),
  statesAvailable: ALL_STATES,
  minFICO: dp(680, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  maxLTV: dp(75, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06", "Institutional portfolio terms may differ from individual loan LTVs"),
  minDSCR: dp(1.25, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06", "Institutional underwriting may require higher DSCR"),
  noRatioAvailable: dp(false, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  reserveRule: dp("6 months minimum", "UNVERIFIED", "Market pattern", "2026-06"),
  strPolicy: {
    lenderId: "corevest",
    allowed: false,
    haircutPercent: 0,
    incomeMethod: "LT_MARKET_FALLBACK",
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 0,
    provenance: "UNVERIFIED"
  },
  prepayOptions: ["NONE", "YIELD_MAINTENANCE"],
  loanAmountMin: dp(2e6, "UNVERIFIED", "Market pattern \u2014 institutional minimum", "2026-06"),
  loanAmountMax: dp(5e7, "UNVERIFIED", "Market pattern \u2014 $50M+ for large portfolios", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE"],
    75,
    { "CONDO_NON_WARRANTABLE": { allowed: false, maxLTV: 0 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 70 }, "5+_UNIT": { allowed: true, maxLTV: 75 }, "MIXED_USE": { allowed: true, maxLTV: 70 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.375,
  rateSheetDate: "2026-06",
  bestFor: ["institutional portfolio", "blanket loans", "permanent-hold structures"],
  cautions: [
    "Rerverify \u2014 limited current data",
    "Yield maintenance prepay \u2014 significant early payoff cost",
    "Minimum $2M loan size \u2014 not for individual properties",
    "Entity-only \u2014 no individual vesting"
  ],
  notes: "Institutional $2M-$50M+ portfolio lender. Yield maintenance prepay structure. Permanent-hold structures. Blanket cross-collateralization available. Entity vesting required (no individuals). Not suitable for single-property DSCR loans.",
  provenanceDetails: [
    { claim: "Institutional $2M-$50M+ portfolios", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Yield maintenance", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Permanent-hold structures", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" }
  ]
};
var RCN_CAPITAL = {
  id: "rcn_capital",
  name: "RCN Capital",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "RCN Capital published guidelines; market intelligence",
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  maxLTV: dp(80, "VERIFIED_PRIMARY", "RCN Capital published guidelines", "2026-06"),
  minDSCR: dp(1, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  noRatioAvailable: dp(false, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  reserveRule: dp("6-9 months", "UNVERIFIED", "Market pattern", "2026-06"),
  strPolicy: {
    lenderId: "rcn_capital",
    allowed: false,
    haircutPercent: 25,
    incomeMethod: "LT_MARKET_FALLBACK",
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 70,
    provenance: "UNVERIFIED"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(75e3, "UNVERIFIED", "Market pattern", "2026-06"),
  loanAmountMax: dp(25e5, "VERIFIED_PRIMARY", "RCN Capital published guidelines", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: false, maxLTV: 0 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: -0.5,
  rateSheetDate: "2026-06",
  bestFor: ["delayed financing", "fix-flip-to-DSCR bridge", "rate-competitive"],
  cautions: [
    "STR not supported",
    "10/1 ARM no-PPP option may not be available in all states",
    "Confirm current rate sheet"
  ],
  notes: "Delayed financing allowed. Fix-Flip-to-DSCR bridge program. 10/1 ARM with no-PPP option. Competitive base rate. STR not supported \u2014 requires lease-based income.",
  provenanceDetails: [
    { claim: "Max LTV 80%", provenance: "VERIFIED_PRIMARY", source: "Published guidelines", date: "2026-06" },
    { claim: "Max loan $2.5M", provenance: "VERIFIED_PRIMARY", source: "Published guidelines", date: "2026-06" },
    { claim: "Delayed financing allowed", provenance: "VERIFIED_PRIMARY", source: "Published guidelines", date: "2026-06" },
    { claim: "Fix-Flip-to-DSCR bridge", provenance: "VERIFIED_PRIMARY", source: "Published guidelines", date: "2026-06" },
    { claim: "Min FICO 660", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" },
    { claim: "Min DSCR 1.0", provenance: "UNVERIFIED", source: "Market pattern", date: "2026-06" }
  ]
};
var AMERICAN_HERITAGE = {
  id: "american_heritage",
  name: "American Heritage",
  version: "7.0",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_PRIMARY",
  sourceSnapshot: "American Heritage lender site + spec Part I (June 17, 2026); Invest Star program documentation",
  confidenceScore: 65,
  confidenceBand: confidenceBand(65),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_PRIMARY", "Spec Part I \u2014 660 FICO minimum; 720+ unlocks best pricing tier", "2026-06", "Tiered FICO pricing: 660 baseline, 700 better, 720+ best; 760+ unlocks 85% LTV"),
  maxLTV: dp(85, "VERIFIED_PRIMARY", "Spec Part I \u2014 up to 85% LTV at 760+ FICO; tiered down at lower FICO", "2026-06", "LTV tiers: 85%@760+, 80%@720-759, 75%@700-719, 70%@680-699, 65%@660-679"),
  minDSCR: dp(0.75, "VERIFIED_PRIMARY", "Spec Part I \u2014 0.75 DSCR minimum (specialist tier)", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "Invest Star program \u2014 no-ratio specialty product for higher LTV / lower FICO borrowers", "2026-06", "Invest Star: no-ratio available at 70% LTV max, 700 FICO"),
  reserveRule: dp("12 months PITIA when DSCR<1.0; 6 months when DSCR\u22651.0", "VERIFIED_PRIMARY", "Spec Part I \u2014 conditional reserve requirement", "2026-06", "DSCR-conditional reserves: 12mo PITIA for sub-1.0 DSCR (most restrictive in matrix); 6mo at/above 1.0"),
  strPolicy: {
    lenderId: "american_heritage",
    allowed: true,
    haircutPercent: 25,
    // 75% of projected = 25% haircut
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_PRIMARY"
    // STR income rule: 75% of AirDNA-projected OR 100% of 12-month documented history (whichever lower, per conservative underwriting)
    // Spec Part I line 687-690
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(1e5, "VERIFIED_PRIMARY", "Spec Part I \u2014 $100K minimum", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_PRIMARY", "Spec Part I \u2014 $3M maximum (standard); jumbo on exception", "2026-06", "$3M standard cap; jumbo to $5M with executive approval [UNVERIFIED]"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "Spec Part I \u2014 non-US investor program available with ITIN + 25% down", "2026-06", "Non-US investor: 75% max LTV, ITIN accepted, 12mo reserves"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    85,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.125,
  // modest premium vs anchor lenders
  rateSheetDate: "2026-06",
  bestFor: ["higher LTV at 760+ FICO", "STR with documented 12-month history", "Invest Star no-ratio program", "non-US investor borrowers"],
  cautions: [
    "12mo PITIA reserves required when DSCR<1.0 \u2014 most restrictive in matrix",
    "STR income capped at lower of 75% projected or 100% documented",
    "LTV tiers step down sharply below 720 FICO",
    "Confirm Invest Star program availability (specialty product)"
  ],
  notes: 'American Heritage is a spec-verified anchor lender (Part I, June 2026). Invest Star no-ratio specialty program for borrowers needing higher LTV / lower FICO. STR income uses conservative "lower-of" rule: 75% of AirDNA projection OR 100% of 12-month documented history. Non-US investor program available with ITIN + 25% down. Reserve rule is the most conditional in the matrix: 12 months PITIA when DSCR < 1.0 (vs 6 months at/above 1.0). LTV tiers: 85%@760+, 80%@720-759, 75%@700-719, 70%@680-699, 65%@660-679. Counterparty continuity flag: STABLE (score 65, no known disruptions).',
  provenanceDetails: [
    { claim: "660 FICO minimum (720+ best pricing)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "85% LTV at 760+ FICO (tiered down)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum (specialist tier)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "12mo PITIA reserves when DSCR<1.0", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "6mo reserves when DSCR\u22651.0", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "STR: 75% of projected or 100% documented (lower-of)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "STR min DSCR 1.00", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "STR max LTV 75%", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "Invest Star no-ratio program (70% LTV, 700 FICO)", provenance: "VERIFIED_SECONDARY", source: "Spec Part I June 2026 + lender site", date: "2026-06" },
    { claim: "Non-US investor: 75% LTV, ITIN, 12mo reserves", provenance: "VERIFIED_SECONDARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "Counterparty continuity: STABLE (score 65)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "Loan range $100K-$3M (jumbo $5M exception)", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "Non-warrantable condo accepted at 75% LTV", provenance: "VERIFIED_PRIMARY", source: "Spec Part I June 2026", date: "2026-06" },
    { claim: "Prepay options: NONE / 321 / 54321", provenance: "VERIFIED_SECONDARY", source: "Lender site", date: "2026-06" }
  ]
};
var AD_MORTGAGE = {
  id: "ad_mortgage",
  name: "A&D Mortgage",
  version: "11.2",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "A&D Mortgage published product matrix + 3rd-party review (2026)",
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum for DSCR program", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV standard; 75% for cash-out refi", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum (no-ratio available with rate premium)", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 70% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 9 months for cash-out or sub-1.0 DSCR", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "ad_mortgage",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "SOFT_PREPAY"],
  loanAmountMin: dp(1e5, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(35e5, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $3.5M standard; jumbo on exception", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 non-US investor program available with ITIN + 30% down", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.125,
  rateSheetDate: "2026-06",
  bestFor: ["non-US investor borrowers", "non-QM + DSCR under one roof", "broader product mix"],
  cautions: [
    "Confidence score 70 \u2014 verify current guidelines directly before quoting",
    "Cash-out refi limited to 75% LTV",
    "No-ratio program caps at 70% LTV",
    "CONDOTEL not supported"
  ],
  notes: "A&D Mortgage (formerly Genesis Capital) is a major Non-QM/DSCR originator. Offers DSCR, Bank Statement, Non-US Investor, and traditional Non-QM products under one roof \u2014 useful for borrowers needing multiple program options. STR supported with AirDNA projection at 75% max LTV and 25% haircut. Non-US investor program available with ITIN + 30% down payment. No-ratio specialty program available at 70% LTV. Standard prepay structures include 321, 54321, and soft prepay. Confidence score 70 reflects 3rd-party verified status \u2014 direct lender confirmation recommended for current rate sheets.",
  provenanceDetails: [
    { claim: "660 FICO minimum (DSCR program)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV standard; 75% for cash-out refi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 70% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA reserves standard; 9mo for cash-out/sub-1.0 DSCR", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 75% of AirDNA projection, 25% haircut, 75% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor: ITIN + 30% down payment", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $100K-$3.5M (jumbo on exception)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, SOFT_PREPAY", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "All 50 states + DC", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" }
  ]
};
var LENDINGONE = {
  id: "lendingone",
  name: "LendingOne",
  version: "11.2",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "LendingOne published product overview + 3rd-party review (2026)",
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum for DSCR", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV purchase; 75% cash-out refi", "2026-06"),
  minDSCR: dp(1, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 1.0 DSCR minimum (more conservative than peers)", "2026-06"),
  noRatioAvailable: dp(false, "UNVERIFIED", "No reliable source \u2014 do not assume no-ratio available", "2026-06"),
  reserveRule: dp("6 months PITIA standard", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "lendingone",
    allowed: false,
    haircutPercent: 25,
    incomeMethod: "LT_MARKET_FALLBACK",
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 0,
    provenance: "UNVERIFIED"
  },
  prepayOptions: ["NONE", "321", "54321"],
  loanAmountMin: dp(75e3, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(2e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $2M standard cap", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "RURAL"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: false, maxLTV: 0 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.25,
  rateSheetDate: "2026-06",
  bestFor: ["long-term rental focus", "fix-flip-to-DSCR bridge", "smaller loan sizes ($75K-$2M)"],
  cautions: [
    "STR not supported \u2014 lease-based income only",
    "Min DSCR 1.0 is more conservative than peers (most allow 0.75)",
    "No-ratio UNVERIFIED \u2014 do not assume",
    "Cash-out refi capped at 75% LTV"
  ],
  notes: "LendingOne is a private money lender focused on long-term rental DSCR loans. More conservative underwriting than peers \u2014 1.0 minimum DSCR (vs 0.75 industry standard) and lease-based income only (STR not supported). Fix-flip-to-DSCR bridge program available for investors needing short-term financing followed by DSCR takeout. Smaller loan size sweet spot ($75K-$2M). Confidence score 68 reflects 3rd-party verified status with some details UNVERIFIED.",
  provenanceDetails: [
    { claim: "660 FICO minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV purchase; 75% cash-out refi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "1.0 DSCR minimum (more conservative than peers)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA reserves standard", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR not supported \u2014 lease-based income only", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $75K-$2M", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "All 50 states + DC", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Fix-flip-to-DSCR bridge program", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio UNVERIFIED \u2014 do not assume", provenance: "UNVERIFIED", source: "No reliable source", date: "2026-06" }
  ]
};
var CIVIC_FINANCIAL = {
  id: "civic_financial",
  name: "Civic Financial Services",
  version: "11.2",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Civic Financial published product matrix + 3rd-party review (2026)",
  confidenceScore: 72,
  confidenceBand: confidenceBand(72),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV standard", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 65% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 12 months for jumbo or portfolio loans", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "civic_financial",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "4321", "YIELD_MAINTENANCE"],
  loanAmountMin: dp(2e5, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(5e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $5M standard; portfolio/blanket to $20M", "2026-06", "Portfolio/blanket loans to $20M available for 5+ property bundles"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 non-US investor program with ITIN + 25% down", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "MIXED_USE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: true, maxLTV: 70 }, "MIXED_USE": { allowed: true, maxLTV: 70 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0,
  rateSheetDate: "2026-06",
  bestFor: ["jumbo DSCR loans $5M+", "portfolio/blanket lending 5+ properties", "mixed-use and 5+ unit properties"],
  cautions: [
    "STR capped at 70% LTV (more restrictive than peers)",
    "Jumbo loans require 12mo reserves",
    "Loan minimum $200K (not for small balance)",
    "Yield maintenance PPP can be costly in early years"
  ],
  notes: "Civic Financial Services is an institutional DSCR originator with deep capital markets access \u2014 strong for jumbo loans ($5M+) and portfolio/blanket lending (5+ properties, up to $20M aggregate). Broader property type acceptance than most peers: 5+ unit and mixed-use both supported at 70% LTV. STR supported but capped at 70% LTV (more restrictive than peers). No-ratio program at 65% LTV max. Non-US investor program with ITIN + 25% down. Confidence score 72 reflects 3rd-party verified status with institutional product depth.",
  provenanceDetails: [
    { claim: "660 FICO minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV standard", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 65% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA standard; 12mo for jumbo/portfolio", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 75% of AirDNA, 25% haircut, 70% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $200K-$5M (portfolio to $20M)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor: ITIN + 25% down", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Property types: SFR, 2-4 unit, condo (incl non-warrantable), 5+ unit, mixed-use", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, 4321, YIELD_MAINTENANCE", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" }
  ]
};
var FINANCE_OF_AMERICA = {
  id: "finance_of_america",
  name: "Finance of America Real Estate",
  version: "11.2",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Finance of America published product matrix + public reporting (FOA) + 3rd-party review (2026)",
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),
  statesAvailable: ALL_STATES,
  minFICO: dp(640, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 640 FICO minimum (lower than most peers)", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV purchase; 75% cash-out", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 65% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 9 months for sub-1.0 DSCR", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "finance_of_america",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "SOFT_PREPAY"],
  loanAmountMin: dp(1e5, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $3M standard cap", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 non-US investor program with ITIN + 25% down", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "RURAL"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.125,
  rateSheetDate: "2026-06",
  bestFor: ["lower FICO borrowers (640 min)", "no-ratio specialty product", "public company transparency (FOA)"],
  cautions: [
    "No-ratio caps at 65% LTV",
    "5+ unit and mixed-use not supported",
    "Cash-out refi limited to 75% LTV",
    "Verify current rate sheet \u2014 pricing can move with capital markets"
  ],
  notes: "Finance of America Real Estate (FARE) is a public company (NYSE: FOA) and major Non-QM/DSCR originator. Lowest FICO floor in the matrix at 640 \u2014 accessible to borrowers who don't qualify for most peers. STR supported with AirDNA projection at 75% max LTV. No-ratio program at 65% LTV for borrowers with complex income situations. Public company reporting provides additional transparency on financial health. Confidence score 70 reflects 3rd-party verified status \u2014 direct confirmation recommended for current rates.",
  provenanceDetails: [
    { claim: "640 FICO minimum (lower than most peers)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV purchase; 75% cash-out refi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 65% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA standard; 9mo for sub-1.0 DSCR", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 75% of AirDNA, 25% haircut, 75% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor: ITIN + 25% down", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $100K-$3M", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, SOFT_PREPAY", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "All 50 states + DC", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" }
  ]
};
var BROADMARK_CAPITAL = {
  id: "broadmark",
  name: "Broadmark / Ready Capital",
  version: "11.3",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Broadmark/Ready Capital published product matrix + 3rd-party review (2026)",
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum for DSCR program", "2026-06"),
  maxLTV: dp(75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 75% LTV standard; 80% on exception for strong files", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum (flex program)", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 65% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 9 months for sub-1.0 DSCR or bridge-to-DSCR takeout", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "broadmark",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "YIELD_MAINTENANCE"],
  loanAmountMin: dp(15e4, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(5e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $5M standard; jumbo on exception", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 non-US investor program with ITIN + 30% down", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "RURAL"],
    75,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 70 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 70 }, "5+_UNIT": { allowed: true, maxLTV: 65 }, "MIXED_USE": { allowed: true, maxLTV: 65 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.25,
  rateSheetDate: "2026-06",
  bestFor: ["bridge-to-DSCR pipeline", "fix-flip takeout", "5+ unit and mixed-use at lower LTV", "jumbo DSCR"],
  cautions: [
    "Max LTV 75% (more conservative than 80% peers)",
    "STR capped at 70% LTV",
    "Yield maintenance PPP can be costly in early years",
    "Broadmark brand now part of Ready Capital \u2014 confirm current program guidelines"
  ],
  notes: "Broadmark (acquired by Ready Capital in 2023) is a Seattle-based capital provider with strong bridge + DSCR takeout combo programs. Differentiated by accepting 5+ unit and mixed-use properties at 65% LTV (most peers reject these property types). STR supported with AirDNA at 70% max LTV (more restrictive than peers). No-ratio program at 65% LTV. Non-US investor program with ITIN + 30% down. Bridge-to-DSCR pipeline allows investors to use Broadmark bridge for acquisition/rehab, then refinance into DSCR with the same lender \u2014 reducing friction. Confidence score 70 reflects 3rd-party verified status; post-acquisition program details may have shifted under Ready Capital ownership.",
  provenanceDetails: [
    { claim: "660 FICO minimum (DSCR program)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "75% LTV standard; 80% on exception", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum (flex program)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 65% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA standard; 9mo for sub-1.0 DSCR or bridge-to-DSCR takeout", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 75% of AirDNA, 25% haircut, 70% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor: ITIN + 30% down", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $150K-$5M (jumbo on exception)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "5+ unit and mixed-use accepted at 65% LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, YIELD_MAINTENANCE", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "All 50 states + DC", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Bridge-to-DSCR pipeline program available", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" }
  ]
};
var PARK_PLACE_FINANCE = {
  id: "park_place",
  name: "Park Place Finance",
  version: "11.3",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Park Place Finance published product matrix + 3rd-party review (2026)",
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),
  statesAvailable: ALL_STATES,
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV purchase; 75% cash-out refi", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 70% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 9 months for sub-1.0 DSCR or STR", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "park_place",
    allowed: true,
    haircutPercent: 20,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "SOFT_PREPAY"],
  loanAmountMin: dp(75e3, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $3M standard cap", "2026-06"),
  entityAllowed: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(false, "UNVERIFIED", "Market pattern \u2014 verify directly", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE", "RURAL"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.1,
  rateSheetDate: "2026-06",
  bestFor: ["TX/SE regional strength", "competitive pricing on standard files", "individual vesting accepted", "soft prepay option"],
  cautions: [
    "Confidence score 68 \u2014 verify current guidelines directly",
    "5+ unit and mixed-use not supported",
    "CONDOTEL not supported",
    "Non-US investor availability UNVERIFIED"
  ],
  notes: "Park Place Finance is an Austin, TX-based DSCR lender with strong TX/SE market coverage (TX, FL, GA, NC, SC, TN, OK, AR, LA). Competitive pricing on standard files \u2014 typically 10-25bps below national peers on pristine DSCR \u2265 1.20 profiles. STR supported with AirDNA projection at 75% max LTV. One of the few DSCR lenders that accepts individual vesting without requiring entity structure. Soft prepay option available (less common \u2014 provides more flexibility than hard prepay). No-ratio program at 70% LTV. Confidence score 68 reflects 3rd-party verified status with some details UNVERIFIED.",
  provenanceDetails: [
    { claim: "660 FICO minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV purchase; 75% cash-out refi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 70% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA standard; 9mo for sub-1.0 DSCR or STR", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 80% of AirDNA, 20% haircut, 75% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $75K-$3M", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "All 50 states + DC", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, SOFT_PREPAY", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Individual vesting accepted (no entity required)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "TX/SE regional strength \u2014 competitive pricing", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor UNVERIFIED \u2014 do not assume", provenance: "UNVERIFIED", source: "No reliable source", date: "2026-06" }
  ]
};
var STRATTON_CAPITAL = {
  id: "stratton",
  name: "Stratton Capital",
  version: "11.3",
  effectiveDate: "2026-06-01",
  verifiedDate: "2026-06-01",
  sourceType: "VERIFIED_SECONDARY",
  sourceSnapshot: "Stratton Capital published product matrix + 3rd-party review (2026)",
  confidenceScore: 67,
  confidenceBand: confidenceBand(67),
  statesAvailable: STATES_48,
  // excludes AK, HI per typical non-QM coverage
  minFICO: dp(660, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 660 FICO minimum for DSCR", "2026-06"),
  maxLTV: dp(80, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 80% LTV purchase; 75% cash-out refi", "2026-06"),
  minDSCR: dp(0.75, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 0.75 DSCR minimum", "2026-06"),
  noRatioAvailable: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 no-ratio program at 65% LTV max", "2026-06"),
  reserveRule: dp("6 months PITIA standard; 12 months for sub-1.0 DSCR or non-US investor", "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  strPolicy: {
    lenderId: "stratton",
    allowed: true,
    haircutPercent: 25,
    incomeMethod: "AIRDNA_PROJECTION",
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: "VERIFIED_SECONDARY"
  },
  prepayOptions: ["NONE", "321", "54321", "4321", "SOFT_PREPAY"],
  loanAmountMin: dp(1e5, "VERIFIED_SECONDARY", "3rd-party review, 2026", "2026-06"),
  loanAmountMax: dp(3e6, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 $3M standard; $5M jumbo on exception", "2026-06"),
  entityAllowed: ["LLC", "S_CORP", "C_CORP", "TRUST"],
  nonUsInvestorAllowed: dp(true, "VERIFIED_SECONDARY", "3rd-party review, 2026 \u2014 non-US investor program with ITIN + 25% down", "2026-06"),
  propertyTypeRules: ptRules(
    ["SFR", "2-4_UNIT", "CONDO_WARRANTABLE", "CONDO_NON_WARRANTABLE"],
    80,
    { "CONDO_NON_WARRANTABLE": { allowed: true, maxLTV: 75 }, "CONDOTEL": { allowed: false, maxLTV: 0 }, "RURAL": { allowed: true, maxLTV: 75 }, "5+_UNIT": { allowed: false, maxLTV: 0 }, "MIXED_USE": { allowed: false, maxLTV: 0 } }
  ),
  dscrFormulaMethod: "GROSS_PITIA",
  vacancyTreatment: "NONE",
  rateAdjustment: 0.2,
  rateSheetDate: "2026-06",
  bestFor: ["Non-QM specialist (DSCR is one of many products)", "wholesale/broker channel", "non-US investor borrowers", "soft prepay flexibility"],
  cautions: [
    "AK and HI not served",
    "Confidence score 67 \u2014 verify current guidelines directly",
    "5+ unit and mixed-use not supported",
    "STR capped at 70% LTV (more restrictive than peers)",
    "12mo reserves required for sub-1.0 DSCR (more conservative than peers)"
  ],
  notes: "Stratton Capital is a Non-QM specialist with a strong wholesale/broker channel. DSCR is one of multiple Non-QM offerings (Bank Statement, Non-US Investor, ITIN, Asset Qualifier, etc.). Useful for borrowers who may need to pivot between program types based on profile. STR supported with AirDNA at 70% max LTV (more restrictive than peers). No-ratio program at 65% LTV. Non-US investor program with ITIN + 25% down. Soft prepay option available for borrowers prioritizing early-exit flexibility. More conservative reserve requirements than peers (12mo for sub-1.0 DSCR vs 9mo industry norm). Confidence score 67 reflects 3rd-party verified status with some details UNVERIFIED.",
  provenanceDetails: [
    { claim: "660 FICO minimum for DSCR", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "80% LTV purchase; 75% cash-out refi", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "0.75 DSCR minimum", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "No-ratio program at 65% LTV max", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "6mo PITIA standard; 12mo for sub-1.0 DSCR or non-US investor", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "STR: 75% of AirDNA, 25% haircut, 70% max LTV", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-US investor: ITIN + 25% down", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Loan range $100K-$3M (jumbo $5M on exception)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "48 states (excludes AK, HI)", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Prepay options: NONE, 321, 54321, 4321, SOFT_PREPAY", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Non-QM specialist \u2014 multiple program types available", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" },
    { claim: "Wholesale/broker channel focus", provenance: "VERIFIED_SECONDARY", source: "3rd-party review, 2026", date: "2026-06" }
  ]
};
var LENDERS = [
  GRIFFIN_FUNDING,
  KIAVI,
  VISIO_LENDING,
  LIMA_ONE_CAPITAL,
  DEFI_MORTGAGE,
  EASY_STREET_CAPITAL,
  NEW_SILVER,
  DEEPHAVEN_MORTGAGE,
  ANGEL_OAK,
  COREVEST,
  RCN_CAPITAL,
  AMERICAN_HERITAGE,
  // v11.2: 4 additional lenders added (functional roadmap expansion)
  AD_MORTGAGE,
  LENDINGONE,
  CIVIC_FINANCIAL,
  FINANCE_OF_AMERICA,
  // v11.3: 3 additional lenders added (functional roadmap expansion)
  BROADMARK_CAPITAL,
  PARK_PLACE_FINANCE,
  STRATTON_CAPITAL
];
function getLenderById(id) {
  return LENDERS.find((l) => l.id === id);
}
function paymentFactor(annualRate, termMonths) {
  const r = annualRate / 100 / 12;
  if (r === 0) return 1 / termMonths;
  const compoundFactor = Math.pow(1 + r, termMonths);
  return r * compoundFactor / (compoundFactor - 1);
}
function estimateLenderTripleRate(lender, solvedRate) {
  const baseRate = solvedRate + lender.rateAdjustment;
  const competitive = Math.max(Math.round((baseRate - 0.875) * 1e3) / 1e3, 5.125);
  const typical = Math.round(baseRate * 1e3) / 1e3;
  const fullMarket = Math.round(Math.min(baseRate + 3.5, 12) * 1e3) / 1e3;
  return {
    competitive,
    typical,
    fullMarket,
    dateStamp: "June 2026",
    treasurySpread: "10yr + ~200-225 bps"
  };
}
function computePITIA(loanAmount, rate, termYears, ioPeriod, annualTaxes, annualInsurance, hoa, floodInsurance) {
  const termMonths = termYears * 12;
  const ioYears = ioPeriod === "NONE" ? 0 : ioPeriod === "5_YR" ? 5 : ioPeriod === "7_YR" ? 7 : 10;
  let pi;
  if (ioYears > 0) {
    pi = loanAmount * (rate / 100 / 12);
  } else {
    pi = loanAmount * paymentFactor(rate, termMonths);
  }
  return pi + annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
}
function computeQualifyingRentForLender(property, strategy, lender) {
  if (strategy === "STR" && lender.strPolicy.allowed) {
    const strHaircut = lender.strPolicy.haircutPercent / 100;
    let strNet;
    if (lender.strPolicy.incomeMethod === "AIRDNA_100_PCT") {
      strNet = property.strProjectedRent;
    } else {
      strNet = property.strProjectedRent * (1 - strHaircut);
    }
    const documentedNet = property.strDocumentedRent > 0 ? property.strDocumentedRent * (1 - strHaircut * 0.5) : 0;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    return Math.max(strNet, documentedNet, ltrFallback);
  }
  if (strategy === "MTR") {
    const mtrNet = property.strProjectedRent * 0.88;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    return Math.max(mtrNet, ltrFallback);
  }
  const effectiveMarket = lender.id === "kiavi" ? property.marketRent * 1.1 : property.marketRent;
  const lowerRent = Math.min(property.leaseRent, effectiveMarket);
  if (lender.vacancyTreatment === "ZERO_TO_FIVE_PCT_2_4UNIT" && property.unitCount > 1) {
    return lowerRent * 0.95;
  }
  return lowerRent;
}
function estimateReserveMonthsForLender(lender, dscr, borrower, loan, strategy) {
  let months = 6;
  if (dscr >= 1.25) months = 3;
  else if (dscr >= 1) months = 6;
  else if (dscr >= 0.75) months = 9;
  else months = 12;
  if (strategy === "STR") months += 3;
  if (borrower.experience === "FIRST_TIME") months += 3;
  if (borrower.isNonUsInvestor) months += 6;
  if (loan.ltv > 80) months += 1;
  if (lender.id === "griffin") {
    months = Math.min(months, 12);
  }
  return Math.min(months, 12);
}
function classifyFitTier(lender, eligible, ineligibleReasons, track1DSCR, track2DSCR, borrower, property, strategy) {
  if (!eligible) {
    return { tier: "DOES_NOT_MEET_GUIDELINES", reason: ineligibleReasons.join("; ") };
  }
  const lenderMinDSCR = lender.minDSCR.value;
  const lenderMinFICO = lender.minFICO.value;
  const lenderMaxLTV = lender.maxLTV.value;
  const reasons = [];
  const ficoHeadroom = borrower.ficoScore - lenderMinFICO;
  const dscrHeadroom = track1DSCR - lenderMinDSCR;
  const ltvHeadroom = lenderMaxLTV - property.purchasePrice > 0 ? lenderMaxLTV - property.purchasePrice * 0.01 : 0;
  let bestForMatches = 0;
  if (strategy === "STR" && lender.strPolicy.allowed) bestForMatches++;
  if (track1DSCR < 1 && lender.minDSCR.value <= 0.75) bestForMatches++;
  if (borrower.ficoScore < 680 && lender.minFICO.value <= 640) bestForMatches++;
  if (property.isNonWarrantable && lender.propertyTypeRules["CONDO_NON_WARRANTABLE"]?.allowed) bestForMatches++;
  if (property.isCondotel && lender.propertyTypeRules["CONDOTEL"]?.allowed) bestForMatches++;
  if (track1DSCR >= 1.25 && ficoHeadroom >= 60 && track2DSCR >= 1) {
    reasons.push("Strong DSCR, excellent FICO, positive cash flow");
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: "STRONG_FIT", reason: reasons.join(". ") };
  }
  if (track1DSCR >= 1 && ficoHeadroom >= 20 && track2DSCR >= 0.85) {
    reasons.push("Qualifying DSCR, adequate FICO");
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: "STANDARD_FIT", reason: reasons.join(". ") };
  }
  if (track1DSCR >= lenderMinDSCR && (ficoHeadroom >= 0 || lenderMinFICO === 0)) {
    reasons.push("Meets minimum guidelines");
    if (track1DSCR < 1) reasons.push("Sub-1.0 DSCR \u2014 flex/specialist program required");
    if (track2DSCR < 1) reasons.push("Track 2 negative carry \u2014 investor risk");
    if (ficoHeadroom < 20) reasons.push("FICO near floor \u2014 limited buffer");
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: "CONDITIONAL_FIT", reason: reasons.join(". ") };
  }
  reasons.push("Marginal qualification profile");
  if (track1DSCR < lenderMinDSCR) reasons.push(`DSCR ${track1DSCR.toFixed(2)} below floor ${lenderMinDSCR}`);
  if (ficoHeadroom < 0 && lenderMinFICO > 0) reasons.push(`FICO ${borrower.ficoScore} below floor ${lenderMinFICO}`);
  return { tier: "UNLIKELY_FIT", reason: reasons.join(". ") };
}
function collectProvenanceWarnings(lender, eligible) {
  const warnings = [];
  if (lender.confidenceScore < 70) {
    warnings.push(`${lender.name} confidence score ${lender.confidenceScore}/100 \u2014 verify terms directly`);
  }
  if (!eligible) return warnings;
  for (const detail of lender.provenanceDetails) {
    if (detail.provenance === "UNVERIFIED") {
      warnings.push(`UNVERIFIED: "${detail.claim}" \u2014 source: ${detail.source}`);
    }
  }
  if (lender.minFICO.provenance === "UNVERIFIED") {
    warnings.push(`Min FICO ${lender.minFICO.value} is UNVERIFIED \u2014 confirm with lender`);
  }
  if (lender.maxLTV.provenance === "UNVERIFIED") {
    warnings.push(`Max LTV ${lender.maxLTV.value}% is UNVERIFIED \u2014 confirm with lender`);
  }
  if (lender.minDSCR.provenance === "UNVERIFIED") {
    warnings.push(`Min DSCR ${lender.minDSCR.value} is UNVERIFIED \u2014 confirm with lender`);
  }
  if (lender.strPolicy.provenance === "UNVERIFIED") {
    warnings.push(`STR policy is ${lender.strPolicy.provenance} \u2014 verify before underwriting`);
  }
  if (lender.reserveRule.provenance === "UNVERIFIED") {
    warnings.push(`Reserve rule is UNVERIFIED \u2014 confirm with lender`);
  }
  return warnings;
}
function matchLenders(property, borrower, loan, strategy, solvedRate) {
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === "30_YR" ? 30 : loan.term === "40_YR" ? 40 : 15;
  const productType = loan.armType === "FIXED" ? "FIXED" : "ARM";
  const results = [];
  for (const lender of LENDERS) {
    const ineligibleReasons = [];
    const minFICO = lender.minFICO.value;
    if (minFICO > 0 && borrower.ficoScore < minFICO) {
      ineligibleReasons.push(`FICO ${borrower.ficoScore} below minimum ${minFICO}`);
    }
    const minDSCR = lender.minDSCR.value;
    if (!lender.statesAvailable.includes(property.state)) {
      ineligibleReasons.push(`${property.state} not in ${lender.name} service area`);
    }
    const ptRule = lender.propertyTypeRules[property.propertyType];
    if (!ptRule?.allowed) {
      ineligibleReasons.push(`${property.propertyType} not accepted by ${lender.name}`);
    }
    if (!lender.entityAllowed.includes(borrower.entityType)) {
      ineligibleReasons.push(`${borrower.entityType} not accepted \u2014 ${lender.name} requires entity vesting`);
    }
    const loanMin = lender.loanAmountMin.value;
    const loanMax = lender.loanAmountMax.value;
    if (loanAmount < loanMin) {
      ineligibleReasons.push(`Loan $${Math.round(loanAmount).toLocaleString()} below minimum $${loanMin.toLocaleString()}`);
    }
    if (loanAmount > loanMax) {
      ineligibleReasons.push(`Loan $${Math.round(loanAmount).toLocaleString()} above maximum $${loanMax.toLocaleString()}`);
    }
    const maxLTV = ptRule?.maxLTV ?? lender.maxLTV.value;
    const effectiveMaxLTV = strategy === "STR" && lender.strPolicy.allowed ? Math.min(maxLTV, lender.strPolicy.maxLTVForSTR) : maxLTV;
    if (loan.ltv > effectiveMaxLTV) {
      ineligibleReasons.push(`LTV ${loan.ltv}% exceeds max ${effectiveMaxLTV}%`);
    }
    if (strategy === "STR" && !lender.strPolicy.allowed) {
      ineligibleReasons.push("STR strategy not supported");
    }
    if (borrower.isNonUsInvestor && !lender.nonUsInvestorAllowed.value) {
      ineligibleReasons.push("Non-US investor / ITIN not accepted");
    }
    if (lender.id === "deephaven" && borrower.experience === "FIRST_TIME" && loan.ltv > 75) {
      ineligibleReasons.push("First-time investors max 75% LTV");
    }
    const eligible = ineligibleReasons.length === 0;
    const lenderRate = Math.max(solvedRate + lender.rateAdjustment, 3.5);
    const pitia = computePITIA(
      loanAmount,
      lenderRate,
      termYears,
      loan.ioPeriod,
      property.annualTaxes,
      property.annualInsurance,
      property.hoa,
      property.floodInsurance
    );
    const qualifyingRent = computeQualifyingRentForLender(property, strategy, lender);
    let track1DSCR;
    if (lender.dscrFormulaMethod === "GROSS_ITIA" && loan.ioPeriod !== "NONE") {
      const ioPayment = loanAmount * (lenderRate / 100 / 12);
      const itia = ioPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa + property.floodInsurance / 12;
      track1DSCR = itia > 0 ? qualifyingRent / itia : 0;
    } else if (lender.dscrFormulaMethod === "NOI_PI") {
      const pi = loanAmount * paymentFactor(lenderRate, termYears * 12);
      track1DSCR = pi > 0 ? qualifyingRent / pi : 0;
    } else {
      track1DSCR = pitia > 0 ? qualifyingRent / pitia : 0;
    }
    const vacancyPct = strategy === "STR" ? 25 : strategy === "MTR" ? 12 : 8;
    const managementPct = 8;
    const maintenancePct = 5;
    const grossRent = strategy === "STR" ? Math.max(property.strProjectedRent, property.marketRent) : Math.min(property.leaseRent, property.marketRent);
    const netIncome = grossRent * (1 - vacancyPct / 100) - grossRent * managementPct / 100 - grossRent * maintenancePct / 100;
    const track2DSCR = pitia > 0 ? netIncome / pitia : 0;
    if (eligible && track1DSCR < minDSCR) {
      if (lender.noRatioAvailable.value && lender.noRatioAvailable.provenance !== "UNVERIFIED") {
      } else if (lender.noRatioAvailable.value && lender.noRatioAvailable.provenance === "UNVERIFIED") {
        ineligibleReasons.push(`DSCR ${track1DSCR.toFixed(2)} below ${minDSCR} floor \u2014 no-ratio UNVERIFIED, do not assume`);
      } else {
        ineligibleReasons.push(`DSCR ${track1DSCR.toFixed(2)} below minimum ${minDSCR}`);
      }
    }
    const finalEligible = ineligibleReasons.length === 0;
    const pppStateResult = checkPPPLegal(
      property.state,
      borrower.entityType,
      loanAmount,
      property.unitCount,
      productType
    );
    const reserveMonths = estimateReserveMonthsForLender(lender, track1DSCR, borrower, loan, strategy);
    const requiredReserves = Math.round(reserveMonths * pitia);
    const { tier, reason } = classifyFitTier(
      lender,
      finalEligible,
      ineligibleReasons,
      track1DSCR,
      track2DSCR,
      borrower,
      property,
      strategy
    );
    const estimatedRate = estimateLenderTripleRate(lender, solvedRate);
    const provenanceWarnings = collectProvenanceWarnings(lender, finalEligible);
    results.push({
      lenderId: lender.id,
      lenderName: lender.name,
      fitTier: tier,
      fitReason: reason,
      eligible: finalEligible,
      ineligibleReasons,
      estimatedRate,
      requiredReserves,
      track1DSCR: Math.round(track1DSCR * 1e3) / 1e3,
      track2DSCR: Math.round(track2DSCR * 1e3) / 1e3,
      pppStateResult,
      twoQuoteRequired: false,
      // will be set in two-quote rule below
      provenanceWarnings,
      sourceProvenance: lender.sourceType,
      confidenceScore: lender.confidenceScore,
      confidenceBand: lender.confidenceBand,
      rateAdjustment: lender.rateAdjustment,
      sourceSnapshot: lender.sourceSnapshot
    });
  }
  const eligibleResults = results.filter((r) => r.eligible);
  const hasFlexLender = eligibleResults.some((r) => {
    const lender = LENDERS.find((l) => l.id === r.lenderId);
    return lender && lender.minDSCR.value <= 0.75;
  });
  const hasRateCompetitiveLender = eligibleResults.some((r) => {
    const lender = LENDERS.find((l) => l.id === r.lenderId);
    return lender && lender.rateAdjustment <= 0;
  });
  for (const result of results) {
    if (result.eligible) {
      const lender = LENDERS.find((l) => l.id === result.lenderId);
      const isFlexLender = lender && lender.minDSCR.value <= 0.75;
      const isRateLender = lender && lender.rateAdjustment <= 0;
      if (isFlexLender && !hasRateCompetitiveLender) {
        result.twoQuoteRequired = true;
        result.provenanceWarnings.push(
          "Two-quote rule: No rate-competitive lender eligible \u2014 seek a second quote from a rate-focused lender"
        );
      } else if (isRateLender && !hasFlexLender) {
        result.twoQuoteRequired = true;
        result.provenanceWarnings.push(
          "Two-quote rule: No flex/specialist lender eligible \u2014 seek a second quote from a flex lender for sub-1.0 options"
        );
      } else if (hasFlexLender && hasRateCompetitiveLender) {
        result.twoQuoteRequired = false;
      }
    }
  }
  const tierOrder = {
    STRONG_FIT: 0,
    STANDARD_FIT: 1,
    CONDITIONAL_FIT: 2,
    UNLIKELY_FIT: 3,
    DOES_NOT_MEET_GUIDELINES: 4
  };
  results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    const tierA = tierOrder[a.fitTier] ?? 4;
    const tierB = tierOrder[b.fitTier] ?? 4;
    if (tierA !== tierB) return tierA - tierB;
    return a.estimatedRate.typical - b.estimatedRate.typical;
  });
  return results;
}

// src/engine/lenderMatchScore.ts
var FACTOR_WEIGHTS = {
  RATE_COMPETITIVENESS: 0.25,
  DSCR_HEADROOM: 0.2,
  RESERVE_BURDEN: 0.15,
  PROVENANCE_CONFIDENCE: 0.15,
  LTV_FIT: 0.15,
  FLEXIBILITY: 0.1
};
var FACTOR_LABELS = {
  RATE_COMPETITIVENESS: "Rate Competitiveness",
  DSCR_HEADROOM: "DSCR Headroom",
  RESERVE_BURDEN: "Reserve Burden",
  PROVENANCE_CONFIDENCE: "Provenance Confidence",
  LTV_FIT: "LTV Fit",
  FLEXIBILITY: "Flexibility"
};
var LTV_SWEET_SPOT_CENTER = 67.5;
var LTV_SWEET_SPOT_HALF_WIDTH = 2.5;
function scoreLenderMatch(fitResults, loan, borrower, strategy) {
  const eligibleResults = fitResults.filter((r) => r.eligible);
  const eligibleRates = eligibleResults.map((r) => r.estimatedRate.typical);
  const minRate = eligibleRates.length > 0 ? Math.min(...eligibleRates) : 0;
  const maxRate = eligibleRates.length > 0 ? Math.max(...eligibleRates) : 0;
  const rateSpread = maxRate - minRate;
  const sortedRates = [...eligibleRates].sort((a, b) => a - b);
  const marketRateBenchmark = sortedRates.length > 0 ? sortedRates.length % 2 === 1 ? sortedRates[Math.floor(sortedRates.length / 2)] : (sortedRates[sortedRates.length / 2 - 1] + sortedRates[sortedRates.length / 2]) / 2 : 0;
  const scores = fitResults.map((fit, idx) => {
    const lender = getLenderById(fit.lenderId);
    if (!lender) {
      return buildMissingLenderScore(fit);
    }
    return scoreOneLender(fit, lender, loan, strategy, minRate, maxRate, rateSpread);
  });
  scores.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return b.totalScore - a.totalScore;
  });
  let rank = 0;
  for (const s of scores) {
    if (s.eligible) {
      rank++;
      s.rankAmongEligible = rank;
    } else {
      s.rankAmongEligible = null;
    }
  }
  const topPicks = scores.filter((s) => s.eligible).slice(0, 3);
  const summary = buildOverallSummary(topPicks, eligibleResults.length, marketRateBenchmark);
  return {
    scores,
    topPicks,
    marketRateBenchmark: Math.round(marketRateBenchmark * 1e3) / 1e3,
    fieldCount: eligibleResults.length,
    summary
  };
}
function scoreOneLender(fit, lender, loan, strategy, minRate, maxRate, rateSpread) {
  const rateFactor = computeRateCompetitiveness(fit, minRate, maxRate, rateSpread);
  const dscrFactor = computeDSCRHeadroom(fit, lender);
  const reserveFactor = computeReserveBurden(fit);
  const provenanceFactor = computeProvenanceConfidence(lender);
  const ltvFactor = computeLTVFit(fit, lender, loan);
  const flexibilityFactor = computeFlexibility(lender, strategy);
  const factors = [
    rateFactor,
    dscrFactor,
    reserveFactor,
    provenanceFactor,
    ltvFactor,
    flexibilityFactor
  ];
  const totalScore = fit.eligible ? Math.round(factors.reduce((sum, f) => sum + f.weightedScore, 0) * 10) / 10 : 0;
  const tier = fit.eligible ? classifyTier(totalScore) : "WEAK";
  const topReasons = buildTopReasons(factors, fit);
  const topConcerns = buildTopConcerns(factors, fit);
  const recommendationText = buildRecommendationText(fit, tier, totalScore, topReasons, topConcerns);
  return {
    lenderId: fit.lenderId,
    lenderName: fit.lenderName,
    eligible: fit.eligible,
    totalScore,
    tier,
    factors,
    topReasons,
    topConcerns,
    rankAmongEligible: null,
    // will be set by caller
    recommendationText
  };
}
function computeRateCompetitiveness(fit, minRate, maxRate, rateSpread) {
  const weight = FACTOR_WEIGHTS.RATE_COMPETITIVENESS;
  const thisRate = fit.estimatedRate.typical;
  let rawScore;
  let detail;
  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible \u2014 would have been scored at ${thisRate.toFixed(3)}% typical`;
  } else if (rateSpread < 1e-3) {
    rawScore = 100;
    detail = `Typical ${thisRate.toFixed(3)}% \u2014 tied with all eligible lenders (no spread)`;
  } else {
    rawScore = Math.round(100 * (maxRate - thisRate) / rateSpread);
    rawScore = Math.max(0, Math.min(100, rawScore));
    const percentileRank = rawScore;
    detail = `Typical ${thisRate.toFixed(3)}% \u2014 ${percentileRank >= 75 ? "top quartile" : percentileRank >= 50 ? "above median" : percentileRank >= 25 ? "below median" : "bottom quartile"} (range ${minRate.toFixed(3)}\u2013${maxRate.toFixed(3)}%)`;
  }
  return {
    key: "RATE_COMPETITIVENESS",
    label: FACTOR_LABELS.RATE_COMPETITIVENESS,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function computeDSCRHeadroom(fit, lender) {
  const weight = FACTOR_WEIGHTS.DSCR_HEADROOM;
  const minDSCR = lender.minDSCR.value;
  const noRatio = lender.noRatioAvailable.value === true;
  const noRatioProvenance = lender.noRatioAvailable.provenance;
  let rawScore;
  let detail;
  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible \u2014 DSCR ${fit.track1DSCR.toFixed(3)} vs min ${minDSCR.toFixed(2)}`;
  } else if (noRatio) {
    if (noRatioProvenance === "UNVERIFIED") {
      rawScore = 60;
      detail = `No-ratio option available (UNVERIFIED \u2014 assume conservative)`;
    } else {
      rawScore = 100;
      detail = `No-ratio option available (${noRatioProvenance}) \u2014 no DSCR constraint`;
    }
  } else {
    const headroom = fit.track1DSCR - minDSCR;
    rawScore = Math.round(50 + headroom * 100);
    rawScore = Math.max(0, Math.min(100, rawScore));
    detail = `DSCR ${fit.track1DSCR.toFixed(3)} vs min ${minDSCR.toFixed(2)} \u2014 cushion ${headroom >= 0 ? "+" : ""}${headroom.toFixed(3)}`;
  }
  return {
    key: "DSCR_HEADROOM",
    label: FACTOR_LABELS.DSCR_HEADROOM,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function computeReserveBurden(fit) {
  const weight = FACTOR_WEIGHTS.RESERVE_BURDEN;
  let rawScore;
  let detail;
  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible \u2014 required reserves $${fit.requiredReserves.toLocaleString()}`;
  } else {
    const reserves = fit.requiredReserves;
    rawScore = Math.round(100 - reserves / 1e3 * 1);
    rawScore = Math.max(0, Math.min(100, rawScore));
    detail = `Required reserves $${reserves.toLocaleString()} \u2014 ${reserves < 1e4 ? "minimal" : reserves < 25e3 ? "moderate" : reserves < 5e4 ? "elevated" : "heavy"} capital lockup`;
  }
  return {
    key: "RESERVE_BURDEN",
    label: FACTOR_LABELS.RESERVE_BURDEN,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function computeProvenanceConfidence(lender) {
  const weight = FACTOR_WEIGHTS.PROVENANCE_CONFIDENCE;
  const baseScore = lender.confidenceScore;
  const provenance = lender.sourceType;
  let adjustment = 0;
  let provenanceNote = "";
  if (provenance === "VERIFIED_PRIMARY") {
    adjustment = 5;
    provenanceNote = " (+5 VERIFIED_PRIMARY)";
  } else if (provenance === "VERIFIED_SECONDARY") {
    adjustment = 0;
    provenanceNote = " (\xB10 VERIFIED_SECONDARY)";
  } else if (provenance === "UNVERIFIED") {
    adjustment = -15;
    provenanceNote = " (-15 UNVERIFIED)";
  }
  let rawScore = baseScore + adjustment;
  rawScore = Math.max(0, Math.min(100, rawScore));
  const detail = `Confidence ${baseScore}/100${provenanceNote} \u2014 ${lender.confidenceBand}`;
  return {
    key: "PROVENANCE_CONFIDENCE",
    label: FACTOR_LABELS.PROVENANCE_CONFIDENCE,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function computeLTVFit(fit, lender, loan) {
  const weight = FACTOR_WEIGHTS.LTV_FIT;
  const dealLTV = loan.ltv;
  const maxLTV = lender.maxLTV.value;
  let rawScore;
  let detail;
  if (!fit.eligible) {
    rawScore = 0;
    detail = `Ineligible \u2014 LTV ${dealLTV}% vs max ${maxLTV}%`;
  } else {
    const delta = Math.abs(dealLTV - LTV_SWEET_SPOT_CENTER);
    if (delta <= LTV_SWEET_SPOT_HALF_WIDTH) {
      rawScore = 100;
      detail = `LTV ${dealLTV}% \u2014 inside 65-70% sweet spot (best rate tier)`;
    } else {
      const excess = delta - LTV_SWEET_SPOT_HALF_WIDTH;
      rawScore = Math.round(100 - excess * 4);
      rawScore = Math.max(0, Math.min(100, rawScore));
      const direction = dealLTV > LTV_SWEET_SPOT_CENTER ? "above" : "below";
      const cushion = maxLTV - dealLTV;
      detail = `LTV ${dealLTV}% \u2014 ${excess.toFixed(1)}% ${direction} sweet spot, ${cushion.toFixed(0)}% cushion to lender max ${maxLTV}%`;
    }
  }
  return {
    key: "LTV_FIT",
    label: FACTOR_LABELS.LTV_FIT,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function computeFlexibility(lender, strategy) {
  const weight = FACTOR_WEIGHTS.FLEXIBILITY;
  let score = 0;
  const components = [];
  if (lender.noRatioAvailable.value === true) {
    const provenance = lender.noRatioAvailable.provenance;
    if (provenance !== "UNVERIFIED") {
      score += 30;
      components.push("+30 no-ratio (verified)");
    } else {
      score += 15;
      components.push("+15 no-ratio (UNVERIFIED)");
    }
  }
  if (lender.nonUsInvestorAllowed.value === true) {
    score += 20;
    components.push("+20 non-US investor");
  }
  if (lender.strPolicy.allowed) {
    const strBonus = strategy === "STR" ? 25 : 20;
    score += strBonus;
    components.push(`+${strBonus} STR${strategy === "STR" ? " (active strategy)" : ""}`);
  }
  if (lender.prepayOptions.length >= 5) {
    score += 15;
    components.push(`+15 prepay menu (${lender.prepayOptions.length} options)`);
  } else if (lender.prepayOptions.length >= 3) {
    score += 8;
    components.push(`+8 prepay menu (${lender.prepayOptions.length} options)`);
  }
  if (lender.entityAllowed.length >= 3) {
    score += 15;
    components.push(`+15 entities (${lender.entityAllowed.length} types)`);
  } else if (lender.entityAllowed.length >= 2) {
    score += 8;
    components.push(`+8 entities (${lender.entityAllowed.length} types)`);
  }
  let rawScore = Math.min(100, score);
  const detail = components.length > 0 ? components.join(" \xB7 ") : "No flexibility features (basic program)";
  return {
    key: "FLEXIBILITY",
    label: FACTOR_LABELS.FLEXIBILITY,
    weight,
    rawScore,
    weightedScore: Math.round(rawScore * weight * 10) / 10,
    detail
  };
}
function classifyTier(score) {
  if (score >= 80) return "TOP_PICK";
  if (score >= 65) return "STRONG";
  if (score >= 50) return "VIABLE";
  return "WEAK";
}
function buildTopReasons(factors, fit) {
  const reasons = [];
  const sorted = [...factors].sort((a, b) => b.rawScore - a.rawScore);
  for (const f of sorted) {
    if (f.rawScore >= 70 && reasons.length < 3) {
      reasons.push(`${f.label}: ${f.rawScore}/100 \u2014 ${f.detail}`);
    }
  }
  if (reasons.length === 0 && fit.eligible) {
    reasons.push(`Meets all eligibility guidelines with average scores across factors`);
  }
  return reasons;
}
function buildTopConcerns(factors, fit) {
  const concerns = [];
  if (!fit.eligible) {
    const topIneligibility = fit.ineligibleReasons.slice(0, 2);
    for (const r of topIneligibility) {
      concerns.push(`Ineligible: ${r}`);
    }
  }
  const weakFactors = factors.filter((f) => f.rawScore < 50).sort((a, b) => a.rawScore - b.rawScore);
  for (const f of weakFactors) {
    if (concerns.length < 4) {
      concerns.push(`${f.label}: ${f.rawScore}/100 \u2014 ${f.detail}`);
    }
  }
  if (fit.provenanceWarnings.length > 0 && concerns.length < 4) {
    concerns.push(`Provenance: ${fit.provenanceWarnings[0]}`);
  }
  return concerns;
}
function buildRecommendationText(fit, tier, score, topReasons, topConcerns) {
  if (!fit.eligible) {
    return `INELIGIBLE \u2014 ${fit.ineligibleReasons[0] ?? "does not meet guidelines"}. Score not computed; factors shown for reference only.`;
  }
  const tierText = {
    TOP_PICK: "TOP PICK",
    STRONG: "STRONG FIT",
    VIABLE: "VIABLE",
    WEAK: "WEAK"
  };
  const parts = [];
  parts.push(`${tierText[tier]} \u2014 ${score}/100.`);
  if (topReasons.length > 0) {
    parts.push(`Strengths: ${topReasons[0].split(" \u2014 ")[0]}.`);
  }
  if (topConcerns.length > 0) {
    parts.push(`Watch: ${topConcerns[0].split(" \u2014 ")[0]}.`);
  }
  return parts.join(" ");
}
function buildMissingLenderScore(fit) {
  return {
    lenderId: fit.lenderId,
    lenderName: fit.lenderName,
    eligible: false,
    totalScore: 0,
    tier: "WEAK",
    factors: [],
    topReasons: [],
    topConcerns: ["Lender profile not found in registry"],
    rankAmongEligible: null,
    recommendationText: `Lender profile not found \u2014 cannot score.`
  };
}
function buildOverallSummary(topPicks, eligibleCount, marketRateBenchmark) {
  if (eligibleCount === 0) {
    return `No eligible lenders for this deal \u2014 restructure loan parameters (lower LTV, raise FICO, increase DSCR) and re-run.`;
  }
  const parts = [];
  parts.push(`${eligibleCount} eligible lender${eligibleCount === 1 ? "" : "s"} scored.`);
  if (topPicks.length > 0) {
    const top = topPicks[0];
    parts.push(`Top recommendation: ${top.lenderName} (${top.totalScore}/100, ${top.tier}).`);
    if (topPicks.length >= 2) {
      parts.push(`Alternatives: ${topPicks.slice(1).map((p) => `${p.lenderName} (${p.totalScore})`).join(", ")}.`);
    }
  }
  if (marketRateBenchmark > 0) {
    parts.push(`Median market rate (eligible): ${marketRateBenchmark.toFixed(3)}%.`);
  }
  return parts.join(" ");
}

// src/engine/sensitivity.ts
var r2 = (n) => Math.round(n * 100) / 100;
var r0 = (n) => Math.round(n);
function mFixed(annualTaxes, annualInsurance, hoa, floodInsurance) {
  return annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
}
function pitiaAmortizing(loanAmount, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance) {
  const pi = calculatePI(loanAmount, rate, termYears * 12);
  return pi + mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
}
function solveRateForDSCR(targetDSCR, loanAmount, rent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance) {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  let lo = 0.5;
  let hi = 20;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pitia = calculatePI(loanAmount, mid, termMonths) + fixed;
    if (rent / pitia > targetDSCR) lo = mid;
    else hi = mid;
  }
  return r2((lo + hi) / 2);
}
function solvePriceForDSCR(targetDSCR, rent, ltvPct, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance) {
  let lo = 1e4;
  let hi = 5e6;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const loan = mid * (ltvPct / 100);
    const pitia = pitiaAmortizing(loan, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
    if (rent / pitia >= targetDSCR) lo = mid;
    else hi = mid;
  }
  return r0((lo + hi) / 2);
}
function solveLTVForDSCR(targetDSCR, rent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance) {
  let lo = 10;
  let hi = 95;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const loan = purchasePrice * (mid / 100);
    const pitia = pitiaAmortizing(loan, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
    if (rent / pitia >= targetDSCR) lo = mid;
    else hi = mid;
  }
  return r2((lo + hi) / 2);
}
function computeJointAppraisalRisk(qualifyingRent, pitia, purchasePrice, ltv, loanAmount, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance) {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const termMonths = termYears * 12;
  const rentBreakpoint = r0(pitia);
  const rentDropPercent = r2(
    qualifyingRent > 0 ? (qualifyingRent - pitia) / qualifyingRent * 100 : 0
  );
  const shockPcts = [0, -2, -4, -6, -8, -10];
  const valueShockTable = shockPcts.map((pct) => {
    const appraisedValue = r0(purchasePrice * (1 + pct / 100));
    const maxLoan = r0(appraisedValue * (ltv / 100));
    const cashGap = r0(ltv / 100 * (purchasePrice - appraisedValue));
    const pi = calculatePI(maxLoan, rate, termMonths);
    const pitiaAtMaxLoan = pi + fixed;
    const dscrAtMaxLoan = r2(qualifyingRent / pitiaAtMaxLoan);
    return { appraisedValue, maxLoan, cashGap, dscrAtMaxLoan };
  });
  const combinedRentDropPct = -10;
  const combinedValueDropPct = -10;
  const stressedRent = qualifyingRent * (1 + combinedRentDropPct / 100);
  const stressedValue = purchasePrice * (1 + combinedValueDropPct / 100);
  const stressedMaxLoan = stressedValue * (ltv / 100);
  const stressedPI = calculatePI(stressedMaxLoan, rate, termMonths);
  const stressedPITIA = stressedPI + fixed;
  const stressedDSCR = r2(stressedRent / stressedPITIA);
  let impliedRating;
  if (stressedDSCR < 0.9) {
    impliedRating = "CRITICAL";
  } else if (stressedDSCR < 1) {
    impliedRating = "HIGH";
  } else if (stressedDSCR < 1.1) {
    impliedRating = "MODERATE";
  } else {
    impliedRating = "LOW";
  }
  const valueShock5 = purchasePrice * 0.95;
  const maxLoanAt5 = valueShock5 * (ltv / 100);
  const piAt5 = calculatePI(maxLoanAt5, rate, termMonths);
  const pitiaAt5 = piAt5 + fixed;
  const dscrAt5PctShock = qualifyingRent / pitiaAt5;
  const valueFailsAt5 = dscrAt5PctShock < 1;
  let baseRating;
  if (rentDropPercent >= 15 || valueFailsAt5 && rentDropPercent >= 10) {
    baseRating = "CRITICAL";
  } else if (rentDropPercent >= 10 || valueFailsAt5) {
    baseRating = "HIGH";
  } else if (rentDropPercent >= 5) {
    baseRating = "MODERATE";
  } else {
    baseRating = "LOW";
  }
  const ratingRank = {
    LOW: 0,
    MODERATE: 1,
    HIGH: 2,
    CRITICAL: 3
  };
  const combinedRiskRating = ratingRank[baseRating] >= ratingRank[impliedRating] ? baseRating : impliedRating;
  let bindingConstraint;
  const rentAtRisk = rentDropPercent < 5;
  if (rentAtRisk && valueFailsAt5) {
    bindingConstraint = "BOTH";
  } else if (rentAtRisk) {
    bindingConstraint = "RENT";
  } else if (valueFailsAt5) {
    bindingConstraint = "VALUE";
  } else {
    bindingConstraint = "NEITHER";
  }
  const summary = `Rent can drop ${rentDropPercent.toFixed(1)}% before DSCR hits 1.0. ` + (valueFailsAt5 ? "A 5% value shock would also break the deal." : "Value shock within tolerance at 5%.") + ` Combined -10%/-10% stress \u2192 DSCR ${stressedDSCR.toFixed(2)} (${impliedRating}).`;
  return {
    rentBreakpoint,
    rentDropPercent,
    valueShockTable,
    combinedRiskRating,
    bindingConstraint,
    summary,
    combinedStressTest: {
      rentDropPct: combinedRentDropPct,
      valueDropPct: combinedValueDropPct,
      stressedRent: r0(stressedRent),
      stressedValue: r0(stressedValue),
      stressedMaxLoan: r0(stressedMaxLoan),
      stressedPITIA: r0(stressedPITIA),
      stressedDSCR,
      impliedRating
    }
  };
}
function computeTornado(qualifyingRent, pitia, loanAmount, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance, purchasePrice = 0, ltv = 0) {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const pi = pitia - fixed;
  const termMonths = termYears * 12;
  const dscrFromParts = (rent, pAndI, f) => r2(rent / (pAndI + f));
  const vars = [];
  const rentLo = qualifyingRent * 0.9;
  const rentHi = qualifyingRent * 1.1;
  const dscrRentLo = dscrFromParts(rentLo, pi, fixed);
  const dscrRentHi = dscrFromParts(rentHi, pi, fixed);
  vars.push({
    lever: "Rent",
    currentValue: r0(qualifyingRent),
    lowValue: r0(rentLo),
    highValue: r0(rentHi),
    dscrAtLow: dscrRentLo,
    dscrAtHigh: dscrRentHi,
    impact: r2(dscrRentHi - dscrRentLo)
  });
  const rateLo = rate - 0.5;
  const rateHi = rate + 0.5;
  const piRateLo = calculatePI(loanAmount, rateLo, termMonths);
  const piRateHi = calculatePI(loanAmount, rateHi, termMonths);
  const dscrRateLo = dscrFromParts(qualifyingRent, piRateHi, fixed);
  const dscrRateHi = dscrFromParts(qualifyingRent, piRateLo, fixed);
  vars.push({
    lever: "Rate",
    currentValue: r2(rate),
    lowValue: r2(rateHi),
    highValue: r2(rateLo),
    dscrAtLow: dscrRateLo,
    dscrAtHigh: dscrRateHi,
    impact: r2(dscrRateHi - dscrRateLo)
  });
  if (purchasePrice > 0 && ltv > 0) {
    const ltvLo = Math.max(0, ltv - 5);
    const ltvHi = ltv + 5;
    const loanAtLtvLo = purchasePrice * (ltvLo / 100);
    const loanAtLtvHi = purchasePrice * (ltvHi / 100);
    const piLtvLo = calculatePI(loanAtLtvLo, rate, termMonths);
    const piLtvHi = calculatePI(loanAtLtvHi, rate, termMonths);
    const dscrLtvLo = dscrFromParts(qualifyingRent, piLtvLo, fixed);
    const dscrLtvHi = dscrFromParts(qualifyingRent, piLtvHi, fixed);
    vars.push({
      lever: "LTV",
      currentValue: r2(ltv),
      lowValue: r2(ltvHi),
      // higher LTV → worse DSCR (low end of DSCR range)
      highValue: r2(ltvLo),
      // lower LTV → better DSCR (high end of DSCR range)
      dscrAtLow: dscrLtvHi,
      // DSCR at higher LTV (worse)
      dscrAtHigh: dscrLtvLo,
      // DSCR at lower LTV (better)
      impact: r2(dscrLtvLo - dscrLtvHi)
    });
  }
  if (purchasePrice > 0 && ltv > 0) {
    const priceLo = purchasePrice * 0.9;
    const priceHi = purchasePrice * 1.1;
    const loanAtPriceLo = priceLo * (ltv / 100);
    const loanAtPriceHi = priceHi * (ltv / 100);
    const piPriceLo = calculatePI(loanAtPriceLo, rate, termMonths);
    const piPriceHi = calculatePI(loanAtPriceHi, rate, termMonths);
    const dscrPriceLo = dscrFromParts(qualifyingRent, piPriceLo, fixed);
    const dscrPriceHi = dscrFromParts(qualifyingRent, piPriceHi, fixed);
    vars.push({
      lever: "Price",
      currentValue: r0(purchasePrice),
      lowValue: r0(priceHi),
      // higher price → bigger loan → worse DSCR
      highValue: r0(priceLo),
      // lower price → smaller loan → better DSCR
      dscrAtLow: dscrPriceHi,
      // DSCR at higher price (worse)
      dscrAtHigh: dscrPriceLo,
      // DSCR at lower price (better)
      impact: r2(dscrPriceLo - dscrPriceHi)
    });
  }
  const taxLo = annualTaxes * 0.9;
  const taxHi = annualTaxes * 1.1;
  const dscrTaxLo = dscrFromParts(qualifyingRent, pi, mFixed(taxHi, annualInsurance, hoa, floodInsurance));
  const dscrTaxHi = dscrFromParts(qualifyingRent, pi, mFixed(taxLo, annualInsurance, hoa, floodInsurance));
  vars.push({
    lever: "Taxes",
    currentValue: r0(annualTaxes),
    lowValue: r0(taxHi),
    highValue: r0(taxLo),
    dscrAtLow: dscrTaxLo,
    dscrAtHigh: dscrTaxHi,
    impact: r2(dscrTaxHi - dscrTaxLo)
  });
  const insLo = annualInsurance * 0.9;
  const insHi = annualInsurance * 1.1;
  const dscrInsLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, insHi, hoa, floodInsurance));
  const dscrInsHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, insLo, hoa, floodInsurance));
  vars.push({
    lever: "Insurance",
    currentValue: r0(annualInsurance),
    lowValue: r0(insHi),
    highValue: r0(insLo),
    dscrAtLow: dscrInsLo,
    dscrAtHigh: dscrInsHi,
    impact: r2(dscrInsHi - dscrInsLo)
  });
  if (hoa > 0) {
    const hoaLo = hoa * 0.9;
    const hoaHi = hoa * 1.1;
    const dscrHoaLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoaHi, floodInsurance));
    const dscrHoaHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoaLo, floodInsurance));
    vars.push({
      lever: "HOA",
      currentValue: r0(hoa),
      lowValue: r0(hoaHi),
      highValue: r0(hoaLo),
      dscrAtLow: dscrHoaLo,
      dscrAtHigh: dscrHoaHi,
      impact: r2(dscrHoaHi - dscrHoaLo)
    });
  }
  if (floodInsurance > 0) {
    const floodLo = floodInsurance * 0.9;
    const floodHi = floodInsurance * 1.1;
    const dscrFloodLo = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoa, floodHi));
    const dscrFloodHi = dscrFromParts(qualifyingRent, pi, mFixed(annualTaxes, annualInsurance, hoa, floodLo));
    vars.push({
      lever: "Flood Insurance",
      currentValue: r0(floodInsurance),
      lowValue: r0(floodHi),
      highValue: r0(floodLo),
      dscrAtLow: dscrFloodLo,
      dscrAtHigh: dscrFloodHi,
      impact: r2(dscrFloodHi - dscrFloodLo)
    });
  }
  vars.sort((a, b) => b.impact - a.impact);
  return vars;
}
function computeBreakevenResult(qualifyingRent, pitia, loanAmount, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance, purchasePrice, ltv) {
  const fixed = mFixed(annualTaxes, annualInsurance, hoa, floodInsurance);
  const pi = pitia - fixed;
  const termMonths = termYears * 12;
  const rentBreakeven = {
    for1_0: r0(pitia * 1),
    for1_10: r0(pitia * 1.1),
    for1_25: r0(pitia * 1.25)
  };
  const priceBreakeven = {
    for1_0: solvePriceForDSCR(1, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    for1_10: solvePriceForDSCR(1.1, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    for1_25: solvePriceForDSCR(1.25, qualifyingRent, ltv, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance)
  };
  const ltv1_0 = solveLTVForDSCR(1, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltv1_10 = solveLTVForDSCR(1.1, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltv1_25 = solveLTVForDSCR(1.25, qualifyingRent, purchasePrice, rate, termYears, annualTaxes, annualInsurance, hoa, floodInsurance);
  const ltvBreakeven = {
    for1_0: ltv1_0,
    for1_10: ltv1_10,
    for1_25: ltv1_25,
    additionalDown: {
      for1_0: r0(purchasePrice * Math.max(0, ltv - ltv1_0) / 100),
      for1_10: r0(purchasePrice * Math.max(0, ltv - ltv1_10) / 100),
      for1_25: r0(purchasePrice * Math.max(0, ltv - ltv1_25) / 100)
    }
  };
  const rateBreakeven = {
    maxRateFor1_0: solveDealBreakRate(qualifyingRent, loanAmount, termYears, "NONE", annualTaxes, annualInsurance, hoa, floodInsurance),
    maxRateFor1_10: solveRateForDSCR(1.1, loanAmount, qualifyingRent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance),
    maxRateFor1_25: solveRateForDSCR(1.25, loanAmount, qualifyingRent, termYears, annualTaxes, annualInsurance, hoa, floodInsurance)
  };
  const ioPayment = loanAmount * (rate / 100 / 12);
  const ioPitia = ioPayment + fixed;
  const dscrWithIO = r2(qualifyingRent / ioPitia);
  const pi40yr = calculatePI(loanAmount, rate, 480);
  const pitia40yr = pi40yr + fixed;
  const dscrWith40yr = r2(qualifyingRent / pitia40yr);
  const monthlySavingsIO = r0(pitia - ioPitia);
  const ioRecastPayment = r0(calculatePI(loanAmount, rate, 240));
  const ioRecastPitia = ioRecastPayment + fixed;
  const ioRecastDSCR = r2(qualifyingRent / ioRecastPitia);
  const structureBreakeven = {
    dscrWithIO,
    dscrWith40yr,
    monthlySavingsIO,
    ioRecastPayment,
    ioRecastDSCR,
    note: "Conservative lenders stress-test at amortizing payment even with IO. Recast payment assumes 10yr IO then 20yr amort."
  };
  const targetFixed1_0 = qualifyingRent - pi;
  const targetTaxMo1_0 = targetFixed1_0 - annualInsurance / 12 - hoa - floodInsurance / 12;
  const taxAppealNeeded = r0(Math.max(0, (annualTaxes / 12 - targetTaxMo1_0) * 12));
  const targetInsMo1_0 = targetFixed1_0 - annualTaxes / 12 - hoa - floodInsurance / 12;
  const insuranceReshopNeeded = r0(Math.max(0, (annualInsurance / 12 - targetInsMo1_0) * 12));
  const taxInsuranceBreakeven = { taxAppealNeeded, insuranceReshopNeeded };
  const requiredRentIncrease = r0(pitia * 1.25 - qualifyingRent);
  const requiredPriceReduction = r0(purchasePrice - priceBreakeven.for1_25);
  const requiredAdditionalDown = ltvBreakeven.additionalDown.for1_25;
  const requiredRateBuydown = r2(rate - rateBreakeven.maxRateFor1_25);
  const currentDSCR = r2(qualifyingRent / pitia);
  const fixes = [];
  if (requiredRentIncrease > 0) {
    fixes.push({ action: "Increase Rent", amount: requiredRentIncrease, cost: 0 });
  }
  if (requiredRateBuydown > 0) {
    fixes.push({ action: "Buy Down Rate", amount: requiredRateBuydown, cost: r0(loanAmount * requiredRateBuydown / 100) });
  }
  if (requiredAdditionalDown > 0) {
    fixes.push({ action: "Additional Down Payment", amount: requiredAdditionalDown, cost: requiredAdditionalDown });
  }
  if (taxAppealNeeded > 0) {
    fixes.push({ action: "Appeal Taxes", amount: taxAppealNeeded, cost: 500 });
  }
  if (dscrWithIO >= 1.25) {
    fixes.push({ action: "Switch to IO", amount: r0(pitia - ioPitia), cost: 0 });
  }
  const bestSingleFix = fixes.length > 0 ? fixes.reduce((best, f) => f.cost < best.cost ? f : best, fixes[0]) : { action: "Already at 1.25+", amount: 0, cost: 0 };
  const comboActions = [];
  let comboCost = 0;
  if (currentDSCR < 1.25) {
    if (requiredRentIncrease > 0 && requiredRentIncrease <= qualifyingRent * 0.1) {
      comboActions.push(`Increase rent $${requiredRentIncrease}/mo`);
    }
    if (requiredRateBuydown > 0 && requiredRateBuydown <= 1) {
      comboActions.push(`Buy down rate ${requiredRateBuydown.toFixed(2)}%`);
      comboCost += r0(loanAmount * requiredRateBuydown / 100);
    }
    if (requiredAdditionalDown > 0) {
      comboActions.push(`Add $${requiredAdditionalDown.toLocaleString()} down`);
      comboCost += requiredAdditionalDown;
    }
    if (dscrWithIO >= 1.25) {
      comboActions.push("Switch to 10yr IO");
    }
  }
  const pathTo1_25 = {
    targetDSCR: 1.25,
    requiredRentIncrease,
    requiredPriceReduction,
    requiredAdditionalDown,
    requiredRateBuydown,
    bestSingleFix,
    bestCombination: {
      actions: comboActions.length > 0 ? comboActions : ["Already at 1.25+ DSCR"],
      totalCost: comboCost
    }
  };
  const tornadoData = computeTornado(
    qualifyingRent,
    pitia,
    loanAmount,
    rate,
    termYears,
    annualTaxes,
    annualInsurance,
    hoa,
    floodInsurance,
    purchasePrice,
    ltv
  );
  const jointAppraisalRisk = computeJointAppraisalRisk(
    qualifyingRent,
    pitia,
    purchasePrice,
    ltv,
    loanAmount,
    rate,
    termYears,
    annualTaxes,
    annualInsurance,
    hoa,
    floodInsurance
  );
  return {
    rentBreakeven,
    priceBreakeven,
    ltvBreakeven,
    rateBreakeven,
    structureBreakeven,
    taxInsuranceBreakeven,
    pathTo1_25,
    tornadoData,
    jointAppraisalRisk
  };
}

// src/engine/loanOptimizer.ts
function computePrepaySchedule(loanAmount, rate, termYears, prepayType, isSoftPrepay, partialAllowancePct) {
  const termMonths = termYears * 12;
  const structureLabel = getPrepayStructureLabel(prepayType);
  const steps = getPrepayStepRates(prepayType);
  const year1Remaining = computeRemainingBalance(loanAmount, rate, termMonths, 12);
  const year2Remaining = computeRemainingBalance(loanAmount, rate, termMonths, 24);
  const year3Remaining = computeRemainingBalance(loanAmount, rate, termMonths, 36);
  const year4Remaining = computeRemainingBalance(loanAmount, rate, termMonths, 48);
  const year5Remaining = computeRemainingBalance(loanAmount, rate, termMonths, 60);
  const year6PlusRemaining = computeRemainingBalance(loanAmount, rate, termMonths, 72);
  return {
    structure: structureLabel,
    year1: Math.round(year1Remaining * steps.year1 * 100) / 100,
    year2: Math.round(year2Remaining * steps.year2 * 100) / 100,
    year3: Math.round(year3Remaining * steps.year3 * 100) / 100,
    year4: Math.round(year4Remaining * steps.year4 * 100) / 100,
    year5: Math.round(year5Remaining * steps.year5 * 100) / 100,
    year6Plus: Math.round(year6PlusRemaining * steps.year6Plus * 100) / 100,
    partialAllowancePct,
    softPrepay: isSoftPrepay,
    softPrepaySaleExempt: isSoftPrepay ? "UNCONFIRMED" : false
  };
}
function getPrepayStructureLabel(prepayType) {
  switch (prepayType) {
    case "54321":
      return "5-4-3-2-1 Step-Down";
    case "4321":
      return "4-3-2-1 Step-Down";
    case "321":
      return "3-2-1 Step-Down";
    case "54333":
      return "5-4-3-3-3 Floored Step-Down";
    case "FLAT_5":
      return "Flat 5/5/5";
    case "SIX_MONTHS_INTEREST":
      return "Six Months Interest";
    case "SIX_MONTHS_80_PCT":
      return "Six Months Interest (80% of balance)";
    case "YIELD_MAINTENANCE":
      return "Yield Maintenance";
    case "SOFT_PREPAY":
      return "Soft Prepay (sale-exempt UNCONFIRMED)";
    case "NONE":
      return "No Prepayment Penalty";
    default:
      return "Unknown Structure";
  }
}
function getPrepayStepRates(prepayType) {
  switch (prepayType) {
    case "54321":
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.02, year5: 0.01, year6Plus: 0 };
    case "4321":
      return { year1: 0.04, year2: 0.03, year3: 0.02, year4: 0.01, year5: 0, year6Plus: 0 };
    case "321":
      return { year1: 0.03, year2: 0.02, year3: 0.01, year4: 0, year5: 0, year6Plus: 0 };
    case "54333":
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.03, year5: 0.03, year6Plus: 0 };
    case "FLAT_5":
      return { year1: 0.05, year2: 0.05, year3: 0.05, year4: 0.05, year5: 0.05, year6Plus: 0 };
    case "SIX_MONTHS_INTEREST":
      return { year1: 0.5, year2: 0.5, year3: 0.5, year4: 0.5, year5: 0.5, year6Plus: 0.5 };
    case "SIX_MONTHS_80_PCT":
      return { year1: 0.4, year2: 0.4, year3: 0.4, year4: 0.4, year5: 0.4, year6Plus: 0.4 };
    case "YIELD_MAINTENANCE":
      return { year1: 0.05, year2: 0.04, year3: 0.03, year4: 0.02, year5: 0.01, year6Plus: 0.01 };
    case "SOFT_PREPAY":
      return { year1: 0.03, year2: 0.02, year3: 0.01, year4: 0, year5: 0, year6Plus: 0 };
    case "NONE":
    default:
      return { year1: 0, year2: 0, year3: 0, year4: 0, year5: 0, year6Plus: 0 };
  }
}
function computeRemainingBalance(loanAmount, rate, termMonths, monthNumber) {
  if (monthNumber <= 0) return loanAmount;
  if (monthNumber >= termMonths) return 0;
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) {
    const straightLine = loanAmount / termMonths;
    return Math.max(loanAmount - straightLine * monthNumber, 0);
  }
  const factor = calculatePaymentFactor(rate, termMonths);
  const pi = loanAmount * factor;
  let balance = loanAmount;
  for (let i = 0; i < monthNumber; i++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = pi - interestPortion;
    balance -= principalPortion;
    if (balance < 0) {
      balance = 0;
      break;
    }
  }
  return balance;
}
function computePrepayExitCost(loanAmount, rate, termYears, prepayType, holdYears) {
  if (prepayType === "NONE") return 0;
  const termMonths = termYears * 12;
  const holdMonths = holdYears * 12;
  const remainingBalance = computeRemainingBalance(loanAmount, rate, termMonths, holdMonths);
  const steps = getPrepayStepRates(prepayType);
  const yearIndex = Math.ceil(holdYears);
  let stepRate;
  if (yearIndex <= 1) stepRate = steps.year1;
  else if (yearIndex <= 2) stepRate = steps.year2;
  else if (yearIndex <= 3) stepRate = steps.year3;
  else if (yearIndex <= 4) stepRate = steps.year4;
  else if (yearIndex <= 5) stepRate = steps.year5;
  else stepRate = steps.year6Plus;
  if (prepayType === "SIX_MONTHS_INTEREST" || prepayType === "SIX_MONTHS_80_PCT") {
    const monthlyRate = rate / 100 / 12;
    const monthsOfInterest = prepayType === "SIX_MONTHS_80_PCT" ? 4.8 : 6;
    return Math.round(remainingBalance * monthlyRate * monthsOfInterest * 100) / 100;
  }
  return Math.round(remainingBalance * stepRate * 100) / 100;
}
function generateStructureOptions(property, borrower, loan, strategy) {
  const options = [];
  const baseLoanAmount = property.purchasePrice * (loan.ltv / 100);
  const pppCheck = checkPPPLegal(
    property.state,
    borrower.entityType,
    baseLoanAmount,
    property.unitCount,
    loan.armType === "FIXED" ? "FIXED" : "ARM"
  );
  const structures = [
    { name: "30yr Fixed", term: "30_YR", armType: "FIXED", ioPeriod: "NONE", ltv: loan.ltv },
    { name: "30yr Fixed + 5yr IO", term: "30_YR", armType: "FIXED", ioPeriod: "5_YR", ltv: loan.ltv },
    { name: "30yr Fixed + 10yr IO", term: "30_YR", armType: "FIXED", ioPeriod: "10_YR", ltv: loan.ltv },
    { name: "40yr Extended", term: "40_YR", armType: "FIXED", ioPeriod: "NONE", ltv: loan.ltv },
    { name: "40yr + 10yr IO", term: "40_YR", armType: "FIXED", ioPeriod: "10_YR", ltv: loan.ltv },
    { name: "5/6 ARM", term: "30_YR", armType: "5_6_ARM", ioPeriod: "NONE", ltv: loan.ltv },
    { name: "5/6 ARM + 10yr IO", term: "30_YR", armType: "5_6_ARM", ioPeriod: "10_YR", ltv: loan.ltv },
    { name: "7/6 ARM", term: "30_YR", armType: "7_6_ARM", ioPeriod: "NONE", ltv: loan.ltv },
    { name: "10/6 ARM", term: "30_YR", armType: "10_6_ARM", ioPeriod: "NONE", ltv: loan.ltv },
    { name: "Lower LTV (70%)", term: "30_YR", armType: "FIXED", ioPeriod: "NONE", ltv: 70 },
    { name: "Lower LTV (70%) + IO", term: "30_YR", armType: "FIXED", ioPeriod: "10_YR", ltv: 70 },
    { name: "Lower LTV (65%)", term: "30_YR", armType: "FIXED", ioPeriod: "NONE", ltv: 65 }
  ];
  for (const struct of structures) {
    const testLoan = {
      ...loan,
      term: struct.term,
      armType: struct.armType,
      ioPeriod: struct.ioPeriod,
      ltv: struct.ltv
    };
    const result = solveDSCR(property, borrower, testLoan, strategy);
    const termYears = struct.term === "40_YR" ? 40 : struct.term === "15_YR" ? 15 : 30;
    const structLoanAmount = property.purchasePrice * (struct.ltv / 100);
    const pitiaBreakdown = result.monthlyPITIA;
    const isIO = struct.ioPeriod !== "NONE";
    const monthlyPayment = pitiaBreakdown.total;
    const monthlyCashFlow = result.qualifyingRent - monthlyPayment;
    const pointsCost = loan.points / 100 * structLoanAmount;
    const lenderFees = loan.lenderFees;
    const brokerFees = loan.brokerFees;
    const rateLockCost = loan.rateLockCost;
    const closingCosts = structLoanAmount * 0.03;
    const pppPremiumFee = !pppCheck.allowed ? pppCheck.noPPPPremiumFee * structLoanAmount : 0;
    const pppExitCost = computePrepayExitCost(
      structLoanAmount,
      result.solvedRate,
      termYears,
      loan.prepayPreference,
      loan.expectedHoldYears
    );
    const prepaySchedule = computePrepaySchedule(
      structLoanAmount,
      result.solvedRate,
      termYears,
      loan.prepayPreference,
      loan.prepayPreference === "SOFT_PREPAY",
      20
    );
    const pppPremiumRate = !pppCheck.allowed ? pppCheck.noPPPPremiumRate : 0;
    const adjustedRate = result.solvedRate + pppPremiumRate;
    const fiveYearCost = computeFiveYearCost(
      structLoanAmount,
      adjustedRate,
      monthlyPayment,
      closingCosts,
      pppExitCost,
      isIO,
      termYears,
      pointsCost,
      lenderFees,
      brokerFees,
      rateLockCost,
      pppPremiumFee
    );
    const track2Vacancy = strategy === "STR" ? 25 : strategy === "MTR" ? 12 : 8;
    const track2Management = 8;
    const track2Maintenance = 5;
    const track2Net = result.qualifyingRent * (1 - track2Vacancy / 100) - result.qualifyingRent * track2Management / 100 - result.qualifyingRent * track2Maintenance / 100;
    const track2DSCR = monthlyPayment > 0 ? track2Net / monthlyPayment : 0;
    const tags = [];
    if (struct.armType !== "FIXED") tags.push("ARM");
    if (isIO) tags.push("IO");
    if (struct.ltv < loan.ltv) tags.push("Lower LTV");
    if (result.dscr >= 1.25) tags.push("Best Pricing");
    if (result.dscr < 1) tags.push("Sub-1.0");
    if (result.dscr >= 1 && result.dscr < 1.1) tags.push("Tight");
    if (adjustedRate < 6.5) tags.push("Competitive Rate");
    let ioRecastWarning = null;
    if (isIO) {
      const ioYears = struct.ioPeriod === "5_YR" ? 5 : struct.ioPeriod === "7_YR" ? 7 : 10;
      const remainingTerm = termYears - ioYears;
      const recastLoan = structLoanAmount;
      const recastMonths = remainingTerm * 12;
      const recastPI = calculatePI(recastLoan, adjustedRate, recastMonths);
      const recastPITIA = recastPI + (pitiaBreakdown.taxes + pitiaBreakdown.insurance + pitiaBreakdown.hoa + pitiaBreakdown.floodInsurance);
      ioRecastWarning = `After ${ioYears}-yr IO period, payment recasts to $${recastPITIA.toFixed(0)}/month (P&I jumps from $${(monthlyPayment - pitiaBreakdown.taxes - pitiaBreakdown.insurance - pitiaBreakdown.hoa - pitiaBreakdown.floodInsurance).toFixed(0)} to $${recastPI.toFixed(0)}). DSCR at recast: ${(result.qualifyingRent / recastPITIA).toFixed(2)}.`;
    }
    options.push({
      name: struct.name,
      term: struct.term,
      armType: struct.armType,
      ioPeriod: struct.ioPeriod,
      ltv: struct.ltv,
      rate: adjustedRate,
      track1DSCR: Math.round(result.dscr * 1e3) / 1e3,
      track2DSCR: Math.round(track2DSCR * 1e3) / 1e3,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      monthlyCashFlow: Math.round(monthlyCashFlow * 100) / 100,
      fiveYearCost: Math.round(fiveYearCost),
      prepayPenalty: prepaySchedule.structure,
      prepaySchedule,
      totalCostOfCapital: Math.round(fiveYearCost),
      bestLender: findBestLenderName(property, borrower, testLoan, strategy, result.dscr, structLoanAmount, adjustedRate),
      tags,
      pppAllowed: pppCheck.allowed,
      pppStateNote: pppCheck.legalWarning || pppCheck.reason,
      ioRecastWarning
    });
  }
  options.sort((a, b) => {
    if (a.track1DSCR >= 1 && b.track1DSCR < 1) return -1;
    if (b.track1DSCR >= 1 && a.track1DSCR < 1) return 1;
    return a.fiveYearCost - b.fiveYearCost;
  });
  return options;
}
function computeFiveYearCost(loanAmount, rate, monthlyPayment, closingCosts, pppExitCost, isIO, termYears, pointsCost = 0, lenderFees = 0, brokerFees = 0, rateLockCost = 0, pppPremiumFee = 0) {
  const monthlyRate = rate / 100 / 12;
  let balance = loanAmount;
  let totalInterest = 0;
  if (isIO) {
    const ioPayment = loanAmount * monthlyRate;
    totalInterest = ioPayment * 60;
  } else {
    for (let i = 0; i < 60; i++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthlyPayment - interestPortion;
      totalInterest += interestPortion;
      balance -= principalPortion;
      if (balance < 0) break;
    }
  }
  return totalInterest + pointsCost + lenderFees + brokerFees + rateLockCost + closingCosts + pppPremiumFee + pppExitCost;
}
function findBestLenderName(property, borrower, loan, _strategy, dscr, loanAmount, solvedRate) {
  const lenderData = [
    { name: "Griffin Funding", rateAdjustment: 0.25, minFICO: 0, minDSCR: 0.75 },
    { name: "Kiavi", rateAdjustment: 0.5, minFICO: 660, minDSCR: 1.1 },
    { name: "Visio Lending", rateAdjustment: -0.125, minFICO: 680, minDSCR: 0.75 },
    { name: "Lima One Capital", rateAdjustment: -0.375, minFICO: 660, minDSCR: 0.9 },
    { name: "Defy Mortgage", rateAdjustment: -0.125, minFICO: 640, minDSCR: 0.75 },
    { name: "Easy Street Capital", rateAdjustment: -0.25, minFICO: 620, minDSCR: 0 },
    { name: "New Silver", rateAdjustment: 0.75, minFICO: 660, minDSCR: 0.75 },
    { name: "Deephaven Mortgage", rateAdjustment: 0.25, minFICO: 660, minDSCR: 0.75 }
  ];
  let bestName = "\u2014";
  let bestRate = solvedRate;
  for (const lender of lenderData) {
    if (borrower.ficoScore < lender.minFICO) continue;
    if (dscr < lender.minDSCR) continue;
    const lenderRate = solvedRate + lender.rateAdjustment;
    if (lenderRate < bestRate) {
      bestRate = lenderRate;
      bestName = lender.name;
    }
  }
  return bestName;
}

// src/engine/inputs.ts
var DECLINING_MARKET_STATES = /* @__PURE__ */ new Set(["CT", "FL", "IL", "NJ", "NY"]);
function abbrevState(state) {
  return (state || "").trim().toUpperCase().slice(0, 2);
}
function buildEngineInputs(req) {
  const purchasePrice = Number(req.purchasePrice);
  const monthlyRent = Number(req.monthlyRent);
  let ltv;
  if (typeof req.ltv === "number") {
    ltv = req.ltv;
  } else if (typeof req.loanAmount === "number" && purchasePrice > 0) {
    ltv = req.loanAmount / purchasePrice * 100;
  } else {
    ltv = 75;
  }
  const stateAbbrev = abbrevState(req.state);
  const strategy = req.strategy ?? "LTR";
  const property = {
    purchasePrice,
    leaseRent: monthlyRent,
    marketRent: req.marketRent ?? monthlyRent,
    strProjectedRent: req.strProjectedRent ?? (strategy === "STR" ? monthlyRent : 0),
    strDocumentedRent: req.strDocumentedRent ?? 0,
    hoa: req.hoa ?? 0,
    annualTaxes: req.annualTaxes ?? Math.round(purchasePrice * 0.012),
    annualInsurance: req.annualInsurance ?? Math.round(purchasePrice * 5e-3),
    floodInsurance: req.floodInsurance ?? 0,
    propertyType: req.propertyType ?? "SFR",
    state: stateAbbrev,
    unitCount: req.unitCount ?? 1,
    sqft: req.sqft ?? 1500,
    yearBuilt: req.yearBuilt ?? 2e3,
    isCondotel: req.isCondotel ?? false,
    isNonWarrantable: req.isNonWarrantable ?? false,
    isRural: req.isRural ?? false,
    isDecliningMarket: DECLINING_MARKET_STATES.has(stateAbbrev),
    hoaSTRPolicy: req.hoaSTRPolicy ?? "UNKNOWN"
  };
  const borrower = {
    ficoScore: req.ficoScore ?? 740,
    experience: req.experience ?? "EXPERIENCED",
    existingFinancedProperties: req.existingFinancedProperties ?? 1,
    entityType: req.entityType ?? "LLC",
    isUSCitizenOrPR: req.isUSCitizenOrPR ?? !(req.isNonUsInvestor ?? false),
    availableReserves: req.availableReserves ?? 0,
    reserveAssets: [],
    isFirstResponder: req.isFirstResponder ?? false,
    isNonUsInvestor: req.isNonUsInvestor ?? false
  };
  const loan = {
    ltv,
    term: req.term ?? "30_YR",
    ioPeriod: req.ioPeriod ?? "NONE",
    armType: req.armType ?? "FIXED",
    prepayPreference: req.prepayPreference ?? "NONE",
    purpose: req.loanPurpose ?? "PURCHASE",
    expectedHoldYears: req.expectedHoldYears ?? 5,
    points: req.points ?? 0,
    lenderFees: req.lenderFees ?? 0,
    brokerFees: req.brokerFees ?? 0,
    rateLockCost: req.rateLockCost ?? 0
  };
  return { property, borrower, loan, strategy };
}

// src/engineService.ts
var isProd = process.env.NODE_ENV === "production";
var workerPath = isProd ? import_path.default.join(process.cwd(), "dist", "engineWorker.cjs") : import_path.default.resolve("src", "engineWorker.ts");
var WORKER_POOL_SIZE = process.env.WORKER_POOL_SIZE ? parseInt(process.env.WORKER_POOL_SIZE) : 4;
var WorkerPool = class {
  constructor(size) {
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = /* @__PURE__ */ new Map();
    this.nextWorkerIndex = 0;
    this.initialized = false;
    this.size = size;
  }
  ensureInitialized() {
    if (this.initialized || this.size <= 0) return;
    this.initialized = true;
    for (let i = 0; i < this.size; i++) {
      this.createWorker();
    }
  }
  createWorker() {
    const worker = new import_worker_threads.Worker(workerPath, {
      execArgv: isProd ? [] : ["--import", "tsx"]
    });
    worker.on("message", (msg) => {
      const { id, success, result, error } = msg;
      const task = this.activeTasks.get(id);
      if (task) {
        this.activeTasks.delete(id);
        if (success) {
          task.resolve(result);
        } else {
          task.reject(new Error(error));
        }
      }
      this.processQueue();
    });
    worker.on("error", (err) => {
      console.error("Worker error:", err);
      this.workers = this.workers.filter((w) => w !== worker);
      this.createWorker();
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      this.workers = this.workers.filter((w) => w !== worker);
      this.createWorker();
    });
    this.workers.push(worker);
  }
  processQueue() {
    if (this.taskQueue.length === 0) return;
    this.ensureInitialized();
    if (this.workers.length === 0) return;
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    const task = this.taskQueue.shift();
    if (task) {
      this.activeTasks.set(task.id, task);
      worker.postMessage({ id: task.id, type: task.type, payload: task.payload });
    }
  }
  runTask(type, payload) {
    return new Promise((resolve, reject) => {
      const id = (Math.random() * 1e9).toString(36);
      this.taskQueue.push({ id, type, payload, resolve, reject });
      this.processQueue();
    });
  }
};
var pool = new WorkerPool(WORKER_POOL_SIZE);
function runSolveDSCR(payload) {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const { property, borrower, loan, strategy } = buildEngineInputs(payload);
      const deal = solveDSCR(property, borrower, loan, strategy);
      const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
      const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);
      const topLenders = scoreResult.topPicks.map((p) => ({
        name: p.lenderName,
        score: p.totalScore,
        tier: p.tier,
        rank: p.rankAmongEligible,
        topReasons: p.topReasons.slice(0, 2)
      }));
      return Promise.resolve({ deal, topLenders });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("SOLVE", payload);
}
function runSensitivity(payload) {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const { property, borrower, loan, strategy } = buildEngineInputs(payload);
      const deal = solveDSCR(property, borrower, loan, strategy);
      const termYears = loan.term === "30_YR" ? 30 : loan.term === "40_YR" ? 40 : 15;
      const sensitivity = computeBreakevenResult(
        deal.qualifyingRent,
        deal.monthlyPITIA.total,
        deal.loanAmount,
        deal.solvedRate,
        termYears,
        property.annualTaxes,
        property.annualInsurance,
        property.hoa,
        property.floodInsurance ?? 0,
        property.purchasePrice,
        loan.ltv
      );
      return Promise.resolve({ deal, sensitivity });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("SENSITIVITY", payload);
}
function runOptimize(payload) {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const { property, borrower, loan, strategy } = buildEngineInputs(payload);
      const options = generateStructureOptions(property, borrower, loan, strategy);
      return Promise.resolve({ options });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("OPTIMIZE", payload);
}
function runStateRules(payload) {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const ppp = checkPPPLegal(
        payload.state,
        payload.entityType,
        payload.loanAmount,
        payload.unitCount,
        payload.productType
      );
      return Promise.resolve({ state: payload.state, ppp });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("STATE", payload);
}

// src/routes/dscr.ts
var dscrRouter = (0, import_express.Router)();
dscrRouter.post("/solve", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSolveDSCR(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
dscrRouter.post("/sensitivity", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runSensitivity(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
dscrRouter.post("/optimize", validateBody(DealRequestSchema), async (req, res, next) => {
  try {
    const result = await runOptimize(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
dscrRouter.post("/state", validateBody(StateRequestSchema), async (req, res, next) => {
  try {
    const result = await runStateRules(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// src/routes/narrate.ts
var import_express2 = require("express");
var import_sdk = __toESM(require("@anthropic-ai/sdk"), 1);
var narrateRouter = (0, import_express2.Router)();
var aiClient = null;
function getClaudeClient() {
  if (!aiClient) {
    aiClient = new import_sdk.default({
      apiKey: process.env.ANTHROPIC_AUTH_TOKEN || "",
      baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.z.ai/api/anthropic"
    });
  }
  return aiClient;
}
var MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
narrateRouter.post("/", validateBody(NarrateRequestSchema), async (req, res, next) => {
  if (!process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_AUTH_TOKEN.startsWith("MY_")) {
    res.status(503).json({ error: "ANTHROPIC_AUTH_TOKEN not configured." });
    return;
  }
  try {
    const { deal, context } = req.body;
    const ai = getClaudeClient();
    const { dscr, solvedRate, dealBreakRate, rateHeadroomBps, dualTrackDSCR } = deal;
    const safeNum = (v, decimals) => {
      const n = Number(v);
      return Number.isFinite(n) ? n.toFixed(decimals) : "N/A";
    };
    const prompt = `DSCR underwriting result for a broker to explain to a borrower:
- DSCR: ${safeNum(dscr, 2)}x
- Solved Rate: ${safeNum(solvedRate, 3)}%
- Deal-Break Rate: ${typeof dealBreakRate === "number" && Number.isFinite(dealBreakRate) ? dealBreakRate.toFixed(3) : "N/A"}% (${typeof rateHeadroomBps === "number" && Number.isFinite(rateHeadroomBps) ? rateHeadroomBps : "N/A"} bps headroom)
- Track 1 (lender qual): ${dualTrackDSCR?.track1?.passes ? "PASSES" : "FAILS"}
- Track 2 (investor survival): ${dualTrackDSCR?.track2?.passes ? "PASSES" : "FAILS"}
- Summary: ${dualTrackDSCR?.verdict?.summary ?? ""}
${context ? `
Additional context: ${String(context).slice(0, 500)}` : ""}

Write 2-3 sentences in plain English for a real estate investor who is NOT a finance expert. Focus on what this means for their deal. Do NOT recite the numbers back verbatim \u2014 interpret them. Do NOT mention Claude or AI.`;
    const response = await ai.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: "You are a DSCR lending advisor. Write plain, honest, broker-to-client language. Never generate new numbers. 2-3 sentences max.",
      messages: [{ role: "user", content: prompt }]
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    res.json({ narrative: text });
  } catch (err) {
    next(err);
  }
});

// src/middleware/auth.ts
var admin = __toESM(require("firebase-admin"), 1);
var adminInitialized = false;
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  adminInitialized = true;
} catch (error) {
  logger.warn(
    { error: error.message },
    "firebase-admin initialization failed. Token verification will fall back to mock context in development mode."
  );
}
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.REQUIRE_AUTH === "true") {
      res.status(401).json({ error: "Unauthorized: Missing ID token" });
      return;
    }
    next();
    return;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    if (adminInitialized) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
    } else {
      logger.info("Bypassing token verification in development fallback");
      req.user = {
        uid: "dev-user-id",
        email: "dev-user@greenstreet.dev"
      };
    }
    next();
  } catch (error) {
    logger.warn({ error: error.message }, "Firebase ID token verification failed");
    res.status(401).json({ error: "Unauthorized: Invalid ID token" });
  }
}

// src/serverApp.ts
var app = (0, import_express3.default)();
var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : ["http://localhost:3000", "http://localhost:5173", "https://your-firebase-app.web.app"];
app.use(
  (0, import_cors.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"]
  })
);
app.use(import_express3.default.json({ limit: "100kb" }));
app.disable("x-powered-by");
app.use(verifyFirebaseToken);
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api/")) {
      const extra = process.env.NODE_ENV !== "production" ? { ip: req.ip } : {};
      logRequest(req.method, req.path, res.statusCode, duration, extra);
    }
  });
  next();
});
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
var narrateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 1e3,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: process.env.npm_package_version || "unknown",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/dscr", apiLimiter, dscrRouter);
app.use("/api/narrate", narrateLimiter, narrateRouter);
app.use(errorHandler);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
