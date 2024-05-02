import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { HookExecutor } from "@/scenario/compile/jest/hookExecutor";
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
});
