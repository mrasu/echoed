import { TestCaseStore } from "@/server/store/testCaseStore";
import { buildTestCase } from "@/testUtil/report/testCase";
import { TestCase } from "@/type/testCase";

describe("TestCaseStore", () => {
  describe("add", () => {
    describe("when no testCases exists", () => {
      it("should add testCases", async () => {
        const store = new TestCaseStore();
        const testCase = buildTestCase();
        const testCases = new Map<string, TestCase[]>([["file", [testCase]]]);
        await store.add(testCases);

        expect(store.capturedTestCases).toEqual(
          new Map([["file", [testCase]]]),
        );
      });
    });

    describe("when the same file's testCases exists", () => {
      it("should add testCases", async () => {
        const store = new TestCaseStore();
        const testCase1 = buildTestCase({ name: "test1" });
        const testCase2 = buildTestCase({ name: "test2" });
        const testCases1 = new Map<string, TestCase[]>([["file", [testCase1]]]);
        const testCases2 = new Map<string, TestCase[]>([["file", [testCase2]]]);
        await store.add(testCases1);
        await store.add(testCases2);

        expect(store.capturedTestCases).toEqual(
          new Map([["file", [testCase1, testCase2]]]),
        );
      });
    });

    describe("when adding multiple file TestCases", () => {
      it("should add all", async () => {
        const store = new TestCaseStore();
        const testCase1 = buildTestCase({ name: "test1" });
        const testCase2 = buildTestCase({ name: "test2" });
        const testCase3 = buildTestCase({ name: "test3" });
        const testCases = new Map<string, TestCase[]>([
          ["file1", [testCase1]],
          ["file2", [testCase2, testCase3]],
        ]);
        await store.add(testCases);

        expect(store.capturedTestCases).toEqual(
          new Map([
            ["file1", [testCase1]],
            ["file2", [testCase2, testCase3]],
          ]),
        );
      });
    });
  });
});
