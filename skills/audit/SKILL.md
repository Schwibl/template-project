---
name: audit
description: Audit a change before merge and write an evidence-backed report. Use when asked to review, QA or audit a PR, branch or preview deploy.
---

# Audit

Follow `agents/auditor.md`. In short:

1. Pin the SHA. Read the handoff, the plan and the Settled list.
2. Re-run lint, typecheck, test, build and e2e. Record exit codes and counts.
3. Check each handoff item and Done-when at 390 px and 1440 px. Save screenshots and logs next to the report.
4. Grade findings P1 (blocks merge), P2 (before release), P3 (can wait), each with evidence.
5. Give a GO / NO-GO verdict and list what you could not check.
