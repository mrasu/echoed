import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { Config } from "@/scenario/compile/common/config";
import { EnvConfig } from "@/scenario/compile/common/envConfig";
import { PluginConfig } from "@/scenario/compile/common/pluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { buildScenarioCompileTargetConfigs } from "@/testUtil/config/scenarioCompileTargetConfig";
import {
  buildAsserters,
  buildCommonPlugins,
  buildRunners,
} from "@/testUtil/scenario/plugin";

const DEFAULT_RUNNERS = buildRunners();
const DEFAULT_ASSERTERS = buildAsserters();
const DEFAULT_COMMON_PLUGINS = buildCommonPlugins();

describe("Config", () => {
  describe("parse", () => {
    const minimumCompileConfig: ScenarioCompileConfig = {
      targets: buildScenarioCompileTargetConfigs(),
      cleanOutDir: true,
      retry: 0,
      env: {},
      plugin: {
        runners: [],
        asserters: [],
        commons: [],
      },
    };
    describe("when CompileConfig is minimum", () => {
      it("should contains default plugins", () => {
        const config = Config.parse(
          minimumCompileConfig,
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(config.retry).toBe(0);
        expect(config.env).toEqual(new EnvConfig(new Map()));
        expect(config.plugin).toEqual(
          new PluginConfig(
            DEFAULT_RUNNERS,
            DEFAULT_ASSERTERS,
            DEFAULT_COMMON_PLUGINS,
          ),
        );
      });
    });

    describe("when retry is set", () => {
      it("should set retry", () => {
        const config = Config.parse(
          {
            ...minimumCompileConfig,
            retry: 3,
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(config.retry).toBe(3);
      });
    });

    describe("when env is set", () => {
      it("should set env", () => {
        const config = Config.parse(
          {
            ...minimumCompileConfig,
            env: {
              foo: "bar",
              buz: "buz",
            },
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(config.env).toEqual(
          new EnvConfig(
            new Map([
              ["foo", "bar"],
              ["buz", "buz"],
            ]),
          ),
        );
      });
    });

    describe("when plugin is set", () => {
      it("should add plugins along with default", () => {
        const config = Config.parse(
          {
            ...minimumCompileConfig,
            plugin: {
              runners: [
                {
                  module: "echoed/dummy/runner",
                  name: "runner",
                },
              ],
              asserters: [
                {
                  module: "echoed/dummy/asserter",
                  name: "dummyAsserter",
                },
              ],
              commons: [
                {
                  module: "echoed/dummy/import",
                  names: ["dummyImport"],
                },
              ],
            },
          },
          DEFAULT_RUNNERS,
          DEFAULT_ASSERTERS,
          DEFAULT_COMMON_PLUGINS,
        );

        expect(config.plugin.runners).toEqual([
          ...DEFAULT_RUNNERS,
          new RunnerConfig(
            "runner",
            "echoed/dummy/runner",
            new RunnerOption(new Map()),
          ),
        ]);

        expect(config.plugin.asserters).toEqual([
          ...DEFAULT_ASSERTERS,
          new AsserterConfig(
            "dummyAsserter",
            "echoed/dummy/asserter",
            new Map(),
          ),
        ]);

        expect(config.plugin.commons).toEqual([
          new CommonPluginConfig(
            ["dummyImport"],
            undefined,
            "echoed/dummy/import",
          ),
        ]);
      });
    });
  });
});
