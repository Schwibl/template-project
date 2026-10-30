import type { CommentHit } from './comments-hit.ts';

export function cssComments(text: string): CommentHit[] {
  const comments: CommentHit[] = [];
  let i = 0;
  let quote = '';
  while (i < text.length) {
    const c = text[i] ?? '';
    if (quote) {
      if (c === '\\') i += 2;
      else {
        if (c === quote) quote = '';
        i += 1;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      i += 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
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
    i += 1;
  }
  return comments;
}

export function htmlComments(text: string): CommentHit[] {
  const comments: CommentHit[] = [];
  for (const match of text.matchAll(/<!--([\s\S]*?)-->/g)) {
    const from = match.index ?? 0;
    comments.push({
      line: lineAt(text, from),
      start: from,
      end: from + match[0].length,
      text: match[1] ?? '',
    });
  }
  return comments;
}

export function hashComments(text: string): CommentHit[] {
  const comments: CommentHit[] = [];
  let i = 0;
  let quote = '';
  if (text.startsWith('#!')) {
    while (i < text.length && text[i] !== '\n') i += 1;
  }
  while (i < text.length) {
    const c = text[i] ?? '';
    if (c === '\n') {
      quote = '';
      i += 1;
      continue;
    }
    if (quote) {
      if (c === '\\') i += 2;
      else {
        if (c === quote) quote = '';
        i += 1;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      i += 1;
      continue;
    }
    if (c === '#' && (i === 0 || /\s/.test(text[i - 1] ?? ''))) {
      const from = i;
      i += 1;
      let body = '';
      while (i < text.length && text[i] !== '\n') {
        body += text[i];
        i += 1;
      }
      comments.push({ line: lineAt(text, from), start: from, end: i, text: body });
      continue;
    }
    i += 1;
  }
  return comments;
}

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text[i] === '\n') line += 1;
  return line;
}
