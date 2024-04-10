import { TestCase } from "@/testCase";
import { Mutex } from "async-mutex";

export class TestCaseStore {
  capturedTestCases: Map<string, TestCase[]> = new Map();

  private mutex = new Mutex();

  constructor() {}

  async add(tests: Map<string, TestCase[]>): Promise<void> {
    for (const [file, testcases] of tests) {
      await this.addTest(file, testcases);
    }
  }

  private async addTest(file: string, testcases: TestCase[]): Promise<void> {
    await this.mutex.runExclusive(() => {
      const existingTestCases = this.capturedTestCases.get(file) ?? [];
      existingTestCases.push(...testcases);
      this.capturedTestCases.set(file, existingTestCases);
    });
  }
}
