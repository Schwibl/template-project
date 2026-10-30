# Tests and behaviour

A behaviour change updates tests in the same PR. The auditor blocks the PR otherwise (P1).

New non-trivial logic still gets one small test (Ponytail, in `AGENTS.md`). Trivial changes need none.

Run `npm test`. When the UI changed, run `npm run e2e`. Fix what you broke. Paste the agent report (`test-report.md`) into the handoff.
