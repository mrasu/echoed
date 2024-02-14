import { HookExecutor } from "@/scenario/compile/hookExecutor";
import { RawString } from "@/scenario/compile/rawString";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { buildConfig } from "@/testUtil/scenario/util";

describe("HookExecutor", () => {
  const config = buildConfig();

  describe("parse", () => {
    describe("when string is passed", () => {
      it("should parse HookExecutor", () => {
        const hookExecutor = HookExecutor.parse(config, "console.log('hello')");

        expect(hookExecutor).toStrictEqual(
          new HookExecutor(new RawString("console.log('hello')")),
        );
      });
    });

    describe("when object is passed", () => {
      it("should parse HookExecutor", () => {
        const hookExecutor = HookExecutor.parse(config, {
          bind: {
            foo: "bar",
            buz: 1,
          },
        });

        expect(hookExecutor).toStrictEqual(
          new HookExecutor(
            undefined,
            new Map([
              ["foo", TsVariable.parse("bar")],
              ["buz", TsVariable.parse(1)],
            ]),
          ),
        );
      });
    });
  });

  describe("boundVariables", () => {
    const variables = new Map([
      ["foo", TsVariable.parse("bar")],
      ["buz", TsVariable.parse(123)],
    ]);
    describe("when using RawString", () => {
      const hookExecutor = new HookExecutor(new RawString("foo()"));

      it("should return empty", () => {
        expect([...hookExecutor.boundVariables()]).toEqual([]);
      });
    });

    describe("when using object", () => {
      const hookExecutor = new HookExecutor(undefined, variables);

      it("should return bound variables", () => {
        expect([...hookExecutor.boundVariables()].sort()).toEqual([
          "buz",
          "foo",
        ]);
      });
    });
  });
});
