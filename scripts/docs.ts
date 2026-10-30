import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repoRoot } from './root.ts';
import { walk } from './walk.ts';

const DOC_ROOTS = ['docs', '.prompts', 'skills', 'agents'];
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const DOC_CAP = 200;
const CODE_TARGET = 200;
const CODE_FLAG = 300;
const DASH = '—';

export type DocsResult = { errors: string[]; warnings: string[] };

type DirInfo = { files: string[]; dirs: string[] };

export function lineCount(text: string): number {
  if (text === '') return 0;
  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
}

export function mapEntries(text: string): { raw: string; path: string | null }[] {
  const items: string[] = [];
  let buf = '';
  const flush = (): void => {
    if (buf) items.push(buf);
    buf = '';
  };
  for (const line of text.split('\n')) {
    if (line.startsWith('- ')) {
      flush();
      buf = line;
    } else if (buf && /^\s+\S/.test(line)) buf += ` ${line.trim()}`;
    else flush();
  }
  flush();
  const pattern = new RegExp(`^-\\s+\`([^\`]+)\`\\s+${DASH}\\s+(.+?)\\s+${DASH}\\s+(\\S.*)$`);
  return items.map((raw) => ({ raw, path: pattern.exec(raw)?.[1] ?? null }));
}

export function checkDocs(root: string): DocsResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  for (const file of walk(root)) {
    const rel = relative(root, file);
    const text = readFileSync(file, 'utf8');
    const lines = lineCount(text);
    const ext = posix.extname(rel);
    if (CODE_EXT.has(ext)) {
      if (lines > CODE_FLAG) errors.push(`${rel} has ${lines} lines (flag ${CODE_FLAG})`);
      else if (lines > CODE_TARGET)
        warnings.push(`${rel} has ${lines} lines (target ${CODE_TARGET})`);
    }
  }
  for (const rel of docFiles(root)) {
    const lines = lineCount(readFileSync(join(root, rel), 'utf8'));
    if (lines > DOC_CAP) errors.push(`${rel} has ${lines} lines (cap ${DOC_CAP})`);
  }
  for (const rel of docDirs(root)) checkDir(root, rel, errors);
  checkRootMap(root, errors);
  return { errors, warnings };
}

function docFiles(root: string): string[] {
  const files = new Set<string>();
  for (const name of readdirSync(root)) {
    if (name.endsWith('.md')) files.add(name);
  }
  const template = '.github/PULL_REQUEST_TEMPLATE.md';
  if (existsSync(join(root, template))) files.add(template);
  for (const folder of DOC_ROOTS) {
    const abs = join(root, folder);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      if (file.endsWith('.md')) files.add(relative(root, file));
    }
  }
  return [...files];
}

function docDirs(root: string): string[] {
  const dirs: string[] = [];
  const visit = (rel: string): void => {
    dirs.push(rel);
    const abs = join(root, rel);
    if (!existsSync(abs)) return;
    for (const name of readDir(abs).dirs) visit(rel ? `${rel}/${name}` : name);
  };
  for (const folder of DOC_ROOTS) {
    if (existsSync(join(root, folder))) visit(folder);
  }
  return dirs;
}

function checkDir(root: string, rel: string, errors: string[]): void {
  const info = readDir(join(root, rel));
  const entries = info.files.filter((name) => name !== 'MAP.md').length + info.dirs.length;
  const mapPath = join(root, rel, 'MAP.md');
  if (entries > 1 && !info.files.includes('MAP.md')) {
    errors.push(`${rel} needs MAP.md (${entries} entries)`);
    return;
  }
  if (!existsSync(mapPath)) return;
  const required = requiredEntries(root, rel);
  const listed = listedEntries(readFileSync(mapPath, 'utf8'));
  if (listed === null) {
    errors.push(`${rel}/MAP.md has a list line that is not path — answer — when`);
    return;
  }
  reportDiff(`${rel}/MAP.md`, required, listed, errors);
}

function checkRootMap(root: string, errors: string[]): void {
  const mapPath = join(root, 'MAP.md');
  if (!existsSync(mapPath)) {
    errors.push('MAP.md is missing');
    return;
  }
  const required = rootDocFiles(root);
  for (const folder of DOC_ROOTS) {
    if (existsSync(join(root, folder))) required.push(entryPoint(root, folder));
  }
  const listed = listedEntries(readFileSync(mapPath, 'utf8'));
  if (listed === null) {
    errors.push('MAP.md has a list line that is not path — answer — when');
    return;
  }
  reportDiff('MAP.md', required.sort(), listed, errors);
}

function rootDocFiles(root: string): string[] {
  const names = readdirSync(root).filter((name) => name.endsWith('.md') && name !== 'MAP.md');
  if (existsSync(join(root, 'LICENSE'))) names.push('LICENSE');
  const template = '.github/PULL_REQUEST_TEMPLATE.md';
  if (existsSync(join(root, template))) names.push(template);
  return names;
}

function requiredEntries(root: string, rel: string): string[] {
  const info = readDir(join(root, rel));
  const req = info.files.filter((name) => name !== 'MAP.md');
  for (const sub of info.dirs) {
    const point = entryPoint(root, `${rel}/${sub}`);
    req.push(posix.relative(rel, point));
  }
  return req.sort();
}

function entryPoint(root: string, rel: string): string {
  const info = readDir(join(root, rel));
  if (info.files.includes('MAP.md')) return `${rel}/MAP.md`;
  const files = info.files.filter((name) => name !== 'MAP.md');
  if (files.length === 1 && info.dirs.length === 0) return `${rel}/${files[0] ?? ''}`;
  if (files.length === 0 && info.dirs.length === 1)
    return entryPoint(root, `${rel}/${info.dirs[0] ?? ''}`);
  return `${rel}/MAP.md`;
}

function listedEntries(text: string): string[] | null {
  const entries = mapEntries(text);
  if (entries.some((entry) => entry.path === null)) return null;
  return entries.map((entry) => entry.path ?? '').sort();
}

function reportDiff(label: string, required: string[], listed: string[], errors: string[]): void {
  const have = new Set(listed);
  const need = new Set(required);
  for (const path of required) if (!have.has(path)) errors.push(`${label} missing ${path}`);
  for (const path of listed) if (!need.has(path)) errors.push(`${label} dead entry ${path}`);
}

function readDir(abs: string): DirInfo {
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return { files: [], dirs: [] };
  const files: string[] = [];
  const dirs: string[] = [];
  for (const name of readdirSync(abs)) {
    if (name.startsWith('.') && name !== '.github') continue;
    const stat = statSync(join(abs, name));
    if (stat.isDirectory()) dirs.push(name);
    else files.push(name);
  }
  files.sort();
  dirs.sort();
  return { files, dirs };
}

function main(): void {
  const result = checkDocs(repoRoot());
  for (const warning of result.warnings) console.warn(warning);
  for (const error of result.errors) console.error(error);
  if (result.errors.length === 0) console.log('docs: ok');
  process.exitCode = result.errors.length === 0 ? 0 : 1;
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) main();
