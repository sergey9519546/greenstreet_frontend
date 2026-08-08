import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const markup = readFileSync(
  new URL("../src/marketing/home-markup.html", import.meta.url),
  "utf8",
);
const contract = JSON.parse(
  readFileSync(
    new URL("../src/marketing/home-contract.json", import.meta.url),
    "utf8",
  ),
);
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const actualHash = createHash("sha256").update(markup).digest("hex");

if (actualHash !== contract.sha256) {
  throw new Error(
    `Homepage visual contract changed: expected ${contract.sha256}, received ${actualHash}.`,
  );
}

for (const marker of contract.requiredMarkers) {
  if (!markup.includes(marker)) {
    throw new Error(`Homepage visual contract is missing: ${marker}`);
  }
}

if (!index.includes('<div id="webflow-root">')) {
  throw new Error("index.html must contain the static homepage webflow-root.");
}

if ((index.match(/<div id="root"><\/div>/g) ?? []).length !== 1) {
  throw new Error("index.html must contain exactly one React mount root.");
}

console.log(`Homepage contract verified: ${actualHash}`);
