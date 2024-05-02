import { HookContext } from "@/scenario/gen/internal/common/hookContext";

describe("HookContext", () => {
  describe("bindNewVariable", () => {
    it("should add an argument to newBoundVariables", () => {
      const hookContext = new HookContext({});
      hookContext.bindNewVariable("hello", "world");

      expect(hookContext.result).toEqual({
        newBoundVariables: {
          hello: "world",
        },
      });
    });

    describe("when binding multiple times", () => {
      it("should add multiple arguments to newBoundVariables", () => {
        const hookContext = new HookContext({});
        hookContext.bindNewVariable("hello", "world");
        hookContext.bindNewVariable("foo", "bar");

        expect(hookContext.result).toEqual({
          newBoundVariables: {
            hello: "world",
            foo: "bar",
          },
        });
      });
    });
  });

  describe("result", () => {
    it("should return newBoundVariables", () => {
      const hookContext = new HookContext({});
      hookContext.bindNewVariable("hello", "world");

      expect(hookContext.result).toEqual({
        newBoundVariables: {
          hello: "world",
        },
      });
    });
  });
});
