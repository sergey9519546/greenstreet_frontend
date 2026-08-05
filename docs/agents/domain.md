# Domain docs

## Layout

GreenStreet is configured as a single-context repository. Engineering skills
should read root `CONTEXT.md` and relevant records under `docs/adr/` before
making domain, architecture, or test-naming decisions when those files exist.

Neither file set is created by this configuration. They are introduced only when
an accountable owner resolves domain terminology or an architectural decision.

## Consumer rules

- Use the vocabulary defined in `CONTEXT.md`; do not invent a synonym when an
  established term exists.
- Surface a conflict with an ADR instead of silently overriding it.
- Treat mortgage, pricing, underwriting, legal, tax, privacy, and model-risk
  terminology as controlled domain language: an agent cannot establish it.
- If a relevant context or ADR does not exist, proceed with explicit assumptions
  and record the gap in the issue or release evidence rather than fabricating a
  policy.
