import { beforeEach, describe, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => ({
  solveDSCR: vi.fn(),
  checkPPPLegal: vi.fn(),
  computeBreakevenResult: vi.fn(),
  generateStructureOptions: vi.fn(),
}));

const inputs = vi.hoisted(() => ({
  buildEngineInputs: vi.fn(),
}));

vi.mock("./engine/index", () => engine);
vi.mock("./engine/inputs", () => inputs);

type WorkerResponse = {
  id: string;
  success: boolean;
  result?: unknown;
  code?: string;
  error?: string;
};

type ProcessWorkerMessage = (message: unknown) => WorkerResponse;

const worker = (await import("./engineWorker")) as unknown as {
  processWorkerMessage: ProcessWorkerMessage;
};

const validDeal = {
  purchasePrice: 400_000,
  monthlyRent: 3_000,
  state: "TX",
};

const engineInputs = {
  property: {
    purchasePrice: 400_000,
    annualTaxes: 4_800,
    annualInsurance: 2_000,
    hoa: 0,
    floodInsurance: 0,
  },
  borrower: {},
  loan: { term: "30_YR", ltv: 75 },
  strategy: "LTR",
};

function solveRequest(payload: unknown = validDeal) {
  return { id: "task_1", type: "SOLVE", payload };
}

function nestedValue(depth: number): Record<string, unknown> {
  let value: Record<string, unknown> = { leaf: true };
  for (let index = 0; index < depth; index += 1) {
    value = { next: value };
  }
  return value;
}

beforeEach(() => {
  vi.resetAllMocks();
  inputs.buildEngineInputs.mockReturnValue(engineInputs);
  engine.solveDSCR.mockReturnValue({ dscr: 1.25, solvedRate: 7.5 });
  engine.computeBreakevenResult.mockReturnValue({});
  engine.generateStructureOptions.mockReturnValue([]);
  engine.checkPPPLegal.mockReturnValue({ allowed: true });
});

describe("engine worker trust boundary", () => {
  it("rejects malformed envelopes, unsafe request IDs, and unknown operations", () => {
    expect(worker.processWorkerMessage([])).toMatchObject({
      id: "",
      success: false,
      code: "INVALID_MESSAGE",
      error: "Malformed worker request.",
    });

    expect(
      worker.processWorkerMessage({ ...solveRequest(), id: "../not-a-task" }),
    ).toMatchObject({
      id: "",
      success: false,
      code: "INVALID_MESSAGE",
    });

    expect(
      worker.processWorkerMessage({ ...solveRequest(), type: "DELETE_EVERYTHING" }),
    ).toMatchObject({
      id: "task_1",
      success: false,
      code: "UNKNOWN_OPERATION",
      error: "Unsupported engine operation.",
    });
  });

  it("rejects polluted, non-finite, or oversized task payloads before dispatch", () => {
    const prototypePayload = JSON.parse(
      '{"purchasePrice":400000,"monthlyRent":3000,"state":"TX","__proto__":{"polluted":true}}',
    );
    const oversizedPayload = {
      ...validDeal,
      notes: "x".repeat(20_001),
    };

    for (const payload of [
      prototypePayload,
      { ...validDeal, purchasePrice: Number.POSITIVE_INFINITY },
      { ...validDeal, purchasePrice: 1_000_000_000_001 },
      oversizedPayload,
      { ...validDeal, nested: Array.from({ length: 2_001 }, () => 1) },
      { ...validDeal, nested: nestedValue(17) },
    ]) {
      expect(worker.processWorkerMessage(solveRequest(payload))).toMatchObject({
        id: "task_1",
        success: false,
        code: "INVALID_INPUT",
        error: "Engine input is invalid.",
      });
    }

    expect(inputs.buildEngineInputs).not.toHaveBeenCalled();
  });

  it("validates STATE task fields before calling the state rules engine", () => {
    expect(
      worker.processWorkerMessage({
        id: "task_1",
        type: "STATE",
        payload: {
          state: "Texas",
          entityType: "LLC",
          loanAmount: 300_000,
          unitCount: 1,
          productType: "SCRIPTED",
        },
      }),
    ).toMatchObject({
      id: "task_1",
      success: false,
      code: "INVALID_INPUT",
    });

    expect(engine.checkPPPLegal).not.toHaveBeenCalled();
  });

  it("returns a compatible bounded result for a known operation", () => {
    expect(worker.processWorkerMessage(solveRequest())).toEqual({
      id: "task_1",
      success: true,
      result: { deal: { dscr: 1.25, solvedRate: 7.5 } },
    });
  });

  it("converts engine exceptions to a stable, non-sensitive failure", () => {
    engine.solveDSCR.mockImplementation(() => {
      throw new Error("database password: should never cross a worker boundary");
    });

    const response = worker.processWorkerMessage(solveRequest());

    expect(response).toEqual({
      id: "task_1",
      success: false,
      code: "ENGINE_FAILURE",
      error: "Engine task failed.",
    });
    expect(JSON.stringify(response)).not.toContain("database password");
  });

  it("blocks cyclic, non-finite, and unbounded engine output", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    for (const unsafeDeal of [
      cyclic,
      { solvedRate: Number.NaN },
      { solvedRate: 1_000_000_000_001 },
      { details: "x".repeat(20_001) },
      { table: Array.from({ length: 2_001 }, () => 0) },
      { nested: nestedValue(17) },
    ]) {
      engine.solveDSCR.mockReturnValueOnce(unsafeDeal);
      expect(worker.processWorkerMessage(solveRequest())).toEqual({
        id: "task_1",
        success: false,
        code: "INVALID_OUTPUT",
        error: "Engine produced an invalid result.",
      });
    }
  });
});
