---
name: handoff
description: Write a handoff so another agent (or a fresh chat) can continue the work. Use at the end of a build, before an audit, or when context is running out.
---

# Handoff

1. Commit and push what you have. Note the SHA and branch.
2. Fill in `agents/handoff.md`. For a mid-task handoff, replace the checklist with **Next steps** (numbered, each with Done when).
3. List what you skipped, what is broken, and any command that failed, with its output.
4. Put it in the PR description, or in `.scratch/<feature>/handoff.md` if there is no PR yet.
