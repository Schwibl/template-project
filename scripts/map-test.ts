import { readFileSync, writeFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mapEntries } from './docs.ts';
import { collapse } from './ledger.ts';
import { repoRoot } from './root.ts';

const QUESTIONS = 'docs/meta/map-questions.md';
const BASELINE = 'docs/meta/map-baseline.json';

export type Question = { id: string; question: string; expect: string; route: string[] };

export type Oracle = {
  questions: number;
  correct: number;
  uniqueFiles: number;
  uniqueTokens: number;
  routedOpens: number;
  routedTokens: number;
  misses: string[];
  errors: string[];
};

export function tokensOf(text: string): number {
  return Math.ceil(text.length / 4);
}

export function parseQuestions(text: string): Question[] {
  const questions: Question[] = [];
  for (const block of text.split(/^## /m).slice(1)) {
    const id = /^Q\d+/.exec(block)?.[0] ?? '';
    const question = /^- Question: (.+)$/m.exec(block)?.[1]?.trim() ?? '';
    const expect = /^- Expect: (.+)$/m.exec(block)?.[1]?.trim() ?? '';
    const route = (/^- Route: (.+)$/m.exec(block)?.[1] ?? '')
      .split('>')
      .map((part) => part.trim())
      .filter(Boolean);
    questions.push({ id, question, expect, route });
  }
  return questions;
}

export function runOracle(root: string, questions: Question[]): Oracle {
  const cache = new Map<string, string>();
  const load = (rel: string): string => {
    const hit = cache.get(rel);
    if (hit !== undefined) return hit;
    const text = readFileSync(join(root, rel), 'utf8');
    cache.set(rel, text);
    return text;
  };
  const errors: string[] = [];
  const misses: string[] = [];
  let correct = 0;
  let routedOpens = 0;
  let routedTokens = 0;
  if (questions.length !== 10) errors.push(`expected 10 questions, found ${questions.length}`);
  for (const question of questions) {
    if (question.route.length < 2) errors.push(`${question.id} route is too short`);
    question.route.forEach((rel, index) => {
      if (index < question.route.length - 1 && !rel.endsWith('MAP.md')) {
        errors.push(`${question.id} hop ${rel} is not a map`);
      }
    });
    for (let i = 0; i < question.route.length - 1; i += 1) {
      const map = question.route[i] ?? '';
      const next = question.route[i + 1] ?? '';
      let text: string;
      try {
        text = load(map);
      } catch {
        errors.push(`${question.id} missing ${map}`);
        continue;
      }
      const listed = mapEntries(text)
        .map((entry) => entry.path)
        .filter((path): path is string => path !== null)
        .map((path) => posix.normalize(posix.join(posix.dirname(map), path)));
      if (!listed.includes(next)) errors.push(`${question.id} ${map} does not list ${next}`);
    }
    const dest = question.route.at(-1) ?? '';
    try {
      routedOpens += question.route.length;
      for (const rel of question.route) routedTokens += tokensOf(load(rel));
      if (collapse(load(dest)).includes(collapse(question.expect))) correct += 1;
      else misses.push(question.id);
    } catch {
      errors.push(`${question.id} missing ${dest}`);
      misses.push(question.id);
    }
  }
  let uniqueTokens = 0;
  for (const text of cache.values()) uniqueTokens += tokensOf(text);
  return {
    questions: questions.length,
    correct,
    uniqueFiles: cache.size,
    uniqueTokens,
    routedOpens,
    routedTokens,
    misses,
    errors,
  };
}

export type SheetRow = { id: string; answer: string; files: string[]; tokens: number };

export function scoreSheet(
  questions: Question[],
  rows: SheetRow[],
): { correct: number; reportedTokens: number; files: number } {
  let correct = 0;
  let reportedTokens = 0;
  const files = new Set<string>();
  for (const question of questions) {
    const row = rows.find((item) => item.id === question.id);
    if (!row) continue;
    if (collapse(row.answer).includes(collapse(question.expect))) correct += 1;
    reportedTokens += row.tokens;
    for (const file of row.files) files.add(file);
  }
  return { correct, reportedTokens, files: files.size };
}

function printOracle(oracle: Oracle): void {
  console.log(`questions: ${oracle.questions}`);
  console.log(`correct: ${oracle.correct}`);
  console.log(`uniqueFiles: ${oracle.uniqueFiles}`);
  console.log(`uniqueTokens: ${oracle.uniqueTokens}`);
  console.log(`routedOpens: ${oracle.routedOpens}`);
  console.log(`routedTokens: ${oracle.routedTokens}`);
}

function main(): void {
  const root = repoRoot();
  const questions = parseQuestions(readFileSync(join(root, QUESTIONS), 'utf8'));
  if (process.argv.includes('--score')) {
    const sheetPath = process.argv[process.argv.indexOf('--score') + 1] ?? '';
    const rows = JSON.parse(readFileSync(sheetPath, 'utf8')) as SheetRow[];
    const score = scoreSheet(questions, rows);
    console.log(`correct: ${score.correct}/${questions.length}`);
    console.log(`files: ${score.files}`);
    console.log(`reportedTokens: ${score.reportedTokens}`);
    process.exitCode = score.correct === questions.length ? 0 : 1;
    return;
  }
  const oracle = runOracle(root, questions);
  printOracle(oracle);
  for (const error of oracle.errors) console.error(error);
  for (const miss of oracle.misses) console.error(`miss ${miss}`);
  const baselinePath = join(root, BASELINE);
  const measured = {
    questions: oracle.questions,
    correct: oracle.correct,
    uniqueFiles: oracle.uniqueFiles,
    uniqueTokens: oracle.uniqueTokens,
    routedOpens: oracle.routedOpens,
    routedTokens: oracle.routedTokens,
  };
  if (process.argv.includes('--write')) {
    if (oracle.errors.length > 0 || oracle.correct !== oracle.questions) {
      process.exitCode = 1;
      return;
    }
    writeFileSync(baselinePath, `${JSON.stringify(measured, null, 2)}\n`);
    console.log(`wrote ${BASELINE}`);
    return;
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8')) as typeof measured;
  const same = JSON.stringify(baseline) === JSON.stringify(measured);
  if (!same)
    console.error(`baseline mismatch\n${JSON.stringify(baseline)}\n${JSON.stringify(measured)}`);
  if (!same || oracle.errors.length > 0 || oracle.misses.length > 0) process.exitCode = 1;
  else console.log('map-test: ok');
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) main();
