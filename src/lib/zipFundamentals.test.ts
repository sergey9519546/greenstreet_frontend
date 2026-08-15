import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The contract: a lookup either returns a seed or returns null. It never
 * throws, because a ZIP with no coverage is a normal outcome — 28,797 of
 * ~41,000 US ZIPs are covered — and a failed seed must not disturb the tool the
 * visitor is actually using.
 *
 * The shard cache lives at module scope, which is what makes repeat lookups
 * free in the browser. Each test therefore re-imports the module through
 * vi.resetModules() to get a fresh cache; sharing one across tests would let an
 * earlier lookup satisfy a later one and quietly assert nothing.
 */
type Mod = typeof import("./zipFundamentals");

const SHARD = {
  "94110": { r: 3450, i: 1938, p: 1250000, d: 24, y: 3.31, s: "CA", c: "San Francisco" },
  "94111": { p: 980000, s: "CA", c: "San Francisco" },
};

async function freshModule(fetchImpl: ReturnType<typeof vi.fn>): Promise<Mod> {
  vi.resetModules();
  vi.stubGlobal("fetch", fetchImpl);
  return import("./zipFundamentals");
}

const okFetch = () => vi.fn().mockResolvedValue({ ok: true, json: async () => SHARD });

describe("ZIP fundamentals lookup", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = okFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(["9411", "941100", "abcde", "", "  ", "9411a"])(
    "rejects %s without fetching anything",
    async (bad) => {
      const { isValidZip, lookupZip } = await freshModule(fetchMock);

      expect(isValidZip(bad)).toBe(false);
      expect(await lookupZip(bad)).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("maps the compact wire format onto readable fields", async () => {
    const { lookupZip } = await freshModule(fetchMock);

    expect(await lookupZip("94110")).toEqual({
      zip: "94110",
      city: "San Francisco",
      state: "CA",
      rent: 3450,
      insuranceAnnual: 1938,
      listPrice: 1250000,
      daysOnMarket: 24,
      grossYieldPct: 3.31,
    });
  });

  it("fetches the three-digit shard, not a single monolithic file", async () => {
    const { lookupZip } = await freshModule(fetchMock);

    await lookupZip("94110");

    // A single blob would be 3.5MB / 430KB gzipped for one lookup.
    expect(fetchMock).toHaveBeenCalledWith("/data/zip/941.json");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns partial data rather than nothing when a field is absent", async () => {
    // Insurance is Treasury FIO, which covers only CA and FL; rent is ZORI,
    // which covers 8,433 ZIPs. Most ZIPs have some fields and not others.
    const { lookupZip } = await freshModule(fetchMock);

    const result = await lookupZip("94111");

    expect(result?.listPrice).toBe(980000);
    expect(result?.rent).toBeUndefined();
    expect(result?.insuranceAnnual).toBeUndefined();
  });

  it("returns null for a ZIP the shard does not cover", async () => {
    const { lookupZip } = await freshModule(fetchMock);

    expect(await lookupZip("94199")).toBeNull();
  });

  it("caches a shard so repeated lookups share one request", async () => {
    const { lookupZip } = await freshModule(fetchMock);

    await lookupZip("94110");
    await lookupZip("94111");
    await lookupZip("94110");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a 404", { ok: false, status: 404 }, undefined],
    ["a network failure", undefined, new Error("offline")],
  ])("returns null rather than throwing on %s", async (_label, resolved, rejected) => {
    const failing = rejected
      ? vi.fn().mockRejectedValue(rejected)
      : vi.fn().mockResolvedValue(resolved);
    const { lookupZip } = await freshModule(failing);

    await expect(lookupZip("70112")).resolves.toBeNull();
  });
});
