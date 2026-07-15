import { describe, expect, it } from "vitest";

import { DSCR_PROGRAMS, lookupMaxLTV } from "./dscrPrograms";

const program = (id: string) => {
  const match = DSCR_PROGRAMS.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing test program: ${id}`);
  return match;
};

describe("lookupMaxLTV", () => {
  it("uses inclusive published DSCR boundaries without promoting extra precision", () => {
    const maple = program("maple");
    expect(lookupMaxLTV(maple, 720, 1_500_000, 1.00, "purchase")).toBe(85);
    expect(lookupMaxLTV(maple, 720, 1_500_000, 0.9999, "purchase")).toBe(70);
    expect(lookupMaxLTV(maple, 720, 1_500_000, 0.75, "purchase")).toBe(70);
    expect(lookupMaxLTV(maple, 720, 1_500_000, 0.7499, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 720, 1_500_000, null, "purchase")).toBe(70);
  });

  it("uses inclusive amount limits and the next documented band above them", () => {
    const maple = program("maple");
    expect(lookupMaxLTV(maple, 720, 1_500_000, 1, "purchase")).toBe(85);
    expect(lookupMaxLTV(maple, 720, 1_500_000.01, 1, "purchase")).toBe(75);
  });

  it("is independent of row ordering", () => {
    const oak = program("oak");
    const reordered = {
      ...oak,
      grid: oak.grid.map((tier) => ({ ...tier, rows: [...tier.rows].reverse() })),
    };
    expect(lookupMaxLTV(reordered, 740, 1_200_000, 1, "purchase")).toBe(
      lookupMaxLTV(oak, 740, 1_200_000, 1, "purchase")
    );
  });

  it("rejects nonfinite and out-of-range values", () => {
    const maple = program("maple");
    expect(lookupMaxLTV(maple, 720, Number.POSITIVE_INFINITY, 1, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 720, 0, 1, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 299, 500_000, 1, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 851, 500_000, 1, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 720, 500_000, Number.NaN, "purchase")).toBeNull();
    expect(lookupMaxLTV(maple, 720, 500_000, 20.01, "purchase")).toBeNull();
  });
});
