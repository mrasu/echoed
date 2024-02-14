import { ArrangeContext } from "@/scenario/gen/internal/jest/arrangeContext";
import { ScenarioContext } from "@/scenario/gen/internal/jest/scenarioContext";

describe("ArrangeContext", () => {
  describe("start", () => {
    it("should return ArrangeContext", () => {
      const scenarioCtx = new ScenarioContext("test");
      const [result, history, arrangeCtx] = ArrangeContext.start(scenarioCtx);

      expect(result).toBeUndefined();
      expect(history).toEqual([]);
      expect(arrangeCtx.context).toEqual({
        kind: "arrange",
        scenarioName: "test",
        currentStepIndex: -1,
        currentArrangeIndex: -1,
      });
    });
  });

  describe("next", () => {
    describe("when first", () => {
      it("should return history", () => {
        const ctx = new ArrangeContext(new ScenarioContext("test"));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const [result, history] = ctx.next();

        expect(result).toEqual(undefined);
        expect(history).toEqual([undefined]);
      });
    });

    describe("when calling multiple times", () => {
      it("should return stacked history", () => {
        const ctx = new ArrangeContext(new ScenarioContext("test"));
        ctx.next();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const [result, history] = ctx.next();

        expect(result).toEqual(undefined);
        expect(history).toEqual([undefined, undefined]);
      });
    });
  });

  describe("setResult", () => {
    describe("when first", () => {
      it("should return history with result", () => {
        const ctx = new ArrangeContext(new ScenarioContext("test"));
        ctx.next();
        ctx.next();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const [result, history] = ctx.setResult(1);

        expect(result).toEqual(1);
        expect(history).toEqual([undefined, 1]);
      });
    });
  });

  describe("context", () => {
    it("should return EchoedArrangeContext", () => {
      const ctx = new ArrangeContext(new ScenarioContext("test"));
      ctx.next();
      ctx.next();

      const echoedArrangeContext = ctx.context;

      expect(echoedArrangeContext).toEqual({
        kind: "arrange",
        scenarioName: "test",
        currentStepIndex: -1,
        currentArrangeIndex: 1,
      });
    });
  });
});
