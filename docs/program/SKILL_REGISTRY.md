# GreenStreet skill registry

Status: Wave 0 inventory; created 2026-07-28. This registry is a control record, not authorization to install, execute, or copy a skill.

## Operating policy

- Preserve working behavior. Every skill-driven change must capture a baseline, make the smallest scoped change, receive independent regression validation, and include tested rollback evidence before release.
- Read a skill only when its ledger trigger is met. Execute bundled scripts only after an allowlisted review of their contents, declared network access, write targets, and required secrets.
- Pin source repository, revision, and SHA-256 before activation. A matching name or GitHub URL is not sufficient provenance.
- Treat skill guidance as methodology. Mortgage, tax, privacy, licensing, pricing, and underwriting decisions require the listed human approvals.
- Do not load, install, or update an on-disk-only skill unless its recorded integrity and provenance status permits it. The 18 Hyperframes mismatches are full quarantine; the 11 Firebase matches remain provenance-review and are not active.

## Discovery classes

| Class | Meaning | Current rule |
| --- | --- | --- |
| Active catalog | Available in this Codex session and appropriate to the task. | May be used after its trigger and normal review. |
| On-disk-only | Present in the repository but not exposed by the session catalog. | Quarantined pending source/revision/hash verification. |
| Required, unavailable | Named in the ultraplan but absent from both the active catalog and verified local assets. | Record the work requirement; do not substitute an unverified skill. |
| Conditional | Relevant only when its stated product decision or event occurs. | Do not invoke before its trigger. |
| Rejected | Wrong stack, unsupported scope, or unneeded. | Do not install or invoke. |

## Project-local asset inventory

The repository contains 29 `SKILL.md` files under `.agents/skills/`, 122 executable-looking local files, and `.claude/launch.json`. `.claude` contains no skill bundle. `skills-lock.json` names the same 29 skills. Its `computedHash` is a whole-folder SHA-256 (sorted relative paths plus raw file bytes), not a single-`SKILL.md` SHA-256: **11 of 11 Firebase folders reproduce their lock values; 18 of 18 Hyperframes folders do not.** The Firebase set is integrity-matched but remains provenance-review and inactive because the lock lacks a pinned upstream revision and approval record. The Hyperframes set remains full quarantine. See [skill-lock forensics](./SKILL_LOCK_FORENSICS.md).

| Skill | Class / status | Declared source | Locked folder SHA-256 | Whole-folder result | Decision |
| --- | --- | --- | --- | --- | --- |
| embedded-captions | On-disk-only / full quarantine | heygen-com/hyperframes | ae75bbf848019ae09db25c4d6d6020aad98b1994f9f83cee8bbe0c782199ed2e | Mismatch | Quarantine; creative-only. |
| faceless-explainer | On-disk-only / full quarantine | heygen-com/hyperframes | 8a0d54f5e1b8cc71adba40772932cc4417c3f725b34f90465a190dc9fa52a3a4 | Mismatch | Quarantine; creative-only. |
| firebase-ai-logic-basics | Integrity-matched / provenance-review | firebase/agent-skills | 781e4ae5bb33359876ade436989e239c48d57de671fea4e9928a11fdcb16928f | Match | Not active; not a current product requirement. |
| firebase-app-hosting-basics | Integrity-matched / provenance-review | firebase/agent-skills | a3ba088442abf5b97281bcf3e4dd11e1f7bdefdc5bd404b4fb30f344d19742d2 | Match | Not active; architecture exclusion—Vercel is planned. |
| firebase-auth-basics | Integrity-matched / provenance-review | firebase/agent-skills | 87ffefcaa1934070f3f91977588ec82fde38a75cbc41919df6fe0a0c83acc90d | Match | Not active; required only after provenance approval. |
| firebase-basics | Integrity-matched / provenance-review | firebase/agent-skills | 610305ba0d7fcb956001a2a96eea7902b63ae7367214aeee7ab0d93e0b6e8369 | Match | Not active; required only after provenance approval. |
| firebase-crashlytics | Integrity-matched / provenance-review | firebase/agent-skills | e40f0b599853b0512d023306b23bfbcc39c911ff61d5f0f084cab2bce234480a | Match | Not active; conditional on approved Crashlytics decision and provenance approval. |
| firebase-data-connect | Integrity-matched / provenance-review | firebase/agent-skills | e0cbf48572b5d141a74ad165a4321bcaca8cacea3246c563ce9afa7fa2b18a66 | Match | Not active; architecture exclusion—no Data Connect decision. |
| firebase-firestore | Integrity-matched / provenance-review | firebase/agent-skills | 2d26711fb672bf0b4b774276923247d1839fff474925672907cdee8cadc81c68 | Match | Not active; required only after provenance approval. |
| firebase-hosting-basics | Integrity-matched / provenance-review | firebase/agent-skills | 0688a8ad6cb72149924352cc47e6cc8bf815e944b636a67b9da225cc9b025afc | Match | Not active; architecture exclusion—Vercel is planned. |
| firebase-remote-config-basics | Integrity-matched / provenance-review | firebase/agent-skills | ac2bfdc0f4e2fba123e2baf22a39ff80073c9f682784a67d0ac625118bad1921 | Match | Not active; required only after provenance approval. |
| firebase-security-rules-auditor | Integrity-matched / provenance-review | firebase/agent-skills | 42e793406ca8980c47fcdbd309f02838316849bcbf8475001b4ecaa6a67606b8 | Match | Not active; advisory-only candidate after provenance and scope approval. |
| general-video | On-disk-only / full quarantine | heygen-com/hyperframes | 4a51a019fe5b120f94a23ca0eceefa165e09966591f7832a5400fef39fff3433 | Mismatch | Quarantine; creative-only. |
| graphic-overlays | On-disk-only / full quarantine | heygen-com/hyperframes | cd8f3d64ea81844921d2d24a11ff7c0744876d03bf2f583a144fb268110dc5c3 | Mismatch | Quarantine; creative-only. |
| hyperframes | On-disk-only / full quarantine | heygen-com/hyperframes | 5bf0372dfef8aab1085816b3c733f860d2500fa8197d14d208e84464aa0d2b3c | Mismatch | Quarantine; creative-only. |
| hyperframes-animation | On-disk-only / full quarantine | heygen-com/hyperframes | 7cd2a2311bd44516937a615ddcd006d308461f4070d88c745195569e746f6f20 | Mismatch | Quarantine; creative-only. |
| hyperframes-cli | On-disk-only / full quarantine | heygen-com/hyperframes | 59dcf8d01b5e21a101d6c1225411b487316436221170e7e1dc9b00bf5c27d359 | Mismatch | Quarantine; creative-only. |
| hyperframes-core | On-disk-only / full quarantine | heygen-com/hyperframes | 1219834bd5b514aa9c26a376d59453058693855adddaba1773999a902b2f73ed | Mismatch | Quarantine; creative-only. |
| hyperframes-creative | On-disk-only / full quarantine | heygen-com/hyperframes | b803c42cece83e471e749b6c81b560a44784f3928f3be56f9876bfd1972efb0b | Mismatch | Quarantine; creative-only. |
| hyperframes-media | On-disk-only / full quarantine | heygen-com/hyperframes | 154d150b92db8a574e21accb7cf7cd065e05e1e2bb96ca2e5e9ca406a5431bfa | Mismatch | Quarantine; creative-only. |
| hyperframes-registry | On-disk-only / full quarantine | heygen-com/hyperframes | 62984a677583cb55beebbb5784e1caeabf7ac3e5a09e66bb5dd7205d5ab411bf | Mismatch | Quarantine; creative-only. |
| motion-graphics | On-disk-only / full quarantine | heygen-com/hyperframes | a45939078652dfb46c524875457afe140c9b42912fee75aa39f9dd4908ae46ff | Mismatch | Quarantine; creative-only. |
| music-to-video | On-disk-only / full quarantine | heygen-com/hyperframes | ee3d2780b78d94bc0486c6e8029356a02b0b48d6c36766fe90ff9a300157c3af | Mismatch | Quarantine; creative-only. |
| pr-to-video | On-disk-only / full quarantine | heygen-com/hyperframes | acae18bbce7aa611bb420bd56147fa3efdb6675d86fc975dec8f5ac356c59e6a | Mismatch | Quarantine; creative-only. |
| product-launch-video | On-disk-only / full quarantine | heygen-com/hyperframes | 89545f64622f6ff7975407b6698f7b70d1b21efe03e3b5ebb89ded83234ca1d1 | Mismatch | Quarantine; conditional after verified release. |
| remotion-to-hyperframes | On-disk-only / full quarantine | heygen-com/hyperframes | ee04c5eca6113d5a3a8aeee9e78792451da57f06450bd034486950142ee05766 | Mismatch | Quarantine; creative-only. |
| slideshow | On-disk-only / full quarantine | heygen-com/hyperframes | 0a1882ec675c2d5d624bf115c18d5aa2454735cd4fb78948ee70321a257aa7b1 | Mismatch | Quarantine; creative-only. |
| website-to-video | On-disk-only / full quarantine | heygen-com/hyperframes | 89921c8b4fed4f4aa6f78359d8c4f1689cc2d439946f7ff2e8a6ad5b58ac20f8 | Mismatch | Quarantine; creative-only. |
| xcode-project-setup | Integrity-matched / provenance-review | firebase/agent-skills | c212c4e08f0d2bbd4a2a61278a9a030e3da1227c0fe57022ed54d1c3c1a0aaf8 | Match | Not active; architecture exclusion—iOS/Xcode is out of scope. |

## Catalog mapping and activation gate

The current Codex catalog exposes several generic engineering, testing, data, SEO, accessibility, and content skills. It does not automatically expose the checked-in `.agents/skills` entries. Before changing a local-skill status to active, the Program Steward must record:

1. Exact upstream revision and a fresh trusted checkout or release artifact.
2. Recomputed documented hash that explains the lock algorithm, or a corrected lock reviewed in a dedicated PR.
3. A review of all executable assets and their network, filesystem, secret, and subprocess permissions.
4. A task-specific least-privilege decision and sandboxed forward test.
5. Baseline behavior, independent regression evidence, and rollback steps for any resulting product change.

## Explicitly rejected stack skills

Do not introduce Shadcn, Stripe, Supabase, CircleCI, Next.js-specific deployment/authentication, Firebase Hosting/App Hosting, Firebase Data Connect, or Xcode skills unless an approved architecture decision changes the stack. Do not use video/creative skills to manufacture borrowers, testimonials, deals, logos, rates, or product capabilities.

## Human-only approval gaps

No agent or skill may authorize mortgage licensing, advertising/disclosure compliance, ECOA/Fair Housing conclusions, privacy obligations, underwriting eligibility, pricing, tax treatment, or independent quantitative model-risk acceptance. The ledger records these as named human gates, not agent tasks.
