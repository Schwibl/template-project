# How to git

## Branches

Never commit to `main`. Branch from up-to-date `main`, push, open a PR. `main` is protected: CI must pass before merge.

## Commit messages

```text
[area] <Past-tense verb> <what landed>
```

Examples: `[auth] Added session refresh on 401`, `[ci] Cached Playwright browsers`. No `wip`, `update`, `fix`, or present tense.

## Pull requests

- One logical change per PR. Base: `main`.
- Description: what changed, why, how it was checked, what was skipped.
- The auditor reviews before merge (`agents/auditor.md`). Not done until the PR exists and CI is green.
