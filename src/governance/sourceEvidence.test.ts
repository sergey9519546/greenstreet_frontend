import { describe, expect, it } from "vitest";
import {
  evaluateEvidence,
  type EvidenceRequest,
  type SourceEvidence,
} from "./sourceEvidence";

const sha = "a".repeat(64);

const request: EvidenceRequest = {
  subject: "rate-inputs",
  jurisdiction: "CA",
  product: "dscr",
  assertion: "educational-rate-input",
  asOf: "2026-07-28",
  expectedSha256: sha,
};

function evidence(overrides: Partial<SourceEvidence> = {}): SourceEvidence {
  return {
    id: "rate-inputs-2026-07",
    subject: "rate-inputs",
    owner: "pricing",
    sourceArtifact: "evidence/rate-inputs-2026-07.pdf",
    sourceVersion: "2026-07",
    sha256: sha,
    effectiveFrom: "2026-07-01",
    expiresOn: "2026-08-01",
    reviewedOn: "2026-07-15",
    approvedBy: "pricing-owner",
    status: "approved",
    jurisdictions: ["CA"],
    products: ["dscr"],
    assertions: ["educational-rate-input"],
    ...overrides,
  };
}

describe("evaluateEvidence", () => {
  it("denies a request without a matching subject", () => {
    expect(evaluateEvidence([], request)).toEqual({
      allowed: false,
      reasons: ["missing"],
      evidenceIds: [],
    });
  });

  it("allows only a fully approved, in-scope, current, hash-matched record", () => {
    expect(evaluateEvidence([evidence()], request)).toEqual({
      allowed: true,
      reasons: [],
      evidenceIds: ["rate-inputs-2026-07"],
      reviewAgeDays: 13,
    });
  });

  it("denies draft evidence", () => {
    expect(evaluateEvidence([evidence({ status: "draft" })], request).reasons).toContain("not-approved");
  });

  it("denies every non-approved status", () => {
    for (const status of ["draft", "superseded", "expired", "revoked"] as const) {
      expect(evaluateEvidence([evidence({ status })], request).reasons).toContain("not-approved");
    }
  });

  it("denies expired and not-yet-effective evidence against the supplied date", () => {
    expect(evaluateEvidence([evidence({ expiresOn: "2026-07-27" })], request).reasons).toContain("expired");
    expect(evaluateEvidence([evidence({ effectiveFrom: "2026-07-29" })], request).reasons).toContain("not-yet-effective");
  });

  it("denies scope and fingerprint mismatches", () => {
    expect(evaluateEvidence([evidence({ jurisdictions: ["TX"] })], request).reasons).toContain("scope-mismatch");
    expect(evaluateEvidence([evidence({ sha256: "b".repeat(64) })], request).reasons).toContain("hash-mismatch");
    expect(evaluateEvidence([evidence({ assertions: ["different-assertion"] })], request).reasons).toContain("assertion-not-covered");
  });

  it("fails closed for malformed data and allows the inclusive expiry boundary", () => {
    expect(evaluateEvidence([evidence({ owner: "" })], request).reasons).toContain("invalid-record");
    expect(evaluateEvidence([evidence()], { ...request, asOf: "not-a-date" }).reasons).toContain("invalid-record");
    expect(evaluateEvidence([evidence()], { ...request, asOf: "2026-08-01" }).allowed).toBe(true);
  });

  it("denies unresolved conflicting approved records instead of depending on input order", () => {
    const conflict = evidence({
      id: "rate-inputs-2026-07-conflict",
      sha256: "b".repeat(64),
      sourceArtifact: "evidence/rate-inputs-2026-07-conflict.pdf",
    });

    expect(evaluateEvidence([evidence(), conflict], request)).toEqual({
      allowed: false,
      reasons: ["conflicting-approved-records"],
      evidenceIds: ["rate-inputs-2026-07", "rate-inputs-2026-07-conflict"],
    });
    expect(evaluateEvidence([conflict, evidence()], request).reasons).toEqual([
      "conflicting-approved-records",
    ]);
  });

  it("allows only an explicitly superseding record and does not revive its predecessor", () => {
    const successor = evidence({
      id: "rate-inputs-2026-08",
      sha256: "b".repeat(64),
      sourceArtifact: "evidence/rate-inputs-2026-08.pdf",
      supersedes: ["rate-inputs-2026-07"],
    });
    const successorRequest = { ...request, expectedSha256: "b".repeat(64) };

    expect(evaluateEvidence([evidence(), successor], successorRequest)).toEqual({
      allowed: true,
      reasons: [],
      evidenceIds: ["rate-inputs-2026-08"],
      reviewAgeDays: 13,
    });
    expect(evaluateEvidence([evidence(), successor], request).reasons).toEqual([
      "superseded-record",
      "hash-mismatch",
    ]);
  });

  it("does not revive an explicitly superseded predecessor after its successor expires", () => {
    const predecessor = evidence({
      id: "rate-inputs-2026-06",
      expiresOn: "2026-09-01",
      reviewedOn: "2026-07-01",
    });
    const expiredSuccessor = evidence({
      id: "rate-inputs-2026-07",
      sha256: "b".repeat(64),
      sourceArtifact: "evidence/rate-inputs-2026-07.pdf",
      expiresOn: "2026-07-20",
      supersedes: ["rate-inputs-2026-06"],
    });

    const result = evaluateEvidence([predecessor, expiredSuccessor], request);
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("expired");
  });

  it("returns a denial instead of throwing for malformed runtime records or requests", () => {
    const malformedRecord = { ...evidence(), jurisdictions: undefined } as unknown as SourceEvidence;
    expect(() => evaluateEvidence([malformedRecord], request)).not.toThrow();
    expect(evaluateEvidence([malformedRecord], request)).toEqual({
      allowed: false,
      reasons: ["invalid-record"],
      evidenceIds: [],
    });

    const malformedRequest = { ...request, subject: null } as unknown as EvidenceRequest;
    expect(evaluateEvidence([evidence()], malformedRequest).reasons).toEqual(["invalid-record"]);
  });

  it("does not trust replaced Array methods to invent evidence or scope", () => {
    const hostileRecords = [] as SourceEvidence[];
    Object.defineProperty(hostileRecords, "filter", { value: () => [evidence()] });
    expect(evaluateEvidence(hostileRecords, request).allowed).toBe(false);

    const hostileScope: string[] = [];
    Object.defineProperties(hostileScope, {
      every: { value: () => true },
      includes: { value: () => true },
    });
    expect(evaluateEvidence([
      evidence({ jurisdictions: hostileScope, products: hostileScope, assertions: hostileScope }),
    ], request).reasons).toContain("invalid-record");
  });

  it("rejects a whole corrupt collection, inherited fields, and throwing accessors without throwing", () => {
    expect(evaluateEvidence([evidence(), null as unknown as SourceEvidence], request).reasons).toEqual(["invalid-record"]);
    expect(evaluateEvidence([Object.create(evidence()) as SourceEvidence], request).reasons).toEqual(["invalid-record"]);
    expect(evaluateEvidence([evidence()], Object.create(request) as EvidenceRequest).reasons).toEqual(["invalid-record"]);

    const throwing = new Proxy({}, { get() { throw new Error("trap"); } }) as SourceEvidence;
    expect(() => evaluateEvidence([throwing], request)).not.toThrow();
    expect(evaluateEvidence([throwing], request).reasons).toEqual(["invalid-record"]);
  });

  it("rejects duplicate identity, fingerprint, and invalid supersession topology", () => {
    const duplicateId = evidence({ id: "duplicate" });
    expect(evaluateEvidence([
      duplicateId,
      evidence({ id: "duplicate", status: "revoked", sourceArtifact: "revoked.pdf" }),
    ], request).reasons).toEqual(["duplicate-record-id"]);

    expect(evaluateEvidence([
      evidence({ id: "first" }),
      evidence({ id: "second", sourceArtifact: "same-fingerprint.pdf" }),
    ], request).reasons).toEqual(["duplicate-fingerprint"]);

    expect(evaluateEvidence([
      evidence({ id: "self", supersedes: ["self"] }),
    ], request).reasons).toEqual(["invalid-supersession"]);

    expect(evaluateEvidence([
      evidence({ supersedes: [] }),
    ], request).reasons).toEqual(["invalid-record"]);

    expect(evaluateEvidence([
      evidence({ id: "unknown-target", supersedes: ["not-present"] }),
    ], request).reasons).toEqual(["invalid-supersession"]);

    const first = evidence({ id: "first", sha256: "c".repeat(64), supersedes: ["second"] });
    const second = evidence({
      id: "second",
      sha256: "d".repeat(64),
      sourceArtifact: "evidence/second.pdf",
      supersedes: ["first"],
    });
    expect(evaluateEvidence([first, second], request).reasons).toEqual(["invalid-supersession"]);
  });

  it("rejects sparse arrays and sorts normalized evidence identifiers", () => {
    const sparseScope = new Array<string>(1);
    expect(evaluateEvidence([
      evidence({ jurisdictions: sparseScope }),
    ], request).reasons).toEqual(["invalid-record"]);

    const first = evidence({ id: "a", sha256: "c".repeat(64) });
    const second = evidence({ id: "b", sha256: "d".repeat(64), sourceArtifact: "evidence/b.pdf" });
    expect(evaluateEvidence([second, first], request).evidenceIds).toEqual(["a", "b"]);
  });

  it("is deterministic for identical inputs", () => {
    const records = [evidence()];
    expect(evaluateEvidence(records, request)).toEqual(evaluateEvidence(records, request));
  });
});
