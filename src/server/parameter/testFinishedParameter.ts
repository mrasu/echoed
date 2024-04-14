import { TestCase } from "@/type/testCase";
import { z } from "zod";

export const TestFinishedEventRequestParam = z.array(
  z.strictObject({
    file: z.string(),
    testCases: z.array(
      z.strictObject({
        testId: z.string(),
        file: z.string(),
        name: z.string(),
        startTimeMillis: z.number(),
        status: z.string(),
        duration: z.number(),
        testEndTimeMillis: z.number(),
        failureDetails: z.array(z.string()).optional(),
        failureMessages: z.array(z.string()).optional(),
      }),
    ),
  }),
);

export type TestFinishedEventRequestParam = z.infer<
  typeof TestFinishedEventRequestParam
>;

export function restoreTestCases(
  testCases: TestFinishedEventRequestParam[number]["testCases"],
): TestCase[] {
  return testCases.map((testCase) => {
    return new TestCase(
      testCase.testId,
      testCase.file,
      testCase.name,
      testCase.startTimeMillis,
      testCase.status,
      testCase.duration,
      testCase.testEndTimeMillis,
      testCase.failureDetails,
      testCase.failureMessages,
    );
  });
}
