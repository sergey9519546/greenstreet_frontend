import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RULES_PATH = resolve(process.cwd(), "firestore.rules");
const RULE_SOURCE = readFileSync(RULES_PATH, "utf8");
const CONTRACT_SCOPE = "static source preservation only; not an emulator authorization proof, deployment verification, IAM audit, or privacy approval";

function matchBody(matchDeclaration: string): string {
  const declarationOffset = RULE_SOURCE.indexOf(matchDeclaration);

  if (declarationOffset === -1) {
    throw new Error(`Could not find ${matchDeclaration} in ${RULES_PATH}.`);
  }

  const openingBraceOffset = RULE_SOURCE.indexOf("{", declarationOffset + matchDeclaration.length);
  let braceDepth = 0;

  for (let index = openingBraceOffset; index < RULE_SOURCE.length; index += 1) {
    const character = RULE_SOURCE[index];

    if (character === "{") {
      braceDepth += 1;
    } else if (character === "}") {
      braceDepth -= 1;

      if (braceDepth === 0) {
        return RULE_SOURCE.slice(openingBraceOffset + 1, index);
      }
    }
  }

  throw new Error(`Could not find the closing brace for ${matchDeclaration} in ${RULES_PATH}.`);
}

describe(`Firestore rules preservation contract (${CONTRACT_SCOPE})`, () => {
  it("keeps the global catch-all path fail-closed", () => {
    const catchAllRules = matchBody("match /{document=**}");

    expect(catchAllRules).toMatch(/allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;/);
  });

  it("keeps browser access to public leads fail-closed", () => {
    const leadRules = matchBody("match /leads/{leadId}");

    expect(leadRules).toMatch(/allow\s+read\s*,\s*write\s*:\s*if\s+false\s*;/);
  });

  it("keeps audit logs immutable after creation", () => {
    const auditLogRules = matchBody("match /auditLogs/{logId}");

    expect(auditLogRules).toMatch(/allow\s+update\s*:\s*if\s+false\s*;/);
    expect(auditLogRules).toMatch(/allow\s+delete\s*:\s*if\s+false\s*;/);
  });

  it("keeps user, deal, and artifact access authenticated and owner-scoped", () => {
    const userRules = matchBody("match /users/{userId}");
    const dealRules = matchBody("match /deals/{dealId}");
    const artifactRules = matchBody("match /artifacts/{appId}/users/{userId}/{document=**}");

    expect(RULE_SOURCE).toMatch(/function\s+isAuthenticated\s*\(\s*\)\s*\{\s*return\s+request\.auth\s*!=\s*null\s*;\s*\}/);
    expect(RULE_SOURCE).toMatch(/function\s+isOwner\s*\(\s*userId\s*\)\s*\{\s*return\s+isAuthenticated\s*\(\s*\)\s*&&\s*request\.auth\.uid\s*==\s*userId\s*;\s*\}/);

    expect(userRules).toMatch(/allow\s+read\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)\s*;/);
    expect(userRules).toMatch(/allow\s+create\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)/);
    expect(userRules).toMatch(/allow\s+update\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)/);

    expect(dealRules).toMatch(/allow\s+read\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid\s*;/);
    expect(dealRules).toMatch(/allow\s+create\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*request\.resource\.data\.userId\s*==\s*request\.auth\.uid/);
    expect(dealRules).toMatch(/allow\s+update\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid[\s\S]*?request\.resource\.data\.userId\s*==\s*resource\.data\.userId/);
    expect(dealRules).toMatch(/allow\s+delete\s*:\s*if\s+isAuthenticated\s*\(\s*\)\s*&&\s*resource\.data\.userId\s*==\s*request\.auth\.uid\s*;/);

    expect(artifactRules).toMatch(/allow\s+read\s*,\s*write\s*:\s*if\s+isOwner\s*\(\s*userId\s*\)\s*;/);
  });

  it("contains no unconditional or always-true broad allow statement", () => {
    const unconditionalAllowStatement = /\ballow\s+(?:read|write|create|update|delete)(?:\s*,\s*(?:read|write|create|update|delete))*\s*;/g;
    const alwaysTrueAllowStatement = /\ballow\s+(?:read|write|create|update|delete)(?:\s*,\s*(?:read|write|create|update|delete))*\s*:\s*if\s+true\s*;/g;

    expect([...RULE_SOURCE.matchAll(unconditionalAllowStatement)]).toEqual([]);
    expect([...RULE_SOURCE.matchAll(alwaysTrueAllowStatement)]).toEqual([]);
  });
});
