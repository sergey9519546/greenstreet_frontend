---
type: research
status: drafted
confidence: 3
title: T10 Summary — Forward Calendar (Q3/Q4 2026 + 2027 Re-verification Schedule)
summary: "**Coverage**: 8/8 time-sensitive items scheduled (100%)"
entities:
  - concept/dscr
  - data/apartment-list
  - data/cotality
  - data/fred
  - data/kbra
  - data/trepp
  - data/zillow
  - data/zori
  - regulation/cfpb
  - regulation/hoepa
  - regulation/section-1071
  - tax/qoz
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
source: RESEARCH/godmode_20260618/10_T10_forward_calendar/T10_summary.md
vaulted_at: 2026-06-20
---
# T10 Summary — Forward Calendar (Q3/Q4 2026 + 2027 Re-verification Schedule)

**Generated**: 2026-06-18
**Coverage**: 8/8 time-sensitive items scheduled (100%)
**Format**: Celery cron + lark-calendar entries + lark-task pings

---

## Critical Near-Term Items (next 30 days)

### 🔴 T10-07 — OBBBA QOZ Decennial Cycle (2026-07-01)
- **Statutory date**: July 1, 2026 (13 days from generation date)
- **Source**: Public Law 119-21 (One Big Beautiful Bill Act); IRC §1400Z-2
- **Priority**: P0 (CRITICAL)
- **DSCR relevance**: QOZ decennial cycle = 10-year expiration for new QOZ designations; affects DSCR/QOZ investment structuring
- **Action**: Confirm QOZ decennial status as of 2026-07-01; pull latest IRS guidance on QOZ designation expirations; update DSCR/QOZ overlay doc
- **Reminder cadence**: 60, 30, 14, 7, 1 days before

---

## All 8 Items

| ID | Item | Source | Re-verify Date | Priority | Cadence |
|---|---|---|---|---|---|
| **T10-01** | Q3 2026 Cotality Mortgage Fraud Index | Cotality public press release | **2026-09-30** | P1 | Quarterly |
| **T10-02** | Trepp CMBS Delinquency Aug 2026 | Trepp public blog | **2026-08-31** | P1 | Monthly |
| **T10-03** | KBRA Q4 2025 follow-up / next KBRA Non-QM | KBRA publications | **2026-07-31** | P2 | Quarterly |
| **T10-04** | Scotsman Guide 2026 annual | Scotsman Guide | **2027-04-15** | P2 | Annual |
| **T10-05** | HOEPA 2027 thresholds (Federal Register Dec 2026) | Federal Register / CFPB | **2026-12-15** | P0 | Annual |
| **T10-06** | §179 2027 limit (IRS Rev. Proc. 2026-XX) | IRS | **2026-11-15** | P1 | Annual |
| **T10-07** | **OBBBA QOZ decennial cycle** | Public Law 119-21 | **2026-07-01** | **P0 CRITICAL** | Statutory (one-time) |
| **T10-08** | Section 1071 pre-compliance (Jan 1, 2028 eff date) | CFPB | **2027-12-31** | P1 | Annual review |

---

## Priority Breakdown

| Priority | Count | Items |
|---|---|---|
| **P0 (Critical)** | 2 | T10-05 HOEPA, T10-07 QOZ decennial |
| **P1 (High)** | 4 | T10-01 Cotality, T10-02 Trepp, T10-06 §179, T10-08 §1071 |
| **P2 (Medium)** | 2 | T10-03 KBRA, T10-04 Scotsman |

---

## Celery Cron Schedule (ready to deploy)

| Task | Cron | Description |
|---|---|---|
| `research.refresh_fred_snapshot` | `0 9 * * 4` | Weekly Thursday 9 AM — FRED snapshot (drives MORTGAGE30US, DGS10, SOFR) |
| `research.refresh_mba_was` | `0 8 * * 3` | Weekly Wednesday 8 AM — MBA WAS |
| `research.refresh_zillow_zori_zhvi` | `0 11 17 * *` | Monthly 17th 11 AM — Zillow CSVs |
| `research.refresh_cotality_newsroom` | `0 9 1 */3 *` | Quarterly 1st-of-month 9 AM — Cotality scrape |
| `research.refresh_trepp_blog` | `0 10 20 * *` | Monthly 20th 10 AM — Trepp scrape |
| `research.refresh_kbra_publications` | `0 11 1 * *` | Monthly 1st 11 AM — KBRA scrape |
| `research.refresh_apartment_list_rent` | `0 10 28 * *` | Monthly 28th 10 AM — Apartment List scrape |
| `research.refresh_sofr_daily` | `0 9 * * 1-5` | Weekday 9 AM — NY Fed SOFR |
| `research.calendar_t10_07_qoz_decennial` | `0 6 1 7 *` | Annual July 1 — QOZ decennial trigger |
| `research.calendar_t10_05_hoepa_thresholds` | `0 14 5 12 *` | Annual Dec 5 — HOEPA threshold check |
| `research.calendar_t10_06_section_179` | `0 10 5 11 *` | Annual Nov 5 — §179 IRS check |
| `research.calendar_t10_08_section_1071` | `0 9 1 10 *` | Annual Oct 1 — §1071 pre-compliance check |

---

## Calendar Reminder Method

Each item carries:
- `due_date_iso` — ISO 8601 due date
- `reminder_days_before` — array of lead times (e.g., [60, 30, 14, 7, 1])
- `method` — escalation chain: `email` → `email + lark-calendar` → `email + lark-calendar + lark-task` → `email + lark-calendar + lark-task + lark-im ping`

P0 items use the full escalation chain (email + lark-calendar + lark-task + lark-im ping).
P1 items use email + lark-calendar.
P2 items use email only.

---

## Files Written

| File | Path | Purpose |
|---|---|---|
| T10_calendar.json | `10_T10_forward_calendar/T10_calendar.json` | Full JSON: 8 items + Celery cron entries + calendar reminders |
| T10_summary.md | `10_T10_forward_calendar/T10_summary.md` | This document |

---

## Bottom Line

**8/8 items scheduled** (100%). Critical near-term item is **T10-07 OBBBA QOZ decennial cycle on 2026-07-01** (13 days from today). Other Q3/Q4 2026 items scheduled with quarterly / monthly cadence. 2027 items (Scotsman Guide, Section 1071) have annual reminder pipelines. Celery cron schedule ready for deployment; calendar reminder method escalates by priority (P0 = full lark stack; P2 = email only).