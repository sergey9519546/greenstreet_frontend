# Reverify Batch: FinCEN + Deephaven - 2026-06-28

CSV:

- `00_MOCs/reverify_batch_fincen_deephaven_2026-06-28.csv`

## Scope

Closed the first-batch `REVERIFY` action for:

- FinCEN BOI: 25 rows
- FinCEN RRE: 22 rows
- Deephaven no-DSCR: 5 rows

No files were moved by this reverify pass. Reverification changes the cleanup decision status; physical archive/edit decisions still require content-level review.

## FinCEN BOI

Decision:

- `REVERIFY_COMPLETE_FINCEN_BOI_DOMESTIC_EXEMPT`

Current rule:

- Domestic U.S. reporting companies and their beneficial owners are exempt from BOI reporting under FinCEN's March 2025 interim final rule.
- Foreign reporting-company obligations are outside this domestic-LLC cleanup decision and require separate handling.

Evidence:

- `00_MOCs/fincen_reverification_2026-06-28.md`
- FinCEN BOI: `https://www.fincen.gov/boi`
- FinCEN BOI interim final rule press release: `https://www.fincen.gov/news/news-releases/fincen-removes-beneficial-ownership-reporting-requirements-us-companies-and-us`

## FinCEN RRE

Decision:

- `REVERIFY_COMPLETE_FINCEN_RRE_VACATED_NOT_ACTIVE`

Current rule:

- FinCEN says the Residential Real Estate Rule was vacated by court order on 2026-03-19.
- While the order remains in force, Real Estate Reports are not required and reporting persons are not liable for not filing.
- Do not treat RRE as an active production reporting obligation unless live primary-source status changes.

Evidence:

- `00_MOCs/fincen_reverification_2026-06-28.md`
- FinCEN Residential Real Estate Rule: `https://www.fincen.gov/rre`
- FinCEN Residential Real Estate FAQs: `https://www.fincen.gov/rre-faqs`

## Deephaven No-DSCR

Decision:

- `REVERIFY_COMPLETE_DEEPHAVEN_NOT_LITERAL_ZERO`

Current rule:

- Do not encode Deephaven as `DSCR = 0`.
- Deephaven's current public wholesale page uses "Low or no DSCR ratio" marketing language.
- Deephaven guideline/matrix sources support `0.75x` as the effective first-lien DSCR minimum in available wholesale/correspondent materials, with stricter treatment for interest-only/foreign national/second-lien scenarios.
- Deephaven's DSCR second-lien page states `Minimum DSCR ratio 1.0`.
- Current product matrices remain subject to change; direct lender matrix or account-executive confirmation is still required before production pricing.

Evidence:

- Deephaven DSCR Wholesale Lender: `https://deephavenmortgage.com/dscr-wholesale-lender/`
- Deephaven DSCR Loans article: `https://deephavenmortgage.com/dscr-loans/`
- Deephaven Wholesale Mortgage Lender page: `https://deephavenmortgage.com/wholesale-mortgage-lender/`
- Deephaven Wholesale DSCR Second: `https://deephavenmortgage.com/wholesale-dscr-second/`
- Deephaven Wholesale Guidelines PDF: `https://deephavenmortgage.com/wp-content/uploads/WHLS-Guidelines.pdf`

## Cleanup Impact

- `REVERIFY` rows are no longer blocking on source checks.
- The rows should not be deleted from reverify evidence alone.
- Files that actively promote the old FinCEN or Deephaven interpretation should be corrected, bannered, or archived in a later content-level pass.
