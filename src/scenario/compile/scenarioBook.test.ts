import { Hook } from "@/scenario/compile/hook";
import { HookExecutor } from "@/scenario/compile/hookExecutor";
import { RawString } from "@/scenario/compile/rawString";
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

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook([], [], new Map(), new Hook(), undefined),
        );
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

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook(
            [
              new Scenario("scenario1", new Map(), false, []),
              new Scenario("scenario2", new Map(), false, []),
            ],
            [],
            new Map(),
            new Hook(),
            undefined,
          ),
        );
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

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook(
            [],
            [
              new ScenarioRunnerConfig(
                "foo",
                new RunnerOption(new Map([["bar", TsVariable.parse("baz")]])),
              ),
              new ScenarioRunnerConfig(
                "baz",
                new RunnerOption(new Map([["qux", new TsVariable(1)]])),
              ),
            ],
            new Map(),
            new Hook(),
            undefined,
          ),
        );
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

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook(
            [],
            [],
            new Map([
              ["foo", TsVariable.parse("bar")],
              ["buz", TsVariable.parse({ a: 1 })],
            ]),
            new Hook(),
            undefined,
          ),
        );
      });
    });

    describe("when hook is defined", () => {
      it("should set variable", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          hook: {
            beforeAll: ["foo"],
            afterAll: [{ bind: { bar: 1 } }],
            beforeEach: ["buz"],
            afterEach: ["qux"],
          },
        });

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook(
            [],
            [],
            new Map(),
            new Hook(
              [new HookExecutor(new RawString("foo"))],
              [
                new HookExecutor(
                  undefined,
                  new Map([["bar", new TsVariable(1)]]),
                ),
              ],
              [new HookExecutor(new RawString("buz"))],
              [new HookExecutor(new RawString("qux"))],
            ),
            undefined,
          ),
        );
      });
    });

    describe("when retry is defined", () => {
      it("should set retry", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          retry: 111,
        });

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook([], [], new Map(), new Hook(), 111),
        );
      });
    });
  });
});
