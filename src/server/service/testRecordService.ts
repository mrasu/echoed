import { TestCaseStore } from "@/server/store/testCaseStore";
import { TestCase } from "@/type/testCase";

export class TestRecordService {
  constructor(private testCaseStore: TestCaseStore) {}

  async recordFinished(tests: Map<string, TestCase[]>): Promise<void> {
    await this.testCaseStore.add(tests);
  }
}
