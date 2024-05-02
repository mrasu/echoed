import { RawString } from "@/scenario/compile/common/rawString";
import { Fixtures } from "@/scenario/compile/playwright/fixtures";
import { Hook } from "@/scenario/compile/playwright/hook";
import { HookExecutor } from "@/scenario/compile/playwright/hookExecutor";
import { buildConfig } from "@/testUtil/scenario/util";

describe("Hook", () => {
  const config = buildConfig();

  describe("parse", () => {
    describe("when undefined", () => {
      it("should return empty Hook", () => {
        const hook = Hook.parse(config, undefined);

        expect(hook).toStrictEqual(new Hook());
      });
    });

    describe("when beforeAll exists", () => {
      it("should return Hook", () => {
        const hook = Hook.parse(config, {
          beforeAll: ["foo()", "bar()"],
        });

        expect(hook).toStrictEqual(
          new Hook([
            new HookExecutor(new Fixtures([]), new RawString("foo()")),
            new HookExecutor(new Fixtures([]), new RawString("bar()")),
          ]),
        );
      });
    });

    describe("when afterAll exists", () => {
      it("should return Hook", () => {
        const hook = Hook.parse(config, {
          afterAll: ["foo()", "bar()"],
        });

        expect(hook).toStrictEqual(
          new Hook(undefined, [
            new HookExecutor(new Fixtures([]), new RawString("foo()")),
            new HookExecutor(new Fixtures([]), new RawString("bar()")),
          ]),
        );
      });
    });

    describe("when beforeEach exists", () => {
      it("should return Hook", () => {
        const hook = Hook.parse(config, {
          beforeEach: ["foo()", "bar()"],
        });

        expect(hook).toStrictEqual(
          new Hook(undefined, undefined, [
            new HookExecutor(new Fixtures([]), new RawString("foo()")),
            new HookExecutor(new Fixtures([]), new RawString("bar()")),
          ]),
        );
      });
    });

    describe("when afterEach exists", () => {
      it("should return Hook", () => {
        const hook = Hook.parse(config, {
          afterEach: ["foo()", "bar()"],
        });

        expect(hook).toStrictEqual(
          new Hook(undefined, undefined, undefined, [
            new HookExecutor(new Fixtures([]), new RawString("foo()")),
            new HookExecutor(new Fixtures([]), new RawString("bar()")),
          ]),
        );
      });
    });
  });
});
