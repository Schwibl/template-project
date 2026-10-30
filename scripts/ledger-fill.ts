import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LEDGER, locate } from './ledger.ts';
import { walk } from './walk.ts';

function markdownFiles(root: string): string[] {
  return walk(root)
    .filter((file) => file.endsWith('.md'))
    .map((file) => relative(root, file))
    .filter((rel) => !rel.startsWith(`${LEDGER}/`) && rel !== `${LEDGER}.md`);
}

function findNeedle(
  root: string,
  needle: string,
  origin: string,
): { file: string; line: number } | 'ambiguous' | null {
  const originFile = origin.split(':')[0] ?? '';
  const hits: { file: string; line: number }[] = [];
  for (const rel of markdownFiles(root)) {
    const line = locate(readFileSync(join(root, rel), 'utf8'), needle);
    if (line) hits.push({ file: rel, line });
  }
  const preferred = hits.filter((hit) => hit.file === originFile);
  if (preferred.length === 1) return preferred[0] ?? null;
  if (hits.length === 1) return hits[0] ?? null;
  if (hits.length === 0) return null;
  return 'ambiguous';
}

export function fillLedgers(root: string): string[] {
  const notes: string[] = [];
  const dir = join(root, LEDGER);
  for (const name of readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file !== 'MAP.md')
    .sort()) {
    const path = join(dir, name);
    const text = readFileSync(path, 'utf8');
    const fence = /```ledger\n([\s\S]*?)```/.exec(text);
    if (!fence?.[1]) continue;
    const rows: string[] = [];
    for (const raw of fence[1].split('\n')) {
      if (!raw.trim()) continue;
      const parts = raw.split('\t');
      if (parts.length === 3) {
        const [id, origin, source] = parts;
        if (!id || !origin || source === undefined) continue;
        const hit = findNeedle(root, source, origin);
        if (hit === 'ambiguous') {
          notes.push(`${id} ambiguous`);
          rows.push([id, 'unmapped', '-', source, '', source, origin].join('\t'));
        } else if (!hit) {
          notes.push(`${id} unmapped`);
          rows.push([id, 'unmapped', '-', source, '', source, origin].join('\t'));
        } else {
          rows.push([id, 'kept', `${hit.file}:${hit.line}`, source, '', source, origin].join('\t'));
        }
        continue;
      }
      if (parts.length !== 7) {
        notes.push(`${name} bad row ${raw.slice(0, 24)}`);
        rows.push(raw);
        continue;
      }
      const [id, status, , needle, reason, source, origin] = parts;
      if (
        !id ||
        !status ||
        needle === undefined ||
        reason === undefined ||
        source === undefined ||
        origin === undefined
      )
        continue;
      if (status === 'dropped' || status === 'unmapped') {
        rows.push(parts.join('\t'));
        continue;
      }
      const look = status === 'merged' ? needle : source;
      const hit = findNeedle(root, look, origin);
      if (hit && hit !== 'ambiguous') {
        parts[2] = `${hit.file}:${hit.line}`;
        if (status === 'kept') parts[3] = source;
        rows.push(parts.join('\t'));
      } else {
        notes.push(`${id} ${hit === 'ambiguous' ? 'ambiguous' : 'unmapped'}`);
        parts[1] = status === 'merged' ? 'merged' : 'unmapped';
        rows.push(parts.join('\t'));
      }
    }
    const next = text.replace(/```ledger\n[\s\S]*?```/, `\`\`\`ledger\n${rows.join('\n')}\n\`\`\``);
    writeFileSync(path, next);
  }
  return notes;
}
