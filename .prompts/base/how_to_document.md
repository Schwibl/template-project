# How to document

- Docs ship in the same PR as the code they describe.
- User-visible behaviour: update the README or `docs/`.
- New term: `CONTEXT.md`. Hard-to-reverse decision: a new ADR from `docs/adr/0000-template.md`.
- Shortcut or known gap: a dated bullet in `docs/next_steps.md` (`- YYYY-MM-DD: <file> – <limit>, <when to upgrade>`). No code comment. Say what was skipped in the PR description.
- Comments: none in code, except a tool directive that carries a reason, a license header, or a generated file (`docs/policy/comments.md`).
- Docs, prompts, and skills follow `docs/meta/layout.md` (200-line cap, thematic folders, `MAP.md`).
- Don't duplicate: link to the file that owns a fact.
