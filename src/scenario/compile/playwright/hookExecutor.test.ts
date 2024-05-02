import { RawString } from "@/scenario/compile/common/rawString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { Fixtures } from "@/scenario/compile/playwright/fixtures";
import { HookExecutor } from "@/scenario/compile/playwright/hookExecutor";
import { buildConfig } from "@/testUtil/scenario/util";

describe("HookExecutor", () => {
  const config = buildConfig();

  describe("parse", () => {
    describe("when string is passed", () => {
      it("should parse HookExecutor", () => {
        const hookExecutor = HookExecutor.parse(config, "console.log('hello')");

        expect(hookExecutor).toStrictEqual(
          new HookExecutor(
            new Fixtures([]),
            new RawString("console.log('hello')"),
          ),
        );
      });
    });

    describe("when bind is passed", () => {
      describe("when fixtures exists", () => {
        it("should parse HookExecutor with fixtures", () => {
          const hookExecutor = HookExecutor.parse(config, {
            fixtures: ["foo", "bar"],
            bind: {
              foo: "bar",
              buz: 1,
            },
          });

          expect(hookExecutor).toStrictEqual(
            new HookExecutor(
              new Fixtures(["foo", "bar"]),
              undefined,
              new Map([
                ["foo", TsVariable.parse("bar")],
                ["buz", TsVariable.parse(1)],
              ]),
            ),
          );
        });
      });

      describe("when no fixtures exists", () => {
        it("should parse HookExecutor with empty fixtures", () => {
          const hookExecutor = HookExecutor.parse(config, {
            bind: {
              foo: "bar",
              buz: 1,
            },
          });

          expect(hookExecutor).toStrictEqual(
            new HookExecutor(
              new Fixtures([]),
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

    describe("when raw is passed", () => {
      describe("when fixtures exists", () => {
        it("should parse HookExecutor with fixtures", () => {
          const hookExecutor = HookExecutor.parse(config, {
            fixtures: ["foo", "bar"],
            raw: "console.log('hello')",
          });

          expect(hookExecutor).toStrictEqual(
            new HookExecutor(
              new Fixtures(["foo", "bar"]),
              new RawString("console.log('hello')"),
            ),
          );
        });
      });

      describe("when no fixtures exists", () => {
        it("should parse HookExecutor with empty fixtures", () => {
          const hookExecutor = HookExecutor.parse(config, {
            raw: "console.log('hello')",
          });

          expect(hookExecutor).toStrictEqual(
            new HookExecutor(
              new Fixtures([]),
              new RawString("console.log('hello')"),
            ),
          );
        });
      });
    });
  });
});
