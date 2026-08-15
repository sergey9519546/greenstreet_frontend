import { describe, expect, it } from "vitest";
import { SdrDispatchSchema } from "./sdr";

/**
 * These records are the queue outbound email campaigns are meant to be built
 * from, and they are written with the Admin SDK, which bypasses
 * firestore.rules — so the schema is the only ceiling on what an authenticated
 * caller can persist or, later, put into a message sent from our domain.
 * Every string field shipped without a .max(); these lock that in.
 */
describe("SdrDispatchSchema — every string field is bounded", () => {
  const valid = {
    dealId: "deal-1",
    address: "1 Test St",
    city: "Austin",
    state: "TX",
    estimatedValue: 400_000,
  };

  it("accepts a well-formed dispatch", () => {
    expect(SdrDispatchSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["dealId", 129],
    ["address", 201],
    ["city", 101],
    ["state", 65],
    ["distressReason", 501],
  ])("rejects %s one character over its cap", (field, overBy) => {
    const result = SdrDispatchSchema.safeParse({
      ...valid,
      [field]: "A".repeat(overBy),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a body-filling string that express.json alone would allow", () => {
    // express.json({limit:"100kb"}) is the only other ceiling, and a single
    // field can consume the whole budget without these caps.
    const result = SdrDispatchSchema.safeParse({
      ...valid,
      address: "A".repeat(90_000),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a non-finite estimatedValue rather than persisting Infinity", () => {
    // 1e400 parses to Infinity, which Firestore cannot store and which no
    // downstream arithmetic survives.
    const raw = JSON.parse('{"estimatedValue":1e400}') as { estimatedValue: number };
    expect(raw.estimatedValue).toBe(Infinity);

    const result = SdrDispatchSchema.safeParse({ ...valid, ...raw });

    expect(result.success).toBe(false);
  });

  it("still rejects a missing required field", () => {
    const { address: _omitted, ...withoutAddress } = valid;

    expect(SdrDispatchSchema.safeParse(withoutAddress).success).toBe(false);
  });
});
