import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const appSource = readFileSync(resolve(repositoryRoot, "src/App.tsx"), "utf8");

describe("client navigation contract", () => {
  it("forwards the authored known href when the global interceptor navigates", () => {
    expect(appSource).toContain("goToRef.current(resolveRoute(href), href);");
  });
});
