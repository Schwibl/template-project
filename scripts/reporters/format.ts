export type Counts = { passed: number; failed: number; skipped: number };

export function suiteLine(suite: string, counts: Counts, durationMs: number): string {
  const label = counts.failed > 0 ? 'FAIL' : 'PASS';
  return `${label} ${suite} ${counts.passed} passed, ${counts.failed} failed, ${counts.skipped} skipped, ${Math.round(durationMs)}ms`;
}

export function likelyCause(message: string): string {
  if (/timed?\s*out/i.test(message)) return 'a step exceeded the timeout';
  if (/unable to find|strict mode violation|waiting for|no element|not found/i.test(message)) {
    return 'the expected element or text was not on the page';
  }
  if (/expected/i.test(message)) return 'the result did not match the expected value';
  const line = message
    .split('\n')
    .map((part) => part.trim())
    .find(Boolean);
  if (!line) return 'see the error and the expected versus actual values';
  return line.length > 140 ? `${line.slice(0, 140)}…` : line;
}

export function clip(value: string): string {
  const one = value.replace(/\s+/g, ' ').trim();
  if (!one) return 'unknown';
  return one.length > 300 ? `${one.slice(0, 300)}…` : one;
}

export function failureBlock(input: {
  suite: string;
  title: string;
  expected: string;
  actual: string;
  errorName: string;
  message: string;
  file: string;
  line: number;
  rerun: string;
}): string {
  const message =
    input.message
      .split('\n')
      .map((part) => part.trim())
      .find(Boolean) ?? 'unknown';
  return [
    `FAIL ${input.suite} > ${input.title}`,
    `expected: ${clip(input.expected)}`,
    `actual: ${clip(input.actual)}`,
    `error: ${input.errorName}: ${clip(message)} at ${input.file}:${input.line}`,
    `likely cause: ${likelyCause(input.message)}`,
    `rerun: ${input.rerun}`,
  ].join('\n');
}

export function shellArg(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

export function vitestRerun(file: string, name: string): string {
  return `npx vitest run ${shellArg(file)} -t ${shellArg(name)}`;
}

export function playwrightRerun(file: string, title: string, project: string): string {
  return `npx playwright test ${shellArg(file)} -g ${shellArg(title)} --project=${shellArg(project)}`;
}

export function parseExpected(message: string): { expected: string; actual: string } {
  const expected = message.match(/^Expected(?: substring| pattern| string)?: (.*)$/m);
  const actual = message.match(/^Received(?: string)?: (.*)$/m);
  return { expected: strip(expected?.[1] ?? ''), actual: strip(actual?.[1] ?? '') };
}

function strip(value: string): string {
  const text = value.trim();
  if (text.startsWith('"') && text.endsWith('"')) return text.slice(1, -1);
  return text || 'unknown';
}
