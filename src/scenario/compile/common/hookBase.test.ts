import { HookBase } from "@/scenario/compile/common/hookBase";
import { HookExecutorBase } from "@/scenario/compile/common/hookExecutorBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

export class DummyHookExecutor extends HookExecutorBase {
  constructor(bind?: Map<string, TsVariable>) {
    super(bind);
  }
}

export class DummyHookBase extends HookBase<DummyHookExecutor> {
  constructor(
    beforeAll?: DummyHookExecutor[],
    afterAll?: DummyHookExecutor[],
    beforeEach?: DummyHookExecutor[],
    afterEach?: DummyHookExecutor[],
  ) {
    super(beforeAll, afterAll, beforeEach, afterEach);
  }
}

describe("HookBase", () => {
  describe("hookTypesBefore", () => {
    it("should return empty array when beforeAll", () => {
      const hook = new DummyHookBase();

      expect(hook.hookTypesBefore("beforeAll")).toStrictEqual([]);
    });

    it("should return beforeAll when beforeEach", () => {
      const hook = new DummyHookBase();

      expect(hook.hookTypesBefore("beforeEach")).toStrictEqual(["beforeAll"]);
    });

    it("should return beforeAll and beforeEach when afterEach", () => {
      const hook = new DummyHookBase();

      expect(hook.hookTypesBefore("afterEach")).toStrictEqual([
        "beforeAll",
        "beforeEach",
      ]);
    });

    it("should return beforeAll, beforeEach, and afterEach when afterAll", () => {
      const hook = new DummyHookBase();

      expect(hook.hookTypesBefore("afterAll")).toStrictEqual([
        "beforeAll",
        "beforeEach",
        "afterEach",
      ]);
    });
  });

  describe("getBoundVariablesBefore", () => {
    const buildHookExecutor = (name: string): DummyHookExecutor => {
      return new DummyHookExecutor(new Map([[name, TsVariable.parse(1)]]));
    };

    const hook = new DummyHookBase(
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
