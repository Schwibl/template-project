# Builder → auditor handoff

Paste into the PR description. Keep it short; the auditor re-checks everything.

Open with Impact (`docs/workflow/impact.md`), then the handoff below.

```markdown
## Impact

Before: <what the user experienced>
After: <what the user experiences>
Load time: <ms or unchanged>
Steps: <count>
Errors: <what the user hits, or none>

## Handoff

- **Plan:** <link to leaf / ticket>
- **Commit:** `<sha>` on `<branch>`
- **What changed:** 1–3 bullets
- **Checks run:** lint ✅ typecheck ✅ unit N passed ✅ build ✅ e2e N passed ✅
- **Settled (do not re-flag):** <links or bullets>
- **Shortcuts:** <dated `docs/next_steps.md` bullets added; no code comment>
- **Test report:** <agent report lines from `docs/quality/test-report.md`>

### Checklist for the auditor

- [ ] <behaviour 1: where to look, expected result>
- [ ] <behaviour 2>
- [ ] Mobile (390 px) and desktop (1440 px)
- [ ] Keyboard and screen-reader basics on changed controls
- [ ] Error / empty / loading states

### Skipped or unsure

- <what you didn't do or couldn't check, and the risk>
```
