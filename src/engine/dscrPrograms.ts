export type ProgramGateKey = "fico" | "ltv" | "dscr" | "loan" | "str" | "multifamily";

export interface ProgramGateCheck {
  key: ProgramGateKey;
  ok: boolean;
  label: string;
}

const EPSILON = 1e-7;

function rounded(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function meetsInclusiveMinimum(value: number, minimum: number, decimals = 2): boolean {
  return Number.isFinite(value) && Number.isFinite(minimum) && rounded(value, decimals) >= rounded(minimum, decimals);
}

export function meetsInclusiveMaximum(value: number, maximum: number, decimals = 2): boolean {
  return Number.isFinite(value) && Number.isFinite(maximum) && rounded(value, decimals) <= rounded(maximum, decimals);
}

export function nudgeExactLowerBoundary(value: number, minimum: number): number {
  return Number.isFinite(value) && Number.isFinite(minimum) && Math.abs(value - minimum) <= EPSILON
    ? minimum + EPSILON
    : value;
}

export function parseMatcherNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function explainNoProgramMatches(programs: { checks: ProgramGateCheck[] }[], loanAmount: number): string {
  if (programs.length === 0) return "Complete every valid input to compare modeled scenarios.";
  const keys: ProgramGateKey[] = ["fico", "ltv", "dscr", "loan", "str", "multifamily"];
  const universalFailures = keys.filter((key) => programs.every((program) => program.checks.some((check) => check.key === key && !check.ok)));
  const messages: Partial<Record<ProgramGateKey, string>> = {
    fico: "Reported FICO is below every modeled floor.",
    ltv: "Requested LTV exceeds every modeled limit for these inputs.",
    dscr: "Reported DSCR is below every modeled coverage floor.",
    loan: loanAmount < 75_000 ? "Loan amount is below this tool's inclusive $75,000 boundary." : "Loan amount is outside every modeled program range.",
    str: "No modeled short-term-rental scenario clears the other selected gates.",
    multifamily: "No modeled 5+ unit scenario clears the other selected gates.",
  };
  if (universalFailures.length > 0) return universalFailures.map((key) => messages[key]).filter(Boolean).join(" ");
  return "No single modeled scenario clears every displayed gate. Review each red check; different scenarios may be failing for different reasons.";
}
