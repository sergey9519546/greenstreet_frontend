# Delivery governance wave baseline

**Snapshot date:** 2026-07-28
**Scope:** Read-only inspection of local Git state, repository-visible GitHub configuration, and checked-in delivery configuration. No issues, pull requests, labels, releases, branches, commits, deployments, or repository settings were created or changed by this wave.

## Safety posture

This repository is actively being worked on in an isolated worktree. It is not a release candidate at the time of this snapshot:

- Active worktree: `C:/Users/serge/OneDrive/Documents/DSCR_LOAN OFFICE/greenstreet_frontend_ultraplan`
- Active branch: `codex/greenstreet-ultraplan`
- Base commit: `5de3b41b6e4731d1584ac056cba3441c677a4171` (`origin/main` at inspection time)
- Other local worktrees exist for `codex/site-completion-audit` and a detached historical checkout.
- The isolated worktree has expected uncommitted parallel-wave work in `.github/workflows/ci.yml`, `docs/program/`, and `src/governance/`. Treat this state as shared work in progress; do not publish it until the complete regression gate has run on the exact commit proposed for review.

## Verified repository and release evidence

| Area | Verified evidence | Interpretation / boundary |
| --- | --- | --- |
| Remote | `origin` is `https://github.com/sergey9519546/greenstreet_frontend.git`; GitHub reports a public, active repository with `main` as its default branch. | This establishes source-control identity only; it does not establish a production deployment. |
| Current branch | `codex/greenstreet-ultraplan` is at the same base commit as `origin/main` before its local, uncommitted work. | The branch is a safe staging area, not an approval to push or merge. |
| Pull requests and issues | GitHub returned no open pull requests and no open non-PR issues. Issues and Projects are enabled. | GitHub Issues is available if the owner elects to use it; no tracker record is currently required or implied. |
| Releases and tags | GitHub returned no releases and no remote tag refs. Two *local-only* archive tags exist: `archive/legacy-snapshot-20260715` and `archive/recovery-backlog-c-engines-20260705`. | There is no verified remote release/versioning record. The local archive tags are not a production-release scheme. |
| Recent CI history | The most recent recorded `main` CI run for `5de3b41…` succeeded. Recent PR and push CI runs also succeeded. | Those runs predate the current uncommitted work and cannot approve this wave's artifact. |
| CI workflow | One enabled `CI` workflow triggers on every push and pull request. It uses Node 22, `npm ci`, `npm run lint`, `npm test`, `npm run test:home-fidelity`, and `npm run build`. | This is the current repeatable no-breakage gate. The homepage contract check was added in the active local wave and must itself be validated before release. |
| Workflow controls | The checked-in workflow has no explicit branch filters, concurrency group, or `permissions` block. Repository Actions settings allow all actions; SHA pinning is not required. Default workflow-token permission is read-only and workflows cannot approve PR reviews. | These are governance gaps to decide deliberately later; this wave makes no settings change. The current actions use version tags (`actions/checkout@v5`, `actions/setup-node@v5`). |
| Branch rules | The `main` branch-protection endpoint explicitly returned “Branch not protected”; repository rulesets and the effective rules list for `main` were empty. | Nothing currently prevents a direct push or a merge without CI/review at the repository-rule level. Manual release gates are mandatory until an owner authorizes rules. |
| GitHub environments | `Preview` and `Production` environments exist; each reports no protection rules. | Their deployment mapping, secrets, reviewers, and rollback responsibilities are not established by this evidence. |
| Security configuration | The repository reports Dependabot/vulnerability alerts disabled. | This is a repository-setting decision, not a change this wave may make. Alert history and secret values were not inspected. |
| Hosting configuration | Checked-in `vercel.json`, `firebase.json`, and `.firebaserc` exist. Firebase names a default project and declares `nodejs20`; package metadata and CI declare Node 22. | The actual production host, deployment source, active runtime, and rollback path are unknown. Do not “normalize” the runtime or deployment files without verifying the live deployment contract. |
| Release docs and ownership | No checked-in `CODEOWNERS`, `SECURITY.md`, `CONTRIBUTING.md`, changelog, release configuration, or version-file policy was found in the scoped scan. Package metadata is private version `0.1.0`. | Reviewers, release manager, disclosure contact, semantic-version policy, and rollback owner remain unassigned. |

## Unknowns that must not be guessed

- Which host is authoritative for production: Vercel, Firebase Hosting/Functions, another provider, or a split arrangement.
- Which GitHub environment, secrets, variables, domains, and deployment branch actually serve users.
- Whether current live hosting is compatible with Firebase's checked-in Node 20 declaration, despite the application and CI targeting Node 22.
- The approved release owner, business/compliance approver, production reviewer(s), and incident/rollback owner.
- Production health checks, uptime/error monitoring, deployment retention, and rollback procedure.
- Whether security-alert enablement, dependency updates, secret scanning, or CodeQL meet the owner's intended operating model.
- Any required organization-level policies or account controls outside repository-visible configuration.

## Minimal no-breakage delivery sequence

This sequence is intentionally conservative and applies until explicit repository rules supersede it.

1. Keep implementation in the isolated `codex/greenstreet-ultraplan` worktree. Do not mix it with the root worktree or historical detached checkout.
2. Before any publish decision, inspect the exact diff and confirm it contains only scoped, reviewed work. Resolve unexpected shared-worktree changes before staging.
3. With Node 22 and a clean install, run the current gate on the exact candidate commit:

   ```text
   npm ci
   npm run lint
   npm test
   npm run test:home-fidelity
   npm run build
   ```

4. For user-visible, lead, calculator, authentication, Firebase, or routing changes, add the relevant targeted smoke/contract tests before declaring the candidate safe. A passing build alone is not enough.
5. Record the commit SHA, commands, results, reviewer(s), and any approved exceptions in the chosen tracker or release record.
6. Create a **draft** pull request only after the owner authorizes external GitHub writes. Do not merge directly to `main`.
7. Require the full CI result for that exact head SHA, a human review, and confirmation that the Preview/Production deployment path and rollback owner are known before production deployment.
8. Promote only the reviewed artifact; verify health and key user flows after deployment; preserve the prior known-good deployment or artifact until the agreed monitoring window closes.

## Decisions required before any external tracking or repository-setting change

| Decision | Required owner answer | Why it is required |
| --- | --- | --- |
| Work tracker | Use GitHub Issues, local Markdown only, or another named system; if GitHub Issues, authorize creation of the program epic and child issues. | Issues are enabled but none exist; creating records changes external state. |
| Taxonomy and ownership | Approve exact labels, milestones, project board, issue templates, assignees, and who may close/triage items. | Prevents an unowned or misleading backlog. |
| Pull-request policy | State whether all `main` changes require PRs; name required reviewers/teams; choose merge method, direct-push policy, auto-merge policy, and branch-deletion policy. | `main` currently has no branch protection or ruleset enforcement. |
| Required checks | Approve the exact required status checks, beginning with the `CI` workflow and its lint/test/home-fidelity/build gate, plus any future E2E/security checks. | Required-check enforcement should not be guessed from a changing workflow. |
| Environment protection | Name Preview and Production deployers/reviewers, required approvals, branch restrictions, and whether a wait timer applies. | Both environments currently have zero protection rules. |
| Hosting and rollback | Identify the canonical production host and project, deployment source branch, production URL, health check, rollback command/runbook, and on-call owner. | Checked-in Vercel and Firebase configurations do not prove live routing or ownership. |
| Release policy | Approve version/tag convention, release-note owner, rollout window, rollback threshold, and post-release verification checklist. | There are no remote releases/tags or checked-in release-policy artifacts. |
| Security operations | Decide whether to enable Dependabot/vulnerability alerts, secret scanning, code scanning, action SHA pinning, and a security-disclosure channel. | Current repository settings leave these choices unenforced or disabled. |

## Safe next action

Continue local, additive implementation and evidence/test work in the isolated branch. The first external action should be chosen only after the owner answers the work-tracker decision and explicitly authorizes the corresponding GitHub write.
