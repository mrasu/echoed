import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { AsserterConfig } from "@/scenario/compile/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/commonPluginConfig";
import { Config } from "@/scenario/compile/config";
import { EnvConfig } from "@/scenario/compile/envConfig";
import {
  DEFAULT_ASSERTERS,
  DEFAULT_RUNNERS,
  PluginConfig,
} from "@/scenario/compile/pluginConfig";
import { RunnerConfig } from "@/scenario/compile/runnerConfig";
import { RunnerOption } from "@/scenario/compile/runnerOption";

describe("Config", () => {
  describe("parse", () => {
    const minimumCompileConfig: ScenarioCompileConfig = {
      outDir: "out",
      cleanOutDir: true,
      yamlDir: "yaml",
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
        const config = Config.parse(minimumCompileConfig);

        expect(config.retry).toBe(0);
        expect(config.env).toEqual(new EnvConfig(new Map()));
        expect(config.plugin).toEqual(
          new PluginConfig(DEFAULT_RUNNERS, DEFAULT_ASSERTERS, []),
        );
      });
    });

    describe("when retry is set", () => {
      it("should set retry", () => {
        const config = Config.parse({
          ...minimumCompileConfig,
          retry: 3,
        });

        expect(config.retry).toBe(3);
      });
    });

    describe("when env is set", () => {
      it("should set env", () => {
        const config = Config.parse({
          ...minimumCompileConfig,
          env: {
            foo: "bar",
            buz: "buz",
          },
        });

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
        const config = Config.parse({
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
        });

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
