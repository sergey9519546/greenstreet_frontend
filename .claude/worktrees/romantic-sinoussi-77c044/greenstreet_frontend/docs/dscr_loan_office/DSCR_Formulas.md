---
type: research
status: canonical
confidence: 5
title: DSCR Formulas
source: docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md
updated_at: 2026-06-28
replaces:
  - greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md
---

# DSCR Formulas

This is the current formula reference. It replaces the older `DSCR Forumals.md` mirror, whose golden vector used the rejected `$1,999` P&I / `~$2,580` PITIA / `1.16` DSCR result.

Canonical authority:

- `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`
- `docs/research/operational/UNIFIED_HUB.md`
- `docs/research/specs/DSCR_Underwriting_Engine_Master_Consolidated_v16.md`

## Track 1: Lender Qualification

```text
DSCR_A = Eligible_Rent / Monthly_PITIA
```

```text
Monthly_PITIA = P&I + (Annual_Tax / 12) + (Annual_Insurance / 12) + Monthly_HOA
```

Rules:

- Eligible rent is the lower of signed lease and Form 1007 or Form 1025 market rent.
- If the property is vacant, use the appraisal rent schedule.
- Long-term rental Track 1 does not apply a vacancy haircut by default because the lender qualifier uses gross eligible rent.
- Two-to-four-unit vacancy toggles are lender policy, not core math.

## Track 1 IO Variant

```text
DSCR_IO = Eligible_Rent / ITIA
```

```text
ITIA = Interest + (Annual_Tax / 12) + (Annual_Insurance / 12) + Monthly_HOA
```

Principal is excluded from the denominator during the interest-only period.

## Track 2: Investor Survival

```text
DSCR_B = Annual_NOI / Annual_Debt_Service
```

```text
Annual_NOI = Gross_Rent - Vacancy - Management - Maintenance - CapEx - Taxes - Insurance - HOA
```

Track 2 is an investor stress view, not the lender qualification ratio. A deal can pass Track 1 and fail Track 2; product output should show both results without blending them.

## Canonical Golden Vector

Inputs:

```text
Property value:    $425,000
LTV:               75%
Loan amount:       $318,750
Interest rate:     7.00%
Term:              30-year amortizing
Monthly rent:      $3,000
Annual tax:        $5,000
Annual insurance:  $2,000
Monthly HOA:       $150
```

Outputs:

```text
P&I:      $2,120.6517
PITIA:    $2,853.9850
T1 DSCR:  1.0512
```

The older `$1,999` P&I value is rejected because it implies a loan balance of about `$300,465`, not the documented `$318,750` loan. Regression tests and build specs should use the canonical vector above.

## Implementation Notes

- Track 1, Track 1 IO, and Track 2 are deterministic arithmetic and should be covered by unit tests.
- Under the current canonical SR 26-02 interpretation, deterministic DSCR formulas and golden-vector regressions are excluded from model-risk governance; stochastic, ML, and forecast layers are governed separately.
- Use effective-date configuration for rates, taxes, insurance, PPP thresholds, and any jurisdiction-specific values. Do not hardcode time-sensitive assumptions into formula code.
