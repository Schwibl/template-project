# Merge

The PM bot (Tech-lead) squash-merges. The steps are in `agents/tech-lead.md`. Devops does the test-merge and the live check (`agents/devops.md`).

Squash-merge only when all of these are true for the exact head SHA:

1. The auditor's verdict is GO on that SHA.
2. CI is green on that SHA.
3. When any other pull request is open, Devops has test-merged this head with those open heads and posted the result on this SHA. When no other pull request is open, skip the test-merge.

After the squash-merge, Devops verifies live.

A human still has to approve, before that squash-merge, any change that involves money, new accounts/secrets, and destructive DB migrations.

Branch names, commit text, and the pull request itself stay in `.prompts/base/how_to_git.md`.
