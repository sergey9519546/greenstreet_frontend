import { randomUUID } from "crypto";
import { Worker } from "worker_threads";
import path from "path";
import {
  solveDSCR,
  matchLenders,
  scoreLenderMatch,
  checkPPPLegal,
  computeBreakevenResult,
  generateStructureOptions,
} from "./engine/index";
import { buildEngineInputs, type DealRequest } from "./engine/inputs";

// In production, esbuild compiles engineWorker.ts to dist/engineWorker.cjs.
// In development, tsx loads the TypeScript worker entry point directly.
const isProd = process.env.NODE_ENV === "production";
const workerPath = isProd
  ? path.join(process.cwd(), "dist", "engineWorker.cjs")
  : path.resolve("src", "engineWorker.ts");

const ENGINE_OPERATIONS = ["SOLVE", "SENSITIVITY", "OPTIMIZE", "STATE"] as const;
const WORKER_RESPONSE_ERROR_CODES = [
  "INVALID_MESSAGE",
  "UNKNOWN_OPERATION",
  "INVALID_INPUT",
  "ENGINE_FAILURE",
  "INVALID_OUTPUT",
] as const;
const MAX_POOL_SIZE = 64;
const MAX_QUEUE_SIZE = 10_000;
const MAX_TASK_TIMEOUT_MS = 60 * 60 * 1_000;
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
export type WorkerResponseErrorCode = (typeof WORKER_RESPONSE_ERROR_CODES)[number];
export type WorkerPoolErrorCode =
  | "EWORKER_POOL_SHUTDOWN"
  | "EWORKER_QUEUE_FULL"
  | "EWORKER_UNKNOWN_OPERATION"
  | "EWORKER_INVALID_REQUEST"
  | "EWORKER_START"
  | "EWORKER_CRASH"
  | "EWORKER_EXIT"
  | "EWORKER_POST_MESSAGE"
  | "EWORKER_TASK_TIMEOUT"
  | "EWORKER_TASK_FAILED"
  | "EWORKER_PROTOCOL"
  | "EWORKER_INVALID_OUTPUT";

export class WorkerPoolError extends Error {
  readonly code: WorkerPoolErrorCode;
  readonly status: number;
  readonly statusCode: number;
  readonly expose: boolean;
  override readonly cause?: unknown;

  constructor(
    code: WorkerPoolErrorCode,
    message: string,
    status: number,
    cause?: unknown,
  ) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "WorkerPoolError";
    this.code = code;
    this.status = status;
    this.statusCode = status;
    this.expose = status >= 400 && status < 500;
    this.cause = cause;
  }
}

export type WorkerRequest = {
  [Operation in EngineOperation]: {
    id: string;
    type: Operation;
    payload: unknown;
  };
}[EngineOperation];

export type WorkerResponse =
  | { id: string; success: true; result: unknown }
  | {
      id: string;
      success: false;
      error: { code: WorkerResponseErrorCode; message: string };
    };

type WorkerListener = (...args: any[]) => void;

export interface WorkerLike {
  on(event: "message" | "error" | "exit", listener: WorkerListener): WorkerLike;
  removeListener?(
    event: "message" | "error" | "exit",
    listener: WorkerListener,
  ): WorkerLike;
  postMessage(message: WorkerRequest): void;
  terminate(): Promise<number> | number;
}

export type WorkerFactory = (slotIndex: number) => WorkerLike;

export interface WorkerPoolOptions {
  size: number;
  maxQueueSize?: number;
  taskTimeoutMs?: number;
  workerFactory?: WorkerFactory;
}

export interface RunTaskOptions {
  timeoutMs?: number;
}

interface Task {
  id: string;
  type: EngineOperation;
  payload: unknown;
  timeoutMs: number;
  timer?: ReturnType<typeof setTimeout>;
  settled: boolean;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface WorkerHandle {
  worker: WorkerLike;
  terminal: boolean;
  listeners: {
    message: WorkerListener;
    error: WorkerListener;
    exit: WorkerListener;
  };
}

interface WorkerSlot {
  index: number;
  handle?: WorkerHandle;
  activeTaskId?: string;
}

interface ActiveTask {
  task: Task;
  slot: WorkerSlot;
  handle: WorkerHandle;
}

interface DataBudget {
  nodes: number;
  readonly seen: WeakSet<object>;
}

function readIntegerEnv(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  if (!/^\d+$/.test(raw)) {
    console.warn(`${name} must be an integer; using ${fallback}.`);
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    console.warn(`${name} must be between ${min} and ${max}; using ${fallback}.`);
    return fallback;
  }

  return value;
}

const WORKER_POOL_SIZE = readIntegerEnv("WORKER_POOL_SIZE", 4, 0, MAX_POOL_SIZE);
const WORKER_POOL_MAX_QUEUE_SIZE = readIntegerEnv(
  "WORKER_POOL_MAX_QUEUE_SIZE",
  128,
  0,
  MAX_QUEUE_SIZE,
);
const WORKER_TASK_TIMEOUT_MS = readIntegerEnv(
  "WORKER_TASK_TIMEOUT_MS",
  30_000,
  1,
  MAX_TASK_TIMEOUT_MS,
);

function assertIntegerInRange(
  name: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a safe integer between ${min} and ${max}.`);
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

function parseWorkerResponse(message: unknown): WorkerResponse | undefined {
  if (!isRecord(message) || !isSafeRequestId(message.id)) return undefined;
  if (message.success === true) {
    if (!("result" in message) || !isBoundedData(message.result, "output")) return undefined;
    return message as WorkerResponse;
  }
  if (message.success !== false || !isRecord(message.error)) return undefined;
  if (
    typeof message.error.code !== "string" ||
    !(WORKER_RESPONSE_ERROR_CODES as readonly string[]).includes(message.error.code) ||
    typeof message.error.message !== "string" ||
    message.error.message.length === 0 ||
    message.error.message.length > 256
  ) {
    return undefined;
  }
  return message as WorkerResponse;
}

function workerFailure(errorCode: WorkerResponseErrorCode): WorkerPoolError {
  switch (errorCode) {
    case "UNKNOWN_OPERATION":
      return new WorkerPoolError(
        "EWORKER_UNKNOWN_OPERATION",
        "Unsupported engine operation.",
        400,
      );
    case "INVALID_INPUT":
      return new WorkerPoolError(
        "EWORKER_INVALID_REQUEST",
        "Engine input is invalid.",
        422,
      );
    case "INVALID_OUTPUT":
      return new WorkerPoolError(
        "EWORKER_INVALID_OUTPUT",
        "Engine produced an invalid result.",
        500,
      );
    case "INVALID_MESSAGE":
      return new WorkerPoolError(
        "EWORKER_PROTOCOL",
        "Worker rejected a valid protocol request.",
        502,
      );
    case "ENGINE_FAILURE":
      return new WorkerPoolError(
        "EWORKER_TASK_FAILED",
        "Engine task failed.",
        500,
      );
  }
}

const defaultWorkerFactory: WorkerFactory = () =>
  new Worker(workerPath, {
    execArgv: isProd ? [] : ["--import", "tsx"],
  }) as unknown as WorkerLike;

/**
 * A bounded worker pool with fixed slots. Queue wait time is intentionally not
 * counted against the execution timeout; each timer starts when a task is dispatched.
 */
export class WorkerPool {
  private readonly slots: WorkerSlot[];
  private readonly taskQueue: Task[] = [];
  private readonly activeTasks = new Map<string, ActiveTask>();
  private readonly maxQueueSize: number;
  private readonly taskTimeoutMs: number;
  private readonly workerFactory: WorkerFactory;
  private initialized = false;
  private shuttingDown = false;
  private lastStartupError?: WorkerPoolError;

  constructor(options: WorkerPoolOptions) {
    assertIntegerInRange("Worker pool size", options.size, 1, MAX_POOL_SIZE);

    const maxQueueSize = options.maxQueueSize ?? 128;
    const taskTimeoutMs = options.taskTimeoutMs ?? 30_000;
    assertIntegerInRange("Worker queue size", maxQueueSize, 0, MAX_QUEUE_SIZE);
    assertIntegerInRange("Worker task timeout", taskTimeoutMs, 1, MAX_TASK_TIMEOUT_MS);

    this.slots = Array.from({ length: options.size }, (_, index) => ({ index }));
    this.maxQueueSize = maxQueueSize;
    this.taskTimeoutMs = taskTimeoutMs;
    this.workerFactory = options.workerFactory ?? defaultWorkerFactory;
  }

  private ensureInitialized(): void {
    if (this.shuttingDown || this.initialized) return;
    this.initialized = true;

    for (const slot of this.slots) this.spawnWorker(slot);
  }

  private spawnWorker(slot: WorkerSlot): void {
    if (this.shuttingDown || slot.handle) return;

    let handle: WorkerHandle | undefined;
    try {
      const worker = this.workerFactory(slot.index);
      const messageListener: WorkerListener = (message: unknown) => {
        this.handleWorkerMessage(slot, handle!, message);
      };
      const errorListener: WorkerListener = (error: unknown) => {
        this.handleWorkerTerminal(
          slot,
          handle!,
          new WorkerPoolError(
            "EWORKER_CRASH",
            "Worker process failed.",
            503,
            error,
          ),
          true,
        );
      };
      const exitListener: WorkerListener = () => {
        this.handleWorkerTerminal(
          slot,
          handle!,
          new WorkerPoolError(
            "EWORKER_EXIT",
            "Worker process exited before completing its task.",
            503,
          ),
          false,
        );
      };

      handle = {
        worker,
        terminal: false,
        listeners: { message: messageListener, error: errorListener, exit: exitListener },
      };
      slot.handle = handle;
      worker.on("message", messageListener);
      worker.on("error", errorListener);
      worker.on("exit", exitListener);
      this.lastStartupError = undefined;
    } catch (error) {
      if (handle) {
        handle.terminal = true;
        this.detachWorkerListeners(handle);
        if (slot.handle === handle) slot.handle = undefined;
        void this.terminateWorker(handle);
      }
      this.lastStartupError = new WorkerPoolError(
        "EWORKER_START",
        "A worker process could not be started.",
        503,
        error,
      );
    }
  }

  private detachWorkerListeners(handle: WorkerHandle): void {
    const removeListener = handle.worker.removeListener?.bind(handle.worker);
    if (!removeListener) return;
    removeListener("message", handle.listeners.message);
    removeListener("error", handle.listeners.error);
    removeListener("exit", handle.listeners.exit);
  }

  private handleWorkerMessage(
    slot: WorkerSlot,
    handle: WorkerHandle,
    rawMessage: unknown,
  ): void {
    if (handle.terminal || slot.handle !== handle) return;

    const message = parseWorkerResponse(rawMessage);
    if (!message) {
      this.handleWorkerTerminal(
        slot,
        handle,
        new WorkerPoolError(
          "EWORKER_PROTOCOL",
          "Worker returned a malformed or non-finite response.",
          502,
        ),
        true,
      );
      return;
    }

    const active = this.activeTasks.get(message.id);
    if (
      !active ||
      active.slot !== slot ||
      active.handle !== handle ||
      slot.activeTaskId !== message.id
    ) {
      return;
    }

    slot.activeTaskId = undefined;
    this.activeTasks.delete(message.id);
    if (message.success === true) this.settleTask(active.task, undefined, message.result);
    else this.settleTask(active.task, workerFailure(message.error.code));
    this.dispatch();
  }

  private handleWorkerTerminal(
    slot: WorkerSlot,
    handle: WorkerHandle,
    failure: WorkerPoolError,
    terminate: boolean,
  ): void {
    if (handle.terminal) return;
    handle.terminal = true;
    this.detachWorkerListeners(handle);

    if (slot.handle === handle) slot.handle = undefined;

    const taskId = slot.activeTaskId;
    if (taskId) {
      const active = this.activeTasks.get(taskId);
      if (active?.slot === slot && active.handle === handle) {
        this.activeTasks.delete(taskId);
        slot.activeTaskId = undefined;
        this.settleTask(active.task, failure);
      }
    }

    if (terminate) void this.terminateWorker(handle);
    if (!this.shuttingDown) {
      this.spawnWorker(slot);
      this.dispatch();
    }
  }

  private startTaskTimer(task: Task): void {
    task.timer = setTimeout(() => this.handleTaskTimeout(task), task.timeoutMs);
  }

  private dispatch(): void {
    if (this.shuttingDown || this.taskQueue.length === 0) return;

    for (const slot of this.slots) {
      if (this.taskQueue.length === 0) break;

      const handle = slot.handle;
      if (!handle || handle.terminal || slot.activeTaskId) continue;

      const task = this.taskQueue.shift();
      if (!task || task.settled) continue;

      slot.activeTaskId = task.id;
      this.activeTasks.set(task.id, { task, slot, handle });
      this.startTaskTimer(task);

      try {
        handle.worker.postMessage({
          id: task.id,
          type: task.type,
          payload: task.payload,
        } as WorkerRequest);
      } catch (error) {
        this.handleWorkerTerminal(
          slot,
          handle,
          new WorkerPoolError(
            "EWORKER_POST_MESSAGE",
            "Engine task could not be sent to a worker.",
            500,
            error,
          ),
          true,
        );
      }
    }

    if (this.taskQueue.length > 0 && !this.hasLiveWorker()) {
      const failure =
        this.lastStartupError ??
        new WorkerPoolError("EWORKER_START", "No worker process is available.", 503);
      for (const task of this.taskQueue.splice(0)) this.settleTask(task, failure);
    }
  }

  private handleTaskTimeout(task: Task): void {
    if (task.settled) return;

    const active = this.activeTasks.get(task.id);
    if (!active) return;
    this.handleWorkerTerminal(
      active.slot,
      active.handle,
      new WorkerPoolError(
        "EWORKER_TASK_TIMEOUT",
        "Engine task exceeded its execution deadline.",
        504,
      ),
      true,
    );
  }

  private settleTask(task: Task, failure?: unknown, value?: unknown): void {
    if (task.settled) return;
    task.settled = true;
    if (task.timer !== undefined) {
      clearTimeout(task.timer);
      task.timer = undefined;
    }

    if (failure !== undefined) task.reject(failure);
    else task.resolve(value);
  }

  private hasLiveWorker(): boolean {
    return this.slots.some((slot) => slot.handle && !slot.handle.terminal);
  }

  private hasIdleWorker(): boolean {
    return this.slots.some(
      (slot) => slot.handle && !slot.handle.terminal && !slot.activeTaskId,
    );
  }

  private async terminateWorker(handle: WorkerHandle): Promise<void> {
    try {
      await handle.worker.terminate();
    } catch {
      // The generation is already terminal; termination errors cannot orphan work.
    }
  }

  public runTask(
    type: string,
    payload: unknown,
    options: RunTaskOptions = {},
  ): Promise<any> {
    if (this.shuttingDown) {
      return Promise.reject(
        new WorkerPoolError(
          "EWORKER_POOL_SHUTDOWN",
          "Worker pool is shutting down and cannot accept tasks.",
          503,
        ),
      );
    }
    if (!isEngineOperation(type)) {
      return Promise.reject(
        new WorkerPoolError(
          "EWORKER_UNKNOWN_OPERATION",
          "Unsupported engine operation.",
          400,
        ),
      );
    }
    if (!isValidOperationPayload(type, payload)) {
      return Promise.reject(
        new WorkerPoolError(
          "EWORKER_INVALID_REQUEST",
          "Engine input is invalid.",
          422,
        ),
      );
    }

    const timeoutMs = options.timeoutMs ?? this.taskTimeoutMs;
    assertIntegerInRange("Worker task timeout", timeoutMs, 1, MAX_TASK_TIMEOUT_MS);

    this.ensureInitialized();
    if (!this.hasLiveWorker()) {
      return Promise.reject(
        this.lastStartupError ??
          new WorkerPoolError("EWORKER_START", "No worker process is available.", 503),
      );
    }

    if (!this.hasIdleWorker() && this.taskQueue.length >= this.maxQueueSize) {
      return Promise.reject(
        new WorkerPoolError(
          "EWORKER_QUEUE_FULL",
          `Worker queue is full (limit ${this.maxQueueSize}).`,
          503,
        ),
      );
    }

    return new Promise((resolve, reject) => {
      const task: Task = {
        id: randomUUID(),
        type,
        payload,
        timeoutMs,
        settled: false,
        resolve,
        reject,
      };
      this.taskQueue.push(task);
      this.dispatch();
    });
  }

  public async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    const failure = new WorkerPoolError(
      "EWORKER_POOL_SHUTDOWN",
      "Worker pool shut down before the task completed.",
      503,
    );

    for (const task of this.taskQueue.splice(0)) this.settleTask(task, failure);

    for (const active of this.activeTasks.values()) {
      active.slot.activeTaskId = undefined;
      this.settleTask(active.task, failure);
    }
    this.activeTasks.clear();

    const terminations: Promise<void>[] = [];
    for (const slot of this.slots) {
      const handle = slot.handle;
      slot.handle = undefined;
      slot.activeTaskId = undefined;
      if (!handle) continue;

      handle.terminal = true;
      this.detachWorkerListeners(handle);
      terminations.push(this.terminateWorker(handle));
    }

    await Promise.allSettled(terminations);
  }
}

const pool =
  WORKER_POOL_SIZE === 0
    ? undefined
    : new WorkerPool({
        size: WORKER_POOL_SIZE,
        maxQueueSize: WORKER_POOL_MAX_QUEUE_SIZE,
        taskTimeoutMs: WORKER_TASK_TIMEOUT_MS,
      });

function readLocalEngineInputs(payload: unknown): ReturnType<typeof buildEngineInputs> {
  try {
    if (!isDealRequest(payload)) throw new TypeError("Invalid deal request payload.");
    return buildEngineInputs(payload);
  } catch (error) {
    throw new WorkerPoolError(
      "EWORKER_INVALID_REQUEST",
      "Engine input is invalid.",
      422,
      error,
    );
  }
}

function executeLocally(type: EngineOperation, payload: unknown): unknown {
  switch (type) {
    case "SOLVE": {
      const { property, borrower, loan, strategy } = readLocalEngineInputs(payload);
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
      const { property, borrower, loan, strategy } = readLocalEngineInputs(payload);
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
      const { property, borrower, loan, strategy } = readLocalEngineInputs(payload);
      return { options: generateStructureOptions(property, borrower, loan, strategy) };
    }

    case "STATE": {
      const statePayload = payload as Record<string, unknown>;
      const ppp = checkPPPLegal(
        statePayload.state as string,
        statePayload.entityType as any,
        statePayload.loanAmount as number,
        statePayload.unitCount as number,
        statePayload.productType as any,
      );
      return { state: statePayload.state, ppp };
    }
  }
}

function runEngineOperation(type: EngineOperation, payload: unknown): Promise<any> {
  if (!pool) {
    try {
      if (!isValidOperationPayload(type, payload)) {
        throw new WorkerPoolError(
          "EWORKER_INVALID_REQUEST",
          "Engine input is invalid.",
          422,
        );
      }
      const result = executeLocally(type, payload);
      if (!isBoundedData(result, "output")) {
        throw new WorkerPoolError(
          "EWORKER_INVALID_OUTPUT",
          "Engine produced an invalid result.",
          500,
        );
      }
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(
        error instanceof WorkerPoolError
          ? error
          : new WorkerPoolError(
              "EWORKER_TASK_FAILED",
              "Engine task failed.",
              500,
              error,
            ),
      );
    }
  }
  return pool.runTask(type, payload);
}

export function runSolveDSCR(payload: unknown): Promise<any> {
  return runEngineOperation("SOLVE", payload);
}

export function runSensitivity(payload: unknown): Promise<any> {
  return runEngineOperation("SENSITIVITY", payload);
}

export function runOptimize(payload: unknown): Promise<any> {
  return runEngineOperation("OPTIMIZE", payload);
}

export function runStateRules(payload: unknown): Promise<any> {
  return runEngineOperation("STATE", payload);
}
