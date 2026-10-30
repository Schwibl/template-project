# Map test

Ten questions in `map-questions.md` have an expected phrase and a route that walks maps to the file that answers them. `npm run map-test` checks that each hop is listed in the previous map, that the phrase is in the last file, and that the measured files and tokens match `map-baseline.json`.

Tokens are `Math.ceil(characters / 4)` per file. `uniqueFiles` and `uniqueTokens` count each route file once. `routedOpens` and `routedTokens` count a file again when the next question opens it. The question file and the baseline are not part of the total.

## Rerun

Before a doc change, run `npm run map-test` and keep the printed numbers.

Blind pass, for a person or an agent: read only the `Question` lines. Start at `MAP.md`. Open only maps until you can name the file that should answer. Then open that file. Record every file and `Math.ceil(characters / 4)`. Write a JSON array of `{ "id", "answer", "files", "tokens" }` and run `npm run map-test -- --score answers.json`. Compare `correct`, `files`, and `reportedTokens` with the baseline.

After the doc change, run `npm run map-test` again. If the route or the token totals moved, run `npm run map-test -- --write` in the same change and put the before and after numbers in the pull request.

CI fails when a route misses its phrase, a hop is not on the map, or the committed baseline does not match a fresh run.
