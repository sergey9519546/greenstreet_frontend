# Skill-lock forensics

**Scope.** This is a read-only forensic record for the clean worktree at
<code>5de3b41b6e4731d1584ac056cba3441c677a4171</code>. It does not authorize execution,
installation, update, removal, or modification of any skill.

## Result

<code>skills-lock.json</code> has 29 entries. When its <code>computedHash</code> values are evaluated
with the project-local lock-file algorithm, **11 of 11 Firebase entries match**
and **0 of 18 HeyGen Hyperframes entries match**.

This is narrower than a blanket trust decision:

- A match confirms that the currently checked-out skill directory is byte-for-byte
  consistent with the project's recorded folder hash under the identified
  algorithm.
- A match does not prove that the upstream repository was official at the time of
  installation, that the upstream source is still unchanged, or that the skill is
  appropriate to execute.
- A mismatch is a hard integrity/provenance gap. The affected skill must remain
  quarantined; do not regenerate its lock entry merely to make the warning go
  away.

## Verified facts

### Lock-file shape and provenance fields

The committed <code>skills-lock.json</code> is version <code>1</code>. Every entry contains:

- <code>source</code> (either <code>firebase/agent-skills</code> or <code>heygen-com/hyperframes</code>),
- <code>sourceType</code> (<code>github</code>),
- <code>skillPath</code> (the claimed path to <code>SKILL.md</code> in the source repository), and
- a 64-character hexadecimal <code>computedHash</code>.

No entry records a <code>sourceUrl</code>, immutable Git commit/ref, installer version,
signature, installation timestamp, or reviewer approval. Consequently, this lock
file is an integrity snapshot of a local folder, not a complete reproducible
provenance record.

The Firebase project source has an independent official reference: Firebase's
[Agent Skills announcement](https://firebase.blog/posts/2026/02/ai-agent-skills-for-firebase)
identifies <code>firebase/agent-skills</code> and its installation command. That establishes
the claimed repository identity, but not the specific historical revision used by
this checkout.

### Canonicalization that was verified

The current implementation of Vercel's project-local lock mechanism is published
in [local-lock.ts](https://raw.githubusercontent.com/vercel-labs/skills/main/src/local-lock.ts).
Its <code>computeSkillFolderHash</code> routine:

1. recursively reads all ordinary files below the skill folder;
2. excludes nested <code>.git</code> and <code>node_modules</code> directories;
3. sorts files by POSIX-normalized relative path;
4. updates a SHA-256 digest with each relative path followed immediately by that
   file's raw bytes; and
5. writes the lowercase hexadecimal digest.

That algorithm was reimplemented locally for inspection only (no skill code or
scripts were run). It reproduces every Firebase hash in this lock exactly. A
single-file SHA-256 comparison is therefore the wrong test for this lock format.
For example, the raw SHA-256 of <code>firebase-basics/SKILL.md</code> is
<code>8d4a8e90807686c0d9da2780b6952ac0f5d9b12d694d0a354c81e1590cf57f9b</code>,
while the matching folder hash recorded in the lock is
<code>610305ba0d7fcb956001a2a96eea7902b63ae7367214aeee7ab0d93e0b6e8369</code>.

This checkout has global <code>core.autocrlf=true</code> and no repository <code>.gitattributes</code>
policy. The verified algorithm hashes working-tree bytes, so line-ending policy
can change a result. The 11 Firebase hashes match the present CRLF working tree;
normalizing them to LF does not match. Any future verification must therefore
record its OS/EOL policy and use the same reviewed hashing implementation.

### Integrity result by source

| Claimed source | Entries | Exact folder-hash result | Lock-introducing commit |
| --- | ---: | --- | --- |
| <code>firebase/agent-skills</code> | 11 | 11 match; 0 mismatch | <code>a7a37c9139245bcef57cfa66c3e41c22a2786374</code> (2026-06-22) |
| <code>heygen-com/hyperframes</code> | 18 | 0 match; 18 mismatch | <code>19388bcf05e3a0ac66360add20ed6d0583034312</code> (2026-06-24) |

The verified Firebase matches are:

<code>firebase-ai-logic-basics</code>, <code>firebase-app-hosting-basics</code>,
<code>firebase-auth-basics</code>, <code>firebase-basics</code>, <code>firebase-crashlytics</code>,
<code>firebase-data-connect</code>, <code>firebase-firestore</code>, <code>firebase-hosting-basics</code>,
<code>firebase-remote-config-basics</code>, <code>firebase-security-rules-auditor</code>, and
<code>xcode-project-setup</code>.

The mismatching Hyperframes entries are:

<code>embedded-captions</code>, <code>faceless-explainer</code>, <code>general-video</code>,
<code>graphic-overlays</code>, <code>hyperframes</code>, <code>hyperframes-animation</code>,
<code>hyperframes-cli</code>, <code>hyperframes-core</code>, <code>hyperframes-creative</code>,
<code>hyperframes-media</code>, <code>hyperframes-registry</code>, <code>motion-graphics</code>,
<code>music-to-video</code>, <code>pr-to-video</code>, <code>product-launch-video</code>,
<code>remotion-to-hyperframes</code>, <code>slideshow</code>, and <code>website-to-video</code>.

The Hyperframes mismatch is present in the committed clean tree: neither
working-tree CRLF bytes nor a whole-folder LF-normalization reproduces any of the
18 recorded values. The clean worktree has no uncommitted change under
<code>.agents/skills</code> or <code>skills-lock.json</code>.

### History evidence

Commit <code>a7a37c9</code> added the Firebase directories and their 11 lock entries.
Commit <code>19388bc</code> added all 18 Hyperframes directories and their lock entries in
the same commit. The latter fact rules out a later committed edit in this branch
as the explanation for the mismatch; it does not identify the pre-commit
installation or hashing process.

## Hypotheses that remain unproven

The forensic record does **not** establish why every Hyperframes entry differs.
Plausible explanations are:

1. the hash was computed from a different upstream snapshot than the one that was
   committed;
2. the installer/version used in June 2026 used a different hash implementation
   or selected a different folder boundary; or
3. a copying, packaging, or line-ending transformation happened between hash
   calculation and commit.

Line-ending conversion alone is not sufficient to explain the observed
Hyperframes values, because raw and LF-normalized whole-folder calculations both
failed. Do not present any hypothesis as a verified root cause without a pinned
upstream revision and an auditable installer trace.

## Safe reproducible verification procedure

Use this procedure in a disposable directory outside the repository. It is a
review procedure, not an instruction to run a skill or an installer.

1. Record the current project commit, <code>skills-lock.json</code> bytes, Node version,
   operating system, locale, <code>core.autocrlf</code>, and effective <code>.gitattributes</code>.
2. Confirm the claimed upstream owner through a first-party Firebase page, then
   resolve <code>https://github.com/firebase/agent-skills</code> to one immutable commit
   SHA. Preserve the full SHA, retrieval time, and reviewer in an evidence log.
3. Obtain only that commit in a disposable directory with a declared EOL policy
   (preferably <code>core.autocrlf=false</code>). Do not use <code>npx skills</code>, do not run
   <code>SKILL.md</code>-referenced commands, and do not copy anything into the project.
4. Review the source tree for unexpected executables, network instructions,
   secret handling, or unrelated task instructions. Review all files that the
   selected <code>SKILL.md</code> can cause an agent to load or execute.
5. Calculate the folder digest using the exact routine above (path as UTF-8,
   sorted POSIX relative paths, raw bytes, excluding only nested <code>.git</code> and
   <code>node_modules</code>). Record the full file list and digest.
6. Compare the independently calculated source digest with both the lock value
   and the project-local folder digest. A mismatch at any comparison is a stop
   condition, not a prompt to rewrite the lock.
7. Have an authorized reviewer approve the evidence and the intended capability
   scope. Only then permit the narrow declared use; keep all remote writes,
   authentication, deployments, and installations separately approved.

For an update rather than a historical verification, use a reviewed change set
that pins <code>sourceUrl</code> and immutable <code>ref</code>, records the installer/version and EOL
policy, shows the complete file diff, and updates the lock only after approval.
This project must also pass its existing lint, unit, homepage-fidelity, and build
gates before such a change is accepted.

## Conditional candidate: <code>firebase-security-rules-auditor</code>

This is the safest Firebase candidate for a future, narrow unquarantine because:

- it has a matching folder hash:
  <code>42e793406ca8980c47fcdbd309f02838316849bcbf8475001b4ecaa6a67606b8</code>;
- its local folder currently contains only <code>SKILL.md</code> (no bundled script or
  executable asset); and
- its described function is advisory review of Firestore rules, not deployment or
  project provisioning.

It is **not unquarantined by this document**. It becomes eligible for
advisory-only use only when all of the following are true:

1. the seven-step provenance and hash procedure above has a recorded pass for a
   pinned official Firebase revision;
2. a reviewer approves the exact skill text and its constrained scope;
3. the task is a read-only Firestore-rule review with no credentials, production
   writes, Firebase CLI login, deployment, or installation; and
4. any proposed rule change follows the ordinary project test and human-review
   gates rather than treating the skill output as authority.

Until then, retain the 18 Hyperframes skills in full quarantine and retain all
Firebase skills, including this candidate, in provenance-review status.
