import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

type JsonRecord = Record<string, unknown>;

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readRepositoryFile(path)) as JsonRecord;
}

function record(value: unknown): JsonRecord {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  expect(Array.isArray(value)).toBe(false);
  return value as JsonRecord;
}

function rewritesFrom(config: JsonRecord): JsonRecord[] {
  const rewrites = record(config.hosting ?? config).rewrites;
  expect(Array.isArray(rewrites)).toBe(true);
  return rewrites as JsonRecord[];
}

const packageManifest = readJson("package.json");
const vercelConfig = readJson("vercel.json");
const firebaseConfig = readJson("firebase.json");
const vercelApiWrapper = readRepositoryFile("api/index.js");
const firebaseFunction = readRepositoryFile("src/function.ts");
const serverApp = readRepositoryFile("src/serverApp.ts");

// This is intentionally a static topology check. It makes no statement about
// live deployment state, DNS/hosts, service configuration, or runtime policy.
describe("deployment adapter preservation contract", () => {
  it("keeps build outputs available to the standalone, Vercel, and Firebase adapters", () => {
    const scripts = record(packageManifest.scripts);
    expect(packageManifest.main).toBe("dist/function.cjs");
    expect(scripts.build).toBeTypeOf("string");

    const buildCommand = scripts.build as string;
    for (const artifact of [
      "dist/server.cjs",
      "dist/engineWorker.cjs",
      "dist/vercel.cjs",
      "dist/function.cjs",
    ]) {
      expect(buildCommand).toContain(`--outfile=${artifact}`);
    }
    expect(buildCommand).toMatch(
      /esbuild\s+src\/serverApp\.ts[\s\S]*?--outfile=dist\/vercel\.cjs/,
    );

    const functions = record(vercelConfig.functions);
    const apiFunction = record(functions["api/index.js"]);
    expect(apiFunction.includeFiles).toBe("dist/{vercel,engineWorker}.cjs");

    const firebaseFunctions = record(firebaseConfig.functions);
    expect(firebaseFunctions.source).toBe(".");
    expect(firebaseFunctions.predeploy).toEqual(expect.arrayContaining(["npm run build"]));
    expect(record(firebaseConfig.hosting).public).toBe("dist");
  });

  it("keeps Vercel API and health traffic behind its bundled Express wrapper before the SPA fallback", () => {
    expect(vercelApiWrapper).toMatch(/require\(["']\.\.\/dist\/vercel\.cjs["']\)/);
    expect(vercelApiWrapper).toMatch(/const\s*\{\s*app\s*\}\s*=/);
    expect(vercelApiWrapper).toMatch(/export\s+default\s+app\s*;/);

    const rewrites = rewritesFrom(vercelConfig);
    const apiDestinations = ["/api", "/api/(.*)", "/health"].map((source) => {
      const rewrite = rewrites.find((candidate) => candidate.source === source);
      expect(rewrite).toBeDefined();
      return rewrites.indexOf(rewrite!);
    });
    const spaFallback = rewrites.findIndex(
      (rewrite) => rewrite.source === "/(.*)" && rewrite.destination === "/index.html",
    );

    for (const index of apiDestinations) {
      expect(rewrites[index]?.destination).toBe("/api/index.js");
      expect(index).toBeLessThan(spaFallback);
    }
    expect(spaFallback).toBeGreaterThanOrEqual(0);
  });

  it("keeps Firebase API rewrites bound to the Cloud Function that wraps the shared server app", () => {
    const firebaseRewrites = rewritesFrom(firebaseConfig);
    const apiRewrite = firebaseRewrites.find((rewrite) => rewrite.source === "/api/**");
    const spaFallback = firebaseRewrites.find((rewrite) => rewrite.source === "**");

    expect(apiRewrite).toEqual(expect.objectContaining({ function: "api" }));
    expect(spaFallback).toEqual(expect.objectContaining({ destination: "/index.html" }));
    expect(firebaseRewrites.indexOf(apiRewrite!)).toBeLessThan(firebaseRewrites.indexOf(spaFallback!));

    expect(serverApp).toMatch(/export\s+const\s+app\s*=\s*express\(\)/);
    expect(firebaseFunction).toMatch(/import\s*\{\s*app\s*\}\s*from\s*["']\.\/serverApp["']/);
    expect(firebaseFunction).toMatch(/export\s+const\s+api\s*=\s*onRequest\([\s\S]*,\s*app\s*\)/);
  });
});
