import { describe, expect, it } from "vitest";

import { LeadRequestSchema, leadTransportError } from "./leads";

const validLead = () => ({
  name: "  Ada   Borrower  ",
  email: " ADA@EXAMPLE.COM ",
  phone: "",
  role: "investor",
  timeline: "30-90",
  propertyType: "sfr",
  propertyValue: 425_000,
  loanAmount: 318_750,
  rent: 3_000,
  rate: 7.25,
  purpose: "purchase",
  state: " ca ",
  ficoBand: "720-759",
  borrowerType: "llc",
  experience: "1-3",
  investmentConfirmed: true,
  dscr: 1.24,
  verdict: "Strong scenario",
  verdictTier: "Strong",
  rateEstimate: "7.00%-7.50%",
  qualify: {
    ltv: 75,
    pitia: 2_500,
    piMonthly: 2_000,
    dscr: 1.24,
    outcome: "review",
    reasons: ["Program fit"],
    rateRange: "7.00%-7.50%",
    needsHumanReview: true,
  },
  consent: {
    contact: true,
    sms: false,
    timestamp: "2026-07-14T12:00:00.000Z",
    policyVersion: "2026-06",
  },
  page: "/",
});

describe("LeadRequestSchema", () => {
  it("normalizes bounded contact and state values", () => {
    const parsed = LeadRequestSchema.parse(validLead());
    expect(parsed.name).toBe("Ada Borrower");
    expect(parsed.email).toBe("ada@example.com");
    expect(parsed.phone).toBeUndefined();
    expect(parsed.state).toBe("CA");
  });

  it("rejects unknown fields", () => {
    expect(() => LeadRequestSchema.parse({ ...validLead(), admin: true })).toThrow();
  });

  it("requires meaningful contact data", () => {
    expect(() => LeadRequestSchema.parse({ ...validLead(), email: "", phone: "" })).toThrow();
  });

  it("requires affirmative contact consent", () => {
    const input = validLead();
    input.consent.contact = false as true;
    expect(() => LeadRequestSchema.parse(input)).toThrow();
  });

  it("rejects invalid states and out-of-range numbers", () => {
    expect(() => LeadRequestSchema.parse({ ...validLead(), state: "ZZ" })).toThrow();
    expect(() => LeadRequestSchema.parse({ ...validLead(), rate: 250 })).toThrow();
    expect(() => LeadRequestSchema.parse({ ...validLead(), dscr: Number.POSITIVE_INFINITY })).toThrow();
    expect(() => LeadRequestSchema.parse({ ...validLead(), qualify: { ...validLead().qualify, ltv: 100.01 } })).toThrow();
  });

  it("accepts inclusive boundaries and rejects values just beyond them", () => {
    expect(LeadRequestSchema.parse({ ...validLead(), name: "A".repeat(120) }).name).toHaveLength(120);
    expect(() => LeadRequestSchema.parse({ ...validLead(), name: "A".repeat(121) })).toThrow();
    expect(() => LeadRequestSchema.parse({ ...validLead(), loanAmount: 425_000 })).not.toThrow();
    expect(() => LeadRequestSchema.parse({ ...validLead(), loanAmount: 425_000.01 })).toThrow();
  });

  it("normalizes phone numbers without retaining formatting", () => {
    const parsed = LeadRequestSchema.parse({
      ...validLead(),
      email: "",
      phone: "+1 (415) 555-0100",
    });
    expect(parsed.phone).toBe("+14155550100");
  });
});

describe("lead transport privacy", () => {
  it("rejects GET and directs clients away from URL contact data", () => {
    expect(leadTransportError("GET", ["email"])).toEqual({
      status: 405,
      code: "method_not_allowed",
      message: "Lead submissions must use POST. Do not put contact details in the URL.",
    });
  });

  it("rejects URL parameters even on POST without accepting their values", () => {
    const result = leadTransportError("POST", ["email", "phone"]);
    expect(result).toMatchObject({ status: 400, code: "url_data_not_allowed" });
    expect(JSON.stringify(result)).not.toContain("ada@example.com");
  });

  it("allows only POST requests with an empty query", () => {
    expect(leadTransportError("POST", [])).toBeNull();
  });
});
