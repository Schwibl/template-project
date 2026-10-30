# Test report for agents

`npm test` and `npm run e2e` print this shape. Quote it in the handoff. Do not paste the raw runner log.

## Pass

One line per suite with passed, failed, skipped, and duration. A suite is a test file. Playwright adds the project name.

`PASS <suite> <passed> passed, <failed> failed, <skipped> skipped, <duration>ms`

## Fail

The suite line, then one block per failed test:

```text
FAIL <suite> > <test>
expected: <value>
actual: <value>
error: <name: message> at <file:line>
likely cause: <one line>
rerun: <command>
```

Likely cause is a timeout, a missing element, or a value mismatch. The rerun command runs that test only.

Unit: `npx vitest run <file> -t "<name>"`

E2E: `npx playwright test <file> -g "<name>" --project=<project>`
