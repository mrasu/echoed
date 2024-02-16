import { ArrangeContext } from "@/scenario/gen/internal/jest/arrangeContext";
import { buildStepContext } from "@/testUtil/scenario/gen/internal/jest/stepContext";

describe("StepContext", () => {
  describe("runArrange", () => {
    it("should run function with ArrangeContext", async () => {
      const ctx = buildStepContext();

      let arrangeCtxArg: ArrangeContext | undefined;
      await ctx.runArrange(async (arrangeCtx) => {
        arrangeCtxArg = arrangeCtx;
        return Promise.resolve();
      });

      expect(arrangeCtxArg).toStrictEqual(
        new ArrangeContext(ctx, 0, {}, [undefined]),
      );
    });

    describe("when running multiple times", () => {
      it("should bring previous step's data", async () => {
        const ctx = buildStepContext();

        await ctx.runArrange(async (step) => {
          step.bindNewVariable("newVar", "newVal");
          step.recordRunnerResult(1234);

          return Promise.resolve();
        });

        let arrangeCtxArg: ArrangeContext | undefined;
        await ctx.runArrange(async (step) => {
          arrangeCtxArg = step;
          return Promise.resolve();
        });

        expect(arrangeCtxArg).toStrictEqual(
          new ArrangeContext(ctx, 1, { newVar: "newVal" }, [1234, undefined]),
        );
      });
    });
  });

  describe("recordActResult", () => {
    it("should modify actResult", () => {
      const ctx = buildStepContext();
      const history = ctx.recordActResult([111, undefined], 222);

      expect(ctx.actResult).toBe(222);
      expect(history).toEqual([111, 222]);
    });
  });

  describe("bindNewVariable", () => {
    it("should remember variable", () => {
      const ctx = buildStepContext();
      ctx.bindNewVariable("newVar", "newVal");
      expect(ctx.newBoundVariables).toStrictEqual({ newVar: "newVal" });
    });
  });

  describe("result", () => {
    it("should return StepResult", () => {
      const ctx = buildStepContext();
      ctx.recordActResult([undefined], 1234);
      ctx.bindNewVariable("newVar", "newVal");

      expect(ctx.result).toEqual({
        actResult: 1234,
        newBoundVariables: { newVar: "newVal" },
      });
    });
  });

  describe("echoedActContext", () => {
    it("should return EchoedActContext", () => {
      const ctx = buildStepContext({ index: 2 }, { scenarioName: "dummyName" });

      expect(ctx.echoedActContext).toEqual({
        kind: "act",
        scenarioName: "dummyName",
        currentStepIndex: 2,
      });
    });
  });

  describe("echoedAssertContext", () => {
    it("should return EchoedActContext", () => {
      const ctx = buildStepContext({ index: 2 }, { scenarioName: "dummyName" });
      ctx.recordActResult([undefined], 1234);

      expect(ctx.echoedAssertContext).toEqual({
        kind: "assert",
        scenarioName: "dummyName",
        currentStepIndex: 2,
        actResult: 1234,
      });
    });
  });
});
