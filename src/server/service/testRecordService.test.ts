import { TestRecordService } from "@/server/service/testRecordService";
import { TestCaseStore } from "@/server/store/testCaseStore";
import { buildTestCase } from "@/testUtil/report/testCase";
import { TestCase } from "@/type/testCase";

describe("TestRecordService", () => {
  describe("recordFinished", () => {
    it("should add testCase to store", async () => {
      const testCaseStore = new TestCaseStore();
      const service = new TestRecordService(testCaseStore);

      const tests = new Map<string, TestCase[]>([
        ["test", [buildTestCase({ name: "dummy-test" })]],
      ]);
      await service.recordFinished(tests);

      expect(testCaseStore.capturedTestCases).toEqual(tests);
    });
  });
});
