import { relative } from 'node:path';
import type { Reporter, SerializedError, TestModule } from 'vitest/node';
import { failureBlock, parseExpected, suiteLine, vitestRerun, type Counts } from './format.ts';

function rel(file: string): string {
  return relative(process.cwd(), file).replaceAll('\\', '/');
}

export default class AgentReporter implements Reporter {
  onTestRunEnd(
    modules: ReadonlyArray<TestModule>,
    unhandled: ReadonlyArray<SerializedError> = [],
  ): void {
    for (const mod of modules) {
      const file = rel(mod.moduleId);
      const counts: Counts = { passed: 0, failed: 0, skipped: 0 };
      const tests = [...mod.children.allTests()];
      for (const test of tests) {
        const state = test.result().state;
        if (state === 'passed') counts.passed += 1;
        else if (state === 'failed') counts.failed += 1;
        else counts.skipped += 1;
      }
      const collection = mod.errors();
      counts.failed += collection.length;
      console.log(suiteLine(file, counts, mod.diagnostic().duration));
      for (const test of tests) {
        const result = test.result();
        if (result.state !== 'failed') continue;
        const error = result.errors[0];
        if (!error) continue;
        const parsed = parseExpected(error.message);
        const stack = error.stacks?.find((frame) => !frame.file.includes('node_modules'));
        console.log(
          failureBlock({
            suite: file,
            title: test.fullName,
            expected: error.expected || parsed.expected,
            actual: error.actual || parsed.actual,
            errorName: error.name ?? 'Error',
            message: error.message,
            file: stack ? rel(stack.file) : file,
            line: stack?.line ?? 1,
            rerun: vitestRerun(file, test.name),
          }),
        );
      }
      for (const error of collection) {
        console.log(
          failureBlock({
            suite: file,
            title: '(collection)',
            expected: 'unknown',
            actual: 'unknown',
            errorName: error.name ?? 'Error',
            message: error.message,
            file,
            line: 1,
            rerun: `npx vitest run ${file}`,
          }),
        );
      }
    }
    for (const error of unhandled) {
      console.log(
        failureBlock({
          suite: '(vitest)',
          title: 'unhandled',
          expected: 'unknown',
          actual: 'unknown',
          errorName: error.name ?? 'Error',
          message: error.message,
          file: 'unknown',
          line: 1,
          rerun: 'npm test',
        }),
      );
    }
  }
}
