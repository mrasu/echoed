import { buildArrangeContext } from "@/testUtil/scenario/gen/internal/jest/arrangeContext";

describe("ArrangeContext", () => {
  describe("recordRunnerResult", () => {
    it("should record runnerResult and return history", () => {
      const ctx = buildArrangeContext();

      const history = ctx.recordRunnerResult({ kind: "success" });

      expect(ctx.runnerResult).toEqual({ kind: "success" });
      expect(history).toEqual([{ kind: "success" }]);
    });
  });

  describe("bindNewVariable", () => {
    describe("when key is already in newBoundVariables", () => {
      it("should overwrite the value", () => {
        const ctx = buildArrangeContext({
          boundVariables: { key: "value" },
        });

        ctx.bindNewVariable("key", "new value");

        expect(ctx.newBoundVariables).toEqual({ key: "new value" });
      });
    });

    describe("when key is not in newBoundVariables", () => {
      it("should add an argument to newBoundVariables", () => {
        const ctx = buildArrangeContext({
          boundVariables: {},
        });

        ctx.bindNewVariable("key", "value");

        expect(ctx.newBoundVariables).toEqual({ key: "value" });
      });
    });
  });

  describe("result", () => {
    it("should return ArrangeResult", () => {
      const ctx = buildArrangeContext({
        runnerResult: { kind: "success" },
        newBoundVariables: { key: "value" },
      });

      const result = ctx.result;

      expect(result).toEqual({
        runnerResult: { kind: "success" },
        newBoundVariables: { key: "value" },
      });
    });
  });

  describe("echoedArrangeContext", () => {
    it("should return EchoedArrangeContext", () => {
      const ctx = buildArrangeContext(
        {
          index: 11,
        },
        { index: 22 },
        { scenarioName: "test scenario" },
      );
      const echoedArrangeContext = ctx.echoedArrangeContext;

      expect(echoedArrangeContext).toEqual({
        kind: "arrange",
        scenarioName: "test scenario",
        currentArrangeIndex: 11,
        currentStepIndex: 22,
      });
    });
  });
});
