import type { CommentHit } from './comments-hit.ts';

export function jsComments(text: string): CommentHit[] {
  const comments: CommentHit[] = [];
  scan(text, 0, comments, false);
  return comments;
}

function scan(text: string, start: number, comments: CommentHit[], stopBrace: boolean): number {
  let i = start;
  while (i < text.length) {
    const c = text[i] ?? '';
    const d = text[i + 1] ?? '';
    if (i === 0 && text.startsWith('#!')) {
      while (i < text.length && text[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && d === '/') {
      const from = i;
      i += 2;
      let body = '';
      while (i < text.length && text[i] !== '\n') {
        body += text[i];
        i += 1;
      }
      comments.push({ line: lineAt(text, from), start: from, end: i, text: body });
      continue;
    }
    if (c === '/' && d === '*') {
      const from = i;
      i += 2;
      let body = '';
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        body += text[i];
        i += 1;
      }
      if (i < text.length) i += 2;
      comments.push({ line: lineAt(text, from), start: from, end: i, text: body });
      continue;
    }
    if (c === "'" || c === '"') {
      i = skipQuoted(text, i, c);
      continue;
    }
    if (c === '`') {
      i = skipTemplate(text, i, comments);
      continue;
    }
    if (c === '/' && regexStart(text, i)) {
      i = skipRegex(text, i);
      continue;
    }
    if (stopBrace && c === '}') return i + 1;
    i += 1;
  }
  return i;
}

function skipQuoted(text: string, i: number, quote: string): number {
  i += 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === quote || text[i] === '\n') return text[i] === quote ? i + 1 : i;
    i += 1;
  }
  return i;
}

function skipTemplate(text: string, i: number, comments: CommentHit[]): number {
  i += 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === '`') return i + 1;
    if (text[i] === '$' && text[i + 1] === '{') {
      i = scan(text, i + 2, comments, true);
      continue;
    }
    i += 1;
  }
  return i;
}

function regexStart(text: string, i: number): boolean {
  let j = i - 1;
  while (j >= 0 && /\s/.test(text[j] ?? '')) j -= 1;
  if (j < 0) return true;
  const prev = text[j] ?? '';
  if ('([{:;,=!?&|~^'.includes(prev)) return true;
  return /(?:return|typeof|case|void|delete|await|yield|throw|in|of|instanceof)$/.test(
    text.slice(Math.max(0, j - 12), j + 1),
  );
}

function skipRegex(text: string, i: number): number {
  i += 1;
  let klass = false;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (text[i] === '[') klass = true;
    else if (text[i] === ']') klass = false;
    else if (text[i] === '/' && !klass) {
      i += 1;
      while (i < text.length && /[a-z]/i.test(text[i] ?? '')) i += 1;
      return i;
    } else if (text[i] === '\n') return i;
    i += 1;
  }
  return i;
}

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text[i] === '\n') line += 1;
  return line;
}
