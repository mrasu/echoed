import { LocalFile } from "@/fs/localFile";
import { Act } from "@/scenario/compile/act";
import { Assert } from "@/scenario/compile/assert";
import { Asserter } from "@/scenario/compile/asserter";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { RawString } from "@/scenario/compile/rawString";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { Scenario } from "@/scenario/compile/scenario";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { ScenarioYamlLoader } from "@/scenario/compile/scenarioYamlLoader";
import { Step } from "@/scenario/compile/step";
import { TsVariable } from "@/scenario/compile/tsVariable";
import {
  buildAsserterConfig,
  buildConfig,
  buildRunnerConfig,
} from "@/testUtil/scenario/util";
import path from "path";

describe("ScenarioYamlLoader", () => {
  describe("load", () => {
    it("should return ScenarioBook", async () => {
      const config = buildConfig({
        runners: [buildRunnerConfig({ name: "fetch" })],
        asserters: [buildAsserterConfig({ name: "assertStatus" })],
      });
      const loader = new ScenarioYamlLoader();
      const scenarioBook = await loader.load(
        config,
        new LocalFile(path.join(__dirname, "testdata/scenario.yml")),
      );

      expect(scenarioBook).toEqual(
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
                  new Act(
                    "fetch",
                    TsVariable.parse({
                      endpoint:
                        "/cart?sessionId=${session.userId}&currencyCode=${session.currencyCode}",
                    }),
                    new RunnerOption(new Map()),
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
          undefined,
        ),
      );
    });

    describe("when yaml is invalid", () => {
      it("should throw InvalidScenarioError", async () => {
        const config = buildConfig({});
        const loader = new ScenarioYamlLoader();

        await expect(async () => {
          await loader.load(
            config,
            new LocalFile(path.join(__dirname, "testdata/invalidScenario.yml")),
          );
        }).rejects.toThrow(InvalidScenarioError);
      });
    });
  });
});
