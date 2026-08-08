import { describe, expect, it } from "vitest";
import { DSCR_PROGRAMS, lookupMaxLTV, meetsProgramDscr } from "./dscrPrograms";

const program = (id: string) => {
  const found = DSCR_PROGRAMS.find((p) => p.id === id);
  if (!found) throw new Error(`Missing test program ${id}`);
  return found;
};

describe("lookupMaxLTV", () => {
  it("uses the documented numeric tier before a no-ratio fallback", () => {
    expect(lookupMaxLTV(program("maple"), 720, 500_000, 1.1, "purchase")).toBe(85);
    expect(lookupMaxLTV(program("oak"), 720, 500_000, 1.1, "purchase")).toBe(85);
  });

  it("retains a real no-ratio fallback when no numeric tier applies", () => {
    expect(lookupMaxLTV(program("maple"), 640, 500_000, 0.5, "purchase")).toBe(70);
    expect(lookupMaxLTV(program("maple"), 720, 500_000, 0.8, "purchase")).toBe(85);
  });

  it("uses Birch's explicit below-0.75 tier rather than looking for a null tier", () => {
    expect(lookupMaxLTV(program("birch"), 680, 500_000, 0.5, "purchase")).toBe(70);
  });

  it("applies Willow's bounded below-1.0 overlay", () => {
    expect(lookupMaxLTV(program("willow"), 740, 500_000, 0.9, "purchase")).toBe(75);
    expect(lookupMaxLTV(program("willow"), 740, 500_000, 0.99, "purchase")).toBe(75);
    expect(lookupMaxLTV(program("willow"), 740, 500_000, 1.0, "purchase")).toBe(80);
    expect(lookupMaxLTV(program("willow"), 700, 500_000, 0.9, "purchase")).toBeNull();
    expect(lookupMaxLTV(program("willow"), 700, 500_000, 1.1, "purchase")).toBe(80);
  });

  it("treats displayed .19 caps as a continuous half-open range", () => {
    expect(lookupMaxLTV(program("magnolia"), 660, 500_000, 1.19, "purchase")).toBeNull();
    expect(lookupMaxLTV(program("magnolia"), 660, 500_000, 1.195, "purchase")).toBeNull();
    expect(lookupMaxLTV(program("magnolia"), 660, 500_000, 1.2, "purchase")).toBe(70);
  });

  it("enforces Birch's property-specific 5+ unit coverage floor", () => {
    expect(meetsProgramDscr(program("birch"), 1.0, false)).toBe(true);
    expect(meetsProgramDscr(program("birch"), 1.09, true)).toBe(false);
    expect(meetsProgramDscr(program("birch"), 1.1, true)).toBe(true);
  });

  it("does not advertise Birch as no-ratio or reuse its 1-4 unit LTV grid for 5+ units", () => {
    expect(program("birch").noRatio).toBe(true);
    expect(program("birch").multiFamilyLtvGridVerified).toBe(false);
  });

  it("stores the sourced Oak minimum without inventing one for every program", () => {
    expect(program("oak").minLoan).toBe(100_000);
    expect(program("maple").minLoan).toBeUndefined();
  });
});
