---
name: grill
description: Interview the user to settle a fuzzy feature before planning or code. Use only when the user explicitly says "grill" or "unwrap"; otherwise build the smallest working version.
---

# Grill

Run only on an explicit "grill" or "unwrap" from the user.

1. Read the code, `CONTEXT.md` and `docs/adr/` first. Never ask what the repo already answers.
2. List the open decisions. Drop anything already **Settled**.
3. Ask one round of at most 5 numbered questions. Give your recommended answer for each, with one line of why.
4. Wait. Accept "keep recommendations" as a valid answer.
5. Write the answers into the plan's **Settled (do not re-grill)** section with today's date. Update `CONTEXT.md` for new terms.
6. Repeat only if answers opened new decisions. Stop when the plan can be implemented without guessing.
