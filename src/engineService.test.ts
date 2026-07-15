import { describe, expect, it, vi } from "vitest";
import {
  WorkerPool,
  type WorkerLike,
  type WorkerRequest,
  type WorkerResponse,
} from "./engineService";
import { createWorkerMessageHandler } from "./engineWorker";

type Listener = (...args: any[]) => void;

class FakeWorker implements WorkerLike {
  readonly postedMessages: WorkerRequest[] = [];
  terminateCalls = 0;
  postFailure?: Error;
  private readonly listeners = new Map<string, Listener[]>();

  on(event: "message" | "error" | "exit", listener: Listener): WorkerLike {
    const eventListeners = this.listeners.get(event) ?? [];
    eventListeners.push(listener);
    this.listeners.set(event, eventListeners);
    return this;
  }

  removeListener(event: "message" | "error" | "exit", listener: Listener): WorkerLike {
    const eventListeners = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      eventListeners.filter((candidate) => candidate !== listener),
    );
    return this;
  }

  postMessage(message: WorkerRequest): void {
    if (this.postFailure) throw this.postFailure;
    this.postedMessages.push(message);
  }

  terminate(): Promise<number> {
    this.terminateCalls += 1;
    this.emit("exit", 0);
    return Promise.resolve(0);
  }

  emit(event: "message" | "error" | "exit", ...args: any[]): void {
    for (const listener of [...(this.listeners.get(event) ?? [])]) listener(...args);
  }

  listenerCount(): number {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.length, 0);
  }

  succeed(messageIndex: number, result: unknown): void {
    const request = this.postedMessages[messageIndex];
    const response: WorkerResponse = { id: request.id, success: true, result };
    this.emit("message", response);
  }
}

function createPool(
  options: {
    maxQueueSize?: number;
    taskTimeoutMs?: number;
    firstWorkerPostFailure?: Error;
  } = {},
) {
  const workers: FakeWorker[] = [];
  const pool = new WorkerPool({
    size: 1,
    maxQueueSize: options.maxQueueSize ?? 4,
    taskTimeoutMs: options.taskTimeoutMs ?? 1_000,
    workerFactory: () => {
      const worker = new FakeWorker();
      if (workers.length === 0) worker.postFailure = options.firstWorkerPostFailure;
      workers.push(worker);
      return worker;
    },
  });

  return { pool, workers };
}

describe("engine worker protocol", () => {
  it("returns one sanitized response for malformed messages and unknown operations", () => {
    const postMessage = vi.fn();
    const handleMessage = createWorkerMessageHandler(postMessage);

    handleMessage({ id: "request-1", type: "SOLVE", payload: { rent: Infinity } });
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage.mock.calls[0][0]).toEqual({
      id: "request-1",
      success: false,
      error: { code: "INVALID_INPUT", message: "Engine input is invalid." },
    });

    handleMessage({ id: "request-2", type: "DELETE", payload: {} });
    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage.mock.calls[1][0]).toEqual({
      id: "request-2",
      success: false,
      error: { code: "UNKNOWN_OPERATION", message: "Unsupported engine operation." },
    });
  });

  it("does not reflect malformed identifiers or runtime detail", () => {
    const postMessage = vi.fn();
    const handleMessage = createWorkerMessageHandler(postMessage);

    handleMessage({ id: "secret\nstack", type: "SOLVE", payload: {} });

    expect(postMessage).toHaveBeenCalledOnce();
    expect(postMessage.mock.calls[0][0]).toEqual({
      id: "",
      success: false,
      error: { code: "INVALID_MESSAGE", message: "Malformed worker request." },
    });
  });
});

describe("WorkerPool lifecycle", () => {
  it("rejects unsupported operations before starting workers", async () => {
    const { pool, workers } = createPool();

    await expect(pool.runTask("DELETE", {})).rejects.toMatchObject({
      code: "EWORKER_UNKNOWN_OPERATION",
      status: 400,
    });
    expect(workers).toHaveLength(0);
    await pool.shutdown();
  });

  it("rejects non-finite inputs before starting workers", async () => {
    const { pool, workers } = createPool();

    await expect(pool.runTask("SOLVE", { purchasePrice: Number.NaN })).rejects.toMatchObject({
      code: "EWORKER_INVALID_REQUEST",
      status: 422,
    });
    expect(workers).toHaveLength(0);
    await pool.shutdown();
  });

  it("rejects a crashed task and continues dispatching on a replacement", async () => {
    const { pool, workers } = createPool();
    const crashedTask = pool.runTask("SOLVE", { id: 1 });
    const rejected = expect(crashedTask).rejects.toMatchObject({
      code: "EWORKER_CRASH",
      status: 503,
    });

    workers[0].emit("error", new Error("worker exploded"));
    await rejected;

    const nextTask = pool.runTask("SOLVE", { id: 2 });
    workers[1].succeed(0, { solved: true });

    await expect(nextTask).resolves.toEqual({ solved: true });
    await pool.shutdown();
  });

  it("replaces a worker only once when error and exit both fire", async () => {
    const { pool, workers } = createPool();
    const task = pool.runTask("SOLVE", {});
    const rejected = expect(task).rejects.toMatchObject({ code: "EWORKER_CRASH" });
    const failedWorker = workers[0];

    failedWorker.emit("error", new Error("boom"));
    failedWorker.emit("exit", 1);

    await rejected;
    expect(workers).toHaveLength(2);
    await pool.shutdown();
  });

  it("starts a queued task timeout only when that task is dispatched", async () => {
    vi.useFakeTimers();
    try {
      const { pool, workers } = createPool({ taskTimeoutMs: 50 });
      const activeTask = pool.runTask("SOLVE", { id: 1 });
      const queuedTask = pool.runTask("SOLVE", { id: 2 });
      const queuedSettlement = vi.fn();
      void queuedTask.then(queuedSettlement, queuedSettlement);

      await vi.advanceTimersByTimeAsync(40);
      workers[0].succeed(0, "first");
      await expect(activeTask).resolves.toBe("first");

      await vi.advanceTimersByTimeAsync(11);
      expect(queuedSettlement).not.toHaveBeenCalled();

      workers[0].succeed(1, "second");
      await expect(queuedTask).resolves.toBe("second");
      await pool.shutdown();
    } finally {
      vi.useRealTimers();
    }
  });

  it("times out running work, terminates its worker, and opens a fresh slot", async () => {
    vi.useFakeTimers();
    try {
      const { pool, workers } = createPool({ taskTimeoutMs: 50 });
      const task = pool.runTask("OPTIMIZE", {});
      const rejected = expect(task).rejects.toMatchObject({
        code: "EWORKER_TASK_TIMEOUT",
        status: 504,
      });

      await vi.advanceTimersByTimeAsync(50);
      await rejected;

      expect(workers[0].terminateCalls).toBe(1);
      expect(workers).toHaveLength(2);
      await pool.shutdown();
    } finally {
      vi.useRealTimers();
    }
  });

  it("rejects excess waiting work without disturbing accepted tasks", async () => {
    const { pool, workers } = createPool({ maxQueueSize: 1 });
    const activeTask = pool.runTask("SOLVE", { id: 1 });
    const queuedTask = pool.runTask("SOLVE", { id: 2 });

    await expect(pool.runTask("SOLVE", { id: 3 })).rejects.toMatchObject({
      code: "EWORKER_QUEUE_FULL",
      status: 503,
    });

    workers[0].succeed(0, "first");
    await expect(activeTask).resolves.toBe("first");
    workers[0].succeed(1, "second");
    await expect(queuedTask).resolves.toBe("second");
    await pool.shutdown();
  });

  it("settles postMessage failures and remains available", async () => {
    const { pool, workers } = createPool({
      firstWorkerPostFailure: new Error("cannot clone payload"),
    });

    await expect(
      pool.runTask("STATE", {
        state: "CA",
        entityType: "LLC",
        loanAmount: 500_000,
        unitCount: 1,
        productType: "DSCR",
      }),
    ).rejects.toMatchObject({
      code: "EWORKER_POST_MESSAGE",
      status: 500,
    });

    const nextTask = pool.runTask("STATE", {
      state: "CA",
      entityType: "LLC",
      loanAmount: 500_000,
      unitCount: 1,
      productType: "DSCR",
    });
    workers[1].succeed(0, { allowed: true });
    await expect(nextTask).resolves.toEqual({ allowed: true });
    await pool.shutdown();
  });

  it("fails closed on non-finite worker output", async () => {
    const { pool, workers } = createPool();
    const task = pool.runTask("SOLVE", {});
    const rejected = expect(task).rejects.toMatchObject({
      code: "EWORKER_PROTOCOL",
      status: 502,
    });

    workers[0].succeed(0, { solvedRate: Infinity });

    await rejected;
    expect(workers[0].terminateCalls).toBe(1);
    expect(workers).toHaveLength(2);
    await pool.shutdown();
  });

  it("does not expose worker-provided failure detail", async () => {
    const { pool, workers } = createPool();
    const task = pool.runTask("SOLVE", {});
    const request = workers[0].postedMessages[0];

    workers[0].emit("message", {
      id: request.id,
      success: false,
      error: { code: "ENGINE_FAILURE", message: "secret path and stack" },
    });

    await expect(task).rejects.toMatchObject({
      code: "EWORKER_TASK_FAILED",
      message: "Engine task failed.",
    });
    await pool.shutdown();
  });

  it("settles once and clears timers and listeners", async () => {
    vi.useFakeTimers();
    try {
      const { pool, workers } = createPool();
      const task = pool.runTask("SOLVE", {});
      const settlement = vi.fn();
      void task.then(settlement, settlement);

      workers[0].succeed(0, { solved: true });
      workers[0].succeed(0, { solved: false });
      await expect(task).resolves.toEqual({ solved: true });
      await Promise.resolve();

      expect(settlement).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
      expect(workers[0].listenerCount()).toBe(3);

      await pool.shutdown();
      expect(workers[0].listenerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
