import { Hook } from "@/scenario/compile/hook";
import { HookExecutor } from "@/scenario/compile/hookExecutor";
import { RawString } from "@/scenario/compile/rawString";
import { TsVariable } from "@/scenario/compile/tsVariable";
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
            new HookExecutor(new RawString("foo()")),
            new HookExecutor(new RawString("bar()")),
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
            new HookExecutor(new RawString("foo()")),
            new HookExecutor(new RawString("bar()")),
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
            new HookExecutor(new RawString("foo()")),
            new HookExecutor(new RawString("bar()")),
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
            new HookExecutor(new RawString("foo()")),
            new HookExecutor(new RawString("bar()")),
          ]),
        );
      });
    });
  });

  describe("hookTypesBefore", () => {
    it("should return empty array when beforeAll", () => {
      const hook = new Hook();

      expect(hook.hookTypesBefore("beforeAll")).toStrictEqual([]);
    });

    it("should return beforeAll when beforeEach", () => {
      const hook = new Hook();

      expect(hook.hookTypesBefore("beforeEach")).toStrictEqual(["beforeAll"]);
    });

    it("should return beforeAll and beforeEach when afterEach", () => {
      const hook = new Hook();

      expect(hook.hookTypesBefore("afterEach")).toStrictEqual([
        "beforeAll",
        "beforeEach",
      ]);
    });

    it("should return beforeAll, beforeEach, and afterEach when afterAll", () => {
      const hook = new Hook();

      expect(hook.hookTypesBefore("afterAll")).toStrictEqual([
        "beforeAll",
        "beforeEach",
        "afterEach",
      ]);
    });
  });

  describe("getBoundVariablesBefore", () => {
    const buildHookExecutor = (name: string): HookExecutor => {
      return new HookExecutor(
        undefined,
        new Map([[name, TsVariable.parse(1)]]),
      );
    };
    const hook = new Hook(
      [buildHookExecutor("beforeAll0"), buildHookExecutor("beforeAll1")],
      [buildHookExecutor("afterAll0"), buildHookExecutor("afterAll1")],
      [buildHookExecutor("beforeEach0"), buildHookExecutor("beforeEach1")],
      [buildHookExecutor("afterEach0"), buildHookExecutor("afterEach1")],
    );

    describe("when beforeAll", () => {
      describe("when index is zero", () => {
        it("should return empty", () => {
          const boundVariables = hook.getBoundVariablesBefore("beforeAll", 0);

          expect(boundVariables).toStrictEqual([]);
        });
      });

      describe("when index is not zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("beforeAll", 1);

          expect(boundVariables).toStrictEqual(["beforeAll0"]);
        });
      });
    });

    describe("when afterAll", () => {
      describe("when index is zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("afterAll", 0);

          expect(boundVariables).toStrictEqual([
            "beforeAll0",
            "beforeAll1",
            "beforeEach0",
            "beforeEach1",
            "afterEach0",
            "afterEach1",
          ]);
        });
      });

      describe("when index is not zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("afterAll", 1);

          expect(boundVariables).toStrictEqual([
            "beforeAll0",
            "beforeAll1",
            "beforeEach0",
            "beforeEach1",
            "afterEach0",
            "afterEach1",
            "afterAll0",
          ]);
        });
      });
    });

    describe("when beforeEach", () => {
      describe("when index is zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("beforeEach", 0);

          expect(boundVariables).toStrictEqual(["beforeAll0", "beforeAll1"]);
        });
      });

      describe("when index is not zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("beforeEach", 1);

          expect(boundVariables).toStrictEqual([
            "beforeAll0",
            "beforeAll1",
            "beforeEach0",
          ]);
        });
      });
    });

    describe("when afterEach", () => {
      describe("when index is zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("afterEach", 0);

          expect(boundVariables).toStrictEqual([
            "beforeAll0",
            "beforeAll1",
            "beforeEach0",
            "beforeEach1",
          ]);
        });
      });

      describe("when index is not zero", () => {
        it("should return variables", () => {
          const boundVariables = hook.getBoundVariablesBefore("afterEach", 1);

          expect(boundVariables).toStrictEqual([
            "beforeAll0",
            "beforeAll1",
            "beforeEach0",
            "beforeEach1",
            "afterEach0",
          ]);
        });
      });
    });
  });
});
