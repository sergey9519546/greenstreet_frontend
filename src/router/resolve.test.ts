import { describe, expect, it } from "vitest";
import { isKnownRoute, resolveRoute } from "./resolve";

describe("SPA route resolution", () => {
  it("resolves canonical and legacy paths", () => {
    expect(resolveRoute("/")).toBe("marketing");
    expect(resolveRoute("/dscr-calculator")).toBe("dscr-calculator");
    expect(resolveRoute("/lender-intel")).toBe("products");
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
