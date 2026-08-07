# DSCR Sovereign OS — Verifier Agent + HOEPA Cron Setup Memo

**Date:** 2026-06-20
**Scope:** Two infrastructure tasks to enable ongoing compliance quality
**Status:** ✅ SHIPPED — both tasks operational

---

## Task D: DSCR Compliance Verifier Agent

### What it is
A new cross-project agent `dscr-verifier` registered at:
```
C:\Users\serge\.mavis\agents\dscr-verifier\
  agent.md         # system prompt (4,256 bytes)
  config.yaml      # default model config
```

### What it does
Cross-references DSCR compliance claims (in ship memos, code, docs) against primary regulatory sources:
- 12 CFR 1002 Appendix A (Reg B Form C-1 codes 01-24 verbatim)
- 12 CFR 1026 (Reg Z HOEPA thresholds)
- 15 USC 1681m (FCRA adverse action)
- CFPB Circular 2022-03 (adverse action for complex algorithms)
- State statutes: MN HF 3437, PA Act 6, OH ORC §1343.011, NJ N.J.S.A. 46:10B-2, WA RCW 19.144.040

### What it does NOT do
- Write code
- Design APIs
- Pick strategies
- Run tests

### Output format (enforced in agent.md)
```
## Verification Report

### Claim: <specific claim>
- Source claimed: <where the deliverable cited>
- Primary source found: <file:line or URL>
- Match: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- Notes: <caveats>
```

A report without specific file:line or URL citations is **incomplete** (the agent will reject it per the agent.md stop condition).

### Why cross-project, not project-rein
- DSCR workspace is **not a git repo** (no `.git/` directory) — `.harness/reins/` would not be tracked
- Cross-project agents work across any session invocation
- DSCR-specific knowledge is baked into agent.md

### Smoke test (in progress)
Spawned `mvs_fc051d983183483493f11675b61c13ba` to verify the HOEPA threshold claims in `compliance.py`. Per platform memory, agent sessions run async for minutes — polling via cron `check-verifier` (every 2m, TTL 30m).

### How to invoke from now on

```powershell
# From PowerShell (note: escape inner quotes with backslashes)
$json = '{\"agent\":\"dscr-verifier\",\"prompt\":\"<task>\"}'
mavis communication send --from <session-id> --to <session-id> --command spawn --content $json
```

Or after the smoke test confirms it works:
```powershell
mavis communication send --from $env:MAVIS_SESSION --to $env:MAVIS_SESSION --command spawn --content '{\"agent\":\"dscr-verifier\",\"prompt\":\"Verify the new sprint ship memo against primary sources\"}'
```

---

## Task C: HOEPA Annual Threshold Cron

### What it is
A cron job `hoepa-thresholds` registered on agent `mavis`:

| Field | Value |
|-------|-------|
| Agent | `mavis` |
| Schedule | `0 14 5 12 *` (Dec 5 at 14:00 local) |
| Timezone | `America/Los_Angeles` |
| Session mode | `new` (fresh session per tick) |
| Report to root | true |
| Status | idle |
| Next run | **2026-12-05 14:00 PT** |
| Last run | null |

### What it does
Every Dec 5 at 14:00 PT:
1. WebSearches for "CFPB HOEPA threshold [year+1] Federal Register annual adjustment"
2. Reads the published dollar amounts for total loan amount + points-and-fees
3. Updates `HOEPA_THRESHOLDS_BY_YEAR[year+1]` in `compliance.py`
4. Runs pytest to verify
5. Appends addendum to most recent `DSCR_Compliance_*_Ship_Memo.md` in `output/`
6. Reports old → new values to user

### Why Dec 5
Per T10 forward calendar (godmode_20260618/10_T10_forward_calendar/T10_summary.md):
> T10-05: HOEPA 2027 thresholds (Federal Register Dec 2026) — Annual, P0

CFPB typically publishes the HOEPA Annual Threshold Adjustment in the Federal Register in mid-November to early December. Dec 5 is the conservative "definitely published" date.

### What happens BEFORE Federal Register publishes
The cron prompt explicitly handles this:
> "If CFPB has not yet published (typical Nov/Dec), DO NOT silently use the prior year values — alert the user and ask whether to wait or use a placeholder estimate."

This is the same defensive pattern as v0.4.0 `get_hoepa_thresholds()` raising `ValueError` for pending years — explicit error beats silent wrong answer.

### Why `cron create` not `cron self`
Per `references/cron.md` decision rule:
> "Did the user ask for it?" → `cron create`. "I'm waiting on something while working?" → `cron self`.

This is user-initiated recurring (annual HOEPA check) → `cron create` with `new` session mode + root report.

### How to verify it's set
```powershell
mavis cron info mavis hoepa-thresholds
```

Returns: cron name, schedule, timezone, status (idle/enabled), next run timestamp.

### Other annual regulatory crons to consider adding later
- **§1071 compliance date Jan 1, 2028** (one-shot reminder Q4 2027 to verify no further CFPB guidance)
- **PA/OH PPP threshold re-index** (annually January — CPI-indexed per PA Bulletin / OH Dept. of Commerce)
- **MN HF 3437 status** (annually Aug 1 — verify business-purpose exemption still in force)

Not added now; can be added when each becomes active. Pattern is the same as `hoepa-thresholds`.

---

## Architecture decisions documented

| Decision | Rationale |
|----------|-----------|
| Cross-project standalone agent, not `.harness/reins/` | DSCR workspace is not a git repo; cross-project works without git |
| Single responsibility (verify only) | Avoids scope creep — agent doesn't try to fix or write |
| Cite file:line explicitly in every verdict | Catches the "looks good" trap — unverifiable claims are unverifiable |
| Cron mode=`new` + report_to_root=true | Each tick is a fresh session with full task context; user gets notified on success |
| Defensive "no silent wrong answer" pattern | Same pattern as `get_hoepa_thresholds()` raising for pending years; consistent across codebase |

---

## Files touched

| File | Status |
|------|--------|
| `C:\Users\serge\.mavis\agents\dscr-verifier\agent.md` | NEW (4,256 bytes) |
| `C:\Users\serge\.mavis\agents\dscr-verifier\config.yaml` | NEW (3 bytes — default model) |
| `mavis cron hoepa-thresholds` (agent `mavis`) | NEW — annual Dec 5, 14:00 PT |
| `mavis cron check-verifier` (self-reminder) | NEW — every 2m, TTL 30m |

---

## What comes next (not done in this round)

1. **Wait for verifier smoke test** — `mvs_fc051d983183483493f11675b61c13ba` running. Will be polled by `check-verifier` cron.
2. **If smoke test passes**, use `dscr-verifier` to audit future ship memos by default (post-fix pattern: producer → spawn verifier → verifier report → ship).
3. **If smoke test fails**, fix `agent.md` based on what went wrong, re-test.
4. **HOEPA cron** runs Dec 5, 2026 automatically. The `hoepa-thresholds` task fires a new mavis session, which will WebSearch → update compliance.py → run pytest → addendum ship memo → report to root session.
