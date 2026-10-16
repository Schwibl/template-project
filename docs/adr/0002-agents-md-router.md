# 0002. Keep AGENTS.md as a thin router

- Status: accepted (example)
- Date: 2026-10-16

## Context

Agents load `AGENTS.md` into every conversation. Long rule files waste context and get skimmed, so the important rules are missed.

## Decision

`AGENTS.md` holds only triggers ("when X, read Y"), repo facts and imported baseline rules. Detailed standards live in `.prompts/base/`, role prompts in `agents/`, and procedures in `skills/`.

## Alternatives considered

- **One big rules file** – simple, but costly and ignored as it grows.
- **Editor-specific rule files only** – ties the workflow to one tool.

## Consequences

Each rule has one home and is loaded only when needed. Triggers must be kept accurate when files move.
