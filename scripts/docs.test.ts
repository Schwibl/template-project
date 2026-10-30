import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkDocs, lineCount, mapEntries } from './docs.ts';

const dirs: string[] = [];

function temp(): string {
  const dir = mkdtempSync(join(tmpdir(), 'docs-'));
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function write(dir: string, rel: string, text: string): void {
  const path = join(dir, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, text);
}

describe('doc checks', () => {
  it('parses a map line and counts lines', () => {
    expect(mapEntries('- `a.md` — what — when\n')).toEqual([
      { raw: '- `a.md` — what — when', path: 'a.md' },
    ]);
    expect(lineCount('a\nb\n')).toBe(2);
  });

  it('requires a map when a folder has two files, and rejects a dead entry', () => {
    const dir = temp();
    write(dir, 'README.md', '# Hi\n');
    write(dir, 'LICENSE', 'MIT\n');
    write(dir, '.github/PULL_REQUEST_TEMPLATE.md', '# PR\n');
    write(dir, 'docs/a.md', '# A\n');
    write(dir, 'docs/b.md', '# B\n');
    write(dir, 'docs/MAP.md', '- `a.md` — a — now\n- `missing.md` — no — never\n');
    write(
      dir,
      'MAP.md',
      '- `README.md` — readme — start\n- `LICENSE` — license — copy\n- `.github/PULL_REQUEST_TEMPLATE.md` — pr — open\n- `docs/MAP.md` — docs — lookup\n',
    );
    const result = checkDocs(dir);
    expect(result.errors.some((error) => error.includes('dead entry missing.md'))).toBe(true);
    expect(result.errors.some((error) => error.includes('missing b.md'))).toBe(true);
  });

  it('caps markdown at 200 and flags code over 300', () => {
    const dir = temp();
    write(dir, 'README.md', '# Hi\n');
    write(dir, 'LICENSE', 'MIT\n');
    write(dir, '.github/PULL_REQUEST_TEMPLATE.md', '# PR\n');
    write(dir, 'docs/only.md', '# Only\n');
    write(
      dir,
      'MAP.md',
      '- `README.md` — r — s\n- `LICENSE` — l — c\n- `.github/PULL_REQUEST_TEMPLATE.md` — p — o\n- `docs/only.md` — o — n\n',
    );
    write(dir, 'docs/long.md', `${'line\n'.repeat(201)}`);
    write(dir, 'src/wide.ts', `${'export const n = 1;\n'.repeat(301)}`);
    const result = checkDocs(dir);
    expect(result.errors.some((error) => error.includes('docs/long.md'))).toBe(true);
    expect(result.errors.some((error) => error.includes('src/wide.ts'))).toBe(true);
  });
});
