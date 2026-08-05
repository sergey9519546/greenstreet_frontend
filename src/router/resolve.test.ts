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

  it("keeps route-prefix lookalikes outside the SPA while preserving real child routes", () => {
    expect(resolveRoute("/book-demo/unknown")).toBe("not-found");
    expect(resolveRoute("/book-demofoo")).toBe("not-found");
    expect(isKnownRoute("/book-demo/unknown")).toBe(false);
    expect(isKnownRoute("/book-demofoo")).toBe(false);
    expect(isKnownRoute("/blogger")).toBe(false);
    expect(isKnownRoute("/case-studies-fake")).toBe(false);
    expect(isKnownRoute("/blog/what-is-dscr-how-it-works")).toBe(true);
    expect(isKnownRoute("/case-studies/example-scenario")).toBe(true);
  });

  it("recognizes absolute external URLs", () => {
    expect(resolveRoute("https://example.com/resource")).toBe("external");
  });
});
