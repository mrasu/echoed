import { TestCaseStartInfo } from "@/integration/jest/reporter/testCase";
import { TestFinishedEventRequestParam } from "@/server/parameter/testFinishedParameter";
import { requestStateEvent, requestTestFinishedEvent } from "@/server/request";
import { FetchRequester } from "@/server/requester/fetchRequester";
import { TestCase } from "@/testCase";
import { toOnlyCharacters } from "@/util/string";
import { TwoKeyValuesMap } from "@/util/twoKeyValuesMap";
import { Test } from "mocha";

export class Reporter {
  currentTestStartInfos = new TwoKeyValuesMap<
    string,
    string,
    TestCaseStartInfo
  >();

  collectedTestCaseElements: Map<string, TestCase[]> = new Map();

  knownTestCount: number = 0;

  constructor(
    private serverPort: number,
    private runName: string,
  ) {}

  onRunBegin(): void {
    void requestStateEvent(
      new FetchRequester(),
      this.serverPort,
      this.runName,
      "start",
    );
  }

  onTestBegin(test: Test): void {
    const filename = this.getFile(test);
    const fullTitle = test.fullTitle();
    const startInfo = new TestCaseStartInfo(
      `${toOnlyCharacters(filename)}_${this.knownTestCount}`,
      filename,
      fullTitle,
      Date.now(),
    );
    this.knownTestCount++;

    this.setCurrentTestStartInfo(test, startInfo);
  }

  onTestEnd(test: Test): void {
    const testStartInfo = this.getCurrentTestStartInfo(test);
    if (!testStartInfo) return;
    this.deleteCurrentTestStartInfo(test);

    const testCase = this.buildTestCase(testStartInfo, test);

    const collected = this.collectedTestCaseElements.get(testCase.file) || [];
    collected.push(testCase);
    this.collectedTestCaseElements.set(testCase.file, collected);
  }

  private buildTestCase(
    testStartInfo: TestCaseStartInfo,
    test: Test,
  ): TestCase {
    const failureDetails: string[] = [];
    const failureMessages: string[] = [];
    if (test.err) {
      failureDetails.push(JSON.stringify(test.err));
      failureMessages.push(test.err.message);
    }

    const testCase = testStartInfo.toTestCaseElement(
      test.state ?? "unknown",
      test.duration ?? 0,
      Date.now(),
      failureDetails,
      failureMessages,
    );

    return testCase;
  }

  onRunEnd(): void {
    void this.sendRunDataToServer(
      this.serverPort,
      this.runName,
      this.collectedTestCaseElements,
    );
  }

  private async sendRunDataToServer(
    serverPort: number,
    runName: string,
    testCasesMap: Map<string, TestCase[]>,
  ): Promise<void> {
    const requester = new FetchRequester();

    const param: TestFinishedEventRequestParam = [];
    for (const [file, testCases] of testCasesMap) {
      param.push({
        file: file,
        testCases: testCases,
      });
    }
    await requestTestFinishedEvent(requester, serverPort, param);

    await requestStateEvent(requester, serverPort, runName, "end");
  }

  private setCurrentTestStartInfo(
    test: Test,
    testStartInfo: TestCaseStartInfo,
  ): void {
    const { filename, fullTitle } = this.toCurrentTestStartInfoKey(test);

    this.currentTestStartInfos.set(filename, fullTitle, testStartInfo);
  }

  private getCurrentTestStartInfo(test: Test): TestCaseStartInfo | undefined {
    const { filename, fullTitle } = this.toCurrentTestStartInfoKey(test);

    return this.currentTestStartInfos.get(filename, fullTitle);
  }

  private deleteCurrentTestStartInfo(test: Test): void {
    const { filename, fullTitle } = this.toCurrentTestStartInfoKey(test);

    return this.currentTestStartInfos.delete(filename, fullTitle);
  }

  private toCurrentTestStartInfoKey(test: Test): {
    filename: string;
    fullTitle: string;
  } {
    const filename = this.getFile(test);
    const fullTitle = test.fullTitle();

    return { filename, fullTitle };
  }

  private getFile(test: Test): string {
    if (test.file) return test.file;

    let current = test.parent;
    while (current) {
      if (current.file) {
        return current.file;
      }
      current = current.parent;
    }
    return "unknown";
  }
}
