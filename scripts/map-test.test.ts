import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseQuestions, runOracle, scoreSheet, tokensOf, type Question } from './map-test.ts';

function ten(route: string[], expectText: string): Question[] {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `Q${index + 1}`,
    question: `q${index + 1}`,
    expect: expectText,
    route,
  }));
}

describe('map test', () => {
  it('counts tokens as characters over 4', () => {
    expect(tokensOf('abcd')).toBe(1);
    expect(tokensOf('abcde')).toBe(2);
  });

  it('scores an answer sheet against the expected phrase', () => {
    const questions = ten(['MAP.md', 'guide.md'], 'red');
    const score = scoreSheet(questions, [
      { id: 'Q1', answer: 'it is red', files: ['MAP.md', 'guide.md'], tokens: 4 },
    ]);
    expect(score.correct).toBe(1);
    expect(score.files).toBe(2);
    expect(score.reportedTokens).toBe(4);
  });

  it('walks maps and misses a phrase that is not in the destination', () => {
    const dir = mkdtempSync(join(tmpdir(), 'map-'));
    mkdirSync(join(dir, 'docs'));
    writeFileSync(join(dir, 'MAP.md'), '- `docs/guide.md` — guide — when\n');
    writeFileSync(join(dir, 'docs/guide.md'), 'The answer is red.\n');
    const text = '## Q1\n\n- Question: color?\n- Expect: red\n- Route: MAP.md > docs/guide.md\n';
    expect(parseQuestions(text)[0]?.route).toEqual(['MAP.md', 'docs/guide.md']);
    const hit = runOracle(dir, ten(['MAP.md', 'docs/guide.md'], 'red'));
    expect(hit.correct).toBe(10);
    expect(hit.errors).toEqual([]);
    const miss = runOracle(dir, ten(['MAP.md', 'docs/guide.md'], 'blue'));
    expect(miss.correct).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });
});
