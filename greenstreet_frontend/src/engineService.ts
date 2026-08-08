import { Worker } from "worker_threads";
import path from "path";
import {
  solveDSCR,
  checkPPPLegal,
  computeBreakevenResult,
  generateStructureOptions,
} from "./engine/index";
import { buildEngineInputs } from "./engine/inputs";

// In production, esbuild compiles engineWorker.ts to dist/engineWorker.cjs
// In development with tsx, we can directly point to the .ts file
const isProd = process.env.NODE_ENV === "production";
const workerPath = isProd 
  ? path.join(process.cwd(), "dist", "engineWorker.cjs")
  : path.resolve("src", "engineWorker.ts");

// A Vercel function is already an isolated execution unit. Creating four
// nested worker threads per warm instance wastes memory and requires a
// dynamically addressed worker artifact. Keep the pool for long-lived Node
// and Firebase runtimes, but use the synchronous deterministic engine on
// Vercel unless an operator explicitly overrides the setting.
function configuredWorkerPoolSize(): number {
  const setting = process.env.WORKER_POOL_SIZE ?? (process.env.VERCEL ? "0" : "4");
  return Number.parseInt(setting, 10) || 0;
}

const WORKER_POOL_SIZE = configuredWorkerPoolSize();

function usesWorkerPool(): boolean {
  return configuredWorkerPoolSize() > 0;
}

interface Task {
  id: string;
  type: string;
  payload: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  worker?: Worker;
}

// ── Crash-loop guard ─────────────────────────────────────────────────────────
// A worker that dies on startup (missing dist/engineWorker.cjs, an import that
// throws, an OOM-inducing payload) used to be respawned instantly and forever:
// a hot loop that burns CPU, floods logs, and never surfaces the fault. Respawn
// with exponential backoff instead, and after MAX_CONSECUTIVE_CRASHES inside
// CRASH_WINDOW_MS give up on the pool entirely and run the (already supported,
// fully deterministic) inline path. Degraded is slower, not wrong.
const RESPAWN_BASE_DELAY_MS = 250;
const RESPAWN_MAX_DELAY_MS = 5_000;
const MAX_CONSECUTIVE_CRASHES = 5;
const CRASH_WINDOW_MS = 60_000;

/**
 * Synchronous in-process equivalents of every worker task type. The worker
 * pool and the inline path must stay behaviorally identical — the pool is a
 * throughput optimization, never a different calculation.
 */
const INLINE_HANDLERS: Record<string, (payload: any) => any> = {
  SOLVE: (payload) => {
    const { property, borrower, loan, strategy } = buildEngineInputs(payload);
    const deal = solveDSCR(property, borrower, loan, strategy);
    return { deal };
  },
  SENSITIVITY: (payload) => {
    const { property, borrower, loan, strategy } = buildEngineInputs(payload);
    const deal = solveDSCR(property, borrower, loan, strategy);
    const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
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
  },
  OPTIMIZE: (payload) => {
    const { property, borrower, loan, strategy } = buildEngineInputs(payload);
    const options = generateStructureOptions(property, borrower, loan, strategy);
    return { options };
  },
  STATE: (payload) => {
    const ppp = checkPPPLegal(
      payload.state,
      payload.entityType as any,
      payload.loanAmount,
      payload.unitCount,
      payload.productType as any
    );
    return { state: payload.state, ppp };
  },
};

function runInline(type: string, payload: any): Promise<any> {
  const handler = INLINE_HANDLERS[type];
  if (!handler) return Promise.reject(new Error(`Unknown engine task type: ${type}`));
  try {
    return Promise.resolve(handler(payload));
  } catch (err) {
    return Promise.reject(err);
  }
}

class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks = new Map<string, Task>();
  private nextWorkerIndex = 0;
  private size: number;
  private initialized = false;
  private consecutiveCrashes = 0;
  private crashWindowStart = 0;
  private degraded = false;

  constructor(size: number) {
    this.size = size;
  }

  /** True once the pool has crash-looped and permanently handed off to inline execution. */
  public isDegraded(): boolean {
    return this.degraded;
  }

  private ensureInitialized() {
    if (this.initialized || this.size <= 0 || this.degraded) return;
    this.initialized = true;
    for (let i = 0; i < this.size; i++) {
      this.createWorker();
    }
  }

  /**
   * Records a worker death and decides whether to respawn (and how long to
   * wait) or to give up on worker threads for the lifetime of this process.
   */
  private noteCrashAndScheduleRespawn() {
    // Already given up (this fires again for each worker terminated below) —
    // don't re-log or re-count.
    if (this.degraded) {
      this.drainQueueInline();
      return;
    }

    const now = Date.now();
    if (this.crashWindowStart === 0 || now - this.crashWindowStart > CRASH_WINDOW_MS) {
      this.crashWindowStart = now;
      this.consecutiveCrashes = 0;
    }
    this.consecutiveCrashes += 1;

    if (this.consecutiveCrashes >= MAX_CONSECUTIVE_CRASHES) {
      this.degraded = true;
      console.error(
        `Engine worker pool disabled: ${this.consecutiveCrashes} consecutive worker crashes within ` +
          `${CRASH_WINDOW_MS}ms. Falling back to inline execution for the remaining life of this process. ` +
          `Check that the worker entrypoint (${workerPath}) exists and loads.`
      );
      for (const worker of this.workers.splice(0)) {
        void worker.terminate();
      }
      this.drainQueueInline();
      return;
    }

    const delay = Math.min(
      RESPAWN_BASE_DELAY_MS * 2 ** (this.consecutiveCrashes - 1),
      RESPAWN_MAX_DELAY_MS
    );
    console.error(
      `Engine worker crashed (${this.consecutiveCrashes}/${MAX_CONSECUTIVE_CRASHES} in window); ` +
        `respawning in ${delay}ms`
    );

    // Intentionally NOT unref'd: queued tasks are waiting on this respawn, and
    // an unref'd timer lets the event loop drain out from under them, leaving
    // their promises permanently unsettled. Bounded by MAX_CONSECUTIVE_CRASHES
    // (after which the pool degrades and stops scheduling respawns entirely).
    setTimeout(() => {
      if (this.degraded) return;
      this.createWorker();
      this.processQueue();
    }, delay);
  }

  /** Once degraded, queued work still has to complete — run it in-process. */
  private drainQueueInline() {
    const queued = this.taskQueue.splice(0);
    for (const task of queued) {
      runInline(task.type, task.payload).then(task.resolve, task.reject);
    }
  }

  private createWorker() {
    // If in dev, we need to instruct worker_threads to use ts-node/tsx. 
    // Since we use tsx, passing the path works mostly if tsx is registered.
    // For safety, we rely on the compiled CJS file in prod.
    let worker: Worker;
    try {
      worker = new Worker(workerPath, {
        execArgv: isProd ? [] : ["--import", "tsx"],
      });
    } catch (err) {
      // A missing/unreadable entrypoint normally surfaces as an async "error"
      // event, but a synchronous throw here (bad path, resource limits) would
      // otherwise escape from the respawn timer and take the process down.
      console.error("Failed to spawn engine worker:", err);
      this.noteCrashAndScheduleRespawn();
      return;
    }

    worker.on("message", (msg) => {
      const { id, success, result, error } = msg;
      // A completed round-trip proves the worker entrypoint is healthy, so the
      // crash counter is "consecutive" in the useful sense.
      this.consecutiveCrashes = 0;
      this.crashWindowStart = 0;
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

    // Node fires 'error' then 'exit' for a single fatal crash — guard so the
    // cleanup below (reject stranded tasks, respawn, drain queue) runs once.
    let crashHandled = false;
    const handleWorkerDeath = () => {
      if (crashHandled) return;
      crashHandled = true;
      this.workers = this.workers.filter(w => w !== worker);
      // Fail fast: any task already dispatched to this worker will never get
      // a "message" response now, so reject it immediately instead of leaving
      // its Promise hanging until an external timeout (or forever).
      for (const [id, task] of this.activeTasks) {
        if (task.worker === worker) {
          this.activeTasks.delete(id);
          task.reject(new Error("Worker crashed/exited before completing this task"));
        }
      }
      this.noteCrashAndScheduleRespawn();
      this.processQueue();
    };

    worker.on("error", (err) => {
      console.error("Worker error:", err);
      handleWorkerDeath();
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
      handleWorkerDeath();
    });

    this.workers.push(worker);
  }

  private processQueue() {
    if (this.taskQueue.length === 0) return;

    if (this.degraded) {
      this.drainQueueInline();
      return;
    }

    // Lazy initialize worker threads if they haven't been yet
    this.ensureInitialized();
    if (this.workers.length === 0) return;

    // The pool shrinks when a worker dies, so a previously valid round-robin
    // index can point past the end. Reading undefined here used to throw
    // "Cannot read properties of undefined (reading 'postMessage')" out of the
    // crash handler — an uncaught TypeError that took the process down during
    // exactly the incident the pool was supposed to survive.
    if (this.nextWorkerIndex >= this.workers.length) this.nextWorkerIndex = 0;

    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    
    const task = this.taskQueue.shift();
    if (task) {
      task.worker = worker;
      this.activeTasks.set(task.id, task);
      worker.postMessage({ id: task.id, type: task.type, payload: task.payload });
    }
  }

  public runTask(type: string, payload: any): Promise<any> {
    if (this.degraded) return runInline(type, payload);
    return new Promise((resolve, reject) => {
      const id = (Math.random() * 1e9).toString(36);
      this.taskQueue.push({ id, type, payload, resolve, reject });
      this.processQueue();
    });
  }
}

const pool = new WorkerPool(WORKER_POOL_SIZE);

/**
 * Single dispatch point. Work runs inline when the pool is disabled by
 * configuration (WORKER_POOL_SIZE=0 / Vercel) or when the pool has degraded
 * after a crash loop; otherwise it goes to a worker thread.
 */
function dispatch(type: string, payload: any): Promise<any> {
  if (!usesWorkerPool() || pool.isDegraded()) return runInline(type, payload);
  return pool.runTask(type, payload);
}

export function runSolveDSCR(payload: any): Promise<any> {
  return dispatch("SOLVE", payload);
}

export function runSensitivity(payload: any): Promise<any> {
  return dispatch("SENSITIVITY", payload);
}

export function runOptimize(payload: any): Promise<any> {
  return dispatch("OPTIMIZE", payload);
}

export function runStateRules(payload: any): Promise<any> {
  return dispatch("STATE", payload);
}
