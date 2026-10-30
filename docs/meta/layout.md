# Doc layout

Docs, prompts, skills, and role files sit in thematic folders. Hard cap: 200 lines per file. A markdown file over 200 lines fails `npm run lint`.

Code (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`) targets 200 lines. Lint warns above 200 and fails above 300.

## Maps

Every folder or subfolder under `docs/`, `.prompts/`, `skills/`, and `agents/` with more than one entry has a MAP.md. An entry is a file other than `MAP.md`, or a subfolder. One entry does not need a map.

One line per entry:

`- \`path\` — what it answers — when to read it`

Paths are relative to that `MAP.md`. List every direct file except `MAP.md`. For a subfolder, list its `MAP.md`, or its only file if it has no map. A folder of a single subfolder points at that subfolder's map. No dead entries. `scripts/docs.ts` checks this.

The root `MAP.md` links those folder maps, every other root markdown file, `LICENSE`, and `.github/PULL_REQUEST_TEMPLATE.md`. It does not list source files.

## Split

Before splitting a doc, prompt, or skill, extract one rule per content line into `split-ledger/`. After the split, map each id to `file:line` as `kept`, `merged` (with a reason), or `dropped` (with a reason). `scripts/ledger.ts` fails if an id is missing or the needle is not in that file.

`AGENTS.md` stays the router. Detail lives in `.prompts/`, `agents/`, and `skills/`, with maps.
