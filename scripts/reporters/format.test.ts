import { describe, expect, it } from 'vitest';
import { failureBlock, likelyCause, parseExpected, suiteLine } from './format.ts';

describe('agent report', () => {
  it('prints one pass line with counts and duration', () => {
    expect(suiteLine('src/greet.test.ts', { passed: 2, failed: 0, skipped: 0 }, 12.4)).toBe(
      'PASS src/greet.test.ts 2 passed, 0 failed, 0 skipped, 12ms',
    );
  });

  it('prints a failure with expected, actual, file:line, cause, and rerun', () => {
    const block = failureBlock({
      suite: 'src/greet.test.ts',
      title: 'falls back',
      expected: 'Hello, world!',
      actual: 'Hello, !',
      errorName: 'AssertionError',
      message: 'expected Hello, world! received Hello, !',
      file: 'src/greet.test.ts',
      line: 6,
      rerun: 'npx vitest run src/greet.test.ts -t "falls back"',
    });
    expect(block).toContain('expected: Hello, world!');
    expect(block).toContain('actual: Hello, !');
    expect(block).toContain('src/greet.test.ts:6');
    expect(block).toContain('likely cause: the result did not match the expected value');
    expect(block).toContain('rerun: npx vitest run');
  });

  it('names a timeout and a missing element', () => {
    expect(likelyCause('Test timed out in 5000ms')).toBe('a step exceeded the timeout');
    expect(likelyCause('waiting for getByRole("status")')).toBe(
      'the expected element or text was not on the page',
    );
  });

  it('reads Playwright expected and received lines', () => {
    const parsed = parseExpected('Error: x\nExpected: "Hello, Ada!"\nReceived: "Hello, world!"');
    expect(parsed.expected).toBe('Hello, Ada!');
    expect(parsed.actual).toBe('Hello, world!');
  });
});
