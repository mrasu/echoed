import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { RunnerContainer } from "@/scenario/compile/runnerContainer";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig, buildRunnerConfig } from "@/testUtil/scenario/util";

describe("RunnerContainer", () => {
  const config = buildConfig({
    runners: [buildRunnerConfig({ name: "dummyRunner" })],
  });

  describe("parse", () => {
    describe("when when only runner exists", () => {
      it("should parse", () => {
        const container = RunnerContainer.parse(config, {
          runner: "dummyRunner",
        });

        expect(container).toStrictEqual(
          new RunnerContainer(
            "dummyRunner",
            undefined,
            new RunnerOption(new Map()),
          ),
        );
      });
    });

    describe("when argument exists", () => {
      it("should parse", () => {
        const container = RunnerContainer.parse(config, {
          runner: "dummyRunner",
          argument: {
            endpoint: "/cart",
          },
        });

        expect(container).toStrictEqual(
          new RunnerContainer(
            "dummyRunner",
            TsVariable.parse({ endpoint: "/cart" }),
            new RunnerOption(new Map()),
          ),
        );
      });
    });

    describe("when argument option", () => {
      it("should parse", () => {
        const container = RunnerContainer.parse(config, {
          runner: "dummyRunner",
          option: {
            foo: "bar",
            baz: {
              hello: "world",
            },
          },
        });

        expect(container).toStrictEqual(
          new RunnerContainer(
            "dummyRunner",
            undefined,
            new RunnerOption(
              new Map([
                ["foo", TsVariable.parse("bar")],
                ["baz", TsVariable.parse({ hello: "world" })],
              ]),
            ),
          ),
        );
      });
    });

    describe("when runner is not registered", () => {
      it("should fail", () => {
        const parseFunc = (): void => {
          RunnerContainer.parse(config, {
            runner: "unknownRunner",
          });
        };
        expect(parseFunc).toThrow(InvalidScenarioError);
      });
    });
  });
});
