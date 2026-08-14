/**
 * Internal evidence-release primitive.
 *
 * This module is deliberately pure and has no product-surface imports. A caller
 * must explicitly attach it to a release gate; until then it cannot affect a
 * calculator, lead flow, authentication flow, or public route.
 */

export type EvidenceStatus =
  | "draft"
  | "approved"
  | "superseded"
  | "expired"
  | "revoked";

export interface SourceEvidence {
  id: string;
  subject: string;
  owner: string;
  sourceArtifact: string;
  sourceVersion: string;
  sha256: string;
  effectiveFrom: string;
  expiresOn: string;
  reviewedOn: string;
  approvedBy: string;
  status: EvidenceStatus;
  jurisdictions: readonly string[];
  products: readonly string[];
  assertions: readonly string[];
  /** Omit when there is no predecessor; when present, this must be non-empty. */
  supersedes?: readonly string[];
  reviewTicket?: string;
}

export interface EvidenceRequest {
  subject: string;
  jurisdiction: string;
  product: string;
  assertion: string;
  /** ISO calendar date supplied by the caller, keeping the evaluator deterministic. */
  asOf: string;
  /** Fingerprint of the controlled artifact expected by the calling release gate. */
  expectedSha256: string;
}

export type EvidenceFailureReason =
  | "missing"
  | "not-approved"
  | "superseded-record"
  | "expired"
  | "not-yet-effective"
  | "scope-mismatch"
  | "hash-mismatch"
  | "assertion-not-covered"
  | "invalid-record"
  | "invalid-supersession"
  | "duplicate-record-id"
  | "duplicate-fingerprint"
  | "conflicting-approved-records";

export interface EvidenceCheck {
  allowed: boolean;
  reasons: readonly EvidenceFailureReason[];
  evidenceIds: readonly string[];
  /** Age of the oldest approved review used by an allowed check, in calendar days. */
  reviewAgeDays?: number;
}

type PlainRecord = Record<string, unknown>;

const MAX_RECORDS = 500;
const MAX_SCOPE_VALUES = 100;
const reasonOrder: readonly EvidenceFailureReason[] = [
  "missing",
  "invalid-record",
  "duplicate-record-id",
  "duplicate-fingerprint",
  "invalid-supersession",
  "not-approved",
  "superseded-record",
  "not-yet-effective",
  "expired",
  "scope-mismatch",
  "assertion-not-covered",
  "hash-mismatch",
  "conflicting-approved-records",
];
const recordKeys = new Set([
  "id",
  "subject",
  "owner",
  "sourceArtifact",
  "sourceVersion",
  "sha256",
  "effectiveFrom",
  "expiresOn",
  "reviewedOn",
  "approvedBy",
  "status",
  "jurisdictions",
  "products",
  "assertions",
  "supersedes",
  "reviewTicket",
]);
const requestKeys = new Set([
  "subject",
  "jurisdiction",
  "product",
  "assertion",
  "asOf",
  "expectedSha256",
]);

function denied(
  reasons: readonly EvidenceFailureReason[],
  evidenceIds: readonly string[] = [],
): EvidenceCheck {
  return { allowed: false, reasons, evidenceIds };
}

function isIsoCalendarDate(value: string): boolean {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isEvidenceStatus(value: unknown): value is EvidenceStatus {
  return value === "draft" || value === "approved" || value === "superseded" || value === "expired" || value === "revoked";
}

function isPlainRecord(value: unknown): value is PlainRecord {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function ownDataDescriptor(record: PlainRecord, key: string): PropertyDescriptor | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor, "value") ? descriptor : undefined;
}

function hasOnlyKeys(record: PlainRecord, allowedKeys: ReadonlySet<string>): boolean {
  const names = Object.getOwnPropertyNames(record);
  for (const name of names) {
    if (!allowedKeys.has(name)) return false;
  }
  return Object.getOwnPropertySymbols(record).length === 0;
}

function readOwnString(record: PlainRecord, key: string): string | null {
  const descriptor = ownDataDescriptor(record, key);
  return descriptor && isNonEmptyString(descriptor.value) ? descriptor.value : null;
}

function readDenseArray(value: unknown, maximumLength: number, allowEmpty: boolean): readonly unknown[] | null {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return null;
  if (Object.getOwnPropertySymbols(value).length !== 0) return null;

  const names = Object.getOwnPropertyNames(value);
  for (const name of names) {
    if (name !== "length" && !/^(0|[1-9]\d*)$/.test(name)) return null;
  }

  const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
  const length = lengthDescriptor?.value;
  if (!Number.isSafeInteger(length) || length < 0 || length > maximumLength || (!allowEmpty && length === 0)) {
    return null;
  }

  const copied: unknown[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, "value")) return null;
    copied.push(descriptor.value);
  }
  return copied;
}

function normalizeStringArray(value: unknown): readonly string[] | null {
  const rawValues = readDenseArray(value, MAX_SCOPE_VALUES, false);
  if (!rawValues) return null;

  const values: string[] = [];
  const seen = new Set<string>();
  for (const rawValue of rawValues) {
    if (!isNonEmptyString(rawValue) || seen.has(rawValue)) return null;
    seen.add(rawValue);
    values.push(rawValue);
  }
  return Object.freeze(values);
}

function normalizeRecord(value: unknown): SourceEvidence | null {
  if (!isPlainRecord(value) || !hasOnlyKeys(value, recordKeys)) return null;

  const id = readOwnString(value, "id");
  const subject = readOwnString(value, "subject");
  const owner = readOwnString(value, "owner");
  const sourceArtifact = readOwnString(value, "sourceArtifact");
  const sourceVersion = readOwnString(value, "sourceVersion");
  const sha256 = readOwnString(value, "sha256");
  const effectiveFrom = readOwnString(value, "effectiveFrom");
  const expiresOn = readOwnString(value, "expiresOn");
  const reviewedOn = readOwnString(value, "reviewedOn");
  const approvedBy = readOwnString(value, "approvedBy");
  const status = ownDataDescriptor(value, "status")?.value;
  const jurisdictions = normalizeStringArray(ownDataDescriptor(value, "jurisdictions")?.value);
  const products = normalizeStringArray(ownDataDescriptor(value, "products")?.value);
  const assertions = normalizeStringArray(ownDataDescriptor(value, "assertions")?.value);

  if (
    !id || !subject || !owner || !sourceArtifact || !sourceVersion || !sha256 || !effectiveFrom || !expiresOn || !reviewedOn || !approvedBy ||
    !isEvidenceStatus(status) || !isSha256(sha256) || !isIsoCalendarDate(effectiveFrom) || !isIsoCalendarDate(expiresOn) ||
    !isIsoCalendarDate(reviewedOn) || effectiveFrom > expiresOn || !jurisdictions || !products || !assertions
  ) {
    return null;
  }

  let supersedes: readonly string[] | undefined;
  const supersedesDescriptor = ownDataDescriptor(value, "supersedes");
  if (supersedesDescriptor) {
    supersedes = normalizeStringArray(supersedesDescriptor.value) ?? undefined;
    if (!supersedes) return null;
  } else if (Object.prototype.hasOwnProperty.call(value, "supersedes")) {
    return null;
  }

  let reviewTicket: string | undefined;
  const reviewTicketDescriptor = ownDataDescriptor(value, "reviewTicket");
  if (reviewTicketDescriptor) {
    if (!isNonEmptyString(reviewTicketDescriptor.value)) return null;
    reviewTicket = reviewTicketDescriptor.value;
  } else if (Object.prototype.hasOwnProperty.call(value, "reviewTicket")) {
    return null;
  }

  return Object.freeze({
    id,
    subject,
    owner,
    sourceArtifact,
    sourceVersion,
    sha256: sha256.toLowerCase(),
    effectiveFrom,
    expiresOn,
    reviewedOn,
    approvedBy,
    status,
    jurisdictions,
    products,
    assertions,
    ...(supersedes ? { supersedes } : {}),
    ...(reviewTicket ? { reviewTicket } : {}),
  });
}

function normalizeRequest(value: unknown): EvidenceRequest | null {
  if (!isPlainRecord(value) || !hasOnlyKeys(value, requestKeys)) return null;

  const subject = readOwnString(value, "subject");
  const jurisdiction = readOwnString(value, "jurisdiction");
  const product = readOwnString(value, "product");
  const assertion = readOwnString(value, "assertion");
  const asOf = readOwnString(value, "asOf");
  const expectedSha256 = readOwnString(value, "expectedSha256");
  if (!subject || !jurisdiction || !product || !assertion || !asOf || !expectedSha256 || !isIsoCalendarDate(asOf)) {
    return null;
  }
  return Object.freeze({ subject, jurisdiction, product, assertion, asOf, expectedSha256 });
}

function hasSupersessionCycle(records: readonly SourceEvidence[], recordsById: ReadonlyMap<string, SourceEvidence>): boolean {
  const state = new Map<string, "visiting" | "visited">();

  const visit = (record: SourceEvidence): boolean => {
    const currentState = state.get(record.id);
    if (currentState === "visiting") return true;
    if (currentState === "visited") return false;
    state.set(record.id, "visiting");
    for (const predecessorId of record.supersedes ?? []) {
      const predecessor = recordsById.get(predecessorId);
      if (!predecessor || visit(predecessor)) return true;
    }
    state.set(record.id, "visited");
    return false;
  };

  for (const record of records) {
    if (visit(record)) return true;
  }
  return false;
}

function normalizeCollection(value: unknown):
  | { records: readonly SourceEvidence[] }
  | { failure: EvidenceFailureReason } {
  const rawRecords = readDenseArray(value, MAX_RECORDS, true);
  if (!rawRecords) return { failure: "invalid-record" };

  const records: SourceEvidence[] = [];
  const recordsById = new Map<string, SourceEvidence>();
  const recordIds = new Set<string>();
  const fingerprints = new Set<string>();
  for (const rawRecord of rawRecords) {
    const record = normalizeRecord(rawRecord);
    if (!record) return { failure: "invalid-record" };
    if (recordIds.has(record.id)) return { failure: "duplicate-record-id" };
    if (fingerprints.has(record.sha256)) return { failure: "duplicate-fingerprint" };
    recordIds.add(record.id);
    fingerprints.add(record.sha256);
    recordsById.set(record.id, record);
    records.push(record);
  }

  for (const record of records) {
    for (const predecessorId of record.supersedes ?? []) {
      const predecessor = recordsById.get(predecessorId);
      if (!predecessor || predecessor.id === record.id || predecessor.subject !== record.subject) {
        return { failure: "invalid-supersession" };
      }
    }
  }
  if (hasSupersessionCycle(records, recordsById)) return { failure: "invalid-supersession" };

  records.sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return { records: Object.freeze(records) };
}

function orderedReasons(reasons: ReadonlySet<EvidenceFailureReason>): EvidenceFailureReason[] {
  const ordered: EvidenceFailureReason[] = [];
  for (const reason of reasonOrder) {
    if (reasons.has(reason)) ordered.push(reason);
  }
  return ordered;
}

function contains(values: readonly string[], target: string): boolean {
  for (const value of values) {
    if (value === target) return true;
  }
  return false;
}

function reviewAgeDays(reviewedOn: string, asOf: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((Date.parse(`${asOf}T00:00:00.000Z`) - Date.parse(`${reviewedOn}T00:00:00.000Z`)) / millisecondsPerDay);
}

function evaluateNormalized(records: readonly SourceEvidence[], request: EvidenceRequest): EvidenceCheck {
  const candidates: SourceEvidence[] = [];
  for (const record of records) {
    if (record.subject === request.subject) candidates.push(record);
  }
  if (candidates.length === 0) return denied(["missing"]);

  const supersededIds = new Set<string>();
  for (const record of candidates) {
    if (record.status === "draft") continue;
    for (const predecessorId of record.supersedes ?? []) supersededIds.add(predecessorId);
  }

  const reasons = new Set<EvidenceFailureReason>();
  const applicableRecords: SourceEvidence[] = [];
  for (const record of candidates) {
    if (record.reviewedOn > request.asOf) return denied(["invalid-record"], candidates.map((candidate) => candidate.id));
    if (record.status !== "approved") {
      reasons.add("not-approved");
      continue;
    }
    if (supersededIds.has(record.id)) {
      reasons.add("superseded-record");
      continue;
    }
    if (request.asOf < record.effectiveFrom) {
      reasons.add("not-yet-effective");
      continue;
    }
    if (request.asOf > record.expiresOn) {
      reasons.add("expired");
      continue;
    }
    if (!contains(record.jurisdictions, request.jurisdiction) || !contains(record.products, request.product)) {
      reasons.add("scope-mismatch");
      continue;
    }
    if (!contains(record.assertions, request.assertion)) {
      reasons.add("assertion-not-covered");
      continue;
    }
    applicableRecords.push(record);
  }

  const candidateIds = candidates.map((candidate) => candidate.id);
  if (applicableRecords.length === 0) return denied(orderedReasons(reasons), candidateIds);

  const firstFingerprint = applicableRecords[0]?.sha256;
  for (const record of applicableRecords) {
    if (record.sha256 !== firstFingerprint) {
      return denied(["conflicting-approved-records"], candidateIds);
    }
  }
  if (!isSha256(request.expectedSha256) || firstFingerprint !== request.expectedSha256.toLowerCase()) {
    reasons.add("hash-mismatch");
    return denied(orderedReasons(reasons), candidateIds);
  }

  let oldestReviewAgeDays = 0;
  for (const record of applicableRecords) {
    oldestReviewAgeDays = Math.max(oldestReviewAgeDays, reviewAgeDays(record.reviewedOn, request.asOf));
  }
  return {
    allowed: true,
    reasons: [],
    evidenceIds: applicableRecords.map((record) => record.id),
    reviewAgeDays: oldestReviewAgeDays,
  };
}

/**
 * Evaluates one declared dependency. Inputs are normalized from own, plain data
 * properties before use. Any malformed or hostile runtime shape returns a
 * deterministic default-deny result; the evaluator never reads files, clocks,
 * network state, or product state.
 */
export function evaluateEvidence(records: unknown, request: unknown): EvidenceCheck {
  try {
    const normalizedRequest = normalizeRequest(request);
    if (!normalizedRequest) return denied(["invalid-record"]);

    const normalizedCollection = normalizeCollection(records);
    if ("failure" in normalizedCollection) return denied([normalizedCollection.failure]);

    return evaluateNormalized(normalizedCollection.records, normalizedRequest);
  } catch {
    return denied(["invalid-record"]);
  }
}
