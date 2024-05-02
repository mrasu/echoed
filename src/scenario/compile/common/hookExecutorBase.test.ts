import { HookExecutorBase } from "@/scenario/compile/common/hookExecutorBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

export class DummyHookExecutor extends HookExecutorBase {
  constructor(bind?: Map<string, TsVariable>) {
    super(bind);
  }
}

describe("HookExecutorBase", () => {
  describe("boundVariables", () => {
    describe("when bind", () => {
      const variables = new Map([
        ["foo", TsVariable.parse("bar")],
        ["buz", TsVariable.parse(123)],
      ]);
      const hookExecutor = new DummyHookExecutor(variables);

      it("should return bound variables", () => {
        expect(hookExecutor.boundVariables().sort()).toEqual(["buz", "foo"]);
      });
    });

    describe("when no bind", () => {
      const hookExecutor = new DummyHookExecutor();

      it("should return empty", () => {
        expect(hookExecutor.boundVariables()).toEqual([]);
      });
    });
  });
});
