# Builder → auditor handoff

Paste into the PR description. Keep it short; the auditor re-checks everything.

```markdown
## Handoff

- **Plan:** <link to leaf / ticket>
- **Commit:** `<sha>` on `<branch>`
- **What changed:** 1–3 bullets
- **Checks run:** lint ✅ typecheck ✅ unit N passed ✅ build ✅ e2e N passed ✅
- **Settled (do not re-flag):** <links or bullets>
- **Shortcuts:** <`shortcut:` comments added, each with its `docs/next_steps.md` bullet>

### Checklist for the auditor

- [ ] <behaviour 1: where to look, expected result>
- [ ] <behaviour 2>
- [ ] Mobile (390 px) and desktop (1440 px)
- [ ] Keyboard and screen-reader basics on changed controls
- [ ] Error / empty / loading states

### Skipped or unsure

- <what you didn't do or couldn't check, and the risk>
```
