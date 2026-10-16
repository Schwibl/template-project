# How to cook (plan before you build)

Use this **only when the user explicitly says "grill" or "unwrap"**: **wrap → unwrap → grill → leaf → implement**. Otherwise build the smallest working version (Ponytail rules in `AGENTS.md`).

## The cascade

```
wrapped direction plan          →  .prompts/<direction>/00_<direction>_unwrap_steps.md
  grill → author leaf plans     →  .prompts/<direction>/NN_<step>.md   (no product code)
    grill → implement one leaf  →  code + docs from that leaf
```

| Level         | Agent may write                              | Agent must not                               |
| ------------- | -------------------------------------------- | -------------------------------------------- |
| Wrap / unwrap | The step inventory, then leaf markdown only  | Product code                                 |
| Leaf plan     | Settled decisions, numbered steps, docs list | Shipping code in the planning chat           |
| Implement     | Code and docs the leaf lists                 | Re-open Settled choices unless the user does |

Default: **one unwrap or one leaf per chat**. Continue into implementation only when the user says so ("proceed", "implement").

## Grill

1. Ask only what the repo, docs and ADRs can't answer. Look facts up yourself.
2. Ask in short numbered rounds, each with your recommended answer.
3. Write accepted answers into the leaf's **Settled (do not re-grill)** section, dated.
4. "Looks good, proceed" is not permission to skip writing Settled into the leaf.
5. When a term settles, update `CONTEXT.md`. Offer an ADR only when the decision is hard to reverse, surprising, and a real trade-off.

## Leaf plan shape

1. Title, link to the parent unwrap, Goal, Prerequisites
2. **Settled**: locked choices with dates
3. **Implementation steps**: numbered, each with **Done when**
4. **Docs to write**, **Out of scope**, **Handoff** (next leaf)

## Implement

1. Read the leaf and its Settled block.
2. Make the smallest complete change for the leaf (Ponytail). Ship docs in the same change set (`how_to_document.md`).
3. Run the checks in `AGENTS.md`. Mark the leaf done only when every Done-when holds.

## Anti-patterns

- Starting this loop when the user didn't ask for "grill" or "unwrap"
- Implementing from an unwrap file before its leaves exist
- Auto-resolving ambiguous product choices to keep moving
- Silent drift from `CONTEXT.md` or an ADR
