import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set([
  'node_modules',
  'dist',
  'playwright-report',
  'test-results',
  'coverage',
  '.git',
]);

export function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (stat.isFile()) out.push(path);
  }
  return out;
}
