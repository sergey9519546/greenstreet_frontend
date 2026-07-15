import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./StressMatrixPage.tsx", import.meta.url), "utf8");

describe("StressMatrixPage narrow layout contract", () => {
  it("contains the 320px layout and keeps matrix overflow local", () => {
    expect(pageSource).toContain(
      ".sm-tool-grid{grid-template-columns:minmax(0,1fr) !important;width:100%;max-width:100%;}",
    );
    expect(pageSource).toContain(
      "max-width:calc(100vw - ${dc.pad} - ${dc.pad});",
    );
    expect(pageSource).toContain(
      ".sm-sidebar,.sm-main,.sm-card{width:100%;max-width:100%;min-width:0;box-sizing:border-box;}",
    );
    expect(pageSource).toContain(".sm-input-box > *{min-width:0;}");
    expect(pageSource).toContain(
      ".sm-matrix-scroll{width:100%;max-width:100%;min-width:0;overflow-x:auto;",
    );
    expect(pageSource).toContain('className="sm-matrix-scroll"');
    expect(pageSource).not.toContain("overflow-x:hidden");
  });
});
