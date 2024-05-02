import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { PluginConfig } from "@/scenario/compile/common/pluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import {
  buildAsserters,
  buildCommonPlugins,
  buildRunners,
} from "@/testUtil/scenario/plugin";
import { buildPluginLister } from "@/testUtil/scenario/pluginLister";
import {
  buildAsserterConfig,
  buildRunnerConfig,
} from "@/testUtil/scenario/util";

const DEFAULT_RUNNERS = buildRunners();
const DEFAULT_ASSERTERS = buildAsserters();
const DEFAULT_COMMON_PLUGINS = buildCommonPlugins();

describe("PluginConfig", () => {
  describe("parse", () => {
    const minimumConfig = {
      runners: [],
      asserters: [],
      commons: [],
    };

    describe("no plugin is set", () => {
      it("should set runner with default", () => {
        const pluginConfig = PluginConfig.parse(
          minimumConfig,
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(pluginConfig.runners).toEqual(DEFAULT_RUNNERS);
        expect(pluginConfig.asserters).toEqual(DEFAULT_ASSERTERS);
        expect(pluginConfig.commons).toEqual([]);
      });
    });

    describe("when runner is set", () => {
      it("should set runner with default", () => {
        const pluginConfig = PluginConfig.parse(
          {
            ...minimumConfig,
            runners: [
              {
                name: "runner",
                module: "echoed/dummy/runner",
              },
            ],
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

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
          const pluginConfig = PluginConfig.parse(
            {
              ...minimumConfig,
              runners: [
                {
                  name: DEFAULT_RUNNERS[0].name,
                  module: "echoed/dummy/runner",
                },
              ],
            },
            DEFAULT_RUNNERS,
            DEFAULT_ASSERTERS,
            DEFAULT_COMMON_PLUGINS,
          );

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
        const pluginConfig = PluginConfig.parse(
          {
            ...minimumConfig,
            asserters: [
              {
                name: "asserter",
                module: "echoed/dummy/asserter",
              },
            ],
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(pluginConfig.asserters).toEqual([
          ...DEFAULT_ASSERTERS,
          new AsserterConfig("asserter", "echoed/dummy/asserter", new Map()),
        ]);
      });

      describe("when name is the same with default", () => {
        it("should override default asserter", () => {
          const pluginConfig = PluginConfig.parse(
            {
              ...minimumConfig,
              asserters: [
                {
                  name: DEFAULT_ASSERTERS[0].name,
                  module: "echoed/dummy/asserter",
                },
              ],
            },
            DEFAULT_RUNNERS,
            DEFAULT_ASSERTERS,
            DEFAULT_COMMON_PLUGINS,
          );

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
        const pluginConfig = PluginConfig.parse(
          {
            ...minimumConfig,
            commons: [
              {
                module: "echoed/dummy/import",
                names: ["foo", "bar"],
              },
            ],
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

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

    describe("when scenario invokes runners", () => {
      const pluginLister = buildPluginLister({ runnerConfigs: usedRunners });

      it("should return used runners", () => {
        expect(pluginConfig.getUsedRunners(pluginLister)).toEqual(usedRunners);
      });
    });

    describe("when scenario doesn't invoke runners", () => {
      const pluginLister = buildPluginLister();

      it("should return no runners", () => {
        expect(pluginConfig.getUsedRunners(pluginLister)).toEqual([]);
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

    describe("when scenario invokes asserters", () => {
      const pluginLister = buildPluginLister({
        asserterConfigs: usedAsserters,
      });

      it("should return used asseters", () => {
        expect(pluginConfig.getUsedAsserters(pluginLister)).toEqual(
          usedAsserters,
        );
      });
    });

    describe("when scenario invokes no assertions", () => {
      const pluginLister = buildPluginLister({});

      it("should return no asserters", () => {
        expect(pluginConfig.getUsedAsserters(pluginLister)).toEqual([]);
      });
    });
  });
});
