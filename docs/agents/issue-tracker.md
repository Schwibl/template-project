# Issue tracker: local markdown

| Tree                    | Role                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `.prompts/<direction>/` | Plans: unwrap files and leaf plans (`how_to_cook.md`). Committed.                              |
| `.scratch/<feature>/`   | Working specs and tickets. Gitignored by default; commit it if your team wants shared tickets. |

- Spec: `.scratch/<feature>/spec.md`
- Tickets: `.scratch/<feature>/issues/NN-<slug>.md`, numbered from `01`, one per file
- A `Status:` line near the top uses the roles in `triage-labels.md`
- Discussion appends under `## Comments`

If the repo uses GitHub Issues instead, use the same labels there.
