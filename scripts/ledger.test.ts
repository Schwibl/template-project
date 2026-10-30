import { describe, expect, it } from 'vitest';
import { checkRules, locate, type Rule } from './ledger.ts';

function rule(over: Partial<Rule>): Rule {
  return {
    id: 'R001',
    status: 'kept',
    target: 'AGENTS.md:1',
    needle: '# Agent pointers',
    reason: '',
    source: '# Agent pointers',
    origin: 'AGENTS.md:1',
    ...over,
  };
}

describe('split ledger', () => {
  it('finds a wrapped needle on its first line', () => {
    expect(locate('# Agent\npointers\n', '# Agent pointers')).toBe(1);
    expect(locate('nope\n', '# Agent pointers')).toBeNull();
  });

  it('accepts a kept rule and rejects a missing needle, a gap, and a bare drop', () => {
    const files = new Map([['AGENTS.md', '# Agent pointers\n']]);
    const read = (rel: string): string | null => files.get(rel) ?? null;
    expect(checkRules([rule({})], read)).toEqual([]);
    expect(checkRules([rule({ needle: 'gone' })], read)[0]).toContain('needle missing');
    expect(checkRules([rule({ id: 'R002' })], read)[0]).toContain('id gap');
    expect(checkRules([rule({ status: 'dropped', target: '-', reason: '' })], read)[0]).toContain(
      'dropped without reason',
    );
  });
});
