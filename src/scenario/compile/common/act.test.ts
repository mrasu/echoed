import { Act } from "@/scenario/compile/common/act";
import { ActRunner } from "@/scenario/compile/common/actRunner";
import { InvalidScenarioError } from "@/scenario/compile/common/invalidScenarioError";
import { RawString } from "@/scenario/compile/common/rawString";
import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Act", () => {
  const config = buildConfig();

  describe("parse", () => {
    describe("when using runner", () => {
      it("should parse act", () => {
        const act = Act.parse(config, {
          runner: "dummyRunner",
          argument: {
            endpoint: "/cart",
          },
        });

        expect(act).toStrictEqual(
          new Act(
            new ActRunner(
              new RunnerContainer(
                "dummyRunner",
                TsVariable.parse({ endpoint: "/cart" }),
                new RunnerOption(new Map()),
              ),
            ),
          ),
        );
      });

      it("should parse act without argument", () => {
        const act = Act.parse(config, {
          runner: "dummyRunner",
        });

        expect(act).toStrictEqual(
          new Act(
            new ActRunner(
              new RunnerContainer(
                "dummyRunner",
                undefined,
                new RunnerOption(new Map()),
              ),
            ),
          ),
        );
      });

      it("should parse act with option", () => {
        const act = Act.parse(config, {
          runner: "dummyRunner",
          option: {
            foo: "bar",
            baz: {
              hello: "world",
            },
          },
        });

        expect(act).toStrictEqual(
          new Act(
            new ActRunner(
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
            ),
          ),
        );
      });

      it("should fail when runner is not registered", () => {
        const parseFunc = (): void => {
          Act.parse(config, {
            runner: "unknownRunner",
          });
        };
        expect(parseFunc).toThrow(InvalidScenarioError);
      });
    });

    describe("when using raw", () => {
      it("should parse act", () => {
        const act = Act.parse(config, {
          raw: "console.log('aaa')",
        });

        expect(act).toStrictEqual(
          new Act(undefined, new RawString("console.log('aaa')")),
        );
      });
    });
  });
});
