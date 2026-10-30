# Split ledger

Each fence row is id, status, target, needle, reason, source, origin. Lint fails if an id is missing or the needle is not in the target file.

- `01.md` — R001–R070 from the router and the start of the README — when tracing an AGENTS.md rule
- `02.md` — R071–R140 from the README through the git prompt — when tracing setup or git
- `03.md` — R141–R210 from the document prompt through the auditor — when tracing review rules
- `04.md` — R211–R280 from the auditor through ADR 0001 — when tracing roles or the schema ADR
- `05.md` — R281–R304 from ADR 0002 through next steps — when tracing the tracker or a shortcut
