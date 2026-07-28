import { describe, expect, it } from "vitest";
import { isKnownRoute, resolveRoute } from "./resolve";

describe("SPA route resolution", () => {
  it("resolves canonical and legacy paths", () => {
    expect(resolveRoute("/")).toBe("marketing");
    expect(resolveRoute("/dscr-calculator")).toBe("dscr-calculator");
    expect(resolveRoute("/apply")).toBe("book-demo");
    expect(resolveRoute("/book-demo")).toBe("book-demo");
    expect(resolveRoute("/lender-intel")).toBe("products");
    expect(resolveRoute("/investgo")).toBe("deal-analyzer");
    expect(resolveRoute("/tools/deal-workspace")).toBe("deal-analyzer");
    expect(resolveRoute("/tools/sensitivity")).toBe("stress-matrix");
    expect(resolveRoute("/tools/scenario-history")).toBe("portfolio");
    expect(resolveRoute("/tools/structure-optimizer")).toBe("structure-optimizer");
  });

  it("keeps blog article routes inside the blog renderer", () => {
    expect(resolveRoute("/blog/what-is-dscr-how-it-works")).toBe("blog-post");
  });

  it("fails unknown paths to a not-found view instead of the homepage", () => {
    expect(resolveRoute("/this-route-does-not-exist")).toBe("not-found");
    expect(resolveRoute("%%%")).toBe("not-found");
    expect(isKnownRoute("/this-route-does-not-exist")).toBe(false);
  });

  it("recognizes absolute external URLs", () => {
    expect(resolveRoute("https://example.com/resource")).toBe("external");
  });
});
