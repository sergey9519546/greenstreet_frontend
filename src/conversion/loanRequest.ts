export type LoanPurpose = "purchase" | "rate-term" | "cash-out";
export type LoanRequestRole = "investor" | "broker" | "foreign" | "str" | "vacation";

/**
 * Non-PII deal inputs that can move from a Greenstreet tool into the
 * preliminary loan-request flow without making the visitor enter them again.
 *
 * This draft is kept in React memory only. Contact information and deal inputs
 * are not written to browser storage.
 */
export interface LoanRequestDraft {
  propertyValue?: number;
  loanAmount?: number;
  rent?: number;
  rate?: number;
  taxesAnnual?: number;
  insuranceAnnual?: number;
  hoaMonthly?: number;
  purpose?: LoanPurpose;
  role?: LoanRequestRole;
}
