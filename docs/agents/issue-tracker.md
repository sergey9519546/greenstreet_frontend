# Issue tracker: GitHub

Issues and PRDs for this repository live in GitHub Issues for
`sergey9519546/greenstreet_frontend`. Use the `gh` CLI from this clone; it
infers the repository from the `origin` remote.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue with `gh issue view <number> --comments` and include labels.
- List work with `gh issue list` using an appropriate state and label filter.
- Add discussion with `gh issue comment <number> --body "..."`.
- Apply or remove labels with `gh issue edit <number> --add-label "..."` or
  `--remove-label "..."`.
- Close completed work with `gh issue close <number> --comment "..."`.

When a skill says to publish to the issue tracker, it means GitHub Issues.
External GitHub mutations still require the task's normal authorization and
must link validation and rollback evidence for release-sensitive work.
