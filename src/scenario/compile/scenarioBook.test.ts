import { RunnerOption } from "@/scenario/compile/runnerOption";
import { Scenario } from "@/scenario/compile/scenario";
import { ScenarioBook } from "@/scenario/compile/scenarioBook";
import { ScenarioRunnerConfig } from "@/scenario/compile/scenarioRunnerConfig";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("ScenarioBook", () => {
  describe("parse", () => {
    const config = buildConfig();

    describe("when scenarioBook is minimal", () => {
      it("should return ScenarioBook", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
        });

        expect(scenarioBook).toEqual({
          scenarios: [],
          runnerOptions: [],
          variable: new Map(),
          retry: undefined,
        });
      });
    });

    describe("when scenario is defined", () => {
      it("should set scenario", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [
            {
              name: "scenario1",
              steps: [],
            },
            {
              name: "scenario2",
              steps: [],
            },
          ],
        });

        expect(scenarioBook).toEqual({
          scenarios: [
            new Scenario("scenario1", new Map(), false, []),
            new Scenario("scenario2", new Map(), false, []),
          ],
          runnerOptions: [],
          variable: new Map(),
          retry: undefined,
        });
      });
    });

    describe("when runner is defined", () => {
      it("should return ScenarioBook", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          runners: [
            {
              name: "foo",
              option: {
                bar: "baz",
              },
            },
            {
              name: "baz",
              option: {
                qux: 1,
              },
            },
          ],
        });

        expect(scenarioBook).toEqual({
          scenarios: [],
          runnerOptions: [
            new ScenarioRunnerConfig(
              "foo",
              new RunnerOption(new Map([["bar", TsVariable.parse("baz")]])),
            ),
            new ScenarioRunnerConfig(
              "baz",
              new RunnerOption(new Map([["qux", new TsVariable(1)]])),
            ),
          ],
          variable: new Map(),
          retry: undefined,
        });
      });
    });

    describe("when variable is defined", () => {
      it("should set variable", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          variable: {
            foo: "bar",
            buz: { a: 1 },
          },
        });

        expect(scenarioBook).toEqual({
          scenarios: [],
          runnerOptions: [],
          variable: new Map([
            ["foo", TsVariable.parse("bar")],
            ["buz", TsVariable.parse({ a: 1 })],
          ]),
          retry: undefined,
        });
      });
    });

    describe("when retry is defined", () => {
      it("should set retry", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          retry: 111,
        });

        expect(scenarioBook).toEqual({
          scenarios: [],
          runnerOptions: [],
          variable: new Map(),
          retry: 111,
        });
      });
    });
  });
});
