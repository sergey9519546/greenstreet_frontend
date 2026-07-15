import { describe, expect, it } from "vitest";

import { DealRequestSchema, StateRequestSchema } from "./schemas";

const deal = (state: string) => ({
  purchasePrice: 425_000,
  monthlyRent: 3_000,
  state,
});

describe.each([
  ["DealRequestSchema", (state: string) => DealRequestSchema.parse(deal(state)).state],
  ["StateRequestSchema", (state: string) => StateRequestSchema.parse({ state }).state],
])("%s state validation", (_name, parseState) => {
  it.each(["ZZ", "California", "CA-extra", "CA<script>"])("rejects %s", (state) => {
    expect(() => parseState(state)).toThrow();
  });

  it.each([
    [" ca ", "CA"],
    ["dc", "DC"],
    [" DC ", "DC"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(parseState(input)).toBe(expected);
  });
});
