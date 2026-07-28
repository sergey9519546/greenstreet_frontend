type LoanRequestEvent =
  | "loan_request_started"
  | "loan_request_step_viewed"
  | "loan_request_submitted"
  | "loan_request_accepted"
  | "loan_request_failed";

/**
 * Records funnel progress without contact details or financial values.
 * The existing marketing layer owns dataLayer delivery when analytics consent
 * and a provider are configured.
 */
export function trackLoanRequest(
  event: LoanRequestEvent,
  metadata: { step?: number; page?: string; reason?: "timeout" | "delivery" } = {},
): void {
  if (typeof window === "undefined") return;
  const dataLayer = ((window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer ??= []);
  dataLayer.push({
    event,
    ...metadata,
  });
}
