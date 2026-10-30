import { relative } from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { failureBlock, parseExpected, playwrightRerun, suiteLine, type Counts } from './format.ts';

type Row = { test: TestCase; result: TestResult };

function rel(file: string): string {
  return relative(process.cwd(), file).replaceAll('\\', '/');
}

export default class AgentReporter implements Reporter {
  private readonly rows = new Map<string, Row>();

  onTestEnd(test: TestCase, result: TestResult): void {
    this.rows.set(test.id, { test, result });
  }

  onEnd(): void {
    const groups = new Map<string, Row[]>();
    for (const row of this.rows.values()) {
      const project = row.test.parent.project()?.name ?? 'default';
      const file = rel(row.test.location.file);
      const key = `${file} [${project}]`;
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }
    for (const [suite, list] of groups) {
      const counts: Counts = { passed: 0, failed: 0, skipped: 0 };
      let duration = 0;
      for (const row of list) {
        duration += row.result.duration;
        if (row.result.status === 'passed') counts.passed += 1;
        else if (row.result.status === 'skipped') counts.skipped += 1;
        else counts.failed += 1;
      }
      console.log(suiteLine(suite, counts, duration));
      for (const row of list) {
        if (row.result.status === 'passed' || row.result.status === 'skipped') continue;
        const error = row.result.errors[0];
        const message = error?.message ?? row.result.status;
        const parsed = parseExpected(message);
        const project = row.test.parent.project()?.name ?? 'default';
        const file = rel(row.test.location.file);
        const loc = error?.location;
        console.log(
          failureBlock({
            suite,
            title: row.test.title,
            expected: parsed.expected,
            actual: parsed.actual,
            errorName: 'Error',
            message,
            file: loc ? rel(loc.file) : file,
            line: loc?.line ?? row.test.location.line,
            rerun: playwrightRerun(file, row.test.title, project),
          }),
        );
      }
    }
  }
}
