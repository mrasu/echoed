import { LocalFile } from "@/fs/localFile";
import { Act } from "@/scenario/compile/common/act";
import { ActRunner } from "@/scenario/compile/common/actRunner";
import { Arrange } from "@/scenario/compile/common/arrange";
import { ArrangeRunner } from "@/scenario/compile/common/arrangeRunner";
import { Assert } from "@/scenario/compile/common/assert";
import { Asserter } from "@/scenario/compile/common/asserter";
import { RawString } from "@/scenario/compile/common/rawString";
import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Hook } from "@/scenario/compile/jest/hook";
import { Scenario } from "@/scenario/compile/jest/scenario";
import { ScenarioBook } from "@/scenario/compile/jest/scenarioBook";
import { ScenarioBookParser } from "@/scenario/compile/jest/scenarioBookParser";
import { Step } from "@/scenario/compile/jest/step";
import {
  buildAsserterConfig,
  buildConfig,
  buildRunnerConfig,
} from "@/testUtil/scenario/util";
import yaml from "js-yaml";
import path from "path";

describe("ScenarioBookParser", () => {
  describe("parse", () => {
    it("should return ScenarioBook", async () => {
      const config = buildConfig({
        runners: [buildRunnerConfig({ name: "fetch" })],
        asserters: [buildAsserterConfig({ name: "assertStatus" })],
      });
      const parser = new ScenarioBookParser(config);
      const yamlText = await new LocalFile(
        path.join(__dirname, "testdata/scenario.yml"),
      ).read();

      const scenarioBook = parser.parse(yaml.load(yamlText.toString()));

      expect(scenarioBook).toStrictEqual(
        new ScenarioBook(
          [
            new Scenario(
              "Simple test should pass",
              new Map([["session", TsVariable.parse("${defaultSession()}")]]),
              false,
              [
                new Step(
                  "Get cart",
                  new Map(),
                  [
                    new Arrange(
                      undefined,
                      new ArrangeRunner(
                        new RunnerContainer(
                          "fetch",
                          TsVariable.parse({
                            endpoint: "arrange",
                          }),
                          new RunnerOption(new Map()),
                        ),
                        new Map(),
                      ),
                      undefined,
                    ),
                  ],
                  new Act(
                    new ActRunner(
                      new RunnerContainer(
                        "fetch",
                        TsVariable.parse({
                          endpoint:
                            "/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}",
                        }),
                        new RunnerOption(new Map()),
                      ),
                    ),
                  ),
                  [
                    new Assert(
                      undefined,
                      new Asserter(
                        "assertStatus",
                        TsVariable.parse("${_.response}"),
                        TsVariable.parse(200),
                      ),
                    ),
                    new Assert(
                      new RawString("expect(_.jsonBody.items.length).toBe(0)"),
                      undefined,
                    ),
                  ],
                  new Map(),
                ),
              ],
            ),
          ],
          [],
          new Map(),
          new Hook(),
          undefined,
        ),
      );
    });

    describe("when yaml is invalid", () => {
      it("should throw InvalidScenarioError", async () => {
        const config = buildConfig({});
        const parser = new ScenarioBookParser(config);

        const yamlText = await new LocalFile(
          path.join(__dirname, "testdata/invalidScenario.yml"),
        ).read();
        const result = parser.parse(yaml.load(yamlText));
        expect(result).toMatchObject({ success: false });
      });
    });
  });
});
