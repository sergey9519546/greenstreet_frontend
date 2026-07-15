import { describe, expect, it } from "vitest";
import {
  STR_HOSTS_INTRINSIC_LAYOUT_CSS,
  STR_HOSTS_NARROW_BREAKPOINT,
} from "./STRHostsPage";

const compactCss = STR_HOSTS_INTRINSIC_LAYOUT_CSS.replace(/\s+/g, "");

describe("STRHostsPage narrow layout", () => {
  it.each([320, 390])("keeps the scenario UI intrinsic at %ipx", (viewportWidth) => {
    expect(viewportWidth).toBeLessThan(STR_HOSTS_NARROW_BREAKPOINT);
    expect(compactCss).toContain(".str-model-grid{grid-template-columns:minmax(0,340px)minmax(0,1fr);min-width:0;max-width:100%}");
    expect(compactCss).toContain(".str-form,.str-output{box-sizing:border-box;min-width:0;max-width:100%}");
    expect(compactCss).toContain(".str-formfieldset{box-sizing:border-box;width:100%;min-inline-size:0;min-width:0;max-width:100%}");
    expect(compactCss).toContain(".str-field,.str-fieldinput{min-width:0;max-width:100%}");
    expect(compactCss).toContain(".str-output,.str-result-grid,.str-stat,.str-chart-scroll,.str-chart,.str-month{min-width:0;max-width:100%}");
    expect(compactCss).toContain(".str-result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}");
    expect(compactCss).toContain(".str-stat,.str-message,.str-error{overflow-wrap:anywhere}");
    expect(compactCss).toContain(".str-chart{width:100%;grid-template-columns:repeat(12,minmax(0,1fr));min-width:0}");
    expect(compactCss).toContain(".str-monthspan{max-width:100%;overflow-wrap:anywhere}");
    expect(compactCss).toContain(".str-hero-grid,.str-model-grid,.str-evidence-grid,.str-close-grid,.str-result-grid{grid-template-columns:minmax(0,1fr)}");
    expect(compactCss).not.toContain("overflow:hidden");
    expect(compactCss).not.toContain("min-width:610px");
  });
});
