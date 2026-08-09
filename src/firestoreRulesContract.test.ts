import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const rulesPath = resolve(process.cwd(), "firestore.rules");
const rulesSource = readFileSync(rulesPath, "utf8");

function matchBody(matchDeclaration: string): string {
  const declarationOffset = rulesSource.indexOf(matchDeclaration);
  if (declarationOffset === -1) {
    throw new Error(`Could not find ${matchDeclaration} in ${rulesPath}.`);
  }

  const openingBraceOffset = rulesSource.indexOf(
    "{",
    declarationOffset + matchDeclaration.length,
  );
  let braceDepth = 0;

  for (let index = openingBraceOffset; index < rulesSource.length; index += 1) {
    const character = rulesSource[index];
    if (character === "{") braceDepth += 1;
    if (character === "}") {
      braceDepth -= 1;
      if (braceDepth === 0) {
        return rulesSource.slice(openingBraceOffset + 1, index);
      }
    }
  }

  throw new Error(`Could not find the closing brace for ${matchDeclaration}.`);
}

// Static source preservation only. Emulator authorization and deployed IAM
// behavior require separate integration verification.
describe("Firestore rules preservation contract", () => {
  it("keeps the global catch-all and browser lead access fail closed", () => {
    expect(matchBody("match /{document=**}")).toMatch(
      /allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;/,
    );
    expect(matchBody("match /leads/{leadId}")).toMatch(
      /allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;/,
    );
  });

  it("keeps audit logs immutable after creation", () => {
    const auditLogRules = matchBody("match /auditLogs/{logId}");
    expect(auditLogRules).toMatch(/allow\s+update\s*:\s*if\s+false\s*;/);
    expect(auditLogRules).toMatch(/allow\s+delete\s*:\s*if\s+false\s*;/);
  });

  it("keeps user, deal, and artifact access authenticated and owner scoped", () => {
    const userRules = matchBody("match /users/{userId}");
    const dealRules = matchBody("match /deals/{dealId}");
    const artifactRules = matchBody(
      "match /artifacts/{appId}/users/{userId}/{document=**}",
    );

    expect(rulesSource).toMatch(
      /function\s+isOwner\s*\(\s*userId\s*\)\s*\{\s*return\s+isAuthenticated\s*\(\s*\)\s*&&\s*request\.auth\.uid\s*==\s*userId\s*;\s*\}/,
    );
    expect(userRules).toMatch(
      /allow\s+read\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)\s*;/,
    );
    expect(dealRules).toMatch(
      /allow\s+read\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid\s*;/,
    );
    expect(dealRules).toMatch(
      /allow\s+update\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid[\s\S]*?&&\s*isValidDeal\s*\(\s*\)\s*;/,
    );
    expect(artifactRules).toMatch(
      /allow\s+read\s*,\s*write\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)\s*;/,
    );
  });

  it("contains no unconditional or always-true broad allow statement", () => {
    const unconditionalAllow = /\ballow\s+(?:read|write|create|update|delete)(?:\s*,\s*(?:read|write|create|update|delete))*\s*;/g;
    const alwaysTrueAllow = /\ballow\s+(?:read|write|create|update|delete)(?:\s*,\s*(?:read|write|create|update|delete))*\s*:\s*if\s+true\s*;/g;

    expect([...rulesSource.matchAll(unconditionalAllow)]).toEqual([]);
    expect([...rulesSource.matchAll(alwaysTrueAllow)]).toEqual([]);
  });
});
