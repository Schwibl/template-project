import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repoRoot } from './root.ts';
import { fillLedgers } from './ledger-fill.ts';

export type Rule = {
  id: string;
  status: string;
  target: string;
  needle: string;
  reason: string;
  source: string;
  origin: string;
};

export const LEDGER = 'docs/meta/split-ledger';

export function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function locate(fileText: string, needle: string): number | null {
  const want = collapse(needle);
  if (!want) return null;
  const lines = fileText.split('\n');
  const usable = lines.at(-1) === '' ? lines.slice(0, -1) : lines;
  for (let size = 1; size <= 6; size += 1) {
    for (let i = 0; i <= usable.length - size; i += 1) {
      if (collapse(usable.slice(i, i + size).join(' ')) === want) return i + 1;
    }
  }
  return null;
}

export function parseLedger(text: string): { rules: Rule[]; error: string | null } {
  const fence = /```ledger\n([\s\S]*?)```/.exec(text);
  if (!fence?.[1]) return { rules: [], error: 'missing ledger fence' };
  const rules: Rule[] = [];
  for (const raw of fence[1].split('\n')) {
    if (!raw.trim()) continue;
    const parts = raw.split('\t');
    if (parts.length !== 7)
      return { rules, error: `expected 7 fields, got ${parts.length}: ${raw.slice(0, 40)}` };
    const [id, status, target, needle, reason, source, origin] = parts;
    if (
      !id ||
      !status ||
      target === undefined ||
      needle === undefined ||
      reason === undefined ||
      source === undefined ||
      origin === undefined
    ) {
      return { rules, error: `blank field in ${raw.slice(0, 40)}` };
    }
    rules.push({ id, status, target, needle, reason, source, origin });
  }
  return { rules, error: null };
}

export function checkRules(rules: Rule[], read: (rel: string) => string | null): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const numbers: number[] = [];
  for (const rule of rules) {
    if (!/^R\d+$/.test(rule.id)) errors.push(`${rule.id} bad id`);
    if (seen.has(rule.id)) errors.push(`${rule.id} duplicate`);
    seen.add(rule.id);
    numbers.push(Number(rule.id.slice(1)));
    if (!rule.source) errors.push(`${rule.id} missing source`);
    if (!/^.+:\d+$/.test(rule.origin)) errors.push(`${rule.id} bad origin`);
    if (rule.status === 'dropped') {
      if (rule.target !== '-') errors.push(`${rule.id} dropped target must be -`);
      if (!rule.reason) errors.push(`${rule.id} dropped without reason`);
      continue;
    }
    if (rule.status !== 'kept' && rule.status !== 'merged') {
      errors.push(`${rule.id} status ${rule.status}`);
      continue;
    }
    if (rule.status === 'merged' && !rule.reason) errors.push(`${rule.id} merged without reason`);
    if (!rule.needle) errors.push(`${rule.id} missing needle`);
    const match = /^(.+):(\d+)$/.exec(rule.target);
    if (!match?.[1] || !match[2]) {
      errors.push(`${rule.id} bad target`);
      continue;
    }
    const text = read(match[1]);
    if (text === null) {
      errors.push(`${rule.id} missing file ${match[1]}`);
      continue;
    }
    const line = locate(text, rule.needle);
    if (line === null) errors.push(`${rule.id} needle missing in ${match[1]}`);
    else if (line !== Number(match[2]))
      errors.push(`${rule.id} needle at ${match[1]}:${line}, ledger says ${match[2]}`);
  }
  numbers.sort((a, b) => a - b);
  for (let i = 0; i < numbers.length; i += 1) {
    if (numbers[i] !== i + 1) {
      errors.push(`id gap or start at R${numbers[i]}`);
      break;
    }
  }
  return errors;
}

export function loadRules(root: string): { rules: Rule[]; errors: string[] } {
  const dir = join(root, LEDGER);
  const rules: Rule[] = [];
  const errors: string[] = [];
  for (const name of readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file !== 'MAP.md')
    .sort()) {
    const parsed = parseLedger(readFileSync(join(dir, name), 'utf8'));
    if (parsed.error) errors.push(`${name}: ${parsed.error}`);
    rules.push(...parsed.rules);
  }
  return { rules, errors };
}

function main(): void {
  const root = repoRoot();
  if (process.argv.includes('--fill')) {
    for (const note of fillLedgers(root)) console.error(note);
    return;
  }
  const loaded = loadRules(root);
  const errors = [
    ...loaded.errors,
    ...checkRules(loaded.rules, (rel) => {
      try {
        return readFileSync(join(root, rel), 'utf8');
      } catch {
        return null;
      }
    }),
  ];
  if (process.argv.includes('--summary')) {
    const counts = { kept: 0, merged: 0, dropped: 0 };
    for (const rule of loaded.rules) {
      if (rule.status === 'kept' || rule.status === 'merged' || rule.status === 'dropped')
        counts[rule.status] += 1;
    }
    console.log(`kept: ${counts.kept}`);
    console.log(`merged: ${counts.merged}`);
    console.log(`dropped: ${counts.dropped}`);
    console.log('merged:');
    for (const rule of loaded.rules.filter((rule) => rule.status === 'merged')) {
      console.log(`- ${rule.id} (${rule.target}) ${rule.reason}`);
    }
    console.log('dropped:');
    const dropped = loaded.rules.filter((rule) => rule.status === 'dropped');
    if (dropped.length === 0) console.log('- none');
    for (const rule of dropped) console.log(`- ${rule.id} ${rule.reason}`);
  }
  for (const error of errors) console.error(error);
  if (errors.length === 0 && !process.argv.includes('--summary')) console.log('ledger: ok');
  process.exitCode = errors.length === 0 ? 0 : 1;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) main();
