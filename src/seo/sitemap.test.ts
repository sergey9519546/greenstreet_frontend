import { describe, expect, it } from "vitest";
import { TOOL_RELIABILITY_HOLDS } from "../components/toolReliabilityHolds";
import sitemap from "../../public/sitemap.xml?raw";

describe("public sitemap", () => {
  it("does not publish routes for tools on a reliability hold", () => {
    for (const definition of Object.values(TOOL_RELIABILITY_HOLDS)) {
      expect(sitemap).not.toContain(`<loc>https://www.greenstreet.finance${definition.path}</loc>`);
    }
  });
});
