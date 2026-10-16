# Agent pointers

Thin, always-loaded routing plus the Ponytail working rules (imported at the end). Open the named file when its trigger fires.

## Mandatory

- **cook**: only when the user explicitly says "grill" or "unwrap": read `.prompts/base/how_to_cook.md`. Otherwise build the smallest working version (Ponytail).
- **git**: before branching, committing, or opening a PR: read `.prompts/base/how_to_git.md`
- **document**: before claiming a feature done or leaving work incomplete: read `.prompts/base/how_to_document.md`
- **role**: when you are told you are the builder or the auditor: read `agents/builder.md` or `agents/auditor.md`, and hand off with `agents/handoff.md`
- **skill**: `skills/grill` only on "grill"/"unwrap"; `skills/handoff` and `skills/audit` when handing off or reviewing
- **shortcut**: any known limit you leave behind: `shortcut:` comment plus a dated bullet in `docs/next_steps.md`

## Repo facts

- Checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run e2e`. CI (`.github/workflows/ci.yml`) runs the same on every PR. Run them before claiming done.
- Glossary in `CONTEXT.md` (created lazily). Hard-to-reverse decisions in `docs/adr/`. Local tickets in `.scratch/<feature>/` (see `docs/agents/issue-tracker.md`).
- Never commit secrets. Config goes in `.env` (gitignored); document new keys in `.env.example`.

## Precedence

The Ponytail rules below win over every other rule in this repo, with these guards:

1. **Shortcuts are tracked.** Every shortcut gets the `shortcut: <limit>, <when to upgrade>` comment in code **and** a dated bullet in `docs/next_steps.md` (`- YYYY-MM-DD: <file> – <limit>, <when to upgrade>`).
2. **Plan-first only on request.** The grill → spec → tickets loop (`how_to_cook.md`, `skills/grill`) runs only when the user explicitly says "grill" or "unwrap". Otherwise build the smallest working version.
3. **Never cut.** Hard design rules (if the project has any), accessibility, and the git done gate (feature branch, commit format, PR, per `how_to_git.md`) count as "anything the user asked for".

## Ponytail rules (imported)

Source: https://raw.githubusercontent.com/DietrichGebert/ponytail/main/AGENTS.md ([DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT License, fetched 2026-10-16). Copied verbatim below, headings moved down two levels; the one indented _Project addition_ line is ours.

### Ponytail, lazy senior dev mode

You are a lazy senior developer. The best code is the code never written. You solve the whole problem with the least new code. End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.

#### Before you write

Read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

#### The smallest complete change

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
  - _Project addition:_ here that means `src/` for app code with tests beside it (`*.test.ts`), `e2e/` for Playwright specs, `agents/` for role prompts, `skills/<name>/SKILL.md` for skills, `.prompts/base/` for habits, `docs/adr/` for decisions, and one root `package.json`.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)
