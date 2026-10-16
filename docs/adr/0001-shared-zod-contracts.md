# 0001. Validate data at boundaries with shared schemas

- Status: accepted (example)
- Date: 2026-10-16

## Context

When a frontend and a backend each declare their own types for the same payload, they drift silently. TypeScript types also vanish at runtime, so bad input from a network call or a form isn't caught.

## Decision

Define each payload once as a runtime schema (for example Zod) in a shared module, infer the TypeScript type from it, and parse at every trust boundary: request bodies, third-party API responses, env vars.

## Alternatives considered

- **Hand-written types on both sides** – no runtime check; drift is found in production.
- **Generated clients from OpenAPI** – good for large APIs, heavy for a small app.

## Consequences

One place to change a contract; invalid data fails loudly at the edge. Costs a small dependency and a parse call per boundary.
