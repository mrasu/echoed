import { Act } from "@/scenario/compile/act";
import { ActRunner } from "@/scenario/compile/actRunner";
import { Arrange } from "@/scenario/compile/arrange";
import { ArrangeRunner } from "@/scenario/compile/arrangeRunner";
import { Assert } from "@/scenario/compile/assert";
import { Asserter } from "@/scenario/compile/asserter";
import { AsserterConfig } from "@/scenario/compile/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";
import {
  DEFAULT_ASSERTERS,
  DEFAULT_RUNNERS,
  PluginConfig,
} from "@/scenario/compile/pluginConfig";
import { RawString } from "@/scenario/compile/rawString";
import { RunnerConfig } from "@/scenario/compile/runnerConfig";
import { RunnerContainer } from "@/scenario/compile/runnerContainer";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { Scenario } from "@/scenario/compile/scenario";
import { Step } from "@/scenario/compile/step";
import { TsVariable } from "@/scenario/compile/tsVariable";
import {
  buildAsserterConfig,
  buildRunnerConfig,
  buildScenarioBook,
  buildStep,
} from "@/testUtil/scenario/util";

describe("PluginConfig", () => {
  describe("parse", () => {
    const minimumConfig = {
      runners: [],
      asserters: [],
      commons: [],
    };

    describe("no plugin is set", () => {
      it("should set runner with default", () => {
        const pluginConfig = PluginConfig.parse(minimumConfig);

        expect(pluginConfig.runners).toEqual(DEFAULT_RUNNERS);
        expect(pluginConfig.asserters).toEqual(DEFAULT_ASSERTERS);
        expect(pluginConfig.commons).toEqual([]);
      });
    });

    describe("when runner is set", () => {
      it("should set runner with default", () => {
        const pluginConfig = PluginConfig.parse({
          ...minimumConfig,
          runners: [
            {
              name: "runner",
              module: "echoed/dummy/runner",
            },
          ],
        });

        expect(pluginConfig.runners).toEqual([
          ...DEFAULT_RUNNERS,
          new RunnerConfig(
            "runner",
            "echoed/dummy/runner",
            new RunnerOption(new Map()),
          ),
        ]);
      });

      describe("when name is the same with default", () => {
        it("should override default runner", () => {
          const pluginConfig = PluginConfig.parse({
            ...minimumConfig,
            runners: [
              {
                name: DEFAULT_RUNNERS[0].name,
                module: "echoed/dummy/runner",
              },
            ],
          });

          expect(pluginConfig.runners).toEqual([
            new RunnerConfig(
              DEFAULT_RUNNERS[0].name,
              "echoed/dummy/runner",
              new RunnerOption(new Map()),
            ),
            ...DEFAULT_RUNNERS.slice(1, DEFAULT_RUNNERS.length),
          ]);
        });
      });
    });

    describe("when asserter is set", () => {
      it("should set asserter with default", () => {
        const pluginConfig = PluginConfig.parse({
          ...minimumConfig,
          asserters: [
            {
              name: "asserter",
              module: "echoed/dummy/asserter",
            },
          ],
        });

        expect(pluginConfig.asserters).toEqual([
          ...DEFAULT_ASSERTERS,
          new AsserterConfig("asserter", "echoed/dummy/asserter", new Map()),
        ]);
      });

      describe("when name is the same with default", () => {
        it("should override default asserter", () => {
          const pluginConfig = PluginConfig.parse({
            ...minimumConfig,
            asserters: [
              {
                name: DEFAULT_ASSERTERS[0].name,
                module: "echoed/dummy/asserter",
              },
            ],
          });

          expect(pluginConfig.asserters).toEqual([
            ...DEFAULT_ASSERTERS.slice(1, DEFAULT_RUNNERS.length),
            new AsserterConfig(
              DEFAULT_ASSERTERS[0].name,
              "echoed/dummy/asserter",
              new Map(),
            ),
          ]);
        });
      });
    });

    describe("when commons is set", () => {
      it("should set commons", () => {
        const pluginConfig = PluginConfig.parse({
          ...minimumConfig,
          commons: [
            {
              module: "echoed/dummy/import",
              names: ["foo", "bar"],
            },
          ],
        });

        expect(pluginConfig.commons).toEqual([
          new CommonPluginConfig(
            ["foo", "bar"],
            undefined,
            "echoed/dummy/import",
          ),
        ]);
      });
    });
  });

  describe("hasRunner", () => {
    const pluginConfig = new PluginConfig(
      [
        new RunnerConfig(
          "dummyRunner",
          "echoed/dummy/runner",
          new RunnerOption(new Map()),
        ),
      ],
      [],
      [],
    );

    describe("when match", () => {
      it("should return true", () => {
        expect(pluginConfig.hasRunner("dummyRunner")).toBe(true);
      });
    });

    describe("when not match", () => {
      it("should return false", () => {
        expect(pluginConfig.hasRunner("unknownRunner")).toBe(false);
      });
    });
  });

  describe("getUsedRunners", () => {
    const usedRunners = [
      buildRunnerConfig({ name: "runner1" }),
      buildRunnerConfig({ name: "runner2" }),
      buildRunnerConfig({ name: "runner3" }),
    ];

    const pluginConfig = new PluginConfig(
      [...usedRunners, buildRunnerConfig({ name: "dummyRunner" })],
      [],
      [],
    );

    const createStep = (runnerName: string): Step => {
      return buildStep({
        act: new Act(
          new ActRunner(
            new RunnerContainer(
              runnerName,
              new TsVariable(null),
              new RunnerOption(new Map()),
            ),
          ),
        ),
      });
    };

    describe("when scenario invokes runners", () => {
      const scenarioBook = buildScenarioBook({
        scenarios: [
          new Scenario("scenario1", new Map(), false, [
            createStep(usedRunners[0].name),
            createStep(usedRunners[1].name),
          ]),
          new Scenario("scenario2", new Map(), false, [
            createStep(usedRunners[2].name),
          ]),
        ],
      });

      it("should return used runners", () => {
        expect(pluginConfig.getUsedRunners(scenarioBook)).toEqual(usedRunners);
      });
    });

    describe("when scenario invokes runners in arrange", () => {
      const createArrangeStep = (runnerName: string): Step => {
        return buildStep({
          arranges: [
            new Arrange(
              undefined,
              new ArrangeRunner(
                new RunnerContainer(
                  runnerName,
                  new TsVariable(null),
                  new RunnerOption(new Map()),
                ),
                new Map(),
              ),
            ),
          ],
        });
      };

      const scenarioBook = buildScenarioBook({
        scenarios: [
          new Scenario("scenario1", new Map(), false, [
            createArrangeStep(usedRunners[0].name),
            createArrangeStep(usedRunners[1].name),
          ]),
          new Scenario("scenario2", new Map(), false, [
            createArrangeStep(usedRunners[2].name),
          ]),
        ],
      });

      it("should return used runners", () => {
        expect(pluginConfig.getUsedRunners(scenarioBook)).toEqual(usedRunners);
      });
    });

    describe("when scenario doesn't invoke runners", () => {
      const scenarioBook = buildScenarioBook({
        scenarios: [new Scenario("scenario1", new Map(), false, [])],
      });

      it("should return no runners", () => {
        expect(pluginConfig.getUsedRunners(scenarioBook)).toEqual([]);
      });
    });
  });

  describe("hasAsserter", () => {
    const pluginConfig = new PluginConfig(
      [],
      [new AsserterConfig("dummyAsserter", "echoed/dummy/asserter", new Map())],
      [],
    );

    describe("when match", () => {
      it("should return true", () => {
        expect(pluginConfig.hasAsserter("dummyAsserter")).toBe(true);
      });
    });

    describe("when not match", () => {
      it("should return false", () => {
        expect(pluginConfig.hasAsserter("unknownAsserter")).toBe(false);
      });
    });
  });

  describe("getUsedAsserters", () => {
    const usedAsserters = [
      buildAsserterConfig({ name: "asserter1" }),
      buildAsserterConfig({ name: "asserter2" }),
      buildAsserterConfig({ name: "asserter3" }),
    ];

    const pluginConfig = new PluginConfig(
      [],
      [...usedAsserters, buildAsserterConfig({ name: "dummyAsserter" })],
      [],
    );

    const createAsserterStep = (asserterName: string): Step => {
      return buildStep({
        asserts: [
          new Assert(
            undefined,
            new Asserter(asserterName, new TsVariable(1), new TsVariable(2)),
          ),
        ],
      });
    };

    const createRawStep = (assertText: string): Step => {
      return buildStep({
        asserts: [new Assert(new RawString(assertText), undefined)],
      });
    };

    describe("when scenario invokes asserters", () => {
      const scenarioBook = buildScenarioBook({
        scenarios: [
          new Scenario("scenario1", new Map(), false, [
            createAsserterStep(usedAsserters[0].name),
            createAsserterStep(usedAsserters[1].name),
          ]),
          new Scenario("scenario2", new Map(), false, [
            createAsserterStep(usedAsserters[2].name),
          ]),
        ],
      });

      it("should return used asseters", () => {
        expect(pluginConfig.getUsedAsserters(scenarioBook)).toEqual(
          usedAsserters,
        );
      });
    });

    describe("when scenario invokes only raw assertions", () => {
      const scenarioBook = buildScenarioBook({
        scenarios: [
          new Scenario("scenario1", new Map(), false, [
            createRawStep(usedAsserters[0].name),
            createRawStep(usedAsserters[1].name),
          ]),
          new Scenario("scenario2", new Map(), false, [
            createRawStep(usedAsserters[2].name),
          ]),
        ],
      });

      it("should return no asserters", () => {
        expect(pluginConfig.getUsedAsserters(scenarioBook)).toEqual([]);
      });
    });

    describe("when scenario invokes no assertions", () => {
      const scenarioBook = buildScenarioBook({
        scenarios: [new Scenario("scenario", new Map(), false, [])],
      });

      it("should return no asserters", () => {
        expect(pluginConfig.getUsedAsserters(scenarioBook)).toEqual([]);
      });
    });
  });
});
