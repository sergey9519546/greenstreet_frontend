import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, describe, expect, it, vi } from "vitest";

import { logger } from "./logger";
import { app } from "./serverApp";

const trustedOrigin = "http://localhost:3000";
const untrustedOrigin = "https://untrusted.example";
const syntheticPii = [
  "Synthetic Contract Person",
  "synthetic.contract@example.test",
  "+1 202 555 0199",
] as const;

const syntheticLead = {
  name: syntheticPii[0],
  email: syntheticPii[1],
  phone: syntheticPii[2],
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
  submissionId: "00000000-0000-4000-8000-000000000002",
} as const;

let server: Server | undefined;
let baseUrl: string | undefined;

async function request(path: string, init: RequestInit): Promise<Response> {
  if (!server) {
    server = createServer(app);
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  }
  return fetch(`${baseUrl}${path}`, init);
}

function postJson(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  return request(path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function expectNoSyntheticPii(responseBody: string) {
  const normalizedBody = responseBody.toLowerCase();
  for (const value of syntheticPii) {
    expect(normalizedBody).not.toContain(value.toLowerCase());
  }
}

function expectApiSecurityHeaders(response: Response) {
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(response.headers.get("x-frame-options")).toBe("DENY");
  expect(response.headers.get("referrer-policy")).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers.get("x-dns-prefetch-control")).toBe("off");
  expect(response.headers.get("content-security-policy")).toBe(
    "default-src 'none'",
  );
  expect(response.headers.get("permissions-policy")).toBe(
    "camera=(), microphone=(), geolocation=()",
  );
  expect(response.headers.get("x-powered-by")).toBeNull();
}

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((error) => error ? reject(error) : resolve());
    });
  }
});

describe("server API preservation contracts", () => {
  it("never logs malformed request bodies, headers, or synthetic PII", async () => {
    const syntheticToken = "synthetic-bearer-token-for-log-regression";
    const malformedBody = JSON.stringify({
      name: syntheticPii[0],
      email: syntheticPii[1],
      phone: syntheticPii[2],
    }).slice(0, -1);
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);

    try {
      const response = await request("/api/dscr/solve", {
        method: "POST",
        headers: {
          authorization: `Bearer ${syntheticToken}`,
          "content-type": "application/json",
          "x-synthetic-private-header": syntheticPii[1],
        },
        body: malformedBody,
      });

      expect(response.status).toBe(400);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        {
          errorType: "malformed_json",
          requestId: expect.any(String),
          status: 400,
        },
        "Unhandled express error",
      );

      const serializedCalls = JSON.stringify(errorSpy.mock.calls).toLowerCase();
      for (const privateValue of [
        ...syntheticPii,
        syntheticToken,
        malformedBody,
      ]) {
        expect(serializedCalls).not.toContain(privateValue.toLowerCase());
      }
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("adds baseline security headers before malformed JSON parsing", async () => {
    const response = await request("/api/dscr/solve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });

    expect(response.status).toBe(400);
    expectApiSecurityHeaders(response);
  });

  it("adds baseline security headers before rejecting an invalid bearer token", async () => {
    const response = await postJson(
      "/api/dscr/solve",
      {},
      { authorization: "Bearer not-a-valid-jwt" },
    );

    expect(response.status).toBe(401);
    expectApiSecurityHeaders(response);
  });

  it("keeps anonymous narration unreachable without reflecting its request body", async () => {
    const response = await postJson("/api/narrate", {
      deal: { dscr: 1.25, solvedRate: 7.125 },
      context: `${syntheticPii[0]} can be reached at ${syntheticPii[1]}.`,
    });
    const body = await response.text();

    expect(response.status).toBe(401);
    expect(JSON.parse(body)).toEqual({
      error: "Unauthorized: authentication required",
    });
    expectNoSyntheticPii(body);
  });

  it("keeps public DSCR validation reachable without global authentication", async () => {
    const response = await postJson("/api/dscr/solve", {});
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(JSON.parse(body)).toMatchObject({ error: "Validation failed" });
    expectNoSyntheticPii(body);
  });

  it.each(["/api/dscr/optimize", "/api/dscr/state"])(
    "keeps held endpoint %s fail closed before validation",
    async (path) => {
      const response = await postJson(path, {
        state: "not-a-state",
        submittedFor: syntheticPii[0],
      });
      const body = await response.text();

      expect(response.status).toBe(503);
      expect(JSON.parse(body)).toMatchObject({
        code: "TOOL_RELIABILITY_HOLD",
      });
      expectNoSyntheticPii(body);
    },
  );

  it("keeps lead acknowledgements minimal and rejects untrusted origins", async () => {
    const admittedResponse = await postJson(
      "/api/leads",
      { ...syntheticLead, website: "https://synthetic-honeypot.example" },
      { origin: trustedOrigin },
    );
    const admittedBody = await admittedResponse.text();
    const rejectedResponse = await postJson(
      "/api/leads",
      { ...syntheticLead, website: "" },
      { origin: untrustedOrigin },
    );
    const rejectedBody = await rejectedResponse.text();

    expect(admittedResponse.status).toBe(202);
    expect(JSON.parse(admittedBody)).toEqual({ accepted: true });
    expectNoSyntheticPii(admittedBody);

    expect(rejectedResponse.status).toBe(403);
    expect(JSON.parse(rejectedBody)).toEqual({
      error: "Request origin is not allowed",
    });
    expect(rejectedResponse.headers.get("access-control-allow-origin")).toBeNull();
    expectNoSyntheticPii(rejectedBody);
  });

  it("allows known browser origins and preserves API safety headers", async () => {
    const preflight = await request("/api/dscr/solve", {
      method: "OPTIONS",
      headers: {
        origin: trustedOrigin,
        "access-control-request-method": "POST",
      },
    });
    const apiResponse = await postJson(
      "/api/dscr/optimize",
      {},
      { origin: trustedOrigin },
    );

    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe(trustedOrigin);
    expect(preflight.headers.get("access-control-allow-methods")).toContain("POST");
    expect(preflight.headers.get("access-control-allow-credentials")).toBeNull();

    expect(apiResponse.headers.get("access-control-allow-origin")).toBe(trustedOrigin);
    expectApiSecurityHeaders(apiResponse);
  });
});
