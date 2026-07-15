import { parentPort } from "worker_threads";
import {
  solveDSCR,
  matchLenders,
  scoreLenderMatch,
  checkPPPLegal,
  computeBreakevenResult,
  generateStructureOptions,
} from "./engine/index";
import { buildEngineInputs, type DealRequest } from "./engine/inputs";

const ENGINE_OPERATIONS = ["SOLVE", "SENSITIVITY", "OPTIMIZE", "STATE"] as const;
const WORKER_ERROR_MESSAGES = {
  INVALID_MESSAGE: "Malformed worker request.",
  UNKNOWN_OPERATION: "Unsupported engine operation.",
  INVALID_INPUT: "Engine input is invalid.",
  ENGINE_FAILURE: "Engine task failed.",
  INVALID_OUTPUT: "Engine produced an invalid result.",
} as const;
const MAX_REQUEST_ID_LENGTH = 128;
const MAX_DATA_DEPTH = 16;
const MAX_DATA_NODES = 5_000;
const MAX_ARRAY_LENGTH = 2_000;
const MAX_STRING_LENGTH = 20_000;
const MAX_INPUT_ABSOLUTE_NUMBER = 1_000_000_000_000;
const DEAL_REQUEST_OPTIONAL_NUMBER_FIELDS = [
  "loanAmount",
  "ltv",
  "marketRent",
  "annualTaxes",
  "annualInsurance",
  "hoa",
  "floodInsurance",
  "unitCount",
  "sqft",
  "yearBuilt",
  "strProjectedRent",
  "strDocumentedRent",
  "ficoScore",
  "existingFinancedProperties",
  "availableReserves",
  "expectedHoldYears",
  "points",
  "lenderFees",
  "brokerFees",
  "rateLockCost",
] as const;
const DEAL_REQUEST_OPTIONAL_BOOLEAN_FIELDS = [
  "isCondotel",
  "isNonWarrantable",
  "isRural",
  "isNonUsInvestor",
  "isUSCitizenOrPR",
  "isFirstResponder",
] as const;
const DEAL_REQUEST_ENUM_FIELDS: Readonly<Record<string, readonly string[]>> = {
  propertyType: [
    "SFR",
    "2-4_UNIT",
    "CONDO_WARRANTABLE",
    "CONDO_NON_WARRANTABLE",
    "CONDOTEL",
    "RURAL",
    "5+_UNIT",
    "MIXED_USE",
  ],
  hoaSTRPolicy: ["ALLOWS", "SILENT", "PROHIBITS", "UNKNOWN"],
  entityType: ["INDIVIDUAL", "LLC", "S_CORP", "C_CORP", "TRUST"],
  experience: ["FIRST_TIME", "EXPERIENCED", "VETERAN"],
  term: ["30_YR", "40_YR", "15_YR"],
  ioPeriod: ["NONE", "5_YR", "7_YR", "10_YR"],
  armType: ["FIXED", "5_6_ARM", "7_6_ARM", "10_6_ARM"],
  prepayPreference: [
    "NONE",
    "54321",
    "4321",
    "321",
    "54333",
    "FLAT_5",
    "SIX_MONTHS_INTEREST",
    "SIX_MONTHS_80_PCT",
    "YIELD_MAINTENANCE",
    "SOFT_PREPAY",
  ],
  loanPurpose: ["PURCHASE", "RATE_TERM", "CASH_OUT"],
  strategy: ["LTR", "STR", "MTR"],
};

export type EngineOperation = (typeof ENGINE_OPERATIONS)[number];
export type WorkerRequest = {
  [Operation in EngineOperation]: {
    id: string;
    type: Operation;
    payload: unknown;
  };
}[EngineOperation];
export type WorkerErrorCode = keyof typeof WORKER_ERROR_MESSAGES;
export type WorkerResponse =
  | { id: string; success: true; result: unknown }
  | {
      id: string;
      success: false;
      error: { code: WorkerErrorCode; message: string };
    };

interface DataBudget {
  nodes: number;
  readonly seen: WeakSet<object>;
}

class InvalidEngineInputError extends Error {
  constructor() {
    super(WORKER_ERROR_MESSAGES.INVALID_INPUT);
    this.name = "InvalidEngineInputError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isEngineOperation(value: unknown): value is EngineOperation {
  return (
    typeof value === "string" &&
    (ENGINE_OPERATIONS as readonly string[]).includes(value)
  );
}

function isSafeRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_REQUEST_ID_LENGTH &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function safeRequestId(message: unknown): string {
  if (!isRecord(message)) return "";
  return isSafeRequestId(message.id) ? message.id : "";
}

function numberIsValidForInput(value: number, key: string | undefined): boolean {
  if (!Number.isFinite(value) || Math.abs(value) > MAX_INPUT_ABSOLUTE_NUMBER) {
    return false;
  }

  const normalizedKey = key?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";
  if (normalizedKey === "unitcount") {
    return Number.isSafeInteger(value) && value >= 1 && value <= 10_000;
  }
  if (normalizedKey === "creditscore") return value >= 300 && value <= 850;
  if (normalizedKey === "ltv" || normalizedKey === "cltv" || normalizedKey === "targetltv") {
    return value > 0 && value <= 100;
  }
  if (normalizedKey.endsWith("rate") || normalizedKey.endsWith("dscr")) {
    return value >= 0 && value <= 100;
  }
  if (
    /(price|value|amount|rent|income|tax|insurance|hoa|liquidity|networth|reserve|cost|fee|balance)/.test(
      normalizedKey,
    )
  ) {
    return value >= 0;
  }
  return true;
}

function isBoundedData(
  value: unknown,
  mode: "input" | "output",
  budget: DataBudget = { nodes: 0, seen: new WeakSet<object>() },
  depth = 0,
  key?: string,
): boolean {
  budget.nodes += 1;
  if (budget.nodes > MAX_DATA_NODES || depth > MAX_DATA_DEPTH) return false;

  if (value === null || value === undefined || typeof value === "boolean") return true;
  if (typeof value === "string") return value.length <= MAX_STRING_LENGTH;
  if (typeof value === "number") {
    return mode === "input"
      ? numberIsValidForInput(value, key)
      : Number.isFinite(value);
  }
  if (typeof value !== "object") return false;
  if (budget.seen.has(value)) return false;
  budget.seen.add(value);

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) return false;
    return value.every((item) => isBoundedData(item, mode, budget, depth + 1));
  }
  if (!isRecord(value)) return false;

  const entries = Object.entries(value);
  if (entries.length > MAX_ARRAY_LENGTH) return false;
  return entries.every(([entryKey, entryValue]) => {
    if (
      entryKey === "__proto__" ||
      entryKey === "prototype" ||
      entryKey === "constructor"
    ) {
      return false;
    }
    return isBoundedData(entryValue, mode, budget, depth + 1, entryKey);
  });
}

function isDealRequest(value: unknown): value is DealRequest {
  if (!isRecord(value) || !isBoundedData(value, "input")) return false;
  if (
    typeof value.purchasePrice !== "number" ||
    typeof value.monthlyRent !== "number" ||
    typeof value.state !== "string"
  ) {
    return false;
  }

  if (
    !DEAL_REQUEST_OPTIONAL_NUMBER_FIELDS.every(
      (field) => value[field] === undefined || typeof value[field] === "number",
    ) ||
    !DEAL_REQUEST_OPTIONAL_BOOLEAN_FIELDS.every(
      (field) => value[field] === undefined || typeof value[field] === "boolean",
    )
  ) {
    return false;
  }

  return Object.entries(DEAL_REQUEST_ENUM_FIELDS).every(([field, allowed]) => {
    const candidate = value[field];
    return candidate === undefined || (typeof candidate === "string" && allowed.includes(candidate));
  });
}

function isValidOperationPayload(type: EngineOperation, payload: unknown): boolean {
  if (!isRecord(payload) || !isBoundedData(payload, "input")) return false;
  if (type !== "STATE") return true;

  return (
    typeof payload.state === "string" &&
    /^[A-Z]{2}$/.test(payload.state) &&
    typeof payload.entityType === "string" &&
    payload.entityType.length > 0 &&
    payload.entityType.length <= 64 &&
    typeof payload.productType === "string" &&
    payload.productType.length > 0 &&
    payload.productType.length <= 64 &&
    typeof payload.loanAmount === "number" &&
    payload.loanAmount > 0 &&
    payload.loanAmount <= MAX_INPUT_ABSOLUTE_NUMBER &&
    Number.isFinite(payload.loanAmount) &&
    typeof payload.unitCount === "number" &&
    Number.isSafeInteger(payload.unitCount) &&
    payload.unitCount >= 1 &&
    payload.unitCount <= 10_000
  );
}

function failureResponse(id: string, code: WorkerErrorCode): WorkerResponse {
  return {
    id,
    success: false,
    error: { code, message: WORKER_ERROR_MESSAGES[code] },
  };
}

function parseWorkerRequest(
  message: unknown,
): { ok: true; request: WorkerRequest } | { ok: false; response: WorkerResponse } {
  const id = safeRequestId(message);
  if (!isRecord(message) || !id || typeof message.type !== "string") {
    return { ok: false, response: failureResponse(id, "INVALID_MESSAGE") };
  }
  if (!isEngineOperation(message.type)) {
    return { ok: false, response: failureResponse(id, "UNKNOWN_OPERATION") };
  }
  if (!isValidOperationPayload(message.type, message.payload)) {
    return { ok: false, response: failureResponse(id, "INVALID_INPUT") };
  }
  return { ok: true, request: message as WorkerRequest };
}

function readEngineInputs(payload: unknown): ReturnType<typeof buildEngineInputs> {
  try {
    if (!isDealRequest(payload)) throw new TypeError("Invalid deal request payload.");
    return buildEngineInputs(payload);
  } catch {
    throw new InvalidEngineInputError();
  }
}

function executeOperation(request: WorkerRequest): unknown {
  switch (request.type) {
    case "SOLVE": {
      const { property, borrower, loan, strategy } = readEngineInputs(request.payload);
      const deal = solveDSCR(property, borrower, loan, strategy);
      const fitResults = matchLenders(property, borrower, loan, strategy, deal.solvedRate);
      const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);
      const topLenders = scoreResult.topPicks.map((pick) => ({
        name: pick.lenderName,
        score: pick.totalScore,
        tier: pick.tier,
        rank: pick.rankAmongEligible,
        topReasons: pick.topReasons.slice(0, 2),
      }));
      return { deal, topLenders };
    }

    case "SENSITIVITY": {
      const { property, borrower, loan, strategy } = readEngineInputs(request.payload);
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
        loan.ltv,
      );
      return { deal, sensitivity };
    }

    case "OPTIMIZE": {
      const { property, borrower, loan, strategy } = readEngineInputs(request.payload);
      return { options: generateStructureOptions(property, borrower, loan, strategy) };
    }

    case "STATE": {
      const payload = request.payload as Record<string, unknown>;
      const ppp = checkPPPLegal(
        payload.state as string,
        payload.entityType as any,
        payload.loanAmount as number,
        payload.unitCount as number,
        payload.productType as any,
      );
      return { state: payload.state, ppp };
    }
  }
}

export function processWorkerMessage(message: unknown): WorkerResponse {
  const parsed = parseWorkerRequest(message);
  if (parsed.ok === false) return parsed.response;

  try {
    const result = executeOperation(parsed.request);
    if (!isBoundedData(result, "output")) {
      return failureResponse(parsed.request.id, "INVALID_OUTPUT");
    }
    return { id: parsed.request.id, success: true, result };
  } catch (error) {
    return failureResponse(
      parsed.request.id,
      error instanceof InvalidEngineInputError ? "INVALID_INPUT" : "ENGINE_FAILURE",
    );
  }
}

export function createWorkerMessageHandler(
  postMessage: (response: WorkerResponse) => void,
): (message: unknown) => void {
  return (message: unknown) => {
    let response: WorkerResponse;
    try {
      response = processWorkerMessage(message);
    } catch {
      response = failureResponse(safeRequestId(message), "ENGINE_FAILURE");
    }
    postMessage(response);
  };
}

if (parentPort) {
  parentPort.on("message", createWorkerMessageHandler((response) => parentPort.postMessage(response)));
}
