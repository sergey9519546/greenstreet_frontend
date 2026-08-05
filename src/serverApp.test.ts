import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, describe, expect, it } from "vitest";

import { app } from "./serverApp";

const TRUSTED_ORIGIN = "http://localhost:3000";
const UNTRUSTED_ORIGIN = "https://untrusted.example";

// Deliberately synthetic sentinel values make it possible to prove that API
// responses do not reflect submitted lead or narration data.
const SYNTHETIC_PII = [
  "Synthetic Contract Person",
  "synthetic.contract@example.test",
  "+1 202 555 0199",
] as const;

const SYNTHETIC_LEAD = {
  name: SYNTHETIC_PII[0],
  email: SYNTHETIC_PII[1],
  phone: SYNTHETIC_PII[2],
  role: "investor",
  timeline: "exploring",
  propertyType: "sfr",
  propertyValue: 425_000,
  loanAmount: 318_750,
  rent: 3_000,
  rate: 7,
  purpose: "purchase",
  state: "Texas",
  ficoBand: "under-680",
  borrowerType: "entity",
  experience: "0",
  investmentConfirmed: true,
  contactConsent: true,
  page: "/book-demo",
} as const;

let server: Server | undefined;
let baseUrl: string | undefined;

async function request(path: string, init: RequestInit): Promise<Response> {
  if (!server) {
    server = createServer(app);
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }

  return fetch(`${baseUrl}${path}`, init);
}

function postJson(path: string, body: unknown, headers: Record<string, string> = {}) {
  return request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function expectNoSyntheticPII(responseBody: string) {
  const normalizedBody = responseBody.toLowerCase();
  for (const value of SYNTHETIC_PII) {
    expect(normalizedBody).not.toContain(value.toLowerCase());
  }
}

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
  }
});

describe("server API preservation contracts", () => {
  it("keeps anonymous narration unreachable without reflecting its request body", async () => {
    const response = await postJson("/api/narrate", {
      deal: { dscr: 1.25, solvedRate: 7.125 },
      context: `${SYNTHETIC_PII[0]} can be reached at ${SYNTHETIC_PII[1]}.`,
    });
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(JSON.parse(body)).toEqual({ error: "Unauthorized: authentication required" });
    expectNoSyntheticPII(body);
  });

  it("keeps public DSCR validation reachable without global authentication", async () => {
    const publicResponse = await postJson("/api/dscr/solve", {});
    const publicBody = await publicResponse.text();

    // DSCR remains a public demo surface: an anonymous malformed request must
    // reach its validator rather than being rejected by global auth.
    expect(publicResponse.status).toBe(400);
    expect(JSON.parse(publicBody)).toMatchObject({ error: "Validation failed" });
    expectNoSyntheticPII(publicBody);
  });

  it("rejects an unverifiable bearer token before public DSCR validation when the dev bypass is disabled", async () => {
    const syntheticBearerToken = `synthetic-token-for-${SYNTHETIC_PII[1]}`;
    const response = await postJson(
      "/api/dscr/solve",
      { submittedFor: SYNTHETIC_PII[0] },
      { authorization: `Bearer ${syntheticBearerToken}` },
    );
    const body = await response.text();
    const parsedBody = JSON.parse(body);

    // With the non-production dev bypass disabled (the safe default), demo
    // DSCR access is anonymous only when no credential is presented. A supplied
    // but unverifiable credential must fail closed before route validation.
    expect(response.status).toBe(401);
    expect(parsedBody).toMatchObject({ error: expect.stringMatching(/^Unauthorized:/) });
    expect(parsedBody).not.toHaveProperty("issues");
    expect(body).not.toContain(syntheticBearerToken);
    expectNoSyntheticPII(body);
  });

  it.each([
    "/api/dscr/optimize",
    "/api/dscr/state",
  ])("keeps held endpoint %s fail closed before validation", async (path) => {
    const heldResponse = await postJson(path, {
      state: "not-a-state",
      submittedFor: SYNTHETIC_PII[0],
    });
    const heldBody = await heldResponse.text();

    // Reliability-held tools intentionally default-deny, even for malformed
    // requests that would otherwise fail schema validation.
    expect(heldResponse.status).toBe(503);
    expect(JSON.parse(heldBody)).toMatchObject({ code: "TOOL_RELIABILITY_HOLD" });
    expectNoSyntheticPII(heldBody);
  });

  it("keeps lead acknowledgements minimal and rejects untrusted origins before admission", async () => {
    const admittedResponse = await postJson(
      "/api/leads",
      { ...SYNTHETIC_LEAD, website: "https://synthetic-honeypot.example" },
      { origin: TRUSTED_ORIGIN },
    );
    const admittedBody = await admittedResponse.text();
    const rejectedResponse = await postJson(
      "/api/leads",
      { ...SYNTHETIC_LEAD, website: "" },
      { origin: UNTRUSTED_ORIGIN },
    );
    const rejectedBody = await rejectedResponse.text();

    // A filled honeypot follows the intentionally indistinguishable accepted
    // acknowledgement path, so the whole app can be tested without persistence.
    expect(admittedResponse.status).toBe(202);
    expect(JSON.parse(admittedBody)).toEqual({ accepted: true });
    expectNoSyntheticPII(admittedBody);

    expect(rejectedResponse.status).toBe(403);
    expect(JSON.parse(rejectedBody)).toEqual({ error: "Request origin is not allowed" });
    expect(rejectedResponse.headers.get("access-control-allow-origin")).toBeNull();
    expectNoSyntheticPII(rejectedBody);
  });

  it("allows only known browser origins and preserves API safety headers", async () => {
    const trustedPreflight = await request("/api/dscr/solve", {
      method: "OPTIONS",
      headers: {
        origin: TRUSTED_ORIGIN,
        "access-control-request-method": "POST",
      },
    });
    const untrustedPreflight = await request("/api/dscr/solve", {
      method: "OPTIONS",
      headers: {
        origin: UNTRUSTED_ORIGIN,
        "access-control-request-method": "POST",
      },
    });
    const apiResponse = await postJson(
      "/api/dscr/optimize",
      {},
      { origin: TRUSTED_ORIGIN },
    );

    expect(trustedPreflight.status).toBe(204);
    expect(trustedPreflight.headers.get("access-control-allow-origin")).toBe(TRUSTED_ORIGIN);
    expect(trustedPreflight.headers.get("access-control-allow-methods")).toContain("POST");
    expect(trustedPreflight.headers.get("access-control-allow-credentials")).toBeNull();
    expect(untrustedPreflight.headers.get("access-control-allow-origin")).toBeNull();

    expect(apiResponse.headers.get("access-control-allow-origin")).toBe(TRUSTED_ORIGIN);
    expect(apiResponse.headers.get("x-content-type-options")).toBe("nosniff");
    expect(apiResponse.headers.get("x-frame-options")).toBe("DENY");
    expect(apiResponse.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(apiResponse.headers.get("content-security-policy")).toBe("default-src 'none'");
    expect(apiResponse.headers.get("permissions-policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(apiResponse.headers.get("x-powered-by")).toBeNull();
  });
});
