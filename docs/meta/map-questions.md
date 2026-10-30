# Map questions

## Q1

- Question: When may an agent run the grill or unwrap loop?
- Expect: only when the user explicitly says "grill" or "unwrap"
- Route: MAP.md > .prompts/base/MAP.md > .prompts/base/how_to_cook.md

## Q2

- Question: Who squash-merges a pull request?
- Expect: The PM bot (Tech-lead) squash-merges
- Route: MAP.md > docs/MAP.md > docs/workflow/MAP.md > docs/workflow/merge.md

## Q3

- Question: Which changes still need a human before that squash-merge?
- Expect: money, new accounts/secrets, and destructive DB migrations
- Route: MAP.md > docs/MAP.md > docs/workflow/MAP.md > docs/workflow/merge.md

## Q4

- Question: Which comments may appear in code?
- Expect: tool directives that carry a reason, license headers, and generated files
- Route: MAP.md > docs/MAP.md > docs/policy/comments.md

## Q5

- Question: What is the hard line cap for a doc, prompt, or skill?
- Expect: Hard cap: 200 lines per file
- Route: MAP.md > docs/MAP.md > docs/meta/MAP.md > docs/meta/layout.md

## Q6

- Question: When does a folder need its own MAP.md?
- Expect: more than one entry has a MAP.md
- Route: MAP.md > docs/MAP.md > docs/meta/MAP.md > docs/meta/layout.md

## Q7

- Question: What must a behaviour change include in the same pull request?
- Expect: A behaviour change updates tests in the same PR
- Route: MAP.md > docs/MAP.md > docs/quality/MAP.md > docs/quality/tests.md

## Q8

- Question: How does a passing suite report itself to an agent?
- Expect: One line per suite with passed, failed, skipped, and duration
- Route: MAP.md > docs/MAP.md > docs/quality/MAP.md > docs/quality/test-report.md

## Q9

- Question: What must Impact leave out?
- Expect: Do not put lines, files, or coverage in Impact
- Route: MAP.md > docs/MAP.md > docs/workflow/MAP.md > docs/workflow/impact.md

## Q10

- Question: What is the rule for committing secrets?
- Expect: Never commit secrets
- Route: MAP.md > AGENTS.md
