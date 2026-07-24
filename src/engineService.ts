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

const WORKER_POOL_SIZE = process.env.WORKER_POOL_SIZE ? parseInt(process.env.WORKER_POOL_SIZE) : 4;

interface Task {
  id: string;
  type: string;
  payload: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  worker?: Worker;
}

class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks = new Map<string, Task>();
  private nextWorkerIndex = 0;
  private size: number;
  private initialized = false;

  constructor(size: number) {
    this.size = size;
  }

  private ensureInitialized() {
    if (this.initialized || this.size <= 0) return;
    this.initialized = true;
    for (let i = 0; i < this.size; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    // If in dev, we need to instruct worker_threads to use ts-node/tsx. 
    // Since we use tsx, passing the path works mostly if tsx is registered.
    // For safety, we rely on the compiled CJS file in prod.
    const worker = new Worker(workerPath, {
      execArgv: isProd ? [] : ["--import", "tsx"],
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
      this.createWorker();
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
    
    // Lazy initialize worker threads if they haven't been yet
    this.ensureInitialized();
    if (this.workers.length === 0) return;
    
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
    return new Promise((resolve, reject) => {
      const id = (Math.random() * 1e9).toString(36);
      this.taskQueue.push({ id, type, payload, resolve, reject });
      this.processQueue();
    });
  }
}

const pool = new WorkerPool(WORKER_POOL_SIZE);

export function runSolveDSCR(payload: any): Promise<any> {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const { property, borrower, loan, strategy } = buildEngineInputs(payload);
      const deal = solveDSCR(property, borrower, loan, strategy);
      return Promise.resolve({ deal });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("SOLVE", payload);
}

export function runSensitivity(payload: any): Promise<any> {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
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
      return Promise.resolve({ deal, sensitivity });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("SENSITIVITY", payload);
}

export function runOptimize(payload: any): Promise<any> {
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

export function runStateRules(payload: any): Promise<any> {
  if (process.env.WORKER_POOL_SIZE === "0") {
    try {
      const ppp = checkPPPLegal(
        payload.state,
        payload.entityType as any,
        payload.loanAmount,
        payload.unitCount,
        payload.productType as any
      );
      return Promise.resolve({ state: payload.state, ppp });
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return pool.runTask("STATE", payload);
}
