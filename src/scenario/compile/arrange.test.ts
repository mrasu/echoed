import { Arrange } from "@/scenario/compile/arrange";
import { ArrangeRunner } from "@/scenario/compile/arrangeRunner";
import { RawString } from "@/scenario/compile/rawString";
import { RunnerContainer } from "@/scenario/compile/runnerContainer";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Arrange", () => {
  const config = buildConfig();

  describe("parse", () => {
    it("should parse arrange with string", () => {
      const arrange = Arrange.parse(config, "console.log('hello')");

      expect(arrange).toStrictEqual(
        new Arrange(new RawString("console.log('hello')")),
      );
    });

    it("should parse arrange with runner", () => {
      const arrange = Arrange.parse(config, {
        runner: "dummyRunner",
      });

      expect(arrange).toStrictEqual(
        new Arrange(
          undefined,
          new ArrangeRunner(
            new RunnerContainer(
              "dummyRunner",
              undefined,
              new RunnerOption(new Map()),
            ),
            new Map(),
          ),
        ),
      );
    });

    it("should parse arrange with runner and bind", () => {
      const arrange = Arrange.parse(config, {
        runner: "dummyRunner",
        bind: {
          foo: "bar",
        },
      });

      expect(arrange).toStrictEqual(
        new Arrange(
          undefined,
          new ArrangeRunner(
            new RunnerContainer(
              "dummyRunner",
              undefined,
              new RunnerOption(new Map()),
            ),
            new Map([["foo", TsVariable.parse("bar")]]),
          ),
        ),
      );
    });

    it("should parse arrange with bind", () => {
      const arrange = Arrange.parse(config, {
        bind: {
          foo: "bar",
        },
      });

      expect(arrange).toStrictEqual(
        new Arrange(
          undefined,
          undefined,
          new Map([["foo", TsVariable.parse("bar")]]),
        ),
      );
    });
  });

  describe("boundVariables", () => {
    const variables = new Map([
      ["foo", TsVariable.parse("bar")],
      ["buz", TsVariable.parse(123)],
    ]);
    describe("when using runner", () => {
      const arrange = new Arrange(
        undefined,
        new ArrangeRunner(
          new RunnerContainer(
            "dummyRunner",
            undefined,
            new RunnerOption(new Map()),
          ),
          variables,
        ),
      );

      it("should return bound variables", () => {
        expect([...arrange.boundVariables()].sort()).toEqual(["buz", "foo"]);
      });
    });

    describe("when using runner", () => {
      const arrange = new Arrange(undefined, undefined, variables);

      it("should return bound variables", () => {
        expect([...arrange.boundVariables()].sort()).toEqual(["buz", "foo"]);
      });
    });
  });
});
