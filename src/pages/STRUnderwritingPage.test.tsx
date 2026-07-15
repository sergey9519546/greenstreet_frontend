import { describe, expect, it } from "vitest";
import { formatSTRWorldMonthlyOutput } from "./STRUnderwritingPage";

describe("STRUnderwritingPage World 3 output", () => {
  it.each([
    [1, "$1/mo modeled"],
    [2_800, "$2,800/mo modeled"],
  ])("presents exact documented revenue of $%d", (documentedRent, expectedOutput) => {
    expect(formatSTRWorldMonthlyOutput(documentedRent)).toBe(expectedOutput);
  });
});
