import { ScenarioContext } from "@/scenario/gen/scenarioContext";

describe("ScenarioContext", () => {
  describe("stepNext", () => {
    let ctx: ScenarioContext;
    beforeEach(() => {
      ctx = new ScenarioContext("scenarioName");
    });

    describe("when first call", () => {
      it("should return no history", () => {
        const [actResult, actResultHistory] = ctx.stepNext();

        expect(actResult).toBe(undefined);
        expect(actResultHistory).toEqual([undefined]);
      });
    });

    describe("when second call", () => {
      beforeEach(() => {
        ctx.stepNext();
        ctx.setActResult("result");
      });

      it("should return history", () => {
        const [actResult, actResultHistory] = ctx.stepNext();

        expect(actResult).toBe(undefined);
        expect(actResultHistory).toEqual(["result", undefined]);
      });
    });
  });

  describe("setActResult", () => {
    let ctx: ScenarioContext;
    beforeEach(() => {
      ctx = new ScenarioContext("scenarioName");
      ctx.stepNext();
    });

    it("should return result and history", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [actResult, actResultHistory] = ctx.setActResult("result");

      expect(actResult).toBe("result");
      expect(actResultHistory).toEqual(["result"]);
    });
  });

  describe("arrangeContext", () => {
    it("should return arrange context", () => {
      const ctx = new ScenarioContext("scenarioName");
      ctx.stepNext();

      const arrangeContext = ctx.arrangeContext;
      expect(arrangeContext).toEqual({
        kind: "arrange",
        scenarioName: "scenarioName",
        currentStepIndex: 0,
      });
    });
  });

  describe("actContext", () => {
    it("should return act context", () => {
      const ctx = new ScenarioContext("scenarioName");
      ctx.stepNext();

      const actContext = ctx.actContext;
      expect(actContext).toEqual({
        kind: "act",
        scenarioName: "scenarioName",
        currentStepIndex: 0,
      });
    });
  });

  describe("assertContext", () => {
    describe("when act result exists", () => {
      const ctx = new ScenarioContext("scenarioName");
      ctx.stepNext();
      ctx.setActResult(123);

      it("should return assert context", () => {
        const assertContext = ctx.assertContext;
        expect(assertContext).toEqual({
          kind: "assert",
          scenarioName: "scenarioName",
          currentStepIndex: 0,
          actResult: 123,
        });
      });
    });

    describe("when act result doesn't exist", () => {
      const ctx = new ScenarioContext("scenarioName");
      ctx.stepNext();

      it("should return assert context", () => {
        const assertContext = ctx.assertContext;
        expect(assertContext).toEqual({
          kind: "assert",
          scenarioName: "scenarioName",
          currentStepIndex: 0,
          actResult: undefined,
        });
      });
    });
  });
});
