import { RawString } from "@/scenario/compile/common/rawString";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { ScenarioRunnerConfig } from "@/scenario/compile/common/scenarioRunnerConfig";
import { TsString } from "@/scenario/compile/common/tsString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Fixtures } from "@/scenario/compile/playwright/fixtures";
import { Hook } from "@/scenario/compile/playwright/hook";
import { HookExecutor } from "@/scenario/compile/playwright/hookExecutor";
import { Scenario } from "@/scenario/compile/playwright/scenario";
import { ScenarioBook } from "@/scenario/compile/playwright/scenarioBook";
import { UseOption } from "@/scenario/compile/playwright/useOption";
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
          new ScenarioBook(
            [],
            new UseOption(new Map()),
            [],
            new Map(),
            new Hook(),
            undefined,
          ),
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
              new Scenario("scenario1", new Fixtures([]), new Map(), false, []),
              new Scenario("scenario2", new Fixtures([]), new Map(), false, []),
            ],
            new UseOption(new Map()),
            [],
            new Map(),
            new Hook(),
            undefined,
          ),
        );
      });
    });

    describe("when useOption is defined", () => {
      it("should set useOption", () => {
        const scenarioBook = ScenarioBook.parse(config, {
          scenarios: [],
          use: {
            foo: "bar",
            buz: { raw: "qux" },
          },
        });

        expect(scenarioBook).toStrictEqual(
          new ScenarioBook(
            [],
            new UseOption(
              new Map<string, TsString>([
                ["foo", TsVariable.parse("bar")],
                ["buz", new RawString("qux")],
              ]),
            ),
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
            new UseOption(new Map()),
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
            new UseOption(new Map()),
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
            new UseOption(new Map()),
            [],
            new Map(),
            new Hook(
              [new HookExecutor(new Fixtures([]), new RawString("foo"))],
              [
                new HookExecutor(
                  new Fixtures([]),
                  undefined,
                  new Map([["bar", new TsVariable(1)]]),
                ),
              ],
              [new HookExecutor(new Fixtures([]), new RawString("buz"))],
              [new HookExecutor(new Fixtures([]), new RawString("qux"))],
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
          new ScenarioBook(
            [],
            new UseOption(new Map()),
            [],
            new Map(),
            new Hook(),
            111,
          ),
        );
      });
    });
  });
});
