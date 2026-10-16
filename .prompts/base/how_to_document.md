# How to document

- Docs ship in the same PR as the code they describe.
- User-visible behaviour: update the README or `docs/`.
- New term: `CONTEXT.md`. Hard-to-reverse decision: a new ADR from `docs/adr/0000-template.md`.
- Shortcut or known gap: a `shortcut: <limit>, <when to upgrade>` comment in code **and** a dated bullet in `docs/next_steps.md`. Say what was skipped in the PR description.
- Comments: only the why the code can't show, in one line (Ponytail).
- Don't duplicate: link to the file that owns a fact.
