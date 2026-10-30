# 0003. Team rules for comments, merge, docs, tests, and Impact

- Status: accepted
- Date: 2026-10-30

## Context

This repo seeds later projects, starting with a personal website. Agents could leave comments in code, merge by habit, and review a diff instead of what the user can do.

## Decision

Adopt the rules in `docs/policy/comments.md`, `docs/workflow/merge.md`, `docs/workflow/impact.md`, `docs/meta/layout.md`, `docs/quality/tests.md`, and `docs/quality/test-report.md`. Lint enforces comments, line caps, maps, the split ledger, and the map test.

## Alternatives considered

- **Leave the rules in chat only** – the next project would not inherit them.
- **One more section in AGENTS.md** – that file would stop being a thin router (`0002`).

## Consequences

An agent opens the root map, then one folder map, then one file. The Ponytail import follows the no-comment rule. A human still approves money, new accounts or secrets, and a destructive DB migration.
